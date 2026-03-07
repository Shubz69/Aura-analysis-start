import { NextResponse } from "next/server";

const MAIN_LOGIN_URL = process.env.NEXT_PUBLIC_MAIN_LOGIN_URL || "/";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  // Uses existing Aura FX JWT only. Redirect to dashboard on this app's origin.
  const origin = url.origin;
  const redirectUrl = origin ? `${origin}${next}` : MAIN_LOGIN_URL;
  return NextResponse.redirect(redirectUrl);
}
