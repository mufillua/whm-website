import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Product image with lazy loading and a designed placeholder when the image is missing or fails to load. */
@Component({
  selector: 'whm-product-image',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="alt()" [attr.loading]="eager() ? 'eager' : 'lazy'" decoding="async"
           [attr.fetchpriority]="eager() ? 'high' : null" (error)="failed.set(true)" referrerpolicy="no-referrer">
    } @else {
      <div class="ph" role="img" [attr.aria-label]="alt() + ' — image not available'">
        <whm-icon [name]="icon()" [size]="placeholderSize()" [stroke]="1.25" />
        <span>{{ label() }}</span>
      </div>
    }
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    img { width: 100%; height: 100%; object-fit: contain; }
    .ph { width: 100%; height: 100%; display: grid; place-content: center; justify-items: center; gap: 10px; text-align: center; padding: 12px;
      color: var(--c-primary); background:
        repeating-linear-gradient(135deg, rgba(14,102,144,.05) 0 1px, transparent 1px 10px), linear-gradient(160deg, var(--c-sky-2), var(--c-lavender)); }
    .ph whm-icon { opacity: .55; }
    .ph span { font-size: .72rem; font-weight: 700; color: var(--c-muted); max-width: 20ch; line-height: 1.3; }
  `,
})
export class ProductImageComponent {
  readonly src = input<string | undefined>();
  readonly alt = input('');
  readonly icon = input('package');
  readonly label = input('Image on request');
  readonly eager = input(false);
  readonly placeholderSize = input(40);
  readonly failed = linkedSignal({ source: this.src, computation: () => false });
}
