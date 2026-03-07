"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "token";
const DEFAULT_MAIN_LOGIN_URL = "https://aura-fx.com/login";
const MAIN_LOGIN_URL =
  process.env.NEXT_PUBLIC_MAIN_LOGIN_URL?.trim() &&
  process.env.NEXT_PUBLIC_MAIN_LOGIN_URL !== "/"
    ? process.env.NEXT_PUBLIC_MAIN_LOGIN_URL.trim()
    : DEFAULT_MAIN_LOGIN_URL;

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
  const router = useRouter();
  const pathname = usePathname();

  const refreshAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAllowed(false);
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
        setUser(null);
        setAllowed(false);
      }
    } catch {
      setUser(null);
      setAllowed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (loading) return;
    const token = getToken();
    if (!token || !allowed) {
      window.location.href = MAIN_LOGIN_URL;
    }
  }, [loading, allowed, pathname]);

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
