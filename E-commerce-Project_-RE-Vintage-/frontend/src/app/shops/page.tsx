import type { Metadata } from "next";
import Link from "next/link";
import ShopCard from "../../components/ShopCard";
import SlashHeading from "../../components/SlashHeading";
import { vendors } from "../../data/mockData";

export const metadata: Metadata = { title: "Shops · RE:VINTAGE" };

export default function ShopsPage() {
  return (
    <section className="px-6 py-12 md:px-12">
      <SlashHeading as="h1" className="mb-4">
        The Shops
      </SlashHeading>
      <p className="mb-6 max-w-xl font-mono text-sm">
        Independent vinyl dealers, apparel curators and audio restorers. Every shop grades honestly.
      </p>
      <Link
        href="/dashboard/store"
        className="mb-10 inline-block -skew-x-6 border-2 border-vinylBlack bg-amberGlow px-5 py-2 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-vinylBlack hover:text-parchment"
      >
        Open your own store →
      </Link>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v, i) => (
          <ShopCard key={v.id} vendor={v} index={i} />
        ))}
      </div>
    </section>
  );
}
