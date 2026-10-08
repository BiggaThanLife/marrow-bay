"use strict";
/* Depth and lighting for the map, layered on top of the classic drawing and switched by SET.depth (Settings: Depth and lighting).
   It only draws: no game state, taps, paths or saves depend on it, and with the switch off the map is drawn exactly as before.
   What it adds: buildings with a roof, an eave, a shaded front wall, framed windows, awnings and rooftop details; shadows that follow
   the sun through the day; kerbs and shorelines; trees and street lamps that people can walk behind; and at night a light map with
   warm pools under lamps and windows instead of one flat tint. */
const depthOn=()=>typeof SET==='undefined'||SET.depth!==false;
const dpFill=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)};
/* trees seen in this frame's tile pass, drawn later with the people so you can walk behind them */
let dpTrees=[];
function depthTree(tx,ty){dpTrees.push([tx,ty])}
/* street lamps: on every other road junction, at the corner of the crossing, and along the boardwalk */
const DP_LAMPS=(()=>{
  const out=[];
  XS.forEach((x,i)=>HY.forEach((y,j)=>{if((i+j)%2===0&&map[y]&&map[y][x]===T.ROAD)out.push({x:x*TS+2,y:y*TS+3})}));
  for(let x=12;x<=58;x+=6)if(map[33][x]===T.DOCK)out.push({x:x*TS+8,y:33*TS+3});
  return out;
})();
/* the sun: null at night, else a shadow direction (pixels of shadow per pixel of height) and a strength */
function depthSun(){
  const h=(clockNow()/60)%24;
  if(h<6||h>19.5)return null;
  const e=Math.max(.15,Math.sin(Math.PI*(h-6)/13.5)),k=Math.min(1,(h-6)*1.2,(19.5-h)*1.2);
  const len=Math.min(1.5,.42/e);
  return{dx:(h-12.75)/6.75*len,dy:.38*len,a:.24*k};
}
/* ----- per tile: kerbs where the pavement steps down to the road, shorelines and deep water, pilings under the boardwalk ----- */
function depthTileFx(tx,ty,now){
  const t=map[ty][tx],sx=tx*TS-camX,sy=ty*TS-camY;
  const at=(x,y)=>map[y]&&map[y][x]!=null?map[y][x]:t;
  if(t===T.ROAD){
    if(at(tx,ty-1)!==T.ROAD&&at(tx,ty-1)!==T.WATER)dpFill('rgba(0,0,0,.2)',sx,sy,TS,2);
    if(at(tx-1,ty)!==T.ROAD&&at(tx-1,ty)!==T.WATER)dpFill('rgba(0,0,0,.12)',sx,sy,1,TS);
    if(at(tx,ty+1)!==T.ROAD&&at(tx,ty+1)!==T.WATER)dpFill('rgba(255,255,255,.12)',sx,sy+TS-1,TS,1);
    if(at(tx+1,ty)!==T.ROAD&&at(tx+1,ty)!==T.WATER)dpFill('rgba(255,255,255,.07)',sx+TS-1,sy,1,TS);
  }else if(t===T.WATER){
    let d=0;for(let k=1;k<=4;k++){if(at(tx,ty-k)===T.WATER&&at(tx-k,ty)===T.WATER&&at(tx+k,ty)===T.WATER)d++;else break}
    if(d)dpFill(`rgba(8,26,44,${(.06*d).toFixed(2)})`,sx,sy,TS,TS);
    const n=at(tx,ty-1);
    if(n!==T.WATER){
      dpFill('rgba(0,0,0,.28)',sx,sy,TS,3);
      if(n===T.DOCK){dpFill('#3e2c1c',sx+3,sy,2,5);dpFill('#3e2c1c',sx+11,sy,2,5);dpFill('rgba(0,0,0,.25)',sx+3,sy+5,2,2);dpFill('rgba(0,0,0,.25)',sx+11,sy+5,2,2)}
      else if(Math.sin(now*.003+tx*1.3)>-.2)dpFill('rgba(230,245,255,.45)',sx+1,sy+3,TS-2,1);
    }
    if(at(tx-1,ty)!==T.WATER)dpFill('rgba(0,0,0,.22)',sx,sy,2,TS);
    if(at(tx+1,ty)!==T.WATER)dpFill('rgba(0,0,0,.14)',sx+TS-2,sy,2,TS);
  }
}
/* ----- shadows: contact shadows at every building's foot, and sun shadows by day ----- */
function depthShadows(now){
  const sun=placing?null:depthSun();
  blocks.forEach(b=>{
    const sx=b.x*TS-camX,sy=b.y*TS-camY;if(sx>VW+40||sy>VH+40||sx<-110||sy<-110)return;
    const x0=sx+2,x1=sx+62,y0=sy+2,y1=sy+62;
    if(sun){
      const H=30,ox=sun.dx*H,oy=sun.dy*H;
      cx.fillStyle=`rgba(18,22,44,${sun.a.toFixed(3)})`;cx.beginPath();
      if(ox>=0){cx.moveTo(x0,y0);cx.lineTo(x1,y0);cx.lineTo(x1+ox,y0+oy);cx.lineTo(x1+ox,y1+oy);cx.lineTo(x0+ox,y1+oy);cx.lineTo(x0,y1)}
      else{cx.moveTo(x0,y0);cx.lineTo(x1,y0);cx.lineTo(x1,y1);cx.lineTo(x1+ox,y1+oy);cx.lineTo(x0+ox,y1+oy);cx.lineTo(x0+ox,y0+oy)}
      cx.closePath();cx.fill();
    }
    dpFill('rgba(0,0,0,.2)',x0,y1,x1-x0,2);dpFill('rgba(0,0,0,.1)',x0,y1+2,x1-x0,2);dpFill('rgba(0,0,0,.1)',x0-2,y0+4,2,y1-y0-4);dpFill('rgba(0,0,0,.12)',x1,y0+4,2,y1-y0-2);
  });
  if(!sun)return;
  cx.fillStyle=`rgba(18,22,44,${(sun.a*.9).toFixed(3)})`;
  dpTrees.forEach(([tx,ty])=>{const bx=tx*TS-camX+8,by=ty*TS-camY+14,s=treeSize(tx,ty);cx.beginPath();cx.ellipse(bx+sun.dx*s*1.1,by+sun.dy*s*.9,s*.55+2,s*.3+1,0,0,7);cx.fill()});
  DP_LAMPS.forEach(l=>{const lx=l.x-camX,ly=l.y-camY+12;if(lx<-30||ly<-30||lx>VW+30||ly>VH+30)return;cx.strokeStyle=cx.fillStyle;cx.lineWidth=1;cx.beginPath();cx.moveTo(lx+.5,ly);cx.lineTo(lx+.5+sun.dx*13,ly+sun.dy*13);cx.stroke()});
}
/* ----- buildings: roof, eave, front wall, windows, door, awning, rooftop kit, sign on the eave ----- */
const DP_PITCHED=new Set(['flats','bunk','barn','farmstead','gull','barber','tailor','pawn','diner','market','studio']);
const DP_AWNING=new Set(['market','diner','gull','pawn','barber','tailor','clinic']);
function drawBlockDepth(b,lit,now){
  const sx=b.x*TS-camX,sy=b.y*TS-camY,w=4*TS,hh=4*TS;
  const biz=G&&!b.poi?bizOf(b.key):null,bt=biz&&biz.type?BT[biz.type]:null,c=bt?bt.col:COL[b.kind];
  const kind=b.poi?b.kind:b.kind,hs=hash(b.x,b.y);
  const L=sx+2,ww=w-4,Rr=L+ww,top=sy+2,eave=sy+hh-22,base=sy+hh-2;
  /* front wall */
  dpFill(c[1],L,eave,ww,20);
  dpFill('rgba(255,255,255,.1)',L,eave+3,1,17);dpFill('rgba(0,0,0,.18)',Rr-4,eave,4,20);
  dpFill('rgba(0,0,0,.3)',L,eave,ww,3);dpFill('rgba(0,0,0,.22)',L,base-2,ww,2);
  for(let i=0;i<3;i++){
    const wx=sx+34+i*9,wy=sy+hh-16;
    dpFill('rgba(0,0,0,.5)',wx-1,wy-1,9,8);dpFill(lit?'#ffd88a':'#2c3440',wx,wy,7,6);dpFill(lit?'#fff3c8':'#3e4c5c',wx,wy,7,1);
    dpFill(lit?'rgba(160,100,40,.35)':'#4f6274',wx+3,wy,1,6);if(!lit)dpFill('#5d7286',wx+5,wy+2,1,2);dpFill('rgba(255,255,255,.22)',wx-1,wy+7,9,1);
  }
  const dx=sx+TS+3,dy=sy+hh-12;
  dpFill('rgba(0,0,0,.55)',dx-1,dy-1,12,11);dpFill('#2a1c12',dx,dy,10,10);dpFill('#45301f',dx+1,dy+1,8,1);dpFill('#d8b04a',dx+7,dy+5,1,1);dpFill('rgba(255,255,255,.2)',dx-2,base-1,14,1);
  if(lit)dpFill('rgba(255,216,138,.22)',dx+1,dy+2,8,8);
  if(DP_AWNING.has(kind)||bt){for(let i=0;i<5;i++)dpFill(i%2?'#f4efe2':c[0],dx-4+i*4,dy-5,4,3);dpFill('rgba(0,0,0,.28)',dx-4,dy-2,20,1)}
  /* roof */
  dpFill(c[0],L,top,ww,eave-top);
  if(DP_PITCHED.has(kind)){
    const mid=top+Math.round((eave-top)*.42);
    dpFill('rgba(0,0,0,.17)',L,top,ww,mid-top);for(let y=top+3;y<eave-1;y+=4)dpFill('rgba(0,0,0,.08)',L,y,ww,1);
    dpFill('rgba(0,0,0,.22)',L,mid-1,ww,1);dpFill('rgba(255,255,255,.32)',L,mid,ww,1);
    if(hs%2){const chx=sx+12+(hs>>4)%30;dpFill('#4a3c34',chx,top+1,5,8);dpFill('#6a5a50',chx,top+1,5,1);dpFill('rgba(0,0,0,.28)',chx+5,top+3,2,6)}
  }else{
    dpFill('rgba(255,255,255,.22)',L,top,ww,2);dpFill('rgba(0,0,0,.15)',L+3,top+3,ww-6,1);dpFill('rgba(0,0,0,.09)',L+3,top+4,1,eave-top-8);dpFill('rgba(255,255,255,.08)',Rr-4,top+4,1,eave-top-8);
    const ax=sx+40+(hs%9),ay=top+6;dpFill('#a3a9b1',ax,ay,8,6);dpFill('#747a84',ax,ay+4,8,2);dpFill('#5a6068',ax+2,ay+1,4,1);dpFill('rgba(0,0,0,.25)',ax+8,ay+2,2,5);
    if(hs%3){const kx=sx+8+((hs>>3)%14);dpFill('#5b6b7c',kx,top+6,7,5);dpFill('#8fb4cc',kx+1,top+7,5,1);dpFill('rgba(0,0,0,.2)',kx+7,top+7,1,4)}
  }
  dpFill('rgba(255,255,255,.18)',L,eave-3,ww,1);dpFill('rgba(0,0,0,.38)',L,eave-1,ww,1);dpFill('rgba(0,0,0,.18)',Rr-3,top,3,eave-top);dpFill('rgba(255,255,255,.12)',L,top,1,eave-top);
  /* the sign hangs on the eave */
  const label=b.poi?SIGN[b.kind]:bt?bt.sign:null,sy0=eave-14;
  cx.font='7px Silkscreen, monospace';cx.textAlign='center';
  if(label){dpFill('rgba(0,0,0,.3)',sx+7,sy0+1,w-12,12);dpFill('rgba(14,16,24,.78)',sx+6,sy0,w-12,12);dpFill('rgba(255,255,255,.14)',sx+6,sy0,w-12,1);cx.fillStyle='#fff';cx.fillText(label,sx+w/2,sy0+9)}
  else if(!b.poi&&!biz){
    dpFill('rgba(0,0,0,.3)',sx+11,sy0+1,w-20,14);dpFill('#fff',sx+10,sy0-1,w-20,14);dpFill('#d94a3a',sx+10,sy0-1,w-20,3);
    cx.fillStyle='#8a2a1a';cx.fillText('FOR SALE',sx+w/2,sy0+10);
  }else if(biz&&!bt){dpFill('rgba(14,16,24,.7)',sx+8,sy0,w-16,12);cx.fillStyle='#ffd88a';cx.fillText('YOURS',sx+w/2,sy0+9)}
  cx.textAlign='left';
  if(biz){dpFill('#2a3140',sx+w-10,sy-4,1,12);dpFill('#4fd1b5',sx+w-9,sy-4,6,4);dpFill('rgba(255,255,255,.3)',sx+w-9,sy-4,6,1)}
  if(b.poi&&(b.kind==='casino'||b.kind==='velvet')&&lit){const on=Math.floor(now/400)%2;dpFill(on?'#ff5ad0':'#8a2a6a',sx+4,eave-2,w-8,1);dpFill(on?'#ff9ae4':'#6a2a5a',sx+4,sy0-2,w-8,1)}
}
/* ----- trees and lamps, drawn among the people ----- */
const treeSize=(tx,ty)=>10+hash(tx*3,ty*7)%5;
function drawTreeDepth(tx,ty){
  const bx=tx*TS-camX+8,by=ty*TS-camY+14,s=treeSize(tx,ty),h=hash(tx,ty),r=Math.round(s*.5);
  const dark=['#2f5a2e','#355f2c','#2c5236'][h%3],mid=['#3f7a3a','#4a8442','#3c7046'][h%3],hi=['#5d9a4e','#6aa85a','#58905e'][h%3];
  dpFill('#3e2a18',bx-1,by-6,3,7);dpFill('#5b3d24',bx-1,by-6,1,7);
  const cyy=by-6-r;
  /* fade the canopy when the player is standing behind it */
  let fade=false;if(G&&G.p){const px=G.p.x*TS+8-camX,py=G.p.y*TS+14-camY;fade=G.p.y<ty&&Math.abs(px-bx)<r+3&&py>cyy-r-2&&py<by}
  if(fade)cx.globalAlpha=.55;
  dsc(cx,OUT,bx,cyy,r+1);dsc(cx,dark,bx,cyy,r);dsc(cx,mid,bx-1,cyy-1,r-1.5);dsc(cx,hi,bx-2,cyy-2,Math.max(1,r-3.5));
  dpFill('rgba(0,0,0,.18)',bx-r+1,cyy+r-2,r*2-1,1);
  cx.globalAlpha=1;
}
function drawLampDepth(l,on){
  const lx=Math.round(l.x-camX),ly=Math.round(l.y-camY);if(lx<-10||ly<-20||lx>VW+10||ly>VH+20)return;
  dpFill('rgba(0,0,0,.25)',lx-1,ly+12,3,1);dpFill('#1e2430',lx,ly-1,1,13);dpFill('#5a6578',lx+1,ly,1,12);
  dpFill('#1e2430',lx,ly-1,4,1);dpFill('#1e2430',lx+2,ly,3,2);dpFill(on?'#fff1b8':'#7a8496',lx+3,ly+1,2,1);
}
/* ----- night: a light map with pools under lamps and windows, then a warm glow on top ----- */
let dpLM=null;
function depthLight(n,now){
  if(n<=0)return;
  if(!dpLM||dpLM.width!==VW||dpLM.height!==VH){dpLM=document.createElement('canvas');dpLM.width=VW;dpLM.height=VH}
  const g=dpLM.getContext('2d'),on=Math.min(1,Math.max(0,(n-.05)/.3)),lit=n>.2;
  g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);
  g.fillStyle=`rgba(10,14,40,${Math.min(.7,n*1.35).toFixed(3)})`;g.fillRect(0,0,VW,VH);
  g.globalCompositeOperation='destination-out';
  const hole=(x,y,r,s)=>{if(x<-r||y<-r||x>VW+r||y>VH+r)return;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${s})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  const lamps=DP_LAMPS.map(l=>[l.x-camX+4,l.y-camY+2]).filter(([x,y])=>x>-30&&y>-30&&x<VW+30&&y<VH+30);
  if(on>0)lamps.forEach(([x,y])=>hole(x,y+8,26,.85*on));
  const glowWin=[];
  blocks.forEach(b=>{
    const sx=b.x*TS-camX,sy=b.y*TS-camY;if(sx>VW+30||sy>VH+30||sx<-94||sy<-94)return;
    if(lit){for(let i=0;i<3;i++){const wx=sx+37+i*9,wy=sy+51;hole(wx,wy+6,13,.5);glowWin.push([wx,wy])}hole(sx+24,sy+60,10,.4)}
    if(b.poi&&(b.kind==='casino'||b.kind==='velvet'))hole(sx+32,sy+36,30,.6);
  });
  if(G&&G.p){const px=G.p.x*TS+8-camX,py=G.p.y*TS+8-camY;hole(px,py,20,.5)}
  if(G)G.structs.forEach(s=>{if(s.type==='stall'||s.type==='smoker')hole(s.x*TS-camX+8,s.y*TS-camY+8,14,.45)});
  g.globalCompositeOperation='source-over';
  cx.drawImage(dpLM,0,0);
  /* warm glow, added on top */
  cx.globalCompositeOperation='lighter';
  const glow=(x,y,r,col,a)=>{if(x<-r||y<-r||x>VW+r||y>VH+r)return;const gr=cx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);cx.fillStyle=gr;cx.fillRect(x-r,y-r,r*2,r*2)};
  if(on>0)lamps.forEach(([x,y])=>{glow(x,y,9,'255,210,130',.45*on);glow(x,y+9,20,'255,170,90',.12*on)});
  glowWin.forEach(([x,y])=>glow(x,y+2,7,'255,200,120',.16));
  blocks.forEach(b=>{if(b.poi&&(b.kind==='casino'||b.kind==='velvet')&&lit){const sx=b.x*TS-camX,sy=b.y*TS-camY;glow(sx+32,sy+34,26,'255,80,200',.12+.06*(Math.floor(now/400)%2))}});
  cx.globalCompositeOperation='source-over';
}
/* ----- a little air: haze at the top of the view, a soft vignette at the edges ----- */
let dpAtmo=null;
function depthAtmos(){
  if(!dpAtmo||dpAtmo.width!==VW||dpAtmo.height!==VH){
    dpAtmo=document.createElement('canvas');dpAtmo.width=VW;dpAtmo.height=VH;const g=dpAtmo.getContext('2d');
    let gr=g.createLinearGradient(0,0,0,40);gr.addColorStop(0,'rgba(200,222,245,.12)');gr.addColorStop(1,'rgba(200,222,245,0)');g.fillStyle=gr;g.fillRect(0,0,VW,40);
    gr=g.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.45,VW/2,VH/2,Math.hypot(VW,VH)*.62);gr.addColorStop(0,'rgba(6,8,20,0)');gr.addColorStop(1,'rgba(6,8,20,.28)');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
  }
  cx.drawImage(dpAtmo,0,0);
}
