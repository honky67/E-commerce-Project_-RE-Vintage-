"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Product, Vendor } from "../data/mockData";
import PlaceholderArt from "./PlaceholderArt";

const OPTIONS: Record<Category, { label: string; values: string[] }> = {
  apparel: { label: "Size", values: ["S", "M", "L", "XL"] },
  vinyl: { label: "Condition", values: ["Mint", "VG+", "VG", "Fair"] },
  turntables: { label: "Speed (RPM)", values: ["33⅓", "45", "78"] },
};
const TABS = ["Description", "Specs", "Merchant", "Shipping"] as const;
type Tab = (typeof TABS)[number];

export default function ProductView({ product, vendor }: { product: Product; vendor: Vendor }) {
  const gallery = [
    { tone: product.imagePlaceholder, label: "Front" },
    { tone: product.hoverImagePlaceholder, label: "Detail" },
    { tone: "bg-pine", label: "Back" },
  ];
  const opts = OPTIONS[product.category];
  const [view, setView] = useState(0);
  const [option, setOption] = useState(opts.values[0]);
  const [tab, setTab] = useState<Tab>("Description");
  const [added, setAdded] = useState(false);
  const soldOut = product.stockCount === 0;

  const add = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/" className="font-mono text-xs uppercase tracking-widest hover:text-red-600">← Back to crate</Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden border-2 border-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <PlaceholderArt tone={gallery[view].tone} label={gallery[view].label} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setView(i)}
                className={`h-16 w-16 -skew-x-6 overflow-hidden border-2 transition-all ${
                  i === view ? "border-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "border-vinylBlack opacity-60 hover:opacity-100"
                }`}
                aria-label={`View ${g.label}`}
              >
                <div className={`h-full w-full ${g.tone}`} />
              </button>
            ))}
          </div>
        </div>

        {/* info */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">{product.category}</p>
          <h1 className="mt-1 font-display text-5xl italic leading-tight">{product.title}</h1>
          <p className="mt-3 font-display text-4xl text-red-600">${product.price.toFixed(2)}</p>

          <p className="mt-6 font-mono text-xs font-bold uppercase">{opts.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {opts.values.map((v) => (
              <motion.button
                key={v}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setOption(v)}
                className={`-skew-x-6 border-2 border-vinylBlack px-4 py-1 font-mono text-sm font-bold ${
                  option === v ? "bg-vinylBlack text-parchment shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]" : "bg-parchment hover:bg-amberGlow"
                }`}
              >
                {v}
              </motion.button>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={add}
            disabled={soldOut}
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ scale: 0.96 }}
            animate={added ? { rotate: [0, -3, 3, 0] } : {}}
            className={`mt-8 -skew-x-6 border-2 border-vinylBlack px-8 py-3 font-mono text-sm font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 ${
              added ? "bg-red-600 text-parchment" : "bg-amberGlow"
            }`}
          >
            {soldOut ? "Sold out" : added ? `Added: ${option} ✓` : "Add to crate"}
          </motion.button>
          <p className="mt-2 font-mono text-xs opacity-60">{product.stockCount} in stock</p>

          {/* tabs */}
          <div className="mt-10 flex gap-1 border-b-2 border-vinylBlack">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="relative px-3 py-2 font-mono text-xs font-bold uppercase"
              >
                {tab === t && (
                  <motion.span layoutId="tab-bg" className="absolute inset-0 -skew-x-12 bg-red-600" />
                )}
                <span className={`relative ${tab === t ? "text-parchment" : ""}`}>{t}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="min-h-32 pt-4 font-mono text-sm leading-relaxed"
            >
              {tab === "Description" && <p>{product.description}</p>}
              {tab === "Specs" && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                  {product.specs.map((s) => (
                    <div key={s.label} className="contents">
                      <dt className="font-bold">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === "Merchant" && (
                <div>
                  <p className="font-display text-2xl italic">{vendor.shopName}</p>
                  <p className="text-xs opacity-70">★ {vendor.rating} · {vendor.totalSales.toLocaleString()} sales · {vendor.location}</p>
                  <p className="mt-2">{vendor.bio}</p>
                  <Link href={`/vendor/${vendor.id}`} className="mt-3 inline-block -skew-x-6 bg-vinylBlack px-3 py-1 text-xs font-bold uppercase text-parchment hover:bg-red-600">
                    Visit shop →
                  </Link>
                </div>
              )}
              {tab === "Shipping" && (
                <p>Placeholder: ships within 2 business days, packed in rigid mailers. Add real rates, regions and return policy here.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
