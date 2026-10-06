// Data-integrity guard — runs before every build (npm run build) and fails it if:
//  * any product from the baseline is missing, or the product count dropped
//  * a product's productType isn't mapped to one of the customer-facing categories
//  * the customer-facing category count leaves the 20–25 range
//  * a local product image file is missing
//  * prices, or the lifting-supplier brand name, appear anywhere in the product data
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = [];

const src = read('src/app/data/products.data.ts');
const json = src.slice(src.indexOf('PRODUCTS: Product[] = ') + 'PRODUCTS: Product[] = '.length).trim().replace(/;\s*$/, '');
const products = JSON.parse(json);
const baseline = JSON.parse(read('scripts/data-baseline.json'));

const ids = new Set(products.map((p) => p.id));
const missing = baseline.ids.filter((id) => !ids.has(id));
if (missing.length) fail.push(`${missing.length} baseline products missing: ${missing.slice(0, 10).join(', ')}`);
if (products.length < baseline.productCount) fail.push(`product count dropped: ${products.length} < ${baseline.productCount}`);
if (ids.size !== products.length) fail.push('duplicate product ids');
const slugs = new Set(products.map((p) => p.slug));
if (slugs.size !== products.length) fail.push('duplicate product slugs');

const tax = read('src/app/data/taxonomy.data.ts');
const categories = [...tax.matchAll(/\{ slug: '([^']+)', name: '[^']+', group:/g)].map((m) => m[1]);
const types = new Map([...tax.matchAll(/t\('([^']+)', '[^']+', '([^']+)'\)/g)].map((m) => [m[1], m[2]]));
if (categories.length < 20 || categories.length > 25) fail.push(`customer-facing categories = ${categories.length} (must be 20–25)`);
for (const [t, c] of types) if (!categories.includes(c)) fail.push(`type ${t} -> unknown category ${c}`);
const unmapped = products.filter((p) => !types.has(p.productType));
if (unmapped.length) fail.push(`unmapped productType: ${unmapped.slice(0, 5).map((p) => p.id + ':' + p.productType).join(', ')}`);
const empty = categories.filter((c) => !products.some((p) => types.get(p.productType) === c));
if (empty.length) fail.push(`empty categories: ${empty.join(', ')}`);

// Image files referenced in the supplied Yuken data but not provided yet — shown as a placeholder.
const KNOWN_MISSING = new Set(['/assets/products/PVR-Series-Double-Vane-Pumps.jpg', '/assets/products/PVM-Series-Double-Vane-Pumps.jpg',
  '/assets/products/yuken-yc00.jpg', '/assets/products/yuken-yc-cartridge-generic.jpg', '/assets/products/yuken-yc20.jpg', '/assets/products/Throttle-Check-Valves1.png']);
const missingImgs = [];
const awaiting = new Set();
for (const p of products) for (const img of p.images ?? []) {
  if (!img.startsWith('/')) continue;
  if (fs.existsSync(path.join(root, 'public', img))) continue;
  if (KNOWN_MISSING.has(img)) awaiting.add(p.id); else missingImgs.push(img);
}
if (missingImgs.length) fail.push(`missing image files: ${missingImgs.slice(0, 5).join(', ')}`);

if (/₹|price each|\bINR\b/i.test(json)) fail.push('price text found in product data');
if (/safelift/i.test(json)) fail.push('lifting supplier brand name found in product data');
if (products.some((p) => p.brandSlug === 'safelift')) fail.push('safelift brandSlug present');

console.log(`products: ${products.length} (baseline ${baseline.productCount}) · categories: ${categories.length} · product types: ${types.size}`);
if (awaiting.size) console.log(`note: ${awaiting.size} products reference images not supplied yet (placeholder shown): ${[...awaiting].join(', ')}`);
if (fail.length) { console.error('DATA CHECK FAILED:\n - ' + fail.join('\n - ')); process.exit(1); }
console.log('data check passed');
