"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import PaperCard from "./PaperCard";
import { ArrowIcon, Eyebrow, StoneStack } from "./ui";
import { CATEGORIES, PAPERS, PAPER_NOTES, PARTS, type Category, type Paper, type PartKey } from "@/lib/site";

type Draft = {
  category: Category | "";
  city: string;
  language: string;
  struggle: string;
  prayer: string;
  turning: string;
  now: string;
  paper: Paper;
  title: string;
  anonymous: boolean;
  name: string;
  contact: string;
  consent: boolean;
};

const EMPTY: Draft = { category: "", city: "", language: "English", struggle: "", prayer: "", turning: "", now: "", paper: "Ledger", title: "", anonymous: true, name: "", contact: "", consent: false };
const KEY = "testimony-draft-v1";
const STEPS = ["Start", "The Struggle", "The Prayer", "The Turning Point", "Life Now", "Paper", "Review"];
const LANGS = ["English", "Yorùbá", "Igbo", "Hausa", "Pidgin", "Other"];

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function ShareFlow({ demo }: { demo: boolean }) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [restored, setRestored] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { demo: boolean }>(null);
  const [serverError, setServerError] = useState("");
  const headRef = useRef<HTMLHeadingElement>(null);

  // Restore a draft saved on this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setD({ ...EMPTY, ...parsed.d });
        setStep(Math.min(parsed.step ?? 0, 6));
        setRestored(true);
      }
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    if (done) return;
    try {
      if (JSON.stringify(d) !== JSON.stringify(EMPTY)) {
        localStorage.setItem(KEY, JSON.stringify({ d, step }));
        setSaved(true);
      }
    } catch {}
  }, [d, step, done]);

  useEffect(() => {
    headRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step, done]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const autoTitle = useMemo(() => {
    const src = d.turning || d.struggle;
    const first = src.split(/(?<=[.!?])\s/)[0] ?? "";
    return first.length > 90 ? first.slice(0, first.lastIndexOf(" ", 90)) : first.replace(/[.!?]$/, "");
  }, [d.turning, d.struggle]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0 && !d.category) e.category = "Choose what kind of miracle this was.";
    if (s >= 1 && s <= 4) {
      const k = PARTS[s - 1].key;
      if (words(d[k]) < 10) e[k] = "Write at least a sentence or two (10 words or more).";
    }
    if (s === 6) {
      if ((d.title || autoTitle).trim().length < 3) e.title = "Give your story a short title.";
      if (!d.anonymous && !d.name.trim()) e.name = "Add the name you want shown, or choose to stay anonymous.";
      if (!d.contact.trim()) e.contact = "We need a phone number or email to check details with you. It is never shown.";
      if (!d.consent) e.consent = "Please confirm before you send.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep((s) => Math.min(s + 1, 6));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!validate(6)) return;
    setSending(true);
    setServerError("");
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...d, title: d.title.trim() || autoTitle, website: (document.getElementById("hp-website") as HTMLInputElement)?.value }),
    }).catch(() => null);
    setSending(false);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) {
      try { localStorage.removeItem(KEY); } catch {}
      setDone({ demo: !!data.demo });
    } else {
      setServerError(data?.error || "We couldn't send your story. Your draft is saved on this device, so please try again in a moment.");
    }
  }

  function startOver() {
    try { localStorage.removeItem(KEY); } catch {}
    setD(EMPTY);
    setStep(0);
    setRestored(false);
    setSaved(false);
  }

  const preview = {
    title: d.title.trim() || autoTitle || "Your story’s title",
    category: (d.category || "Testimony") as Category,
    city: d.city,
    paper: d.paper,
    author_name: d.anonymous ? "Anonymous" : d.name || "Your name",
    amen_count: 0,
  };
  const previewExcerpt = (d.turning || d.struggle || "Your words will appear here as you write.").slice(0, 120) + ((d.turning || d.struggle).length > 120 ? "…" : "");

  if (done) {
    return (
      <div className="flow">
        <FlowHeader saved={false} />
        <section className="wrap submitted">
          <StoneStack size={88} />
          <Eyebrow plain>Thank you</Eyebrow>
          <h1 className="h-section" ref={headRef} tabIndex={-1}>
            Your stone is <em>raised.</em>
          </h1>
          <p className="lead" style={{ maxWidth: 560 }}>
            We have your story. Someone from our team will read it, and may call or WhatsApp you to check a detail. Nothing goes live until you approve the final version.
          </p>
          {done.demo && <p className="chip" style={{ background: "#fff4d6" }}>Preview mode: this story was not saved.</p>}
          <ol className="what-next">
            <li><b>Today:</b> your story is in the review queue.</li>
            <li><b>In a few days:</b> we contact you on the number or email you gave.</li>
            <li><b>Once you approve:</b> it goes live and you get a link to share.</li>
          </ol>
          <div className="btn-row">
            <Link href="/stories" className="btn btn-primary"><span>Read other stories</span><span className="arrow"><ArrowIcon /></span></Link>
            <Link href="/prayer-wall" className="btn btn-outline no-arrow">Pray for someone</Link>
          </div>
        </section>
      </div>
    );
  }

  const partIndex = step - 1;
  const part = step >= 1 && step <= 4 ? PARTS[partIndex] : null;

  return (
    <div className="flow">
      <FlowHeader saved={saved} />
      <div className="wrap">
        <ol className="stepper" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? "done" : i === step ? "current" : ""} aria-current={i === step ? "step" : undefined}>
              <span className="bar" />
              <span className="lbl">{i + 1}. {s}</span>
            </li>
          ))}
        </ol>
        <p className="step-mobile body-s muted">Step {step + 1} of 7 · {STEPS[step]}</p>
      </div>

      {restored && step > 0 && (
        <div className="wrap">
          <div className="restored" role="status">
            <span>We kept your draft on this device.</span>
            <button className="link-plain" onClick={startOver} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: 600 }}>Start over</button>
          </div>
        </div>
      )}

      <div className="wrap flow-body">
        <div className="editor">
          {step === 0 && (
            <>
              <Head eyebrow="Before you begin" refEl={headRef} title={<>Tell it <em>your way.</em></>} sub="Four short parts, about ten minutes. You can stay anonymous, and our team reads every story before it goes live." />
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="label" style={{ marginBottom: 8 }}>What kind of miracle was it?</legend>
                <div className="cat-pick">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="choice">
                      <input type="radio" name="category" checked={d.category === c} onChange={() => set("category", c)} />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="field-error">{errors.category}</p>}
              </fieldset>
              <div className="two">
                <div className="field">
                  <label htmlFor="city">Where did it happen?</label>
                  <input id="city" className="input" value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Ibadan, or Kano → Leeds" maxLength={60} autoComplete="address-level2" />
                </div>
                <div className="field">
                  <label htmlFor="lang">Language you will write in</label>
                  <select id="lang" className="select" value={d.language} onChange={(e) => set("language", e.target.value)}>
                    {LANGS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {part && (
            <>
              <Head eyebrow={`Part ${partIndex + 1} of 4`} refEl={headRef} title={<>The <em>{part.em}</em></>} sub={part.prompt} />
              <PartEditor k={part.key} value={d[part.key]} onChange={(v) => set(part.key, v)} error={errors[part.key]} lang={d.language} />
              <div className="card-deep" style={{ display: "grid", gap: 8 }}>
                <p className="h-s">Stuck? Try one of these</p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                  {part.hints.map((h) => <li key={h}>{h}</li>)}
                </ul>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Head eyebrow="Almost there" refEl={headRef} title={<>Choose your <em>paper.</em></>} sub="Your story looks the way it feels. You can change this later." />
              <div className="paper-pick" role="radiogroup" aria-label="Paper">
                {PAPERS.map((p) => (
                  <label key={p} className={`paper-opt ${d.paper === p ? "on" : ""}`}>
                    <input type="radio" name="paper" className="sr-only" checked={d.paper === p} onChange={() => set("paper", p)} />
                    <span className={`swatch paper-${p.toLowerCase()}`} aria-hidden="true" />
                    <span><b>{p}</b><br /><span className="body-s muted">{PAPER_NOTES[p]}</span></span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <Head eyebrow="Last step" refEl={headRef} title={<>Read it <em>once more.</em></>} sub="Check your story, choose how your name appears, and tell us how to reach you." />
              <div className="field">
                <label htmlFor="title">Title</label>
                <input id="title" className="input" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder={autoTitle || "e.g. It held the exact rent"} maxLength={120} />
                <p className="hint">Leave it empty and we will use: “{autoTitle || "…"}”</p>
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>
              <div className="review-parts">
                {PARTS.map((p, i) => (
                  <div key={p.key} className="review-part">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <p className="eyebrow plain">{p.title}</p>
                      <button className="link-plain" onClick={() => setStep(i + 1)} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: 600, minHeight: 44 }}>Edit</button>
                    </div>
                    <p className="story-body" style={{ fontSize: 17 }}>{d[p.key] || <span className="muted">Not written yet</span>}</p>
                  </div>
                ))}
              </div>
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="label" style={{ marginBottom: 8 }}>How should your name appear?</legend>
                <label className="choice"><input type="radio" name="anon" checked={d.anonymous} onChange={() => set("anonymous", true)} /><span><b>Keep me anonymous</b><br /><span className="body-s muted">Shown as “Anonymous”{d.city ? `, ${d.city}` : ""}.</span></span></label>
                <label className="choice"><input type="radio" name="anon" checked={!d.anonymous} onChange={() => set("anonymous", false)} /><span><b>Show a name</b><br /><span className="body-s muted">First name or initials are enough, e.g. “Kelechi N.”</span></span></label>
                {!d.anonymous && <input aria-label="Name to show" className="input" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Name to show" maxLength={40} />}
                {errors.name && <p className="field-error">{errors.name}</p>}
              </fieldset>
              <div className="field">
                <label htmlFor="contact">Phone (WhatsApp) or email</label>
                <input id="contact" className="input" value={d.contact} onChange={(e) => set("contact", e.target.value)} placeholder="e.g. 0803 000 0000" inputMode="email" autoComplete="tel" maxLength={80} />
                <p className="hint">Only our team sees this. We use it to check details before publishing, and never show it.</p>
                {errors.contact && <p className="field-error">{errors.contact}</p>}
              </div>
              <label className="choice">
                <input type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} />
                <span>This happened to me or my family, it is true to the best of my knowledge, and I agree for it to be published here after review. I can ask for it to be taken down at any time.</span>
              </label>
              {errors.consent && <p className="field-error">{errors.consent}</p>}
              <input id="hp-website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {serverError && <p className="field-error" role="alert">{serverError}</p>}
            </>
          )}

          <div className="flow-actions">
            {step > 0 ? <button className="btn btn-outline no-arrow" onClick={back}>Back</button> : <Link href="/" className="btn btn-outline no-arrow">Cancel</Link>}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {step < 6 && <span className="body-s muted next-lbl">Next: {STEPS[step + 1]}</span>}
              {step < 6 ? (
                <button className="btn btn-primary" onClick={next}><span>Continue</span><span className="arrow"><ArrowIcon /></span></button>
              ) : (
                <button className="btn btn-primary" onClick={submit} disabled={sending}><span>{sending ? "Sending…" : "Send for review"}</span><span className="arrow"><ArrowIcon /></span></button>
              )}
            </div>
          </div>
          {Object.keys(errors).length > 0 && <p className="sr-only" role="alert">{Object.values(errors)[0]}</p>}
        </div>

        <aside className="preview">
          <p className="eyebrow plain">Live preview</p>
          <PaperCard story={preview} excerpt={previewExcerpt} footRight="Preview" />
          <p className="body-s muted">You can change the paper later.</p>
        </aside>
      </div>
      {demo && <p className="wrap body-s muted" style={{ paddingBottom: 32 }}>Preview mode: stories sent from here are not saved yet.</p>}
    </div>
  );
}

function FlowHeader({ saved }: { saved: boolean }) {
  return (
    <div className="flow-head">
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <p className="body-s" style={{ color: "var(--leaf)", display: "flex", gap: 8, alignItems: "center", visibility: saved ? "visible" : "hidden" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--leaf)" }} aria-hidden="true" />
          Draft saved on this device
        </p>
        <Link href="/" className="btn btn-outline btn-sm no-arrow">Save and finish later</Link>
      </div>
    </div>
  );
}

function Head({ eyebrow, title, sub, refEl }: { eyebrow: string; title: React.ReactNode; sub: string; refEl: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <p className="eyebrow plain">{eyebrow}</p>
      <h1 className="h-section" ref={refEl} tabIndex={-1} style={{ outline: "none" }}>{title}</h1>
      <p className="muted">{sub}</p>
    </div>
  );
}

const LANG_CODES: Record<string, string> = { English: "en-NG", "Yorùbá": "yo-NG", Igbo: "ig-NG", Hausa: "ha-NG", Pidgin: "en-NG", Other: "en-NG" };

function PartEditor({ k, value, onChange, error, lang }: { k: PartKey; value: string; onChange: (v: string) => void; error?: string; lang: string }) {
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  useEffect(() => setCanSpeak(typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)), []);
  useEffect(() => () => recRef.current?.stop(), []);

  function toggleSpeech() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_CODES[lang] ?? "en-NG";
    rec.continuous = true;
    rec.interimResults = false;
    let base = value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          base = (base ? base.trimEnd() + " " : "") + e.results[i][0].transcript.trim();
          onChange(base);
        }
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  const n = words(value);
  return (
    <div className="field">
      <label htmlFor={`part-${k}`} className="sr-only">Your words</label>
      <div className={`write-box ${error ? "has-error" : ""}`}>
        <textarea id={`part-${k}`} className="textarea" value={value} onChange={(e) => onChange(e.target.value)} rows={8} maxLength={4000} aria-invalid={!!error} aria-describedby={`count-${k}`} />
        <div className="write-tools body-s">
          {canSpeak ? (
            <button type="button" onClick={toggleSpeech} className="link-plain" style={{ background: "none", border: 0, cursor: "pointer", minHeight: 44 }} aria-pressed={listening}>
              {listening ? "■  Stop listening" : "🎙  Speak instead of typing"}
            </button>
          ) : <span />}
          <span id={`count-${k}`} className="muted">{n} words  ·  aim for 60–150</span>
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
