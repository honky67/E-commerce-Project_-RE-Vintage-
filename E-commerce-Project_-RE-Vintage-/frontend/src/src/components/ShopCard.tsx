"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Vendor } from "../data/mockData";

export default function ShopCard({ vendor, index = 0 }: { vendor: Vendor; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ x: -3, y: -3 }}
      className="border-2 border-vinylBlack bg-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-150 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
    >
      <div className={`relative h-28 overflow-hidden border-b-2 border-vinylBlack ${vendor.bannerPlaceholder}`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, #F8F5EE 0 2px, transparent 2px 14px)" }}
        />
        <span className="absolute right-0 top-3 -skew-x-12 bg-red-600 px-3 py-1 font-mono text-xs font-bold text-parchment">
          ★ {vendor.rating}
        </span>
      </div>

      <div className="px-4 pb-4">
        <div
          className={`relative -mt-8 h-16 w-16 -skew-x-6 border-4 border-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${vendor.avatarPlaceholder}`}
        />
        <h3 className="mt-3 font-display text-3xl italic leading-tight">{vendor.shopName}</h3>
        <p className="font-mono text-xs opacity-70">{vendor.location}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {vendor.specialties.map((s) => (
            <span
              key={s}
              className="-skew-x-6 bg-vinylBlack px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-parchment"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-xs">
            <span className="font-display text-2xl text-red-600">{vendor.itemCount}</span> items
          </p>
          <Link
            href={`/vendor/${vendor.id}`}
            className="-skew-x-6 border-2 border-vinylBlack bg-amberGlow px-4 py-1 font-mono text-xs font-bold uppercase transition-colors hover:bg-vinylBlack hover:text-parchment"
          >
            Visit store →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
