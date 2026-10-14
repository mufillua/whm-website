import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { breadcrumbSchema, pageSchema } from '../../core/services/schema';
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
      const name = p.name + (p.modelCode && !p.name.includes(p.modelCode) ? ` (${p.modelCode})` : '');
      const title = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} – ${brand}` : name;
      // Lead with the product's own text, then name the brand/model and the Kolkata supplier — trimmed to snippet length.
      const tail = ` ${[brand, p.modelCode && `model ${p.modelCode}`].filter(Boolean).join(' ')} available from Western Hardware Mart, Kolkata. Enquire for price.`.replace(/^\s+ available/, ' Available');
      const lead = (p.shortDescription ?? `${p.name}${cat ? ` — ${cat.name.toLowerCase()}` : ''}.`).replace(/\s+/g, ' ').trim();
      const room = 158 - tail.length;
      const leadCut = lead.length <= room ? lead : lead.slice(0, room).replace(/\s+\S*$/, '').replace(/[,;:—–-]+$/, '') + '…';
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
