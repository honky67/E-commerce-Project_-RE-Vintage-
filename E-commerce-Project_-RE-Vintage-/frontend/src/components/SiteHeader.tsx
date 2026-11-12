"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";

// Drop your image in frontend/public/images/ and set its path here, e.g. "/images/nav-bg.jpg"
const NAV_BG_IMAGE = "";

const NAV = [
  { label: "Records", href: "/#crate" },
  { label: "Apparel", href: "/#crate" },
  { label: "Turntables", href: "/#crate" },
  { label: "Shops", href: "/shops" },
];

const GROOVES = "repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(248,245,238,0.12) 3px)";
const SHEEN =
  "conic-gradient(from 0deg, transparent 0deg, rgba(248,245,238,0.28) 30deg, transparent 80deg, transparent 200deg, rgba(248,245,238,0.28) 230deg, transparent 280deg)";

export default function SiteHeader() {
  const path = usePathname();
  return (
    <header className="relative z-40 border-b-2 border-vinylBlack bg-vinylBlack">
      {/* decorative layers are clipped here so the account dropdown can overflow the header */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: NAV_BG_IMAGE
              ? `url(${NAV_BG_IMAGE})`
              : "repeating-linear-gradient(-45deg, rgba(248,245,238,0.08) 0 2px, transparent 2px 14px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vinylBlack/70 via-vinylBlack/10 to-vinylBlack/70" />
        <div className="absolute left-1/2 top-1/2 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 md:block">
          <div
            className="nav-vinyl-spin relative h-full w-full rounded-full border border-parchment/30 bg-vinylBlack"
            style={{ backgroundImage: `${SHEEN}, ${GROOVES}` }}
          >
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pine">
              <span className="absolute left-1/2 top-[14%] h-1 w-1 -translate-x-1/2 rounded-full bg-vinylBlack" />
              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-parchment" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-12">
        <Link
          href="/"
          className="clip-slash-both inline-block bg-parchment px-6 py-1 font-display text-3xl italic text-vinylBlack transition-colors hover:bg-amberGlow"
        >
          RE—VINTAGE
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => {
            const active = n.href !== "/#crate" && path.startsWith(n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                prefetch
                className={`hover-tilt-2 inline-block px-2 py-1 font-mono text-xs uppercase tracking-widest transition-colors sm:px-3 sm:text-sm ${
                  active ? "bg-red-600 text-parchment" : "text-parchment hover:bg-amberGlow hover:text-vinylBlack"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <span className="ml-2">
            <AccountMenu />
          </span>
        </nav>
      </div>
    </header>
  );
}
