import { getStory } from "@/lib/db";
import { storyImage } from "@/lib/shareImage";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug);
  if (!story) return new Response("Not found", { status: 404 });
  const res = await storyImage(story, "status");
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.headers.set("Content-Disposition", `inline; filename="${story.slug}.png"`);
  return res;
}
