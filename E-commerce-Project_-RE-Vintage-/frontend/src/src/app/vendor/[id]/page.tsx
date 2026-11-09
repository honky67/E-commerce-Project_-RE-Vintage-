import Link from "next/link";
import { notFound } from "next/navigation";
import VendorCatalog from "../../../components/VendorCatalog";
import { getVendor, getVendorProducts, vendors } from "../../../data/mockData";

export function generateStaticParams() {
  return vendors.map((v) => ({ id: v.id }));
}

export default function VendorPage({ params }: { params: { id: string } }) {
  const vendor = getVendor(params.id);
  if (!vendor) notFound();
  const items = getVendorProducts(vendor.id);

  const stats = [
    ["Rating", `★ ${vendor.rating}`],
    ["Sales", vendor.totalSales.toLocaleString()],
    ["Listings", String(items.length)],
    ["Location", vendor.location],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:text-red-600">← Back to crate</Link>

      <header className="mt-6">
        <div className={`relative h-44 overflow-hidden border-2 border-vinylBlack ${vendor.bannerPlaceholder}`}>
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(-45deg, #F8F5EE 0 2px, transparent 2px 14px)" }}
          />
        </div>
        <div className="-mt-12 flex flex-wrap items-end gap-6 px-6">
          <div className={`h-24 w-24 -skew-x-6 border-4 border-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${vendor.avatarPlaceholder}`} />
          <div>
            <h1 className="inline-block -skew-x-6 bg-vinylBlack px-5 py-1 font-display text-5xl italic text-parchment">
              {vendor.shopName}
            </h1>
            <span className="ml-3 inline-block -skew-x-12 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">
              ★ {vendor.rating}
            </span>
          </div>
        </div>
        <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed">{vendor.bio}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="-skew-x-6 border-2 border-vinylBlack bg-parchment p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <dt className="font-mono text-xs uppercase opacity-60">{k}</dt>
              <dd className="font-display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-12">
        <VendorCatalog products={items} />
      </section>
    </div>
  );
}
