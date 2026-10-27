// Reads a PDF with pdf.js and rebuilds its layout: text lines (made of segments split at wide gaps) and
// text blocks (segments stacked into paragraphs per column), so two-column catalogue pages don't get their
// sentences interleaved. Used by train.mjs — nothing here runs on the website.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
GlobalWorkerOptions.workerSrc = pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')).href;

/**
 * @typedef {{ x: number, end: number, y: number, size: number, text: string }} Segment
 * @typedef {{ y: number, size: number, segs: Segment[] }} Line
 * @typedef {{ x: number, y: number, size: number, lines: string[] }} Block
 * @typedef {{ page: number, lines: Line[], blocks: Block[], chars: number }} Page
 */

/** @returns {Promise<Page[]>} */
export async function readPdf(file) {
  const data = new Uint8Array(fs.readFileSync(file));
  const doc = await getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const items = content.items
      .filter((it) => 'str' in it && it.str.trim())
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        size: Math.hypot(it.transform[2], it.transform[3]) || it.height || 8,
      }));
    pages.push({ page: n, ...layout(items) });
    page.cleanup();
  }
  await doc.destroy();
  return pages;
}

/** Plain-text pages (a ".txt" transcription placed next to an image-only PDF) in the same shape. */
export function textPages(raw) {
  const parts = raw.replace(/\r/g, '').split(/^===\s*page\s*(\d+)\s*===\s*$/im);
  const pages = [];
  for (let i = 1; i < parts.length; i += 2) pages.push(textPage(+parts[i], parts[i + 1]));
  if (!pages.length) pages.push(textPage(1, raw));
  return pages;
}

function textPage(n, body) {
  const lines = [];
  const blocks = [];
  let y = 1000;
  let current = null;
  for (const raw of body.split('\n')) {
    const text = raw.replace(/\s+/g, ' ').trim();
    y -= 12;
    if (!text) {
      current = null;
      continue;
    }
    // a heading line ("# Features") is its own block, slightly larger, so the trainer treats it as a heading
    const heading = /^#+\s*/.test(text);
    const clean = text.replace(/^#+\s*/, '');
    const size = heading ? 12 : 10;
    lines.push({ y, size, segs: [{ x: 40, end: 40 + clean.length * 5, y, size, text: clean }] });
    if (heading || !current) {
      current = { x: 40, y, size, lines: [clean], ...(heading ? { heading: true } : {}) };
      blocks.push(current);
      if (heading) current = null;
    } else current.lines.push(clean);
  }
  return { page: n, lines, blocks, chars: body.length };
}

function layout(items) {
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];
  for (const it of items) {
    const tol = Math.max(2, it.size * 0.45);
    const row = rows.find((r) => Math.abs(r.y - it.y) <= tol);
    if (row) row.items.push(it);
    else rows.push({ y: it.y, items: [it] });
  }
  rows.sort((a, b) => b.y - a.y);

  /** @type {Line[]} */
  const lines = [];
  /** @type {Segment[]} */
  const segments = [];
  let chars = 0;
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    const segs = [];
    let seg = null;
    for (const it of row.items) {
      const gap = seg ? it.x - seg.end : Infinity;
      if (seg && gap < Math.max(it.size * 1.6, 9)) {
        const space = gap > it.size * 0.15 && !/\s$/.test(seg.text) && !/^\s/.test(it.str);
        seg.text += (space ? ' ' : '') + it.str;
        seg.end = Math.max(seg.end, it.x + it.w);
        // the font size of a segment is the size of most of its text (superscripts like "*" don't count)
        if (it.str.trim().length > seg.mainLen) {
          seg.size = it.size;
          seg.mainLen = it.str.trim().length;
        }
      } else {
        seg = { x: it.x, end: it.x + it.w, y: row.y, size: it.size, mainLen: it.str.trim().length, text: it.str };
        segs.push(seg);
      }
    }
    for (const s of segs) {
      s.text = s.text.replace(/\s+/g, ' ').trim();
      chars += s.text.length;
      delete s.mainLen;
    }
    const kept = segs.filter((s) => s.text);
    if (!kept.length) continue;
    lines.push({ y: row.y, size: Math.max(...kept.map((s) => s.size)), segs: kept });
    segments.push(...kept);
  }

  // Stack segments into blocks: the next line directly below, in the same column. A small extra indent is
  // allowed so hanging-indent list items ("1. Five chamber body ... / flow.") stay in one block.
  const blocks = [];
  for (const s of segments) {
    const fits = (bl) => {
      const dy = bl.lastY - s.y;
      const lineGap = Math.max(bl.size, s.size) * 2.1;
      const dx = s.x - bl.x;
      return dy > 0 && dy <= lineGap && dx >= -Math.max(6, s.size * 1.2) && dx <= Math.max(26, s.size * 2.6) && Math.abs(bl.size - s.size) < 2.5;
    };
    const candidates = blocks.filter(fits);
    const b = candidates.sort((p, q) => Math.abs(p.x - s.x) - Math.abs(q.x - s.x))[0];
    if (b) {
      b.lines.push(s.text);
      b.lastY = s.y;
    } else blocks.push({ x: s.x, y: s.y, lastY: s.y, size: s.size, lines: [s.text] });
  }
  return {
    lines,
    blocks: blocks.map(({ x, y, size, lines: l }) => ({ x: Math.round(x), y: Math.round(y), size: Math.round(size * 10) / 10, lines: l })),
    chars,
  };
}
