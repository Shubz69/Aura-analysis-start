"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PLACEHOLDER = { positionSize: "—", stopDistance: "—", takeProfitDistance: "—", riskReward: "—", potentialProfit: "—", potentialLoss: "—", actualRiskPct: "—" };

export function CalculatorPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-2">
        <Card
          className="border transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
          style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
        >
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
              Trade setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Pair / Asset</Label>
                <Select>
                  <SelectTrigger style={{ background: "var(--aa-panel-hover)", borderColor: "var(--aa-border)" }}>
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EURUSD">EUR/USD</SelectItem>
                    <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Direction</Label>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1">Buy</Button>
                  <Button variant="outline" size="sm" className="flex-1">Sell</Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Account Balance</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Risk %</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Position Size</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Entry</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Stop Loss</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Take Profit</Label>
                <Input type="number" placeholder="0" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--aa-text-muted)" }}>Session</Label>
                <Select>
                  <SelectTrigger style={{ background: "var(--aa-panel-hover)", borderColor: "var(--aa-border)" }}>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--aa-text-muted)" }}>Notes</Label>
              <Input placeholder="Optional notes" className="bg-[var(--aa-panel-hover)] border-[var(--aa-border)]" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card
        className="border h-fit transition-all duration-200 hover:shadow-[0_0_20px_rgba(123,92,255,0.06)]"
        style={{ background: "var(--aa-panel)", borderColor: "var(--aa-border)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "var(--aa-text)" }}>
            Calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { label: "Position Size", value: PLACEHOLDER.positionSize },
            { label: "Stop Distance", value: PLACEHOLDER.stopDistance },
            { label: "Take Profit Distance", value: PLACEHOLDER.takeProfitDistance },
            { label: "Risk Reward", value: PLACEHOLDER.riskReward },
            { label: "Potential Profit", value: PLACEHOLDER.potentialProfit, className: "text-[var(--aa-success)]" },
            { label: "Potential Loss", value: PLACEHOLDER.potentialLoss, className: "text-[var(--aa-loss)]" },
            { label: "Actual Risk %", value: PLACEHOLDER.actualRiskPct },
          ].map((row) => (
            <div key={row.label} className="flex justify-between">
              <span style={{ color: "var(--aa-text-muted)" }}>{row.label}</span>
              <span className={cn(row.className)} style={!row.className ? { color: "var(--aa-text)" } : undefined}>
                {row.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
