import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableRow, TableHead } from '@mui/material';
import { getAdminOverview, getAdminTrades } from '../../services/api';

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminOverview(), getAdminTrades({ limit: 20 })])
      .then(([o, t]) => {
        setOverview(o);
        setTrades(t);
      })
      .catch(() => { setOverview(null); setTrades([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Admin</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Dashboard users</Typography>
              <Typography variant="h6">{overview?.totalDashboardUsers ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total trades</Typography>
              <Typography variant="h6">{overview?.totalDashboardTrades ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Community win rate</Typography>
              <Typography variant="h6">{overview?.communityWinRate != null ? `${Number(overview.communityWinRate).toFixed(1)}%` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Community avg R</Typography>
              <Typography variant="h6">{overview?.communityAverageR != null ? Number(overview.communityAverageR).toFixed(2) : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa' }}>Recent trades (all users)</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Pair</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>PnL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{t.username || t.email || t.user_id}</TableCell>
                  <TableCell>{t.pair}</TableCell>
                  <TableCell>{t.result}</TableCell>
                  <TableCell sx={{ color: (t.pnl || 0) >= 0 ? '#22c55e' : '#f87171' }}>${Number(t.pnl || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {trades.length === 0 && <Typography color="text.secondary">No trades</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}
