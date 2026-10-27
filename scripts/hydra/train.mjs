#!/usr/bin/env node
/**
 * Hydra — one-time training.
 *
 *   npm run hydra:train
 *
 * Reads every PDF catalogue in scripts/hydra/catalogues/ (and guide.md), learns what each catalogue says about
 * each product on the website (descriptions, features, where it is used, how to use it, technical
 * specifications), and writes everything Hydra knows into
 *
 *   src/app/features/hydra/data/hydra-knowledge.data.ts
 *
 * The website ships that file, so the chatbot answers instantly in the visitor's browser — no external API, no
 * server, nothing sent anywhere. Run it again only when you add or change a catalogue or edit guide.md, then
 * rebuild the site.
 *
 * What the trainer deliberately leaves out of the knowledge:
 *   - prices (the website never shows prices; Hydra sends price questions to the team),
 *   - the manufacturers' own phone numbers, e-mails, addresses and websites,
 *   - sentences written in a manufacturer's own voice ("we manufacture…", "our factory…"), so Hydra never
 *     claims Western Hardware Mart makes the products,
 *   - legal boilerplate, page headers/footers and drawing dimensions.
 *
 * Image-only PDFs (no selectable text) are read from a ".txt" transcription with the same name, placed next to
 * the PDF (see asian-iso7241-qrc.txt for the format).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import { readPdf, textPages } from './pdf-text.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const CATALOGUES = path.join(HERE, 'catalogues');
const GUIDE = path.join(HERE, 'guide.md');
const OUT = path.join(ROOT, 'src/app/features/hydra/data/hydra-knowledge.data.ts');
const REPORT = path.join(HERE, 'training-report.md');

// ---------------------------------------------------------------------------------------------- site data
async function loadTs(rel) {
  const { code } = transformSync(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { loader: 'ts', format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(code.replace(/^import .*$/gm, '')).toString('base64'));
}
const { PRODUCTS } = await loadTs('src/app/data/products.data.ts');
const { CATEGORIES, PRODUCT_TYPES, BRANDS } = await loadTs('src/app/data/taxonomy.data.ts');
const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));

// ------------------------------------------------------------------------------------------- vocabulary
const HEADINGS = [
  ['about', /^(description|introduction|general|overview|function(al description)?|working principle|principle of operation)$/i],
  ['features', /^(features?|salient features|construction|design features|advantages|benefits)$/i],
  ['uses', /^(applications?|typical applications|uses|areas of application|suitable for)$/i],
  ['howto', /^(installation|installation (notes|instructions)|mounting|operation|operating instructions|maintenance|commissioning|adjustment|note on .*|notes?|caution|important)$/i],
  ['specs', /^(technical (data|specifications?|details)|specifications?|technical data and specifications|performance characteristics.*)$/i],
  ['skip', /^(ordering (code|details|information)|how to order|hydraulic symbols?|section\b|unit dimensions|dimensions|installation dimensions|characteristic curves?|performance (curves?|graphs?|characteristics?)|index$|contents$|spool types?|sub-?plates?|direction of flow|pressure drop)/i],
];
const headingKind = (t) => HEADINGS.find(([, re]) => re.test(t.replace(/[:.]$/, '').trim()))?.[0];

const USES_RE = /\b(used (in|for|to|on|where|with)|use[sd]? in|applications?|suitable for|suited (to|for)|ideal (for|choice)|designed for|meant for|recommended for|for use (in|on|with))\b/i;
const HOWTO_RE = /\b(install|mount(ed|ing)? (on|in|with)|connect|operat(e|ed|ing) (by|with|manually)|adjust|tighten|loosen|turn(ing)?|rotat|setting|set the|fit(ted|ting)?|insert|remove|replace|maintain|clean|lubricat|bleed|drain|torque|should be|must be|do not|never|ensure|before (use|connecting|installing)|caution|override|identification)\b/i;

// Things Hydra must never repeat.
const DROP = [
  ['first-person', /\b(we|our|ours|us)\b/i],
  ['contact', /(@|www\.|https?:|\.com\b|\.in\b|\be-?mail\b|\bphone\b|\bfax\b|\btel\b|\bmob(ile)?\s*:|contact\s*:|\+91|\b\d{3}[\s-]?\d{3,4}[\s-]?\d{4}\b|\bpin\s*[:-]?\s*\d{6}\b|\b\d{6}\b(?=\.?\s*(india)?$))/i],
  ['address', /\b(industrial estate|midc|plot no|survey no|road,|marg|nagar,|belgaum|bangalore|karnataka|navi mumbai|taloja|machhe)\b/i],
  ['price', /(₹|\bprice|\bmrp\b|\brs\.?\s*\d|\brupees?\b|\bcost\b|\bdiscount)/i],
  ['legal', /(all rights reserved|subject to (change|revision|alteration)|without prior notice|continuous improvement|certified installation drawing|design code subject|may look different|\bcopyright\b|errors? and omissions)/i],
  ['marketing', /(iso\s*9001|tuv\b|founded|established in|quality policy|customer (focus|satisfaction)|committed to|machine shop|production (unit|setup|line)|skilled|professionals|state[- ]of[- ]the[- ]art|leading manufacturer|most recogni[sz]ed|best[- ]in[- ]class|dealer network|sales (&|and) service|export(s|ed|ing)?\b|group company|pvt\.?\s*ltd|private limited|\bltd\b|\bm\/s\b|registered under|ssi unit|\bpvt\b|located at|since the year|philosophy|innovation|engaged in|manufactur(er|ers|ing (of|unit|facility|setup|300)))/i],
  ['codes', /\b(hsn|design no|ref\.?\s*no|release\s*[:\d]|engineering\s*-?\s*\d|page \d+ of \d+|std\.?\s*pkg)\b/i],
  ['hidden-brand', /safelift/i],
];
const dropReason = (t) => DROP.find(([, re]) => re.test(t))?.[0];

/** Point "consult the manufacturer" at our own team instead. */
const redirectToTeam = (t) =>
  t.replace(
    /\b(please\s+)?(consult|contact|refer to|check with)\s+(m\/s\.?\s*)?(polyhydron|asian hydraulics?|delta|taparia|atauff|yuken|hydroline|hydac|the sales office|sales office|the manufacturer|manufacturer|factory)(\s+(sales|office|team))?\b/gi,
    (_, please) => `${please ? 'please ' : ''}contact our team`,
  );

