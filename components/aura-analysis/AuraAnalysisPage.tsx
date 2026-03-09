"use client";

import { useState } from "react";
import { AuraAnalysisHeader } from "./AuraAnalysisHeader";
import { AuraAnalysisTabs, type AuraAnalysisTabId } from "./AuraAnalysisTabs";
import { OverviewPanel } from "./OverviewPanel";
import { CalculatorPanel } from "./CalculatorPanel";
import { ValidatorPanel } from "./ValidatorPanel";
import { JournalPanel } from "./JournalPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { ProfilePanel } from "./ProfilePanel";
import { cn } from "@/lib/utils";

export function AuraAnalysisPage() {
  const [activeTab, setActiveTab] = useState<AuraAnalysisTabId>("overview");

  const panels: Record<AuraAnalysisTabId, React.ReactNode> = {
    overview: <OverviewPanel />,
    calculator: <CalculatorPanel />,
    validator: <ValidatorPanel />,
    journal: <JournalPanel />,
    analytics: <AnalyticsPanel />,
    leaderboard: <LeaderboardPanel />,
    profile: <ProfilePanel />,
  };

  return (
    <div className="aura-analysis-manual min-h-full" style={{ background: "var(--aa-bg)" }}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <AuraAnalysisHeader />
        <div className="mt-6">
          <AuraAnalysisTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div
          key={activeTab}
          className="mt-6 min-h-[400px] animate-in fade-in duration-300"
        >
          {panels[activeTab]}
        </div>
      </div>
    </div>
  );
}
