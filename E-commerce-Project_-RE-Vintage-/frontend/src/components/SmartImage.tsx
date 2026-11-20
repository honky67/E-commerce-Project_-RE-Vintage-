"use client";

import { useEffect, useState } from "react";
import { assetUrl } from "../lib/api";

/** object-cover image that falls back to a solid block when the file is missing or fails to load. */
export default function SmartImage({
  src,
  alt,
  className = "",
  fallbackClass = "bg-vinylBlack",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const url = assetUrl(src);

  if (!url || failed) return <div role="img" aria-label={alt} className={`${fallbackClass} ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
