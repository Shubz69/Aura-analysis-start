/**
 * Trade data access. Table: aura_analysis_trades (MySQL).
 * Fallback to in-memory array if DB is not configured.
 */
import fs from "fs";
import path from "path";
import { query, executeQuery } from "@/lib/db";

const TABLE = "aura_analysis_trades";

// In-memory/file fallback for users who haven't set up a database
const MOCK_FILE = path.join(process.cwd(), ".mock_trades.json");

function getMockTrades(): TradeRow[] {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      const data = fs.readFileSync(MOCK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveMockTrade(trade: TradeRow) {
  try {
    const trades = getMockTrades();
    trades.unshift(trade);
    fs.writeFileSync(MOCK_FILE, JSON.stringify(trades, null, 2));
  } catch (e) {
    // ignore
  }
}

function getNextMockId(): number {
  const trades = getMockTrades();
  if (trades.length === 0) return 1;
  const ids = trades.map(t => typeof t.id === 'number' ? t.id : parseInt(t.id as string, 10)).filter(n => !isNaN(n));
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

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
  validator_data: string | null;
  notes: string | null;
  created_at: string;
}

export async function getTradesByUserId(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<TradeRow[]> {
  const limit = Math.min(Math.max(options?.limit ?? 500, 1), 500);
  const offset = Math.max(options?.offset ?? 0, 0);
  try {
    const rows = await query(
      `SELECT * FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return (rows as TradeRow[]).map(normalizeTradeRow);
    }
  } catch (e) {
    console.warn("DB query failed, falling back to in-memory trades");
  }
  
  // Fallback to in-memory/file mock trades
  const userTrades = getMockTrades().filter((t) => String(t.user_id) === String(userId));
  return userTrades.slice(offset, offset + limit).map(normalizeTradeRow);
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
  validator_data?: string | null;
  notes?: string | null;
}

export async function insertTrade(
  userId: string,
  body: InsertTradeBody
): Promise<TradeRow | null> {
  const insertParams = [
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
    body.validator_data ?? null,
    body.notes ?? null,
  ];

  try {
    const [result] = await executeQuery(
      `INSERT INTO ${TABLE} (
        user_id, pair, asset_id, asset_class, direction, session,
        account_balance, risk_percent, risk_amount, entry_price, stop_loss, take_profit,
        stop_loss_pips, take_profit_pips, rr, position_size, potential_profit, potential_loss,
        result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, validator_data, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertParams
    );
    const insertId = (result as { insertId?: number })?.insertId;
    if (insertId != null) {
      const rows = await query(`SELECT * FROM ${TABLE} WHERE id = ?`, [insertId]);
      const row = (rows as TradeRow[])?.[0];
      if (row) return normalizeTradeRow(row);
    }
  } catch (e) {
    console.warn("DB insert failed, falling back to in-memory trades", e);
  }

  // Fallback to in-memory/file array if DB query fails or returns no insertId
  const mockTrade: TradeRow = {
    id: getNextMockId(),
    user_id: userId,
    pair: body.pair || "",
    asset_id: body.asset_id ? String(body.asset_id) : null,
    asset_class: body.asset_class || "forex",
    direction: body.direction || "buy",
    session: body.session ?? null,
    account_balance: Number(body.account_balance) || 0,
    risk_percent: Number(body.risk_percent) || 0,
    risk_amount: Number(body.risk_amount) || 0,
    entry_price: Number(body.entry_price) || 0,
    stop_loss: Number(body.stop_loss) || 0,
    take_profit: Number(body.take_profit) || 0,
    stop_loss_pips: Number(body.stop_loss_pips) || 0,
    take_profit_pips: Number(body.take_profit_pips) || 0,
    rr: Number(body.rr) || 0,
    position_size: Number(body.position_size) || 0,
    potential_profit: Number(body.potential_profit) || 0,
    potential_loss: Number(body.potential_loss) || 0,
    result: body.result || "open",
    pnl: Number(body.pnl) ?? 0,
    r_multiple: Number(body.r_multiple) ?? 0,
    checklist_score: Number(body.checklist_score) || 0,
    checklist_total: Number(body.checklist_total) || 0,
    checklist_percent: Number(body.checklist_percent) || 0,
    trade_grade: body.trade_grade ?? "C",
    validator_data: body.validator_data ?? null,
    notes: body.notes ?? null,
    created_at: new Date().toISOString(),
  };
  saveMockTrade(mockTrade);
  return normalizeTradeRow(mockTrade);
}

function normalizeTradeRow(row: TradeRow): TradeRow {
  return {
    ...row,
    id: String(row.id),
  };
}
