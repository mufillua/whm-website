# Transcribed from the lifting/rigging brochure (brand name deliberately omitted).
# each: key, name, page(pdf), side('L'/'R'), cat, desc, features, specs (list of [label,value]), table {columns, rows}
L=[]
def add(**k): L.append(k)
add(key='chain-pulley-block-heavy-duty-t',name='Heavy Duty Chain Pulley Block — T Series',model='T Series',page=4,side='L',cat='hoists',
 desc='Heavy duty manual chain pulley block with Grade 80 alloy steel load chain, for general industrial lifting.',
 features=['Grade 80 alloy steel load chain for strength and wear resistance','Unique chain guide mechanism','Very low operational effort','Rugged steel body, lightweight and portable','Double cover protection for brake chamber','Surface hardened gears and double ratchet pawl','Heat treated alloy steel triple spur gear and pinion shaft','Drop forged, heat treated alloy hooks with overload markings','Safety factor 4 × SWL; proof load tested to 1.5 × rated capacity','Endurance tested to over 1500 continuous cycles'],
 specs=[['Capacity range','0.5 – 50 tonnes'],['Load chain diameter','6 – 10 mm'],['Standard','Conforming to IS 3832'],['Overload limit','Available as an option']],
 table=dict(columns=['Capacity (t)','Item Code','Load Chain Dia (mm)','Load Chain Falls','Net Weight (kg)'],rows=[['0.5','CBST0053','6','1','4.76'],['1','CBST0103','6','1','6.8'],['2','CBST0203','8','1','12.85'],['3','CBST0303','8','2','14.8'],['5','CBST0503','10','2','25.3'],['7.5','CBST7503','10','3','42'],['10','CBST1003','10','4','48.5'],['15','CBST1503','10','6','89'],['20','CBST2003','10','8','117'],['30','CBST3003','10','12','150'],['50','CBST5003','10','22','1085']]))
add(key='chain-pulley-block-revolve',name='Chain Pulley Block — Revolve Series',model='Revolve Series',page=5,side='L',cat='hoists',
 desc='Hand chain hoist with a 360° rotating hand chain guide that lets the operator work from various angles and stay out of the danger zone.',
 features=['360° rotating hand chain guide','Brake system for safe, low-maintenance, quiet operation','Sealed roller bearings','Hardened load chain for strength, flexibility and long wear life','Enclosed housing allows outdoor use; load brake needs no lubrication','Wheel cover with guide slots guards against jamming and slipping of chain','Forged swivel hooks and latches','Two-stage gear reduction with hardened gears and pinion'],
 specs=[['Capacity range','1 – 10 tonnes']],
 table=dict(columns=['Capacity (t)','Item Code','Test Load (t)','Net Weight (kg)'],rows=[['1','CBRL0103','1.25','7.2'],['2','CBRL0203','2.5','11'],['3','CBRL0303','3.75','14.5'],['5','CBRL0503','6.25','23.5'],['10','CBRL1003','12.5','47']]))
add(key='chain-pulley-block-b',name='Chain Pulley Block — B Series',model='B Series',page=5,side='R',cat='hoists',
 desc='Compact, lightweight manual chain pulley block with Grade 80 alloy steel load chain for heavy duty industrial applications.',
 features=['Surface hardened gears','Anti-corrosive powder coated finish','Double ratchet pawl for enhanced safety','Heavy duty load chain wheel and strong suspension plate','Grade 80 alloy steel load chain','Smooth passage of load chain and smooth hand chain operation','Compact in size and light in weight','Safety factor 4 × SWL','1 year warranty against manufacturing defects'],
 specs=[['Capacity range','1 – 20 tonnes'],['Chain diameter','6 – 10 mm'],['Certification','CE certified (as per manufacturer brochure)']],
 table=dict(columns=['Capacity (t)','Item Code','Test Load (t)','Chain Dia (mm)','Load Chain Falls','Weight (kg)'],rows=[['1','CBRL0103','1.25','6','1','6.14'],['2','CBRL0203','2.5','8','1','10.7'],['3','CBRL0303','3.75','8','2','13.1'],['5','CBRL0503','6.25','10','2','23.9'],['10','CBRL1003','12.5','10','4','47.24'],['20','CBRL2003','25','10','8','89']]))
add(key='ratchet-lever-hoist',name='Ratchet Lever Hoist',model='RLSL Series',page=6,side='L',cat='hoists',
 desc='Compact ratchet lever hoist for lifting, lowering, fastening and pulling, with Grade 80 alloy steel chain.',
 features=['Grade 80 alloy steel chain','Safety latch on hooks','Lightweight and compact','Asbestos-free brake','Low operation effort','Anti-corrosive powder coated finish','Use it to lift, lower, fasten and pull'],
 specs=[['Capacity range','0.25 – 9 tons'],['Standard lift','1.5 m'],['Load chain diameter','5 – 10 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Load Chain Dia (mm)','Chain Falls','Net Weight (kg)'],rows=[['0.25','RLSL0215','5','1','2.7'],['0.5','RLSL0515','5','1','2.81'],['0.8','RLSL0715','6','1','5.96'],['1.6','RLSL1515','8','1','9.14'],['3.2','RLSL3015','10','1','15.92'],['6.3','RLSL6015','10','2','22.58'],['9','RLSL9015','10','3','34.3']]))
add(key='gear-trolley',name='Geared Trolley',model='GTSL Series',page=6,side='R',cat='hoists',
 desc='Hand-geared beam trolley for moving hoists along I-beams, adjustable to various rail widths.',
 features=['Anti-corrosive powder coated finish','High quality bearings','Adjustable to various rail widths'],
 specs=[['Capacity range','1 – 20 ton'],['I-beam width range','90 – 210 mm (by model)']],
 table=dict(columns=['Capacity','Item Code','I-Beam Width (mm)','Net Weight (kg)'],rows=[['1 Ton','GTSL0103','90–120','10.3'],['2 Ton','GTSL0203','100–125','14.5'],['3 Ton','GTSL0303','110–160','21.3'],['5 Ton','GTSL0503','140–160','38.8'],['10 Ton','GTSL1003','140–210','63.5'],['20 Ton','GTSL2003','122–210','–']]))
add(key='pulling-lifting-machine',name='Pulling & Lifting Machine — Heavy Duty',model='PMIP Series',page=7,side='L',cat='hoists',
 desc='Wire rope pulling and lifting machine (hand-operated wire rope hoist) with a cast aluminium alloy body and galvanised steel wire rope on a reel.',
 features=['Adjustable handle for easy operation','Backward and forward levers in tandem for a slim design','Built-in shearing pin prevents overload (approx. 50% overload); pins replaceable without removing the load','Two spare shear pins in the carrying handle','Anchor bolt for versatile connection with hooks, sling ropes and chains','Stamped serial number','High strength cast aluminium alloy body','Galvanised steel wire rope on a reel; each rope tested to 150% of rated capacity with test certificate'],
 specs=[['Lifting capacity','0.8 – 5.4 t'],['Pulling capacity','1.2 – 8 t'],['Rope diameter','8.3 – 20 mm']],
 table=dict(columns=['Rated Capacity (t)','Item Code','Pulling Capacity (t)','Lifting Capacity (t)','Rope Dia (mm)','Weight (kg)'],rows=[['0.8','PMIP0710','1.2','0.8','8.3','9.3'],['1.6','PMIP2310','2.4','1.6','11','14.87'],['3.2','PMIP3510','4.8','3.2','16','24.3'],['5.4','PMIP5810','8','5.4','20','59.5']]))
add(key='electric-chain-hoist-heavy-duty',name='Heavy Duty Electric Chain Hoist',model='',page=7,side='R',cat='hoists',
 desc='Heavy duty electric chain hoist with aluminium alloy shell, G80 load chain and IP55 protection.',
 features=['Light aluminium alloy shell with cooling fan for heat dissipation','Integral enclosed structure suitable for chemical plants and electroplating units','Side magnetic braking device for instant braking on power cut','24V/36V transformer device against electric leakage','Electromagnetic contactor for high-frequency use','Inverse phase sequence protecting device','G80 heat-treated alloy steel chain','Waterproof push button pendant','Upper and lower limit switches','Drop forged hook with 360° rotation and safety latch','IP55 protection'],
 specs=[['Protection','IP55'],['Load chain','G80 alloy steel'],['Control voltage','24V / 36V transformer']],table=None)
