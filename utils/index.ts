import { schema, TokenInfo } from "@uniswap/token-lists";
import { FetchTokensQuery } from "../subgraph/.graphclient";
import zipObject from "lodash/zipObject";
import packageJson from "../package.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import graphSDK, { networks, subgraphs } from "../subgraph/subgraphs";
import pinataSDK from "@pinata/sdk";
import fs from "fs";

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

export const createTokenEntry = (
  tokenData: FetchTokensQuery["tokens"][number],
  chainId: number
): TokenInfo => {
  const { id, name, symbol, decimals, underlyingToken } = tokenData;

  const extensions = {
    superTokenInfo: {
      type: determineSuperTokenType(tokenData),
      ...(hasValidUnderlyingToken(tokenData)
        ? {
            underlyingToken: {
              address: underlyingToken?.id,
              name: underlyingToken?.name,
              symbol: underlyingToken?.symbol.replace(/\s+/g, ""),
              decimals: underlyingToken?.decimals,
            },
          }
        : {}),
    },
  };

  return {
    address: id,
    name: name.substring(0, 39),
    symbol: symbol.replace(/\s+/g, ""),
    decimals,
    chainId,
    extensions,
  };
};

export const getVersion = () =>
  zipObject<number>(
    ["major", "minor", "patch"],
    packageJson.version.split(".").map(Number)
  );

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

type BuildSuperfluidTokenListOptions = {
  publishToIpfs: boolean;
  pinataApiKey?: string;
  pinataSecret?: string;
};

export const buildSuperfluidTokenList = async ({
  publishToIpfs,
  pinataApiKey,
  pinataSecret,
}: BuildSuperfluidTokenListOptions) => {
  const tokenList = {
    name: "Superfluid Token List",
    version: getVersion(),
    timestamp: new Date().toISOString(),
    tokens: [] as TokenInfo[],
  };

  try {
    await Promise.all(
      networks.map(async (network) => {
        const query = await graphSDK[network].fetchTokens();

        const tokenEntry = query.tokens.map((token, i) => {
          return createTokenEntry(token, subgraphs[network].chainId);
        });

        tokenList.tokens.push(...tokenEntry);
      })
    );

    const isValid = await validate(tokenList);

    fs.writeFileSync(
      `versions/token-list_v${packageJson.version}.json`,
      JSON.stringify(tokenList, null, 2)
    );

    if (isValid && publishToIpfs && pinataApiKey && pinataSecret) {
      const pinata = new pinataSDK(pinataApiKey, pinataSecret);

      const result = await pinata.pinJSONToIPFS(tokenList);
      console.info(result);
    }
  } catch (e) {
    console.error(e);
  }
};
