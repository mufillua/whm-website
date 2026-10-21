import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { breadcrumbSchema, pageSchema } from '../../core/services/schema';
import { CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { IconComponent } from '../../shared/components/icon/icon.component';

/**
 * Human-readable site map: every page, category and product on one prerendered page, linked from the footer.
 * Gives visitors an A–Z index and gives search engines a direct link to every product page.
 */
@Component({
  selector: 'whm-site-map-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band bg-grid">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" /><span aria-current="page">Site map</span></nav>
        <h1>Site map</h1>
        <p class="lead">Every page on the site: {{ catalog.categories.length }} categories and {{ catalog.products().length }} products, grouped by range.</p>
        <ul class="pages">
          <li><a routerLink="/">Home</a></li>
          <li><a routerLink="/products">All products</a></li>
          <li><a routerLink="/categories">Categories</a></li>
          <li><a routerLink="/brands">Brands</a></li>
          @for (b of catalog.brands; track b.slug) { <li><a [routerLink]="['/brands', b.slug]">{{ b.name }}</a></li> }
          <li><a routerLink="/about">About us</a></li>
          <li><a routerLink="/contact">Contact</a></li>
          <li><a routerLink="/get-a-quote">Get a quote</a></li>
        </ul>
      </div>
    </section>

    @for (g of tree(); track g.id; let even = $even) {
      <section class="section grp" [class.surface-mist]="even" [class.surface-lavender]="!even" [attr.aria-labelledby]="'sm-' + g.id">
        <div class="container">
          <h2 [id]="'sm-' + g.id">{{ g.name }}</h2>
          <div class="cats">
            @for (c of g.categories; track c.slug) {
              <div class="cat">
                <h3><a [routerLink]="['/categories', c.slug]">{{ c.name }}</a> <span>{{ c.products.length }}</span></h3>
                <ul>
                  @for (p of c.products; track p.slug) { <li><a [routerLink]="['/products', p.slug]">{{ p.name }}</a></li> }
                </ul>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .band { position: relative; isolation: isolate; padding: var(--s-10) 0; border-bottom: 1px solid var(--c-line);
      background: radial-gradient(60% 120% at 100% 0%, rgba(107,87,194,.14), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .band .container { display: grid; gap: var(--s-4); }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); max-width: 64ch; }
    .pages { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
    .pages a { display: inline-flex; padding: 9px 14px; border-radius: var(--r-sm); background: var(--bg-raised); border: 1px solid var(--c-line);
      font-weight: 700; font-size: var(--fs-sm); text-decoration: none; color: var(--c-primary-deep); }
    .pages a:hover { border-color: var(--c-primary); }
    h2 { margin-bottom: var(--s-6); padding-bottom: var(--s-3); border-bottom: 2px solid var(--c-line); }
    .cats { columns: 3 300px; column-gap: 40px; }
    .cat { break-inside: avoid; margin-bottom: var(--s-8); }
    .cat h3 { font-size: 1.05rem; margin-bottom: var(--s-2); display: flex; align-items: baseline; gap: 8px; }
    .cat h3 a { color: var(--c-ink); text-decoration: none; } .cat h3 a:hover { color: var(--c-primary); }
    .cat h3 span { font-size: .72rem; font-family: var(--f-body); background: var(--c-lavender); color: var(--c-indigo); border-radius: var(--r-pill); padding: 1px 8px; }
    .cat ul { list-style: none; margin: 0; padding: 0; }
    .cat li { padding: 4px 0; font-size: .88rem; line-height: 1.35; border-bottom: 1px solid var(--c-line); }
    .cat li a { color: var(--c-ink-2); text-decoration: none; } .cat li a:hover { color: var(--c-primary); text-decoration: underline; }
  `,
})
export class SiteMapPage {
  readonly catalog = inject(CatalogService);

  readonly tree = computed(() => {
    const all = this.catalog.products();
    return CATEGORY_GROUPS.map((g) => ({
      id: g.id,
      name: g.name,
      categories: this.catalog.categories
        .filter((c) => c.group === g.id)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          products: all
            .filter((p) => this.catalog.categoryOf(p)?.slug === c.slug)
            .map((p) => ({ slug: p.slug, name: p.name }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        })),
    }));
  });

  constructor() {
    const description =
      'Site map of Western Hardware Mart, Kolkata — every category and product: hydraulic valves, couplings, fittings, pressure gauges, hand tools and lifting equipment.';
    inject(SeoService).set({
      title: 'Site Map',
      description,
      path: '/site-map',
      jsonLd: [
        pageSchema('CollectionPage', '/site-map', 'Site map', description),
        breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Site map', path: '/site-map' }]),
      ],
    });
  }
}
