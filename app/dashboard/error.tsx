"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const isConfigError =
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("supabase env");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-xl font-bold tracking-tight">
          {isConfigError ? "Configuration required" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isConfigError ? (
            <>
              Set <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your
              deployment (e.g. Vercel), then redeploy.
            </>
          ) : (
            "A server error occurred loading the dashboard."
          )}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
