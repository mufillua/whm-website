import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EnquiryService, EnquiryProduct } from '../../../core/services/enquiry.service';
import { COMPANY } from '../../../core/config/company.config';
import { IconComponent } from '../icon/icon.component';

/** Reusable email enquiry button — opens the visitor's mail app with a product-specific subject and body. */
@Component({
  selector: 'whm-email-button',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="btn" [class]="variant()" [class.btn--sm]="small()" [class.btn--block]="block()" [href]="href()" [attr.aria-label]="ariaLabel()">
      <whm-icon name="mail" [size]="18" /><span>{{ label() }}</span>
    </a>
  `,
  styles: `:host { display: contents; }`,
})
export class EmailButtonComponent {
  readonly product = input<EnquiryProduct>();
  readonly subject = input<string>();
  readonly body = input<string>();
  readonly label = input('Send an Email');
  readonly variant = input('btn btn--ghost');
  readonly small = input(false);
  readonly block = input(false);
  private readonly enquiry = inject(EnquiryService);

  readonly href = computed(() => {
    const p = this.product();
    if (p) {
      const e = this.enquiry.productEmail(p);
      return this.enquiry.mailtoUrl(e.subject, e.body);
    }
    return this.enquiry.mailtoUrl(this.subject() ?? `Enquiry for ${COMPANY.name}`, this.body() ?? `Hello ${COMPANY.name},\n\n`);
  });
  readonly ariaLabel = computed(() => (this.product() ? `Email an enquiry about ${this.product()!.name}` : this.label()));
}
