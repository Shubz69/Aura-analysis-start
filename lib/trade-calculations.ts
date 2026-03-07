/**
 * Trade calculation engine for Aura Analysis.
 * Supports forex (majors, JPY pairs), metals, indices, crypto.
 * Uses configurable asset metadata when provided; falls back to built-in defaults.
 */

export interface AssetMeta {
  symbol: string;
  pipMultiplier: number;
  pipValueHint?: number;
  contractSizeHint?: number;
  quoteType?: string;
  assetClass?: string;
}

const DEFAULT_PIP_MULTIPLIERS: Record<string, number> = {
  EURUSD: 10000,
  GBPUSD: 10000,
  USDJPY: 100,
  USDCHF: 10000,
  USDCAD: 10000,
  AUDUSD: 10000,
  NZDUSD: 10000,
  EURGBP: 10000,
  EURJPY: 100,
  EURCHF: 10000,
  EURAUD: 10000,
  EURCAD: 10000,
  EURNZD: 10000,
  GBPJPY: 100,
  GBPCHF: 10000,
  GBPAUD: 10000,
  GBPCAD: 10000,
  GBPNZD: 10000,
  AUDJPY: 100,
  AUDCHF: 10000,
  AUDCAD: 10000,
  AUDNZD: 10000,
  NZDJPY: 100,
  NZDCHF: 10000,
  NZDCAD: 10000,
  CADJPY: 100,
  CADCHF: 10000,
  CHFJPY: 100,
  XAUUSD: 10,
  XAUEUR: 10,
  XAUGBP: 10,
  XAUAUD: 10,
  XAGUSD: 100,
  XTIUSD: 100,
  XBRUSD: 100,
  NATGAS: 100,
  US30: 1,
  NAS100: 1,
  SPX500: 1,
  GER40: 1,
  UK100: 1,
  FRA40: 1,
  EU50: 1,
  JP225: 1,
  HK50: 1,
  AUS200: 1,
  BTCUSD: 1,
  ETHUSD: 1,
  SOLUSD: 1,
};

function getDefaultPipMultiplier(symbol: string): number {
  const upper = symbol.toUpperCase();
  if (DEFAULT_PIP_MULTIPLIERS[upper] !== undefined) return DEFAULT_PIP_MULTIPLIERS[upper];
  if (upper.includes("JPY")) return 100;
  if (upper.includes("XAU") || upper.includes("GOLD")) return 10;
  if (upper.includes("XAG")) return 100;
  if (["US30", "NAS100", "SPX500", "GER40", "UK100", "FRA40", "EU50", "JP225", "HK50", "AUS200"].some((s) => upper.includes(s))) return 1;
  if (["BTC", "ETH", "SOL"].some((s) => upper.includes(s))) return 1;
  return 10000;
}

export function getAssetMeta(symbol: string, registryMeta?: { pip_multiplier: number; pip_value_hint?: number | null; contract_size_hint?: number | null }): AssetMeta {
  const pipMultiplier = registryMeta?.pip_multiplier ?? getDefaultPipMultiplier(symbol);
  return {
    symbol: symbol.toUpperCase(),
    pipMultiplier,
    pipValueHint: registryMeta?.pip_value_hint ?? undefined,
    contractSizeHint: registryMeta?.contract_size_hint ?? undefined,
  };
}

export function getPipMultiplier(symbol: string, registryMeta?: { pip_multiplier: number }): number {
  return registryMeta?.pip_multiplier ?? getDefaultPipMultiplier(symbol);
}

export function calcRiskAmount(balance: number, riskPercent: number): number {
  if (balance <= 0 || riskPercent <= 0) return 0;
  return (balance * riskPercent) / 100;
}

export function calcStopLossDistance(entry: number, stop: number, symbol: string, registryMeta?: { pip_multiplier: number }): number {
  const mult = getPipMultiplier(symbol, registryMeta);
  return Math.abs(entry - stop) * mult;
}

export function calcTakeProfitDistance(entry: number, tp: number, symbol: string, registryMeta?: { pip_multiplier: number }): number {
  const mult = getPipMultiplier(symbol, registryMeta);
  return Math.abs(tp - entry) * mult;
}

export function calcRR(entry: number, stop: number, tp: number): number {
  const riskDist = Math.abs(entry - stop);
  if (riskDist === 0) return 0;
  const rewardDist = Math.abs(tp - entry);
  return rewardDist / riskDist;
}

