import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService, absUrl } from '../../core/services/seo.service';
import { BUSINESS_ID, breadcrumbSchema } from '../../core/services/schema';
import { BRAND_SEO, BrandSeo } from '../../data/category-seo.data';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

/**
 * One landing page per brand (/brands/:slug) — targets brand searches such as "polyhydron", "yuken valves",
 * "hydroline filters" and "taparia tools dealer". Lists every product of the brand, grouped by category.
 */
@Component({
  selector: 'whm-brand-page',
  imports: [RouterLink, IconComponent, ProductGridComponent, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (brand(); as b) {
      <section class="band bg-grid">
        <div class="container band__inner">
          <div class="band__text">
            <nav class="crumbs" aria-label="Breadcrumb">
              <a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" />
              <a routerLink="/brands">Brands</a><whm-icon name="chevron-right" [size]="14" />
              <span aria-current="page">{{ b.name }}</span>
            </nav>
            <h1>{{ seo()?.heading ?? b.name }}</h1>
            <p class="lead">{{ seo()?.intro }}</p>
            <p class="count"><strong>{{ products().length }}</strong> {{ b.name }} products in {{ groups().length }} {{ groups().length === 1 ? 'category' : 'categories' }}</p>
            <div class="actions">
              <whm-whatsapp-button [label]="'Enquire about ' + b.name" [message]="enquiry()" />
              <a routerLink="/get-a-quote" class="btn btn--ghost">Get a quote</a>
            </div>
          </div>
          @if (b.logo) {
            <div class="logo"><img [src]="b.logo" [alt]="b.name + ' logo'" width="260" height="120"></div>
          }
        </div>
      </section>

      <section class="section surface-mist">
        <div class="container">
          <h2 class="h">{{ b.name }} products by category</h2>
          <ul class="cats">
            @for (g of groups(); track g.slug) {
              <li><a [routerLink]="['/categories', g.slug]">{{ g.name }} <span>{{ g.products.length }}</span></a></li>
            }
          </ul>
          <h2 class="h">Popular {{ b.name }} products</h2>
          <whm-product-grid [products]="featured()" [label]="b.name + ' products'" [eagerCount]="4" />
        </div>
      </section>

      <section class="section surface-lavender">
        <div class="container">
          <h2 class="h">All {{ products().length }} {{ b.name }} products, A–Z</h2>
          <div class="az">
            @for (g of groups(); track g.slug) {
              <div class="az__grp">
                <h3><a [routerLink]="['/categories', g.slug]">{{ g.name }}</a></h3>
                <ul>
                  @for (p of g.products; track p.slug) { <li><a [routerLink]="['/products', p.slug]">{{ p.name }}</a></li> }
                </ul>
              </div>
            }
          </div>
        </div>
      </section>
    } @else {
      <section class="section">
        <div class="container nf">
          <h1>Brand not found</h1>
          <p class="lead">We couldn't find that brand. See all the brands we supply.</p>
          <a routerLink="/brands" class="btn btn--primary">All brands</a>
        </div>
      </section>
    }
  `,
  styles: `
    .band { position: relative; isolation: isolate; padding: var(--s-10) 0; border-bottom: 1px solid var(--c-line);
      background: radial-gradient(60% 120% at 100% 0%, rgba(107,87,194,.14), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .band__inner { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: var(--s-8); align-items: center; }
    .band__text { display: grid; gap: var(--s-4); justify-items: start; }
    .crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); max-width: 64ch; }
    .count { color: var(--c-muted); font-weight: 600; } .count strong { color: var(--c-primary-deep); font-family: var(--f-display); font-size: 1.15rem; }
    .actions { display: flex; flex-wrap: wrap; gap: var(--s-3); }
    .logo { display: grid; place-items: center; min-height: 180px; padding: var(--s-8); border-radius: var(--r-lg); background: var(--bg-card);
      border: 1px solid var(--c-line); box-shadow: var(--sh-2); }
    .logo img { max-width: 100%; max-height: 120px; width: auto; height: auto; object-fit: contain; }
    .h { font-size: var(--fs-xl); margin: 0 0 var(--s-5); }
    .h:not(:first-child) { margin-top: var(--s-10); }
    .cats { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
    .cats a { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: var(--r-sm); background: var(--bg-raised);
      border: 1px solid var(--c-line); font-weight: 700; font-size: var(--fs-sm); text-decoration: none; color: var(--c-primary-deep); }
    .cats a:hover { border-color: var(--c-primary); }
    .cats span { font-size: .72rem; background: var(--c-lavender); color: var(--c-indigo); border-radius: var(--r-pill); padding: 0 7px; }
    .az { columns: 3 300px; column-gap: 40px; }
    .az__grp { break-inside: avoid; margin-bottom: var(--s-8); }
    .az__grp h3 { font-size: 1.02rem; margin-bottom: var(--s-2); } .az__grp h3 a { color: var(--c-ink); text-decoration: none; }
    .az__grp h3 a:hover { color: var(--c-primary); }
    .az__grp ul { list-style: none; margin: 0; padding: 0; }
    .az__grp li { padding: 4px 0; font-size: .88rem; line-height: 1.35; border-bottom: 1px solid var(--c-line); }
    .az__grp li a { color: var(--c-ink-2); text-decoration: none; } .az__grp li a:hover { color: var(--c-primary); text-decoration: underline; }
    .nf { display: grid; gap: var(--s-4); justify-items: start; }
    @media (max-width: 760px) { .band__inner { grid-template-columns: 1fr; } .logo { min-height: 120px; padding: var(--s-5); } }
  `,
})
export class BrandPage {
  /** Bound from the route. */
  readonly slug = input.required<string>();
  private readonly catalog = inject(CatalogService);
  private readonly seoService = inject(SeoService);

  readonly brand = computed(() => this.catalog.brands.find((b) => b.slug === this.slug()));
  readonly seo = computed<BrandSeo | undefined>(() => BRAND_SEO[this.slug()]);
  readonly products = computed(() =>
    this.catalog.products().filter((p) => p.brandSlug === this.slug()).sort((a, b) => a.name.localeCompare(b.name)),
  );
  readonly groups = computed(() => {
    const map = new Map<string, { slug: string; name: string; products: { slug: string; name: string }[] }>();
    for (const p of this.products()) {
      const c = this.catalog.categoryOf(p);
      if (!c) continue;
      if (!map.has(c.slug)) map.set(c.slug, { slug: c.slug, name: c.name, products: [] });
      map.get(c.slug)!.products.push({ slug: p.slug, name: p.name });
    }
    return [...map.values()].sort((a, b) => b.products.length - a.products.length);
  });
  /** Products with a photo hosted on this site first, one per category where possible. */
  readonly featured = computed(() => {
    const withImg = this.products().filter((p) => p.images?.[0]?.startsWith('/assets/'));
    const seen = new Set<string>();
    const picks = withImg.filter((p) => {
      const c = this.catalog.categoryOf(p)?.slug ?? '';
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    });
    for (const p of withImg) if (picks.length < 8 && !picks.includes(p)) picks.push(p);
    return picks.slice(0, 8);
  });
  readonly enquiry = computed(
    () => `Hello Western Hardware Mart,\n\nI am looking for ${this.brand()?.name ?? ''} products. Please share availability and pricing.\n\nThank you.`,
  );

  constructor() {
    effect(() => {
      const b = this.brand();
      const path = `/brands/${this.slug()}`;
      if (!b) {
        this.seoService.set({ title: 'Brand not found', description: 'This brand page does not exist.', path, noindex: true });
        return;
      }
      const seo = this.seo();
      const count = this.products().length;
      const tail = ` ${count ? `${count} ${b.name} products — ` : ''}Western Hardware Mart, Kolkata.`;
      const base = seo?.intro ?? `${b.name} products from Western Hardware Mart, Kolkata.`;
      const room = 158 - tail.length;
      const lead = base.length <= room ? base : base.slice(0, room).replace(/\s+\S*$/, '').replace(/[,;:—–(-]+$/, '') + '…';
      this.seoService.set({
        title: seo?.title ?? `${b.name} Products`,
        description: lead + tail,
        path,
        image: b.logo,
        imageAlt: `${b.name} logo`,
        jsonLd: [
          {
            '@type': 'CollectionPage',
            '@id': absUrl(path) + '#webpage',
            url: absUrl(path),
            name: seo?.heading ?? b.name,
            description: base,
            inLanguage: 'en-IN',
            about: { '@type': 'Brand', name: b.name, ...(b.logo ? { logo: absUrl(b.logo) } : {}) },
            provider: { '@id': BUSINESS_ID },
          },
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Brands', path: '/brands' }, { name: b.name, path }]),
        ],
      });
    });
  }
}
