import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Kind = "primary" | "secondary" | "outline" | "light";

export function ButtonLink({ href, children, kind = "primary", arrow = true, small = false, className = "" }: { href: string; children: ReactNode; kind?: Kind; arrow?: boolean; small?: boolean; className?: string }) {
  return (
    <Link href={href} className={`btn btn-${kind} ${arrow ? "" : "no-arrow"} ${small ? "btn-sm" : ""} ${className}`}>
      <span>{children}</span>
      {arrow && (
        <span className="arrow">
          <ArrowIcon />
        </span>
      )}
    </Link>
  );
}

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label={`${site.name}, home`}>
      {site.logo.before}
      <em>{site.logo.em}</em>
      {site.logo.after}
    </Link>
  );
}

export function Eyebrow({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return <p className={`eyebrow ${plain ? "plain" : ""}`}>{children}</p>;
}

export function StoneStack({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="52" rx="24" ry="9" fill="#b9c6d8" />
      <ellipse cx="31" cy="37" rx="18" ry="8" fill="#d3d9e2" />
      <ellipse cx="33" cy="24" rx="13" ry="6.5" fill="#8fa3c0" />
      <ellipse cx="32" cy="13" rx="8" ry="4.5" fill="#2f5d9e" />
    </svg>
  );
}

// Stones for the four parts: one more stone per step, like the Figma "Raise your stone" row
export function Stones({ count }: { count: number }) {
  const stones = [
    { cx: 85, cy: 128, rx: 62, ry: 17, fill: "#b9c6d8" },
    { cx: 82, cy: 98, rx: 46, ry: 14, fill: "#d3d9e2" },
    { cx: 88, cy: 72, rx: 33, ry: 11, fill: "#8fa3c0" },
    { cx: 85, cy: 50, rx: 20, ry: 8, fill: "#2f5d9e" },
  ];
  return (
    <svg width="170" height="150" viewBox="0 0 170 150" aria-hidden="true">
      {stones.slice(0, count).map((s, i) => (
        <ellipse key={i} {...s} />
      ))}
    </svg>
  );
}
