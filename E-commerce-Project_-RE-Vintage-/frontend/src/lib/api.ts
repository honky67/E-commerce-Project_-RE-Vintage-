/**
 * Resolves the active backend API base URL (e.g. "http://192.168.1.59:8000" or "http://localhost:8000").
 * When in the browser:
 * - If accessed via a LAN IP or non-localhost host and NEXT_PUBLIC_API_URL is unset, empty,
 *   or set to "localhost" / "127.0.0.1", it dynamically falls back to http://${window.location.hostname}:8000.
 * - Otherwise uses NEXT_PUBLIC_API_URL if configured.
 * On server / SSR:
 * - Falls back to process.env.BACKEND_URL or process.env.NEXT_PUBLIC_API_URL or "http://localhost:8000".
 */
export function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isClientOnLan = Boolean(
      hostname &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "0.0.0.0"
    );
    const envApi = process.env.NEXT_PUBLIC_API_URL?.trim();
    let configuredHost = "";
    if (envApi) {
      try {
        configuredHost = new URL(envApi).hostname;
      } catch {
        // Keep a configured URL as-is below; invalid URLs will fail at fetch time.
      }
    }

    // If accessed via LAN and env is unset or points to localhost/127.0.0.1, resolve to client's hostname on port 8000
    if (isClientOnLan && (!envApi || configuredHost === "localhost" || configuredHost === "127.0.0.1")) {
      const proto = window.location.protocol || "http:";
      return `${proto}//${hostname}:8000`;
    }

    if (envApi) {
      return envApi.replace(/\/$/, "");
    }

    const proto = window.location.protocol || "http:";
    return `${proto}//${hostname || "localhost"}:8000`;
  }

  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

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

export interface ApiOrderItem {
  id: string;
  product_id: string | null;
  title: string;
  price: string | number;
  quantity: number;
  option: string | null;
  image_url: string | null;
}

export interface ApiOrder {
  id: string;
  user_id: string;
  total_price: string | number;
  status: string;
  shipping_address: string | null;
  full_name?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  payment_method?: string | null;
  created_at: string;
  items: ApiOrderItem[];
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const base = getBackendBaseUrl();
  const res = await fetch(`${base}/api${path}`, {
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

/**
 * Shared image URL helper:
 * - Resolves /uploads/... paths against the active backend host (handling LAN hostnames dynamically).
 * - Normalizes any legacy http://localhost:8000/uploads/... (or 127.0.0.1) records so they rewrite
 *   to the active backend host.
 * - Preserves bundled public assets (e.g. /products/...) and external absolute URLs intact.
 */
export function assetUrl(u: string | null | undefined): string | null {
  if (!u) return null;

  // Normalize any /uploads/... path (including legacy http://localhost:8000/uploads/...)
  if (u.includes("/uploads/")) {
    const uploadPath = u.substring(u.indexOf("/uploads/"));
    // Let SSR use the same-origin rewrite; the browser resolves to the current LAN backend host.
    if (typeof window === "undefined") return uploadPath;
    const backendBase = getBackendBaseUrl();
    return `${backendBase}${uploadPath}`;
  }

  // Preserve external absolute URLs
  if (u.startsWith("http://") || u.startsWith("https://")) {
    return u;
  }

  // Preserve bundled static public paths (e.g. /products/sample.jpg, /images/hero.jpg)
  return u;
}
