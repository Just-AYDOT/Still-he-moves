"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink, Logo } from "./ui";

const LINKS = [
  { href: "/stories", label: "Stories" },
  { href: "/prayer-wall", label: "Prayer wall" },
  { href: "/how-we-check", label: "How we check" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => (path === href || path.startsWith(href + "/") ? "page" : undefined);

  return (
    <>
      <div className="langbar">
        <div className="wrap">
          <span className="new">New</span>
          <span className="long">Read and share in English, Yorùbá, Igbo, Hausa and Pidgin. Tell it in the language you prayed in.</span>
          <span className="short">Share in English, Yorùbá, Igbo, Hausa or Pidgin.</span>
        </div>
      </div>
      <header className="nav">
        <div className="wrap">
          <Logo />
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                {l.label}
              </Link>
            ))}
            <ButtonLink href="/share" kind="secondary">Share your testimony</ButtonLink>
          </nav>
          <div className="nav-right">
            <ButtonLink href="/share" kind="secondary" small className="nav-cta-mobile">Share yours</ButtonLink>
            <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer-top">
            <Logo />
            <button className="menu-btn" aria-label="Close menu" onClick={() => setOpen(false)} autoFocus>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <nav aria-label="Menu">
            <Link href="/">Home</Link>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <ButtonLink href="/share">Share your testimony</ButtonLink>
          <p className="hand muted" style={{ marginTop: 24, fontSize: 18 }}>Made in Lagos, for everywhere</p>
        </div>
      )}
    </>
  );
}
