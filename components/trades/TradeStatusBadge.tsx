import { cn } from "@/lib/utils";

interface TradeStatusBadgeProps {
  status: string;
  className?: string;
}

export function TradeStatusBadge({ status, className }: TradeStatusBadgeProps) {
  const result = status?.toLowerCase() ?? "open";

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md text-xs font-medium uppercase",
        result === "open" && "bg-muted text-muted-foreground",
        result === "win" && "bg-emerald-500/20 text-emerald-500",
        result === "loss" && "bg-red-500/20 text-red-500",
        result === "breakeven" && "bg-blue-500/20 text-blue-500",
        className
      )}
    >
      {result === "breakeven" ? "BE" : result}
    </span>
  );
}
