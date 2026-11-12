"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import PageShell from "./PageShell";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, SHOW_DEMO } from "../lib/demo";
import { btn, input, label } from "../lib/ui";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  const finish = (fallback = "/") => {
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : fallback);
  };

  const run = async (action: () => Promise<void>, fallback?: string) => {
    setBusy(true);
    setError("");
    try {
      await action();
      finish(fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => (isLogin ? login : register)(email, password));
  };

  return (
    <PageShell title={isLogin ? "Log in" : "Join the collective"}>
      <div className="grid max-w-3xl gap-8 md:grid-cols-2">
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
          <p className="font-mono text-xs">
            {isLogin ? "New here? " : "Already a member? "}
            <Link href={isLogin ? "/register" : "/login"} className="font-bold underline hover:text-red-600">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </form>

        {isLogin && SHOW_DEMO && (
          <section aria-label="Demo login" className="self-start border-2 border-vinylBlack bg-vinylBlack p-6 text-parchment shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
            <h2 className="font-display text-2xl italic">One-click demo login</h2>
            <p className="mb-4 font-mono text-xs opacity-70">Test accounts for quick access. Dev only.</p>
            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => login(a.email, DEMO_PASSWORD), a.home)}
                  className="block w-full -skew-x-6 border-2 border-parchment bg-vinylBlack px-4 py-2 text-left transition-colors hover:bg-amberGlow hover:text-vinylBlack disabled:opacity-40"
                >
                  <span className="block font-mono text-sm font-bold uppercase">{a.label}</span>
                  <span className="block font-mono text-[10px] opacity-70">{a.email} · {a.note}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
