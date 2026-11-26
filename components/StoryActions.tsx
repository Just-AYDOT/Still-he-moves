"use client";
import { useState } from "react";
import { ArrowIcon } from "./ui";

export default function StoryActions({ id, slug, title, amen, url, demo }: { id: string; slug: string; title: string; amen: number; url: string; demo: boolean }) {
  const [count, setCount] = useState(amen);
  const [said, setSaid] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  async function sayAmen() {
    if (said) return;
    setSaid(true);
    setCount((c) => c + 1);
    try {
      const key = `amen:${id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    if (!demo) await fetch("/api/amen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  const shareText = `${title}\n\nA testimony on Still He Moves: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch {
      flash(url);
    }
  }

  async function shareImage() {
    const imgUrl = `/stories/${slug}/image`;
    try {
      const blob = await fetch(imgUrl).then((r) => r.blob());
      const file = new File([blob], `${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text: url });
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}.png`;
      a.click();
      flash("Image saved. Post it to your Status.");
    } catch {
      window.open(imgUrl, "_blank");
    }
  }

  return (
    <div id="share" className="btn-row" style={{ paddingTop: 24 }}>
      <button className="btn no-arrow" onClick={sayAmen} aria-pressed={said} style={{ background: "var(--accent-soft)", color: "var(--ink)", gap: 10 }}>
        <span>🙏 Amen</span>
        <span style={{ color: "var(--accent-text)" }}>{count}</span>
      </button>
      <button className="btn btn-primary" onClick={shareImage}>
        <span>Share as image</span>
        <span className="arrow"><ArrowIcon /></span>
      </button>
      <a className="btn btn-outline no-arrow" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <button className="btn btn-outline no-arrow" onClick={copy}>Copy link</button>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
