"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "./AuthProvider";
import ImageDropzone from "./ImageDropzone";
import { api, apiForm, type ApiProduct, type Shop } from "../lib/api";
import { btn, input, label } from "../lib/ui";

const CATEGORIES = [
  ["RECORDS", "Records"],
  ["APPAREL", "Apparel"],
  ["TURNTABLES", "Turntables"],
] as const;
const CONDITIONS = ["Mint", "VG+", "VG", "Fair"];

export default function AddProductForm() {
  const { user, ready } = useRequireAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[] | undefined>(undefined);
  const [shopId, setShopId] = useState("");
  const [f, setF] = useState({ title: "", category: "RECORDS", price: "", condition: "Mint", description: "", artist_brand: "", stock_quantity: "1", specs: "" });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) return;
    api<Shop[]>(isAdmin ? "/shops?limit=100" : "/shops/mine")
      .then((s) => { setShops(s); setShopId(s[0]?.id ?? ""); })
      .catch((e: Error) => setError(e.message));
  }, [user, isAdmin]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = new FormData();
    Object.entries(f).forEach(([k, v]) => {
      if (k === "specs") return; // handled separately
      body.append(k, v);
    });
    // Convert "Label: Value\n..." lines → JSON for the API
    const specsJson = f.specs.trim()
      ? JSON.stringify(
          f.specs.split("\n").flatMap((line) => {
            const idx = line.indexOf(":");
            if (idx < 1) return [];
            return [{ label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }];
          })
        )
      : null;
    if (specsJson) body.append("specs", specsJson);
    if (isAdmin && shopId) body.append("shop_id", shopId);
    if (file) body.append("image", file);
    try {
      const p = await apiForm<ApiProduct>("/products", body);
      router.push(`/product/${p.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
      setBusy(false);
    }
  };

  if (!ready || !user || shops === undefined) return <p className="font-mono text-sm">{error || "Loading…"}</p>;
  if (shops.length === 0) {
    return (
      <div>
        <p className="mb-4 font-mono text-sm">{isAdmin ? "No shops exist yet." : "You need a store before you can list products."}</p>
        <Link href="/dashboard/store" className={btn}>Build your store →</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 border-2 border-vinylBlack bg-parchment p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-2">
      {isAdmin && (
        <div className="sm:col-span-2">
          <label className={label} htmlFor="shop">Shop</label>
          <select id="shop" value={shopId} onChange={(e) => setShopId(e.target.value)} className={input}>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
          </select>
        </div>
      )}
      <div className="sm:col-span-2">
        <label className={label} htmlFor="title">Title</label>
        <input id="title" required maxLength={255} value={f.title} onChange={set("title")} className={input} />
      </div>
      <div>
        <label className={label} htmlFor="category">Category</label>
        <select id="category" value={f.category} onChange={set("category")} className={input}>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="condition">Condition</label>
        <select id="condition" value={f.condition} onChange={set("condition")} className={input}>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="price">Price ($)</label>
        <input id="price" required type="number" min="0" step="0.01" value={f.price} onChange={set("price")} className={input} />
      </div>
      <div>
        <label className={label} htmlFor="stock">Stock</label>
        <input id="stock" required type="number" min="0" value={f.stock_quantity} onChange={set("stock_quantity")} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="artist">Artist / brand (optional)</label>
        <input id="artist" maxLength={255} value={f.artist_brand} onChange={set("artist_brand")} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" rows={4} maxLength={5000} value={f.description} onChange={set("description")} className={input} placeholder="Pressing, flaws, measurements…" />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="specs">Specs <span className="font-normal opacity-60">(one per line, e.g. Format: 12&quot; LP)</span></label>
        <textarea id="specs" rows={4} value={f.specs} onChange={set("specs")} className={input} placeholder={"Format: 12\" LP, 33⅓ RPM\nPressing: Original, 1961\nSleeve: VG+"} />
      </div>
      <div className="sm:col-span-2"><ImageDropzone file={file} onChange={setFile} /></div>
      <div className="sm:col-span-2">
        {error && <p role="alert" className="mb-3 -skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}
        <button type="submit" disabled={busy} className={btn}>{busy ? "Adding…" : "Add product to store"}</button>
      </div>
    </form>
  );
}