add(key='electric-chain-hoist-single-speed',name='Electric Chain Hoist — Single Speed',model='MHSL Series',page=8,side='L',cat='hoists',
 desc='Single speed electric chain hoist, 0.5 to 10 tonnes, with 3-phase power supply and low-voltage pendant control.',
 features=['Insulation grade F','Power supply 3P 220V–690V','Control voltage 24V / 36V / 48V','Motor rotation speed 1440 r/min'],
 specs=[['Capacity range','0.5 – 10 tonnes'],['Power supply','3P 220V – 690V'],['Control voltage','24V / 36V / 48V'],['Insulation grade','F']],
 table=dict(columns=['Capacity (t)','Item Code','Lifting Speed (m/min)','Motor Power (kW)','No. of Chain','Load Chain','Net Weight (kg)'],rows=[['0.5','MHSL0050S','7.2','0.8','1','ϕ6.3','47'],['1','MHSL010S','6.6','1.5','1','ϕ7.1','61'],['2','MHSL020S','3.3','1.5','2','ϕ7.1','73'],['3','MHSL030S','5.4','3.0','1','ϕ11.2','122'],['5','MHSL050S','2.7','3.0','2','ϕ11.2','151'],['7.5','MHSL750S','1.8','3.0','3','ϕ11.2','176'],['10','MHSL100S','2.7','3.0 × 2','4','ϕ11.2','300']]))
add(key='electric-chain-hoist-dual-speed',name='Electric Chain Hoist — Dual Speed',model='DSEH Series',page=8,side='R',cat='hoists',
 desc='Dual speed electric chain hoist with inverter (variable speed), 0.3 to 5 ton.',
 features=['Lifting motor with inverter — dual speed / variable speed','Insulation class F','Power input 220V–690V','Control voltage 24V / 36V / 48V'],
 specs=[['Capacity range','0.3 – 5 ton'],['Power input','220V – 690V'],['Control voltage','24V / 36V / 48V'],['Insulation','F']],
 table=dict(columns=['Capacity (t)','Item Code','Lifting Speed (m/min)','Travelling Motor (kW)','Chain Size × Falls'],rows=[['0.3','DSEH0030S','9.1/3.1, 0.91–9.1','0.56','4.0 × 1'],['0.5','DSEH0050S','8.3/2.8, 0.83–8.3','0.9','6.3 × 1'],['1','DSEH010S','6.3/2.1, 0.63–6.3','1.5','7.1 × 1'],['2','DSEH020S','6.9/2.3, 0.69–6.9','3','10.0 × 1'],['3','DSEH030S','6.6/2.2, 0.66–6.6','3','11.2 × 1'],['5','DSEH050S','3.3/1.1, 0.33–3.3','3','11.2 × 2']]))
add(key='electric-trolley',name='Electric Trolley',model='ETSL Series',page=9,side='L',cat='hoists',
 desc='Motorised electric trolley for traversing hoists along I-beams, 0.5 to 10 ton.',
 features=['Travel speed 11/21 m/min at 50 Hz','Motor power 0.4 – 0.75 kW','Suits I-beam plate thickness 10 – 20 mm'],
 specs=[['Capacity range','0.5 – 10 ton'],['Travel speed (50 Hz)','11 / 21 m/min'],['Motor','0.4 – 0.75 kW']],
 table=dict(columns=['Capacity (t)','Item Code','Motor (kW)','Plate Thickness','I-Beam','Min. Radius of Turn (m)','Weight (kg)'],rows=[['0.5','ETSL0055','0.4','10','170','0.8','46.5'],['1','ETSL0105','0.4','10','170','0.8','46.5'],['2','ETSL0205','0.4','12','200','0.8','52'],['3','ETSL0305','0.75','14','200','1','64'],['5','ETSL0505','0.75','16','240','1.8','88'],['7.5','ETSL7505','0.75','16','240','1.8','102'],['10','ETSL1005','0.75','20','270','2.0','143']]))
add(key='polyester-duplex-webbing-sling',name='Polyester Duplex Webbing Sling',model='',page=9,side='R',cat='slings',
 desc='Polyester duplex webbing sling with colour-coded working load labels, available in single, double or four ply.',
 features=['Single ply, double ply or four ply','Specification can be adjusted to customer needs','Wide loading surface spreads the load','No damage to delicate objects','Various loading methods','High strength-to-weight ratio','Anti-abrasion and anti-cutting protection sleeve can be attached','Working load differentiated by colour as per international standard','Light and soft — usable in narrow spaces','Non-conductive','In compliance with EN 1492-1:2000, ASME B30.9 and IS 15041'],
 specs=[['Straight (upright) lift WLL','1,000 – 50,000 kg (by colour/size)'],['Standards','EN 1492-1:2000, ASME B30.9, IS 15041']],
 table=dict(columns=['Colour','Single Upright WLL (kg)','Single Chocked WLL (kg)','Approx. Width (mm)'],rows=[['Violet','1000','800','25–30'],['Green','2000','1600','50'],['Yellow','3000','2400','75'],['Grey','4000','3200','100'],['Red','5000','4000','125'],['Brown','6000','4800','150'],['Blue','8000','6400','200'],['Orange','10000','8000','250'],['Orange','12000','9600','300'],['Blue','16000','12800','200'],['Orange','20000','16000','250'],['Orange','24000','20000','300'],['Orange','30000','24000','250–300'],['Orange','40000','32000','250'],['Orange','50000','40000','–']]))
add(key='polyester-round-sling',name='Polyester Round Sling',model='',page=10,side='L',cat='slings',
 desc='Polyester endless round sling, colour-coded by working load limit, from 1,000 kg to 100,000 kg straight lift.',
 features=['Colour-coded working load identification','Suitable for upright, chocked and basket lifting methods','Two-leg lifting configurations'],
 specs=[['Straight (upright) lift WLL','1,000 – 100,000 kg (by colour/size)']],
 table=dict(columns=['Colour','Single Upright WLL (kg)','Single Chocked WLL (kg)','Basket 0°–7° (kg)'],rows=[['Violet','1000','800','2000'],['Green','2000','1600','4000'],['Yellow','3000','2400','6000'],['Grey','4000','3200','8000'],['Red','5000','4000','10000'],['Brown','6000','4800','12000'],['Blue','8000','6400','16000'],['Orange','10000','8000','20000'],['Orange','12000','9600','24000'],['Blue','15000','12000','40000'],['Orange','20000','16000','60000'],['Orange','25000','20000','50000'],['Orange','30000','24000','60000'],['Orange','40000','32000','80000'],['Orange','50000','40000','100000'],['Orange','60000','48000','120000'],['Orange','80000','64000','160000'],['Orange','100000','80000','200000']]))
add(key='anti-abrasive-sleeve',name='Anti-Abrasive Sling Sleeve',model='',page=10,side='R',crop='sleeve1',cat='slings',
 desc='Woven fabric protective sleeve that extends sling life when exposed to abrasive surfaces such as concrete.',
 features=['Woven fabric construction','Protects slings on abrasive surfaces such as concrete','Padding protects slings from damage'],specs=[],table=None)
add(key='anti-cutting-sleeve',name='Anti-Cutting Sling Sleeve',model='',page=10,side='R',crop='sleeve2',cat='slings',
 desc='Cut-resistant sleeve that protects slings from sharp edges during rigging — essential when rigging loads with sharp or razor-like edges.',
 features=['Protects slings from sharp edges during rigging','Recommended for loads with sharp or razor-like edges'],specs=[],table=None)
add(key='sling-edge-protector',name='Sling Edge Protector',model='',page=10,side='R',crop='edge',cat='slings',
 desc='Edge protector for handling fabricated steel structures — sticks to the steel surface so the sling avoids direct contact with the product edge.',
 features=['Designed for steel fabricated structures','Prevents direct sling contact with sharp edges'],specs=[],table=None)
add(key='cargo-lashing-ratchet',name='Cargo Lashing Ratchet',model='',page=11,side='L',crop='ratchet',cat='slings',
 desc='Polyester ratchet lashing for securing cargo during transport, shifting and storage — lighter than chains, wire or jute rope.',
 features=['Load restraint using a ratchet tensioning device','Effective and safe control of the load being tied down','No damage to the load','Quick and efficient tie-down and release','Lower weight means lower transport cost','Polyester accommodates load irregularities','Webbing widths 25, 35, 50, 75 and 100 mm','Manufactured as per BS 5759 and EN 12195-2:2000'],
 specs=[['Webbing width','25 – 100 mm'],['Standards','BS 5759, EN 12195-2:2000']],
 table=dict(columns=['Webbing Width (mm)','Min. Break Strength — Two Parts (kg)','Min. Break Strength — Tendless (kg)','Rated Assembly Strength — Two Parts (kg)','Rated Assembly Strength — Tendless (kg)'],rows=[['25','1200','2400','600','1200'],['35','2000','4000','1000','2000'],['50','3000','6000','1500','3000'],['50','5000','10000','2500','5000'],['75','10000','20000','5000','10000'],['100','12000','24000','6000','12000']]))
