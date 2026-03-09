import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Safe number for display: no NaN/Infinity. */
export function safeNum(n: number, fallback = 0): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return n;
}

/** Currency with safe fallback. */
export function formatCurrencySafe(value: number, decimals = 2): string {
  const v = safeNum(value, 0);
  return formatCurrency(v, decimals);
}

/** Distance in pips, points, ticks, or price units (asset-aware label). */
export function formatDistance(
  value: number,
  unit: "pip" | "point" | "ticks" | "price" = "pip",
  decimals = 1
): string {
  const v = safeNum(value, 0);
  const s = v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  if (unit === "pip") return `${s} pips`;
  if (unit === "point") return `${s} pts`;
  if (unit === "ticks") return `${s} ticks`;
  return s;
}

/** Risk:reward ratio, e.g. 2.50. */
export function formatRR(value: number, decimals = 2): string {
  const v = safeNum(value, 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Position size: lots / contracts / units / shares. Uses max 2 decimals; omits decimals when whole number. */
export function formatPositionSize(
  value: number,
  kind: "lots" | "contracts" | "units" | "shares" = "lots",
  _decimals?: number
): string {
  const v = safeNum(value, 0);
  const isWhole = Number.isInteger(v) || Math.abs(v - Math.round(v * 100) / 100) < 1e-9;
  const s = isWhole
    ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  if (kind === "lots") return `${s} lots`;
  if (kind === "contracts") return `${s} contracts`;
  if (kind === "shares") return `${s} shares`;
  return `${s} units`;
}

/** Position size label from asset class (for calculator: lots vs contracts vs units). */
export function getPositionSizeKind(assetClass: string): "lots" | "contracts" | "units" {
  const c = (assetClass || "").toLowerCase();
  if (c === "indices" || c === "stocks" || c === "futures") return "contracts";
  if (c === "crypto") return "units";
  return "lots";
}

/** Percentage with safe fallback. */
export function formatPercentSafe(value: number, decimals = 2): string {
  const v = safeNum(value, 0);
  return formatPercent(v, decimals);
}

/** R-multiple or ratio: safe, e.g. "1.50" or "—" when not finite. */
export function formatRSafe(value: number, decimals = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
