# Superfluid Token List NPM Package

This package provides an extended token list format, based on the Uniswap token list specification, with additional fields specifically catered to Superfluid Protocol tokens. This package can be used to interact with the latest Superfluid Token List, and also provides TypeScript types for type safety.

## Installation

You can install the package via NPM:

```bash
npm install @superfluid-finance/tokenlist
```

Alternatively, if you are using Yarn:

```bash
yarn add @superfluid-finance/tokenlist
```

Alternatively, if you are using pnpm:

```bash
pnpm add @superfluid-finance/tokenlist
```

## Example Usages

Here is a basic example of how to import and use the SuperTokenList:

### Get Super Tokens

Super Tokens can be identified using the `superTokenInfo` extension or the "supertoken" tag. Use the following code to filter out Super Tokens:

```ts
import superTokenList from '@superfluid-finance/tokenlist';

console.log(superTokenList); // Contains both Super Tokens and underlying tokens.
```

```ts
const superTokens: SuperTokenInfo[] = superTokenList.tokens.filter(token => 
    token.extensions?.superTokenInfo // Alternatively: token.tags?.includes("supertoken")
);

console.log(superTokens);
```

### Get Underlying Tokens

Underlying tokens are those tokens that do not have the `superTokenInfo` extension or have the "underlying" tag. Use the following code to filter out underlying tokens:

```ts
const underlyingTokens: TokenInfo[] = superTokenList.tokens.filter(token => 
    !token.extensions?.superTokenInfo // Alternatively: token.tags?.includes("underlying")
);

console.log(underlyingTokens);
```

## Types

The package also exports several TypeScript types that you can use to ensure type safety in your own code. Here are the main types:

- `SuperTokenExtensions`: An extension to the Uniswap's `TokenInfo` type with Superfluid specific fields.
- `SuperTokenInfo`: A type that combines the Uniswap's `TokenInfo` type and the `SuperTokenExtensions` type.

The package also re-exports the main consumer types from `@uniswap/token-lists` for convenience: `TokenInfo`, `TokenList`, `Version`, `Tags`.

## Contributing

We welcome contributions! Please feel free to submit a pull request if you have any updates or improvements to suggest.

## License

This package is licensed under the MIT License.
