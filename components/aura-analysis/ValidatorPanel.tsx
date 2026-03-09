"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
const SECTIONS = [
  { id: "market", title: "Market Structure", items: ["Trend aligned", "Structure break confirmed", "Higher timeframe context"] },
  { id: "liquidity", title: "Liquidity", items: ["Liquidity pool identified", "Sweep / stop hunt considered"] },
  { id: "levels", title: "Key Levels", items: ["Support/Resistance marked", "Order block / FVG noted"] },
  { id: "entry", title: "Entry Confirmation", items: ["Entry trigger clear", "Confluence present"] },
  { id: "momentum", title: "Momentum", items: ["Momentum in direction", "No divergence against"] },
  { id: "session", title: "Session", items: ["Session overlap / key time", "Session filter passed"] },
  { id: "risk", title: "Risk Management", items: ["Stop loss defined", "Position size within risk", "R:R acceptable"] },
];

export function ValidatorPanel() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card
        className="border"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            Trade Validator
          </CardTitle>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm" style={{ color: "var(--aa-text-muted)" }}>
              Score
            </span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--aa-panel-hover)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: "0%", background: "linear-gradient(90deg, var(--aa-accent), var(--aa-accent-mid))" }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums" style={{ color: "var(--aa-text)" }}>
              0%
            </span>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <Card
            key={section.id}
            className="border transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
            style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
          >
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--aa-text)" }}>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox id={`${section.id}-${item}`} className="border-[var(--aa-border)]" />
                  <Label
                    htmlFor={`${section.id}-${item}`}
                    className="text-sm cursor-pointer"
                    style={{ color: "var(--aa-text-muted)" }}
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
