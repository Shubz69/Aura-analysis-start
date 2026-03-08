/**
 * Trade data access. Table: aura_analysis_trades (MySQL).
 */
import { query, executeQuery } from "@/lib/db";

const TABLE = "aura_analysis_trades";

export interface TradeRow {
  id: number | string;
  user_id: string;
  pair: string;
  asset_id: string | null;
  asset_class: string;
  direction: string;
  session: string | null;
  account_balance: number;
  risk_percent: number;
  risk_amount: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  rr: number;
  position_size: number;
  potential_profit: number;
  potential_loss: number;
  result: string;
  pnl: number;
  r_multiple: number;
  checklist_score: number;
  checklist_total: number;
  checklist_percent: number;
  trade_grade: string | null;
  notes: string | null;
  created_at: string;
}

export async function getTradesByUserId(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<TradeRow[]> {
  const limit = Math.min(Math.max(options?.limit ?? 500, 1), 500);
  const offset = Math.max(options?.offset ?? 0, 0);
  const rows = await query(
    `SELECT * FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return (rows as TradeRow[]).map(normalizeTradeRow);
}

export interface InsertTradeBody {
  pair: string;
  asset_id?: string | null;
  asset_class: string;
  direction: string;
  session?: string | null;
  account_balance: number;
  risk_percent: number;
  risk_amount: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  rr: number;
  position_size: number;
  potential_profit: number;
  potential_loss: number;
  result?: string;
  pnl?: number;
  r_multiple?: number;
  checklist_score: number;
  checklist_total: number;
  checklist_percent: number;
  trade_grade: string;
  notes?: string | null;
}

export async function insertTrade(
  userId: string,
  body: InsertTradeBody
): Promise<TradeRow | null> {
  const [result] = await executeQuery(
    `INSERT INTO ${TABLE} (
      user_id, pair, asset_id, asset_class, direction, session,
      account_balance, risk_percent, risk_amount, entry_price, stop_loss, take_profit,
      stop_loss_pips, take_profit_pips, rr, position_size, potential_profit, potential_loss,
      result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      body.pair || "",
      body.asset_id ?? null,
      body.asset_class || "forex",
      body.direction || "buy",
      body.session ?? null,
      Number(body.account_balance) || 0,
      Number(body.risk_percent) || 0,
      Number(body.risk_amount) || 0,
      Number(body.entry_price) || 0,
      Number(body.stop_loss) || 0,
      Number(body.take_profit) || 0,
      Number(body.stop_loss_pips) || 0,
      Number(body.take_profit_pips) || 0,
      Number(body.rr) || 0,
      Number(body.position_size) || 0,
      Number(body.potential_profit) || 0,
      Number(body.potential_loss) || 0,
      body.result || "open",
      Number(body.pnl) ?? 0,
      Number(body.r_multiple) ?? 0,
      Number(body.checklist_score) || 0,
      Number(body.checklist_total) || 0,
      Number(body.checklist_percent) || 0,
      body.trade_grade ?? "C",
      body.notes ?? null,
    ]
  );
  const insertId = (result as { insertId?: number })?.insertId;
  if (insertId == null) return null;
  const rows = await query(`SELECT * FROM ${TABLE} WHERE id = ?`, [insertId]);
  const row = (rows as TradeRow[])?.[0];
  return row ? normalizeTradeRow(row) : null;
}

function normalizeTradeRow(row: TradeRow): TradeRow {
  return {
    ...row,
    id: String(row.id),
  };
}
