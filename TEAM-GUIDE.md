# Escavox website — team guide

Welcome 👋 This is the Escavox marketing website. It's a **static site** (plain HTML, CSS
and a little JavaScript) — **no build step, no framework**. If you can edit a document, you
can edit this site.

- **Repository:** <https://github.com/Escavox/escavox-website>
- **What each file is + where to change copy/colours:** see [`README.md`](README.md).

---

## Step 1 — Get access (one-time)

1. Create a free GitHub account (if you don't have one): <https://github.com/signup> —
   **verify your email** afterwards or GitHub blocks you from saving changes.
2. Send your GitHub username to **Matt**. He adds you at
   **repo ▸ Settings ▸ Collaborators ▸ Add people**.
3. You'll get an email invite — **click Accept**. Done, you now have edit access.

---

## Step 2 — Pick how you want to edit

### Option A — Edit in the browser (easiest, nothing to install) ✅ recommended to start

Great for text changes, swapping a word, fixing a link.

1. Open the repo: <https://github.com/Escavox/escavox-website>
2. Press the **`.`** (full-stop) key. This opens a full VS Code editor **in your browser**.
   *(Or click a file ▸ the pencil ✏️ icon to edit just that one.)*
3. Make your change.
4. Left sidebar ▸ **Source Control** (the branch icon) ▸ type a short message ▸
   **Commit & Push**. That's it — it's saved and (once we've connected hosting) goes live.

### Option B — GitHub Desktop (visual app, edit files on your Mac/PC)

Good if you want to edit lots of files or preview locally.

1. Install **GitHub Desktop**: <https://desktop.github.com> ▸ sign in with your browser.
2. **File ▸ Clone Repository ▸ escavox-website** ▸ Clone.
3. Click **Open in your editor** (e.g. VS Code) and make changes.
4. Back in GitHub Desktop: type a summary ▸ **Commit to main** ▸ **Push origin**.

### Option C — Command line (for developers)

```bash
git clone https://github.com/Escavox/escavox-website.git
cd escavox-website
# edit files…
git add . && git commit -m "what you changed" && git push
```

---

## Step 3 — Preview your changes

- **Quickest:** open the `.html` file you changed in a browser.
- **Most accurate:** from the project folder run `python3 -m http.server 8000` and open
  <http://localhost:8000>.
- **Once hosting is connected (Netlify/Vercel):** every push auto-publishes, and you get a
  live link to check.

---

## How changes reach the live site

```
you edit → commit → push to "main" → (Netlify/Vercel) auto-deploys → live on the domain
```

Everything is tracked: the repo's **commit history** shows exactly who changed what and when.

---

## A few golden rules

- **Pull before you start** (GitHub Desktop: *Fetch/Pull origin*; browser editor is always
  current) so you're working on the latest version.
- **Small, frequent commits** with a clear message beat one giant change.
- **Don't rename the device images** in `assets/img/devices/` — the pages point to those
  exact file names.
- **Colours & spacing** live once in `css/styles.css` under `:root { … }` — change them
  there, not page by page.
- If two people might touch the same thing, use a **branch + Pull Request** so changes get
  reviewed before going live (ask Matt to switch on "require PRs" if you want this enforced).
- Not sure? Make a branch, or ask — nothing here can be permanently broken; every version is
  saved in Git.

---

## Still to be finalised (don't treat as done)

- The two **homepage KPI numbers** ("18k+ tonnes", "34% fewer claims") are placeholders.
- The site isn't **deployed to the live domain** yet — pushes land in GitHub for now.

(The contact form is live — it emails enquiries to **info@escavox.com** via Web3Forms.)

Questions → **Matt**.
