import Link from "next/link";
import type { Story } from "@/lib/types";

export function excerptOf(s: Story, max = 150) {
  const t = (s.turning || s.struggle || "").trim();
  return t.length > max ? t.slice(0, t.lastIndexOf(" ", max)) + "…" : t;
}

export default function PaperCard({ story, sample = false, href, excerpt, footRight }: { story: Pick<Story, "title" | "category" | "city" | "paper" | "author_name" | "amen_count"> & Partial<Story>; sample?: boolean; href?: string; excerpt?: string; footRight?: string }) {
  const body = (
    <>
      {sample && <span className="sample">Sample</span>}
      <p className="p-cat">
        {story.category}
        {story.city ? `  ·  ${story.city}` : ""}
      </p>
      <h3 className="p-title">{story.title}</h3>
      {excerpt && <p className="p-excerpt">{excerpt}</p>}
      <div className="p-foot">
        <span>{story.author_name}</span>
        <b>{footRight ?? `${story.amen_count} said Amen`}</b>
      </div>
    </>
  );
  const cls = `paper paper-${story.paper.toLowerCase()}`;
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
