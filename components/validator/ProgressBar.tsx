"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isGood = clamped >= 70;
  const isRisky = clamped >= 40 && clamped < 60;
  const isNoTrade = clamped < 40;

  const barColor =
    isNoTrade ? "bg-red-500/80" :
    isRisky ? "bg-amber-500/80" :
    isGood ? "bg-emerald-500/80" :
    "bg-blue-500/80";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "h-3 w-full overflow-hidden rounded-full bg-muted",
          barClassName
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{clamped}% complete</p>
      ) : null}
    </div>
  );
}
