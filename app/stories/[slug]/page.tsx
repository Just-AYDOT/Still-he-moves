import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaperCard, { excerptOf } from "@/components/PaperCard";

import StoryActions from "@/components/StoryActions";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { getStory, isDemo, relatedStories } from "@/lib/db";
import { PARTS, site } from "@/lib/site";
import "./story.css";

export const revalidate = 600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStory((await params).slug);
  if (!story) return { title: "Story not found" };
  const description = excerptOf(story, 180);
  return {
    title: story.title,
    description,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: { type: "article", title: story.title, description, publishedTime: story.published_at ?? undefined },
  };
}

export default async function StoryPage({ params }: Props) {
  const story = await getStory((await params).slug);
  if (!story) notFound();
  const related = await relatedStories(story);
  const demo = isDemo();
  const words = [story.struggle, story.prayer, story.turning, story.now].join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const shared = story.published_at ? new Date(story.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const url = `${site.url}/stories/${story.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    datePublished: story.published_at,
    author: { "@type": "Person", name: story.author_name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-paper" style={{ paddingBlock: "32px 24px" }}>
        <div className="wrap" style={{ display: "grid", gap: 24 }}>
          <nav className="body-s muted" aria-label="Breadcrumb">
            <Link href="/stories" className="muted">Stories</Link>
            {"  /  "}
            <Link href={`/stories?category=${story.category}`} className="muted">{story.category}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="chip chip-soft">{story.category}</span>
            {story.city && <span className="chip chip-line">{story.city}</span>}
            <span className="chip">✓  Reviewed by our team</span>
            {demo && <span className="chip" style={{ background: "#fff4d6" }}>Sample story</span>}
          </div>
          <h1 className="h-display" style={{ maxWidth: 1000 }}>“{story.title}”</h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span className="avatar" aria-hidden="true">{story.author_name.slice(0, 1)}</span>
            <div>
              <p className="h-s">{story.author_name}{story.city ? `, ${story.city}` : ""}</p>
              <p className="body-s muted">
                {shared && `Shared ${shared}  ·  `}{minutes} min read{story.language !== "English" ? `  ·  In ${story.language}` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper" style={{ paddingBottom: "var(--section-y)" }}>
        <div className="wrap story-cols">
          <article style={{ display: "grid", gap: 40 }}>
            {PARTS.map((p) =>
              story[p.key] ? (
                <section key={p.key} style={{ display: "grid", gap: 14 }}>
                  <h2 className="eyebrow plain" style={{ fontWeight: 400 }}>{p.title}</h2>
                  {story[p.key].split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="story-body">{para}</p>
                  ))}
                </section>
              ) : null
            )}
            {story.pull_quote && <blockquote className="pull">“{story.pull_quote}”</blockquote>}
            <StoryActions id={story.id} slug={story.slug} title={story.title} amen={story.amen_count} url={url} demo={demo} />
          </article>
          <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <div className="card" style={{ display: "grid", gap: 14 }}>
              <p className="h-s">Still waiting for your own answer?</p>
              <p className="muted">Post a prayer request. Others will pray with you.</p>
              <div><ButtonLink href="/prayer-wall#post">Post a prayer request</ButtonLink></div>
            </div>
            <div className="card-deep" style={{ display: "grid", gap: 10 }}>
              <p className="h-s">How we checked this story</p>
              <p className="body-s muted">A member of our team spoke with the storyteller and confirmed the details before publishing. Names are hidden on request.</p>
              <Link href="/how-we-check" className="body-s link-plain">Read how we check  →</Link>
            </div>
            <p className="body-s muted">
              Something wrong with this story? <Link href={`/about?report=${story.slug}#contact`} className="link-plain">Report it</Link>
            </p>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <div className="section-head split">
              <div className="col">
                <Eyebrow plain>Keep reading</Eyebrow>
                <h2 className="h-section">
                  More stories of <em>{story.category.toLowerCase()}.</em>
                </h2>
              </div>
              <Link href={`/stories?category=${story.category}`} className="link-plain">See all {story.category.toLowerCase()} stories  →</Link>
            </div>
            <div className="grid grid-3">
              {related.map((s) => (
                <PaperCard key={s.id} story={s} href={`/stories/${s.slug}`} excerpt={excerptOf(s, 110)} sample={demo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section bg-paper">
        <div className="wrap your-turn">
          <div style={{ display: "grid", gap: 16 }}>
            <Eyebrow plain>Your turn</Eyebrow>
            <h2 className="h-section">
              Raise your own <em>stone.</em>
            </h2>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <ButtonLink href="/share">Share your testimony</ButtonLink>
            <p className="body-s muted">About ten minutes. You can stay anonymous.</p>
          </div>
        </div>
      </section>
    </>
  );
}
