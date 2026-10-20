// Tells Bing (and Yahoo, DuckDuckGo, Yandex, Seznam, Naver — every IndexNow engine) about every page in the
// sitemap, so they crawl new and changed pages within hours. Google does not use IndexNow; for Google, the
// sitemap in Search Console does the same job.
//
// Run AFTER the site is deployed (the key file must be live):  npm run indexnow
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const keyFile = fs.readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file (public/<32 hex>.txt) not found');
const key = fs.readFileSync(path.join(pub, keyFile), 'utf8').trim();

const urls = fs
  .readdirSync(pub)
  .filter((f) => /^sitemap-.+\.xml$/.test(f))
  .flatMap((f) => [...fs.readFileSync(path.join(pub, f), 'utf8').matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
if (!urls.length) throw new Error('no URLs found — run `npm run generate:sitemap` first');
const host = new URL(urls[0]).host;

const keyUrl = `https://${host}/${keyFile}`;
const check = await fetch(keyUrl);
if (!check.ok || (await check.text()).trim() !== key) throw new Error(`key file not live at ${keyUrl} — deploy first`);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: keyUrl, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: submitted ${urls.length} URLs for ${host} → HTTP ${res.status} ${res.status === 200 || res.status === 202 ? '(accepted)' : await res.text()}`);