add(key='g80-alloy-steel-chain',name='G80 Alloy Steel Chain',model='LCSL Series',page=11,side='R',crop='chain',cat='chain-fittings',
 desc='Grade 80 alloy steel lifting chain, 6 mm to 32 mm, with working load limits as per EN 1677.',
 features=['Grade 80 alloy steel','Working load limits as per EN 1677','Single, double, triple/quadruple leg and endless choking configurations'],
 specs=[['Chain size','6 – 32 mm'],['Capacity','1 – 31.5 ton'],['WLL reference','EN 1677']],
 table=dict(columns=['Chain Size (mm)','Item Code','Capacity (t)','Weight (kg/m)'],rows=[['6','LCSL0806','1','0.78'],['6.3','LCSL8063','1.3','0.84'],['7.1','LCSL0807','1.5','1.1'],['8','LCSL0808','2','1.38'],['10','LCSL0810','3','2.15'],['11.2','LCSL0811','3.3','2.68'],['12','LCSL0812','5','3.00'],['14','LCSL0814','6.3','4.00'],['16','LCSL0816','8','5.30'],['18','LCSL0818','10','6.95'],['20','LCSL0820','12.5','8.6'],['22','LCSL0822','15','10.3'],['26','LCSL0826','21','14.5'],['28','LCSL0828','25','17.3'],['32','LCSL0832','31.5','22.29']]))
SHK=['Working load limit permanently shown on every shackle','Meets the performance requirements of Federal Specification RR-C-271F, Type IVA, Grade 2, Class 2 (in general)','Galvanised finish','Drop forged']
def rows(codes,wll,size,wt): return [list(r) for r in zip(wll,codes,size,wt)]
add(key='screw-pin-dee-shackle',name='Screw Pin Dee Shackle',model='DSSL Series',page=12,side='L',cat='chain-fittings',
 desc='Galvanised, drop forged screw pin dee shackle, WLL 0.5 to 55 t.',features=SHK,
 specs=[['WLL range','0.5 – 55 t'],['Size range','1/4" – 2-1/2"'],['Finish','Galvanised']],
 table=dict(columns=['WLL (t)','Item Code','Size (in)','Weight (kg)'],rows=rows(['DSSL08003','DSSL08007','DSSL0801','DSSL0815','DSSL0802','DSSL0803','DSSL0805','DSSL0806','DSSL0808','DSSL0810','DSSL0812','DSSL0813','DSSL0817','DSSL0825','DSSL0835','DSSL0855'],['0.5','0.75','1','1.5','2','3.25','4.75','6.5','8.5','9.5','12','13.5','17','25','35','55'],['1/4','5/16','3/8','7/16','1/2','5/8','3/4','7/8','1','1-1/8','1-1/4','1-3/8','1-1/2','1-3/4','2','2-1/2'],['0.04','0.07','0.12','0.17','0.28','0.58','0.95','1.42','2.01','3.05','4','5.27','6.9','11.7','18.3','32.9'])))
add(key='nut-bolt-dee-shackle',name='Nut Bolt Dee Shackle',model='DNSL Series',page=12,side='R',cat='chain-fittings',
 desc='Galvanised, drop forged bolt-type (nut, bolt and cotter pin) dee shackle, WLL 1 to 55 t.',features=SHK,
 specs=[['WLL range','1 – 55 t'],['Size range','3/8" – 2-1/2"'],['Finish','Galvanised']],
 table=dict(columns=['WLL (t)','Item Code','Size (in)','Weight (kg)'],rows=rows(['DNSL0801','DNSL0802','DNSL0803','DNSL0805','DNSL0806','DNSL0808','DNSL0810','DNSL0812','DNSL0813','DNSL0817','DNSL0825','DNSL0835','DNSL0855'],['1','2','3.25','4.75','6.5','8.5','9.5','12','13.5','17','25','35','55'],['3/8','1/2','5/8','3/4','7/8','1','1-1/8','1-1/4','1-3/8','1-1/2','1-3/4','2','2-1/2'],['0.13','0.27','0.64','0.96','1.56','2.2','3.24','4.34','6.05','7.77','13.1','19.07','35.09'])))
add(key='screw-pin-bow-shackle',name='Screw Pin Bow Shackle',model='BSSL Series',page=13,side='L',cat='chain-fittings',
 desc='Galvanised, drop forged screw pin bow (anchor) shackle, WLL 1 to 55 t.',features=SHK,
 specs=[['WLL range','1 – 55 t'],['Size range','3/8" – 2-1/2"'],['Finish','Galvanised']],
 table=dict(columns=['WLL (t)','Item Code','Size (in)','Weight (kg)'],rows=rows(['BSSL0801','BSSL0802','BSSL0803','BSSL0805','BSSL0806','BSSL0808','BSSL0810','BSSL0812','BSSL0813','BSSL0817','BSSL0825','BSSL0835','BSSL0855'],['1','2','3.25','4.75','6.5','8.5','9.5','12','13.5','17','25','35','55'],['3/8','1/2','5/8','3/4','7/8','1','1-1/8','1-1/4','1-3/8','1-1/2','1-3/4','2','2-1/2'],['0.13','0.33','0.63','0.99','1.54','2.22','3.37','4.45','5.80','7.57','12.77','18.9','37.7'])))
add(key='nut-bolt-bow-shackle',name='Nut Bolt Bow Shackle',model='BNSL Series',page=13,side='R',cat='chain-fittings',
 desc='Galvanised, drop forged bolt-type bow (anchor) shackle with nut and cotter pin, WLL 1 to 150 t.',features=SHK,
 specs=[['WLL range','1 – 150 t'],['Size range','3/8" – 4"'],['Finish','Galvanised']],
 table=dict(columns=['WLL (t)','Item Code','Size (in)','Weight (kg)'],rows=rows(['BNSL0801','BNSL0802','BNSL0803','BNSL0805','BNSL0806','BNSL0808','BNSL0810','BNSL0812','BNSL0813','BNSL0817','BNSL0825','BNSL0835','BNSL0855','BNSL0885','BNSL08120','BNSL08150'],['1','2','3.25','4.75','6.5','8.5','9.5','12','13.5','17','25','35','55','85','120','150'],['3/8','1/2','5/8','3/4','7/8','1','1-1/8','1-1/4','1-3/8','1-1/2','1-3/4','2','2-1/2','3','3-1/2','4'],['0.15','0.32','0.61','1.09','1.71','2.35','3.64','4.85','6','8.3','13.70','20.66','40','63.6','104','145'])))
G100=['Forged super alloy steel','100% tested at 2.5 × working load limit','100% magnaflux crack detection','Sampling break test for each lot','Fatigue tested at 1.5 × WLL for 20,000 cycles','Pins 100% eddy-current flaw tested','Suitable for G100 chain']
add(key='g100-shortening-hook-assembly-2-leg',name='G100 Integrated Shortening Hook Assembly with Master Link — 2-Leg',model='ML0210 Series',page=14,side='L',crop='tl',cat='chain-fittings',
 desc='Grade 100 two-leg master link assembly with integrated shortening hooks, for G100 chain slings.',features=G100,
 specs=[['WLL range','2 – 14 t'],['Chain size','6 – 16 mm'],['Grade','G100']],
 table=dict(columns=['WLL (t)','Chain Size (mm)','Item Code','Weight (kg)'],rows=[['2','6','ML021002','0.94'],['3.55','8','ML021003','2.3'],['5.6','10','ML021005','4.33'],['9.5','13','ML021009','9.74'],['14','16','ML021014','12.93']]))
add(key='g100-shortening-hook-assembly-4-leg',name='G100 Integrated Shortening Hook Assembly with Master Link — 4-Leg',model='ML0410 Series',page=14,side='L',crop='bl',cat='chain-fittings',
 desc='Grade 100 four-leg master link assembly with integrated shortening hooks, for G100 chain slings.',features=G100,
 specs=[['WLL range','3 – 21.2 t'],['Chain size','6 – 16 mm'],['Grade','G100']],
 table=dict(columns=['WLL (t)','Chain Size (mm)','Item Code','Weight (kg)'],rows=[['3','6','ML041003','2.46'],['5.3','8','ML041005','5.34'],['8','10','ML041008','9.24'],['14','13','ML041014','16.1'],['21.2','16','ML041021','28.5']]))
add(key='g100-webbing-sling-hook',name='G100 Webbing Sling Hook — 100 WK',model='100 WK',page=14,side='R',crop='tr',cat='chain-fittings',
 desc='Grade 100 hook for webbing slings, forged super alloy steel, quenched and tempered, with powder plastified colour-coded finish.',
 features=['Forged super alloy steel, quenched and tempered','25% stronger than G80','Individually proof tested at 2.5 × WLL','Fatigue tested at 1.5 × WLL for 20,000 cycles','Breakage test','100% magnaflux crack detection','All load pins 100% individually inspected and tested','Powder plastified, colour-coded finish'],
 specs=[['WLL range','1 – 5 t'],['Grade','G100']],
 table=dict(columns=['WLL (t)','B.L.','Item Code','Weight (kg)'],rows=[['1','4','WSHS1001','0.73'],['2','8','WSHS1002','1.27'],['3','12','WSHS1003','2.3'],['5','20','WSHS1005','4.73']]))
