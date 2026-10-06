import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { COMPANY } from '../config/company.config';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(opts: { title?: string; description: string; path?: string; image?: string }): void {
    const full = opts.title ? `${opts.title} | ${COMPANY.name}` : `${COMPANY.name} | Hydraulic & Industrial Products`;
    this.title.setTitle(full);
    const url = COMPANY.siteUrl + (opts.path ?? '');
    const image = opts.image?.startsWith('/') ? COMPANY.siteUrl + opts.image : opts.image;
    this.meta.updateTag({ name: 'description', content: opts.description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: opts.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }
}
