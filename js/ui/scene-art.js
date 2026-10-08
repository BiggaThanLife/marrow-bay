"use strict";
/* Pixel art for the action scenes. The canvas is 160x80. People are about 33 pixels tall, drawn from shaded parts with a dark outline,
   in your own skin, hair and clothes. Each scene is a function (g,t,p,kit): t is milliseconds since it began, p is 0 to 1. */
const OUT='#151720';
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h)))};
const ln=(g,c,x0,y0,x1,y1,th)=>{th=th||2;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)R(g,c,x0+(x1-x0)*i/n-th/2,y0+(y1-y0)*i/n-th/2,th,th)};
const lerp=(a,b,t)=>a+(b-a)*t;
const rn=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function shade(hex,f){
  const n=parseInt(hex.slice(1),16),r=n>>16,gg=(n>>8)&255,b=n&255,t=f<0?0:255,k=Math.abs(f),m=v=>Math.round(v+(t-v)*k);
  return '#'+((1<<24)+(m(r)<<16)+(m(gg)<<8)+m(b)).toString(16).slice(1);
}
function scLook(){
  const L=(G&&G.look)||{skin:1,hair:0,outfit:'blue',style:0};
  const skin=(typeof SKIN!=='undefined'&&SKIN[L.skin])||'#e0b68a',hair=(typeof HAIR!=='undefined'&&HAIR[L.hair])||'#2b2118';
  const o=(typeof OUTFITS!=='undefined'&&OUTFITS.find(x=>x.id===L.outfit))||{c:'#2f6fb3'};
  return{skin,skinDk:shade(skin,-.22),skinHi:shade(skin,.18),hair,hairHi:shade(hair,.3),cloth:o.c,clothDk:shade(o.c,-.28),clothHi:shade(o.c,.2),style:L.style||0,pants:'#2d3548',boot:'#3a2a22'};
}
/* a look for someone else in a scene: skin, hair and cloth colours and a hair style */
function mkLook(skin,hair,style,cloth){return{skin,skinDk:shade(skin,-.22),skinHi:shade(skin,.18),hair,hairHi:shade(hair,.3),cloth,clothDk:shade(cloth,-.28),clothHi:shade(cloth,.2),style,pants:'#3a3a48',boot:'#2a2a30'}}
/* A person standing with their feet at (x,y). o: d facing (1 right, -1 left), ph walk phase 0-1, crouch pixels,
   fh and bh the front and back hand relative to the shoulder. Returns where the hands, shoulder and head are. */
