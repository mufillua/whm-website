import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'whm-pagination',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Real links (not buttons) so search engines can follow every page of a category; clicks are still handled in-app.
  template: `
    @if (pages() > 1) {
      <nav class="pg" aria-label="Pagination">
<<<<<<< HEAD
        @if (page() > 1) {
          <a class="pg__btn pg__nav" [routerLink]="[]" [queryParams]="qp(page() - 1)" queryParamsHandling="merge" rel="prev"
             (click)="go(page() - 1)" aria-label="Previous page">
            <whm-icon name="chevron-left" [size]="18" /><span>Previous</span>
          </a>
        } @else {
          <span class="pg__btn pg__nav is-disabled" aria-disabled="true"><whm-icon name="chevron-left" [size]="18" /><span>Previous</span></span>
        }
=======
        <button type="button" class="pg__btn pg__nav" [disabled]="page() <= 1" (click)="go(page() - 1)" aria-label="Previous page">
          <whm-icon name="chevron-left" [size]="18" /><span>Previous</span>
        </button>
>>>>>>> d752cd3a10eb927d84f814ad98b0f44f1a7459aa
        <ol class="pg__list">
          @for (it of items(); track $index) {
            <li>
              @if (it === 0) { <span class="pg__gap" aria-hidden="true">…</span> }
              @else if (it === page()) {
                <span class="pg__btn pg__num is-current" aria-current="page" [attr.aria-label]="'Page ' + it">{{ it }}</span>
              } @else {
                <a class="pg__btn pg__num" [routerLink]="[]" [queryParams]="qp(it)" queryParamsHandling="merge"
                   [attr.aria-label]="'Page ' + it" (click)="go(it)">{{ it }}</a>
              }
            </li>
          }
        </ol>
<<<<<<< HEAD
        @if (page() < pages()) {
          <a class="pg__btn pg__nav" [routerLink]="[]" [queryParams]="qp(page() + 1)" queryParamsHandling="merge" rel="next"
             (click)="go(page() + 1)" aria-label="Next page">
            <span>Next</span><whm-icon name="chevron-right" [size]="18" />
          </a>
        } @else {
          <span class="pg__btn pg__nav is-disabled" aria-disabled="true"><span>Next</span><whm-icon name="chevron-right" [size]="18" /></span>
        }
=======
        <button type="button" class="pg__btn pg__nav" [disabled]="page() >= pages()" (click)="go(page() + 1)" aria-label="Next page">
          <span>Next</span><whm-icon name="chevron-right" [size]="18" />
        </button>
>>>>>>> d752cd3a10eb927d84f814ad98b0f44f1a7459aa
      </nav>
    }
  `,
  styles: `
    .pg { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: var(--s-10); }
    .pg__list { list-style: none; display: flex; gap: 6px; padding: 0; margin: 0; flex-wrap: wrap; justify-content: center; }
    .pg__btn { min-width: 42px; height: 42px; padding: 0 12px; border-radius: var(--r-sm); border: 1px solid var(--c-line); background: var(--bg-raised);
      font-weight: 700; color: var(--c-ink-2); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font-variant-numeric: tabular-nums; text-decoration: none; transition: border-color var(--t-fast), background var(--t-fast), color var(--t-fast); }
    .pg__btn:hover:not(.is-disabled):not(.is-current) { border-color: var(--c-primary); color: var(--c-primary); }
    .pg__btn.is-disabled { opacity: .45; cursor: not-allowed; }
    .pg__num.is-current { background: var(--c-primary); border-color: var(--c-primary); color: #fff; }
    .pg__gap { display: inline-flex; width: 24px; justify-content: center; color: var(--c-muted); }
    @media (max-width: 520px) { .pg__nav span { display: none; } .pg__btn { min-width: 38px; height: 40px; padding: 0 8px; } }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly pageChange = output<number>();

  /** Page numbers with 0 meaning an ellipsis: 1 … 4 5 6 … 20 */
  readonly items = computed(() => {
    const total = this.pages(), cur = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= total));
    const sorted = [...set].sort((a, b) => a - b);
    const out: number[] = [];
    sorted.forEach((n, i) => { if (i && n - sorted[i - 1] > 1) out.push(0); out.push(n); });
    return out;
  });

  /** Page 1 has no ?page= so it matches the canonical URL. */
  qp(p: number): Record<string, number | null> {
    return { page: p > 1 ? p : null };
  }

  go(p: number): void {
    if (p >= 1 && p <= this.pages() && p !== this.page()) this.pageChange.emit(p);
  }
}
