import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'whm-product-gallery',
  imports: [ProductImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gal">
      <div class="gal__stage">
        @let src = images()[active()];
        <whm-product-image [src]="src" [alt]="alt() + (images().length > 1 ? ' — image ' + (active() + 1) : '')"
                           [icon]="icon()" [label]="'Image available on request'" [eager]="true" [placeholderSize]="64" />
      </div>
      @if (images().length > 1) {
        <div class="gal__thumbs" role="group" aria-label="Product images">
          @for (img of images(); track img; let i = $index) {
            <button type="button" class="gal__thumb" [class.is-on]="i === active()" (click)="active.set(i)"
                    [attr.aria-label]="'Show image ' + (i + 1)" [attr.aria-pressed]="i === active()">
              <whm-product-image [src]="img" alt="" [icon]="icon()" label="" [placeholderSize]="20" />
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .gal { display: grid; gap: 12px; }
    .gal__stage { position: relative; aspect-ratio: 1 / 1; border-radius: var(--r-lg); border: 1px solid var(--c-line); overflow: hidden;
      background: radial-gradient(circle at 80% 15%, rgba(107,87,194,.12), transparent 40%),
        linear-gradient(rgba(14,102,144,.06) 1px, transparent 1px) 0 0/100% 28px, linear-gradient(90deg, rgba(14,102,144,.06) 1px, transparent 1px) 0 0/28px 100%,
        linear-gradient(160deg, #fbfdfe, var(--c-sky-2)); }
    .gal__stage > whm-product-image { position: absolute; inset: clamp(18px, 4vw, 40px); width: auto; height: auto; }
    .gal__stage ::ng-deep img { mix-blend-mode: multiply; animation: g-in 320ms var(--ease-out); }
    @keyframes g-in { from { opacity: 0; transform: scale(.98); } }
    .gal__thumbs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
    .gal__thumb { flex: 0 0 72px; height: 72px; position: relative; overflow: hidden; padding: 6px; border-radius: var(--r-sm); border: 1.5px solid var(--c-line); background: var(--bg-card); cursor: pointer; transition: border-color var(--t-fast); }
    .gal__thumb ::ng-deep img { mix-blend-mode: multiply; }
    .gal__thumb.is-on, .gal__thumb:hover { border-color: var(--c-primary); }
  `,
})
export class ProductGalleryComponent {
  readonly images = input<string[]>([]);
  readonly alt = input('');
  readonly icon = input('package');
  readonly active = linkedSignal({ source: this.images, computation: () => 0 });
}
