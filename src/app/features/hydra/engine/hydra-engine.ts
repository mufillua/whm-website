import { COMPANY } from '../../../core/config/company.config';
import { Brand, Category, Product, ProductType } from '../../../core/models/product.model';
import { productFacts } from '../../../core/utils/product-overview';
import {
  HydraBlock,
  HydraCategoryNote,
  HydraTerm,
  HydraContext,
  HydraExtra,
  HydraKnowledge,
  HydraNote,
  HydraProductCard,
  HydraReply,
} from './hydra.types';
import { INTENT_WORDS, STOPWORDS, SizeAsk, docTokens, editDistance, isCode, normCode, normalise, queryCodes, rowMatches, sizesIn, stripLead, tokens } from './hydra-text';
import { LOANWORDS, readHindi, soundKey } from './hydra-hindi';

/**
 * Hydra's brain. It runs entirely in the visitor's browser: no API, no server, no data leaves the page.
 *
 * Every answer is assembled from the website's own product data plus what `npm run hydra:train` learned from the
 * PDF catalogues and guide.md. Hydra never invents specifications, never quotes prices, and never tells a
 * customer "we don't have it" — anything it can't find goes to the team.
 */
export interface HydraData {
  products: Product[];
  categories: Category[];
  types: ProductType[];
  brands: Brand[];
  knowledge: HydraKnowledge;
}

type DocKind = 'product' | 'category' | 'type' | 'brand' | 'extra';
interface Doc {
  kind: DocKind;
  id: string;
  tf: Map<string, number>;
  len: number;
  /** Tokens of the name / title — what the thing *is*. */
  title: Set<string>;
  titleSeq: string[];
}
interface Hit {
  doc: Doc;
  score: number;
  /** query terms found anywhere in the doc / in its title */
  matched: Set<string>;
  titleMatched: Set<string>;
}

type Want = 'overview' | 'sizes' | 'uses' | 'howto' | 'specs' | 'price' | 'compare' | 'choose' | 'stock';

const K1 = 1.2;
const B = 0.55;
const MAX_CARDS = 4;

export class HydraEngine {
  private readonly products = new Map<string, Product>();
  private readonly categories = new Map<string, Category>();
  private readonly types = new Map<string, ProductType>();
  private readonly brands = new Map<string, Brand>();
  private readonly notes: Record<string, HydraNote>;
  private readonly extras = new Map<string, HydraExtra>();
  private readonly guide: Record<string, HydraCategoryNote>;
  private readonly terms: HydraTerm[];
  /** Nouns that name things we supply ("valve", "gauge", "spanner", "hoist", brand names…). */
  private readonly heads = new Set<string>();
  private readonly brandWords = new Set<string>();

  private readonly docs: Doc[] = [];
  private readonly df = new Map<string, number>();
  private avgLen = 1;
  /** Every word Hydra knows, with document frequency (for spelling correction). */
  private readonly vocab = new Map<string, number>();
  /** Words that name things we supply (product names, types, categories, brands). */
  private readonly stockVocab = new Set<string>();
  private readonly codes = new Map<string, Set<string>>(); // code -> doc ids ("p:slug" / "x:CODE")
  private readonly looseCodes = new Map<string, Set<string>>();
  private readonly shortCodes = new Map<string, Set<string>>();

  constructor(private readonly data: HydraData) {
    for (const p of data.products) this.products.set(p.slug, p);
    for (const c of data.categories) this.categories.set(c.slug, c);
    for (const t of data.types) this.types.set(t.slug, t);
    for (const b of data.brands) this.brands.set(b.slug, b);
    this.notes = data.knowledge.notes ?? {};
    this.guide = data.knowledge.categoryNotes ?? {};
    this.terms = data.knowledge.terms ?? [];
    for (const x of data.knowledge.extras ?? []) this.extras.set(x.code, x);
    this.build();
  }

  // ============================================================================================ index

  private build() {
    const add = (kind: DocKind, id: string, fields: [string | undefined, number][], titleText: string) => {
      const tf = new Map<string, number>();
      let len = 0;
      for (const [text, w] of fields) {
        if (!text) continue;
        for (const t of docTokens(text)) {
          tf.set(t, (tf.get(t) ?? 0) + w);
          len += w;
        }
      }
      const titleSeq = docTokens(titleText);
      this.docs.push({ kind, id, tf, len, title: new Set(titleSeq), titleSeq });
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    };

    for (const p of this.data.products) {
      const type = this.types.get(p.productType);
      const cat = type ? this.categories.get(type.categorySlug) : undefined;
      const brand = p.brandSlug ? this.brands.get(p.brandSlug) : undefined;
      const n = this.notes[p.slug] ?? {};
      add(
        'product',
        p.slug,
        [
          [p.name, 3],
          [p.modelCode, 3],
          [type?.name, 2],
          [cat?.name, 1.2],
          [brand?.name, 1.5],
          [p.shortDescription, 1],
          [(p.features ?? []).join(' '), 0.6],
          [(p.specifications ?? []).map((s) => `${s.label} ${s.value}`).join(' '), 0.4],
          [[...(n.about ?? []), ...(n.uses ?? [])].join(' '), 0.5],
          [[...(n.features ?? []), ...(n.howto ?? [])].join(' '), 0.35],
          [(n.specs ?? []).map(([l, v]) => `${l} ${v}`).join(' '), 0.25],
        ],
        `${p.name} ${type?.name ?? ''}`,
      );
      for (const t of docTokens(`${p.name} ${type?.name ?? ''} ${cat?.name ?? ''}`)) this.stockVocab.add(t);
      this.indexCodes(`p:${p.slug}`, p);
    }
    for (const c of this.data.categories) {
      const g = this.guide[c.slug];
      const typeNames = this.data.types.filter((t) => t.categorySlug === c.slug).map((t) => t.name);
      add('category', c.slug, [[c.name, 3], [typeNames.join(' '), 1.5], [c.description, 1], [g ? `${g.what} ${g.uses}` : '', 0.5]], c.name);
    }
    for (const t of this.data.types) {
      const c = this.categories.get(t.categorySlug);
      add('type', t.slug, [[t.name, 3], [c?.name, 1]], t.name);
    }
    for (const b of this.data.brands) {
      add('brand', b.slug, [[b.name, 4]], b.name);
      for (const t of docTokens(b.name)) this.stockVocab.add(t);
    }
    for (const x of this.extras.values()) {
      add('extra', x.code, [[x.code, 3], [x.title, 3], [(x.about ?? []).join(' '), 0.6], [(x.features ?? []).join(' '), 0.4]], x.title);
      this.addCode(x.code, `x:${x.code}`);
    }
    // head nouns: the last word of each product name, type and category ("Tubular Box Spanners" -> spanner)
    const lastWord = (s: string) => docTokens(s).slice(-1)[0];
    for (const p of this.data.products) for (const part of p.name.split(/\s[—–]\s|\(|,|\//)[0].split(/\s(?:&|and|with)\s/)) this.addHead(lastWord(part));
    for (const t of this.data.types) for (const part of t.name.split(/,|&|\band\b/)) this.addHead(lastWord(part));
    for (const c of this.data.categories) for (const part of c.name.split(/,|&|\band\b/)) this.addHead(lastWord(part));
    for (const b of this.data.brands) {
      const w = docTokens(b.name)[0];
      if (w) {
        this.heads.add(w);
        this.brandWords.add(w);
      }
    }
    for (const t of this.terms) this.addHead(lastWord(t.name));
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / Math.max(1, this.docs.length);
    for (const [t, n] of this.df) this.vocab.set(t, n);
  }

  private addHead(w?: string) {
    if (w && w.length > 2 && !/\d/.test(w) && !NOT_HEADS.has(w)) this.heads.add(w);
  }

  private addCode(raw: string, id: string) {
    for (const part of String(raw).split(/\s*(?:\/|,|–|—|\bor\b|&)\s*/i)) {
      const c = normCode(part);
      if (!isCode(c)) continue;
      if (!this.codes.has(c)) this.codes.set(c, new Set());
      this.codes.get(c)!.add(id);
      const loose = stripLead(c);
      if (loose !== c && isCode(loose)) {
        if (!this.looseCodes.has(loose)) this.looseCodes.set(loose, new Set());
        this.looseCodes.get(loose)!.add(id);
      }
    }
  }

  private indexCodes(id: string, p: Product) {
    if (p.modelCode) this.addCode(p.modelCode.replace(/\s*\(.*?\)/g, '').replace(/\s+series\b/gi, ''), id);
    // two-letter model codes (Delta "UP", "IP", "DSD"…) clash with ordinary words, so they're matched separately
    if (p.modelCode && /^[A-Z]{2}$/.test(p.modelCode.trim())) {
      const c = p.modelCode.trim();
      if (!this.shortCodes.has(c)) this.shortCodes.set(c, new Set());
      this.shortCodes.get(c)!.add(p.slug);
    }
    const tail = p.name.split(/\s[—–]\s/).slice(1).join(' ');
    for (const t of tail.match(/\b[A-Z0-9][A-Z0-9*-]{2,}\b/g) ?? []) this.addCode(t, id);
    for (const v of p.variants ?? []) {
      const ci = v.columns.findIndex((c) => /(product|part|item|cat(alogue)?)\s*(no|code)|^code$|^model$|^type$/i.test(c));
      if (ci >= 0) for (const r of v.rows) if (r[ci] && /\d/.test(r[ci])) this.addCode(r[ci], id);
    }
    for (const c of this.notes[p.slug]?.codes ?? []) this.addCode(c, id);
  }

  private idf(t: string) {
    const n = this.df.get(t) ?? 0;
    return Math.log(1 + (this.docs.length - n + 0.5) / (n + 0.5));
  }

  private search(terms: string[], kinds?: DocKind[]): Hit[] {
    const uniq = [...new Set(terms)];
    const hits: Hit[] = [];
    for (const d of this.docs) {
      if (kinds && !kinds.includes(d.kind)) continue;
      let score = 0;
      const matched = new Set<string>();
      const titleMatched = new Set<string>();
      for (const t of uniq) {
        const f = d.tf.get(t);
        if (!f) continue;
        matched.add(t);
        if (d.title.has(t)) titleMatched.add(t);
        score += this.idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / this.avgLen)));
      }
      if (!score) continue;
      // phrase bonus: neighbouring query words that are also neighbours in the title ("ball valve")
      for (let i = 0; i + 1 < terms.length; i++) {
        const a = d.titleSeq.indexOf(terms[i]);
        if (a >= 0 && d.titleSeq[a + 1] === terms[i + 1]) score += 1.5;
      }
      // coverage matters more than repetition
      score *= 0.5 + matched.size / uniq.length;
      if (titleMatched.size === uniq.length) score *= 1.25;
      hits.push({ doc: d, score, matched, titleMatched });
    }
    return hits.sort((a, b) => b.score - a.score);
  }

