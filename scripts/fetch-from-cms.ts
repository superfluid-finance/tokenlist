import { TokenList } from "@uniswap/token-lists";
import https from "https";
import fs from "fs";
import { schema } from "@uniswap/token-lists";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import superfluidMetadata from "@superfluid-finance/metadata";
import packageJson from "../package.json";

const CMS_API_BASE_URL = "https://cms.superfluid.pro/tokenlist?isListed=true";
const ACTIVE_CHAIN_IDS = new Set(
  superfluidMetadata.networks.map((network) => network.chainId)
);
const ARC_TESTNET_CHAIN_ID = 5042002;
const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ARC_USDCX_ADDRESS = "0x233a5bfd65da07aeb08f2082d2b5b270bc4ea804";
const USDC_ICON_URI = "https://tokenlist.superfluid.org/icons/usdc.svg";
const TOKEN_ICON_OVERRIDES = new Map([
  [`${ARC_TESTNET_CHAIN_ID}:USDC`, USDC_ICON_URI],
  [`${ARC_TESTNET_CHAIN_ID}:USDCx`, USDC_ICON_URI],
]);
const ARC_USDC_TOKEN: TokenList["tokens"][number] = {
  chainId: ARC_TESTNET_CHAIN_ID,
  address: ARC_USDC_ADDRESS,
  name: "USDC",
  symbol: "USDC",
  decimals: 6,
  logoURI: USDC_ICON_URI,
  tags: ["underlying", "testnet"],
};
const [major, minor, patch] = packageJson.version.split(".").map(Number);
const TOKEN_LIST_VERSION = { major, minor, patch };

const ajv = new Ajv({
  allErrors: true,
});
addFormats(ajv);
const validate = ajv.compile(schema);

async function fetchTokenListFromCMS(): Promise<TokenList> {
  console.log("Fetching listed tokens from CMS...");

  // Add cache-busting timestamp to URL
  const cacheBreaker = `&_t=${Date.now()}`;
  const cmsApiUrl = CMS_API_BASE_URL + cacheBreaker;

  return new Promise((resolve, reject) => {
    https.get(cmsApiUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch from CMS: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const tokenList = JSON.parse(data) as TokenList;
          console.log(`Fetched ${tokenList.tokens.length} listed tokens from CMS`);
          resolve(tokenList);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
  });
}

function sanitizeTokenList(tokenList: TokenList): TokenList {
  const tokensWithRepositoryOverrides = tokenList.tokens.map((token) => {
    if (
      token.chainId === ARC_TESTNET_CHAIN_ID &&
      token.address.toLowerCase() === ARC_USDCX_ADDRESS
    ) {
      return {
        ...token,
        extensions: {
          ...token.extensions,
          superTokenInfo: {
            type: "Native Asset",
            underlyingTokenAddress: ARC_USDC_ADDRESS,
          },
        },
      };
    }

    return token;
  });

  const hasArcUsdc = tokensWithRepositoryOverrides.some(
    (token) =>
      token.chainId === ARC_TESTNET_CHAIN_ID &&
      token.address.toLowerCase() === ARC_USDC_ADDRESS
  );

  if (!hasArcUsdc) {
    tokensWithRepositoryOverrides.push(ARC_USDC_TOKEN);
  }

  // Keep the CMS as the token source while limiting its output to networks
  // supported by the metadata version installed in this repository.
  const tokensByInactiveChain = new Map<number, number>();
  const activeNetworkTokens = tokensWithRepositoryOverrides.filter((token) => {
    if (ACTIVE_CHAIN_IDS.has(token.chainId)) {
      return true;
    }

    tokensByInactiveChain.set(
      token.chainId,
      (tokensByInactiveChain.get(token.chainId) ?? 0) + 1
    );
    return false;
  });

  if (tokensByInactiveChain.size > 0) {
    const summary = Array.from(tokensByInactiveChain.entries())
      .map(([chainId, count]) => `${chainId} (${count})`)
      .join(", ");
    console.warn(`Filtering out tokens from inactive chains: ${summary}`);
  }

  // Trim leading/trailing whitespace, then filter out tokens whose symbols
  // are still invalid (empty or containing inner whitespace).
  const validTokens = activeNetworkTokens
    .map(token => {
      const name = (token.name ?? "").trim();
      const symbol = (token.symbol ?? "").trim();
      const logoURI = TOKEN_ICON_OVERRIDES.get(`${token.chainId}:${symbol}`);

      return {
        ...token,
        name,
        symbol,
        ...(logoURI ? { logoURI } : {})
      };
    })
    .filter(token => {
      if (token.symbol === "" || /\s/.test(token.symbol)) {
        console.warn(`Filtering out token with invalid symbol: "${token.symbol}" (${token.name} at ${token.address})`);
        return false;
      }
      return true;
    });
  
  console.log(`Filtered ${activeNetworkTokens.length - validTokens.length} tokens with invalid symbols`);
  
  return {
    ...tokenList,
    version: TOKEN_LIST_VERSION,
    tokens: validTokens
  };
}

function validateTokenList(tokenList: TokenList): void {
  const isValid = validate(tokenList);
  if (!isValid) {
    console.error("Token list validation errors:", validate.errors);
    throw new Error("Token list does not conform to schema");
  }
  console.log("Token list validation passed");
}


function writeTokenList(filename: string, tokenList: TokenList): void {
  fs.writeFileSync(`./${filename}`, JSON.stringify(tokenList, null, 2));
  console.log(`Written ${tokenList.tokens.length} listed tokens to ${filename}`);
}

async function main(): Promise<void> {
  try {
    // Fetch the listed tokens from CMS
    const rawTokenList = await fetchTokenListFromCMS();

    // Sanitize the token list (filter out invalid tokens)
    const sanitizedTokenList = sanitizeTokenList(rawTokenList);

    // Validate the sanitized token list
    validateTokenList(sanitizedTokenList);

    // Write the unordered token list
    writeTokenList("superfluid.extended.tokenlist.unordered.json", sanitizedTokenList);

    console.log("✅ Successfully fetched token list from CMS");

  } catch (error) {
    console.error("❌ Error generating token list:", error);
    process.exit(1);
  }
}

// Run the script
main();
