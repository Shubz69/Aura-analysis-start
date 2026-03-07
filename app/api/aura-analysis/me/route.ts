import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromToken, getEffectiveRole, BLOCKED_ROLES } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const req = {
    headers: request.headers,
    cookies: { token: request.cookies.get("token")?.value },
  };
  const db = { query };
  try {
    const user = await getCurrentUserFromToken(req, db);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "UNAUTHORIZED",
          message: "Authentication required",
          allowed: false,
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    const effectiveRole = getEffectiveRole(user);
    const allowed =
      !BLOCKED_ROLES.includes(user.role) &&
      ["user", "admin", "super_admin"].includes(effectiveRole);
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          effectiveRole,
        },
        allowed,
        message: allowed ? null : "Access denied. This dashboard is for manual (free) users only.",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("aura-analysis/me", err);
    return NextResponse.json(
      { success: false, errorCode: "SERVER_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
