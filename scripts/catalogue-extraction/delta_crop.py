from PIL import Image, ImageChops
import os
S=250/110
os.makedirs('img/delta',exist_ok=True)
L3=(95,215);R3=(525,640)
crops={3:{'up':(L3,183,322),'bi':(L3,328,470),'cs':(L3,487,612),'sp':(L3,625,745),'bw':(L3,765,885),'dg':((100,215),897,1020),'ap':(L3,1037,1157),
          'ip':(R3,183,315),'ep':(R3,328,468),'ea':(R3,487,607),'mr':(R3,627,745),'mg-test':(R3,760,885),'ie':(R3,897,1020),'tc-sanitary':((525,628),1037,1155)},
4:{'dc-gauge':((125,262),188,325),'sf-gauge':((125,262),336,473),'hg':((125,262),488,627),'tg':((125,240),700,840),'tb':((125,262),862,1000),'et':((125,235),1032,1170),
   'dp':((498,603),186,320),'dsd':((498,592),352,466),'mg-mud':((498,610),488,620),'ft':((498,600),693,805),'sst':((498,600),816,925),'ftt':((498,600),935,1045),'tst':((498,625),1057,1165)},
5:{'sc':((100,225),193,325),'dis':((100,225),336,467),'dff':((100,213),478,610),'dfi':((100,225),628,752),'en':((100,225),762,893),'wt':((100,225),903,1035),'fr-seal':((100,225),1046,1168),
   'src':((497,620),197,322),'dc-seal':((497,620),335,458),'cd':((497,620),480,605),'fs':((497,620),626,750),'sf-seal':((497,620),768,900),'hm':((497,620),928,1045)},
6:{'nv1':((85,195),241,375),'nv3':((85,195),395,533),'2vm':((85,200),683,805),'3vm':((85,215),833,965),'5vm':((85,220),985,1115),
   'ct':((475,600),240,378),'gc':((475,605),390,525),'op':((475,605),538,675),'fr-ring':((475,605),685,822),'sn':((475,590),832,970),'sy':((475,605),982,1118)},
7:{'rtd3':((95,380),175,226),'rtd4':((95,380),285,336),'rtd5':((95,380),398,442),'rtd8':((485,770),175,222),'rtd11':((485,770),290,346),'rtd12':((485,770),398,452),
   'tc1':((95,385),612,680),'tc2':((95,385),778,846),'tc4':((95,410),912,950),'tc5':((95,410),1058,1102),'service':((470,860),760,1025)}}
def degreen(im):
    px=im.load();w,h=im.size;bw=max(6,int(min(w,h)*0.07))
    for y in range(h):
        for x in range(w):
            if x<bw or x>=w-bw or y<bw or y>=h-bw:
                r,g,b=px[x,y]
                if g>r+25 and g>b+15: px[x,y]=(255,255,255)
    return im
def trim(im,pad=12):
    im=degreen(im)
    bg=Image.new(im.mode,im.size,(255,255,255))
    diff=ImageChops.difference(im,bg).convert('L').point(lambda v:255 if v>18 else 0)
    b=diff.getbbox()
    if not b: return im
    b=(max(b[0]-pad,0),max(b[1]-pad,0),min(b[2]+pad,im.width),min(b[3]+pad,im.height))
    return im.crop(b)
for pg,items in crops.items():
    im=Image.open(f'hi/delta250-{pg}.png').convert('RGB')
    for name,((x0,x1),y0,y1) in items.items():
        c=im.crop((int(x0*S),int(y0*S),int(x1*S),int(y1*S)))
        c=trim(c)
        # pad to square-ish on white
        w,h=c.size; side=max(w,h)+30
        if name.startswith(('rtd','tc1','tc2','tc4','tc5','service')): canvas=Image.new('RGB',(w+40,max(h+40,int((w+40)*0.6))),'white')
        else: canvas=Image.new('RGB',(side,side),'white')
        canvas.paste(c,((canvas.width-w)//2,(canvas.height-h)//2))
        canvas.save(f'img/delta/{name}.jpg',quality=88)
print('done')
