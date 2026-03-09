"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Trade } from "@/types";
import { calcClosedTradePnLAndR } from "@/lib/calculators/closedTradePnL";
import { formatCurrencySafe, formatNumber } from "@/lib/utils";

interface TradeOutcomeModalProps {
  trade: Trade;
  open: boolean;
  onClose: () => void;
  outcomeType: "win" | "loss" | "breakeven";
  onSaved: (updatedTrade: Trade) => void;
}

export function TradeOutcomeModal({ trade, open, onClose, outcomeType, onSaved }: TradeOutcomeModalProps) {
  const defaultClosePrice = 
    trade.close_price != null ? trade.close_price :
    outcomeType === "win" ? trade.take_profit :
    outcomeType === "loss" ? trade.stop_loss :
    trade.entry_price;

  const [closePrice, setClosePrice] = useState<string>(String(defaultClosePrice));
  const [closedAt, setClosedAt] = useState<string>(
    trade.closed_at ? new Date(trade.closed_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [closeNotes, setCloseNotes] = useState<string>(trade.close_notes || "");
  const [loading, setLoading] = useState(false);

  // Derived calculations
  const priceNum = Number(closePrice);
  const { pnl, rMultiple } = calcClosedTradePnLAndR(
    trade.entry_price,
    isNaN(priceNum) ? defaultClosePrice : priceNum,
    trade.position_size,
    trade.risk_amount,
    trade.direction,
    trade.pair
  );

  async function handleSave() {
    setLoading(true);
    try {
      const payload = {
        id: trade.id,
        result: outcomeType,
        close_price: isNaN(priceNum) ? defaultClosePrice : priceNum,
        closed_at: new Date(closedAt).toISOString(),
        close_notes: closeNotes,
        pnl: pnl,
        r_multiple: rMultiple,
      };

      const res = await fetch("/api/aura-analysis/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update trade");
      }

      const updatedTrade = await res.json();
      onSaved(updatedTrade);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save outcome");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Trade as {outcomeType.charAt(0).toUpperCase() + outcomeType.slice(1)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="closePrice" className="text-right">
              Close Price
            </Label>
            <Input
              id="closePrice"
              type="number"
              step="any"
              value={closePrice}
              onChange={(e) => setClosePrice(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="closedAt" className="text-right">
              Closed Date
            </Label>
            <Input
              id="closedAt"
              type="datetime-local"
              value={closedAt}
              onChange={(e) => setClosedAt(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="closeNotes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="closeNotes"
              placeholder="Optional close notes"
              value={closeNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCloseNotes(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="rounded-md bg-muted p-3 mt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calculated PnL:</span>
              <span className={pnl >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                {formatCurrencySafe(pnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Realized R:</span>
              <span>{formatNumber(rMultiple, 2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Outcome"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}