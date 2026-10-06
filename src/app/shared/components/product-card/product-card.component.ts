import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CatalogService } from '../../../core/services/catalog.service';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { IconComponent } from '../icon/icon.component';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'whm-product-card',
  imports: [RouterLink, IconComponent, ProductImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <div class="card__media">
        <whm-product-image [src]="product().images?.[0]" [alt]="product().name" [icon]="category()?.icon ?? 'package'"
                           [label]="category()?.name ?? 'Image on request'" [eager]="eager()" />
        @if (brand(); as b) { <span class="card__brand">{{ b.name }}</span> }
      </div>
      <div class="card__body">
        <p class="card__cat">{{ type()?.name ?? category()?.name }}</p>
        <h3 class="card__title">
          <a [routerLink]="['/products', product().slug]" class="card__link">{{ product().name }}</a>
        </h3>
        @if (product().modelCode) { <span class="nameplate" [title]="product().modelCode"><span>{{ product().modelCode }}</span></span> }
        @if (product().shortDescription) { <p class="card__desc">{{ product().shortDescription }}</p> }
        <div class="card__actions">
          <a [routerLink]="['/products', product().slug]" class="btn btn--primary btn--sm card__btn" tabindex="-1" aria-hidden="true">View Details</a>
          <a class="btn btn--ghost btn--sm card__btn card__enq" [href]="waHref()" target="_blank" rel="noopener"
             [attr.aria-label]="'Enquire about ' + product().name + ' on WhatsApp'">
            <whm-icon name="message-circle" [size]="16" /> Enquire
          </a>
        </div>
      </div>
    </article>
  `,
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly eager = input(false);
  private readonly catalog = inject(CatalogService);
  private readonly enquiry = inject(EnquiryService);
  readonly category = computed(() => this.catalog.categoryOf(this.product()));
  readonly type = computed(() => this.catalog.typeOf(this.product()));
  readonly brand = computed(() => this.catalog.brandOf(this.product()));
  readonly waHref = computed(() => this.enquiry.whatsappUrl(this.enquiry.productWhatsappMessage(this.product())));
}
