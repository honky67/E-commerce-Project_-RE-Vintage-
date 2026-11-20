import type { ApiProduct } from "./api";
import type { Category, Product, Vendor } from "../data/mockData";

interface ApiCatalogProduct extends ApiProduct { shop_name: string; shop_slug: string }
interface ApiShop { id: string; shop_name: string; slug: string; bio: string | null; item_count: number; location?: string | null; rating?: number | null }

// Server-side data fetching talks to FastAPI directly (BACKEND_URL), never through the browser proxy.
const SERVER_API = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const TONES = ["bg-vinylBlack", "bg-red-600", "bg-pine", "bg-amberGlow"];
const tone = (seed: string) => TONES[[...seed].reduce((n, c) => n + c.charCodeAt(0), 0) % TONES.length];
const CATEGORY: Record<string, Category> = { vinyl: "vinyl", apparel: "apparel", turntable: "turntables" };

// Server-side fetch (pages are dynamic, so new products appear immediately). Returns null if the API is down.
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API}/api${path}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const toProduct = (p: ApiCatalogProduct): Product => ({
  id: p.id,
  title: p.title,
  price: Number(p.price),
  category: CATEGORY[p.media_type] ?? "vinyl",
  vendorId: p.shop_slug,
  vendorName: p.shop_name,
  imagePlaceholder: tone(p.id),
  hoverImagePlaceholder: tone(p.shop_id),
  image: p.image_url ?? undefined,
  description: p.description || `${p.title}${p.artist_brand ? ` by ${p.artist_brand}` : ""}. Condition: ${p.condition_grade}.`,
  specs: p.specs
    ? (JSON.parse(p.specs) as { label: string; value: string }[])
    : [
        { label: "Artist / brand", value: p.artist_brand },
        { label: "Condition", value: p.condition_grade },
        { label: "Type", value: p.media_type },
        { label: "In stock", value: String(p.stock_quantity) },
      ],
  stockCount: p.stock_quantity,
});

const toVendor = (s: ApiShop): Vendor => ({
  id: s.slug,
  shopName: s.shop_name,
  avatarPlaceholder: tone(s.id),
  bannerPlaceholder: tone(s.slug),
  bio: s.bio ?? "",
  rating: s.rating ?? 0,
  totalSales: 0,
  location: s.location ?? "",
  specialties: [],
  itemCount: s.item_count,
});

export async function getProducts(opts: { shop?: string; limit?: number } = {}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (opts.shop) q.set("shop", opts.shop);
  if (opts.limit) q.set("limit", String(opts.limit));
  return ((await get<ApiCatalogProduct[]>(`/products?${q}`)) ?? []).map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const p = await get<ApiCatalogProduct>(`/products/${encodeURIComponent(id)}`);
  return p ? toProduct(p) : null;
}

export async function getShops(): Promise<Vendor[]> {
  return ((await get<ApiShop[]>("/shops")) ?? []).map(toVendor);
}

export async function getShop(slug: string): Promise<Vendor | null> {
  const s = await get<ApiShop>(`/shops/${encodeURIComponent(slug)}`);
  return s ? toVendor(s) : null;
}
