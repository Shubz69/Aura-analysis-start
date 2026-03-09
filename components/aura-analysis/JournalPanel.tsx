"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
const PLACEHOLDER_ROWS = [
  { date: "2026-03-07", pair: "EURUSD", direction: "Buy", entry: "1.0850", stop: "1.0820", tp: "1.0920", riskPct: "1.0", result: "Win", pnl: "120.00", session: "London", grade: "A" },
  { date: "2026-03-06", pair: "XAUUSD", direction: "Sell", entry: "2650", stop: "2665", tp: "2620", riskPct: "1.5", result: "Loss", pnl: "-150.00", session: "NY", grade: "C" },
  { date: "2026-03-05", pair: "GBPUSD", direction: "Buy", entry: "1.2650", stop: "1.2620", tp: "1.2720", riskPct: "1.0", result: "Win", pnl: "700.00", session: "London", grade: "A" },
];

const COLUMNS = ["Date", "Pair", "Direction", "Entry", "Stop", "TP", "Risk %", "Result", "PnL", "Session", "Grade", "Actions"];

export function JournalPanel() {
  return (
    <Card
      className="border overflow-hidden animate-in fade-in duration-300"
      style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
    >
      <CardHeader>
        <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
          Trade Journal
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
            {PLACEHOLDER_ROWS.map((row, i) => (
              <tr
                key={i}
                className="border-t transition-colors hover:bg-[var(--aa-panel-hover)]"
                style={{ borderColor: "var(--aa-border)" }}
              >
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.date}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.pair}</td>
                <td className="px-4 py-3" style={{ color: row.direction === "Buy" ? "var(--aa-success)" : "var(--aa-loss)" }}>{row.direction}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.entry}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.stop}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.tp}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.riskPct}%</td>
                <td className="px-4 py-3" style={{ color: row.result === "Win" ? "var(--aa-success)" : "var(--aa-loss)" }}>{row.result}</td>
                <td className="px-4 py-3" style={{ color: row.pnl.startsWith("-") ? "var(--aa-loss)" : "var(--aa-success)" }}>{row.pnl}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.session}</td>
                <td className="px-4 py-3" style={{ color: "var(--aa-text)" }}>{row.grade}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" style={{ color: "var(--aa-text-muted)" }} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
