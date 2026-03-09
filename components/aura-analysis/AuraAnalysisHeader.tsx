"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AuraAnalysisHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight"
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
        className="rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(123,92,255,0.35)]"
        style={{
          background: "linear-gradient(135deg, var(--aa-accent) 0%, var(--aa-accent-mid) 100%)",
          color: "#fff",
          border: "none",
          boxShadow: "0 0 16px rgba(123, 92, 255, 0.25)",
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Quick Add Trade
      </Button>
    </header>
  );
}
