import pymupdf,re,json
d=pymupdf.open('../src-pdfs/Taparia_Price_List_April_2026.pdf')
HEAD=re.compile(r'^(\d{1,2})\.\s*(\(\s*[A-Z]{1,2}\d?\s*\))?\s*(.+)$')
PRICE=re.compile(r'Price|₹|Pkg|Each',re.I)
def lines(p):
    out=[]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            t=''.join(s['text'] for s in l['spans']).strip()
            if not t: continue
            x0,y0,x1,y1=l['bbox']
            out.append(dict(t=t,x=x0,y=y0,sz=max(s['size'] for s in l['spans']),bold=any(('Demi' in s['font']) or ('Bold' in s['font']) for s in l['spans'])))
    return out
def clean(c): return re.sub(r'\s+',' ',(c or '').replace('\x00','')).strip()
def garbled(rows):
    txt=' '.join(clean(c) for r in rows[:3] for c in r if c)
    return bool(re.search(r'(Product\s*Product)|DesD|acCia|1144',txt))
def table_to_variants(t):
    rows=t.extract()
    if not rows or garbled(rows): return None
    hdr=[clean(c) for c in rows[0]]
    body=rows[1:]
    # second header row (first cell empty and others text non-numeric)
    if body and not clean(body[0][0]) and all(not re.match(r'^[\d.,\-/ ]+$',clean(c)) for c in body[0] if c):
        sub=[clean(c) for c in body[0]]
        # fill merged headers
        last=''
        full=[]
        for i,h in enumerate(hdr):
            if h: last=h
            full.append((h or last)+((' – '+sub[i]) if sub[i] else ''))
        hdr=full; body=body[1:]
    else:
        last='';full=[]
        for h in hdr:
            if h: last=h; full.append(h)
            else: full.append(last)
        hdr=full
    keep=[i for i,h in enumerate(hdr) if h and not PRICE.search(h)]
    if not keep: return None
    cols=[hdr[i] for i in keep]
    out=[]
    for r in body:
        vals=[clean(r[i]) if i<len(r) else '' for i in keep]
        if not any(vals): continue
        if not vals[0] and out:  # continuation line
            out[-1]=[(a+' '+b).strip() for a,b in zip(out[-1],vals)]; continue
        out.append(vals)
    # dedupe columns identical names
    return dict(columns=cols,rows=out) if out else None
sections={};order=[]
for p in d:
    if p.number<3: continue
    L=lines(p); W=p.rect.width
    tabs=p.find_tables().tables
    heads=[]
    for l in L:
        m=HEAD.match(l['t'])
        if m and l['sz']>=8.4 and l['bold'] and (m.group(2) or re.match(r'^[A-Z]',m.group(3))) and not re.search(r'\d{3,}',m.group(3)[:6]):
            key=m.group(1)+'.'+(re.sub(r'[\s()]','',m.group(2)) if m.group(2) else '')
            heads.append(dict(key=key,title=m.group(3).strip(),x=l['x'],y=l['y'],col=0 if l['x']<W/2-10 else 1))
    for h in heads:
        nxt=[o['y'] for o in heads if o['col']==h['col'] and o['y']>h['y']+2]
        y1=min(nxt) if nxt else p.rect.height-15
        x0,x1=(0,W/2-5) if h['col']==0 else (W/2-5,W)
        region=[l for l in L if x0<=l['x']<x1 and h['y']+2<=l['y']<y1 and not HEAD.match(l['t'])]
        mytabs=[t for t in tabs if x0<=t.bbox[0]<x1 and h['y']<=t.bbox[1]<y1]
        intab=lambda l:any(t.bbox[0]-2<=l['x']<=t.bbox[2] and t.bbox[1]-2<=l['y']<=t.bbox[3] for t in mytabs)
        notes=[l['t'] for l in region if not intab(l) and l['sz']<9.5]
        imgs=[]
        for i in p.get_image_info(xrefs=True):
            bx=i['bbox']; cx=(bx[0]+bx[2])/2; cy=(bx[1]+bx[3])/2
            if x0<=cx<x1 and h['y']-12<=cy<min(y1,h['y']+75) and i['width']>40:
                imgs.append((i['xref'],round((bx[2]-bx[0])*(bx[3]-bx[1])),i['width'],i['height']))
        variants=[v for v in (table_to_variants(t) for t in sorted(mytabs,key=lambda t:t.bbox[1])) if v]
        s=sections.get(h['key'])
        if not s:
            s=dict(key=h['key'],title=h['title'],page=p.number+1,notes=[],tables=[],imgs=[]); sections[h['key']]=s; order.append(h['key'])
        elif len(h['title'])>len(s['title']) and s['title'] in h['title']: s['title']=h['title']
        s['notes']+=notes; s['tables']+=variants; s['imgs']+=imgs
res=[sections[k] for k in order]
json.dump(res,open('taparia_raw.json','w'),indent=1,ensure_ascii=False)
print(len(res),'with tables',sum(1 for s in res if s['tables']),'with imgs',sum(1 for s in res if s['imgs']))
print('no tables:',[ (s['key'],s['title']) for s in res if not s['tables']])
