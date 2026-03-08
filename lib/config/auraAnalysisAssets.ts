/**
 * Asset metadata for Aura Analysis calculations.
 * Single source of truth: forex, metals, commodities, energy, indices, stocks, futures, crypto.
 */

export type DistanceType = "pip" | "point" | "price";
export type AssetClass =
  | "forex"
  | "metals"
  | "commodity"
  | "energy"
  | "indices"
  | "stocks"
  | "futures"
  | "crypto";

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

function f(
  symbol: string,
  displayName: string,
  assetClass: AssetClass,
  distanceType: DistanceType,
  pipMultiplier: number,
  pricePrecision: number,
  quantityPrecision: number,
  contractSizeHint: number | null,
  pipValueHint: number,
  quoteType: string
): AssetMetadata {
  return {
    symbol,
    displayName,
    assetClass,
    distanceType,
    pipMultiplier,
    pricePrecision,
    quantityPrecision,
    contractSizeHint,
    pipValueHint,
    quoteType,
  };
}

const ASSETS: AssetMetadata[] = [
  // ─── FOREX ─────────────────────────────────────────────────────────────
  // Majors
  f("EURUSD", "EUR/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("GBPUSD", "GBP/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("USDJPY", "USD/JPY", "forex", "pip", 100, 3, 2, 100000, 10, "JPY"),
  f("USDCHF", "USD/CHF", "forex", "pip", 10000, 5, 2, 100000, 10, "CHF"),
  f("USDCAD", "USD/CAD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("AUDUSD", "AUD/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  f("NZDUSD", "NZD/USD", "forex", "pip", 10000, 5, 2, 100000, 10, "USD"),
  // Minors / crosses
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
  // Exotics
  f("USDSEK", "USD/SEK", "forex", "pip", 10000, 4, 2, 100000, 10, "SEK"),
  f("USDNOK", "USD/NOK", "forex", "pip", 10000, 4, 2, 100000, 10, "NOK"),
  f("USDDKK", "USD/DKK", "forex", "pip", 10000, 4, 2, 100000, 10, "DKK"),
  f("USDTRY", "USD/TRY", "forex", "pip", 10000, 4, 2, 100000, 10, "TRY"),
  f("USDZAR", "USD/ZAR", "forex", "pip", 10000, 4, 2, 100000, 10, "ZAR"),
  f("USDMXN", "USD/MXN", "forex", "pip", 10000, 4, 2, 100000, 10, "MXN"),
  f("USDPLN", "USD/PLN", "forex", "pip", 10000, 4, 2, 100000, 10, "PLN"),
  f("USDHKD", "USD/HKD", "forex", "pip", 10000, 4, 2, 100000, 10, "HKD"),
  f("USDSGD", "USD/SGD", "forex", "pip", 10000, 4, 2, 100000, 10, "SGD"),
  f("EURSEK", "EUR/SEK", "forex", "pip", 10000, 4, 2, 100000, 10, "SEK"),
  f("EURNOK", "EUR/NOK", "forex", "pip", 10000, 4, 2, 100000, 10, "NOK"),
  f("EURTRY", "EUR/TRY", "forex", "pip", 10000, 4, 2, 100000, 10, "TRY"),

  // ─── METALS (precious & industrial) ─────────────────────────────────────
  f("XAUUSD", "XAU/USD (Gold)", "metals", "point", 10, 2, 2, 100, 1, "USD"),
  f("XAUEUR", "XAU/EUR", "metals", "point", 10, 2, 2, 100, 1, "EUR"),
  f("XAUGBP", "XAU/GBP", "metals", "point", 10, 2, 2, 100, 1, "GBP"),
  f("XAUAUD", "XAU/AUD", "metals", "point", 10, 2, 2, 100, 1, "AUD"),
  f("XAGUSD", "XAG/USD (Silver)", "metals", "point", 100, 3, 2, 5000, 0.5, "USD"),
  f("XPTUSD", "XPT/USD (Platinum)", "metals", "point", 10, 2, 2, 50, 1, "USD"),
  f("XPDUSD", "XPD/USD (Palladium)", "metals", "point", 10, 2, 2, 100, 1, "USD"),
  f("COPPER", "Copper", "metals", "point", 100, 4, 2, null, 1, "USD"),

  // ─── COMMODITIES (soft & grains) ────────────────────────────────────────
  f("COFFEE", "Coffee", "commodity", "point", 100, 3, 2, null, 1, "USD"),
  f("SUGAR", "Sugar", "commodity", "point", 100, 4, 2, null, 1, "USD"),
  f("COTTON", "Cotton", "commodity", "point", 100, 4, 2, null, 1, "USD"),
  f("COCOA", "Cocoa", "commodity", "point", 1, 0, 2, null, 1, "USD"),
  f("CORN", "Corn", "commodity", "point", 100, 2, 2, null, 1, "USD"),
  f("WHEAT", "Wheat", "commodity", "point", 100, 2, 2, null, 1, "USD"),
  f("SOYBEAN", "Soybeans", "commodity", "point", 100, 2, 2, null, 1, "USD"),
  f("RICE", "Rice", "commodity", "point", 100, 2, 2, null, 1, "USD"),
  f("OAT", "Oats", "commodity", "point", 100, 2, 2, null, 1, "USD"),

  // ─── ENERGY ─────────────────────────────────────────────────────────────
  f("XTIUSD", "WTI Crude Oil", "energy", "point", 100, 2, 2, null, 10, "USD"),
  f("XBRUSD", "Brent Crude Oil", "energy", "point", 100, 2, 2, null, 10, "USD"),
  f("NATGAS", "Natural Gas", "energy", "point", 100, 3, 2, null, 10, "USD"),
  f("HEATINGOIL", "Heating Oil", "energy", "point", 100, 4, 2, null, 10, "USD"),
  f("GASOLINE", "Gasoline RBOB", "energy", "point", 100, 4, 2, null, 10, "USD"),

  // ─── INDICES ────────────────────────────────────────────────────────────
  f("US30", "US30 (Dow)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("NAS100", "NAS100 (Nasdaq)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("SPX500", "SPX500 (S&P 500)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("US2000", "US2000 (Russell)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("VIX", "VIX Volatility", "indices", "point", 1, 2, 2, null, 1, "USD"),
  f("GER40", "GER40 (DAX)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("UK100", "UK100 (FTSE)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("FRA40", "FRA40 (CAC)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("EU50", "EU50 (Euro Stoxx)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("JP225", "JP225 (Nikkei)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("HK50", "HK50 (Hang Seng)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("AUS200", "AUS200 (ASX)", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("CHINA50", "China A50", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("SPAIN35", "Spain 35", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("ITA40", "Italy 40", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("NETH25", "Netherlands 25", "indices", "point", 1, 0, 2, null, 1, "USD"),
  f("SWI20", "Switzerland 20", "indices", "point", 1, 0, 2, null, 1, "USD"),

  // ─── STOCKS (CFDs / popular symbols) ────────────────────────────────────
  f("AAPL", "Apple", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("MSFT", "Microsoft", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("GOOGL", "Alphabet (Google)", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("AMZN", "Amazon", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("META", "Meta (Facebook)", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("TSLA", "Tesla", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("NVDA", "NVIDIA", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("BRK.A", "Berkshire Hathaway", "stocks", "point", 1, 0, 2, null, 1, "USD"),
  f("JPM", "JPMorgan Chase", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("V", "Visa", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("JNJ", "Johnson & Johnson", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("WMT", "Walmart", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("PG", "Procter & Gamble", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("UNH", "UnitedHealth", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("HD", "Home Depot", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("DIS", "Disney", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("BAC", "Bank of America", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("ADBE", "Adobe", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("NFLX", "Netflix", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("CRM", "Salesforce", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("PYPL", "PayPal", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("INTC", "Intel", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("AMD", "AMD", "stocks", "point", 1, 2, 2, null, 1, "USD"),
  f("COIN", "Coinbase", "stocks", "point", 1, 2, 2, null, 1, "USD"),

  // ─── FUTURES (common contracts) ─────────────────────────────────────────
  f("ES", "E-mini S&P 500", "futures", "point", 1, 2, 2, null, 50, "USD"),
  f("NQ", "E-mini Nasdaq", "futures", "point", 1, 2, 2, null, 20, "USD"),
  f("YM", "E-mini Dow", "futures", "point", 1, 0, 2, null, 5, "USD"),
  f("RTY", "E-mini Russell", "futures", "point", 1, 2, 2, null, 50, "USD"),
  f("CL", "Crude Oil WTI", "futures", "point", 100, 2, 2, null, 1000, "USD"),
  f("GC", "Gold", "futures", "point", 10, 2, 2, null, 100, "USD"),
  f("SI", "Silver", "futures", "point", 100, 3, 2, null, 5000, "USD"),
  f("NG", "Natural Gas", "futures", "point", 100, 3, 2, null, 10000, "USD"),
  f("ZB", "US 30Y T-Bond", "futures", "point", 1, 4, 2, null, 1000, "USD"),
  f("ZN", "US 10Y T-Note", "futures", "point", 1, 4, 2, null, 1000, "USD"),
  f("6E", "Euro FX", "futures", "pip", 10000, 5, 2, 125000, 12.5, "USD"),
  f("6J", "Japanese Yen", "futures", "pip", 100, 3, 2, 12500000, 12.5, "USD"),
  f("6B", "British Pound", "futures", "pip", 10000, 5, 2, 62500, 6.25, "USD"),

  // ─── CRYPTO ─────────────────────────────────────────────────────────────
  f("BTCUSD", "BTC/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("ETHUSD", "ETH/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("SOLUSD", "SOL/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("BNBUSD", "BNB/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("XRPUSD", "XRP/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("ADAUSD", "ADA/USD", "crypto", "price", 1, 5, 4, null, 1, "USD"),
  f("DOGEUSD", "DOGE/USD", "crypto", "price", 1, 5, 4, null, 1, "USD"),
  f("AVAXUSD", "AVAX/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("DOTUSD", "DOT/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("MATICUSD", "MATIC/USD", "crypto", "price", 1, 5, 4, null, 1, "USD"),
  f("LINKUSD", "LINK/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("UNIUSD", "UNI/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("ATOMUSD", "ATOM/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("LTCUSD", "LTC/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("BCHUSD", "BCH/USD", "crypto", "price", 1, 2, 4, null, 1, "USD"),
  f("NEARUSD", "NEAR/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("APTUSD", "APT/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("ARBUSD", "ARB/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("OPUSD", "OP/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("INJUSD", "INJ/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("SUIUSD", "SUI/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("SEIUSD", "SEI/USD", "crypto", "price", 1, 4, 4, null, 1, "USD"),
  f("PEPEUSD", "PEPE/USD", "crypto", "price", 1, 8, 4, null, 1, "USD"),
  f("SHIBUSD", "SHIB/USD", "crypto", "price", 1, 8, 4, null, 1, "USD"),
];

const bySymbol = new Map<string, AssetMetadata>();
ASSETS.forEach((a) => bySymbol.set(a.symbol.toUpperCase(), a));

/** Ordered list of asset classes for UI grouping. */
export const ASSET_CLASS_ORDER: AssetClass[] = [
  "forex",
  "metals",
  "commodity",
  "energy",
  "indices",
  "stocks",
  "futures",
  "crypto",
];

/** Display labels for asset class (dropdown sections, filters). */
export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  forex: "Forex",
  metals: "Metals",
  commodity: "Commodities",
  energy: "Energy",
  indices: "Indices",
  stocks: "Stocks",
  futures: "Futures",
  crypto: "Crypto",
};

export function getAssetMetadata(symbol: string): AssetMetadata {
  const upper = symbol.toUpperCase();
  const known = bySymbol.get(upper);
  if (known) return known;
  // Fallbacks for unknown symbols by pattern
  if (upper.includes("JPY") && !upper.includes("CRYPTO")) {
    return f(upper, upper, "forex", "pip", 100, 3, 2, 100000, 10, "JPY");
  }
  if (upper.includes("XAU") || upper.includes("GOLD")) {
    return f(upper, upper, "metals", "point", 10, 2, 2, 100, 1, "USD");
  }
  if (["US30", "NAS100", "SPX500", "GER40", "UK100", "FRA40", "EU50", "JP225", "HK50", "AUS200", "US2000", "VIX"].some((s) => upper.includes(s))) {
    return f(upper, upper, "indices", "point", 1, 0, 2, null, 1, "USD");
  }
  if (["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC", "LINK", "LTC", "BCH"].some((s) => upper.includes(s))) {
    return f(upper, upper, "crypto", "price", 1, 2, 4, null, 1, "USD");
  }
  if (["ES", "NQ", "YM", "RTY", "CL", "GC", "SI", "NG", "ZB", "ZN", "6E", "6J", "6B"].some((s) => upper.includes(s))) {
    return f(upper, upper, "futures", "point", 1, 2, 2, null, 1, "USD");
  }
  return f(upper, upper, "forex", "pip", 10000, 5, 2, 100000, 10, "USD");
}

export function getAllAssetMetadata(): AssetMetadata[] {
  return [...ASSETS];
}

/** Get all assets grouped by asset class (order from ASSET_CLASS_ORDER). */
export function getAssetsByClass(): Map<AssetClass, AssetMetadata[]> {
  const map = new Map<AssetClass, AssetMetadata[]>();
  for (const cls of ASSET_CLASS_ORDER) {
    map.set(cls, ASSETS.filter((a) => a.assetClass === cls));
  }
  return map;
}
