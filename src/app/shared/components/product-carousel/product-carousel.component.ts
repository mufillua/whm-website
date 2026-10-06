import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal, viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CatalogService } from '../../../core/services/catalog.service';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { IconComponent } from '../icon/icon.component';
import { ProductImageComponent } from '../product-image/product-image.component';

/**
 * Horizontal product carousel. Uses native scroll-snap (so touch swipe and trackpads work), prev/next buttons,
 * slide indicators, and a gentle autoplay that pauses on hover, focus, hidden tabs and for reduced-motion users.
 */
@Component({
  selector: 'whm-product-carousel',
  imports: [RouterLink, IconComponent, ProductImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.scss',
  host: { '(mouseenter)': 'hovering.set(true)', '(mouseleave)': 'hovering.set(false)', '(focusin)': 'focused.set(true)', '(focusout)': 'focused.set(false)' },
})
export class ProductCarouselComponent {
  readonly products = input.required<Product[]>();
  readonly label = input('Product highlights');
  /** Product id shown with the "Featured" badge. */
  readonly featuredId = input<string>();
  readonly interval = input(5000);

  private readonly catalog = inject(CatalogService);
  private readonly enquiry = inject(EnquiryService);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  readonly active = signal(0);
  readonly hovering = signal(false);
  readonly focused = signal(false);
  readonly playing = signal(true);
  readonly atStart = signal(true);
  readonly atEnd = signal(false);

  readonly slides = computed(() => this.products().map((p) => ({
    p,
    category: this.catalog.categoryOf(p),
    type: this.catalog.typeOf(p),
    brand: this.catalog.brandOf(p),
    wa: this.enquiry.whatsappUrl(this.enquiry.productWhatsappMessage(p)),
  })));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) this.playing.set(false);
      const timer = setInterval(() => {
        if (!this.playing() || this.hovering() || this.focused() || document.hidden) return;
        this.atEnd() ? this.goTo(0) : this.step(1);
      }, this.interval());
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  private slideEls(): HTMLElement[] {
    return Array.from(this.track()?.nativeElement.children ?? []) as HTMLElement[];
  }

  onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const left = el.scrollLeft;
    const els = this.slideEls();
    let idx = 0;
    els.forEach((s, i) => { if (s.offsetLeft - els[0].offsetLeft <= left + 8) idx = i; });
    this.active.set(idx);
    this.atStart.set(left <= 4);
    this.atEnd.set(left + el.clientWidth >= el.scrollWidth - 4);
  }

  step(dir: 1 | -1): void {
    const el = this.track()?.nativeElement;
    const first = this.slideEls()[0];
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: this.smooth() });
  }

  goTo(i: number): void {
    const el = this.track()?.nativeElement;
    const target = this.slideEls()[i];
    if (!el || !target) return;
    el.scrollTo({ left: target.offsetLeft - this.slideEls()[0].offsetLeft, behavior: this.smooth() });
  }

  toggle(): void { this.playing.update((v) => !v); }

  private smooth(): ScrollBehavior {
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
}
