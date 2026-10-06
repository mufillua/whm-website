# Western Hardware Mart — website

Angular 20 catalogue site for Western Hardware Mart (Kolkata). Standalone components, signals, OnPush, lazy routes.
No backend: enquiries go out by WhatsApp (`wa.me`) and email (`mailto:`), pre-filled from the product being viewed.

```bash
npm install
npm start            # dev server on http://localhost:4200
npm run build        # runs the data check first, then builds to dist/whm-website/browser
npm run verify:data  # data-integrity check on its own
```

The build output is plain static files. Deploy `dist/whm-website/browser` to any static host and configure an
SPA fallback (all unknown paths → `index.html`).

## Where things live

| Path | What |
| --- | --- |
| `src/app/core/config/company.config.ts` | Name, phone, WhatsApp, email (whm027@gmail.com), address, hours, partners, site URL, social links |
| `src/app/data/products.data.ts` | All 640 products (generated — see below). Loaded as a separate lazy chunk |
| `src/app/data/taxonomy.data.ts` | The 25 customer-facing categories, the 98 granular product types mapped to them, and the brand list |
| `src/app/core/services/catalog.service.ts` | Loads products, resolves category/type/brand, counts, search text |
| `src/app/core/services/enquiry.service.ts` | Builds WhatsApp and email enquiry messages |
| `src/app/core/services/seo.service.ts` | Per-page title, description, canonical and Open Graph tags |
| `src/app/shared/components/*` | Navbar, footer, product card/grid/gallery/image, filters, search bar, pagination, category card, WhatsApp/email buttons, quote form, section heading, icon, product carousel (home page, after the hero) |
| `src/app/pages/*` | Home, products (also serves `/categories/:slug`), product detail, categories, about, contact, get-a-quote, 404 |
| `public/assets/products/<brand>/` | Product images extracted from the supplied catalogues |
| `public/assets/brands/` | Manufacturer logos (transparent PNGs) used on the home page brand strip |
| `public/assets/brand/` | The supplied logo (background made transparent; shape and colours unchanged) |

## Product data and the category layer

* Every product keeps `id, slug, name, modelCode, brandSlug, categorySlug, specifications, images, catalogueSource`.
  Two fields were added: `productType` (granular type) and optional `features` / `variants` (size tables from the catalogue).
* `categorySlug` is kept exactly as supplied (for the Hydroline/Yuken file) — the site never shows it directly.
  Navigation uses `productType → category` from `taxonomy.data.ts`, which yields exactly 25 categories.
* Lifting-equipment products have **no `brandSlug`**: the supplier's brand is never stored or shown.
* No prices are stored anywhere (the Taparia price list was used for product names, codes and sizes only).
* `catalogueSource` is an internal note and is never rendered. No catalogue PDFs are published on the site.

### Data safety

`scripts/data-baseline.json` records the 640 product ids. `scripts/verify-data.mjs` runs before every build and
**fails the build** if any of those products disappear, the count drops, a product type is unmapped, the category
count leaves 20–25, an image file is missing, or prices / the lifting supplier's name appear in the data.
If you add products intentionally, regenerate the baseline (see `scripts/catalogue-extraction/emit_ts.py`).

### Regenerating from the catalogues

`scripts/catalogue-extraction/` holds the Python used to extract text, tables and images from the supplied PDFs
(PyMuPDF + Pillow). Paths inside point at the original working folders — adjust them before re-running.
`build_data.py` assembles the dataset; `emit_ts.py` writes `products.data.ts` and the baseline.

### Adding a product by hand

The marine container (`marine-container-40ft`) was supplied directly rather than from a catalogue. It is added in
`build_data.py` (so a regeneration keeps it) and lives under *Material Handling & Storage → Containers & storage*
with no manufacturer brand. The home page carousel order is the `CAROUSEL` list in `pages/home/home.page.ts`, and
`FEATURED_PRODUCT_ID` picks the slide shown as "Featured".

### Known gaps

* 8 Yuken products reference image files that were not supplied (`/assets/products/PVR-Series-Double-Vane-Pumps.jpg`
  etc.). They show a designed placeholder until the files are added under `public/assets/products/`.
* Hydroline and Yuken images are hot-linked to the manufacturers' own sites, as in the supplied file.
* `COMPANY.siteUrl` is a placeholder until the domain is confirmed (used for canonical and Open Graph URLs).
