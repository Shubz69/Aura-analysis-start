import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(() => {
    setLoading(true);
    return getMe()
      .then((data) => {
        setUser(data.user || null);
        setAllowed(!!data.allowed);
      })
      .catch(() => {
        setUser(null);
        setAllowed(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const isAdmin = user && (user.effectiveRole === 'admin' || user.effectiveRole === 'super_admin');

  return (
    <AuthContext.Provider value={{ user, allowed, loading, isAdmin, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
