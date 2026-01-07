import type { TokenInfo as OriginalTokenInfo, TokenList, Version, Tags } from "@uniswap/token-lists";
import tokenListJSON from "./public/superfluid.tokenlist.json" assert { type: "json" };
import extendedTokenListJSON from "./public/superfluid.extended.tokenlist.json" assert { type: "json" };

export type { TokenList, Version, Tags }; // Re-export @uniswap/token-lists' main consumer types.

export type SuperTokenExtensions = {
  readonly extensions: {
    readonly orderingScore?: number;
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

function isValidSuperTokenList(data: unknown): data is SuperTokenList {
  if (!data || typeof data !== 'object') return false;
  
  const list = data as Record<string, unknown>;
  
  // Top-level structure checks
  if (typeof list.name !== 'string') return false;
  if (typeof list.timestamp !== 'string') return false;
  if (!list.version || typeof list.version !== 'object') return false;
  
  const version = list.version as Record<string, unknown>;
  if (typeof version.major !== 'number') return false;
  if (typeof version.minor !== 'number') return false;
  if (typeof version.patch !== 'number') return false;
  
  if (!Array.isArray(list.tokens) || list.tokens.length === 0) return false;
  
  // Spot-check first token for basic structure
  const token = list.tokens[0] as Record<string, unknown>;
  if (typeof token?.chainId !== 'number') return false;
  if (typeof token?.address !== 'string') return false;
  if (typeof token?.symbol !== 'string') return false;
  if (typeof token?.decimals !== 'number') return false;
  
  return true;
}

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

    if (!isValidSuperTokenList(data)) {
      console.warn('Fetched token list failed validation. Using fallback token list.');
      return fallbackTokenList;
    }
    
    // Cache the successful response
    inMemoryCache.set(url, { data, timestamp: Date.now() });
    
    return data;
  } catch (error: unknown) {
    console.error('Error fetching tokenlist:', error);
    console.warn('Using fallback token list.');
    return fallbackTokenList;
  }
}
