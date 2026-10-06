export interface Specification {
  label: string;
  value: string;
}

/** A size / variant table taken from the source catalogue (prices are never stored). */
export interface VariantTable {
  title?: string;
  columns: string[];
  rows: string[][];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  modelCode?: string;
  /** Omitted for products whose supplier brand must not be shown. */
  brandSlug?: string;
  /** Category slug exactly as supplied/sourced (kept for traceability). */
  categorySlug: string;
  /** Granular product type; mapped to one of the customer-facing categories in taxonomy.data.ts. */
  productType: string;
  shortDescription?: string;
  features?: string[];
  specifications?: Specification[];
  variants?: VariantTable[];
  images?: string[];
  /** Internal provenance note — never rendered on the site. */
  catalogueSource?: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  group: CategoryGroup;
  /** Representative image (hand-picked); falls back to the first product image in the category. */
  image?: string;
}

export type CategoryGroup = 'hydraulics' | 'instrumentation' | 'tools' | 'lifting';

export interface ProductType {
  slug: string;
  name: string;
  categorySlug: string;
}

export interface Brand {
  slug: string;
  name: string;
  /** Transparent logo, shown on tinted tiles. */
  logo?: string;
}
