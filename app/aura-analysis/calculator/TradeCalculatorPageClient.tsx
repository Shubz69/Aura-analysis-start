"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}
import {
  TradeCalculatorForm,
  type ComputedValues,
  type ChecklistSavePayload,
} from "@/components/forms/TradeCalculatorForm";
import type { TradeCalculatorForm as TradeCalculatorFormType } from "@/lib/validations/trade";
import type { Asset } from "@/types";
import { AlertCircle } from "lucide-react";

interface TradeCalculatorPageClientProps {
  assets: Asset[];
  defaultBalance: number | null;
  defaultRisk: number | null;
  userId: string;
}

export function TradeCalculatorPageClient({
  assets,
  defaultBalance,
  defaultRisk,
  userId: _userId,
}: TradeCalculatorPageClientProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave(
    values: TradeCalculatorFormType & {
      computed: ComputedValues;
      checklist: ChecklistSavePayload;
    }
  ) {
    setSaving(true);
    const asset = assets.find((a) => a.symbol === values.pair);
    const assetClass = asset?.asset_class ?? "forex";
    const payload = {
      pair: values.pair,
      asset_id: asset?.id ?? null,
      asset_class: assetClass,
      direction: values.direction,
      session: values.session || null,
      account_balance: values.accountBalance,
      risk_percent: values.riskPercent,
      risk_amount: values.computed.riskAmount,
      entry_price: values.entryPrice,
      stop_loss: values.stopLoss,
      take_profit: values.takeProfit,
      stop_loss_pips: values.computed.stopLossPips,
      take_profit_pips: values.computed.takeProfitPips,
      rr: values.computed.rr,
      position_size: values.computed.positionSize,
      potential_profit: values.computed.potentialProfit,
      potential_loss: values.computed.potentialLoss,
      result: "open",
      pnl: 0,
      r_multiple: 0,
      checklist_score: values.checklist.checklistScore,
      checklist_total: values.checklist.checklistTotal,
      checklist_percent: values.checklist.checklistPercent,
      trade_grade: values.checklist.tradeGrade,
      notes: values.notes || null,
    };
    setSaveError(null);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/aura-analysis/trades", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          res.status === 401
            ? "Sign in to save trades. Use the login page to sign in, then try again."
            : (err?.error ?? `Save failed (${res.status})`);
        setSaveError(msg);
        setSaving(false);
        return;
      }
      // Redirect to dashboard so updated numbers (KPIs, charts) are visible
      router.push("/aura-analysis");
      router.refresh();
    } catch (e) {
      console.error("Save trade", e);
      setSaveError(e instanceof Error ? e.message : "Failed to save trade");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      <TradeCalculatorForm
        assets={assets}
        defaultBalance={defaultBalance}
        defaultRisk={defaultRisk}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
