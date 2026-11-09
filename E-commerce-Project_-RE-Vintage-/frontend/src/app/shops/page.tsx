import type { Metadata } from "next";
import ShopCard from "../../components/ShopCard";
import { vendors } from "../../data/mockData";

export const metadata: Metadata = { title: "Shops · RE:VINTAGE" };

export default function ShopsPage() {
  return (
    <section className="px-6 py-12 md:px-12">
      <h1 className="clip-slash mb-4 inline-block bg-vinylBlack px-8 py-2 font-display text-5xl italic text-parchment">
        The Shops
      </h1>
      <p className="mb-10 max-w-xl font-mono text-sm">
        Independent vinyl dealers, apparel curators and audio restorers. Every shop grades honestly.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v, i) => (
          <ShopCard key={v.id} vendor={v} index={i} />
        ))}
      </div>
    </section>
  );
}
