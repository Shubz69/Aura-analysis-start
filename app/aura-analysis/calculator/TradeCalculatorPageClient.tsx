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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useDraftTradeStore } from "@/lib/store/draftTradeStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  
  const draft = useDraftTradeStore((state) => state.draft);
  const clearDraftTrade = useDraftTradeStore((state) => state.clearDraftTrade);
  const hasValidDraft = draft?.validator && draft.validator.score >= 70;

  async function handleSave(
    values: TradeCalculatorFormType & {
      computed: ComputedValues;
      checklist: ChecklistSavePayload;
    }
  ) {
    setSaving(true);
    const asset = assets.find((a) => a.symbol === values.pair);
    const assetClass = asset?.asset_class ?? "forex";
    
    // Default assets use string IDs like "def-eurusd-0". The DB expects an INT or NULL.
    const isDefaultAsset = String(asset?.id).startsWith("def-");
    const assetId = asset?.id && !isDefaultAsset ? Number(asset.id) : null;

    const payload = {
      pair: values.pair,
      asset_id: assetId,
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
      checklist_score: draft?.validator?.score ?? 0,
      checklist_total: 100, // Total possible percentage
      checklist_percent: draft?.validator?.score ?? 0,
      trade_grade: draft?.validator?.status ?? "—",
      validator_data: draft?.validator ?? null,
      notes: values.notes || null,
      source: "validator+calculator",
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
            ? "Saving is unavailable. Ensure at least one user exists in the database to save trades."
            : (err?.error ?? `Save failed (${res.status})`);
        setSaveError(msg);
        setSaving(false);
        return;
      }
      // Redirect to dashboard so updated numbers (KPIs, charts) are visible
      clearDraftTrade();
      // Also clear the raw validator form local storage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("aura-trade-validator-checked");
      }
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
      {!hasValidDraft ? (
        <div className="flex flex-col gap-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Complete Trade Validator before submitting a trade
            </h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
              A minimum confluence score of 70% is required to execute trades.
            </p>
          </div>
          <Button asChild variant="outline" className="border-amber-500/50 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">
            <Link href="/aura-analysis/validator">Go to Trade Validator</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                Validated Trade
              </h3>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                Score: {draft.validator!.score}% • Status: {draft.validator!.status} • Passed threshold: Yes
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300">
            <Link href="/aura-analysis/validator">Edit Validator</Link>
          </Button>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      <TradeCalculatorForm
        assets={assets}
        defaultBalance={draft?.calculator?.accountBalance ?? defaultBalance}
        defaultRisk={draft?.calculator?.riskPercent ?? defaultRisk}
        defaultPair={draft?.symbol}
        defaultDirection={draft?.direction}
        onSave={hasValidDraft ? handleSave : undefined}
        saving={saving}
      />
    </div>
  );
}
