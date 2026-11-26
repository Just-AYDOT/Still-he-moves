"use client";
import { useEffect, useState } from "react";
import type { Prayer } from "@/lib/types";
import { ArrowIcon } from "./ui";

export function PrayButton({ prayer, demo }: { prayer: Prayer; demo: boolean }) {
  const [count, setCount] = useState(prayer.pray_count);
  const [done, setDone] = useState(false);
  useEffect(() => {
    try { setDone(!!localStorage.getItem(`prayed:${prayer.id}`)); } catch {}
  }, [prayer.id]);

  async function pray() {
    if (done) return;
    setDone(true);
    setCount((c) => c + 1);
    try { localStorage.setItem(`prayed:${prayer.id}`, "1"); } catch {}
    if (!demo) await fetch("/api/pray", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: prayer.id }) }).catch(() => {});
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <p className="body-s" style={{ color: "var(--accent-text)", fontWeight: 500 }}>
        {prayer.name}{prayer.city ? ` · ${prayer.city}` : ""} · {count} praying
      </p>
      {prayer.status === "answered" ? (
        <span className="chip chip-soft">✓ Answered</span>
      ) : (
        <button className={`btn btn-sm no-arrow ${done ? "" : "btn-outline"}`} onClick={pray} aria-pressed={done} style={done ? { background: "var(--accent-soft)" } : undefined}>
          {done ? "🙏 You prayed" : "I prayed"}
        </button>
      )}
    </div>
  );
}

export function PrayerForm({ demo }: { demo: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setErr("");
    const res = await fetch("/api/prayers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) setState("done");
    else {
      setState("idle");
      setErr(data?.error || "That didn't go through. Please try again.");
    }
  }

  if (state === "done")
    return (
      <div className="card" role="status" style={{ display: "grid", gap: 10 }}>
        <p className="h-s">Thank you. We are praying with you.</p>
        <p className="muted">Our team reads every request before it appears on the wall, usually within a day.{demo && " (Preview mode: nothing was saved.)"}</p>
      </div>
    );

  return (
    <form className="card" onSubmit={onSubmit} style={{ display: "grid", gap: 18 }}>
      <div className="field">
        <label htmlFor="pr-body">What are you trusting God for?</label>
        <textarea id="pr-body" name="body" className="textarea" style={{ minHeight: 140, fontSize: 18 }} maxLength={600} required placeholder="e.g. For my father’s kidney results on Tuesday." />
        <p className="hint">Please don’t include phone numbers, addresses or other people’s full names.</p>
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="pr-name">Name to show <span className="muted">(optional)</span></label>
          <input id="pr-name" name="name" className="input" maxLength={40} placeholder="e.g. Mama Tobi" />
        </div>
        <div className="field">
          <label htmlFor="pr-city">City <span className="muted">(optional)</span></label>
          <input id="pr-city" name="city" className="input" maxLength={60} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pr-contact">Phone or email <span className="muted">(optional, never shown)</span></label>
        <input id="pr-contact" name="contact" className="input" maxLength={80} placeholder="So we can follow up when the answer comes" />
      </div>
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {err && <p className="field-error" role="alert">{err}</p>}
      <div>
        <button className="btn btn-primary" disabled={state === "sending"}>
          <span>{state === "sending" ? "Posting…" : "Post my request"}</span>
          <span className="arrow"><ArrowIcon /></span>
        </button>
      </div>
    </form>
  );
}
