/**
 * Fixed-size trade calculator: PnL and metrics from a fixed position size.
 * Changing SL only affects loss; changing TP only affects profit.
 */

import { getInstrumentOrFallback } from "@/lib/instruments";
import { calcClosedTradePnL } from "./closedTradePnL";
import { calculateRisk } from "./calculateRisk";
import { validateTradeInput } from "./validateTradeInput";
import type { CalculatorResult } from "./types";
import type { InstrumentSpec } from "@/lib/instruments";

export interface FixedSizeInput {
  accountBalance: number;
  entry: number;
  stop: number;
  takeProfit: number;
  positionSize: number;
  direction: "buy" | "sell";
}

/**
 * Returns suggested position size from risk % (for "Suggest size from risk %" button).
 * Does not change when SL/TP change after use; user applies it once.
 */
export function suggestPositionSize(
  symbol: string,
  input: {
    accountBalance: number;
    riskPercent: number;
    entry: number;
    stop: number;
    takeProfit: number;
    direction: "buy" | "sell";
  }
): { suggestedPositionSize: number; positionUnitLabel: CalculatorResult["positionUnitLabel"] } {
  const result = calculateRisk(symbol, {
    accountBalance: input.accountBalance,
    riskPercent: input.riskPercent,
    entry: input.entry,
    stop: input.stop,
    takeProfit: input.takeProfit,
    direction: input.direction,
  });
  const spec = getInstrumentOrFallback(symbol);
  return {
    suggestedPositionSize: result.positionSize,
    positionUnitLabel: result.positionUnitLabel ?? getPositionUnitLabel(spec),
  };
}

/**
 * All PnL and risk metrics from a fixed position size (real placed-trade behaviour).
 * - Position size is never recalculated; it is the single source of truth.
 * - Changing stop only affects potential loss.
 * - Changing take profit only affects potential profit.
 */
