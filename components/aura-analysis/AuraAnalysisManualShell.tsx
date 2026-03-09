"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export function AuraAnalysisManualShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center aura-analysis-manual"
        style={{ background: "var(--aa-bg)" }}
      >
        <p style={{ color: "var(--aa-text-muted)" }}>Checking session...</p>
      </div>
    );
  }

  return (
    <div
      className="aura-analysis-manual min-h-screen"
      style={{ background: "var(--aa-bg)" }}
    >
      {/* Top bar: Aura FX + user (matches “Aura FX Top Navigation (already exists)” when embedded in portal) */}
      <header
        className="flex h-14 items-center justify-between border-b px-4 md:px-6"
        style={{ borderColor: "var(--aa-border)", background: "var(--aa-bg-elevated)" }}
      >
        <Link
          href="/"
          className="font-semibold"
          style={{ color: "var(--aa-text)" }}
        >
          AURA FX
        </Link>
        {user?.email && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--aa-text-muted)" }}>
            <span className="hidden sm:inline truncate max-w-[180px]">{user.email}</span>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: "var(--aa-panel)", color: "var(--aa-text)" }}>
              {user.email?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