add(key='g100-clevis-sling-hook-latch',name='G100 Clevis Sling Hook with Latch',model='CHSL10 Series',page=14,side='R',crop='br',cat='chain-fittings',
 desc='Grade 100 clevis sling hook with safety latch for G100 chain slings.',features=['Grade 100 alloy steel','Clevis connection','Safety latch'],
 specs=[['WLL range','1.4 – 10 t'],['Chain size','6 – 16 mm'],['Grade','G100']],
 table=dict(columns=['WLL (t)','Chain Size (mm)','Item Code','Weight (kg)'],rows=[['1.4','6','CHSL1001','0.29'],['2.5','8','CHSL1002','0.59'],['4','10','CHSL1004','1.25'],['6.7','13','CHSL1006','2.38'],['10','16','CHSL1010','3.55']]))
BOX={'chain-pulley-block-heavy-duty-t':(40,440,370,1320),'chain-pulley-block-revolve':(85,450,265,1050),'chain-pulley-block-b':(1490,140,1795,880),
'ratchet-lever-hoist':(610,160,910,935),'gear-trolley':(1365,225,1785,810),'pulling-lifting-machine':(70,160,600,480),'electric-chain-hoist-heavy-duty':(1260,300,1585,1270),
'electric-chain-hoist-single-speed':(650,205,885,870),'electric-chain-hoist-dual-speed':(1530,190,1790,720),'electric-trolley':(190,280,750,580),'polyester-duplex-webbing-sling':(1480,130,1825,610),
'polyester-round-sling':(150,195,370,590),'anti-abrasive-sleeve':(1325,600,1850,790),'anti-cutting-sleeve':(1010,850,1170,1060),'sling-edge-protector':(1565,1040,1795,1290),
'cargo-lashing-ratchet':(480,640,845,1110),'g80-alloy-steel-chain':(1700,30,1868,1300),'screw-pin-dee-shackle':(95,215,400,565),'nut-bolt-dee-shackle':(1115,160,1460,500),
'screw-pin-bow-shackle':(140,175,475,555),'nut-bolt-bow-shackle':(1030,190,1345,530),'g100-shortening-hook-assembly-2-leg':(600,140,795,450),'g100-webbing-sling-hook':(1545,140,1800,475),
'g100-shortening-hook-assembly-4-leg':(585,760,805,1030),'g100-clevis-sling-hook-latch':(1545,715,1770,1022)}
G80=['Forged super alloy steel','100% tested at 2.5 × working load limit','100% magnaflux crack detection','Ultimate break load tested','Fatigue tested at 1.5 × WLL for 20,000 cycles','Suitable for EN 818-8 Grade 80 chain','Drop forged']
def g80(key,name,model,page,side,box,desc,codes,wll,chain,wts,extra=None):
    add(key=key,name=name,model=model,page=page,side=side,cat='chain-fittings',desc=desc,features=G80+(extra or []),
        specs=[['WLL range',f'{wll[0]} – {wll[-1]} t'],['Chain size',f'{chain[0]} – {chain[-1]} mm'],['Grade','G80']],
        table=dict(columns=['Chain Size (mm)','WLL (t)','Item Code','Weight (kg)'],rows=[list(r) for r in zip(chain,wll,codes,wts)]))
    BOX[key]=box
g80('g80-eye-sling-hook','G80 Eye Sling Hook with Latch','EHSL Series',15,'L',(140,150,500,640),'Grade 80 eye sling hook with safety latch for G80 chain slings.',
 ['EHSL0801','EHSL0802','EHSL0803','EHSL0805','EHSL0808','EHSL0812','EHSL0815','EHSL0822','EHSL0831'],['1.12','2','3.15','5.3','8','12.5','15','21.2','31.5'],['6','7/8','10','12','16','18/20','22','26','32'],['0.32','0.5','1.03','1.99','3.26','6.76','9.71','13.5','21.62'])
g80('g80-clevis-sling-hook','G80 Clevis Sling Hook with Latch','CHSL08 Series',15,'R',(1100,160,1420,620),'Grade 80 clevis sling hook with safety latch for G80 chain slings.',
 ['CHSL0801','CHSL0802','CHSL0803','CHSL0805','CHSL0808','CHSL0812','CHSL0815'],['1.12','2','3.15','5.3','8','12.5','15'],['6','8','10','12','16','18/20','22'],['0.24','0.48','1.1','1.81','3.15','6.01','10.1'])
def g80b(key,name,model,page,side,box,desc,codes,wll,wts,chain=None,extra=None):
    cols=(['Chain Size (mm)'] if chain else [])+['WLL (t)','Item Code','Weight (kg)']
    rs=[([chain[i]] if chain else [])+[wll[i],codes[i],wts[i]] for i in range(len(codes))]
    sp=[['WLL range',f'{wll[0]} – {wll[-1]} t']]+([['Chain size',f'{chain[0]} – {chain[-1]} mm']] if chain else [])+[['Grade','G80']]
    add(key=key,name=name,model=model,page=page,side=side,cat='chain-fittings',desc=desc,features=G80+(extra or []),specs=sp,table=dict(columns=cols,rows=rs))
    BOX[key]=box
g80b('g80-eye-self-locking-hook','G80 Eye Self Locking Hook','SLHSL Series',16,'L',(170,155,470,680),'Grade 80 eye-type self locking hook — the hook locks automatically under load.',
 ['SLHSL081','SLHSL082','SLHSL083','SLHSL085','SLHSL088','SLHSL812','SLHSL815','SLHSL822'],['1.12','2','3.15','5.3','8','12.5','15','21.2'],['0.47','0.87','1.41','3.14','5.75','8.2','12.6','21.9'])
g80b('g80-clevis-self-locking-hook','G80 Clevis Self Locking Hook','CSHSL Series',16,'R',(1080,160,1380,680),'Grade 80 clevis-type self locking hook for G80 chain slings.',
 ['CSHSL081','CSHSL082','CSHSL083','CSHSL085','CSHSL088','CSHSL812','CSHSL815'],['1.12','2','3.15','5.3','8','12.5','15'],['0.48','0.89','1.46','3.1','5.9','7.25','10.9'],chain=['6','7/8','10','12','16','20','22'],extra=['Pins 100% eddy-current flaw tested'])
g80b('g80-swivel-self-locking-hook','G80 Swivel Self Locking Hook','SSHSL Series',17,'L',(195,165,440,710),'Grade 80 swivel self locking hook — swivel eye allows the load to rotate freely.',
 ['SSHSL081','SSHSL082','SSHSL083','SSHSL085','SSHSL088','SSHSL812'],['1','2','3','5','8','12.5'],['0.71','1.2','1.99','3.79','7.41','10.2'],chain=['6','8','10','13','16','20'])
g80b('g80-swivel-eye-hook','G80 Swivel Eye Hook with Latch','SEHSL Series',17,'R',(1060,165,1345,710),'Grade 80 swivel eye hook with safety latch.',
 ['SEHSL081','SEHSL082','SEHSL083','SEHSL085','SEHSL087','SEHSL811'],['1','2','3','4.5','7','11'],['0.43','1.05','1.3','2.3','4.9','7.29'])
g80b('g80-eye-grab-hook','G80 Eye Grab Hook','GHSL Series',18,'L',(150,165,445,630),'Grade 80 eye grab hook for shortening and grabbing G80 chain.',
 ['GHSL0801','GHSL0802','GHSL0803','GHSL0805','GHSL0808','GHSL0812','GHSL0815'],['1.12','2','3.15','5.3','8','12.5','15'],['0.17','0.28','0.65','1.45','2.16','4.21','8.2'],chain=['6','8','10','12','16','18/20','22'])
g80b('g80-clevis-shortening-grab-hook','G80 Clevis Shortening Grab Hook','GHSL Series',18,'R',(1030,170,1300,615),'Grade 80 clevis shortening grab hook for adjusting G80 chain sling leg length.',
 ['GHSL0801','GHSL0802','GHSL0803','GHSL0805','GHSL0808','GHSL0812','GHSL0815','GHSL0821'],['1.12','2','3.15','5.3','8','12.5','15','21.2'],['0.21','0.32','0.78','1.65','2.86','5.05','6.32','14.50'],chain=['6','7/8','10','13','16','20','22','26'],extra=['Pins 100% eddy-current flaw tested'])
g80b('g80-foundry-hook','G80 Foundry Hook','FHSL Series',19,'L',(105,180,440,640),'Grade 80 open-throat foundry hook.',
 ['FHSL0802','FHSL0803','FHSL0805','FHSL0808','FHSL0812'],['2','3.2','5.3','8','12.5'],['0.73','1','2.7','4.72','6.65'])
g80b('g80-master-link','G80 Master Link','MLSL Series',19,'R',(1095,155,1375,560),'Grade 80 master link for 1- and 2-leg G80 chain slings, as per EN 1677-4.',
 ['MLSL0801','MLSL0802','MLSL0803','MLSL0805','MLSL0808','MLSL0811','MLSL0817','MLSL0821','MLSL0831','MLSL0845'],['1.6','2.12','3.15','5.3','8','11.2','17','21.2','31.5','45'],['0.41','0.54','0.82','1.48','2.12','4','8.9','13','16.45','22.1'],chain=['6','8','10','13','16','18','22','26','32','36'],extra=['As per EN 1677-4','Suitable for 1 & 2 leg Grade 80 chain slings as per EN 818-4'])
