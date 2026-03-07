"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TradeCalculatorForm, type ComputedValues } from "@/components/forms/TradeCalculatorForm";
import type { TradeCalculatorForm as TradeCalculatorFormType } from "@/lib/validations/trade";
import type { Asset } from "@/types";
import {
  calcChecklistPercent,
  calcTradeGrade,
} from "@/lib/trade-calculations";

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
    values: TradeCalculatorFormType & { computed: ComputedValues }
  ) {
    setSaving(true);
    const supabase = createClient();
    const { computed } = values;
    const asset = assets.find((a) => a.symbol === values.pair);
    const checklistTotal = 0;
    const checklistScore = 0;
    const checklistPercent = calcChecklistPercent(checklistScore, checklistTotal);
    const tradeGrade = calcTradeGrade(checklistPercent);

    const { error } = await supabase.from("trades").insert({
      user_id: userId,
      pair: values.pair,
      asset_id: asset?.id ?? null,
      asset_class: asset?.asset_class ?? "forex",
      direction: values.direction,
      session: values.session || null,
      account_balance: values.accountBalance,
      risk_percent: values.riskPercent,
      risk_amount: computed.riskAmount,
      entry_price: values.entryPrice,
      stop_loss: values.stopLoss,
      take_profit: values.takeProfit,
      stop_loss_pips: computed.stopLossPips,
      take_profit_pips: computed.takeProfitPips,
      rr: computed.rr,
      position_size: computed.positionSize,
      potential_profit: computed.potentialProfit,
      potential_loss: computed.potentialLoss,
      result: "open",
      pnl: 0,
      r_multiple: 0,
      checklist_score: checklistScore,
      checklist_total: checklistTotal,
      checklist_percent: checklistPercent,
      trade_grade: tradeGrade,
      notes: values.notes || null,
    });

    setSaving(false);
    if (error) {
      console.error(error);
      return;
    }
    router.push("/dashboard/journal");
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
