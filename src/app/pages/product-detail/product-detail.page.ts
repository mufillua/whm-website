import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
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
        this.seo.set({ title: 'Product not found', description: 'This product could not be found in the Western Hardware Mart catalogue.', path: `/products/${this.slug()}` });
        return;
      }
      const desc = [p.shortDescription ?? p.name, p.modelCode ? `Model ${p.modelCode}.` : '', 'Enquire with Western Hardware Mart, Kolkata.'].filter(Boolean).join(' ');
      this.seo.set({ title: p.name + (p.modelCode && !p.name.includes(p.modelCode) ? ` (${p.modelCode})` : ''), description: desc.slice(0, 300), path: `/products/${p.slug}`, image: p.images?.[0] });
    });
  }
}
