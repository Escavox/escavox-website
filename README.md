# Escavox website — build handoff

A rebuild of the Escavox marketing site, repositioned around **Cold Chain Intelligence**.
This is a **static website**: plain HTML, one CSS file, and a little vanilla JavaScript.
**There is no build step, no framework, and no backend** — what's in this folder is exactly
what runs in the browser. That makes it easy to edit and easy to host anywhere.

---

## 1. Preview it locally (30 seconds)

From inside this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (Any static server works — e.g. `npx serve`, or the
VS Code "Live Server" extension. Opening `index.html` directly mostly works too, but a
local server is more accurate.)

---

## 2. What's in here

```
index.html            Home
platform.html         My Tracks™ Platform
devices.html          Devices (G6+, G6, G4, Escavox Lite)
sustainability.html   Sustainability
people.html           People / team
news.html             News
faq.html              FAQ
contact.html          Contact (see form note below)

css/styles.css        ALL styling. Colours/spacing live in :root at the top (design tokens).
js/main.js            Scroll reveals, count-ups, hero globe, mobile nav, contact-form demo.
js/vendor/motion.js   Vendored animation library (no install needed).

assets/img/
  escavox-logo.png, favicon.png
  clients/            Client & partner logos (home marquee)
  devices/            Product photos — G6+, G6, G4, Lite (transparent PNGs, pre-processed)
  team/               People photos
```

---

## 3. How to edit

- **Text / copy:** edit the words directly in the relevant `.html` file. Content is plain
  HTML — no templating to learn.
- **Colours, fonts, spacing:** open `css/styles.css`. The brand palette and sizing are CSS
  variables in the `:root { … }` block at the very top (e.g. `--blue-600`, `--orange`,
  `--ink-900`). Change them in one place and they update site-wide.
- **Fonts:** PT Sans (headings) + Open Sans (body), loaded from Google Fonts (see the
  `<link>` in each page `<head>`).
- **Device images:** replace the files in `assets/img/devices/` keeping the **same file
  names**. They are transparent PNGs cropped and colour-matched so they sit cleanly on the
  cards — if you drop in a new raw photo, match that treatment (trim white background,
  transparent) or they'll look inconsistent.
- **Homepage KPIs:** in `index.html`, search for `data-count`. The number in
  `data-count="18"` is what animates; the suffix (`k+`, `%`) and label sit right next to it.

---

## 4. Deploy it to the live domain

Back up the current live site first. Two routes:

### Recommended — Git + static host (best for editing *and* deploying as a team)

This gives your team version history, easy collaborative editing, and automatic deploys.

1. Push this folder to a **GitHub** (or GitLab/Bitbucket) repository.
   ```bash
   git init && git add . && git commit -m "Escavox site rebuild"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Connect the repo to **Netlify**, **Vercel**, or **Cloudflare Pages** (all have free
   tiers). Because there's no build step, the settings are trivial:
   - **Build command:** *(leave blank)*
   - **Publish / output directory:** `.` (the repo root — where `index.html` is)
3. In the host's dashboard, add the Escavox **custom domain** and follow their DNS steps
   (a CNAME/A record change with your domain registrar). From then on, **every push to
   `main` redeploys the live site automatically.**

**Giving the team edit access:** create the repo under an **Escavox GitHub organisation**
(or share a single repo) and invite teammates as **collaborators** (repo → Settings →
Collaborators, or the org's People page). Everyone then edits and pushes; the repo's commit
history and Pull Requests let you **see exactly what each person changed**. Optionally
protect `main` and require Pull Requests so changes are reviewed before they go live.

### Simple — upload to your existing web host

The site is just files, so it works on any traditional host (cPanel, FTP, Nginx/Apache,
Amazon S3 + CloudFront, etc.):

- Upload the **contents** of this folder to the web root (so `index.html` is the site root).
- No server config, database, or runtime is required.

---

## 5. External dependencies (what the browser fetches)

- **Google Fonts** — `fonts.googleapis.com` / `fonts.gstatic.com` (PT Sans, Open Sans).
- **Links out to** `www.escavox.com` — the **Login** button and the **News** article links
  currently point to the existing site. Update these if the destinations change.
- The animation library (`motion.js`) is **vendored locally** — nothing to install.
- There is currently **no analytics/tracking** and **no cookie banner**. Add GA4 / your
  analytics and a consent banner if required before launch.

---

## 6. Pre-launch checklist

- [x] **Contact form** — live via **Web3Forms**; enquiries email to **info@escavox.com**.
      The access key is in `contact.html`; change the recipient in the Web3Forms dashboard.
- [ ] **Homepage KPIs are placeholders** — "18k+ tonnes of waste saved" and "34% fewer
      quality claims" are made-up. Replace with real figures (see §3).
- [ ] **Confirm device facts** — G6+ (always-on, shock, 5 mo/charge · 8-mo transmission),
      G6 (manual, 120 days), G4 (always-on, reusable), Lite/USB (manual). Model code
      shown as **TT19**.
- [ ] **Login URL** — confirm `https://www.escavox.com` is the right portal.
- [ ] Add analytics, Open Graph / social preview tags, `sitemap.xml` / `robots.txt` as
      desired.

---

## 7. Notes

- `package.json` / `package-lock.json` are dev-only (they were used to vendor `motion.js`).
  The site does **not** need `npm install` to run — you can ignore or delete them.
- Animations respect `prefers-reduced-motion` and degrade gracefully if JS is disabled.
- Everything is responsive (mobile / tablet / desktop) and theme-consistent.
