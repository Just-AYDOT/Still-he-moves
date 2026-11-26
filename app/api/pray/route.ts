import { prayFor } from "@/lib/db";
import { json, tooMany } from "@/lib/guard";

export async function POST(req: Request) {
  if (tooMany(req, "pray", 120, 60 * 60 * 1000)) return json({ ok: false }, 429);
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id || !/^[A-Za-z0-9]{10,40}$/.test(id)) return json({ ok: false }, 400);
  try {
    return json({ ok: true, count: await prayFor(id) });
  } catch {
    return json({ ok: false }, 500);
  }
}
