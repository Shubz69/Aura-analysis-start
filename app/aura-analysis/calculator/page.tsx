import { TradeCalculatorPageClient } from "./TradeCalculatorPageClient";
import { DEFAULT_CALCULATOR_ASSETS } from "@/lib/calculator-defaults";

export default async function TradeCalculatorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Calculator</h1>
      <TradeCalculatorPageClient
        assets={DEFAULT_CALCULATOR_ASSETS}
        defaultBalance={null}
        defaultRisk={null}
        userId=""
      />
    </div>
  );
}
