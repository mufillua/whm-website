import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import {
  Anchor, ArrowLeft, ArrowRight, ArrowUpDown, Award, BadgeCheck, Bolt, Boxes, Cable, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleDot, CircleGauge, Clock, Cog, Construction, Copy, Cylinder, Disc, Drill,
  ExternalLink, Factory, Flame, FlaskConical, Forklift, Funnel, Gauge, Hammer, Handshake, Hexagon, ImageOff,
  Info, LayoutGrid, Layers, Link, Link2, LucideIconData, Mail, MapPin, Menu, MessageCircle, Navigation, Package,
  PackageSearch, Phone, Pipette, RotateCcw, Scissors, Search, Send, ShieldCheck, SlidersHorizontal, Thermometer,
  Toolbox, Tractor, Truck, Users, Waves, Wrench, X, Zap,
} from 'lucide-angular';

/** Single consistent icon set (Lucide), rendered as inline SVG with no runtime module setup. */
const ICONS: Record<string, LucideIconData> = {
  anchor: Anchor, 'arrow-left': ArrowLeft, 'arrow-right': ArrowRight, 'arrow-up-down': ArrowUpDown, award: Award,
  'badge-check': BadgeCheck, bolt: Bolt, boxes: Boxes, cable: Cable, check: Check, 'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, 'circle-dot': CircleDot, 'circle-gauge': CircleGauge,
  clock: Clock, cog: Cog, construction: Construction, copy: Copy, cylinder: Cylinder, disc: Disc, drill: Drill,
  'external-link': ExternalLink, factory: Factory, flame: Flame, flask: FlaskConical, forklift: Forklift, funnel: Funnel,
  gauge: Gauge, hammer: Hammer, handshake: Handshake, hexagon: Hexagon, 'image-off': ImageOff, info: Info,
  'layout-grid': LayoutGrid, layers: Layers, link: Link, 'link-2': Link2, mail: Mail, 'map-pin': MapPin, menu: Menu,
  'message-circle': MessageCircle, navigation: Navigation, package: Package, 'package-search': PackageSearch,
  phone: Phone, pipette: Pipette, 'rotate-ccw': RotateCcw, scissors: Scissors, search: Search, send: Send,
  'shield-check': ShieldCheck, sliders: SlidersHorizontal, thermometer: Thermometer, toolbox: Toolbox, tractor: Tractor,
  truck: Truck, users: Users, waves: Waves, wrench: Wrench, x: X, zap: Zap,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

@Component({
  selector: 'whm-icon',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'whm-icon', 'aria-hidden': 'true' },
  styles: `:host{display:inline-flex;line-height:0;flex-shrink:0} :host ::ng-deep svg{display:block}`,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly stroke = input(1.75);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly r = inject(Renderer2);

  constructor() {
    effect(() => {
      const el = this.host.nativeElement as HTMLElement;
      el.replaceChildren();
      const data = ICONS[this.name()] ?? ICONS['package'];
      const svg = this.r.createElement('svg', SVG_NS);
      const attrs: Record<string, string | number> = {
        xmlns: SVG_NS, width: this.size(), height: this.size(), viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', 'stroke-width': this.stroke(), 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      };
      for (const [k, v] of Object.entries(attrs)) this.r.setAttribute(svg, k, String(v));
      for (const [tag, a] of data) {
        const child = this.r.createElement(tag, SVG_NS);
        for (const [k, v] of Object.entries(a)) this.r.setAttribute(child, k, String(v));
        this.r.appendChild(svg, child);
      }
      this.r.appendChild(el, svg);
    });
  }
}
