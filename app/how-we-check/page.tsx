import type { Metadata } from "next";
import { ButtonLink, Eyebrow, Stones } from "@/components/ui";

export const metadata: Metadata = { title: "How we check stories", description: "Every testimony is read by a person, checked with the storyteller, and only published with their approval." };

const STEPS = [
  ["We read every word", "A member of our team reads each story the day it arrives. Nothing is published automatically."],
  ["We talk to you", "We may call or WhatsApp you to hear it in your own voice and check details such as dates, places and amounts."],
  ["We protect people", "We remove phone numbers, addresses and the full names of others. Medical stories never name doctors or hospitals without permission."],
  ["You approve the final version", "If we tidy spelling or shorten a part, you see it first. It only goes live when you say yes."],
];

const WONT = [
  "Publish a story that attacks a person, church or group",
  "Promise healing, or tell anyone to stop medical treatment",
  "Ask for money, or publish a story that asks for money",
  "Show your phone number or email, ever",
];

export default function HowWeCheck() {
  return (
    <>
      <section className="section bg-paper">
        <div className="wrap" style={{ display: "grid", gap: 24 }}>
          <Eyebrow plain>Trust</Eyebrow>
          <h1 className="h-display">
            How we check <em>every story.</em>
          </h1>
          <p className="lead" style={{ maxWidth: 640 }}>A testimony is a sacred thing. We handle each one carefully, so that readers can trust what they read and storytellers feel safe telling it.</p>
        </div>
      </section>
      <section className="section bg-white">
        <div className="wrap">
          <div className="grid grid-4">
            {STEPS.map(([t, d], i) => (
              <div key={t} style={{ display: "grid", gap: 14, alignContent: "start" }}>
                <Stones count={i + 1} />
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 30, lineHeight: 1.1 }}>{t}</h2>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-paper">
        <div className="wrap" style={{ display: "grid", gap: 40 }}>
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 18 }}>
              <Eyebrow>What we will never do</Eyebrow>
              <h2 className="h-section">Some lines we <em>don’t cross.</em></h2>
            </div>
            <ul className="card" style={{ margin: 0, paddingLeft: 48, display: "grid", gap: 12 }}>
              {WONT.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 18 }}>
              <Eyebrow>Your story stays yours</Eyebrow>
              <h2 className="h-section">Change your mind <em>any time.</em></h2>
            </div>
            <div className="card" style={{ display: "grid", gap: 14 }}>
              <p>You can ask us to edit, hide your name on, or withdraw your story at any time, for any reason. Write to us and we will do it within two days.</p>
              <div className="btn-row">
                <ButtonLink href="/about#contact" kind="outline">Contact us</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h-section">Ready to raise <em>your stone?</em></h2>
          <ButtonLink href="/share">Share your testimony</ButtonLink>
        </div>
      </section>
    </>
  );
}
