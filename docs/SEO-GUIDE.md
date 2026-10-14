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
| `sitemap.xml` (671 pages + 648 product photos) and `robots.txt`, regenerated on every build | Google finds every product and image |
| Real **404 status** for unknown addresses (`404.html`) | No "soft 404" errors in Search Console |
| Favicon set, Apple touch icon, web manifest | Your logo appears next to the site in Google results and on phones |
| Fonts preloaded, catalogue preloaded, lighter hero animations | Faster pages, which are a ranking factor (Core Web Vitals) |
| Accessibility fixes (labels, heading order, contrast) | Lighthouse: **SEO 100, Accessibility 100, Best Practices 100** on every page tested |

The domain is set in one place: `siteUrl` in `src/app/core/config/company.config.ts` (`https://westernhardwaremart.com`).
If it ever changes, change it there and rebuild. Canonicals, the sitemap, `robots.txt` and the structured data all follow.

## 2. Deploying

* **Vercel** (recommended; `vercel.json` is included): import the GitHub repo. Build command `npm run build` and
  output folder `dist/whm-website/browser` are already set in `vercel.json`.
  * Add the domain under **Project → Settings → Domains**. Add both `westernhardwaremart.com` and
    `www.westernhardwaremart.com`, and set **www to redirect to** `westernhardwaremart.com` (the address used in all canonicals).
* **Netlify / Cloudflare Pages / GitHub Pages:** publish `dist/whm-website/browser`. Do **not** add a
  "redirect everything to index.html" rule; the built `404.html` already handles unknown pages correctly.
* Always deploy with HTTPS (all of the above do it automatically).

## 3. Launch day: tell Google and Bing (about 30 minutes)

1. **Google Search Console** — https://search.google.com/search-console
   * Add a **Domain** property for `westernhardwaremart.com` and verify with the DNS TXT record your domain
     registrar shows you (or use the "HTML tag" method and paste the tag in `src/index.html` where marked).
   * **Sitemaps** → submit `https://westernhardwaremart.com/sitemap.xml`.
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
* **Website:** https://westernhardwaremart.com
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

## 7. Keeping it healthy

* **Adding or changing products:** edit the data, run `npm run build`. The sitemap, product pages and tags update
  automatically. Search Console picks up changes from the sitemap.
* **Check Search Console monthly:** *Pages* (anything not indexed?), *Performance* (which searches find you).
  Use the searches people actually type to improve category descriptions.
* **Prices:** the site deliberately shows none, so products don't use Google's "Product" rich results (Google
  requires a price or reviews for those). If you ever publish prices, ask a developer to add `Product` + `Offer` structured data.
* Keep the address, phone and hours identical on the website, Google Business Profile and listings if anything changes.
