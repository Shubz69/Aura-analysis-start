import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableRow, TableHead, FormControl, InputLabel, Select, MenuItem, Alert, Skeleton, TableContainer } from '@mui/material';
import { getLeaderboard } from '../../services/api';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState('totalPnL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    getLeaderboard({ sortBy })
      .then((list) => setData(Array.isArray(list) ? list : []))
      .catch((e) => {
        setData([]);
        setError(e.message || 'Failed to load leaderboard');
      })
      .finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa', fontWeight: 600 }}>Leaderboard</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Card sx={{ mb: 2, p: 2, border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="totalPnL">Total PnL</MenuItem>
            <MenuItem value="winRate">Win rate</MenuItem>
            <MenuItem value="averageR">Average R</MenuItem>
            <MenuItem value="totalTrades">Total trades</MenuItem>
            <MenuItem value="profitFactor">Profit factor</MenuItem>
            <MenuItem value="consistencyScore">Consistency score</MenuItem>
          </Select>
        </FormControl>
      </Card>
      <Card sx={{ border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Rank</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Username</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Total Trades</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Win rate</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Avg R</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Total PnL</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Profit factor</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Consistency</TableCell>
              <TableCell sx={{ color: '#a78bfa', fontWeight: 600 }}>Best pair</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={9}><Skeleton height={40} /></TableCell></TableRow>
              ))
            ) : (
              data.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell>{row.rank}</TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.totalTrades}</TableCell>
                  <TableCell>{Number(row.winRate || 0).toFixed(1)}%</TableCell>
                  <TableCell>{Number(row.averageR || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: (row.totalPnL || 0) >= 0 ? '#22c55e' : '#f87171' }}>${Number(row.totalPnL || 0).toFixed(2)}</TableCell>
                  <TableCell>{Number(row.profitFactor || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.consistencyScore ?? '-'}</TableCell>
                  <TableCell>{row.bestPair ?? '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
        {!loading && data.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No leaderboard data yet. Trades from allowed users will appear here.</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
