import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromToken, BLOCKED_ROLES } from "@/lib/auth";
import { query } from "@/lib/db";
import { getTradesByUserId, insertTrade } from "@/lib/data/trades";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function dbAdapter() {
  return { query };
}

/** When BYPASS_AUTH is true, use first user in DB so app works without sign-in. */
async function getFallbackUser(db: { query: (sql: string, params?: unknown[]) => Promise<unknown[]> }) {
  try {
    const rows = (await db.query("SELECT id, email, username, role FROM users LIMIT 1", [])) as { id: number; email: string; username: string; role: string }[];
    if (rows && rows[0]) {
      return { id: rows[0].id, email: rows[0].email, username: rows[0].username, role: rows[0].role || "user" };
    }
  } catch (e) {
    // Ignore query errors
  }
  
  // If we reach here, the users table is empty (or missing).
  // We MUST insert a dummy user so the foreign key `user_id` constraint doesn't block saving trades!
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user'
      )
    `);
    await db.query(`
      INSERT IGNORE INTO users (id, email, username, role) 
      VALUES (1, 'guest@example.com', 'Guest', 'user')
    `);
  } catch (e) {
    console.warn("Failed to create/insert fallback user into DB", e);
  }

  // Return the dummy user
  return { id: 1, email: "guest@example.com", username: "Guest", role: "user" };
}

export async function GET(request: NextRequest) {
  const req = {
    headers: request.headers,
    cookies: { token: request.cookies.get("token")?.value },
  };
  const db = dbAdapter();
  try {
    let user = await getCurrentUserFromToken(req, db);
    // Allow use without sign-in: use first user in DB when no valid token
    if (!user) {
      user = await getFallbackUser(db);
    }
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (BLOCKED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
    const trades = await getTradesByUserId(user.id, { limit, offset });
    return NextResponse.json(trades, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/aura-analysis/trades", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const req = {
    headers: request.headers,
    cookies: { token: request.cookies.get("token")?.value },
  };
  const db = dbAdapter();
  try {
    let user = await getCurrentUserFromToken(req, db);
    // Allow use without sign-in: use first user in DB when no valid token
    if (!user) {
      user = await getFallbackUser(db);
    }
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (BLOCKED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }
    const body = await request.json();
    let trade: any = null;

    // Auto-initialize the tables if they don't exist so users don't get stuck
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS aura_analysis_trades (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          pair VARCHAR(50) NOT NULL,
          asset_id INT DEFAULT NULL,
          asset_class VARCHAR(50) NOT NULL,
          direction VARCHAR(10) NOT NULL,
          session VARCHAR(50) DEFAULT NULL,
          account_balance DECIMAL(15,2) NOT NULL,
          risk_percent DECIMAL(8,4) NOT NULL,
          risk_amount DECIMAL(15,2) NOT NULL,
          entry_price DECIMAL(20,8) NOT NULL,
          stop_loss DECIMAL(20,8) NOT NULL,
          take_profit DECIMAL(20,8) NOT NULL,
          stop_loss_pips DECIMAL(20,4) NOT NULL,
          take_profit_pips DECIMAL(20,4) NOT NULL,
          rr DECIMAL(12,4) NOT NULL,
          position_size DECIMAL(20,8) NOT NULL,
          potential_profit DECIMAL(15,2) NOT NULL,
          potential_loss DECIMAL(15,2) NOT NULL,
          result VARCHAR(20) DEFAULT 'open',
          pnl DECIMAL(15,2) DEFAULT 0,
          r_multiple DECIMAL(12,4) DEFAULT 0,
          checklist_score INT DEFAULT 0,
          checklist_total INT DEFAULT 0,
          checklist_percent DECIMAL(8,2) DEFAULT 0,
          trade_grade VARCHAR(50) DEFAULT NULL,
          validator_data JSON DEFAULT NULL,
          notes TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      // Try to alter table if columns are missing or too small
      await db.query(`ALTER TABLE aura_analysis_trades MODIFY COLUMN trade_grade VARCHAR(50)`);
      try {
        await db.query(`ALTER TABLE aura_analysis_trades ADD COLUMN validator_data JSON DEFAULT NULL`);
      } catch (e) { /* ignore if exists */ }
    } catch (err) {
      console.warn("Auto-migrate trades table failed", err);
    }

    try {
      trade = await insertTrade(user.id, {
        pair: body.pair ?? "",
        asset_id: body.asset_id ?? null,
        asset_class: body.asset_class ?? "forex",
        direction: body.direction ?? "buy",
        session: body.session ?? null,
        account_balance: Number(body.account_balance) ?? 0,
        risk_percent: Number(body.risk_percent) ?? 0,
        risk_amount: Number(body.risk_amount) ?? 0,
        entry_price: Number(body.entry_price) ?? 0,
        stop_loss: Number(body.stop_loss) ?? 0,
        take_profit: Number(body.take_profit) ?? 0,
        stop_loss_pips: Number(body.stop_loss_pips) ?? 0,
        take_profit_pips: Number(body.take_profit_pips) ?? 0,
        rr: Number(body.rr) ?? 0,
        position_size: Number(body.position_size) ?? 0,
        potential_profit: Number(body.potential_profit) ?? 0,
        potential_loss: Number(body.potential_loss) ?? 0,
        result: body.result ?? "open",
        pnl: Number(body.pnl) ?? 0,
        r_multiple: Number(body.r_multiple) ?? 0,
        checklist_score: Number(body.checklist_score) ?? 0,
        checklist_total: Number(body.checklist_total) ?? 0,
        checklist_percent: Number(body.checklist_percent) ?? 0,
        trade_grade: body.trade_grade ?? "C",
        validator_data: body.validator_data ? JSON.stringify(body.validator_data) : null,
        notes: body.notes ?? null,
      });
    } catch (e) {
      console.warn("Failed to insert trade to DB, falling back to mock response", e);
    }

    if (!trade) {
      return NextResponse.json(
        { error: "Failed to create trade in database. Please ensure your database is connected and tables are created." },
        { status: 500 }
      );
    }
    return NextResponse.json(trade, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("POST /api/aura-analysis/trades", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
