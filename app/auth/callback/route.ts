import { NextResponse } from "next/server";
import { DASHBOARD_ROUTE } from "@/lib/appConfig";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? DASHBOARD_ROUTE;
  const origin = url.origin;
  const redirectUrl = origin ? `${origin}${next}` : next;
  return NextResponse.redirect(redirectUrl);
}
