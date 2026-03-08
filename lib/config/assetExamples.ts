/**
 * Example / placeholder prices per symbol for the trade calculator.
 * Every asset has a good example (explicit or fallback by asset class).
 */

import { getAssetMetadata } from "@/lib/config/auraAnalysisAssets";
import type { AssetClass } from "@/lib/config/auraAnalysisAssets";

export interface PriceExample {
  entry: number;
  stop: number;
  tp: number;
}

/** Default (entry, stop, tp) by asset class when symbol not in EXAMPLES. */
function defaultExampleForClass(assetClass: AssetClass): PriceExample {
  switch (assetClass) {
    case "forex":
      return { entry: 1.085, stop: 1.083, tp: 1.09 };
    case "metals":
      return { entry: 2650, stop: 2642, tp: 2666 };
    case "commodity":
      return { entry: 4.25, stop: 4.22, tp: 4.32 };
    case "energy":
      return { entry: 78.5, stop: 78.2, tp: 79.2 };
    case "indices":
      return { entry: 5850, stop: 5840, tp: 5870 };
    case "stocks":
      return { entry: 228, stop: 226, tp: 232 };
    case "futures":
      return { entry: 5850, stop: 5840, tp: 5870 };
    case "crypto":
      return { entry: 92000, stop: 90500, tp: 95000 };
    default:
      return { entry: 1.085, stop: 1.083, tp: 1.09 };
  }
}

