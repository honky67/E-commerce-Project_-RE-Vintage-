import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#F8F5EE",
        pine: "#C88A4A",
        amberGlow: "#E69A39",
        vinylBlack: "#1E1B18",
      },
      fontFamily: {
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        p5: "6px 6px 0 0 #1E1B18",
        "p5-amber": "6px 6px 0 0 #E69A39",
        "p5-pine": "6px 6px 0 0 #C88A4A",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "slash-in": {
          "0%": { opacity: "0", transform: "translateX(-120%) skewX(-24deg) rotate(-6deg)" },
          "60%": { opacity: "1", transform: "translateX(4%) skewX(-10deg) rotate(1deg)" },
          "100%": { opacity: "1", transform: "translateX(0) skewX(-12deg) rotate(0deg)" },
        },
        "slash-rotate": {
          "0%": { opacity: "0", transform: "rotate(-18deg) scale(0.7)", transformOrigin: "0% 100%" },
          "70%": { opacity: "1", transform: "rotate(3deg) scale(1.06)", transformOrigin: "0% 100%" },
          "100%": { opacity: "1", transform: "rotate(-2deg) scale(1)", transformOrigin: "0% 100%" },
        },
        "slash-wipe": {
          "0%": { clipPath: "polygon(0 0, 0 0, -12% 100%, -12% 100%)" },
          "100%": { clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)" },
        },
        "p5-pop": {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-10deg)" },
          "70%": { opacity: "1", transform: "scale(1.1) rotate(3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-2deg)" },
        },
        "tilt-wobble": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "spin-slower": "spin 14s linear infinite",
        "slash-in": "slash-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slash-rotate": "slash-rotate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slash-wipe": "slash-wipe 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "p5-pop": "p5-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "tilt-wobble": "tilt-wobble 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, matchUtilities, theme }) {
      matchUtilities(
        {
          "hover-tilt": (value) => ({
            transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            willChange: "transform",
            "&:hover": { transform: `rotate(${value}) skewX(-3deg) scale(1.04)` },
          }),
        },
        { values: theme("rotate"), supportsNegativeValues: true },
      );

      addUtilities({
        ".tilt-left": {
          transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": { transform: "rotate(-3deg) skewX(-4deg) scale(1.04)" },
        },
        ".tilt-right": {
          transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": { transform: "rotate(3deg) skewX(4deg) scale(1.04)" },
        },
        ".tilt-3d": {
          transformStyle: "preserve-3d",
          transition: "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": { transform: "perspective(800px) rotateX(4deg) rotateY(-6deg) translateY(-2px)" },
        },
        ".clip-slash": { clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" },
        ".clip-slash-reverse": { clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" },
        ".clip-slash-both": { clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)" },
        ".spin-pause-hover:hover": { animationPlayState: "paused" },
      });
    }),
  ],
};

export default config;