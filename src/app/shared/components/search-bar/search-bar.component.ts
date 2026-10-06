import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'whm-search-bar',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="sb" role="search" (submit)="$event.preventDefault(); submitted.emit(value())">
      <label class="visually-hidden" [attr.for]="id()">{{ label() }}</label>
      <whm-icon name="search" [size]="20" class="sb__icon" />
      <input [id]="id()" class="sb__input" type="search" [placeholder]="placeholder()" autocomplete="off" enterkeyhint="search"
             [value]="value()" (input)="value.set($any($event.target).value)">
      @if (value()) {
        <button type="button" class="sb__clear" (click)="value.set('')" aria-label="Clear search"><whm-icon name="x" [size]="18" /></button>
      }
      @if (showButton()) { <button type="submit" class="btn btn--primary sb__go">Search</button> }
    </form>
  `,
  styles: `
    .sb { position: relative; display: flex; align-items: center; gap: 8px; background: var(--bg-input); border: 1.5px solid var(--c-line);
      border-radius: var(--r-md); padding: 6px 6px 6px 14px; box-shadow: var(--sh-1); transition: border-color var(--t-fast), box-shadow var(--t-fast); }
    .sb:focus-within { border-color: var(--c-accent); box-shadow: 0 0 0 4px rgba(43,141,186,.15); }
    .sb__icon { color: var(--c-primary); }
    .sb__input { flex: 1; min-width: 0; border: 0; outline: none; font: inherit; font-size: 1rem; padding: 10px 4px; background: transparent; color: var(--c-ink); }
    .sb__input::-webkit-search-cancel-button { display: none; }
    .sb__clear { border: 0; background: var(--c-sky-2); color: var(--c-ink-2); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
    .sb__go { min-height: 42px; }
    @media (max-width: 480px) { .sb__go { display: none; } }
  `,
})
export class SearchBarComponent {
  readonly value = model('');
  readonly placeholder = input('Search by product name, model code or category');
  readonly label = input('Search products');
  readonly id = input('product-search');
  readonly showButton = input(false);
  readonly submitted = output<string>();
}
