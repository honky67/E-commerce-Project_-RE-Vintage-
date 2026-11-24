import Link from "next/link";
import PageShell from "../components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="404 — Not Found">
      <div className="mx-auto max-w-lg border-2 border-vinylBlack bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="-skew-x-6 inline-block bg-red-600 px-4 py-1 font-mono text-xs font-bold uppercase text-parchment">
          End of the Groove
        </p>
        <h2 className="mt-4 font-display text-5xl italic leading-tight text-vinylBlack">
          Record Not Found
        </h2>
        <p className="mt-3 font-mono text-xs leading-relaxed opacity-75">
          The album, piece of gear, or page you are looking for has slipped off the turntable or does not exist.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="-skew-x-6 inline-block border-2 border-vinylBlack bg-amberGlow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-vinylBlack shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-vinylBlack hover:text-parchment"
          >
            Back to Homepage →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
