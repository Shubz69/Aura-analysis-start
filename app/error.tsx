"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isConfigError =
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("supabase env");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">
          {isConfigError ? "Configuration required" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isConfigError ? (
            <>
              Add your Supabase environment variables in your deployment
              (e.g. Vercel): <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then redeploy.
            </>
          ) : (
            "A server error occurred. If you just deployed, ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your project environment, then redeploy."
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
