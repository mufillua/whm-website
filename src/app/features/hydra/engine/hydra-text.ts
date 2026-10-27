/**
 * Language helpers for Hydra: normalising what visitors type, tokens with light stemming, trade synonyms,
 * spelling tolerance, model codes and sizes ("1/2 inch", "10x11", "DN 25", "3 ton").
 */

/** Words that carry no product meaning (chat filler, question words and the request verbs). */
export const STOPWORDS = new Set(
  (
    'a an the is are was were be been am do does did doing have has had having of for to in on at by with from and or not no ' +
    'about into onto than then so as it its it\'s this that these those there here them they their i me my mine we us our ours you ' +
    'your yours u ur r he she him her his what which who whom whose where when why how can could would should will shall may ' +
    'might must please pls plz kindly tell show give want wanted need needed needs looking look find get got know let lets ' +
    'any some all also more much many very really just only like same such other another one ones thing things item items ' +
    'product products hi hello hey dear sir madam mam maam ji bhai bro team ok okay okk yes yeah yep hmm thanks thank thankyou ' +
    'available availability avail stock stocks stocked sell sells selling supply supplies supplier suppliers deal deals dealer ' +
    'provide provides have offer offers carry carries keep keeps info information detail details regarding related ' +
    'something anything everything kind kinds sort type types variety range ranges catalogue catalog list best good ' +
    'buy buying purchase order ordering require required requirement send share check whether if else'
  ).split(/\s+/),
);

/** Intent words: they decide what kind of answer is wanted, and are not searched for. */
export const INTENT_WORDS = new Set(
  (
    'size sizes sizing dimension dimensions dimensional measurement measurements variant variants models option options ' +
    'use uses used using usage application applications purpose purposes suitable where ' +
    'install installation installing operate operating operation adjust adjusting maintain maintenance connect connecting ' +
    'spec specs specification specifications technical rating ratings datasheet feature features ' +
    'price prices pricing cost costs rate rates mrp quote quotation cheap cheapest expensive discount ' +
    'difference differences compare comparison versus vs better between ' +
    'explain describe meaning mean means define definition overview'
  ).split(/\s+/),
);

/** Spelling variants and trade synonyms -> the word used in the catalogue. Applied to queries and documents alike. */
const CANON: Record<string, string> = {
  guage: 'gauge', gage: 'gauge', gages: 'gauge', guages: 'gauge', gaug: 'gauge', guege: 'gauge',
  wrench: 'spanner', wrenche: 'spanner', spaner: 'spanner', spannar: 'spanner',
  plyer: 'plier', plyers: 'plier', pliers: 'plier', pliyer: 'plier', plaier: 'plier',
  coupler: 'coupling', couplers: 'coupling', cupling: 'coupling', coupliing: 'coupling', couplng: 'coupling',
  vise: 'vice', vises: 'vice',
  hex: 'allen', allan: 'allen', alen: 'allen',
  valv: 'valve', vlave: 'valve', vavle: 'valve', vavles: 'valve',
  hydrolic: 'hydraulic', hydralic: 'hydraulic', hydraulik: 'hydraulic', hydraulics: 'hydraulic', hydrualic: 'hydraulic', hyd: 'hydraulic',
  thermometer: 'temperature', thermometers: 'temperature',
  manometer: 'pressure',
  hammar: 'hammer', hamer: 'hammer',
  scredriver: 'screwdriver', scewdriver: 'screwdriver', screwdrive: 'screwdriver',
  socet: 'socket', soket: 'socket',
  ss: 'stainless',
  aluminum: 'aluminium',
  hoists: 'hoist', hoisting: 'hoist',
  slinges: 'sling',
  tonne: 'ton', tonnes: 'ton', tons: 'ton',
  cylinders: 'cylinder',
  solinoid: 'solenoid', solenoide: 'solenoid', selenoid: 'solenoid',
  strainers: 'strainer', filtr: 'filter',
  qrc: 'coupling', qdc: 'coupling',
};

/** Misspellings fixed before anything else, so phrases like "hydralic guage" still match. */
const SPELLING: Record<string, string> = Object.fromEntries(
  Object.entries(CANON).filter(([k, v]) => !['wrench', 'wrenche', 'hex', 'thermometer', 'thermometers', 'manometer', 'ss', 'qrc', 'qdc', 'tonne', 'tonnes', 'tons', 'cylinders', 'hoists', 'hoisting', 'strainers', 'couplers', 'coupler', 'pliers', 'vise', 'vises', 'hydraulics', 'aluminum', 'gages', 'guages'].includes(k) && v !== k),
);

