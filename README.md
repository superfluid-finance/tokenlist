# Superfluid Token List Management

This repository contains scripts and utilities for managing the Superfluid token list(s). The scripts update or filter tokens based on various criteria, such as solvency categories or token types.

## Installation and Getting Started

```sh
[npm install | yarn add | pnpm add] @superfluid-finance/tokenlist
```

```typescript
import tokenlist, { 
 extendedSuperTokenList
} from "@superfluid-finance/tokenlist"

// ...later

const underlyingTokens = extendedTokenlist.tokens.filter((token) => token.tags.includes("underlying"))
```


## How to List a Token

If you'd like to have a token added to our token list or updated with regards to its solvency category, please follow the steps below:

### 1. **Prerequisites**:

   - Prepare all necessary token information, such as token contract address, token symbol, token name, decimals, logo URI, and other relevant data.

### 2. **Submit a Proposal**:
   - Fork the repository.
   - Add or update the token's details in the appropriate JSON file.
   - Create a pull request with a clear title and description detailing the changes and the reasons behind them.

### 3. **Review Process**:
   - Our team will review the proposal, which might include verifying the token's authenticity, its source code (if available), liquidity, market cap, and other essential metrics.
   - If further information is required, our team will comment on the pull request.

### 4. **Feedback and Updates**:
   - Based on the feedback, update the pull request if necessary. Respond to any comments and provide clarifications where needed.

### 5. **Approval & Merge**:
   - Once the review process is complete and the token meets all criteria, the pull request will be approved.
   - The changes will be merged, and the token will be listed, and a new package version will be released.

### 6. **Post-Listing**:
   - Once listed, the token's solvency category might be updated periodically based on ongoing assessments.
   - Users and token owners can provide feedback and request re-evaluation if they believe a token's category needs to be updated.

**Note**: Listing is not an endorsement. Always do your own research before interacting or investing in any token.

## Token Types

Tokens are classified into specific types:

- **Wrapper**: A supertoken that wraps a regular token (eg. USDC - USDCx).
- **Native Asset**: A supertoken related to the blockchain's native token (eg. ETH - ETHx).
- **Pure**: Supertokens that neither wrap other assets nor are they related to the native asset.
- **Underlying**: Regular (ERC20) tokens, which are the underlying tokens of some supertoken.

Underlying tokens always get included in the respective lists.

### Available Token Lists

- **`superfluid.tokenlist.json`**: The default Superfluid token list, containing only solvency category A, and B tokens.
- **`superfluid.extended.tokenlist.json`**: An extended list all of the listed tokens.

### Tags Explanation

Tokens are categorized using tags for quicker identification:

- **`underlying`**: Marks a token as an underlying asset for another token.
- **`supertoken`**: Marks a token as a supertoken.
- **`testnet`**: Testnet tokens such as fUSDC & fUSDCx.

## Usage with Next.js
If you're using the token icons with Next.js' `<Image>` component then you might need to add this to your `next.config.js`:
```ts
images: {
    remotePatterns: [
        { hostname: "tokenlist.superfluid.org" }
    ]
}
```

  
## Development
### Scripts
#### 1. `bootstrap.ts`

**Purpose:** Read subgraphs, and generate the extended token list.

- Read Superfluid's subgraphs
- Collect the listed tokens, and their respective data
- attach metadata (token type, logoURI, some tags)
- Output the resulting list to `superfluid.extended.tokenlist.json`.

#### 2. `attach-solvency-tags.ts`

**Purpose:** Attach solvency tags to tokens.

- Reads from `superfluid.extended.tokenlist.json`.
- Utilizes solvency data from a CSV file.
- Updates non-"underlying" tokens with the corresponding solvency tags (`tier_a`, `tier_b`, or `tier_c`).
- Validates the updated token list.
- Saves the final list to `superfluid.extended.tokenlist.json`.

#### 3. `split-by-solvency.ts`

**Purpose:** Split tokens into separate files, based on their solvency tags.

- Reads from `superfluid.extended.tokenlist.json`.
- Filters and divides tokens into distinct lists using solvency tags.
- Creates separate lists for `tier_a`, `tier_b`, `tier_c`, and a combined one for `tier_a` and `tier_b`.
- Validates each split list.
- Outputs each list to a corresponding JSON file.

---

Execute the desired script using an appropriate Node.js environment.
