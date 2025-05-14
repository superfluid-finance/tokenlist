import type { TokenInfo as OriginalTokenInfo, TokenList, Version, Tags } from "@uniswap/token-lists";
import tokenListJSON from "./public/superfluid.tokenlist.json" assert { type: "json" };
import extendedTokenListJSON from "./public/superfluid.extended.tokenlist.json" assert { type: "json" };

export type { TokenList, Version, Tags }; // Re-export @uniswap/token-lists' main consumer types.

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

export interface TokenInfo extends Omit<OriginalTokenInfo, "address"> {
  readonly address: `0x${string}`;
}

export type SuperTokenInfo = TokenInfo & SuperTokenExtensions;
type UnderlyingTokenInfo = TokenInfo;

export type SuperTokenList = Omit<TokenList, "tokens"> & {
  readonly tokens: (SuperTokenInfo & UnderlyingTokenInfo)[];
};

export const extendedSuperTokenList = extendedTokenListJSON as SuperTokenList;

const superTokenList = tokenListJSON as SuperTokenList;

export const fetchLatestSuperTokenList = async (): Promise<SuperTokenList> => {
  const data = await fetchTokenList("https://tokenlist.superfluid.org/superfluid.tokenlist.json", {
    fallbackTokenList: superTokenList
  });
  return data;
};

export const fetchLatestExtendedSuperTokenList = async (): Promise<SuperTokenList> => {
  const data = await fetchTokenList("https://tokenlist.superfluid.org/superfluid.extended.tokenlist.json", {
    fallbackTokenList: extendedSuperTokenList
  });
  return data;
};

export default superTokenList;

const inMemoryCache = new Map();

async function fetchTokenList(url: string, options: {
  timeout?: number;
  cacheTTL?: number;
  fallbackTokenList: SuperTokenList;
}): Promise<SuperTokenList> {
  const {
    timeout = 3000,
    fallbackTokenList
  } = options;

  // Check cache
  if (inMemoryCache.has(url)) {
    return inMemoryCache.get(url).data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the successful response
    inMemoryCache.set(url, { data, timestamp: Date.now() });
    
    return data as SuperTokenList;
  } catch (error: unknown) {
    console.error('Error fetching tokenlist:', error);
    console.warn('Using fallback token list.');
    return fallbackTokenList;
  }
}
