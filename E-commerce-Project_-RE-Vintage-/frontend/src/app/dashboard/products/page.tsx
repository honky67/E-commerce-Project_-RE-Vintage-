"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "../../../components/AuthProvider";
import PageShell from "../../../components/PageShell";
import SmartImage from "../../../components/SmartImage";
import { api, type ApiProduct, type Shop } from "../../../lib/api";
import { btn, dangerBtn } from "../../../lib/ui";

export default function ProductManager() {
  const { user, ready } = useRequireAuth();
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const mine = (await api<Shop[]>("/shops/mine"))[0] ?? null;
        setShop(mine);
        if (mine) setItems(await api<ApiProduct[]>(`/shops/${mine.id}/products`));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [user]);

  const remove = async (p: ApiProduct) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE" });
      setItems((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove product");
    }
  };

  if (!ready || !user || (shop === undefined && !error)) return <PageShell title="Product manager"><p className="font-mono text-sm">Loading…</p></PageShell>;
  if (!shop) {
    return (
      <PageShell title="Product manager">
        <p className="mb-4 font-mono text-sm">{error || "You need a store before you can list products."}</p>
        <Link href="/dashboard/store" className={btn}>Build your store →</Link>
      </PageShell>
    );
  }

  return (
    <PageShell title={`${shop.shop_name}: products`}>
      <Link href="/seller/products/new" className={`${btn} mb-8 inline-block`}>+ Add product</Link>
      {error && <p role="alert" className="mb-4 -skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}
      <ul className="space-y-3">
        {items.length === 0 && <li className="font-mono text-sm">No products yet.</li>}
        {items.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-vinylBlack bg-parchment p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Link href={`/product/${p.id}`} className="flex items-center gap-3">
              <SmartImage src={p.image_url} alt={p.title} className="h-14 w-14 shrink-0 border-2 border-vinylBlack" />
              <div>
                <p className="font-display text-xl">{p.title}</p>
                <p className="font-mono text-xs opacity-70">{p.artist_brand && `${p.artist_brand} · `}{p.media_type} · {p.condition_grade} · {p.stock_quantity} in stock</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl text-red-600">${Number(p.price).toFixed(2)}</span>
              <button type="button" onClick={() => remove(p)} className={dangerBtn}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
