"use client";

import { useEffect } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error to console
    console.error("Application error:", error);
  }, [error]);

  return (
    <PageShell title="Something went wrong">
      <div className="mx-auto max-w-lg border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="-skew-x-6 inline-block bg-red-600 px-4 py-1 font-mono text-xs font-bold uppercase text-parchment">
          Playback Stalled
        </p>
        <h2 className="mt-4 font-display text-4xl italic leading-tight text-vinylBlack">
          A Needle Skip Occurred
        </h2>
        <p className="mt-3 font-mono text-xs leading-relaxed opacity-75">
          {error.message || "An unexpected error occurred while loading this view."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="-skew-x-6 border-2 border-vinylBlack bg-amberGlow px-6 py-2.5 font-mono text-xs font-bold uppercase text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
          >
            Retry Request ↻
          </button>
          <Link
            href="/"
            className="-skew-x-6 border-2 border-vinylBlack bg-parchment px-6 py-2.5 font-mono text-xs font-bold uppercase text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
          >
            Return Home →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
