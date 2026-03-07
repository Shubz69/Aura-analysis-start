import { JournalClient } from "./JournalClient";
import { BYPASS_AUTH } from "@/lib/appConfig";
import { DEMO_TRADES } from "@/lib/demo-data";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string }>;
}) {
  const params = await searchParams;
  const openTradeId = params.trade ?? null;
  const initialTrades = BYPASS_AUTH ? DEMO_TRADES : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
      <JournalClient initialTrades={initialTrades} openTradeId={openTradeId} />
    </div>
  );
}
