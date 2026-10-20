// Generates public/sitemap.xml and public/robots.txt from the site's own data, so they never drift from what the
// app actually renders. Runs automatically before every build (see "prebuild" in package.json); run it on its own
// with `npm run generate:sitemap`.
//
//  * Domain       -> COMPANY.siteUrl in src/app/core/config/company.config.ts (change it there, nowhere else)
//  * Product URLs -> every product in src/app/data/products.data.ts            (/products/:slug)
//  * Category URLs-> every category in src/app/data/taxonomy.data.ts           (/categories/:slug)
//  * Static pages -> the fixed routes in src/app/app.routes.ts
//
// Filtered/paginated listing URLs (?q=, ?brand=, ?page=) are deliberately left out — they are views of pages that
// are already listed. Product photos hosted on this site are included as image-sitemap entries.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (p) => path.join(root, p);

/** Loads a TS data module by stripping its types with esbuild (type-only imports disappear). */
async function load(rel) {
  const { code } = transformSync(fs.readFileSync(abs(rel), 'utf8'), { loader: 'ts', format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}

const { COMPANY } = await load('src/app/core/config/company.config.ts');
const { CATEGORIES } = await load('src/app/data/taxonomy.data.ts');
const { PRODUCTS } = await load('src/app/data/products.data.ts');

const site = String(COMPANY.siteUrl).replace(/\/+$/, '');
if (!/^https:\/\/[^/]+$/.test(site)) throw new Error(`COMPANY.siteUrl must be an https origin, got "${COMPANY.siteUrl}"`);

const routes = fs.readFileSync(abs('src/app/app.routes.ts'), 'utf8');
const staticPaths = [...routes.matchAll(/path: '([^':*]*)'/g)].map((m) => m[1]);
for (const required of ['', 'products', 'categories', 'about', 'contact', 'get-a-quote']) {
  if (!staticPaths.includes(required)) throw new Error(`route "/${required}" not found in app.routes.ts`);
}

/** Last-changed date of a file: its latest git commit when available (stable across deploys), else its mtime. */
const day = (file) => {
  try {
    const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    // uncommitted edits are newer than the last commit — use the file's own date for those
    if (git(['status', '--porcelain', '--', file])) return fs.statSync(abs(file)).mtime.toISOString().slice(0, 10);
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  } catch { /* no git — fall back to the file's own date */ }
  return fs.statSync(abs(file)).mtime.toISOString().slice(0, 10);
};
const dataDay = [day('src/app/data/products.data.ts'), day('src/app/data/taxonomy.data.ts')].sort().pop();
const pageFile = { '': 'src/app/pages/home', products: 'src/app/pages/products', categories: 'src/app/pages/categories',
  about: 'src/app/pages/about', contact: 'src/app/pages/contact', 'get-a-quote': 'src/app/pages/quote' };
const dirDay = (dir) => fs.readdirSync(abs(dir)).map((f) => day(path.join(dir, f))).sort().pop();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const url = (p) => site + (p ? '/' + p.split('/').map(encodeURIComponent).join('/') : '/');

// Three child sitemaps behind one index at /sitemap.xml, so Search Console reports indexing separately for
// main pages, categories and products (Search Console → Sitemaps → click each one).
const groups = { pages: [], categories: [], products: [] };
for (const p of staticPaths) {
  // home and the listing pages also change whenever the catalogue changes
  const d = pageFile[p] ? dirDay(pageFile[p]) : dataDay;
  groups.pages.push({ loc: url(p), lastmod: ['', 'products', 'categories', 'site-map'].includes(p) ? [d, dataDay].sort().pop() : d });
}
// Category and product pages change when either the catalogue data or their page template changes.
const latest = (...days) => days.sort().pop();
const categoryDay = latest(dataDay, dirDay('src/app/pages/products'), dirDay('src/app/shared/components/pagination'));
const productDay = latest(dataDay, dirDay('src/app/pages/product-detail'), dirDay('src/app/core/utils'));
for (const c of CATEGORIES) groups.categories.push({ loc: url('categories/' + c.slug), lastmod: categoryDay });

let imageCount = 0;
for (const p of PRODUCTS) {
  const images = (p.images ?? [])
    .filter((src) => src.startsWith('/assets/') && fs.existsSync(abs('public' + src)))
    .map((src) => site + src.split('/').map(encodeURIComponent).join('/'));
  imageCount += images.length;
  groups.products.push({ loc: url('products/' + p.slug), lastmod: productDay, images });
}

const entries = Object.values(groups).flat();
const locs = entries.map((e) => e.loc);
if (new Set(locs).size !== locs.length) throw new Error('duplicate URLs in sitemap');
if (Object.values(groups).some((g) => g.length > 50000)) throw new Error('a child sitemap exceeds 50,000 URLs — split it further');

const urlset = (list) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...list.map((e) => [
    '  <url>',
    `    <loc>${esc(e.loc)}</loc>`,
    `    <lastmod>${e.lastmod}</lastmod>`,
    ...(e.images ?? []).map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>`),
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

let bytes = 0;
const children = [];
for (const [name, list] of Object.entries(groups)) {
  const file = `sitemap-${name}.xml`;
  const xml = urlset(list);
  bytes += Buffer.byteLength(xml);
  fs.writeFileSync(abs(`public/${file}`), xml);
  children.push({ loc: `${site}/${file}`, lastmod: list.map((e) => e.lastmod).sort().pop() });
}
const index = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...children.map((c) => `  <sitemap>\n    <loc>${esc(c.loc)}</loc>\n    <lastmod>${c.lastmod}</lastmod>\n  </sitemap>`),
  '</sitemapindex>',
  '',
].join('\n');
fs.writeFileSync(abs('public/sitemap.xml'), index);
fs.writeFileSync(abs('public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`sitemap: ${entries.length} URLs (${groups.pages.length} pages, ${groups.categories.length} categories, ${groups.products.length} products), ` +
  `${imageCount} images, ${(bytes / 1024).toFixed(0)} KB -> public/sitemap.xml (index) + ${children.length} child sitemaps (+ robots.txt) for ${site}`);
