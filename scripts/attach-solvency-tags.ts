import tokenList from "../superfluid.extended.tokenlist.json";
import fs from "fs";
import { SuperTokenInfo, SuperTokenList } from "..";
import { validate, validateUnderlyingTokens } from "../utils";

const solvencyCategoryToTagMap = {
  A: "tier_a",
  B: "tier_b",
  C: "tier_c",
};

const main = async () => {
  const [rawHeaders, ...rows] = fs
    .readFileSync("./solvency-categories.csv", "utf8")
    .split("\n");

  const headers = rawHeaders.split(",");

  const solvencyCategories = rows.reduce<
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
    name: `${tokenList.name}`,
    tokens,
  };

  try {
    await validate(tokenListWithSolvency);
    const result = validateUnderlyingTokens(tokenListWithSolvency);

    if (!result) {
      throw new Error("Underlying tokens validation failed");
    }

    fs.writeFileSync(
      "./superfluid.extended.tokenlist.json",
      JSON.stringify(tokenListWithSolvency, null, 2)
    );
  } catch (e) {
    console.error(e);
  }
};

main();