const tidy = (t) =>
  redirectToTeam(
    t
      .replace(/­/g, '')
      .replace(/(\w)- (?=[a-z])/g, '$1-') // "spring- centered" -> "spring-centered"
      .replace(/\s+([,.;:)])/g, '$1')
      .replace(/([(])\s+/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/^(?:[•●▪■◦*¢]\s+|[-–e]\s+(?=[A-Z]))/, '') // bullet marks (incl. OCR "¢"/"e"), but not a minus sign
      .replace(/\.{3,}/g, ' ')
      .replace(/[“"]\s?ow\b/g, 'flow') // lost "fl" ligature
      .replace(/ìm\b/g, 'µm')
      .replace(/\boptd\.\s*/gi, 'operated ')
      .replace(/\bPr\.\s+(?=[a-z])/g, 'pressure ')
      .replace(/\bsoln\./gi, 'solenoid')
      .replace(/\breqd\./gi, 'required')
      .replace(/\bupto\b/gi, 'up to')
      .replace(/\bDuel\b/g, 'Dual')
      .replace(TYPO_RE, (m) => matchCase(m, TYPOS[m.toLowerCase()]))
      .replace(/([a-z])[°º˚]+/gi, '$1')
      .replace(/[°º˚]+(?=\s*[a-z])/gi, '')
      .replace(/([-+]?\d+(?:[.,]\d+)?)\s*[°º˚]?\s*C\b(?!\w)/g, '$1°C')
      .replace(/\bconfirms to\b/gi, 'conforms to')
      .replace(/\bit's (port|body|seat|spool)/gi, 'its $1')
      .trim(),
  );

// Spelling slips in the source catalogues, corrected so Hydra's answers read well (facts are unchanged).
const TYPOS = {
  encapsuiated: 'encapsulated', chember: 'chamber', operting: 'operating', parllel: 'parallel', netrual: 'neutral',
  interchangable: 'interchangeable', maintence: 'maintenance', tightning: 'tightening', avoidingpremature: 'avoiding premature',
  seperate: 'separate', seperately: 'separately', availble: 'available', presure: 'pressure', pressue: 'pressure',
  hydrualic: 'hydraulic', hydrulic: 'hydraulic', cartrige: 'cartridge', guage: 'gauge', guages: 'gauges', stainles: 'stainless',
  temprature: 'temperature', tempreature: 'temperature', flange: 'flange', compesated: 'compensated', compansated: 'compensated',
  accesories: 'accessories', solonoid: 'solenoid', adjustible: 'adjustable', suitible: 'suitable',
  confirming: 'conforming', thru: 'through', exagone: 'hexagon', opertions: 'operations', achived: 'achieved',
  solenied: 'solenoid', requirment: 'requirement', veriation: 'variation', operted: 'operated', standered: 'standard',
  proction: 'protection', perfomance: 'performance', shoud: 'should', conected: 'connected', spooltype: 'spool type',
};
const TYPO_RE = new RegExp(`\\b(${Object.keys(TYPOS).join('|')})\\b`, 'gi');
const matchCase = (src, to) => (src[0] === src[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to);

const words = (t) => t.split(/\s+/).filter(Boolean);
const letterRatio = (t) => (t.match(/[a-z]/gi)?.length ?? 0) / Math.max(1, t.replace(/\s/g, '').length);

/** Sentence split that keeps "approx.", "Max.", "No.", "e.g." and decimals together. */
function sentences(text) {
  const protectedText = text
    .replace(/\b(approx|max|min|no|nos|e\.g|i\.e|etc|fig|figs|dia|nom|std|ref|vol|incl|resp|viz|vs|sq|ft|kg|cst|dn)\./gi, (m) => m.replace('.', '∯'))
    .replace(/(\d)\.(\d)/g, '$1∯$2');
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z(“"])/)
    .map((s) => s.replace(/∯/g, '.').trim())
    .filter(Boolean);
}

// Ordering-code notes, drawing callouts and cross references — meaningless without the drawing.
const JUNK = /^[A-Z0-9]{1,3}\s+-\s+\S|design code|installation dimensions remain|omit if|\brefer (to )?(hydraulic|circuit|graph|ordering|sketch|drawing|table)|please refer|hydraulic circuit showing|^[A-Z] for (low|high)|\bH1 \(|^\(/i;
const FUNCTION_WORDS = new Set('the a an is are be been being for to with from in into of by can will which that this these it its as on when where or and also not only than so such may should must has have'.split(' '));
/** Share of Title-Case words (ignoring the first word, model codes and short words) — high in table-label soup. */
function titleCaseRatio(t) {
  const ws = words(t).slice(1).filter((w) => /^[A-Za-z]{3,}[.,;:]?$/.test(w));
  if (!ws.length) return 0;
  return ws.filter((w) => /^[A-Z]/.test(w)).length / ws.length;
}
const isProse = (t) => words(t).length >= 5 && letterRatio(t) > 0.62 && /[a-z]{3,}/.test(t) && !/^[A-Z0-9 ,.&/()-]+$/.test(t);
/** A sentence worth repeating to a customer, not a table header, title or drawing note. */
function goodSentence(s, minWords = 5) {
  const ws = words(s);
  if (ws.length < minWords || ws.length > 70) return false;
  if (!/^[A-Z0-9“"(]/.test(s) || /^\(\d/.test(s)) return false;
  if (/\.{4,}|…{2,}/.test(s)) return false;
  if (/^(model|refer|example|fig\.?|table|curve|direction of flow|performance|product no|note\s*:?\s*\(\d|symbol|position|valve\s*:)/i.test(s)) return false;
  if (JUNK.test(s)) return false;
  if (/(\b\d+(\.\d+)?\b[\s,]+){4,}/.test(s)) return false; // a row of numbers
  if (letterRatio(s) < 0.6) return false;
  const fw = ws.filter((w) => FUNCTION_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).length;
  if (fw < 1) return false;
  if (titleCaseRatio(s) > 0.3) return false;
  return true;
}
/** A bullet item: short facts are fine, but not headings, product-number lists or all-caps titles. */
function goodItem(s, minWords = 3) {
  const ws = words(s);
  if (ws.length < minWords || !/[A-Za-z]{4,}/.test(s)) return false;
  if (JUNK.test(s) || /^(symbol|position)\b/i.test(s)) return false;
  if (ws.length < 2 || ws.length > 40) return false;
  if (/product no|\.{4,}/i.test(s) || s === s.toUpperCase()) return false;
  if (letterRatio(s) < 0.55 || titleCaseRatio(s) > 0.5) return false;
  return true;
}
const SPEC_LINE = /^(?:[•●▪■◦¢]\s*)?[A-Za-z][A-Za-z ./()&-]{1,44}\s*:\s*\S/;

// ------------------------------------------------------------------------------------- product codes
const normCode = (s) => s.toUpperCase().replace(/[\s*.\-–—_/"”'()]/g, '');
const validCode = (c) => c.length >= 3 && c.length <= 16 && ((/[A-Z]/.test(c) && /\d/.test(c)) || /^[A-Z]{3,6}$/.test(c));
const CODE_STOP = new Set(['BSP', 'NPT', 'BSPP', 'NPTF', 'SAE', 'ISO', 'DIN', 'ANSI', 'NBR', 'FKM', 'EPDM', 'PTFE', 'AISI', 'MAX', 'MIN', 'BAR', 'PSI', 'LPM', 'CST', 'VDE', 'NOTE', 'TYPE', 'SIZE', 'MODEL', 'SERIES', 'WITH', 'AND', 'FOR', 'THE', 'CETOP', 'NFPA', 'VALVE', 'PORT', 'PORTS', 'FLOW', 'TANK', 'PUMP', 'STD', 'HSN', 'PAGE', 'GAUGE', 'ALL', 'TEMP', 'IS']);

const codeIndex = new Map(); // normalised code -> Set(slug)
const looseIndex = new Map(); // the same code without leading digits ("4DE06" -> "DE06"), for catalogue headers
const stripLead = (c) => c.replace(/^\d+(?=[A-Z])/, '');
function addCode(raw, slug) {
  for (const part of String(raw).split(/\s*(?:\/|,|–|—|\bor\b|&|\bto\b)\s*/i)) {
    for (const code of [normCode(part)]) {
      if (!validCode(code) || CODE_STOP.has(code)) continue;
      if (!codeIndex.has(code)) codeIndex.set(code, new Set());
      codeIndex.get(code).add(slug);
      const loose = stripLead(code);
      if (loose !== code && validCode(loose)) {
        if (!looseIndex.has(loose)) looseIndex.set(loose, new Set());
        looseIndex.get(loose).add(slug);
      }
    }
  }
}
for (const p of PRODUCTS) {
  if (p.modelCode) addCode(p.modelCode, p.slug);
  const tail = p.name.split(/\s[—–-]\s/).slice(1).join(' ');
  for (const t of tail.match(/\b[A-Z0-9][A-Z0-9*-]{2,}\b/g) ?? []) addCode(t, p.slug);
  for (const v of p.variants ?? []) {
    const ci = v.columns.findIndex((c) => /(product|part|item|cat(alogue)?)\s*(no|code)|^code$|^model$|^type$/i.test(c));
    if (ci >= 0) for (const r of v.rows) if (r[ci]) addCode(r[ci], p.slug);
  }
}

/** Candidate codes in a piece of text: single tokens and joined neighbours ("PCM 20-16" -> "PCM2016"); "DL06*****11" -> "DL06". */
function codesIn(text) {
  const raw = text.toUpperCase().replace(/\s+\*/g, '*').split(/[^A-Z0-9*\-/.]+/).filter(Boolean);
  const out = [];
  // Catalogue model patterns use * for options: "PPM*06K*10" -> PPM, PPM06K, PPM06K10 ; "MPPR*06**01" -> MPPR06
  for (const t of raw.filter((t) => t.includes('*'))) {
    const parts = t.split('*').filter(Boolean);
    for (let k = 1; k <= parts.length; k++) out.push({ code: normCode(parts.slice(0, k).join('')), n: k === 1 ? 0.5 : k });
  }
  const toks = raw.map((t) => t.replace(/\*/g, ''));
  for (let i = 0; i < toks.length; i++) {
    for (let n = 1; n <= 3 && i + n <= toks.length; n++) {
      if (n > 1 && !/\d/.test(toks[i + n - 1])) continue;
      out.push({ code: normCode(toks.slice(i, i + n).join('')), n });
    }
  }
  return out;
}

/** Products whose model codes appear in a piece of text. */
function productsIn(text) {
  const found = new Map();
  for (const { code, n } of codesIn(text)) {
    let hit = codeIndex.get(code);
    let w = n;
    if (!hit && validCode(code)) {
      hit = looseIndex.get(stripLead(code));
      w = n * 0.8;
    }
    for (const s of hit ?? []) found.set(s, (found.get(s) ?? 0) + w);
  }
  return found;
}

const NAME_STOP = new Set('the a an and or of for with to in on series type model size standard new range'.split(' '));
const nameTokens = (t) =>
  t.toLowerCase().replace(/[^a-z0-9/ ]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !NAME_STOP.has(w)).map((w) => (w.length > 3 && /[^s]s$/.test(w) ? w.slice(0, -1) : w));
/** Fallback when a heading has no model code: products of that brand whose names it matches closely. */
function productsByName(text, brand, exactOnly = false) {
  const head = new Set(nameTokens(text));
  if (head.size < 2) return [];
  if (exactOnly) {
    return PRODUCTS.filter((p) => (!brand || p.brandSlug === brand) && nameTokens(p.name).join(' ') === [...head].join(' ')).map((p) => p.slug);
  }
  const scored = PRODUCTS.filter((p) => !brand || p.brandSlug === brand)
    .map((p) => {
      const nt = [...new Set(nameTokens(p.name))];
      const hit = nt.filter((w) => head.has(w)).length;
      return { slug: p.slug, hit, score: hit / Math.max(nt.length, 1) };
    })
    .filter((x) => x.hit >= 2 && x.score >= 0.6);
  const best = Math.max(0, ...scored.map((x) => x.score));
  return scored.filter((x) => x.score >= best - 0.05).slice(0, 4).map((x) => x.slug);
}

/** "Model : DE06****07" / "Shut off Valve - Sub-plate mounting - MSSL" -> a catalogue model code, if any. */
function modelOf(text) {
  const m = text.match(/\bmodel\s*[:\-]?\s*([A-Z0-9][A-Z0-9 \-/]{1,14}?)(?=\*|\s+(?:with|\(|size)|\s*$|\s{2,}|,)/i);
  if (m) return normCode(m[1]);
  const t = text.match(/\s[-–—]\s*([A-Z]{2,}[0-9]{0,3}[A-Z0-9]*)\s*$/);
  return t && validCode(normCode(t[1])) ? normCode(t[1]) : undefined;
}

/** Taparia list headings: "2. (L) TOWER PINCER" -> products whose slug starts with "taparia-2-l-". */
function taparieSection(text) {
  const m = text.match(/^\s*(\d{1,2})\s*\.\s*\(\s*([A-Z]{1,3})\s*\)\s+\S/);
  if (!m) return [];
  const prefix = `taparia-${m[1]}-${m[2].toLowerCase()}-`;
  return PRODUCTS.filter((p) => p.slug.startsWith(prefix)).map((p) => p.slug);
}

// ------------------------------------------------------------------------------------------- sources
function brandHint(file, sample) {
  const f = file.toLowerCase();
  if (/asian|atauff/.test(f)) return 'asian-hydraulic';
  if (/delta/.test(f)) return 'delta';
  if (/taparia/.test(f)) return 'taparia';
  if (/yuken/.test(f)) return 'yuken';
  if (/hydroline/.test(f)) return 'hydroline';
  if (/polyhydron|flow-?control|direction-?control|pressure-?control/.test(f)) return 'polyhydron';
  const counts = BRANDS.map((b) => [b.slug, (sample.match(new RegExp(b.name, 'gi')) ?? []).length]).sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : undefined;
}

/** knowledge per product */
const notes = new Map(); // slug -> { about:[], features:[], uses:[], howto:[], specs:[[l,v]], src:Set }
const general = []; // { text, kind, brand, src }
const extras = new Map(); // 'extra:CODE' -> { code, title, brand, src } — catalogue models the website doesn't list
const seen = new Set();
const stats = [];

function note(slug) {
  if (!notes.has(slug)) notes.set(slug, { about: [], features: [], uses: [], howto: [], specs: [], src: new Set() });
  return notes.get(slug);
}

function keep(kind, text, slugs, brand, src, st) {
  const t = tidy(text);
  if (t.length < 4) return;
  const why = dropReason(t);
  if (why) {
    st.dropped[why] = (st.dropped[why] ?? 0) + 1;
    return;
  }
  const key = kind + '|' + slugs.join(',') + '|' + t.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seen.has(key)) return;
  seen.add(key);
  st.kept[kind] = (st.kept[kind] ?? 0) + 1;
  if (!slugs.length) {
    if (kind !== 'specs') general.push({ text: t, kind, brand, src });
    return;
  }
  for (const s of slugs) {
    const n = note(s);
    n.src.add(src);
    if (kind === 'specs') continue;
    if (!n[kind].includes(t)) n[kind].push(t);
  }
}

const SPEC_LABEL = /^(?:[•●▪■◦¢]\s*)?[A-Za-z][A-Za-z0-9 ./()&-]{1,44}$/;
const specLabel = (label) => tidy(label).replace(/[:.]+$/, '').replace(/\s*\.$/, '').split(' ').filter((w) => !/\d/.test(w)).join(' ').replace(/(\S)\s+[A-Z]{2,6}$/, '$1').trim();
function appendSpec(last, text) {
  const extra = tidy(text).replace(/\.$/, '');
  if (!extra || dropReason(extra) || /^(refer|model)\b/i.test(extra)) return;
  for (const s of last.slugs) {
    const spec = notes.get(s)?.specs.find(([l]) => l === last.label);
    if (spec && spec[1].length + extra.length < 160) spec[1] = `${spec[1]}${/[;,]$/.test(spec[1]) || /^[a-z(]/.test(extra) ? ' ' : '; '}${extra}`;
  }
}
function keepSpec(label, value, slugs, src, st) {
  // "Construction PCM 20-16" -> "Construction": drop model codes from labels
  label = specLabel(label);
  value = tidy(value).replace(/\.$/, '');
  if (!slugs.length || !label || !value) return;
  if (label.length > 45 || words(label).length > 7 || !/^[A-Za-z]/.test(label) || /\d{3,}/.test(label)) return;
  if (/^(model|type|size|note|notes|example|release|ref|valve|valve model)$/i.test(label) || /release|ref\.? no/i.test(label)) return;
  if (label === label.toUpperCase() && !(label.length <= 3 && /port/i.test(value))) return; // all-caps table titles; keep port legends (HP: inlet port…)
  if (/^[\d.,\s]+$/.test(value) && !/(\(|mass|weight|pressure|flow|qty|number|\bno\b)/i.test(label)) return;
  if (!/\d/.test(value) && titleCaseRatio(value) > 0.6 && words(value).length >= 3) return;
  if (/^(refer|see|model|in kg|as per drawing|-|—)$/i.test(value) || /^(refer|model|see)\b/i.test(value) || value.length > 140) return;
  const why = dropReason(label + ' ' + value);
  if (why) {
    st.dropped[why] = (st.dropped[why] ?? 0) + 1;
    return;
  }
  for (const s of slugs) {
    const n = note(s);
    if (n.specs.some(([l, v]) => l.toLowerCase() === label.toLowerCase() && v.toLowerCase() === value.toLowerCase())) continue;
    n.specs.push([label, value]);
    n.src.add(src);
  }
  st.kept.specs = (st.kept.specs ?? 0) + 1;
}

/** Splits a block into list items ("• …", "1. …") or returns it as one paragraph. */
function listItems(lines) {
  const bullet = /^\s*(?:[•●▪■◦¢]|\d{1,2}[.)])\s+/;
  if (!lines.some((l) => bullet.test(l))) return null;
  const items = [];
  for (const l of lines) {
    if (bullet.test(l) || !items.length) items.push(l.replace(bullet, ''));
    else items[items.length - 1] += ' ' + l;
  }
  return items;
}

async function trainFile(file) {
  const name = path.basename(file, '.pdf');
  const sidecar = path.join(CATALOGUES, name + '.txt');
  let pages = await readPdf(file);
  let via = 'pdf text';
  const chars = pages.reduce((n, p) => n + p.chars, 0);
  if (chars < 40 * pages.length && fs.existsSync(sidecar)) {
    pages = textPages(fs.readFileSync(sidecar, 'utf8'));
    via = 'transcription (' + path.basename(sidecar) + ')';
  }
  const sample = pages.slice(0, 4).flatMap((p) => p.blocks.flatMap((b) => b.lines)).join(' ');
  const brand = brandHint(name, sample);
  const st = { file: path.basename(file), via, pages: pages.length, brand, products: new Set(), extras: new Set(), kept: {}, dropped: {}, unlinked: [] };
  if (chars < 40 * pages.length && via === 'pdf text') st.warning = 'Little or no selectable text and no .txt transcription next to the PDF.';
  const ofBrand = (s) => !brand || !bySlug.get(s)?.brandSlug || bySlug.get(s).brandSlug === brand;
  let prevSlugs = [];

  for (const page of pages) {
    const src = `${path.basename(file)} p.${page.page}`;
    const all = page.blocks.flatMap((b) => b.lines);
    const leaders = all.filter((l) => /\.{5,}\s*\d{1,3}(,\s*\d{1,3})*\s*$/.test(l)).length;
    if (leaders >= 4 && leaders >= all.length * 0.25) {
      st.unlinked.push(page.page + ' (index)');
      continue;
    }
    const sizes = page.blocks.map((b) => b.size).sort((a, b) => a - b);
    const median = sizes[Math.floor(sizes.length / 2)] ?? 10;
    const top = Math.max(...page.blocks.map((b) => b.y), 0);

    // 1) anchors: headings that name a product — by model code, Taparia section number, or close name match.
    //    Catalogue models that the website doesn't list become "extra" items Hydra can still talk about.
    const anchors = [];
    const titleBlocks = new Set();
    for (const b of page.blocks) {
      const text = b.lines.join(' ');
      const tap = brand === 'taparia' ? taparieSection(b.lines[0]) : [];
      // datasheet header references such as "D 04399 - PCM3016******  ENGINEERING - 3 of 3"
      const headerRef = /\bengineering\s*-?\s*\d|\bref\.?\s*no|^D\s?\d{4,5}\b/i.test(text) && b.y >= top - 90;
      const shortName = b.lines.length <= 2 && words(text).length <= 8 && !/[.:;]$/.test(text) && /^[A-Z]/.test(text);
      const exact = shortName ? productsByName(text, brand, true) : [];
      const titleLike = b.heading || b.size >= median + 1.2 || /\bmodel\s*:/i.test(text) || tap.length > 0 || headerRef || exact.length > 0;
      if (!titleLike || text.length > 220 || headingKind(b.lines[0])) continue;
      titleBlocks.add(b);
      let slugs = tap.length ? tap : exact;
      let kind = tap.length ? 'section' : exact.length ? 'name' : 'code';
      if (!slugs.length) {
        // strongest code match only: "Model : CBS T" must not also pull in CBS20 and 2CB06T03
        const found = [...productsIn(text).entries()].filter(([sl]) => ofBrand(sl));
        const best = Math.max(0, ...found.map(([, w]) => w));
        slugs = found.filter(([, w]) => w >= best - 0.01).map(([sl]) => sl);
      }
      if (!slugs.length && (b.heading || b.size >= median + 2)) {
        slugs = productsByName(text, brand);
        kind = 'name';
      }
      if (!slugs.length) {
        const model = modelOf(text);
        if (model && !headingKind(text)) {
          const key = 'extra:' + model;
          if (!extras.has(key)) extras.set(key, { code: model, title: titleOf(page, model), brand, src });
          slugs = [key];
        }
      }
      if (slugs.length && slugs.length <= 6) anchors.push({ x: b.x, y: b.y, slugs, kind, model: /\bmodel\b/i.test(text), header: b.y >= top - 130 });
    }
    // Page subject: an explicit "Model :" line wins, then other model codes, then name matches.
    const head = anchors.filter((a) => a.header);
    const pick = head.filter((a) => a.model && a.kind === 'code').length ? head.filter((a) => a.model && a.kind === 'code')
      : head.filter((a) => a.kind !== 'name').length ? head.filter((a) => a.kind !== 'name') : head;
    let pageSlugs = [...new Set(pick.flatMap((a) => a.slugs))];
    if (!pageSlugs.length && anchors.length) pageSlugs = anchors[0].slugs;
    // continuation sheet ("ENGINEERING - 2 of 3") with no model on it: same product as the previous page
    const sheet = all.join(' ').match(/\b(\d)\s*(?:of|\/)\s*(\d)\b/);
    if (!pageSlugs.length && !anchors.length && prevSlugs.length && sheet && +sheet[1] > 1 && +sheet[1] <= +sheet[2]) pageSlugs = prevSlugs;
    prevSlugs = pageSlugs;
    const subjectAt = (x, y) => {
      const above = anchors.filter((a) => !a.header && a.y >= y && x - a.x > -60 && x - a.x < 260).sort((p, q) => p.y - q.y)[0];
      return above ? above.slugs : pageSlugs;
    };
    if (!pageSlugs.length && !anchors.length) st.unlinked.push(page.page);
    if (process.env.HYDRA_DEBUG) console.log(`\n[${src}] page: ${pageSlugs.join(', ') || '—'}\n   anchors: ${anchors.map((a) => `${a.slugs.join('+')}@${Math.round(a.y)}${a.header ? 'H' : ''}`).join(' | ')}`);

    // 2) headings: which section is each block in?
    const headingBlocks = page.blocks.map((b) => ({ b, kind: headingKind(b.lines[0]) })).filter((h) => h.kind);
    const sectionAt = (b) => {
      const own = headingKind(b.lines[0]);
      if (own) return own;
      const h = headingBlocks
        .filter((h) => h.b !== b && h.b.y > b.y && Math.abs(h.b.x - b.x) < 70 && h.b.y - b.y < 360)
        .sort((p, q) => p.b.y - q.b.y)[0];
      return h?.kind;
    };

    // 3) prose and lists from the blocks
    const colons = page.lines.flatMap((l) => l.segs.filter((x) => x.text === ':' || x.text === '-').map((x) => ({ x: x.x, y: l.y })));
    for (const b of page.blocks) {
      let lines = [...b.lines];
      const section = sectionAt(b);
      if (headingKind(lines[0])) lines = lines.slice(1);
      if (!lines.length || section === 'skip' || section === 'specs') continue;
      if (titleBlocks.has(b) && !headingKind(b.lines[0])) continue;
      if (lines.filter((l) => SPEC_LINE.test(l)).length >= Math.max(2, lines.length * 0.5)) continue; // a spec list: handled per line below
      const slugs = subjectAt(b.x, b.y);
      // the value column of a "label : value" table is read with its labels below, not as prose
      if (colons.some((c) => c.x < b.x && b.x - c.x < 90 && Math.abs(c.y - b.y) < 16)) continue;
      const shortLines = lines.length >= 2 && lines.filter((l) => /\.$/.test(l) && words(l).length <= 12).length >= lines.length * 0.6;
      const items = listItems(lines) ?? (shortLines ? lines.filter((l) => /\.$/.test(l)) : null);
      if (items) {
        const bullets = !!listItems(lines);
        for (const it of items) {
          if (SPEC_LINE.test(it) && section !== 'uses' && section !== 'howto') continue;
          if (!goodItem(it, bullets || section === 'uses' ? 2 : 3)) continue;
          const kind = section === 'uses' ? 'uses' : section === 'howto' ? 'howto' : section === 'about' ? 'about' : 'features';
          keep(kind, it, slugs, brand, src, st);
        }
        continue;
      }
      const text = lines.join(' ');
      if (section === 'uses' && lines.every((l) => goodItem(l, 2) && words(l).length <= 5)) {
        for (const l of lines) keep('uses', l, slugs, brand, src, st); // a plain list of application areas
        continue;
      }
      if (!isProse(text)) continue;
      for (const sen of sentences(text)) {
        if (!goodSentence(sen)) continue;
        const kind = section === 'uses' ? 'uses' : section === 'howto' ? 'howto' : section === 'features' ? 'features'
          : HOWTO_RE.test(sen) ? 'howto' : USES_RE.test(sen) ? 'uses' : 'about';
        keep(kind, sen, slugs, brand, src, st);
      }
    }

    // 4) part numbers printed on the page (e.g. AH12-08G-F, AH04-G-13-10-F) so customers can ask by part number,
    //    and the catalogue's size lines that carry them ("DN13 ISO 10 : BSP 1/2" AH04-G-13-10-F …")
    for (const line of page.lines) {
      const text = line.segs.map((x) => x.text).join(' ');
      const pn = text.match(/\b[A-Z]{1,5}\d{1,3}[A-Z]?(?:-[A-Z0-9.]{1,5}){1,4}\b/g);
      if (!pn) continue;
      const sizeLine = /\d\/\d|\bDN\s?\d|\b(BSPP?|NPTF?|BSPT)\b/.test(text) && text.length <= 220 && !dropReason(text) ? tidy(text) : '';
      for (const slug of subjectAt(line.segs[0].x, line.y)) {
        const n = note(slug);
        n.codes ??= [];
        for (const c of pn) if (/\d/.test(c) && !n.codes.includes(c) && n.codes.length < 80) n.codes.push(c);
        if (sizeLine) {
          n.sizes ??= [];
          if (!n.sizes.includes(sizeLine) && n.sizes.length < 40) n.sizes.push(sizeLine);
        }
      }
    }

    // 5) "label : value" lines, read line by line so labels and values stay paired. A line can hold two columns
    //    ("PN up to 500 bar | • Temp. range: -10 C …"), so each segment group is read on its own.
    let last = null;
    for (const line of page.lines) {
      const segs = line.segs;
      const texts = segs.map((x) => x.text);
      const joined = texts.join(' ');
      const std = joined.match(/^generally\s+conf[io]rming\s+to\s+(.+)$/i);
      if (std) {
        keepSpec('Standard', 'Generally conforming to ' + std[1], subjectAt(segs[0].x, line.y), src, st);
        last = null;
        continue;
      }
      let found = false;
      // a) separate ":" or "-" column between label and value (datasheet tables)
      const ci = texts.findIndex((t, i) => i > 0 && (t === ':' || t === '-' || /^:\s*\S/.test(t)));
      if (ci > 0 && SPEC_LABEL.test(texts.slice(0, ci).join(' '))) {
        const label = texts.slice(0, ci).join(' ');
        const value = [texts[ci].replace(/^[:-]\s*/, ''), ...texts.slice(ci + 1)].join(' ');
        last = { y: line.y, x: segs[ci + 1]?.x ?? segs[ci].x, label: specLabel(label), slugs: subjectAt(segs[0].x, line.y) };
        keepSpec(label, value, last.slugs, src, st);
        found = true;
      } else if (ci === 0 && last && last.y - line.y < line.size * 2.4) {
        appendSpec(last, [texts[0].replace(/^[:-]\s*/, ''), ...texts.slice(1)].join(' '));
        last.y = line.y;
        continue;
      } else {
        // b) "Label : value" inside one segment (bullets, transcriptions)
        for (const seg of segs) {
          const kv = seg.text.match(/^(?:[•●▪■◦¢]\s*)?([A-Za-z][A-Za-z ./()&-]{1,44}?)\s*:\s*(\S.*)$/);
          if (kv && SPEC_LABEL.test(kv[1])) {
            last = { y: line.y, x: seg.x, label: specLabel(kv[1]), slugs: subjectAt(seg.x, line.y) };
            keepSpec(kv[1], kv[2], last.slugs, src, st);
            found = true;
          } else if (!found && last && /^[a-z(]/.test(seg.text) && Math.abs(seg.x - last.x) < 30 && last.y - line.y < line.size * 2.4) {
            // c) a value wrapped onto the next line ("500 Bar depending / on valve size and seal materials selected")
            appendSpec(last, seg.text);
            last.y = line.y;
            found = true;
          }
        }
      }
      if (!found) last = null;
    }
    for (const s of new Set([...anchors.flatMap((a) => a.slugs), ...pageSlugs])) (s.startsWith('extra:') ? st.extras : st.products).add(s);
  }
  stats.push(st);
}

/** Title for a catalogue model the website doesn't list: the page's largest heading, without the "Model:" part. */
function titleOf(page, model) {
  const big = [...page.blocks].sort((a, b) => b.size - a.size || b.y - a.y);
  for (const b of big) {
    const t = b.lines.join(' ').replace(/\bmodel\s*:?.*$/i, '').replace(/\s[-–—]\s*[A-Z0-9]{2,}\s*$/, '').trim();
    if (t.length >= 6 && /[a-z]/i.test(t) && !/^(ref|release|engineering|a polyhydron)/i.test(t)) {
      return t.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bCum\b/g, 'cum').replace(/\b(Ac|Dc)\b/g, (x) => x.toUpperCase());
    }
  }
  return model;
}

// ------------------------------------------------------------------------------------------ guide.md
function readGuide() {
  const categoryNotes = {};
  const faqs = [];
  const terms = [];
  if (!fs.existsSync(GUIDE)) return { categoryNotes, faqs, terms };
  const raw = fs.readFileSync(GUIDE, 'utf8').replace(/\r/g, '');
  const sections = raw.split(/^##\s+/m).slice(1);
  const known = new Set(CATEGORIES.map((c) => c.slug));
  for (const sec of sections) {
    const [head, ...body] = sec.split('\n');
    const m = head.trim().match(/^(category|faq|term)\s*:\s*([a-z0-9 -]+)$/i);
    if (!m) continue;
    const fields = {};
    let key = null;
    for (const line of body) {
      const f = line.match(/^([a-z]+)\s*:\s*(.*)$/i);
      if (f) {
        key = f[1].toLowerCase();
        fields[key] = f[2].trim();
      } else if (key && line.trim()) fields[key] += ' ' + line.trim();
    }
    if (m[1].toLowerCase() === 'category') {
      if (!known.has(m[2])) {
        console.warn(`guide.md: unknown category "${m[2]}" — skipped`);
        continue;
      }
      categoryNotes[m[2]] = { what: fields.what ?? '', uses: fields.uses ?? '', howto: fields.howto ?? '', choose: fields.choose ?? '' };
    } else if (m[1].toLowerCase() === 'term') {
      if (fields.what) terms.push({ name: m[2].trim(), aka: (fields.aka ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean), what: fields.what, uses: fields.uses ?? '', howto: fields.howto ?? '' });
    } else if (fields.ask && fields.answer) {
      faqs.push({ id: m[2], ask: fields.ask.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean), answer: fields.answer });
    }
  }
  const leak = JSON.stringify({ categoryNotes, faqs, terms }).match(/₹|\bmrp\b|\brs\.?\s*\d/i);
  if (leak) throw new Error('guide.md must not contain prices: found "' + leak[0] + '"');
  return { categoryNotes, faqs, terms };
}

// -------------------------------------------------------------------------------------------- run
const files = fs.existsSync(CATALOGUES) ? fs.readdirSync(CATALOGUES).filter((f) => f.toLowerCase().endsWith('.pdf')).sort() : [];
if (!files.length) {
  console.error(`No PDF catalogues found in ${path.relative(ROOT, CATALOGUES)} — put the catalogues there and run again.`);
  process.exit(1);
}
console.log(`Hydra is learning ${files.length} catalogues…`);
for (const f of files) {
  process.stdout.write(`  • ${f} … `);
  await trainFile(path.join(CATALOGUES, f));
  const st = stats[stats.length - 1];
  console.log(`${st.pages} pages, ${st.products.size} website products${st.extras.size ? ` + ${st.extras.size} other models` : ''}${st.warning ? ' — ' + st.warning : ''}`);
}
const { categoryNotes, faqs, terms } = readGuide();

// Drop specs that only repeat what the product page already shows, and cap list lengths.
const out = {};
const extrasOut = [];
const pack = (n) => {
  const entry = {};
  for (const k of ['about', 'features', 'uses', 'howto']) if (n[k].length) entry[k] = n[k].slice(0, k === 'features' ? 16 : 10);
  if (n.codes?.length) entry.codes = n.codes;
  if (n.sizes?.length) entry.sizes = n.sizes;
  return entry;
};
for (const [slug, n] of [...notes.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (slug.startsWith('extra:')) {
    const x = extras.get(slug);
    const entry = pack(n);
    if (n.specs.length) entry.specs = n.specs.slice(0, 20);
    if (x && (entry.about || entry.features || entry.specs)) extrasOut.push({ code: x.code, title: x.title, brand: x.brand, ...entry, src: [...n.src].slice(0, 4) });
    continue;
  }
  const p = bySlug.get(slug);
  if (!p) continue;
  const have = new Set((p.specifications ?? []).map((s) => (s.label + ':' + s.value).toLowerCase().replace(/[^a-z0-9:]/g, '')));
  const specs = n.specs.filter(([l, v]) => !have.has((l + ':' + v).toLowerCase().replace(/[^a-z0-9:]/g, ''))).slice(0, 24);
  const entry = pack(n);
  if (specs.length) entry.specs = specs;
  if (Object.keys(entry).length) out[slug] = { ...entry, src: [...n.src].slice(0, 6) };
}
const generalOut = general.slice(0, 400);

const knowledge = {
  version: 1,
  trainedAt: new Date().toISOString(),
  sources: stats.map((s) => ({ file: s.file, pages: s.pages, brand: s.brand ?? null, products: s.products.size })),
  notes: out,
  extras: extrasOut,
  general: generalOut,
  categoryNotes,
  faqs,
  terms,
};

// Final safety net: nothing price-like or contact-like may ship.
const json = JSON.stringify(knowledge);
const leak = json.match(/₹|\bmrp\b|price each|@[a-z]+\.|www\.|\+91/i);
if (leak) throw new Error(`Training output contains "${leak[0]}" — refusing to write it. Check the catalogue filters.`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  `// AUTO-GENERATED by \`npm run hydra:train\` (scripts/hydra/train.mjs) from the PDF catalogues in scripts/hydra/catalogues
// and scripts/hydra/guide.md. Do not edit by hand — edit guide.md or the catalogues and train again.
import { HydraKnowledge } from '../engine/hydra.types';

export const HYDRA_KNOWLEDGE: HydraKnowledge = ${JSON.stringify(knowledge, null, 1)};
`,
);

// Report
const lines = [
  '# Hydra training report',
  '',
  `Trained ${knowledge.trainedAt} from ${files.length} catalogues and guide.md.`,
  '',
  `* Products with catalogue knowledge: **${Object.keys(out).length}** of ${PRODUCTS.length}`,
  `* From guide.md: category notes ${Object.keys(categoryNotes).length} of ${CATEGORIES.length}, glossary terms ${terms.length}, shop FAQs ${faqs.length}`,
  `* Catalogue models not listed on the website (Hydra can still describe them): ${extrasOut.length}${extrasOut.length ? ' — ' + extrasOut.map((x) => x.code).join(', ') : ''}`,
  `* General catalogue passages: ${generalOut.length}`,
  '',
  '| Catalogue | Read from | Pages | Brand | Website products linked | Other models | Kept | Left out (reason) |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...stats.map(
    (s) =>
      `| ${s.file} | ${s.via} | ${s.pages} | ${s.brand ?? '–'} | ${s.products.size} | ${s.extras.size} | ${Object.entries(s.kept).map(([k, v]) => `${k} ${v}`).join(', ') || '–'} | ${Object.entries(s.dropped).map(([k, v]) => `${k} ${v}`).join(', ') || '–'} |`,
  ),
  '',
  'Pages with no product found on them (usually covers, index pages, image-only pages or general company pages):',
  '',
  ...stats.filter((s) => s.unlinked.length).map((s) => `* ${s.file}: p. ${s.unlinked.join(', ')}`),
  ...stats.filter((s) => s.warning).map((s) => `* **${s.file}: ${s.warning}**`),
  '',
];
fs.writeFileSync(REPORT, lines.join('\n'));
const kb = (Buffer.byteLength(fs.readFileSync(OUT)) / 1024).toFixed(0);
console.log(`\nDone. ${Object.keys(out).length} website products learned, ${extrasOut.length} other catalogue models, ${terms.length} glossary terms, ${faqs.length} FAQs.`);
console.log(`Wrote ${path.relative(ROOT, OUT)} (${kb} KB) and ${path.relative(ROOT, REPORT)}.`);
