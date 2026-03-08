"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistCard } from "./ChecklistCard";
import { ProgressBar } from "./ProgressBar";
import {
  getScoreLabel,
  calculateTotalScore,
  clampPercent,
} from "@/lib/validator/scoreCalculator";
import {
  CHECKLIST_SECTIONS,
  getPointsByItemId,
  TOTAL_POINTS,
  getSectionScore,
} from "@/lib/validator/checklistSections";
import { cn } from "@/lib/utils";
import { ClipboardCheck, TrendingUp } from "lucide-react";

const STORAGE_KEY = "aura-trade-validator-checked";

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveChecked(checked: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checked)));
  } catch {
    // ignore
  }
}

export function TradeValidator() {
  const [checked, setChecked] = useState<Set<string>>(loadChecked);

  const pointsByItemId = useMemo(() => getPointsByItemId(), []);
  const totalScore = useMemo(
    () =>
      calculateTotalScore(checked, pointsByItemId, TOTAL_POINTS),
    [checked, pointsByItemId]
  );
  const label = useMemo(() => getScoreLabel(totalScore), [totalScore]);
  const clampedScore = clampPercent(totalScore);

  const handleToggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          Trade Validator
        </h1>
        <p className="mt-1 text-muted-foreground">
          Confluence scoring engine — confirm your setup before execution.
        </p>
      </div>

      <Card className="border-border/80 bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Trade Score
              </p>
              <div className="flex items-baseline gap-3">
                <span
                  className={cn(
                    "text-4xl font-bold tabular-nums transition-colors",
                    clampedScore >= 70 && "text-emerald-600 dark:text-emerald-400",
                    clampedScore >= 40 &&
                      clampedScore < 70 &&
                      "text-amber-600 dark:text-amber-400",
                    clampedScore < 40 && "text-red-600 dark:text-red-400"
                  )}
                >
                  {totalScore}%
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Status
                </span>
              </div>
              <p
                className={cn(
                  "text-lg font-semibold",
                  clampedScore >= 70 && "text-emerald-600 dark:text-emerald-400",
                  clampedScore >= 40 &&
                    clampedScore < 70 &&
                    "text-amber-600 dark:text-amber-400",
                  clampedScore < 40 && "text-red-600 dark:text-red-400"
                )}
              >
                {label}
              </p>
            </div>
            <div className="w-full sm:w-64">
              <ProgressBar value={clampedScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {CHECKLIST_SECTIONS.map((section) => (
          <ChecklistCard
            key={section.id}
            section={section}
            checked={checked}
            onToggle={handleToggle}
            sectionScore={getSectionScore(section, checked)}
          />
        ))}
      </div>
    </div>
  );
}
