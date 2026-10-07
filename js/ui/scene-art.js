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
  const L=o.look||scLook(),d=o.d||1,cr=o.crouch||0,sw=o.ph==null?0:Math.sin(o.ph*Math.PI*2);
  const X=(dx,w)=>d>0?x+dx:x-dx-w,parts=[],P=(c,dx,dy,w,h)=>parts.push([c,X(dx,w),y+dy,w,h]);
  const lf=Math.round(sw*3),lb=-lf,hip=-11+Math.round(cr*.5),legH=-3-hip;
  const S=[x,y-19+cr],fh=o.fh||[2+Math.round(sw*2),9],bh=o.bh||[-2-Math.round(sw*2),9];
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
  R(g,OUT,X(2,1),y-29+cr,1,2);R(g,L.skin,X(5,1),y-28+cr,1,2);R(g,L.skinDk,X(3,2),y-25+cr,2,1);
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
  for(let i=0;i<3;i++){R(g,'#4a4f58',112+i*14,6,1,10);R(g,'#7a808a',108+i*14,16,9,6);R(g,'#4a4f58',108+i*14,16,9,1)}
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
function bgSea(g,t,day){
  R(g,day?'#8cc4e4':'#2d4f6a',0,0,160,26);R(g,day?'#b4d9ee':'#3f6e8a',0,26,160,12);
  disc(g,'#f6e8a0',22,14,6);disc(g,'#fff4b8',22,14,4);
  R(g,'#5a7a6a',104,30,30,8);R(g,'#4a6a5a',112,26,14,6);
  sea(g,38,80,'#2f6a86','#5aa0bc',t);for(let y=44;y<80;y+=9)for(let x=0;x<160;x+=22){const o=(x*3+y+Math.floor(t/90))%22;R(g,'#7fb8d0',(x+o)%160,y,8,1)}
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
const SCENE_DRAW={
  work(g,t,p,kit){
    if(kit==='crate'){
      bgHarbor(g,t);
      for(let i=0;i<3;i++)crate(g,5+i*12,57,11,9);for(let i=0;i<2;i++)crate(g,11+i*12,48,11,9);crate(g,17,39,11,9);
      const slots=[[114,57],[127,57],[140,57],[120,48],[133,48],[127,39]],n=Math.floor(p*7);for(let i=0;i<Math.min(n,6);i++)crate(g,slots[i][0],slots[i][1],11,9);
      const cyc=(t%1800)/1800,out=cyc<.5,u=out?cyc*2:(cyc-.5)*2,x=out?lerp(36,112,u):lerp(112,36,u);
      const ph=(t/420)%1,d=out?1:-1,f=figure(g,x,66,{d,ph,fh:out?[7,4]:null,bh:out?[5,5]:null});
      if(out)crate(g,d>0?f.F[0]-3:f.F[0]-9,f.F[1]-6,12,9);
      return;
    }
    if(kit==='pan'){
      bgKitchen(g,t);
      const toss=Math.sin(t/230),up=toss>.2;
      const f=figure(g,44,68,{d:1,fh:[10,2+Math.round(toss*2)],bh:[4,8]});
      const px=f.F[0]+8,py=f.F[1]-2;R(g,OUT,px-1,py-1,22,7);R(g,'#2a2e34',px,py,20,5);R(g,'#4a4f58',px,py,20,1);ln(g,'#3a3d44',f.F[0],f.F[1],px,py+2,2);
      for(let i=0;i<4;i++){const ph=((t/520)+i*.25)%1,fx=px+3+i*4,fy=py-ph*14-Math.sin(ph*3.14)*6;R(g,['#c4813a','#d8a04c','#7ac46a','#e8e0a0'][i],fx,fy,3,3)}
      R(g,'#6a708a',px-4,py+10,30,8);R(g,'#ff9a30',px+2,py+7,4,3);R(g,'#ffd24a',px+8,py+8,3,2);R(g,'#ff9a30',px+14,py+7,4,3);
      steam(g,px+8,py-4,t,4);
      return;
    }
    if(kit==='rake'){
      bgGarden(g,t);
      const n=Math.floor(p*12);for(let i=0;i<n;i++){const x=70+i*7,y=62+(i%3)*3;R(g,'#4a8a3a',x,y-4,1,5);R(g,'#7ac46a',x-2,y-5,3,2);R(g,'#7ac46a',x+1,y-6,3,2)}
      const sw=Math.sin(t/260),f=figure(g,40,68,{d:1,fh:[8+Math.round(sw*3),7+Math.round(sw*2)],bh:[4+Math.round(sw*2),4]});
      const hx=f.F[0]+Math.round(sw*3),hy=f.F[1];ln(g,'#8a6430',f.B[0],f.B[1],hx+10,70,2);R(g,'#c9ced3',hx+8,70,10,2);for(let i=0;i<4;i++)R(g,'#c9ced3',hx+8+i*3,72,1,2);
      return;
    }
    if(kit==='spanner'){
      bgWorkshop(g,t);
      R(g,OUT,92,34,34,22);R(g,'#7a8088',93,35,32,20);R(g,'#5a6068',96,38,26,14);R(g,'#9aa0a6',96,38,26,2);
      for(let i=0;i<3;i++){R(g,'#4a4f58',99+i*8,26,6,9);R(g,'#8a8f96',99+i*8,26,6,2)}
      R(g,'#c9ced3',106,42,8,8);R(g,'#2a2e34',108,44,4,4);
      const sw=Math.floor(t/180)%2,f=figure(g,72,68,{d:1,fh:[9,sw?-2:4],bh:[4,9]});
      ln(g,OUT,110,46,f.F[0],f.F[1],5);ln(g,'#aeb4ba',110,46,f.F[0],f.F[1],3);R(g,OUT,105,41,11,11);R(g,'#c9ced3',106,42,9,9);R(g,'#2a2e34',108,44,5,5);R(g,'#aeb4ba',108,44,5,5);R(g,'#2a2e34',109,45,3,3);
      if(sw){R(g,'#ffd24a',118,38,2,2);R(g,'#ff8a30',122,34,2,2);R(g,'#ffd24a',114,32,1,1)}
      R(g,'#c24a3a',136,46,8,6);R(g,'#7a2a1a',136,46,8,1);
      return;
    }
    /* forge */
    bgForge(g,t);
    R(g,OUT,66,52,40,16);R(g,'#3a3d44',67,53,38,14);R(g,OUT,60,44,52,9);R(g,'#5a5f68',61,45,50,7);R(g,'#7a808a',61,45,50,2);
    const cyc=(t%700)/700,hit=cyc>.62,f=figure(g,40,68,{d:1,fh:hit?[10,6]:[7,-12],bh:[5,2]});
    R(g,'#e0561c',68,41,26,4);R(g,'#ffb040',70,41,22,2);
    ln(g,'#8a6430',f.F[0],f.F[1],f.F[0]+(hit?16:10),f.F[1]+(hit?-6:-14),2);R(g,OUT,f.F[0]+(hit?12:6),f.F[1]+(hit?-12:-20),12,8);R(g,'#8a8f96',f.F[0]+(hit?13:7),f.F[1]+(hit?-11:-19),10,6);
    if(hit)sparks(g,84,42,t%700,.62*700,10);
  },
  cash(g,t,p){
    R(g,'#2c3a4a',0,0,160,50);for(let x=0;x<160;x+=10)R(g,'#26323f',x,0,3,50);
    R(g,'#8a6a4a',12,12,60,3);R(g,'#8a6a4a',12,26,60,3);
    for(let i=0;i<5;i++){R(g,OUT,14+i*12,4,9,9);R(g,['#c24a3a','#d8b04a','#5a9a4a','#7a6ab0','#d8d8d8'][i],15+i*12,5,7,7)}
    R(g,'#c9b98a',100,8,26,18);R(g,'#8a7a50',100,8,26,2);R(g,'#5a4a28',104,13,18,1);R(g,'#5a4a28',104,17,14,1);
    R(g,'#6a4a2a',0,52,160,28);R(g,'#8a6a4a',0,52,160,5);R(g,'#4a3722',0,60,160,1);
    const open=p>.5&&p<.92;
    R(g,OUT,96,34,50,22);R(g,'#3a4352',97,35,48,20);R(g,'#5a667a',97,35,48,6);R(g,'#c9ced3',102,43,24,8);R(g,'#2a2e34',104,45,14,2);R(g,'#2a2e34',121,45,3,3);
    R(g,OUT,94,50,54,7);R(g,open?'#4a3720':'#6a4c30',95,open?53:51,52,open?6:4);if(open){R(g,'#f2b84b',100,54,8,3);R(g,'#f2b84b',112,54,10,3)}
    const stacks=Math.floor(p*9);for(let i=0;i<stacks;i++)coin(g,52+(i%3)*5,50-Math.floor(i/3)*3);
    const f=figure(g,24,68,{d:1,fh:[10,3-Math.round(Math.sin(t/160)*2)],bh:[3,9]});
    for(let i=0;i<6;i++){const ph=((t/820)+i/6)%1,x=lerp(f.F[0]+4,96,ph),y=lerp(f.F[1],40,ph)-Math.sin(ph*Math.PI)*22;coin(g,x,y)}
    if(p>.5)for(let i=0;i<3;i++){R(g,'#fff',130+i*6,30-((t/90+i*2)%5)*2,2,2);R(g,'#ffe08a',131+i*6,31-((t/90+i*2)%5)*2,1,1)}
  },
  rest(g,t,p,kit){
    const clinic=kit==='clinic';
    bgBedroom(g,t,clinic);
    const L=scLook();
    /* bed */
    R(g,OUT,36,41,80,22);R(g,'#6a4a2a',37,42,78,4);R(g,'#4a3320',37,56,5,12);R(g,'#4a3320',110,56,5,12);R(g,'#4a3320',37,36,5,24);
    R(g,'#4a3320',37,36,5,8);R(g,clinic?'#f4f4f4':'#e8e8f0',42,40,22,8);R(g,'#c8c8d8',42,46,22,2);
    R(g,L.skin,48,36,10,9);R(g,L.skinDk,48,40,2,4);R(g,L.hair,48,34,10,5);R(g,L.hairHi,50,34,4,1);R(g,OUT,54,39,2,1);
    R(g,clinic?'#dfe9ee':L.cloth,56,43,58,12);R(g,clinic?'#b8c8d0':L.clothDk,56,52,58,3);R(g,clinic?'#f4f8fa':L.clothHi,56,43,58,2);
    for(let i=0;i<4;i++)R(g,clinic?'#c4d2d8':L.clothDk,64+i*12,45,1,8);
    R(g,'#5a4128',120,48,16,3);R(g,'#4a3722',122,51,3,14);R(g,'#4a3722',131,51,3,14);
    if(!clinic){R(g,'#d8b04a',124,36,8,12);R(g,'#f6e08a',125,37,6,4);R(g,'rgba(255,220,120,.18)',116,28,32,26)}else{R(g,'#c9ced3',144,24,2,40);R(g,'#c9ced3',140,24,10,2);R(g,'#8ad0e8',141,28,7,10)}
    for(let i=0;i<3;i++){const zy=((t/110+i*14)%46);if(zy<34){const a=(1-zy/36).toFixed(2),zx=62+i*8+Math.sin(t/220+i)*2,y=34-zy*.6,s=4+i;R(g,'rgba(230,238,255,'+a+')',zx,y,s,1);R(g,'rgba(230,238,255,'+a+')',zx+s-1,y+1,1,1);R(g,'rgba(230,238,255,'+a+')',zx+1,y+2,1,1);R(g,'rgba(230,238,255,'+a+')',zx,y+3,s,1)}}
    /* wall clock racing */
    dialRing(g,20,22,9,'#f4f2e8','#151720');const a=t/150;for(let k=1;k<8;k++)R(g,'#151720',20+Math.round(Math.cos(a)*k),22+Math.round(Math.sin(a)*k),1,1);for(let k=1;k<5;k++)R(g,'#c24a3a',20+Math.round(Math.cos(a/12)*k),22+Math.round(Math.sin(a/12)*k),1,1);
    const d=p<.5?p*2:(1-p)*2;R(g,'rgba(0,0,12,'+(d*.4).toFixed(2)+')',0,0,160,80);
  },
  nature(g,t,p,kit){
    if(kit==='fish'){
      bgPier(g,t);
      const bite=p>.6,f=figure(g,30,66,{d:1,fh:[10,-3],bh:[5,3]});
      const tipx=f.F[0]+22,tipy=f.F[1]-22;ln(g,'#8a6430',f.F[0],f.F[1],tipx,tipy,2);
      const bx=104,by=bite?46+Math.round(Math.sin(t/60)*2):42;ln(g,'#e8e8e8',tipx,tipy,bx,by,1);
      R(g,OUT,bx-2,by-2,5,5);R(g,'#e8e8e8',bx-1,by-1,3,3);R(g,'#d33a2c',bx-1,by-1,3,2);
      for(let i=0;i<3;i++)R(g,'rgba(255,255,255,'+(.5-i*.15)+')',bx-4-i*3,by+3+i,8+i*6,1);
      if(p>.82){const u=(p-.82)/.18,fx=lerp(104,70,u),fy=44-Math.sin(u*Math.PI)*26;R(g,OUT,fx-1,fy-1,12,7);R(g,'#b8c4cc',fx,fy,10,5);R(g,'#e8eef2',fx+1,fy,6,2);R(g,'#6a7a88',fx+8,fy+1,3,3);R(g,OUT,fx+2,fy+1,1,1);if(u<.3)for(let i=0;i<6;i++)R(g,'#fff',104+i*3-8,40-i%2*3,2,2)}
      return;
    }
    if(kit==='boat'){
      bgSea(g,t,true);
      const bob=Math.round(Math.sin(t/260)*2),bx=52;
      R(g,OUT,bx-1,52+bob,64,14);R(g,'#8a5a30',bx,53+bob,62,12);R(g,'#6a4220',bx,53+bob,62,3);R(g,'#b07a44',bx+2,60+bob,58,2);
      const row=Math.sin(t/300),f=figure(g,bx+28,58+bob,{d:1,crouch:5,fh:[8+Math.round(row*5),6+Math.round(Math.cos(t/300)*2)],bh:[6+Math.round(row*5),7]});
      ln(g,'#c9a46a',f.F[0],f.F[1],f.F[0]+16,f.F[1]+12+Math.round(row*3),2);ln(g,'#c9a46a',f.B[0],f.B[1],f.B[0]-14,f.B[1]+10,2);
      R(g,'rgba(255,255,255,.55)',bx-14,66+bob,20,1);R(g,'rgba(255,255,255,.4)',bx-24,69+bob,14,1);
      gull(g,20+(t/50)%140,18,Math.floor(t/240)%2);gull(g,110+(t/70)%80,10,!(Math.floor(t/240)%2));
      return;
    }
    if(kit==='mud'){
      R(g,'#9aa8b0',0,0,160,30);R(g,'#b8c4ca',0,30,160,10);cloud(g,(t/110)%190-30,10,'#c9d4da');cloud(g,((t/150)+90)%190-30,20,'#b4c0c8');
      R(g,'#5a4a3a',0,38,160,42);for(let i=0;i<30;i++)R(g,i%3?'#6a5a48':'#4a3c2e',(i*37)%160,40+(i*13)%38,5+(i%3)*2,2);
      R(g,'#7ea0b4',16,64,40,6);R(g,'#a4c4d4',20,65,14,1);R(g,'#7ea0b4',104,70,36,6);R(g,'#a4c4d4',110,71,12,1);
      R(g,'#3a4a58',112,36,36,12);R(g,'#2a3642',116,32,28,6);R(g,'#2a3642',108,46,40,3);
      const dig=Math.sin(t/320)>0,f=figure(g,50,68,{d:1,crouch:9,fh:dig?[7,12]:[6,6],bh:[3,10]});
      const n=Math.floor(p*6);for(let i=0;i<n;i++){R(g,i%2?'#8a8f96':'#b8873f',84+(i%3)*5,70-Math.floor(i/3)*3,4,3)}
      R(g,OUT,78,64,22,12);R(g,'#7a8088',79,65,20,10);R(g,'#5a6068',79,65,20,2);for(let i=0;i<n;i++)R(g,i%2?'#cfd4d8':'#f2b84b',81+i*3,63-(i%2),2,2);
      if(dig){R(g,'#ffe08a',f.F[0]+2,f.F[1]-3,2,2);R(g,'#fff',f.F[0]+5,f.F[1]-6,1,1)}
      return;
    }
    if(kit==='plant'){
      bgGarden(g,t);
      const f=figure(g,38,68,{d:1,crouch:9,fh:[7,11],bh:[3,10]});
      const seedY=Math.min(66,34+t/9),grown=Math.min(1,Math.max(0,(p-.3)/.6));
      if(p<.3){R(g,OUT,f.F[0]+4,seedY-1,4,4);R(g,'#8a5a2a',f.F[0]+5,seedY,2,2)}
      const sx=f.F[0]+18,gh=2+Math.round(grown*14);R(g,'#7a5a38',sx-6,68,14,3);R(g,'#4a8a3a',sx,68-gh,2,gh);
      if(grown>.25){R(g,'#7ac46a',sx-5,68-gh+2,5,3);R(g,'#7ac46a',sx+2,68-gh,5,3)}if(grown>.7){R(g,'#9ad87a',sx-3,68-gh-3,4,3);R(g,'#e85a7a',sx,68-gh-3,3,3)}
      for(let i=0;i<4;i++)R(g,'rgba(140,200,240,.85)',sx-2+i*3,52+((t/60+i*7)%14),1,3);R(g,OUT,sx-12,44,16,9);R(g,'#8a8f96',sx-11,45,14,7);R(g,'#aeb4ba',sx-11,45,14,2);R(g,OUT,sx+3,47,9,4);R(g,'#8a8f96',sx+3,48,8,2);R(g,OUT,sx-16,43,6,3);
      return;
    }
    /* harvest */
    bgGarden(g,t);
    for(let i=0;i<6;i++){const x=76+i*13,y=68,pulled=i<Math.floor(p*6);if(!pulled){R(g,'#4a8a3a',x,y-12,2,12);R(g,'#7ac46a',x-5,y-10,6,4);R(g,'#7ac46a',x+2,y-14,6,4);R(g,'#e8803a',x-1,y-5,5,5)}else{R(g,'#7a5a38',x-4,y,12,2)}}
    const sw=Math.sin(t/240),f=figure(g,48,68,{d:1,crouch:5,fh:[9,8+Math.round(sw*3)],bh:[4,10]});
    R(g,OUT,24,60,22,12);R(g,'#b8873f',25,61,20,10);R(g,'#8f6429',25,61,20,2);for(let i=0;i<Math.floor(p*7);i++)R(g,i%2?'#e8803a':'#7ac46a',27+i*3,59-(i%2)*2,4,4);
  },
  eat(g,t,p,kit){
    if(kit==='drink'){
      bgBar(g,t);
      const clink=p>.45&&p<.75;
      const pat=mkLook('#9a6240','#7a7f8a',6,'#8a4a3a');
      const f=figure(g,42,68,{d:1,fh:[clink?16:11,clink?-5:-1],bh:[3,9]});
      const g2=figure(g,118,68,{d:-1,look:pat,fh:[clink?16:11,clink?-5:-1],bh:[3,9]});
      const mx=f.F[0]+1,my=f.F[1]-5,ox=g2.F[0]-9;
      R(g,OUT,mx-1,my-1,11,13);R(g,'#e8c96a',mx,my,9,11);R(g,'#fff6d0',mx,my-3,9,4);R(g,'#c4a24a',mx+1,my+4,7,1);R(g,'#8a8f96',mx+9,my+3,3,5);
      R(g,OUT,ox-1,my-1,11,13);R(g,'#e8c96a',ox,my,9,11);R(g,'#fff6d0',ox,my-3,9,4);R(g,'#c4a24a',ox+1,my+4,7,1);R(g,'#8a8f96',ox-3,my+3,3,5);
      if(clink)for(let i=0;i<8;i++){const a=-rn(i)*3.14,v=14+rn(i+3)*14,dt=(t%400)/1000;R(g,'#fff6d0',(mx+ox)/2+5+Math.cos(a)*v*dt,my-2+Math.sin(a)*v*dt+dt*dt*50,2,2)}
      return;
    }
    if(kit==='cook'){
      bgHearth(g,t);
      const s=Math.sin(t/200),f=figure(g,70,68,{d:1,fh:[10+Math.round(s*3),0],bh:[4,9]});
      R(g,OUT,100,34,34,18);R(g,'#2a2e34',101,35,32,16);R(g,'#4a4f58',101,35,32,3);
      for(let i=0;i<5;i++)R(g,'#c4813a',104+i*6+Math.round(Math.sin(t/160+i)*1),38+((i*3+Math.floor(t/200))%3),3,2);
      ln(g,'#8a6430',f.F[0],f.F[1],f.F[0]+22,f.F[1]-2+Math.round(s*2),2);R(g,'#c9ced3',f.F[0]+20,f.F[1]-4+Math.round(s*2),5,4);
      steam(g,114,32,t,5);
      R(g,OUT,14,34,12,7);R(g,'#e8e0c8',15,35,10,5);R(g,OUT,30,34,12,7);R(g,'#e8e0c8',31,35,10,5);
      return;
    }
    /* a plate in front of you */
    bgKitchen(g,t);R(g,'#8a6a4a',0,54,160,26);R(g,'#a98a62',0,54,160,4);for(let x=0;x<160;x+=16)R(g,'#8a6a4a',x,58,8,8);
    R(g,'#c24a3a',0,56,160,4);for(let x=0;x<160;x+=8)R(g,'#f4f2ea',x,56,4,4);
    const bite=Math.sin(t/260),f=figure(g,64,72,{d:1,fh:[8+Math.round(bite*3),bite>0?-13:3],bh:[3,9]});
    R(g,OUT,84,62,44,13);R(g,'#f4f2ea',85,63,42,11);R(g,'#d8d4c8',90,66,32,6);R(g,'#e8e4d8',85,63,42,2);
    R(g,'#c4813a',94,63,12,6);R(g,'#a8642a',94,63,12,2);R(g,'#7ac46a',108,64,7,5);R(g,'#4a8a3a',108,64,7,1);R(g,'#e8d890',98,68,14,3);R(g,'#d8803a',114,64,6,4);
    R(g,OUT,f.F[0]+1,f.F[1]-7,2,9);R(g,'#c9ced3',f.F[0]+1,f.F[1]-6,1,8);R(g,'#c9ced3',f.F[0]+3,f.F[1]-8,1,3);R(g,'#c4813a',f.F[0]-1,f.F[1]-9,5,3);
    steam(g,104,62,t,4);R(g,OUT,134,54,14,16);R(g,'#c24a3a',135,55,12,14);R(g,'#e8e0c8',135,55,12,3);R(g,OUT,147,58,4,8);R(g,'#c24a3a',148,59,2,6);
  }
};
