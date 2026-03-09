import type { InstrumentSpec } from "@/lib/instruments";
import type { CalculatorInput, CalculatorResult } from "./types";
import { roundToStep } from "./utils";

export function calculateForex(input: CalculatorInput, spec: InstrumentSpec): CalculatorResult {
  const warnings: string[] = [];
  const riskAmount = (input.accountBalance * input.riskPercent) / 100;
  const stopDistancePrice = Math.abs(input.entry - input.stop);
  const takeProfitDistancePrice = Math.abs(input.takeProfit - input.entry);
  if (stopDistancePrice === 0) {
    return buildNoRiskResult(input.accountBalance, input.riskPercent, "Stop equals entry");
  }
  const riskReward = takeProfitDistancePrice / stopDistancePrice;
  const pipSize = spec.pipSize ?? 0.0001;
  const stopPips = stopDistancePrice / pipSize;
  const takeProfitPips = takeProfitDistancePrice / pipSize;

  let pipValuePerLot: number;
  if (spec.quoteCurrency === "USD") {
    pipValuePerLot = (spec.contractSize ?? 100_000) * pipSize;
  } else if (spec.quoteCurrency === "JPY") {
    pipValuePerLot = (spec.contractSize ?? 100_000) * pipSize;
    pipValuePerLot = pipValuePerLot / input.entry;
  } else {
    pipValuePerLot = (spec.contractSize ?? 100_000) * pipSize;
  }

  const positionSizeLots = riskAmount / (stopPips * pipValuePerLot);
  const lotStep = spec.lotStep ?? 0.01;
  const positionSize = Math.max(0, roundToStep(positionSizeLots, lotStep));

  const potentialLoss = positionSize * pipValuePerLot * stopPips;
  const potentialProfit = positionSize * pipValuePerLot * takeProfitPips;
  const rMultiple = riskReward;

  if (spec.minLot != null && positionSize > 0 && positionSize < spec.minLot) {
    warnings.push(`Position size ${positionSize} is below minimum ${spec.minLot} lots.`);
  }
  if (spec.maxLot != null && positionSize > spec.maxLot) {
    warnings.push(`Position size ${positionSize} exceeds maximum ${spec.maxLot} lots.`);
  }

  return {
    riskAmount,
    stopDistancePrice,
    takeProfitDistancePrice,
    stopDistanceAlt: Math.round(stopPips * 100) / 100,
    takeProfitDistanceAlt: Math.round(takeProfitPips * 100) / 100,
    altUnitLabel: "pips",
    riskReward,
    positionSize,
    positionUnitLabel: "lots",
    potentialProfit,
    potentialLoss,
    rMultiple,
    warnings,
  };
}

function buildNoRiskResult(
  balance: number,
  riskPercent: number,
  reason: string
): CalculatorResult {
  const riskAmount = (balance * riskPercent) / 100;
  return {
    riskAmount,
    stopDistancePrice: 0,
    takeProfitDistancePrice: 0,
    riskReward: 0,
    positionSize: 0,
    positionUnitLabel: "lots",
    potentialProfit: 0,
    potentialLoss: riskAmount,
    rMultiple: 0,
    warnings: [reason],
  };
}
