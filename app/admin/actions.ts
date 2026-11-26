"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, logIn, logOut } from "@/lib/admin";
import { setPrayerStatus, setStoryStatus, updateStoryText } from "@/lib/db";
import type { PrayerStatus, StoryStatus } from "@/lib/types";

async function guard() {
  if (!(await isAdmin())) redirect("/admin");
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function loginAction(_: unknown, form: FormData) {
  await new Promise((r) => setTimeout(r, 400)); // slow down guessing
  if (await logIn(String(form.get("password") ?? ""))) redirect("/admin");
  return { error: "That password is not right." };
}

export async function logoutAction() {
  await logOut();
  redirect("/admin");
}

const STORY: StoryStatus[] = ["pending", "published", "rejected", "withdrawn"];
const PRAYER: PrayerStatus[] = ["pending", "published", "answered", "hidden"];

export async function storyStatusAction(form: FormData) {
  await guard();
  const status = String(form.get("status")) as StoryStatus;
  if (!STORY.includes(status)) return;
  await setStoryStatus(String(form.get("id")), status);
  refresh();
}

export async function storyEditAction(form: FormData) {
  await guard();
  const get = (k: string) => String(form.get(k) ?? "").trim();
  await updateStoryText(get("id"), { title: get("title"), struggle: get("struggle"), prayer: get("prayer"), turning: get("turning"), now: get("now"), pull_quote: get("pull_quote") || null, admin_note: get("admin_note") || null });
  refresh();
}

export async function prayerStatusAction(form: FormData) {
  await guard();
  const status = String(form.get("status")) as PrayerStatus;
  if (!PRAYER.includes(status)) return;
  await setPrayerStatus(String(form.get("id")), status);
  refresh();
}
