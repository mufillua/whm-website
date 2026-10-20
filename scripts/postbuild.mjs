// Runs after `ng build` (npm "postbuild"). Static hosts (Vercel, Netlify, GitHub Pages, Cloudflare Pages) serve
// `404.html` with a real 404 status for any address that has no prerendered page. It is the client-rendered app
// shell, so visitors still get the site's own "Page not found" page — while search engines get a true 404
// instead of a "soft 404" that wastes crawl budget.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist/whm-website/browser');
const shell = path.join(out, 'index.csr.html');
if (!fs.existsSync(shell)) throw new Error(`postbuild: ${shell} not found — did the build run with outputMode "static"?`);
fs.copyFileSync(shell, path.join(out, '404.html'));

// Preload the two Latin web fonts so headings paint in the brand font straight away (better LCP, less text shift).
// Their file names carry a content hash, so they are looked up here rather than hard-coded in index.html.
const media = path.join(out, 'media');
const fonts = fs.existsSync(media)
  ? fs.readdirSync(media).filter((f) => /^(archivo-latin-wdth-normal|manrope-latin-wght-normal)-[A-Z0-9]+\.woff2$/.test(f))
  : [];
// The catalogue chunk is needed before the app takes over each page, so start downloading it with the HTML.
const dataChunk = fs.readdirSync(out).find((f) => /^chunk-[A-Z0-9]+\.js$/.test(f) && fs.readFileSync(path.join(out, f), 'utf8').includes('PRODUCT_COUNT'));
const preload =
  fonts.map((f) => `<link rel="preload" href="/media/${f}" as="font" type="font/woff2" crossorigin>`).join('') +
  (dataChunk ? `<link rel="modulepreload" href="/${dataChunk}">` : '');

const pages = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
};
walk(out);
for (const file of [...pages, path.join(out, '404.html'), shell]) {
  const html = fs.readFileSync(file, 'utf8');
  if (!preload || html.includes('rel="preload" href="/media/')) continue;
  fs.writeFileSync(file, html.replace('<meta charset="utf-8">', `<meta charset="utf-8">${preload}`));
}
console.log(`postbuild: ${pages.length} prerendered pages + 404.html in dist/whm-website/browser; preloaded ${fonts.length} fonts${dataChunk ? ' + catalogue chunk' : ''}`);