/** Abbreviations that stand for several words. */
const EXPAND: Record<string, string> = {
  nrv: 'check valve',
  'non return': 'check',
  'non-return': 'check',
  dcv: 'directional control valve',
  prv: 'pressure relief valve',
  fcv: 'flow control valve',
  'screw driver': 'screwdriver',
  'screw drivers': 'screwdriver',
  'chain block': 'chain pulley block',
  'hydraulic gauge': 'hydraulic pressure gauge',
  'oil pressure gauge': 'pressure gauge',
  'counter balance': 'counterbalance',
  'counter-balance': 'counterbalance',
  'load holding': 'counterbalance load holding',
  'pallet jack': 'pallet truck',
  'hand pallet': 'pallet truck',
  'sight glass': 'sight glass level gauge',
  'tool box': 'toolbox',
  'tool kit': 'toolkit',
};

const IRREGULAR: Record<string, string> = {
  glasses: 'glass', boxes: 'box', toolboxes: 'toolbox', accessories: 'accessory', batteries: 'battery', bodies: 'body',
  assemblies: 'assembly', series: 'series', gas: 'gas', bus: 'bus', press: 'press', presses: 'press', brass: 'brass',
  stainless: 'stainless', less: 'less', cross: 'cross', process: 'process', bias: 'bias', axis: 'axis', chassis: 'chassis',
  knives: 'knife', halves: 'half', vices: 'vice', dies: 'die', pliers: 'plier', scissors: 'scissor', tweezers: 'tweezer',
  wrenches: 'spanner', couplings: 'coupling', clamps: 'clamp',
};

export function stem(w: string): string {
  if (IRREGULAR[w]) return IRREGULAR[w];
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (/ies$/.test(w) && w.length > 4) return w.slice(0, -3) + 'y';
  if (/(ches|shes|sses|xes|zes)$/.test(w)) return w.slice(0, -2);
  if (/[^su]s$/.test(w)) return w.slice(0, -1);
  return w;
}

