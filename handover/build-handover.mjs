/* ==========================================================================
   Escavox — Divi handover builder
   Turns each standalone page into a single self-contained block that a Divi
   vendor pastes into ONE "Code" module on a Blank/Full-width page template.
   Inlines styles.css + motion.js + main.js, rewrites asset paths to the
   WordPress uploads folder, and rewrites internal .html links to WP permalinks.
   Node stdlib only (Node >= 18). Run:  node handover/build-handover.mjs
   ========================================================================== */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SITE = dirname(fileURLToPath(import.meta.url)) + '/..';
const OUT  = process.env.OUT_DIR || join(SITE, 'handover');
const WRAP = process.env.WRAP === '1';   // wrap blocks in a full HTML doc for local preview only

/* -- The two knobs the vendor may change (documented in VENDOR-HANDOVER.md) -- */
// Where the asset bundle is uploaded (no trailing slash). `assets/` maps here.
// Override for local verification:  ASSET_BASE=http://localhost:8000/... node handover/build-handover.mjs
const ASSET_BASE = process.env.ASSET_BASE || 'https://www.escavox.com/wp-content/uploads/escavox-site';
// WordPress permalink for each page (final URL slug). index = site root.
const SLUGS = {
  'index':          '/',
  'platform':       '/platform/',
  'devices':        '/devices/',
  'sustainability': '/sustainability/',
  'people':         '/people/',
  'news':           '/news/',
  'faq':            '/faq/',
  'contact':        '/contact/',
  'app':            '/the-escavox-app/',
  'privacy':        '/privacy/',
  'terms':          '/terms/',
  'cookie-policy':  '/cookie-policy/',
  'experience':     '/experience/',
};
// Pages delivered as Code Modules (experience.html is WebGL/ESM — handled separately).
const PAGES = ['index','platform','devices','sustainability','people','news','faq','contact','app','privacy','terms','cookie-policy'];

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">';

function rewriteScripts(html) {
  // shared JS lives in the uploads bundle, cached across every page
  return html
    .replace(/src="js\/vendor\/motion\.js"/g, `src="${ASSET_BASE}/js/motion.js"`)
    .replace(/src="js\/main\.js"/g, `src="${ASSET_BASE}/js/main.js"`);
}
function rewriteLinks(html) {
  // internal page links  href="page.html"  or  href="page.html#frag"  ->  permalink
  return html.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g, (m, page, frag) => {
    const slug = SLUGS[page];
    if (!slug) return m;                 // unknown page: leave untouched
    return `href="${slug}${frag || ''}"`;
  });
}
function rewriteAssets(html) {
  // assets/... -> WordPress uploads URL, in src/href attributes AND inline CSS url()
  return html
    .replace(/(src|href)=("|')assets\//g, `$1=$2${ASSET_BASE}/`)
    .replace(/url\((["']?)assets\//g, `url($1${ASSET_BASE}/`);
}

const seo = [];
function build(page) {
  const raw = readFileSync(join(SITE, `${page}.html`), 'utf8');

  // capture title + meta description so the vendor sets them per WP page
  const title = (raw.match(/<title>([\s\S]*?)<\/title>/) || [,''])[1].trim();
  const desc  = (raw.match(/<meta name="description" content="([\s\S]*?)">/) || [,''])[1].trim();
  seo.push({ page, slug: SLUGS[page], title, desc });

  let body = (raw.match(/<body[^>]*>([\s\S]*?)<\/body>/) || [,''])[1];
  body = rewriteScripts(rewriteAssets(rewriteLinks(body)));

  const block =
`<!-- ====================================================================
     ESCAVOX — ${page}.html  ·  paste into ONE Divi "Code" module
     Page template: Blank Page (Divi) so the theme header/footer is off.
     Shared CSS/JS + images expected at: ${ASSET_BASE}/
     Built by handover/build-handover.mjs — edit the source, not this file.
     ==================================================================== -->
${FONTS}
<link rel="stylesheet" href="${ASSET_BASE}/css/styles.css">
<script>document.documentElement.classList.add("js");</script>
<div id="esc-site">
${body.trim()}
</div>
`;
  const out = WRAP
    ? `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body>\n${block}\n</body></html>`
    : block;
  writeFileSync(join(OUT, 'pages', `${page}.html`), out);
  return block.length;
}

/* ---- run ---------------------------------------------------------------- */
rmSync(join(OUT, 'pages'), { recursive: true, force: true });
mkdirSync(join(OUT, 'pages'), { recursive: true });
let total = 0;
for (const p of PAGES) {
  const n = build(p);
  total += n;
  console.log(`  ${p.padEnd(16)} ${(n/1024).toFixed(0).padStart(4)} KB`);
}

/* ---- asset bundle for WordPress uploads (preserve structure) ------------ */
rmSync(join(OUT, 'assets-upload'), { recursive: true, force: true });
mkdirSync(join(OUT, 'assets-upload', 'escavox-site', 'js'), { recursive: true });
const clean = { recursive: true, filter: (src) => !/(\.DS_Store|\.claude-flow)/.test(src) };
cpSync(join(SITE, 'assets/img'), join(OUT, 'assets-upload/escavox-site/img'), clean);
cpSync(join(SITE, 'assets/mytracks-demo.html'), join(OUT, 'assets-upload/escavox-site/mytracks-demo.html'));
cpSync(join(SITE, 'css/styles.css'), join(OUT, 'assets-upload/escavox-site/css/styles.css'));
cpSync(join(SITE, 'js/vendor/motion.js'), join(OUT, 'assets-upload/escavox-site/js/motion.js'));
cpSync(join(SITE, 'js/main.js'), join(OUT, 'assets-upload/escavox-site/js/main.js'));

/* ---- SEO table so the vendor sets WP page title + meta per page --------- */
const seoMd = `# Per-page SEO — set these in WordPress (page title + meta description)

Set in the WP page editor (or your SEO plugin, e.g. Yoast/RankMath) for each page.

| Page | URL slug | Title tag | Meta description |
|------|----------|-----------|------------------|
${seo.map(s => `| ${s.page} | \`${s.slug}\` | ${s.title} | ${s.desc} |`).join('\n')}
`;
writeFileSync(join(OUT, 'SEO-META.md'), seoMd);

console.log(`\n  ${PAGES.length} pages, ${(total/1024).toFixed(0)} KB total`);
console.log('  assets-upload/escavox-site/  ready for WordPress uploads');
console.log('  SEO-META.md written');
