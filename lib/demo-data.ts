/**
 * Demo/fallback data so charts and tables render when database is empty.
 * Used for first-time users and demo mode.
 */

export const DEMO_EQUITY_CURVE = [
  { date: "Jan 1", equity: 10000 },
  { date: "Jan 5", equity: 10120 },
  { date: "Jan 10", equity: 9980 },
  { date: "Jan 15", equity: 10250 },
  { date: "Jan 20", equity: 10180 },
  { date: "Jan 25", equity: 10340 },
  { date: "Jan 31", equity: 10420 },
];

export const DEMO_PAIR_PNL = [
  { pair: "EURUSD", pnl: 420 },
  { pair: "GBPJPY", pnl: -120 },
  { pair: "XAUUSD", pnl: 280 },
  { pair: "US30", pnl: 150 },
  { pair: "BTCUSD", pnl: -80 },
];

export const DEMO_SESSION_PNL = [
  { session: "London", pnl: 320 },
  { session: "New York", pnl: 180 },
  { session: "Asian", pnl: -50 },
  { session: "London/NY Overlap", pnl: 210 },
];

export const DEMO_RECENT_TRADES = [
  { id: "demo-1", pair: "EURUSD", direction: "buy", result: "win", pnl: 85, created_at: new Date().toISOString() },
  { id: "demo-2", pair: "XAUUSD", direction: "sell", result: "loss", pnl: -42, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "demo-3", pair: "GBPJPY", direction: "buy", result: "win", pnl: 120, created_at: new Date(Date.now() - 172800000).toISOString() },
];

export function useDemoData<T>(data: T[] | null | undefined, demo: T[]): T[] {
  if (data == null) return demo;
  if (Array.isArray(data) && data.length === 0) return demo;
  return data;
}

export function useDemoKpis(kpis: { totalTrades: number; [k: string]: unknown }) {
  const isEmpty = kpis.totalTrades === 0;
  return {
    ...kpis,
    _demo: isEmpty,
  };
}
