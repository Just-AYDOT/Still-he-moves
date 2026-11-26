"use client";
import { useState } from "react";

export default function SubscribeForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), website: form.get("website") }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      setMsg(data.demo ? "Thank you. (Preview mode: nothing was saved yet.)" : "You're in. Look out for a story on Sunday morning.");
    } else {
      setState("error");
      setMsg(data.error || "That didn't go through. Please try again.");
    }
  }

  return (
    <form className="subscribe" onSubmit={onSubmit} noValidate>
      <label htmlFor="sub-email" className="sr-only">Your email address</label>
      <div className="subscribe-row">
        <input id="sub-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Your email address" required disabled={state === "done"} />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" disabled={state === "sending" || state === "done"}>{state === "sending" ? "Sending…" : "Subscribe →"}</button>
      </div>
      <p className="note" role="status" aria-live="polite">
        {state === "done" ? <span className="ok">{msg}</span> : state === "error" ? <span className="err">{msg}</span> : "One story a week. Unsubscribe in one tap."}
      </p>
    </form>
  );
}
