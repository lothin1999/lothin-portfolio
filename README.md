# Lothin Portfolio — Next.js 14 + Cloudflare Pages

Personal portfolio for Thoeun Lothin. Built with Next.js 14 App Router, TypeScript,
Tailwind CSS, GSAP animations, full SEO, and a password-protected in-browser CV editor.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, SSR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | GSAP + ScrollTrigger |
| Auth | bcryptjs (password hash) + jose (JWT session cookie) |
| Hosting | **Cloudflare Pages** (primary) / Vercel (alternative) |
| Images | imgbb free API (optional) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root: fonts, CVProvider, AdminButton, JSON-LD
│   ├── globals.css              # Design tokens (:root CSS vars)
│   ├── page.tsx                 # Home — Hero + Experience + Skills
│   ├── experience/page.tsx
│   ├── skills/page.tsx
│   ├── education/page.tsx
│   ├── about/page.tsx
│   ├── sitemap.ts               # Auto-generated sitemap.xml for Google
│   ├── robots.ts                # robots.txt
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts          # POST — verify password, set JWT cookie
│       │   ├── logout/route.ts         # POST — clear session cookie
│       │   └── change-password/route.ts # POST — returns new bcrypt hash
│       └── cv/
│           ├── route.ts                # GET (public) / PUT (protected) CV data
│           └── upload-photo/route.ts   # POST — upload photo to imgbb
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Sticky nav, mobile drawer, active link
│   │   └── Footer.tsx           # Dynamic footer from CV context
│   ├── sections/
│   │   ├── HeroSection.tsx      # GSAP timeline entrance + profile photo
│   │   ├── ExperienceSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── AboutSection.tsx     # Sticky contact card, languages, references
│   ├── admin/
│   │   ├── AdminButton.tsx      # 🔒 floating button — login or edit
│   │   ├── AdminLoginModal.tsx  # Password entry modal
│   │   └── AdminEditModal.tsx   # 6-tab full CV editor
│   └── ui/
│       ├── Chip.tsx
│       └── SectionLabel.tsx
├── hooks/
│   ├── useCVData.tsx            # React context: CV state + admin flag
│   └── useScrollReveal.ts       # GSAP ScrollTrigger hook
├── lib/
│   ├── data.ts                  # Default CV seed data
│   ├── cvStore.ts               # CV persistence abstraction
│   ├── auth.ts                  # bcrypt + JWT helpers
│   ├── seo.ts                   # Metadata + JSON-LD builder
│   └── utils.ts                 # cn() utility
└── types/
    └── cv.ts                    # CVData, Experience, Education, etc.
```

---

## Quick Start (Local)

```bash
# 1. Clone / unzip the project
cd lothin-portfolio

# 2. Install dependencies
npm install

# 3. Set up env vars
cp .env.local.example .env.local

# 4. Generate your password hash
node -e "const b=require('bcryptjs'); b.hash('YourPassword123',12).then(console.log)"
# Copy the output into ADMIN_PASSWORD_HASH in .env.local

# 5. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy into JWT_SECRET in .env.local

# 6. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Deploy to Cloudflare Pages (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/lothin-portfolio.git
git push -u origin main
```

### Step 2 — Create Cloudflare Pages project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Create a project**
2. Connect your GitHub repository
3. Set build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Node.js version**: `20`

### Step 3 — Add Environment Variables in Cloudflare Pages

In your Pages project → **Settings** → **Environment variables** → add:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD_HASH` | Your bcrypt hash from step 4 above |
| `JWT_SECRET` | Your 64-char hex from step 5 above |
| `SESSION_MAX_AGE` | `14400` (4 hours, adjustable) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.pages.dev` |
| `IMGBB_API_KEY` | *(optional)* Your imgbb key for photo uploads |

> Set these for both **Production** and **Preview** environments.

### Step 4 — Deploy

Cloudflare auto-deploys on every push to `main`. Your site will be at:
`https://your-project.pages.dev`

---

## Deploy to Vercel (Alternative)

```bash
npm install -g vercel
vercel
```

Add the same env vars in the Vercel dashboard under **Settings → Environment Variables**.

---

## Admin — Editing Your CV

1. Visit your portfolio
2. Click the 🔒 **lock icon** (bottom-right corner)
3. Enter your admin password
4. The icon becomes a ✏️ **pencil** — click to open the CV editor
5. Edit any field across 6 tabs: **Profile, Experience, Skills, Education, References, Password**
6. Click **Save** — changes reflect live immediately

### Changing Your Password

1. Login as admin → Edit modal → **Password** tab
2. Enter current + new password → Submit
3. A **new bcrypt hash** is shown — **copy it**
4. Update `ADMIN_PASSWORD_HASH` in your Cloudflare Pages env vars
5. Redeploy (or the hash takes effect on next cold start)

---

## SEO

- `generateMetadata()` in every page — title, description, OG, Twitter card
- `src/app/sitemap.ts` → auto-generates `/sitemap.xml`
- `src/app/robots.ts` → auto-generates `/robots.txt`
- JSON-LD `Person` schema in `<head>` for Google rich results
- Canonical URLs per page
- All via `NEXT_PUBLIC_SITE_URL` env var — just set it to your domain

### Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your `https://your-project.pages.dev` as a property
3. Verify via HTML tag (add to `layout.tsx` metadata → `verification.google`)
4. Submit `https://your-project.pages.dev/sitemap.xml`

---

## Image Upload (Optional)

1. Get a free API key at [api.imgbb.com](https://api.imgbb.com/)
2. Add `IMGBB_API_KEY=your_key` to env vars
3. In the admin editor → **Profile** tab → upload a photo
4. Photo is hosted on imgbb CDN and URL is saved to your CV data

---

## Persistent CV Edits Across Deploys

By default, CV edits are stored in **server memory** (lost on redeploy).
For persistence, use one of these approaches:

### Option A — Cloudflare KV (Recommended for Cloudflare Pages)
1. Create a KV namespace in Cloudflare dashboard
2. Bind it as `CV_STORE` in `wrangler.toml`
3. Update `src/lib/cvStore.ts` to use `env.CV_STORE.get/put`

### Option B — Environment Variable (Simple)
After editing, export your CV as JSON from the admin panel and paste it
as the `CV_JSON_DATA` environment variable (base64 or JSON string).

### Option C — Vercel + Edge Config / Redis
Use `@vercel/kv` or `@upstash/redis` in `cvStore.ts`.
