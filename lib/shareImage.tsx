import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "./site";
import type { Story } from "./types";

const fontDir = path.join(process.cwd(), "assets/fonts");
let fontsPromise: Promise<{ name: string; data: Buffer; style: "normal" | "italic"; weight: 400 | 500 }[]> | null = null;
function fonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(fontDir, "InstrumentSerif-Regular.ttf")).then((data) => ({ name: "Serif", data, style: "normal" as const, weight: 400 as const })),
    readFile(path.join(fontDir, "InstrumentSerif-Italic.ttf")).then((data) => ({ name: "Serif", data, style: "italic" as const, weight: 400 as const })),
    readFile(path.join(fontDir, "InstrumentSans-Medium.ttf")).then((data) => ({ name: "Sans", data, style: "normal" as const, weight: 500 as const })),
    readFile(path.join(fontDir, "Newsreader-Regular.ttf")).then((data) => ({ name: "Body", data, style: "normal" as const, weight: 400 as const })),
    readFile(path.join(fontDir, "Kalam-Regular.ttf")).then((data) => ({ name: "Hand", data, style: "normal" as const, weight: 400 as const })),
  ]);
  return fontsPromise;
}

const PAPER = {
  Ledger: { bg: "#fbf8ef", ink: "#16182a", cat: "#1f5c45", foot: "#56606e", accent: "#e59a8f" },
  Adire: { bg: "#0e1b3d", ink: "#ffffff", cat: "#dce7f5", foot: "#b7bfd9", accent: "#dce7f5" },
  Dawn: { bg: "#d6e2f1", ink: "#16182a", cat: "#2f5d9e", foot: "#16182a", accent: "#ffffff" },
  Plain: { bg: "#ffffff", ink: "#16182a", cat: "#1f5c45", foot: "#56606e", accent: "#2f5d9e" },
} as const;

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, s.lastIndexOf(" ", n)) + "…" : s;
}

// Renders a story on its paper. "og" = 1200×630 link preview (WhatsApp, Facebook, X);
// "status" = 1080×1920 image for WhatsApp Status and Instagram Stories.
export async function storyImage(story: Story, format: "og" | "status") {
  const p = PAPER[story.paper] ?? PAPER.Ledger;
  const tall = format === "status";
  const size = tall ? { width: 1080, height: 1920 } : { width: 1200, height: 630 };
  const quote = story.pull_quote || story.title;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f6f7f9", padding: tall ? 72 : 40, fontFamily: "Sans" }}>
        <div
          style={{
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
            background: story.paper === "Dawn" ? "linear-gradient(180deg,#eef3fa,#c3d4ea)" : p.bg,
            ...(story.paper === "Adire" ? {} : { border: "2px solid #d3d9e2" }),
            ...(story.paper === "Plain" ? { borderTop: `14px solid ${p.accent}` } : {}),
            ...(story.paper === "Ledger" ? { borderLeft: `6px solid ${p.accent}` } : {}),
            borderRadius: 32, padding: tall ? "96px 80px" : "48px 56px", color: p.ink,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: tall ? 56 : 18, marginTop: tall ? 120 : 0 }}>
            <div style={{ fontFamily: "Hand", fontSize: tall ? 40 : 26, color: p.cat }}>
              {`${story.category}${story.city ? ` · ${story.city}` : ""}`}
            </div>
            <div style={{ fontFamily: "Serif", fontSize: tall ? (quote.length > 70 ? 100 : 124) : quote.length > 70 ? 54 : 66, lineHeight: 1.05, letterSpacing: -1.5 }}>
              {`“${clip(quote, tall ? 140 : 110)}”`}
            </div>
            {tall && <div style={{ fontFamily: "Body", fontSize: 46, lineHeight: 1.5, opacity: 0.88 }}>{clip(story.turning, 300)}</div>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: tall ? 30 : 22, color: p.foot }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div>{story.author_name}</div>
              <div style={{ fontFamily: "Hand", color: p.cat }}>Thus far the Lord has helped us.</div>
            </div>
            <div style={{ display: "flex", fontFamily: "Serif", fontSize: tall ? 44 : 32, color: p.ink }}>
              {site.logo.before}
              <span style={{ fontStyle: "italic", color: story.paper === "Adire" ? "#dce7f5" : "#2f5d9e", margin: "0 8px" }}>{site.logo.em}</span>
              {site.logo.after.trim()}
            </div>
          </div>
        </div>
        {tall && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40, fontSize: 30, color: "#56606e" }}>
            {`Read the whole story at ${site.url.replace(/^https?:\/\//, "")}`}
          </div>
        )}
      </div>
    ),
    { ...size, fonts: await fonts() }
  );
}
