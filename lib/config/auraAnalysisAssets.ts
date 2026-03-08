/**
 * Asset metadata for Aura Analysis calculations.
 * Used for distance (pips/points/price), precision, and pip value.
 * Single source of truth for all supported instruments.
 */

export type DistanceType = "pip" | "point" | "price";
export type AssetClass = "forex" | "metals" | "commodity" | "energy" | "indices" | "crypto";

export interface AssetMetadata {
  symbol: string;
  displayName: string;
  assetClass: AssetClass;
  distanceType: DistanceType;
  pipMultiplier: number;
  pricePrecision: number;
  quantityPrecision: number;
  contractSizeHint: number | null;
  pipValueHint: number | null;
  quoteType: string;
}

function f(symbol: string, displayName: string, assetClass: AssetClass, distanceType: DistanceType, pipMultiplier: number, pricePrecision: number, quantityPrecision: number, contractSizeHint: number | null, pipValueHint: number, quoteType: string): AssetMetadata {
  return { symbol, displayName, assetClass, distanceType, pipMultiplier, pricePrecision, quantityPrecision, contractSizeHint, pipValueHint, quoteType };
}

const ASSETS: AssetMetadata[] = [
  // Forex majors
  f("EURUSD", "EUR/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("GBPUSD", "GBP/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("USDJPY", "USD/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("USDCHF", "USD/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("USDCAD", "USD/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("AUDUSD", "AUD/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("NZDUSD", "NZD/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  // Forex crosses / minors
  f("EURGBP", "EUR/GBP", "forex", "pip", 10000, 5, 2, 100000, 10, "GBP"),
  f("EURJPY", "EUR/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("EURCHF", "EUR/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("EURAUD", "EUR/AUD", "forex", "pip", 10000, 5, 2, 100000, 10, "AUD"),
  f("EURCAD", "EUR/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "CAD"),
  f("EURNZD", "EUR/NZD", "forex", "pip", 10000, 5, 2, 100000, 10, "NZD"),
  f("GBPJPY", "GBP/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("GBPCHF", "GBP/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("GBPAUD", "GBP/AUD", "forex", "pip", 10000, 5, 2, 100000, 10, "AUD"),
  f("GBPCAD", "GBP/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "CAD"),
  f("GBPNZD", "GBP/NZD", "forex", "pip", 10000, 5, 2, 100000, 10, "NZD"),
  f("AUDJPY", "AUD/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("AUDCHF", "AUD/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("AUDCAD", "AUD/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "CAD"),
  f("AUDNZD", "AUD/NZD", "forex", "pip", 10000, 5, 2, 100000, 10, "NZD"),
  f("NZDJPY", "NZD/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("NZDCHF", "NZD/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("NZDCAD", "NZD/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "CAD"),
  f("CADJPY", "CAD/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("CADCHF", "CAD/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("CHFJPY", "CHF/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  // Metals / commodities / energy
  f("XAUUSD", "XAU/USD (Gold)", "metals", "point", 10, 2, 2, 100, 1, "USD"),
  f("XAUEUR", "XAU/EUR", "metals", "point", 10, 2, 2, 100, 1, "EUR"),
  f("XAUGBP", "XAU/GBP", "metals", "point", 10, 2, 2, 100, 1, "GBP"),
  f("XAUAUD", "XAU/AUD", "metals", "point", 10, 2, 2, 100, 1, "AUD"),
  f("XAGUSD", "XAG/USD (Silver)", "metals", "point", 100, 3, 2, 5000, 0.5, "USD"),
  f("XTIUSD", "WTI Oil", "energy", "point", 100, 2, 2, null, 10, "USD"),
  f("XBRUSD", "Brent Oil", "energy", "point", 100, 2, 2, null, 10, "USD"),
  f("NATGAS", "Natural Gas", "energy", "point", 100, 3, 2, null, 10, "USD"),
  // Indices
  f("US30", "US30", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("NAS100", "NAS100", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("SPX500", "SPX500", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("GER40", "GER40", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("UK100", "UK100", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("FRA40", "FRA40", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("EU50", "EU50", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("JP225", "JP225", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("HK50", "HK50", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("AUS200", "AUS200", "indices", "point", 1, 0, 2, null, 1, "USD"),
  // Crypto
  f("BTCUSD", "BTC/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("ETHUSD", "ETH/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("SOLUSD", "SOL/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
];

const bySymbol = new Map<string, AssetMetadata>();
ASSETS.forEach((a) => bySymbol.set(a.symbol.toUpperCase(), a));

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
