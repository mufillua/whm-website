import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { SeoService } from '../../core/services/seo.service';
import { EmailButtonComponent } from '../../shared/components/email-button/email-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { QuoteFormComponent } from '../../shared/components/quote-form/quote-form.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'whm-contact-page',
  imports: [RouterLink, IconComponent, EmailButtonComponent, WhatsAppButtonComponent, QuoteFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band bg-grid">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><whm-icon name="chevron-right" [size]="14" /><span aria-current="page">Contact</span></nav>
        <h1>Contact us</h1>
        <p class="lead">Call, WhatsApp or email us — or visit the shop on Netaji Subhas Road.</p>
      </div>
    </section>

    <section class="section surface-mist">
      <div class="container ct">
        <div class="ct__info">
          <article class="card">
            <h2 class="card__h"><whm-icon name="map-pin" [size]="20" /> Address</h2>
            <address><strong>{{ c.name }}</strong>@for (l of c.address.lines; track l) { <span>{{ l }}</span> }</address>
            <a class="btn btn--ghost btn--sm" [href]="c.mapsUrl" target="_blank" rel="noopener"><whm-icon name="navigation" [size]="16" /> Get Directions</a>
          </article>

          <article class="card">
            <h2 class="card__h"><whm-icon name="phone" [size]="20" /> Phone & email</h2>
            <ul class="lines">
              <li><span>Phone / WhatsApp</span><a [href]="'tel:' + c.phoneE164">{{ c.phoneDisplay }}</a></li>
              <li><span>Email</span><a [href]="'mailto:' + c.email">{{ c.email }}</a></li>
            </ul>
            <div class="actions">
              <a class="btn btn--primary btn--sm" [href]="'tel:' + c.phoneE164"><whm-icon name="phone" [size]="16" /> Call Now</a>
              <whm-whatsapp-button label="WhatsApp" [small]="true" />
              <whm-email-button label="Email" [small]="true" />
            </div>
          </article>

          <article class="card">
            <h2 class="card__h"><whm-icon name="clock" [size]="20" /> Shop timings</h2>
            <dl class="hours">
              @for (h of c.hours; track h.days) { <div><dt>{{ h.days }}</dt><dd [class.closed]="h.time === 'Closed'">{{ h.time }}</dd></div> }
            </dl>
          </article>
        </div>

        <div class="ct__form">
          <h2>Send an enquiry</h2>
          <p class="muted">Fill in the details and send them by email or WhatsApp.</p>
          <whm-quote-form />
        </div>
      </div>
    </section>
  `,
  styles: `
    .band { position: relative; isolation: isolate; padding: var(--s-10) 0; border-bottom: 1px solid var(--c-line);
      background: radial-gradient(60% 120% at 100% 0%, rgba(107,87,194,.14), transparent 60%), linear-gradient(180deg, var(--c-sky-2), var(--c-mist)); }
    .band .container { display: grid; gap: var(--s-4); }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-muted); }
    .crumbs a { color: var(--c-muted); text-decoration: none; } .crumbs span { color: var(--c-ink); font-weight: 600; }
    .lead { font-size: var(--fs-lg); color: var(--c-ink-2); }
    .ct { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: var(--s-8); align-items: start; }
    .ct__info { display: grid; gap: var(--s-4); }
    .card { background: var(--bg-card); border: 1px solid var(--c-line); border-radius: var(--r-md); padding: var(--s-6); display: grid; gap: var(--s-4); justify-items: start; }
    .card__h { font-size: 1.1rem; display: flex; align-items: center; gap: 10px; } .card__h whm-icon { color: var(--c-indigo); }
    address { font-style: normal; display: grid; line-height: 1.7; }
    .lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; width: 100%; }
    .lines li { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; border-bottom: 1px dashed var(--c-line); padding-bottom: 8px; }
    .lines span { color: var(--c-muted); font-size: var(--fs-sm); } .lines a { font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .hours { margin: 0; display: grid; gap: 10px; width: 100%; }
    .hours div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px dashed var(--c-line); padding-bottom: 8px; }
    .hours dt { color: var(--c-ink-2); } .hours dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; } .hours dd.closed { color: #9d1c33; }
    .ct__form { background: var(--bg-panel); border: 1px solid var(--c-line); border-radius: var(--r-lg); padding: clamp(20px, 3vw, 36px); box-shadow: var(--sh-2); position: relative; overflow: hidden; }
    .ct__form::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 4px; background: linear-gradient(90deg, var(--c-primary), var(--c-indigo)); }
    .ct__form h2 { font-size: var(--fs-2xl); } .muted { color: var(--c-muted); margin: 6px 0 var(--s-6); }
    @media (max-width: 900px) { .ct { grid-template-columns: 1fr; } }
  `,
})
export class ContactPage {
  readonly c = COMPANY;
  constructor() {
    inject(SeoService).set({ title: 'Contact', description: 'Contact Western Hardware Mart — Shop No. 8, Basundra Tower, 22 Netaji Subhas Road, Kolkata 700001. Phone +91 98746 36636, email whm027@gmail.com.', path: '/contact' });
  }
}
