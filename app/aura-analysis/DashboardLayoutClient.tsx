"use client";

import { useAuth } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  return (
    <DashboardShell userEmail={user?.email ?? null}>
      {children}
    </DashboardShell>
  );
}
