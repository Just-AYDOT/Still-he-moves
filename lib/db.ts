import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { AggregateField, FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import { demoPrayers, demoStories } from "./demo";
import type { Category, Paper } from "./site";
import type { Prayer, PrayerStatus, Stats, Story, StoryPrivate, StoryStatus } from "./types";

// Firestore collections: stories, prayers, subscribers.
// Everything is read and written here, on the server, with a service account.
// The Firestore security rules (firestore.rules) deny all access from browsers.

export function isDemo() {
  if (process.env.FIRESTORE_EMULATOR_HOST) return false;
  return !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY;
}

let fs: Firestore | null = null;
function db() {
  if (fs) return fs;
  const app =
    getApps()[0] ??
    initializeApp(
      process.env.FIRESTORE_EMULATOR_HOST
        ? { projectId: process.env.FIREBASE_PROJECT_ID || "demo-testimony" }
        : {
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              // Hosting dashboards often store the key with literal "\n"; turn them back into line breaks
              privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
          }
    );
  fs = getFirestore(app);
  return fs;
}

type Doc = FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot;
const iso = (v: unknown): string | null => (v && typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate().toISOString() : typeof v === "string" ? v : null);

function toStory(d: Doc): StoryPrivate {
  const x = d.data() ?? {};
  return {
    id: d.id,
    slug: x.slug,
    title: x.title,
    category: x.category,
    city: x.city ?? "",
    paper: x.paper ?? "Ledger",
    author_name: x.author_name ?? "Anonymous",
    language: x.language ?? "English",
    struggle: x.struggle ?? "",
    prayer: x.prayer ?? "",
    turning: x.turning ?? "",
    now: x.now ?? "",
    pull_quote: x.pull_quote ?? null,
    amen_count: x.amen_count ?? 0,
    status: x.status,
    created_at: iso(x.created_at) ?? new Date(0).toISOString(),
    published_at: iso(x.published_at),
    contact: x.contact ?? null,
    consent: !!x.consent,
    admin_note: x.admin_note ?? null,
  };
}

function toPublic(s: StoryPrivate): Story {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contact, consent, admin_note, ...pub } = s;
  return pub;
}

function toPrayer(d: Doc): Prayer & { contact: string | null } {
  const x = d.data() ?? {};
  return { id: d.id, body: x.body, name: x.name ?? "Someone", city: x.city ?? null, pray_count: x.pray_count ?? 0, status: x.status, created_at: iso(x.created_at) ?? new Date(0).toISOString(), contact: x.contact ?? null };
}

const newest = <T extends { published_at?: string | null; created_at: string }>(a: T, b: T) => (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at);

// Queries use a single equality filter and sort in memory, so no composite indexes need setting up.
async function publishedStories(): Promise<Story[]> {
  const snap = await db().collection("stories").where("status", "==", "published").get();
  return snap.docs.map((d) => toPublic(toStory(d))).sort(newest);
}

/* ---------- Stories ---------- */

export async function listStories(opts: { category?: string; q?: string; limit?: number } = {}): Promise<Story[]> {
  const limit = opts.limit ?? 60;
  let rows = isDemo() ? demoStories.filter((s) => s.status === "published") : await publishedStories();
  if (opts.category) rows = rows.filter((s) => s.category === opts.category);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    rows = rows.filter((s) => [s.title, s.city, s.struggle, s.prayer, s.turning, s.now].join(" ").toLowerCase().includes(q));
  }
  return rows.slice(0, limit);
}

export async function getStory(slug: string): Promise<Story | null> {
  if (isDemo()) return demoStories.find((s) => s.slug === slug && s.status === "published") ?? null;
  const snap = await db().collection("stories").where("slug", "==", slug).limit(1).get();
  const s = snap.docs[0] ? toStory(snap.docs[0]) : null;
  return s && s.status === "published" ? toPublic(s) : null;
}

export async function relatedStories(story: Story, limit = 3): Promise<Story[]> {
  const all = (await listStories({ limit: 200 })).filter((s) => s.id !== story.id);
  const same = all.filter((s) => s.category === story.category);
  return [...same, ...all.filter((s) => s.category !== story.category)].slice(0, limit);
}

export async function categoryCounts(): Promise<Record<string, number>> {
  const rows = await listStories({ limit: 100000 });
  return rows.reduce<Record<string, number>>((acc, s) => ((acc[s.category] = (acc[s.category] ?? 0) + 1), acc), {});
}

