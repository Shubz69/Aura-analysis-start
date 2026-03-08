"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tradeCalculatorSchema, type TradeCalculatorForm as TradeCalculatorFormValues } from "@/lib/validations/trade";
import {
  calcRiskAmount,
  calcStopLossDistance,
  calcTakeProfitDistance,
  calcRR,
  calcPositionSize,
  calcPotentialProfit,
  calcPotentialLoss,
} from "@/lib/trade-calculations";
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
import { formatCurrencySafe, formatRR, formatDistance, formatPositionSize, getPositionSizeKind } from "@/lib/utils";
import { getAssetMetadata, ASSET_CLASS_ORDER, ASSET_CLASS_LABELS } from "@/lib/config/auraAnalysisAssets";
import { getEntryPlaceholder, getStopPlaceholder, getTpPlaceholder } from "@/lib/config/assetExamples";
import {
  DEFAULT_CHECKLIST_ITEMS,
  CHECKLIST_TOTAL,
  calcChecklistPercent,
  checklistPercentToGrade,
} from "@/lib/config/checklistDefault";
import { PairSelect } from "@/components/calculator/PairSelect";
import { ChecklistSection } from "@/components/calculator/ChecklistSection";
import type { Asset } from "@/types";
import { AlertTriangle } from "lucide-react";

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
  stopLossPips: number;
  takeProfitPips: number;
  rr: number;
  positionSize: number;
  potentialProfit: number;
  potentialLoss: number;
  rMultiple: number;
  checklistScore: number;
  checklistTotal: number;
  checklistPercent: number;
  tradeGrade: string;
}

const MIN_CHECKLIST_WARNING_PERCENT = 60;

