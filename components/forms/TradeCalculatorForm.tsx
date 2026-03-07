"use client";

import { useEffect, useMemo, useState } from "react";
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
import { formatCurrencySafe, formatNumber, formatRR, formatDistance, formatPositionSize } from "@/lib/utils";
import { getAssetMetadata } from "@/lib/config/auraAnalysisAssets";
import type { Asset } from "@/types";

interface TradeCalculatorFormProps {
  assets: Asset[];
  defaultBalance?: number | null;
  defaultRisk?: number | null;
  onSave?: (values: TradeCalculatorFormValues & { computed: ComputedValues }) => void;
  saving?: boolean;
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
}

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

  const assetMeta = useMemo(() => assets.find((a) => a.symbol === pair), [assets, pair]);
  const assetConfig = useMemo(() => getAssetMetadata(pair), [pair]);
  const registryMeta = useMemo(
    () =>
      assetMeta
        ? {
            pip_multiplier: assetMeta.pip_multiplier,
            pip_value_hint: assetMeta.pip_value_hint ?? undefined,
            contract_size_hint: assetMeta.contract_size_hint ?? undefined,
          }
        : {
            pip_multiplier: assetConfig.pipMultiplier,
            pip_value_hint: assetConfig.pipValueHint ?? undefined,
            contract_size_hint: assetConfig.contractSizeHint ?? undefined,
          },
    [assetMeta, assetConfig]
  );

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
    return {
      riskAmount,
      stopLossPips,
      takeProfitPips,
      rr,
      positionSize,
      potentialProfit,
      potentialLoss,
      rMultiple,
    };
  }, [entry, stop, tp, balance, riskPercent, pair, registryMeta]);

  useEffect(() => {
    form.setValue("direction", direction);
  }, [direction, form]);

  const assetOptions = useMemo(() => assets.filter((a) => a.is_active), [assets]);

  function onSubmit(values: TradeCalculatorFormValues) {
    if (!computed) return;
    onSave?.({ ...values, computed });
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
                <Select
                  value={pair}
                  onValueChange={(v) => form.setValue("pair", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-[280px]" position="popper">
                    {assetOptions.map((a) => (
                      <SelectItem key={a.id} value={a.symbol}>
                        {a.symbol} — {a.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  step="any"
                  {...form.register("entryPrice")}
                />
                {form.formState.errors.entryPrice && (
                  <p className="text-xs text-destructive">{form.formState.errors.entryPrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="any"
                  {...form.register("stopLoss")}
                />
                {form.formState.errors.stopLoss && (
                  <p className="text-xs text-destructive">{form.formState.errors.stopLoss.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="any"
                  {...form.register("takeProfit")}
                />
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
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {computed ? (
              <>
                <Row label="Risk amount" value={formatCurrencySafe(computed.riskAmount)} />
                <Row label={`Stop loss (${assetConfig.distanceType === "pip" ? "pips" : assetConfig.distanceType === "point" ? "pts" : "units"})`} value={formatDistance(computed.stopLossPips, assetConfig.distanceType, 1)} />
                <Row label={`Take profit (${assetConfig.distanceType === "pip" ? "pips" : assetConfig.distanceType === "point" ? "pts" : "units"})`} value={formatDistance(computed.takeProfitPips, assetConfig.distanceType, 1)} />
                <Row label="Risk:reward" value={formatRR(computed.rr)} />
                <Row label="Position size" value={formatPositionSize(computed.positionSize, assetConfig.assetClass === "indices" ? "contracts" : "lots", 4)} />
                <Row label="Potential profit" value={formatCurrencySafe(computed.potentialProfit)} className="text-emerald-500" />
                <Row label="Potential loss" value={formatCurrencySafe(computed.potentialLoss)} className="text-red-500" />
                <Row label="R multiple (if TP hit)" value={formatRR(computed.rMultiple)} />
              </>
            ) : (
              <p className="text-muted-foreground">Enter entry, stop loss, and take profit to see calculations.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {onSave && (
        <Button type="submit" disabled={!computed || saving}>
          {saving ? "Saving…" : "Save trade"}
        </Button>
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
