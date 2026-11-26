// One place to change the name when the final one is chosen.
// The name is split so the middle word can be set in italics, as in the Figma logo.
export const site = {
  name: "Still He Moves",
  logo: { before: "Still ", em: "He", after: " Moves" },
  tagline: "First-hand stories of healing, provision, rescue and salvation from Nigeria and beyond.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  verse: "“Thus far the Lord has helped us.”  1 Samuel 7:12",
};

export const CATEGORIES = ["Healing", "Provision", "Marriage", "Deliverance", "Salvation"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAPERS = ["Ledger", "Adire", "Dawn", "Plain"] as const;
export type Paper = (typeof PAPERS)[number];

export const PAPER_NOTES: Record<Paper, string> = {
  Ledger: "A punched notebook page",
  Adire: "Navy cloth with indigo rings and stitching",
  Dawn: "Soft morning sky",
  Plain: "Clean white with a blue band",
};

export const PARTS = [
  { key: "struggle", title: "The Struggle", em: "struggle.", prompt: "What were you facing? Name the place and the time.", hints: ["When did it start, and where were you living?", "What had you already tried?", "What did people around you say?"] },
  { key: "prayer", title: "The Prayer", em: "prayer.", prompt: "What did you pray, and who stood with you?", hints: ["What exactly did you ask God for?", "Who prayed with you: family, a fellowship, a pastor?", "Was there a verse you held on to?"] },
  { key: "turning", title: "The Turning Point", em: "turning point.", prompt: "The moment it changed. Be specific: the day, the place, the exact words or the exact amount.", hints: ["What day was it, and where were you?", "Who was there, and what did they say?", "What did you see, hear or receive?"] },
  { key: "now", title: "Life Now", em: "life now.", prompt: "Where you are today, and what you would tell someone still waiting.", hints: ["What is different today?", "What would you say to someone in the same place?", "Is there a verse you would leave them with?"] },
] as const;
export type PartKey = (typeof PARTS)[number]["key"];
