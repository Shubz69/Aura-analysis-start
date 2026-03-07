import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import '../../../styles/aura-analysis/AuraDashboard.css';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import BookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const navItems = [
  { to: '/aura-analysis', label: 'Overview', icon: <DashboardIcon /> },
  { to: '/aura-analysis/calculator', label: 'Trade Calculator', icon: <CalculateIcon /> },
  { to: '/aura-analysis/journal', label: 'Trade Journal', icon: <BookIcon /> },
  { to: '/aura-analysis/analytics', label: 'Analytics', icon: <BarChartIcon /> },
  { to: '/aura-analysis/leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon /> },
  { to: '/aura-analysis/checklists', label: 'Checklists', icon: <ChecklistIcon /> },
  { to: '/aura-analysis/profile', label: 'Profile', icon: <PersonIcon /> },
];

export default function DashboardLayout() {
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const tokenKey = process.env.REACT_APP_AUTH_TOKEN_KEY || 'token';
  const mainLoginUrl = process.env.REACT_APP_MAIN_LOGIN_URL || '/login';

  const handleLogout = () => {
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
    window.location.href = mainLoginUrl;
  };

  const drawer = (
    <Box sx={{ pt: 2, pb: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 2, color: '#a78bfa' }}>
        Aura Analysis
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.active': { bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        {isAdmin && (
          <ListItemButton
            component={NavLink}
            to="/aura-analysis/admin"
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.active': { bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary="Admin" />
          </ListItemButton>
        )}
      </List>
      <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, px: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ color: '#f87171', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: '#f87171' } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box className="aura-dashboard" sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Aura FX – Manual Dashboard
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ color: '#a78bfa' }}>
              {user.username || user.email}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', position: 'relative' },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
