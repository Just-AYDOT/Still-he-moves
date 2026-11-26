import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoPrayers, demoStories } from "./demo";
import type { Category, Paper } from "./site";
import type { Prayer, PrayerStatus, Stats, Story, StoryPrivate, StoryStatus } from "./types";

let client: SupabaseClient | null = null;

export function isDemo() {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Server-only client. The service key never reaches the browser; all reads and writes go through
// server code, and the database itself refuses anonymous access (see supabase/schema.sql).
function db() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

const PUBLIC_STORY =
  "id,slug,title,category,city,paper,author_name,language,struggle,prayer,turning,now,pull_quote,amen_count,status,created_at,published_at";

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- Stories ---------- */

export async function listStories(opts: { category?: string; q?: string; limit?: number } = {}): Promise<Story[]> {
  const limit = opts.limit ?? 60;
  if (isDemo()) {
    let rows = demoStories.filter((s) => s.status === "published");
    if (opts.category) rows = rows.filter((s) => s.category === opts.category);
    if (opts.q) {
      const q = opts.q.toLowerCase();
      rows = rows.filter((s) => [s.title, s.city, s.struggle, s.turning, s.now].join(" ").toLowerCase().includes(q));
    }
    return rows.slice(0, limit);
  }
  let query = db().from("stories").select(PUBLIC_STORY).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.q) {
    const q = opts.q.replace(/[%,()]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,turning.ilike.%${q}%`);
  }
  const { data, error } = await query;
  fail(error);
  return (data ?? []) as Story[];
}

export async function getStory(slug: string): Promise<Story | null> {
  if (isDemo()) return demoStories.find((s) => s.slug === slug && s.status === "published") ?? null;
  const { data, error } = await db().from("stories").select(PUBLIC_STORY).eq("slug", slug).eq("status", "published").maybeSingle();
  fail(error);
  return (data as Story) ?? null;
}

export async function relatedStories(story: Story, limit = 3): Promise<Story[]> {
  const same = (await listStories({ category: story.category, limit: limit + 1 })).filter((s) => s.id !== story.id);
  if (same.length >= limit) return same.slice(0, limit);
  const more = (await listStories({ limit: limit + 4 })).filter((s) => s.id !== story.id && !same.some((x) => x.id === s.id));
  return [...same, ...more].slice(0, limit);
}

export async function categoryCounts(): Promise<Record<string, number>> {
  if (isDemo()) {
    return demoStories.reduce<Record<string, number>>((acc, s) => ((acc[s.category] = (acc[s.category] ?? 0) + 1), acc), {});
  }
  const { data, error } = await db().rpc("category_counts");
  fail(error);
  return Object.fromEntries(((data ?? []) as { category: string; n: number }[]).map((r) => [r.category, Number(r.n)]));
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
  const { data, error } = await db().rpc("site_stats");
  fail(error);
  const r = (Array.isArray(data) ? data[0] : data) ?? {};
  return { stories: Number(r.stories ?? 0), prayers: Number(r.prayers ?? 0), answered: Number(r.answered ?? 0), cities: Number(r.cities ?? 0) };
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
  const { error } = await db().from("stories").insert({ ...input, slug, status: "pending" });
  fail(error);
  return { ok: true, demo: false };
}

export async function addAmen(id: string): Promise<number | null> {
  if (isDemo()) return null;
  const { data, error } = await db().rpc("add_amen", { story_id: id });
  fail(error);
  return Number(data);
}

/* ---------- Prayer wall ---------- */

export async function listPrayers(limit = 60): Promise<Prayer[]> {
  if (isDemo()) return demoPrayers;
  const { data, error } = await db()
    .from("prayers")
    .select("id,body,name,city,pray_count,status,created_at")
    .in("status", ["published", "answered"])
    .order("created_at", { ascending: false })
    .limit(limit);
  fail(error);
  return (data ?? []) as Prayer[];
}

export async function createPrayer(input: { body: string; name: string; city: string | null; contact: string | null }) {
  if (isDemo()) return { ok: true, demo: true };
  const { error } = await db().from("prayers").insert({ ...input, status: "pending" });
  fail(error);
  return { ok: true, demo: false };
}

export async function prayFor(id: string): Promise<number | null> {
  if (isDemo()) return null;
  const { data, error } = await db().rpc("add_prayed", { prayer_id: id });
  fail(error);
  return Number(data);
}

/* ---------- Email ---------- */

export async function subscribe(email: string) {
  if (isDemo()) return { ok: true, demo: true };
  const { error } = await db().from("subscribers").upsert({ email: email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
  fail(error);
  return { ok: true, demo: false };
}

/* ---------- Admin ---------- */

export async function adminStories(status: StoryStatus): Promise<StoryPrivate[]> {
  if (isDemo()) return [];
  const { data, error } = await db().from("stories").select("*").eq("status", status).order("created_at", { ascending: false }).limit(100);
  fail(error);
  return (data ?? []) as StoryPrivate[];
}

export async function adminPrayers(status: PrayerStatus): Promise<(Prayer & { contact: string | null })[]> {
  if (isDemo()) return [];
  const { data, error } = await db().from("prayers").select("*").eq("status", status).order("created_at", { ascending: false }).limit(100);
  fail(error);
  return (data ?? []) as (Prayer & { contact: string | null })[];
}

export async function setStoryStatus(id: string, status: StoryStatus) {
  const patch: Record<string, unknown> = { status };
  if (status === "published") patch.published_at = new Date().toISOString();
  const { error } = await db().from("stories").update(patch).eq("id", id);
  fail(error);
}

export async function updateStoryText(id: string, fields: Partial<Pick<StoryPrivate, "title" | "struggle" | "prayer" | "turning" | "now" | "pull_quote" | "admin_note">>) {
  const { error } = await db().from("stories").update(fields).eq("id", id);
  fail(error);
}

export async function setPrayerStatus(id: string, status: PrayerStatus) {
  const { error } = await db().from("prayers").update({ status }).eq("id", id);
  fail(error);
}

export async function subscriberCount(): Promise<number> {
  if (isDemo()) return 0;
  const { count, error } = await db().from("subscribers").select("email", { count: "exact", head: true });
  fail(error);
  return count ?? 0;
}