const EXAMPLES: Record<string, PriceExample> = {
  EURUSD: { entry: 1.085, stop: 1.083, tp: 1.09 },
  GBPUSD: { entry: 1.265, stop: 1.263, tp: 1.27 },
  USDJPY: { entry: 151.2, stop: 150.8, tp: 152.3 },
  USDCHF: { entry: 0.885, stop: 0.883, tp: 0.89 },
  USDCAD: { entry: 1.36, stop: 1.358, tp: 1.365 },
  AUDUSD: { entry: 0.655, stop: 0.653, tp: 0.658 },
  NZDUSD: { entry: 0.612, stop: 0.61, tp: 0.615 },
  EURGBP: { entry: 0.855, stop: 0.853, tp: 0.858 },
  EURJPY: { entry: 164.2, stop: 163.8, tp: 165 },
  EURCHF: { entry: 0.945, stop: 0.943, tp: 0.949 },
  EURAUD: { entry: 1.655, stop: 1.653, tp: 1.66 },
  EURCAD: { entry: 1.475, stop: 1.473, tp: 1.48 },
  EURNZD: { entry: 1.775, stop: 1.773, tp: 1.78 },
  GBPJPY: { entry: 191.2, stop: 190.8, tp: 192.3 },
  GBPCHF: { entry: 1.12, stop: 1.118, tp: 1.124 },
  GBPAUD: { entry: 1.935, stop: 1.933, tp: 1.94 },
  GBPCAD: { entry: 1.72, stop: 1.718, tp: 1.725 },
  GBPNZD: { entry: 2.07, stop: 2.068, tp: 2.075 },
  AUDJPY: { entry: 99.2, stop: 98.8, tp: 99.8 },
  AUDCHF: { entry: 0.58, stop: 0.578, tp: 0.583 },
  AUDCAD: { entry: 0.89, stop: 0.888, tp: 0.894 },
  AUDNZD: { entry: 1.07, stop: 1.068, tp: 1.074 },
  NZDJPY: { entry: 92.6, stop: 92.2, tp: 93.2 },
  NZDCHF: { entry: 0.542, stop: 0.54, tp: 0.545 },
  NZDCAD: { entry: 0.832, stop: 0.83, tp: 0.835 },
  CADJPY: { entry: 111.2, stop: 110.8, tp: 112 },
  CADCHF: { entry: 0.651, stop: 0.649, tp: 0.654 },
  CHFJPY: { entry: 170.8, stop: 170.4, tp: 171.4 },
  XAUUSD: { entry: 2650, stop: 2642, tp: 2666 },
  XAUEUR: { entry: 2450, stop: 2442, tp: 2466 },
  XAUGBP: { entry: 2080, stop: 2072, tp: 2096 },
  XAUAUD: { entry: 4050, stop: 4042, tp: 4066 },
  XAGUSD: { entry: 32.5, stop: 32.3, tp: 32.9 },
  XTIUSD: { entry: 78.5, stop: 78.2, tp: 79.2 },
  XBRUSD: { entry: 82.5, stop: 82.2, tp: 83.2 },
  NATGAS: { entry: 2.85, stop: 2.82, tp: 2.91 },
  US30: { entry: 42000, stop: 41850, tp: 42350 },
  NAS100: { entry: 20450, stop: 20400, tp: 20550 },
  SPX500: { entry: 5850, stop: 5840, tp: 5870 },
  GER40: { entry: 19850, stop: 19820, tp: 19920 },
  UK100: { entry: 8250, stop: 8230, tp: 8290 },
  FRA40: { entry: 7950, stop: 7930, tp: 7990 },
  EU50: { entry: 4950, stop: 4935, tp: 4975 },
  JP225: { entry: 40500, stop: 40400, tp: 40700 },
  HK50: { entry: 18500, stop: 18450, tp: 18600 },
  AUS200: { entry: 7850, stop: 7830, tp: 7890 },
  BTCUSD: { entry: 92000, stop: 90500, tp: 95000 },
  ETHUSD: { entry: 3450, stop: 3420, tp: 3510 },
  SOLUSD: { entry: 218, stop: 215, tp: 224 },
  BNBUSD: { entry: 620, stop: 610, tp: 640 },
  XRPUSD: { entry: 2.45, stop: 2.42, tp: 2.52 },
  ADAUSD: { entry: 0.98, stop: 0.96, tp: 1.02 },
  DOGEUSD: { entry: 0.38, stop: 0.37, tp: 0.40 },
  LTCUSD: { entry: 98, stop: 96, tp: 102 },
  XPTUSD: { entry: 985, stop: 978, tp: 998 },
  XPDUSD: { entry: 985, stop: 978, tp: 998 },
  COPPER: { entry: 4.25, stop: 4.22, tp: 4.32 },
  COFFEE: { entry: 2.15, stop: 2.12, tp: 2.22 },
  SUGAR: { entry: 0.195, stop: 0.192, tp: 0.20 },
  CORN: { entry: 4.35, stop: 4.32, tp: 4.42 },
  WHEAT: { entry: 5.85, stop: 5.82, tp: 5.92 },
  SOYBEAN: { entry: 11.95, stop: 11.88, tp: 12.08 },
  HEATINGOIL: { entry: 2.65, stop: 2.62, tp: 2.72 },
  US2000: { entry: 2050, stop: 2045, tp: 2062 },
  VIX: { entry: 14.5, stop: 14.2, tp: 15.2 },
  CHINA50: { entry: 12500, stop: 12450, tp: 12600 },
  AAPL: { entry: 228, stop: 226, tp: 232 },
  MSFT: { entry: 415, stop: 412, tp: 420 },
  GOOGL: { entry: 175, stop: 173, tp: 178 },
  AMZN: { entry: 198, stop: 196, tp: 202 },
  META: { entry: 585, stop: 580, tp: 592 },
  TSLA: { entry: 385, stop: 380, tp: 395 },
  NVDA: { entry: 138, stop: 135, tp: 142 },
  JPM: { entry: 258, stop: 256, tp: 262 },
  ES: { entry: 5850, stop: 5840, tp: 5870 },
  NQ: { entry: 20450, stop: 20400, tp: 20550 },
  CL: { entry: 78.5, stop: 78.2, tp: 79.2 },
  GC: { entry: 2650, stop: 2642, tp: 2666 },
  SI: { entry: 32.5, stop: 32.3, tp: 32.9 },
  // Exotics & remaining forex
  USDSEK: { entry: 10.85, stop: 10.82, tp: 10.92 },
  USDNOK: { entry: 10.95, stop: 10.92, tp: 11.02 },
  USDDKK: { entry: 6.95, stop: 6.92, tp: 7.02 },
  USDTRY: { entry: 34.5, stop: 34.3, tp: 34.9 },
  USDZAR: { entry: 18.25, stop: 18.18, tp: 18.38 },
  USDMXN: { entry: 17.15, stop: 17.08, tp: 17.28 },
  USDPLN: { entry: 3.95, stop: 3.93, tp: 3.99 },
  USDHKD: { entry: 7.82, stop: 7.81, tp: 7.84 },
  USDSGD: { entry: 1.345, stop: 1.342, tp: 1.351 },
  EURSEK: { entry: 11.25, stop: 11.22, tp: 11.32 },
  EURNOK: { entry: 11.45, stop: 11.42, tp: 11.52 },
  EURTRY: { entry: 37.2, stop: 37.0, tp: 37.6 },
  // Commodities
  COTTON: { entry: 0.825, stop: 0.818, tp: 0.838 },
  COCOA: { entry: 4200, stop: 4170, tp: 4260 },
  RICE: { entry: 17.5, stop: 17.4, tp: 17.7 },
  OAT: { entry: 3.85, stop: 3.82, tp: 3.92 },
  // Energy
  GASOLINE: { entry: 2.45, stop: 2.42, tp: 2.52 },
  // Indices
  SPAIN35: { entry: 10950, stop: 10920, tp: 11000 },
  ITA40: { entry: 34200, stop: 34150, tp: 34350 },
  NETH25: { entry: 825, stop: 822, tp: 832 },
  SWI20: { entry: 11850, stop: 11820, tp: 11900 },
  // Stocks
  "BRK.A": { entry: 415000, stop: 414000, tp: 417000 },
  V: { entry: 285, stop: 283, tp: 289 },
  JNJ: { entry: 158, stop: 157, tp: 161 },
  WMT: { entry: 68.5, stop: 68.2, tp: 69.2 },
  PG: { entry: 168, stop: 167, tp: 170 },
  UNH: { entry: 585, stop: 580, tp: 592 },
  HD: { entry: 398, stop: 395, tp: 404 },
  DIS: { entry: 118, stop: 117, tp: 120 },
  BAC: { entry: 42.5, stop: 42.2, tp: 43.2 },
  ADBE: { entry: 585, stop: 580, tp: 592 },
  NFLX: { entry: 685, stop: 678, tp: 698 },
  CRM: { entry: 285, stop: 282, tp: 291 },
  PYPL: { entry: 72, stop: 71.5, tp: 73.5 },
  INTC: { entry: 42.5, stop: 42.2, tp: 43.2 },
  AMD: { entry: 185, stop: 183, tp: 189 },
  COIN: { entry: 285, stop: 282, tp: 291 },
  // Futures
  YM: { entry: 42000, stop: 41850, tp: 42350 },
  RTY: { entry: 2050, stop: 2045, tp: 2062 },
  NG: { entry: 2.85, stop: 2.82, tp: 2.91 },
  ZB: { entry: 118.5, stop: 118.2, tp: 119.0 },
  ZN: { entry: 112.25, stop: 112.1, tp: 112.5 },
  "6E": { entry: 1.085, stop: 1.083, tp: 1.09 },
  "6J": { entry: 0.665, stop: 0.663, tp: 0.669 },
  "6B": { entry: 1.265, stop: 1.263, tp: 1.27 },
  // Crypto
  AVAXUSD: { entry: 38.5, stop: 38.2, tp: 39.2 },
  DOTUSD: { entry: 7.25, stop: 7.18, tp: 7.38 },
  MATICUSD: { entry: 0.42, stop: 0.415, tp: 0.435 },
  LINKUSD: { entry: 15.5, stop: 15.3, tp: 15.9 },
  UNIUSD: { entry: 10.5, stop: 10.4, tp: 10.7 },
  ATOMUSD: { entry: 8.5, stop: 8.4, tp: 8.7 },
  BCHUSD: { entry: 485, stop: 480, tp: 495 },
  NEARUSD: { entry: 5.25, stop: 5.18, tp: 5.38 },
  APTUSD: { entry: 12.5, stop: 12.3, tp: 12.9 },
  ARBUSD: { entry: 0.95, stop: 0.94, tp: 0.98 },
  OPUSD: { entry: 2.25, stop: 2.22, tp: 2.31 },
  INJUSD: { entry: 28.5, stop: 28.2, tp: 29.2 },
  SUIUSD: { entry: 3.85, stop: 3.82, tp: 3.92 },
  SEIUSD: { entry: 0.52, stop: 0.515, tp: 0.535 },
  PEPEUSD: { entry: 0.0000125, stop: 0.0000122, tp: 0.000013 },
  SHIBUSD: { entry: 0.0000225, stop: 0.0000222, tp: 0.0000232 },
};

/** Always returns an example (explicit or fallback by asset class). */
export function getPriceExample(symbol: string): PriceExample {
  const upper = symbol.toUpperCase();
  const explicit = EXAMPLES[upper];
  if (explicit) return explicit;
  const meta = getAssetMetadata(symbol);
  return defaultExampleForClass(meta.assetClass);
}

/** Get placeholder string for input (e.g. "1.0850" or "42000"). */
export function getEntryPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  return ex ? String(ex.entry) : "";
}

export function getStopPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  return ex ? String(ex.stop) : "";
}

export function getTpPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  return ex ? String(ex.tp) : "";
}
