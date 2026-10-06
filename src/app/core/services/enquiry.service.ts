import { Injectable } from '@angular/core';
import { COMPANY } from '../config/company.config';

export interface EnquiryProduct {
  name: string;
  modelCode?: string;
  category?: string;
}

/** Builds WhatsApp and email enquiry links from the product being viewed (nothing is hard-coded per product). */
@Injectable({ providedIn: 'root' })
export class EnquiryService {
  whatsappUrl(message: string): string {
    return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  mailtoUrl(subject: string, body: string): string {
    return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  productWhatsappMessage(p: EnquiryProduct): string {
    return [
      `Hello ${COMPANY.name},`, '',
      'I am interested in the following product:', '',
      `Product: ${p.name}`,
      ...(p.modelCode ? [`Model: ${p.modelCode}`] : []), '',
      'Please share availability, pricing and further details.', '',
      'Thank you.',
    ].join('\n');
  }

  productEmail(p: EnquiryProduct): { subject: string; body: string } {
    const subject = `Product Enquiry - ${p.name}${p.modelCode ? ' ' + p.modelCode : ''}`;
    const body = [
      `Hello ${COMPANY.name},`, '',
      'I am interested in:', '',
      `Product: ${p.name}`,
      ...(p.modelCode ? [`Model: ${p.modelCode}`] : []),
      ...(p.category ? [`Category: ${p.category}`] : []), '',
      'Please share availability, pricing and technical details.', '',
      'Thank you.',
    ].join('\n');
    return { subject, body };
  }

  generalWhatsappMessage(): string {
    return `Hello ${COMPANY.name},\n\nI would like to enquire about your products. Please get in touch.\n\nThank you.`;
  }
}
