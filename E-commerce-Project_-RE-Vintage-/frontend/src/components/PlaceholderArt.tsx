import SmartImage from "./SmartImage";

export default function PlaceholderArt({
  tone,
  label,
  image,
  className = "",
}: {
  tone: string;
  label: string;
  image?: string | null;
  className?: string;
}) {
  return (
    <div className={`relative flex h-full w-full items-end overflow-hidden ${tone} ${className}`}>
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, #F8F5EE 0 2px, transparent 2px 14px)" }}
      />
      {image ? (
        <SmartImage src={image} alt={label} className="absolute inset-0 h-full w-full" fallbackClass="hidden" />
      ) : (
        <span className="relative max-w-full break-words p-3 font-display text-4xl italic leading-[1.1] text-parchment sm:text-5xl">{label}</span>
      )}
    </div>
  );
}