export interface PositionSizeParams {
  balance: number;
  riskPercent: number;
  entry: number;
  stop: number;
  symbol: string;
  pipValueOverride?: number;
  registryMeta?: { pip_multiplier: number; pip_value_hint?: number | null; contract_size_hint?: number | null };
}

export function calcPositionSize(params: PositionSizeParams): number {
  const { balance, riskPercent, entry, stop, symbol, pipValueOverride, registryMeta } = params;
  const riskAmount = calcRiskAmount(balance, riskPercent);
  const slPips = calcStopLossDistance(entry, stop, symbol, registryMeta);
  if (slPips <= 0) return 0;
  const meta = getAssetMeta(symbol, registryMeta);
  let pipValue = pipValueOverride;
  if (pipValue == null && meta.pipValueHint != null) pipValue = meta.pipValueHint;
  if (pipValue == null) {
    const mult = meta.pipMultiplier;
    if (symbol.toUpperCase().includes("JPY") || meta.quoteType === "JPY") {
      pipValue = 10;
    } else {
      pipValue = 100000 / mult;
    }
  }
  const positionSize = riskAmount / (slPips * pipValue);
  return Math.max(0, positionSize);
}

export function calcPotentialProfit(entry: number, tp: number, positionSize: number, symbol: string, registryMeta?: { pip_multiplier: number }): number {
  const tpPips = calcTakeProfitDistance(entry, tp, symbol, registryMeta);
  const meta = getAssetMeta(symbol, registryMeta);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) {
    pipValue = symbol.toUpperCase().includes("JPY") ? 10 : 100000 / meta.pipMultiplier;
  }
  return tpPips * pipValue * positionSize;
}

export function calcPotentialLoss(entry: number, stop: number, positionSize: number, symbol: string, registryMeta?: { pip_multiplier: number }): number {
  const slPips = calcStopLossDistance(entry, stop, symbol, registryMeta);
  const meta = getAssetMeta(symbol, registryMeta);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) {
    pipValue = symbol.toUpperCase().includes("JPY") ? 10 : 100000 / meta.pipMultiplier;
  }
  return slPips * pipValue * positionSize;
}

export function calcTradePnL(entry: number, exit: number, positionSize: number, direction: "buy" | "sell", symbol: string, registryMeta?: { pip_multiplier: number }): number {
  const diff = exit - entry;
  const pips = (direction === "buy" ? diff : -diff) * getPipMultiplier(symbol, registryMeta);
  const meta = getAssetMeta(symbol, registryMeta);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) {
    pipValue = symbol.toUpperCase().includes("JPY") ? 10 : 100000 / meta.pipMultiplier;
  }
  return pips * pipValue * positionSize;
}

export function calcRMultiple(riskAmount: number, pnl: number): number {
  if (riskAmount <= 0) return 0;
  return pnl / riskAmount;
}

export function calcChecklistPercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function calcTradeGrade(percent: number): string {
  if (percent >= 100) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 60) return "B";
  return "C";
}

export interface TradeForConsistency {
  result: string;
  r_multiple?: number;
  risk_percent?: number;
  checklist_percent?: number;
  created_at?: string;
}

/**
 * Consistency score: combines trade frequency consistency, checklist quality,
 * risk discipline, and streak volatility. 0-100 scale.
 */
export function calcConsistencyScore(trades: TradeForConsistency[]): number {
  if (trades.length < 2) return 0;
  const resolved = trades.filter((t) => t.result && t.result !== "open");
  if (resolved.length < 2) return 0;

  let score = 50;
  const checklistPcts = resolved.map((t) => t.checklist_percent ?? 0).filter((p) => p > 0);
  if (checklistPcts.length > 0) {
    const avgChecklist = checklistPcts.reduce((a, b) => a + b, 0) / checklistPcts.length;
    score += (avgChecklist - 50) / 5;
  }
  const riskPcts = resolved.map((t) => t.risk_percent ?? 0).filter((r) => r > 0);
  if (riskPcts.length > 0) {
    const avgRisk = riskPcts.reduce((a, b) => a + b, 0) / riskPcts.length;
    if (avgRisk <= 2) score += 10;
    else if (avgRisk <= 3) score += 5;
  }
  const rMults = resolved.map((t) => t.r_multiple ?? 0);
  const vol = rMults.reduce((a, b) => a + b * b, 0) / rMults.length - Math.pow(rMults.reduce((a, b) => a + b, 0) / rMults.length, 2);
  if (vol < 2) score += 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}
