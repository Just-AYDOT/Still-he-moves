import Link from "next/link";
import { site } from "@/lib/site";
import SubscribeForm from "./SubscribeForm";
import { Eyebrow, Logo } from "./ui";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div style={{ display: "grid", gap: 16 }}>
            <Eyebrow plain>Stay close</Eyebrow>
            <h2 className="h-section">
              One testimony, every <em>Sunday morning.</em>
            </h2>
          </div>
          <SubscribeForm />
        </div>
        <hr />
        <p className="footer-line">
          His story. <em>Your</em> story. Every Sunday.
        </p>
        <div className="footer-bottom">
          <Logo />
          <nav className="footer-links" aria-label="Footer">
            <Link href="/stories">Stories</Link>
            <Link href="/prayer-wall">Prayer wall</Link>
            <Link href="/how-we-check">How we check stories</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/about#contact">Contact</Link>
          </nav>
          <p className="hand" style={{ color: "var(--accent-text)", fontSize: 18 }}>Made in Lagos, for everywhere</p>
        </div>
        <p className="note" style={{ marginTop: 28 }}>© {new Date().getFullYear()} {site.name}. Free to read, free to share, free to tell.</p>
      </div>
    </footer>
  );
}
