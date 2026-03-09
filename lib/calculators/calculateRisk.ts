/**
 * Main dispatcher: select calculator by instrument calculationMode and return normalized result.
 */

import { getInstrumentOrFallback } from "@/lib/instruments";
import type { CalculatorInput, CalculatorResult } from "./types";
import { calculateForex } from "./forexCalculator";
import { calculateCommodity } from "./commodityCalculator";
import { calculateIndexCfd } from "./indexCalculator";
import { calculateStockShare } from "./stockCalculator";
import { calculateFutureContract } from "./futuresCalculator";
import { calculateCryptoUnits } from "./cryptoCalculator";

export type { CalculatorInput, CalculatorResult } from "./types";
export {
  getClosedTradeResult,
  calcRMultiple,
  calcClosedTradePnL,
  calcClosedTradePnLAndR,
} from "./closedTradePnL";

export function validateInput(input: CalculatorInput): string[] {
  const errors: string[] = [];
  if (input.accountBalance <= 0) errors.push("Account balance must be greater than 0.");
  if (input.riskPercent <= 0) errors.push("Risk % must be greater than 0.");
  if (input.entry === input.stop) errors.push("Entry must not equal stop.");
  if (input.takeProfit === input.entry) errors.push("Take profit must not equal entry.");
  if (input.direction === "buy") {
    if (input.stop >= input.entry) errors.push("For BUY, stop must be below entry.");
    if (input.takeProfit <= input.entry) errors.push("For BUY, take profit must be above entry.");
  } else {
    if (input.stop <= input.entry) errors.push("For SELL, stop must be above entry.");
    if (input.takeProfit >= input.entry) errors.push("For SELL, take profit must be below entry.");
  }
  return errors;
}

export function calculateRisk(symbol: string, input: CalculatorInput): CalculatorResult {
  const spec = getInstrumentOrFallback(symbol);
  const mode = spec.calculationMode;

  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    return {
      riskAmount: (input.accountBalance * input.riskPercent) / 100,
      stopDistancePrice: Math.abs(input.entry - input.stop),
      takeProfitDistancePrice: Math.abs(input.takeProfit - input.entry),
      riskReward:
        Math.abs(input.entry - input.stop) > 0
          ? Math.abs(input.takeProfit - input.entry) / Math.abs(input.entry - input.stop)
          : 0,
      positionSize: 0,
      positionUnitLabel: "lots",
      potentialProfit: 0,
      potentialLoss: (input.accountBalance * input.riskPercent) / 100,
      rMultiple: 0,
      warnings: validationErrors,
    };
  }

  switch (mode) {
    case "forex":
      return calculateForex(input, spec);
    case "commodity":
      return calculateCommodity(input, spec);
    case "index_cfd":
      return calculateIndexCfd(input, spec);
    case "stock_share":
      return calculateStockShare(input, spec);
    case "future_contract":
      return calculateFutureContract(input, spec);
    case "crypto_units":
    case "crypto_lot":
      return calculateCryptoUnits(input, spec);
    default:
      return calculateForex(input, spec);
  }
}
