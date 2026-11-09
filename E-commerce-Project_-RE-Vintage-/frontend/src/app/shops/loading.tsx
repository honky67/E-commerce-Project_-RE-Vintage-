import { Bar, ShopCardSkeleton } from "../../components/Skeletons";

export default function Loading() {
  return (
    <section className="px-6 py-12 md:px-12" role="status" aria-label="Loading shops">
      <Bar className="mb-10 h-14 w-72" tone="bg-vinylBlack/30" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ShopCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
