import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { breadcrumbSchema, pageSchema } from '../../core/services/schema';
import { CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'whm-categories-page',
  imports: [RouterLink, CategoryCardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band bg-grid">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" /><span aria-current="page">Categories</span></nav>
        <h1>Product categories</h1>
        <p class="lead">{{ catalog.categories.length }} categories grouped into four ranges. Pick a category to see its products, then narrow down by product type or brand.</p>
        <nav class="jump" aria-label="Jump to range">
          @for (g of groups; track g.id) { <a [href]="'/categories#' + g.id" (click)="jump($event, g.id)">{{ g.name }} <span>{{ inGroup(g.id).length }}</span></a> }
        </nav>
      </div>
    </section>
    @for (g of groups; track g.id; let even = $even) {
      <section class="section grp" [class.surface-lavender]="!even" [class.surface-mist]="even" [id]="g.id" [attr.aria-labelledby]="g.id + '-h'">
        <div class="container">
          <div class="grp__head">
            <h2 [id]="g.id + '-h'">{{ g.name }}</h2>
            <p>{{ groupCount(g.id) }} products in {{ inGroup(g.id).length }} categories</p>
          </div>
          <ul class="grid">
            @for (c of inGroup(g.id); track c.slug) {
              <li><whm-category-card [category]="c" [count]="catalog.categoryCounts().get(c.slug) ?? 0" [image]="catalog.categoryImages().get(c.slug)" /></li>
            }
          </ul>
        </div>
      </section>
    }
  `,
  styles: `
    .band { position: relative; isolation: isolate; padding: var(--s-10) 0 var(--s-10); border-bottom: 1px solid var(--c-line);
      background: radial-gradient(60% 120% at 100% 0%, rgba(107,87,194,.14), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .band .container { display: grid; gap: var(--s-4); }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); max-width: 64ch; }
    .jump { display: flex; flex-wrap: wrap; gap: 10px; margin-top: var(--s-2); }
    .jump a { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: var(--r-sm); background: var(--bg-raised); border: 1px solid var(--c-line);
      font-weight: 700; font-size: var(--fs-sm); text-decoration: none; color: var(--c-primary-deep); transition: border-color var(--t-fast); }
    .jump a:hover { border-color: var(--c-primary); }
    .jump span { font-size: .72rem; background: var(--c-lavender); color: var(--c-indigo); border-radius: var(--r-pill); padding: 0 7px; }
    .grp__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--s-2) var(--s-6); margin-bottom: var(--s-8); padding-bottom: var(--s-4); border-bottom: 2px solid var(--c-line); }
    .grp__head p { color: var(--c-muted); font-weight: 600; font-variant-numeric: tabular-nums; }
    .grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); }
  `,
})
export class CategoriesPage {
  readonly catalog = inject(CatalogService);
  readonly groups = CATEGORY_GROUPS;

  constructor() {
    this.catalog.load();
    const description = `All ${this.catalog.categories.length} product categories at Western Hardware Mart, Kolkata — hydraulic valves and couplings, pressure gauges and instrumentation, hand tools, and lifting & material handling.`;
    inject(SeoService).set({
      title: 'Product Categories',
      description,
      path: '/categories',
      jsonLd: [pageSchema('CollectionPage', '/categories', 'Product Categories', description), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }])],
    });
  }
  inGroup(id: string) { return this.catalog.categories.filter((c) => c.group === id); }
  groupCount(id: string): number { return this.inGroup(id).reduce((n, c) => n + (this.catalog.categoryCounts().get(c.slug) ?? 0), 0); }
  jump(e: Event, id: string): void {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
