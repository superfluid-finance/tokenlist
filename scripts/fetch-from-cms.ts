import { TokenList } from "@uniswap/token-lists";
import https from "https";
import fs from "fs";
import { schema } from "@uniswap/token-lists";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const CMS_API_BASE_URL = "https://cms.superfluid.pro/tokenlist?isListed=true";

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
  // Filter out tokens with invalid symbols (empty or containing spaces)
  const validTokens = tokenList.tokens.filter(token => {
    if (!token.symbol || token.symbol.trim() === "" || /\s/.test(token.symbol)) {
      console.warn(`Filtering out token with invalid symbol: "${token.symbol}" (${token.name} at ${token.address})`);
      return false;
    }
    return true;
  });
  
  console.log(`Filtered ${tokenList.tokens.length - validTokens.length} tokens with invalid symbols`);
  
  return {
    ...tokenList,
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


function sortTokensByOrderingScore(tokenList: TokenList): TokenList {
  // Group tokens by chainId, preserving the order chains first appear
  const chainOrder: number[] = [];
  const tokensByChain = new Map<number, typeof tokenList.tokens>();

  tokenList.tokens.forEach(token => {
    if (!chainOrder.includes(token.chainId)) {
      chainOrder.push(token.chainId);
    }
    if (!tokensByChain.has(token.chainId)) {
      tokensByChain.set(token.chainId, []);
    }
    tokensByChain.get(token.chainId)!.push(token);
  });

  // Sort tokens within each chain group by orderingScore
  const sortedTokens = chainOrder.flatMap(chainId => {
    const chainTokens = tokensByChain.get(chainId)!;
    return chainTokens.sort((a, b) => {
      // @ts-ignore - orderingScore is in extensions
      const scoreA: number = a.extensions?.orderingScore ?? -Infinity;
      // @ts-ignore - orderingScore is in extensions
      const scoreB: number = b.extensions?.orderingScore ?? -Infinity;
      return scoreB - scoreA; // Descending order (highest first)
    });
  });

  return {
    ...tokenList,
    tokens: sortedTokens
  };
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

    // Sort tokens by orderingScore
    const sortedTokenList = sortTokensByOrderingScore(sanitizedTokenList);

    // Write the ordered extended token list
    writeTokenList("superfluid.extended.tokenlist.json", sortedTokenList);

    console.log("✅ Successfully generated token list from CMS");

  } catch (error) {
    console.error("❌ Error generating token list:", error);
    process.exit(1);
  }
}

// Run the script
main();