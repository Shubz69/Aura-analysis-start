/**
 * Shared types for the instrument-aware risk calculator.
 */

export type PositionUnitLabel = "lots" | "shares" | "contracts" | "units";

export type AltUnitLabel = "pips" | "points" | "ticks";

export interface CalculatorInput {
  accountBalance: number;
  riskPercent: number;
  entry: number;
  stop: number;
  takeProfit: number;
  direction: "buy" | "sell";
}

export interface CalculatorResult {
  riskAmount: number;
  stopDistancePrice: number;
  takeProfitDistancePrice: number;
  stopDistanceAlt?: number;
  takeProfitDistanceAlt?: number;
  altUnitLabel?: AltUnitLabel;
  riskReward: number;
  positionSize: number;
  positionUnitLabel: PositionUnitLabel;
  potentialProfit: number;
  potentialLoss: number;
  rMultiple: number;
  warnings: string[];
}
