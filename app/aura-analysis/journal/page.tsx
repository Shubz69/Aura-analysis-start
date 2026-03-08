import { JournalClient } from "./JournalClient";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string }>;
}) {
  const params = await searchParams;
  const openTradeId = params.trade ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
      <JournalClient initialTrades={[]} openTradeId={openTradeId} />
    </div>
  );
}
