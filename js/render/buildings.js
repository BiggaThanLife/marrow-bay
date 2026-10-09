"use strict";
/* Buildings for the depth map (SET.depth): each place and each business type gets its own materials, roof, windows, door and landmark details,
   so a bank looks like a bank and a foundry smokes. Everything stays inside the building's 4x4 block (a chimney, tower or smokestack may rise above it),
   the door stays where the entrance is, and the sign still hangs on the eave. With depth off, the classic drawBlock in tiles.js is used. */
/* which look a block gets: the place it is, the business you run in it, or the filler kind */
function bKey(b){if(b.poi)return b.kind;const biz=G&&bizOf(b.key);return biz&&biz.type?biz.type:b.kind}
/* roof: flat, pitched, slate, metal, glass or saw. wall: plaster, stone, brick, wood, metal, tudor, concrete or glass.
   win: std, small, tall, shop, strip, listing, curtain, blue, barred, roll, furnace, slit, cage, grid or none. door: std, double or steel. Briar Barn (barn) is drawn by drawBarnDepth instead. awn: an awning. kit: rooftop AC and hatch on a flat roof. */
const BSTYLE={
  bank:{roof:'flat',wall:'stone',win:'none',door:'double',kit:0},estate:{roof:'slate',wall:'stone',win:'tall'},club:{roof:'flat',wall:'plaster',win:'curtain',door:'double',kit:0},
  flats:{roof:'pitched',wall:'brick',win:'small'},rental:{roof:'pitched',wall:'brick',win:'small'},realty:{roof:'flat',wall:'plaster',win:'listing',awn:1,kit:0},
  market:{roof:'glass',wall:'plaster',win:'shop'},diner:{roof:'flat',wall:'plaster',win:'strip',kit:0},studio:{roof:'saw',wall:'plaster',win:'tall'},
  workshop:{roof:'metal',wall:'metal',win:'roll'},cityhall:{roof:'flat',wall:'stone',win:'tall',door:'double',kit:0},clinic:{roof:'flat',wall:'plaster',win:'blue',kit:0},
  dock:{roof:'metal',wall:'metal',win:'std'},bunk:{roof:'pitched',wall:'wood',win:'small'},gull:{roof:'pitched',wall:'tudor',win:'std'},
  casino:{roof:'flat',wall:'plaster',win:'none',door:'double',kit:0},velvet:{roof:'flat',wall:'plaster',win:'curtain',kit:0},pawn:{roof:'flat',wall:'brick',win:'barred'},
  loft:{roof:'flat',wall:'brick',win:'tall',kit:0},garage:{roof:'metal',wall:'metal',win:'roll'},foundry:{roof:'metal',wall:'brick',win:'furnace'},
  barber:{roof:'pitched',wall:'plaster',win:'shop',awn:1},tailor:{roof:'pitched',wall:'plaster',win:'shop',awn:1},prison:{roof:'flat',wall:'concrete',win:'slit',door:'steel',kit:0},
  barn:{roof:'pitched',wall:'wood',win:'none'},farmstead:{roof:'pitched',wall:'wood',win:'std'},farm:{roof:'pitched',wall:'wood',win:'std'},home:{roof:'pitched',wall:'plaster',win:'std'},
  tower:{roof:'flat',wall:'glass',win:'grid'},warehouse:{roof:'metal',wall:'metal',win:'roll'},
  cafe:{roof:'flat',wall:'plaster',win:'shop',awn:1,kit:0},bar:{roof:'flat',wall:'brick',win:'curtain',kit:0},pies:{roof:'pitched',wall:'brick',win:'shop',awn:1},
  cages:{roof:'flat',wall:'concrete',win:'cage'},wellness:{roof:'flat',wall:'plaster',win:'blue',awn:1,kit:0}
};
const bF=dpFill;
function bWin(x,y,w,h,lit,tint){bF('rgba(0,0,0,.5)',x-1,y-1,w+2,h+2);bF(lit?'#ffd88a':tint||'#2c3440',x,y,w,h);bF(lit?'#fff3c8':'rgba(255,255,255,.14)',x,y,w,1);if(!lit)bF('rgba(255,255,255,.2)',x+w-2,y+1,1,Math.max(1,Math.min(3,h-2)));bF('rgba(255,255,255,.22)',x-1,y+h+1,w+2,1)}
function bText(t,x,y,col){cx.font='7px Silkscreen, monospace';cx.textAlign='center';cx.fillStyle=col;cx.fillText(t,x,y);cx.textAlign='left'}
/* ----- materials on the front wall ----- */
function bWall(k,c,sx,eave,base,ww,L){
  const y0=eave+3,h=base-2-y0;
  if(k==='stone'){for(let y=y0;y<base-2;y+=5){bF('rgba(255,255,255,.16)',L,y,ww,1);for(let x=L+((y-y0)/5%2)*5;x<L+ww;x+=10)bF('rgba(0,0,0,.1)',x,y+1,1,4)}}
  else if(k==='brick'){for(let y=y0;y<base-2;y+=3){bF('rgba(0,0,0,.16)',L,y,ww,1);for(let x=L+((y-y0)/3%2)*3;x<L+ww;x+=6)bF('rgba(0,0,0,.12)',x,y,1,3)}}
  else if(k==='wood'){for(let y=y0;y<base-2;y+=3){bF('rgba(0,0,0,.18)',L,y,ww,1);bF('rgba(255,255,255,.08)',L,y+1,ww,1)}}
  else if(k==='metal'){for(let x=L+1;x<L+ww;x+=3)bF('rgba(0,0,0,.14)',x,y0,1,h)}
  else if(k==='tudor'){bF('rgba(255,240,215,.55)',L,y0,ww,h);for(let x=L;x<L+ww;x+=10)bF('#3a2616',x,y0,2,h);bF('#3a2616',L,y0+h/2-1,ww,2);for(let x=L+2;x<L+ww-8;x+=10){ln(cx,'#3a2616',x,y0,x+8,y0+h/2-1,1)}}
  else if(k==='concrete'){for(let x=L+15;x<L+ww;x+=16)bF('rgba(0,0,0,.12)',x,y0,1,h);bF('rgba(0,0,0,.06)',L+6,y0+4,5,6);bF('rgba(0,0,0,.05)',L+44,y0+2,6,9)}
  else if(k==='glass'){bF('#6f8ea8',L,y0,ww,h);for(let x=L;x<L+ww;x+=5)bF('rgba(20,30,45,.55)',x,y0,1,h);bF('rgba(20,30,45,.55)',L,y0+h/2,ww,1);ln(cx,'rgba(255,255,255,.18)',L+6,y0+h-1,L+16,y0,2);ln(cx,'rgba(255,255,255,.12)',L+38,y0+h-1,L+46,y0,2)}
}
/* ----- windows ----- */
function bWindows(k,sx,sy,eave,base,lit,c,hs){
  const wy=sy+48;
  if(k==='std'||k==='listing'||k==='curtain'||k==='blue'||k==='barred'){
    for(let i=0;i<3;i++){
      const x=sx+34+i*9;bWin(x,wy,7,6,lit,k==='blue'?'#4f8fb0':k==='curtain'?'#3a1c2a':null);
      if(k==='listing'){bF('#f4f2ea',x+1,wy+1,5,4);bF('#d94a3a',x+1,wy+1,5,1)}
      if(k==='curtain'){const cc=c[0];bF(cc,x,wy,2,6);bF(cc,x+5,wy,2,6);bF(shade(cc,.2),x,wy,7,1)}
      if(k==='barred')for(let j=1;j<7;j+=2)bF('#1e2128',x+j,wy-1,1,8);
    }
    if(k==='blue')bF('#4f8fb0',sx+2,sy+45,60,1);
  }else if(k==='small'){for(let i=0;i<5;i++)bWin(sx+33+i*6,wy+1,4,5,lit&&((hs>>i)&1));bWin(sx+5,wy+1,4,5,lit&&(hs&4));bWin(sx+11,wy+1,4,5,lit&&!(hs&4))}
  else if(k==='tall'){for(let i=0;i<3;i++){const x=sx+34+i*9;bWin(x,sy+46,6,11,lit);bF('rgba(0,0,0,.5)',x,sy+45,1,1);bF('rgba(0,0,0,.5)',x+5,sy+45,1,1);bF('rgba(0,0,0,.35)',x,sy+51,6,1)}}
  else if(k==='shop'){bWin(sx+33,sy+47,26,10,lit,'#5f86a0');bF('rgba(0,0,0,.45)',sx+45,sy+47,1,10);if(!lit){ln(cx,'rgba(255,255,255,.25)',sx+35,sy+56,sx+40,sy+47,1);ln(cx,'rgba(255,255,255,.18)',sx+48,sy+56,sx+52,sy+47,1)}}
  else if(k==='strip'){bF('#d8dde4',sx+2,sy+45,60,2);bF('#c24a3a',sx+2,sy+47,60,1);bWin(sx+32,sy+49,28,7,lit,'#5f86a0');for(let x=sx+39;x<sx+60;x+=7)bF('rgba(0,0,0,.45)',x,sy+49,1,7)}
  else if(k==='roll'){const x=sx+33;bF('rgba(0,0,0,.55)',x-1,sy+45,28,base-sy-45);bF('#8a9098',x,sy+46,26,base-sy-47);for(let y=sy+47;y<base-1;y+=2)bF('rgba(0,0,0,.18)',x,y,26,1);bF('#b8bec6',x,sy+46,26,1);bF('#d8b04a',x,base-3,26,1)}
  else if(k==='furnace'){const fl=Math.floor(performance.now()/120)%3;bF('#1a1210',sx+35,sy+46,22,12);bF(fl?'#e0561c':'#c24a1a',sx+37,sy+48,18,10);bF('#ff9a30',sx+40,sy+51,12,7);bF(fl===1?'#ffd24a':'#ffc040',sx+43,sy+54,6,4)}
  else if(k==='slit'){for(let i=0;i<4;i++){const x=sx+35+i*6;bF('rgba(0,0,0,.6)',x-1,sy+46,4,10);bF(lit?'#c9a050':'#1e2430',x,sy+47,2,8)}}
  else if(k==='cage'){for(let r=0;r<2;r++)for(let i=0;i<6;i++){const x=sx+33+i*5,y=sy+46+r*6;bWin(x,y,3,3,lit&&((hs>>(i+r*6))&1));bF('#1e2128',x+1,y-1,1,5)}}
  else if(k==='grid'){for(let r=0;r<2;r++)for(let i=0;i<11;i++){if(i===3||i===4)continue;const x=sx+3+i*5,y=sy+46+r*6;if(lit&&((hs>>(i+r*5))%3===0))bF('#ffd88a',x,y,4,4)}}
}
/* ----- doors ----- */
function bDoor(k,sx,sy,base,lit,c){
  const dx=sx+TS+3,dy=sy+52;
  if(k==='double'){bF('rgba(0,0,0,.55)',dx-3,dy-3,16,13);bF('#3a2616',dx-2,dy-2,14,12);bF('#5a3a20',dx-1,dy-1,5,10);bF('#5a3a20',dx+6,dy-1,5,10);bF('#d8b04a',dx+4,dy+4,1,1);bF('#d8b04a',dx+5,dy+4,1,1);bF('rgba(255,255,255,.22)',dx-4,base-1,18,1)}
  else if(k==='steel'){bF('rgba(0,0,0,.6)',dx-2,dy-2,14,12);bF('#6a7078',dx-1,dy-1,12,11);bF('#8a9098',dx-1,dy-1,12,1);for(const [x,y] of [[0,1],[9,1],[0,8],[9,8]])bF('#3a3e44',dx+x,dy+y,1,1);bF('#1e2128',dx+3,dy+2,4,2)}
  else{bF('rgba(0,0,0,.55)',dx-1,dy-1,12,11);bF('#2a1c12',dx,dy,10,10);bF('#45301f',dx+1,dy+1,8,1);bF('#d8b04a',dx+7,dy+5,1,1);bF('rgba(255,255,255,.2)',dx-2,base-1,14,1)}
  if(lit)bF('rgba(255,216,138,.2)',dx,dy+1,10,8);
}
/* ----- roofs ----- */
function bRoof(k,s,sx,sy,L,ww,top,eave,c,hs){
  bF(c[0],L,top,ww,eave-top);
  if(k==='pitched'||k==='slate'){
    if(k==='slate')bF('rgba(20,24,40,.45)',L,top,ww,eave-top);
    const mid=top+Math.round((eave-top)*.42);
    bF('rgba(0,0,0,.17)',L,top,ww,mid-top);for(let y=top+3;y<eave-1;y+=4)bF('rgba(0,0,0,.08)',L,y,ww,1);
    bF('rgba(0,0,0,.22)',L,mid-1,ww,1);bF('rgba(255,255,255,.32)',L,mid,ww,1);
    if(k==='slate'){for(const x of [sx+12,sx+44]){bF('rgba(0,0,0,.5)',x-1,mid+2,10,9);bF(c[1],x,mid+3,8,7);bF('rgba(0,0,0,.4)',x,mid+3,8,1);bWin(x+2,mid+5,4,4,false)}}
    else if(hs%2){const chx=sx+12+(hs>>4)%30;bF('#4a3c34',chx,top-2,5,10);bF('#6a5a50',chx,top-2,5,1);bF('rgba(0,0,0,.28)',chx+5,top,2,7)}
  }else if(k==='metal'){
    for(let x=L+1;x<L+ww;x+=3)bF('rgba(0,0,0,.15)',x,top,1,eave-top);bF('rgba(255,255,255,.2)',L,top,ww,1);bF('rgba(0,0,0,.12)',L,top+Math.round((eave-top)/2),ww,1);
  }else if(k==='glass'){
    bF('rgba(255,255,255,.22)',L,top,ww,2);bF('rgba(0,0,0,.6)',sx+7,top+5,50,15);bF('#7fb4d4',sx+8,top+6,48,13);for(let x=sx+8;x<sx+56;x+=6)bF('rgba(20,30,45,.5)',x,top+6,1,13);bF('rgba(20,30,45,.5)',sx+8,top+12,48,1);bF('rgba(255,255,255,.35)',sx+8,top+6,48,1);
  }else if(k==='saw'){
    for(let i=0;i<4;i++){const x=sx+5+i*14;bF('rgba(0,0,0,.45)',x,top+4,12,18);bF(c[1],x,top+12,12,10);bF('#7fb4d4',x+1,top+5,10,7);bF('rgba(255,255,255,.4)',x+1,top+5,10,1);bF('rgba(0,0,0,.25)',x+1,top+11,10,1)}
  }else{
    bF('rgba(255,255,255,.22)',L,top,ww,2);bF('rgba(0,0,0,.15)',L+3,top+3,ww-6,1);bF('rgba(0,0,0,.09)',L+3,top+4,1,eave-top-8);bF('rgba(255,255,255,.08)',L+ww-4,top+4,1,eave-top-8);
    if(s.kit!==0){
      const ax=sx+40+(hs%9),ay=top+6;bF('#a3a9b1',ax,ay,8,6);bF('#747a84',ax,ay+4,8,2);bF('#5a6068',ax+2,ay+1,4,1);bF('rgba(0,0,0,.25)',ax+8,ay+2,2,5);
      if(hs%3){const kx=sx+8+((hs>>3)%14);bF('#5b6b7c',kx,top+6,7,5);bF('#8fb4cc',kx+1,top+7,5,1);bF('rgba(0,0,0,.2)',kx+7,top+7,1,4)}
    }
  }
}
/* ----- landmarks: what makes each place itself. ex/ey is the roof's free middle, above the sign. ----- */
function bLandmark(key,o){
  const {sx,sy,top,eave,base,lit,now,c,hs}=o,ex=sx+32,ey=sy+14,blink=Math.floor(now/400)%2;
  switch(key){
    case 'bank':{
      for(const x of [sx+6,sx+12,sx+35,sx+42,sx+49,sx+56]){bF('rgba(0,0,0,.35)',x-1,eave+3,4,base-eave-5);bF('#f0ece0',x,eave+4,2,base-eave-6);bF('#f8f6ee',x-1,eave+3,4,1);bF('#f8f6ee',x-1,base-3,4,1)}
      cx.fillStyle='rgba(0,0,0,.4)';cx.beginPath();cx.moveTo(sx+12,top+22);cx.lineTo(ex,top+5);cx.lineTo(sx+52,top+22);cx.closePath();cx.fill();
      cx.fillStyle='#e8e2d0';cx.beginPath();cx.moveTo(sx+14,top+21);cx.lineTo(ex,top+7);cx.lineTo(sx+50,top+21);cx.closePath();cx.fill();
      dsc(cx,OUT,ex,top+15,4.5);dsc(cx,'#f2b84b',ex,top+15,3.5);bText('$',ex,top+18,'#8a5a10');break}
    case 'estate':{
      for(const x of [sx+3,sx+52]){dsc(cx,OUT,x+4,base-4,4.6);dsc(cx,'#3f7a3a',x+4,base-4,3.6);dsc(cx,'#5d9a4e',x+3,base-5,1.6)}
      bF('#d8b04a',sx+2,eave+2,60,1);dsc(cx,OUT,ex,top+6,3);dsc(cx,'#d8b04a',ex,top+6,2);break}
    case 'club':{
      bF('#d8b04a',sx+2,eave+2,60,1);bF('#d8b04a',sx+2,top,60,1);bF('#a8282a',sx+20,base-2,8,3);
      for(const x of [sx+16,sx+31]){bF('#d8b04a',x,base-7,1,6);bF('#f6d27a',x,base-8,1,1)}ln(cx,'#a8282a',sx+16,base-6,sx+19,base-5,1);
      for(const [dx,dy] of [[0,-5],[5,0],[0,5],[-5,0]])ln(cx,'#d8b04a',ex,ey,ex+dx,ey+dy,2);dsc(cx,'#f6d27a',ex,ey,2);break}
    case 'flats':case 'rental':{bF('#c9ced3',sx+48,top+3,1,5);dsc(cx,'#c9ced3',sx+46,top+3,2.5);bF('#3a3e44',sx+44,top+4,4,1);
      for(let i=0;i<3;i++){const x=sx+33+i*9;bF('#5a4128',x,eave-1,7,2)}break}
    case 'realty':{cx.fillStyle='#f4f2ea';cx.beginPath();cx.moveTo(ex-7,ey);cx.lineTo(ex,ey-6);cx.lineTo(ex+7,ey);cx.closePath();cx.fill();bF('#f4f2ea',ex-5,ey,10,6);bF('#3f6f94',ex-1,ey+2,3,4);
      bF('#5a4128',sx+5,base-9,1,8);bF('#f4f2ea',sx+3,base-12,7,4);bF('#d94a3a',sx+3,base-12,7,1);break}
    case 'market':{
      for(let i=0;i<15;i++)bF(i%2?'#f4efe2':c[0],sx+2+i*4,eave+3,4,4);bF('rgba(0,0,0,.25)',sx+2,eave+7,60,1);
      [['#d33a2c',sx+34],['#5ab04a',sx+43],['#f2b84b',sx+52]].forEach(([col,x])=>{bF('#8f6429',x,base-5,8,4);bF('rgba(0,0,0,.35)',x,base-1,8,1);for(let j=0;j<3;j++)bF(col,x+1+j*2,base-7,2,2)});break}
    case 'diner':{
      bF('rgba(0,0,0,.6)',sx+38,top+5,22,12);bF('#2a1c2a',sx+39,top+6,20,10);bText('EAT',sx+49,top+14,lit&&blink?'#ff6a6a':'#e84a4a');
      bF('#5a6068',sx+48,top+17,1,4);break}
    case 'studio':{bF('#c24a3a',sx+3,base-7,1,6);bF('#d8b04a',sx+5,base-5,3,4);bF('#5a9a4a',sx+9,base-6,3,5);break}
    case 'workshop':{dsc(cx,OUT,ex,ey,7);dsc(cx,'#8a929c',ex,ey,6);for(let i=0;i<8;i++){const a=i*Math.PI/4;bF('#8a929c',ex+Math.cos(a)*7-1,ey+Math.sin(a)*7-1,3,3)}dsc(cx,c[0],ex,ey,2.5);
      bF('#8f6429',sx+4,base-6,10,5);bF('#b8873f',sx+5,base-6,8,1);break}
    case 'cityhall':{
      const tx=ex-8;bF('rgba(0,0,0,.5)',tx-1,sy-9,18,32);bF(c[1],tx,sy-8,16,30);bF(c[0],tx,sy-8,16,3);
      cx.fillStyle=OUT;cx.beginPath();cx.moveTo(tx-2,sy-8);cx.lineTo(ex,sy-17);cx.lineTo(tx+18,sy-8);cx.closePath();cx.fill();
      cx.fillStyle='#5a6a7a';cx.beginPath();cx.moveTo(tx,sy-8);cx.lineTo(ex,sy-15);cx.lineTo(tx+16,sy-8);cx.closePath();cx.fill();
      dsc(cx,OUT,ex,sy+1,5.5);dsc(cx,'#f4f2e8',ex,sy+1,4.5);const h=(clockNow()/60)%12,m=(clockNow()%60)/60;
      ln(cx,OUT,ex,sy+1,ex+Math.cos(h/12*6.283-1.571)*2.5,sy+1+Math.sin(h/12*6.283-1.571)*2.5,1);ln(cx,'#c24a3a',ex,sy+1,ex+Math.cos(m*6.283-1.571)*4,sy+1+Math.sin(m*6.283-1.571)*4,1);
      bF('#2a3140',sx+52,sy-6,1,22);const wv=Math.floor(now/300)%2;bF('#3a86d6',sx+53,sy-6+wv,7,4);bF('#f4f2ea',sx+53,sy-4+wv,7,1);break}
    case 'clinic':{bF('rgba(0,0,0,.35)',ex-3,ey-8,8,18);bF('rgba(0,0,0,.35)',ex-8,ey-3,18,8);bF('#d33a2c',ex-3,ey-9,7,17);bF('#d33a2c',ex-9,ey-4,17,7);bF('#ff6a5a',ex-3,ey-9,7,1);break}
    case 'dock':{
      ln(cx,OUT,ex,ey-6,ex,ey+6,3);ln(cx,'#d8dde4',ex,ey-6,ex,ey+6,1);ln(cx,'#d8dde4',ex-4,ey-3,ex+4,ey-3,1);cx.strokeStyle='#d8dde4';cx.lineWidth=1;cx.beginPath();cx.arc(ex,ey+1,5,.2,Math.PI-.2);cx.stroke();dsc(cx,'#d8dde4',ex,ey-7,1.6);
      dsc(cx,OUT,sx+8,sy+50,4.6);dsc(cx,'#f4f2ea',sx+8,sy+50,3.6);bF('#d33a2c',sx+5,sy+49,2,2);bF('#d33a2c',sx+10,sy+49,2,2);dsc(cx,c[1],sx+8,sy+50,1.5);
      bF('#3a3e44',sx+3,base-4,4,4);bF('#5a6068',sx+3,base-4,4,1);break}
    case 'bunk':{bF('#4a3c34',sx+6,top+2,1,14);bF('#4a3c34',sx+58,top+2,1,14);bF('rgba(255,255,255,.6)',sx+6,top+4,53,1);
      ['#d33a2c','#3a86d6','#f4f2ea','#5ab04a','#f2b84b'].forEach((col,i)=>bF(col,sx+10+i*10,top+5,5,5+(i%2)));break}
    case 'gull':{
      bF('#3a2616',sx+2,sy+44,8,1);bF('#3a2616',sx+3,sy+44,1,3);const sw=Math.round(Math.sin(now/600));bF(OUT,sx+3+sw,sy+47,9,7);bF('#c9a46a',sx+4+sw,sy+48,7,5);bF('#f4f2ea',sx+6+sw,sy+50,3,1);bF('#f4f2ea',sx+5+sw,sy+51,1,1);bF('#f4f2ea',sx+9+sw,sy+51,1,1);
      for(const x of [sx+50,sx+56]){bF(OUT,x-1,base-8,7,8);bF('#8a5a30',x,base-7,5,6);bF('#5a3a20',x,base-5,5,1)}
      bF('#2a1c12',sx+31,sy+49,3,4);bF(lit?'#ffd88a':'#c9a050',sx+32,sy+50,1,2);break}
    case 'casino':{
      for(let i=0;i<15;i++){const on=(i+Math.floor(now/180))%2;bF(on?'#fff6c0':'#b8902a',sx+3+i*4,eave-1,2,2);bF(on?'#b8902a':'#fff6c0',sx+3+i*4,eave-17,2,2)}
      bF('#d8b04a',sx+2,eave+2,60,1);bF('#a8282a',sx+20,base-2,8,3);
      bF(OUT,ex-11,ey-8,10,10);bF('#f4f2ea',ex-10,ey-7,8,8);bF(OUT,ex-8,ey-5,1,1);bF(OUT,ex-5,ey-2,1,1);bF(OUT,ex-6,ey-4,1,1);
      bF(OUT,ex+2,ey-9,9,12);bF('#f4f2ea',ex+3,ey-8,7,10);dsc(cx,'#c0302a',ex+5.5,ey-4,1.4);dsc(cx,'#c0302a',ex+7.5,ey-4,1.4);bF('#c0302a',ex+5,ey-3,4,2);bF('#c0302a',ex+6,ey-1,2,1);
      for(let i=0;i<3;i++){const x=sx+35+i*9;bF('rgba(0,0,0,.5)',x-1,sy+47,9,8);bF(blink?'#ff5ad0':'#8a2a6a',x,sy+48,7,6)}break}
    case 'velvet':{
      const neon=lit?(blink?'#ff5ad0':'#c03a9a'):'#7a3a6a';bF(neon,sx+3,top+1,58,1);bF(neon,sx+3,top+1,1,eave-top-3);bF(neon,sx+60,top+1,1,eave-top-3);
      ln(cx,neon,ex-6,ey-6,ex+6,ey-6,1);ln(cx,neon,ex-6,ey-6,ex,ey,1);ln(cx,neon,ex+6,ey-6,ex,ey,1);ln(cx,neon,ex,ey,ex,ey+6,1);ln(cx,neon,ex-3,ey+6,ex+3,ey+6,1);dsc(cx,'#5ab04a',ex+1,ey-4,1);
      for(const x of [sx+16,sx+31]){bF('#c9ced3',x,base-7,1,6)}ln(cx,'#a8282a',sx+16,base-6,sx+31,base-6,1);break}
    case 'pawn':{
      bF('#5a4128',sx+3,sy+44,8,1);[[sx+6,sy+48],[sx+10,sy+48],[sx+8,sy+52]].forEach(([x,y])=>{dsc(cx,OUT,x,y,2.6);dsc(cx,'#f2b84b',x,y,1.8);bF('#fff1b0',x-1,y-1,1,1)});
      bF('rgba(0,0,0,.35)',sx+33,sy+46,26,2);for(let y=sy+46;y<sy+48;y+=1)bF('#8a9098',sx+33,y,26,1);break}
    case 'loft':{
      bF('#5a4128',sx+44,top+10,1,8);bF('#5a4128',sx+54,top+10,1,8);bF(OUT,sx+42,top+1,15,10);bF('#8a6a4a',sx+43,top+2,13,8);for(let x=sx+45;x<sx+56;x+=3)bF('rgba(0,0,0,.2)',x,top+2,1,8);
      cx.fillStyle='#5a4128';cx.beginPath();cx.moveTo(sx+42,top+1);cx.lineTo(sx+49.5,top-4);cx.lineTo(sx+57,top+1);cx.closePath();cx.fill();
      bF(lit?(blink?'#9a8aff':'#6a5ad0'):'#5a4a90',sx+2,eave+1,60,1);break}
    case 'garage':{
      for(let i=0;i<3;i++){bF(OUT,sx+3,base-4-i*4,10,4);bF('#2a2e34',sx+4,base-3-i*4,8,2);bF('#5a6068',sx+6,base-3-i*4,4,1)}
      bF('rgba(20,20,30,.35)',sx+38,base,16,2);ln(cx,OUT,ex-6,ey+6,ex+5,ey-5,4);ln(cx,'#c9ced3',ex-6,ey+6,ex+5,ey-5,2);dsc(cx,OUT,ex+6,ey-6,3.5);dsc(cx,'#c9ced3',ex+6,ey-6,2.5);dsc(cx,c[0],ex+7,ey-7,1.2);break}
    case 'foundry':{
      for(const x of [sx+8,sx+20]){bF(OUT,x-1,sy-8,8,31);bF('#6a3a28',x,sy-7,6,29);bF('#f4f2ea',x,sy-5,6,2);bF('#c24a3a',x,sy-3,6,2);bF('rgba(255,255,255,.15)',x,sy-7,1,29);
        for(let i=0;i<3;i++){const k=((now/1700)+i/3+(x%7)/9)%1;dsc(cx,`rgba(150,150,155,${(.55*(1-k)*(1-k)).toFixed(2)})`,x+3+k*12,sy-9-k*6,1.5+k*3.5)}}
      for(let i=0;i<3;i++)bF('#a8a090',sx+40+i*6,base-3,5,2);break}
    case 'barber':{const y0=eave+3,h=base-eave-6;bF(OUT,sx+31,y0-1,5,h+2);bF('#f4f2ea',sx+32,y0,3,h);for(let y=0;y<h;y++){const s=(y+Math.floor(now/120))%6;bF(s<2?'#d33a2c':s<4?'#f4f2ea':'#3a86d6',sx+32,y0+y,3,1)}bF('#c9ced3',sx+31,y0-2,5,1);bF('#c9ced3',sx+31,y0+h,5,1);break}
    case 'tailor':{bF('#f4f2ea',sx+39,sy+49,3,2);bF(c[0],sx+38,sy+51,5,4);bF(c[0],sx+37,sy+55,7,2);bF('#5a4128',sx+40,sy+57,1,1);
      bF(OUT,ex-5,ey-6,11,12);bF('#c9a46a',ex-4,ey-5,9,10);bF('#d33a2c',ex-4,ey-3,9,6);for(let y=ey-3;y<ey+3;y+=2)bF('#a8282a',ex-4,y,9,1);ln(cx,'#c9ced3',ex+4,ey+3,ex+9,ey+8,1);break}
    case 'prison':{
      bF('#8a8f96',sx+2,top,60,3);bF('#8a8f96',sx+2,top,3,eave-top);bF('#8a8f96',sx+59,top,3,eave-top);for(let x=sx+2;x<sx+62;x+=4){bF('#3a3e44',x,top-2,2,1);bF('#3a3e44',x+2,top-1,2,1)}
      bF(OUT,sx+46,sy-9,13,22);bF('#6a7078',sx+47,sy-8,11,20);bF('#4a4f58',sx+45,sy-11,15,3);bWin(sx+49,sy-6,7,4,lit);
      if(lit){const a=Math.sin(now/1500)*.8;cx.fillStyle='rgba(255,250,210,.16)';cx.beginPath();cx.moveTo(sx+52,sy-4);cx.lineTo(sx+52+Math.cos(a+1.6)*60-12,sy+60);cx.lineTo(sx+52+Math.cos(a+1.6)*60+12,sy+60);cx.closePath();cx.fill()}break}
    case 'farmstead':case 'farm':{
      bF('#5a4128',sx+14,sy+44,18,2);bF('#5a4128',sx+14,sy+44,1,base-sy-45);bF('#5a4128',sx+31,sy+44,1,base-sy-45);
      for(let x=sx+36;x<sx+60;x+=4){bF('#e8dcc0',x,base-5,2,5)}bF('#e8dcc0',sx+35,base-4,26,1);
      bF(OUT,sx+3,base-7,9,7);bF('#e0c070',sx+4,base-6,7,5);bF('#c9a050',sx+4,base-4,7,1);break}
    case 'home':{bF('#5a4128',sx+33,base-4,26,3);for(let i=0;i<5;i++)bF(['#e85a7a','#f2c84a','#b07ad8'][i%3],sx+35+i*5,base-6,2,2);bF('#3a3e44',sx+5,base-9,1,8);bF('#3a86d6',sx+3,base-12,5,4);break}
    case 'tower':{
      const v=hs%3;
      if(v===0){bF('#3a3e44',ex-1,top-8,1,20);bF('#3a3e44',ex-4,top,7,1);bF(Math.floor(now/600)%2?'#ff3b3b':'#7a1c1c',ex-1,top-9,1,1)}
      else if(v===1){dsc(cx,OUT,ex,ey,8);dsc(cx,'#5a6068',ex,ey,7);bF('#f4f2ea',ex-3,ey-4,1,8);bF('#f4f2ea',ex+2,ey-4,1,8);bF('#f4f2ea',ex-3,ey,6,1)}
      else{bF('#4a7a3a',sx+8,top+4,48,18);for(let i=0;i<6;i++)dsc(cx,'#5d9a4e',sx+12+i*8,top+9+(i%2)*6,3)}break}
    case 'warehouse':{
      bText(String(10+hs%89).padStart(2,'0'),ex,ey+3,'rgba(255,255,255,.4)');
      for(let i=0;i<2;i++){bF('#8f6429',sx+5+i*6,base-4,5,3);bF('#b8873f',sx+5+i*6,base-4,5,1)}break}
    case 'cafe':{bF(OUT,ex-6,ey-4,11,9);bF('#f4f2ea',ex-5,ey-3,9,7);bF('#8a5a30',ex-5,ey-3,9,2);bF(OUT,ex+5,ey-2,3,4);bF('#f4f2ea',ex+5,ey-1,2,2);
      for(let i=0;i<3;i++){const k=((now/900)+i/3)%1;bF(`rgba(255,255,255,${(.6*(1-k)).toFixed(2)})`,ex-3+i*3,ey-6-k*6,1,2)}
      bF('#5a4128',sx+5,base-7,8,1);bF('#5a4128',sx+8,base-6,2,5);bF('#c24a3a',sx+3,base-12,12,3);break}
    case 'bar':{bF(OUT,ex-6,ey-6,11,13);bF('#e8c96a',ex-5,ey-4,9,10);bF('#fff6d0',ex-5,ey-5,9,3);bF(OUT,ex+4,ey-2,3,6);bF('#e8c96a',ex+5,ey-1,1,4);
      for(const x of [sx+50,sx+56]){bF(OUT,x-1,base-8,7,8);bF('#8a5a30',x,base-7,5,6);bF('#5a3a20',x,base-5,5,1)}break}
    case 'pies':{dsc(cx,OUT,ex,ey,7);dsc(cx,'#c4813a',ex,ey,6);dsc(cx,'#a8642a',ex,ey,4);for(let i=-4;i<=4;i+=4){bF('#e0a860',ex+i,ey-5,1,10);bF('#e0a860',ex-5,ey+i,10,1)}
      for(let i=0;i<2;i++){const k=((now/1100)+i/2)%1;bF(`rgba(255,255,255,${(.5*(1-k)).toFixed(2)})`,ex-2+i*4,ey-9-k*6,1,2)}break}
    case 'cages':{for(let i=0;i<6;i++)bF('#3a3e44',sx+8+i*8,top+4,1,20);bF('#3a3e44',sx+8,top+4,41,1);bF('#3a3e44',sx+8,top+14,41,1);bF('#3a3e44',sx+8,top+24,41,1);break}
    case 'wellness':{cx.fillStyle=OUT;cx.beginPath();cx.ellipse(ex,ey,8,5,-.6,0,7);cx.fill();cx.fillStyle='#7ac46a';cx.beginPath();cx.ellipse(ex,ey,7,4,-.6,0,7);cx.fill();ln(cx,'#4a8a3a',ex-5,ey+3,ex+5,ey-3,1);
      for(const x of [sx+5,sx+31]){bF('#8a5a30',x,base-4,5,4);dsc(cx,'#5d9a4e',x+2.5,base-7,3)}break}
  }
}
/* glows at night, for the light map: [x, y, radius, 'r,g,b', strength] relative to the block */
function bGlows(key){
  return({diner:[[49,12,18,'255,90,90',.5]],foundry:[[46,52,22,'255,140,50',.7],[11,-8,9,'255,140,50',.25]],club:[[24,58,14,'255,210,120',.5]],casino:[[32,24,30,'255,220,140',.55]],
    gull:[[32,51,10,'255,200,120',.55]],cityhall:[[32,1,10,'255,240,200',.5]],velvet:[[32,24,28,'255,80,200',.5]],loft:[[32,43,24,'150,130,255',.35]],prison:[[52,-4,10,'255,250,210',.6]],
    pawn:[[8,50,8,'255,210,120',.35]],barn:[[24,30,11,'255,200,120',.55],[24,55,7,'255,200,120',.3]],tower:[[32,52,22,'255,210,140',.3]]})[key]||[];
}
/* Briar Barn, the cheapest bed in town: a red gambrel barn with its gable end to the street, big sliding doors, a hayloft someone lives in
   (open and lamp-lit at night), a stovepipe, a tarp over a leak, a mailbox, hay bales and a silo. It draws its own roof and front. */
