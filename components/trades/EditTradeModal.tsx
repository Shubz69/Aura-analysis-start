"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Trade } from "@/types";
import { 
  CHECKLIST_SECTIONS, 
  getPointsByItemId, 
  TOTAL_POINTS, 
  getSectionScore,
  getChecklistItemLabel
} from "@/lib/validator/checklistSections";
import {
  calculateTotalScore,
  clampPercent,
  getScoreLabel,
  buildValidatorData,
  parseValidatorData,
} from "@/lib/validator/scoreCalculator";
import { ChecklistCard } from "@/components/validator/ChecklistCard";
import { useTradesStore } from "@/lib/store/tradesStore";

interface EditTradeModalProps {
  trade: Trade;
  open: boolean;
  onClose: () => void;
  onSaved: (trade: Trade) => void;
}

export function EditTradeModal({ trade, open, onClose, onSaved }: EditTradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    direction: trade.direction,
    entry_price: String(trade.entry_price),
    stop_loss: String(trade.stop_loss),
    take_profit: String(trade.take_profit),
    session: trade.session || "",
    notes: trade.notes || "",
  });

  // Checklist State
  const initialChecked = useMemo(() => {
    const vd = parseValidatorData(trade.validator_data);
    if (vd && vd.checklistState) {
      return new Set<string>(
        Object.entries(vd.checklistState)
          .filter(([_, v]) => v)
          .map(([k, _]) => k)
      );
    }
    return new Set<string>();
  }, [trade.validator_data]);

  const [checked, setChecked] = useState<Set<string>>(initialChecked);

  useEffect(() => {
    if (open) {
      setFormData({
        direction: trade.direction,
        entry_price: String(trade.entry_price),
        stop_loss: String(trade.stop_loss),
        take_profit: String(trade.take_profit),
        session: trade.session || "",
        notes: trade.notes || "",
      });
      setChecked(initialChecked);
    }
  }, [open, trade, initialChecked]);

  const handleToggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pointsByItemId = useMemo(() => getPointsByItemId(), []);
  const totalScore = calculateTotalScore(checked, pointsByItemId, TOTAL_POINTS);
  const clampedScore = clampPercent(totalScore);
  const label = getScoreLabel(totalScore);

  async function handleSave() {
    setLoading(true);
    try {
      const validatorData = buildValidatorData(checked, pointsByItemId, TOTAL_POINTS);

      const payload = {
        id: trade.id,
        direction: formData.direction,
        entry_price: Number(formData.entry_price),
        stop_loss: Number(formData.stop_loss),
        take_profit: Number(formData.take_profit),
        session: formData.session || null,
        notes: formData.notes,
        checklist_score: clampedScore,
        checklist_total: totalScore,
        checklist_percent: clampedScore,
        trade_grade: label,
        validator_data: validatorData
      };

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("/api/aura-analysis/trades", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
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
      alert("Failed to save trade");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={formData.direction} onValueChange={(val: any) => setFormData(p => ({ ...p, direction: val }))}>
                <SelectTrigger id="direction">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select value={formData.session} onValueChange={(val) => setFormData(p => ({ ...p, session: val }))}>
                <SelectTrigger id="session">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="London/NY Overlap">London/NY Overlap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_price">Entry Price</Label>
              <Input id="entry_price" type="number" step="any" value={formData.entry_price} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stop_loss">Stop Loss</Label>
              <Input id="stop_loss" type="number" step="any" value={formData.stop_loss} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="take_profit">Take Profit</Label>
              <Input id="take_profit" type="number" step="any" value={formData.take_profit} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Edit Confluences</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{totalScore}%</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
            
            <div className="space-y-4">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}