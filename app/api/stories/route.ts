import { createStory } from "@/lib/db";
import { clean, json, tooMany } from "@/lib/guard";
import { CATEGORIES, PAPERS, type Category, type Paper } from "@/lib/site";

export async function POST(req: Request) {
  if (tooMany(req, "story", 5, 60 * 60 * 1000)) return json({ error: "You've sent a few stories already. Please try again in an hour." }, 429);
  const b = await req.json().catch(() => null);
  if (!b) return json({ error: "Bad request" }, 400);
  if (clean(b.website, 100)) return json({ ok: true, demo: false }); // honeypot: pretend success

  const category = CATEGORIES.includes(b.category) ? (b.category as Category) : null;
  const paper = PAPERS.includes(b.paper) ? (b.paper as Paper) : "Ledger";
  const parts = { struggle: clean(b.struggle, 4000), prayer: clean(b.prayer, 4000), turning: clean(b.turning, 4000), now: clean(b.now, 4000) };
  const title = clean(b.title, 140);
  const contact = clean(b.contact, 80);
  const anonymous = b.anonymous !== false;
  const name = anonymous ? "Anonymous" : clean(b.name, 40) || "Anonymous";

  if (!category) return json({ error: "Choose a category." }, 400);
  if (title.length < 3) return json({ error: "Add a title." }, 400);
  if (Object.values(parts).some((p) => p.split(/\s+/).length < 5)) return json({ error: "Please write all four parts." }, 400);
  if (!contact) return json({ error: "Add a phone number or email so we can check details with you." }, 400);
  if (b.consent !== true) return json({ error: "Please confirm the consent box." }, 400);

  try {
    const r = await createStory({ title, category, city: clean(b.city, 60), paper, author_name: name, language: clean(b.language, 20) || "English", ...parts, contact, consent: true });
    return json(r);
  } catch (e) {
    console.error("createStory", e);
    return json({ error: "We couldn't save your story just now. Your draft is safe on this device; please try again." }, 500);
  }
}
