import { TokenList } from "@uniswap/token-lists";
import fs from "fs";

const INPUT_FILE = "superfluid.extended.tokenlist.unordered.json";
const OUTPUT_FILE = "superfluid.extended.tokenlist.json";

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

function main(): void {
  try {
    console.log(`Reading token list from ${INPUT_FILE}...`);
    const rawData = fs.readFileSync(`./${INPUT_FILE}`, "utf-8");
    const tokenList = JSON.parse(rawData) as TokenList;
    console.log(`Read ${tokenList.tokens.length} tokens`);

    // Sort tokens by orderingScore
    const sortedTokenList = sortTokensByOrderingScore(tokenList);

    // Write the ordered token list
    fs.writeFileSync(`./${OUTPUT_FILE}`, JSON.stringify(sortedTokenList, null, 2));
    console.log(`Written ${sortedTokenList.tokens.length} tokens to ${OUTPUT_FILE}`);

    console.log("✅ Successfully ordered token list");

  } catch (error) {
    console.error("❌ Error ordering token list:", error);
    process.exit(1);
  }
}

main();
