import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/product.model';
import { IconComponent } from '../icon/icon.component';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'whm-category-card',
  imports: [RouterLink, IconComponent, ProductImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="cc" [routerLink]="['/categories', category().slug]">
      <div class="cc__media">
        <whm-product-image [src]="image()" [alt]="''" [icon]="category().icon" [label]="''" [placeholderSize]="34" />
      </div>
      <div class="cc__body">
        <span class="cc__icon"><whm-icon [name]="category().icon" [size]="18" /></span>
        <h3 class="cc__name">{{ category().name }}</h3>
        @if (!compact()) { <p class="cc__desc">{{ category().description }}</p> }
        <span class="cc__foot">
          <span class="cc__count">{{ count() }} {{ count() === 1 ? 'product' : 'products' }}</span>
          <whm-icon name="arrow-right" [size]="18" class="cc__arrow" />
        </span>
      </div>
    </a>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .cc { height: 100%; display: grid; grid-template-rows: auto 1fr; text-decoration: none; color: inherit; background: var(--bg-card);
      border: 1px solid var(--c-line); border-radius: var(--r-md); overflow: hidden; position: relative;
      transition: transform var(--t-med) var(--ease-out), box-shadow var(--t-med), border-color var(--t-med); }
    .cc:hover { transform: translateY(-4px); box-shadow: var(--sh-3); border-color: var(--c-line-strong); }
    .cc__media { aspect-ratio: 16 / 9; position: relative; overflow: hidden;
      background: radial-gradient(circle at 85% 20%, rgba(107,87,194,.14), transparent 45%), linear-gradient(160deg, #f6fafd, var(--c-sky-2)); }
    .cc__media > whm-product-image { position: absolute; inset: 12px 16px; width: auto; height: auto; }
    .cc__media::after { content: ''; position: absolute; inset: auto 0 0 0; height: 3px; background: linear-gradient(90deg, var(--c-primary), var(--c-indigo)); transform: scaleX(0); transform-origin: left; transition: transform var(--t-med) var(--ease-out); }
    .cc:hover .cc__media::after { transform: scaleX(1); }
    .cc__media ::ng-deep img { mix-blend-mode: multiply; transition: transform var(--t-slow) var(--ease-out); }
    .cc:hover .cc__media ::ng-deep img { transform: scale(1.06) rotate(-1deg); }
    .cc__body { padding: 16px 18px 16px; display: flex; flex-direction: column; gap: 8px; position: relative; }
    .cc__icon { position: absolute; top: -20px; right: 16px; width: 40px; height: 40px; border-radius: var(--r-sm); display: grid; place-items: center;
      background: var(--bg-raised); color: var(--c-indigo); border: 1px solid var(--c-line); box-shadow: var(--sh-1); transition: background var(--t-med), color var(--t-med); }
    .cc:hover .cc__icon { background: var(--c-indigo); color: #fff; border-color: var(--c-indigo); }
    .cc__name { font-size: 1.05rem; padding-right: 36px; }
    .cc__desc { font-size: .86rem; color: var(--c-muted); line-height: 1.55; }
    .cc__foot { margin-top: auto; padding-top: 6px; display: flex; align-items: center; justify-content: space-between; }
    .cc__count { font-size: .8rem; font-weight: 700; color: var(--c-primary); font-variant-numeric: tabular-nums; }
    .cc__arrow { color: var(--c-primary); transition: transform var(--t-fast) var(--ease); }
    .cc:hover .cc__arrow { transform: translateX(4px); }
  `,
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
  readonly count = input(0);
  readonly image = input<string | undefined>();
  readonly compact = input(false);
}
