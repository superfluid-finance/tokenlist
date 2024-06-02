import tokenlist, { 
    extendedSuperTokenList,
    tierCSuperTokenList,
    tierBSuperTokenList,
    tierASuperTokenList,
    
   } from "@superfluid-finance/tokenlist"
   
   /* const underlyingTokens = extendedSuperTokenList.tokens.filter((token) => token?.tags?.includes("underlying"))
   console.log(underlyingTokens) */
   const superTokens = extendedSuperTokenList.tokens.filter((token) => token?.tags?.includes("underlying"));
   const filteredSuperTokens = superTokens.filter((token) => token.chainId === 1 ? token : null);
    console.log(filteredSuperTokens);