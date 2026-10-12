"use strict";
/* Finer art. The map canvas has RS (2) real pixels for every map unit, so shapes here are laid out in HALF units: one step of x or y below is one real pixel.
   d(x,y,w,h,col) draws a w by h block with its corner x,y half-units from the anchor (px,py). Older art stays in whole units and is not touched. */
/* a colour made lighter or darker by f, kept inside 0 to 255 per channel */
function tone(hex,f){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+((1<<24)+(c(n>>16&255)<<16)+(c(n>>8&255)<<8)+c(n&255)).toString(16).slice(1)}
function drawCarHD(px,py,k,c,sp){
  const d=(x,y,w,h,col)=>{cx.fillStyle=col;cx.fillRect(px+x/2,py+y/2,w/2,h/2)};
  const hi=tone(c[0],1.32),mid=c[0],lo=c[1],ds=tone(c[1],.68),coupe=k==='coupe';
  /* shadow on the road */
  d(-18,0,38,3,'rgba(0,0,0,.26)');d(-14,3,30,1,'rgba(0,0,0,.16)');
  /* cabin: a stepped roof, then glass */
  const rows=coupe?[[-4,3],[-6,5],[-7,6],[-8,7],[-9,8],[-9,8],[-9,8],[-9,8],[-9,8]]:[[-6,6],[-8,8],[-9,9],[-10,10],[-10,10],[-10,10],[-10,10],[-10,10],[-10,10],[-10,10],[-10,10],[-10,10]];
  const top=coupe?-25:-28;
  rows.forEach((r,i)=>d(r[0],top+i,r[1]-r[0]+1,1,i===0?hi:lo));
  const gy=top+2,gh=coupe?5:7,x0=coupe?-7:-8,w0=coupe?6:7,x1=coupe?2:2,w1=coupe?6:7;
  d(x0,gy,w0,gh,'#bfe3f0');d(x1,gy,w1,gh,'#bfe3f0');
  d(x0,gy,1,1,'#f1fbff');d(x0+1,gy+1,1,1,'#f1fbff');d(x1,gy,1,1,'#f1fbff');d(x1+1,gy+1,1,1,'#f1fbff');
  d(-1,gy,2,gh,lo);
  /* body */
  d(-17,-17,35,1,hi);d(-19,-16,39,10,mid);d(-19,-16,39,1,hi);d(-19,-8,39,2,lo);d(-18,-6,37,1,ds);
  d(-1,-15,1,7,lo);d(-6,-12,3,1,hi);d(3,-12,3,1,hi);
  if(coupe){d(-17,-12,35,1,'rgba(255,255,255,.4)');d(-19,-21,7,1,lo);d(-18,-20,1,3,lo);d(-14,-20,1,3,lo)}
  /* lights and bumpers */
  d(17,-14,3,3,coupe?'#fff0b0':'#ffe08a');d(-19,-14,2,3,'#c42b2b');d(-19,-9,2,1,'#8b9098');d(18,-9,2,1,'#8b9098');
  /* wheels: round tyre, hub and a spoke that turns when moving */
  [-13,5].forEach(x=>{
    d(x+2,-6,4,1,'#14161b');d(x+1,-5,6,1,'#14161b');d(x,-4,8,4,'#14161b');d(x+1,0,6,1,'#14161b');d(x+2,1,4,1,'#14161b');
    d(x+2,-3,4,3,'#8e97a2');d(x+3,-2,2,1,'#4a515b');d(x+2+sp*2,-3,2,1,'#d5dbe2');
  });

}

/* ===== Buildings at half-unit detail. The shared parts (wall, window, door, awning, roof) are redrawn finer; positions and sizes match the older versions, so
   every building keeps its layout. bF takes fractional units (RS makes a half unit one real pixel). Called from buildings.js when RS>=2. ===== */
