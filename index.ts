import { TokenInfo, TokenList } from "@uniswap/token-lists";
import tokenListJSON from "./superfluid.tokenlist.json";

export type * from "@uniswap/token-lists";

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

const superTokenList = tokenListJSON as SuperTokenList;

export default superTokenList;
