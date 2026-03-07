import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  if (!isAdmin) redirect("/dashboard");

  const { data: users } = await supabase.from("profiles").select("id, full_name, username, role").order("created_at", { ascending: false });
  const { data: allTrades } = await supabase.from("trades").select("id").limit(1);
  const { data: assets } = await supabase.from("assets").select("id, symbol, display_name, asset_class, is_active").order("symbol");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <AdminClient
        users={users ?? []}
        tradesCount={allTrades?.length ?? 0}
        assets={assets ?? []}
      />
    </div>
  );
}
