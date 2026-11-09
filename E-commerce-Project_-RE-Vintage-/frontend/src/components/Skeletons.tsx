export function Bar({ className = "", tone = "bg-vinylBlack/15" }: { className?: string; tone?: string }) {
  return <div className={`h-4 -skew-x-6 animate-pulse ${tone} ${className}`} />;
}

const CARD = "border-2 border-vinylBlack bg-parchment shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";

export function ShopCardSkeleton() {
  return (
    <div className={CARD} aria-hidden>
      <div className="h-28 animate-pulse border-b-2 border-vinylBlack bg-vinylBlack/20" />
      <div className="space-y-3 px-4 pb-4">
        <div className="-mt-8 h-16 w-16 -skew-x-6 animate-pulse border-4 border-parchment bg-vinylBlack/30" />
        <Bar className="h-7 w-3/4" />
        <Bar className="w-1/3" />
        <div className="flex gap-2">
          <Bar className="h-5 w-28" tone="bg-vinylBlack/25" />
          <Bar className="h-5 w-20" tone="bg-vinylBlack/25" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Bar className="w-16" />
          <Bar className="h-7 w-28" tone="bg-red-600/30" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={CARD} aria-hidden>
      <div className="h-48 animate-pulse border-b-2 border-vinylBlack bg-vinylBlack/20" />
      <div className="space-y-2 p-4">
        <Bar className="h-6 w-4/5" />
        <Bar className="h-7 w-1/3" tone="bg-red-600/30" />
        <div className="flex justify-between pt-3">
          <Bar className="h-6 w-28" tone="bg-vinylBlack/25" />
          <Bar className="h-6 w-20" tone="bg-amberGlow/50" />
        </div>
      </div>
    </div>
  );
}
