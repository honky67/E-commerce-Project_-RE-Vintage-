"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "../../../components/AuthProvider";
import PageShell from "../../../components/PageShell";
import { api, type Shop } from "../../../lib/api";
import { btn, input, label } from "../../../lib/ui";

export default function StoreBuilder() {
  const { user, ready, refresh } = useRequireAuth();
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) api<Shop[]>("/shops/mine").then((s) => setShop(s[0] ?? null)).catch((e: Error) => setError(e.message));
  }, [user]);

  const launch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setShop(await api<Shop>("/shops", { method: "POST", body: JSON.stringify({ shop_name: name, bio: bio || null, location: location || null }) }));
      await refresh(); // role is now "seller"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create shop");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !user || (shop === undefined && !error)) return <PageShell title="Store builder"><p className="font-mono text-sm">Loading…</p></PageShell>;

  if (shop) {
    return (
      <PageShell title="Your store is live">
        <div className="border-2 border-vinylBlack bg-parchment p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-display text-4xl italic">{shop.shop_name}</p>
          <p className="mt-1 font-mono text-xs opacity-70">/{shop.slug} · badge: {shop.vinyl_badge_status}{shop.location ? ` · ${shop.location}` : ""}</p>
          {shop.bio && <p className="mt-4 font-mono text-sm">{shop.bio}</p>}
          <Link href="/dashboard/products" className={`${btn} mt-6 inline-block`}>Manage products →</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Build your store">
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={launch} className="space-y-5">
          <div>
            <label className={label} htmlFor="name">Shop name</label>
            <input id="name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Backroom Records" />
          </div>
          <div>
            <label className={label} htmlFor="bio">Bio</label>
            <textarea id="bio" rows={4} maxLength={2000} value={bio} onChange={(e) => setBio(e.target.value)} className={input} placeholder="What do you sell? How do you grade?" />
          </div>
          <div>
            <label className={label} htmlFor="location">Location <span className="font-normal opacity-60">(optional)</span></label>
            <input id="location" maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} className={input} placeholder="Portland, OR" />
          </div>
          {error && <p role="alert" className="-skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}
          <button type="submit" disabled={busy} className={btn}>{busy ? "Launching…" : "Launch store"}</button>
        </form>

        <div aria-label="Preview" className="self-start border-2 border-vinylBlack bg-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="h-20 border-b-2 border-vinylBlack bg-vinylBlack" />
          <div className="p-4">
            <p className="font-mono text-xs uppercase opacity-60">Preview</p>
            <p className="font-display text-3xl italic">{name || "Your shop name"}</p>
            <p className="mt-2 font-mono text-xs">{bio || "Your bio appears here."}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
