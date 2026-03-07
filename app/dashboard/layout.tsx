import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConfigRequired } from "@/components/ConfigRequired";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) return <ConfigRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <DashboardShell userEmail={user.email}>
      {children}
    </DashboardShell>
  );
}
