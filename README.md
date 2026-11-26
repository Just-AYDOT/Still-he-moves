# Still He Moves

A home for first-hand testimonies of what God did. Read one, then write yours.

Built with Next.js, Firebase Firestore (free Spark plan) and the "Sunday Light" design from Figma. Mobile first, light on data, with link previews and Status images made for WhatsApp.

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

### 1. Database (Firebase)
1. Go to console.firebase.google.com and **Create a project** (Google Analytics can be off). Stay on the free **Spark** plan.
2. In the left menu open **Build → Firestore Database → Create database**. Choose a location close to Nigeria (for example `europe-west2`, London), and start in **production mode**.
3. Open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules), and press **Publish**. This blocks all access from browsers; only the website's server can read and write.
4. Open **Project settings (gear icon) → Service accounts → Generate new private key**. A JSON file downloads. Keep it secret: never paste it in a chat, a public place or the repository.

### 2. Hosting (Vercel)
1. Sign up at vercel.com with your GitHub account.
2. **Add New → Project**, choose this repository, and before pressing Deploy open **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `project_id` from the JSON file |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from the JSON file |
| `FIREBASE_PRIVATE_KEY` | `private_key` from the JSON file: everything between the quotes, starting `-----BEGIN PRIVATE KEY-----` |
| `ADMIN_PASSWORD` | a long password the two of you share, for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | the site address, e.g. `https://still-he-moves.vercel.app` (change it when you buy a domain) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional, shown on the About page |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | optional, a number like `2348030000000` |

3. Press **Deploy**. Every later change merged into `main` deploys by itself.

Without the Firebase values the site still runs in **preview mode**: it shows the sample stories from the design with a "Sample" label, and nothing anyone sends is saved.

Why Vercel and not Firebase Hosting? This site renders pages on the server (for Google and WhatsApp previews), and Firebase's hosting for that, App Hosting, needs the paid Blaze plan with a card on file. Vercel's free plan runs it at no cost, and Firestore stays free on Spark. You can move hosting to Firebase App Hosting later without code changes.

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
# or, with Java installed, run against the local Firestore emulator:
# npx firebase-tools emulators:start --only firestore --project demo-testimony
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev
npm run dev                  # http://localhost:3000
```
