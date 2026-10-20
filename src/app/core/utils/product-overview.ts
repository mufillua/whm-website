import { COMPANY } from '../config/company.config';
import { Product } from '../models/product.model';

/**
 * A readable overview paragraph for a product page, written only from the product's own catalogue data:
 * its size/variant table (count, numeric ranges, part numbers) and its specifications. Nothing is invented —
 * it restates what the page's tables already show, so thin pages get real, unique text for visitors and search.
 */

const CODE_HEADER = /(product|item|part|cat(alogue)?)\s*no|code|model|^type$|^description$/i;
const SKIP_HEADER = /pkg|pack|qty|quantity|price|hsn|std\.?\s*$/i;
const MAX_CODES = 10;

interface Range { label: string; unit: string; min: number; max: number }

/** Lower-cases a label for use mid-sentence but keeps acronyms such as DN, WLL, PN as they are. */
const lc = (label: string) => label.split(' ').map((w) => (/^[A-Z0-9./-]{2,}$/.test(w) ? w : w.toLowerCase())).join(' ');
/** Looks like a part number / model (has a digit, not a bracketed note or a heading). */
const isCode = (c: string) => c.length <= 30 && /\d/.test(c) && !/^[(\[]/.test(c) && c.split(/\s+/).length <= 5;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

function numericRanges(columns: string[], rows: string[][], codeIdx: number): Range[] {
  const out: Range[] = [];
  columns.forEach((header, ci) => {
    if (ci === codeIdx || SKIP_HEADER.test(header)) return;
    const cells = rows.map((r) => String(r[ci] ?? '').trim()).filter((c) => c && c !== '—' && c !== '-');
    // fractions (inch sizes like 9/16) and mixed text are listed in the table but not summarised as a range
    if (!cells.length || cells.some((c) => /\d\/\d/.test(c))) return;
    const nums = cells.flatMap((c) => (/^[\d.\s,x×–-]+$/i.test(c) ? (c.match(/\d+(?:\.\d+)?/g) ?? []).map(Number) : []));
    if (nums.length < cells.length * 0.6) return;
    const m = header.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    const label = (m ? m[1] : header).trim();
    const unit = m ? m[2].trim() : '';
    if (!label) return;
    out.push({ label, unit, min: Math.min(...nums), max: Math.max(...nums) });
  });
  return out.slice(0, 3);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** The model code when it is a clean code (no bracketed notes) and not already in the name — for titles and text. */
export function cleanModel(p: Product): string | undefined {
  const m = p.modelCode?.trim();
  return m && !p.name.includes(m) && !/[()]/.test(m) && m.length <= 30 ? m : undefined;
}

export interface OverviewContext {
  brand?: string;
  category?: string;
  type?: string;
}

/** Summary sentences built from the variant table and specifications (without the closing call to action). */
export function productFacts(p: Product): string[] {
  const facts: string[] = [];
  const v = p.variants?.find((t) => t.rows?.length);
  if (v) {
    const rows = v.rows.map((r) => r.map((c) => String(c ?? '')));
    const codeIdx = v.columns.findIndex((h) => CODE_HEADER.test(h));
    // When the table has a code column, only rows with a real part number count as variants (skips sub-heading rows).
    const codeRows = codeIdx >= 0 ? rows.filter((r) => isCode(r[codeIdx].trim())) : [];
    const variantRows = codeRows.length ? codeRows : rows;
    const ranges = numericRanges(v.columns, variantRows, codeIdx);
    const rangeText = ranges
      .map((r) => `${lc(r.label)} ${r.min === r.max ? fmt(r.min) : `${fmt(r.min)}–${fmt(r.max)}`}${r.unit ? ` ${r.unit}` : ''}`)
      .join(', ');
    if (variantRows.length > 1) facts.push(`Available in ${variantRows.length} sizes or variants${rangeText ? ` (${rangeText})` : ''}.`);
    else if (rangeText) facts.push(`Size: ${rangeText}.`);
    if (codeIdx >= 0) {
      const codes = [...new Set(codeRows.map((r) => r[codeIdx].trim()))];
      if (codes.length) {
        const shown = codes.slice(0, MAX_CODES);
        const more = codes.length - shown.length;
        const label = /model/i.test(v.columns[codeIdx]) ? 'Models' : 'Part numbers';
        facts.push(`${label}: ${shown.join(', ')}${more > 0 ? ` and ${more} more` : ''}.`);
      }
    }
  }
  const clean = (t: string) => t.trim().replace(/\.+$/, '');
  const specs = (p.specifications ?? [])
    .filter((s) => s.label && s.value && !/^note$/i.test(s.label))
    .map((s) => ({ label: s.label.trim(), value: clean(s.value) }));
  const standard = specs.find((s) => /^standards?$/i.test(s.label));
  if (standard) facts.push(/conform|as per|to\s/i.test(standard.value) ? `${standard.value}.` : `Standard: ${standard.value}.`);
  // skip specs that only repeat a range already summarised from the table (e.g. "WLL range")
  const said = facts.join(' ').toLowerCase();
  const other = specs
    .filter((s) => s !== standard && !said.includes(lc(s.label).replace(/\s*range$/i, '').toLowerCase()))
    .slice(0, 3);
  if (other.length) facts.push(`Specifications include ${joinList(other.map((s) => `${lc(s.label)} ${s.value}`))}.`);
  return facts;
}

/** Full overview paragraph shown on the product page. */
export function productOverview(p: Product, ctx: OverviewContext): string {
  const brand = ctx.brand && !p.name.toLowerCase().includes(ctx.brand.toLowerCase()) ? `${ctx.brand} ` : '';
  const model = cleanModel(p) ? ` (${cleanModel(p)})` : '';
  const range = ctx.type ?? ctx.category;
  const intro = `Western Hardware Mart, Kolkata supplies the ${brand}${p.name}${model}${range ? ` as part of our ${range.toLowerCase()} range` : ''}.`;
  return [intro, ...productFacts(p), `Message us on WhatsApp or call ${COMPANY.phoneDisplay} for price and availability.`].join(' ');
}
