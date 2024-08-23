import { SuperTokenInfo, SuperTokenList } from "..";
import tokenList from "../superfluid.extended.tokenlist.json";
import fs from "fs";
import { validate } from "../utils";

const createFilteredList = async (
  tokenList: SuperTokenList,
  tiers: string[],
  listName: string,
  fileName: string,
  inverseFiltering?: boolean
) => {
  const underlyingTokens = tokenList.tokens.filter((token) =>
    token.tags?.includes("underlying")
  );

  const filteredByTier = tokenList.tokens.filter((token) =>
    tiers.some((tier) => inverseFiltering ?  !token.tags?.includes(tier) :  !token.tags?.includes(tier))
  );

  const tokens: SuperTokenInfo[] = [];

  filteredByTier.forEach((token) => {
    const isTokenAlreadyAdded = tokens.find(x => x.chainId === token.chainId && x.address === token.address)
    if (!isTokenAlreadyAdded) {
      tokens.push(token);
    }

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
        const isUnderlyingTokenAlreadyAdded = tokens.find(x => x.chainId === underlyingToken.chainId && x.address === underlyingToken.address)
        if (!isUnderlyingTokenAlreadyAdded) {
          tokens.push(underlyingToken);
        }
      }
    }
  });

  try {
    const partialTokenList = {
      ...tokenList,
      name: listName,
      tokens,
    };
    
    const result = await validate(partialTokenList);
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
    ["testnet"],
    "Superfluid Token List",
    "superfluid.tokenlist.json",
    true
  );

};

main();
