/**
 * Example / placeholder prices per symbol for the trade calculator.
 * Used for placeholder text and helper examples (entry, SL, TP).
 */

export interface PriceExample {
  entry: number;
  stop: number;
  tp: number;
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
};

export function getPriceExample(symbol: string): PriceExample | null {
  return EXAMPLES[symbol.toUpperCase()] ?? null;
}

/** Get placeholder string for input (e.g. "1.0850" or "42000"). */
export function getEntryPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  if (ex) return String(ex.entry);
  return "";
}

export function getStopPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  if (ex) return String(ex.stop);
  return "";
}

export function getTpPlaceholder(symbol: string): string {
  const ex = getPriceExample(symbol);
  if (ex) return String(ex.tp);
  return "";
}
