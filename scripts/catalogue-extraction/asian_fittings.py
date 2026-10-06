import pymupdf, json, os
d=pymupdf.open('/home/claude/work/../src-pdfs/asian-catalogue.pdf')
H={20:[(32,72,'Tube Coupling Parts'),(31,163,'Tube to Tube Coupling'),(31,254,'Tube to Male Stud BSPT'),(31,342,'Tube to Male Stud BSP'),(31,432,'Tube to Male Stud Metric'),(31,524,'Bulkhead Coupling'),(381,524,'Weld Coupling'),(31,636,'Tube to Male Stud Elastomeric BSP'),(174,636,'Tube to Male Stud Elastomeric Metric'),(326,636,'Tube to Male Stud O-Ring Metric'),(470,636,'Tube to Male Stud NPTF'),(31,744,'Tube to Male Stud O-Ring SAE/UNF'),(178,743,'Female Connector BSP'),(327,743,'Female Connector Metric')],
21:[(30,72,'Reducer / Expander'),(437,71,'Banjo Coupling'),(30,163,'Banjo Coupling'),(30,257,'Swivel Connector'),(376,257,'Swivel Coupling Soft Seal'),(30,347,'Swivel Coupling Soft Seal'),(379,347,'Swivel Connector Soft Seal'),(353,649,'Swivel Connector Soft Seal'),(30,442,'Adjustable Fittings SAE/UNF'),(379,442,'Weld Nipple'),(27,534,'Gauge Adaptor'),(377,533,'Blanking End'),(27,649,'Adjustable Fittings Metric'),(481,639,'Live Swivel'),(27,743,'Swivel Coupling')],
22:[(30,72,'Gauge Adaptor'),(152,72,'Plug BSPT'),(373,72,'Plug SAE/UNF'),(30,166,'Plug BSP'),(373,166,'Plug NPTF'),(30,257,'Plug Metric'),(30,350,'Adaptor'),(30,444,'SAE Flanged Connection'),(30,537,'Fitting Check Valve'),(30,628,'Fitting Tool'),(30,719,'Fitting Seal')]}
out={}
os.makedirs('/home/claude/work/img/asian',exist_ok=True)
for pg,heads in H.items():
    p=d[pg-1]
    for i in p.get_image_info(xrefs=True):
        if i['width']!=238 and i['width']!=237: continue
        x0,y0=i['bbox'][0],i['bbox'][1]
        c=[h for h in heads if h[1]<y0 and y0-h[1]<45 and h[0]<=x0+12]
        if not c: print('UNASSIGNED',pg,x0,y0); continue
        h=max(c,key=lambda h:(round(h[1]/15),h[0]))
        out.setdefault(h[2],[])
        if i['xref'] not in [x for x,_ in out[h[2]]]: out[h[2]].append((i['xref'],pg))
for k,v in out.items():
    paths=[]
    for n,(x,pg) in enumerate(sorted(v,key=lambda t:t[0])):
        pix=pymupdf.Pixmap(d,x)
        if pix.n-pix.alpha>3: pix=pymupdf.Pixmap(pymupdf.csRGB,pix)
        slug=k.lower().replace(' / ','-').replace('/','-').replace(' ','-')
        fn=f'/home/claude/work/img/asian/fit-{slug}-{n+1}.png'
        pix.save(fn); paths.append(os.path.basename(fn))
    print(k,len(paths))
    out[k]=paths
json.dump(out,open('/home/claude/work/asian_fittings.json','w'),indent=1)
