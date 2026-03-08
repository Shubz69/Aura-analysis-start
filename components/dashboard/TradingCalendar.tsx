"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  eachDayOfInterval,
  parseISO,
  isToday,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrencySafe } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface CalendarTrade {
  date: string;
  result: string;
  pnl: number;
  id: string;
}

interface DayStats {
  trades: number;
  wins: number;
  losses: number;
  breakevens: number;
  pnl: number;
}

function groupTradesByDay(trades: CalendarTrade[]): Map<string, DayStats> {
  const map = new Map<string, DayStats>();
  for (const t of trades) {
    const key = t.date.slice(0, 10);
    const cur = map.get(key) ?? { trades: 0, wins: 0, losses: 0, breakevens: 0, pnl: 0 };
    cur.trades += 1;
    cur.pnl += t.pnl;
    if (t.result === "win") cur.wins += 1;
    else if (t.result === "loss") cur.losses += 1;
    else cur.breakevens += 1;
    map.set(key, cur);
  }
  return map;
}

function getMonthStats(trades: CalendarTrade[], yearMonth: string): DayStats {
  const filtered = trades.filter((t) => t.date.slice(0, 7) === yearMonth);
  return {
    trades: filtered.length,
    wins: filtered.filter((t) => t.result === "win").length,
    losses: filtered.filter((t) => t.result === "loss").length,
    breakevens: filtered.filter((t) => t.result === "breakeven").length,
    pnl: filtered.reduce((a, t) => a + t.pnl, 0),
  };
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface TradingCalendarProps {
  trades: CalendarTrade[];
  className?: string;
}

export function TradingCalendar({ trades, className }: TradingCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDay = useMemo(() => groupTradesByDay(trades), [trades]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const yearMonth = format(viewDate, "yyyy-MM");
  const monthStats = useMemo(
    () => getMonthStats(trades, yearMonth),
    [trades, yearMonth]
  );

  const selectedDayStats = selectedDate ? byDay.get(selectedDate) ?? null : null;

  return (
    <Card className={cn("overflow-hidden border-border/80 bg-card/80 shadow-lg", className)}>
      {/* Prominent monthly summary — Tradezella-style */}
      <div className="border-b border-border/60 bg-muted/30 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {format(viewDate, "MMMM yyyy")} — Monthly total
              </p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-3">
                <span
                  className={cn(
                    "text-2xl font-bold tabular-nums sm:text-3xl",
                    monthStats.pnl > 0 && "text-emerald-600 dark:text-emerald-400",
                    monthStats.pnl < 0 && "text-red-600 dark:text-red-400",
                    monthStats.pnl === 0 && "text-muted-foreground"
                  )}
                >
                  {formatCurrencySafe(monthStats.pnl)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {monthStats.trades} trades
                  {monthStats.trades > 0 && (
                    <span className="ml-1.5">
                      · <span className="text-emerald-600 dark:text-emerald-400">{monthStats.wins}W</span>
                      {" "}<span className="text-red-600 dark:text-red-400">{monthStats.losses}L</span>
                      {monthStats.breakevens > 0 && (
                        <span className="ml-1 text-muted-foreground">{monthStats.breakevens}BE</span>
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setViewDate((d) => subMonths(d, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[8rem] text-center text-sm font-semibold">
              {format(viewDate, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4 sm:p-6">
        {/* Calendar grid — color-coded days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAY_HEADERS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const stats = byDay.get(dateKey);
            const isCurrentMonth = isSameMonth(day, viewDate);
            const isSelected = selectedDate === dateKey;
            const hasActivity = stats && stats.trades > 0;
            const dayPnL = stats?.pnl ?? 0;
            const isWin = hasActivity && dayPnL > 0;
            const isLoss = hasActivity && dayPnL < 0;
            const isBE = hasActivity && dayPnL === 0;
            const today = isToday(day);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(hasActivity ? dateKey : null)}
                className={cn(
                  "relative flex min-h-[2.75rem] sm:min-h-[3.25rem] flex-col items-center justify-center rounded-lg p-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isCurrentMonth && !hasActivity && "text-foreground hover:bg-muted/60",
                  hasActivity && "text-foreground",
                  isWin && "bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25",
                  isLoss && "bg-red-500/20 hover:bg-red-500/30 dark:bg-red-500/15 dark:hover:bg-red-500/25",
                  isBE && "bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  today && "ring-1 ring-primary/50"
                )}
                aria-label={
                  hasActivity
                    ? `${dateKey}: ${stats!.trades} trade(s), ${formatCurrencySafe(stats!.pnl)}`
                    : dateKey
                }
              >
                <span className={cn("tabular-nums", today && "font-bold")}>
                  {format(day, "d")}
                </span>
                {hasActivity && (
                  <span className="mt-1 line-clamp-1 max-w-full truncate text-[10px] sm:text-xs font-semibold tabular-nums">
                    {dayPnL >= 0 ? "+" : ""}{formatCurrencySafe(dayPnL)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Daily results panel when a day is selected */}
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {selectedDate
              ? `Daily results — ${format(parseISO(selectedDate), "EEEE, MMM d, yyyy")}`
              : "Click a day with trades to see results"}
          </p>
          {selectedDayStats ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trades</span>
                <span className="text-lg font-semibold tabular-nums">{selectedDayStats.trades}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {selectedDayStats.wins} wins
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {selectedDayStats.losses} losses
                </span>
              </div>
              {selectedDayStats.breakevens > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedDayStats.breakevens} breakeven
                </span>
              )}
              <div
                className={cn(
                  "ml-auto text-lg font-bold tabular-nums",
                  selectedDayStats.pnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {selectedDayStats.pnl >= 0 ? "+" : ""}{formatCurrencySafe(selectedDayStats.pnl)} PnL
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? "No trades on this day."
                : "Select a day in the calendar above to view that day's performance."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
