import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { COMPANY } from '../../../core/config/company.config';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { IconComponent } from '../icon/icon.component';

const phoneOrEmail = (g: AbstractControl): ValidationErrors | null =>
  g.get('phone')?.value?.trim() || g.get('email')?.value?.trim() ? null : { contact: true };

/**
 * Quote / enquiry form. There is no backend, so "Send Enquiry" opens the visitor's email app with every field
 * filled in, and the WhatsApp option sends the same details as a WhatsApp message.
 */
@Component({
  selector: 'whm-quote-form',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent {
  readonly requirement = input('');
  readonly compact = input(false);
  private readonly fb = inject(FormBuilder);
  private readonly enquiry = inject(EnquiryService);
  readonly sent = signal<'' | 'email' | 'whatsapp'>('');
  readonly tried = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    company: ['', Validators.maxLength(120)],
    phone: ['', [Validators.pattern(/^[+\d][\d\s-]{6,17}$/)]],
    email: ['', [Validators.email]],
    requirement: ['', [Validators.required, Validators.maxLength(300)]],
    quantity: ['', Validators.maxLength(60)],
    message: ['', Validators.maxLength(1500)],
  }, { validators: phoneOrEmail });

  constructor() {
    effect(() => { if (this.requirement()) this.form.controls.requirement.setValue(this.requirement()); });
  }

  invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.tried());
  }

  private details(): string[] {
    const v = this.form.getRawValue();
    return [
      `Name: ${v.name}`,
      ...(v.company ? [`Company: ${v.company}`] : []),
      ...(v.phone ? [`Phone: ${v.phone}`] : []),
      ...(v.email ? [`Email: ${v.email}`] : []),
      `Product / requirement: ${v.requirement}`,
      ...(v.quantity ? [`Quantity: ${v.quantity}`] : []),
      ...(v.message ? ['', v.message] : []),
    ];
  }

  private ok(): boolean {
    this.tried.set(true);
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  sendEmail(): void {
    if (!this.ok()) return;
    const v = this.form.getRawValue();
    const body = [`Hello ${COMPANY.name},`, '', 'Please send a quotation for the following:', '', ...this.details(), '', 'Thank you.'].join('\n');
    window.location.href = this.enquiry.mailtoUrl(`Quote Request - ${v.requirement}`.slice(0, 140), body);
    this.sent.set('email');
  }

  sendWhatsapp(): void {
    if (!this.ok()) return;
    const msg = [`Hello ${COMPANY.name},`, '', 'I would like a quotation for:', '', ...this.details(), '', 'Thank you.'].join('\n');
    window.open(this.enquiry.whatsappUrl(msg), '_blank', 'noopener');
    this.sent.set('whatsapp');
  }
}
