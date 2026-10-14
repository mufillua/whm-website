import { RenderMode, ServerRoute } from '@angular/ssr';
import { CATEGORIES } from './data/taxonomy.data';

/**
 * Every public page is prerendered at build time into its own static HTML file, with its real title,
 * description, canonical URL, structured data and content already in the HTML. Search engines and link
 * previews (WhatsApp, Facebook, LinkedIn) read that HTML directly instead of waiting for JavaScript.
 * The product and category lists come from the same data the app renders, so they can't drift.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { PRODUCTS } = await import('./data/products.data');
      return PRODUCTS.map((p) => ({ slug: p.slug }));
    },
  },
  {
    path: 'categories/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return CATEGORIES.map((c) => ({ slug: c.slug }));
    },
  },
  // Unknown URLs fall back to the client-rendered app, which shows the 404 page with a noindex tag.
  { path: '**', renderMode: RenderMode.Prerender },
];