  /** Corrects words Hydra doesn't know to the closest word it does ("guage" -> "gauge", "coupplings" -> "coupling"). */
  private spell(terms: string[]): { terms: string[]; unknown: string[] } {
    const out: string[] = [];
    const unknown: string[] = [];
    for (const t of terms) {
      if (this.vocab.has(t) || t.length < 4 || /\d/.test(t) || NEUTRAL.has(t)) {
        if (!this.vocab.has(t) && !NEUTRAL.has(t)) unknown.push(t);
        out.push(t);
        continue;
      }
      // short words: only to a word that names something we stock and starts the same way ("valv" -> "valve");
      // longer words may be up to two letters off ("hydrualic" -> "hydraulic")
      const short = t.length <= 5;
      const max = t.length >= 8 ? 2 : 1;
      let best: string | undefined;
      let bestD = max + 1;
      let bestN = 0;
      for (const [w, n] of this.vocab) {
        if (Math.abs(w.length - t.length) > max || w[0] !== t[0]) continue;
        if (short ? !this.stockVocab.has(w) || w[1] !== t[1] : n < 2) continue;
        const dist = editDistance(t, w, max);
        if (dist < bestD || (dist === bestD && n > bestN)) {
          best = w;
          bestD = dist;
          bestN = n;
        }
      }
      if (best && bestD <= max) out.push(best);
      else {
        out.push(t);
        unknown.push(t);
      }
    }
    return { terms: out, unknown };
  }

  // ========================================================================================== replies

