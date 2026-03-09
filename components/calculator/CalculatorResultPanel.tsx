import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencySafe, formatRR, formatDistance, formatPositionSize } from "@/lib/utils";
import type { ComputedValues } from "@/components/forms/TradeCalculatorForm";

interface CalculatorResultPanelProps {
  pair: string;
  computed: ComputedValues | null;
  instrumentSpec: { pricePrecision: number };
  accountBalance?: number;
}

export function CalculatorResultPanel({ pair, computed, instrumentSpec, accountBalance = 0 }: CalculatorResultPanelProps) {
  const actualRiskPercent =
    accountBalance > 0 && computed && computed.riskAmount >= 0
      ? ((computed.riskAmount / accountBalance) * 100).toFixed(2) + "%"
      : "—";

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Calculated</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!pair ? (
          <p className="text-muted-foreground">Select a pair to see instrument-specific labels and calculations.</p>
        ) : !computed ? (
          <p className="text-muted-foreground">Enter entry, stop loss, and take profit to see distances and suggest position size.</p>
        ) : (
          <>
            {computed.suggestedPositionSize != null && computed.positionSize === 0 && (
              <Row
                label="Suggested size"
                value={formatPositionSize(computed.suggestedPositionSize, computed.suggestedPositionUnitLabel ?? computed.positionUnitLabel)}
              />
            )}
            <Row label="Position size" value={formatPositionSize(computed.positionSize, computed.positionUnitLabel)} />
            <Row label="Stop distance (price)" value={computed.stopDistancePrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: instrumentSpec.pricePrecision })} />
            <Row label="Take profit distance (price)" value={computed.takeProfitDistancePrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: instrumentSpec.pricePrecision })} />
            {computed.altUnitLabel != null && computed.stopDistanceAlt != null && computed.takeProfitDistanceAlt != null && (
              <>
                <Row label={`Stop distance (${computed.altUnitLabel})`} value={formatDistance(computed.stopDistanceAlt, computed.altUnitLabel === "pips" ? "pip" : computed.altUnitLabel === "ticks" ? "ticks" : "point", 2)} />
                <Row label={`Take profit distance (${computed.altUnitLabel})`} value={formatDistance(computed.takeProfitDistanceAlt, computed.altUnitLabel === "pips" ? "pip" : computed.altUnitLabel === "ticks" ? "ticks" : "point", 2)} />
              </>
            )}
            <Row label="Risk:Reward" value={formatRR(computed.riskReward)} />
            {computed.positionSize > 0 && (
              <>
                <Row label="Actual risk amount" value={formatCurrencySafe(computed.riskAmount)} />
                <Row label="Actual risk %" value={actualRiskPercent} />
              </>
            )}
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
