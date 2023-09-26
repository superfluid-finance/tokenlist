import { TokenInfo } from "@uniswap/token-lists";
import tokenList from "../superfluid.tokenlist.json";
import fs from "fs";
import { SuperTokenInfo, SuperTokenList } from "..";

const solvencyCategoryToTagMap = {
  A: "tier_a",
  B: "tier_b",
  C: "tier_c",
};

const main = () => {
  const [rawHeaders, ...rest] = fs
    .readFileSync("./solvency-categories.csv", "utf8")
    .split("\n");

  const headers = rawHeaders.split(",");

  const solvencyCategories = rest.reduce<
    Record<`${string}-${number}`, Record<string, string>>
  >((acc, line) => {
    const row = line.split(",");

    return {
      ...acc,
      // index by address and chainId
      [`${row[2].toLowerCase()}-${row[6]}`]: Object.fromEntries(
        headers.map((header, i) => [header, row[i]])
      ),
    };
  }, {});

  const tokens = tokenList.tokens.map((token) => {
    if (token.tags?.includes("underlying")) {
      return token;
    }

    const data =
      solvencyCategories[`${token.address.toLowerCase()}-${token.chainId}`];

    const solvencyCategory = (
      data ? data["solvency category"] : "C"
    ) as keyof typeof solvencyCategoryToTagMap;
    const tags = token.tags
      .filter((tag) => !tag.startsWith("tier_"))
      .concat(solvencyCategoryToTagMap[solvencyCategory]);

    return {
      ...token,
      tags,
    };
  }) as SuperTokenInfo[];

  const tokenListWithSolvency: SuperTokenList = {
    ...tokenList,
    tokens,
  };

  fs.writeFileSync(
    "./superfluid.tokenlist.json",
    JSON.stringify(tokenListWithSolvency, null, 2)
  );
};

main();