export async function getStats(): Promise<Stats> {
  if (isDemo()) {
    return {
      stories: demoStories.length,
      prayers: demoPrayers.reduce((n, p) => n + p.pray_count, 0),
      answered: demoPrayers.filter((p) => p.status === "answered").length,
      cities: new Set(demoStories.map((s) => s.city)).size,
    };
  }
  const prayers = db().collection("prayers");
  const [stories, open, answered] = await Promise.all([
    publishedStories(),
    prayers.where("status", "==", "published").aggregate({ total: AggregateField.sum("pray_count") }).get(),
    prayers.where("status", "==", "answered").aggregate({ total: AggregateField.sum("pray_count"), n: AggregateField.count() }).get(),
  ]);
  return {
    stories: stories.length,
    prayers: Number(open.data().total ?? 0) + Number(answered.data().total ?? 0),
    answered: answered.data().n,
    cities: new Set(stories.map((s) => s.city.trim().toLowerCase()).filter(Boolean)).size,
  };
}

export type NewStory = {
  title: string;
  category: Category;
  city: string;
  paper: Paper;
  author_name: string;
  language: string;
  struggle: string;
  prayer: string;
  turning: string;
  now: string;
  contact: string | null;
  consent: boolean;
};

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "testimony"
  );
}

export async function createStory(input: NewStory): Promise<{ ok: true; demo: boolean }> {
  if (isDemo()) return { ok: true, demo: true };
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
  await db().collection("stories").add({ ...input, slug, status: "pending", amen_count: 0, pull_quote: null, admin_note: null, created_at: FieldValue.serverTimestamp(), published_at: null });
  return { ok: true, demo: false };
}

async function bump(collection: string, id: string, field: string, allowed: string[]): Promise<number | null> {
  const ref = db().collection(collection).doc(id);
  return db().runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists || !allowed.includes(snap.get("status"))) return null;
    const next = (snap.get(field) ?? 0) + 1;
    t.update(ref, { [field]: FieldValue.increment(1) });
    return next;
  });
}

export async function addAmen(id: string): Promise<number | null> {
  if (isDemo()) return null;
  return bump("stories", id, "amen_count", ["published"]);
}

/* ---------- Prayer wall ---------- */

export async function listPrayers(limit = 60): Promise<Prayer[]> {
  if (isDemo()) return demoPrayers;
  const snap = await db().collection("prayers").where("status", "in", ["published", "answered"]).get();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return snap.docs.map(toPrayer).map(({ contact, ...p }) => p).sort(newest).slice(0, limit);
}

export async function createPrayer(input: { body: string; name: string; city: string | null; contact: string | null }) {
  if (isDemo()) return { ok: true, demo: true };
  await db().collection("prayers").add({ ...input, status: "pending", pray_count: 0, created_at: FieldValue.serverTimestamp() });
  return { ok: true, demo: false };
}

export async function prayFor(id: string): Promise<number | null> {
  if (isDemo()) return null;
  return bump("prayers", id, "pray_count", ["published", "answered"]);
}

/* ---------- Email ---------- */

export async function subscribe(email: string) {
  if (isDemo()) return { ok: true, demo: true };
  const e = email.toLowerCase();
  // Document id is the email (URL-encoded), so signing up twice doesn't create duplicates
  await db().collection("subscribers").doc(encodeURIComponent(e)).set({ email: e, created_at: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, demo: false };
}

/* ---------- Admin ---------- */

export async function adminStories(status: StoryStatus): Promise<StoryPrivate[]> {
  if (isDemo()) return [];
  const snap = await db().collection("stories").where("status", "==", status).get();
  return snap.docs.map(toStory).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200);
}

export async function adminPrayers(status: PrayerStatus): Promise<(Prayer & { contact: string | null })[]> {
  if (isDemo()) return [];
  const snap = await db().collection("prayers").where("status", "==", status).get();
  return snap.docs.map(toPrayer).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200);
}

export async function setStoryStatus(id: string, status: StoryStatus) {
  const patch: Record<string, unknown> = { status };
  if (status === "published") patch.published_at = FieldValue.serverTimestamp();
  await db().collection("stories").doc(id).update(patch);
}

export async function updateStoryText(id: string, fields: Partial<Pick<StoryPrivate, "title" | "struggle" | "prayer" | "turning" | "now" | "pull_quote" | "admin_note">>) {
  await db().collection("stories").doc(id).update(fields);
}

export async function setPrayerStatus(id: string, status: PrayerStatus) {
  await db().collection("prayers").doc(id).update({ status });
}

export async function subscriberCount(): Promise<number> {
  if (isDemo()) return 0;
  const snap = await db().collection("subscribers").count().get();
  return snap.data().count;
}
