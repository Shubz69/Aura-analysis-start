import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getAnalyticsOverview } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Profile</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">Account</Typography>
          <Typography>Username: {user?.username || '-'}</Typography>
          <Typography>Email: {user?.email || '-'}</Typography>
          <Typography>Role: {user?.effectiveRole || user?.role || '-'}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Performance summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}><Typography variant="body2">Total trades</Typography><Typography>{stats?.totalTrades ?? 0}</Typography></Grid>
            <Grid item xs={6} sm={4}><Typography variant="body2">Win rate</Typography><Typography>{stats?.winRate != null ? `${Number(stats.winRate).toFixed(1)}%` : '-'}</Typography></Grid>
            <Grid item xs={6} sm={4}><Typography variant="body2">Average R</Typography><Typography>{stats?.averageR != null ? Number(stats.averageR).toFixed(2) : '-'}</Typography></Grid>
            <Grid item xs={6} sm={4}><Typography variant="body2">Best pair</Typography><Typography>{stats?.bestPair ?? '-'}</Typography></Grid>
            <Grid item xs={6} sm={4}><Typography variant="body2">Worst pair</Typography><Typography>{stats?.worstPair ?? '-'}</Typography></Grid>
            <Grid item xs={6} sm={4}><Typography variant="body2">Consistency score</Typography><Typography>{stats?.consistencyScore ?? '-'}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
