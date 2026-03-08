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
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
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
    <Card className={cn("glass overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5" />
            Trading calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewDate((d) => subMonths(d, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[7rem] text-center text-sm font-medium">
              {format(viewDate, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAY_HEADERS.map((day) => (
            <div
              key={day}
              className="py-1 text-xs font-medium text-muted-foreground"
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

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(hasActivity ? dateKey : null)}
                className={cn(
                  "relative flex min-h-[2.25rem] flex-col items-center justify-center rounded-md p-1 text-sm transition-colors",
                  !isCurrentMonth && "text-muted-foreground/60",
                  isCurrentMonth && "text-foreground",
                  hasActivity &&
                    "hover:bg-muted/80 focus:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring",
                  isSelected && "bg-primary/15 ring-2 ring-primary/50"
                )}
                aria-label={
                  hasActivity
                    ? `${dateKey}: ${stats!.trades} trade(s), ${formatCurrencySafe(stats!.pnl)}`
                    : dateKey
                }
              >
                <span>{format(day, "d")}</span>
                {hasActivity && (
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      dayPnL > 0 && "bg-emerald-500",
                      dayPnL < 0 && "bg-red-500",
                      dayPnL === 0 && "bg-muted-foreground/60"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Monthly results — {format(viewDate, "MMMM yyyy")}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>{monthStats.trades} trades</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {monthStats.wins} W
              </span>
              <span className="text-red-600 dark:text-red-400">
                {monthStats.losses} L
              </span>
              {monthStats.breakevens > 0 && (
                <span className="text-muted-foreground">
                  {monthStats.breakevens} BE
                </span>
              )}
              <span
                className={cn(
                  "font-medium",
                  monthStats.pnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrencySafe(monthStats.pnl)} PnL
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {selectedDate
                ? `Daily results — ${format(parseISO(selectedDate), "EEEE, MMM d, yyyy")}`
                : "Click a day with trades"}
            </p>
            {selectedDayStats ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{selectedDayStats.trades} trades</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {selectedDayStats.wins} W
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {selectedDayStats.losses} L
                </span>
                {selectedDayStats.breakevens > 0 && (
                  <span className="text-muted-foreground">
                    {selectedDayStats.breakevens} BE
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium",
                    selectedDayStats.pnl >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatCurrencySafe(selectedDayStats.pnl)} PnL
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {selectedDate
                  ? "No trades on this day."
                  : "Select a day in the calendar to see that day's results."}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
