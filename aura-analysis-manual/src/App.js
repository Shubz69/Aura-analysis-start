import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { auraTheme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/aura-analysis/layout/ProtectedRoute';
import DashboardLayout from './components/aura-analysis/layout/DashboardLayout';
import LoginPage from './pages/aura-analysis/LoginPage';
import OverviewPage from './pages/aura-analysis/OverviewPage';
import CalculatorPage from './pages/aura-analysis/CalculatorPage';
import JournalPage from './pages/aura-analysis/JournalPage';
import AnalyticsPage from './pages/aura-analysis/AnalyticsPage';
import LeaderboardPage from './pages/aura-analysis/LeaderboardPage';
import ChecklistsPage from './pages/aura-analysis/ChecklistsPage';
import ProfilePage from './pages/aura-analysis/ProfilePage';
import AdminPage from './pages/aura-analysis/AdminPage';

function App() {
  return (
    <ThemeProvider theme={auraTheme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/aura-analysis"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="checklists" element={<ChecklistsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/aura-analysis" replace />} />
          <Route path="*" element={<Navigate to="/aura-analysis" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