function drawBarnDepth(b,sx,sy,lit,now){
  const L0=sx+2,R0=sx+46,mx=sx+24,top=sy+2,eave=sy+40,base=sy+62,RED='#a8382c',RDK='#8e2e25',RSH='#86291f',TRIM='#f4efe2';
  const topAt=x=>{const d=Math.abs(x+.5-mx);return d<=15?sy+18+Math.round(d/15*9):sy+27+Math.round((d-15)/7*13)};
  /* grass first: the curved back of the roof and the silo dome leave the block's ground showing (the old flat roof covered it) */
  bF(GROUND[district(b.x+1,b.y+1)]||GROUND.Greenbelt,sx,sy,64,base-sy);for(const [x,y] of [[5,4],[58,9],[3,30],[41,6],[62,40]])bF('rgba(0,0,0,.08)',sx+x,sy+y,2,1);
  /* the roof runs back from the front: the same gambrel outline raised by its depth, shingle rows that follow the curve,
     the ridge and the two slope breaks running from front to back */
  const D=16,band=(x,f,c)=>{bF(OUT,x,f-D-1,1,1);bF(c,x,f-D,1,D);for(let k=3;k<D;k+=3)bF('rgba(0,0,0,.13)',x,f-k,1,1)};
  for(let x=L0;x<R0;x++){const left=x<mx,d=Math.abs(x+.5-mx);band(x,topAt(x),d>15?(left?'#7a4a3e':'#5a342c'):(left?'#8a5446':'#663a30'))}
  bF(OUT,L0-1,eave-D-1,1,D+1);bF(OUT,R0,eave-D-1,1,D+1);
  bF('#a86a58',mx-1,sy+18-D,2,D);bF('rgba(255,255,255,.16)',mx-16,topAt(mx-16)-D,1,D);bF('rgba(0,0,0,.22)',mx+15,topAt(mx+15)-D,1,D);
  /* a blue tarp tied over a leak, lying on the curve of the roof */
  for(let x=sx+8;x<sx+19;x++){const y=topAt(x)-D+5,edge=x===sx+8||x===sx+18;bF(OUT,x,y-1,1,9);if(!edge){bF((x-sx)%4===3?'#2a5a90':'#3a7ab8',x,y,1,7);bF('#5a9ad0',x,y,1,1)}}
  ln(cx,'#e8dcc0',sx+4,topAt(sx+4)-D+3,sx+8,topAt(sx+8)-D+5,1);ln(cx,'#e8dcc0',sx+18,topAt(sx+18)-D+11,sx+22,topAt(sx+22)-D+14,1);
  /* the stovepipe, with smoke */
  bF(OUT,sx+31,sy+4,5,13);bF('#7a828c',sx+32,sy+5,3,11);bF('#9aa2ac',sx+32,sy+5,1,11);bF(OUT,sx+30,sy+3,7,2);
  for(let i=0;i<3;i++){const k=((now/1900)+i/3)%1;dsc(cx,`rgba(170,170,175,${(.5*(1-k)*(1-k)).toFixed(2)})`,sx+33+k*10,sy+1-k*8,1.5+k*3)}
  /* the gable end: upright boards, darker towards the shaded side, white trim along the gambrel line */
  for(let x=L0;x<R0;x++){const y=topAt(x);bF(OUT,x,y-1,1,1);bF(x>=R0-4?RSH:(x-L0)%3===2?RDK:RED,x,y,1,base-y);if(y<eave)bF(TRIM,x,y,1,1)}
  bF(OUT,L0-1,eave,1,base-eave);bF(OUT,R0,eave,1,base-eave);bF(TRIM,L0,eave,1,base-eave);bF(TRIM,R0-1,eave,1,base-eave);bF(TRIM,L0,eave,R0-L0,1);
  bF('#bc4a3a',sx+6,sy+44,2,11);bF('#bc4a3a',sx+39,sy+31,2,8);
  /* the hayloft: shut with an X and leaking hay by day; open and lamp-lit at night, because someone sleeps up there */
  const hx=mx-5,hy=sy+25;bF(OUT,hx-1,hy-1,12,12);
  if(lit){bF('#ffd88a',hx,hy,10,10);bF('#fff3c8',hx+1,hy+1,8,2);bF('#5a3a20',hx+4,hy,1,3);bF('#fff6d0',hx+3,hy+3,3,2);bF('#6a4a2a',hx+1,hy+7,6,3);bF('#e8e0f0',hx+1,hy+7,2,1)}
  else{bF(RDK,hx,hy,10,10);bF(TRIM,hx,hy,10,1);bF(TRIM,hx,hy+9,10,1);bF(TRIM,hx,hy,1,10);bF(TRIM,hx+9,hy,1,10);ln(cx,TRIM,hx+1,hy+1,hx+8,hy+8,1);ln(cx,TRIM,hx+8,hy+1,hx+1,hy+8,1);for(let i=0;i<4;i++)bF('#e0c060',hx+1+i*2+(i%2),hy+10,1,2)}
  bF(OUT,mx-2,sy+19,4,3);bF('#5a3a20',mx-1,sy+20,2,1);bF('#c9a46a',mx,sy+22,1,2);
  /* the name, painted on a board over the doors */
  bF(OUT,mx-14,sy+38,28,9);bF('#e8dcc0',mx-13,sy+39,26,7);bF('#c9b896',mx-13,sy+45,26,1);bText(SIGN[b.kind]||'BARN',mx,sy+45,'#7e2a22');
  /* the big sliding doors on their track, with lamplight through the gap at night */
  const dy=sy+49;bF('#3a3e44',mx-15,dy-2,30,1);
  for(const dx of [mx-12,mx]){bF(OUT,dx-1,dy-1,14,base-dy+1);bF(RDK,dx,dy,12,base-dy-1);bF(TRIM,dx,dy,12,1);bF(TRIM,dx,base-2,12,1);bF(TRIM,dx,dy,1,base-dy-1);bF(TRIM,dx+11,dy,1,base-dy-1);ln(cx,TRIM,dx+1,dy+1,dx+10,base-3,1);ln(cx,TRIM,dx+10,dy+1,dx+1,base-3,1)}
  if(lit)bF('#ffd88a',mx-1,dy,2,base-dy-1);
  bF('rgba(255,255,255,.22)',mx-14,base-1,28,1);
  /* the silo: a dome, banded metal, a ladder and a little rust */
  const s0=sx+48,s1=sx+61,sm=(s0+s1)/2-.5;
  dsc(cx,OUT,sm,top+5,7.5);dsc(cx,'#9aa2ac',sm,top+5,6.5);bF('#c9ced3',s0+3,top,4,1);
  bF(OUT,s0-1,top+5,s1-s0+2,base-top-5);for(let x=s0;x<s1;x++)bF(x<s0+4?'#c9ced3':x>=s1-4?'#8a929c':'#aab0b8',x,top+5,1,base-top-6);
  for(let y=top+10;y<base-2;y+=6)bF('rgba(0,0,0,.18)',s0,y,s1-s0,1);
  bF('#5a5f68',s1-4,top+9,1,base-top-11);bF('#5a5f68',s1-2,top+9,1,base-top-11);for(let y=top+11;y<base-2;y+=3)bF('#5a5f68',s1-4,y,3,1);
  bF('#a8603a',s0+2,base-13,2,3);bF('#a8603a',s0+6,top+16,1,2);
  /* a mailbox by the path and hay bales against the silo */
  bF('#5a3a20',sx+5,base-8,1,8);bF(OUT,sx+3,base-12,6,5);bF('#8a929c',sx+4,base-11,4,3);bF('#d33a2c',sx+8,base-14,1,3);
  for(const [x,y] of [[s0-1,base-5],[s0+6,base-5],[s0+2,base-9]]){bF(OUT,x-1,y-1,8,6);bF('#e0c060',x,y,6,4);bF('#c9a040',x,y+2,6,1)}
}
/* the whole building */
function drawBlockDepth(b,lit,now){
  const sx=b.x*TS-camX,sy=b.y*TS-camY,w=4*TS,hh=4*TS;
  const biz=G&&!b.poi?bizOf(b.key):null,bt=biz&&biz.type?BT[biz.type]:null,c=bt?bt.col:COL[b.kind];
  const key=bKey(b),s=BSTYLE[key]||{roof:'flat',wall:'plaster',win:'std'},hs=hash(b.x,b.y);
  if(key==='barn')return drawBarnDepth(b,sx,sy,lit,now);
  const L=sx+2,ww=w-4,Rr=L+ww,top=sy+2,eave=sy+hh-22,base=sy+hh-2;
  /* front wall */
  bF(c[1],L,eave,ww,20);
  bWall(s.wall,c,sx,eave,base,ww,L);
  bF('rgba(255,255,255,.1)',L,eave+3,1,17);bF('rgba(0,0,0,.18)',Rr-4,eave,4,20);
  bF('rgba(0,0,0,.3)',L,eave,ww,3);bF('rgba(0,0,0,.22)',L,base-2,ww,2);
  bWindows(s.win,sx,sy,eave,base,lit||(G&&districtDayLit(b,hs)),c,hs);
  if(G)districtBoards(b,biz,sx,sy,hs);
  bDoor(s.door||'std',sx,sy,base,lit,c);
  if(s.awn){const dx=sx+TS+3,dy=sy+52;for(let i=0;i<5;i++)bF(i%2?'#f4efe2':c[0],dx-4+i*4,dy-5,4,3);bF('rgba(0,0,0,.28)',dx-4,dy-2,20,1)}
  /* roof */
  bRoof(s.roof,s,sx,sy,L,ww,top,eave,c,hs);
  bF('rgba(255,255,255,.18)',L,eave-3,ww,1);bF('rgba(0,0,0,.38)',L,eave-1,ww,1);bF('rgba(0,0,0,.18)',Rr-3,top,3,eave-top);bF('rgba(255,255,255,.12)',L,top,1,eave-top);
  /* the sign hangs on the eave */
  const label=b.poi?SIGN[b.kind]:bt?bt.sign:null,sy0=eave-14;
  cx.font='7px Silkscreen, monospace';cx.textAlign='center';
  if(label){bF('rgba(0,0,0,.3)',sx+7,sy0+1,w-12,12);bF('rgba(14,16,24,.78)',sx+6,sy0,w-12,12);bF('rgba(255,255,255,.14)',sx+6,sy0,w-12,1);cx.fillStyle='#fff';cx.fillText(label,sx+w/2,sy0+9)}
  else if(!b.poi&&!biz){
    bF('rgba(0,0,0,.3)',sx+11,sy0+1,w-20,14);bF('#fff',sx+10,sy0-1,w-20,14);bF('#d94a3a',sx+10,sy0-1,w-20,3);
    cx.fillStyle='#8a2a1a';cx.fillText('FOR SALE',sx+w/2,sy0+10);
  }else if(biz&&!bt){bF('rgba(14,16,24,.7)',sx+8,sy0,w-16,12);cx.fillStyle='#ffd88a';cx.fillText('YOURS',sx+w/2,sy0+9)}
  cx.textAlign='left';
  /* the place's own landmark details */
  bLandmark(key,{sx,sy,top,eave,base,lit,now,c,hs});
  if(biz){bF('#2a3140',sx+w-10,sy-4,1,12);bF('#4fd1b5',sx+w-9,sy-4,6,4);bF('rgba(255,255,255,.3)',sx+w-9,sy-4,6,1)}
}
