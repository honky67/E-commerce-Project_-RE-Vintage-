"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, TOKEN_KEY, type Role, type User } from "../lib/api";

interface Ctx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<Ctx | null>(null);

// Non-secret flag cookie so middleware can gate /vendor, /dashboard and /admin. The API still verifies the JWT.
const setFlag = (on: boolean) => {
  document.cookie = `rv_auth=${on ? "1" : ""}; path=/; max-age=${on ? 3600 : 0}; samesite=lax`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setFlag(false);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      return;
    }
    try {
      setUser(await api<User>("/auth/me"));
    } catch {
      clear();
    }
  }, [clear]);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    window.addEventListener("rv:unauthorized", clear);
    return () => window.removeEventListener("rv:unauthorized", clear);
  }, [clear]);

  const authed = async (path: string, email: string, password: string) => {
    const t = await api<{ access_token: string; user: User }>(path, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, t.access_token);
    setFlag(true);
    setUser(t.user);
  };

  const value: Ctx = {
    user,
    ready,
    refresh,
    login: (e, p) => authed("/auth/login", e, p),
    register: (e, p) => authed("/auth/register", e, p),
    logout: () => {
      clear();
      router.push("/");
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Redirects guests to /login?next=… and reports whether the user holds one of `roles`. */
export function useRequireAuth(roles?: Role[]) {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [auth.ready, auth.user, router]);
  const allowed = !!auth.user && (!roles || roles.includes(auth.user.role));
  return { ...auth, allowed };
}
