"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Product } from "../data/mockData";
import ProductCard from "./ProductCard";

const FILTERS: ("all" | Category)[] = ["all", "vinyl", "apparel", "turntables"];

export default function VendorCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const shown = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setFilter(f)}
            className={`-skew-x-12 border-2 border-vinylBlack px-5 py-1 font-mono text-xs font-bold uppercase ${
              filter === f ? "bg-red-600 text-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-parchment hover:bg-amberGlow"
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>
      <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && <p className="font-mono text-sm">Nothing in this crate yet.</p>}
    </div>
  );
}
