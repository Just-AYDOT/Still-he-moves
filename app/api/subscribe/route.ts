import { subscribe } from "@/lib/db";
import { clean, json, tooMany } from "@/lib/guard";

export async function POST(req: Request) {
  if (tooMany(req, "sub", 10, 60 * 60 * 1000)) return json({ error: "Please try again later." }, 429);
  const b = await req.json().catch(() => ({}));
  if (clean(b.website, 100)) return json({ ok: true });
  const email = clean(b.email, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "That email doesn't look right." }, 400);
  try {
    return json(await subscribe(email));
  } catch (e) {
    console.error("subscribe", e);
    return json({ error: "We couldn't add you just now. Please try again." }, 500);
  }
}
