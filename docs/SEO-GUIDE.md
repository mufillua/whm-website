# Western Hardware Mart — SEO guide

The website is now built to be found. This guide covers what is already done in the code and the steps that
only you can take outside the code. Those outside steps decide how high the site ranks, especially for
"near me" and Kolkata searches.

**What to expect, honestly**

* **Searches for your name** ("Western Hardware Mart", "Western Hardware Mart Kolkata") should show your
  site first within days to a few weeks of Google indexing it, once the steps below are done.
* **Product and local searches** ("hydraulic ball valve Kolkata", "Taparia tools dealer Kolkata") compete with
  IndiaMART, JustDial and the manufacturers' own sites. Winning these takes months. For local searches, your
  **Google Business Profile and reviews** matter as much as the website itself. Nobody can guarantee position #1.

---

## 1. Already done in the website

| What | Why it matters |
| --- | --- |
| **Every page is prerendered to static HTML** (671 pages: home, catalogue, 25 categories, 640 products, about, contact, quote) | Google, Bing and WhatsApp/LinkedIn previews read the full page instantly, with no waiting for JavaScript |
| Unique, keyword-rich **title and description on every page** (e.g. "Pressure Gauges Supplier in Kolkata") | These are the blue link and the snippet people see in results |
| **Canonical URL** on every page; search/filter views marked `noindex` | No duplicate-content dilution |
| **Structured data** (schema.org): `HardwareStore` with address, phone, email, hours, map and social profiles; `WebSite` (site name); `BreadcrumbList` on every page; `ItemPage` / `CollectionPage` | Helps Google show your business details, site name and breadcrumbs in results |
| Social share tags + a branded **share card** image (`/assets/seo/share-card.jpg`) | Good-looking previews on WhatsApp, Facebook, LinkedIn, X |
| `sitemap.xml` index → `sitemap-pages.xml`, `sitemap-categories.xml`, `sitemap-products.xml` (672 pages + 648 product photos) and `robots.txt`, regenerated on every build | Google finds every product and image; Search Console reports indexing per group |
| **Every page reachable by links within 2 clicks of the home page**: crawlable pagination (`?page=N` links), an A–Z list of all products on each category page, and a `/site-map` page linked from the footer | Google crawls and indexes pages it reaches through links much sooner than sitemap-only pages |
| **Overview paragraph on every product page**, written from the product's own size table, part numbers and specifications (nothing invented); search snippets use it when the catalogue description is short | Thin pages are the main reason Google crawls a page but doesn't index it |
| IndexNow key + `npm run indexnow` | Bing, Yahoo, DuckDuckGo and other IndexNow engines learn about every page within hours |
| Real **404 status** for unknown addresses (`404.html`) | No "soft 404" errors in Search Console |
| Favicon set, Apple touch icon, web manifest | Your logo appears next to the site in Google results and on phones |
| Fonts preloaded, catalogue preloaded, lighter hero animations | Faster pages, which are a ranking factor (Core Web Vitals) |
| Accessibility fixes (labels, heading order, contrast) | Lighthouse: **SEO 100, Accessibility 100, Best Practices 100** on every page tested |

The domain is set in one place: `siteUrl` in `src/app/core/config/company.config.ts` (`https://www.westernhardwaremart.com`).
It must match the address your host actually serves — see section 2.
If it ever changes, change it there and rebuild. Canonicals, the sitemap, `robots.txt` and the structured data all follow.

## 2. Deploying

* **Vercel** (recommended; `vercel.json` is included): import the GitHub repo. Build command `npm run build` and
  output folder `dist/whm-website/browser` are already set in `vercel.json`.
  * **Domains (Project → Settings → Domains):** `www.westernhardwaremart.com` is the main address and
    `westernhardwaremart.com` permanently redirects to it. This is how the site is set up now and what Google has
    already chosen — **leave it this way**. The code's `siteUrl` is `https://www.westernhardwaremart.com` to match.
    If you ever flip the redirect, change `siteUrl` in the same deploy, or every canonical will point at a redirect.
* **Netlify / Cloudflare Pages / GitHub Pages:** publish `dist/whm-website/browser`. Do **not** add a
  "redirect everything to index.html" rule; the built `404.html` already handles unknown pages correctly.
* Always deploy with HTTPS (all of the above do it automatically).

## 3. Launch day: tell Google and Bing (about 30 minutes)

