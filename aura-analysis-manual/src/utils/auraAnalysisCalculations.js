/**
 * Aura Analysis - calculation engine (pure helpers).
 * Supports forex (majors, JPY), metals, indices, crypto.
 * assets: array of { symbol, pip_multiplier, quote_type, pip_value_hint? }
 */

function getAssetMeta(symbol, assets = []) {
  const a = (assets || []).find((x) => (x.symbol || '').toUpperCase() === (symbol || '').toUpperCase());
  const mult = a?.pip_multiplier ?? getDefaultPipMultiplier(symbol);
  return {
    symbol: (symbol || '').toUpperCase(),
    pipMultiplier: Number(mult),
    pipValueHint: a?.pip_value_hint != null ? Number(a.pip_value_hint) : undefined,
    quoteType: a?.quote_type,
  };
}

const DEFAULTS = {
  EURUSD: 10000, GBPUSD: 10000, USDJPY: 100, USDCHF: 10000, USDCAD: 10000, AUDUSD: 10000, NZDUSD: 10000,
  EURGBP: 10000, EURJPY: 100, EURCHF: 10000, EURAUD: 10000, EURCAD: 10000, EURNZD: 10000,
  GBPJPY: 100, GBPCHF: 10000, GBPAUD: 10000, GBPCAD: 10000, GBPNZD: 10000,
  AUDJPY: 100, AUDCHF: 10000, AUDCAD: 10000, AUDNZD: 10000,
  NZDJPY: 100, NZDCHF: 10000, NZDCAD: 10000, CADJPY: 100, CADCHF: 10000, CHFJPY: 100,
  XAUUSD: 10, XAUEUR: 10, XAUGBP: 10, XAUAUD: 10, XAGUSD: 100,
  XTIUSD: 100, XBRUSD: 100, NATGAS: 100,
  US30: 1, NAS100: 1, SPX500: 1, GER40: 1, UK100: 1, FRA40: 1, EU50: 1, JP225: 1, HK50: 1, AUS200: 1,
  BTCUSD: 1, ETHUSD: 1, SOLUSD: 1,
};

function getDefaultPipMultiplier(symbol) {
  const s = (symbol || '').toUpperCase();
  if (DEFAULTS[s] != null) return DEFAULTS[s];
  if (s.includes('JPY')) return 100;
  if (s.includes('XAU')) return 10;
  if (s.includes('XAG')) return 100;
  if (['US30','NAS100','SPX500','GER40','UK100','FRA40','EU50','JP225','HK50','AUS200'].some((x) => s.includes(x))) return 1;
  if (['BTC','ETH','SOL'].some((x) => s.includes(x))) return 1;
  return 10000;
}

function getPipMultiplier(symbol, assets) {
  return getAssetMeta(symbol, assets).pipMultiplier;
}

function calcRiskAmount(balance, riskPercent) {
  if (!balance || !riskPercent || riskPercent <= 0) return 0;
  return (Number(balance) * Number(riskPercent)) / 100;
}

function calcStopLossDistance(entry, stop, symbol, assets) {
  const mult = getPipMultiplier(symbol, assets);
  return Math.abs(Number(entry) - Number(stop)) * mult;
}

function calcTakeProfitDistance(entry, tp, symbol, assets) {
  const mult = getPipMultiplier(symbol, assets);
  return Math.abs(Number(tp) - Number(entry)) * mult;
}

function calcRR(entry, stop, tp) {
  const risk = Math.abs(Number(entry) - Number(stop));
  if (risk === 0) return 0;
  return Math.abs(Number(tp) - Number(entry)) / risk;
}

