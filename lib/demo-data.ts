/**
 * Demo/fallback data so charts and tables render when database is empty.
 * Used for first-time users, demo mode, and temporary test mode (BYPASS_AUTH).
 */
import type { Trade } from "@/types";

/** Full Trade-shaped demo list for journal, overview, analytics, leaderboard when no DB or test mode. */
export const DEMO_TRADES: Trade[] = (() => {
  const base = 10000;
  const now = Date.now();
  const day = 86400000;
  const trades: Trade[] = [
    { id: "demo-1", user_id: "1", pair: "EURUSD", asset_id: null, asset_class: "forex", direction: "buy", session: "London", account_balance: base, risk_percent: 1, risk_amount: 100, entry_price: 1.0850, stop_loss: 1.0820, take_profit: 1.0910, stop_loss_pips: 30, take_profit_pips: 60, rr: 2, position_size: 0.33, potential_profit: 200, potential_loss: 100, result: "win", pnl: 198, r_multiple: 1.98, checklist_score: 8, checklist_total: 10, checklist_percent: 80, trade_grade: "B", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 1 * day).toISOString() },
    { id: "demo-2", user_id: "1", pair: "XAUUSD", asset_id: null, asset_class: "metals", direction: "sell", session: "New York", account_balance: base + 198, risk_percent: 1, risk_amount: 101.98, entry_price: 2650, stop_loss: 2658, take_profit: 2634, stop_loss_pips: 80, take_profit_pips: 160, rr: 2, position_size: 0.13, potential_profit: 208, potential_loss: 104, result: "loss", pnl: -104, r_multiple: -1.02, checklist_score: 6, checklist_total: 10, checklist_percent: 60, trade_grade: "C", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 2 * day).toISOString() },
    { id: "demo-3", user_id: "1", pair: "GBPJPY", asset_id: null, asset_class: "forex", direction: "buy", session: "London/NY Overlap", account_balance: base + 94, risk_percent: 0.5, risk_amount: 50.47, entry_price: 188.50, stop_loss: 188.00, take_profit: 189.50, stop_loss_pips: 50, take_profit_pips: 100, rr: 2, position_size: 0.1, potential_profit: 100, potential_loss: 50, result: "win", pnl: 98, r_multiple: 1.94, checklist_score: 9, checklist_total: 10, checklist_percent: 90, trade_grade: "A", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 3 * day).toISOString() },
    { id: "demo-4", user_id: "1", pair: "US30", asset_id: null, asset_class: "indices", direction: "buy", session: "New York", account_balance: base + 192, risk_percent: 1, risk_amount: 101.92, entry_price: 39500, stop_loss: 39450, take_profit: 39600, stop_loss_pips: 50, take_profit_pips: 100, rr: 2, position_size: 2.04, potential_profit: 204, potential_loss: 102, result: "win", pnl: 204, r_multiple: 2, checklist_score: 10, checklist_total: 10, checklist_percent: 100, trade_grade: "A", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 4 * day).toISOString() },
    { id: "demo-5", user_id: "1", pair: "BTCUSD", asset_id: null, asset_class: "crypto", direction: "sell", session: "Asian", account_balance: base + 396, risk_percent: 1, risk_amount: 103.96, entry_price: 97200, stop_loss: 97500, take_profit: 96600, stop_loss_pips: 300, take_profit_pips: 600, rr: 2, position_size: 0.035, potential_profit: 210, potential_loss: 105, result: "breakeven", pnl: 0, r_multiple: 0, checklist_score: 7, checklist_total: 10, checklist_percent: 70, trade_grade: "B", notes: "Scaled out at BE", close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 5 * day).toISOString() },
    { id: "demo-6", user_id: "1", pair: "EURUSD", asset_id: null, asset_class: "forex", direction: "sell", session: "London", account_balance: base + 396, risk_percent: 1, risk_amount: 103.96, entry_price: 1.0920, stop_loss: 1.0950, take_profit: 1.0860, stop_loss_pips: 30, take_profit_pips: 60, rr: 2, position_size: 0.35, potential_profit: 210, potential_loss: 105, result: "win", pnl: 210, r_multiple: 2.02, checklist_score: 8, checklist_total: 10, checklist_percent: 80, trade_grade: "B", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 6 * day).toISOString() },
    { id: "demo-7", user_id: "1", pair: "NAS100", asset_id: null, asset_class: "indices", direction: "buy", session: "New York", account_balance: base + 606, risk_percent: 0.5, risk_amount: 53.03, entry_price: 20450, stop_loss: 20400, take_profit: 20550, stop_loss_pips: 50, take_profit_pips: 100, rr: 2, position_size: 1.06, potential_profit: 106, potential_loss: 53, result: "loss", pnl: -53, r_multiple: -1, checklist_score: 5, checklist_total: 10, checklist_percent: 50, trade_grade: "D", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 7 * day).toISOString() },
    { id: "demo-8", user_id: "1", pair: "XAUUSD", asset_id: null, asset_class: "metals", direction: "buy", session: "London/NY Overlap", account_balance: base + 553, risk_percent: 1, risk_amount: 105.53, entry_price: 2620, stop_loss: 2612, take_profit: 2636, stop_loss_pips: 80, take_profit_pips: 160, rr: 2, position_size: 0.13, potential_profit: 211, potential_loss: 106, result: "win", pnl: 211, r_multiple: 2, checklist_score: 9, checklist_total: 10, checklist_percent: 90, trade_grade: "A", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 8 * day).toISOString() },
    { id: "demo-9", user_id: "1", pair: "GBPJPY", asset_id: null, asset_class: "forex", direction: "sell", session: "Asian", account_balance: base + 764, risk_percent: 0.5, risk_amount: 53.82, entry_price: 189.20, stop_loss: 189.70, take_profit: 188.20, stop_loss_pips: 50, take_profit_pips: 100, rr: 2, position_size: 0.11, potential_profit: 108, potential_loss: 54, result: "win", pnl: 54, r_multiple: 1, checklist_score: 7, checklist_total: 10, checklist_percent: 70, trade_grade: "B", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 9 * day).toISOString() },
    { id: "demo-10", user_id: "1", pair: "EURUSD", asset_id: null, asset_class: "forex", direction: "buy", session: "New York", account_balance: base + 818, risk_percent: 1, risk_amount: 108.18, entry_price: 1.0880, stop_loss: 1.0850, take_profit: 1.0940, stop_loss_pips: 30, take_profit_pips: 60, rr: 2, position_size: 0.36, potential_profit: 216, potential_loss: 108, result: "win", pnl: 216, r_multiple: 2, checklist_score: 8, checklist_total: 10, checklist_percent: 80, trade_grade: "B", notes: null, close_price: null, closed_at: null, close_notes: null, created_at: new Date(now - 10 * day).toISOString() },
  ];
  return trades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
})();

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
