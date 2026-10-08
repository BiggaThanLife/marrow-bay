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
/* ----- buildings are drawn by drawBlockDepth in buildings.js ----- */
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
    if(lit)bGlows(bKey(b)).forEach(([x,y,r,,a])=>hole(sx+x,sy+y,r*1.2,Math.min(.8,a+.1)));
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
  if(lit)blocks.forEach(b=>{const sx=b.x*TS-camX,sy=b.y*TS-camY;if(sx>VW+40||sy>VH+40||sx<-104||sy<-104)return;bGlows(bKey(b)).forEach(([x,y,r,col,a])=>glow(sx+x,sy+y,r,col,a*.35+.04*(Math.floor(now/400)%2)))});
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
