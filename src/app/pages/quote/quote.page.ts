import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { SeoService } from '../../core/services/seo.service';
import { EmailButtonComponent } from '../../shared/components/email-button/email-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { QuoteFormComponent } from '../../shared/components/quote-form/quote-form.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'whm-quote-page',
  imports: [RouterLink, IconComponent, QuoteFormComponent, WhatsAppButtonComponent, EmailButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="q bg-grid">
      <div class="container q__inner">
        <div class="q__side">
          <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" /><span aria-current="page">Get A Quote</span></nav>
          <h1>Get a quote</h1>
          <p class="lead">Tell us the product, size and quantity. We’ll reply with availability and pricing.</p>
          <ul class="tips">
            <li><whm-icon name="check" [size]="16" [stroke]="2.5" /> Include model codes where you have them (e.g. KHB2, 4DE10, SB 20).</li>
            <li><whm-icon name="check" [size]="16" [stroke]="2.5" /> For valves and fittings, mention thread type and pressure rating.</li>
            <li><whm-icon name="check" [size]="16" [stroke]="2.5" /> A photo of the old part helps — send it on WhatsApp.</li>
          </ul>
          <div class="direct">
            <p>Prefer to message directly?</p>
            <div class="direct__btns">
              <whm-whatsapp-button label="WhatsApp" />
              <whm-email-button label="Email" subject="Quote request" />
            </div>
            <a class="direct__phone" [href]="'tel:' + c.phoneE164"><whm-icon name="phone" [size]="16" /> {{ c.phoneDisplay }}</a>
          </div>
        </div>
        <div class="q__form">
          <h2 class="visually-hidden">Quote request form</h2>
          <whm-quote-form [requirement]="product() ?? ''" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .q { position: relative; isolation: isolate; padding: var(--s-10) 0 var(--section-y);
      background: radial-gradient(60% 80% at 100% 0%, rgba(107,87,194,.16), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist) 60%); }
    .q__inner { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(24px, 4vw, 56px); align-items: start; }
    .q__side { display: grid; gap: var(--s-4); position: sticky; top: calc(var(--nav-h) + 24px); }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); }
    .tips { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .tips li { display: grid; grid-template-columns: 22px 1fr; gap: 8px; color: var(--c-ink-2); font-size: .95rem; }
    .tips whm-icon { color: #fff; background: var(--c-indigo); border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; margin-top: 2px; }
    .direct { margin-top: var(--s-4); padding: var(--s-5); border-radius: var(--r-md); background: var(--bg-card); border: 1px solid var(--c-line); display: grid; gap: var(--s-3); }
    .direct p { font-weight: 700; } .direct__btns { display: flex; flex-wrap: wrap; gap: 8px; }
    .direct__phone { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; text-decoration: none; }
    .q__form { background: var(--bg-panel); border: 1px solid var(--c-line); border-radius: var(--r-lg); padding: clamp(20px, 3vw, 40px); box-shadow: var(--sh-3); position: relative; overflow: hidden; }
    .q__form::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 4px; background: linear-gradient(90deg, var(--c-primary), var(--c-indigo)); }
    @media (max-width: 900px) { .q__inner { grid-template-columns: 1fr; } .q__side { position: static; } }
  `,
})
export class QuotePage {
  /** Optional ?product= query param pre-fills the requirement field. */
  readonly product = input<string>();
  readonly c = COMPANY;
  constructor() {
    inject(SeoService).set({ title: 'Get A Quote', description: 'Request a quotation from Western Hardware Mart for hydraulic valves, couplings, fittings, instrumentation, tools and lifting equipment.', path: '/get-a-quote' });
  }
}
