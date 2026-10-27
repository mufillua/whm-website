#!/usr/bin/env node
/**
 * Ask Hydra from the terminal — handy after training, to check answers before you deploy.
 *
 *   npm run hydra:ask -- "what sizes does the KHB2 ball valve come in?" "where is it used?"
 *   npm run hydra:ask -- --file scripts/hydra/test-questions.txt
 *
 * Questions given together are one conversation (follow-ups like "where is it used?" work). In a --file, a blank
 * line starts a new conversation. Uses exactly the same engine and knowledge as the website.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const entry = `
  import { HydraEngine } from './src/app/features/hydra/engine/hydra-engine';
  import { PRODUCTS } from './src/app/data/products.data';
  import { BRANDS, CATEGORIES, PRODUCT_TYPES } from './src/app/data/taxonomy.data';
  import { HYDRA_KNOWLEDGE } from './src/app/features/hydra/data/hydra-knowledge.data';
  export const engine = new HydraEngine({ products: PRODUCTS, categories: CATEGORIES, types: PRODUCT_TYPES, brands: BRANDS, knowledge: HYDRA_KNOWLEDGE });
`;
const out = await build({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'error',
  tsconfigRaw: '{}',
});
const { engine } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

const args = process.argv.slice(2);
let conversations = [args];
const fi = args.indexOf('--file');
if (fi >= 0) {
  const text = fs.readFileSync(path.resolve(args[fi + 1]), 'utf8');
  conversations = text.split(/\n\s*\n/).map((c) => c.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
}
if (!conversations.flat().length) {
  console.log('Usage: npm run hydra:ask -- "your question" ["follow-up question" …]   or   --file questions.txt');
  process.exit(0);
}

const bold = (s) => s.replace(/\*\*(.+?)\*\*/g, '\x1b[1m$1\x1b[0m');
for (const convo of conversations) {
  let ctx = { products: [] };
  for (const q of convo) {
    const r = engine.answer(q, ctx);
    ctx = r.context;
    console.log(`\n\x1b[36m> ${q}\x1b[0m  \x1b[2m(${r.intent})\x1b[0m`);
    for (const b of r.blocks) {
      if (b.kind === 'text') console.log('  ' + bold(b.text));
      else if (b.kind === 'list') console.log((b.title ? `  ${b.title}:\n` : '') + b.items.map((i) => '   • ' + bold(i)).join('\n'));
      else if (b.kind === 'specs') console.log(b.rows.map(([l, v]) => `   - ${l}: ${v}`).join('\n'));
      else if (b.kind === 'table') console.log(['   | ' + b.columns.join(' | '), ...b.rows.map((row) => '   | ' + row.join(' | '))].join('\n') + (b.note ? `\n   ${b.note}` : ''));
      else if (b.kind === 'products') console.log('   ▸ ' + b.items.map((i) => i.name).join('\n   ▸ '));
      else if (b.kind === 'links') console.log('   ↗ ' + b.items.map((l) => `${l.label} (${l.url})`).join('  '));
      else if (b.kind === 'contact') console.log(`   [${b.label ?? 'WhatsApp our team'}] [Call]`);
    }
    if (r.chips?.length) console.log('  \x1b[2mSuggestions: ' + r.chips.join(' · ') + '\x1b[0m');
  }
  console.log('\n' + '─'.repeat(60));
}