EN=['As per EN 1677-4','Suitable for 1 & 2 leg Grade 80 chain slings as per EN 818-4']
g80b('g80-master-link-assembly','G80 Master Link Assembly','MLASL Series',20,'L',(150,170,470,625),'Grade 80 master link assembly (master link with two sub-links) for multi-leg chain slings.',
 ['MLASL803','MLASL804','MLASL806','MLASL811','MLASL817','MLASL821','MLASL826','MLASL831','MLASL845','MLASL850'],['3.5','4.25','6.7','11.2','17','21.2','26.5','31.5','45','50'],['1.35','2.2','3.2','6.1','9.7','20.14','23.8','27.2','34.8','45'],chain=['6','8','10','13','16','18','20','22','26','28'],extra=EN)
g80b('g80-master-link-assembly-enlarged','G80 Master Link Assembly with Enlarged Sublinks','MLASL Series',20,'R',(1060,200,1490,645),'Grade 80 master link assembly with enlarged sub-links.',
 ['MLASL804','MLASL806','MLASL811','MLASL817','MLASL821','MLASL826'],['4.25','6.7','11.2','17','23.6','31.5'],['1.98','3.36','6.62','9.45','19','24.46'],extra=EN)
add(key='g80-chain-connecting-link',name='G80 Chain Connecting Link',model='CLSL Series',page=21,side='L',cat='chain-fittings',
 desc='Grade 80 connecting link for joining G80 chain to hooks, master links and other fittings.',features=G80[:5]+['Pins 100% eddy-current flaw tested','Suitable for EN 818-2 G80 chain'],
 specs=[['Size range','6 – 32'],['Grade','G80']],
 table=dict(columns=['Size','Item Code','Weight (kg)'],rows=[[a,b,c] for a,b,c in zip(['6','8','10','13','16','18','20','22','26','32'],['CLSL0806','CLSL0808','CLSL0810','CLSL0813','CLSL0816','CLSL0818','CLSL0820','CLSL0822','CLSL0826','CLSL0832'],['0.09','0.15','0.33','0.71','1.25','1.46','1.86','2.92','4.92','9.4'])]))
BOX['g80-chain-connecting-link']=(625,165,865,480)
add(key='g80-webbing-connecting-link',name='G80 Webbing Connecting Link',model='WSCLSL Series',page=21,side='L',cat='chain-fittings',
 desc='Grade 80 connecting link for joining web slings to G80 chain.',features=G80[:5]+['Pins 100% eddy-current flaw tested','Suitable for EN 1492-2 web sling and EN 818-2 G80 chain'],
 specs=[['Capacity','2 – 5 t'],['Grade','G80']],
 table=dict(columns=['Capacity (t)','Item Code','W.L.L (t)','Weight (kg)'],rows=[['2','WSCLSL08','3.15','0.47'],['3','WSCLSL10','5.3','0.96'],['5','WSCLSL13','8.0','1.88']]))
BOX['g80-webbing-connecting-link']=(590,740,860,1075)
add(key='g80-chain-shortener',name='G80 Chain Shortener',model='CSSL Series',page=21,side='R',cat='chain-fittings',
 desc='Grade 80 clevis chain shortener for adjusting the effective length of G80 chain sling legs.',features=G80[:5]+['Pins 100% eddy-current flaw tested','Suitable for EN 818-2 G80 chain'],
 specs=[['Chain size','6 – 26 mm'],['Capacity','1.2 – 21 t'],['Grade','G80']],
 table=dict(columns=['Size (mm)','Item Code','Ton','Weight (kg)'],rows=[[a,b,c,d] for a,b,c,d in zip(['6','8','10','13','16','20','22','26'],['CSSL0806','CSSL0808','CSSL0810','CSSL0813','CSSL0816','CSSL0820','CSSL0822','CSSL0826'],['1.2','2','3.15','5.3','8','12.5','15','21'],['0.17','0.39','1','1.85','3.69','4.5','8.4','15.3'])]))
BOX['g80-chain-shortener']=(1595,155,1780,510)
add(key='regular-swivel',name='Regular Swivel',model='RSWIVEL Series',page=21,side='R',cat='chain-fittings',
 desc='Eye-and-eye regular swivel for rigging assemblies.',features=['Eye-and-eye swivel'],
 specs=[['Capacity','3.15 – 21 t']],
 table=dict(columns=['Capacity (t)','Item Code','Weight (kg)'],rows=[['3.15','RSWIVEL3','1.43'],['5.3','RSWIVEL5','2.01'],['8','RSWIVEL8','4.21'],['21','RSWIVEL21','–']]))
BOX['regular-swivel']=(1585,760,1790,1195)
WO=['Forged super alloy steel','100% tested at 4 × working load limit','100% magnaflux crack detection','Ultimate break load tested','Fatigue tested at 1.5 × WLL for 20,000 cycles','Pins 100% eddy-current flaw tested']
add(key='weld-on-ring',name='Weld On Ring (D-Ring)',model='WRSL Series',page=22,side='L',cat='chain-fittings',
 desc='Forged weld-on lifting ring (D-ring) for welding to structures as a permanent lifting or lashing point.',features=WO,
 specs=[['Capacity','1 – 20 t']],
 table=dict(columns=['Capacity (t)','Item Code','Weight (kg)'],rows=[[a,b,c] for a,b,c in zip(['1','2','3','5','8','10','15','20'],['WRSL0801','WRSL0802','WRSL0803','WRSL0805','WRSL0808','WRSL0810','WRSL0815','WRSL0820'],['0.39','0.49','0.71','1.78','2.5','3.52','5.8','15.26'])]))
BOX['weld-on-ring']=(605,180,835,485)
add(key='g80-weld-on-hook',name='G80 Weld On Hook',model='WHSL Series',page=22,side='L',cat='chain-fittings',
 desc='Grade 80 weld-on hook with latch for welding to buckets, attachments and structures.',features=WO,
 specs=[['Capacity','1 – 5 t'],['Grade','G80']],
 table=dict(columns=['Capacity (t)','Item Code','Weight (kg)'],rows=[['1','WHSL0801','0.56'],['2','WHSL0802','0.9'],['3','WHSL0803','1.3'],['5','WHSL0805','2.4']]))
BOX['g80-weld-on-hook']=(565,760,865,1010)
add(key='galvanised-wire-rope-clamp',name='Galvanised Heavy Duty Wire Rope Clamp',model='UBSLGI Series',page=22,side='R',cat='chain-fittings',
 desc='Galvanised heavy duty U-bolt wire rope clamp (bulldog grip) for terminating and joining wire ropes, 6 mm to 50 mm.',features=['Galvanised finish','Heavy duty U-bolt and saddle construction'],
 specs=[['Rope size','6 – 50 mm'],['Finish','Galvanised']],
 table=dict(columns=['Size (mm)','Item Code','Weight (kg/pc)'],rows=[[a,'UBSLGI'+a.zfill(2),c] for a,c in zip(['6','8','10','12','15','20','22','25','28','32','36','40','45','50'],['0.03','0.07','0.12','0.2','0.31','0.49','0.68','0.91','1.53','2.07','2.46','2.73','4.75','6.67'])]))
BOX['galvanised-wire-rope-clamp']=(1050,150,1345,530)
add(key='eye-bolt-din-580',name='Eye Bolt DIN 580 — Galvanised',model='EBSL Series',page=23,side='L',cat='chain-fittings',
 desc='Forged carbon steel galvanised lifting eye bolt to DIN 580, M6 to M64.',features=['DIN 580','Forged carbon steel','Galvanised finish'],
 specs=[['Thread size','M6 – M64'],['Standard','DIN 580'],['Material','Forged carbon steel, galvanised']],
 table=dict(columns=['Size','WLL 0° (t)','WLL 90° (t)','Item Code','Weight (kg)'],rows=[list(r) for r in zip(['M6','M8','M10','M12','M16','M20','M24','M30','M36','M42','M56','M64'],['0.07','0.14','0.23','0.34','0.7','1.2','1.8','3.6','5.1','7','11.5','16'],['0.05','0.095','0.17','0.24','0.5','0.83','1.27','2.6','3.7','5','8.3','11'],['EBSL0806','EBSL0808','EBSL0810','EBSL0812','EBSL0816','EBSL0820','EBSL0824','EBSL0830','EBSL0836','EBSL0842','EBSL0856','EBSL0864'],['0.05','0.06','0.1','0.18','0.29','0.46','0.83','1.58','2.67','4.35','8.68','12.2'])]))