1. **Google Search Console** — https://search.google.com/search-console
   * Add a **Domain** property for `westernhardwaremart.com` and verify with the DNS TXT record your domain
     registrar shows you (or use the "HTML tag" method and paste the tag in `src/index.html` where marked).
   * **Sitemaps** → submit `https://www.westernhardwaremart.com/sitemap.xml`.
   * **URL inspection** → paste the home page URL → **Request indexing**. Repeat for `/products`, `/categories`,
     `/contact` and your 3–5 most important category pages.
2. **Bing Webmaster Tools** — https://www.bing.com/webmasters → "Import from Google Search Console".
   Bing results also feed Yahoo, DuckDuckGo and several AI search tools.
3. Check the structured data at https://search.google.com/test/rich-results for the home page and a product page.
4. Check speed at https://pagespeed.web.dev for the home page and a product page.

## 4. Google Business Profile (the most important step for Kolkata searches)

https://business.google.com — this is what puts you on Google Maps and in the "local pack" (the map box with three shops).

* **Name:** Western Hardware Mart (exactly. Don't add keywords to the name, which breaks Google's rules)
* **Primary category:** *Hydraulic equipment supplier*. **Additional:** *Hardware store*, *Industrial equipment
  supplier*, *Tool store*, *Material handling equipment supplier*.
* **Address, phone, hours:** exactly as on the website — Shop No. 8, Basundra Tower, 22, Netaji Subhas Road,
  Kolkata 700001 · +91 98746 36636 · Mon–Fri 10:00–18:00, Sat 10:00–17:00, Sun closed.
* **Website:** https://www.westernhardwaremart.com
* **Photos:** shop front, counter, stock shelves, the 40 ft container. Real photos outperform stock images.
* **Products:** add your main ranges with a photo each, linking to the matching category page on the website.
* **Posts:** reuse the Instagram posts every week or two.
* **Reviews:** ask every satisfied customer for a Google review (Profile → "Ask for reviews" gives a short link to
  send on WhatsApp). Reply to every review. Number and recency of reviews is a top local ranking factor.

## 5. Same details everywhere (citations)

Search engines trust a business more when its **Name, Address and Phone (NAP)** are identical everywhere.
List or update the business, linking to the website, on:

