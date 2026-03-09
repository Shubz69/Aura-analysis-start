"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(max, value));
  // Keep colors relative to 0-100 logic or dynamic if max changes.
  // The threshold logic remains 70, 40 etc regardless of max for the visual color.
  const isGood = clamped >= 70;
  const isRisky = clamped >= 40 && clamped < 70;
  const isNoTrade = clamped < 40;

  const barColor =
    isNoTrade ? "bg-red-500/80" :
    isRisky ? "bg-amber-500/80" :
    isGood ? "bg-emerald-500/80" :
    "bg-blue-500/80";

  const widthPercent = (clamped / max) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "h-3 w-full overflow-hidden rounded-full bg-muted relative",
          barClassName
        )}
      >
        <div className="absolute left-[35%] top-0 bottom-0 w-px bg-foreground/20 z-10" /> {/* 70/200 threshold indicator line */}
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out relative z-0", barColor)}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      {showLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{clamped}% complete</p>
      ) : null}
    </div>
  );
}
