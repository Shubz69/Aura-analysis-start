import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, Typography, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Aura Analysis does not implement its own login.
 * Authentication uses the existing Aura FX platform: same users table, same JWT, same token storage.
 * This page is a gate: user must log in on the main site first, then return here.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth, loading } = useAuth();

  const from = location.state?.from?.pathname || '/aura-analysis';
  const mainLoginUrl = process.env.REACT_APP_MAIN_LOGIN_URL || '/';

  const handleContinue = () => {
    refreshAuth().then(() => navigate(from, { replace: true }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f0f23',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>
          Aura Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          This dashboard uses your <strong>existing Aura FX account</strong>. There is no separate login.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Log in on the main Aura FX site with your usual account. When you are logged in, return here or click below to continue.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleContinue}
            sx={{ bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
          >
            {loading ? 'Checking session...' : "I'm logged in, continue"}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            href={mainLoginUrl}
            sx={{ borderColor: '#8B5CF6', color: '#a78bfa' }}
          >
            Open main site to log in
          </Button>
        </Box>
        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          Access: user, admin, super_admin. Blocked: premium, elite, a7fx.
        </Typography>
      </Card>
    </Box>
  );
}
