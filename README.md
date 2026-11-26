# Still He Moves

A home for first-hand testimonies of what God did. Read one, then write yours.

Built with Next.js, Supabase (free plan) and the "Sunday Light" design from Figma. Mobile first, light on data, with link previews and Status images made for WhatsApp.

## What's in it

| Page | What it does |
| --- | --- |
| `/` | Home: hero, stats, testimony of the day, latest stories, how it works, prayer wall, the four parts, FAQ, Sunday email |
| `/stories` | All published stories, search and category filters |
| `/stories/[slug]` | One story in four parts, Amen, share as image (1080×1920 for Status), WhatsApp, copy link |
| `/share` | Seven-step share flow. Drafts are saved on the phone, voice typing where the browser supports it, anonymous by default |
| `/prayer-wall` | Prayer requests with "I prayed", and a form to post one |
| `/how-we-check`, `/about`, `/privacy` | Trust pages |
| `/admin` | Team page: approve, edit or reject stories, show or hide prayer requests, withdraw stories, see subscriber count |

Nothing a visitor sends appears on the site until someone on the team approves it.

## Going live (about 20 minutes, all free)

### 1. Database (Supabase)
1. Sign up at supabase.com and create a project. Pick the region closest to Nigeria (for example `eu-west` / London).
2. Open **SQL Editor → New query**, paste everything in [`supabase/schema.sql`](supabase/schema.sql), and press **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **service_role** key. Keep that key secret: never paste it in a chat or a public place.

### 2. Hosting (Vercel)
1. Sign up at vercel.com with your GitHub account.
2. **Add New → Project**, choose this repository, and before pressing Deploy open **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | the Project URL from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from step 1 |
| `ADMIN_PASSWORD` | a long password the two of you share, for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | the site address, e.g. `https://still-he-moves.vercel.app` (change it when you buy a domain) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional, shown on the About page |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | optional, a number like `2348030000000` |

3. Press **Deploy**. Every later change merged into `main` deploys by itself.

Without the Supabase values the site still runs in **preview mode**: it shows the sample stories from the design with a "Sample" label, and nothing anyone sends is saved.

### 3. Domain (later, about $10 a year)
When the name is final, buy the domain and add it in Vercel under **Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL`.

## Photos
The design's photos go in `public/photos/` as JPGs (about 1600 px wide, under 300 KB each). Until they're there, soft sky-blue blocks stand in.

| File | Where it shows |
| --- | --- |
| `worship.jpg` | Home hero |
| `envelope.jpg` | Testimony of the day |
| `bedside-prayer.jpg` | Home prayer wall section |

Only use photos you have the right to use.

## Changing the name
The name lives in one place: [`lib/site.ts`](lib/site.ts) (and `public/manifest.webmanifest`).

## Working on it
```bash
npm install
cp .env.example .env.local   # fill in values, or leave empty for preview mode
npm run dev                  # http://localhost:3000
```
