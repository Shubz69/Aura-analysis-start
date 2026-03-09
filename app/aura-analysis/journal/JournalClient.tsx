"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TradeDetailSheet } from "@/components/trades/TradeDetailSheet";
import { TradeOutcomeModal } from "@/components/trades/TradeOutcomeModal";
import { JournalTable } from "@/components/trades/JournalTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencySafe, formatNumber, formatDate } from "@/lib/utils";
import type { Trade } from "@/types";
import { useTradesStore } from "@/lib/store/tradesStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

interface JournalClientProps {
  initialTrades: Trade[];
  openTradeId: string | null;
}

export function JournalClient({ initialTrades, openTradeId }: JournalClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trades: localTrades, setTrades: setLocalTrades } = useTradesStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  // Sync trades from localStore on mount if it has more trades than the server provided
  useEffect(() => {
    if (mounted && localTrades.length > initialTrades.length) {
      setTrades(localTrades);
    }
  }, [mounted, localTrades, initialTrades]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPair, setFilterPair] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(openTradeId);
  const [outcomeAction, setOutcomeAction] = useState<{ trade: Trade; type: "win" | "loss" | "breakeven" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch("/api/aura-analysis/trades", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Sign in to view trades" : "Failed to load trades");
        return res.json();
      })
      .then((data: Trade[]) => {
        if (cancelled) return;
        const serverData = Array.isArray(data) ? data.map((t) => ({ ...t, id: String(t.id) })) : [];
        // If server data exists and is larger/newer, we might want to sync. 
        // But for mock offline fallback, we'll merge them or just prefer the local store if it has MORE trades.
        setTrades(prev => {
          if (serverData.length > prev.length) {
            setLocalTrades(serverData);
            return serverData;
          }
          // Default to local if server is empty (due to Vercel ephemeral fs)
          return prev;
        });
      })
      .catch((e) => {
        if (!cancelled) setFetchError(e.message ?? "Failed to load trades");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setLocalTrades]);

  const pairs = useMemo(() => {
    const set = new Set(trades.map((t) => t.pair));
    return Array.from(set).sort();
  }, [trades]);

  const sessions = useMemo(() => {
    const values = trades.map((t) => t.session).filter((s): s is NonNullable<typeof s> => s != null);
    return Array.from(new Set(values)).sort();
  }, [trades]);

  const filtered = useMemo(() => {
    let list = trades;
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
    if (filterSession !== "all") list = list.filter((t) => (t.session ?? "") === filterSession);
    return list;
  }, [trades, search, filterPair, filterResult, filterDirection, filterSession]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function openTrade(id: string) {
    setSelectedTradeId(id);
    const next = new URLSearchParams(searchParams);
    next.set("trade", id);
    router.push(`/aura-analysis/journal?${next.toString()}`, { scroll: false });
  }

  function closeTrade() {
    setSelectedTradeId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("trade");
    router.push(`/aura-analysis/journal?${next.toString()}`, { scroll: false });
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
        <Select value={filterSession} onValueChange={setFilterSession}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            {sessions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {fetchError ? (
        <EmptyState
          title="Could not load trades"
          description={fetchError}
        />
      ) : loading ? (
        <EmptyState
          title="Loading…"
          description="Fetching your trades."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No trades found"
          description="Add trades from the Trade Calculator or adjust filters."
        />
      ) : (
        <>
          <Card className="glass overflow-hidden">
            <CardContent className="p-0">
              <JournalTable 
                trades={paginated} 
                onOpenTrade={openTrade} 
                onAction={(action) => {
                  if (action.type === "edit_outcome") {
                    setOutcomeAction({ trade: action.trade, type: action.trade.result as any });
                  } else {
                    setOutcomeAction({ trade: action.trade, type: action.type as any });
                  }
                }} 
              />
            </CardContent>
          </Card>
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
          initialTrade={trades.find((t) => t.id === selectedTradeId) ?? undefined}
        />
      )}

      {outcomeAction && (
        <TradeOutcomeModal
          trade={outcomeAction.trade}
          open={!!outcomeAction}
          onClose={() => setOutcomeAction(null)}
          outcomeType={outcomeAction.type}
          onSaved={(updatedTrade) => {
            const { updateTrade } = useTradesStore.getState();
            updateTrade(updatedTrade);
            // Local state will be updated via the store sync or we can do it manually here
            setTrades((prev) => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
          }}
        />
      )}
    </div>
  );
}
