import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'whm-not-found-page',
  imports: [RouterLink, IconComponent, SearchBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nf bg-grid">
      <div class="container nf__inner">
        <p class="nf__code" aria-hidden="true">404</p>
        <h1>Page not found</h1>
        <p class="lead">The page you opened doesn’t exist or has moved. Search the catalogue or go back to the home page.</p>
        <div class="nf__search"><whm-search-bar id="nf-search" [showButton]="true" (submitted)="search($event)" /></div>
        <div class="nf__actions">
          <a routerLink="/" class="btn btn--primary"><whm-icon name="arrow-left" [size]="18" /> Back to home</a>
          <a routerLink="/categories" class="btn btn--ghost">View categories</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf { position: relative; isolation: isolate; padding: clamp(64px, 10vw, 120px) 0; text-align: center;
      background: radial-gradient(60% 80% at 50% 0%, rgba(107,87,194,.16), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .nf__inner { display: grid; justify-items: center; gap: var(--s-4); }
    .nf__code { font-family: var(--f-display); font-stretch: 125%; font-weight: 800; font-size: clamp(5rem, 14vw, 9rem); line-height: 1;
      background: linear-gradient(120deg, var(--c-primary), var(--c-indigo)); -webkit-background-clip: text; background-clip: text; color: transparent; opacity: .9; }
    .lead { color: var(--c-ink-2); font-size: var(--fs-lg); max-width: 52ch; }
    .nf__search { width: 100%; max-width: 560px; margin-top: var(--s-2); }
    .nf__actions { display: flex; flex-wrap: wrap; gap: var(--s-3); justify-content: center; }
  `,
})
export class NotFoundPage {
  private readonly router = inject(Router);
  constructor() {
    inject(SeoService).set({ title: 'Page not found', description: 'The page you are looking for could not be found.' });
  }
  search(q: string): void { this.router.navigate(['/products'], { queryParams: q.trim() ? { q: q.trim() } : {} }); }
}
