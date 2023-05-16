import { TokenInfo, TokenList } from "@uniswap/token-lists";
import tokenListJSON from "./token-list.json";

export type SuperTokenExtensions = {
  extensions: {
    superTokenInfo: {
      type: "Pure" | "Native Asset" | "Wrapper";
      underlyingTokenAddress?: string;
    };

    bridgeInfo?: {
      [x: `${number}`]: {
        tokenAddress: string;
      };
    };
  };
};

export type SuperTokenInfo = TokenInfo & SuperTokenExtensions;
export type SuperTokenList = Omit<TokenList, "tokens"> & {
  tokens: SuperTokenInfo[];
};

export default tokenListJSON as SuperTokenList;
