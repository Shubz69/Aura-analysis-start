import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TradeCalculatorPageClient } from "./TradeCalculatorPageClient";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function TradeCalculatorPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("default_account_balance, default_risk_percent").eq("id", user.id).single();
  const { data: assets } = await supabase.from("assets").select("*").eq("is_active", true).order("symbol");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trade Calculator</h1>
      <TradeCalculatorPageClient
        assets={assets ?? []}
        defaultBalance={profile?.default_account_balance ?? null}
        defaultRisk={profile?.default_risk_percent ?? null}
        userId={user.id}
      />
    </div>
  );
}
