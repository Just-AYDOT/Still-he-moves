import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";

function token() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("testimony-admin-v1").digest("hex");
}

export async function isAdmin() {
  const t = token();
  if (!t) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c || c.length !== t.length) return false;
  return timingSafeEqual(Buffer.from(c), Buffer.from(t));
}

export async function logIn(password: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || password.length !== pw.length || !timingSafeEqual(Buffer.from(password), Buffer.from(pw))) return false;
  (await cookies()).set(COOKIE, token()!, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
  return true;
}

export async function logOut() {
  (await cookies()).delete(COOKIE);
}
