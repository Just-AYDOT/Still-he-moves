import type { Category, Paper } from "./site";

export type StoryStatus = "pending" | "published" | "rejected" | "withdrawn";

export type Story = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  city: string;
  paper: Paper;
  author_name: string; // what is shown publicly, e.g. "Anonymous" or "Kelechi N."
  language: string;
  struggle: string;
  prayer: string;
  turning: string;
  now: string;
  pull_quote: string | null;
  amen_count: number;
  status: StoryStatus;
  created_at: string;
  published_at: string | null;
};

// Private fields only the admin sees
export type StoryPrivate = Story & {
  contact: string | null;
  consent: boolean;
  admin_note: string | null;
};

export type PrayerStatus = "pending" | "published" | "answered" | "hidden";

export type Prayer = {
  id: string;
  body: string;
  name: string; // shown publicly; may be "Someone"
  city: string | null;
  pray_count: number;
  status: PrayerStatus;
  created_at: string;
};

export type Stats = { stories: number; prayers: number; answered: number; cities: number };
