import Link from "next/link";
import PaperCard, { excerptOf } from "@/components/PaperCard";
import Photo from "@/components/Photo";
import { ButtonLink, Eyebrow, StoneStack, Stones } from "@/components/ui";
import { categoryCounts, getStats, isDemo, listPrayers, listStories } from "@/lib/db";
import { CATEGORIES, PARTS, site } from "@/lib/site";
import "./home.css";

export const revalidate = 300; // refresh the home page every five minutes

const fmt = (n: number) => n.toLocaleString("en-NG");

const FAQ = [
  { q: "Can I share without my name?", a: "Yes. Choose “Keep me anonymous” in the last step. We only show your first name or initials if you say so, and never your phone number." },
  { q: "Who reads my story before it goes live?", a: "We read every story before it is published, and we may call or WhatsApp you to check the details. Nothing goes live until you approve the final version." },
  { q: "Does it cost anything?", a: "No. Reading, sharing a testimony and praying with others are free." },
  { q: "Can I write in Yorùbá, Igbo, Hausa or Pidgin?", a: "Yes. Write in the language you pray in." },
  { q: "Can I take my story down later?", a: "Yes. Ask at any time and we will withdraw it. Your story stays yours." },
  { q: "How is the prayer wall kept safe?", a: "Every request is read before it appears, names are optional, and we never show contact details." },
];

