"""Builds the Western Hardware Mart product dataset from the supplied sources.

Outputs (into the Angular project):
  src/app/data/products.data.ts      every product (no prices, no catalogue/PDF links)
  public/assets/products/...         product images extracted from the supplied PDFs
Also writes work/data/products_backup.json so the build can be checked against a fixed count.
"""
import json, os, re, shutil, sys

W = '/home/claude/work'
APP = '/home/claude/whm-website'
OUT_IMG = f'{APP}/public/assets/products'
products = []
ids = set()


def slugify(s):
    s = s.lower().replace('&', ' and ').replace('"', ' inch ').replace('/', ' ')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return re.sub(r'-+', '-', s).strip('-')


def add(p):
    assert p['id'] not in ids, p['id']
    ids.add(p['id'])
    p.setdefault('slug', p['id'])
    products.append(p)


def copy_img(src, brand, name):
    os.makedirs(f'{OUT_IMG}/{brand}', exist_ok=True)
    ext = os.path.splitext(src)[1]
    dst = f'{OUT_IMG}/{brand}/{name}{ext}'
    if not os.path.exists(dst):
        shutil.copy(src, dst)
    return f'/assets/products/{brand}/{name}{ext}'


def png_to_jpg(src, brand, name):
    from PIL import Image
    os.makedirs(f'{OUT_IMG}/{brand}', exist_ok=True)
    dst = f'{OUT_IMG}/{brand}/{name}.jpg'
    if not os.path.exists(dst):
        im = Image.open(src)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im); im = bg
        im = im.convert('RGB')
        im.thumbnail((900, 900))
        im.save(dst, quality=88)
    return f'/assets/products/{brand}/{name}.jpg'


def S(*pairs):
    return [{'label': a, 'value': b} for a, b in pairs]

