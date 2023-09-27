import { TokenInfo, TokenList, Version, Tags } from "@uniswap/token-lists";
import tokenListJSON from "./superfluid.tokenlist.json";
import extendedTokenListJSON from "./superfluid.extended.tokenlist.json";
import tierATokenListJSON from "./superfluid.tier-a.tokenlist.json";
import tierBTokenListJSON from "./superfluid.tier-b.tokenlist.json";
import tierCTokenListJSON from "./superfluid.tier-c.tokenlist.json";

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
  };
};

export type SuperTokenInfo = TokenInfo & SuperTokenExtensions;
type UnderlyingTokenInfo = TokenInfo;

export type SuperTokenList = Omit<TokenList, "tokens"> & {
  readonly tokens: (SuperTokenInfo & UnderlyingTokenInfo)[];
};

export const extendedSuperTokenList = extendedTokenListJSON as SuperTokenList;
export const tierASuperTokenList = tierATokenListJSON as SuperTokenList;
export const tierBSuperTokenList = tierBTokenListJSON as SuperTokenList;
export const tierCSuperTokenList = tierCTokenListJSON as SuperTokenList;

const superTokenList = tokenListJSON as SuperTokenList;

export default superTokenList;
