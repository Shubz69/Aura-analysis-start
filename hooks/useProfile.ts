"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "token";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)
        : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/aura-analysis/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          setProfile(data.user as Profile);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return { profile, loading };
}
