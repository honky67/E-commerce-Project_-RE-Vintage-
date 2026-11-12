"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

const ITEM = "block w-full px-3 py-2 text-left font-mono text-xs font-bold uppercase hover:bg-amberGlow";

export default function AccountMenu() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Avoids flashing "Login" at signed-in users while the session is being restored.
  if (!ready) return <div aria-hidden className="h-9 w-9 -skew-x-6 animate-pulse bg-parchment/30" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="-skew-x-6 border-2 border-parchment bg-amberGlow px-4 py-1 font-mono text-xs font-bold uppercase text-vinylBlack transition-colors hover:bg-parchment"
      >
        Login
      </Link>
    );
  }

  const links = [
    { label: "My store", href: "/dashboard/store" },
    { label: "Products", href: "/dashboard/products" },
    ...(user.role === "admin" ? [{ label: "Admin portal", href: "/admin" }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 -skew-x-6 items-center justify-center border-2 border-parchment bg-red-600 font-display text-xl italic text-parchment transition-colors hover:bg-amberGlow hover:text-vinylBlack"
      >
        <span className="skew-x-6">{user.email[0].toUpperCase()}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 border-2 border-vinylBlack bg-parchment text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="border-b-2 border-vinylBlack px-3 py-2">
            <p className="truncate font-mono text-xs font-bold">{user.email}</p>
            <p className="font-mono text-[10px] font-bold uppercase text-red-600">{user.role}</p>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className={ITEM}>
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={`${ITEM} border-t-2 border-vinylBlack hover:bg-red-600 hover:text-parchment`}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
