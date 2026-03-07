"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DASHBOARD_ROUTE, BYPASS_AUTH } from "@/lib/appConfig";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "token";

const MOCK_USER = {
  id: 1,
  email: "shubzfx@gmail.com",
  username: "Shubz",
  role: "super_admin",
  effectiveRole: "super_admin",
};

type User = {
  id: number;
  email: string | null;
  username: string | null;
  role: string;
  effectiveRole: string;
};

type AuthState = {
  user: User | null;
  allowed: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    if (BYPASS_AUTH) {
      setUser(MOCK_USER);
      setAllowed(true);
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setUser(MOCK_USER);
      setAllowed(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/aura-analysis/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setAllowed(!!data.allowed);
      } else {
        setUser(MOCK_USER);
        setAllowed(true);
      }
    } catch {
      setUser(MOCK_USER);
      setAllowed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, allowed, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
