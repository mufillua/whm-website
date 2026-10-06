import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../core/models/product.model';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { FacetOption, ProductFiltersComponent } from '../../shared/components/product-filters/product-filters.component';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

export const PAGE_SIZE = 12;
type SortKey = 'relevance' | 'name-asc' | 'name-desc' | 'category';

@Component({
  selector: 'whm-products-page',
  imports: [RouterLink, IconComponent, PaginationComponent, ProductFiltersComponent, ProductGridComponent, SearchBarComponent, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss',
})
export class ProductsPage {
  /** Set when rendered at /categories/:slug — the category is then fixed. */
  readonly slug = input<string>();

  readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly resultsTop = viewChild<ElementRef<HTMLElement>>('resultsTop');

  readonly groups = CATEGORY_GROUPS;
  readonly pageSize = PAGE_SIZE;
  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'relevance', label: 'Best match' },
    { key: 'name-asc', label: 'Name A–Z' },
    { key: 'name-desc', label: 'Name Z–A' },
    { key: 'category', label: 'Category' },
  ];

  private readonly qp = toSignal(this.route.queryParamMap, { requireSync: true });
  readonly sheetOpen = signal(false);

  /** Search box text — kept locally so typing is instant; mirrored to the URL after a short pause. */
  readonly query = signal(this.qp().get('q') ?? '');
  readonly lockedCategory = computed(() => this.slug() ?? '');
  readonly categoryInfo = computed(() => (this.lockedCategory() ? this.catalog.category(this.lockedCategory()) : undefined));
  readonly category = computed(() => this.lockedCategory() || this.qp().get('category') || '');
  readonly type = computed(() => this.qp().get('type') ?? '');
  readonly brands = computed(() => (this.qp().get('brand') ?? '').split(',').filter(Boolean));
  readonly sort = computed<SortKey>(() => (this.qp().get('sort') as SortKey) || 'relevance');
  readonly page = computed(() => Math.max(1, Number(this.qp().get('page')) || 1));

  private readonly index = computed(() => new Map(this.catalog.products().map((p) => [p.id, this.catalog.searchText(p)])));
  private readonly terms = computed(() => this.query().toLowerCase().trim().split(/\s+/).filter(Boolean));

  private matchesQuery(p: Product, idx: Map<string, string>, terms: string[]): boolean {
    if (!terms.length) return true;
    const text = idx.get(p.id) ?? '';
    return terms.every((t) => text.includes(t));
  }
  private catOf = (p: Product) => this.catalog.typeOf(p)?.categorySlug ?? '';

  /** Products matching search + every filter except the one passed in (for facet counts). */
  private base(except: 'category' | 'type' | 'brand' | null): Product[] {
    const idx = this.index(), terms = this.terms(), cat = this.category(), type = this.type(), brands = this.brands();
    return this.catalog.products().filter((p) =>
      this.matchesQuery(p, idx, terms) &&
      (except === 'category' || !cat || this.catOf(p) === cat) &&
      (except === 'type' || !type || p.productType === type) &&
      (except === 'brand' || !brands.length || (p.brandSlug ? brands.includes(p.brandSlug) : false)));
  }

  readonly filtered = computed(() => {
    const list = this.base(null);
    const s = this.sort(), terms = this.terms();
    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'en', { numeric: true });
    const sorted = [...list];
    if (s === 'name-asc') sorted.sort(byName);
    else if (s === 'name-desc') sorted.sort((a, b) => byName(b, a));
    else if (s === 'category') sorted.sort((a, b) => (this.catalog.categoryOf(a)?.name ?? '').localeCompare(this.catalog.categoryOf(b)?.name ?? '') || byName(a, b));
    else if (terms.length) {
      const score = (p: Product) => {
        const n = p.name.toLowerCase(), m = (p.modelCode ?? '').toLowerCase();
        return terms.reduce((acc, t) => acc + (m === t ? 6 : m.includes(t) ? 4 : 0) + (n.startsWith(t) ? 3 : n.includes(t) ? 2 : 0), 0);
      };
      sorted.sort((a, b) => score(b) - score(a));
    }
    return sorted;
  });

  readonly total = computed(() => this.filtered().length);
  readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  readonly currentPage = computed(() => Math.min(this.page(), this.pages()));
  readonly pageItems = computed(() => this.filtered().slice((this.currentPage() - 1) * PAGE_SIZE, this.currentPage() * PAGE_SIZE));
  readonly rangeLabel = computed(() => {
    if (!this.total()) return '0';
    const from = (this.currentPage() - 1) * PAGE_SIZE + 1;
    return `${from}–${Math.min(from + PAGE_SIZE - 1, this.total())}`;
  });
  readonly animKey = computed(() => [this.query(), this.category(), this.type(), this.brands().join(), this.sort(), this.currentPage()].join('|'));

  readonly categoryFacets = computed<FacetOption[]>(() => {
    const counts = new Map<string, number>();
    for (const p of this.base('category')) counts.set(this.catOf(p), (counts.get(this.catOf(p)) ?? 0) + 1);
    return this.catalog.categories.map((c) => ({ slug: c.slug, name: c.name, group: c.group, count: counts.get(c.slug) ?? 0 }));
  });
  readonly typeFacets = computed<FacetOption[]>(() => {
    const cat = this.category();
    if (!cat) return [];
    const counts = new Map<string, number>();
    for (const p of this.base('type')) counts.set(p.productType, (counts.get(p.productType) ?? 0) + 1);
    return this.catalog.typesIn(cat).map((t) => ({ slug: t.slug, name: t.name, count: counts.get(t.slug) ?? 0 }));
  });
  readonly brandFacets = computed<FacetOption[]>(() => {
    const counts = new Map<string, number>();
    for (const p of this.base('brand')) if (p.brandSlug) counts.set(p.brandSlug, (counts.get(p.brandSlug) ?? 0) + 1);
    return this.catalog.brands.map((b) => ({ slug: b.slug, name: b.name, count: counts.get(b.slug) ?? 0 }))
      .filter((b) => b.count > 0 || this.brands().includes(b.slug));
  });

  readonly activeChips = computed(() => {
    const chips: { kind: 'q' | 'category' | 'type' | 'brand'; label: string; value: string }[] = [];
    if (this.query().trim()) chips.push({ kind: 'q', label: `“${this.query().trim()}”`, value: '' });
    if (!this.lockedCategory() && this.category()) chips.push({ kind: 'category', label: this.catalog.category(this.category())?.name ?? this.category(), value: this.category() });
    if (this.type()) chips.push({ kind: 'type', label: this.catalog.productTypes.find((t) => t.slug === this.type())?.name ?? this.type(), value: this.type() });
    for (const b of this.brands()) chips.push({ kind: 'brand', label: this.catalog.brands.find((x) => x.slug === b)?.name ?? b, value: b });
    return chips;
  });

  private qTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.catalog.load();
    // keep the search box in sync when the URL changes from elsewhere (e.g. back button)
    effect(() => {
      const q = this.qp().get('q') ?? '';
      untracked(() => { if (q !== this.query().trim()) this.query.set(q); });
    });
    effect(() => {
      const info = this.categoryInfo();
      const slug = this.lockedCategory();
      if (slug && info) {
        this.seo.set({ title: info.name, description: `${info.name} — ${info.description} Supplied by Western Hardware Mart, Kolkata.`, path: `/categories/${slug}` });
      } else if (slug) {
        this.seo.set({ title: 'Category not found', description: 'This category does not exist.', path: `/categories/${slug}` });
      } else {
        this.seo.set({ title: 'Products', description: 'Browse hydraulic valves, couplings, tube fittings, process instrumentation, hand tools and lifting equipment stocked by Western Hardware Mart, Kolkata.', path: '/products' });
      }
    });
  }

  private update(params: Record<string, string | null>, opts: { replace?: boolean; keepPage?: boolean } = {}): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...params, ...(opts.keepPage ? {} : { page: null }) },
      queryParamsHandling: 'merge',
      replaceUrl: !!opts.replace,
    });
  }

  onQuery(q: string): void {
    this.query.set(q);
    clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => this.update({ q: q.trim() || null }, { replace: true }), 250);
  }
  setCategory(slug: string): void { this.update({ category: slug || null, type: null }); }
  setType(slug: string): void { this.update({ type: slug || null }); }
  setBrands(list: string[]): void { this.update({ brand: list.length ? list.join(',') : null }); }
  setSort(s: string): void { this.update({ sort: s === 'relevance' ? null : s }, { keepPage: false }); }
  setPage(p: number): void {
    this.update({ page: p > 1 ? String(p) : null }, { keepPage: true });
    const el = this.resultsTop()?.nativeElement;
    if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  removeChip(c: { kind: string; value: string }): void {
    if (c.kind === 'q') { this.query.set(''); this.update({ q: null }); }
    else if (c.kind === 'category') this.setCategory('');
    else if (c.kind === 'type') this.setType('');
    else this.setBrands(this.brands().filter((b) => b !== c.value));
  }
  clearAll(): void {
    this.query.set('');
    this.update({ q: null, category: null, type: null, brand: null });
  }
  openSheet(v: boolean): void {
    this.sheetOpen.set(v);
    document.body.style.overflow = v ? 'hidden' : '';
  }
}
