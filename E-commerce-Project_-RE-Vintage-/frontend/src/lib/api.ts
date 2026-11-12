export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const TOKEN_KEY = "rv_token";

export type Role = "buyer" | "seller" | "admin";
export interface User { id: string; email: string; role: Role }
export interface Shop { id: string; owner_id: string; shop_name: string; slug: string; bio: string | null; vinyl_badge_status: string }
export interface ApiProduct {
  id: string; shop_id: string; title: string; artist_brand: string; price: string;
  condition_grade: string; stock_quantity: number; media_type: string;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event("rv:unauthorized")); // expired session
    const body = await res.json().catch(() => null);
    const d = body?.detail;
    throw new Error(
      typeof d === "string" ? d : Array.isArray(d) ? d.map((e: { msg: string }) => e.msg).join(", ") : `Request failed (${res.status})`,
    );
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
