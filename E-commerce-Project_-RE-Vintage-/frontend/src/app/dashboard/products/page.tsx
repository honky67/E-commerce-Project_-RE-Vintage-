"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRequireAuth } from "../../../components/AuthProvider";
import PageShell from "../../../components/PageShell";
import { api, type ApiProduct, type Shop } from "../../../lib/api";
import { btn, dangerBtn, input, label } from "../../../lib/ui";

const GRADES = ["Mint", "VG+", "VG", "Fair"];
const MEDIA = ["vinyl", "apparel", "turntable"];
const EMPTY = { title: "", artist_brand: "", price: "", condition_grade: "Mint", stock_quantity: "1", media_type: "vinyl" };

export default function ProductManager() {
  const { user, ready } = useRequireAuth();
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const mine = (await api<Shop[]>("/shops/mine"))[0] ?? null;
      setShop(mine);
      if (mine) setItems(await api<ApiProduct[]>(`/shops/${mine.id}/products`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setBusy(true);
    setError("");
    try {
      const body = { ...form, stock_quantity: Number(form.stock_quantity) };
      const p = await api<ApiProduct>(`/shops/${shop.id}/products`, { method: "POST", body: JSON.stringify(body) });
      setItems((list) => [p, ...list]);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: ApiProduct) => {
    if (!confirm(`Remove "${p.title}"?`)) return;
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
        <p className="mb-4 font-mono text-sm">You need a store before you can list products.</p>
        <Link href="/dashboard/store" className={btn}>Build your store →</Link>
      </PageShell>
    );
  }

  return (
    <PageShell title={`${shop.shop_name}: products`}>
      <form onSubmit={add} className="grid gap-4 border-2 border-vinylBlack bg-parchment p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-2">
        <div><label className={label} htmlFor="t">Title</label><input id="t" required value={form.title} onChange={set("title")} className={input} /></div>
        <div><label className={label} htmlFor="a">Artist / brand</label><input id="a" required value={form.artist_brand} onChange={set("artist_brand")} className={input} /></div>
        <div><label className={label} htmlFor="p">Price ($)</label><input id="p" required type="number" min="0" step="0.01" value={form.price} onChange={set("price")} className={input} /></div>
        <div><label className={label} htmlFor="s">Stock</label><input id="s" required type="number" min="0" value={form.stock_quantity} onChange={set("stock_quantity")} className={input} /></div>
        <div><label className={label} htmlFor="g">Condition</label>
          <select id="g" value={form.condition_grade} onChange={set("condition_grade")} className={input}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></div>
        <div><label className={label} htmlFor="m">Type</label>
          <select id="m" value={form.media_type} onChange={set("media_type")} className={input}>{MEDIA.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div className="sm:col-span-2">
          {error && <p role="alert" className="mb-3 -skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}
          <button type="submit" disabled={busy} className={btn}>{busy ? "Adding…" : "Add product"}</button>
        </div>
      </form>

      <ul className="mt-8 space-y-3">
        {items.length === 0 && <li className="font-mono text-sm">No products yet.</li>}
        {items.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-vinylBlack bg-parchment p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <p className="font-display text-xl">{p.title}</p>
              <p className="font-mono text-xs opacity-70">{p.artist_brand} · {p.media_type} · {p.condition_grade} · {p.stock_quantity} in stock</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl text-red-600">${Number(p.price).toFixed(2)}</span>
              <button type="button" onClick={() => remove(p)} className={dangerBtn}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
