# Escavox website — Divi handover (plug-and-play)

**For the web team.** This is the new Escavox site, packaged so it drops into your
existing WordPress + Divi install with no rebuild. Each page is a single block you
paste into one Divi **Code** module. Styling, navigation and the interactive
demos are all self-contained — you don't recreate anything in the Divi builder.

Estimated time: **~30–45 minutes** for all 8 pages.

---

## What's in this folder

| Item | What it is |
|------|-----------|
| `pages/*.html` | 8 paste-ready blocks — one per page (home, platform, devices, sustainability, people, news, faq, contact). |
| `assets-upload/escavox-site/` | Images, shared CSS/JS and the MyTracks demo. Uploads once to WordPress. |
| `SEO-META.md` | Page title + meta description to set per page. |
| `build-handover.mjs` | The generator (Node, no dependencies). Only needed if a config change is wanted — see *Config* below. |

---

## Step 1 — Upload the asset bundle (once)

Upload the whole `assets-upload/escavox-site/` folder into your WordPress uploads
directory, **keeping the folder structure**, so it ends up at:

```
wp-content/uploads/escavox-site/
├── css/styles.css
├── js/motion.js
├── js/main.js
├── img/…            (logos, devices, team, client logos)
└── mytracks-demo.html
```

Use cPanel **File Manager**, FTP, or a folder-upload plugin (e.g. *Filester*). A
one-by-one Media Library upload also works but renames files — the folder upload
keeps the paths clean.

**Verify** before continuing — this URL should load the stylesheet in a browser:

```
https://www.escavox.com/wp-content/uploads/escavox-site/css/styles.css
```

> If your site is not on `www.escavox.com`, or you upload to a different folder,
> the asset URLs won't match — see **Config** at the bottom (a 2-minute change).

---

## Step 2 — Create each page

For **every** file in `pages/`, in WordPress:

1. **Pages → Add New.**
2. Set the **URL slug** to exactly match the table below (this matters — the
   navigation links are baked into the pages and expect these slugs).
3. In **Page Attributes → Template**, choose **Blank Page** (Divi). This turns
   off the theme header/footer so only the Escavox page shows.
4. Add a **Divi Code module** (Use Divi Builder → add a single-column row → Code
   module) — or the block editor's **Custom HTML** block if you're not opening
   the builder.
5. Open the matching `pages/…​.html`, copy **all** of it, paste into the Code
   module, **Save / Publish**.

| Paste this file | Page title | Slug |
|-----------------|-----------|------|
| `pages/index.html` | Home | *(set as front page — Step 3)* |
| `pages/platform.html` | Platform | `platform` |
| `pages/devices.html` | Devices | `devices` |
| `pages/sustainability.html` | Sustainability | `sustainability` |
| `pages/people.html` | People | `people` |
| `pages/news.html` | News | `news` |
| `pages/faq.html` | FAQ | `faq` |
| `pages/contact.html` | Contact | `contact` |

---

## Step 3 — Set the home page

**Settings → Reading → "Your homepage displays" → A static page →** select the
page you built from `index.html`. That makes it the site root (`/`).

---

## Step 4 — Titles & meta (SEO)

The `<title>` and meta description come from WordPress, not the pasted block.
Set them per page from **`SEO-META.md`** (in the WP page editor, or your SEO
plugin such as Yoast / Rank Math).

---

## What's already handled for you

- **Navigation** — the top nav and footer are inside every page block. You do
  **not** build a WordPress menu. (The nav links point at the slugs above.)
- **Fonts** — PT Sans loads from Google Fonts automatically.
- **The MyTracks™ animation** on the Platform page — already embedded, served
  from `…/uploads/escavox-site/mytracks-demo.html`. Nothing extra to do.
- **The contact form** — submits via Web3Forms to **info@escavox.com**. Works as-is.
- **Responsive + reduced-motion** — built in.

---

## Go-live

These pages can be built and previewed **before** switching anything. Nothing
here changes DNS or the live homepage until you set the static front page
(Step 3) and publish. Confirm with Matt before making it the public site.

---

## Config (only if a default needs changing)

Two settings live at the top of `build-handover.mjs`:

- `ASSET_BASE` — the uploads URL (default `https://www.escavox.com/wp-content/uploads/escavox-site`).
- `SLUGS` — the permalink for each page.

If either must change (different domain, folder, or slugs), edit those values and
regenerate — Node 18+, no install needed:

```bash
node handover/build-handover.mjs
```

That rewrites every block in `pages/` consistently. (Or, for a one-off, find-and-
replace the old URL/slug across `pages/*.html`.) **Matt / the Escavox team can
run this for you** — just tell us the domain, folder and slugs you want.

---

## Not included here

- **`experience.html`** — the immersive WebGL scroll page. It uses browser
  modules and a 3D engine, so it's **not** a Code-module paste. If you want it
  live, host it as its own standalone page (or embed via iframe) and we'll supply
  it separately — it's optional and not part of the core site replacement.

Questions on any of this — come back to Matt.
