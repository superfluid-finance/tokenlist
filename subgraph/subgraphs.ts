import { getBuiltGraphSDK } from "./.graphclient";
import sfMeta from "@superfluid-finance/metadata"

type SubgraphSettings = {
  chainId: number;
  url: string;
  testnet?: boolean;
};

export const deprecatedNetworkChainIds = [
  80001, // Polygon Mumbai
  5, // Goerli
  420, // Optimism Goerli
  421613, // Arbitrum Goerli
  1442, // Polygon zkEVM Testnet
  84531, // Base Goerli
];

export const subgraphs = sfMeta.networks.reduce((acc, x) => {
  if (deprecatedNetworkChainIds.includes(x.chainId)) {
    return acc;
  }

  acc[x.name] = {
    chainId: x.chainId,
    testnet: x.isTestnet,
    url: `https://${x.name}.subgraph.x.superfluid.dev`
  };
  
  return acc;
}, {} as Record<string, SubgraphSettings>);

type Network = keyof typeof subgraphs;

export const networks = Object.keys(subgraphs) as Network[];
export const testNetworks = Object.values(subgraphs).filter(
  (settings) => settings.testnet
);

type SubgraphMapping = Record<Network, ReturnType<typeof getBuiltGraphSDK>>;

const graphSDK = Object.entries(subgraphs).reduce<SubgraphMapping>(
  (acc, [name, { url }]) => ({
    ...acc,
    [name]: getBuiltGraphSDK({ url }),
  }),
  {} as SubgraphMapping
);

export default graphSDK;