export function calculateFromFixedSize(
  symbol: string,
  input: FixedSizeInput
): CalculatorResult {
  const spec = getInstrumentOrFallback(symbol);
  const validation = validateTradeInput({
    symbol,
    accountBalance: input.accountBalance,
    entry: input.entry,
    stop: input.stop,
    takeProfit: input.takeProfit,
    direction: input.direction,
    positionSize: input.positionSize,
  });
  if (!validation.valid) {
    const stopDistancePrice = Math.abs(input.entry - input.stop);
    const takeProfitDistancePrice = Math.abs(input.takeProfit - input.entry);
    return {
      riskAmount: 0,
      stopDistancePrice,
      takeProfitDistancePrice,
      stopDistanceAlt: undefined,
      takeProfitDistanceAlt: undefined,
      altUnitLabel: getAltUnitLabel(spec),
      riskReward: stopDistancePrice > 0 ? takeProfitDistancePrice / stopDistancePrice : 0,
      positionSize: input.positionSize <= 0 ? 0 : input.positionSize,
      positionUnitLabel: getPositionUnitLabel(spec),
      potentialProfit: 0,
      potentialLoss: 0,
      rMultiple: 0,
      warnings: validation.errors,
    };
  }

  const warnings: string[] = [];
  const stopDistancePrice = Math.abs(input.entry - input.stop);
  const takeProfitDistancePrice = Math.abs(input.takeProfit - input.entry);

  if (input.positionSize <= 0) {
    return {
      riskAmount: 0,
      stopDistancePrice,
      takeProfitDistancePrice,
      stopDistanceAlt: stopDistancePrice ? getStopDistanceAlt(spec, stopDistancePrice) : undefined,
      takeProfitDistanceAlt: takeProfitDistancePrice ? getTakeProfitDistanceAlt(spec, takeProfitDistancePrice) : undefined,
      altUnitLabel: getAltUnitLabel(spec),
      riskReward: stopDistancePrice > 0 ? takeProfitDistancePrice / stopDistancePrice : 0,
      positionSize: 0,
      positionUnitLabel: getPositionUnitLabel(spec),
      potentialProfit: 0,
      potentialLoss: 0,
      rMultiple: 0,
      warnings: ["Position size must be greater than 0."],
    };
  }

  const potentialProfit = calcClosedTradePnL(
    symbol,
    input.entry,
    input.takeProfit,
    input.positionSize,
    input.direction
  );
  const potentialLoss = Math.abs(
    calcClosedTradePnL(symbol, input.entry, input.stop, input.positionSize, input.direction)
  );

  const actualRiskAmount = potentialLoss;
  const actualRiskPercent =
    input.accountBalance > 0 ? (actualRiskAmount / input.accountBalance) * 100 : 0;
  const riskReward =
    stopDistancePrice > 0 ? takeProfitDistancePrice / stopDistancePrice : 0;
  const rMultiple = actualRiskAmount > 0 ? potentialProfit / actualRiskAmount : riskReward;

  // Sanity warnings (informational; do not block)
  if (spec.calculationMode === "forex" && spec.pipSize) {
    const takeProfitPips = takeProfitDistancePrice / spec.pipSize;
    if (takeProfitPips > 500) {
      warnings.push("Warning: Extremely large take profit distance for a forex trade.");
    }
  }
  if (riskReward > 20) {
    warnings.push("Warning: Extremely high risk:reward. Please verify your prices.");
  }
  if (actualRiskPercent > 5 && actualRiskPercent < 10) {
    warnings.push("Warning: Risk is above 5% of account.");
  }
  if (actualRiskPercent >= 10) {
    warnings.push("Warning: Risk is 10% or more of account. Please verify.");
  }

  return {
    riskAmount: actualRiskAmount,
    stopDistancePrice,
    takeProfitDistancePrice,
    stopDistanceAlt: stopDistancePrice ? getStopDistanceAlt(spec, stopDistancePrice) : undefined,
    takeProfitDistanceAlt: takeProfitDistancePrice ? getTakeProfitDistanceAlt(spec, takeProfitDistancePrice) : undefined,
    altUnitLabel: getAltUnitLabel(spec),
    riskReward,
    positionSize: input.positionSize,
    positionUnitLabel: getPositionUnitLabel(spec),
    potentialProfit,
    potentialLoss,
    rMultiple,
    warnings,
  };
}

function getPositionUnitLabel(spec: InstrumentSpec): CalculatorResult["positionUnitLabel"] {
  switch (spec.calculationMode) {
    case "stock_share":
      return "shares";
    case "future_contract":
      return "contracts";
    case "crypto_units":
    case "crypto_lot":
      return "units";
    default:
      return "lots";
  }
}

function getAltUnitLabel(spec: InstrumentSpec): "pips" | "points" | "ticks" | undefined {
  switch (spec.calculationMode) {
    case "forex":
      return "pips";
    case "commodity":
    case "index_cfd":
      return "points";
    case "future_contract":
      return "ticks";
    default:
      return undefined;
  }
}

function getStopDistanceAlt(spec: InstrumentSpec, stopDistancePrice: number): number {
  const mode = spec.calculationMode;
  if (mode === "forex" && spec.pipSize) return stopDistancePrice / spec.pipSize;
  if ((mode === "commodity" || mode === "index_cfd") && spec.pointSize) return stopDistancePrice / spec.pointSize;
  if (mode === "future_contract" && spec.tickSize) return stopDistancePrice / spec.tickSize;
  return stopDistancePrice;
}

function getTakeProfitDistanceAlt(spec: InstrumentSpec, takeProfitDistancePrice: number): number {
  const mode = spec.calculationMode;
  if (mode === "forex" && spec.pipSize) return takeProfitDistancePrice / spec.pipSize;
  if ((mode === "commodity" || mode === "index_cfd") && spec.pointSize) return takeProfitDistancePrice / spec.pointSize;
  if (mode === "future_contract" && spec.tickSize) return takeProfitDistancePrice / spec.tickSize;
  return takeProfitDistancePrice;
}
