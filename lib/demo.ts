// Sample content from the Figma design, used only when no database is connected (demo mode).
// The site shows a "Sample story" label on these so nobody mistakes them for real testimonies.
import type { Prayer, Story } from "./types";

const d = (n: number) => new Date(Date.UTC(2026, 10, 26 - n)).toISOString();

const base = { language: "English", status: "published" as const, pull_quote: null };

export const demoStories: Story[] = [
  {
    ...base, id: "s1", slug: "it-held-the-exact-rent", title: "It held the exact rent, to the naira", category: "Provision", city: "Ibadan", paper: "Ledger", author_name: "Anonymous",
    struggle: "By March my account read ₦0.00. I had lost my job in January when the company closed its Ibadan branch, and the rent of ₦350,000 was due on the last Friday of the month. My landlord had already been patient twice.",
    prayer: "I told only my sister and my house fellowship. We prayed every night that week, not for a miracle exactly, but for a way. On Thursday I wrote “Jehovah Jireh” on a sticky note and put it on my fridge.",
    turning: "After the Sunday service a woman I had never met pressed an envelope into my hand and walked away before I could ask her name. I opened it in the car. It held ₦350,000. The exact rent, to the naira.",
    now: "I paid the rent the next morning. Two months later I started a new job in Lagos. I still have the envelope. If you are waiting for a way, keep asking. He sees the exact number.",
    pull_quote: "He sees the exact number.", amen_count: 421, created_at: d(0), published_at: d(0),
  },
  {
    ...base, id: "s2", slug: "three-years-of-seizures", title: "Three years of seizures, and the Sunday they stopped", category: "Healing", city: "Abeokuta", paper: "Plain", author_name: "Tunde A.",
    struggle: "For three years I had seizures without warning. I stopped driving, then I stopped going out at all. Two hospitals agreed on the diagnosis and told me to manage it.",
    prayer: "My mother gathered a few people from her church in her parlour for a night of prayer. I did not expect much. I was tired of hoping.",
    turning: "Sometime after midnight I felt heat move through my head and down my back. I have not had a seizure since that Sunday.",
    now: "My last two scans were clear and my doctor has reduced my medication. I drive my mother to church now.",
    amen_count: 312, created_at: d(2), published_at: d(2),
  },
  {
    ...base, id: "s3", slug: "released-after-41-days", title: "Released after 41 days in captivity", category: "Deliverance", city: "Kaduna", paper: "Adire", author_name: "Anonymous",
    struggle: "We were taken on the Abuja–Kaduna road. There were eleven of us, and for weeks we did not know if anyone was looking for us.",
    prayer: "Every night the women in our group whispered Psalm 91 together. We said it until we knew it by heart.",
    turning: "On the 41st night the guards were gone. We walked until morning and reached a village where a farmer took us to the police.",
    now: "I am home with my children. I still say Psalm 91 every night.",
    amen_count: 402, created_at: d(3), published_at: d(3),
  },
  {
    ...base, id: "s4", slug: "i-went-to-the-crusade-to-mock-it", title: "I went to the crusade to mock it", category: "Salvation", city: "Onitsha", paper: "Ledger", author_name: "Kelechi N.",
    struggle: "I was the joker of my friends. Church was something I laughed at.",
    prayer: "I did not pray. My grandmother did, every day, for twenty years.",
    turning: "My friends dared me to record something funny for Instagram. I left that field a different man, and I deleted the video.",
    now: "I lead the youth fellowship in my parish now. My grandmother lived to see it.",
    amen_count: 233, created_at: d(4), published_at: d(4),
  },
  {
    ...base, id: "s5", slug: "the-scholarship-letter-came-on-my-last-day", title: "The scholarship letter came on my last day", category: "Provision", city: "Kano → Leeds", paper: "Dawn", author_name: "Zainab M.",
    struggle: "I had applied for eleven scholarships. Ten said no. I accepted a job at a factory so my younger ones could stay in school.",
    prayer: "My mother and I prayed every morning before she went to the market.",
    turning: "I had stopped checking my email. My mother told me to check one more time before I took the factory job. The letter had come that morning.",
    now: "I am in my second year at Leeds, studying pharmacy.",
    amen_count: 158, created_at: d(5), published_at: d(5),
  },
  {
    ...base, id: "s6", slug: "the-divorce-papers-were-already-signed", title: "The divorce papers were already signed", category: "Marriage", city: "Lagos", paper: "Plain", author_name: "Mrs. Funmi A.",
    struggle: "After nine years we could not speak without fighting. The papers were on the table at our lawyer’s office in Ikeja.",
    prayer: "A friend asked if she could pray for us. I said yes only so she would stop asking.",
    turning: "My husband asked for one more week. That week changed everything.",
    now: "We renewed our vows this year. Our children were the witnesses.",
    amen_count: 186, created_at: d(6), published_at: d(6),
  },
];

export const demoPrayers: Prayer[] = [
  { id: "p1", body: "My son’s visa interview is on Friday in Abuja. Two refusals already.", name: "Mama Tobi", city: "Abuja", pray_count: 48, status: "published", created_at: d(0) },
  { id: "p2", body: "For my father’s kidney results on Tuesday.", name: "Chinedu", city: "Enugu", pray_count: 31, status: "published", created_at: d(1) },
  { id: "p3", body: "I have been looking for work for eight months. Please pray for a door to open.", name: "Someone", city: "Port Harcourt", pray_count: 22, status: "published", created_at: d(2) },
  { id: "p4", body: "We have waited five years for a child.", name: "Bisi & Femi", city: "Ibadan", pray_count: 64, status: "answered", created_at: d(9) },
];
