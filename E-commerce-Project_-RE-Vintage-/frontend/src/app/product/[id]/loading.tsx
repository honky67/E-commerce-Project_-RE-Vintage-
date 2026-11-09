import { Bar } from "../../../components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-2" role="status" aria-label="Loading product">
      <div>
        <div className="aspect-square animate-pulse border-2 border-vinylBlack bg-vinylBlack/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
        <div className="mt-4 flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 w-16 -skew-x-6 animate-pulse border-2 border-vinylBlack bg-vinylBlack/15" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Bar className="w-24" />
        <Bar className="h-12 w-4/5" tone="bg-vinylBlack/25" />
        <Bar className="h-9 w-32" tone="bg-red-600/30" />
        <div className="flex gap-2 pt-4">
          {[0, 1, 2, 3].map((i) => (
            <Bar key={i} className="h-8 w-14" tone="bg-vinylBlack/25" />
          ))}
        </div>
        <Bar className="h-12 w-48" tone="bg-amberGlow/50" />
        <div className="space-y-2 pt-8">
          <Bar className="w-full" />
          <Bar className="w-11/12" />
          <Bar className="w-3/4" />
        </div>
      </div>
    </div>
  );
}
