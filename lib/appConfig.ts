/**
 * Central URL config for Aura Analysis app.
 * Main site: auraxfx.com. Dashboard lives at /aura-analysis in this app.
 */

export const MAIN_SITE_URL = "https://auraxfx.com";
export const DASHBOARD_ROUTE = "/aura-analysis";

/** Main site login path (no query). */
export const MAIN_SITE_LOGIN_PATH = "/login";

/** Full main site login URL without returnUrl (for server redirects). */
export const MAIN_SITE_LOGIN_URL = `${MAIN_SITE_URL}${MAIN_SITE_LOGIN_PATH}`;

/**
 * Build main site login URL with optional returnUrl.
 * Client: use window.location.origin + DASHBOARD_ROUTE.
 * Server: use getAppOrigin() + DASHBOARD_ROUTE when available.
 */
export function getMainLoginUrl(returnUrl?: string): string {
  const base = `${MAIN_SITE_URL}${MAIN_SITE_LOGIN_PATH}`;
  if (!returnUrl || typeof returnUrl !== "string" || !returnUrl.trim()) return base;
  return `${base}?returnUrl=${encodeURIComponent(returnUrl.trim())}`;
}

/** Server-side app origin (env-driven). Used for returnUrl in login/signup redirects. */
export function getAppOrigin(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "";
}
