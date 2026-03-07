import { NextResponse } from "next/server";
import { getAppOrigin, DASHBOARD_ROUTE } from "@/lib/appConfig";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? DASHBOARD_ROUTE;
  const origin = url.origin;
  const fallback = getAppOrigin() ? `${getAppOrigin()}${next}` : "/";
  const redirectUrl = origin ? `${origin}${next}` : fallback;
  return NextResponse.redirect(redirectUrl);
}
