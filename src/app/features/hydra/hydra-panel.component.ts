import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../core/config/company.config';
import { CatalogService } from '../../core/services/catalog.service';
import { EnquiryService } from '../../core/services/enquiry.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductImageComponent } from '../../shared/components/product-image/product-image.component';
import { HYDRA_KNOWLEDGE } from './data/hydra-knowledge.data';
import { HydraEngine } from './engine/hydra-engine';
import { HydraContext, HydraReply } from './engine/hydra.types';
import { HydraMascotComponent, HydraMood } from './hydra-mascot.component';

interface Message {
  id: number;
  from: 'bot' | 'user';
  text?: string;
  reply?: HydraReply;
}

const STORE = 'whm-hydra-chat-v1';
const WELCOME_CHIPS = ['What do you sell?', 'KHB2 ball valve sizes', 'Where are counterbalance valves used?', '10 x 11 mm spanners', 'Pechkas ka size kya hai?', 'Shop timings'];

/**
 * The Hydra chat window. Loaded only when a visitor first opens Hydra (it carries the engine and everything Hydra
 * learned from the catalogues), so it adds nothing to normal page loads. Answers are computed right here in the
 * browser by HydraEngine — no API calls.
 */
@Component({
  selector: 'whm-hydra-panel',
  imports: [RouterLink, IconComponent, ProductImageComponent, HydraMascotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown.escape)': 'closed.emit()' },
  template: `
    <section id="hydra-panel" class="panel" [class.is-open]="open()" role="dialog" aria-label="Hydra, product assistant" [attr.aria-hidden]="!open()" [attr.inert]="open() ? null : ''">
      <div class="head">
        <span class="head__avatar"><whm-hydra-mascot mode="head" [mood]="mood()" /></span>
        <span class="head__text">
          <strong>Hydra</strong>
          <small><i aria-hidden="true"></i>Online · product assistant</small>
        </span>
        <button type="button" class="icon-btn" (click)="restart()" aria-label="Start a new chat" title="New chat"><whm-icon name="rotate-ccw" [size]="18" /></button>
        <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Close chat" title="Close"><whm-icon name="x" [size]="20" /></button>
      </div>

      <div class="log" #log role="log" aria-live="polite" aria-relevant="additions">
        <div class="welcome">
          <whm-hydra-mascot mode="full" [mood]="greeted() ? 'idle' : 'wave'" class="welcome__mascot" />
          <p class="welcome__hi">Hi, I'm <strong>Hydra</strong>!</p>
          <p class="welcome__sub">I've learned our product catalogues. Ask me about any product — sizes, where it's used, how to use it — in English or Hindi.</p>
        </div>

        @for (m of messages(); track m.id) {
          @if (m.from === 'user') {
            <div class="msg msg--user"><p class="bubble">{{ m.text }}</p></div>
          } @else if (m.reply) {
            <div class="msg msg--bot">
              <span class="msg__avatar"><whm-hydra-mascot mode="head" /></span>
              <div class="bubble">
                @for (b of m.reply.blocks; track $index) {
                  @switch (b.kind) {
                    @case ('text') {
                      <p class="t">@for (s of segments(b.text); track $index) {<span [class.b]="s.b">{{ s.t }}</span>}</p>
                    }
                    @case ('list') {
                      @if (b.title) { <p class="t t--title">{{ b.title }}</p> }
                      <ul class="list">
                        @for (it of b.items; track $index) {
                          <li>@for (s of segments(it); track $index) {<span [class.b]="s.b">{{ s.t }}</span>}</li>
                        }
                      </ul>
                    }
                    @case ('specs') {
                      @if (b.title) { <p class="t t--title">{{ b.title }}</p> }
                      <dl class="specs">
                        @for (r of b.rows; track $index) { <div><dt>{{ r[0] }}</dt><dd>{{ r[1] }}</dd></div> }
                      </dl>
                    }
                    @case ('table') {
                      @if (b.title) { <p class="t t--title">{{ b.title }}</p> }
                      <div class="table" [class.table--wrap]="b.columns.length <= 2" tabindex="0" role="region" aria-label="Sizes">
                        <table>
                          <thead><tr>@for (c of b.columns; track $index) { <th scope="col">{{ c }}</th> }</tr></thead>
                          <tbody>@for (r of b.rows; track $index) { <tr>@for (c of r; track $index) { <td>{{ c }}</td> }</tr> }</tbody>
                        </table>
                      </div>
                      @if (b.note) { <p class="note">{{ b.note }}</p> }
                    }
                    @case ('products') {
                      <ul class="cards">
                        @for (p of b.items; track p.slug) {
                          <li>
                            <a class="card" [routerLink]="['/products', p.slug]" (click)="navigated()">
                              <span class="card__img"><whm-product-image [src]="p.image" [alt]="p.name" [placeholderSize]="22" label="" /></span>
                              <span class="card__body"><strong>{{ p.name }}</strong>@if (p.meta) { <small>{{ p.meta }}</small> }</span>
                              <whm-icon name="chevron-right" [size]="16" />
                            </a>
                          </li>
                        }
                      </ul>
                    }
                    @case ('links') {
                      <p class="links">
                        @for (l of b.items; track l.url) {
                          @if (l.url.startsWith('/')) {
                            <a [routerLink]="l.url" [queryParams]="l.queryParams" (click)="navigated()">{{ l.label }} <whm-icon name="arrow-right" [size]="14" /></a>
                          } @else {
                            <a [href]="l.url" target="_blank" rel="noopener">{{ l.label }} <whm-icon name="external-link" [size]="13" /></a>
                          }
                        }
                      </p>
                    }
                    @case ('contact') {
                      <div class="contact">
                        <a class="cbtn cbtn--wa" [href]="wa(b.message)" target="_blank" rel="noopener">
                          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>
                          {{ b.label ?? 'WhatsApp our team' }}
                        </a>
                        <a class="cbtn cbtn--call" [href]="'tel:' + company.phoneE164"><whm-icon name="phone" [size]="15" /> Call</a>
                      </div>
                    }
                  }
                }
              </div>
            </div>
          }
        }

        @if (typing()) {
          <div class="msg msg--bot" aria-label="Hydra is typing">
            <span class="msg__avatar"><whm-hydra-mascot mode="head" mood="thinking" /></span>
            <div class="bubble bubble--typing"><i></i><i></i><i></i></div>
          </div>
        }
      </div>

      @if (chips().length) {
        <div class="chips" role="group" aria-label="Suggested questions">
          @for (c of chips(); track c) { <button type="button" (click)="send(c)">{{ c }}</button> }
        </div>
      }

      <form class="ask" (submit)="$event.preventDefault(); send(box.value)">
        <label class="visually-hidden" for="hydra-input">Ask Hydra a question</label>
        <input #box id="hydra-input" type="text" autocomplete="off" maxlength="300" enterkeyhint="send"
               placeholder="Ask about a product, size or use…" [value]="draft()" (input)="draft.set(box.value)"
               (keydown.enter)="$event.preventDefault(); send(box.value)" />
        <button type="submit" class="send" [class.is-idle]="!draft().trim() || typing()" aria-label="Send"><whm-icon name="send" [size]="18" /></button>
      </form>
      <p class="foot">Hydra answers from our catalogues. For prices and stock, our team replies on WhatsApp.</p>
    </section>
  `,
  styleUrl: './hydra-panel.component.scss',
})
export class HydraPanelComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  readonly company = COMPANY;
  private readonly catalog = inject(CatalogService);
  private readonly enquiry = inject(EnquiryService);
  private readonly logEl = viewChild<ElementRef<HTMLElement>>('log');
  private readonly boxEl = viewChild<ElementRef<HTMLInputElement>>('box');

  readonly messages = signal<Message[]>([]);
  readonly typing = signal(false);
  readonly draft = signal('');
  readonly greeted = signal(false);
  private readonly happy = signal(false);
  private ctx: HydraContext = { products: [] };
  private engine?: HydraEngine;
  private nextId = 1;

  readonly mood = computed<HydraMood>(() => (this.typing() ? 'thinking' : this.happy() ? 'happy' : 'idle'));
  readonly chips = computed(() => {
    const last = [...this.messages()].reverse().find((m) => m.from === 'bot');
    return this.typing() ? [] : last?.reply?.chips ?? (this.messages().length ? [] : WELCOME_CHIPS);
  });

  constructor() {
    this.restore();
    // keep the latest message in view — for a long answer, show its beginning rather than its end
    effect(() => {
      this.messages();
      this.typing();
      requestAnimationFrame(() => {
        const el = this.logEl()?.nativeElement;
        if (!el) return;
        const msgs = el.querySelectorAll<HTMLElement>('.msg');
        const last = msgs[msgs.length - 1];
        const top = last && last.classList.contains('msg--bot') && last.offsetHeight > el.clientHeight - 60 ? last.offsetTop - 10 : el.scrollHeight;
        el.scrollTo({ top, behavior: 'smooth' });
      });
    });
    effect(() => {
      if (this.open()) {
        setTimeout(() => this.boxEl()?.nativeElement.focus({ preventScroll: true }), 220);
        setTimeout(() => this.greeted.set(true), 2600);
      }
    });
    afterNextRender(() => void this.ready());
  }

  /** Builds the engine once the catalogue is in memory (it usually already is). */
  private async ready(): Promise<HydraEngine> {
    if (this.engine) return this.engine;
    const products = await this.catalog.load();
    this.engine = new HydraEngine({
      products,
      categories: this.catalog.categories,
      types: this.catalog.productTypes,
      brands: this.catalog.brands,
      knowledge: HYDRA_KNOWLEDGE,
    });
    return this.engine;
  }

  async send(raw: string) {
    const text = raw.trim().slice(0, 300);
    if (!text || this.typing()) return;
    this.draft.set('');
    const box = this.boxEl()?.nativeElement;
    if (box) box.value = '';
    this.messages.update((m) => [...m, { id: this.nextId++, from: 'user' as const, text }]);
    this.typing.set(true);
    this.happy.set(false);
    const started = performance.now();
    const engine = await this.ready();
    let reply: HydraReply;
    try {
      reply = engine.answer(text, this.ctx);
    } catch {
      reply = {
        blocks: [{ kind: 'text', text: 'Sorry, something went wrong on my side. Our team can help you straight away:' }, { kind: 'contact', message: `Hello ${COMPANY.name},\n\n${text}\n\nThank you.` }],
        context: this.ctx,
        intent: 'error',
      };
    }
    // a short, natural pause — longer answers "take" a little longer to type
    const words = reply.blocks.reduce((n, b) => n + JSON.stringify(b).length, 0) / 6;
    const wait = Math.min(1100, 380 + words * 2.2) - (performance.now() - started);
    await new Promise((r) => setTimeout(r, Math.max(0, wait)));
    this.ctx = reply.context;
    this.messages.update((m) => [...m, { id: this.nextId++, from: 'bot' as const, reply }].slice(-40));
    this.typing.set(false);
    this.happy.set(true);
    setTimeout(() => this.happy.set(false), 1800);
    this.persist();
  }

  restart() {
    this.messages.set([]);
    this.ctx = { products: [] };
    this.greeted.set(false);
    setTimeout(() => this.greeted.set(true), 2600);
    this.persist();
    this.boxEl()?.nativeElement.focus();
  }

  /** On phones the chat covers the page, so step aside when a link inside it is followed. */
  navigated() {
    if (typeof matchMedia !== 'undefined' && matchMedia('(max-width: 640px)').matches) this.closed.emit();
  }

  wa(message: string) {
    return this.enquiry.whatsappUrl(message);
  }

  /** "**bold** text" -> segments (rendered without innerHTML, so nothing a visitor types can inject markup). */
  segments(text: string): { t: string; b: boolean }[] {
    return text.split(/\*\*(.+?)\*\*/g).map((t, i) => ({ t, b: i % 2 === 1 })).filter((s) => s.t);
  }

  private persist() {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ messages: this.messages().slice(-30), ctx: this.ctx }));
    } catch {
      /* storage unavailable (private mode) — the chat simply isn't remembered */
    }
  }

  private restore() {
    try {
      const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORE) : null;
      if (!raw) return;
      const saved = JSON.parse(raw) as { messages: Message[]; ctx: HydraContext };
      if (Array.isArray(saved.messages)) {
        this.messages.set(saved.messages);
        this.nextId = Math.max(0, ...saved.messages.map((m) => m.id)) + 1;
        this.greeted.set(true);
      }
      if (saved.ctx?.products) this.ctx = saved.ctx;
    } catch {
      /* ignore a damaged or unavailable store */
    }
  }
}

