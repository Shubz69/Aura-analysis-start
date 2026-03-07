"use client";

import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import { formatCurrencySafe, formatPercentSafe, formatRSafe } from "@/lib/utils";

type SortKey = "totalPnL" | "winRate" | "totalTrades" | "avgR" | "profitFactor" | "consistencyScore";

interface Row {
  id: string;
  name: string | null;
  totalTrades: number;
  winRate: number;
  avgR: number;
  totalPnL: number;
  profitFactor: number;
  consistencyScore: number;
  bestPair: string | null;
}

interface LeaderboardClientProps {
  rows: Row[];
  isAdmin: boolean;
}

export function LeaderboardClient({ rows, isAdmin }: LeaderboardClientProps) {
  const [sortBy, setSortBy] = useState<SortKey>("totalPnL");
  const [asc, setAsc] = useState(false);

  const sorted = [...rows].sort((a, b) => {
    const va = a[sortBy];
    const vb = b[sortBy];
    if (typeof va === "number" && typeof vb === "number") {
      return asc ? va - vb : vb - va;
    }
    return 0;
  });

  function toggleSort(key: SortKey) {
    if (sortBy === key) setAsc((a) => !a);
    else {
      setSortBy(key);
      setAsc(key === "totalPnL" || key === "winRate" || key === "avgR" || key === "profitFactor" || key === "consistencyScore" ? false : true);
    }
  }

  return (
    <Card className="glass overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Sort by</span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totalPnL">Total PnL</SelectItem>
            <SelectItem value="winRate">Win rate</SelectItem>
            <SelectItem value="totalTrades">Total trades</SelectItem>
            <SelectItem value="avgR">Average R</SelectItem>
            <SelectItem value="profitFactor">Profit factor</SelectItem>
            <SelectItem value="consistencyScore">Consistency score</SelectItem>
          </SelectContent>
        </Select>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setAsc((a) => !a)}
        >
          {asc ? "↑ Ascending" : "↓ Descending"}
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Trader</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("totalTrades")}>Trades</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("winRate")}>Win rate</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("avgR")}>Avg R</TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("totalPnL")}>PnL</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("profitFactor")}>PF</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("consistencyScore")}>Consistency</TableHead>
            {isAdmin && <TableHead>Best pair</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, i) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{i + 1}</TableCell>
              <TableCell>{row.name ?? "—"}</TableCell>
              <TableCell>{row.totalTrades}</TableCell>
              <TableCell>{formatPercentSafe(row.winRate)}</TableCell>
              <TableCell>{formatRSafe(row.avgR)}</TableCell>
              <TableCell className={`text-right ${row.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatCurrencySafe(row.totalPnL)}
              </TableCell>
              <TableCell>{Number.isFinite(row.profitFactor) && row.profitFactor > 0 ? row.profitFactor.toFixed(2) : "—"}</TableCell>
              <TableCell>{Number.isFinite(row.consistencyScore) ? Math.round(row.consistencyScore) : "—"}</TableCell>
              {isAdmin && <TableCell>{row.bestPair ?? "—"}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No community data yet.</div>
      )}
    </Card>
  );
}
