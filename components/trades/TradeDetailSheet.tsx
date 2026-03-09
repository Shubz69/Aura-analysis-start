"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatCurrencySafe, formatNumber, formatPositionSize, getPositionSizeKind } from "@/lib/utils";
import type { Trade, TradeChecklistItem } from "@/types";
import { Pencil, Trash2 } from "lucide-react";

interface TradeDetailSheetProps {
  tradeId: string;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  /** When provided (e.g. test mode or client already has trade), no fetch is made. */
  initialTrade?: Trade | null;
}

export function TradeDetailSheet({
  tradeId,
  open,
  onClose,
  onDeleted,
  initialTrade,
}: TradeDetailSheetProps) {
  const [trade, setTrade] = useState<Trade | null>(initialTrade ?? null);
  const [checklistItems, setChecklistItems] = useState<TradeChecklistItem[]>([]);
  const [loading, setLoading] = useState(!initialTrade);

  useEffect(() => {
    if (!open || !tradeId) return;
    if (initialTrade && initialTrade.id === tradeId) {
      setTrade(initialTrade);
      setLoading(false);
      return;
    }
    setLoading(true);
    setTrade(null);
    setChecklistItems([]);
    // Trade and checklist data will come from existing API when available.
    setLoading(false);
  }, [open, tradeId, initialTrade]);

  async function handleDelete() {
    if (!tradeId || (typeof window !== "undefined" && !window.confirm("Delete this trade?"))) return;
    onDeleted?.();
    onClose();
  }

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Trade details</SheetTitle>
        </SheetHeader>
        {loading ? (
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        ) : trade ? (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <LabelValue label="Date" value={new Date(trade.created_at).toLocaleString()} />
              <LabelValue label="Pair" value={trade.pair} />
              <LabelValue label="Asset class" value={trade.asset_class} />
              <LabelValue label="Direction" value={trade.direction} />
              <LabelValue label="Session" value={trade.session ?? "—"} />
              <LabelValue label="Result" value={trade.result} />
              <LabelValue label="Entry" value={formatNumber(trade.entry_price)} />
              <LabelValue label="Stop loss" value={formatNumber(trade.stop_loss)} />
              <LabelValue label="Take profit" value={formatNumber(trade.take_profit)} />
              <LabelValue label="Risk %" value={`${trade.risk_percent}%`} />
              <LabelValue label="Risk amount" value={formatCurrencySafe(trade.risk_amount)} />
              <LabelValue label="Position size" value={formatPositionSize(trade.position_size, getPositionSizeKind(trade.asset_class))} />
              <LabelValue label="R:R" value={formatNumber(trade.rr, 2)} />
              <LabelValue label="PnL" value={formatCurrencySafe(trade.pnl)} className={trade.pnl >= 0 ? "text-emerald-500" : "text-red-500"} />
              <LabelValue label="R multiple" value={formatNumber(trade.r_multiple, 2)} />
              <LabelValue label="Checklist" value={`${trade.checklist_score}/${trade.checklist_total} (${trade.checklist_percent}%)`} />
              <LabelValue label="Grade" value={trade.trade_grade ?? "—"} />
            </div>
            {checklistItems.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Checklist</h4>
                <ul className="space-y-1 text-sm">
                  {checklistItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className={item.passed ? "text-emerald-500" : "text-red-500"}>
                        {item.passed ? "✓" : "✗"}
                      </span>
                      {item.checklist_item_label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {trade.notes && (
              <div>
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trade.notes}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" size="sm" asChild>
                <a href={`/aura-analysis/journal/${tradeId}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </a>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground pt-4">Trade not found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LabelValue({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className={className}>{value}</span>
    </>
  );
}
