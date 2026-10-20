import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, input } from '@angular/core';
import { isPlatformServer } from '@angular/common';

/**
 * Adds `.is-visible` once the element scrolls into view (CSS handles the motion; reduced-motion users see no animation).
 * Nothing happens during prerendering: the content is hidden only when the `js` class is on <html> (set by an inline
 * script in index.html), so the static HTML that search engines and no-JS visitors get is always fully visible.
 */
@Directive({ selector: '[whmReveal]', host: { class: 'reveal' } })
export class RevealDirective implements OnInit, OnDestroy {
  readonly delay = input(0, { alias: 'whmReveal', transform: (v: unknown) => Number(v) || 0 });
  private readonly el = inject(ElementRef<HTMLElement>);
  private io?: IntersectionObserver;

  private readonly server = isPlatformServer(inject(PLATFORM_ID));

  ngOnInit(): void {
    if (this.server) return;
    const node = this.el.nativeElement as HTMLElement;
    if (this.delay()) node.style.transitionDelay = `${this.delay()}ms`;
    if (typeof IntersectionObserver === 'undefined') { node.classList.add('is-visible'); return; }
    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { node.classList.add('is-visible'); this.io?.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    this.io.observe(node);
  }
  ngOnDestroy(): void { this.io?.disconnect(); }
}
