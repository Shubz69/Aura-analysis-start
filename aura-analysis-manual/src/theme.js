import { createTheme } from '@mui/material/styles';

export const auraTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8B5CF6' },
    secondary: { main: '#7C3AED' },
    success: { main: '#22c55e' },
    error: { main: '#f87171' },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#0f0f23', borderRight: '1px solid rgba(139, 92, 246, 0.2)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#1a1a2e', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: '#1a1a2e', border: '1px solid rgba(139, 92, 246, 0.15)' },
      },
    },
  },
});
