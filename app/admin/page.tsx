import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { adminPrayers, adminStories, isDemo, subscriberCount } from "@/lib/db";
import { PARTS } from "@/lib/site";
import { logoutAction, prayerStatusAction, storyEditAction, storyStatusAction } from "./actions";
import LoginForm from "./LoginForm";
import "./admin.css";

export const metadata: Metadata = { title: "Team", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab ?? "stories";

  if (!process.env.ADMIN_PASSWORD) {
    return <Shell><p className="card">Set <code>ADMIN_PASSWORD</code> in the hosting settings to turn on the team page.</p></Shell>;
  }
  if (!(await isAdmin())) {
    return <Shell><LoginForm /></Shell>;
  }
  if (isDemo()) {
    return <Shell><p className="card">Connect Firebase (see the README) to start reviewing real stories. In preview mode nothing is saved.</p></Shell>;
  }

  const [pending, published, prayers, livePrayers, subs] = await Promise.all([adminStories("pending"), adminStories("published"), adminPrayers("pending"), adminPrayers("published"), subscriberCount()]);

  return (
    <Shell>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className={`chip ${tab === "stories" ? "chip-soft" : "chip-line"}`} href="/admin?tab=stories">Stories to review · {pending.length}</Link>
          <Link className={`chip ${tab === "prayers" ? "chip-soft" : "chip-line"}`} href="/admin?tab=prayers">Prayers to review · {prayers.length}</Link>
          <Link className={`chip ${tab === "live" ? "chip-soft" : "chip-line"}`} href="/admin?tab=live">Live · {published.length + livePrayers.length}</Link>
          <span className="chip chip-line">Sunday email subscribers · {subs}</span>
        </nav>
        <form action={logoutAction}><button className="btn btn-outline btn-sm no-arrow">Sign out</button></form>
      </div>

      {tab === "stories" && (
        <div className="admin-list">
          {pending.length === 0 && <p className="card muted">Nothing waiting. 🙏</p>}
          {pending.map((s) => (
            <details key={s.id} className="admin-item" open={pending.length <= 3}>
              <summary>
                <b>{s.title}</b>
                <span className="muted body-s">{s.category} · {s.city || "no city"} · {s.author_name} · {s.language} · {new Date(s.created_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}</span>
              </summary>
              <p className="body-s"><b>Contact (private):</b> {s.contact} {s.consent ? "· consent given" : "· NO consent"}</p>
              <form action={storyEditAction} className="admin-form">
                <input type="hidden" name="id" value={s.id} />
                <label>Title<input name="title" className="input" defaultValue={s.title} /></label>
                {PARTS.map((p) => (
                  <label key={p.key}>{p.title}<textarea name={p.key} className="textarea" defaultValue={s[p.key]} rows={5} /></label>
                ))}
                <label>Pull quote (optional, shown large and on share images)<input name="pull_quote" className="input" defaultValue={s.pull_quote ?? ""} /></label>
                <label>Team note (private: who called, what was checked)<textarea name="admin_note" className="textarea" defaultValue={s.admin_note ?? ""} rows={2} /></label>
                <button className="btn btn-outline btn-sm no-arrow">Save edits</button>
              </form>
              <div className="btn-row">
                <form action={storyStatusAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="published" /><button className="btn btn-primary btn-sm no-arrow">Publish (storyteller approved)</button></form>
                <form action={storyStatusAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="rejected" /><button className="btn btn-outline btn-sm no-arrow">Don’t publish</button></form>
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "prayers" && (
        <div className="admin-list">
          {prayers.length === 0 && <p className="card muted">Nothing waiting. 🙏</p>}
          {prayers.map((p) => (
            <div key={p.id} className="admin-item">
              <p className="pw-text">{p.body}</p>
              <p className="body-s muted">{p.name}{p.city ? ` · ${p.city}` : ""}{p.contact ? ` · contact: ${p.contact}` : ""}</p>
              <div className="btn-row">
                <PrayerBtn id={p.id} status="published" label="Show on the wall" primary />
                <PrayerBtn id={p.id} status="hidden" label="Hide" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "live" && (
        <div className="admin-list">
          <h2 className="h-s">Live stories</h2>
          {published.map((s) => (
            <div key={s.id} className="admin-item row">
              <Link href={`/stories/${s.slug}`} className="link-plain">{s.title}</Link>
              <span className="muted body-s">{s.amen_count} Amen · {s.contact}</span>
              <form action={storyStatusAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="withdrawn" /><button className="btn btn-outline btn-sm no-arrow">Withdraw</button></form>
            </div>
          ))}
          <h2 className="h-s" style={{ marginTop: 24 }}>Prayers on the wall</h2>
          {livePrayers.map((p) => (
            <div key={p.id} className="admin-item row">
              <span>{p.body}</span>
              <span className="muted body-s">{p.pray_count} praying{p.contact ? ` · ${p.contact}` : ""}</span>
              <div className="btn-row">
                <PrayerBtn id={p.id} status="answered" label="Mark answered" />
                <PrayerBtn id={p.id} status="hidden" label="Hide" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function PrayerBtn({ id, status, label, primary = false }: { id: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={prayerStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn-sm no-arrow ${primary ? "btn-primary" : "btn-outline"}`}>{label}</button>
    </form>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="section bg-paper">
      <div className="wrap" style={{ display: "grid", gap: 24 }}>
        <h1 className="h-section">Team <em>review.</em></h1>
        {children}
      </div>
    </section>
  );
}
