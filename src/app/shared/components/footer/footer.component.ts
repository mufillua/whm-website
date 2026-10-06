import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../../core/config/company.config';
import { CATEGORIES } from '../../../data/taxonomy.data';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'whm-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer__grid">
        <div class="footer__brand">
          <a routerLink="/" class="footer__logo" aria-label="Western Hardware Mart — home">
            <img src="assets/brand/whm-logo-full.png" alt="Western Hardware Mart" width="220" height="56" loading="lazy">
          </a>
          <p>Supplier and stockist of hydraulic valves, couplings, tube fittings, process instrumentation,
            hand tools and lifting equipment, serving industry from central Kolkata.</p>
          <p class="footer__partners">Partners: {{ company.partners.join(' & ') }}</p>
        </div>

        <div>
          <h2 class="footer__h">Visit or call</h2>
          <address>
            @for (l of company.address.lines; track l) { <span>{{ l }}</span> }
          </address>
          <ul class="footer__contact">
            <li><whm-icon name="phone" [size]="16" /><a [href]="'tel:' + company.phoneE164">{{ company.phoneDisplay }}</a></li>
            <li><whm-icon name="mail" [size]="16" /><a [href]="'mailto:' + company.email">{{ company.email }}</a></li>
            <li><whm-icon name="map-pin" [size]="16" /><a [href]="company.mapsUrl" target="_blank" rel="noopener">Get directions</a></li>
          </ul>
        </div>

        <div>
          <h2 class="footer__h">Shop timings</h2>
          <dl class="footer__hours">
            @for (h of company.hours; track h.days) {
              <div><dt>{{ h.days }}</dt><dd [class.closed]="h.time === 'Closed'">{{ h.time }}</dd></div>
            }
          </dl>
        </div>

        <div class="footer__links">
          <h2 class="footer__h">Quick links</h2>
          <ul>
            <li><a routerLink="/products">Products</a></li>
            <li><a routerLink="/categories">Categories</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact</a></li>
            <li><a routerLink="/get-a-quote">Get A Quote</a></li>
          </ul>
          @if (company.social.length) {
            <ul class="footer__social">
              @for (s of company.social; track s.url) { <li><a [href]="s.url" target="_blank" rel="noopener">{{ s.label }}</a></li> }
            </ul>
          }
        </div>
      </div>

      <div class="container footer__cats">
        @for (c of categories; track c.slug) { <a [routerLink]="['/categories', c.slug]">{{ c.name }}</a> }
      </div>

      <div class="footer__base">
        <div class="container footer__base-inner">
          <span>© {{ year }} {{ company.name }}. All rights reserved. Powered by <a
          href="https://mufaddalmaimoon.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >Mufaddal Maimoon</a></span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer { position: relative; isolation: isolate; color: #c9d6e6; padding-top: var(--s-16);
      background: radial-gradient(120% 90% at 0% 0%, #133b6b 0%, transparent 55%), radial-gradient(90% 80% at 100% 10%, #2a1a6e 0%, transparent 55%), var(--c-footer); }
    .footer::before { content: ''; position: absolute; inset: 0; z-index: -1; opacity: 0.5;
      background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
      background-size: 40px 40px; }
    .footer a { color: #e6eef8; text-decoration: none; } .footer a:hover { color: #fff; text-decoration: underline; }
    .footer__grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 0.8fr; gap: var(--s-10); padding-bottom: var(--s-12); }
    .footer__logo { display: inline-block; background: linear-gradient(160deg, #eef5f9, #e4e0f5); padding: 12px 16px; border-radius: var(--r-md); margin-bottom: var(--s-5); }
    .footer__logo img { height: 46px; width: auto; }
    .footer__brand p { max-width: 38ch; font-size: var(--fs-sm); line-height: 1.7; }
    .footer__partners { margin-top: var(--s-3); color: #9fb3c9; }
    .footer__h { font-family: var(--f-body); font-size: var(--fs-sm); font-weight: 800; color: #fff; margin-bottom: var(--s-4); letter-spacing: 0.01em; }
    address { font-style: normal; display: grid; font-size: var(--fs-sm); line-height: 1.7; margin-bottom: var(--s-4); }
    .footer__contact, .footer__links ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; font-size: var(--fs-sm); }
    .footer__contact li { display: flex; align-items: center; gap: 10px; min-width: 0; } .footer__contact whm-icon { color: #7cc3e3; }
    .footer__contact a { overflow-wrap: anywhere; }
    .footer__hours { margin: 0; display: grid; gap: 10px; font-size: var(--fs-sm); }
    .footer__hours div { display: flex; justify-content: space-between; gap: var(--s-4); border-bottom: 1px dashed rgba(255,255,255,.12); padding-bottom: 8px; }
    .footer__hours dt { color: #9fb3c9; } .footer__hours dd { margin: 0; color: #fff; font-weight: 600; font-variant-numeric: tabular-nums; } .footer__hours dd.closed { color: #f3a6b3; }
    .footer__social { margin-top: var(--s-5) !important; }
    .footer__cats { display: flex; flex-wrap: wrap; gap: 8px 18px; padding-block: var(--s-6); border-top: 1px solid rgba(255,255,255,.1); font-size: 0.8rem; }
    .footer__cats a { color: #9fb3c9; }
    .footer__base { border-top: 1px solid rgba(255,255,255,.1); font-size: 0.8rem; color: #8ea3bb; }
    .footer__base-inner { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 24px; padding-block: var(--s-5); }
    @media (max-width: 960px) { .footer__grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px) { .footer__grid { grid-template-columns: 1fr; gap: var(--s-8); } }
  `,
})
export class FooterComponent {
  readonly company = COMPANY;
  readonly categories = CATEGORIES;
  readonly year = new Date().getFullYear();
}
