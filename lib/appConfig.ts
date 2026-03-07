/**
 * App config for Aura Analysis (standalone).
 * No external website or auth handoff.
 */

/** Dashboard route in this app. */
export const DASHBOARD_ROUTE = "/aura-analysis";

/** When true, use mock user and open dashboard directly. Default true so app is standalone. */
export const BYPASS_AUTH =
  typeof process !== "undefined"
    ? process.env?.NEXT_PUBLIC_BYPASS_AUTH !== "false"
    : true;
