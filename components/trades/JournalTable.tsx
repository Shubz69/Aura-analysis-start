import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradeStatusBadge } from "@/components/trades/TradeStatusBadge";
import { JournalRowActions } from "@/components/trades/JournalRowActions";
import { formatCurrencySafe, formatNumber, formatDate } from "@/lib/utils";
import type { Trade } from "@/types";

interface JournalTableProps {
  trades: Trade[];
  onOpenTrade: (id: string) => void;
  onAction: (action: { trade: Trade; type: "win" | "loss" | "breakeven" | "edit_outcome" }) => void;
}

export function JournalTable({ trades, onOpenTrade, onAction }: JournalTableProps) {
  return (
    <div className="rounded-md overflow-hidden">
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t) => (
            <TableRow
              key={t.id}
              className="cursor-pointer"
              onClick={() => onOpenTrade(t.id)}
            >
              <TableCell className="text-muted-foreground">
                {formatDate(t.created_at)}
              </TableCell>
              <TableCell>{t.pair}</TableCell>
              <TableCell>{t.asset_class}</TableCell>
              <TableCell>{t.direction}</TableCell>
              <TableCell>{formatNumber(t.entry_price)}</TableCell>
              <TableCell>{formatNumber(t.stop_loss)}</TableCell>
              <TableCell>{formatNumber(t.take_profit)}</TableCell>
              <TableCell>{t.risk_percent}%</TableCell>
              <TableCell>
                <TradeStatusBadge status={t.result} />
              </TableCell>
              <TableCell className={`text-right ${t.result === "open" ? "text-muted-foreground" : t.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {t.result === "open" ? "—" : formatCurrencySafe(t.pnl)}
              </TableCell>
              <TableCell className="text-right">
                {t.result === "open" ? "—" : formatNumber(t.r_multiple, 2)}
              </TableCell>
              <TableCell>{t.session ?? "—"}</TableCell>
              <TableCell>{t.trade_grade ?? "—"}</TableCell>
              <TableCell className="text-right">
                <JournalRowActions trade={t} onAction={onAction} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}