BOX['eye-bolt-din-580']=(155,230,440,640)
add(key='g80-rotating-lifting-eye-bolt',name='G80 Rotating Lifting Eye Bolt',model='RBSL Series',page=23,side='R',cat='chain-fittings',
 desc='Grade 80 rotating (swivel) lifting eye bolt, M8 to M64.',features=['Forged super alloy steel','100% tested at 2.5 × working load limit','100% magnaflux crack detection','Break test','Fatigue tested at 1.5 × WLL for 20,000 cycles','Pins 100% eddy-current flaw tested','Suitable for EN 818-2 G80 chain'],
 specs=[['Thread size','M8 – M64'],['Capacity','0.3 – 15 t'],['Grade','G80']],
 table=dict(columns=['Size','Capacity (t)','Item Code','Weight (kg)'],rows=[list(r) for r in zip(['M8','M10','M12','M16','M20','M24','M30','M30','M36','M42','M48','M56','M64'],['0.3','0.45','0.5','1.12','2','3.15','5.3','8','8','10','10','15','15'],['RBSL0808','RBSL0810','RBSL0812','RBSL0816','RBSL0820','RBSL0824','RBSL0830','RBSL0830','RBSL0836','RBSL0842','RBSL0848','RBSL0856','RBSL0864'],['0.45','0.45','0.45','0.45','1.54','1.55','4.01','3.75','3.81','6.32','4.2','10.1','10.9'])]))
BOX['g80-rotating-lifting-eye-bolt']=(1525,195,1740,705)
add(key='galvanised-turnbuckle-jaw-jaw',name='Drop Forged Heavy Duty Galvanised Turnbuckle — Jaw & Jaw',model='TBJJ Series',page=24,side='L',cat='chain-fittings',
 desc='Drop forged, heavy duty galvanised jaw-and-jaw turnbuckle for tensioning wire rope and rigging, 3/8" × 6" to 1-1/2" × 12".',features=['Drop forged','Heavy duty','Galvanised finish','Jaw & jaw ends'],
 specs=[['Size range','3/8" × 6" – 1-1/2" × 12"'],['Capacity','0.5 – 9.7 t'],['Finish','Galvanised']],
 table=dict(columns=['Size','Capacity (t)','Item Code','Weight (kg)'],rows=[list(r) for r in zip(['3/8" × 6"','1/2" × 6"','5/8" × 9"','3/4" × 9"','7/8" × 12"','1" × 12"','1-1/4" × 12"','1-1/2" × 12"'],['0.5','1','1.6','2.3','3.3','4.5','6.9','9.7'],['TBJJ1006','TBJJ1206','TBJJ1609','TBJJ2009','TBJJ2212','TBJJ2412','TBJJ3018','TBJJ3918'],['0.38','0.71','1.55','2.33','3.72','5.45','11.26','16.3'])]))
BOX['galvanised-turnbuckle-jaw-jaw']=(90,490,870,830)
add(key='g80-container-lifting-hook',name='G80 Container Lifting Hook',model='CLHSL812',page=24,side='R',cat='chain-fittings',
 desc='Grade 80 container lifting hook in left, right and straight types, WLL 12.5 t.',features=['Forged super alloy steel, quenched and tempered','Suitable for web sling and G80 chain (EN 818-2)','Individually proof tested at 2.5 × WLL','Fatigue tested at 1.5 × WLL for 20,000 cycles','Breakage test','100% magnaflux crack detection','Ultimate load is 4 × working load limit'],
 specs=[['WLL','12.5 t'],['Types','Left, Right, Straight'],['Grade','G80']],
 table=dict(columns=['Type','WLL (t)','Item Code','Weight (kg)'],rows=[['Left','12.5','CLHSL812L','4.4'],['Right','12.5','CLHSL812R','4.38'],['Straight','12.5','CLHSL812S','4.36']]))
BOX['g80-container-lifting-hook']=(1015,135,1195,675)
add(key='wire-rope-edge-protector-magnet',name='Wire Rope Edge Protector with Magnet',model='WREP Series',page=24,side='R',cat='slings',
 desc='Magnetic wire rope edge protector that attaches to the steel object being lifted and absorbs sharp or angular contact.',features=['Strong magnet attaches to the steel object being lifted','Absorbs sharp or angular contact on objects','Absorbs other acting forces during lifting','Position can be changed as required','Various sizes to suit rope diameter'],
 specs=[['Wire rope diameter','up to 60 mm']],
 table=dict(columns=['Wire Rope Dia (mm)','Item Code','Weight (kg)'],rows=[['Up to 10','WREP 10','1.9'],['10 – 20','WREP 20','1.96'],['20 – 30','WREP 30','2.4'],['30 – 40','WREP 40','4.94'],['40 – 50','WREP 50','9.5'],['50 – 60','WREP 60','12.7']]))
BOX['wire-rope-edge-protector-magnet']=(1565,750,1785,1025)
add(key='drum-lifter',name='Drum Lifter (Chain Type)',model='DLSL0105',page=25,side='L',cat='material-handling',
 desc='Chain drum lifter with drum clamps for safe lifting and transporting of steel (oil) drums.',features=['For safe lifting and transporting of steel (oil) drums','Automatic locking mechanism','Drum clamps can be used single or as a pair','Avoid snatch or shock loading','Lightweight, quick and easy to use'],
 specs=[['Rated capacity','400 kg'],['Jaw opening','0 – 25 mm'],['Net weight','3.6 kg']],table=None)
BOX['drum-lifter']=(130,145,395,575)
add(key='cable-puller',name='Cable Puller (Ratchet Puller)',model='CPSL Series',page=25,side='L',cat='hoists',
 desc='Hand-operated ratchet cable puller with galvanised steel handle and frame.',features=['Drum and ratchet wheel cast as one unit from aluminium alloy','Steel handle and frame galvanised to resist chips and corrosion','Spring loaded ratchet control lever — operates in any position and switches easily from lifting to lowering','Conforms to CE safety standard (as per manufacturer brochure)'],
 specs=[['Capacity','1 – 4 t'],['Wire rope diameter','4.5 – 5 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Wire Rope Dia (mm)','Wire Rope Length (m)','Weight (kg)'],rows=[['1','CPSL0010','4.5','1.5','2.16'],['2','CPSL0020','5','2','2.50'],['3','CPSL0030','5','3','3.21'],['4','CPSL0050','5','2.5','3.6']]))
BOX['cable-puller']=(430,765,850,1035)
add(key='permanent-magnet-lifter',name='Permanent Magnet Lifter',model='MAGSL Series',page=25,side='R',cat='material-handling',
 desc='Permanent magnet lifter for lifting steel plates and blocks — no power required.',features=['Safety factor 3:1','Strong permanent magnetic circuit','Stable and lasting working performance','Strong pull-off strength'],
 specs=[['Capacity','100 – 5000 kg'],['Safety factor','3:1']],
 table=dict(columns=['Capacity (kg)','Item Code','Weight (kg)'],rows=[['100','MAGSL001','3.2'],['400','MAGSL004','9.71'],['600','MAGSL006','21.2'],['1000','MAGSL010','35.1'],['2000','MAGSL020','66.78'],['3000','MAGSL030','82.1'],['5000','MAGSL050','200']]))
BOX['permanent-magnet-lifter']=(1440,145,1810,395)
add(key='industrial-skates',name='Industrial Skates (Machinery Moving Skates)',model='SKSL Series',page=25,side='R',cat='material-handling',
 desc='Steerable industrial skates with handle for moving heavy machinery and loads, 6 to 18 t.',features=['Steerable handle (900 mm)','Height 110 mm','Multiple 80 × 75 mm wheels'],
 specs=[['Capacity','6 – 18 t'],['Height','110 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Platform Size (mm)','Wheels','Weight (kg)'],rows=[['6','SKSL1806','270 × 185','4 (80 × 75 mm)','15.3'],['12','SKSL1812','350 × 270','8 (80 × 75 mm)','25.5'],['18','SKSL1818','480 × 260','12 (80 × 75 mm)','41.5']]))
BOX['industrial-skates']=(1395,750,1868,1235)
add(key='spring-balancer',name='Spring Balancer',model='SB Series',page=26,side='L',cat='hoists',
 desc='Spring balancer for suspending and balancing hand tools at workstations, 1 to 30 kg.',features=['Ratchet device','Plug-in type cable','Device for preventing dropping','Worm gear spring-loaded governor','Springback protection','Cyclic locking device'],
 specs=[['Capacity','1 – 30 kg'],['Travel','1.5 m'],['Cable diameter','3.2 – 5.2 mm']],
 table=dict(columns=['Capacity (kg)','Item Code','Travel (m)','Cable Ø (mm)','Net Weight (kg)'],rows=[['1–3','SB001003','1.5','3.2','1.5'],['3–5','SB003005','1.5','3.2','1.5'],['5–9','SB005009','1.5','4.2','4.5'],['9–15','SB009015','1.5','4.2','4.5'],['15–22','SB015022','1.5','5.2','8.5'],['22–30','SB022030','1.5','5.2','9']]))
