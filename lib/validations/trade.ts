import { z } from "zod";

const MAX_RISK_PERCENT = 5;

export const tradeCalculatorSchema = z.object({
  pair: z.string().min(1, "Pair is required"),
  direction: z.enum(["buy", "sell"]),
  accountBalance: z.coerce.number().positive("Balance must be positive"),
  riskPercent: z.coerce
    .number()
    .min(0.01, "Risk must be greater than 0")
    .max(MAX_RISK_PERCENT, `Risk must be at most ${MAX_RISK_PERCENT}%`),
  entryPrice: z.coerce.number().positive("Entry must be positive"),
  stopLoss: z.coerce.number().positive("Stop loss must be positive"),
  takeProfit: z.coerce.number().positive("Take profit must be positive"),
  session: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.stopLoss !== data.entryPrice, {
  message: "Stop loss cannot equal entry",
  path: ["stopLoss"],
}).refine((data) => data.takeProfit !== data.entryPrice, {
  message: "Take profit cannot equal entry",
  path: ["takeProfit"],
});

export const tradeResultSchema = z.object({
  result: z.enum(["win", "loss", "breakeven"]),
  exitPrice: z.coerce.number().optional(),
  pnl: z.coerce.number().optional(),
});

export type TradeCalculatorForm = z.infer<typeof tradeCalculatorSchema>;
export type TradeResultForm = z.infer<typeof tradeResultSchema>;
