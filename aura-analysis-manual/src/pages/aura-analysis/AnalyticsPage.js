import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Skeleton, Alert } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAnalyticsPerformance } from '../../services/api';

const COLORS = ['#8B5CF6', '#22c55e', '#f87171', '#a78bfa'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    getAnalyticsPerformance()
      .then(setData)
      .catch((e) => {
        setData(null);
        setError(e.message || 'Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Analytics</Typography>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Analytics</Typography>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Box>
    );
  }

  const equityCurve = Array.isArray(data?.equityCurve) ? data.equityCurve : [];
  const pairPerf = Array.isArray(data?.pairPerformance) ? data.pairPerformance : [];
  const sessionPerf = Array.isArray(data?.sessionPerformance) ? data.sessionPerformance : [];
  const gradeDist = data?.gradeDistribution && typeof data.gradeDistribution === 'object'
    ? Object.entries(data.gradeDistribution).map(([name, value]) => ({ name, value: Number(value) || 0 }))
    : [];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Analytics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa' }}>Equity curve</Typography>
              {equityCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8B5CF6' }} />
                    <Line type="monotone" dataKey="equity" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Equity" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa' }}>Performance by pair</Typography>
              {pairPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={pairPerf.slice(0, 8)} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="pair" type="category" width={50} stroke="#888" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8B5CF6' }} />
                    <Bar dataKey="pnl" fill="#8B5CF6" name="PnL" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa' }}>Session performance</Typography>
              {sessionPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sessionPerf}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="session" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8B5CF6' }} />
                    <Bar dataKey="pnl" fill="#7C3AED" name="PnL" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#a78bfa' }}>Grade distribution</Typography>
              {gradeDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={gradeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {gradeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8B5CF6' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ color: '#a78bfa' }}>Key metrics</Typography>
              <Typography>Max drawdown: ${Number(data?.maxDrawdown || 0).toFixed(2)}</Typography>
              <Typography>Max win streak: {data?.maxWinStreak ?? 0}</Typography>
              <Typography>Max loss streak: {data?.maxLossStreak ?? 0}</Typography>
              <Typography>Expectancy: ${Number(data?.expectancy || 0).toFixed(2)}</Typography>
              <Typography>Consistency score: {data?.consistencyScore ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
