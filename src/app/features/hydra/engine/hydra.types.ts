/** What the one-time training (scripts/hydra/train.mjs) learned from the PDF catalogues and guide.md. */
export interface HydraNote {
  about?: string[];
  features?: string[];
  uses?: string[];
  howto?: string[];
  specs?: [string, string][];
  /** Part numbers printed in the catalogue for this product. */
  codes?: string[];
  /** Catalogue lines listing sizes with their part numbers ("DN13 ISO 10: BSP 1/2" AH04-G-13-10-F …"). */
  sizes?: string[];
  /** Where it was learned (file + page) — never shown to visitors. */
  src?: string[];
}

/** A model that is in a catalogue but not listed on the website. */
export interface HydraExtra extends HydraNote {
  code: string;
  title: string;
  brand?: string | null;
}

export interface HydraCategoryNote {
  what: string;
  uses: string;
  howto: string;
  choose: string;
}

export interface HydraTerm {
  name: string;
  aka: string[];
  what: string;
  uses: string;
  howto: string;
}

export interface HydraFaq {
  id: string;
  ask: string[];
  answer: string;
}

export interface HydraKnowledge {
  version: number;
  trainedAt: string;
  sources: { file: string; pages: number; brand: string | null; products: number }[];
  notes: Record<string, HydraNote>;
  extras: HydraExtra[];
  general: { text: string; kind: string; brand?: string | null; src: string }[];
  categoryNotes: Record<string, HydraCategoryNote>;
  faqs: HydraFaq[];
  terms: HydraTerm[];
}

// ------------------------------------------------------------------------------------------------ replies

export interface HydraProductCard {
  slug: string;
  name: string;
  meta: string;
  image?: string;
}

export interface HydraLink {
  label: string;
  /** Internal route ("/products/x") or external URL. */
  url: string;
  queryParams?: Record<string, string>;
}

export type HydraBlock =
  /** Paragraph; **double asterisks** mark bold text. */
  | { kind: 'text'; text: string }
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'specs'; title?: string; rows: [string, string][] }
  | { kind: 'table'; title?: string; columns: string[]; rows: string[][]; note?: string }
  | { kind: 'products'; items: HydraProductCard[] }
  | { kind: 'links'; items: HydraLink[] }
  /** Contact buttons; `message` pre-fills WhatsApp. */
  | { kind: 'contact'; message: string; label?: string };

export interface HydraReply {
  blocks: HydraBlock[];
  /** Suggested follow-up questions. */
  chips?: string[];
  /** What the conversation is about now, for follow-ups such as "what sizes does it come in?". */
  context: HydraContext;
  /** For tests and analytics: which path produced the answer. */
  intent: string;
}

export interface HydraContext {
  products: string[];
  category?: string;
  brand?: string;
}