/** Lower-case, unify quotes/inch marks, spell out common shorthand. */
export function normalise(input: string): string {
  let q = ' ' + input.toLowerCase() + ' ';
  q = q
    .replace(/[\u2018\u2019\u201b`´]/g, "'")
    .replace(/[\u201c\u201d\u2033\u02ba]/g, '"')
    .replace(/(\d)\s*''/g, '$1"')
    .replace(/[×]/g, 'x')
    .replace(/\bhalf\s+(inch|in)\b/g, '1/2"')
    .replace(/\bquarter\s+(inch|in)\b/g, '1/4"')
    .replace(/\bthree[\s-]quarters?\s+(inch|in)\b/g, '3/4"')
    .replace(/(\d)\s*(inches|inch|in\.)(?=\W)/g, '$1"')
    .replace(/(\d)\s+(?=\d+\/\d+)/g, '$1-') // "1 1/2" -> "1-1/2"
    .replace(/[a-z]+/g, (w) => SPELLING[w] ?? w)
    .replace(/\s+/g, ' ');
  for (const [k, v] of Object.entries(EXPAND)) q = q.replace(new RegExp(`(?<=\\W)${k.replace(/[-/]/g, '\\$&')}(?=\\W)`, 'g'), v);
  return q.trim();
}

const WORD = /[a-z0-9][a-z0-9/".+-]*/g;

/** Search tokens: stemmed, canonical, without stopwords. Pure numbers and sizes are left to size matching. */
export function tokens(text: string, keepIntent = false): string[] {
  const out: string[] = [];
  for (const raw of withoutSizes(normalise(text)).match(WORD) ?? []) {
    const w = raw.replace(/[".+-]+$/, '');
    if (!w || STOPWORDS.has(w)) continue;
    if (!keepIntent && INTENT_WORDS.has(w)) continue;
    if (/^[\d./"-]+$/.test(w)) continue; // numbers and sizes
    for (const part of w.split(/[/-]/)) {
      if (!part || /^\d+$/.test(part)) continue;
      const c = CANON[part] ?? part;
      const s = stem(c);
      const t = CANON[s] ?? s;
      if (t.length > 1) out.push(t);
    }
  }
  return out;
}

/** Document tokens (no stopword filtering of domain words, same stemming and synonyms). */
export function docTokens(text: string): string[] {
  return tokens(text, true).filter((t) => !STOPWORDS.has(t));
}

// --------------------------------------------------------------------------------------------- codes

export const normCode = (s: string) => s.toUpperCase().replace(/[\s*.\-–—_/"”'()]/g, '');
export const stripLead = (c: string) => c.replace(/^\d+(?=[A-Z])/, '');
const CODE_STOP = new Set(['BSP', 'NPT', 'BSPP', 'NPTF', 'SAE', 'ISO', 'DIN', 'ANSI', 'NBR', 'FKM', 'MAX', 'MIN', 'BAR', 'PSI', 'LPM', 'VDE', 'THE', 'AND', 'FOR', 'TYPE', 'SIZE', 'MODEL', 'SERIES', 'WITH', 'STD', 'ALL', 'CETOP']);

/** Is this a plausible model / part code ("KHB2", "PCM2016", "15418", "TIFP")? */
export function isCode(c: string): boolean {
  if (c.length < 3 || c.length > 18 || CODE_STOP.has(c)) return false;
  if (/[A-Z]/.test(c) && /\d/.test(c)) return true;
  if (/^[A-Z]{3,6}$/.test(c)) return true;
  return /^\d{4,7}$/.test(c);
}

/** Code candidates in a query: single words and 2–3 neighbouring words joined ("pcm 20 16" -> PCM2016). */
export function queryCodes(text: string): string[] {
  const toks = text.toUpperCase().replace(/\s+\*/g, '*').split(/[^A-Z0-9*\-/.]+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i < toks.length; i++) {
    for (let n = 1; n <= 3 && i + n <= toks.length; n++) {
      const parts = toks.slice(i, i + n);
      if (n > 1 && !parts.slice(1).every((p) => /\d/.test(p))) continue;
      // a number followed by a unit is a size, not a code
      if (n === 1 && /^\d+$/.test(parts[0]) && /^(MM|CM|M|BAR|PSI|KG|TON|T|L|LPM|W|V|INCH|IN|DN)$/.test(toks[i + 1] ?? '')) continue;
      const c = normCode(parts.join(''));
      if (isCode(c)) out.add(c);
    }
  }
  return [...out];
}

// --------------------------------------------------------------------------------------------- sizes

/** Removes size expressions ("10 x 11", "1/2\"", "25 mm", "DN 25", "3 ton") so they aren't searched as words. */
export function withoutSizes(q: string): string {
  return q
    .replace(/\b\d+\s*[x*]\s*\d+\b/g, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(mm|cm|bar|psi|kg|t|ton|lpm|l\/min)\b/g, ' ')
    .replace(/\bdn\s*-?\s*\d+\b/g, ' ');
}

export interface SizeAsk {
  kind: 'inch' | 'mm' | 'dn' | 'pair' | 'ton' | 'bar' | 'thread' | 'threadType' | 'number';
  /** Normalised value used for matching. */
  value: string;
  /** How to show it back to the visitor. */
  label: string;
}

/** Sizes mentioned in a query. */
export function sizesIn(input: string): SizeAsk[] {
  const q = normalise(input);
  const out: SizeAsk[] = [];
  const seen = new Set<string>();
  const add = (s: SizeAsk) => {
    const k = s.kind + s.value;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  };
  for (const m of q.matchAll(/\b(\d+)\s*[x*]\s*(\d+)\b/g)) add({ kind: 'pair', value: `${m[1]}x${m[2]}`, label: `${m[1]} × ${m[2]} mm` });
  for (const m of q.matchAll(/(?<![\d/.-])((?:\d+-)?\d+\/\d+)\s*"?/g)) add({ kind: 'inch', value: m[1], label: `${m[1].replace('-', ' ')}"` });
  for (const m of q.matchAll(/(?<![\d/.])(\d+(?:\.\d+)?)\s*"/g)) if (!m[1].includes('/')) add({ kind: 'inch', value: m[1], label: `${m[1]}"` });
  for (const m of q.matchAll(/\b(\d+(?:\.\d+)?)\s*mm\b/g)) add({ kind: 'mm', value: m[1], label: `${m[1]} mm` });
  for (const m of q.matchAll(/\bdn\s*-?\s*(\d+)\b/g)) add({ kind: 'dn', value: String(+m[1]), label: `DN ${m[1]}` });
  for (const m of q.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:t|ton|tons|tonne|tonnes)\b/g)) add({ kind: 'ton', value: m[1], label: `${m[1]} t` });
  for (const m of q.matchAll(/\b(\d+)\s*bar\b/g)) add({ kind: 'bar', value: m[1], label: `${m[1]} bar` });
  for (const m of q.matchAll(/\bm\s?(\d{1,2})\b/g)) add({ kind: 'thread', value: `m${m[1]}`, label: `M${m[1]}` });
  // a thread type narrows sizes that were asked ("1 inch NPT"), it isn't a size on its own
  if (out.length) for (const m of q.matchAll(/\b(bspp|bspt|bsp|nptf|npt|sae|unf|metric)\b/g)) add({ kind: 'threadType', value: m[1], label: m[1].toUpperCase() });
  return out;
}

/** Does a variant-table row match a size the visitor asked for? */
export function rowMatches(columns: string[], row: string[], size: SizeAsk): boolean {
  const cells = row.map((c) => String(c ?? ''));
  const norm = (c: string) =>
    c.toLowerCase().replace(/[\u201c\u201d\u2033]/g, '"').replace(/(\d)\s*"\s*(\d+\/\d+)/g, '$1-$2').replace(/(\d)\s+(\d+\/\d+)/g, '$1-$2');
  switch (size.kind) {
    case 'inch': {
      const v = size.value.replace(/[.+^$()]/g, '\\$&');
      const re = new RegExp(`(^|[^\\d/.-])${v}(?![\\d/-])`);
      // a bare "1" in a dimensions column is not 1 inch: whole numbers need an inch mark or a thread prefix
      const whole = !size.value.includes('/');
      const strict = new RegExp(`(^|[^\\d/.-])${v}\\s*["”]|\\b(g|r|n|bsp|bspp|bspt|npt|nptf|unf)\\s*${v}(?![\\d/.-])`);
      return cells.some((c, i) => {
        const n = norm(c);
        if (whole) {
          if (strict.test(n) || (/inch|thread|bsp|npt|\(in\)|"/i.test(columns[i] ?? '') && re.test(n))) return true;
          // tools are sold by nominal inch size but listed by length: 18" pipe wrench = 450 mm
          const inch = +size.value;
          return inch >= 4 && /length/i.test(columns[i] ?? '') && /mm/i.test(columns[i] ?? '') && Math.abs(parseFloat(n) - inch * 25.4) <= inch * 25.4 * 0.08;
        }
        return re.test(n);
      });
    }
    case 'threadType': {
      const t = size.value;
      const re = t.startsWith('npt') ? /\bnptf?\b|\bn\s?\d|\bn\s?\d\/\d/ : t.startsWith('bsp') ? /\bbsp[pt]?\b|\bg\s?\d/ : new RegExp(`\\b${t}\\b`);
      return cells.some((c) => re.test(norm(c))) || columns.some((c) => re.test(c.toLowerCase()));
    }
    case 'pair':
      return cells.some((c) => norm(c).replace(/\s/g, '').replace(/[×*]/g, 'x').includes(size.value));
    case 'mm':
      return cells.some((c, i) => {
        const n = norm(c);
        if (new RegExp(`(^|[^\\d.])${size.value}\\s*mm\\b`).test(n)) return true;
        return /mm|size|opening|length|dia|width|a\/f|af\b/i.test(columns[i] ?? '') && new RegExp(`^${size.value}(\\s|$)`).test(n.trim());
      });
    case 'dn':
      return cells.some((c, i) => new RegExp(`\\bdn\\s*0*${size.value}\\b`).test(norm(c)) || (/\bdn\b/i.test(columns[i] ?? '') && +c === +size.value));
    case 'ton':
      return cells.some((c, i) => {
        const col = columns[i] ?? '';
        if (!/\(t\)|capacity|swl|wll|ton|load/i.test(col)) return false;
        const n = parseFloat(String(c).replace(/,/g, ''));
        return /kg/i.test(col) ? n === +size.value * 1000 : n === +size.value;
      });
    case 'bar':
      return cells.some((c, i) => new RegExp(`\\b${size.value}\\s*bar\\b`).test(norm(c)) || (/bar|pressure/i.test(columns[i] ?? '') && +c === +size.value));
    case 'thread':
      return cells.some((c) => new RegExp(`\\b${size.value}\\b`).test(norm(c).replace(/\s/g, '')));
    default:
      return false;
  }
}

// ------------------------------------------------------------------------------------------- spelling

/** Damerau-Levenshtein distance with an early exit above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** Escapes text for use inside a RegExp. */
export const reEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
