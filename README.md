# Superfluid Token List Management

This repository contains scripts and utilities for managing the Superfluid token list(s). The scripts update or filter tokens based on various criteria, such as solvency categories or token types.

## Installation and Getting Started

```sh
[npm install | yarn add | pnpm add] @superfluid-finance/tokenlist
```

```typescript
import tokenlist, { 
 extendedSuperTokenList, 
 tierATokenListJSON, 
 tierBTokenListJSON, 
 tierCTokenListJSON 
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

Underlying tokens always get included in the respective lists.

### Available Token Lists

- **`superfluid.tokenlist.json`**: The default Superfluid token list, containing only solvency category A, and B tokens.
- **`superfluid.extended.tokenlist.json`**: An extended list all of the listed tokens.
- **`superfluid.tier-a.tokenlist.json`**: List of tokens with solvency category `A`.
- **`superfluid.tier-b.tokenlist.json`**: List of tokens with solvency category `B`.
- **`superfluid.tier-c.tokenlist.json`**: List of tokens with solvency category `C`.

### Solvency Categories

Solvency categories are classifications assigned to tokens to represent their perceived financial stability or risk. The categories help users make informed decisions when dealing with tokens, especially in financial contexts.

#### Categories:

- **Category A (`tier_a`)**:
    - Represents tokens deemed to be the most stable and lowest risk.
    - These are typically well-established tokens with high market capitalization and liquidity.
    
- **Category B (`tier_b`)**:
    - Tokens that may carry a moderate level of risk.
    - Often newer tokens or those with smaller market caps, but still possess significant trust and adoption in the market.
    
- **Category C (`tier_c`)**:
    - Represents tokens with the highest level of risk.
    - Might be very new tokens, those with lower liquidity, or ones from projects that haven't established a significant reputation.
    
Users are encouraged to perform their due diligence and research before making any financial moves, even with tokens from Category A.


### Tags Explanation

Tokens are categorized using tags for quicker identification:

- **`underlying`**: Marks a token as an underlying asset for another token.
- **`tier_a`**: Indicates tokens of solvency category A.
- **`tier_b`**: Indicates tokens of solvency category B.
- **`tier_c`**: Indicates tokens of solvency category C.
- **`supertoken`**: Marks a token as a supertoken variant.
- **`testnet`**: Testnet tokens such as fUSDC & fUSDCx.

  
## Development
### Scripts
#### 1. `bootstrap.ts`

**Purpose:** Read subgraphs, and generate the extended token list.

- Reads from `superfluid.extended.tokenlist.json`.
- Fetches solvency data from a CSV file.
- Maps solvency categories (A, B, C) to tags (`tier_a`, `tier_b`, `tier_c`).
- Updates tokens with the relevant solvency category tags.
- Outputs the updated list to `superfluid.tokenlist.json`.

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
