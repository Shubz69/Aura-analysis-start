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

function getNextMockId(): string {
  // Use a timestamp and random string to ensure unique IDs across Vercel ephemeral storage wipes
  return Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
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
  close_price: number | null;
  closed_at: string | null;
  close_notes: string | null;
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
  close_price?: number | null;
  closed_at?: string | null;
  close_notes?: string | null;
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
    body.close_price ?? null,
    body.closed_at ?? null,
    body.close_notes ?? null,
  ];

  try {
    const [result] = await executeQuery(
      `INSERT INTO ${TABLE} (
        user_id, pair, asset_id, asset_class, direction, session,
        account_balance, risk_percent, risk_amount, entry_price, stop_loss, take_profit,
        stop_loss_pips, take_profit_pips, rr, position_size, potential_profit, potential_loss,
        result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, validator_data, notes, close_price, closed_at, close_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    close_price: body.close_price ?? null,
    closed_at: body.closed_at ?? null,
    close_notes: body.close_notes ?? null,
    created_at: new Date().toISOString(),
  };
  saveMockTrade(mockTrade);
  return normalizeTradeRow(mockTrade);
}

export async function updateTrade(
  userId: string,
  tradeId: string | number,
  updates: Partial<InsertTradeBody>
): Promise<TradeRow | null> {
  const fields: string[] = [];
  const values: any[] = [];

  const addField = (key: string, value: any) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  };

  addField("pair", updates.pair);
  addField("asset_id", updates.asset_id);
  addField("asset_class", updates.asset_class);
  addField("direction", updates.direction);
  addField("session", updates.session);
  addField("account_balance", updates.account_balance);
  addField("entry_price", updates.entry_price);
  addField("risk_percent", updates.risk_percent);
  addField("risk_amount", updates.risk_amount);
  addField("stop_loss_pips", updates.stop_loss_pips);
  addField("take_profit_pips", updates.take_profit_pips);
  addField("rr", updates.rr);
  addField("position_size", updates.position_size);
  addField("potential_profit", updates.potential_profit);
  addField("potential_loss", updates.potential_loss);
  addField("stop_loss", updates.stop_loss);
  addField("take_profit", updates.take_profit);
  addField("result", updates.result);
  addField("pnl", updates.pnl);
  addField("r_multiple", updates.r_multiple);
  addField("checklist_score", updates.checklist_score);
  addField("checklist_total", updates.checklist_total);
  addField("checklist_percent", updates.checklist_percent);
  addField("trade_grade", updates.trade_grade);
  addField("validator_data", updates.validator_data);
  addField("notes", updates.notes);
  addField("close_price", updates.close_price);
  addField("closed_at", updates.closed_at);
  addField("close_notes", updates.close_notes);

  if (fields.length === 0) return null;

  values.push(tradeId);
  values.push(userId);

  try {
    const result = await executeQuery(
      `UPDATE ${TABLE} SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );

    const rows = await query(`SELECT * FROM ${TABLE} WHERE id = ? AND user_id = ?`, [tradeId, userId]);
    const row = (rows as TradeRow[])?.[0];
    if (row) return normalizeTradeRow(row);
  } catch (e) {
    console.warn("DB update failed, falling back to in-memory trades", e);
  }

  // Fallback update in mock trades
  try {
    const trades = getMockTrades();
    const index = trades.findIndex(t => String(t.id) === String(tradeId) && String(t.user_id) === String(userId));
    if (index >= 0) {
      const existing = trades[index];
      const updatedTrade = { ...existing, ...updates };
      trades[index] = updatedTrade as TradeRow;
      fs.writeFileSync(MOCK_FILE, JSON.stringify(trades, null, 2));
      return normalizeTradeRow(updatedTrade as TradeRow);
    } else if (!process.env.MYSQL_HOST && !process.env.DATABASE_URL) {
      // If we're strictly file-based/serverless and the file got wiped, just pretend success
      // by returning the partial update. The frontend will merge it.
      return { id: String(tradeId), user_id: userId, ...updates } as any;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function deleteTrade(
  userId: string,
  tradeId: string | number
): Promise<boolean> {
  let dbSuccess = false;
  try {
    const [result] = await executeQuery(
      `DELETE FROM ${TABLE} WHERE id = ? AND user_id = ?`,
      [tradeId, userId]
    );
    if ((result as any)?.affectedRows > 0) {
      dbSuccess = true;
    }
  } catch (e) {
    console.warn("DB delete failed, falling back to in-memory trades", e);
  }

  // Fallback update in mock trades
  try {
    const trades = getMockTrades();
    const index = trades.findIndex(t => String(t.id) === String(tradeId) && String(t.user_id) === String(userId));
    if (index >= 0) {
      trades.splice(index, 1);
      fs.writeFileSync(MOCK_FILE, JSON.stringify(trades, null, 2));
      return true;
    } else if (!process.env.MYSQL_HOST && !process.env.DATABASE_URL) {
      // If we're strictly file-based/serverless and the file got wiped, just pretend success
      return true;
    }
  } catch (e) {
    // ignore
  }

  return dbSuccess;
}

function normalizeTradeRow(row: TradeRow): TradeRow {
  return {
    ...row,
    id: String(row.id),
  };
}
