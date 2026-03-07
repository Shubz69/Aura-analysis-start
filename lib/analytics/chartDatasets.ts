/**
 * Chart-ready datasets for Overview, Analytics, Leaderboard.
 * Safe for missing data: no NaN/Infinity, empty arrays when no data.
 */
import type { Trade } from "@/types";
import { buildKpiSummary } from "./kpis";
import { buildEquityCurveWithDrawdown } from "./drawdown";
import { pairPerformance } from "./pairPerformance";
import { sessionPerformance } from "./sessionPerformance";
import { assetClassPerformance } from "./assetClassPerformance";
import { gradeDistribution } from "./grades";
import { streakSummary } from "./streaks";
import { tradesByDay, tradesByWeek, tradesByMonth, tradesByWeekday } from "./timeAnalytics";
import { leaderboardFromTradesByUser } from "./leaderboard";
import { buildEquityCurve } from "./equity";

function safeNum(n: number): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

/** Overview page: KPIs, equity, recent trades, top pairs, session, grades. */
export function buildOverviewDatasets(
  trades: Trade[],
  startBalance: number
) {
  const kpi = buildKpiSummary(trades);
  const equityPoints = buildEquityCurve(trades, startBalance);
  const recent = [...trades]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  const pairStats = pairPerformance(trades).slice(0, 5);
  const sessionStats = sessionPerformance(trades);
  const gradeDist = gradeDistribution(trades);

  return {
    kpiSummary: {
      ...kpi,
      profitFactor: kpi.profitFactor === Infinity ? 0 : safeNum(kpi.profitFactor),
    },
    equityCurveData: equityPoints.map((p) => ({
      date: p.date,
      equity: safeNum(p.equity),
    })),
    recentTrades: recent,
    pairPerformanceTop5: pairStats.map((p) => ({
      pair: p.pair,
      tradeCount: p.tradeCount,
      totalPnL: safeNum(p.totalPnL),
      winRate: safeNum(p.winRate),
    })),
    sessionPerformanceData: sessionStats.map((s) => ({
      session: s.session,
      tradeCount: s.tradeCount,
      totalPnL: safeNum(s.totalPnL),
      winRate: safeNum(s.winRate),
    })),
    gradeDistributionData: gradeDist.map((g) => ({
      grade: g.grade,
      count: g.count,
      pnl: safeNum(g.pnl),
      winRate: safeNum(g.winRate),
    })),
  };
}

/** Analytics page: full equity, drawdown, PnL over time, monthly, weekday, pair, session, asset class, grades, streaks. */
export function buildAnalyticsDatasets(
  trades: Trade[],
  startBalance: number
) {
  const equityWithDrawdown = buildEquityCurveWithDrawdown(trades, startBalance);
  const byDay = tradesByDay(trades);
  const byMonth = tradesByMonth(trades);
  const byWeekday = tradesByWeekday(trades);
  const pairStats = pairPerformance(trades);
  const sessionStats = sessionPerformance(trades);
  const assetClassStats = assetClassPerformance(trades);
  const gradeDist = gradeDistribution(trades);
  const streaks = streakSummary(trades);

  return {
    equityCurveData: equityWithDrawdown.map((p) => ({
      date: p.date,
      equity: safeNum(p.equity),
      cumulativePnL: safeNum(p.cumulativePnL),
      peakEquity: safeNum(p.peakEquity),
      drawdown: safeNum(p.drawdown),
      drawdownPercent: safeNum(p.drawdownPercent),
    })),
    drawdownCurveData: equityWithDrawdown.map((p) => ({
      date: p.date,
      drawdown: safeNum(p.drawdown),
      drawdownPercent: safeNum(p.drawdownPercent),
    })),
    pnlOverTimeData: byDay.map((d) => ({
      date: d.date,
      pnl: safeNum(d.pnl),
      trades: d.trades,
      winRate: safeNum(d.winRate),
    })),
    monthlyPnlData: byMonth.map((m) => ({
      month: m.month,
      pnl: safeNum(m.pnl),
      trades: m.trades,
      winRate: safeNum(m.winRate),
      averageR: safeNum(m.averageR),
    })),
    weekdayPnlData: byWeekday.map((w) => ({
      weekday: w.weekday,
      tradeCount: w.tradeCount,
      totalPnL: safeNum(w.totalPnL),
      averageR: safeNum(w.averageR),
      winRate: safeNum(w.winRate),
    })),
    pairPerformanceData: pairStats.map((p) => ({
      pair: p.pair,
      tradeCount: p.tradeCount,
      totalPnL: safeNum(p.totalPnL),
      winRate: safeNum(p.winRate),
      averageR: safeNum(p.averageR),
      profitFactor: safeNum(p.profitFactor),
    })),
    sessionPerformanceData: sessionStats.map((s) => ({
      session: s.session,
      tradeCount: s.tradeCount,
      totalPnL: safeNum(s.totalPnL),
      winRate: safeNum(s.winRate),
      averageR: safeNum(s.averageR),
    })),
    assetClassPerformanceData: assetClassStats.map((a) => ({
      assetClass: a.assetClass,
      tradeCount: a.tradeCount,
      totalPnL: safeNum(a.totalPnL),
      winRate: safeNum(a.winRate),
      averageR: safeNum(a.averageR),
      profitFactor: safeNum(a.profitFactor),
    })),
    gradeDistributionData: gradeDist.map((g) => ({
      grade: g.grade,
      count: g.count,
      pnl: safeNum(g.pnl),
      winRate: safeNum(g.winRate),
    })),
    winLossDistributionData: (() => {
      const closed = trades.filter((t) => ["win", "loss", "breakeven"].includes(t.result));
      const wins = closed.filter((t) => t.result === "win").length;
      const losses = closed.filter((t) => t.result === "loss").length;
      const breakevens = closed.filter((t) => t.result === "breakeven").length;
      return [
        { name: "Win", value: wins, fill: "#22c55e" },
        { name: "Loss", value: losses, fill: "#ef4444" },
        { name: "Breakeven", value: breakevens, fill: "#94a3b8" },
      ].filter((d) => d.value > 0);
    })(),
    streakSummaryData: streaks,
  };
}

/** Leaderboard: ranked users; optional comparison chart (e.g. top 5 by PnL). */
export function buildLeaderboardDatasets(
  tradesByUser: Map<string, Trade[]>,
  sortBy: "totalPnL" | "averageR" | "winRate" | "consistencyScore" | "profitFactor" | "totalTrades" = "totalPnL"
) {
  const ranked = leaderboardFromTradesByUser(tradesByUser, sortBy);
  const topForChart = ranked.slice(0, 10).map((u) => ({
    userId: u.userId,
    totalPnL: safeNum(u.totalPnL),
    averageR: safeNum(u.averageR),
    winRate: safeNum(u.winRate),
    consistencyScore: safeNum(u.consistencyScore),
  }));
  return {
    rankedUsers: ranked,
    leaderboardChartData: topForChart,
  };
}
