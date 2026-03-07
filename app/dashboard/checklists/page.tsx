import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChecklistTemplatesClient } from "./ChecklistTemplatesClient";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function ChecklistTemplatesPage() {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("*, checklist_template_items(*)")
    .eq("is_active", true)
    .order("name");

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Checklist Templates</h1>
      <ChecklistTemplatesClient templates={templates ?? []} isAdmin={isAdmin} />
    </div>
  );
}