function figure(g,x,y,o){
  o=o||{};
  const L=o.look||scLook(),d=o.d||1,cr=o.crouch||0,lean=o.lean||0,sw=o.ph==null?0:Math.sin(o.ph*Math.PI*2);
  const X=(dx,w)=>d>0?x+dx:x-dx-w,parts=[],P=(c,dx,dy,w,h)=>parts.push([c,X(dx-(dy<-11?lean:0),w),y+dy,w,h]);
  const lf=Math.round(sw*3),lb=-lf,hip=-11+Math.round(cr*.5),legH=-3-hip;
  const S=[x-d*lean,y-19+cr],fh=o.fh||[2+Math.round(sw*2),9],bh=o.bh||[-2-Math.round(sw*2),9];
  const F=[S[0]+d*fh[0],S[1]+fh[1]],B=[S[0]+d*bh[0],S[1]+bh[1]];
  const hY=-33+cr;
  P(L.pants,-3+lb,hip,3,legH);P(L.boot,-3+lb,-3,4,3);
  P(L.pants,1+lf,hip,3,legH);P(L.boot,1+lf,-3,4,3);
  P(L.cloth,-4,-22+cr,9,11);P(L.clothDk,-4,-22+cr,2,11);P(L.clothHi,1,-21+cr,4,1);
  P('#2b2118',-4,-13+cr,9,2);P('#d8b04a',0,-13+cr,2,2);
  P(L.skinDk,-1,-24+cr,3,3);P(L.skin,-3,-32+cr,8,8);P(L.skinDk,-3,-29+cr,2,3);
  const st=L.style,hc=L.hair,hh=L.hairHi;
  if(st===1){P(hc,-4,hY,9,4);P(hc,-4,hY+3,3,13)}
  else if(st===2){P(hc,-3,hY+1,8,2)}
  else if(st===3){/* bald */}
  else if(st===4){P(hc,-4,hY,9,4);P(hc,-3,hY-3,5,3);P(hc,-4,hY+4,2,2)}
  else if(st===5){P(hc,-4,hY,9,4);P(hc,-6,hY+3,3,9)}
  else if(st===6){P(hc,-4,hY+1,9,3);P(hc,-4,hY-1,3,3);P(hc,-1,hY-2,4,3);P(hc,3,hY-1,3,3)}
  else{P(hc,-4,hY,9,4);P(hc,-4,hY+4,2,3)}
  if(st!==3&&st!==2)P(hh,-2,hY,4,1);
  /* arms: a thick line from the shoulder, sleeve then hand */
  const arm=(H,sleeve,pass)=>{
    if(pass===0){ln(g,OUT,S[0],S[1],H[0],H[1],5);return}
    const mx=lerp(S[0],H[0],.7),my=lerp(S[1],H[1],.7);
    ln(g,sleeve,S[0],S[1],mx,my,3);R(g,L.skin,H[0]-1,H[1]-1,3,3);
  };
  arm(B,0,0);parts.forEach(p=>R(g,OUT,p[1]-1,p[2]-1,p[3]+2,p[4]+2));arm(F,0,0);
  arm(B,L.clothDk,1);parts.forEach(p=>R(g,p[0],p[1],p[2],p[3],p[4]));
  /* the eye, nose and mouth go on after the fills */
  R(g,OUT,X(2-lean,1),y-29+cr,1,2);R(g,L.skin,X(5-lean,1),y-28+cr,1,2);R(g,L.skinDk,X(3-lean,2),y-25+cr,2,1);
  arm(F,L.cloth,1);
  return{F,B,S,head:[x,y-32+cr]};
}
/* ----- props and effects ----- */
function crate(g,x,y,w,h){R(g,OUT,x-1,y-1,w+2,h+2);R(g,'#b8873f',x,y,w,h);R(g,'#8f6429',x,y+Math.floor(h/2),w,1);R(g,'#8f6429',x,y,1,h);R(g,'#8f6429',x+w-1,y,1,h);R(g,'#d6a45a',x+1,y+1,w-2,1);R(g,'#5a3f1a',x+2,y+2,1,1);R(g,'#5a3f1a',x+w-3,y+h-3,1,1)}
function coin(g,x,y){R(g,OUT,x-1,y-1,6,6);R(g,'#f2b84b',x,y,4,4);R(g,'#fff1b0',x,y,2,1);R(g,'#b8841e',x+3,y+3,1,1)}
function cloud(g,x,y,c){R(g,c,x+3,y,10,3);R(g,c,x,y+2,16,3);R(g,c,x+5,y-2,6,3)}
function gull(g,x,y,f){const c='#f4f4f4';R(g,c,x,y,2,1);R(g,c,x+2,y+(f?1:-1),2,1);R(g,c,x-2,y+(f?1:-1),2,1)}
function steam(g,x,y,t,n){for(let i=0;i<n;i++){const ph=((t/700)+i/n)%1;R(g,'rgba(240,244,248,'+(.75*(1-ph)).toFixed(2)+')',x+Math.sin(ph*6+i*2)*3+i*3,y-ph*18,3,3)}}
function sparks(g,x,y,t,t0,n){const dt=(t-t0)/1000;if(dt<0||dt>.45)return;for(let i=0;i<n;i++){const a=-rn(i+5)*3.14,v=24+rn(i)*34;R(g,i%2?'#ffd24a':'#ff8a30',x+Math.cos(a)*v*dt,y+Math.sin(a)*v*dt+dt*dt*70,2,2)}}
function planks(g,y,c1,c2,h){R(g,c1,0,y,160,h);for(let i=0;i<h;i+=7){R(g,c2,0,y+i,160,1);for(let x=(i/7%2)*11;x<160;x+=24)R(g,c2,x,y+i,1,7)}}
function bricks(g,c1,c2,y0,y1){R(g,c1,0,y0,160,y1-y0);for(let y=y0;y<y1;y+=6){R(g,c2,0,y,160,1);for(let x=((y-y0)/6%2)*8;x<160;x+=16)R(g,c2,x,y,1,6)}}
function tiles(g,c1,c2,y0,y1){R(g,c1,0,y0,160,y1-y0);for(let y=y0;y<y1;y+=10)R(g,c2,0,y,160,1);for(let x=0;x<160;x+=10)R(g,c2,x,y0,1,y1-y0)}
function skyline(g,col,lit,y){const b=[[4,14,22],[20,10,30],[32,16,18],[50,12,26],[64,18,20],[86,10,32],[98,14,24],[114,12,28],[130,16,20],[148,12,26]];b.forEach(([x,w,h],i)=>{R(g,col,x,y-h,w,h);for(let k=0;k<6;k++)if(rn(i*7+k)>.45)R(g,lit,x+2+(k%3)*4,y-h+4+Math.floor(k/3)*7,2,3)})}
function sea(g,y0,y1,c1,c2,t){R(g,c1,0,y0,160,y1-y0);for(let y=y0+3;y<y1;y+=5)for(let x=0;x<160;x+=14){const o=(x+y*3+Math.floor(t/160))%14;R(g,c2,(x+o)%160,y,6,1)}}
function disc(g,c,cx,cy,r){for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y));R(g,c,cx-w,cy+y,w*2+1,1)}}
function dialRing(g,cx,cy,r,fill,rim){R(g,rim,cx-r,cy-r,r*2+1,r*2+1);R(g,fill,cx-r+1,cy-r+1,r*2-1,r*2-1)}
/* ----- backgrounds ----- */
function bgHarbor(g,t){
  R(g,'#2d4f6a',0,0,160,14);R(g,'#3f6e8a',0,14,160,12);R(g,'#6a97ac',0,26,160,12);
  skyline(g,'#25384a','#f2d77a',44);
  R(g,'#1f2c3a',112,6,3,40);R(g,'#1f2c3a',112,6,30,3);R(g,'#1f2c3a',139,6,3,14);R(g,'#c24a1a',126,9,2,8);
  sea(g,38,52,'#2f6a86','#5aa0bc',t);
  planks(g,52,'#6e5436','#4a3622',28);R(g,'#4a3622',0,52,160,2);
  const f=Math.floor(t/260)%2;gull(g,30+(t/40)%140,14,f);gull(g,90+(t/55)%120,22,!f);
}
function bgKitchen(g,t){
  tiles(g,'#d6dcdf','#aeb8bd',0,48);R(g,'#8a6a4a',0,46,160,4);
  R(g,'#2c4a60',8,8,26,20);R(g,'#7fb4d4',10,10,22,16);R(g,'#fff',20,10,2,16);R(g,'#fff',10,17,22,2);R(g,'#5a4128',6,6,30,3);
  R(g,'#8a6a4a',48,16,56,3);for(let i=0;i<5;i++){const c=['#c24a3a','#d8b04a','#5a9a4a','#7a6ab0','#d8d8d8'][i];R(g,OUT,50+i*11,9,9,8);R(g,c,51+i*11,10,7,6);R(g,'#8a6a4a',52+i*11,8,5,2)}
  for(let i=0;i<3;i++){R(g,'#4a4f58',112+i*14,6,1,10);R(g,'#b8703a',108+i*14,16,9,6);R(g,'#e0985a',108+i*14,16,9,1);R(g,'#4a4f58',108+i*14,16,9,1)}
  R(g,'#e8e0c8',138,24,9,13);R(g,'#c2b898',138,24,9,2);R(g,'#8a8266',141,28,3,1);R(g,'#8a8266',141,31,3,1);
  R(g,'#5a5f68',0,50,160,30);R(g,'#7a808a',0,50,160,4);R(g,'#3a3d44',0,54,160,1);
}
function bgGarden(g,t){
  R(g,'#8cc4e4',0,0,160,22);R(g,'#b4d9ee',0,22,160,16);R(g,'#f6e8a0',128,6,10,10);R(g,'#fff4b8',130,8,6,6);
  cloud(g,(t/90)%190-30,8,'#f4f8fb');cloud(g,((t/130)+80)%190-30,18,'#e4eef5');
  R(g,'#3f7a3a',0,34,160,14);for(let x=0;x<160;x+=4)R(g,(x/4)%2?'#4a8a44':'#386e34',x,34+((x*7)%3),4,3);
  for(let x=2;x<160;x+=14){R(g,'#e8dcc0',x,38,4,16);R(g,'#c9bd9e',x,38,1,16);R(g,'#e8dcc0',x-1,37,6,2)}R(g,'#e8dcc0',0,42,160,2);R(g,'#e8dcc0',0,48,160,2);
  for(let x=6;x<160;x+=9)R(g,['#e85a7a','#f2c84a','#ffffff','#b07ad8'][(x/9|0)%4],x,51+(x%2),2,2);
  R(g,'#6a4a2a',0,54,160,26);for(let y=58;y<80;y+=6)R(g,'#553a1f',0,y,160,2);
}
function bgWorkshop(g,t){
  R(g,'#434a54',0,0,160,52);for(let y=4;y<52;y+=6)for(let x=3;x<160;x+=6)R(g,'#363c45',x,y,1,1);
  R(g,'#2c4a60',112,8,32,22);R(g,'#7fb4d4',114,10,28,18);R(g,'#fff',127,10,2,18);
  [['#c24a3a',14],['#d8b04a',26],['#9aa0a6',38],['#5a9a4a',50]].forEach(([c,x])=>{R(g,'#2b2f36',x,8,9,18);R(g,c,x+1,9,7,6);R(g,'#c9ced3',x+3,16,3,9)});
  R(g,'#6a4a2a',0,50,160,6);R(g,'#8a6a4a',0,50,160,2);R(g,'#4a3722',4,56,5,24);R(g,'#4a3722',150,56,5,24);
  R(g,'#8a8f96',0,60,160,20);for(let x=0;x<160;x+=20)R(g,'#6a7078',x,60,1,20);R(g,'#6a7078',0,70,160,1);
}
function bgForge(g,t){
  bricks(g,'#4a302c','#2b1a18',0,56);
  const fl=Math.floor(t/110)%3;
  R(g,'#1a1210',100,16,40,34);R(g,fl?'#e0561c':'#c24a1a',104,22,32,28);R(g,'#ff9a30',110,30,20,20);R(g,fl==1?'#ffd24a':'#ffc040',116,38,8,12);
  R(g,'#2b2f36',96,12,48,6);R(g,'#2b2f36',112,0,16,14);
  R(g,'rgba(255,120,40,'+(.12+fl*.04)+')',0,0,160,80);
  R(g,'#555a62',0,56,160,24);for(let y=56;y<80;y+=8)R(g,'#3d4046',0,y,160,1);for(let x=0;x<160;x+=22)R(g,'#3d4046',x,56,1,24);
}
function bgBedroom(g,t,clinic){
  R(g,clinic?'#cfd8dc':'#1c2438',0,0,160,52);if(!clinic)for(let x=0;x<160;x+=8)R(g,'#18202f',x,0,3,52);
  R(g,'#10182a',104,8,40,28);R(g,'#5a4128',102,6,44,3);R(g,'#5a4128',102,34,44,3);R(g,'#5a4128',102,6,3,31);R(g,'#5a4128',143,6,3,31);
  for(let i=0;i<8;i++)R(g,((t/260+i)%3)<1.6?'#fff':'#7a88aa',108+(i*5)%32,12+(i*7)%18,1,1);
  disc(g,'#ece8cc',128,20,6);disc(g,'#10182a',131,18,6);
  R(g,clinic?'#8a6a4a':'#2b3350',0,52,160,28);for(let x=0;x<160;x+=16)R(g,clinic?'#6a4a2a':'#222a42',x,52,1,28);
  if(clinic){R(g,'#e8eef0',10,10,24,24);R(g,'#d33a2c',20,13,4,18);R(g,'#d33a2c',13,20,18,4)}
}
function bgPier(g,t){
  R(g,'#f2c98a',0,0,160,10);R(g,'#f6d8a0',0,10,160,12);R(g,'#bcd9e4',0,22,160,14);
  R(g,'#fff1b8',112,14,12,12);R(g,'#ffe08a',114,16,8,8);
  sea(g,36,80,'#3a7c98','#7fb8d0',t);
  for(let i=0;i<4;i++)R(g,'rgba(255,240,180,.6)',112+i*2-((t/200)%3),38+i*6,10-i*2,1);
  planks(g,56,'#6e5436','#4a3622',24);R(g,'#4a3622',0,54,160,3);
  for(let x=4;x<160;x+=40){R(g,'#4a3622',x,46,3,12)}
}
function bgBar(g,t){
  R(g,'#2a1f26',0,0,160,52);for(let x=0;x<160;x+=10)R(g,'#33252d',x,0,4,52);
  R(g,'#5a4128',10,14,140,3);R(g,'#5a4128',10,28,140,3);
  for(let i=0;i<12;i++){const c=['#5a9a4a','#c24a3a','#d8b04a','#7a6ab0'][i%4];R(g,OUT,14+i*11,5,6,9);R(g,c,15+i*11,6,4,7);R(g,'#8a6a4a',16+i*11,3,2,3);R(g,OUT,14+i*11,19,6,9);R(g,c,15+i*11,20,4,7)}
  R(g,'#e8c96a',60,0,8,3);R(g,'rgba(255,220,120,.14)',0,0,160,52);
  R(g,'#6a4a2a',0,52,160,28);R(g,'#8a6a4a',0,52,160,4);R(g,'#4a3722',0,58,160,1);
}
function bgHearth(g,t){
  R(g,'#5a4a3c',0,0,160,52);for(let y=4;y<52;y+=8)R(g,'#4a3c30',0,y,160,1);
  bricks(g,'#6f6258','#4a3f38',6,50);R(g,'#2a2120',96,22,46,28);R(g,'#1a1412',100,26,38,24);
  const fl=Math.floor(t/100)%3;R(g,'#e0561c',108,40,22,10);R(g,'#ff9a30',112,36+(fl%2),14,14);R(g,'#ffd24a',117,40,5,10);
  R(g,'#8a8f96',96,18,46,5);R(g,'#3a3d44',116,8,2,14);
  R(g,'rgba(255,140,50,'+(.1+fl*.03)+')',0,0,160,80);
  planks(g,52,'#6e5436','#4a3622',28);
  R(g,'#8a6a4a',8,40,40,4);R(g,'#8a6a4a',12,44,3,10);R(g,'#8a6a4a',41,44,3,10);
}
/* ----- the scenes ----- */
/* Side-on scenes (a whole person seen from the side) are drawn here. First-person and over-the-shoulder scenes live in scene-views.js. */
const viewDraw=(type,kit,g,t,p)=>{const k=typeof SCENE_KITS!=='undefined'&&SCENE_KITS[type+':'+(kit||'')];if(k){k(g,t,p);return true}return false};
const SCENE_DRAW={
  work(g,t,p,kit){
    if(viewDraw('work',kit,g,t,p))return;
    if(kit==='crate'){
      /* walk in with a crate held up in front of the chest, lower it onto the stack, dust, straighten up */
      bgHarbor(g,t);
      for(let i=0;i<3;i++)crate(g,5+i*12,57,11,9);for(let i=0;i<2;i++)crate(g,11+i*12,48,11,9);crate(g,17,39,11,9);
      crate(g,106,57,11,9);crate(g,118,57,11,9);crate(g,112,48,11,9);
      const walk=seg(p,0,.55),stop=ease(seg(p,.55,.72)),placed=p>=.72,stand=ease(seg(p,.8,1));
      const x=lerp(14,100,walk),moving=p<.55,ph=(t/380)%1;
      const crouch=Math.round(stop*4*(1-stand)),lean=p<.72?(moving?2:Math.round(2*(1-stop))):0;
      const fh=p<.55?[7,4]:p<.8?[lerp(7,15,stop),lerp(4,-3,stop)]:[lerp(15,4,stand),lerp(-3,10,stand)];
      const bh=p<.8?[lerp(5,13,stop),lerp(5,-1,stop)]:[lerp(13,-2,stand),lerp(-1,9,stand)];
      const f=figure(g,x,66,{d:1,ph:moving?ph:null,crouch,lean,fh,bh});
      if(!placed)crate(g,f.F[0]-3,f.F[1]-6+(moving?Math.round(Math.sin(t/190)):0),12,9);
      else crate(g,112,39,11,9);
      if(p>=.72&&p<.82)puff(g,117,43,seg(p,.72,.82),'210,190,150');
      if(p>=.72&&p<.8)glint(g,124,42,seg(p,.72,.8));
      return;
    }
    /* rake: three pulls that leave furrows, then lean on it for a breath */
    bgGarden(g,t);
    const raking=p<.76,s=p/.76*3,idx=Math.min(2,Math.floor(s)),v=s%1;
    const pull=raking?(v<.7?ease(v/.7):1-ease((v-.7)/.3)):0,hasPull=raking&&v<.7;
    for(let i=0;i<3;i++){const full=!raking||i<idx,len=full?34:(i===idx?Math.round(34*(hasPull?pull:1)):0);if(len>0){R(g,'#3f2a14',58+(i===idx&&!full?34-len:0),60+i*5,len,1);R(g,'#8a6a42',58+(i===idx&&!full?34-len:0),61+i*5,len,1)}}
    if(raking){
      const f=figure(g,38,68,{d:1,fh:[lerp(14,7,pull),7],bh:[lerp(10,4,pull),4]});
      const hx=f.F[0]+10,hy=70;ln(g,OUT,f.B[0],f.B[1],hx,hy,4);ln(g,'#8a6430',f.B[0],f.B[1],hx,hy,2);
      R(g,OUT,hx-1,hy-1,13,4);R(g,'#c9ced3',hx,hy,11,2);for(let i=0;i<4;i++)R(g,'#c9ced3',hx+i*3,hy+2,1,3);
      if(hasPull)for(let i=0;i<5;i++){const q=(pull+i*.2)%1;R(g,i%2?'#7a5a38':'#7ac46a',hx+4+i*2-q*6,hy-2-q*(6+i*2),2,2)}
    }else{
      const k=ease(seg(p,.76,.84)),f=figure(g,44,68,{d:1,fh:[9,5],bh:[8,6],crouch:0});
      ln(g,OUT,f.F[0]+1,f.F[1],f.F[0]+1,70,4);ln(g,'#8a6430',f.F[0]+1,f.F[1],f.F[0]+1,70,2);
      R(g,OUT,f.F[0]-5,70-1,13,4);R(g,'#c9ced3',f.F[0]-4,70,11,2);
      for(let i=0;i<3;i++)R(g,'#7ac46a',66+i*5,68-i%2,2,2);
      if(k>.5&&p<.95)R(g,'#9ad8ff',f.head[0]+5,f.head[1]+((t/90)%6),1,2);
    }
  },
  cash(g,t,p,kit){viewDraw('cash',kit,g,t,p)},
  rest(g,t,p,kit){
    if(viewDraw('rest',kit,g,t,p))return;
    /* walk to the bed, sit on the edge, lie down, pull the blanket up, lamp off, the clock races, morning */
    bgBedroom(g,t,false);
    const L=scLook(),lying=p>=.3,lampOn=p<.42;
    R(g,OUT,36,41,80,22);R(g,'#6a4a2a',37,42,78,4);R(g,'#4a3320',37,56,5,12);R(g,'#4a3320',110,56,5,12);R(g,'#4a3320',37,36,5,24);R(g,'#e8e8f0',42,40,22,8);R(g,'#c8c8d8',42,46,22,2);
    const bx=Math.round(lerp(92,56,ease(seg(p,.3,.44))));
    R(g,L.cloth,bx,43,114-bx,12);R(g,L.clothDk,bx,52,114-bx,3);R(g,L.clothHi,bx,43,114-bx,2);for(let x=bx+8;x<112;x+=12)R(g,L.clothDk,x,45,1,8);
    if(lying){R(g,L.skin,48,36,10,9);R(g,L.skinDk,48,40,2,4);R(g,L.hair,48,34,10,5);R(g,L.hairHi,50,34,4,1);R(g,OUT,54,39,2,1)}
    R(g,'#5a4128',120,48,16,3);R(g,'#4a3722',122,51,3,14);R(g,'#4a3722',131,51,3,14);
    R(g,'#d8b04a',124,36,8,12);if(lampOn){R(g,'#f6e08a',125,37,6,4);R(g,'rgba(255,220,120,.2)',112,26,40,30)}else R(g,'#6a5a2a',125,37,6,4);
    if(p<.3){const w=p<.2,k=seg(p,0,.2);figure(g,w?lerp(4,28,k):28,68,{d:1,ph:w?(t/380)%1:null,crouch:w?0:Math.round(ease(seg(p,.2,.3))*7),fh:w?null:[5,12],bh:w?null:[3,12]})}
    if(p>=.5)for(let i=0;i<3;i++){const zy=((t/110+i*14)%46);if(zy<34){const a=(1-zy/36).toFixed(2),zx=62+i*8+Math.sin(t/220+i)*2,y=34-zy*.6,s=4+i,c='rgba(230,238,255,'+a+')';R(g,c,zx,y,s,1);R(g,c,zx+s-1,y+1,1,1);R(g,c,zx+1,y+2,1,1);R(g,c,zx,y+3,s,1)}}
    dialRing(g,20,22,9,'#f4f2e8','#151720');const a=p>=.42?t/60:0;for(let k=1;k<8;k++)R(g,'#151720',20+Math.round(Math.cos(a)*k),22+Math.round(Math.sin(a)*k),1,1);for(let k=1;k<5;k++)R(g,'#c24a3a',20+Math.round(Math.cos(a/12)*k),22+Math.round(Math.sin(a/12)*k),1,1);
    const night=ease(seg(p,.42,.55))*(1-ease(seg(p,.8,.94)));R(g,'rgba(0,0,12,'+(.55*night).toFixed(2)+')',0,0,160,80);
    const morn=ease(seg(p,.88,1));if(morn>0)R(g,'rgba(255,200,120,'+(.16*morn).toFixed(2)+')',0,0,160,80);
  },
  nature(g,t,p,kit){
    if(viewDraw('nature',kit,g,t,p))return;
    /* fishing: wait, dip, rise, plunge, YANK, the fish leaps, splash */
    bgPier(g,t);
    const yank=p>.5&&p<.66,f=figure(g,30,66,{d:1,fh:[10,yank?-9:-3],bh:[5,yank?-3:3]});
    const tipx=f.F[0]+22,tipy=f.F[1]-22-(yank?5:0);ln(g,'#8a6430',f.F[0],f.F[1],tipx,tipy,2);
    const bx=104,sub=p>=.38;let by=42+Math.round(Math.sin(t/260)*(p<.2?1:0));
    if(p>=.2&&p<.3)by=42+Math.round(ease(seg(p,.2,.3))*3);else if(p>=.3&&p<.38)by=45-Math.round(ease(seg(p,.3,.38))*3);else if(p>=.38)by=42+Math.round(ease(seg(p,.38,.5))*10);
    const jump=seg(p,.52,.92),fx=lerp(104,58,jump),fy=46-Math.sin(jump*Math.PI)*34;
    if(p<.52){ln(g,'#e8e8e8',tipx,tipy,bx,Math.min(by,46),1);if(by<48){R(g,OUT,bx-2,by-2,5,5);R(g,'#e8e8e8',bx-1,by-1,3,3);R(g,'#d33a2c',bx-1,by-1,3,2)}}
    else if(p<.92)ln(g,'#e8e8e8',tipx,tipy,fx+5,fy+2,1);
    for(let i=0;i<3;i++){const r=sub&&p<.52?3+i*3+((t/80)%3):0;if(r)R(g,'rgba(255,255,255,'+(.5-i*.15)+')',bx-r,44+i,r*2,1)}
    if(p>=.52&&p<.92){R(g,OUT,fx-1,fy-1,13,8);R(g,'#b8c4cc',fx,fy,11,6);R(g,'#e8eef2',fx+1,fy+3,7,2);R(g,'#6a7a88',fx+9,fy+1,4,4);R(g,OUT,fx+2,fy+1,1,1);R(g,'#8a9aa8',fx,fy,6,1)}
    const dur=SCENE_MS.nature;
    burst(g,104,44,(p-.52)*dur/1000,9,['#fff','#cfe8f4'],36);burst(g,58,44,(p-.92)*dur/1000,9,['#fff','#cfe8f4'],30);
    if(p>=.92){const k=(p-.92)/.08;for(let i=0;i<2;i++)R(g,'rgba(255,255,255,'+(.6-i*.2)+')',58-4-i*4-k*4,44+i,8+i*8+k*8,1)}
  },
  eat(g,t,p,kit){viewDraw('eat',kit,g,t,p)}
};
