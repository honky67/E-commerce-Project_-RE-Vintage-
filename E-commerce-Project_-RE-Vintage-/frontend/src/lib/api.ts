// "" = same origin: Next.js rewrites forward /api/* and /uploads/* to FastAPI (see next.config.mjs).
export const API = process.env.NEXT_PUBLIC_API_URL ?? "";
export const TOKEN_KEY = "rv_token";

export type Role = "buyer" | "seller" | "admin";
export interface User { id: string; email: string; role: Role }
export interface Shop { id: string; owner_id: string; shop_name: string; slug: string; bio: string | null; vinyl_badge_status: string; location?: string | null; rating?: number | null }
export interface ApiProduct {
  id: string; shop_id: string; title: string; artist_brand: string; price: string;
  condition_grade: string; stock_quantity: number; media_type: string; image_url: string | null; description?: string; specs?: string | null;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const res = await fetch(`${API}/api${path}`, {
    ...init,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event("rv:unauthorized")); // expired session
    const d = (await res.json().catch(() => null))?.detail;
    throw new Error(
      typeof d === "string" ? d : Array.isArray(d) ? d.map((e: { msg: string }) => e.msg).join(", ") : `Request failed (${res.status})`,
    );
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = <T>(path: string, init: RequestInit = {}) =>
  request<T>(path, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });

/** Multipart POST. No Content-Type header: the browser adds the boundary. */
export const apiForm = <T>(path: string, body: FormData) => request<T>(path, { method: "POST", body });

export function uploadProductImage(productId: string, file: File): Promise<ApiProduct> {
  const body = new FormData();
  body.append("file", file);
  return apiForm<ApiProduct>(`/products/${productId}/image`, body);
}

/** Uploaded images are served at /uploads/... (proxied to FastAPI); bundled samples live in public/. */
export const assetUrl = (u: string | null | undefined) => (u ? (u.startsWith("/uploads/") ? `${API}${u}` : u) : null);
