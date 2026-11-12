import type { ElementType, ReactNode } from "react";

/**
 * Heading with a skewed background block. The shape lives on its own layer, so the text stays upright,
 * is never clipped, and always has room inside the box (the old clip-path version cut off italic letters).
 */
export default function SlashHeading({
  children,
  as: Tag = "h2",
  tone = "bg-vinylBlack",
  text = "text-parchment",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  tone?: string;
  text?: string;
  className?: string;
}) {
  return (
    <Tag className={`relative isolate inline-block px-10 py-3 font-display text-4xl italic leading-[1.2] ${text} ${className}`}>
      <span aria-hidden className={`absolute inset-0 -z-10 -skew-x-12 animate-slash-wipe ${tone}`} />
      {children}
    </Tag>
  );
}
