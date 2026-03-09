/**
 * Closed-trade PnL and R-multiple using the instrument-based calculator engine.
 * Single source of truth for realized PnL when a trade is closed.
 */

import { getInstrumentOrFallback } from "@/lib/instruments";

export function getClosedTradeResult(
  entry: number,
  exit: number,
  direction: "buy" | "sell"
): "win" | "loss" | "breakeven" {
  if (exit === entry) return "breakeven";
  if (direction === "buy") return exit > entry ? "win" : "loss";
  return exit < entry ? "win" : "loss";
}

export function calcRMultiple(riskAmount: number, pnl: number): number {
  if (riskAmount <= 0) return 0;
  return pnl / riskAmount;
}

/**
 * Realized PnL for a closed trade using instrument metadata (same formulas as risk calculator).
 */
export function calcClosedTradePnL(
  symbol: string,
  entry: number,
  exit: number,
  positionSize: number,
  direction: "buy" | "sell"
): number {
  if (positionSize <= 0) return 0;
  const spec = getInstrumentOrFallback(symbol);
  const priceDiff = direction === "buy" ? exit - entry : entry - exit;
  const mode = spec.calculationMode;

  switch (mode) {
    case "forex": {
      const pipSize = spec.pipSize ?? 0.0001;
      const pips = priceDiff / pipSize;
      let pipValuePerLot: number;
      if (spec.quoteCurrency === "JPY") {
        pipValuePerLot = (spec.contractSize ?? 100_000) * pipSize / entry;
      } else {
        pipValuePerLot = (spec.contractSize ?? 100_000) * pipSize;
      }
      return pips * pipValuePerLot * positionSize;
    }
    case "commodity": {
      const contractSize = spec.contractSize ?? 100;
      return priceDiff * contractSize * positionSize;
    }
    case "index_cfd": {
      const pointSize = spec.pointSize ?? 1;
      const valuePerPoint = spec.valuePerPointPerLot ?? 1;
      const points = priceDiff / pointSize;
      return points * valuePerPoint * positionSize;
    }
    case "stock_share":
      return priceDiff * positionSize;
    case "future_contract": {
      const tickSize = spec.tickSize > 0 ? spec.tickSize : 0.25;
      const tickValue = spec.tickValuePerLot ?? 10;
      const ticks = priceDiff / tickSize;
      return ticks * tickValue * positionSize;
    }
    case "crypto_units":
    case "crypto_lot":
      return priceDiff * positionSize;
    default:
      return priceDiff * (spec.contractSize ?? 100_000) * (spec.pipSize ?? 0.0001) * positionSize;
  }
}

export function calcClosedTradePnLAndR(
  entry: number,
  exit: number,
  positionSize: number,
  riskAmount: number,
  direction: "buy" | "sell",
  symbol: string
): { pnl: number; rMultiple: number; result: "win" | "loss" | "breakeven" } {
  const pnl = calcClosedTradePnL(symbol, entry, exit, positionSize, direction);
  const rMultiple = calcRMultiple(riskAmount, pnl);
  const result = getClosedTradeResult(entry, exit, direction);
  return { pnl, rMultiple, result };
}