const hdn=(x,y)=>Math.abs(hash(Math.round(x),Math.round(y)));
function bWinHD(x,y,w,h,lit,tint){
  bF('rgba(0,0,0,.5)',x-1,y-1,w+2,h+2);
  bF(lit?'#9a7a3a':'#7d858e',x,y,w,h);
  const g=tint||'#2c3440',gx=x+.5,gy=y+.5,gw=w-1,gh=h-1;
  if(lit){bF('#e3ae55',gx,gy,gw,gh);bF('#ffd88a',gx,gy,gw,Math.max(.5,Math.floor(gh)/2));bF('#fff3c8',gx,gy,gw,.5);if(gw>=3)bF('rgba(120,60,20,.28)',gx+gw-1,gy+1,.5,gh-1)}
  else{bF(g,gx,gy,gw,gh);bF(tone(g,1.35),gx,gy,gw,Math.max(.5,Math.floor(gh)/2));
    for(let k=0;k<Math.min(gw,gh)*2-1&&k<6;k++)bF('rgba(255,255,255,.2)',gx+.5+k*.5,gy+gh-1-k*.5,.5,.5)}
  if(w>=6)bF('rgba(0,0,0,.42)',x+w/2-.25,gy,.5,gh);
  if(h>=8)bF('rgba(0,0,0,.42)',gx,y+h/2-.25,gw,.5);
  bF('rgba(255,255,255,.34)',x-1,y+h,w+2,.5);bF('rgba(0,0,0,.35)',x-1,y+h+.5,w+2,.5);bF('rgba(0,0,0,.3)',x-.5,y-.5,w+1,.5);
}
/* the wall's material; returns false for materials still drawn the older way */
function bWallHD(k,c,sx,eave,base,ww,L){
  const y0=eave+3,yb=base-2,R=L+ww;
  if(k==='stone'||k==='brick'||k==='wood'){
    const rh=k==='stone'?5:3,bw=k==='stone'?10:k==='brick'?6:12;
    for(let r=0,yy=y0;yy<yb;r++,yy+=rh){
      const h=Math.min(rh,yb-yy),off=(r%2)*(bw/2);
      for(let x=L+off-bw;x<R;x+=bw){
        const bx=Math.max(L,x),bwid=Math.min(x+bw,R)-bx;if(bwid<=0)continue;
        const v=(hdn(x,yy)%7-3)/70;
        if(v>0)bF(`rgba(255,255,255,${v.toFixed(3)})`,bx,yy,bwid,h);else if(v<0)bF(`rgba(0,0,0,${(-v).toFixed(3)})`,bx,yy,bwid,h);
        bF('rgba(255,255,255,.16)',bx,yy,bwid,.5);
        if(k!=='wood'){bF('rgba(0,0,0,.2)',bx,yy+h-.5,bwid,.5);if(x+bw<=R)bF('rgba(0,0,0,.16)',x+bw-.5,yy,.5,h)}
        else{bF('rgba(0,0,0,.26)',bx,yy+h-.5,bwid,.5);if(hdn(x,yy+1)%4===0)bF('rgba(0,0,0,.13)',bx+1.5,yy+1.5,3,.5);if(x>L&&x<R)bF('rgba(0,0,0,.18)',x,yy,.5,h)}
      }
    }
    return true;
  }
  if(k==='metal'){
    for(let x=L;x<R;x+=3){bF('rgba(0,0,0,.2)',x,y0,.5,yb-y0);bF('rgba(255,255,255,.14)',x+1,y0,.5,yb-y0);bF('rgba(0,0,0,.07)',x+2,y0,1,yb-y0);
      if(hdn(x,7)%5===0)bF('rgba(120,60,20,.2)',x+.5,y0+(hdn(x,3)%6),1,3+hdn(x,5)%5)}
    return true;
  }
  if(k==='plaster'||k==='concrete'||!k){
    if(k==='concrete')for(let x=L+15;x<R;x+=16)bF('rgba(0,0,0,.12)',x,y0,.5,yb-y0);
    for(let y=y0;y<yb;y++)for(let x=L;x<R;x++){const n=hdn(x,y);
      if(n%11===0)bF('rgba(255,255,255,.07)',x+(n>>4&1)*.5,y+(n>>5&1)*.5,.5,.5);
      else if(n%11===1)bF('rgba(0,0,0,.07)',x+(n>>4&1)*.5,y+(n>>5&1)*.5,.5,.5)}
    bF('rgba(0,0,0,.1)',L,yb-3,ww,1);
    return true;
  }
  return false;
}
function bDoorHD(k,sx,sy,base,lit,c){
  const dx=sx+TS+3,dy=sy+52,panel=(x,y,w,h,col)=>{bF(col,x,y,w,h);bF('rgba(255,255,255,.2)',x,y,w,.5);bF('rgba(0,0,0,.32)',x,y+h-.5,w,.5)};
  if(k==='double'){
    bF('rgba(0,0,0,.55)',dx-3,dy-3,16,13);bF('#2a1a0e',dx-2,dy-2,14,12);bF('#c9a864',dx-2,dy-2,14,.5);
    for(const lx of [dx-1,dx+6]){bF('#5a3a20',lx,dy-1,5,10);panel(lx+.5,dy-.5,4,4,'#6a4628');panel(lx+.5,dy+4,4,5,'#6a4628')}
    bF('#d8b04a',dx+3.5,dy+4,1,1.5);bF('#d8b04a',dx+6,dy+4,1,1.5);bF('#fff1b0',dx+3.5,dy+4,.5,.5);bF('#fff1b0',dx+6,dy+4,.5,.5);
    bF('rgba(255,255,255,.28)',dx-4,base-1,18,.5);bF('rgba(0,0,0,.3)',dx-4,base-.5,18,.5);
  }else if(k==='steel'){
    bF('rgba(0,0,0,.6)',dx-2,dy-2,14,12);bF('#6a7078',dx-1,dy-1,12,11);
    for(let i=0;i<8;i++)bF(i%2?'#2a2e34':'#d8b04a',dx-1+i*1.5,dy-1,1.5,1.5);
    bF('#8a9098',dx-1,dy+.5,12,.5);bF('rgba(0,0,0,.3)',dx-1,dy+9.5,12,.5);
    for(const [x,y] of [[-.5,2],[9.5,2],[-.5,8.5],[9.5,8.5]])bF('#3a3e44',dx+x,dy+y,.5,.5);
    bF('#1e2128',dx+3,dy+3,4,2);bF('#c9ced3',dx+2.5,dy+6.5,5,.5);
  }else{
    bF('rgba(0,0,0,.55)',dx-1,dy-1,12,11);bF('#1e130b',dx,dy,10,10);bF('#3a2616',dx+.5,dy+.5,9,9.5);
    panel(dx+1.5,dy+1.5,7,3,'#4a331f');panel(dx+1.5,dy+5.5,7,3.5,'#4a331f');
    bF('#d8b04a',dx+7,dy+5,1,1);bF('#fff1b0',dx+7,dy+5,.5,.5);
    bF('rgba(255,255,255,.2)',dx,dy-1,10,.5);bF('rgba(255,255,255,.28)',dx-2,base-1,14,.5);bF('rgba(0,0,0,.3)',dx-2,base-.5,14,.5);
  }
  if(lit)bF('rgba(255,216,138,.2)',dx,dy+1,10,8);
}
function bAwningHD(c,sx,sy){
  const dx=sx+TS+3,dy=sy+52;
  for(let i=0;i<5;i++){
    const x=dx-4+i*4,col=i%2?'#f4efe2':c[0];
    bF(col,x,dy-5,4,3);bF('rgba(255,255,255,.28)',x,dy-5,4,.5);bF('rgba(0,0,0,.14)',x+3.5,dy-5,.5,3);
    bF(col,x+.5,dy-2,3,.5);bF('rgba(0,0,0,.2)',x+.5,dy-1.5,3,.5);
  }
  bF('rgba(0,0,0,.3)',dx-4,dy-1,20,1);bF('rgba(0,0,0,.12)',dx-4,dy,20,.5);
}
/* roof surface: shingles, standing seams, gravel */
function bRoofHD(k,sx,sy,L,ww,top,eave,c,hs){
  if(k==='pitched'||k==='slate'){
    for(let r=0,yy=top+1;yy<eave-1;r++,yy+=2){
      const off=(r%2)*1.5;
      for(let x=L+off-3;x<L+ww;x+=3){const bx=Math.max(L,x);
        bF('rgba(0,0,0,.14)',bx,yy,.5,1.5);
        const n=hdn(x,yy);if(n%5===0)bF('rgba(255,255,255,.06)',bx,yy,Math.min(3,L+ww-bx),1.5);else if(n%5===1)bF('rgba(0,0,0,.06)',bx,yy,Math.min(3,L+ww-bx),1.5)}
      bF('rgba(0,0,0,.16)',L,yy+1.5,ww,.5);bF('rgba(255,255,255,.07)',L,yy,ww,.5);
    }
  }else if(k==='metal'){
    for(let x=L+1;x<L+ww;x+=3){bF('rgba(255,255,255,.2)',x+1,top,.5,eave-top);bF('rgba(0,0,0,.08)',x+1.5,top,.5,eave-top)}
    for(let y=top+4;y<eave-2;y+=7)bF('rgba(0,0,0,.14)',L,y,ww,.5);
  }else if(k==='flat'){
    for(let y=top+2;y<eave-1;y++)for(let x=L+1;x<L+ww-1;x++){const n=hdn(x,y);if(n%13===0)bF('rgba(255,255,255,.1)',x+(n>>4&1)*.5,y+(n>>5&1)*.5,.5,.5);else if(n%13===1)bF('rgba(0,0,0,.1)',x+(n>>4&1)*.5,y+(n>>5&1)*.5,.5,.5)}
    bF('rgba(0,0,0,.14)',L+2,top+2,ww-4,.5);bF('rgba(255,255,255,.16)',L+2,eave-3,ww-4,.5);
  }
}
