import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromToken, BLOCKED_ROLES } from "@/lib/auth";
import { query } from "@/lib/db";
import { getTradesByUserId, insertTrade } from "@/lib/data/trades";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function dbAdapter() {
  return { query };
}

export async function GET(request: NextRequest) {
  const req = {
    headers: request.headers,
    cookies: { token: request.cookies.get("token")?.value },
  };
  const db = dbAdapter();
  try {
    const user = await getCurrentUserFromToken(req, db);
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
    const user = await getCurrentUserFromToken(req, db);
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
    const trade = await insertTrade(user.id, {
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
      notes: body.notes ?? null,
    });
    if (!trade) {
      return NextResponse.json(
        { error: "Failed to create trade" },
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
