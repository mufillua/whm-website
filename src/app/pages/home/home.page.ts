import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { CATEGORY_GROUPS } from '../../data/taxonomy.data';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { EmailButtonComponent } from '../../shared/components/email-button/email-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductCarouselComponent } from '../../shared/components/product-carousel/product-carousel.component';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';

const FEATURED = [
  'marine-container-40ft', 'asian-khb2-ball-valve', 'delta-ip-all-ss-industrial-pressure-gauge', 'asian-ahf04-flat-face-coupling', 'polyhydron-4de10',
  'delta-3vm-three-valve-manifold', 'delta-dff-diaphragm-seal-direct-flanged-flush-type', 'lifting-chain-pulley-block-heavy-duty-t',
];

/** Product highlights carousel shown directly after the hero — marine container leads as the featured product. */
const CAROUSEL = [
  'marine-container-40ft', 'asian-kh4-ball-valve', 'delta-mr-maximum-reading-pressure-gauge', 'lifting-hand-pallet-truck',
  'asian-ahf04-flat-face-coupling', 'taparia-2-a-combination-side-cutting-pliers', 'delta-3vm-three-valve-manifold', 'polyhydron-4dp10',
  'lifting-g80-eye-self-locking-hook', 'asian-drv-flow-control', 'taparia-9-a-general-purpose-pipe-wrenches', 'lifting-electric-chain-hoist-dual-speed',
  'delta-tg-fully-ss-thermometer-with-capillary', 'polyhydron-cbs20', 'taparia-10-j-fiberglass-handle-hammer',
];
export const FEATURED_PRODUCT_ID = 'marine-container-40ft';

@Component({
  selector: 'whm-home-page',
  imports: [RouterLink, RevealDirective, CategoryCardComponent, EmailButtonComponent, IconComponent, ProductCarouselComponent, ProductGridComponent, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  readonly company = COMPANY;
  readonly groups = CATEGORY_GROUPS;
  readonly group = signal<string>('all');

  /** Real product photographs used in the hero, each tagged with its actual model code. */
  readonly heroItems = [
    { img: 'assets/products/asian-hydraulic/kh3-standard.jpg', label: 'Ball valve', code: 'KH3', slug: 'asian-kh3-ball-valve' },
    { img: 'assets/products/delta/ip.jpg', label: 'Pressure gauge', code: 'IP', slug: 'delta-ip-all-ss-industrial-pressure-gauge' },
    { img: 'assets/products/asian-hydraulic/ahf04-flat-face.jpg', label: 'Flat face coupling', code: 'AHF04', slug: 'asian-ahf04-flat-face-coupling' },
    { img: 'assets/products/polyhydron/4de10.jpg', label: 'Directional valve', code: '4DE10', slug: 'polyhydron-4de10' },
  ];

  readonly visibleCategories = computed(() =>
    this.catalog.categories.filter((c) => this.group() === 'all' || c.group === this.group()));
  private readonly byId = computed(() => new Map(this.catalog.products().map((p) => [p.id, p])));
  readonly featured = computed(() => FEATURED.map((id) => this.byId().get(id)).filter((p) => !!p));
  readonly carousel = computed(() => CAROUSEL.map((id) => this.byId().get(id)).filter((p) => !!p));
  readonly featuredId = FEATURED_PRODUCT_ID;
  readonly productCount = computed(() => this.catalog.products().length);

  readonly reasons = [
    { icon: 'layers', title: 'One counter, many ranges', text: 'Hydraulic valves, couplings and fittings alongside gauges, seals, hand tools and lifting gear — fewer suppliers to manage.' },
    { icon: 'badge-check', title: 'Established manufacturers', text: 'Ranges from known names such as Yuken, Polyhydron, Hydroline, Delta, Asian Hydraulic and Taparia.' },
    { icon: 'package', title: 'Stockist in central Kolkata', text: 'We work as a supplier and stockist from Netaji Subhas Road — visit the counter, call, or enquire online.' },
    { icon: 'gauge', title: 'Help choosing the right part', text: 'Share a model code, size, pressure rating or an old part and we will help you match it.' },
    { icon: 'message-circle', title: 'Quick replies', text: 'Enquire on WhatsApp, by email or by phone straight from any product page.' },
    { icon: 'factory', title: 'Built for industrial work', text: 'Products rated for high pressure hydraulics, process plants and heavy lifting — specifications on every page.' },
  ];

  /** Applications named in the supplied manufacturer literature. */
  readonly applications = [
    { icon: 'cog', title: 'Hydraulic systems & power packs', text: 'Valves, pumps, couplings, filters and tank accessories.' },
    { icon: 'factory', title: 'Industrial machinery', text: 'Directional and pressure control for presses and machine tools.' },
    { icon: 'flask', title: 'Chemical & petrochemical plants', text: 'SS gauges, diaphragm seals and instrument manifolds.' },
    { icon: 'zap', title: 'Power generation', text: 'Pressure and temperature measurement for thermal and utility plants.' },
    { icon: 'gauge', title: 'Process instrumentation', text: 'Gauges, thermowells, RTDs, thermocouples and accessories.' },
    { icon: 'tractor', title: 'Mobile, construction & agricultural', text: 'ISO A and flat face quick release couplings.' },
    { icon: 'truck', title: 'Warehousing & logistics', text: 'Pallet trucks, stackers, cargo lashing and slings.' },
    { icon: 'construction', title: 'Fabrication & maintenance', text: 'Hand tools, lifting hooks, shackles, clamps and hoists.' },
  ];

  constructor() {
    this.catalog.load();
    inject(SeoService).set({
      description: 'Western Hardware Mart, Kolkata — supplier and stockist of hydraulic valves, couplings, tube fittings, process instrumentation, hand tools and lifting equipment. Enquire on WhatsApp or email.',
      path: '/',
    });
  }

  search(q: string): void {
    this.router.navigate(['/products'], { queryParams: q.trim() ? { q: q.trim() } : {} });
  }
}
