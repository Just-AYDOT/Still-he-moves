import type { Metadata } from "next";
import { PrayButton, PrayerForm } from "@/components/PrayerWall";
import { Eyebrow } from "@/components/ui";
import { isDemo, listPrayers } from "@/lib/db";

export const metadata: Metadata = { title: "Prayer wall", description: "Post what you are trusting God for, and pray for others. Nobody prays alone here." };
export const revalidate = 60;

export default async function PrayerWallPage() {
  const prayers = await listPrayers(80);
  const demo = isDemo();
  const open = prayers.filter((p) => p.status === "published");
  const answered = prayers.filter((p) => p.status === "answered");

  return (
    <>
      <section className="section bg-paper" style={{ paddingBottom: 48 }}>
        <div className="wrap" style={{ display: "grid", gap: 24, maxWidth: 1440 }}>
          <Eyebrow plain>The prayer wall</Eyebrow>
          <h1 className="h-display">
            Nobody prays <em>alone</em> here.
          </h1>
          <p className="lead" style={{ maxWidth: 620 }}>Post what you are trusting God for, and pray for someone else while you wait. When the answer comes, tell us and raise your stone.</p>
        </div>
      </section>
      <section className="bg-paper" style={{ paddingBottom: "var(--section-y)" }}>
        <div className="wrap pw-layout">
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <h2 className="h-s">Praying now{open.length ? ` · ${open.length}` : ""}</h2>
            {open.length === 0 && <p className="muted card">No requests yet. Be the first to post one.</p>}
            {open.map((p) => (
              <article key={p.id} className="pw-card">
                <p className="pw-text">{p.body}</p>
                <PrayButton prayer={p} demo={demo} />
              </article>
            ))}
            {answered.length > 0 && (
              <>
                <h2 className="h-s" style={{ marginTop: 32 }}>Answered</h2>
                {answered.map((p) => (
                  <article key={p.id} className="pw-card answered">
                    <p className="pw-text">{p.body}</p>
                    <PrayButton prayer={p} demo={demo} />
                  </article>
                ))}
              </>
            )}
          </div>
          <div id="post" style={{ display: "grid", gap: 16, alignContent: "start", scrollMarginTop: 120 }}>
            <h2 className="h-s">Post a prayer request</h2>
            <PrayerForm demo={demo} />
            <p className="body-s muted">Every request is read before it appears. Names are optional, and we never show contact details.</p>
          </div>
        </div>
      </section>
    </>
  );
}
