import { createPrayer } from "@/lib/db";
import { clean, json, tooMany } from "@/lib/guard";

export async function POST(req: Request) {
  if (tooMany(req, "prayer", 5, 60 * 60 * 1000)) return json({ error: "Please try again in a little while." }, 429);
  const b = await req.json().catch(() => null);
  if (!b) return json({ error: "Bad request" }, 400);
  if (clean(b.website, 100)) return json({ ok: true, demo: false });
  const body = clean(b.body, 600);
  if (body.length < 5) return json({ error: "Tell us a little of what to pray for." }, 400);
  try {
    return json(await createPrayer({ body, name: clean(b.name, 40) || "Someone", city: clean(b.city, 60) || null, contact: clean(b.contact, 80) || null }));
  } catch (e) {
    console.error("createPrayer", e);
    return json({ error: "We couldn't post that just now. Please try again." }, 500);
  }
}
