import Image from "next/image";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import SlashHeading from "../components/SlashHeading";
import { getProducts } from "../lib/catalog";
import VinylRecord from "../components/VinylRecord";

export const dynamic = "force-dynamic";

// literal strings so Tailwind can see them
const TILTS = ["hover-tilt-1", "-hover-tilt-1"];

const GRADES = [
  ["Mint", "Sealed or played once. Flawless."],
  ["VG+", "Light wear. Plays beautifully."],
  ["VG", "Visible wear. Minor surface noise."],
  ["Fair", "Plays through. Heavy wear."],
];

export default async function Home() {
  const products = await getProducts({ limit: 6 });
  return (
    <main className="overflow-x-hidden">
      {/* HERO BANNER */}
      <section className="relative flex min-h-[440px] w-full flex-col justify-between overflow-hidden border-b-2 border-vinylBlack bg-vinylBlack md:min-h-[540px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg"
            alt="RE:VINTAGE Analogue Collective vinyl records wall"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Directional Dark Gradient Overlay: 0.82 left tint to 0.38 right tint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(18,16,14,0.82) 0%, rgba(18,16,14,0.82) 42%, rgba(18,16,14,0.64) 68%, rgba(18,16,14,0.38) 100%)",
          }}
        />

        {/* Mobile vertical contrast enhancement overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-vinylBlack/80 via-transparent to-transparent md:hidden"
        />

        {/* Hero Editorial Content */}
        <div className="relative z-20 flex flex-1 flex-col justify-center px-6 py-12 sm:py-16 md:px-12 md:py-20">
          <div className="max-w-2xl">
            {/* Tilted Crimson / Gold Eyebrow Badge */}
            <div className="mb-4 inline-block sm:mb-5">
              <span className="hover-tilt-2 inline-flex -rotate-2 items-center gap-2 border-2 border-amberGlow bg-red-600 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-parchment shadow-p5">
                <span className="h-2 w-2 rounded-full bg-amberGlow" />
                <span className="text-amberGlow">ANALOGUE COLLECTIVE</span>
                <span className="text-parchment/60">•</span>
                <span className="text-parchment">EST. 2026</span>
              </span>
            </div>

            {/* Bold Editorial Headline */}
            <h1 className="font-display text-4xl italic leading-[1.04] tracking-tight text-parchment drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
              CURATED VINYL, CLASSIC GEAR{" "}
              <span className="not-italic text-amberGlow">&amp;</span>{" "}
              VINTAGE APPAREL
            </h1>

            {/* Concise 1-sentence Subheadline */}
            <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-parchment/90 sm:mt-6 sm:text-sm md:text-base">
              An independent marketplace of verified shops offering graded vinyl, restored analogue gear, and authentic vintage apparel.
            </p>

            {/* CTAs: Gold Primary & Crisp White/Outlined Secondary */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#crate"
                className="hover-tilt-2 inline-flex items-center justify-center border-2 border-vinylBlack bg-amberGlow px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-p5 transition-transform active:translate-x-0.5 active:translate-y-0.5 sm:text-sm"
              >
                EXPLORE CATALOG
              </a>
              <Link
                href="/shops"
                className="-hover-tilt-2 inline-flex items-center justify-center border-2 border-parchment bg-parchment/15 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-parchment shadow-[4px_4px_0px_0px_rgba(248,245,238,0.25)] backdrop-blur-sm transition-all hover:bg-parchment hover:text-vinylBlack hover:shadow-p5 active:translate-x-0.5 active:translate-y-0.5 sm:text-sm"
              >
                BROWSE SHOPS
              </Link>
            </div>
          </div>
        </div>

        {/* Compact 3-item Trust Bar along the bottom edge */}
        <div className="relative z-20 border-t-2 border-vinylBlack bg-vinylBlack/90 backdrop-blur-md">
          <div className="grid grid-cols-1 divide-y-2 divide-vinylBlack font-mono text-[11px] font-bold uppercase tracking-wider text-parchment sm:grid-cols-3 sm:divide-y-0 sm:divide-x-2 sm:text-xs">
            <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-center">
              <span className="h-2 w-2 -rotate-45 bg-amberGlow" />
              <span>VERIFIED INDEPENDENT SHOPS</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-center">
              <span className="h-2 w-2 -rotate-45 bg-red-600" />
              <span>GRADED VINYL &amp; AUDIO GEAR</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 px-4 py-3 text-center">
              <span className="h-2 w-2 -rotate-45 bg-pine" />
              <span>CURATED ANALOGUE FINDS</span>
            </div>
          </div>
        </div>
      </section>

      {/* CRATE */}
      <section id="crate" className="bg-pine/15 px-6 py-16 md:px-12">
        <SlashHeading as="h2" className="mb-10">
          Fresh in the crate
        </SlashHeading>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 && <p className="font-mono text-sm">No products yet. Sellers can add some from their dashboard.</p>}
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* GRADES */}
      <section id="grades" className="px-6 py-16 md:px-12">
        <h2 className="mb-8 font-display text-4xl italic">The grading scale</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GRADES.map(([grade, desc], i) => (
            <div
              key={grade}
              className={`border-2 border-vinylBlack p-5 shadow-p5 transition-colors hover:bg-amberGlow ${TILTS[i % 2]}`}
            >
              <p className="font-display text-4xl italic">{grade}</p>
              <p className="mt-2 font-mono text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 bg-vinylBlack px-6 py-8 text-parchment md:px-12">
        <VinylRecord size={56} spin label="" catalog="" className="shadow-none" />
        <p className="font-mono text-xs uppercase tracking-widest">
          RE—VINTAGE · Analogue goods, independent sellers
        </p>
        <p className="font-mono text-xs text-pine">CAT# FTR-0001</p>
      </footer>
    </main>
  );
}
