"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="card" style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <div className="field">
        <label htmlFor="pw">Team password</label>
        <input id="pw" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {state?.error && <p className="field-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary no-arrow" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button>
    </form>
  );
}