# ---------------------------------------------------------------- Asian Hydraulic
AH = 'asian-hydraulic'
SRC_AH = 'Asian Hydraulic product catalogue'
ball_common = [('Body material', 'Carbon steel'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')]


def ah(id, name, model, sub, desc, specs, img, table=None, features=None, extra_imgs=None):
    images = [png_to_jpg(f'{W}/img/asian/{img}.png', AH, img)] if img else []
    for e in (extra_imgs or []):
        images.append(e)
    p = dict(id=id, name=name, modelCode=model, brandSlug=AH, categorySlug=sub, productType=sub,
             shortDescription=desc, specifications=S(*specs), images=images, catalogueSource=SRC_AH)
    if table: p['variants'] = table
    if features: p['features'] = features
    add(p)

# parse KHB2 tables from catalogue text
cat_txt = open(f'{W}/txt/asian-catalogue.txt').read().split('\f')

def rows_from(page, prefix, conn=None):
    out = []
    for l in cat_txt[page - 1].splitlines():
        s = re.sub(r'\s+', ' ', l.strip())
        m = re.search(rf'({prefix}[^|]*?)\s+(\d+)\s*Bar\s+(\d+)\b.*\s([\d]+[,.]\d+)$', s)
        if m:
            out.append([m.group(1).strip(), f'{m.group(2)} bar', m.group(3), m.group(4).replace(',', '.')])
    return out

def split_rows(rows, n):
    return rows

khb2_rows = rows_from(4, 'KHB2')
kh3_rows = rows_from(6, 'KH3')
khb2_lh = rows_from(5, 'KHB2')
khb2sf = rows_from(9, 'KHB')
ah('asian-khb2-ball-valve', 'High Pressure Ball Valve — KHB2 (2-Way, Standard)', 'KHB2', 'high-pressure-ball-valves',
   '2-way high pressure block-body ball valve in carbon steel, PN up to 500 bar, with BSP, NPT and SAE threaded connections.',
   [('Type', '2-way ball valve'), ('Body', 'Block'), ('Material', '1.0737 carbon steel'), ('Ball seats', 'DN4 up to DN25'), ('Operating pressure', 'Up to 500 bar depending on valve size and seal material'), ('Nominal size', 'Up to DN50'), ('Connections', 'BSP (DIN ISO 228), NPT (ANSI/ASME B1.20.1), SAE J1926-1'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'khb2-standard', [dict(title='KHB2 standard sizes', columns=['Type', 'PN', 'DN', 'Weight (kg)'], rows=khb2_rows)])
ah('asian-khb2-light-heavy', 'High Pressure Ball Valve — KHB2 Light & Heavy Series (DIN 2353)', 'KHB2 L / KHB2 S', 'high-pressure-ball-valves',
   '2-way carbon steel ball valve with DIN 2353 tube connections, in light (L) and heavy (S) series.',
   [('Type', '2-way ball valve'), ('Connections', 'DIN 2353 compression (light & heavy series)'), ('Pressure', 'PN up to 500 bar'), ('Nominal size', 'Up to DN50')] + ball_common,
   'khb2-light-heavy', [dict(title='Light (L) and heavy (S) series', columns=['Type', 'PN', 'DN', 'Weight (kg)'], rows=khb2_lh)])
ah('asian-kh3-ball-valve', 'High Pressure Ball Valve — KH3 (3-Way, Standard)', 'KH3', 'high-pressure-ball-valves',
   '3-way high pressure block-body ball valve in carbon steel with BSP, NPT and SAE connections.',
   [('Type', '3-way ball valve'), ('Body', 'Block'), ('Material', '1.0737 carbon steel'), ('Ball seats', 'DN4 up to DN25'), ('Operating pressure', 'Up to 400 bar depending on valve size and seal material'), ('Connections', 'BSP (DIN ISO 228), NPT (ANSI/ASME B1.20.1), SAE J1926-1'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'kh3-standard', [dict(title='KH3 standard sizes', columns=['Type', 'PN', 'DN', 'Weight (kg)'], rows=kh3_rows)])
ah('asian-kh3-light-heavy', 'High Pressure Ball Valve — KH3 Light & Heavy Series (DIN 2353)', 'KH3 L / KH3 S', 'high-pressure-ball-valves',
   '3-way carbon steel ball valve with DIN 2353 tube connections, in light and heavy series.',
   [('Type', '3-way ball valve'), ('Connections', 'DIN 2353 compression (light & heavy series)')] + ball_common, 'kh3-light-heavy')
ah('asian-kh4-ball-valve', 'High Pressure Ball Valve — KH4 (4-Way)', 'KH4', 'high-pressure-ball-valves',
   '4-way square-body high pressure ball valve with L, T and X ball drilling options.',
   [('Type', '4-way ball valve'), ('Body', 'Square'), ('Material', '1.0570 / 1.0737'), ('Ball seats', 'DN6 up to DN25'), ('O-rings', 'NBR'), ('Operating pressure', 'Up to 500 bar depending on valve size and seal material'), ('Ball drilling', 'L, T or X bore'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'kh4', [dict(title='KH4 sizes', columns=['Port', 'Max. pressure'], rows=[['1/4" BSP', '500 bar'], ['3/8" BSP', '500 bar'], ['1/2" BSP', '400 bar'], ['3/4" BSP', '400 bar']])],
   features=['Positive overlap valves — at approx. 45° rotation flow is blocked to all ports'])
ah('asian-khb2sf-ball-valve', 'High Pressure Ball Valve with Split Flange — KHB2SF', 'KHB2SF', 'high-pressure-ball-valves',
   '2-way ball valve with SAE J518 split flange connections (S3000 / S6000).',
   [('Type', '2-way ball valve'), ('Body', 'Block'), ('Material', '1.0737 carbon steel'), ('Ball seats', 'DN13 up to DN25'), ('Operating pressure', 'S3000 (PN210) / S6000 (PN420) depending on size and seals'), ('Connections', 'SAE J518 split flange'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'khb2sf', [dict(title='Split flange sizes', columns=['Type', 'PN', 'DN', 'Weight (kg)'], rows=khb2sf)])
ah('asian-khp2-ball-valve', 'Manifold Block Mounted High Pressure Ball Valve — KHP2', 'KHP2', 'manifold-ball-valves',
   '2-way square-body ball valve for direct manifold block mounting, DN6 to DN50.',
   [('Type', '2-way ball valve, manifold mounted'), ('Body', 'Square'), ('Ball seats', 'DN6 up to DN50'), ('Operating pressure', 'Up to 500 bar depending on valve size and seal material'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'khp2', [dict(title='KHP2 sizes', columns=['PN', 'DN', 'Weight (kg)'], rows=[['500 bar', '6', '0.593'], ['500 bar', '10', '1.304'], ['400 bar', '13', '2.387'], ['350 bar', '20', '4.079'], ['350 bar', '25', '5.883'], ['350 bar', '32', '12.169'], ['350 bar', '40', '18.624'], ['350 bar', '50', '30.644']])])
ah('asian-khp3-ball-valve', 'Manifold Block Mounted High Pressure Ball Valve — KHP3', 'KHP3', 'manifold-ball-valves',
   '3-way square-body ball valve for direct manifold block mounting.',
   [('Type', '3-way ball valve, manifold mounted'), ('Body', 'Square'), ('Material', '1.0737 carbon steel'), ('Ball seats', 'DN6 up to DN25'), ('Operating pressure', 'Up to 500 bar depending on valve size and seal material'), ('O-rings', 'NBR, FKM, EPDM, MVQ'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'khp3', [dict(title='KHP3 sizes', columns=['PN', 'DN', 'Weight (kg)'], rows=[['500 bar', '6', '0.593'], ['500 bar', '10', '1.304'], ['400 bar', '13', '2.387'], ['350 bar', '20', '4.079'], ['350 bar', '25', '5.883'], ['350 bar', '32', '12.169'], ['350 bar', '40', '18.624'], ['350 bar', '50', '30.644']])])
fc_sizes = [['06', '1/8"'], ['08', '1/4"'], ['10', '3/8"'], ['12', '1/2"'], ['16', '3/4"'], ['20', '1"'], ['25', '1-1/4"'], ['30', '1-1/2"']]
drv_w = ['0.13', '0.30', '0.45', '0.80', '1.30', '2.40', '3.50', '4.60']
ah('asian-drv-flow-control', 'Flow Control Valve with Check Valve — DRV', 'DRV', 'flow-control-valves',
   'Inline carbon steel flow control (throttle) valve with integrated check valve; panel-mount kit available.',
   [('Pressure', 'Up to 350 bar'), ('Flow', 'Up to 300 l/min'), ('Port sizes', '1/8" to 1-1/2" NPTF'), ('Material', 'Carbon steel'), ('Mounting', 'Inline; panel mount kit (nut, washer, lock washer) available')],
   'drv', [dict(columns=['Model', 'Port size', 'Weight (kg)'], rows=[[f'DRV-{a}', b, w] for (a, b), w in zip(fc_sizes, drv_w)])])
ah('asian-drvp-flow-control', 'Manifold Mounted Flow Control Valve with Check Valve — DRVP', 'DRVP', 'flow-control-valves',
   'Manifold (sub-plate) mounted flow control valve with integrated check valve.',
   [('Pressure', 'Up to 350 bar'), ('Flow', 'Up to 300 l/min'), ('Nominal sizes', '1/8" to 1-1/2"'), ('Material', 'Carbon steel')],
   'drvp', [dict(columns=['Model', 'Nominal size', 'Weight (kg)'], rows=[[f'DRVP-{a}', b, w] for (a, b), w in zip(fc_sizes, ['0.26', '0.50', '0.80', '1.10', '2.50', '3.90', '6.70', '11.0'])])])
ah('asian-dv-flow-control', 'Flow Control Valve without Check Valve — DV (Inline Needle Valve)', 'DV', 'flow-control-valves',
   'Inline carbon steel needle-type flow control valve without check valve; panel-mount kit available.',
   [('Pressure', 'Up to 350 bar'), ('Flow', 'Up to 300 l/min'), ('Port sizes', '1/8" to 1-1/2"'), ('Material', 'Carbon steel')],
   'dv', [dict(columns=['Model', 'Port size', 'Weight (kg)'], rows=[[f'DV-{a}', b, w] for (a, b), w in zip(fc_sizes, ['0.12', '0.25', '0.40', '0.70', '1.2', '2.1', '2.8', '3.5'])])])
ah('asian-dvp-flow-control', 'Manifold Mounted Flow Control Valve without Check Valve — DVP', 'DVP', 'flow-control-valves',
   'Manifold mounted needle-type flow control valve; DVE cartridge version also available.',
   [('Pressure', 'Up to 350 bar'), ('Flow', 'Up to 300 l/min'), ('Nominal sizes', '1/8" to 1-1/2"'), ('Material', 'Carbon steel'), ('Cartridge version', 'DVE cartridge valve (3/4-16 UNF to 1-5/16-12 UNF)')],
   'dvp', [dict(columns=['Model', 'Nominal size', 'Weight (kg)'], rows=[[f'DVP-{a}', b, w] for (a, b), w in zip(fc_sizes, ['0.2', '0.4', '0.6', '1.0', '1.7', '3.6', '5.5', '7.5'])])])
ah('asian-nv-needle-valve', 'Needle Valve — NV', 'NV', 'hydraulic-needle-valves',
   '2-way square-body high pressure needle valve with BSP (DIN ISO 228) ports.',
   [('Type', 'Needle valve, 2-way'), ('Body', 'Square'), ('Material', '1.0570 / 1.4301'), ('Sizes', 'DN6 up to DN40'), ('Operating pressure', 'S3000 (210 bar) / S6000 (350 bar) depending on size and seals'), ('Temperature range', '-20 °C to +100 °C depending on seal material')],
   'nv', [dict(columns=['Type', 'PN', 'DN', 'Weight (kg)'], rows=[['NV G 1/4', '500 bar', '6', '0.55'], ['NV G 3/8', '500 bar', '10', '0.55'], ['NV G 1/2', '500 bar', '13', '0.99'], ['NV G 3/4', '500 bar', '20', '1.30'], ['NV G 1"', '500 bar', '25', '1.80'], ['NV G 1-1/4"', '500 bar', '32', '2.20'], ['NV G 1-1/2"', '500 bar', '40', '2.20']])])
ah('asian-mssl-shut-off-valve', 'Shut-off Valve — Sub-plate Mounting (MSSL06)', 'MSSL06-2.0', 'shut-off-valves',
   'Rising spindle, seat-type shut-off valve with metal-to-metal seat for leak-free closure between ports A and B.',
   [('Type', '2-way shut-off valve, sub-plate mounted'), ('Seat', 'Metal to metal, leak-free'), ('Fixing screws', 'M5 × 50 L (10.9), 4 nos.'), ('Tightening torque', '9 Nm'), ('Material', 'Carbon steel')], 'mssl')
ah('asian-cv-check-valve', 'Inline High Pressure Check Valve — CV', 'CV', 'inline-check-valves',
   'Hexagon-body inline check valve, BSP ports, 1/4" to 2", with 0.5/1 bar cracking pressure.',
   [('Body', 'Hexagon'), ('Material', '1.0737 / 1.4749'), ('Sizes', '1/4" to 2"'), ('Operating pressure', 'PN500 (by size, 350–400 bar)'), ('Cracking pressure', '0.5 / 1 bar'), ('Temperature range', '-10 °C to +100 °C depending on seal material')],
   'cv', [dict(columns=['Type', 'PN', 'DN', 'Max flow (l/min)', 'Weight (kg)'], rows=[['CV G 1/4', '400 bar', '6', '15', '0.1'], ['CV G 3/8', '400 bar', '10', '30', '0.18'], ['CV G 1/2', '400 bar', '13', '50', '0.23'], ['CV G 3/4', '400 bar', '20', '90', '0.45'], ['CV G 1"', '400 bar', '25', '150', '0.73'], ['CV G 1-1/4"', '350 bar', '32', '200', '1.49'], ['CV G 1-1/2"', '350 bar', '40', '300', '2'], ['CV G 2"', '350 bar', '50', '430', '2.7']])])
ah('asian-qdc-coupling', 'Quick Disconnect Coupling — QDC', 'QDC', 'quick-disconnect-couplings',
   'Quick disconnect couplings for fast connection and disconnection of hydraulic lines, with unrestricted flow when connected.',
   [('Type', '2-way, carbon steel'), ('Variants', 'Through type coupling (CT) / adaptor (AT); self-sealing coupling (CS) / adaptor (AS)'), ('End connections', 'Female BSP (G) or metric (M)')],
   'qdc', features=['Unrestricted flow passage when connected', 'Designed to avoid premature flow before the coupling is fully closed', 'Self-sealing and through-type versions'])

# flat face + ISO A couplings (QRC sheets)
qrc_dir = f'{W}/img/qrc'
add(dict(id='asian-ahf04-flat-face-coupling', name='Flat Face Quick Release Coupling — AHF04 (ISO 16028)', modelCode='AHF04', brandSlug=AH,
         categorySlug='flat-face-couplings', productType='flat-face-couplings',
         shortDescription='Flat face hydraulic quick release coupling to ISO 16028, 350–500 bar working pressure, sizes ISO 5 to ISO 25.',
         specifications=S(('Standard', 'ISO 16028 (DN06 → DN30)'), ('Occlusion', 'Flat face'), ('Locking', 'Radial balls'), ('Material', 'Steel'), ('Finishing', 'Zn-Fe (Cr III) and Zn-Ni'), ('Threads', 'BSP / NPT'), ('Standard seals', 'NBR and PU'), ('Optional seals', 'FKM, EPDM or more'), ('Working temperature', '-25 °C to +100 °C'), ('Working pressure', '350 – 500 bar'), ('Connection under residual pressure', 'Not allowed')),
         variants=[dict(title='Sizes', columns=['DN', 'ISO size', 'Max working pressure (MPa)', 'Rated flow (l/min)', 'Max flow (l/min)'], rows=[['04', '5', '50', '3', '9'], ['06', '6.3', '40', '12', '24'], ['13', '10', '35', '23', '46'], ['20', '12.5', '35', '45', '90'], ['22', '16', '35', '74', '150'], ['25', '19', '35', '100', '200'], ['30', '25', '35', '189', '280']]),
                   dict(title='Part numbers (female / male)', columns=['Size', 'Thread', 'Female code', 'Male code'], rows=[['ISO 5', 'BSP 1/8"', 'AH04-G-04-05-F', 'AH04-G-04-05-M'], ['ISO 5', 'NPT 1/8"', 'AH04-N-04-05-F', 'AH04-N-04-05-M'], ['ISO 6.3', 'BSP 1/4"', 'AH04-G-06-6.3-F', 'AH04-G-06-6.3-M'], ['ISO 6.3', 'NPT 1/4"', 'AH04-N-06-6.3-F', 'AH04-N-06-6.3-M'], ['ISO 10', 'BSP 3/8"', 'AH04-G-10-10-F', 'AH04-G-10-10-M'], ['ISO 10', 'NPT 3/8"', 'AH04-N-10-10-F', 'AH04-N-10-10-M'], ['ISO 10', 'BSP 1/2"', 'AH04-G-13-10-F', 'AH04-G-13-10-M'], ['ISO 10', 'NPT 1/2"', 'AH04-N-13-10-F', 'AH04-N-13-10-M'], ['ISO 12.5', 'BSP 1/2"', 'AH04-G-13-12.5-F', 'AH04-G-13-12.5-M'], ['ISO 12.5', 'NPT 1/2"', 'AH04-N-13-12.5-F', 'AH04-N-13-12.5-M'], ['ISO 12.5', 'BSP 3/4"', 'AH04-G-20-12.5-F', 'AH04-G-20-12.5-M'], ['ISO 12.5', 'NPT 3/4"', 'AH04-N-20-12.5-F', 'AH04-N-20-12.5-M'], ['ISO 16', 'BSP 3/4"', 'AH04-G-20-16-F', 'AH04-G-20-16-M'], ['ISO 16', 'NPT 3/4"', 'AH04-N-20-16-F', 'AH04-N-20-16-M'], ['ISO 19', 'BSP 1"', 'AH04-G-25-19-F', 'AH04-G-25-19-M'], ['ISO 19', 'NPT 1"', 'AH04-N-25-19-F', 'AH04-N-25-19-M'], ['ISO 25', 'BSP 1-1/4"', 'AH04-G-32-25-F', 'AH04-G-32-25-M'], ['ISO 25', 'NPT 1-1/4"', 'AH04-N-32-25-F', 'AH04-N-32-25-M']])],
         images=[png_to_jpg(f'{qrc_dir}/ahf04-photo.png', AH, 'ahf04-flat-face'), png_to_jpg(f'{qrc_dir}/ah04-iso10-drawing.png', AH, 'ahf04-drawing')],
         catalogueSource='Asian Hydraulic flat face QRC sheet'))
ah_sizes = [['06 (1/4")', '1/4 BSP', 'AH06-04G'], ['06 (1/4")', '1/4 NPTF', 'AH06-04N'], ['10 (3/8")', '3/8 BSPP', 'AH10-06G'], ['10 (3/8")', '3/8 NPTF', 'AH10-06N'], ['12 (1/2")', '1/2 BSPP', 'AH12-08G'], ['12 (1/2")', '1/2 NPTF', 'AH12-08N'], ['19 (3/4")', '3/4 BSPP', 'AH19-12G'], ['19 (3/4")', '3/4 NPTF', 'AH19-12N'], ['25 (1")', '1 BSPP', 'AH25-16G'], ['25 (1")', '1 NPTF', 'AH25-16N'], ['32 (1-1/4")', '1-1/4 BSPP', 'AH32-20G'], ['32 (1-1/4")', '1-1/4 NPTF', 'AH32-20N'], ['40 (1-1/2")', '1-1/2 BSPP', 'AH40-24G'], ['40 (1-1/2")', '1-1/2 NPTF', 'AH40-24N'], ['50 (2")', '2 BSPP', 'AH50-32G'], ['50 (2")', '2 NPTF', 'AH50-32N']]
iso_specs = S(('Standard', 'ISO 7241:2014 Series A'), ('Body sizes', '1/4" to 2" (AH06 – AH50)'), ('Construction', 'Carbon steel with trivalent plating (zinc nickel available); also available in AISI 316 stainless steel'), ('Seals', 'Nitrile (Viton available)'), ('Operating temperature', 'Nitrile: -40 °C to 106 °C; Viton: -20 °C to 200 °C'), ('Max working pressure (coupled)', '400 bar (AH06) down to 170 bar (AH50)'), ('Threads', 'BSPP / NPTF; SAE / metric available'))
iso_feat = ['Optional zinc nickel plating (1200 hours with no red rust in salt spray tests)', 'Poppet valves with balanced springs', 'Locking ball system for quick connection', 'Bidirectional flow', 'Applications: general hydraulics, mobile, construction, agricultural']
perf = dict(title='Performance by body size', columns=['Body size', 'Max working pressure (bar)', 'Rated flow (l/min)'], rows=[['AH06', '400', '3'], ['AH10', '350', '23'], ['AH12', '320', '45'], ['AH19', '300', '106'], ['AH25', '250', '189'], ['AH32', '250', '288'], ['AH40', '230', '379'], ['AH50', '170', '757']])
photo = png_to_jpg(f'{qrc_dir}/ah-series-photo.png', AH, 'ah-series-iso-a')
add(dict(id='asian-ah-iso-a-female-coupling', name='ISO A Quick Release Coupling — AH Series Female', modelCode='AH Series (-F)', brandSlug=AH,
         categorySlug='iso-a-couplings', productType='iso-a-couplings', shortDescription='ISO 7241:2014 Series A female hydraulic quick release coupling, 1/4" to 2", BSPP and NPTF threads.',
         specifications=iso_specs, features=iso_feat,
         variants=[dict(title='Female part numbers', columns=['Body size', 'Thread', 'Part number'], rows=[[a, b, c + '-F'] for a, b, c in ah_sizes]), perf],
         images=[photo, png_to_jpg(f'{qrc_dir}/ah-female-drawing.png', AH, 'ah-female-drawing')], catalogueSource='Asian Hydraulic ISO 7241 QRC sheet'))
add(dict(id='asian-ah-iso-a-male-coupling', name='ISO A Quick Release Coupling — AH Series Male', modelCode='AH Series (-M)', brandSlug=AH,
         categorySlug='iso-a-couplings', productType='iso-a-couplings', shortDescription='ISO 7241:2014 Series A male hydraulic quick release coupling (nipple), 1/4" to 2", BSPP and NPTF threads.',
         specifications=iso_specs, features=iso_feat,
         variants=[dict(title='Male part numbers', columns=['Body size', 'Thread', 'Part number'], rows=[[a, b, c + '-M'] for a, b, c in ah_sizes]), perf],
         images=[photo, png_to_jpg(f'{qrc_dir}/ah-male-drawing.png', AH, 'ah-male-drawing')], catalogueSource='Asian Hydraulic ISO 7241 QRC sheet'))

# tube fittings groups
fit = json.load(open(f'{W}/asian_fittings.json'))
fit_type = {'Tube Coupling Parts': 'tube-fittings', 'Adaptor': 'adaptors-plugs', 'Gauge Adaptor': 'adaptors-plugs', 'Blanking End': 'adaptors-plugs', 'Reducer / Expander': 'adaptors-plugs',
            'Fitting Check Valve': 'inline-check-valves', 'Fitting Seal': 'fitting-seals-tools', 'Fitting Tool': 'fitting-seals-tools', 'SAE Flanged Connection': 'sae-flanges'}
fit_desc = {
    'Tube Coupling Parts': 'Tube fitting components — body, nut and ring — for compression tube fittings.',
    'Fitting Check Valve': 'Tube-fitting style inline check valve.',
    'Fitting Seal': 'Seals for hydraulic tube fittings and adaptors.',
    'Fitting Tool': 'Assembly tool for hydraulic tube fittings.',
}
for name, imgs in fit.items():
    t = fit_type.get(name)
    if not t:
        t = 'plugs' if name.startswith('Plug') else ('banjo-swivel-fittings' if re.search('Banjo|Swivel|Live', name) else 'tube-fittings')
        if t == 'plugs': t = 'adaptors-plugs'
    disp = {'Fitting Check Valve': 'Check Valve (Tube Fitting Type)', 'Fitting Seal': 'Tube Fitting Seals', 'Fitting Tool': 'Tube Fitting Assembly Tool'}.get(name, name)
    desc = fit_desc.get(name) or f'Hydraulic tube fitting — {disp.lower()}.'
    images = [png_to_jpg(f'{W}/img/asian/{f}', AH, f[:-4]) for f in imgs]
    add(dict(id=f'asian-fitting-{slugify(disp)}', name=disp, brandSlug=AH, categorySlug=t, productType=t,
             shortDescription=desc, specifications=[], images=images, catalogueSource=SRC_AH))

# ---------------------------------------------------------------- Polyhydron
PH = 'polyhydron'
SRC_PH = 'Polyhydron engineering datasheets'
def ph(id, name, model, sub, desc, specs, img, features=None, table=None):
    p = dict(id=id, name=name, modelCode=model, brandSlug=PH, categorySlug=sub, productType=sub, shortDescription=desc,
             specifications=S(*specs), images=[copy_img(f'{W}/img/poly/{img}.jpg', PH, img)], catalogueSource=SRC_PH)
    if features: p['features'] = features
    if table: p['variants'] = table
    add(p)
std = [('Hydraulic medium', 'Mineral oil'), ('Viscosity range', '10 cSt to 380 cSt'), ('Fluid cleanliness', 'ISO 4406 20/18/15 or better')]
ph('polyhydron-2tcl10', 'Double Throttle cum Check Valve — 2TCL10', '2TCL10', 'throttle-check-valves', 'Threaded, non-pressure-compensated double throttle check valve for controlling flow in one direction with free reverse flow; available on port A, B or A & B.',
   [('Construction', 'Threaded, spool type, non-pressure compensated'), ('Operating pressure', '315 bar'), ('Variants', '2TCL10AB, 2TCL10A, 2TCL10B'), ('Fluid temperature', '-20 °C to +80 °C'), ('Mass', '2.1 kg (AB) / 2 kg (A, B)')] + std, '2tcl10',
   ['Convertible from meter-in to meter-out by rotating the body 180°', 'Check nut to lock the setting', 'Protective cap'])
ph('polyhydron-tcm10', 'Throttle cum Check Valve, Modular — TCM10', 'TCM10', 'throttle-check-valves', 'Modular (sandwich) throttle check valve to ISO 4401-05 for controlling flow on port A, B or A & B.',
   [('Construction', 'Modular, spool type, non-pressure compensated'), ('Mounting', 'Modular, conforming to ISO 4401-05-04-0-94'), ('Operating pressure', '315 bar'), ('Variants', 'TCM10AB, TCM10A, TCM10B'), ('Fluid temperature', '-20 °C to +80 °C'), ('Mass', '2.1 kg (AB) / 2 kg (A, B)')] + std, 'tcm10')
ph('polyhydron-tcm06', 'Throttle / Check Valve, Modular — TCM06', 'TCM06', 'throttle-check-valves', 'Modular throttle check valve to ISO 4401-03 (CETOP 3) for controlling flow on port A, B or A & B.',
   [('Construction', 'Modular, spool type, non-pressure compensated'), ('Mounting', 'Modular, conforming to ISO 4401-03-02-0-94, IS 10187, DIN 24340'), ('Operating pressure', '315 bar'), ('Variants', 'TCM06AB, TCM06A, TCM06B'), ('Fluid temperature', '-20 °C to +80 °C'), ('Mass', '1.1 kg')] + std, 'tcm06')
ph('polyhydron-fdta', 'Flow Divider — FDTA', 'FDTA', 'flow-dividers', 'Pressure-compensated spool type flow divider that divides inlet flow equally (50:50) between two outlets irrespective of outlet pressure.',
   [('Construction', 'Pressure compensated spool type'), ('Mounting', 'Threaded body'), ('Dividing ratio', '50 : 50'), ('Dividing variation', '± 5%'), ('Working pressure', '350 bar'), ('Sizes', 'NG 10 (2.5 kg), NG 15 (5 kg)'), ('Temperature range', '-20 °C to +80 °C')] + std, 'fdta',
   table=[dict(columns=['Size', 'Variant', 'Inlet flow (l/min)'], rows=[['NG 10', 'A', '05 – 10'], ['NG 10', 'B', '10 – 18'], ['NG 15', 'C', '15 – 30'], ['NG 15', 'D', '30 – 100']])])
ph('polyhydron-2pf10', 'Pressure Compensated Flow Control Valve — 2PF*10', '2PF*10', 'flow-control-valves', 'Pressure compensated flow control valve (A → B) with optional reverse free-flow check and stroke limiter.',
   [('Construction', 'Differential piston with sharp edge orifice'), ('Interface', 'ISO 6263-06-05'), ('Flow ranges', '0.25–4, 0.5–8, 1–16, 2–32 or 3–40 l/min'), ('Accuracy', '± 3%'), ('Operating pressure', '315 bar'), ('Min. pressure differential', '7 bar (A → B)'), ('Mass', '2.4 kg'), ('Adjustment', 'Hand knob (2PFH) or set screw (2PFS)')] + std, '2pf10',
   ['Seven rotations of hand knob over the controlling range', 'Optional check valve for reverse free flow', 'Stroke limiter option for surge-free start'])
dcv_std = [('Hydraulic medium', 'Mineral oil'), ('Viscosity range', '10 cSt to 380 cSt')]
ph('polyhydron-4de10', 'Solenoid Operated Directional Control Valve — 4DE10 (Size 10, D05)', '4DE10', 'solenoid-directional-valves', '4/3 and 4/2-way wet-pin AC/DC solenoid directional control valve, size 10 (D05), 315 bar, 120 l/min.',
   [('Interface', 'ISO 4401-5 / NFPA T3.5.1M R1 / ANSI B93-7 D05'), ('Nominal pressure', 'P, A, B: 315 bar; T: 175 bar'), ('Max. flow', '120 l/min'), ('Power', '35 W'), ('Duty cycle', 'Continuous'), ('Protection', 'IP 65'), ('Weight', '4.2 – 5.8 kg (1 or 2 solenoids)')], '4de10',
   ['Five-chamber body and spool for high flow', '52 standard interchangeable spool configurations', 'Removable wet-armature AC and DC solenoids', 'Plug-in connectors with indicator lights (ISO 4400 / DIN 43650)', 'Manual override'])
ph('polyhydron-dl06', 'Lever Operated Directional Control Valve — 4DL06 (CETOP 3)', '4DL06', 'manual-directional-valves', 'Hand-lever operated spool directional valve, ISO 4401-03, spring centred, spring offset or detented.',
   [('Interface', 'ISO 4401-03-02'), ('Mounting', 'Subplate body'), ('Max. pressure', 'P, A, B: 315 bar; T: 100 bar'), ('Fluid temperature', '-20 °C to +70 °C'), ('Mass', '1.5 kg')] + dcv_std, 'dl06',
   ['Operating head can be rotated 90° × 4', 'Encapsulated mechanism protects against dirt', 'Interchangeable spools and bodies'])
ph('polyhydron-de06', 'Solenoid Operated Directional Control Valve — 4DE06 (CETOP 3)', '4DE06', 'solenoid-directional-valves', 'Direct solenoid operated spool directional valve, ISO 4401-03, with wet-pin DC solenoids and plug-in coils.',
   [('Interface', 'ISO 4401-03-02'), ('Max. pressure', 'P, A, B: 315 bar; T: 100 bar'), ('Voltage', 'DC 12 V / 24 V; AC 110 V / 220 V 50 Hz'), ('Power', '30 W'), ('Switching time', 'ON 40 ms / OFF 30 ms'), ('Protection', 'IP65'), ('Mass', '1.2 kg (single) / 1.8 kg (double solenoid)')] + dcv_std, 'de06',
   ['Wet-pin DC solenoid for better heat dissipation and quieter operation', 'Moulded coils against moisture and dust', 'Indicator lights standard'])
ph('polyhydron-des', 'Solenoid Operated Directional Control Valve — DES (Size 10 / 20)', 'DES 10 / DES 20', 'solenoid-directional-valves', 'Solenoid pilot operated spool-with-poppet valve for single acting up-stroking cylinders that must hold pressure, with smooth decompression.',
   [('Construction', 'Spool with poppet'), ('Mounting', 'Threaded body'), ('Max. pressure', 'P, A, B, C, G: 350 bar'), ('Pilot flow', '2 l/min (min)'), ('Mass', 'DES 10: 10.5 kg; DES 20: 19.5 kg')] + dcv_std, 'des',
   ['Optional mounting for pressure relief valve and pressure switch', 'Multiple single acting cylinders can be operated in series'])
ph('polyhydron-dls', 'Hand Lever Operated Directional Control Valve — DLS (Size 10 / 20)', 'DLS 10 / DLS 20', 'manual-directional-valves', 'Hand-lever spool-with-poppet valve for single acting up-stroking cylinders that must hold pressure, spring centred or detent.',
   [('Construction', 'Spool with poppet'), ('Mounting', 'Threaded body'), ('Max. pressure', 'P, A, B, C, G: 350 bar'), ('Mass', 'DLS 10: 8 kg; DLS 20: 18 kg')] + dcv_std, 'dls')
ph('polyhydron-4dp10', 'Pilot Operated Directional Control Valve — 4DP10', '4DP10', 'pilot-directional-valves', 'Pilot operated spool directional valve, 10 mm nominal port, standard 350 bar and high pressure 700 bar versions.',
   [('Interface', 'ISO 4401-AC-05-4-A / IS 10187'), ('Max. pressure', 'P, A, B: 350 bar (700 bar HP version); X, Y, T: 100 bar'), ('Min. pilot pressure', '5 bar'), ('Mass', '5 kg')] + dcv_std, '4dp10')
ph('polyhydron-4dl10', 'Lever Operated Directional Control Valve — 4DL10', '4DL10', 'manual-directional-valves', 'Hand-lever spool directional valve, subplate or threaded body, 350 bar (700 bar HP version).',
   [('Mounting', 'Subplate & threaded body'), ('Interface', 'ISO 4401-AC-05-4-A / IS 10187'), ('Max. pressure', 'P, A, B: 350 bar (700 bar HP); T: 100 bar'), ('Mass', '5.6 kg')] + dcv_std, '4dl10')
ph('polyhydron-4rdl', 'Rotary Directional Control Valve — 4RDL', '4RDL', 'manual-directional-valves', 'Hand-lever rotary disc directional valve for high pressure, negligible internal leakage and small flows; open or closed crossover.',
   [('Construction', 'Rotary disc type'), ('Mounting', 'Threaded, subplate and side subplate body'), ('Operating pressure', 'Open crossover 700 bar; closed crossover 500 bar (T: 10 bar)'), ('Mass', '1.5 – 2.1 kg')] + dcv_std, '4rdl')
pc = [('Hydraulic medium', 'Mineral oil'), ('Temperature range', '-20 °C to +80 °C')]
ph('polyhydron-2cb06t03', 'Dual Counter Balance Valve — 2CB06T03', '2CB06T03', 'counterbalance-valves', 'Spool type, internally pilot operated dual counter balance valve for special-purpose applications.',
   [('Construction', 'Spool type, internally pilot operated'), ('Mounting', 'Threaded port body, G 3/8'), ('Working pressure', '315 bar all ports'), ('Check valve cracking pressure', '1 bar'), ('Max. flow', '30 l/min'), ('Mass', '2.42 kg')] + pc, '2cb06t03')
ph('polyhydron-cbs20', 'Counter Balance Valve — CBS20 (30 Series)', 'CBS20', 'counterbalance-valves', 'Direct acting seat type counter balance valve with free flow B → A and leak-free closure in the opposite direction.',
   [('Construction', 'Direct acting, seat type'), ('Mounting', 'Threaded port body and subplate body'), ('Working pressure', '315 bar all ports'), ('Max. flow', '200 l/min'), ('Mass', 'CBS20T 8.6 kg / CBS20S 6.9 kg')] + pc, 'cbs20')
ph('polyhydron-cbst', 'Counter Balance Valve — CBS T (Size 10 / 20)', 'CBS10T / CBS20T', 'counterbalance-valves', 'Direct acting, internally piloted seat type counter balance valve with threaded ports.',
   [('Construction', 'Direct acting, seat type, internally pilot operated'), ('Ports', 'G 1/2 (size 10), G 1 (size 20)'), ('Working pressure', '315 bar all ports'), ('Max. flow', 'CBS10T 30 l/min; CBS20T 115 l/min'), ('Mass', 'CBS10T 1.3 kg; CBS20T 4.0 kg')] + pc, 'cbst')
pcm_feat = ['Controls double pumps of Hi-Lo systems', 'Unloads the low pressure pump when system pressure exceeds the unloader setting', 'Relieves the high pressure pump at relief valve set pressure']
ph('polyhydron-pcm3016', 'Pressure Control Module — PCM 30-16', 'PCM3016', 'pressure-control-modules', 'Hi-Lo pump pressure control module with size 25 unloader and size 16 high pressure relief valve.',
   [('Construction', 'Two-stage poppet HP relief + two-stage poppet LP unloading valve'), ('Mounting', 'Threaded body'), ('Max. pressure', 'LP pump 100 bar; HP pump & port P 315 bar'), ('Max. flow', 'HP 100 l/min; LP 400 l/min'), ('Mass', 'approx. 28 kg')], 'pcm3016', pcm_feat + ['Solenoid unloading optional'])
ph('polyhydron-pcm2016', 'Pressure Control Module — PCM 20-16', 'PCM20-16', 'pressure-control-modules', 'Hi-Lo pump pressure control module with size 20 unloader and size 16 relief valve.',
   [('Construction', 'Direct acting poppet HP relief + two-stage poppet LP unloading valve'), ('Operating pressure', 'LP 50 / 100 bar; HP 100 / 200 / 315 bar'), ('Flow', 'HP 100 l/min; LP 160 l/min'), ('Mass', 'approx. 10.5 kg')], 'pcm2016', pcm_feat)
ph('polyhydron-pcm2006', 'Pressure Control Module — PCM 20-06 / PCM 20-10', 'PCM20-06 / PCM20-10', 'pressure-control-modules', 'Hi-Lo pump pressure control module, available with filter port or provision for a DPM06 pressure reducing valve.',
   [('Construction', 'Direct acting poppet HP relief + two-stage poppet LP unloading valve'), ('Operating pressure', 'LP 50 / 100 bar; HP 100 / 200 / 315 bar'), ('Flow', 'PCM 20-06: HP 25 / LP 160 l/min; PCM 20-10: HP 60 / LP 160 l/min'), ('Mass', 'approx. 7.5 kg')], 'pcm2006', pcm_feat)
ph('polyhydron-pcm0606', 'Pressure Control Module — PCM 06-06', 'PCM06-06', 'pressure-control-modules', 'Compact Hi-Lo pump pressure control module, HP relief up to 700 bar.',
   [('Construction', 'Direct acting poppet HP relief + direct acting spool LP unloading valve'), ('Max. pressure', 'LP pump 100 bar; HP pump & port P 700 bar'), ('Max. flow', 'HP 25 l/min; LP 25 l/min'), ('Mass', 'approx. 2.8 kg')], 'pcm0606', pcm_feat)
ph('polyhydron-ppm', 'Pilot Operated Pressure Reducing Valve — PPM (Size 10 / 20 / 30)', 'PPM', 'pressure-reducing-valves', 'Two-stage pilot operated, normally open pressure reducing valve; subplate (ISO 5781) or threaded bodies.',
   [('Mounting', 'Subplate ISO 5781 / threaded bodies'), ('Inlet pressure (B)', '315 bar'), ('Outlet pressure (A)', '5 to 315 bar'), ('Max. back pressure (Y)', '60 bar'), ('Max. flow', 'Size 10: 80; 20: 200; 30: 300 l/min')] + pc, 'ppm')
ph('polyhydron-ppru', 'Pilot Operated Pressure Relief cum Unloading Valve — PPRU', 'PPRU', 'relief-valves', 'Two-stage poppet relief cum unloading valve with optional solenoid unloading.',
   [('Mounting', 'Subplate ISO 5781 (size 10, 20, 30) / threaded (20, 30)'), ('Max. pressure', 'A, P, X: 315 bar; B, Y: 60 bar'), ('Max. flow', 'Size 10: 100; 20: 200; 30: 400 l/min'), ('Spring ratings', '50, 100, 200 & 315 bar')] + pc, 'ppru')
ph('polyhydron-ppr', 'Pilot Operated Pressure Relief Valve — PPR', 'PPR', 'relief-valves', 'Two-stage poppet relief valve with vent connection; optional solenoid unloading or proportional relieving.',
   [('Mounting', 'Threaded bodies / subplate ISO 6264'), ('Max. pressure', 'P, X: 315 bar; T, Y: 210 bar'), ('Max. flow', 'Size 10: 100; 20: 200; 30: 400 l/min'), ('Fluid temperature', '-20 °C to +70 °C')], 'ppr')
ph('polyhydron-mppr06', 'Pilot Operated Pressure Relief Valve, Modular — MPPR06', 'MPPR*06', 'relief-valves', 'Modular pilot operated relief valve for vertical stacking, ISO 4401-03 interface; four models (P, A, B, AB).',
   [('Interface', 'ISO 4401-AB-03-04-A / IS 10187 / DIN 24340'), ('Max. pressure', 'P: 350 bar; T, Y: 60 bar'), ('Flow', '30 l/min'), ('Mass', '1.5 kg')] + pc, 'mppr06')
ph('polyhydron-ppm06k', 'Pilot Operated Pressure Reducing Valve Cartridge — PPM06K', 'PPM*06K', 'pressure-reducing-valves', 'Pilot operated spool-type pressure reducing valve cartridge with low pressure override.',
   [('Mounting', 'Threaded cartridge (M24 × 1.5)'), ('Max. pressure', 'P, A, B: 315 bar; Y: 60 bar'), ('Flow', '30 l/min'), ('Pressure ratings', '25, 50, 100, 200 & 315 bar'), ('Adjustment', 'Set screw or hand knob'), ('Mass', '0.2 kg')] + pc, 'ppm06k')
ph('polyhydron-ppr06k', 'Pilot Operated Pressure Relief Valve Cartridge — PPR06K', 'PPR*06K', 'relief-valves', 'Pilot operated spool-type pressure relief valve cartridge, up to 350 bar.',
   [('Mounting', 'Threaded cartridge'), ('Max. pressure', 'P: 350 bar; T, Y: 60 bar'), ('Adjustment', 'Set screw or hand knob'), ('Mass', '0.2 kg')] + pc, 'ppr06k')
ph('polyhydron-dps06', 'Direct Acting Pressure Sequence Valve — DPS06', 'DPS 06S', 'sequence-valves', 'Direct acting spool type pressure sequence valve, subplate mounted to ISO 6403.',
   [('Mounting', 'Subplate, ISO 6403'), ('Pressure ratings', '25, 50, 100 & 200 bar (primary up to 315 bar)'), ('Working pressure', 'P & B: 315 bar; T: 60 bar'), ('Mass', '1.54 kg')] + pc, 'dps06')
ph('polyhydron-dpm06', 'Direct Acting Pressure Reducing Valve — DPM06', 'DPM 06S', 'pressure-reducing-valves', 'Direct acting spool type pressure reducing valve, secondary (SA) or remote (SB) control.',
   [('Mounting', 'Subplate, ISO 6403'), ('Pressure ratings', '25, 50, 100 & 200 bar (primary up to 315 bar)'), ('Working pressure', 'P: 315 bar; A & B: 200 bar; T: 60 bar'), ('Mass', '1.54 kg')] + pc, 'dpm06')
ph('polyhydron-dpr', 'Direct Acting Pressure Relief Valve — DPR (Size 06 / 10 / 20)', 'DPR', 'relief-valves', 'Direct acting guided-poppet relief valve with cushioning, as cartridge, threaded body or subplate.',
   [('Sizes', '06, 10 and 20'), ('Mounting', 'Threaded cartridge, threaded port body, subplate'), ('Pressure ranges', 'Up to 25, 50, 100, 200, 315 & 400 bar (700 bar in size 06)'), ('Adjustment', 'Set screw with lock nut or hand knob')], 'dpr',
   ['Guided poppet design', 'Cushion arrangement for stability and noise control'])

# ---------------------------------------------------------------- Delta
DL = 'delta'
_ns={}; exec(open(f'{W}/data/delta_notes.py').read(), _ns); D=_ns['D']
for d in D:
    sub = d['cat']
    nm = d['name']
    did = 'delta-' + (slugify(d['code']) + '-' if d['code'] else '') + slugify(nm)[:50].strip('-')
    desc = d['desc'] or {
        'pressure-gauges': 'Industrial pressure gauge for process and hydraulic applications.',
        'temperature-gauges': 'Industrial temperature gauge for process applications.',
        'thermowells': 'Thermowell for protecting temperature sensors in process lines.',
        'diaphragm-seals': 'Diaphragm seal for isolating pressure instruments from the process medium.',
        'needle-valves': 'Instrumentation needle valve.', 'manifold-valves': 'Instrument manifold valve for pressure transmitters and gauges.',
        'instrumentation-accessories': 'Accessory for pressure gauge and instrument installations.', 'rtd-thermocouples': 'Temperature sensor assembly for process applications.'}[sub]
    sub2 = {'needle-valves': 'instrument-needle-valves', 'instrumentation-accessories': 'gauge-accessories', 'rtd-thermocouples': 'rtds' if d['code'].startswith('RTD') else 'thermocouples'}.get(sub, sub)
    if d['img'] == 'service': sub2 = 'instrument-services'
    if sub == 'pressure-gauges' and 'Diaphragm' in nm: sub2 = 'diaphragm-pressure-gauges'
    if sub == 'pressure-gauges' and 'Differential' in nm: sub2 = 'differential-pressure-gauges'
    add(dict(id=did, name=nm, modelCode=d['code'] or None, brandSlug=DL, categorySlug=sub2, productType=sub2, shortDescription=desc,
             specifications=S(*[tuple(x) for x in d['specs']]), images=[copy_img(f'{W}/img/delta/{d["img"]}.jpg', DL, d['img'])],
             catalogueSource='Delta Process Control Instruments flyer'))

# ---------------------------------------------------------------- Hydroline + Yuken (from supplied .ts — preserved)
hy = json.load(open(f'{W}/data/hydroline_yuken.json'))
def hy_type(p):
    n, m, i = p['name'], p.get('modelCode', ''), p['id']
    if p['brandSlug'] == 'hydroline':
        if 'Filter Gauge' in n: return 'filter-indicators'
        if n.startswith('Filter'): return 'hydraulic-filters'
        if 'Strainer' in n: return 'suction-strainers'
        if 'Level Gauge' in n or 'Sight Glass' in n: return 'level-gauges'
        if 'Breather' in n: return 'breathers'
        if 'Diffuser' in n: return 'diffusers'
        if 'Check Valve' in n: return 'inline-check-valves' if 'CUT' in m else 'pilot-check-valves'
        return 'tank-hardware'
    if 'Vane Pump' in n: return 'variable-vane-pumps' if 'Variable' in n else 'vane-pumps'
    if 'Gear Pump' in n: return 'gear-pumps'
    if 'Modular' in n: return 'modular-valves'
    if 'Load Holding' in n: return 'counterbalance-valves'
    if 'Pressure Switch' in n: return 'pressure-switches'
    if 'Relief' in n or 'H & HC' in n: return 'relief-valves'
    if 'Reducing' in n: return 'pressure-reducing-valves'
    if 'Check' in n and ('Throttle' in n or 'Flow Control' in n or 'Deceleration' in n): return 'throttle-check-valves' if 'Throttle' in n else ('deceleration-valves' if 'Deceleration' in n else 'flow-control-valves')
    if 'Pilot Controlled Check' in n: return 'pilot-check-valves'
    if 'Cartridge Check' in n: return 'cartridge-check-valves'
    if 'In-Line Check' in n: return 'inline-check-valves'
    if 'Power Sav' in n: return 'solenoid-accessories'
    if 'Solenoid' in n: return 'solenoid-directional-valves'
    if 'Pilot Operated Directional' in n: return 'pilot-directional-valves'
    if 'Manually' in n or 'Cam' in n: return 'manual-directional-valves'
    raise SystemExit('unmapped ' + i)
for p in hy:
    p = dict(p)
    p['productType'] = hy_type(p)  # categorySlug from the supplied file is preserved untouched
    if p['brandSlug'] == 'yuken' and p.get('catalogueSource', '').endswith('— no loc'):
        p['catalogueSource'] = 'Yuken India official product listing (yukenindia.com)'
    if p.get('modelCode') == '': p['modelCode'] = None
    add(p)

# ---------------------------------------------------------------- Lifting & rigging (supplier brand deliberately not stored)
_ns={}; exec(open(f'{W}/data/lifting_notes.py').read(), _ns); L=_ns['L']
lift_type = {'hoists': None, 'slings': None, 'chain-fittings': None, 'material-handling': None}
def lift_sub(p):
    k, c = p['key'], p['cat']
    if c == 'hoists':
        if 'chain-pulley-block' in k or k=='ratchet-lever-hoist': return 'manual-hoists'
        if 'trolley' in k: return 'beam-trolleys'
        if 'electric' in k: return 'electric-hoists'
        if 'pulley' in k: return 'pulley-blocks'
        if k in ('cable-puller', 'pulling-lifting-machine', 'spring-balancer'): return 'pullers-balancers'
        return 'manual-hoists'
    if c == 'slings': return 'slings-lashing'
    if c == 'chain-fittings':
        if 'shackle' in k: return 'shackles'
        if 'hook' in k: return 'lifting-hooks'
        if 'chain' in k and 'connecting' not in k and 'shortener' not in k: return 'lifting-chain'
        return 'rigging-hardware'
    if 'pallet' in k or 'stacker' in k or 'table' in k: return 'pallet-trucks-stackers'
    if 'clamp' in k or 'magnet' in k: return 'lifting-clamps-magnets'
    if 'container' in k: return 'containers-storage'
    return 'handling-equipment'
for p in L:
    sub = lift_sub(p)
    q = dict(id=f'lifting-{p["key"]}', name=p['name'], modelCode=p.get('model') or None, categorySlug=sub, productType=sub,
             shortDescription=p['desc'], features=p.get('features') or None, specifications=S(*[tuple(x) for x in p['specs']]),
             images=[copy_img(f'{W}/img/lifting/{p["key"]}.jpg', 'lifting', p['key'])], catalogueSource='Lifting & rigging equipment brochure')
    if p.get('table'): q['variants'] = [p['table']]
    add(q)

# ---------------------------------------------------------------- Taparia
TP = 'taparia'
raw = json.load(open(f'{W}/taparia_raw.json'))
timgs = json.load(open(f'{W}/taparia_imgs.json'))
SMALL = {'and', 'with', 'for', 'of', 'in', 'to', 'the', 'or'}
def tcase(s):
    s = re.sub(r'\s+', ' ', s).strip(' -:.')
    out = []
    for i, w in enumerate(s.split(' ')):
        lw = w.lower()
        if re.match(r'^(vde|pvc|hss|sds|tct|crv|c\.r\.v\.|ss|ms|be-cu|al-br|uk-3|ww)$', lw.strip('()')) : out.append(w.upper()); continue
        if re.search(r'\d', w): out.append(w.replace('MM', 'mm').replace('Mm', 'mm')); continue
        out.append(lw if (i and lw in SMALL) else lw.capitalize() if not lw.startswith('(') else '(' + lw[1:].capitalize())
    r = ' '.join(out).replace(' - ', ' — ')
    r = re.sub(r'\((Mm|MM)\)', '(mm)', r).replace(' : Hanger Pkg', ' — Hanger Pack').replace(' : Blister Pkg', ' — Blister Pack')
    return r

def tap_sub(key):
    n = int(key.split('.')[0]); letter = key.split('.')[1]
    if n == 54: return 'non-sparking-tools'
    if n == 1: return 'adjustable-wrenches'
    if n == 2 or n == 4 or n == 55: return 'pliers' if n != 4 else 'crimping-tools'
    if n == 3: return 'testers' if letter in ('S', 'T', 'U') else ('screwdriver-sets' if letter in ('P', 'Q', 'R', 'V') else 'screwdrivers')
    if n == 6: return 'screwdriver-bits'
    if n == 5: return 'electrical-consumables'
    if n == 7: return 'socket-sets' if re.search('SET', raw_by[key]['title']) else ('socket-accessories' if 'ACCESSOR' in raw_by[key]['title'] else 'sockets')
    if n == 8: return 'torque-wrenches'
    if n == 9 or n == 36: return 'pipe-wrenches'
    if n == 10: return 'hammers'
    if n in (11, 12, 13, 43): return 'clamps-vices'
    if n in (14, 15, 16, 17, 18, 19): return 'spanners'
    if n == 20: return 'chisels'
    if n == 21: return 'punches'
    if n in (22, 28, 37, 41, 42, 51): return 'workshop-tools'
    if n in (23, 24): return 'cutters'
    if n == 25: return 'axes'
    if n == 26: return 'cutters' if letter in ('A',) else 'knives-blades'
    if n == 27: return 'hacksaws'
    if n == 29: return 'allen-keys'
    if n in (30, 31, 32, 33, 34, 35): return 'tool-storage-kits'
    if n in (38, 39): return 'jacks'
    if n == 40: return 'carpentry-tools'
    if n in (44, 45, 46, 47, 48): return 'cutting-blades-wheels'
    if n == 49: return 'abrasives'
    if n in (50, 52): return 'drills-hole-saws'
    if n == 53: return 'files'
    raise SystemExit(key)

raw_by = {s['key']: s for s in raw}
# manual fixes for sections whose tables did not parse cleanly (values transcribed from the price list, prices excluded)
FIX_TABLE = {
    '2.E2': [dict(columns=['Product No.', 'Description', 'Capacity (mm)', 'Length (mm)'], rows=[['1441-5S', 'Internal St. Nose', '8-25', '130'], ['1442-5S', 'Bent Nose', '8-25', '120'], ['1443-5S', 'External St. Nose', '8-25', '125'], ['1444-5S', 'Bent Nose', '8-25', '120'], ['1441-9S', 'Internal St. Nose', '40-100', '230'], ['1442-9S', 'Bent Nose', '40-100', '220'], ['1443-9S', 'External St. Nose', '40-100', '230'], ['1444-9S', 'Bent Nose', '40-100', '220'], ['1441-13', 'Internal St. Nose', '85-165', '320'], ['1442-13', 'Bent Nose', '85-165', '300'], ['1443-13', 'External St. Nose', '85-165', '320'], ['1444-13', 'Bent Nose', '85-165', '300']])],
    '55.': [dict(columns=['Product No.', 'Description', 'Length (mm)'], rows=[['MCP 10', 'Fencing Plier, with joint cutter', '250'], ['MCP 12', 'Fencing Plier, with joint cutter', '300']])],
    '34.A': [dict(columns=['Product No.', 'H (mm)', 'W (mm)', 'L (mm)'], rows=[['CTB 1803', '155', '200', '450'], ['CTB 1805', '205', '200', '450'], ['CTB 2103', '155', '200', '530'], ['CTB 2105', '205', '200', '530']])],
    '34.B': [dict(columns=['Product No.', 'H (mm)', 'W (mm)', 'L (mm)'], rows=[['PTB 13', '150', '190', '335'], ['PTB 16', '195', '240', '435'], ['PTB 19', '250', '260', '495'], ['PTB 22', '290', '310', '585']])],
    '35.A': [dict(columns=['Product No.', 'Drawers', 'H (mm)', 'W (mm)', 'L (mm)'], rows=[['TTB5', '5', '865', '455', '770'], ['TTB7', '7', '1025', '455', '770']])],
    '35.B': [dict(columns=['Product No.', 'Description'], rows=[['TTBW', 'Tools trolley wheel set'], ['TTBH', 'Tools trolley handle']])],
    '36.': [dict(columns=['Product No.', 'Length (mm)'], rows=[['SFW 12', '300']])],
    '33.B': [dict(columns=['Product No.', 'Contents'], rows=[['1022', '903I Screw Driver 2-in-1; 831 Screw Driver Set; 932 Screw Driver; 810 Screw Driver 2-in-1; WS06 Wire Stripping Plier; 1621-8 Combination Plier; 1225 Water Pump Plier; 200BP Ball Pein Hammer with Handle; 1171 Adjustable Spanner']])],
    '54.AG': [dict(columns=['Product No.', 'Contents (size: mm)'], rows=[['101 K (15 pcs)', 'Sockets: 21, 24, 27, 30, 32, 34, 36, 38, 41, 46, 50. Accessories: Ratchet Wrench 320, Sliding T-Handle 3/4 400, Driver Extension 200, Socket Set Box']])],
    '50.A': [],
    '53.P': [dict(columns=['Slim Taper', 'Regular Taper', 'Heavy Taper'], rows=[['ST 1002', 'RT 1002', 'HT 1002'], ['ST 1252', 'RT 1252', 'HT 1252'], ['ST 1502', 'RT 1502', 'HT 1502'], ['—', '—', 'HT 2002']])],
}
SKIP = {'3.'}   # group heading only ("Screw Drivers" — its sub-sections 3.A–3.V are the products)
RENAME = {'6.': 'Phillips Head Screw Driver Bits', '27.': 'Hacksaw Blades — Carbon Steel All Hard', '40.': 'Jack Plane', '44.': 'Diamond Cutting Blade — Segmented Cut',
          '44.B': 'Diamond Cutting Blade — Continuous Cut', '44.C': 'Diamond Cutting Blade — Turbo Cut', '45.': 'Tile Cutter Blade — Continuous Cut', '45.B': 'Tile Cutter Blade — Segmented Cut',
          '45.C': 'Tile Cutter Blade — Turbo Cut', '45.D': 'Tile Cutter Blade — Turbo Cut (Gold Series)', '53.': 'Steel Files — Machinist\'s Flat Files & Flat Wood Rasp Files',
          '27.E': 'Bi-Metal Hacksaw Blades', '27.D': 'Hacksaw Blades — Carbon Steel (Double Side Cutting)', '46.A': 'Granite Cutting Blade — Segmented Cut', '2.H': 'Mini Pliers (Two Colour Dip Coated Sleeve)',
          '38.B': 'Spare Kit for Hydraulic Bottle Jack', '38.D': 'Spare Kit for Hydraulic Trolley Jack', '37.E': 'Spares for Bucket Grease Pump', '26.F': 'Spare Blade for Utility Knife (UK-3)',
          '53.G': 'Knife Files', '7.I': 'Socket Accessories — 9.5mm (3/8) Square Drive', '7.J': '3/8 Dr. 20 Pcs. Socket Set in Blow Moulding Box', '7.K': 'Socket Sets — 9.5mm (3/8) Square Drive',
          '7.D': '1/4 Dr. Socket Set in Blow Moulding Box (23 Pcs.)', '7.G': '1/4 Dr. Socket Set in Blow Moulding Box (46 Pcs.)', '3.H': 'Hexagonal Screw Driver with Insulation & Opaque Handle (Two in One)',
          '7.Q': 'Spark Plug Sockets — 12.7mm (1/2) Square Drive', '9.E': 'Spares for Chain Pipe Wrenches (Chain with Link)', '54.J': 'Double Ended Open Jaw Spanner Set', '54.K': 'Double Ended Open Jaw Spanners (Inch)',
          '54.AD': '12.7mm (1/2) Square Drive Socket Set', '54.AC': '12.7mm (1/2) Square Drive Socket Set', '54.AG': '19mm (3/4) Square Drive Socket Set (15 Pcs.)', '54.AF': '19mm (3/4) Square Drive Socket Set',
          '54.AH': 'Socket Accessories — Square Drive Ratchet Handle', '8.B': 'Torque Wrenches — Ratchet Type (Professional Range)', '7.S': 'Hex. Bit Socket Set — 12.7mm (1/2) Square Drive (8 Pcs.)',
          '7.Y': 'E-Sockets Set — 12.7mm (1/2) Square Drive (9 Pcs.)', '7.W': 'Torx Bit Socket Set — 12.7mm (1/2) Square Drive (9 Pcs.)', '7.Z': 'Torx Bit Sockets & E-Sockets Set', '7.N': '1/2 Dr. Deep Socket Set (11 Pcs.)',
          '7.T': 'Impact Sockets — 12.7mm (1/2) Square Drive (Hexagonal)', '7.U': 'Deep Impact Sockets — 12.7mm (1/2) Square Drive', '7.V': 'Torx Bit Sockets — 12.7mm (1/2) Square Drive', '7.AB': 'Socket Sets — 12.7mm (1/2) Square Drive (Bi-Hexagonal & Hexagonal)',
          '7.AC': 'Socket Sets — 12.7mm (1/2) Square Drive in Blow Moulding Box', '7.AF': 'Socket Set — 19mm (3/4) Square Drive (Bi-Hexagonal & Hexagonal)', '7.AL': 'Bi-Hexagonal Socket Set — 25.4mm (1) Square Drive',
          '7.AH': 'Impact Sockets — 19mm (3/4) Square Drive', '7.AK': 'Impact Sockets — 25.4mm (1) Square Drive', '19.D': 'Slugging Ring Offset Spanner with Round Handle', '19.C': 'Slugging Ring Offset Spanner with Box Handle',
          '15.A': 'Double Ended Open Jaw Spanners — General Purpose (Chrome Plated)', '15.B': 'Double Ended Open Jaw Spanners — General Purpose (Ribbed)', '15.D': 'Double Ended Open Jaw Spanner Sets (Hanger Packing)',
          '16.D': 'Ring Spanner Sets (Inch Series)', '18.C': 'Combination Spanners (Mirror Finish Chrome Plated)', '47.': 'TCT Wood Cutting Blade (Silver Series)', '37.A': 'Hand Oil Pump',
          '42.A': 'Spirit Level — 1.0 mm Accuracy without Magnet', '42.B': 'Spirit Level — 1.0 mm Accuracy with Magnet', '42.C': 'Spirit Level — 0.50 mm Accuracy without Magnet', '42.D': 'Spirit Level — 0.50 mm Accuracy with Magnet',
          '2.E1': 'Circlip Pliers (C.A. Sleeve)', '2.E2': 'Circlip Pliers (PVC Deep Coated Sleeve)', '54.L': 'Ring Spanners (mm)', '54.N': 'Ring Spanners (Inch)', '52.H': 'Plus Hammer Drill Bits (Cross Tip) — Long Series',
          '29.F': 'Allen Keys — Black Finish (mm)', '29.G': 'Allen Keys — Black Finish (Inch)', '29.B': 'Allen Keys — Brown Finish (Inch)', '29.D': 'Allen Key Sets — Brown Finish (Inch)', '29.J': 'Allen Keys Long Ball Point (Inch)',
          '29.L': 'Allen Key Long Ball Point Set (Inch)', '29.N': 'Allen Keys Extra Long Ball Point (Inch)', '29.H': 'Allen Key Sets — Black Finish (mm)', '29.I': 'Allen Key Sets — Black Finish (Inch)',
          '29.T': 'T-Handle Hex Keys (mm)', '29.V': 'T-Handle Hex Keys (Inch)', '29.O': 'Allen Key Extra Long Ball Point Set (mm)', '29.P': 'Allen Key Extra Long Ball Point Set (Inch)',
          '48.A': 'Cut Off Wheel (Gold Series)', '48.B': 'Cut Off Wheel (Silver Series)', '48.C': 'Cut Off Wheel (Gold Series) — Large', '48.D': 'Cut Off Wheel (Silver Series) — Large', '48.E': 'Cut Off Wheel',
          '7.E': '1/4 Square Drive Deep Sockets', '7.F': '1/4 Square Drive Bit Sockets', '7.A': 'Sockets — 6.3mm (1/4) Square Drive', '7.H': 'Sockets — 9.5mm (3/8) Square Drive', '7.L': 'Sockets — 12.7mm (1/2) Square Drive',
          '7.M': 'Deep Sockets — 12.7mm (1/2) Square Drive', '7.O': 'Extra Long Socket — 12.7mm (1/2) Square Drive', '7.X': 'E-Sockets — 12.7mm (1/2) Square Drive', '7.AG': 'Sockets — 19mm (3/4) Square Drive',
          '7.AI': 'Sockets — 25.4mm (1) Square Drive (Bi-Hexagonal)', '7.R': 'Hex. Bit Sockets — 12.7mm (1/2) Square Drive', '7.AA': 'Socket Accessories — 12.7mm (1/2) Square Drive',
          '7.AE': 'Socket Accessories — 19mm (3/4) Square Drive', '7.AJ': 'Socket Accessories — 25.4mm (1) Square Drive', '7.B': 'Socket Accessories — 6.3mm (1/4) Square Drive', '7.C': 'Socket Sets — 6.3mm (1/4) Square Drive'}
NOTE_OK = re.compile(r'Confirming|Conforming|Insulated|Sleeve|Coated|Plated|Phosphated|Finish|Handle|Series|Accuracy|Magnet|Compartments|Drive|Hexagonal|Silicon|Concrete|Steel|Body', re.I)
NOTE_BAD = re.compile(r'HSN|Design No|Price|₹|Pkg|^\d+$|^Product|^No\.?$|^\(?[A-Z]\)', re.I)
for s in raw:
    k = s['key']
    if k in SKIP: continue
    tables = FIX_TABLE.get(k, s['tables'])
    title = RENAME.get(k) or tcase(s['title'])
    notes = []
    for n in s['notes']:
        n = re.sub(r'\s+', ' ', n).strip()
        if NOTE_OK.search(n) and not NOTE_BAD.search(n) and n not in notes and len(n) < 120:
            notes.append(n.replace('Generally Confirming', 'Generally conforming'))
    sub = tap_sub(k)
    codes = []
    variants = []
    for t in tables:
        cols = t['columns']; rows = [r for r in t['rows'] if any(c and c not in ('-', '—') for c in r)]
        if not rows: continue
        if re.search(r'₹|Price|HSN|Confirming', json.dumps([cols, rows], ensure_ascii=False)): continue  # mis-detected / price-bearing table
        if not re.match(r'Product', cols[0]):
            codes += [c for r in rows for c in r if re.match(r'^[A-Z]{1,5}\s?-?\s?\d{2,5}[A-Z]?$', c or '')]
        # drop rows that are clearly sub-headers
        variants.append(dict(columns=[tcase(c) if c.isupper() and len(c) > 3 else c for c in cols], rows=rows))
        if re.match(r'Product', cols[0]):
            codes += [r[0] for r in rows if r[0] and re.search(r'\d', r[0])]
    model = None
    if codes:
        model = codes[0] if len(codes) == 1 else (f'{codes[0]}, {codes[1]}' if len(codes) == 2 else f'{codes[0]} – {codes[-1]}')
    specs = [{'label': 'Standard' if re.search('conforming', n, re.I) else 'Note', 'value': n} for n in notes]
    nonspark = k.startswith('54.')
    if nonspark:
        title = title if 'Non-Sparking' in title else title + ' (Non-Sparking)'
        specs.append({'label': 'Material', 'value': 'Beryllium copper (Be-Cu) or aluminium bronze (Al-Br)'})
    desc = (f'{title} — non-sparking safety tool for hazardous and explosive environments, available in beryllium copper and aluminium bronze.' if nonspark else
            f'{title}' + (f' — {len(sum([v["rows"] for v in variants], []))} sizes / variants available.' if variants and len(sum([v["rows"] for v in variants], [])) > 1 else '.'))
    imgs = [copy_img(f'{W}/img/taparia/{f}', TP, f[:-4]) for f in timgs.get(k, [])]
    pid = f'taparia-{k.replace(".", "-").rstrip("-").lower()}-{slugify(title)[:48].strip("-")}'
    add(dict(id=pid, name=title, modelCode=model, brandSlug=TP, categorySlug=sub, productType=sub, shortDescription=desc,
             specifications=specs, variants=variants or None, images=imgs, catalogueSource='Taparia hand tools list (April 2026)'))

# ---------------------------------------------------------------- Supplied directly by Western Hardware Mart (no manufacturer brand)
add(dict(id='marine-container-40ft', slug='marine-container-40ft', name='Marine Container', categorySlug='containers-storage', productType='containers-storage',
         shortDescription='Refurbished 40 ft dry marine shipping container, mild steel construction — supplied directly by Western Hardware Mart.',
         specifications=S(('Material', 'Mild Steel'), ('Container Size', '40 ft'), ('Container Type', 'Dry Container'), ('Condition', 'Refurbished')),
         images=['/assets/products/marine-container.png'], catalogueSource='Supplied directly by Western Hardware Mart'))

# ---------------------------------------------------------------- de-duplicate names inside a brand (append model range)
from collections import Counter
cnt = Counter((p.get('brandSlug'), p['name']) for p in products)
for p in products:
    if cnt[(p.get('brandSlug'), p['name'])] > 1 and p.get('modelCode'):
        p['name'] = f"{p['name']} ({p['modelCode']})"

# clean empties
for p in products:
    for k in list(p):
        if p[k] in (None, [], ''): del p[k]
    p.setdefault('specifications', [])

json.dump(products, open(f'{W}/data/products_backup.json', 'w'), indent=1, ensure_ascii=False)
print('TOTAL', len(products))
print(Counter(p.get('brandSlug', '(none)') for p in products))
print(Counter(p['productType'] for p in products))
