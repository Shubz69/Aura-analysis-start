import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ValidatorData {
  score: number;
  status: string;
  checklistState: Record<string, boolean>;
  sectionScores: Record<string, number>;
  notes?: string;
  completedAt: string;
}

export interface CalculatorDraftData {
  accountBalance?: number;
  riskPercent?: number;
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  session?: string;
  notes?: string;
}

export interface DraftTrade {
  symbol?: string;
  direction?: "buy" | "sell";
  validator?: ValidatorData;
  calculator?: CalculatorDraftData;
}

interface DraftTradeStore {
  draft: DraftTrade | null;
  createDraftFromValidator: (symbol: string, direction: "buy" | "sell" | undefined, validatorData: ValidatorData) => void;
  updateDraftCalculator: (calculatorData: CalculatorDraftData) => void;
  updateDraftSymbolAndDirection: (symbol: string, direction: "buy" | "sell") => void;
  clearDraftTrade: () => void;
}

export const useDraftTradeStore = create<DraftTradeStore>()(
  persist(
    (set) => ({
      draft: null,

      createDraftFromValidator: (symbol, direction, validatorData) =>
        set((state) => ({
          draft: {
            ...state.draft,
            symbol: symbol || state.draft?.symbol,
            direction: direction || state.draft?.direction,
            validator: validatorData,
          },
        })),

      updateDraftCalculator: (calculatorData) =>
        set((state) => ({
          draft: state.draft
            ? { ...state.draft, calculator: { ...state.draft.calculator, ...calculatorData } }
            : { calculator: calculatorData },
        })),
        
      updateDraftSymbolAndDirection: (symbol, direction) =>
        set((state) => ({
          draft: state.draft
            ? { ...state.draft, symbol, direction }
            : { symbol, direction },
        })),

      clearDraftTrade: () => set({ draft: null }),
    }),
    {
      name: "aura-draft-trade",
    }
  )
);