  private respond(input: string, ctx: HydraContext = { products: [] }): HydraReply {
    const text = input.trim().slice(0, 300);
    const q = normalise(text);
    if (!q) return this.help(ctx);

    const want = this.wants(q);
    const sizes = sizesIn(text);
    const spelled = this.spell(tokens(text).filter((t) => !QTY_WORDS.has(t)));
    // glossary names stand in for their aliases ("pt100" -> rtd, "nrv" -> check valve)
    const aliasTerms = this.termMatches(q).flatMap((t) => tokens(t.name, true));
    const terms = [...new Set([...spelled.terms, ...aliasTerms])];
    const unknown = spelled.unknown.filter((u) => !this.termMatches(q).some((t) => t.aka.some((a) => tokens(a, true).includes(u))));
    const codeIds = this.codeHits(text);
    const nouns = terms.filter((t) => this.heads.has(t));
    const productish = codeIds.length > 0 || nouns.length > 0;

    // ---- conversation and shop questions ("are you open on sunday?", "phone number", "do you deliver?")
    if (!productish) {
      const talk = this.smallTalk(q, ctx) ?? this.shopInfo(q, ctx) ?? this.faq(q, ctx);
      if (talk) return talk;
    }

    // ---- definitions and comparisons ("what is a counterbalance valve?", "relief vs reducing valve")
    if (!codeIds.length) {
      const g = this.glossary(q, want, ctx);
      if (g) return g;
    }

    // ---- follow-ups about what we were just talking about ("what sizes does it come in?", "voltage options?").
    // A new request ("do you have hydraulic cylinders?") or words Hydra doesn't know start a fresh search instead.
    const pronoun = /\b(it|its|it's|this|that|these|those|them|they|same|one|ones)\b/.test(q);
    const asking = /\b(do you have|have you got|do you (sell|supply|stock|deal)|i (need|want|require)|looking for|need a|want a)\b/.test(q);
    const aboutCtx = terms.every((t) => this.vocab.has(t)) && (terms.length <= 3 || pronoun);
    if (!productish && ctx.products.length && (pronoun || (!asking && aboutCtx)) && !(asking && !pronoun && unknown.length)) {
      const ps = ctx.products.map((s) => this.products.get(s)).filter((p): p is Product => !!p);
      if (sizes.length) {
        const withSize = ps.filter((p) => this.hasSize(p, sizes));
        if (withSize.length === 1) return this.productAnswer(withSize[0], want, sizes, ctx);
        if (withSize.length > 1) return this.sizeList(withSize, sizes, ctx);
        return this.contactTeam(sizes.map((s) => s.label).join(', '), `For **${ps.length === 1 ? shortName(ps[0].name) : 'this'}** in **${sizes.map((s) => s.label).join(', ')}**, `, ps.slice(0, 3), ctx);
      }
      const ask = want === 'overview' && terms.length ? 'specs' : want;
      if (ps.length > 1 && ask === 'specs') {
        this.focus = terms;
        const rows = ps.slice(0, 6).map((p) => {
          const f = this.specFocus(this.allSpecs(p), p).rows;
          return [shortName(p.name), f.map(([l, v]) => (f.length > 1 ? `${l}: ${v}` : v)).join('; ')];
        });
        if (!rows.some((r) => r[1])) {
          return {
            blocks: [{ kind: 'text', text: `The catalogue doesn't mention ${terms.join(' ')} for these products. Please ask our team — they'll confirm it for you.` }, { kind: 'contact', message: `Hello ${COMPANY.name},\n\nPlease tell me the ${terms.join(' ')} for: ${ps.slice(0, 3).map((p) => p.name).join(' / ')}.\n\nThank you.` }],
            chips: ps.slice(0, 3).map((p) => shortName(p.name)),
            context: ctx,
            intent: 'specs-unknown',
          };
        }
        if (rows.some((r) => r[1])) {
          return {
            blocks: [{ kind: 'text', text: 'From the catalogue:' }, { kind: 'table', columns: ['Product', capitalise(terms.join(' '))], rows: rows.map((r) => [r[0], r[1] || '—']) }, { kind: 'products', items: ps.slice(0, MAX_CARDS).map((p) => this.card(p)) }],
            chips: ps.slice(0, 3).map((p) => shortName(p.name)),
            context: ctx,
            intent: 'specs-compare',
          };
        }
      }
      if (ps.length === 1 || ask === 'uses' || ask === 'howto' || ask === 'choose' || ask === 'price' || ask === 'stock') {
        return this.productAnswer(ps[0], ask, [], ctx, false, ps.slice(1), terms);
      }
      if (ask !== 'overview') return this.pickOne(ps, ask, ctx);
    }
    // after a category answer: "sizes?", "what is its accuracy?", "pressure rating?"
    const specOnly = terms.length > 0 && terms.every((t) => SPEC_TERMS.has(t));
    if (!productish && ctx.category && want !== 'overview' && (!terms.length || pronoun || specOnly)) {
      return this.categoryAnswer(ctx.category, [], want, ctx, undefined, [], terms.filter((t) => this.vocab.has(t)));
    }

    // ---- exact model / part number ("KHB2", "AH12-08G-F", "1621-8")
    if (codeIds.length) {
      const ps = codeIds.filter((id) => id.startsWith('p:')).map((id) => this.products.get(id.slice(2))!).filter(Boolean);
      const xs = codeIds.filter((id) => id.startsWith('x:')).map((id) => this.extras.get(id.slice(2))!).filter(Boolean);
      if (ps.length === 1) return this.productAnswer(ps[0], want, sizes, ctx, true);
      if (ps.length > 1) {
        // same model family (e.g. KHB2 standard and KHB2 light/heavy): answer for the closest, mention the rest
        const asked = new Set(queryCodes(text));
        const score = new Map(this.search(terms, ['product']).map((h) => [h.doc.id, h.score]));
        const exact = (p: Product) => (p.modelCode && asked.has(normCode(p.modelCode)) ? 1 : 0);
        ps.sort((a, b) => exact(b) - exact(a) || (score.get(b.slug) ?? 0) - (score.get(a.slug) ?? 0) || a.name.length - b.name.length);
        if (sizes.length) {
          const withSize = ps.filter((p) => this.hasSize(p, sizes));
          if (withSize.length === 1) return this.productAnswer(withSize[0], want, sizes, ctx, true);
          if (withSize.length > 1) return this.sizeList(withSize, sizes, ctx);
        }
        if (ps.length <= 3) return this.productAnswer(ps[0], want, sizes, ctx, true, ps.slice(1));
        return this.productList(ps, want, ctx, `These products match that model number:`);
      }
      if (xs.length) return this.extraAnswer(xs[0], want, ctx);
    }

    // ---- nothing we supply was named ("hydraulic cylinder", "laptop"): the team takes it — never "we don't have it"
    if (!nouns.length && !terms.some((t) => this.stockVocab.has(t))) {
      if (!terms.length) return sizes.length ? this.contactTeam(text, '', [], ctx) : this.help(ctx);
      if (terms.every((t) => gibberish(t))) return this.notUnderstood(ctx);
      if (!/\b(have|sell|supply|stock|need|want|looking|require|buy|get|price|cost|rate|available|deal|order|purchase|source|arrange)\b/.test(q)) return this.offTopic(ctx);
      const near = this.search(terms, ['product']).filter((h) => h.titleMatched.size > 0).slice(0, 3);
      return this.contactTeam(text, '', near.map((h) => this.products.get(h.doc.id)!), ctx);
    }

    // "hydraulic cylinder": the thing asked for is a word no product name uses ("hydraulic" only describes it) — the team
    // takes it, never "yes, we supply hydraulic filters"
    const lastWord = spelled.terms[spelled.terms.length - 1];
    const words: string[] = q.match(/[a-z0-9]+/g) ?? [];
    const before = words[words.lastIndexOf(lastWord) - 1] ?? words[words.findIndex((w) => tokens(w)[0] === lastWord) - 1];
    const qualified = !!before && this.stockVocab.has(tokens(before)[0] ?? ''); // "hydraulic cylinder", not "pressure can it take"
    if (!nouns.length && qualified && lastWord && lastWord.length >= 4 && !this.stockVocab.has(lastWord) && !this.brandWords.has(lastWord) && !NEUTRAL.has(lastWord) && !aliasTerms.includes(lastWord) && !gibberish(lastWord)) {
      // not "hydraulic filters" for a hydraulic hose: an item must match more than the describing word
      const qualifier = tokens(before)[0];
      const near = this.search(terms, ['product']).filter((h) => [...h.titleMatched].some((t) => t !== qualifier)).slice(0, 3);
      return this.contactTeam(text, '', near.map((h) => this.products.get(h.doc.id)!), ctx);
    }

    // Words we can't place ("rexroth", "gate" in "gate valve"): a word right before the product noun that no product name
    // uses is a kind of product we may not list — the team handles it, and we show what's closest.
    const phrase = this.headPhrase(text);
    const missing = new Set(unknown.filter((t) => t.length >= 3 && !/\d/.test(t) && !NEUTRAL.has(t) && (!phrase || phrase.has(t))));
    const aliasWords = new Set(this.termMatches(q).flatMap((t) => t.aka.flatMap((a) => tokens(a, true))));
    terms.forEach((t, i) => {
      const next = terms[i + 1];
      if (next && this.heads.has(next) && (!phrase || phrase.has(t)) && !this.stockVocab.has(t) && !NEUTRAL.has(t) && !this.brandWords.has(t) && !aliasWords.has(t)) missing.add(t);
    });
    let reply = this.findProducts(text, terms, want, sizes, ctx);
    if (missing.size && reply.intent !== 'contact-team' && !reply.intent.endsWith('+team')) reply = this.withTeamNote(reply, this.phrase(terms, missing), text);
    // a price asked with a size or for a group of items ("18 inch pipe wrench price", "spanner set price"): what we list,
    // and prices from the team
    if (want === 'price' && (reply.intent === 'size-list' || reply.intent === 'product-list')) {
      const at = reply.blocks.findIndex((b) => b.kind === 'contact');
      const note: HydraBlock = { kind: 'text', text: 'Prices depend on the model, size and quantity — our team will send you a quote.' };
      if (at >= 0) reply.blocks.splice(at, 0, note);
      else reply.blocks.push(note, { kind: 'contact', message: `Hello ${COMPANY.name},\n\nPlease share prices for: ${text}\n\nThank you.`, label: 'Ask for a price' });
      reply.intent += '-price';
    }
    // "50 pcs of combination pliers": quantities go to the team with the enquiry
    const qty = q.match(/\b(\d+)\s*(pcs?|pieces?|nos?\.?|numbers?|units?|sets?|qty|quantity|dozens?|boxes)\b/);
    if (qty && reply.blocks.some((b) => b.kind === 'products')) {
      reply.blocks.unshift({ kind: 'text', text: `For **${qty[1]} ${qty[2]}**, our team will confirm stock and send you a quote.` });
      for (const b of reply.blocks) if (b.kind === 'contact') b.message = b.message.replace(/\n\n(Please|Thank)/, `\nQuantity: ${qty[1]} ${qty[2]}\n\n$1`);
    }
    return reply;
  }

  /** Puts "for X, please contact our team" on top of an answer that only covers what's closest. */
  private withTeamNote(reply: HydraReply, asked: string, text: string): HydraReply {
    const first = reply.blocks.find((b) => b.kind === 'text');
    if (first?.kind === 'text') first.text = first.text.replace(/^Yes — we supply /, 'We supply ').replace(/^Yes — /, '');
    reply.blocks.unshift({ kind: 'text', text: `For **${asked}**, please contact our team — they'll check availability for you. Meanwhile, here's what's closest in our range:` });
    if (!reply.blocks.some((b) => b.kind === 'contact')) reply.blocks.push({ kind: 'contact', message: `Hello ${COMPANY.name},\n\nI'm looking for: ${text}\n\nPlease let me know if you can supply it.\n\nThank you.` });
    reply.intent += '+team';
    return reply;
  }

  /** Words of the clause that names the product ("hydraulic filter" in "hydraulic filter for return line"). */
  private headPhrase(text: string): Set<string> | undefined {
    const clauses = normalise(text).split(/\b(?:for|with|in|on|to|of|from|at|by|which|that|used|where|when|under|inside|near|having|without)\b/);
    for (const c of clauses) {
      const ts = tokens(c);
      if (ts.some((t) => this.heads.has(t))) return new Set(ts.map((t) => (this.vocab.has(t) ? t : t)));
    }
    return undefined;
  }

  /** "gate valve", "rexroth solenoid valve": the missing words with the product noun they describe. */
  private phrase(terms: string[], missing: Set<string>): string {
    const i = terms.findIndex((t) => missing.has(t));
    const out = [terms[i]];
    for (let j = i + 1; j < terms.length && out.length < 5; j++) {
      out.push(terms[j]);
      if (this.heads.has(terms[j]) && !this.heads.has(terms[j + 1] ?? '')) break;
    }
    return out.join(' ');
  }

  /** Search and pick the right kind of answer: one product, a product type, a category or a brand. */
  private findProducts(text: string, terms: string[], want: Want, sizes: SizeAsk[], ctx: HydraContext): HydraReply {
    const hits = this.search(terms);
    const brandHit = hits.find((h) => h.doc.kind === 'brand' && h.titleMatched.size === h.doc.title.size);
    const brand = brandHit?.doc.id;
    // the words that say *what* is wanted (the phrase around the product noun); the rest only helps ranking
    // ("gauge for steam line" -> need: gauge; "ss ball valve" -> need: stainless, ball, valve)
    const phrase = this.headPhrase(text);
    const need = new Set(terms.filter((t) => this.stockVocab.has(t) && !brandHit?.doc.title.has(t) && (!phrase || phrase.has(t))));
    if (brand && !need.size) return this.brandAnswer(brand, want, ctx);

    const titleCovers = (h: Hit) => [...need].every((t) => h.titleMatched.has(t));
    // the product nouns ("valve", "gauge") must be in the product's name; other words may match anywhere
    const covers = (h: Hit) => [...need].every((t) => (this.heads.has(t) ? h.titleMatched.has(t) : h.matched.has(t)));
    const groups = hits.filter((h) => (h.doc.kind === 'category' || h.doc.kind === 'type') && titleCovers(h));
    const products = hits.filter((h) => h.doc.kind === 'product' && (!brand || this.products.get(h.doc.id)?.brandSlug === brand));
    const strong = products.filter(titleCovers);

    // "Polyhydron valves", "Taparia tools": a brand with a word that spans several categories
    if (brand && new Set(groups.map((g) => (g.doc.kind === 'type' ? this.types.get(g.doc.id)?.categorySlug : g.doc.id))).size > 1) {
      return this.brandAnswer(brand, want, ctx, strong.map((h) => h.doc.id));
    }

    // the exact name of a product ("Box Spanners") wins outright
    const exactName = normalise(text).replace(/[^a-z0-9]+/g, ' ').trim();
    const exactHit = products.find((h) => normalise(this.products.get(h.doc.id)!.name).replace(/[^a-z0-9]+/g, ' ').trim() === exactName);
    if (exactHit) return this.productAnswer(this.products.get(exactHit.doc.id)!, want, sizes, ctx);

    // groups that name the product nouns, even if a qualifier isn't matched ("ss ball valve" -> ball valves)
    const headNeed = [...need].filter((t) => this.heads.has(t));
    const looseGroups = groups.length ? groups : hits.filter((h) => (h.doc.kind === 'category' || h.doc.kind === 'type') && headNeed.length > 0 && headNeed.every((t) => h.titleMatched.has(t)));
    const group = looseGroups[0];
    const best = strong[0] ?? products.find(covers);
    if (!groups.length && group && !best) {
      // the qualifier isn't in any product: show the group, and hand the exact item to the team
      const extra = [...need].filter((t) => !group.doc.title.has(t));
      const r = group.doc.kind === 'category'
        ? this.categoryAnswer(group.doc.id, [], want, ctx, brand, [], terms)
        : this.typeAnswer(this.types.get(group.doc.id)!, [], want, ctx, brand, [], terms);
      return this.withTeamNote(r, this.phrase(terms, new Set(extra)), text);
    }
    const exactGroup = groups[0];
    if (exactGroup && (!best || strong.length > 2 || (strong.length !== 1 && exactGroup.doc.title.size >= best.titleMatched.size))) {
      const group = exactGroup;
      if (group.doc.kind === 'category') return this.categoryAnswer(group.doc.id, strong.map((h) => h.doc.id), want, ctx, brand, sizes, terms);
      const t = this.types.get(group.doc.id)!;
      const inType = products.filter((h) => this.products.get(h.doc.id)?.productType === t.slug);
      if (inType.length === 1 && !sizes.length) return this.productAnswer(this.products.get(inType[0].doc.id)!, want, sizes, ctx);
      return this.typeAnswer(t, inType.map((h) => h.doc.id), want, ctx, brand, sizes, terms);
    }

    if (best) {
      const top = strong.length ? strong : products.filter(covers);
      if (sizes.length) {
        const all = top.map((h) => this.products.get(h.doc.id)!);
        const withSize = all.filter((p) => this.hasSize(p, sizes));
        if (withSize.length === 1) return this.productAnswer(withSize[0], want, sizes, ctx);
        if (withSize.length > 1) return this.sizeList(withSize, sizes, ctx);
        if (all.length === 1) return this.productAnswer(all[0], want, sizes, ctx);
        return this.contactTeam(text, `For **${[...need].join(' ')}** in **${sizes.map((s) => s.label).join(', ')}**, `, all.slice(0, 3), ctx, this.listedSizes(all, sizes));
      }
      if (top.length === 1 || top[0].score > top[1].score * 1.35) return this.productAnswer(this.products.get(top[0].doc.id)!, want, sizes, ctx);
      return this.productList(top.slice(0, 8).map((h) => this.products.get(h.doc.id)!), want, ctx);
    }

    // Partial match only: show what's closest, and offer the team.
    const near = products.filter((h) => h.titleMatched.size > 0).slice(0, 3).map((h) => this.products.get(h.doc.id)!);
    return this.contactTeam(text, '', near, ctx);
  }

  // ------------------------------------------------------------------------------------- glossary

  private termMatches(q: string): HydraTerm[] {
    const qt = ` ${tokens(q, true).join(' ')} `;
    const found: { t: HydraTerm; at: number; len: number }[] = [];
    for (const t of this.terms) {
      let bestAt = -1;
      let bestLen = 0;
      for (const phrase of [t.name, ...t.aka]) {
        const pt = tokens(phrase, true).join(' ');
        if (!pt) continue;
        const at = qt.indexOf(` ${pt} `);
        if (at >= 0 && pt.length > bestLen) {
          bestAt = at;
          bestLen = pt.length;
        }
      }
      if (bestAt >= 0) found.push({ t, at: bestAt, len: bestLen });
    }
    // drop a term contained in a longer matched one ("check valve" inside "pilot operated check valve")
    const keep = found.filter((f) => !found.some((g) => g !== f && g.len > f.len && f.at >= g.at && f.at + f.len <= g.at + g.len));
    return keep.sort((a, b) => a.at - b.at).map((f) => f.t);
  }

  private glossary(q: string, want: Want, ctx: HydraContext): HydraReply | undefined {
    const definitional = /\b(what (is|are|does|do)|what's|whats|meaning|means|explain|define|definition|tell me about|difference|differ|compare|versus|vs\.?|how does|purpose|used for|uses? of|where (is|are) .* used|why)\b/.test(q);
    if (!definitional && want !== 'compare' && want !== 'howto') return undefined;
    const ts = this.termMatches(q);
    if (!ts.length) return undefined;
    if (!definitional && want === 'howto' && !ts[0].howto) return undefined;
    const blocks: HydraBlock[] = [];
    const related: Product[] = [];
    const take = (t: HydraTerm, n: number) => {
      const hits = this.search(tokens(t.name, true), ['product']).filter((h) => [...docTokens(t.name)].every((w) => h.titleMatched.has(w) || h.matched.has(w)));
      for (const h of hits.slice(0, n)) {
        const p = this.products.get(h.doc.id)!;
        if (!related.includes(p)) related.push(p);
      }
    };
    if ((want === 'compare' || /\b(difference|differ|vs|versus|compare)\b/.test(q)) && ts.length >= 2) {
      for (const t of ts.slice(0, 3)) {
        blocks.push({ kind: 'text', text: `**${capitalise(t.name)}:** ${t.what}${t.uses ? ` Used for: ${lowerFirst(t.uses)}` : ''}` });
        take(t, 2);
      }
    } else {
      const t = ts[0];
      if (want === 'uses' && t.uses) blocks.push({ kind: 'text', text: `**Where ${plural(t.name)} are used:** ${t.uses}` }, { kind: 'text', text: t.what });
      else if (want === 'howto' && t.howto) blocks.push({ kind: 'text', text: `**Using a ${t.name}:** ${t.howto}` }, { kind: 'text', text: 'For your exact application, our team is happy to advise.' });
      else {
        blocks.push({ kind: 'text', text: t.what });
        if (t.uses) blocks.push({ kind: 'text', text: `**Typical uses:** ${t.uses}` });
      }
      take(t, MAX_CARDS);
    }
    if (related.length) {
      blocks.push({ kind: 'text', text: related.length === 1 ? 'We supply:' : 'From our range:' });
      blocks.push({ kind: 'products', items: related.slice(0, MAX_CARDS).map((p) => this.card(p)) });
    }
    const chips = related.length === 1 ? ['What sizes are available?', 'Specifications', 'Price?'] : related.slice(0, 3).map((p) => shortName(p.name));
    return { blocks, chips, context: { products: related.slice(0, 6).map((p) => p.slug), category: related[0] ? this.categoryOf(related[0])?.slug : ctx.category }, intent: ts.length > 1 ? 'glossary-compare' : 'glossary' };
  }

  // -------------------------------------------------------------------------------- what is asked

  private wants(q: string): Want {
    // "how much pressure can it take" asks for a spec, not a price
    if (/\b(price|prices|pricing|cost|costs|rate|rates|mrp|quotation|quote|how much(?! (pressure|load|weight|temperature|flow|current|voltage|torque|force|capacity|oil|power))|cheap|cheapest|expensive|discount|rs\.?|₹)\b/.test(q)) return 'price';
    if (/\b(difference|differ|compare|comparison|versus|vs\.?)\b/.test(q)) return 'compare';
    if (/\b(how (do|should|can|to|would)|install|installation|installing|fitting it|fit it|mount it|mounting|operate|operating|operation|adjust|adjustment|setting|set the|maintain|maintenance|connect|connecting|calibrat|tighten|safety|precaution|care)\b/.test(q)) return 'howto';
    if (/\b(sizes?|dimensions?|measurements?|variants?|bore|thread sizes?|lengths?|capacit(y|ies)|which sizes|what sizes|come in|comes in|available in|in what size)\b/.test(q)) return 'sizes';
    if (/\b(uses?|used|usage|applications?|purpose|what is it for|what for|where (is|are|can|do)|suitable|why)\b/.test(q)) return 'uses';
    if (/\b(which (one|should|is best|to choose)|which \w+( \w+)? (for|to use)|choose|choosing|select|selection|recommend|suggest|best for|suitable for)\b/.test(q)) return 'choose';
    if (/\b(specs?|specifications?|technical|ratings?|pressure rating|max(imum)? pressure|working pressure|temperature|material|weight|flow rate|port|standard|accuracy|voltage)\b|\bhow much (pressure|load|weight)\b/.test(q)) return 'specs';
    if (/\b(in stock|stock|available|availability|lead time|ready stock|when can i get|how soon)\b/.test(q)) return 'stock';
    return 'overview';
  }

  private codeHits(text: string): string[] {
    const ids = new Set<string>();
    // "Delta IP gauge", "UP pressure gauge": a two-letter code typed in capitals, or next to its brand name
    const brandSaid = (slug: string) => {
      const b = this.products.get(slug)?.brandSlug;
      const name = b ? this.brands.get(b)?.name.toLowerCase() : undefined;
      return !!name && text.toLowerCase().includes(name);
    };
    for (const m of text.matchAll(/(?<![A-Za-z0-9-])([A-Za-z]{2})(?![A-Za-z0-9-])/g)) {
      const typed = m[1];
      for (const slug of this.shortCodes.get(typed.toUpperCase()) ?? []) {
        if (typed === typed.toUpperCase() || brandSaid(slug)) ids.add(`p:${slug}`);
      }
    }
    for (const c of queryCodes(text)) {
      // letters-only codes ("TIFP", "PPM") count when typed in capitals or when they aren't ordinary words
      if (/^[A-Z]+$/.test(c) && !new RegExp(`\\b${c}\\b`).test(text)) {
        const w = c.toLowerCase();
        if (this.vocab.has(w) || this.vocab.has(w.replace(/s$/, '')) || STOPWORDS.has(w) || INTENT_WORDS.has(w) || w.length < 4) continue;
      }
      for (const id of this.codes.get(c) ?? []) ids.add(id);
      if (!ids.size) for (const id of this.looseCodes.get(stripLead(c)) ?? []) ids.add(id);
    }
    return [...ids];
  }

  // ------------------------------------------------------------------------------------- products

  private card(p: Product): HydraProductCard {
    const type = this.types.get(p.productType);
    const cat = type ? this.categories.get(type.categorySlug) : undefined;
    const brand = p.brandSlug ? this.brands.get(p.brandSlug)?.name : undefined;
    return { slug: p.slug, name: p.name, meta: [brand, cat?.name].filter(Boolean).join(' · '), image: p.images?.[0] };
  }

  private categoryOf(p: Product) {
    const t = this.types.get(p.productType);
    return t ? this.categories.get(t.categorySlug) : undefined;
  }

  private productAnswer(p: Product, want: Want, sizes: SizeAsk[], ctx: HydraContext, byCode = false, also: Product[] = [], focus: string[] = []): HydraReply {
    this.focus = focus;
    const r = this.productAnswerCore(p, want, sizes, ctx, byCode);
    if (also.length) {
      const i = r.blocks.findIndex((b) => b.kind === 'contact');
      r.blocks.splice(i < 0 ? r.blocks.length : i, 0, { kind: 'text', text: 'Also in this range:' }, { kind: 'products', items: also.slice(0, 3).map((x) => this.card(x)) });
      r.context = { ...r.context, products: [p.slug, ...also.slice(0, 3).map((x) => x.slug)] };
    }
    return r;
  }

  private productAnswerCore(p: Product, want: Want, sizes: SizeAsk[], ctx: HydraContext, byCode = false): HydraReply {
    const n = this.notes[p.slug] ?? {};
    const cat = this.categoryOf(p);
    const g = cat ? this.guide[cat.slug] : undefined;
    const brand = p.brandSlug ? this.brands.get(p.brandSlug)?.name : undefined;
    const blocks: HydraBlock[] = [];
    const context: HydraContext = { products: [p.slug], category: cat?.slug, brand: p.brandSlug };
    const name = `**${p.name}**${brand ? ` (${brand})` : ''}`;

    if (sizes.length) {
      const rows = this.rowsFor(p, sizes);
      const label = sizes.map((s) => s.label).join(', ');
      const v = p.variants?.find((t) => t.rows?.length);
      if (rows.length && !v) {
        blocks.push({ kind: 'text', text: `Yes — ${name} is listed with **${label}**:` });
        blocks.push({ kind: 'list', items: rows[0] });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p, label) });
        return { blocks, chips: ['Where is it used?', 'Specifications'], context, intent: 'product-size-match' };
      }
      if (rows.length && v) {
        blocks.push({ kind: 'text', text: `Yes — ${name} is listed in **${label}**:` });
        blocks.push(this.table(v.columns, rows));
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p, label) });
        return { blocks, chips: ['Where is it used?', 'Specifications', 'All sizes'], context, intent: 'product-size-match' };
      }
      const lines = this.catalogueLines(p, sizes);
      if (lines.length) {
        blocks.push({ kind: 'text', text: `Yes — the catalogue lists ${name} in **${label}**:` });
        blocks.push({ kind: 'list', items: lines });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p, label) });
        return { blocks, chips: ['Where is it used?', 'Specifications', 'All sizes'], context, intent: 'product-size-match' };
      }
      if (v || this.allSpecs(p).length) {
        blocks.push({ kind: 'text', text: `For ${name} in **${label}**, please contact our team — they can check stock or source that size for you.` });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p, label) });
        return { blocks, chips: ['Which sizes are listed?', 'Where is it used?'], context, intent: 'product-size-team' };
      }
    }

    switch (want) {
      case 'sizes': {
        const v = p.variants?.find((t) => t.rows?.length);
        if (v) {
          const facts = productFacts(p);
          blocks.push({ kind: 'text', text: `${name} — ${facts[0] ?? `${v.rows.length} sizes are listed.`}` });
          blocks.push(this.table(v.columns, v.rows.slice(0, 10), v.rows.length > 10 ? `Showing 10 of ${v.rows.length} — see the product page for the full table.` : undefined));
        } else {
          const sizeSpecs = this.allSpecs(p).filter(([l]) => /size|dn|port|thread|range|capacity|length|dial|bore|connection|dimension|diameter|nominal/i.test(l));
          if (sizeSpecs.length) {
            blocks.push({ kind: 'text', text: `Here's what the catalogue lists for ${name}:` });
            blocks.push({ kind: 'specs', rows: sizeSpecs.slice(0, 8) });
          } else {
            blocks.push({ kind: 'text', text: `The catalogue doesn't list separate sizes for ${name}. Please contact our team with the size you need — they'll confirm it for you.` });
          }
        }
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p) });
        return { blocks, chips: ['Where is it used?', 'How do I use it?', 'Price?'], context, intent: 'product-sizes' };
      }
      case 'uses': {
        const own = [...(n.uses ?? [])];
        blocks.push({ kind: 'text', text: `${name}${p.shortDescription ? ` — ${lowerFirst(p.shortDescription)}` : ''}` });
        if (own.length) blocks.push({ kind: 'list', title: 'From the catalogue', items: own.slice(0, 5) });
        if (g?.uses) blocks.push({ kind: 'text', text: `**Typical uses for ${lowerName(cat!.name)}:** ${g.uses}` });
        if (!own.length && !g?.uses) blocks.push({ kind: 'text', text: 'Tell our team about your application and they will confirm it suits.' });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p) });
        return { blocks, chips: ['Sizes', 'How do I use it?', 'Specifications'], context, intent: 'product-uses' };
      }
      case 'howto': {
        const own = [...(n.howto ?? [])];
        blocks.push({ kind: 'text', text: `Using ${name}:` });
        if (own.length) blocks.push({ kind: 'list', title: 'From the catalogue', items: own.slice(0, 6) });
        if (g?.howto) blocks.push({ kind: 'text', text: `**General guidance:** ${g.howto}` });
        blocks.push({ kind: 'text', text: 'For your exact setup, our team is happy to advise.' });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p) });
        return { blocks, chips: ['Where is it used?', 'Specifications', 'Sizes'], context, intent: 'product-howto' };
      }
      case 'specs': {
        const specs = this.allSpecs(p);
        const { rows: focus, asked } = this.specFocus(specs, p);
        if (asked && !focus.length) {
          blocks.push({ kind: 'text', text: `The catalogue doesn't mention ${asked} for ${name}. Please ask our team — they'll confirm it for you.` });
          if (specs.length) blocks.push({ kind: 'specs', title: 'What the catalogue does list', rows: specs.slice(0, 8) });
        } else {
          blocks.push({ kind: 'text', text: specs.length ? `${focus.length ? 'From the catalogue' : 'Specifications'} for ${name}:` : `The catalogue doesn't list detailed specifications for ${name}. Our team can share the datasheet details you need.` });
          if (specs.length) blocks.push({ kind: 'specs', rows: (focus.length ? focus : specs).slice(0, 12) });
        }
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p) });
        return { blocks, chips: ['Sizes', 'Where is it used?', 'How do I use it?'], context, intent: 'product-specs' };
      }
      case 'stock':
        blocks.push({ kind: 'text', text: `We supply ${name}. Stock changes from day to day, so our team will confirm availability and delivery time for the size and quantity you need.` });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p), label: 'Check availability' });
        return { blocks, chips: ['Sizes', 'Specifications', 'Price?'], context, intent: 'product-stock' };
      case 'price':
        blocks.push({ kind: 'text', text: `Prices for ${name} depend on the size, quantity and current stock, so our team shares them on request. Send a message and they'll reply with a quote.` });
        blocks.push({ kind: 'products', items: [this.card(p)] });
        blocks.push({ kind: 'contact', message: this.enquiry(p, undefined, true), label: 'Ask for a price' });
        return { blocks, chips: ['Sizes', 'Specifications'], context, intent: 'product-price' };
      case 'choose':
        if (g?.choose) {
          blocks.push({ kind: 'text', text: `To pick the right ${lowerName(cat!.name)}: ${g.choose}` });
          blocks.push({ kind: 'products', items: [this.card(p)] });
          blocks.push({ kind: 'contact', message: this.enquiry(p) });
          return { blocks, chips: ['Sizes', 'Specifications'], context, intent: 'product-choose' };
        }
    }

    // overview
    const lead = byCode ? `Yes — that's ${name}.` : `We supply ${name}.`;
    const desc = p.shortDescription ?? '';
    const about = (n.about ?? []).filter((s) => !overlaps(s, desc)).slice(0, 2);
    blocks.push({ kind: 'text', text: [lead, desc].filter(Boolean).join(' ') });
    if (about.length) blocks.push({ kind: 'text', text: about.join(' ') });
    const feats = [...(p.features ?? []), ...(n.features ?? [])].slice(0, 4);
    if (feats.length) blocks.push({ kind: 'list', items: feats });
    const facts = productFacts(p).filter((f) => !/^Specifications include/.test(f)).slice(0, 2);
    if (facts.length) blocks.push({ kind: 'text', text: facts.join(' ') });
    blocks.push({ kind: 'products', items: [this.card(p)] });
    blocks.push({ kind: 'contact', message: this.enquiry(p) });
    const chips = [p.variants?.length ? 'What sizes are available?' : 'Specifications', 'Where is it used?', 'How do I use it?'];
    return { blocks, chips, context, intent: 'product' };
  }

  private allSpecs(p: Product): [string, string][] {
    const seen = new Set<string>();
    const out: [string, string][] = [];
    for (const [l, v] of [...(p.specifications ?? []).map((s) => [s.label, s.value] as [string, string]), ...(this.notes[p.slug]?.specs ?? [])]) {
      const k = l.toLowerCase().replace(/[^a-z]/g, '');
      if (seen.has(k)) continue;
      seen.add(k);
      out.push([l, v]);
    }
    return out;
  }

  /** "What is the pressure rating?" / "voltage options?" -> just those rows (from specs and the size table headers). */
  private focus: string[] = [];
  private specFocus(specs: [string, string][], p: Product): { rows: [string, string][]; asked: string } {
    const q = this.lastQ;
    const topics = ['pressure', 'temperature', 'material', 'flow', 'weight|mass', 'port|thread|connection', 'voltage|power|coil|solenoid', 'standard', 'accuracy', 'viscosity', 'seal', 'dial|size', 'range', 'capacity|load|swl|wll', 'lift|height', 'length'];
    const asked = topics.filter((t) => new RegExp(`\\b(${t})`).test(q));
    const words = this.focus.filter((w) => w.length > 2);
    if (!asked.length && !words.length) return { rows: [], asked: '' };
    const hit = (s: string) => asked.some((t) => new RegExp(`(${t})`, 'i').test(s)) || words.some((w) => docTokens(s).includes(w));
    const rows = specs.filter(([l, v]) => hit(l) || (asked.includes('pressure') && /\bbar\b/i.test(v)));
    // size-table columns ("Lift (m)", "Capacity (t)") answer too
    const v = p.variants?.find((t) => t.rows?.length);
    if (v && !rows.length) {
      v.columns.forEach((c, i) => {
        if (i === 0 || !hit(c)) return;
        const vals = [...new Set(v.rows.map((r) => r[i]).filter((x) => x && x !== '—'))];
        if (vals.length) rows.push([c, vals.length > 6 ? `${vals[0]} – ${vals[vals.length - 1]} (${vals.length} options)` : vals.join(', ')]);
      });
    }
    const label = (words.length ? words : asked.map((t) => t.split('|')[0])).join(' ');
    return { rows, asked: label };
  }

  /** Rows of the size table that match every size asked; for products without a table, the matching specification lines. */
  private rowsFor(p: Product, allSizes: SizeAsk[]): string[][] {
    // "3/8 square drive sockets": a size that is in the product's own name is matched by the product itself
    const sizes = allSizes.filter((s) => s.kind === 'threadType' || !rowMatches(['name'], [p.name], s) || !this.nameHasSize(p.name, s));
    const v = p.variants?.find((t) => t.rows?.length);
    if (!sizes.filter((s) => s.kind !== 'threadType').length) return v ? v.rows : [[p.name]];
    if (v) return v.rows.filter((r) => sizes.every((s) => rowMatches(v.columns, r, s)));
    const specs = this.allSpecs(p);
    const lines: string[][] = [];
    for (const s of sizes) {
      if (s.kind === 'threadType') continue;
      const label = ({ mm: /size|dial|dia|nominal|case/i, bar: /range|pressure/i, inch: /size|connection|thread|port/i, dn: /size|dn|bore/i, ton: /capacity|swl|wll|load/i, pair: /size/i, thread: /thread|connection/i, number: /./ } as Record<string, RegExp>)[s.kind] ?? /./;
      const num = s.value.replace(/[.+]/g, '\\$&');
      const hit = specs.find(([l, val]) => label.test(l) && new RegExp(`(^|[^\\d./])${num}(?![\\d/])`).test(val));
      if (!hit) return [];
      lines.push([`${hit[0]}: ${hit[1]}`]);
    }
    return lines.length ? [lines.map((l) => l[0])] : [];
  }

  private table(columns: string[], rows: string[][], note?: string): HydraBlock {
    // keep it readable in a chat bubble: at most 4 columns, preferring identifiers and sizes
    const pref = columns
      .map((c, i) => ({ c, i, w: i === 0 ? 10 : /size|dn|thread|bsp|npt|inch|mm|length|opening|capacity|range|dia|model|type|pressure|\(t\)/i.test(c) ? 5 : /weight|pkg|qty|code/i.test(c) ? 0 : 2 }))
      .sort((a, b) => b.w - a.w || a.i - b.i)
      .slice(0, 4)
      .sort((a, b) => a.i - b.i);
    return { kind: 'table', columns: pref.map((x) => x.c), rows: rows.map((r) => pref.map((x) => String(r[x.i] ?? ''))), note };
  }

  private productList(ps: Product[], want: Want, ctx: HydraContext, intro?: string, sizes: SizeAsk[] = []): HydraReply {
    const cats = new Set(ps.map((p) => this.categoryOf(p)?.slug));
    const cat = cats.size === 1 ? this.categoryOf(ps[0]) : undefined;
    const blocks: HydraBlock[] = [];
    const sizeLabel = sizes.map((s) => s.label).join(', ');
    blocks.push({ kind: 'text', text: intro ?? (sizes.length ? `These are listed in **${sizeLabel}**:` : `Here's what we have that matches:`) });
    blocks.push({ kind: 'products', items: ps.slice(0, MAX_CARDS).map((p) => this.card(p)) });
    if (ps.length > MAX_CARDS && cat) blocks.push({ kind: 'links', items: [{ label: `See all ${cat.name}`, url: `/categories/${cat.slug}` }] });
    if (want !== 'overview') blocks.push({ kind: 'text', text: 'Tap a product, or tell me which one you mean, and I\'ll answer for that one.' });
    return { blocks, chips: ps.slice(0, 3).map((p) => shortName(p.name)), context: { products: ps.slice(0, 6).map((p) => p.slug), category: cat?.slug }, intent: 'product-list' };
  }

  /** Size lines from the catalogue itself, for sizes the website's table doesn't show (e.g. coupling thread sizes). */
  private catalogueLines(p: Product, sizes: SizeAsk[]): string[] {
    const lines = this.notes[p.slug]?.sizes ?? [];
    return lines.filter((l) => sizes.every((s) => rowMatches(['size'], [l], s))).slice(0, 6);
  }

  private hasSize(p: Product, sizes: SizeAsk[]): boolean {
    return this.rowsFor(p, sizes).length > 0 || this.catalogueLines(p, sizes).length > 0;
  }

  private nameHasSize(name: string, s: SizeAsk): boolean {
    const n = name.toLowerCase().replace(/\s+/g, '');
    if (s.kind === 'mm') return n.includes(`${s.value}mm`);
    if (s.kind === 'inch') return new RegExp(`(^|[^\\d/])${s.value.replace(/[.]/g, '\\.')}(?![\\d/])`).test(n) && /drive|\(|"|”|inch/.test(name.toLowerCase());
    if (s.kind === 'pair') return n.includes(s.value);
    return false;
  }

  /** "TS 10 x 11 · Size (mm): 10 x 11" — the row's identifier plus the cells that matched the size asked. */
  private evidence(p: Product, sizes: SizeAsk[]): string {
    if (!this.rowsFor(p, sizes).length) return this.catalogueLines(p, sizes)[0] ?? '';
    const r = this.rowsFor(p, sizes)[0] ?? [];
    const v = p.variants?.find((t) => t.rows?.length);
    if (!v) return r.join(' · ');
    const cols = new Set<number>();
    for (const size of sizes) {
      r.forEach((c, i) => {
        const probe = r.map((x, j) => (j === i ? x : ''));
        if (i > 0 && rowMatches(v.columns, probe, size)) cols.add(i);
      });
    }
    const id = /product|part|item|model|type|code|^no|size|thread/i.test(v.columns[0] ?? '') ? r[0] : `${v.columns[0]}: ${r[0]}`;
    const parts = [id, ...[...cols].map((i) => `${v.columns[i]}: ${r[i]}`)].filter((x) => x && !/: —$/.test(x) && x !== '—');
    return parts.join(' · ');
  }

  /** Several products listed in the size asked for: one row per product with its matching part number. */
  private sizeList(ps: Product[], sizes: SizeAsk[], ctx: HydraContext, intro?: string): HydraReply {
    const label = sizes.map((s) => s.label).join(', ');
    const rows = ps.slice(0, 8).map((p) => [shortName(p.name), this.evidence(p, sizes)]);
    return {
      blocks: [
        { kind: 'text', text: intro ?? `**${label}** is listed in ${ps.length} of our products:` },
        { kind: 'table', columns: ['Product', 'Listed as'], rows, note: ps.length > 8 ? `…and ${ps.length - 8} more.` : undefined },
        { kind: 'products', items: ps.slice(0, MAX_CARDS).map((p) => this.card(p)) },
        { kind: 'contact', message: `Hello ${COMPANY.name},\n\nI'm looking for ${label}: ${ps.slice(0, 3).map((p) => p.name).join(' / ')}.\nPlease share availability and price.\n\nThank you.` },
      ],
      chips: ps.slice(0, 3).map((p) => shortName(p.name)),
      context: { products: ps.slice(0, 6).map((p) => p.slug), category: this.categoryOf(ps[0])?.slug },
      intent: 'size-list',
    };
  }

  private pickOne(ps: Product[], want: Want, ctx: HydraContext): HydraReply {
    return {
      blocks: [
        { kind: 'text', text: 'Which one do you mean?' },
        { kind: 'products', items: ps.slice(0, MAX_CARDS).map((p) => this.card(p)) },
      ],
      chips: ps.slice(0, 3).map((p) => `${wantPhrase(want)} ${shortName(p.name)}`.trim()),
      context: ctx,
      intent: 'pick-one',
    };
  }

  // ----------------------------------------------------------------------------- categories & brands

  /** Pool ordered by search rank first (ids), then the rest in catalogue order. */
  private rank(ids: string[], pool: Product[]): Product[] {
    const set = new Set(pool);
    const first = ids.map((id) => this.products.get(id)).filter((p): p is Product => !!p && set.has(p));
    return [...first, ...pool.filter((p) => !first.includes(p))];
  }

  private pickCards(ids: string[], pool: Product[], limit = MAX_CARDS): Product[] {
    const chosen = ids.map((id) => this.products.get(id)).filter((p): p is Product => !!p && pool.includes(p));
    for (const p of pool) {
      if (chosen.length >= limit) break;
      if (!chosen.includes(p) && p.images?.[0]?.startsWith('/assets/')) chosen.push(p);
    }
    for (const p of pool) {
      if (chosen.length >= limit) break;
      if (!chosen.includes(p)) chosen.push(p);
    }
    return chosen.slice(0, limit);
  }

  /** Guide sentences that mention the extra words of the question ("pressure gauge for **steam**" -> the syphon tip). */
  private goodToKnow(slug: string, terms: string[], skip: string): string[] {
    const g = this.guide[slug];
    if (!g) return [];
    const own = new Set(docTokens(`${this.categories.get(slug)?.name ?? ''} ${this.data.types.filter((x) => x.categorySlug === slug).map((x) => x.name).join(' ')}`));
    const extra = terms.filter((t) => !this.heads.has(t) && t.length > 3 && !own.has(t));
    if (!extra.length) return [];
    const sentences = [g.what, g.uses, g.howto, g.choose].join(' ').split(/(?<=\.)\s+/);
    const clauses = sentences.flatMap((s) => s.split(/,\s+(?=and\s|or\s)?|;\s+/).map((c) => ({ c, s })));
    const hits = new Set<string>();
    for (const { c, s } of clauses) if (extra.some((t) => docTokens(c).includes(t)) && !skip.includes(s)) hits.add(s.trim());
    return [...hits].slice(0, 2);
  }

  private categoryAnswer(slug: string, ranked: string[], want: Want, ctx: HydraContext, brand?: string, sizes: SizeAsk[] = [], terms: string[] = []): HydraReply {
    const c = this.categories.get(slug)!;
    const g = this.guide[slug];
    let pool = this.data.products.filter((p) => this.categoryOf(p)?.slug === slug && (!brand || p.brandSlug === brand));
    if (!pool.length) pool = this.data.products.filter((p) => this.categoryOf(p)?.slug === slug);
    const brands = [...new Set(pool.map((p) => (p.brandSlug ? this.brands.get(p.brandSlug)?.name : undefined)).filter(Boolean))];
    const name = lowerName(c.name);
    const blocks: HydraBlock[] = [];
    const context: HydraContext = { products: [], category: slug, brand };

    if (sizes.length) {
      const withSize = this.rank(ranked, pool).filter((p) => this.hasSize(p, sizes));
      if (withSize.length === 1) return this.productAnswer(withSize[0], want, sizes, ctx);
      if (withSize.length) return this.sizeList(withSize, sizes, ctx, `These ${name} are listed in **${sizes.map((s) => s.label).join(', ')}**:`);
      return this.contactTeam(`${sizes.map((s) => s.label).join(' ')} ${c.name}`, `For ${name} in **${sizes.map((s) => s.label).join(', ')}**, `, this.rank(ranked, pool).slice(0, 3), ctx, this.listedSizes(this.rank(ranked, pool).slice(0, 6), sizes));
    }

    // "pressure gauges" then "accuracy?" / "pressure rating?": that line of each product's specifications
    const specTerms = terms.filter((t) => SPEC_TERMS.has(t));
    if (want === 'specs' && specTerms.length) {
      this.focus = specTerms;
      const listed = this.rank(ranked, pool)
        .map((p) => {
          const f = this.specFocus(this.allSpecs(p), p);
          return { p, value: f.rows.map(([l, v]) => (f.rows.length > 1 ? `${l}: ${v}` : v)).join('; ') };
        })
        .filter((x) => x.value);
      if (listed.length) {
        const shown = listed.slice(0, 8);
        return {
          blocks: [
            { kind: 'text', text: `From the catalogue, for our ${name}:` },
            { kind: 'table', columns: ['Product', capitalise(specTerms.join(' '))], rows: shown.map((x) => [shortName(x.p.name), x.value]), note: listed.length > 8 ? `…and ${listed.length - 8} more.` : undefined },
            { kind: 'products', items: shown.slice(0, MAX_CARDS).map((x) => this.card(x.p)) },
            { kind: 'links', items: [{ label: `See all ${c.name}`, url: `/categories/${slug}`, queryParams: brand ? { brand } : undefined }] },
          ],
          chips: shown.slice(0, 3).map((x) => shortName(x.p.name)),
          context: { products: shown.slice(0, 6).map((x) => x.p.slug), category: slug, brand },
          intent: 'category-specs-table',
        };
      }
    }

    let lead = '';
    if (want === 'uses' && g?.uses) lead = `**Where ${name} are used:** ${g.uses}`;
    else if (want === 'howto' && g?.howto) lead = `**Using ${name}:** ${g.howto}`;
    else if ((want === 'choose' || want === 'specs' || want === 'sizes') && g?.choose) lead = `**Choosing ${name}:** ${g.choose}`;
    else if (want === 'price') lead = `Prices for ${name} depend on the model, size and quantity — our team will send you a quote.`;
    else {
      const brandText = brands.length ? ` from ${joinWords(brands as string[])}` : '';
      lead = `Yes — we supply **${pool.length} ${name}**${brandText}.${g?.what ? ' ' + g.what : ''}`;
    }
    blocks.push({ kind: 'text', text: lead });
    const tips = this.goodToKnow(slug, terms, lead);
    if (tips.length) blocks.push({ kind: 'text', text: `**Good to know:** ${tips.join(' ')}` });
    blocks.push({ kind: 'products', items: this.pickCards(ranked, pool).map((p) => this.card(p)) });
    blocks.push({ kind: 'links', items: [{ label: `See all ${c.name}`, url: `/categories/${slug}`, queryParams: brand ? { brand } : undefined }] });
    if (want === 'price' || want === 'choose') blocks.push({ kind: 'contact', message: `Hello ${COMPANY.name},\n\n${want === 'price' ? 'Please share prices for' : 'Please help me choose'} ${c.name}${brand ? ` (${this.brands.get(brand)?.name})` : ''}.\n\nThank you.` });
    const sc = shortCat(c.name);
    const chips = [`Where are ${sc} used?`, `How do I choose ${sc}?`, `How to use ${sc}?`].filter((x) => !(want === 'uses' && /used\?$/.test(x)) && !(want === 'choose' && /choose/.test(x)) && !(want === 'howto' && /How to use/.test(x)));
    return { blocks, chips: chips.slice(0, 3), context, intent: `category-${want}` };
  }

  private typeAnswer(t: ProductType, ranked: string[], want: Want, ctx: HydraContext, brand?: string, sizes: SizeAsk[] = [], terms: string[] = []): HydraReply {
    const pool = this.data.products.filter((p) => p.productType === t.slug && (!brand || p.brandSlug === brand));
    if (!pool.length) return this.categoryAnswer(t.categorySlug, ranked, want, ctx, brand, sizes, terms);
    const ordered = this.rank(ranked, pool);
    const context: HydraContext = { products: ordered.slice(0, 6).map((p) => p.slug), category: t.categorySlug, brand };
    if (sizes.length) {
      const withSize = ordered.filter((p) => this.hasSize(p, sizes));
      if (withSize.length === 1) return this.productAnswer(withSize[0], want, sizes, ctx);
      if (withSize.length) return this.sizeList(withSize, sizes, ctx, `These ${lowerName(t.name)} are listed in **${sizes.map((s) => s.label).join(', ')}**:`);
      return this.contactTeam(`${sizes.map((s) => s.label).join(' ')} ${t.name}`, `For ${lowerName(t.name)} in **${sizes.map((s) => s.label).join(', ')}**, `, ordered.slice(0, 3), ctx, this.listedSizes(ordered, sizes));
    }
    // "pallet truck capacity", "vane pump sizes": one line per product
    if ((want === 'sizes' || want === 'specs') && pool.length > 1) {
      this.focus = terms.filter((x) => !docTokens(t.name).includes(x));
      const rows = ordered.slice(0, 8).map((p) => {
        const f = this.specFocus(this.allSpecs(p), p).rows;
        const facts = productFacts(p)[0]?.replace(/\.$/, '');
        const value = f.length ? f.map(([l, v]) => (f.length > 1 ? `${l}: ${v}` : v)).join('; ') : want === 'sizes' ? facts : this.allSpecs(p).slice(0, 2).map(([l, v]) => `${l}: ${v}`).join('; ');
        return [shortName(p.name), value || '—'];
      });
      if (rows.some((r) => r[1] !== '—')) {
        const label = this.focus.length ? capitalise(this.focus.join(' ')) : want === 'sizes' ? 'Sizes' : 'Specifications';
        return {
          blocks: [
            { kind: 'text', text: `${capitalise(t.name)} — from the catalogue:` },
            { kind: 'table', columns: ['Product', label], rows, note: pool.length > 8 ? `…and ${pool.length - 8} more in the category.` : undefined },
            { kind: 'products', items: ordered.slice(0, MAX_CARDS).map((p) => this.card(p)) },
          ],
          chips: ordered.slice(0, 3).map((p) => shortName(p.name)),
          context,
          intent: `type-${want}-table`,
        };
      }
    }
    if (want !== 'overview' && pool.length > 1) {
      const c = this.categories.get(t.categorySlug)!;
      const g = this.guide[c.slug];
      const text =
        want === 'uses' && g?.uses ? `**Where ${lowerName(c.name)} are used:** ${g.uses}`
          : want === 'howto' && g?.howto ? `**Using ${lowerName(c.name)}:** ${g.howto}`
            : want === 'price' ? `Prices depend on the model, size and quantity — our team will send you a quote.`
              : g?.choose ? `**Choosing ${lowerName(c.name)}:** ${g.choose}` : '';
      const blocks: HydraBlock[] = [];
      if (text) blocks.push({ kind: 'text', text });
      const cards = this.pickCards(ranked, pool);
      blocks.push({ kind: 'products', items: cards.map((p) => this.card(p)) });
      blocks.push({ kind: 'text', text: 'Pick one and I can give you its exact details.' });
      if (want === 'price') blocks.push({ kind: 'contact', message: `Hello ${COMPANY.name},\n\nPlease share prices for ${t.name}.\n\nThank you.` });
      return { blocks, chips: cards.slice(0, 3).map((p) => `${wantPhrase(want)} ${shortName(p.name)}`.trim()), context: { ...context, products: cards.map((p) => p.slug) }, intent: `type-${want}` };
    }
    const brands = [...new Set(pool.map((p) => (p.brandSlug ? this.brands.get(p.brandSlug)?.name : undefined)).filter(Boolean))];
    const cards = this.pickCards(ranked, pool);
    const blocks: HydraBlock[] = [{ kind: 'text', text: `Yes — we supply **${pool.length} ${lowerName(t.name)}**${brands.length ? ` from ${joinWords(brands as string[])}` : ''}:` }];
    const tips = this.goodToKnow(t.categorySlug, terms, '');
    if (tips.length) blocks.push({ kind: 'text', text: `**Good to know:** ${tips.join(' ')}` });
    blocks.push({ kind: 'products', items: cards.map((p) => this.card(p)) });
    if (pool.length > MAX_CARDS) blocks.push({ kind: 'links', items: [{ label: `See all ${this.categories.get(t.categorySlug)?.name}`, url: `/categories/${t.categorySlug}`, queryParams: { type: t.slug } }] });
    return { blocks, chips: cards.slice(0, 3).map((p) => shortName(p.name)), context: { ...context, products: cards.map((p) => p.slug) }, intent: 'type' };
  }

  private brandAnswer(slug: string, want: Want, ctx: HydraContext, ranked: string[] = []): HydraReply {
    const b = this.brands.get(slug)!;
    const all = this.data.products.filter((p) => p.brandSlug === slug);
    const pool = ranked.length ? this.rank(ranked, all).filter((p) => ranked.includes(p.slug)) : all;
    const cats = [...new Set(pool.map((p) => this.categoryOf(p)?.name).filter(Boolean))] as string[];
    const blocks: HydraBlock[] = [];
    if (want === 'price') blocks.push({ kind: 'text', text: `Prices for ${b.name} products depend on the item, size and quantity — our team will send you a quote.` });
    else blocks.push({ kind: 'text', text: `Yes — we supply **${b.name}**: ${pool.length} products, including ${joinWords(cats.slice(0, 5).map((c) => shortCat(c)))}${cats.length > 5 ? ' and more' : ''}.` });
    blocks.push({ kind: 'products', items: (ranked.length ? pool.slice(0, MAX_CARDS) : this.pickCards([], pool)).map((p) => this.card(p)) });
    blocks.push({ kind: 'links', items: [{ label: `All ${b.name} products`, url: `/brands/${slug}` }] });
    if (want === 'price') blocks.push({ kind: 'contact', message: `Hello ${COMPANY.name},\n\nPlease share prices for ${b.name} products.\n\nThank you.` });
    return { blocks, chips: cats.slice(0, 3).map((c) => `${b.name} ${shortCat(c)}`), context: { products: [], brand: slug }, intent: 'brand' };
  }

  /** A model from a catalogue that isn't listed on the website: describe it, then hand over to the team. */
  private extraAnswer(x: HydraExtra, want: Want, ctx: HydraContext): HydraReply {
    const brand = x.brand ? this.brands.get(x.brand)?.name : undefined;
    const blocks: HydraBlock[] = [{ kind: 'text', text: `**${x.code}**${brand ? ` (${brand})` : ''} — ${x.title}.` }];
    const lines = want === 'specs' || want === 'sizes' ? [] : [...(x.about ?? []), ...(x.uses ?? [])].slice(0, 3);
    if (lines.length) blocks.push({ kind: 'text', text: lines.join(' ') });
    if (x.specs?.length && (want === 'specs' || want === 'sizes' || !lines.length)) blocks.push({ kind: 'specs', rows: x.specs.slice(0, 8) });
    blocks.push({ kind: 'text', text: 'Please contact our team for this model — they will confirm availability and pricing.' });
    blocks.push({ kind: 'contact', message: `Hello ${COMPANY.name},\n\nI'm looking for ${brand ? brand + ' ' : ''}${x.code}. Please let me know availability and price.\n\nThank you.` });
    return { blocks, chips: [], context: { products: [], brand: x.brand ?? undefined }, intent: 'extra' };
  }

  // --------------------------------------------------------------------------- shop & conversation

  private smallTalk(q: string, ctx: HydraContext): HydraReply | undefined {
    const r = (text: string, intent: string, chips = START_CHIPS): HydraReply => ({ blocks: [{ kind: 'text', text }], chips, context: ctx, intent });
    if (/^(hi+|hello+|hey+|hii+|namaste|namaskar|good (morning|afternoon|evening)|greetings|yo|hola|salaam|assalam.*)[\s!.,]*$/.test(q))
      return r(`Hello! I'm Hydra, ${COMPANY.name}'s product assistant. Ask me about any product — sizes, where it's used, how to use it — and I'll find it in our catalogue.`, 'greet');
    if (/^(thanks?|thank you|thx|ty|great|awesome|perfect|nice|cool|ok(ay)?|got it|fine|done|helpful)( (so much|a lot|hydra))?[\s!.]*$/.test(q))
      return r(`You're welcome! Anything else I can help you find?`, 'thanks');
    if (/^((ok|okay|thanks|thank you|thx)[\s,]+)?(bye|bye bye|goodbye|see you|see ya|tata|good night|cya)[\s!.]*$/.test(q)) return r(`Goodbye! Message us on WhatsApp any time you need something.`, 'bye', []);
    if (/^(no+|nope|nah|no thanks?( you)?|nothing( else)?|that'?s (all|it)|thats (all|it)|all good|i'?m good|not now)[\s!.]*$/.test(q))
      return r(`Okay! If you need anything later, ask me here or message our team on WhatsApp.`, 'done', []);
    if (/\b(who are you|what are you|your name|are you (a )?(bot|human|robot|real|ai|person)|who made you|what is hydra)\b/.test(q))
      return r(`I'm Hydra, the product assistant for ${COMPANY.name}. I've learned our product catalogues, so I can help with sizes, uses and specifications. For prices, stock and orders, our team takes over on WhatsApp or phone.`, 'identity');
    if (/\b(what can you do|help me|how (can|do) you help|how does this work|what (can|should) i ask)\b|^help[\s!?.]*$/.test(q)) return this.help(ctx);
    if (/\b(what do you (sell|have|supply|deal)|your products|what products|which products|product range|what all)\b/.test(q)) return this.overviewOfRange(ctx);
    if (/\b(which|what) brands?\b|\bbrands? (do you|you)\b/.test(q)) {
      return {
        blocks: [
          { kind: 'text', text: `We supply ${joinWords(this.data.brands.map((b) => `**${b.name}**`))}, plus lifting and material handling equipment.` },
          { kind: 'links', items: this.data.brands.map((b) => ({ label: b.name, url: `/brands/${b.slug}` })) },
        ],
        chips: ['Taparia spanners', 'Polyhydron valves', 'Delta pressure gauges'],
        context: ctx,
        intent: 'brands',
      };
    }
    return undefined;
  }

  private shopInfo(q: string, ctx: HydraContext): HydraReply | undefined {
    const addr = COMPANY.address.lines.join(', ');
    const hours = COMPANY.hours.map((h) => `${h.days}: ${h.time}`);
    if (/\b(address|location|located|where (are|is) (you|your|the shop|shop|store|office)|shop (address|location)|directions?|map|reach you|how to (come|reach))\b/.test(q)) {
      return {
        blocks: [
          { kind: 'text', text: `We're at **${addr}**.` },
          { kind: 'list', title: 'Opening hours', items: hours },
          { kind: 'links', items: [{ label: 'Open in Google Maps', url: COMPANY.mapsUrl }, { label: 'Contact page', url: '/contact' }] },
        ],
        chips: ['Phone number', 'What do you sell?'],
        context: ctx,
        intent: 'address',
      };
    }
    if (/\b(timings?|time|hours|open|opening|close|closing|closed|sunday|saturday|holiday|working days?)\b/.test(q)) {
      return {
        blocks: [{ kind: 'list', title: 'Our opening hours', items: hours }, { kind: 'text', text: `We're at ${addr}.` }],
        chips: ['Shop address', 'Phone number'],
        context: ctx,
        intent: 'hours',
      };
    }
    if (/\b(phone|call|number|mobile|contact|whats ?app|wa|email|e-mail|mail|reach|talk to|speak to|someone|human|person|team|sales)\b/.test(q)) {
      return {
        blocks: [
          { kind: 'text', text: `You can reach our team on **${COMPANY.phoneDisplay}** (call or WhatsApp) or e-mail **${COMPANY.email}**.` },
          { kind: 'contact', message: `Hello ${COMPANY.name},\n\nI have an enquiry.\n\nThank you.` },
        ],
        chips: ['Shop address', 'Opening hours'],
        context: ctx,
        intent: 'contact',
      };
    }
    if (/\b(quote|quotation|price|prices|pricing|rate|rates|cost|mrp|discount)\b/.test(q)) return this.priceGeneral(ctx);
    return undefined;
  }

  private faq(q: string, ctx: HydraContext): HydraReply | undefined {
    let best: { a: string; score: number; id: string } | undefined;
    for (const f of this.data.knowledge.faqs ?? []) {
      for (const phrase of f.ask) {
        const re = new RegExp(`(^|\\W)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\W|$)`);
        // Hinglish phrases in guide.md ("banate ho") match what the customer typed
        if (re.test(q) || (this.romanQ && re.test(this.romanQ))) {
          const score = phrase.split(' ').length;
          if (!best || score > best.score) best = { a: f.answer, score, id: f.id };
        }
      }
    }
    if (!best) return undefined;
    return {
      blocks: [{ kind: 'text', text: best.a }, { kind: 'contact', message: `Hello ${COMPANY.name},\n\nI have a question.\n\nThank you.` }],
      chips: START_CHIPS,
      context: ctx,
      intent: `faq-${best.id}`,
    };
  }

  private priceGeneral(ctx: HydraContext): HydraReply {
    const p = ctx.products.length ? this.products.get(ctx.products[0]) : undefined;
    if (p) return this.productAnswer(p, 'price', [], ctx);
    // after a category answer ("screwdrivers" … "price?"): prices for that category
    if (ctx.category && this.categories.has(ctx.category)) return this.categoryAnswer(ctx.category, [], 'price', ctx, ctx.brand);
    return {
      blocks: [
        { kind: 'text', text: `Prices depend on the product, size, quantity and current stock, so our team shares them on request — usually the same working day. Tell them what you need on WhatsApp, or use the quote form.` },
        { kind: 'contact', message: `Hello ${COMPANY.name},\n\nPlease share a price for:\n\nThank you.`, label: 'Ask for a price' },
        { kind: 'links', items: [{ label: 'Get a quote', url: '/get-a-quote' }] },
      ],
      chips: START_CHIPS,
      context: ctx,
      intent: 'price',
    };
  }

  private overviewOfRange(ctx: HydraContext): HydraReply {
    const groups: [string, string][] = [
      ['Hydraulics', 'ball, directional, pressure, flow and check valves, pumps, quick release couplings, tube fittings, filters and tank accessories'],
      ['Instrumentation', 'pressure gauges, temperature gauges and sensors, diaphragm seals, needle valves and manifolds'],
      ['Hand tools', 'Taparia pliers, screwdrivers, spanners, sockets, hammers, cutting tools, workshop equipment and non-sparking tools'],
      ['Lifting & handling', 'chain pulley blocks, hoists, slings, shackles, pallet trucks, stackers and marine containers'],
    ];
    return {
      blocks: [
        { kind: 'text', text: `We supply ${this.data.products.length}+ products in four ranges:` },
        { kind: 'list', items: groups.map(([g, d]) => `**${g}** — ${d}`) },
        { kind: 'links', items: [{ label: 'Browse all categories', url: '/categories' }] },
      ],
      chips: ['Pressure gauges', 'Taparia spanners', 'Chain pulley blocks'],
      context: ctx,
      intent: 'range',
    };
  }

  private notUnderstood(ctx: HydraContext): HydraReply {
    return { blocks: [{ kind: 'text', text: `Sorry, I didn't catch that. Could you rephrase? You can ask me about any product — its sizes, uses or specifications.` }], chips: START_CHIPS, context: ctx, intent: 'not-understood' };
  }

  private offTopic(ctx: HydraContext): HydraReply {
    return {
      blocks: [{ kind: 'text', text: `I can only help with our products and the shop — sizes, uses, specifications, address and timings. For anything else, our team is happy to help.` }, { kind: 'contact', message: `Hello ${COMPANY.name},\n\nI have a question.\n\nThank you.` }],
      chips: START_CHIPS,
      context: ctx,
      intent: 'off-topic',
    };
  }

  help(ctx: HydraContext = { products: [] }): HydraReply {
    return {
      blocks: [
        { kind: 'text', text: `I can help you find products and answer questions about them. Try asking:` },
        { kind: 'list', items: ['"What sizes does the KHB2 ball valve come in?"', '"Where are counterbalance valves used?"', '"Do you have 10 x 11 mm spanners?"', '"How do I choose a pressure gauge?"'] },
        { kind: 'text', text: 'You can ask in English or Hindi ("pechkas ka size kya hai?"). For prices, stock and orders, our team replies on WhatsApp.' },
      ],
      chips: START_CHIPS,
      context: ctx,
      intent: 'help',
    };
  }

  /** "Listed capacities: 1 t, 2 t, 3 t…" — what the size tables of these products do list, for a size we can't find. */
  private listedSizes(ps: Product[], sizes: SizeAsk[]): string | undefined {
    const kind = sizes[0]?.kind;
    const header = { ton: /wll|capacity|swl|load/i, mm: /\(mm\)|size|length|opening|dia/i, inch: /size|thread|inch|bsp|npt/i, dn: /\bdn\b/i, bar: /pressure|bar|pn\b/i } as Record<string, RegExp>;
    if (!kind || !header[kind]) return undefined;
    const vals = new Set<string>();
    for (const p of ps) {
      const v = p.variants?.find((t) => t.rows?.length);
      const i = v?.columns.findIndex((c) => header[kind].test(c)) ?? -1;
      if (!v || i < 0) continue;
      for (const r of v.rows) {
        let x = String(r[i] ?? '').trim();
        if (!x || x === '—') continue;
        if (kind === 'ton' && /kg/i.test(v.columns[i])) x = String(+x.replace(/,/g, '') / 1000);
        vals.add(kind === 'ton' ? `${x} t` : x);
      }
    }
    if (!vals.size) return undefined;
    const list = [...vals].sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b));
    const noun = { ton: 'capacities', mm: 'sizes', inch: 'sizes', dn: 'sizes', bar: 'pressure ratings' }[kind as 'ton'];
    return `Listed ${noun}: ${list.slice(0, 14).join(', ')}${list.length > 14 ? ', …' : '.'}`;
  }

  /** The visitor asked for something we couldn't find: never "we don't have it" — the team takes it from here. */
  private contactTeam(asked: string, lead: string, near: Product[], ctx: HydraContext, note?: string): HydraReply {
    const what = asked
      .replace(/^(do you (have|sell|supply|stock|deal in|keep)|have you got|can you (supply|arrange|get)|i (want|need|am looking for|'m looking for|require)|looking for|need|want|any|is there)\s+/i, '')
      .replace(/^(to )?(buy|purchase|order|get)\s+/i, '')
      .replace(/\b\d+\s*(pcs?|pieces?|nos?\.?|units?|qty)\s*(of\s+)?/i, '')
      .replace(/^(a|an|the|some)\s+/i, '')
      .replace(/[?.!]+$/, '')
      .trim();
    const blocks: HydraBlock[] = [
      {
        kind: 'text',
        text: `${lead ? lead : `For **${what || 'this'}**, `}please contact our team — they'll check availability and get back to you quickly.`,
      },
      { kind: 'contact', message: `Hello ${COMPANY.name},\n\nI'm looking for: ${what || asked}\n\nPlease let me know if you can supply it.\n\nThank you.` },
    ];
    if (note) blocks.splice(1, 0, { kind: 'text', text: note });
    if (near.length) {
      blocks.push({ kind: 'text', text: 'Meanwhile, these from our range may be related:' });
      blocks.push({ kind: 'products', items: near.slice(0, 3).map((p) => this.card(p)) });
    }
    return { blocks, chips: START_CHIPS, context: { products: near.slice(0, 3).map((p) => p.slug) }, intent: 'contact-team' };
  }

  private enquiry(p: Product, size?: string, price = false): string {
    return `Hello ${COMPANY.name},\n\nI'm interested in: ${p.name}${p.modelCode ? ` (${p.modelCode})` : ''}${size ? `, size ${size}` : ''}\n${price ? 'Please share the price and availability.' : 'Please share availability and price.'}\n\nThank you.`;
  }

  /** The current question, for helpers that need the exact wording. */
  private lastQ = '';
  /** The current question in Roman letters when it was asked in Hindi / Hinglish (for Hinglish FAQ phrases). */
  private romanQ = '';

  /** Answers one message. `ctx` is the context returned with the previous reply (for follow-up questions). */
  answer(input: string, ctx: HydraContext = { products: [] }): HydraReply {
    // Hindi / Hinglish ("screwdriver ka size kya hai", "कैसे इस्तेमाल करें") is read as the English question it asks;
    // English passes through unchanged.
    const h = readHindi(input, (w, fromDevanagari) => this.resolveWord(w, fromDevanagari));
    this.lastQ = normalise(h.text);
    this.romanQ = h.hindi ? normalise(h.roman) : '';
    return this.respond(h.text, ctx);
  }

  // ------------------------------------------------------------------------------ Hindi spellings

  private soundIndex?: Map<string, string>;

  /**
   * For a word in a Hindi message: the word itself if Hydra knows it, or the catalogue word it sounds like when it is
   * an English word spelt the Hindi way ("silendar" -> cylinder, "skrudraivar" -> screwdriver). Undefined if neither.
   */
  private resolveWord(w: string, fromDevanagari: boolean): string | undefined {
    if (STOPWORDS.has(w) || INTENT_WORDS.has(w) || /\d/.test(w)) return w;
    const t = tokens(w, true)[0];
    if (t && (this.vocab.has(t) || this.heads.has(t))) return w;
    const key = soundKey(w);
    // short keys are too ambiguous for words typed in English letters
    if (key.length < (fromDevanagari ? 3 : 4)) return undefined;
    const hit = this.sounds().get(key);
    return hit && Math.abs(hit.length - w.length) <= 4 ? hit : undefined;
  }

  private sounds(): Map<string, string> {
    if (this.soundIndex) return this.soundIndex;
    const index = new Map<string, string>();
    const best = new Map<string, number>();
    const add = (word: string, weight: number) => {
      if (word.length < 4 || !/^[a-z]+$/.test(word)) return;
      const key = soundKey(word);
      if (key.length < 3 || (best.get(key) ?? -1) >= weight) return;
      index.set(key, word);
      best.set(key, weight);
    };
    for (const [w, n] of this.vocab) add(w, n);
    for (const w of LOANWORDS) add(w, 1e6); // curated words win over chance matches
    this.soundIndex = index;
    return index;
  }
}

// -------------------------------------------------------------------------------------------- helpers

/** Descriptive words that shouldn't send a customer to the team just because the catalogue never uses them. */
const NEUTRAL = new Set('dial heavy duty light small big large mini medium quality original genuine branded new cheap best strong industrial durable good professional premium standard normal regular full complete hand manual automatic auto kolkata india urgent urgently asap pc pcs piece pieces nos unit units qty quantity dozen lot buy purchase order rate'.split(' '));
/** Words that name a specification, not a product ("pressure rating", "max temperature"). */
const SPEC_TERMS = new Set(tokens('pressure maximum max minimum min working rated temperature material weight accuracy voltage current capacity load flow power torque speed thread port connection dial length height lift stroke bore viscosity'));
/** Quantity words ("50 pcs", "2 nos") — handled as a quantity, never searched. */
const QTY_WORDS = new Set('pc pcs piece pieces no nos number numbers unit units qty quantity dozen dozens lot lots box boxes buy purchase order'.split(' '));
/** Last words of product names that aren't product nouns. */
const NOT_HEADS = new Set('series type standard series female male metric inch bsp npt bspt nptf unf sae seal sealing set sets kit pcs piece pieces finish plated chrome handle grip only head heavy light duty way large small model hydraulic pressure temperature steel stainless brass aluminium insulated sparking non range economical compact'.split(' '));

const START_CHIPS = ['What do you sell?', 'Pressure gauge sizes', 'Where are counterbalance valves used?'];

/** Keyboard mash rather than a word ("asdfgh", "qwerty", "xzkq"). */
function gibberish(w: string) {
  if (/^(asdf|qwer|zxcv|hjkl|jkl|sdfg|dfgh|fghj|wert|erty|tyui|uiop)/.test(w)) return true;
  if (w.length >= 4 && !/[aeiouy]/.test(w)) return true;
  return /[bcdfghjklmnpqrstvwxz]{5,}/.test(w);
}

function capitalise(s: string) {
  return s.replace(/^./, (c) => c.toUpperCase()).replace(/\b(iso|rtd|vde|qrc|nrv|dcv|pt100)\b/gi, (m) => m.toUpperCase()).replace(/\bISO a\b/, 'ISO A');
}
function plural(s: string) {
  return /s$/.test(s) ? s : s.replace(/y$/, 'ie') + 's';
}
function lowerFirst(s: string) {
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}
function joinWords(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
function overlaps(a: string, b: string) {
  const x = new Set(a.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const y = new Set(b.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  if (!x.size) return true;
  let n = 0;
  for (const w of x) if (y.has(w)) n++;
  return n / x.size > 0.6;
}
/** "High Pressure Ball Valve — KHB2 (2-Way, Standard)" -> "KHB2 ball valve"-ish short label for chips. */
/** Lower-case for use mid-sentence, keeping acronyms: "ISO A Couplings" -> "ISO A couplings". */
function lowerName(s: string) {
  return s.split(' ').map((w, i, all) => (/^[A-Z0-9]{2,}$/.test(w) || (/^[A-Z]$/.test(w) && /^[A-Z]{2,}$/.test(all[i - 1] ?? '')) ? w : w.toLowerCase())).join(' ');
}
function shortName(name: string) {
  const [head, tail] = name.split(/\s[—–]\s/);
  const code = tail?.replace(/\s*\(.*?\)/g, '').trim();
  if (code && /\d|^[A-Z0-9 /*-]{2,}$/.test(code) && code.length <= 18) return `${code} ${head.split(' ').slice(-2).join(' ').toLowerCase()}`.trim();
  if (code && code.length <= 26) return `${code} ${head.split(' ').slice(-1)[0].toLowerCase()}`;
  const n = name.replace(/\s[—–]\s/, ' ');
  return n.length > 40 ? n.slice(0, 38).replace(/\s+\S*$/, '') + '…' : n;
}
const SHORT_CAT: Record<string, string> = {
  'Hydraulic Ball Valves': 'ball valves', 'Directional & Modular Valves': 'directional valves', 'Pressure Control Valves & Switches': 'pressure control valves',
  'Flow Control & Needle Valves': 'flow control valves', 'Check Valves': 'check valves', 'Hydraulic Pumps': 'hydraulic pumps',
  'Quick Release Couplings': 'quick release couplings', 'Tube Fittings & Adaptors': 'tube fittings', 'Hydraulic Filters & Strainers': 'hydraulic filters',
  'Hydraulic Tank Accessories': 'tank accessories', 'Pressure Gauges': 'pressure gauges', 'Temperature Gauges & Sensors': 'temperature gauges',
  'Diaphragm Seals & Services': 'diaphragm seals', 'Instrument Valves & Accessories': 'instrument valves', 'Pliers & Cutters': 'pliers and cutters',
  'Screwdrivers, Bits & Testers': 'screwdrivers', 'Spanners, Wrenches & Keys': 'spanners and wrenches', 'Sockets & Socket Sets': 'sockets',
  'Hammers, Chisels & Punches': 'hammers and chisels', 'Cutting, Drilling & Abrasives': 'cutting tools', 'Workshop Equipment & Tool Storage': 'workshop equipment',
  'Non-Sparking Tools': 'non-sparking tools', 'Hoists, Trolleys & Pullers': 'hoists', 'Slings, Chains & Rigging Hardware': 'slings and rigging',
  'Material Handling & Storage': 'material handling equipment',
};
function shortCat(name: string) {
  return SHORT_CAT[name] ?? name.split(/,|\s&\s/)[0].trim().toLowerCase();
}
function wantPhrase(w: Want) {
  return { sizes: 'Sizes of', uses: 'Uses of', howto: 'How to use', specs: 'Specs of', price: 'Price of', compare: '', choose: '', overview: '', stock: '' }[w];
}
