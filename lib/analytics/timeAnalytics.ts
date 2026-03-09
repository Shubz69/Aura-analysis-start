/**
 * Time-based analytics: by day, week, month, weekday.
 */
import type { Trade } from "@/types";
import { getClosedTrades } from "@/lib/utils";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toWeekKey(d: Date): string {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return toDateKey(start);
}

function toMonthKey(d: Date): string {
  return d.toISOString().slice(0, 7);
}

export interface DayStats {
  date: string;
  trades: number;
  pnl: number;
  winRate: number;
}

export interface WeekStats {
  week: string;
  trades: number;
  pnl: number;
  averageR: number;
}

export interface MonthStats {
  month: string;
  trades: number;
  pnl: number;
  winRate: number;
  averageR: number;
}

export interface WeekdayStats {
  weekday: string;
  tradeCount: number;
  totalPnL: number;
  averageR: number;
  winRate: number;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function tradesByDay(trades: Trade[]): DayStats[] {
  const c = getClosedTrades(trades);
  const byDay = new Map<string, Trade[]>();
  for (const t of c) {
    const key = toDateKey(new Date(t.created_at));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(t);
  }
  return Array.from(byDay.entries())
    .map(([date, list]) => {
      const wins = list.filter((t) => t.result === "win").length;
      return {
        date,
        trades: list.length,
        pnl: list.reduce((a, t) => a + t.pnl, 0),
        winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function tradesByWeek(trades: Trade[]): WeekStats[] {
  const c = getClosedTrades(trades);
  const byWeek = new Map<string, Trade[]>();
  for (const t of c) {
    const key = toWeekKey(new Date(t.created_at));
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(t);
  }
  return Array.from(byWeek.entries())
    .map(([week, list]) => ({
      week,
      trades: list.length,
      pnl: list.reduce((a, t) => a + t.pnl, 0),
      averageR: list.length > 0 ? list.reduce((a, t) => a + t.r_multiple, 0) / list.length : 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export function tradesByMonth(trades: Trade[]): MonthStats[] {
  const c = getClosedTrades(trades);
  const byMonth = new Map<string, Trade[]>();
  for (const t of c) {
    const key = toMonthKey(new Date(t.created_at));
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(t);
  }
  return Array.from(byMonth.entries())
    .map(([month, list]) => {
      const wins = list.filter((t) => t.result === "win").length;
      return {
        month,
        trades: list.length,
        pnl: list.reduce((a, t) => a + t.pnl, 0),
        winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
        averageR: list.length > 0 ? list.reduce((a, t) => a + t.r_multiple, 0) / list.length : 0,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function tradesByWeekday(trades: Trade[]): WeekdayStats[] {
  const c = getClosedTrades(trades);
  const byWeekday = new Map<number, Trade[]>();
  for (const t of c) {
    const day = new Date(t.created_at).getDay();
    if (!byWeekday.has(day)) byWeekday.set(day, []);
    byWeekday.get(day)!.push(t);
  }
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const list = byWeekday.get(day) ?? [];
    const wins = list.filter((t) => t.result === "win").length;
    return {
      weekday: WEEKDAY_NAMES[day],
      tradeCount: list.length,
      totalPnL: list.reduce((a, t) => a + t.pnl, 0),
      averageR: list.length > 0 ? list.reduce((a, t) => a + t.r_multiple, 0) / list.length : 0,
      winRate: list.length > 0 ? (wins / list.length) * 100 : 0,
    };
  });
}
