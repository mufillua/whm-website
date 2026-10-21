import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { breadcrumbSchema, pageSchema } from '../../core/services/schema';
import { BRAND_SEO } from '../../data/category-seo.data';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** All brands the shop supplies, each linking to its brand page. */
@Component({
  selector: 'whm-brands-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band bg-grid">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" /><span aria-current="page">Brands</span></nav>
        <h1>Brands we supply</h1>
        <p class="lead">Hydraulic valves, pumps, filters and fittings, process instruments and hand tools from {{ cards().length }} established manufacturers — stocked and supplied by Western Hardware Mart, Kolkata.</p>
      </div>
    </section>
    <section class="section surface-mist">
      <div class="container">
        <ul class="grid">
          @for (c of cards(); track c.slug) {
            <li>
              <a class="card" [routerLink]="['/brands', c.slug]">
                <span class="card__logo">@if (c.logo) { <img [src]="c.logo" [alt]="c.name + ' logo'" loading="lazy"> } @else { {{ c.name }} }</span>
                <span class="card__body">
                  <strong>{{ c.heading }}</strong>
                  <span>{{ c.count }} products</span>
                </span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .band { position: relative; isolation: isolate; padding: var(--s-10) 0; border-bottom: 1px solid var(--c-line);
      background: radial-gradient(60% 120% at 100% 0%, rgba(107,87,194,.14), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .band .container { display: grid; gap: var(--s-4); }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); max-width: 64ch; }
    .grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
    .card { display: grid; grid-template-rows: 140px auto; height: 100%; border-radius: var(--r-md); overflow: hidden; text-decoration: none; color: inherit;
      background: var(--bg-card); border: 1px solid var(--c-line); box-shadow: var(--sh-1);
      transition: transform var(--t-med) var(--ease-out), box-shadow var(--t-med), border-color var(--t-med); }
    .card:hover { transform: translateY(-3px); box-shadow: var(--sh-2); border-color: var(--c-line-strong); }
    .card__logo { display: grid; place-items: center; padding: 20px; border-bottom: 1px dashed var(--c-line-strong); font-family: var(--f-display); font-weight: 800; }
    .card__logo img { max-width: 80%; max-height: 80px; width: auto; height: auto; object-fit: contain; }
    .card__body { display: grid; gap: 4px; padding: 16px 18px; }
    .card__body strong { font-size: 1.02rem; color: var(--c-ink); } .card__body span { color: var(--c-muted); font-size: var(--fs-sm); font-weight: 600; }
  `,
})
export class BrandsPage {
  private readonly catalog = inject(CatalogService);
  readonly cards = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this.catalog.products()) if (p.brandSlug) counts.set(p.brandSlug, (counts.get(p.brandSlug) ?? 0) + 1);
    return this.catalog.brands.map((b) => ({ ...b, heading: BRAND_SEO[b.slug]?.heading ?? b.name, count: counts.get(b.slug) ?? 0 }));
  });

  constructor() {
    const description =
      'Brands at Western Hardware Mart, Kolkata: Taparia tools, Yuken and Polyhydron valves and pumps, Hydroline filters, Delta gauges and Asian Hydraulic fittings.';
    inject(SeoService).set({
      title: 'Brands – Taparia, Yuken, Polyhydron, Hydroline, Delta & Asian Hydraulic',
      description,
      path: '/brands',
      jsonLd: [pageSchema('CollectionPage', '/brands', 'Brands', description), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Brands', path: '/brands' }])],
    });
  }
}
