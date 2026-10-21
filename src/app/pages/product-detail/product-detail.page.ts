import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { breadcrumbSchema, pageSchema } from '../../core/services/schema';
import { cleanModel, productFacts, productOverview } from '../../core/utils/product-overview';
<<<<<<< HEAD
import { PRODUCT_SEARCH_NAMES } from '../../data/category-seo.data';
=======
>>>>>>> 764562bcfbbe7d67a4c93f989f078214fae87692
import { EmailButtonComponent } from '../../shared/components/email-button/email-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductGalleryComponent } from '../../shared/components/product-gallery/product-gallery.component';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'whm-product-detail-page',
  imports: [RouterLink, IconComponent, ProductGalleryComponent, ProductGridComponent, WhatsAppButtonComponent, EmailButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage {
  /** Bound from the route — reacts when navigating between products on the same route. */
  readonly slug = input.required<string>();
  readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  readonly company = COMPANY;

  readonly product = computed(() => this.catalog.bySlug().get(this.slug()));
  readonly category = computed(() => (this.product() ? this.catalog.categoryOf(this.product()!) : undefined));
  readonly type = computed(() => (this.product() ? this.catalog.typeOf(this.product()!) : undefined));
  readonly brand = computed(() => (this.product() ? this.catalog.brandOf(this.product()!) : undefined));
  readonly enquiry = computed(() => {
    const p = this.product();
    return p ? { name: p.name, modelCode: p.modelCode, category: this.category()?.name } : undefined;
  });
  /** Overview paragraph written from this product's own tables and specs. */
  readonly overview = computed(() => {
    const p = this.product();
    return p ? productOverview(p, { brand: this.brand()?.name, category: this.category()?.name, type: this.type()?.name, searchName: PRODUCT_SEARCH_NAMES[p.slug] }) : '';
  });
  readonly keySpecs = computed(() => (this.product()?.specifications ?? []).slice(0, 4));
  readonly related = computed(() => {
    const p = this.product();
    if (!p) return [];
    const all = this.catalog.products().filter((x) => x.id !== p.id);
    const sameType = all.filter((x) => x.productType === p.productType);
    const sameCat = all.filter((x) => x.productType !== p.productType && this.catalog.categoryOf(x)?.slug === this.category()?.slug);
    return [...sameType, ...sameCat].slice(0, 4);
  });
  readonly quoteParams = computed(() => {
    const p = this.product();
    return p ? { product: p.name + (p.modelCode ? ` (${p.modelCode})` : '') } : {};
  });

  constructor() {
    this.catalog.load();
    effect(() => {
      const p = this.product();
      if (!this.catalog.loaded()) return;
      if (!p) {
        this.seo.set({ title: 'Product not found', description: 'This product could not be found in the Western Hardware Mart catalogue.', path: `/products/${this.slug()}`, noindex: true });
        return;
      }
      const brand = this.brand()?.name;
      const cat = this.category();
      const model = cleanModel(p);
      const searchName = PRODUCT_SEARCH_NAMES[p.slug];
      const name = p.name + (searchName ? ` – ${searchName}` : '') + (model ? ` (${model})` : '');
      const title = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} – ${brand}` : name;
      // Snippet: "<Brand> <name> (<model>) — <the product's own text, or facts from its tables> Supplied by … Kolkata."
      const own = (p.shortDescription ?? '').replace(/\s+/g, ' ').trim();
      const facts = productFacts(p).join(' ');
      const templated = /sizes \/ variants available\.?$/i.test(own) || own.length < 90;
      const body = templated && facts ? facts : own || facts || `${cat ? cat.name : 'Industrial product'}.`;
      const subject = `${brand && !p.name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ` : ''}${p.name}${model ? ` (${model})` : ''}`;
      const tail = ' Supplied by Western Hardware Mart, Kolkata.';
      const lead = own || body;
      let text = `${subject} — ${body.startsWith(p.name) ? body.slice(p.name.length).replace(/^[\s—–:-]+/, '') : body}`;
      const room = 158 - tail.length;
      if (text.length > room) text = text.slice(0, room).replace(/\s+\S*$/, '').replace(/[,;:—–(-]+$/, '').trim() + '…';
      const leadCut = text;
      const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        ...(cat ? [{ name: cat.name, path: `/categories/${cat.slug}` }] : []),
        { name: p.name, path: `/products/${p.slug}` },
      ];
      this.seo.set({
        title,
        description: leadCut + tail,
        path: `/products/${p.slug}`,
        image: p.images?.[0],
        imageAlt: p.name,
        jsonLd: [pageSchema('ItemPage', `/products/${p.slug}`, title, lead), breadcrumbSchema(crumbs)],
      });
    });
  }
}
