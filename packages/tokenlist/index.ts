import { TokenInfo, TokenList, Version, Tags } from "@uniswap/token-lists";
import tokenListJSON from "./superfluid.tokenlist.json" assert { type: "json" };
import tokenListTierAJSON from "./superfluid.tier_a.tokenlist.json" assert { type: "json" };
import tokenListTierBJSON from "./superfluid.tier_b.tokenlist.json" assert { type: "json" };
import tokenListTierCJSON from "./superfluid.tier_c.tokenlist.json" assert { type: "json" };

export { TokenInfo, TokenList, Version, Tags }; // Re-export @uniswap/token-lists' main consumer types.

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

export const superTokenList_TierA = tokenListTierAJSON as SuperTokenList;
export const superTokenList_TierB = tokenListTierBJSON as SuperTokenList;
export const superTokenList_TierC = tokenListTierCJSON as SuperTokenList;

export default superTokenList;
