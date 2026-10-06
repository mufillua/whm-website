import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CatalogService } from './core/services/catalog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <whm-navbar />
    <main id="main" tabindex="-1"><router-outlet /></main>
    <whm-footer />
  `,
  styles: `main { display: block; min-height: 60vh; outline: none; }`,
})
export class App {
  constructor() {
    // start fetching the catalogue chunk in the background
    inject(CatalogService).load();
  }
}
