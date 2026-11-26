import "server-only";

// Best-effort limits per server instance. Enough to slow down casual spam on a free plan.
const hits = new Map<string, number[]>();

export function tooMany(req: Request, bucket: string, max: number, windowMs: number) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

export function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