export function TradeCalculatorForm({
  assets,
  defaultBalance = 10000,
  defaultRisk = 1,
  onSave,
  saving = false,
}: TradeCalculatorFormProps) {
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [checklistChecked, setChecklistChecked] = useState<Set<string>>(new Set());
  const [showLowChecklistWarning, setShowLowChecklistWarning] = useState(false);
  const forceSaveRef = useRef(false);
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

  const assetMeta = useMemo(() => assets.find((a) => a.symbol === pair), [assets, pair]);
  const assetConfig = useMemo(() => getAssetMetadata(pair), [pair]);
  const registryMeta = useMemo(
    () =>
      assetMeta
        ? {
            pip_multiplier: assetMeta.pip_multiplier,
            pip_value_hint: assetMeta.pip_value_hint ?? undefined,
            contract_size_hint: assetMeta.contract_size_hint ?? undefined,
            quote_type: assetMeta.quote_type ?? undefined,
          }
        : {
            pip_multiplier: assetConfig.pipMultiplier,
            pip_value_hint: assetConfig.pipValueHint ?? undefined,
            contract_size_hint: assetConfig.contractSizeHint ?? undefined,
            quote_type: assetConfig.quoteType ?? undefined,
          },
    [assetMeta, assetConfig]
  );

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
    if (stop === entry || tp === entry) return null;
    const riskAmount = calcRiskAmount(balance, riskPercent);
    const stopLossPips = calcStopLossDistance(entry, stop, pair, registryMeta);
    const takeProfitPips = calcTakeProfitDistance(entry, tp, pair, registryMeta);
    const rr = calcRR(entry, stop, tp);
    const positionSize = calcPositionSize({
      balance,
      riskPercent,
      entry,
      stop,
      symbol: pair,
      registryMeta,
    });
    const potentialProfit = calcPotentialProfit(entry, tp, positionSize, pair, registryMeta);
    const potentialLoss = calcPotentialLoss(entry, stop, positionSize, pair, registryMeta);
    const rMultiple = riskAmount > 0 ? potentialProfit / riskAmount : 0;
    const checklistScore = checklistChecked.size;
    const checklistPercent = calcChecklistPercent(checklistScore, CHECKLIST_TOTAL);
    const tradeGrade = checklistPercentToGrade(checklistPercent);
    return {
      riskAmount,
      stopLossPips,
      takeProfitPips,
      rr,
      positionSize,
      potentialProfit,
      potentialLoss,
      rMultiple,
      checklistScore,
      checklistTotal: CHECKLIST_TOTAL,
      checklistPercent,
      tradeGrade,
    };
  }, [entry, stop, tp, balance, riskPercent, pair, registryMeta, checklistChecked.size]);

  useEffect(() => {
    form.setValue("direction", direction);
  }, [direction, form]);

  function toggleChecklist(id: string) {
    setChecklistChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(values: TradeCalculatorFormValues) {
    if (!computed) return;
    const checklistPercent = calcChecklistPercent(checklistChecked.size, CHECKLIST_TOTAL);
    if (!forceSaveRef.current && checklistPercent < MIN_CHECKLIST_WARNING_PERCENT) {
      setShowLowChecklistWarning(true);
      return;
    }
    forceSaveRef.current = false;
    const checklist: ChecklistSavePayload = {
      checklistScore: checklistChecked.size,
      checklistTotal: CHECKLIST_TOTAL,
      checklistPercent,
      tradeGrade: checklistPercentToGrade(checklistPercent),
      checklistItems: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        id: item.id,
        label: item.label,
        passed: checklistChecked.has(item.id),
      })),
    };
    onSave?.({ ...values, computed, checklist });
  }

  function handleSaveAnyway() {
    setShowLowChecklistWarning(false);
    forceSaveRef.current = true;
    form.handleSubmit(onSubmit)();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {showLowChecklistWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">Low checklist score</p>
            <p className="mt-0.5 text-muted-foreground">Your confluence checklist is below 60%. Consider completing more items before saving, or save anyway if you have a valid reason.</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowLowChecklistWarning(false)}>
                Go back
              </Button>
              <Button type="button" size="sm" onClick={handleSaveAnyway}>
                Save anyway
              </Button>
            </div>
          </div>
        </div>
      )}
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
              <>
                <p className="text-muted-foreground">Enter entry, stop loss, and take profit to see risk, position size, and P/L.</p>
                {pair && (
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Checklist (updates live)</p>
                    <Row label="Checklist score" value={`${checklistChecked.size} / ${CHECKLIST_TOTAL}`} />
                    <Row label="Checklist percent" value={`${calcChecklistPercent(checklistChecked.size, CHECKLIST_TOTAL)}%`} />
                    <Row label="Trade grade" value={checklistPercentToGrade(calcChecklistPercent(checklistChecked.size, CHECKLIST_TOTAL))} />
                  </div>
                )}
              </>
            ) : (
              <>
                <Row label="Risk amount" value={formatCurrencySafe(computed.riskAmount)} />
                <Row label={`Stop loss (${assetConfig.distanceType === "pip" ? "pips" : assetConfig.distanceType === "point" ? "pts" : "units"})`} value={formatDistance(computed.stopLossPips, assetConfig.distanceType, 1)} />
                <Row label={`Take profit (${assetConfig.distanceType === "pip" ? "pips" : assetConfig.distanceType === "point" ? "pts" : "units"})`} value={formatDistance(computed.takeProfitPips, assetConfig.distanceType, 1)} />
                <Row label="Risk:reward" value={formatRR(computed.rr)} />
                <Row label={`Position size (${getPositionSizeKind(assetConfig.assetClass)})`} value={formatPositionSize(computed.positionSize, getPositionSizeKind(assetConfig.assetClass), 4)} />
                <Row label="Potential profit" value={formatCurrencySafe(computed.potentialProfit)} className="text-emerald-500" />
                <Row label="Potential loss" value={formatCurrencySafe(computed.potentialLoss)} className="text-red-500" />
                <Row label="R multiple (if TP hit)" value={formatRR(computed.rMultiple)} />
                <div className="border-t border-border pt-3 mt-3">
                  <Row label="Checklist score" value={`${computed.checklistScore} / ${computed.checklistTotal}`} />
                  <Row label="Checklist percent" value={`${computed.checklistPercent}%`} />
                  <Row label="Trade grade" value={computed.tradeGrade} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ChecklistSection
        items={DEFAULT_CHECKLIST_ITEMS}
        checked={checklistChecked}
        onToggle={toggleChecklist}
      />

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
