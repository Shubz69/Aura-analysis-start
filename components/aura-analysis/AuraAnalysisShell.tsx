"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ROUTE } from "@/lib/appConfig";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "token";

const TABS: { href: string; label: string }[] = [
  { href: "/aura-analysis", label: "Overview" },
  { href: "/aura-analysis/calculator", label: "Trade Calculator" },
  { href: "/aura-analysis/validator", label: "Trade Validator" },
  { href: "/aura-analysis/journal", label: "Trade Journal" },
  { href: "/aura-analysis/analytics", label: "Analytics" },
  { href: "/aura-analysis/leaderboard", label: "Leaderboard" },
  { href: "/aura-analysis/profile", label: "Profile" },
];

export function AuraAnalysisShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
    router.push(DASHBOARD_ROUTE);
  }

  return (
    <div
      className="aura-analysis-shell min-h-screen flex flex-col"
      style={{ background: "var(--aa-bg)" }}
    >
      {/* 1. Aura FX style top header strip */}
      <header
        className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6"
        style={{
          background: "var(--aa-bg-elevated)",
          borderColor: "var(--aa-border)",
          boxShadow: "0 1px 0 0 var(--aa-border-glow)",
        }}
      >
        <Link
          href="/"
          className="font-semibold tracking-tight"
          style={{ color: "var(--aa-text)", fontSize: "1.05rem" }}
        >
          AURA FX
        </Link>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span
              className="hidden sm:inline truncate max-w-[200px] text-sm"
              style={{ color: "var(--aa-text-muted)" }}
            >
              {userEmail}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-[var(--aa-text-muted)] hover:text-[var(--aa-text)] hover:bg-[var(--aa-panel)]"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* 2. Aura Analysis hero / header block */}
      <div
        className="border-b px-4 py-6 md:px-6"
        style={{
          background: "var(--aa-bg-deep)",
          borderColor: "var(--aa-border)",
          boxShadow: "0 1px 0 0 var(--aa-border-glow)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: "var(--aa-text)" }}
            >
              Aura Analysis
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--aa-text-muted)" }}
            >
              Manual trade planning, validation and journaling tools
            </p>
          </div>
          <Button
            asChild
            className="rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(123,92,255,0.35)]"
            style={{
              background: "linear-gradient(135deg, var(--aa-accent) 0%, var(--aa-accent-mid) 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 0 16px rgba(123, 92, 255, 0.25)",
            }}
          >
            <Link href="/aura-analysis/calculator">
              <Plus className="mr-2 h-4 w-4" />
              Quick Add Trade
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. Internal tab bar (in-page tool tabs) */}
      <div
        className="border-b px-4 py-2 md:px-6"
        style={{
          background: "var(--aa-panel)",
          borderColor: "var(--aa-border)",
        }}
      >
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-1"
          aria-label="Aura Analysis sections"
        >
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/aura-analysis"
                ? pathname === "/aura-analysis"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  "hover:opacity-90"
                )}
                style={{
                  background: isActive ? "rgba(123, 92, 255, 0.2)" : "transparent",
                  color: isActive ? "var(--aa-text)" : "var(--aa-text-muted)",
                  borderBottom: isActive ? "2px solid var(--aa-accent)" : "2px solid transparent",
                  boxShadow: isActive ? "0 0 12px rgba(123, 92, 255, 0.2)" : "none",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 4. Content area – max-width, centered, premium spacing */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