BOX['spring-balancer']=(110,415,490,1275)
add(key='ratchet-load-binder',name='Ratchet Load Binder',model='RBSL1305',page=26,side='R',cat='chain-fittings',
 desc='Ratchet-type chain load binder for tensioning chains when tying down loads.',features=['Upgraded for use with grade 70, 80 and 100 chain','One-piece forged handle','Continuous take-up for fine adjustment of tie-down load','Each binder individually proof tested','Easy-operation positive ratchet'],
 specs=[['Chain size','3/8" – 1/2"'],['Working load limit','9,200 lbs'],['Proof load','18,400 lbs'],['Minimum ultimate load','33,000 lbs'],['Weight','12.9 lbs'],['Handle length','13.92 in']],table=None)
BOX['ratchet-load-binder']=(1050,225,1500,735)
add(key='wire-rope-pulley-block-single',name='Wire Rope Pulley Block — Single Sheave, Closed, Heavy Duty',model='WRPSL1 Series',page=27,side='L',cat='hoists',
 desc='Heavy duty closed-type single sheave wire rope pulley block, 1 to 10 t.',features=['Closed type','Heavy duty construction'],
 specs=[['Capacity','1 – 10 t'],['Max rope','18 – 40 mm (by size)']],
 table=dict(columns=['Size (t)','Item Code','Sheave (mm)','Max Rope (mm)','Weight (kg)'],rows=[['1','WRPSL101','–','–','–'],['2','WRPSL102','145','18','5.2'],['3','WRPSL103','170','20','8.8'],['5','WRPSL105','200','28','14.8'],['10','WRPSL110','300','40','39']]))
BOX['wire-rope-pulley-block-single']=(190,180,470,298)
add(key='wire-rope-pulley-block-double',name='Wire Rope Pulley Block — Double Sheave, Heavy Duty',model='WRPSL2 Series',page=27,side='L',cat='hoists',
 desc='Heavy duty double sheave wire rope pulley block, 2 to 10 t.',features=['Double sheave','Heavy duty construction'],
 specs=[['Capacity','2 – 10 t'],['Max rope','12 – 26.5 mm (by size)']],
 table=dict(columns=['Size (t)','Item Code','Sheave (mm)','Max Rope (mm)','Weight (kg)'],rows=[['2','WRPSL202','110','12','5.6'],['3','WRPSL203','140','18','11'],['5','WRPSL205','170','22','18.5'],['10','WRPSL210','230','26.5','46']]))
BOX['wire-rope-pulley-block-double']=(560,570,710,980)
add(key='manila-rope-pulley',name='Manila (Fibre) Rope Pulley Block',model='MPSB / MPDB Series',page=27,side='R',cat='hoists',
 desc='Fibre (manila) rope pulley block with hook, in single and double sheave versions.',features=['Hook with safety latch','Single (S) and double (D) sheave versions'],
 specs=[['Sizes','3/4" × 4" to 1-1/2" × 8"']],
 table=dict(columns=['Size','Item Code','Weight (kg)'],rows=[['3/4" × 4" (S)','MPSB2004','1.89'],['1" × 6" (S)','MPSB2506','3.19'],['1-1/2" × 8" (S)','MPSB3808','6.47'],['3/4" × 4" (D)','MPDB2004','2.8'],['1" × 6" (D)','MPDB2506','5']]))
BOX['manila-rope-pulley']=(1105,235,1340,765)
add(key='horizontal-plate-lifting-clamp',name='Horizontal Plate Lifting Clamp — PDB Type',model='HZPCSL Series',page=28,side='L',cat='material-handling',
 desc='Horizontal plate lifting clamp (PDB type) for lifting steel plates in the horizontal position, usually in pairs.',features=['For horizontal lifting of steel plates','Serrated jaw'],
 specs=[['Capacity','1 – 16 t'],['Jaw opening','30 – 150 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Jaw Opening (mm)','Weight (kg)'],rows=[['1','HZPCSL01','30','3.67'],['2','HZPCSL02','40','4.62'],['3','HZPCSL03','45','5.84'],['5','HZPCSL05','55','7.48'],['10','HZPCSL10','125','32.92'],['16','HZPCSL16','150','46']]))
BOX['horizontal-plate-lifting-clamp']=(645,140,870,465)
add(key='vertical-plate-lifting-clamp',name='Vertical Plate Lifting Clamp',model='VPLCSL Series',page=28,side='R',cat='material-handling',
 desc='Vertical plate lifting clamp for lifting and turning steel plates in the vertical position.',features=['For vertical lifting of steel plates','Locking jaw'],
 specs=[['Capacity','1 – 10 t'],['Jaw opening','22 – 80 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Jaw Opening (mm)','Weight (kg)'],rows=[['1','VPLCSL01','22','5.04'],['2','VPLCSL02','30','7.18'],['3','VPLCSL03','35','10.78'],['5','VPLCSL05','50','16.3'],['10','VPLCSL10','80','35']]))
BOX['vertical-plate-lifting-clamp']=(1150,140,1385,465)
add(key='lateral-plate-clamp',name='Lateral Plate Clamp',model='LPLCSL Series',page=28,side='L',cat='material-handling',
 desc='Lateral plate clamp for lifting steel plates from the side.',features=['For lateral (side) lifting of steel plates'],
 specs=[['Capacity','1 – 12 t'],['Jaw opening','0 – 75 mm']],
 table=dict(columns=['Capacity (t)','Item Code','Test Load (kN)','Jaw Opening (mm)'],rows=[['1','LPLCSL01','14.70','0–25'],['2','LPLCSL02','29.41','0–30'],['3','LPLCSL03','44.11','0–40'],['5','LPLCSL05','73.52','0–50'],['10','LPLCSL10','147','0–75'],['12','LPLCSL12','–','–']]))
BOX['lateral-plate-clamp']=(480,745,840,935)
add(key='universal-plate-lifting-clamp',name='Universal Plate Lifting Clamp',model='UPLCSL Series',page=28,side='R',cat='material-handling',
 desc='Universal plate lifting clamp for lifting steel plates in any direction.',features=['Multi-directional plate lifting'],
 specs=[['Capacity','1 – 5 t']],
 table=dict(columns=['Capacity (t)','Item Code','Jaw (NG Catalogue / Actual)','Weight (kg)'],rows=[['1','UPLCSL01','15 mm / 22 mm','4.4'],['2','UPLCSL02','25 mm / 18 mm','7.55'],['3','UPLCSL03','–','13.5'],['5','UPLCSL05','30 mm / 35 mm','18.05']]))
BOX['universal-plate-lifting-clamp']=(1485,760,1735,1075)
add(key='pipe-lifting-clamp',name='Pipe Lifting Clamp — TPH Type',model='PLCLSL Series',page=29,side='L',cat='material-handling',
 desc='TPH type pipe lifting clamp for lifting pipes and tubes.',features=['For lifting pipes and tubes','Protective jaw pad'],
 specs=[['Capacity','1.5 – 10 t']],
 table=dict(columns=['Capacity (t)','Item Code','Weight (kg)'],rows=[['1.5','PLCLSL01','1.53'],['3','PLCLSL03','2.01'],['6','PLCLSL06','3.3'],['8','PLCLSL08','3.51'],['10','PLCLSL10','8.75']]))
BOX['pipe-lifting-clamp']=(200,160,430,480)
add(key='beam-clamp',name='Beam Clamp',model='BEAMSL Series',page=29,side='L',cat='material-handling',
 desc='Adjustable beam clamp that provides a temporary anchor point on I-beams for hoists and pulley blocks.',features=['Adjustable to beam flange width','Provides a lifting point on I-beams'],
 specs=[['Capacity','1 – 10 t']],
 table=dict(columns=['Capacity (t)','Item Code','Flange Width A Min–Max (mm)','Weight (kg)'],rows=[['1','BEAMSL01','72 – 175','3.36'],['2','BEAMSL02','87.5 – 170','4.02'],['3','BEAMSL03','95.5 – 300','9.3'],['5','BEAMSL05','100 – 310','11.1'],['10','BEAMSL10','145 – 430','22.6']]))
BOX['beam-clamp']=(525,740,860,1010)
add(key='scissor-lift-pallet-truck',name='Scissor Lift Pallet Truck',model='SLPT1000',page=29,side='R',cat='material-handling',
 desc='Scissor lift pallet truck for loading/unloading conveyors and feed presses, and for moving and positioning pallets or containers.',
 features=['Quick-lift function doubles lifting speed for loads under 250 kg','Self-adjusting stabilisers activate automatically above 400 mm lift height','Extra long front legs for stability with unevenly loaded pallets','Below 400 mm it moves like a pallet truck; above 400 mm it is automatically locked by supports'],
 specs=[['Capacity','1000 / 1500 kg'],['Fork width','540 / 680 mm'],['Fork length','1150 mm'],['Min. fork height','85 mm'],['Max. fork height','800 mm'],['Steering wheel','Polyurethane'],['Fork wheel','Nylon / Polyurethane'],['Self weight','125 – 135 kg']],table=None)
