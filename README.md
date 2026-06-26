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
│   ├── layout.tsx               # Root: fonts, CVProvider, custom elements, wrappers
│   ├── page.tsx                 # Home — Hero + Experience + Skills + Education + FAQ
│   ├── globals.css              # Design tokens and custom tailwind overrides
│   ├── about/page.tsx           # About Page
│   ├── services/page.tsx        # Services Page
│   ├── portfolio/page.tsx       # Portfolio/Work Page
│   ├── documents/page.tsx       # Documents/Hub Page
│   ├── articles/page.tsx        # Articles List Page
│   │   └── [slug]/page.tsx      # Dynamic Article View Page
│   ├── contact/page.tsx         # Contact Page
│   ├── edit/page.tsx            # Editor route
│   ├── dashboard/page.tsx       # Dashboard route
│   ├── sitemap.ts               # Auto-generated sitemap.xml for Google
│   ├── robots.ts                # robots.txt
│   ├── manifest.ts              # Web App manifest configuration
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts          # POST — verify passcode, set JWT cookie
│       │   ├── logout/route.ts         # POST — clear session cookie
│       │   └── check/route.ts          # GET — check auth status
│       ├── cv/
│       │   ├── route.ts                # GET (public/visitor) / PUT (admin) CV data
│       │   ├── download/route.ts       # GET — download latest CV PDF
│       │   ├── local-save/route.ts     # GET/POST — filesystem backup in local dev
│       │   ├── vectorize/route.ts      # POST — vectorize CV sections
│       │   ├── upload/route.ts         # POST — upload arbitrary files to R2
│       │   ├── upload-photo/route.ts   # POST — upload photo file to R2
│       │   └── pdf/[filename]/route.ts # GET — stream CV PDFs from R2
│       ├── documents/[filename]/route.ts # GET — stream documents/guide files from R2
│       ├── images/[filename]/route.ts   # GET — serve images from R2
│       ├── transcribe/route.ts         # POST — voice transcription route
│       ├── chat/route.ts               # POST — AI Assistant route
│       └── cloudflare/route.ts         # GET/POST — Cloudflare status checks
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Sticky nav, mobile drawer, links
│   │   ├── Footer.tsx           # Dynamic footer from CV context
│   │   ├── SmoothScrollProvider.tsx # Lenis smooth scroll configuration
│   │   ├── AIChatDrawer.tsx     # Floating Gemini Assistant drawer
│   │   ├── CVContentWrapper.tsx # Framer Motion page wrapper
│   │   ├── StatusBar.tsx        # System status bar at bottom of pages
│   │   ├── SettingsModal.tsx    # User preference control panel
│   │   ├── ShortcutsModal.tsx   # Hotkey navigation overview
│   │   └── CustomCursor.tsx     # Dynamic follower cursor
│   ├── sections/
│   │   ├── HeroSection.tsx      # GSAP timeline entrance + profile photo
│   │   ├── ExperienceSection.tsx # Chronological work experience timeline
│   │   ├── SkillsSection.tsx    # Interactive skill group grids
│   │   ├── EducationSection.tsx # College curriculum breakdowns
│   │   ├── AboutSection.tsx     # Sticky profile, credentials, reference badges
│   │   ├── AboutCTA.tsx         # Floating quick-contact callout
│   │   └── FAQSection.tsx       # Expandable Accordion FAQ
│   ├── admin/
│   │   ├── AdminButton.tsx      # 🔒 Lock indicator floating button
│   │   ├── AdminLoginModal.tsx  # Admin passcode verification modal
│   │   ├── AdminEditPage.tsx    # Multi-tab full CV dashboard editor component
│   │   └── DragDropUploader.tsx # File drag-and-drop handler
│   └── ui/
│       ├── Chip.tsx             # Interactive badges
│       ├── DarkModeToggle.tsx   # Light/dark mode toggle button
│       ├── SectionLabel.tsx     # Numeric layout indicator
│       ├── ScrollProgressBar.tsx # Reading progress line
│       ├── ScrambleText.tsx     # Glitch/scramble text animation
│       ├── ImageCube.tsx        # Dynamic photo display cube
│       ├── LockScreen.tsx       # Visitor lock screen overlay
│       ├── Glyph.tsx            # Decorative matrix grid blocks
│       ├── CVButtons.tsx        # Download and PDF action buttons
│       └── Carousel.tsx         # Horizontal media card slider
├── hooks/
│   ├── useCVData.tsx            # Context provider for CV database
│   ├── useScrollReveal.ts       # GSAP dynamic scroll triggers
│   └── useTheme.tsx             # Theme mode management
├── lib/
│   ├── data.ts                  # Default fallback CV seed data
│   ├── cvTemplate.ts            # PDF template structure mapping
│   ├── cvStore.ts               # Cloudflare R2 bucket integration engine
│   ├── auth.ts                  # Passcode hashing and JWT token utility
│   ├── seo.ts                   # Page title/meta/JSON-LD generators
│   ├── encryption.ts            # Symmetrical AES client-side encryption
│   ├── rateLimit.ts             # In-memory IP requests tracker
│   └── utils.ts                 # Classname merge (clsx + tailwind-merge)
└── types/
    └── cv.ts                    # Strongly typed types for portfolio schema
```

---

## Quick Start (Local)

```bash
# 1. Clone / unzip the project
cd lothin-portfolio

# 2. Install dependencies
pnpm install

# 3. Set up env vars
cp .env.local.example .env.local

# 4. Generate your password hash
node -e "const b=require('bcryptjs'); b.hash('YourPassword123',12).then(console.log)"
# Copy the output into ADMIN_PASSWORD_HASH in .env.local

# 5. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy into JWT_SECRET in .env.local

# 6. Run dev server
pnpm dev
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
   - **Build command**: `pnpm run pages:build`
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
pnpm dlx vercel
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

## Persistent CV Edits & Document Storage Across Deploys

For persistence of the CV data and media files, the project is configured to use **Cloudflare R2** buckets.

### Cloudflare R2 Setup (Recommended for Cloudflare Pages)

1. Create an R2 bucket named `portfolio-data` in your Cloudflare dashboard.
2. Bind the bucket in `wrangler.toml` (uncomment the bucket binding lines):
   ```toml
   [[r2_buckets]]
   binding = "R2_BUCKET_NAME"
   bucket_name = "portfolio-data"
   ```
3. Set the following environment variables in your Cloudflare Pages dashboard (under **Settings** -> **Environment variables**) to enable local R2 REST API access in dev/preview environments:
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.
   - `CLOUDFLARE_AI_API_TOKEN`: A Cloudflare API token with R2 read/write permissions.
   - `R2_BUCKET_NAME`: `portfolio-data` (or your custom bucket name).
   - `CV_ENCRYPTION_KEY`: A secure key used to encrypt the CV data dynamically.

### Document & PDF Syncing

The application automatically syncs files from the R2 bucket:
- **CV Downloads**: Any PDF placed under the `cv/` R2 path (e.g. `cv/cv-name.pdf`) is dynamically detected and offered as the main CV PDF download.
- **Cover Letter**: Any PDF placed under `letter/` (e.g. `letter/letter.pdf`) is linked as the cover letter.
- **Documents Hub**: Any files uploaded under the `documents/` path (e.g., `documents/NestJS-Guide.md`, `documents/C-Guide.pdf`, `documents/core-banking-erd.html`) are automatically registered and renderable in the **Documents Hub** (`/documents` page).
