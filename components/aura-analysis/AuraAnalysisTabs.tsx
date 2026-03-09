"use client";

import { cn } from "@/lib/utils";

export type AuraAnalysisTabId =
  | "overview"
  | "calculator"
  | "validator"
  | "journal"
  | "analytics"
  | "leaderboard"
  | "profile";

const TABS: { id: AuraAnalysisTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "calculator", label: "Trade Calculator" },
  { id: "validator", label: "Trade Validator" },
  { id: "journal", label: "Trade Journal" },
  { id: "analytics", label: "Analytics" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "profile", label: "Profile" },
];

interface AuraAnalysisTabsProps {
  activeTab: AuraAnalysisTabId;
  onTabChange: (tab: AuraAnalysisTabId) => void;
}

export function AuraAnalysisTabs({ activeTab, onTabChange }: AuraAnalysisTabsProps) {
  return (
    <div
      className="rounded-xl border p-1 flex flex-wrap gap-1"
      style={{
        background: "var(--aa-panel)",
        borderColor: "var(--aa-border)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
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
          </button>
        );
      })}
    </div>
  );
}
