"use client";

import { useAuth } from "@/components/AuthProvider";
import { AuraAnalysisShell } from "@/components/aura-analysis/AuraAnalysisShell";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center aura-analysis-shell"
        style={{ background: "var(--aa-bg)" }}
      >
        <p style={{ color: "var(--aa-text-muted)" }}>Checking session...</p>
      </div>
    );
  }

  return (
    <AuraAnalysisShell userEmail={user?.email ?? null}>
      {children}
    </AuraAnalysisShell>
  );
}
