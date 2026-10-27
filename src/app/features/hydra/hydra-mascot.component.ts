import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type HydraMood = 'idle' | 'thinking' | 'happy' | 'wave';

/**
 * Hydra, the Western Hardware Mart product assistant — an original vector character (no image file), so it stays
 * crisp at any size and can animate. Hydraulic touches: pressure-gauge dials for ears and an oil-drop antenna;
 * the WHM mark on the chest. Flat fills only (no url(#…) gradients), so it renders the same on every route even
 * with <base href>.
 *
 *   <whm-hydra-mascot mode="head" mood="thinking" />
 */
@Component({
  selector: 'whm-hydra-mascot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"hy hy--" + mood() + " hy--" + mode()', 'aria-hidden': 'true' },
  template: `
    <svg [attr.viewBox]="mode() === 'head' ? '14 -2 172 152' : '0 -2 200 232'" xmlns="http://www.w3.org/2000/svg" focusable="false">

      <g class="hy-float">
        <!-- body (full mode only) -->
        @if (mode() === 'full') {
          <g class="hy-arm hy-arm--l">
            <rect x="34" y="160" width="17" height="42" rx="8.5" fill="#1c7fa8" transform="rotate(16 42 164)" />
            <circle cx="35" cy="202" r="9" fill="#f4f8fb" stroke="#c3d6e4" stroke-width="1.5" />
          </g>
          <g class="hy-arm hy-arm--r">
            <rect x="149" y="160" width="17" height="42" rx="8.5" fill="#1c7fa8" transform="rotate(-16 158 164)" />
            <circle cx="165" cy="202" r="9" fill="#f4f8fb" stroke="#c3d6e4" stroke-width="1.5" />
          </g>
          <rect x="86" y="140" width="28" height="14" rx="5" fill="#0b4a6b" />
          <path d="M52 178c0-16 12-26 28-26h40c16 0 28 10 28 26v18c0 20-20 30-48 30s-48-10-48-30z" fill="#cfdde9" />
          <path d="M52 176c0-16 12-24 28-24h40c16 0 28 8 28 24v18c0 19-20 28-48 28s-48-9-48-28z" fill="#f4f8fb" stroke="#c3d6e4" stroke-width="1.2" />
          <path d="M58 166c4-8 12-12 22-13h40c10 1 18 5 22 13" fill="none" stroke="#1c7fa8" stroke-width="5" stroke-linecap="round" opacity="0.9" />
          <!-- chest badge with the WHM mark -->
          <circle cx="100" cy="190" r="20" fill="#f7fbfd" stroke="#d3e2ec" stroke-width="1.5" />
          <g transform="translate(87.5 179) scale(0.0695)">
            <polygon points="0,158 115,12 180,98 243,12 358,158" fill="#0e78a8" />
            <polygon points="0,175 358,175 243,324 180,238 115,324" fill="#3a2391" />
            <rect x="84" y="95" width="52" height="145" fill="#f7fbfd" />
            <rect x="224" y="95" width="52" height="145" fill="#f7fbfd" />
            <rect x="84" y="143" width="192" height="48" fill="#f7fbfd" />
          </g>
        }

        <!-- antenna with an oil drop -->
        <g class="hy-antenna">
          <path d="M100 40c0-10 3-17 8-22" fill="none" stroke="#0b4a6b" stroke-width="4" stroke-linecap="round" />
          <path class="hy-drop" d="M109 0c5 7 10 12 10 18a10 10 0 0 1-20 0c0-6 5-11 10-18z" fill="#35bde6" stroke="#0e6690" stroke-width="1.2" />
          <ellipse cx="105.5" cy="16" rx="2.6" ry="3.6" fill="#ffffff" opacity="0.85" />
        </g>

        <!-- head -->
        <rect x="30" y="38" width="140" height="106" rx="46" fill="#cfdde9" />
        <rect x="30" y="38" width="140" height="101" rx="45" fill="#f4f8fb" stroke="#c3d6e4" stroke-width="1.2" />
        <ellipse cx="70" cy="54" rx="24" ry="6.5" fill="#ffffff" opacity="0.9" transform="rotate(-14 70 54)" />

        <!-- gauge-dial ears -->
        @for (ear of ears; track ear.x) {
          <g>
            <circle [attr.cx]="ear.x" cy="92" r="18" fill="#1c7fa8" stroke="#0b4a6b" stroke-width="1.5" />
            <circle [attr.cx]="ear.x" cy="92" r="12.5" fill="#f4f9fc" />
            @for (a of ticks; track a) {
              <line [attr.x1]="ear.x + 9.5 * cos(a)" [attr.y1]="92 + 9.5 * sin(a)" [attr.x2]="ear.x + 11.5 * cos(a)" [attr.y2]="92 + 11.5 * sin(a)"
                    stroke="#0b4a6b" stroke-width="1.3" stroke-linecap="round" />
            }
            <line class="hy-needle" [class.hy-needle--r]="ear.x > 100" [attr.x1]="ear.x" y1="92" [attr.x2]="ear.x + 7" y2="86" stroke="#e0533d" stroke-width="2" stroke-linecap="round"
                  [style.transform-origin]="ear.x + 'px 92px'" />
            <circle [attr.cx]="ear.x" cy="92" r="2.2" fill="#0b4a6b" />
          </g>
        }

        <!-- visor face -->
        <rect x="48" y="58" width="104" height="70" rx="31" fill="#10274a" />
        <path d="M62 66c10-4 22-5 38-5s28 1 38 5" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="3" stroke-linecap="round" />
        <g class="hy-eyes">
          <g class="hy-eyes-open">
            <rect class="hy-eye" x="71" y="78" width="13" height="21" rx="6.5" fill="#8ff2ff" />
            <rect class="hy-eye" x="116" y="78" width="13" height="21" rx="6.5" fill="#8ff2ff" />
          </g>
          <g class="hy-eyes-happy" fill="none" stroke="#8ff2ff" stroke-width="5" stroke-linecap="round">
            <path d="M69 92c4-9 13-9 17 0" /><path d="M114 92c4-9 13-9 17 0" />
          </g>
          <path class="hy-mouth" d="M90 109c6 6 14 6 20 0" fill="none" stroke="#8ff2ff" stroke-width="4" stroke-linecap="round" />
        </g>
        <circle cx="63" cy="108" r="5.5" fill="#ff9db0" opacity="0.38" />
        <circle cx="137" cy="108" r="5.5" fill="#ff9db0" opacity="0.38" />
      </g>
    </svg>
  `,
  styles: `
    :host { display: inline-block; line-height: 0; }
    svg { width: 100%; height: 100%; overflow: visible; }

    .hy-float { animation: hy-float 3.8s ease-in-out infinite; }
    .hy-eye { transform-box: fill-box; transform-origin: center; animation: hy-blink 5.6s infinite; }
    .hy-eyes { filter: drop-shadow(0 0 2.5px rgba(143, 242, 255, 0.9)); }
    .hy-eyes-happy { opacity: 0; transition: opacity 0.25s ease; }
    .hy-eyes-open { transition: opacity 0.2s ease; }
    .hy-drop { transform-box: fill-box; transform-origin: 50% 100%; animation: hy-drop 2.8s ease-in-out infinite; }
    .hy-needle { animation: hy-needle 3.2s ease-in-out infinite; }
    .hy-needle--r { animation-delay: -1.4s; }
    .hy-arm--r { transform-box: view-box; transform-origin: 158px 164px; }
    .hy-mouth { transition: d 0.3s ease; }

    :host(.hy--happy) .hy-eyes-open, :host(.hy--wave) .hy-eyes-open { opacity: 0; }
    :host(.hy--happy) .hy-eyes-happy, :host(.hy--wave) .hy-eyes-happy { opacity: 1; }
    :host(.hy--wave) .hy-arm--r { animation: hy-wave 1.1s ease-in-out 2; }
    :host(.hy--thinking) .hy-eyes-open { animation: hy-look 1.4s ease-in-out infinite; }
    :host(.hy--thinking) .hy-drop { animation-duration: 0.9s; }
    :host(.hy--thinking) .hy-needle { animation-duration: 0.8s; }
    :host(.hy--thinking) .hy-mouth { d: path('M93 110c4 0 10 0 14 0'); }

    @keyframes hy-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes hy-blink { 0%, 90%, 100% { transform: scaleY(1); } 93% { transform: scaleY(0.12); } 96% { transform: scaleY(1); } }
    @keyframes hy-drop { 0%, 100% { transform: scale(1); opacity: 0.92; } 50% { transform: scale(1.1); opacity: 1; } }
    @keyframes hy-needle { 0%, 100% { transform: rotate(-35deg); } 50% { transform: rotate(40deg); } }
    @keyframes hy-wave { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(-38deg); } 60% { transform: rotate(-18deg); } 80% { transform: rotate(-34deg); } }
    @keyframes hy-look { 0%, 100% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }

    @media (prefers-reduced-motion: reduce) {
      .hy-float, .hy-eye, .hy-drop, .hy-needle, :host(.hy--wave) .hy-arm--r, :host(.hy--thinking) .hy-eyes-open { animation: none !important; }
    }
  `,
})
export class HydraMascotComponent {
  readonly mood = input<HydraMood>('idle');
  /** "head" for the launcher and avatars, "full" for the welcome message. */
  readonly mode = input<'head' | 'full'>('head');

  readonly ears = [{ x: 30 }, { x: 170 }];
  readonly ticks = [-150, -110, -70, -30, 10].map((d) => (d * Math.PI) / 180);
  readonly cos = Math.cos;
  readonly sin = Math.sin;
}
