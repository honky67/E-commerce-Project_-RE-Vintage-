"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "../data/mockData";
import PlaceholderArt from "./PlaceholderArt";
import { addToCart } from "../lib/cart";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const vendor = product.vendorName ? { id: product.vendorId, shopName: product.vendorName } : undefined;
  const soldOut = product.stockCount <= 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    const defaultOption =
      product.category === "apparel" ? "M" : product.category === "turntables" ? "33⅓" : "VG+";
    const res = addToCart(
      {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        stockCount: product.stockCount,
        option: defaultOption,
        category: product.category,
        vendorName: product.vendorName,
      },
      1,
    );
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ x: -3, y: -3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative border-2 border-vinylBlack bg-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-150 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden border-b-2 border-vinylBlack">
          <motion.div className="absolute inset-0" animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration: 0.35 }}>
            <PlaceholderArt tone={product.imagePlaceholder} label={product.category} image={product.image} />
            {!product.image && (
              <motion.div className="absolute inset-0" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }}>
                <PlaceholderArt tone={product.hoverImagePlaceholder} label="Detail" />
              </motion.div>
            )}
          </motion.div>
          {soldOut && (
            <span className="absolute right-0 top-3 -skew-x-12 bg-vinylBlack px-4 py-1 font-mono text-xs font-bold uppercase text-parchment">
              Sold out
            </span>
          )}
        </div>
        <div className="min-w-0 space-y-1 p-4 pb-2">
          <h3 className="break-words font-display text-2xl leading-snug">{product.title}</h3>
          <p className="font-display text-3xl text-red-600">${product.price.toFixed(2)}</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pt-1">
        {vendor && (
          <Link
            href={`/vendor/${vendor.id}`}
            className="max-w-full -skew-x-12 bg-vinylBlack px-3 py-1 transition-colors hover:bg-red-600"
          >
            <span className="block skew-x-12 truncate font-mono text-xs font-bold uppercase text-parchment">
              {vendor.shopName}
            </span>
          </Link>
        )}
        <motion.button
          type="button"
          onClick={quickAdd}
          disabled={soldOut}
          whileTap={soldOut ? {} : { scale: 0.9 }}
          animate={added ? { scale: [1, 1.2, 1], rotate: [0, -4, 0] } : {}}
          className={`-skew-x-6 border-2 border-vinylBlack px-3 py-1 font-mono text-xs font-bold uppercase disabled:cursor-not-allowed disabled:opacity-40 ${
            soldOut
              ? "bg-vinylBlack/10 text-vinylBlack/40"
              : added
                ? "bg-red-600 text-parchment"
                : "bg-amberGlow text-vinylBlack hover:bg-vinylBlack hover:text-parchment"
          }`}
        >
          {soldOut ? "Sold out" : added ? "Added ✓" : "Quick add"}
        </motion.button>
      </div>
    </motion.article>
  );
}
