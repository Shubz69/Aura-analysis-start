import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Skeleton,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import { getAnalyticsOverview } from '../../services/api';

export default function OverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    getAnalyticsOverview()
      .then(setData)
      .catch((e) => {
        setData(null);
        setError(e.message || 'Failed to load overview');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Overview</Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Overview</Typography>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Box>
    );
  }

  const kpis = [
    { label: 'Total Trades', value: data?.totalTrades ?? 0 },
    { label: 'Win Rate', value: data?.winRate != null ? `${Number(data.winRate).toFixed(1)}%` : '-' },
    { label: 'Average R', value: data?.averageR != null ? Number(data.averageR).toFixed(2) : '-' },
    { label: 'Total PnL', value: data?.totalPnL != null ? `$${Number(data.totalPnL).toFixed(2)}` : '-', color: data?.totalPnL >= 0 ? '#22c55e' : '#f87171' },
    { label: 'Profit Factor', value: data?.profitFactor != null ? Number(data.profitFactor).toFixed(2) : '-' },
    { label: 'Best Pair', value: data?.bestPair ?? '-' },
    { label: 'Worst Pair', value: data?.worstPair ?? '-' },
    { label: 'Consistency Score', value: data?.consistencyScore != null ? data.consistencyScore : '-' },
  ];

  const equityData = (data?.equityCurve && data.equityCurve.length > 0)
    ? data.equityCurve.map((d, i) => ({ name: i + 1, date: d.date, equity: d.equity, pnl: d.pnl }))
    : [];

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ color: '#a78bfa', fontWeight: 600 }}>Overview</Typography>
        <Button startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }} onClick={() => navigate('/aura-analysis/calculator')}>
          Quick add trade
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid item xs={6} md={3} key={k.label}>
            <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{k.label}</Typography>
                <Typography variant="h6" sx={{ color: k.color || '#fff', fontWeight: 600, mt: 0.5 }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa', fontWeight: 600 }}>Equity curve</Typography>
              {equityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#888" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8B5CF6', borderRadius: 8 }} formatter={([val]) => [`$${Number(val).toFixed(2)}`, 'Equity']} />
                    <Line type="monotone" dataKey="equity" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Equity" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No closed trades yet. Add trades and set results to see your equity curve.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa', fontWeight: 600 }}>Checklist summary</Typography>
              <Typography sx={{ color: '#e2e8f0' }}>Average checklist: {data?.averageChecklistPercent != null ? `${Number(data.averageChecklistPercent).toFixed(0)}%` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa', fontWeight: 600 }}>Recent trades</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Pair</TableCell>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Direction</TableCell>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Result</TableCell>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>PnL</TableCell>
                    <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>R</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.recentTrades || []).slice(0, 5).map((t) => (
                    <TableRow key={t.id} hover onClick={() => navigate(`/aura-analysis/journal?detail=${t.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{t.pair}</TableCell>
                      <TableCell>{t.direction}</TableCell>
                      <TableCell>{t.result}</TableCell>
                      <TableCell sx={{ color: (t.pnl || 0) >= 0 ? '#22c55e' : '#f87171', fontWeight: 500 }}>${Number(t.pnl || 0).toFixed(2)}</TableCell>
                      <TableCell>{Number(t.r_multiple || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(data?.recentTrades || []).length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No trades yet. Use the calculator to add your first trade.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
