import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TablePagination,
  Button,
  InputAdornment,
  Alert,
  TableContainer,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getTrades } from '../../services/api';
import TradeDetailDrawer from '../../components/aura-analysis/tables/TradeDetailDrawer';

export default function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailIdParam = searchParams.get('detail');
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ pair: '', result: '', session: '', direction: '', from: '', to: '' });
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState(detailIdParam ? Number(detailIdParam) : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (detailIdParam) setDetailId(Number(detailIdParam));
  }, [detailIdParam]);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = { limit: 200, offset: 0 };
    if (filters.pair) params.pair = filters.pair;
    if (filters.result) params.result = filters.result;
    if (filters.session) params.session = filters.session;
    if (filters.direction) params.direction = filters.direction;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    getTrades(params)
      .then((list) => setTrades(Array.isArray(list) ? list : []))
      .catch((e) => {
        setTrades([]);
        setError(e.message || 'Failed to load trades');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters.pair, filters.result, filters.session, filters.direction, filters.from, filters.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = trades.filter((t) => {
    if (search && !(t.pair || '').toLowerCase().includes(search.toLowerCase()) && !(t.notes || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa', fontWeight: 600 }}>Trade Journal</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Card sx={{ mb: 2, p: 2, border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search pair / notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ minWidth: 180 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Pair</InputLabel>
            <Select value={filters.pair} label="Pair" onChange={(e) => setFilters((f) => ({ ...f, pair: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {[...new Set(trades.map((t) => t.pair))].sort().map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Result</InputLabel>
            <Select value={filters.result} label="Result" onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="win">Win</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
              <MenuItem value="breakeven">Breakeven</MenuItem>
              <MenuItem value="open">Open</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Session</InputLabel>
            <Select value={filters.session} label="Session" onChange={(e) => setFilters((f) => ({ ...f, session: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {['Asian', 'London', 'New York', 'London/NY Overlap'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Direction</InputLabel>
            <Select value={filters.direction} label="Direction" onChange={(e) => setFilters((f) => ({ ...f, direction: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" type="date" label="From" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <TextField size="small" type="date" label="To" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <Button variant="outlined" size="small" onClick={load}>Apply</Button>
        </Box>
      </Card>
      <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Pair</TableCell>
              <TableCell>Asset class</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Entry</TableCell>
              <TableCell>SL</TableCell>
              <TableCell>TP</TableCell>
              <TableCell>Risk %</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>PnL</TableCell>
              <TableCell>R</TableCell>
              <TableCell>Session</TableCell>
              <TableCell>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={13}>Loading...</TableCell></TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow key={t.id} hover onClick={() => setDetailId(t.id)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{t.pair}</TableCell>
                  <TableCell>{t.asset_class}</TableCell>
                  <TableCell>{t.direction}</TableCell>
                  <TableCell>{Number(t.entry_price).toFixed(5)}</TableCell>
                  <TableCell>{Number(t.stop_loss).toFixed(5)}</TableCell>
                  <TableCell>{Number(t.take_profit).toFixed(5)}</TableCell>
                  <TableCell>{Number(t.risk_percent).toFixed(2)}%</TableCell>
                  <TableCell>{t.result}</TableCell>
                  <TableCell sx={{ color: (t.pnl || 0) >= 0 ? '#22c55e' : '#f87171' }}>${Number(t.pnl || 0).toFixed(2)}</TableCell>
                  <TableCell>{Number(t.r_multiple || 0).toFixed(2)}</TableCell>
                  <TableCell>{t.session || '-'}</TableCell>
                  <TableCell>{t.trade_grade || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
        {!loading && filtered.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No trades match your filters. Add trades from the Calculator or clear filters.</Typography>
          </Box>
        )}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
        />
      </Card>
      <TradeDetailDrawer tradeId={detailId} onClose={() => { setDetailId(null); setSearchParams({}); }} onSaved={load} />
    </Box>
  );
}