function calcPositionSize({ balance, riskPercent, entry, stop, symbol, assets, pipValueOverride }) {
  const riskAmount = calcRiskAmount(balance, riskPercent);
  const slPips = calcStopLossDistance(entry, stop, symbol, assets);
  if (slPips <= 0) return 0;
  const meta = getAssetMeta(symbol, assets);
  let pipValue = pipValueOverride;
  if (pipValue == null && meta.pipValueHint != null) pipValue = meta.pipValueHint;
  if (pipValue == null) {
    pipValue = (symbol || '').toUpperCase().includes('JPY') ? 10 : 100000 / meta.pipMultiplier;
  }
  return Math.max(0, riskAmount / (slPips * pipValue));
}

function calcPotentialProfit(entry, tp, positionSize, symbol, assets) {
  const tpPips = calcTakeProfitDistance(entry, tp, symbol, assets);
  const meta = getAssetMeta(symbol, assets);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) pipValue = (symbol || '').toUpperCase().includes('JPY') ? 10 : 100000 / meta.pipMultiplier;
  return tpPips * pipValue * positionSize;
}

function calcPotentialLoss(entry, stop, positionSize, symbol, assets) {
  const slPips = calcStopLossDistance(entry, stop, symbol, assets);
  const meta = getAssetMeta(symbol, assets);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) pipValue = (symbol || '').toUpperCase().includes('JPY') ? 10 : 100000 / meta.pipMultiplier;
  return slPips * pipValue * positionSize;
}

function calcTradePnL(entry, exit, positionSize, direction, symbol, assets) {
  const diff = Number(exit) - Number(entry);
  const pips = (direction === 'buy' ? diff : -diff) * getPipMultiplier(symbol, assets);
  const meta = getAssetMeta(symbol, assets);
  let pipValue = meta.pipValueHint;
  if (pipValue == null) pipValue = (symbol || '').toUpperCase().includes('JPY') ? 10 : 100000 / meta.pipMultiplier;
  return pips * pipValue * positionSize;
}

function calcRMultiple(riskAmount, pnl) {
  if (!riskAmount || riskAmount <= 0) return 0;
  return Number(pnl) / Number(riskAmount);
}

function calcChecklistPercent(score, total) {
  if (!total || total <= 0) return 0;
  return Math.round((Number(score) / Number(total)) * 100);
}

function calcTradeGrade(percent) {
  const p = Number(percent);
  if (p >= 100) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 60) return 'B';
  return 'C';
}

/**
 * Consistency score 0-100: risk discipline, checklist quality, streak volatility, regularity.
 */
function calcConsistencyScore(trades) {
  if (!Array.isArray(trades) || trades.length < 2) return 0;
  const resolved = trades.filter((t) => t.result && t.result !== 'open');
  if (resolved.length < 2) return 0;
  let score = 50;
  const checklistPcts = resolved.map((t) => t.checklist_percent ?? 0).filter((p) => p > 0);
  if (checklistPcts.length > 0) {
    const avg = checklistPcts.reduce((a, b) => a + b, 0) / checklistPcts.length;
    score += (avg - 50) / 5;
  }
  const riskPcts = resolved.map((t) => t.risk_percent ?? 0).filter((r) => r > 0);
  if (riskPcts.length > 0) {
    const avgRisk = riskPcts.reduce((a, b) => a + b, 0) / riskPcts.length;
    if (avgRisk <= 2) score += 10;
    else if (avgRisk <= 3) score += 5;
  }
  const rMults = resolved.map((t) => t.r_multiple ?? 0);
  const mean = rMults.reduce((a, b) => a + b, 0) / rMults.length;
  const variance = rMults.reduce((a, r) => a + (r - mean) ** 2, 0) / rMults.length;
  if (variance < 2) score += 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
  getAssetMeta,
  getPipMultiplier,
  calcRiskAmount,
  calcStopLossDistance,
  calcTakeProfitDistance,
  calcRR,
  calcPositionSize,
  calcPotentialProfit,
  calcPotentialLoss,
  calcTradePnL,
  calcRMultiple,
  calcChecklistPercent,
  calcTradeGrade,
  calcConsistencyScore,
};
