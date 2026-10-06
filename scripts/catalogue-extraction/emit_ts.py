"""Writes src/app/data/products.data.ts from work/data/products_backup.json and records the
expected product count used by the data-integrity check (scripts/verify-data.mjs)."""
import json
W = '/home/claude/work'; APP = '/home/claude/whm-website'
P = json.load(open(f'{W}/data/products_backup.json'))
order = ['id', 'slug', 'name', 'modelCode', 'brandSlug', 'categorySlug', 'productType', 'shortDescription', 'features', 'specifications', 'variants', 'images', 'catalogueSource']
out = []
for p in P:
    q = {k: p[k] for k in order if k in p}
    extra = set(p) - set(order)
    assert not extra, extra
    out.append(q)
body = json.dumps(out, ensure_ascii=False, indent=1)
ts = ('// AUTO-GENERATED from the supplied catalogues and product file — see scripts/README in the project root.\n'
      '// Every product is kept; customer-facing grouping happens in taxonomy.data.ts (productType -> category).\n'
      'import { Product } from \'../core/models/product.model\';\n\n'
      f'export const PRODUCT_COUNT = {len(out)};\n\n'
      f'export const PRODUCTS: Product[] = {body};\n')
open(f'{APP}/src/app/data/products.data.ts', 'w').write(ts)
json.dump({'productCount': len(out), 'ids': [p['id'] for p in out]}, open(f'{APP}/scripts/data-baseline.json', 'w'), indent=0)
print('wrote', len(out))
