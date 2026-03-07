"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TradeCalculatorForm, type ComputedValues } from "@/components/forms/TradeCalculatorForm";
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
    _values: TradeCalculatorFormType & { computed: ComputedValues }
  ) {
    setSaving(true);
    // Trade persistence will use existing Aura FX API when available.
    setSaving(false);
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
