"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./DashboardNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu } from "lucide-react";

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="flex-1 overflow-auto p-4">
        <DashboardNav onNavigate={() => setSheetOpen(false)} />
      </div>
      <div className="border-t border-border p-4">
        {userEmail && (
          <p className="truncate text-xs text-muted-foreground mb-2">{userEmail}</p>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 shrink-0">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-6">
          <Link href="/dashboard" className="font-semibold">
            Aura Analysis
          </Link>
        </div>
        {navContent}
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <div className="flex h-14 items-center border-b border-border px-6 font-semibold">
              Aura Analysis
            </div>
            {navContent}
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="ml-2 font-semibold">
          Aura Analysis
        </Link>
      </div>
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        <div className="container py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-full">{children}</div>
      </main>
    </div>
  );
}
