import { SuperTokenInfo, SuperTokenList, TokenInfo } from "..";
import tokenList from "../superfluid.extended.tokenlist.json";
import fs from "fs";
import { validate, validateUnderlyingTokens } from "../utils";

const createFilteredList = async (
  tokenList: SuperTokenList,
  tiers: string[],
  listName: string,
  fileName: string
) => {
  const underlyingTokens = tokenList.tokens.filter((token) =>
    token.tags?.includes("underlying")
  );

  const filteredByTier = tokenList.tokens.filter((token) =>
    tiers.some((tier) => token.tags?.includes(tier))
  );

  const tokens: SuperTokenInfo[] = [];

  filteredByTier.forEach((token) => {
    tokens.push(token);

    if (
      ["Wrapper", "Native Asset"].includes(
        token.extensions?.superTokenInfo?.type ?? ""
      )
    ) {
      const underlyingToken = underlyingTokens.find(
        (underlyingToken) =>
          underlyingToken.address ===
            // @ts-ignore (Special Native Assets have underlying tokens)
            token.extensions?.superTokenInfo?.underlyingTokenAddress &&
          underlyingToken.chainId === token.chainId
      );

      if (underlyingToken) {
        tokens.push(underlyingToken);
      }
    }
  });

  try {
    const partialTokenList = {
      ...tokenList,
      name: listName,
      tokens,
    };
    await validate(partialTokenList);
    const result = validateUnderlyingTokens(partialTokenList);

    if (!result) {
      throw new Error("Underlying tokens validation failed");
    }

    fs.writeFileSync(fileName, JSON.stringify(partialTokenList, null, 2));
  } catch (e) {
    console.error(tiers, e);
  }
};

const main = () => {
  createFilteredList(
    tokenList as SuperTokenList,
    ["tier_a"],
    "Superfluid Token List A",
    "superfluid.tier-a.tokenlist.json"
  );
  createFilteredList(
    tokenList as SuperTokenList,
    ["tier_b"],
    "Superfluid Token List B",
    "superfluid.tier-b.tokenlist.json"
  );
  createFilteredList(
    tokenList as SuperTokenList,
    ["tier_c"],
    "Superfluid Token List C",
    "superfluid.tier-c.tokenlist.json"
  );

  createFilteredList(
    tokenList as SuperTokenList,
    ["tier_a", "tier_b"],
    "Superfluid Token List",
    "superfluid.tokenlist.json"
  );
};

main();
