import type { MetadataRoute } from "next";
import { listStories } from "@/lib/db";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await listStories({ limit: 1000 });
  const pages = ["", "/stories", "/prayer-wall", "/share", "/how-we-check", "/about", "/privacy"].map((p) => ({ url: `${site.url}${p}`, changeFrequency: "daily" as const }));
  return [...pages, ...stories.map((s) => ({ url: `${site.url}/stories/${s.slug}`, lastModified: s.published_at ?? s.created_at }))];
}
