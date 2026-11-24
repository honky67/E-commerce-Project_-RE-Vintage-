"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import PageShell from "./PageShell";
import { API, api, getBackendBaseUrl } from "../lib/api";
import { btn, input, label } from "../lib/ui";

const SOCIAL = [
  { id: "google", label: "Continue with Google", mark: "G", markClass: "bg-red-600 text-parchment" },
  { id: "facebook", label: "Continue with Facebook", mark: "f", markClass: "bg-vinylBlack text-parchment" },
  { id: "instagram", label: "Continue with Instagram", mark: "IG", markClass: "bg-amberGlow text-vinylBlack" },
] as const;

const ERRORS: Record<string, string> = {
  oauth_failed: "Social login failed. Please try again or use email.",
  oauth_cancelled: "Social login was cancelled.",
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/");
  const [providers, setProviders] = useState<Record<string, string>>({});
  const [backendBase, setBackendBase] = useState("");
  const isLogin = mode === "login";

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = q.get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) setNext(n);
    const e = q.get("error");
    if (e) setError(ERRORS[e] ?? "Login failed.");
    setBackendBase(getBackendBaseUrl());
    api<Record<string, string>>("/auth/oauth/providers").then(setProviders).catch(() => undefined);
  }, []);

  const run = async (action: () => Promise<void>, fallback = "/") => {
    setBusy(true);
    setError("");
    try {
      await action();
      router.push(next !== "/" ? next : fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => (isLogin ? login : register)(email, password));
  };

  const hasLive = Object.values(providers).some((v) => v === "live");
  const visibleSocial = SOCIAL.filter((s) => {
    const status = providers[s.id];
    if (hasLive) return status === "live";
    return status !== "off";
  });

  return (
    <PageShell title={isLogin ? "Log in" : "Join the collective"}>
      <div className="flex max-w-md justify-center">
        <form onSubmit={submit} className="space-y-5 self-start border-2 border-vinylBlack bg-parchment p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            {!isLogin && <p className="mt-1 font-mono text-xs opacity-60">At least 8 characters.</p>}
          </div>
          {error && <p role="alert" className="-skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}
          <button type="submit" disabled={busy} className={btn}>
            {busy ? "…" : isLogin ? "Log in" : "Create account"}
          </button>

          {visibleSocial.length > 0 && (
            <>
              <div className="flex items-center gap-3 font-mono text-xs font-bold" aria-hidden>
                <span className="h-0.5 flex-1 bg-vinylBlack" />
                OR
                <span className="h-0.5 flex-1 bg-vinylBlack" />
              </div>

              <div className="space-y-3">
                {visibleSocial.map((s) => {
                  const authBase = backendBase || (typeof window !== "undefined" ? getBackendBaseUrl() : API);
                  return (
                    <a
                      key={s.id}
                      href={`${authBase}/api/auth/oauth/${s.id}/start?next=${encodeURIComponent(next)}`}
                      className="flex items-center gap-3 -skew-x-3 border-2 border-vinylBlack bg-parchment px-3 py-2 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-amberGlow"
                    >
                      <span className={`flex h-6 w-8 items-center justify-center border-2 border-vinylBlack ${s.markClass}`}>{s.mark}</span>
                      <span className="flex-1">{s.label}</span>
                      {providers[s.id] === "demo" && <span className="text-[10px] text-red-600">demo</span>}
                    </a>
                  );
                })}
                {!hasLive && Object.values(providers).includes("demo") && (
                  <p className="font-mono text-[10px] opacity-60">Demo mode: set OAuth keys in backend/.env to enable real sign-in.</p>
                )}
              </div>
            </>
          )}

          <p className="font-mono text-xs">
            {isLogin ? "New here? " : "Already a member? "}
            <Link href={isLogin ? "/register" : "/login"} className="font-bold underline hover:text-red-600">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </form>


      </div>
    </PageShell>
  );
}
