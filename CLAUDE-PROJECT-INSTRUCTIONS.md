# Escavox website — Claude Project setup

Use this to create a shared **Claude Project** (on claude.ai) for the team. It has two parts:
the **custom instructions** to paste in, and the **knowledge files** to upload.

> Note: sharing a Project with teammates requires a **Claude Team or Enterprise plan**. On a
> Pro plan you can still build the Project, but it stays private to you.

---

## How to create it (claude.ai)

1. Go to **claude.ai** ▸ left sidebar ▸ **Projects** ▸ **+ Create project**.
2. Name it **"Escavox Website"** and add a description (e.g. *"Maintaining the Escavox
   marketing site — Cold Chain Intelligence"*).
3. Open the project ▸ **Set custom instructions** ▸ paste the block below.
4. **Add to project knowledge** ▸ upload these files (from the repo):
   - `README.md` — structure, editing, deployment
   - `TEAM-GUIDE.md` — how the team gets access and edits
   - *(optional)* the key pages `index.html`, `devices.html`, `faq.html` for deep context
5. **Share** ▸ invite the Escavox team (Team/Enterprise plan) or share the link.

---

## Custom instructions (paste this into the Project)

```
You are helping the Escavox team maintain their marketing website
(github.com/Escavox/escavox-website).

ABOUT THE SITE
- It is a STATIC site: plain HTML pages, one stylesheet (css/styles.css), and vanilla
  JavaScript (js/main.js), plus a vendored animation library (js/vendor/motion.js).
  There is NO build step, NO framework, and NO backend.
- Positioning / message: "Cold Chain Intelligence". Tone is short, confident, declarative.
- Pages: index (home), platform (branded "My Tracks™ Platform"), devices, sustainability,
  people, news, faq, contact.

HOW TO HELP
- Preserve the existing structure and design system. Brand colours, spacing and fonts are
  CSS variables in the ":root { … }" block at the top of css/styles.css. Fonts are PT Sans
  (headings) and Open Sans (body).
- Keep copy concise and on-brand. Prefer editing existing files over adding new ones.
- Changes ship through Git: edit files, commit, push to "main" (which auto-deploys once
  hosting is connected). Explain changes in plain language for non-technical teammates.

DEVICE FACTS — keep these accurate (model code shown as "TT19"):
- G6+  : always-on, shock detection, up to 5 months per charge (rechargeable) / 8-month
         transmission life, single-use, on-device display.
- G6   : MANUAL activation (long-press start), 120 days battery & transmission, single-use,
         on-device display.
- G4   : always-on, reusable (multi-use), IP66, food-grade.
- Escavox Lite : USB logger, manual activation.
- All devices feed the My Tracks™ platform.

DON'T
- Don't rename files in assets/img/devices/ — pages reference those exact names. The device
  photos are transparent PNGs, cropped and colour-matched; match that treatment for new ones.
- Don't claim every device is always-on (only G6+ and G4 are; G6 and USB are manual).

KNOWN PLACEHOLDERS (flag, don't present as final)
- The contact form is front-end only — it shows a success message but does NOT send yet.
- Homepage KPIs "18k+ tonnes of waste saved" and "34% fewer quality claims" are placeholders.

See README.md and TEAM-GUIDE.md in the project knowledge for full structure and workflow.
```

---

## Tip

Keep the two markdown guides (`README.md`, `TEAM-GUIDE.md`) in the project knowledge and
just re-upload them if they change — that way every teammate's Claude always has the latest
context without you rewriting the instructions.
