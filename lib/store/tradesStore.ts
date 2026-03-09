import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trade } from "@/types";

interface TradesStore {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  removeTrade: (id: string) => void;
  clearTrades: () => void;
}

export const useTradesStore = create<TradesStore>()(
  persist(
    (set) => ({
      trades: [],
      setTrades: (trades) => set({ trades }),
      addTrade: (trade) =>
        set((state) => ({ trades: [trade, ...state.trades] })),
      updateTrade: (trade) =>
        set((state) => ({
          trades: state.trades.map((t) => (t.id === trade.id ? trade : t)),
        })),
      removeTrade: (id) =>
        set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),
      clearTrades: () => set({ trades: [] }),
    }),
    {
      name: "aura-analysis-trades", // Single source of truth key in localStorage
    }
  )
);
