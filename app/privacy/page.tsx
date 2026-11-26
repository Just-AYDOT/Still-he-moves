import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "What we collect, why, and how to have it removed." };

export default function Privacy() {
  return (
    <section className="section bg-paper">
      <div className="wrap" style={{ maxWidth: 820, display: "grid", gap: 24 }}>
        <Eyebrow plain>Privacy</Eyebrow>
        <h1 className="h-section">Your story, <em>your say.</em></h1>
        <div className="story-body" style={{ display: "grid", gap: 18, fontSize: 19 }}>
          <p><b>What we collect.</b> When you share a testimony we keep your story, the name you choose to show (or “Anonymous”), your city, and a phone number or email. When you post a prayer request we keep the request and, if you give them, a name, city and contact. When you subscribe we keep your email address.</p>
          <p><b>Why.</b> We use your contact details only to check your story with you before it goes live, to follow up on prayer requests, and to send the Sunday email if you asked for it. We never show them on the site, never sell them, and never share them.</p>
          <p><b>What is public.</b> Only what you approve: your story, the name you chose, and your city.</p>
          <p><b>On your device.</b> Drafts of your story are saved in your browser so you don’t lose them. We also remember which stories you said Amen to. We don’t use advertising trackers.</p>
          <p><b>Removing your data.</b> Ask at any time and we will withdraw your story or prayer request and delete your contact details within two days. Every Sunday email has a one-tap unsubscribe link.</p>
          <p>Questions? <Link href="/about#contact" className="link">Contact {site.name}</Link>.</p>
        </div>
      </div>
    </section>
  );
}
