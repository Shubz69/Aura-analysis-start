/**
 * Asset metadata for Aura Analysis calculations.
 * Used for distance (pips/points/price), precision, and pip value.
 */

export type DistanceType = "pip" | "point" | "price";
export type AssetClass = "forex" | "metals" | "commodity" | "energy" | "indices" | "crypto";

export interface AssetMetadata {
  symbol: string;
  displayName: string;
  assetClass: AssetClass;
  distanceType: DistanceType;
  /** Multiplier to convert price difference to distance (e.g. 10000 for standard forex, 100 for JPY, 1 for indices). */
  pipMultiplier: number;
  pricePrecision: number;
  quantityPrecision: number;
  contractSizeHint: number | null;
  pipValueHint: number | null;
  quoteType: string;
}

const ASSETS: AssetMetadata[] = [
  { symbol: "EURUSD", displayName: "EUR/USD", assetClass: "forex", distanceType: "pip", pipMultiplier: 10000, pricePrecision: 5, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "USD" },
  { symbol: "GBPUSD", displayName: "GBP/USD", assetClass: "forex", distanceType: "pip", pipMultiplier: 10000, pricePrecision: 5, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "USD" },
  { symbol: "USDJPY", displayName: "USD/JPY", assetClass: "forex", distanceType: "pip", pipMultiplier: 100, pricePrecision: 3, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "JPY" },
  { symbol: "GBPJPY", displayName: "GBP/JPY", assetClass: "forex", distanceType: "pip", pipMultiplier: 100, pricePrecision: 3, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "JPY" },
  { symbol: "AUDUSD", displayName: "AUD/USD", assetClass: "forex", distanceType: "pip", pipMultiplier: 10000, pricePrecision: 5, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "USD" },
  { symbol: "USDCAD", displayName: "USD/CAD", assetClass: "forex", distanceType: "pip", pipMultiplier: 10000, pricePrecision: 5, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "USD" },
  { symbol: "XAUUSD", displayName: "XAU/USD (Gold)", assetClass: "metals", distanceType: "point", pipMultiplier: 10, pricePrecision: 2, quantityPrecision: 2, contractSizeHint: 100, pipValueHint: 1, quoteType: "USD" },
  { symbol: "XAGUSD", displayName: "XAG/USD (Silver)", assetClass: "metals", distanceType: "point", pipMultiplier: 100, pricePrecision: 3, quantityPrecision: 2, contractSizeHint: 5000, pipValueHint: 0.5, quoteType: "USD" },
  { symbol: "XTIUSD", displayName: "WTI Oil", assetClass: "energy", distanceType: "point", pipMultiplier: 100, pricePrecision: 2, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 10, quoteType: "USD" },
  { symbol: "XBRUSD", displayName: "Brent Oil", assetClass: "energy", distanceType: "point", pipMultiplier: 100, pricePrecision: 2, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 10, quoteType: "USD" },
  { symbol: "US30", displayName: "US30", assetClass: "indices", distanceType: "point", pipMultiplier: 1, pricePrecision: 0, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "NAS100", displayName: "NAS100", assetClass: "indices", distanceType: "point", pipMultiplier: 1, pricePrecision: 0, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "SPX500", displayName: "SPX500", assetClass: "indices", distanceType: "point", pipMultiplier: 1, pricePrecision: 0, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "GER40", displayName: "GER40", assetClass: "indices", distanceType: "point", pipMultiplier: 1, pricePrecision: 0, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "BTCUSD", displayName: "BTC/USD", assetClass: "crypto", distanceType: "price", pipMultiplier: 1, pricePrecision: 2, quantityPrecision: 4, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "ETHUSD", displayName: "ETH/USD", assetClass: "crypto", distanceType: "price", pipMultiplier: 1, pricePrecision: 2, quantityPrecision: 4, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
  { symbol: "SOLUSD", displayName: "SOL/USD", assetClass: "crypto", distanceType: "price", pipMultiplier: 1, pricePrecision: 4, quantityPrecision: 4, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" },
];

const bySymbol = new Map<string, AssetMetadata>();
ASSETS.forEach((a) => bySymbol.set(a.symbol.toUpperCase(), a));

/** Get metadata for a symbol; falls back to inferred defaults for unknown symbols. */
export function getAssetMetadata(symbol: string): AssetMetadata {
  const upper = symbol.toUpperCase();
  const known = bySymbol.get(upper);
  if (known) return known;
  if (upper.includes("JPY")) {
    return { symbol: upper, displayName: upper, assetClass: "forex", distanceType: "pip", pipMultiplier: 100, pricePrecision: 3, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "JPY" };
  }
  if (upper.includes("XAU") || upper.includes("GOLD")) {
    return { symbol: upper, displayName: upper, assetClass: "metals", distanceType: "point", pipMultiplier: 10, pricePrecision: 2, quantityPrecision: 2, contractSizeHint: 100, pipValueHint: 1, quoteType: "USD" };
  }
  if (["US30", "NAS100", "SPX500", "GER40", "UK100", "FRA40", "EU50", "JP225", "HK50", "AUS200"].some((s) => upper.includes(s))) {
    return { symbol: upper, displayName: upper, assetClass: "indices", distanceType: "point", pipMultiplier: 1, pricePrecision: 0, quantityPrecision: 2, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" };
  }
  if (["BTC", "ETH", "SOL"].some((s) => upper.includes(s))) {
    return { symbol: upper, displayName: upper, assetClass: "crypto", distanceType: "price", pipMultiplier: 1, pricePrecision: 2, quantityPrecision: 4, contractSizeHint: null, pipValueHint: 1, quoteType: "USD" };
  }
  return { symbol: upper, displayName: upper, assetClass: "forex", distanceType: "pip", pipMultiplier: 10000, pricePrecision: 5, quantityPrecision: 2, contractSizeHint: 100000, pipValueHint: 10, quoteType: "USD" };
}

export function getAllAssetMetadata(): AssetMetadata[] {
  return [...ASSETS];
}
