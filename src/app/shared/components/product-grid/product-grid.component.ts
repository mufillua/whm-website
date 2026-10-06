import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'whm-product-grid',
  imports: [ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid" [class.grid--wide]="wide()" [attr.aria-label]="label()">
      @for (p of products(); track p.id; let i = $index) {
        <li [style.--d]="i" [attr.data-key]="animKey()"><whm-product-card [product]="p" [eager]="i < eagerCount()" /></li>
      }
    </ul>
  `,
  styles: `
    .grid { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(12px, 1.8vw, 20px);
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); }
    .grid--wide { grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); }
    li { min-width: 0; animation: card-in 420ms var(--ease-out) both; animation-delay: calc(var(--d) * 35ms); }
    @keyframes card-in { from { opacity: 0; transform: translateY(10px); } }
    @media (max-width: 520px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }
    @media (max-width: 340px) { .grid { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class ProductGridComponent {
  readonly products = input.required<Product[]>();
  readonly label = input('Products');
  readonly eagerCount = input(0);
  readonly wide = input(false);
  /** Changing this key re-triggers the entrance animation (e.g. on search/filter changes). */
  readonly animKey = input('');
}
