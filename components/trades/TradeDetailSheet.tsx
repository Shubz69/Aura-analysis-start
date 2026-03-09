"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatCurrencySafe, formatNumber, formatPositionSize, getPositionSizeKind, formatDateTime } from "@/lib/utils";
import type { Trade, TradeChecklistItem } from "@/types";
import { Pencil, Trash2, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { getChecklistItemLabel } from "@/lib/validator/checklistSections";
import { parseValidatorData } from "@/lib/validator/scoreCalculator";
import { TradeOutcomeModal } from "./TradeOutcomeModal";
import { EditTradeModal } from "./EditTradeModal";
import { useTradesStore } from "@/lib/store/tradesStore";

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
  const { updateTrade } = useTradesStore();
  const [trade, setTrade] = useState<Trade | null>(initialTrade ?? null);
  const [checklistItems, setChecklistItems] = useState<TradeChecklistItem[]>([]);
  const [loading, setLoading] = useState(!initialTrade);
  const [outcomeType, setOutcomeType] = useState<"win" | "loss" | "breakeven" | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
              <LabelValue label="Date" value={formatDateTime(trade.created_at)} />
              <LabelValue label="Pair" value={trade.pair} />
              <LabelValue label="Asset class" value={trade.asset_class} />
              <LabelValue label="Direction" value={trade.direction} />
              <LabelValue label="Session" value={trade.session ?? "—"} />
              <LabelValue label="Result" value={trade.result} />
              {trade.result !== "open" && trade.closed_at && (
                <LabelValue label="Closed date" value={formatDateTime(trade.closed_at)} />
              )}
              {trade.result !== "open" && trade.close_price != null && (
                <LabelValue label="Close price" value={formatNumber(trade.close_price)} />
              )}
              <LabelValue label="Entry" value={formatNumber(trade.entry_price)} />
              <LabelValue label="Stop loss" value={formatNumber(trade.stop_loss)} />
              <LabelValue label="Take profit" value={formatNumber(trade.take_profit)} />
              <LabelValue label="Risk %" value={`${trade.risk_percent}%`} />
              <LabelValue label="Risk amount" value={formatCurrencySafe(trade.risk_amount)} />
              <LabelValue label="Position size" value={formatPositionSize(trade.position_size, getPositionSizeKind(trade.asset_class))} />
              <LabelValue label="R:R" value={formatNumber(trade.rr, 2)} />
              <LabelValue label="PnL" value={formatCurrencySafe(trade.pnl)} className={trade.pnl >= 0 ? "text-emerald-500" : "text-red-500"} />
              <LabelValue label="R multiple" value={formatNumber(trade.r_multiple, 2)} />
              <LabelValue label="Checklist" value={`${trade.checklist_percent}%`} />
              <LabelValue label="Grade" value={trade.trade_grade ?? "—"} />
            </div>
            
            {(() => {
              const vd = parseValidatorData(trade.validator_data);
                
              if (!vd || !vd.checklistState) return null;
              
              const entries = Object.entries(vd.checklistState) as [string, boolean][];
              if (entries.length === 0) return null;
              
              return (
                <div>
                  <h4 className="font-medium text-sm mb-2">Validator Checklist</h4>
                  <ul className="space-y-1 text-sm">
                    {entries.map(([key, passed]) => {
                      const label = getChecklistItemLabel(key) || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <li key={key} className="flex items-center gap-2">
                          <span className={passed ? "text-emerald-500" : "text-red-500"}>
                            {passed ? "✓" : "✗"}
                          </span>
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}

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
              {trade.result === "open" && (
                <>
                  <Button variant="outline" size="sm" className="text-emerald-500 hover:text-emerald-400" onClick={() => setOutcomeType("win")}>
                    Win
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-400" onClick={() => setOutcomeType("loss")}>
                    Loss
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-400" onClick={() => setOutcomeType("breakeven")}>
                    BE
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
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

      {trade && outcomeType && (
        <TradeOutcomeModal
          trade={trade}
          open={!!outcomeType}
          onClose={() => setOutcomeType(null)}
          outcomeType={outcomeType}
          onSaved={(updatedTrade) => {
            setTrade(updatedTrade);
            updateTrade(updatedTrade);
          }}
        />
      )}

      {trade && isEditModalOpen && (
        <EditTradeModal
          trade={trade}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={(updatedTrade) => {
            setTrade(updatedTrade);
            updateTrade(updatedTrade);
          }}
        />
      )}
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
