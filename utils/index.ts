import { schema, TokenInfo, TokenList, Version } from "@uniswap/token-lists";
import { FetchTokensQuery } from "../subgraph/.graphclient";
import zipObject from "lodash/zipObject";
import packageJson from "../package.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import graphSDK, { networks, subgraphs } from "../subgraph/subgraphs";
import fs from "fs";
import omit from "lodash/omit";
import isEmpty from "lodash/isEmpty";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { BridgeInfo, Manifest, Writeable } from "./types";

dotenv.config();

export const determineSuperTokenType = (
  tokenData: FetchTokensQuery["tokens"][number]
) => {
  if (tokenData.isNativeAssetSuperToken) return "Native Asset";
  if (tokenData.underlyingToken) return "Wrapper";

  return "Pure";
};

export const hasValidUnderlyingToken = (
  tokenData: FetchTokensQuery["tokens"][number]
) => {
  if (tokenData.underlyingToken) {
    const { id, name, symbol, decimals } = tokenData.underlyingToken;

    return id && name && symbol && decimals;
  }

  return false;
};

const tokenIconBaseUrl = process.env.TOKEN_ICON_URL;

export const createTokenEntry = async (
  tokenData: FetchTokensQuery["tokens"][number],
  chainId: number
): Promise<TokenInfo> => {
  const { id, name, symbol, decimals, underlyingToken } = tokenData;

  const extensions = {
    superTokenInfo: {
      type: determineSuperTokenType(tokenData),
      ...(hasValidUnderlyingToken(tokenData)
        ? {
            underlyingTokenAddress: underlyingToken?.id,
          }
        : {}),
    },
  };

  const assetKey =
    symbol === "mStable USD (Polygon PoS)"
      ? "mstable-usd-polygon-pos"
      : symbol.toLowerCase();

  const tokenInfo: Partial<Writeable<TokenInfo, keyof TokenInfo>> = {
    address: id,
    name: name.substring(0, 39),
    symbol: symbol.replace(/\s+/g, ""),
    decimals,
    chainId,
    extensions,
  };

  try {
    const manifest = (await (
      await fetch(`${tokenIconBaseUrl}/tokens/${assetKey}/manifest.json`)
    ).json()) as Manifest;

    tokenInfo.logoURI = `${tokenIconBaseUrl}${manifest.svgIconPath}`;
  } catch {
    console.error(`logoURI not found for ${symbol} (${id})`);

    try {
      if (underlyingToken) {
        const manifest = (await (
          await fetch(
            `${tokenIconBaseUrl}/tokens/${underlyingToken.symbol.toLowerCase()}/manifest.json`
          )
        ).json()) as Manifest;

        tokenInfo.logoURI = `${tokenIconBaseUrl}${manifest.svgIconPath}`;
      }
    } catch {
      console.error(
        `logoURI not found for ${symbol} (${id}) using underlying token ${underlyingToken?.symbol}`
      );
    }
  }

  return tokenInfo as TokenInfo;
};

export const getVersion = (): Version =>
  zipObject<number>(
    ["major", "minor", "patch"],
    packageJson.version.split(".").map(Number)
  ) as unknown as Version;

export const validate = async (builtList: Object) => {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const valid = validate(builtList);
  if (valid) {
    return valid;
  }
  if (validate.errors) {
    throw validate.errors.map((error) => {
      delete error.data;

      return error;
    });
  }
};

export const validateUnderlyingTokens = (tokenList: TokenList) => {
  const errors: string[] = [];

  tokenList.tokens.forEach((token) => {
    if (token.extensions && token.extensions.superTokenInfo) {
      const superTokenInfo = token.extensions.superTokenInfo as Record<
        "type" | "underlyingAddress",
        string
      >;
      if (superTokenInfo.underlyingAddress) {
        const underlyingToken = tokenList.tokens.find(
          (t) => t.address === superTokenInfo.underlyingAddress
        );
        if (!underlyingToken) {
          errors.push(
            `Underlying token ${superTokenInfo.underlyingAddress} not found in token-list.`
          );
        }
      }
    }
  });

  if (errors.length === 0) {
    return true;
  }

  throw errors.map((error) => {
    return error;
  });
};

const mergeWithBridgeData = (brigeData: BridgeInfo, tokenList: TokenList) => {
  return tokenList.tokens.map((token) => {
    if (brigeData[token.symbol]) {
      const extendedTokenInfo: TokenInfo & {
        extensions: { bridgeInfo?: BridgeInfo };
      } = {
        ...token,
        extensions: {
          ...token.extensions,
          bridgeInfo: omit(brigeData[token.symbol], [token.chainId]),
        },
      };

      if (isEmpty(extendedTokenInfo.extensions.bridgeInfo)) {
        delete extendedTokenInfo.extensions.bridgeInfo;
      }

      return extendedTokenInfo;
    }

    return token;
  });
};

export const bootstrapSuperfluidTokenList = async () => {
  let tokenList: TokenList = {
    name: "Superfluid Token List",
    version: getVersion(),
    timestamp: new Date().toISOString(),
    tokens: [] as TokenInfo[],
  };

  const brigeData: BridgeInfo = {};

  try {
    // this is slower than firing the requests in parallel, but guarantees the order is the same
    await networks.reduce(async (prevQuery, network) => {
      await prevQuery;
      const query = await graphSDK[network].fetchTokens();

      const tokenEntry = await Promise.all(
        query.tokens.map(async (token, i) => {
          if (!brigeData[token.symbol]) brigeData[token.symbol] = {};
          brigeData[token.symbol][subgraphs[network].chainId] = {
            ...brigeData[token.symbol][subgraphs[network].chainId],
            tokenAddress: token.id,
          };
          return createTokenEntry(token, subgraphs[network].chainId);
        })
      );

      tokenList.tokens.push(...tokenEntry);

      return;
    }, Promise.resolve());

    const extendedTokenList = mergeWithBridgeData(brigeData, tokenList);

    tokenList = {
      ...tokenList,
      tokens: extendedTokenList,
    };

    await validate(tokenList);
    validateUnderlyingTokens(tokenList);

    fs.writeFileSync(
      `versions/token-list_DRAFT.json`,
      JSON.stringify(tokenList, null, 2)
    );
  } catch (e) {
    console.error(e);
  }
};
