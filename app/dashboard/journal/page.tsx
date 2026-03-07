import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JournalClient } from "./JournalClient";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const openTradeId = params.trade ?? null;

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
      <JournalClient initialTrades={trades ?? []} openTradeId={openTradeId} />
    </div>
  );
}
