"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "../../components/AuthProvider";
import PageShell from "../../components/PageShell";
import { api, type Shop, type User } from "../../lib/api";
import { dangerBtn, input } from "../../lib/ui";

const BADGES = ["none", "pending", "verified", "revoked"];

export default function AdminPortal() {
  const { user, ready, allowed } = useRequireAuth(["admin"]);
  const [users, setUsers] = useState<User[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) return;
    Promise.all([api<User[]>("/admin/users"), api<Shop[]>("/admin/shops")])
      .then(([u, s]) => { setUsers(u); setShops(s); })
      .catch((e: Error) => setError(e.message));
  }, [allowed]);

  const setBadge = async (s: Shop, vinyl_badge_status: string) => {
    try {
      const updated = await api<Shop>(`/admin/shops/${s.id}/badge`, { method: "PATCH", body: JSON.stringify({ vinyl_badge_status }) });
      setShops((list) => list.map((x) => (x.id === s.id ? updated : x)));
    } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); }
  };

  const removeShop = async (s: Shop) => {
    if (!confirm(`Delete "${s.shop_name}" and all its products?`)) return;
    try {
      await api(`/admin/shops/${s.id}`, { method: "DELETE" });
      setShops((list) => list.filter((x) => x.id !== s.id));
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
  };

  if (!ready || !user) return <PageShell title="Admin portal"><p className="font-mono text-sm">Loading…</p></PageShell>;
  if (!allowed) return <PageShell title="Admin portal"><p className="font-mono text-sm">Admins only.</p></PageShell>;

  return (
    <PageShell title="Admin portal">
      {error && <p role="alert" className="mb-6 -skew-x-6 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">{error}</p>}

      <h2 className="mb-3 font-display text-3xl italic">Shops ({shops.length})</h2>
      <ul className="mb-10 space-y-3">
        {shops.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-vinylBlack bg-parchment p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div><p className="font-display text-xl">{s.shop_name}</p><p className="font-mono text-xs opacity-70">/{s.slug}</p></div>
            <div className="flex items-center gap-3">
              <select aria-label="Vinyl badge" value={s.vinyl_badge_status} onChange={(e) => setBadge(s, e.target.value)} className={`${input} w-auto`}>
                {BADGES.map((b) => <option key={b}>{b}</option>)}
              </select>
              <button type="button" onClick={() => removeShop(s)} className={dangerBtn}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 font-display text-3xl italic">Users ({users.length})</h2>
      <ul className="space-y-2 font-mono text-sm">
        {users.map((u) => (
          <li key={u.id} className="flex justify-between border-b border-vinylBlack/30 py-1"><span>{u.email}</span><span className="font-bold uppercase">{u.role}</span></li>
        ))}
      </ul>
    </PageShell>
  );
}
