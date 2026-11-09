"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Records", href: "/#crate" },
  { label: "Apparel", href: "/#crate" },
  { label: "Turntables", href: "/#crate" },
  { label: "Shops", href: "/shops" },
];

export default function SiteHeader() {
  const path = usePathname();
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-12">
      <Link
        href="/"
        className="clip-slash-both inline-block bg-vinylBlack px-6 py-1 font-display text-3xl italic text-parchment transition-colors hover:bg-amberGlow hover:text-vinylBlack"
      >
        RE—VINTAGE
      </Link>
      <nav className="flex gap-1 sm:gap-2">
        {NAV.map((n) => {
          const active = n.href === "/shops" && path.startsWith("/shops");
          return (
            <Link
              key={n.label}
              href={n.href}
              prefetch
              className={`hover-tilt-2 inline-block px-2 py-1 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-amberGlow sm:px-3 sm:text-sm ${
                active ? "bg-red-600 text-parchment" : ""
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
