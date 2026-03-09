/**
 * Strict validation for trade calculator inputs.
 * Rejects invalid price scales and structure so no nonsense PnL is shown.
 */

import { getInstrumentOrFallback } from "@/lib/instruments";

export interface TradeInputToValidate {
  accountBalance: number;
  riskPercent?: number;
  positionSize?: number;
  entry: number;
  stop: number;
  takeProfit: number;
  direction: "buy" | "sell";
  symbol: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTradeInput(input: TradeInputToValidate): ValidationResult {
  const errors: string[] = [];
  const {
    accountBalance,
    entry,
    stop,
    takeProfit,
    direction,
    symbol,
    positionSize,
  } = input;

  if (accountBalance <= 0) {
    errors.push("Account balance must be greater than 0.");
  }

  if (entry <= 0) {
    errors.push("Entry must be positive.");
  }
  if (stop <= 0) {
    errors.push("Stop loss must be positive.");
  }
  if (takeProfit <= 0) {
    errors.push("Take profit must be positive.");
  }

  if (entry === stop) {
    errors.push("Stop loss cannot equal entry.");
  }
  if (entry === takeProfit) {
    errors.push("Take profit cannot equal entry.");
  }

  if (direction === "buy") {
    if (stop >= entry) {
      errors.push("For BUY, stop loss must be below entry.");
    }
    if (takeProfit <= entry) {
      errors.push("For BUY, take profit must be above entry.");
    }
  } else {
    if (stop <= entry) {
      errors.push("For SELL, stop loss must be above entry.");
    }
    if (takeProfit >= entry) {
      errors.push("For SELL, take profit must be below entry.");
    }
  }

  if (positionSize != null && positionSize < 0) {
    errors.push("Position size cannot be negative.");
  }

  const spec = getInstrumentOrFallback(symbol);
  const minP = spec.minReasonablePrice;
  const maxP = spec.maxReasonablePrice;
  if (minP != null || maxP != null) {
    const check = (price: number, label: string) => {
      if (minP != null && price < minP) {
        errors.push(
          `Invalid price for ${spec.displayName}. ${label} ${price} is below the reasonable range (e.g. ${minP}–${maxP ?? "max"}). Use a valid ${spec.assetClass} price.`
        );
      }
      if (maxP != null && price > maxP) {
        errors.push(
          `Invalid price for ${spec.displayName}. ${label} ${price} is above the reasonable range (e.g. ${minP ?? "min"}–${maxP}). Use a valid ${spec.assetClass} price.`
        );
      }
    };
    check(entry, "Entry");
    check(stop, "Stop loss");
    check(takeProfit, "Take profit");
  }

  if (spec.wholeContractsOnly && positionSize != null && positionSize > 0) {
    const isInteger = Math.abs(positionSize - Math.round(positionSize)) < 1e-9;
    if (!isInteger) {
      errors.push(`${spec.displayName} requires whole contracts only. Use an integer position size.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