* Bing Places (https://www.bingplaces.com — can import from Google Business Profile)
* Apple Business Connect (Apple Maps)
* JustDial, IndiaMART, TradeIndia, Sulekha, ExportersIndia
* Instagram and LinkedIn bios → website link (both are already linked from the site's footer and structured data)

Use exactly the same spelling of the name and address each time.

## 6. Links from other websites

Each genuine link from a relevant site raises your authority:

* If you are an authorised dealer/stockist for any brand you carry, ask that brand to list you (with the website
  link) in its dealer locator. **Only where it's true.**
* Trade bodies, local chambers of commerce, market associations (e.g. Netaji Subhas Road / BBD Bag traders).
* Customers and partners who mention suppliers on their sites.

## 7. Getting "Discovered / Crawled – currently not indexed" pages indexed

Nobody can force Google to index a page; Google decides, page by page. What moves the numbers, in order:

1. **One address, used everywhere.** The host redirects `westernhardwaremart.com` → `www.westernhardwaremart.com`,
   and the site's canonicals, sitemaps and structured data now all say `www` too. (Until Oct 2026 they said the
   non-www address, so Google was sent 672 sitemap URLs that all redirected — the main reason most pages were
   "unknown to Google".) Check: `curl -I https://westernhardwaremart.com/` returns `307`/`308` to `https://www.…`.
2. **Deploy this version**, then in Search Console → *Sitemaps*: remove the old `https://westernhardwaremart.com/…`
   sitemap entries and submit `https://www.westernhardwaremart.com/sitemap.xml` (an index of four sitemaps).
3. **Request indexing** (Search Console → *URL inspection* → *Request indexing*) for the home page, `/products`,
   `/categories`, `/brands`, `/site-map`, `/contact`, `/about`, then the pages in the keyword table in section 8. Google allows roughly
   10–12 requests a day — spread them over a few days. Don't request all 640 products; the links and the sitemap cover them.
4. **Run `npm run indexnow`** once after each deploy (Bing and friends).
5. **Build trust signals** (sections 4–6): Google Business Profile with the website link, the same details on listings,
   reviews, and links from other sites. A new domain is crawled slowly until other sites point to it.
6. **Watch progress** in Search Console → *Pages* and → *Sitemaps* (click each child sitemap to see how many of its
   pages are indexed). Expect main pages and categories first (days to a few weeks) and products over 1–3 months.
   Some near-identical variants may stay unindexed — that's Google choosing one representative page, not an error.

Pages listed as **"Alternate page with proper canonical tag"**, **"Page with redirect"** (the non-www and `http://`
addresses) or **"Excluded by noindex"** (search/filter views, 404s) are working as intended — ignore them.

<<<<<<< HEAD
## 8. Keywords: what people search, and which page targets it

Monthly Google searches in India (OpenSEO / DataForSEO, Oct 2026). "… in Kolkata" phrasings get almost no searches —
people type the product name and Google adds local results (your Business Profile) itself. So pages are titled with
the product first; your shop name and Kolkata appear in the snippet and the structured data.

| Search term | Monthly searches | Page that targets it |
| --- | --- | --- |
| pressure gauge | 22,200 | `/categories/pressure-gauges` |
| hand pallet truck (+ "… price" 320) | 6,600 | `/products/lifting-hand-pallet-truck`, `/categories/material-handling` |
| d shackle / bow shackle | 6,600 / 1,900 | `/categories/slings-rigging`, the two Dee shackle product pages |
| needle valve / flow control valve | 4,400 / 4,400 | `/categories/flow-control-valves`, `/categories/instrument-valves-accessories` |
| chain pulley block / electric chain hoist / ratchet lever hoist | 2,900 / 1,000 / 320 | `/categories/hoists-trolleys` |
| directional control valve | 2,400 | `/categories/directional-control-valves` |
| vane pump | 2,400 | `/categories/hydraulic-pumps`, `/brands/yuken` |
| 40 ft container / 40 feet container price / used shipping container | 1,900 / 1,300 / 480 | `/products/marine-container-40ft` |
| polyhydron | 1,600 | `/brands/polyhydron` |
| quick release coupling | 1,600 | `/categories/quick-release-couplings` |
| taparia spanner set / taparia pipe wrench | 1,600 / 720 | `/categories/spanners-wrenches`, `/brands/taparia` |
| webbing sling | 880 | `/categories/slings-rigging` |
| non sparking tools | 720 | `/categories/non-sparking-tools` |
| hydraulic check valve | 590 | `/categories/check-valves` |
| diaphragm seal | 320 | `/categories/diaphragm-seals` |
| high pressure ball valve | 260 | `/categories/hydraulic-ball-valves` |
| yuken valves / hydroline filters / taparia tools dealer / delta pressure gauge | 170 / 170 / 170 / 110 | the brand pages |

The titles and intros live in `src/app/data/category-seo.data.ts` (categories, brands, and product search names such as
"D Shackle"). When you edit them, keep the main search term at the start of the title and only describe products the
catalogue really has. Re-check demand once a quarter in Search Console → *Performance* → *Queries*: queries with many
impressions but position 8–20 are the ones to strengthen next (better intro text, more links from the home page).

### Your own name
For "western hardware mart" Google also shows other businesses with the same name (Chennai, Ahmedabad, and one at
Ganesh Chandra Avenue, Kolkata) through JustDial, IndiaMART and TradeIndia. For "western hardware mart kolkata"
your Google Business Profile is already #1 in the map results. To own your name:
* Claim/update your own JustDial, IndiaMART and TradeIndia listings with the **Netaji Subhas Road** address, phone and
  `https://www.westernhardwaremart.com` — so the directory results that show for your name are yours.
* Keep the Business Profile's name, category, hours and website exactly as on the site; ask customers for reviews.
* Use "Western Hardware Mart, Netaji Subhas Road" on social profiles and in WhatsApp signatures.

## 9. Keeping it healthy
=======
## 8. Keeping it healthy
>>>>>>> 764562bcfbbe7d67a4c93f989f078214fae87692

* **Adding or changing products:** edit the data, run `npm run build`. The sitemap, product pages and tags update
  automatically. Search Console picks up changes from the sitemap.
* **Check Search Console monthly:** *Pages* (anything not indexed?), *Performance* (which searches find you).
  Use the searches people actually type to improve category descriptions.
* **Prices:** the site deliberately shows none, so products don't use Google's "Product" rich results (Google
  requires a price or reviews for those). If you ever publish prices, ask a developer to add `Product` + `Offer` structured data.
* Keep the address, phone and hours identical on the website, Google Business Profile and listings if anything changes.
