import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, allowed, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#8B5CF6' }} />
        <Typography sx={{ mt: 2, color: '#a78bfa' }}>Checking access...</Typography>
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!allowed) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Access denied. This dashboard is for manual (free) users only.</Typography>
      </Box>
    );
  }
  return children;
}
