"use client";

import { motion } from "framer-motion";

// template.tsx re-mounts on every navigation, so these play on each page change.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {[
        { color: "bg-red-600", delay: 0 },
        { color: "bg-vinylBlack", delay: 0.08 },
      ].map((s) => (
        <motion.div
          key={s.color}
          aria-hidden
          className={`pointer-events-none fixed inset-y-0 left-0 z-50 w-[140vw] -skew-x-12 ${s.color}`}
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 0.7, delay: s.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      >
        {children}
      </motion.div>
    </>
  );
}
