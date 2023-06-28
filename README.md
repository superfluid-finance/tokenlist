# Superfluid Token List Builder

## Getting Started

- `pnpm`
- `pnpm ipfs:publish`

This will build the tokenlist based on all Superfluid Protocol V1 subgraphs on all networks excluding tokens of which the `isListed` property is `false`.
When the build has finished, it will automatically publish this to IPFS and pin it with Pinata.

You can set `publishToIpfs: false` in `buildSuperfluidTokenList` this will only save the json result in the `versions` folder,
under the name `token-list_v{ma}.{mi}.{p}.json`

## ENV

- PINATA_API_KEY
- PINATA_SECRET

  ##### without these it's not possible to publish on ipfs

- TOKEN_ICON_URL

  ##### this is necessary for the scripts to be able to fetch a logoURI for each token
