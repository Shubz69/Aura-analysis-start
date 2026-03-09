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
      setTrades: (trades) => {
        // deduplicate IDs in case they got mangled
        const seen = new Set<string>();
        const unique = trades.map(t => {
          let id = t.id;
          if (seen.has(id)) {
            id = `${id}-dup-${Math.random().toString(36).substring(2, 7)}`;
          }
          seen.add(id);
          return { ...t, id };
        });
        set({ trades: unique });
      },
      addTrade: (trade) =>
        set((state) => {
          let id = trade.id;
          if (state.trades.some(t => t.id === id)) {
            id = `${id}-dup-${Math.random().toString(36).substring(2, 7)}`;
          }
          return { trades: [{ ...trade, id }, ...state.trades] };
        }),
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
