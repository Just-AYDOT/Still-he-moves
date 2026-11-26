import type { Metadata } from "next";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: `Why ${site.name} exists, and who is behind it.` };

const TEAM = [
  { name: "Abu Emmanuel", role: "Co-Founder" },
  { name: "Ayomide Adebayo", role: "Co-Founder" },
];

export default async function About({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { report } = await searchParams;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const wa = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/[^0-9]/g, "");
  const subject = report ? `Report: ${report}` : "Hello";

  return (
    <>
      <section className="section bg-paper">
        <div className="wrap" style={{ display: "grid", gap: 24 }}>
          <Eyebrow plain>About us</Eyebrow>
          <h1 className="h-display">
            So the next home <em>remembers.</em>
          </h1>
          <p className="lead" style={{ maxWidth: 680 }}>
            Every church has a testimony time, and every family has a story they still tell. Most of those stories are never written down. {site.name} is a place to keep them, first-hand and checked with care, so that what God did in one home can reach the next one.
          </p>
        </div>
      </section>
      <section className="section bg-white">
        <div className="wrap grid grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <Eyebrow>Why the stones</Eyebrow>
            <h2 className="h-section">“Thus far the Lord <em>has helped us.</em>”</h2>
          </div>
          <p className="story-body">
            After a victory, Samuel set up a stone between Mizpah and Shen and named it Ebenezer, the stone of help (1 Samuel 7:12). It was there so the next generation would ask what it meant. Each story here is a stone like that: a marker that says God moved here, for these people, at this time.
          </p>
        </div>
      </section>
      <section className="section bg-paper">
        <div className="wrap">
          <div className="section-head">
            <Eyebrow plain>Who we are</Eyebrow>
            <h2 className="h-section">A small team <em>in Lagos.</em></h2>
          </div>
          <div className="grid grid-2" style={{ maxWidth: 860 }}>
            {TEAM.map((t) => (
              <div key={t.name} className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 20 }} aria-hidden="true">
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="h-s">{t.name}</p>
                  <p className="muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="section bg-white" style={{ scrollMarginTop: 100 }}>
        <div className="wrap grid grid-2" style={{ alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="h-section">{report ? <>Report a <em>story.</em></> : <>Write <em>to us.</em></>}</h2>
            <p className="muted">{report ? "Tell us what is wrong with this story and we will look at it within two days." : "Questions, corrections, a story to withdraw, or a church that wants to partner with us."}</p>
          </div>
          <div className="card" style={{ display: "grid", gap: 14 }}>
            {email || wa ? (
              <div className="btn-row">
                {email && <a className="btn btn-primary no-arrow" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>Email {email}</a>}
                {wa && <a className="btn btn-outline no-arrow" href={`https://wa.me/${wa}?text=${encodeURIComponent(subject)}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>}
              </div>
            ) : (
              <p className="muted">Our contact details are coming soon.</p>
            )}
            <ButtonLink href="/how-we-check" kind="outline">How we check stories</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
