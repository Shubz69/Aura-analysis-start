"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function ProfilePanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <Card
        className="border transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            User info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p style={{ color: "var(--aa-text-muted)" }}>Email: —</p>
          <p style={{ color: "var(--aa-text-muted)" }}>Username: —</p>
          <p style={{ color: "var(--aa-text-muted)" }}>Member since: —</p>
        </CardContent>
      </Card>
      <Card
        className="border transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            Trading stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p style={{ color: "var(--aa-text-muted)" }}>Total trades: —</p>
          <p style={{ color: "var(--aa-text-muted)" }}>Win rate: —</p>
          <p style={{ color: "var(--aa-text-muted)" }}>Total PnL: —</p>
        </CardContent>
      </Card>
      <Card
        className="border md:col-span-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            Account progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--aa-panel-hover)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: "0%", background: "linear-gradient(90deg, var(--aa-accent), var(--aa-accent-mid))" }}
            />
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--aa-text-muted)" }}>
            Placeholder for goals or level progress.
          </p>
        </CardContent>
      </Card>
      <Card
        className="border md:col-span-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            Subscription status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--aa-text-muted)" }}>
            Aura Analysis (Manual) — Free tier. Placeholder for subscription or upgrade CTA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
