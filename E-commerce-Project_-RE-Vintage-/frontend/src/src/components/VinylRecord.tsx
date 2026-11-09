type VinylRecordProps = {
  size?: number;
  label?: string;
  catalog?: string;
  spin?: boolean;
  className?: string;
};

export default function VinylRecord({
  size = 340,
  label = "RE-VINTAGE",
  catalog = "VNL-0001",
  spin = true,
  className = "",
}: VinylRecordProps) {
  return (
    <div
      aria-hidden
      className={`relative shrink-0 rounded-full bg-vinylBlack shadow-p5-amber ${
        spin ? "animate-spin-slow" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage:
          "repeating-radial-gradient(circle at center, transparent 0, transparent 3px, rgba(248,245,238,0.07) 4px)",
      }}
    >
      {/* light sheen */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "conic-gradient(from 20deg, transparent 0deg, rgba(248,245,238,0.16) 40deg, transparent 90deg, transparent 180deg, rgba(248,245,238,0.16) 220deg, transparent 270deg)",
        }}
      />
      {/* center label */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pine text-vinylBlack"
        style={{ width: size * 0.36, height: size * 0.36 }}
      >
        <span
          className="absolute left-0 right-0 text-center font-display italic leading-none"
          style={{ top: "16%", fontSize: Math.max(size * 0.05, 8) }}
        >
          {label}
        </span>
        <span
          className="absolute left-0 right-0 text-center font-mono leading-none"
          style={{ bottom: "16%", fontSize: Math.max(size * 0.032, 6) }}
        >
          {catalog}
        </span>
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-parchment" />
      </div>
    </div>
  );
}
