"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";

// Social-login landing page: the API redirects here with #token=...&next=...
export default function OAuthCallback() {
  const { acceptToken } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "error">("pending");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    // Scrub the token from browser history immediately
    window.history.replaceState(null, "", window.location.pathname);
    const token = params.get("token");
    const next = params.get("next") ?? "/";
    if (!token) {
      setStatus("error");
      void router.replace("/login?error=oauth_failed");
      return;
    }
    acceptToken(token).then((ok) => {
      if (ok) {
        router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/");
      } else {
        setStatus("error");
        router.replace("/login?error=oauth_failed");
      }
    });
  }, [acceptToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment">
      <div className="border-2 border-vinylBlack bg-vinylBlack px-10 py-8 text-parchment shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
        <p className="-skew-x-6 font-display text-3xl italic">
          {status === "error" ? "Login failed." : "Signing you in…"}
        </p>
        <p className="mt-2 font-mono text-xs opacity-60">
          {status === "error" ? "Redirecting to login." : "One moment."}
        </p>
      </div>
    </div>
  );
}
