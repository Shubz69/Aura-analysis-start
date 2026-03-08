"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TradeCalculatorForm,
  type ComputedValues,
  type ChecklistSavePayload,
} from "@/components/forms/TradeCalculatorForm";
import type { TradeCalculatorForm as TradeCalculatorFormType } from "@/lib/validations/trade";
import type { Asset } from "@/types";

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
  userId,
}: TradeCalculatorPageClientProps) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(
    values: TradeCalculatorFormType & {
      computed: ComputedValues;
      checklist: ChecklistSavePayload;
    }
  ) {
    setSaving(true);
    // Payload includes: pair, direction, accountBalance, riskPercent, entryPrice, stopLoss, takeProfit,
    // session, notes, computed (riskAmount, stopLossPips, takeProfitPips, rr, positionSize, potentialProfit,
    // potentialLoss, rMultiple, checklistScore, checklistTotal, checklistPercent, tradeGrade),
    // checklist (checklistScore, checklistTotal, checklistPercent, tradeGrade, checklistItems).
    // Trade persistence will use existing Aura FX API when available.
    void values;
    void userId;
    setSaving(false);
    router.push("/aura-analysis/journal");
    router.refresh();
  }

  return (
    <TradeCalculatorForm
      assets={assets}
      defaultBalance={defaultBalance}
      defaultRisk={defaultRisk}
      onSave={handleSave}
      saving={saving}
    />
  );
}
