import { Injectable, computed, signal } from '@angular/core';
import { Brand, Category, Product, ProductType } from '../models/product.model';
import { BRANDS, CATEGORIES, PRODUCT_TYPES } from '../../data/taxonomy.data';

/**
 * Catalogue access. Product data (~640 items) lives in its own lazily-loaded chunk so the first paint
 * isn't blocked by it; everything else is derived with signals.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly categories: Category[] = CATEGORIES;
  readonly brands: Brand[] = BRANDS;
  readonly productTypes: ProductType[] = PRODUCT_TYPES;

  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();
  readonly loaded = signal(false);
  private loading?: Promise<Product[]>;

  private readonly typeMap = new Map(PRODUCT_TYPES.map((t) => [t.slug, t]));
  private readonly categoryMap = new Map(CATEGORIES.map((c) => [c.slug, c]));
  private readonly brandMap = new Map(BRANDS.map((b) => [b.slug, b]));

  readonly bySlug = computed(() => new Map(this._products().map((p) => [p.slug, p])));

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this._products()) {
      const c = this.categoryOf(p)?.slug;
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return counts;
  });

  /** One representative image per category: hand-picked, else the first product image (local preferred). */
  readonly categoryImages = computed(() => {
    const imgs = new Map<string, string>(CATEGORIES.filter((c) => c.image).map((c) => [c.slug, c.image!]));
    for (const p of this._products()) {
      const c = this.categoryOf(p)?.slug;
      const img = p.images?.find((i) => /^\/assets\/products\/[a-z-]+\//.test(i));
      if (c && img && !imgs.has(c)) imgs.set(c, img);
    }
    return imgs;
  });

  load(): Promise<Product[]> {
    this.loading ??= import('../../data/products.data').then((m) => {
      this._products.set(m.PRODUCTS);
      this.loaded.set(true);
      return m.PRODUCTS;
    });
    return this.loading;
  }

  typeOf(p: Product): ProductType | undefined {
    return this.typeMap.get(p.productType);
  }
  categoryOf(p: Product): Category | undefined {
    const t = this.typeMap.get(p.productType);
    return t ? this.categoryMap.get(t.categorySlug) : undefined;
  }
  category(slug: string): Category | undefined {
    return this.categoryMap.get(slug);
  }
  /** Brand is only returned for brands that may be displayed. */
  brandOf(p: Product): Brand | undefined {
    return p.brandSlug ? this.brandMap.get(p.brandSlug) : undefined;
  }
  typesIn(categorySlug: string): ProductType[] {
    return PRODUCT_TYPES.filter((t) => t.categorySlug === categorySlug);
  }

  searchText(p: Product): string {
    return [p.name, p.modelCode, this.categoryOf(p)?.name, this.typeOf(p)?.name, p.shortDescription, this.brandOf(p)?.name,
      ...(p.variants ?? []).flatMap((v) => v.rows.map((r) => r[0]))]
      .filter(Boolean).join(' ').toLowerCase();
  }
}
