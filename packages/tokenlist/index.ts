import type { TokenInfo, TokenList, Version, Tags } from "@uniswap/token-lists";
import tokenListJSON from "./public/superfluid.tokenlist.json" assert { type: "json" };
import extendedTokenListJSON from "./public/superfluid.extended.tokenlist.json" assert { type: "json" };

export type { TokenInfo, TokenList, Version, Tags }; // Re-export @uniswap/token-lists' main consumer types.

export type SuperTokenExtensions = {
  readonly extensions: {
    readonly superTokenInfo:
      | {
          readonly type: "Pure" | "Native Asset";
        }
      | {
          readonly type: "Wrapper";
          readonly underlyingTokenAddress: `0x${string}`;
        };
    readonly bridgeInfo?: {
      readonly [x: `${number}`]: {
        readonly tokenAddress: `0x${string}`;
      };
    };
  };
};

export type SuperTokenInfo = TokenInfo & SuperTokenExtensions;
type UnderlyingTokenInfo = TokenInfo;

export type SuperTokenList = Omit<TokenList, "tokens"> & {
  readonly tokens: (SuperTokenInfo & UnderlyingTokenInfo)[];
};

export const extendedSuperTokenList = extendedTokenListJSON as SuperTokenList;


const superTokenList = tokenListJSON as SuperTokenList;

export default superTokenList;
