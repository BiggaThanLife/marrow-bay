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
