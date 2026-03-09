"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tradeCalculatorSchema, type TradeCalculatorForm as TradeCalculatorFormValues } from "@/lib/validations/trade";
import { calculateRisk } from "@/lib/calculators/calculateRisk";
import { getInstrumentOrFallback } from "@/lib/instruments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrencySafe, formatRR, formatDistance, formatPositionSize } from "@/lib/utils";
import { ASSET_CLASS_ORDER, ASSET_CLASS_LABELS } from "@/lib/config/auraAnalysisAssets";
import { getAssetMetadata } from "@/lib/config/auraAnalysisAssets";
import { getEntryPlaceholder, getStopPlaceholder, getTpPlaceholder } from "@/lib/config/assetExamples";
import { PairSelect } from "@/components/calculator/PairSelect";
import type { Asset } from "@/types";

interface TradeCalculatorFormProps {
  assets: Asset[];
  defaultBalance?: number | null;
  defaultRisk?: number | null;
  onSave?: (values: TradeCalculatorFormValues & { computed: ComputedValues; checklist: ChecklistSavePayload }) => void;
  saving?: boolean;
}

export interface ChecklistSavePayload {
  checklistScore: number;
  checklistTotal: number;
  checklistPercent: number;
  tradeGrade: string;
  checklistItems: { id: string; label: string; passed: boolean }[];
}

export interface ComputedValues {
  riskAmount: number;
  stopDistancePrice: number;
  takeProfitDistancePrice: number;
  stopDistanceAlt?: number;
  takeProfitDistanceAlt?: number;
  altUnitLabel?: "pips" | "points" | "ticks";
  riskReward: number;
  positionSize: number;
  positionUnitLabel: "lots" | "shares" | "contracts" | "units";
  potentialProfit: number;
  potentialLoss: number;
  rMultiple: number;
  stopLossPips: number;
  takeProfitPips: number;
  rr: number;
  checklistScore: number;
  checklistTotal: number;
  checklistPercent: number;
  tradeGrade: string;
  warnings: string[];
}

const NO_CHECKLIST_PAYLOAD: ChecklistSavePayload = {
  checklistScore: 0,
  checklistTotal: 0,
  checklistPercent: 0,
  tradeGrade: "—",
  checklistItems: [],
};

