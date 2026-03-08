"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChecklistItemConfig } from "@/lib/config/checklistDefault";
import { calcChecklistPercent, checklistPercentToGrade, CHECKLIST_TOTAL } from "@/lib/config/checklistDefault";
import { Check } from "lucide-react";

interface ChecklistSectionProps {
  items: ChecklistItemConfig[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
}

export function ChecklistSection({
  items,
  checked,
  onToggle,
  className,
}: ChecklistSectionProps) {
  const score = checked.size;
  const percent = calcChecklistPercent(score, CHECKLIST_TOTAL);
  const grade = checklistPercentToGrade(percent);
  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card className={cn("glass border-border/80", className)}>
      <CardHeader className="pb-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">Pre-trade checklist</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Score: <span className="font-semibold text-foreground">{score} / {CHECKLIST_TOTAL}</span>
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{percent}%</span>
            </span>
            <span
              className={cn(
                "rounded-md px-2.5 py-1 font-semibold text-xs uppercase tracking-wide",
                grade === "A+" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                grade === "A" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                grade === "B" && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                grade === "C" && "bg-red-500/20 text-red-700 dark:text-red-400"
              )}
            >
              {grade}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pb-5">
        {sortedItems.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-checked={isChecked}
              aria-label={item.label}
              onClick={() => onToggle(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(item.id);
                }
              }}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isChecked && "bg-muted/40"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                  isChecked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50 bg-background"
                )}
              >
                {isChecked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              </span>
              <span className="text-sm leading-snug text-foreground">{item.label}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
