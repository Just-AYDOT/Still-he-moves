import type { Metadata } from "next";
import Link from "next/link";
import PaperCard, { excerptOf } from "@/components/PaperCard";
import { ButtonLink, Eyebrow, StoneStack } from "@/components/ui";
import { categoryCounts, isDemo, listStories } from "@/lib/db";
import { CATEGORIES } from "@/lib/site";

export const metadata: Metadata = { title: "Stories", description: "Read first-hand testimonies of healing, provision, marriage, deliverance and salvation." };
export const revalidate = 300;

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams;
  const category = CATEGORIES.find((c) => c === sp.category);
  const q = (sp.q ?? "").slice(0, 80);
  const [stories, counts] = await Promise.all([listStories({ category, q }), categoryCounts()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const demo = isDemo();

  return (
    <>
      <section className="section bg-paper" style={{ paddingBottom: 40 }}>
        <div className="wrap" style={{ display: "grid", gap: 24 }}>
          <Eyebrow plain>Testimonies</Eyebrow>
          <h1 className="h-display">
            What He <em>has done.</em>
          </h1>
          <p className="lead" style={{ maxWidth: 600 }}>Every story here was read by our team before it went live. Search by place, or pick a kind of miracle.</p>
          <form role="search" action="/stories" style={{ display: "flex", gap: 10, maxWidth: 640, flexWrap: "wrap" }}>
            {category && <input type="hidden" name="category" value={category} />}
            <label htmlFor="q" className="sr-only">Search stories</label>
            <input id="q" name="q" defaultValue={q} className="input" placeholder="Search a city, a word, a need…" style={{ flex: "1 1 260px", borderRadius: 999, paddingInline: 22 }} />
            <button className="btn btn-primary no-arrow" type="submit">Search</button>
          </form>
          <nav aria-label="Filter by category" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={q ? `/stories?q=${encodeURIComponent(q)}` : "/stories"} className={`chip ${!category ? "chip-soft" : "chip-line"}`} aria-current={!category ? "page" : undefined} style={{ textDecoration: "none" }}>
              All <span className="muted">{total}</span>
            </Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={`/stories?category=${c}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`chip ${category === c ? "chip-soft" : "chip-line"}`} aria-current={category === c ? "page" : undefined} style={{ textDecoration: "none" }}>
                {c} <span className="muted">{counts[c] ?? 0}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="bg-paper" style={{ paddingBottom: "var(--section-y)" }}>
        <div className="wrap">
          {stories.length ? (
            <div className="grid grid-3">
              {stories.map((s) => (
                <PaperCard key={s.id} story={s} href={`/stories/${s.slug}`} excerpt={excerptOf(s)} sample={demo} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", display: "grid", gap: 14, justifyItems: "center", padding: 48 }}>
              <StoneStack size={56} />
              <p className="h-s">{q ? `No stories match “${q}” yet.` : "No stories here yet."}</p>
              <p className="muted">Try another word or category, or be the first to share one.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <ButtonLink href="/stories" kind="outline" arrow={false}>Clear search</ButtonLink>
                <ButtonLink href="/share">Share your testimony</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
