/**
 * Win/loss streak calculations.
 */
import type { Trade } from "@/types";

const RESOLVED = ["win", "loss", "breakeven"] as const;

function sortedClosed(trades: Trade[]): Trade[] {
  return trades
    .filter((t) => RESOLVED.includes(t.result as typeof RESOLVED[number]))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function currentWinStreak(trades: Trade[]): number {
  const list = sortedClosed(trades);
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].result === "win") streak++;
    else break;
  }
  return streak;
}

export function currentLossStreak(trades: Trade[]): number {
  const list = sortedClosed(trades);
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].result === "loss") streak++;
    else break;
  }
  return streak;
}

export function longestWinStreak(trades: Trade[]): number {
  const list = sortedClosed(trades);
  let max = 0;
  let current = 0;
  for (const t of list) {
    if (t.result === "win") {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function longestLossStreak(trades: Trade[]): number {
  const list = sortedClosed(trades);
  let max = 0;
  let current = 0;
  for (const t of list) {
    if (t.result === "loss") {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export interface StreakSummary {
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

export function streakSummary(trades: Trade[]): StreakSummary {
  return {
    currentWinStreak: currentWinStreak(trades),
    currentLossStreak: currentLossStreak(trades),
    longestWinStreak: longestWinStreak(trades),
    longestLossStreak: longestLossStreak(trades),
  };
}
