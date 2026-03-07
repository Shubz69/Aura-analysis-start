import { TradeCalculatorPageClient } from "./TradeCalculatorPageClient";

export default async function TradeCalculatorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Calculator</h1>
      <TradeCalculatorPageClient
        assets={[]}
        defaultBalance={null}
        defaultRisk={null}
        userId=""
      />
    </div>
  );
}
