import { getStory } from "@/lib/db";
import { storyImage } from "@/lib/shareImage";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A testimony on paper";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const story = await getStory((await params).slug);
  if (!story) return new Response("Not found", { status: 404 });
  return storyImage(story, "og");
}
