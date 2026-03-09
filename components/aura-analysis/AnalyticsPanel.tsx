"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const CHART_CARDS = [
  { id: "equity", title: "Equity Curve" },
  { id: "win-pair", title: "Win Rate by Pair" },
  { id: "session", title: "Session Performance" },
  { id: "rr", title: "RR Distribution" },
];

export function AnalyticsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {CHART_CARDS.map((chart) => (
        <Card
          key={chart.id}
          className="border transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)] hover:scale-[1.01]"
          style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
        >
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
              {chart.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg border border-dashed flex items-center justify-center min-h-[240px]"
              style={{ borderColor: "var(--aa-border)", background: "var(--aa-panel-hover)" }}
            >
              <p className="text-sm" style={{ color: "var(--aa-text-muted)" }}>
                Chart placeholder
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
