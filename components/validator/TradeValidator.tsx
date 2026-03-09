"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistCard } from "./ChecklistCard";
import { ProgressBar } from "./ProgressBar";
import {
  getScoreLabel,
  calculateTotalScore,
  clampPercent,
  buildValidatorData,
} from "@/lib/validator/scoreCalculator";
import {
  CHECKLIST_SECTIONS,
  getPointsByItemId,
  TOTAL_POINTS,
  getSectionScore,
} from "@/lib/validator/checklistSections";
import { cn } from "@/lib/utils";
import { ClipboardCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { useDraftTradeStore } from "@/lib/store/draftTradeStore";
import { Button } from "@/components/ui/button";

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

const SCORE_REDIRECT_THRESHOLD = 70;

export function TradeValidator() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(loadChecked);
  const createDraftFromValidator = useDraftTradeStore((state) => state.createDraftFromValidator);

  const pointsByItemId = useMemo(() => getPointsByItemId(), []);
  const totalScore = useMemo(
    () =>
      calculateTotalScore(checked, pointsByItemId, TOTAL_POINTS),
    [checked, pointsByItemId]
  );
  
  const label = useMemo(() => getScoreLabel(totalScore), [totalScore]);
  const clampedScore = clampPercent(totalScore);
  const canProceed = clampedScore >= 70;

  const handleToggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  const handleProceed = () => {
    if (!canProceed) return;

    const validatorData = buildValidatorData(checked, pointsByItemId, TOTAL_POINTS);

    createDraftFromValidator(
      "EURUSD", // default symbol, user can change later in calculator
      undefined, // direction unknown at this point
      validatorData
    );
    
    router.push("/aura-analysis/calculator");
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
                <span className="text-xl font-medium text-muted-foreground self-end mb-1">
                  / 200%
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
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
              <ProgressBar value={clampedScore} max={200} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CORE CONFLUENCE CHECKLIST</h2>
          <p className="text-sm text-muted-foreground">This is the main decision layer</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {CHECKLIST_SECTIONS.filter(s => s.layer === "core").map((section) => (
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

      <div className="space-y-4 pt-6 border-t">
        <div>
          <h2 className="text-xl font-bold tracking-tight">SETUP FORMATION CHECKLIST</h2>
          <p className="text-sm text-muted-foreground">This is supporting confirmation, not primary confirmation</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {CHECKLIST_SECTIONS.filter(s => s.layer === "formation").map((section) => (
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

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col items-center justify-between gap-4 border-t bg-background/95 p-4 py-4 px-4 backdrop-blur sm:flex-row sm:px-6">
        <div>
          {canProceed ? (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Score meets minimum requirement (70%).
            </p>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                This trade does not meet the minimum confluence requirement (70%).
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          size="lg"
          className="w-full sm:w-auto"
        >
          Use in Trade Calculator
        </Button>
      </div>
    </div>
  );
}
