import ProductCard from "../components/ProductCard";
import SlashHeading from "../components/SlashHeading";
import { products } from "../data/mockData";
import VinylRecord from "../components/VinylRecord";

// literal strings so Tailwind can see them
const TILTS = ["hover-tilt-1", "-hover-tilt-1"];

const GRADES = [
  ["Mint", "Sealed or played once. Flawless."],
  ["VG+", "Light wear. Plays beautifully."],
  ["VG", "Visible wear. Minor surface noise."],
  ["Fair", "Plays through. Heavy wear."],
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* HERO */}
      <section className="px-6 pb-16 pt-8 md:px-12">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-pine">
            Analogue · Vintage · Independent
          </p>
          <h1 className="font-display text-6xl italic leading-[1.05] md:text-8xl">
            <span className="clip-slash inline-block animate-slash-in bg-vinylBlack px-6 py-1 text-parchment">
              Spin the
            </span>
            <br />
            <span
              className="clip-slash inline-block animate-slash-in bg-amberGlow px-6 py-1 text-vinylBlack"
              style={{ animationDelay: "150ms" }}
            >
              past.
            </span>
          </h1>
          <p className="mt-8 max-w-md font-mono text-sm leading-relaxed">
            A marketplace of independent shops selling graded vinyl, vintage
            apparel and restored turntables. Every record, honestly described.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#crate"
              className="hover-tilt-2 inline-block border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-sm font-bold uppercase shadow-p5"
            >
              Browse the crate
            </a>
            <a
              href="#grades"
              className="-hover-tilt-2 inline-block border-2 border-vinylBlack bg-parchment px-6 py-3 font-mono text-sm font-bold uppercase shadow-p5"
            >
              How we grade
            </a>
          </div>
        </div>

        </section>

      {/* CRATE */}
      <section id="crate" className="bg-pine/15 px-6 py-16 md:px-12">
        <SlashHeading as="h2" className="mb-10">
          Fresh in the crate
        </SlashHeading>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
