import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { HydraMascotComponent } from './hydra-mascot.component';
import { HydraPanelComponent } from './hydra-panel.component';

const SEEN = 'whm-hydra-greeted';

/**
 * The floating "Ask Hydra" button. It appears after the page has hydrated (nothing is prerendered, so search engines
 * and the page's first paint are unaffected), and the chat window itself is only downloaded the first time it opens
 * — or when the visitor hovers the button, so it is usually ready by the time they click.
 */
@Component({
  selector: 'whm-hydra',
  imports: [HydraMascotComponent, HydraPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ready()) {
      <div class="dock" [class.dock--lift]="lift()" [class.dock--open]="open()">
        @if (bubble() && !open()) {
          <div class="bubble" role="status">
            <button type="button" class="bubble__text" (click)="toggle()">
              Hi, I'm <strong>Hydra</strong>! Ask me about any product, size or use.
            </button>
            <button type="button" class="bubble__x" aria-label="Dismiss" (click)="dismiss()">×</button>
          </div>
        }
        <button #btn type="button" class="launch" (click)="toggle()" [attr.aria-expanded]="open()" aria-controls="hydra-panel"
                [attr.aria-label]="open() ? 'Close Hydra chat' : 'Chat with Hydra, our product assistant'">
          <span class="launch__face"><whm-hydra-mascot mode="head" [mood]="open() ? 'happy' : 'idle'" /></span>
          <span class="launch__label">{{ open() ? 'Close' : 'Ask Hydra' }}</span>
        </button>
      </div>
      @defer (when everOpened(); prefetch on hover(btn)) {
        <whm-hydra-panel [open]="open()" (closed)="close()" />
      }
    }
  `,
  styleUrl: './hydra-launcher.component.scss',
})
export class HydraLauncherComponent {
  readonly ready = signal(false);
  readonly open = signal(false);
  readonly everOpened = signal(false);
  readonly bubble = signal(false);

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map((e) => e.urlAfterRedirects)),
    { initialValue: this.router.url },
  );
  /** Product pages have a sticky enquiry bar at the bottom on phones — sit above it. */
  readonly lift = computed(() => /^\/products\/[^/?#]+/.test(this.url() ?? ''));

  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN) === '1';
      } catch {
        seen = false;
      }
      if (!seen) {
        setTimeout(() => {
          if (!this.everOpened()) this.bubble.set(true);
        }, 5000);
        setTimeout(() => this.bubble.set(false), 20000);
      }
    });
  }

  toggle() {
    if (this.open()) this.close();
    else {
      this.everOpened.set(true);
      this.open.set(true);
      this.dismiss();
    }
  }

  close() {
    this.open.set(false);
  }

  dismiss() {
    this.bubble.set(false);
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* storage unavailable */
    }
  }
}
