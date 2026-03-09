"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const COLUMNS = ["Rank", "Trader", "Win Rate", "Profit Factor", "Trades", "Total PnL"];
const PLACEHOLDER_ROWS = [
  { rank: 1, trader: "Trader One", winRate: "68%", profitFactor: "2.4", trades: 42, pnl: "$12,400" },
  { rank: 2, trader: "Trader Two", winRate: "62%", profitFactor: "2.1", trades: 38, pnl: "$9,200" },
  { rank: 3, trader: "Trader Three", winRate: "58%", profitFactor: "1.8", trades: 55, pnl: "$7,100" },
];

export function LeaderboardPanel() {
  return (
    <Card
      className="border overflow-hidden animate-in fade-in duration-300"
      style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
    >
      <CardHeader>
        <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderColor: "var(--aa-border)", background: "var(--aa-panel-hover)" }}>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-left font-medium px-4 py-3 whitespace-nowrap"
                  style={{ color: "var(--aa-text-muted)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLACEHOLDER_ROWS.map((row) => (
              <tr
                key={row.rank}
                className="border-t transition-colors hover:bg-[var(--aa-panel-hover)]"
                style={{ borderColor: "var(--aa-border)" }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--aa-text)" }}>{row.rank}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.trader}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-success)" }}>{row.winRate}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.profitFactor}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.trades}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-success)" }}>{row.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
