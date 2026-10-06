import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface FacetOption { slug: string; name: string; count: number; group?: string; }

/** Category / product type / brand filters. Used in the desktop sidebar and inside the mobile bottom sheet. */
@Component({
  selector: 'whm-product-filters',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!lockCategory()) {
      <fieldset class="fs">
        <legend>Category</legend>
        <label class="opt" [class.is-on]="!category()">
          <input type="radio" [name]="uid() + '-cat'" [checked]="!category()" (change)="categoryChange.emit('')">
          <span class="opt__name">All categories</span>
        </label>
        @for (g of groups(); track g.id) {
          <p class="fs__group">{{ g.name }}</p>
          @for (c of categoriesIn(g.id); track c.slug) {
            <label class="opt" [class.is-on]="category() === c.slug" [class.is-empty]="!c.count">
              <input type="radio" [name]="uid() + '-cat'" [checked]="category() === c.slug" (change)="categoryChange.emit(c.slug)">
              <span class="opt__name">{{ c.name }}</span><span class="opt__count">{{ c.count }}</span>
            </label>
          }
        }
      </fieldset>
    }

    @if (types().length > 1) {
      <fieldset class="fs">
        <legend>Product type</legend>
        <label class="opt" [class.is-on]="!type()">
          <input type="radio" [name]="uid() + '-type'" [checked]="!type()" (change)="typeChange.emit('')">
          <span class="opt__name">All types</span>
        </label>
        @for (t of types(); track t.slug) {
          <label class="opt" [class.is-on]="type() === t.slug" [class.is-empty]="!t.count">
            <input type="radio" [name]="uid() + '-type'" [checked]="type() === t.slug" (change)="typeChange.emit(t.slug)">
            <span class="opt__name">{{ t.name }}</span><span class="opt__count">{{ t.count }}</span>
          </label>
        }
      </fieldset>
    }

    @if (brands().length > 1) {
      <fieldset class="fs">
        <legend>Brand</legend>
        @for (b of brands(); track b.slug) {
          <label class="opt opt--check" [class.is-on]="brandSel().includes(b.slug)" [class.is-empty]="!b.count">
            <input type="checkbox" [checked]="brandSel().includes(b.slug)" (change)="toggleBrand(b.slug)">
            <span class="box" aria-hidden="true"><whm-icon name="check" [size]="13" [stroke]="3" /></span>
            <span class="opt__name">{{ b.name }}</span><span class="opt__count">{{ b.count }}</span>
          </label>
        }
      </fieldset>
    }
  `,
  styleUrl: './product-filters.component.scss',
})
export class ProductFiltersComponent {
  readonly uid = input('f');
  readonly lockCategory = input(false);
  readonly groups = input<{ id: string; name: string }[]>([]);
  readonly categories = input<FacetOption[]>([]);
  readonly types = input<FacetOption[]>([]);
  readonly brands = input<FacetOption[]>([]);
  readonly category = input('');
  readonly type = input('');
  readonly brandSel = input<string[]>([]);
  readonly categoryChange = output<string>();
  readonly typeChange = output<string>();
  readonly brandsChange = output<string[]>();

  categoriesIn(group: string): FacetOption[] {
    return this.categories().filter((c) => c.group === group);
  }
  toggleBrand(slug: string): void {
    const sel = this.brandSel();
    this.brandsChange.emit(sel.includes(slug) ? sel.filter((s) => s !== slug) : [...sel, slug]);
  }
}
