"use client";

import { useEffect, useRef, useState } from "react";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

export default function ImageDropzone({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f?: File) => {
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) return setError("Use a JPG, PNG or WebP image.");
    if (f.size > MAX_MB * 1024 * 1024) return setError(`Image must be ${MAX_MB} MB or smaller.`);
    setError("");
    onChange(f);
  };

  return (
    <div>
      <p className="mb-1 font-mono text-xs font-bold uppercase">Product image (optional)</p>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
          className={`flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-vinylBlack text-center font-mono text-xs transition-colors ${over ? "bg-amberGlow" : "bg-parchment hover:bg-amberGlow/40"}`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2">Drop image here or click</span>
          )}
        </button>
        <div className="font-mono text-xs">
          <p className="opacity-60">JPG, PNG or WebP · max {MAX_MB} MB · square works best</p>
          {file && (
            <button type="button" onClick={() => onChange(null)} className="mt-2 font-bold underline hover:text-red-600">
              Remove image
            </button>
          )}
          {error && <p role="alert" className="mt-2 font-bold text-red-600">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
