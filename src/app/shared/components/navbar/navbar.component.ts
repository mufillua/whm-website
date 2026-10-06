import { ChangeDetectionStrategy, Component, HostListener, inject, signal, DOCUMENT } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COMPANY } from '../../../core/config/company.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'whm-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly company = COMPANY;
  readonly open = signal(false);
  readonly scrolled = signal(false);
  readonly links = [
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];
  private readonly doc = inject(DOCUMENT);

  constructor() {
    inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.setOpen(false));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set((this.doc.defaultView?.scrollY ?? 0) > 8);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.setOpen(false);
  }

  setOpen(v: boolean): void {
    this.open.set(v);
    this.doc.body.style.overflow = v ? 'hidden' : '';
  }
}
