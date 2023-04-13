export type Writeable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P];
};

export type Manifest = {
  version: string;
  type: string;
  isSuperToken: boolean;
  svgIconPath: string;
  defaultColor: string;
  coingeckoId: string;
  defaultPrice: number;
  roundCurrencyUpto: string;
};

export type BridgeInfo = Record<
  string,
  Record<number, Record<"tokenAddress", string>>
>;
