"use client";

import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import VinylRecord from "./VinylRecord";

const BASE = 45; // deg/s idle
const FAST = 240; // deg/s on hover

export default function VinylHero({ size = 340 }: { size?: number }) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(!reduce);
  const [hovered, setHovered] = useState(false);
  const rotate = useMotionValue(0);
  const speed = useRef(0);

  // Eased angular speed: accelerates on hover, decelerates to a stop on pause.
  useAnimationFrame((_, delta) => {
    const target = !playing ? 0 : hovered ? FAST : BASE;
    speed.current += (target - speed.current) * Math.min(delta / 450, 1);
    rotate.set((rotate.get() + (speed.current * delta) / 1000) % 360);
  });

  const armAngle = !playing ? 12 : hovered ? -28 : -18; // needle lifts, rests, drops deeper

  return (
    <div className="relative mx-auto" style={{ width: size + 40 }}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative">
        <div className="rounded-full shadow-p5-amber">
          <motion.div style={{ rotate }}>
            <VinylRecord size={size} spin={false} label="RE—VINTAGE" catalog="VNL-0001" className="shadow-none" />
          </motion.div>
        </div>

        {/* tonearm: pivots at top-right, tip drops onto the groove */}
        <div className="absolute" style={{ right: -20, top: 20, width: 0, height: 0 }}>
          <motion.div
            className="absolute h-1.5 w-40 border border-vinylBlack bg-pine"
            style={{ right: 0, top: -3, originX: 1, originY: 0.5 }}
            animate={{ rotate: armAngle }}
            transition={{ type: "spring", stiffness: 110, damping: 11 }}
          />
          <div className="absolute h-6 w-6 rounded-full border-2 border-vinylBlack bg-amberGlow" style={{ left: -12, top: -12 }} />
        </div>

        <span className="absolute -left-4 top-2 animate-p5-pop bg-vinylBlack px-3 py-1 font-mono text-xs font-bold uppercase text-amberGlow">
          ✓ Verified shop
        </span>
      </div>

      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-pressed={playing}
        className="mt-6 -skew-x-6 border-2 border-vinylBlack bg-parchment px-4 py-1 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-amberGlow"
      >
        {playing ? "❚❚ Pause" : "▶ Play"}
      </button>
      <span className="ml-3 font-mono text-xs opacity-60">hover the record to spin it up</span>
    </div>
  );
}
