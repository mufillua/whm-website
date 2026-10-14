import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { COMPANY } from '../config/company.config';

export interface SeoOptions {
  /** Page title; the brand suffix is added automatically. */
  title?: string;
  /** Use exactly this as the <title> (no suffix) — for the home page. */
  fullTitle?: string;
  description: string;
  /** Path of this page's canonical URL, e.g. `/products/asian-khb2-ball-valve`. */
  path?: string;
  /** Share image — a site path (`/assets/...`) or an absolute URL. Defaults to the brand share card. */
  image?: string;
  imageAlt?: string;
  /** Keep the page out of search results (404s, filtered/search views). Links are still followed. */
  noindex?: boolean;
  /** Structured data (schema.org JSON-LD) for this page. */
  jsonLd?: object[];
}

const SITE = COMPANY.siteUrl.replace(/\/+$/, '');
const DEFAULT_IMAGE = '/assets/seo/share-card.jpg';
const MAX_DESC = 160;
const MAX_TITLE = 70;

/** Absolute URL for a site path or an already-absolute URL. */
export const absUrl = (pathOrUrl: string): string =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : SITE + (pathOrUrl.startsWith('/') ? '' : '/') + pathOrUrl;

/**
 * Adds the shop name to a page title, as much of it as fits the ~70 characters Google shows:
 * "Title | Western Hardware Mart, Kolkata" → "Title | Western Hardware Mart" → "Title".
 */
function withBrand(title: string): string {
  const options = [
    ...(/kolkata/i.test(title) ? [] : [`${title} | ${COMPANY.name}, Kolkata`]),
    `${title} | ${COMPANY.name}`,
  ];
  return options.find((t) => t.length <= MAX_TITLE) ?? title;
}

/** Trims text to a search-snippet length on a word boundary. */
export function clampDescription(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '') + '…';
}

/**
 * Sets everything search engines and link previews read for a page: <title>, meta description, robots,
 * canonical link, Open Graph + Twitter tags and JSON-LD. Works identically during prerendering (the tags
 * are written into each page's static HTML) and in the browser when navigating between pages.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(opts: SeoOptions): void {
    const full = opts.fullTitle ?? (opts.title ? withBrand(opts.title) : `${COMPANY.name}, Kolkata`);
    const description = clampDescription(opts.description);
    const url = absUrl(opts.path ?? '/');
    const image = absUrl(opts.image || DEFAULT_IMAGE);
    const imageAlt = opts.imageAlt ?? (opts.image ? full : `${COMPANY.name} — ${COMPANY.tagline}`);

    this.title.setTitle(full);
    this.tag('name', 'description', description);
    this.tag('name', 'robots', opts.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');

    this.tag('property', 'og:site_name', COMPANY.name);
    this.tag('property', 'og:locale', 'en_IN');
    this.tag('property', 'og:type', 'website');
    this.tag('property', 'og:title', full);
    this.tag('property', 'og:description', description);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:image:alt', imageAlt);
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', full);
    this.tag('name', 'twitter:description', description);
    this.tag('name', 'twitter:image', image);

    this.link('canonical', url);
    this.setJsonLd(opts.jsonLd ?? []);
  }

  private tag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private link(rel: string, href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  /** One JSON-LD block per page, replaced on every navigation. */
  private setJsonLd(items: object[]): void {
    const existing = this.doc.head.querySelector('script[data-seo-jsonld]');
    if (!items.length) {
      existing?.remove();
      return;
    }
    const script = existing ?? this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', '');
    const data = { '@context': 'https://schema.org', '@graph': items };
    // `<` is escaped so product text can never close the script tag early.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    if (!existing) this.doc.head.appendChild(script);
  }
}