BOX['scissor-lift-pallet-truck']=(1295,440,1790,830)
add(key='hand-pallet-truck',name='Hand Pallet Truck',model='HPT Series',page=30,side='L',cat='material-handling',
 desc='Manual hand pallet truck for short-distance transport in warehouses, lorries and markets — 2.5, 3 and 5 ton models.',
 features=['Ergonomic large rubber handle with lower / neutral / lifting positions','Heavy duty galvanised pump','Tandem fork wheels','210° steering turning radius; all pivot points greased','Speed-controlled lowering valve','Heavy gauge steel construction with drop forged lift link arms','Foot and hand lowering control','Steering wheel and fork rollers available in nylon, polyurethane or rubber','Adjustable solid steel push rods'],
 specs=[['Capacity','2500 / 3000 / 5000 kg'],['Lifting height','110 mm'],['Fork length','1150 – 1220 mm']],
 table=dict(columns=['Model','Item Code','Capacity (kg)','Fork Length (mm)','Overall Fork Width (mm)','Truck Weight (kg)'],rows=[['2.5 Ton','HPT25550','2500','1150','550','67'],['3 Ton','HPT30685','3000','1220','685','72.5'],['5 Ton','HPT50685','5000','1220','685','135']]))
BOX['hand-pallet-truck']=(190,170,515,680)
add(key='rough-terrain-pallet-truck',name='Rough Terrain Pallet Truck',model='RTT1000',page=31,side='L',cat='material-handling',
 desc='1000 kg rough terrain pallet truck with pneumatic tyres and adjustable forks for undulating surfaces.',
 features=['1000 kg capacity with adjustable forks','Pneumatic tyres for undulating surfaces','Powder coated heavy duty steel frame','Adjustable 860 mm forks; lowers to 70 mm minimum fork height','Ideal for open and closed pallets','Hand release trigger; 210° turning radius','Low maintenance pump unit'],
 specs=[['Capacity','1000 kg'],['Fork length','800 / 860 mm'],['Adjustable fork width','216 – 680 mm'],['Fork height','70 – 240 mm'],['Overall size (L × W × H)','1406 × 1670 × 1280 mm'],['Turn radius','1500 mm'],['Net weight','210 kg']],table=None)
BOX['rough-terrain-pallet-truck']=(280,120,760,550)
add(key='hydraulic-lifting-table',name='Hydraulic Lifting Table (Scissor Table Trolley)',model='HLTSL Series',page=31,side='R',cat='material-handling',
 desc='Mobile hydraulic scissor lifting table trolley, 500 kg and 1000 kg models.',features=['Foot-pump hydraulic lifting','Mobile with castor wheels'],
 specs=[['Capacity','500 – 1000 kg'],['Max. height','900 – 1600 mm']],
 table=dict(columns=['Item Code','Capacity','Max. Height (mm)','Platform (mm)','Self Weight (kg)'],rows=[['HLTSL005','500 kg × 1 m','900','810 × 515 × 50','87'],['HLTSL010','1000 kg × 1 m','1000','1000 × 510 × 55','111'],['HLTS1505','500 kg × 1.5 m','1600','1200 × 610 × 60','155']]))
BOX['hydraulic-lifting-table']=(1520,140,1810,535)
add(key='drum-trolley',name='Hydraulic Drum Trolley',model='DTSL0400',page=31,side='R',cat='material-handling',
 desc='Hydraulic drum trolley for lifting and moving drums.',features=['Hydraulic lifting','Mobile with wheels'],
 specs=[['Rated lifting capacity','300 kg'],['Lifting height','200 mm'],['Overall dimensions','1060 × 880 × 930 mm'],['Self weight','50 kg']],table=None)
BOX['drum-trolley']=(1410,745,1770,1135)
add(key='drum-lifter-cum-tilter',name='Drum Lifter cum Tilter',model='DLCT0116',page=32,side='L',cat='material-handling',
 desc='Ergonomic drum lifter and tilter that lifts, transports and places steel or fibre drums on or off pallets.',
 features=['Lifts, transports and places steel or fibre drums on/off pallets','Spring-loaded clamp securely holds any rimmed drum','Swivel steering wheels for easy positioning','Glides over a pallet to load or unload 30 or 50 gallon drums'],
 specs=[['Load lifting capacity','350 kg'],['Lifting height','1600 mm'],['Overall dimension','1190 × 890 × 2000 mm'],['Self weight','160 kg']],table=None)
BOX['drum-lifter-cum-tilter']=(405,205,865,850)
add(key='hand-stacker',name='Hand Stacker',model='HHSSL Series',page=32,side='R',cat='material-handling',
 desc='Hand push, hand lift stacker for cost-efficient vehicle loading and production area handling, 1000 and 2000 kg.',
 features=['Ergonomic handles and long tiller for effortless pulling','Ergonomic rubber handle','Quick lifting with foot pedal when unloaded','Easy maintenance and low running costs'],
 specs=[['Capacity','1000 / 2000 kg'],['Max. lifting height','1600 mm'],['Lowered fork height','90 mm']],
 table=dict(columns=['Item Code','Capacity (kg)','Max Lift (mm)','Fork Length (mm)','Adjustable Fork Width (mm)','Truck Weight (kg)'],rows=[['HHSSL216','2000','1600','890','320 – 770','167'],['HHSSL116','1000','1600','830','300 – 770','136.5']]))
BOX['hand-stacker']=(1465,245,1795,825)
add(key='electric-stacker',name='Electric Stacker',model='FESSL130',page=33,side='L',cat='material-handling',
 desc='Fully electric stacker — electro-hydraulic lift and motorised travel — for racking, shelving and unloading, with compact strong steel construction.',
 features=['Electro-hydraulic lift and motorised travel','Timer, emergency stop switch and power switch','Curtis controller','Compact design with strong steel construction'],
 specs=[['Load capacity','1500 kg'],['Lift height','3000 mm'],['Load centre','500 mm'],['Fork length','1150 mm'],['Traction speed (unladen/laden)','4.5 / 3 km/h'],['Battery','24 V / 80 Ah'],['Lift motor','DC24V 2.2 kW'],['Traction motor','DC24V 0.75 kW'],['Truck weight (without battery)','440 kg']],table=None)
BOX['electric-stacker']=(580,160,890,610)
add(key='wire-mesh-container',name='Wire Mesh Container',model='WMC Series',page=33,side='R',cat='material-handling',
 desc='Collapsible galvanised wire mesh storage container, available with or without wheels.',features=['Wire mesh construction','Available with or without wheels'],
 specs=[['Sizes','800 × 600 × 640 mm to 1200 × 1000 × 890 mm']],
 table=dict(columns=['Size (L × W × H)','Item Code','Weight (kg)'],rows=[['800 × 600 × 640 mm','WMCN0806','24'],['800 × 600 × 640 mm (wheel)','WMCW0806','33.5'],['1000 × 800 × 840 mm','WMCN1008','35.3'],['1000 × 800 × 840 mm (wheel)','WMCW1008','46'],['1200 × 1000 × 890 mm','WMCN1210','50'],['1200 × 1000 × 890 mm (wheel)','WMCW1210','59.3']]))
BOX['wire-mesh-container']=(1150,250,1480,530)
BOX.update({'chain-pulley-block-heavy-duty-t':(75,440,370,1320),'chain-pulley-block-b':(1490,140,1795,840),'electric-chain-hoist-heavy-duty':(1265,305,1580,1265),
'electric-chain-hoist-single-speed':(655,205,885,600),'polyester-duplex-webbing-sling':(1485,135,1660,600),'g80-alloy-steel-chain':(1730,30,1866,1300),
'industrial-skates':(1395,1060,1868,1235),'wire-rope-edge-protector-magnet':(1570,750,1785,1022),'scissor-lift-pallet-truck':(1300,440,1790,830),
'drum-lifter-cum-tilter':(425,450,865,850),'electric-stacker':(585,240,890,610),'cargo-lashing-ratchet':(485,640,845,1020),'sling-edge-protector':(1585,1040,1790,1290)})
BOX.update({'chain-pulley-block-heavy-duty-t':(80,440,370,1225),'chain-pulley-block-b':(1490,140,1795,690),'electric-chain-hoist-heavy-duty':(1300,305,1565,1265),
'electric-chain-hoist-single-speed':(655,205,862,600),'polyester-duplex-webbing-sling':(1520,135,1712,520),'industrial-skates':(1395,1140,1600,1235),
'wire-rope-edge-protector-magnet':(1570,750,1785,1010),'scissor-lift-pallet-truck':(1385,440,1790,830),'cargo-lashing-ratchet':(485,640,804,1110),'sling-edge-protector':(1585,1040,1770,1275)})
BOX.update({'chain-pulley-block-heavy-duty-t':(92,440,370,1225),'chain-pulley-block-b':(1490,140,1795,615)})
MASK={'cargo-lashing-ratchet':[(0,1028,672,2000)]}
