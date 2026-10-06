import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'whm-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-head" [class.section-head--center]="center()">
      <div class="section-head__text">
        @if (kicker()) { <span class="kicker">{{ kicker() }}</span> }
        <h2 [id]="headingId()">{{ title() }}</h2>
        @if (lead()) { <p>{{ lead() }}</p> }
      </div>
      <ng-content />
    </div>
  `,
  styles: `
    :host { display: block; }
    .section-head--center { justify-content: center; text-align: center; }
    .section-head--center .section-head__text { justify-items: center; margin-inline: auto; }
  `,
})
export class SectionHeadingComponent {
  readonly title = input.required<string>();
  readonly kicker = input<string>();
  readonly lead = input<string>();
  readonly headingId = input<string>();
  readonly center = input(false);
}
