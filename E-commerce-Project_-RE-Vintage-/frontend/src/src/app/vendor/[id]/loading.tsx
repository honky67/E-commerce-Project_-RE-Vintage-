import { Bar, ProductCardSkeleton } from "../../../components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10" role="status" aria-label="Loading shop">
      <div className="h-44 animate-pulse border-2 border-vinylBlack bg-vinylBlack/20" />
      <div className="-mt-12 flex items-end gap-6 px-6">
        <div className="h-24 w-24 -skew-x-6 animate-pulse border-4 border-parchment bg-vinylBlack/30" />
        <Bar className="h-12 w-72" tone="bg-vinylBlack/30" />
      </div>
      <div className="mt-6 space-y-2">
        <Bar className="w-2/3" />
        <Bar className="w-1/2" />
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
