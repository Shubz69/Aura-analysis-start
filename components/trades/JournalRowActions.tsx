import { Button } from "@/components/ui/button";
import type { Trade } from "@/types";

interface JournalRowActionsProps {
  trade: Trade;
  onAction: (action: { trade: Trade; type: "win" | "loss" | "breakeven" | "edit_outcome" }) => void;
}

export function JournalRowActions({ trade, onAction }: JournalRowActionsProps) {
  const handleAction = (e: React.MouseEvent, type: "win" | "loss" | "breakeven" | "edit_outcome") => {
    e.stopPropagation();
    onAction({ trade, type });
  };

  if (trade.result === "open") {
    return (
      <div className="flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" 
          onClick={(e) => handleAction(e, "win")}
        >
          Win
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10" 
          onClick={(e) => handleAction(e, "loss")}
        >
          Loss
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10" 
          onClick={(e) => handleAction(e, "breakeven")}
        >
          BE
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-muted-foreground hover:text-foreground" 
        onClick={(e) => handleAction(e, "edit_outcome")}
      >
        Edit Outcome
      </Button>
    </div>
  );
}
