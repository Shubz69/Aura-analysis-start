"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TradeDetailSheet } from "@/components/trades/TradeDetailSheet";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Trade } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

interface JournalClientProps {
  initialTrades: Trade[];
  openTradeId: string | null;
}

export function JournalClient({ initialTrades, openTradeId }: JournalClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterPair, setFilterPair] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(openTradeId);

  const pairs = useMemo(() => {
    const set = new Set(initialTrades.map((t) => t.pair));
    return Array.from(set).sort();
  }, [initialTrades]);

  const filtered = useMemo(() => {
    let list = initialTrades;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.pair.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (filterPair !== "all") list = list.filter((t) => t.pair === filterPair);
    if (filterResult !== "all") list = list.filter((t) => t.result === filterResult);
    if (filterDirection !== "all") list = list.filter((t) => t.direction === filterDirection);
    return list;
  }, [initialTrades, search, filterPair, filterResult, filterDirection]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function openTrade(id: string) {
    setSelectedTradeId(id);
    const next = new URLSearchParams(searchParams);
    next.set("trade", id);
    router.push(`/dashboard/journal?${next.toString()}`, { scroll: false });
  }

  function closeTrade() {
    setSelectedTradeId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("trade");
    router.push(`/dashboard/journal?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search pair or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterPair} onValueChange={setFilterPair}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Pair" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pairs</SelectItem>
            {pairs.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="win">Win</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
            <SelectItem value="breakeven">Breakeven</SelectItem>
            <SelectItem value="open">Open</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDirection} onValueChange={setFilterDirection}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No trades found"
          description="Add trades from the Trade Calculator or adjust filters."
        />
      ) : (
        <>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Asset class</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>TP</TableHead>
                  <TableHead>Risk %</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right">R</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => openTrade(t.id)}
                  >
                    <TableCell className="text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{t.pair}</TableCell>
                    <TableCell>{t.asset_class}</TableCell>
                    <TableCell>{t.direction}</TableCell>
                    <TableCell>{formatNumber(t.entry_price)}</TableCell>
                    <TableCell>{formatNumber(t.stop_loss)}</TableCell>
                    <TableCell>{formatNumber(t.take_profit)}</TableCell>
                    <TableCell>{t.risk_percent}%</TableCell>
                    <TableCell>{t.result}</TableCell>
                    <TableCell className={`text-right ${t.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {formatCurrency(t.pnl)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(t.r_multiple, 2)}</TableCell>
                    <TableCell>{t.session ?? "—"}</TableCell>
                    <TableCell>{t.trade_grade ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filtered.length} trades • Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedTradeId && (
        <TradeDetailSheet
          tradeId={selectedTradeId}
          open={!!selectedTradeId}
          onClose={closeTrade}
          onDeleted={closeTrade}
        />
      )}
    </div>
  );
}
