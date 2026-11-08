export default function PlaceholderArt({
  tone,
  label,
  className = "",
}: {
  tone: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative flex h-full w-full items-end overflow-hidden ${tone} ${className}`}>
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, #F8F5EE 0 2px, transparent 2px 14px)" }}
      />
      <span className="relative p-3 font-display text-5xl italic leading-none text-parchment">{label}</span>
    </div>
  );
}
