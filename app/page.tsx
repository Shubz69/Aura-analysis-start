import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">Aura Analysis</h1>
        <p className="text-muted-foreground">
          FX Trader Dashboard — journal trades, track performance, and grow with your community.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
