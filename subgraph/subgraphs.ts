import { getBuiltGraphSDK } from "./.graphclient";

export const subgraphs = {
  avalanche: {
    chainId: 43114,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-c",
  },
  "arbitrum-one": {
    chainId: 42161,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one",
  },
  bsc: {
    chainId: 56,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-bsc-mainnet",
  },
  celo: {
    chainId: 42220,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-celo-mainnet",
  },
  goerli: {
    chainId: 5,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
  },
  gnosis: {
    chainId: 100,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai",
  },
  ethereum: {
    chainId: 1,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-eth-mainnet",
  },
  optimism: {
    chainId: 10,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-mainnet",
  },
  polygon: {
    chainId: 137,
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic",
  },
};

type Network = keyof typeof subgraphs;

export const networks = Object.keys(subgraphs) as Network[];

type SubgraphMapping = Record<Network, ReturnType<typeof getBuiltGraphSDK>>;

const graphSDK = Object.entries(subgraphs).reduce<SubgraphMapping>(
  (acc, [name, { url }]) => ({
    ...acc,
    [name]: getBuiltGraphSDK({ url }),
  }),
  {} as SubgraphMapping
);

export default graphSDK;