export default async function Home() {
  const [stats, counts, stories, prayers] = await Promise.all([getStats(), categoryCounts(), listStories({ limit: 6 }), listPrayers(6)]);
  const demo = isDemo();
  const [featured, ...rest] = stories;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" });
  const openPrayers = prayers.filter((p) => p.status === "published").slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="hero bg-paper">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="hand verse">{site.verse}</p>
            <h1 className="h-display">
              Tell the world <em>what God did.</em>
            </h1>
            <p className="lead" style={{ maxWidth: 540 }}>{site.tagline} Read one, then write yours.</p>
            <div className="btn-row">
              <ButtonLink href="/share">Share your testimony</ButtonLink>
              <ButtonLink href="/stories" kind="outline">Read the stories</ButtonLink>
            </div>
            <div className="stones-raised">
              <StoneStack />
              <div>
                <p className="stones-n">{fmt(stats.stories)} {stats.stories === 1 ? "stone" : "stones"} raised</p>
                <p className="body-s muted">Every testimony here is a stone of remembrance.</p>
              </div>
            </div>
          </div>
          <Photo name="worship" alt="A congregation worshipping in morning light" className="round hero-photo" priority />
        </div>
      </section>

      {/* Impact */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="section-head split">
            <div className="col">
              <Eyebrow plain>Free, for everyone</Eyebrow>
              <h2 className="h-section">
                Every story is <em className="ink">free</em> to read, free to share, free to tell.
              </h2>
            </div>
            <p className="story-body muted" style={{ maxWidth: 344 }}>No ads, no paywall. We exist so that what God did in one home can reach the next one.</p>
          </div>
          <div className="stats">
            {[
              [stats.stories, "stories told", "and counting"],
              [stats.prayers, "prayers prayed", "on the prayer wall"],
              [stats.answered, "prayers answered", "and written up"],
              [stats.cities, "cities", "from Kano to London"],
            ].map(([n, label, sub]) => (
              <div className="stat" key={label as string}>
                <p className="stat-n">{fmt(n as number)}</p>
                <p className="h-s">{label}</p>
                <p className="stat-sub">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimony of the day */}
      {featured && (
        <section className="section bg-paper">
          <div className="wrap featured">
            <div className="featured-copy">
              <Eyebrow plain>Testimony of the day · {today}</Eyebrow>
              <blockquote className="featured-quote">“{featured.pull_quote || featured.title}”</blockquote>
              <div className="featured-meta">
                <p className="muted" style={{ fontWeight: 500 }}>
                  {featured.author_name}, {featured.city}  ·  {featured.category}
                  {demo && "  ·  Sample"}
                </p>
                <div className="btn-row">
                  <ButtonLink href={`/stories/${featured.slug}`}>Read the story</ButtonLink>
                  <ButtonLink href={`/stories/${featured.slug}#share`} kind="outline" arrow={false}>Share as image</ButtonLink>
                </div>
              </div>
            </div>
            <Photo name="envelope" alt="Hands holding an envelope" className="featured-photo" />
          </div>
        </section>
      )}

      {/* Stories */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="section-head">
            <Eyebrow plain>Testimonies</Eyebrow>
            <h2 className="h-section">
              What He has done <em className="muted">this month</em>
            </h2>
            <nav className="cats" aria-label="Categories">
              {CATEGORIES.map((c) => (
                <Link key={c} href={`/stories?category=${c}`} className="cat">
                  <span>{c}</span>
                  <small>{counts[c] ?? 0}</small>
                </Link>
              ))}
            </nav>
          </div>
          {stories.length === 0 ? (
            <EmptyStories />
          ) : (
            <div className="grid grid-3">
              {(rest.length ? rest : stories).slice(0, 6).map((s) => (
                <PaperCard key={s.id} story={s} href={`/stories/${s.slug}`} excerpt={excerptOf(s, 130)} sample={demo} />
              ))}
            </div>
          )}
          <div className="btn-row" style={{ marginTop: 40 }}>
            <ButtonLink href="/stories">See all {fmt(stats.stories)} stories</ButtonLink>
            <p className="hand muted" style={{ fontSize: 18 }}>Written on paper by the people who lived them.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how">
        <div className="wrap how-grid">
          <h2 className="how-title">Share yours in about ten minutes</h2>
          <ol className="how-steps">
            {[
              ["Write it in four parts", "The Struggle, The Prayer, The Turning Point and Life Now. Short prompts keep you going."],
              ["Choose your paper", "Ledger, Adire, Dawn or Plain. Your story looks the way it feels."],
              ["We read it first", "Our team checks every story and may call you before it goes live. You can stay anonymous."],
              ["Share it everywhere", "Send the link on WhatsApp, or save your story as an image for your Status."],
            ].map(([t, d], i) => (
              <li key={t}>
                <span className="how-n">{i + 1}</span>
                <p className="h-s" style={{ color: "#fff" }}>{t}</p>
                <p style={{ color: "var(--paper-deep)" }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prayer wall */}
      <section className="pw bg-paper">
        <Photo name="bedside-prayer" alt="A woman praying at her bedside" className="pw-photo" />
        <div className="pw-copy">
          <Eyebrow plain>The prayer wall</Eyebrow>
          <h2 className="h-section">
            Nobody prays <em>alone</em> here.
          </h2>
          <p className="lead">Post what you are trusting God for. Others will pray with you. When the answer comes, come back and raise your stone.</p>
          <div style={{ display: "grid", gap: 12 }}>
            {openPrayers.map((p) => (
              <div key={p.id} className="pw-item">
                <p className="pw-body">{p.body}</p>
                <p className="body-s" style={{ color: "var(--accent-text)", fontWeight: 500 }}>
                  {p.name} · {p.pray_count} praying
                </p>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <ButtonLink href="/prayer-wall#post">Post a prayer request</ButtonLink>
            <ButtonLink href="/prayer-wall" kind="outline">Pray for someone</ButtonLink>
          </div>
        </div>
      </section>

      {/* Raise your stone */}
      <section className="section bg-white">
        <div className="wrap">
          <div className="section-head split">
            <div className="col">
              <Eyebrow plain>Share yours</Eyebrow>
              <h2 className="h-section">
                Raise your <em className="ink">stone.</em>
              </h2>
            </div>
            <p className="story-body muted" style={{ fontStyle: "italic", maxWidth: 440 }}>
              Samuel set up a stone and called it Ebenezer so Israel would remember. Your story does the same for someone still waiting.
            </p>
          </div>
          <div className="grid grid-4">
            {PARTS.map((p, i) => (
              <div key={p.key} style={{ display: "grid", gap: 14, alignContent: "start" }}>
                <Stones count={i + 1} />
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 32 }}>{p.title}</h3>
                <p className="muted">{p.prompt.split(". Be specific")[0].replace(/\.?$/, ".")}</p>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 48 }}>
            <ButtonLink href="/share">Start writing</ButtonLink>
            <p className="muted">About ten minutes. You can stay anonymous. Our team reads every story before it goes live.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-paper">
        <div className="wrap faq">
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <Eyebrow>Before you share</Eyebrow>
            <h2 className="h-section">
              Questions, <em>honestly answered.</em>
            </h2>
            <p className="muted">Still unsure? Read how we check every story, or write to us.</p>
            <div>
              <ButtonLink href="/how-we-check" kind="outline">How we check stories</ButtonLink>
            </div>
          </div>
          <div className="faq-list">
            {FAQ.map((f, i) => (
              <details key={f.q} open={i < 2}>
                <summary>
                  <span>{f.q}</span>
                  <span className="faq-toggle" aria-hidden="true" />
                </summary>
                <p className="muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky-cta">
        <ButtonLink href="/share">Share your testimony</ButtonLink>
      </div>
    </>
  );
}

function EmptyStories() {
  return (
    <div className="card" style={{ textAlign: "center", display: "grid", gap: 16, justifyItems: "center", padding: 48 }}>
      <StoneStack size={56} />
      <p className="h-s">The first stones are being raised.</p>
      <p className="muted">Stories appear here once our team has read them. Yours could be the first.</p>
      <ButtonLink href="/share">Share your testimony</ButtonLink>
    </div>
  );
}
