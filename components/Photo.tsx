"use client";
import { useEffect, useRef, useState } from "react";

// Shows /photos/<name>.jpg when it exists. Until the photos are exported from Figma,
// a soft sky gradient stands in so layouts still hold.
export default function Photo({ name, alt, className = "", style, priority = false }: { name: string; alt: string; className?: string; style?: React.CSSProperties; priority?: boolean }) {
  const [missing, setMissing] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // The image may fail before React hydrates, so check once on mount too
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setMissing(true);
  }, []);
  return (
    <div className={`photo ${className}`} style={style} role={missing && alt ? "img" : undefined} aria-label={missing && alt ? alt : undefined}>
      {!missing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={`/photos/${name}.jpg`} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setMissing(true)} />
      )}
    </div>
  );
}