export function TradeCalculatorForm({
  assets,
  defaultBalance = 10000,
  defaultRisk = 1,
  onSave,
  saving = false,
}: TradeCalculatorFormProps) {
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const form = useForm<TradeCalculatorFormValues>({
    resolver: zodResolver(tradeCalculatorSchema),
    defaultValues: {
      pair: "EURUSD",
      direction: "buy",
      accountBalance: defaultBalance ?? 10000,
      riskPercent: defaultRisk ?? 1,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      session: "",
      notes: "",
    },
  });

  const watchValues = form.watch();
  const pair = watchValues.pair || "EURUSD";
  const balance = watchValues.accountBalance || 0;
  const riskPercent = watchValues.riskPercent || 0;
  const entry = watchValues.entryPrice || 0;
  const stop = watchValues.stopLoss || 0;
  const tp = watchValues.takeProfit || 0;

  const assetConfig = useMemo(() => getAssetMetadata(pair), [pair]);
  const instrumentSpec = useMemo(() => getInstrumentOrFallback(pair), [pair]);

  const pairOptions = useMemo(
    () => assets.filter((a) => a.is_active).map((a) => ({ symbol: a.symbol, displayName: a.display_name })),
    [assets]
  );

  const pairOptionGroups = useMemo(() => {
    const active = assets.filter((a) => a.is_active);
    return ASSET_CLASS_ORDER.map((cls) => ({
      label: ASSET_CLASS_LABELS[cls],
      options: active
        .filter((a) => a.asset_class === cls)
        .map((a) => ({ symbol: a.symbol, displayName: a.display_name })),
    })).filter((g) => g.options.length > 0);
  }, [assets]);

  const stepForPrecision = useMemo(() => {
    const p = assetConfig.pricePrecision;
    if (p === 0) return "1";
    return String(10 ** -p);
  }, [assetConfig.pricePrecision]);

  const entryPlaceholder = useMemo(() => getEntryPlaceholder(pair), [pair]);
  const stopPlaceholder = useMemo(() => getStopPlaceholder(pair), [pair]);
  const tpPlaceholder = useMemo(() => getTpPlaceholder(pair), [pair]);

  const computed = useMemo((): ComputedValues | null => {
    if (!entry || !stop || !tp || balance <= 0 || riskPercent <= 0) return null;
    const result = calculateRisk(pair, {
      accountBalance: balance,
      riskPercent,
      entry,
      stop,
      takeProfit: tp,
      direction,
    });
    const stopLossPips = result.stopDistanceAlt ?? result.stopDistancePrice;
    const takeProfitPips = result.takeProfitDistanceAlt ?? result.takeProfitDistancePrice;
    return {
      riskAmount: result.riskAmount,
      stopDistancePrice: result.stopDistancePrice,
      takeProfitDistancePrice: result.takeProfitDistancePrice,
      stopDistanceAlt: result.stopDistanceAlt,
      takeProfitDistanceAlt: result.takeProfitDistanceAlt,
      altUnitLabel: result.altUnitLabel,
      riskReward: result.riskReward,
      positionSize: result.positionSize,
      positionUnitLabel: result.positionUnitLabel,
      potentialProfit: result.potentialProfit,
      potentialLoss: result.potentialLoss,
      rMultiple: result.rMultiple,
      stopLossPips,
      takeProfitPips,
      rr: result.riskReward,
      checklistScore: 0,
      checklistTotal: 0,
      checklistPercent: 0,
      tradeGrade: "—",
      warnings: result.warnings,
    };
  }, [entry, stop, tp, balance, riskPercent, pair, direction]);

  useEffect(() => {
    form.setValue("direction", direction);
  }, [direction, form]);

  function onSubmit(values: TradeCalculatorFormValues) {
    if (!computed) return;
    onSave?.({ ...values, computed, checklist: NO_CHECKLIST_PAYLOAD });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Trade setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pair / Asset</Label>
                <PairSelect
                  value={pair}
                  options={pairOptions}
                  optionGroups={pairOptionGroups}
                  onValueChange={(v) => form.setValue("pair", v)}
                  placeholder="Select pair"
                />
                <p className="text-xs text-muted-foreground">Examples and units update by pair.</p>
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={direction === "buy" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDirection("buy")}
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={direction === "sell" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDirection("sell")}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountBalance">Account balance</Label>
              <Input
                id="accountBalance"
                type="number"
                step="any"
                {...form.register("accountBalance")}
              />
              {form.formState.errors.accountBalance && (
                <p className="text-xs text-destructive">{form.formState.errors.accountBalance.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskPercent">Risk %</Label>
              <Input
                id="riskPercent"
                type="number"
                step="0.1"
                {...form.register("riskPercent")}
              />
              {form.formState.errors.riskPercent && (
                <p className="text-xs text-destructive">{form.formState.errors.riskPercent.message}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step={stepForPrecision}
                  placeholder={entryPlaceholder || undefined}
                  {...form.register("entryPrice")}
                />
                {entryPlaceholder && (
                  <p className="text-xs text-muted-foreground">e.g. {entryPlaceholder}</p>
                )}
                {form.formState.errors.entryPrice && (
                  <p className="text-xs text-destructive">{form.formState.errors.entryPrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step={stepForPrecision}
                  placeholder={stopPlaceholder || undefined}
                  {...form.register("stopLoss")}
                />
                {stopPlaceholder && (
                  <p className="text-xs text-muted-foreground">e.g. {stopPlaceholder}</p>
                )}
                {form.formState.errors.stopLoss && (
                  <p className="text-xs text-destructive">{form.formState.errors.stopLoss.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step={stepForPrecision}
                  placeholder={tpPlaceholder || undefined}
                  {...form.register("takeProfit")}
                />
                {tpPlaceholder && (
                  <p className="text-xs text-muted-foreground">e.g. {tpPlaceholder}</p>
                )}
                {form.formState.errors.takeProfit && (
                  <p className="text-xs text-destructive">{form.formState.errors.takeProfit.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session (optional)</Label>
              <Select
                value={watchValues.session || ""}
                onValueChange={(v) => form.setValue("session", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="London/NY Overlap">London/NY Overlap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" placeholder="Trade notes…" {...form.register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!pair ? (
              <p className="text-muted-foreground">Select a pair to see instrument-specific labels and calculations.</p>
            ) : !computed ? (
              <p className="text-muted-foreground">Enter entry, stop loss, and take profit to see risk, position size, and P/L.</p>
            ) : (
              <>
                <Row label="Risk amount" value={formatCurrencySafe(computed.riskAmount)} />
                <Row label="Stop distance (price)" value={computed.stopDistancePrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: instrumentSpec.pricePrecision })} />
                <Row label="Take profit distance (price)" value={computed.takeProfitDistancePrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: instrumentSpec.pricePrecision })} />
                {computed.altUnitLabel != null && computed.stopDistanceAlt != null && computed.takeProfitDistanceAlt != null && (
                  <>
                    <Row label={`Stop distance (${computed.altUnitLabel})`} value={formatDistance(computed.stopDistanceAlt, computed.altUnitLabel === "pips" ? "pip" : computed.altUnitLabel === "ticks" ? "ticks" : "point", 2)} />
                    <Row label={`Take profit distance (${computed.altUnitLabel})`} value={formatDistance(computed.takeProfitDistanceAlt, computed.altUnitLabel === "pips" ? "pip" : computed.altUnitLabel === "ticks" ? "ticks" : "point", 2)} />
                  </>
                )}
                <Row label="Risk:Reward" value={formatRR(computed.riskReward)} />
                <Row label={`Position size (${computed.positionUnitLabel})`} value={formatPositionSize(computed.positionSize, computed.positionUnitLabel)} />
                <Row label="Potential profit" value={formatCurrencySafe(computed.potentialProfit)} className="text-emerald-500" />
                <Row label="Potential loss" value={formatCurrencySafe(computed.potentialLoss)} className="text-red-500" />
                <Row label="R multiple (if TP hit)" value={formatRR(computed.rMultiple)} />
                {computed.warnings.length > 0 && (
                  <div className="mt-3 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                    {computed.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {onSave && (
        <div className="pt-2">
          <Button type="submit" disabled={!computed || saving} className="min-w-[8rem]">
            {saving ? "Saving…" : "Save trade"}
          </Button>
        </div>
      )}
    </form>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={className}>{value}</span>
    </div>
  );
}
