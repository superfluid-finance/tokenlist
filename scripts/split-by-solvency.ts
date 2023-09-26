import { SuperTokenInfo, SuperTokenList, TokenInfo } from "..";
import tokenList from "../superfluid.tokenlist.json";
import fs from "fs";
import { validate, validateUnderlyingTokens } from "../utils";

const createFilteredList = async (tokenList: SuperTokenList, tier: string) => {
  const underlyingTokens = tokenList.tokens.filter((token) =>
    token.tags?.includes("underlying")
  );

  const filteredByTier = tokenList.tokens.filter((token) =>
    token.tags?.includes(tier)
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
          token.extensions?.superTokenInfo?.underlyingTokenAddress
      );
      if (underlyingToken) {
        tokens.push(underlyingToken);
      }
    }
  });

  try {
    const partialTokenList = {
      ...tokenList,
      name: `${tokenList.name} ${tier.split("_")[1].toUpperCase()}`,
      tokens,
    };
    await validate(partialTokenList);
    const result = validateUnderlyingTokens(partialTokenList);

    if (!result) {
      throw new Error("Underlying tokens validation failed");
    }

    fs.writeFileSync(
      `solvency-${tier}.tokenlist.json`,
      JSON.stringify(partialTokenList, null, 2)
    );
  } catch (e) {
    console.error(tier, e);
  }
};

const main = () => {
  createFilteredList(tokenList as SuperTokenList, "tier_a");
  createFilteredList(tokenList as SuperTokenList, "tier_b");
  createFilteredList(tokenList as SuperTokenList, "tier_c");
};

main();
