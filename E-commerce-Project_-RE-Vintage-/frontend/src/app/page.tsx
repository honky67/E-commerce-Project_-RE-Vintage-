export default function Home() {
  return (
    <main className="p-10">
      <h1 className="clip-slash inline-block animate-slash-in bg-vinylBlack px-6 py-2 font-display text-5xl italic text-parchment hover:bg-amberGlow hover:text-vinylBlack">
        New Arrivals
      </h1>
      <p className="mt-6 font-mono text-sm text-pine">CAT# VNL-0042</p>
      <div className="mt-10 h-40 w-40 animate-spin-slow rounded-full bg-vinylBlack shadow-p5-amber" />
    </main>
  );
}