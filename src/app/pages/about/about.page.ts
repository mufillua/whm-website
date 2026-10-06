import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'whm-about-page',
  imports: [RouterLink, IconComponent, RevealDirective, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
})
export class AboutPage {
  readonly company = COMPANY;
  readonly catalog = inject(CatalogService);
  readonly groups = CATEGORY_GROUPS;
  readonly groupIcons: Record<string, string> = { hydraulics: 'cog', instrumentation: 'circle-gauge', tools: 'wrench', lifting: 'anchor' };

  /** How an enquiry is handled — a genuine sequence, hence the numbered steps. */
  readonly steps = [
    { title: 'Tell us what you need', text: 'Share a model code, size, pressure rating, quantity — or a photo of the part you are replacing.' },
    { title: 'We identify the right product', text: 'We match your requirement to the ranges we stock and supply, and suggest alternatives where useful.' },
    { title: 'Availability & pricing', text: 'You receive availability and pricing by WhatsApp, email or phone.' },
    { title: 'Confirm & collect', text: 'Confirm your order with us and collect from our Netaji Subhas Road counter during shop hours or we can deliver it to you.' },
  ];

  readonly sectors = ['Hydraulic systems & power packs', 'Industrial machinery', 'Chemical & petrochemical plants', 'Power generation', 'Process instrumentation',
    'Mobile, construction & agricultural equipment', 'Warehousing & logistics', 'Fabrication & maintenance'];

  constructor() {
    this.catalog.load();
    inject(SeoService).set({ title: 'About Us', description: 'Western Hardware Mart is a Kolkata supplier and stockist of hydraulic, process instrumentation, hand tool and lifting products, run by partners M. Maimoon and H. Lokhandwala.', path: '/about' });
  }
  countIn(group: string): number {
    return this.catalog.categories.filter((c) => c.group === group).reduce((n, c) => n + (this.catalog.categoryCounts().get(c.slug) ?? 0), 0);
  }
  catsIn(group: string) { return this.catalog.categories.filter((c) => c.group === group); }
}
