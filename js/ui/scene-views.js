"use strict";
/* Scenes drawn from the player's own eyes (first person) or from behind their shoulder. They sit beside the side-on scenes in scene-art.js.
   SCENE_KITS['type:kit'] is a function (g,t,p) and scene-art.js hands a scene to it when one exists.
   Every scene follows one rule: set up, anticipate, act, then a clear payoff frame (sparks, a splash, a flash), then reset. */
const ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};
const seg=(u,a,b)=>Math.max(0,Math.min(1,(u-a)/(b-a)));
function ell(g,c,cx,cy,rx,ry){for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry)));R(g,c,cx-w,cy+y,w*2+1,1)}}
/* a spray of sparks or droplets; dt is seconds since the hit */
function burst(g,x,y,dt,n,cols,speed){if(dt<0||dt>.55)return;speed=speed||40;for(let i=0;i<n;i++){const a=-rn(i+3)*3.14,v=speed*(.5+rn(i)*.8);R(g,cols[i%cols.length],x+Math.cos(a)*v*dt,y+Math.sin(a)*v*dt+dt*dt*90,2,2)}}
/* a soft puff of steam or dust that grows and fades; k is 0 to 1 */
function puff(g,x,y,k,c){if(k<=0||k>=1)return;const a=(.7*(1-k)).toFixed(2);for(let i=0;i<5;i++){const s=3+Math.round(k*5);R(g,'rgba('+(c||'240,244,248')+','+a+')',x+(i-2)*(3+k*6)-s/2,y-k*16-(i%2)*4,s,s)}}
function glint(g,x,y,k){if(k<=0||k>=1)return;const s=1+Math.round(Math.sin(k*3.14)*3);R(g,'#fff',x-s,y,s*2+1,1);R(g,'#fff',x,y-s,1,s*2+1);R(g,'#ffe08a',x,y,1,1)}
/* ----- round brushes: crisp pixel discs and capsules, so limbs and props have soft rounded shapes and no square-pen corners ----- */
function dsc(g,c,cx,cy,r){const n=Math.ceil(r);for(let y=-n;y<=n;y++){const q=r*r-y*y;if(q<0)continue;const w=Math.round(Math.sqrt(q));R(g,c,Math.round(cx)-w,Math.round(cy)+y,w*2+1,1)}}
function cap(g,c,x0,y0,x1,y1,r0,r1){if(r1==null)r1=r0;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++){const k=i/n;dsc(g,c,x0+(x1-x0)*k,y0+(y1-y0)*k,r0+(r1-r0)*k)}}
/* ----- first person: the player's forearm comes in from outside the frame and ends in a hand ----- */
/* A hand at wrist (x,y) pointing along angle a. o.fist, o.point (index finger out), o.s scale, o.thumb side (+1/-1), o.look */
function hand(g,x,y,o){
  o=o||{};const L=o.look||scLook(),s=o.s||1,a=o.a==null?-Math.PI/2:o.a,ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux;
  const P=(f,q)=>[x+(ux*f+vx*q)*s,y+(uy*f+vy*q)*s];
  let th=o.thumb;if(!th){const A=P(6,5),B=P(6,-5);th=Math.abs(A[0]-80)<Math.abs(B[0]-80)?1:-1}
  const C=(c,f0,q0,f1,q1,r)=>{const A=P(f0,q0),B=P(f1,q1);cap(g,c,A[0],A[1],B[0],B[1],r*s)};
  const fq=[-3.4,-1.15,1.15,3.4].map(q=>q*th);
  C(OUT,1,0,6.5,0,5.4);C(L.skin,1,0,6.5,0,4.4);
  if(o.fist||o.point){
    fq.forEach((q,i)=>{if(o.point&&i===3)return;const K=P(9,q);dsc(g,OUT,K[0],K[1],2.7*s);dsc(g,L.skin,K[0],K[1],1.8*s)});
    if(o.point){C(OUT,8,fq[3],16,fq[3]*1.1,2.3);C(L.skin,8,fq[3],16,fq[3]*1.1,1.3);const T=P(15.5,fq[3]*1.1);R(g,L.skinHi,T[0],T[1],1,1)}
    C(L.skin,2,0,7,0,3.8);
    fq.forEach((q,i)=>{if(o.point&&i===3)return;const K=P(9.6,q);R(g,L.skinHi,K[0],K[1],1,1)});
    C(OUT,4,4.6*th,8.4,1.4*th,2.6);C(L.skin,4,4.6*th,8.4,1.4*th,1.6);
  }else{
    const len=[4.6,6.4,6.8,5.6];
    fq.forEach((q,i)=>{C(OUT,8,q,8+len[i],q*1.18,2.3);C(L.skin,8,q,8+len[i],q*1.18,1.3);const T=P(7.6+len[i],q*1.18);R(g,L.skinHi,T[0],T[1],1,1)});
    C(L.skin,1.5,0,7.2,0,3.9);
    C(OUT,3,4.4*th,8,7.4*th,2.6);C(L.skin,3,4.4*th,8,7.4*th,1.6);
  }
  C(L.skinDk,2,-3.2*th,6,-3.2*th,.9);const H=P(6,0);R(g,L.skinHi,H[0]-1,H[1]-1,2,1);
}
/* An arm from off screen (fx,fy) to a hand at (x,y): tapered forearm, rolled sleeve, shading on one side */
function arm(g,x,y,fx,fy,o){
  o=o||{};const L=o.look||scLook(),s=o.s||1,a=Math.atan2(y-fy,x-fx),d=Math.hypot(x-fx,y-fy),ux=(x-fx)/d,uy=(y-fy)/d,vx=-uy,vy=ux;
  const sx=lerp(x,fx,.48),sy=lerp(y,fy,.48);
  cap(g,OUT,x,y,fx,fy,4.6*s,7*s);cap(g,L.skin,x,y,sx,sy,3.6*s,5*s);
  cap(g,L.skinDk,x+vx*2.8*s,y+vy*2.8*s,sx+vx*4.1*s,sy+vy*4.1*s,1*s,1.1*s);cap(g,L.skinHi,x-vx*1.8*s,y-vy*1.8*s,sx-vx*2.6*s,sy-vy*2.6*s,.4*s,.6*s);
  const sl=o.sleeve||L.cloth;cap(g,OUT,sx,sy,fx,fy,6.4*s,7.4*s);cap(g,sl,sx,sy,fx,fy,5.4*s,6.6*s);
  cap(g,o.sleeve?shade(o.sleeve,-.18):L.clothDk,sx+vx*3*s,sy+vy*3*s,fx+vx*4*s,fy+vy*4*s,1.6*s,2.2*s);
  cap(g,o.sleeve?shade(o.sleeve,.15):L.clothHi,sx+ux*1.2,sy+uy*1.2,sx+ux*1.2+vx*.1,sy+uy*1.2,.1,.1);
  const c0=[sx-vx*5*s,sy-vy*5*s],c1=[sx+vx*5*s,sy+vy*5*s];cap(g,o.sleeve?shade(o.sleeve,-.25):L.clothDk,c0[0],c0[1],c1[0],c1[1],.8*s);
  hand(g,x+ux*0,y+uy*0,Object.assign({},o,{a}));
}
/* ----- over the shoulder: the back of the player's head and shoulders, drawn in the same blocky style as the map ----- */
function backView(g,x,y,o){
  o=o||{};const L=o.look||scLook(),st=L.style,hy=y-50+(o.nod||0),hc=L.hair,hh=L.hairHi;
  R(g,OUT,x-24,y-26,49,28);R(g,L.cloth,x-23,y-25,47,27);R(g,L.clothDk,x-23,y-25,5,27);R(g,L.clothDk,x+18,y-25,5,27);R(g,o.look?L.clothHi:'#ffffff',x-23,y-25,47,2);R(g,L.clothDk,x,y-21,1,21);
  R(g,OUT,x-5,y-32,11,8);R(g,L.skinDk,x-4,y-31,9,7);
  if(st===1||st===5){R(g,OUT,x-12,hy+9,24,20);R(g,hc,x-11,hy+10,22,18)}
  for(const sx of [x-13,x+11]){R(g,OUT,sx,hy+7,3,7);R(g,L.skinDk,sx+(sx<x?1:0),hy+8,2,5)}
  R(g,OUT,x-11,hy-1,22,22);R(g,L.skin,x-10,hy,20,20);R(g,L.skinDk,x-10,hy+16,20,4);
  if(st===3){R(g,L.skinHi,x-6,hy+2,8,2)}
  else if(st===2){R(g,shade(hc,.35),x-10,hy,20,6)}
  else if(st===1||st===5){R(g,hc,x-10,hy,20,20);R(g,hh,x-6,hy+2,8,1)}
  else if(st===4){R(g,OUT,x-5,hy-8,10,9);R(g,hc,x-4,hy-7,8,7);R(g,hc,x-10,hy,20,13);R(g,hh,x-6,hy+2,8,1)}
  else if(st===6){R(g,OUT,x-13,hy-6,26,20);R(g,hc,x-12,hy-5,24,18);R(g,hh,x-7,hy-3,9,1)}
  else{R(g,hc,x-10,hy,20,14);R(g,hh,x-6,hy+2,8,1)}
  return{sl:[x-17,y-14],sr:[x+17,y-14],head:[x,hy]};
}
/* a sleeved arm from a shoulder to a square hand, seen from behind */
function oArm(g,s,h,L){
  L=L||scLook();const mx=lerp(s[0],h[0],.7),my=lerp(s[1],h[1],.7);
  ln(g,OUT,s[0],s[1],h[0],h[1],7);R(g,OUT,h[0]-3.5,h[1]-3.5,8,8);
  ln(g,L.cloth,s[0],s[1],mx,my,5);ln(g,L.skin,mx,my,h[0],h[1],3);R(g,L.skin,h[0]-2.5,h[1]-2.5,6,6);R(g,L.skinHi,h[0]-2.5,h[1]-2.5,6,1);
}
function woodTop(g,y0,c1,c2){R(g,c1,0,y0,160,80-y0);for(let y=y0+8;y<80;y+=10)R(g,c2,0,y,160,1);for(let y=y0;y<80;y+=10)for(let x=(y/10%2)*37+9;x<160;x+=74)R(g,c2,x,y,1,8)}
function vignette(g,a){const s=(a||.35);R(g,'rgba(8,6,10,'+s+')',0,0,160,6);R(g,'rgba(8,6,10,'+s+')',0,74,160,6);R(g,'rgba(8,6,10,'+s*.8+')',0,0,6,80);R(g,'rgba(8,6,10,'+s*.8+')',154,0,6,80)}
const SCENE_KITS={
  /* WORK: first person at a big bolt. Pull, resist, the bolt turns and throws sparks, ratchet back, pull again. */
  'work:spanner'(g,t,p){
    bgWorkshop(g,t);R(g,'rgba(20,14,10,.55)',0,0,160,80);R(g,'rgba(255,190,90,.10)',40,0,90,36);
    R(g,OUT,30,8,100,66);R(g,'#4f565f',31,9,98,64);R(g,'#6a727c',31,9,98,3);R(g,'#3f464e',31,62,98,8);
    for(const [x,y] of [[34,12],[122,12],[34,66],[122,66]]){R(g,OUT,x-1,y-1,5,5);R(g,'#8a929c',x,y,3,3)}
    R(g,'#3f464e',38,24,22,6);R(g,'#2e343a',38,24,22,1);R(g,'#3f464e',100,24,24,6);
    const n=2,idx=Math.min(n-1,Math.floor(p*n)),u=(p*n)%1,BX=80,BY=38,th0=.35,th1=1.1;
    const pull=ease(seg(u,.2,.7)),back=ease(seg(u,.8,1)),hit=u>=.7&&u<.8;
    const th=u<.8?lerp(th0,th1,pull):lerp(th1,th0,back),shake=u<.2?Math.round(Math.sin(t/35)):hit?Math.round(Math.sin(t/25)*2):0;
    const rot=idx*.6+.6*pull,ex=BX+34*Math.cos(th),ey=BY+34*Math.sin(th)+shake;
    /* the bolt, with a notch that shows it turning */
    disc(g,OUT,BX,BY,17);disc(g,'#b9bfc6',BX,BY,16);disc(g,'#8a929c',BX,BY,12);disc(g,OUT,BX,BY,11);disc(g,'#c9ced3',BX,BY,10);disc(g,'#aab0b8',BX+1,BY+1,8);
    for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;R(g,'#5a6068',BX+Math.cos(a)*8,BY+Math.sin(a)*8,2,2)}
    ln(g,OUT,BX,BY,BX+Math.cos(rot)*9,BY+Math.sin(rot)*9,3);disc(g,'#6a727c',BX,BY,3);
    R(g,'#eef2f5',BX-7,BY-9,4,1);
    ln(g,OUT,BX,BY,ex,ey,8);ln(g,'#b9bfc6',BX,BY,ex,ey,6);ln(g,'#e2e6ea',BX,BY-1,ex,ey-1,2);
    /* the left hand braces on the plate, the right hand pulls */
    arm(g,60,54,34,92);arm(g,ex,ey,ex+18,92,{fist:true});
    if(hit){burst(g,BX+Math.cos(th)*14,BY+Math.sin(th)*14,(u-.7)*(SCENE_MS.work/n)/1000,10,['#ffd24a','#ff8a30','#fff4b8'],46);if(u<.74)disc(g,'rgba(255,230,140,.55)',BX,BY,20)}
    vignette(g,.3);
  },
  /* WORK: first person at the forge. Hammer rises, trembles, STRIKE, sparks and a flash, rises again. */
  'work:forge'(g,t,p){
    bgForge(g,t);R(g,'rgba(14,8,6,.35)',0,0,160,56);
    R(g,'#1a1210',8,6,2,18);R(g,'#2b2f36',4,22,10,5);R(g,'#1a1210',20,6,2,14);R(g,'#2b2f36',17,18,8,3);R(g,'#2b2f36',14,5,12,2);
    R(g,OUT,48,66,64,12);R(g,'#3a3d44',49,67,62,10);R(g,OUT,52,55,56,12);R(g,'#4a4f58',53,56,54,10);R(g,OUT,36,50,76,8);R(g,'#7a808a',37,51,74,5);R(g,'#aab0b8',37,51,74,2);R(g,OUT,26,52,14,6);R(g,'#7a808a',27,53,12,3);
    const n=3,u=(p*n)%1,idx=Math.min(n-1,Math.floor(p*n));
    const up=u<.45?ease(seg(u,0,.45)):u<.7?1:u<.82?1-ease(seg(u,.7,.82)):0,rise=u>.82?ease(seg(u,.88,1)):0;
    const k=u<.82?up:rise*.9;
    const HX=lerp(80,92,k),HY=lerp(41,16,k)+(u>.45&&u<.7?Math.round(Math.sin(t/40)):0),hx=HX+17,hy=HY+17;
    const heat=1-idx*.18,glow=u>=.82&&u<.9;
    R(g,'rgba(255,150,50,'+(.25*heat).toFixed(2)+')',56,38,50,14);
    R(g,OUT,60,44,44,8);R(g,idx>1?'#e0561c':'#ff9a30',61,45,42,6);R(g,glow?'#fff4b8':'#ffd24a',61,45,42,2);
    /* tongs held in the left hand */
    ln(g,OUT,30,64,60,48,4);ln(g,'#8a929c',30,64,60,47,2);ln(g,OUT,30,68,60,50,4);ln(g,'#6a727c',30,68,60,49,2);
    arm(g,32,62,10,92,{fist:true});
    ln(g,OUT,HX,HY,hx,hy,5);ln(g,'#8a6430',HX,HY,hx,hy,3);
    R(g,OUT,HX-10,HY-7,21,13);R(g,'#8a929c',HX-9,HY-6,19,11);R(g,'#c9ced3',HX-9,HY-6,19,3);R(g,'#5a6068',HX-9,HY+3,19,2);
    arm(g,hx,hy,hx+22,92,{fist:true});
    if(glow||(u>=.88&&u<.95)){const dt=(u-.82)*(SCENE_MS.work/n)/1000;if(u<.86)R(g,'rgba(255,230,160,.5)',0,0,160,80);burst(g,80,44,dt,12,['#ffd24a','#ff8a30','#fff4b8'],52)}
    vignette(g,.35);
  },
  /* WORK: over the shoulder at the stove. Pull back, toss, the food flips once and lands in a puff of steam. */
  'work:pan'(g,t,p){
    bgKitchen(g,t);R(g,'#b8703a',109,16,9,6);R(g,'#b8703a',123,16,9,6);R(g,'#b8703a',137,16,9,6);
    R(g,'#6a708a',0,58,160,22);R(g,'#8a90a8',0,58,160,3);R(g,OUT,78,56,50,5);R(g,'#2a2e34',79,57,48,3);
    const n=2,u=(p*n)%1,ph=seg(u,.45,.9),toss=u<.3?0:u<.45?-ease(seg(u,.3,.45)):u<.6?-1+ease(seg(u,.45,.6))*2.4:u<.9?1.4-ease(seg(u,.6,.9))*1.4:0;
    const py=Math.round(48-toss*5),px=104;
    const fl=Math.floor(t/110)%2;R(g,'#ff9a30',84,56,6,3+fl);R(g,'#ffd24a',86,57,2,2+fl);R(g,'#ff9a30',100,56,6,3+(1-fl));R(g,'#ffd24a',102,57,2,2);R(g,'#ff9a30',116,56,6,3+fl);
    ln(g,OUT,px-16,py+2,52,py+4,6);ln(g,'#3a3d44',px-16,py+2,52,py+4,4);
    R(g,OUT,px-19,py-4,40,13);ell(g,OUT,px,py+1,20,7);ell(g,'#4a4f58',px,py+1,19,6);ell(g,'#1c1f24',px,py,16,4);
    const bits=['#c4813a','#d8a04c','#7ac46a','#e8e0a0','#c24a3a'];
    for(let i=0;i<5;i++){const hh=ph>0&&ph<1?Math.sin(ph*Math.PI)*26:0,fx=px-10+i*5+(ph>0?Math.sin(ph*3.1)*i:0),fy=py-hh-(i%2)*2,flip=ph>0&&ph<1&&Math.floor(ph*4)%2;R(g,OUT,fx-1,fy-3,5,5);R(g,flip?'#8a5a2a':bits[i],fx,fy-2,3,3)}
    if(ph>=.95||u>.9)puff(g,px,py-4,seg(u,.9,1),'240,244,248');
    if(u>.9&&u<.97)glint(g,px+8,py-6,seg(u,.9,.97));
    const L=scLook(),B=backView(g,24,82);
    oArm(g,B.sr,[52,py+4],L,{fist:true});
    vignette(g,.25);
  },
  /* CASH: first person at a counter. Sweep the coins together, scoop them, fan them, flip one into the light. */
  'cash:'(g,t,p){
    woodTop(g,0,'#7a5632','#5a3f22');R(g,'rgba(255,230,160,.10)',40,10,90,44);
    R(g,OUT,6,6,30,20);R(g,'#e8e0c8',7,7,28,18);R(g,'#c2b898',7,7,28,2);for(let i=0;i<3;i++)R(g,'#8a8266',10,12+i*4,20,1);R(g,'#3a2a1a',20,7,1,18);
    R(g,OUT,124,8,28,16);R(g,'#5a4128',125,9,26,14);R(g,'#8a6a4a',125,9,26,3);R(g,'#f2b84b',130,16,3,2);R(g,'#f2b84b',138,15,4,3);
    const cw=(x,y,w)=>{R(g,OUT,x-1,y-1,w+2,6);R(g,'#f2b84b',x,y,w,4);if(w>2)R(g,'#fff1b0',x,y,w-1,1);R(g,'#b8841e',x+w-1,y+3,1,1)};
    const init=[[96,30],[62,34],[84,52],[108,48],[50,50]],pile=[64,44];
    const sweep=ease(seg(p,.05,.3)),grab=seg(p,.3,.42),lift=ease(seg(p,.42,.58)),flipU=seg(p,.58,.84),settle=ease(seg(p,.86,1));
    let hx,hy;
    if(p<.3){hx=lerp(128,pile[0]+8,sweep);hy=lerp(66,pile[1]+10,sweep)}
    else if(p<.42){hx=pile[0]+8;hy=pile[1]+10-grab*4}
    else if(p<.86){hx=lerp(pile[0]+8,82,lift);hy=lerp(pile[1]+6,36,lift)}
    else{hx=82;hy=lerp(36,52,settle)}
    const inHand=p>=.42;
    if(!inHand){init.forEach(([x,y],i)=>{const k=ease(seg(p,.1+i*.02,.3)),cx=lerp(x,pile[0]+(i%3)*4,k),cy=lerp(y,pile[1]+Math.floor(i/3)*3,k);cw(cx,cy,4)})}
    else{for(let i=0;i<4;i++)cw(hx-7+i*4,hy-6-(i%2)*2,4)}
    arm(g,hx,hy,hx+28,92,{fist:p>=.3&&p<.42});
    if(p>=.58&&p<.86){const v=flipU,fy=hy-8-Math.sin(v*Math.PI)*26,w=[4,3,1,3,4,3,1,3,4][Math.min(8,Math.floor(v*9))];cw(hx-1+((4-w)>>1),fy,w);if(w===1)R(g,'#fff',hx,fy-1,1,1)}
    if(p>=.84&&p<.98)glint(g,hx,hy-8,seg(p,.84,.98));
    vignette(g,.4);
  },
  /* REST: first person, lying in a clinic bed. A doctor's hands bind your arm, then a warm glow of healing. */
  'rest:clinic'(g,t,p){
    const oy=Math.round((1-ease(p/.3))*3);g.save();g.translate(0,oy);
    R(g,'#d8e2e6',0,-4,160,40);R(g,'#c4d2d8',0,30,160,5);R(g,'#eef4f6',54,-4,52,9);R(g,'#fff',58,-4,44,6);R(g,'rgba(255,255,230,.22)',40,0,80,34);
    R(g,'#e8eef0',10,8,22,20);R(g,'#d33a2c',19,10,4,16);R(g,'#d33a2c',12,16,18,4);
    for(let i=0;i<5;i++){R(g,i%2?'#8ab4c8':'#a4c8d8',124+i*7,2,6,32)}R(g,'#6a8a98',122,0,40,3);
    R(g,'#9ec4d6',0,34,160,50);R(g,'#b4d4e2',0,34,160,4);R(g,'#86aec2',0,50,160,2);R(g,'#86aec2',0,66,160,2);
    for(const x of [52,94]){R(g,OUT,x-1,57,18,26);R(g,'#b4d4e2',x,58,16,25);R(g,'#c8e2ee',x+2,58,12,3);R(g,'#86aec2',x+6,66,1,12)}
    /* your own arm lying across the blanket with a gown sleeve */
    const L=scLook();ln(g,OUT,0,72,70,46,12);ln(g,L.skin,0,72,70,46,9);ln(g,'#f4f6f8',0,74,20,66,12);ln(g,'#c9d4da',0,78,10,76,5);
    const wrap=ease(seg(p,.25,.7));
    if(wrap>0){const wx0=30,wx1=lerp(32,52,wrap);for(let x=wx0;x<wx1;x+=3){const y=lerp(72,46,(x/70)),k=(Math.floor(x/3)%2)?'#f4f2e8':'#d8d4c4';R(g,OUT,x-1,y-6,4,13);R(g,k,x,y-5,3,11)}}
    const dr=mkLook('#c98f68','#3a2b22',0,'#f2f4f6'),enter=ease(seg(p,0,.25)),leave=ease(seg(p,.88,1));
    const ox=lerp(150,0,enter)+leave*60,oyy=lerp(-30,0,enter)-leave*40;
    const wob=Math.sin(seg(p,.25,.7)*Math.PI*6)*7;
    const h1=[84+ox*.1,40+oyy+(p>.25&&p<.7?Math.round(wob*.3):0)];arm(g,h1[0],h1[1],h1[0]+12,-14,{look:dr});
    const h2=[lerp(34,50,wrap)+(ox*.1),Math.round(lerp(66,50,wrap)+oyy*.2)];arm(g,h2[0],h2[1],h2[0]+8,-14,{look:dr,fist:true});
    if(p>=.7&&p<.95){const k=seg(p,.7,.95);R(g,'rgba(255,230,140,'+(.32*(1-k)).toFixed(2)+')',20,30,70,50);for(let i=0;i<4;i++){const px=30+i*14+Math.sin(p*9+i)*3,py=70-k*40-i*3;R(g,'#7ae08a',px,py,5,1);R(g,'#7ae08a',px+2,py-2,1,5)}glint(g,48,50,k)}
    g.restore();
  },
  /* NATURE: first person, looking down at wet mud. Push it aside, uncover a shell, hold it up. */
  'nature:mud'(g,t,p){
    R(g,'#4a3a2c',0,0,160,80);for(let i=0;i<46;i++)R(g,i%3?'#5a4838':'#3a2c20',(i*37)%160,(i*23)%78,6+(i%4)*3,2);
    for(const [x,y,w] of [[14,12,34],[118,60,30],[116,10,22]]){R(g,'#6f8da0',x,y,w,7);R(g,'#9ab8c8',x+2,y+1,w/2,1)}
    const found=p>.3,search=p<.38;
    const mound=Math.max(0,1-seg(p,.3,.4));
    if(!found||mound>0){disc(g,'#3a2c20',80,36,Math.round(9*Math.max(.3,mound)));disc(g,'#5a4838',79,34,Math.round(5*Math.max(.3,mound)))}
    const shellOnGround=p>=.3&&p<.55;
    if(shellOnGround){R(g,OUT,75,35,11,8);R(g,'#f0d0c0',76,36,9,6);R(g,'#d8a898',76,36,9,2)}
    const w=Math.sin(p*Math.PI*6);
    let x1,y1,x2,y2,fist=false;
    if(p<.38){x1=62+w*10;y1=44;x2=100-w*10;y2=48}
    else if(p<.5){const k=ease(seg(p,.38,.5));x1=lerp(62,40,k);y1=lerp(44,52,k);x2=lerp(100,80,k);y2=lerp(48,40,k)}
    else if(p<.58){x1=40;y1=52;x2=80;y2=40;fist=true}
    else{const k=ease(seg(p,.58,.84));x1=40;y1=52;x2=lerp(80,80,k);y2=lerp(40,28,k)}
    /* ridges where the mud is pushed */
    if(search){R(g,'#2a2018',x1-12,y1+4,10,2);R(g,'#2a2018',x2+3,y2+4,10,2);R(g,'#6a5844',x1-12,y1+3,10,1)}
    arm(g,x1,y1,x1-20,92);
    arm(g,x2,y2,x2+22,92,{fist:fist&&p<.6});
    if(p>=.5){const k=ease(seg(p,.5,.84)),sy=lerp(34,14,k),sc=1+k;ell(g,OUT,80,sy,Math.round(8*sc)+1,Math.round(6*sc)+1);ell(g,'#f0d0c0',80,sy,Math.round(8*sc),Math.round(6*sc));ell(g,'#d8a898',80,sy+Math.round(2*sc),Math.round(6*sc),Math.round(3*sc));for(let i=-2;i<=2;i++)ln(g,'#c08878',80,sy+Math.round(5*sc),80+i*Math.round(3*sc),sy-Math.round(4*sc),1)}
    if(p>=.5)for(let i=0;i<5;i++){const q=((t/420)+i*.37)%1;R(g,'#4a3a2c',74+i*4,34+q*40,2,3)}
    if(p>=.84)glint(g,84,12,seg(p,.84,1));
    vignette(g,.35);
  },
  /* NATURE: first person at a patch of soil. Dig, drop a seed, cover it, water it, watch it grow. */
  'nature:plant'(g,t,p){
    R(g,'#7ab05a',0,0,160,16);for(let x=0;x<160;x+=6)R(g,x%12?'#68a04a':'#86bc66',x,10+(x%5),3,6);
    R(g,OUT,16,14,128,6);R(g,'#8a6a4a',17,15,126,4);R(g,OUT,16,72,128,8);R(g,'#8a6a4a',17,73,126,6);
    R(g,'#6a4a2a',17,20,126,52);for(let i=0;i<36;i++)R(g,i%2?'#7a5a38':'#5a3c20',20+(i*29)%118,22+(i*17)%48,4,2);
    const sx=80,sy=54,water=seg(p,.52,.72),wet=ease(water);
    if(wet>0)ell(g,'#4a3018',sx,sy,Math.round(14*wet),Math.round(7*wet));
    const hole=p<.38?ease(seg(p,.05,.2)):1-ease(seg(p,.38,.46));
    if(hole>0){ell(g,OUT,sx,sy,Math.round(8*hole)+1,Math.round(4*hole)+1);ell(g,'#2a1a0c',sx,sy,Math.round(8*hole),Math.round(4*hole))}
    const cover=ease(seg(p,.4,.52));if(cover>0){ell(g,'#5a3c20',sx,sy-1,Math.round(7*cover),Math.round(3*cover)+1);R(g,'#7a5a38',sx-3,sy-3,5,1)}
    /* the hand, then the seed, then the watering can */
    if(p<.2){const k=ease(seg(p,0,.2));arm(g,sx,lerp(70,50,k),sx+26,92)}
    else if(p<.4){const k=seg(p,.2,.4),hy=lerp(40,36,ease(Math.min(1,k*2))),fall=ease(seg(k,.5,1));arm(g,sx+2,hy,sx+22,92);R(g,OUT,sx-3,hy+6+fall*(sy-hy-6),5,5);R(g,'#c4813a',sx-2,hy+7+fall*(sy-hy-6),3,3)}
    else if(p<.52){arm(g,sx+Math.round(Math.sin(p*60)*3),lerp(42,50,seg(p,.4,.52)),sx+24,92,{fist:true})}
    if(p>=.5){const k=ease(seg(p,.5,.58))*(1-ease(seg(p,.76,.88)));const cx=lerp(190,124,k),cy=26;
      R(g,OUT,cx-13,cy-9,27,19);R(g,'#8a929c',cx-12,cy-8,25,17);R(g,'#aab0b8',cx-12,cy-8,25,3);R(g,'#6a727c',cx-12,cy+5,25,3);ln(g,OUT,cx-12,cy+4,cx-30,cy+10,6);ln(g,'#8a929c',cx-12,cy+4,cx-30,cy+10,3);R(g,OUT,cx-34,cy+8,8,6);R(g,'#c9ced3',cx-33,cy+9,6,4);R(g,OUT,cx+10,cy-14,4,12);R(g,'#8a929c',cx+11,cy-13,2,10);
      if(water>0&&water<1)for(let i=0;i<6;i++){const q=((t/110)+i*.2)%1;R(g,'rgba(160,210,250,.9)',cx-33+(i%3)*2,cy+14+q*(sy-cy-14),1,3)}}
    if(p>=.7&&p<.82)for(let i=0;i<5;i++){glint(g,sx-14+i*7,sy-4-(i%2)*6,seg(p,.7+i*.015,.82))}
    const gr=ease(seg(p,.8,1));
    if(gr>0){const gh=Math.round(gr*20);R(g,OUT,sx-1,sy-gh,4,gh+1);R(g,'#4a8a3a',sx,sy-gh,2,gh);R(g,'#7ac46a',sx-7,sy-gh*.6+1,7,4);R(g,'#7ac46a',sx+2,sy-gh*.8,7,4);R(g,OUT,sx-8,sy-gh*.6,9,1);if(gr>.7){ell(g,OUT,sx+1,sy-gh-2,5,4);ell(g,'#e85a7a',sx+1,sy-gh-2,4,3);R(g,'#ffe08a',sx,sy-gh-3,3,2)}}
    vignette(g,.25);
  },
  /* NATURE: first person facing the crop. Reach, grip, pull, shake it free, carry it to the basket, repeat. */
  'nature:harvest'(g,t,p){
    R(g,'#a8d0e8',0,0,160,22);R(g,'#c4e0f0',0,18,160,8);cloud(g,(t/100)%190-30,6,'#f4f8fb');
    R(g,'#4f8a46',0,22,160,12);for(let x=0;x<160;x+=5)R(g,x%10?'#3f7a3a':'#5a9a50',x,22+(x%3),3,9);
    for(let x=4;x<160;x+=22){R(g,'#e8dcc0',x,30,3,14);R(g,'#c9bd9e',x,30,1,14)}R(g,'#e8dcc0',0,34,160,2);R(g,'#e8dcc0',0,40,160,2);
    R(g,'#6a4a2a',0,44,160,36);for(let y=52;y<80;y+=9)R(g,'#553a1f',0,y,160,2);
    const xs=[80,56,106],n=3,idx=Math.min(n-1,Math.floor(p*n)),u=(p*n)%1;
    const crop=(x,lift,sh)=>{const y=54-lift;R(g,OUT,x-14+sh,y-24,29,22);R(g,'#4a8a3a',x-13+sh,y-23,27,20);R(g,'#7ac46a',x-12+sh,y-22,10,14);R(g,'#7ac46a',x+2+sh,y-22,10,16);R(g,'#9ad87a',x-5+sh,y-24,9,10);R(g,OUT,x-5+sh,y-2,11,8);R(g,'#e8803a',x-4+sh,y-1,9,7);R(g,'#c4601a',x-4+sh,y+3,9,2)};
    for(let i=0;i<n;i++){const x=xs[i];if(i>idx||(i===idx&&u<.45)){const sh=i===idx&&u>.25?Math.round(Math.sin(t/35)*1.5):0;crop(x,i===idx?Math.round(ease(seg(u,.25,.45))*4):0,sh)}else if(i<idx||(i===idx&&u>=.45)){ell(g,'#3a2412',x,57,8,3);R(g,'#7a5a38',x-9,59,18,1)}}
    const X=xs[idx];let hx,hy,fist=false;
    if(u<.25){const k=ease(seg(u,0,.25));hx=lerp(X+30,X+4,k);hy=lerp(92,40,k)}
    else if(u<.45){hx=X+4;hy=40;fist=true}
    else if(u<.85){const k=ease(seg(u,.45,.85));hx=lerp(X+4,24,k);hy=lerp(40,56,k)-Math.sin(k*Math.PI)*16;fist=true}
    else{hx=24;hy=56;fist=true}
    arm(g,hx,hy,hx+26,92,{fist});
    if(u>=.45&&u<.85){const k=ease(seg(u,.45,.85)),ix=hx-2,iy=hy-6;R(g,OUT,ix-5,iy,11,9);R(g,'#e8803a',ix-4,iy+1,9,7);R(g,'#7ac46a',ix-6,iy-6,13,6);R(g,OUT,ix-6,iy-7,13,1)}
    if(u>=.45&&u<.6)for(let i=0;i<4;i++)R(g,'#6a4a2a',X-6+i*5,62+seg(u,.45,.6)*10,2,2);
    /* the basket fills up */
    const items=idx+(u>.85?1:0);
    R(g,OUT,0,60,48,24);R(g,'#b8873f',1,62,46,20);R(g,'#8f6429',1,66,46,2);R(g,'#8f6429',1,72,46,2);for(let x=3;x<46;x+=6)R(g,'#8f6429',x,62,1,20);R(g,'#d6a45a',1,62,46,2);
    for(let i=0;i<items;i++){const bx=6+i*13;R(g,OUT,bx-1,52,12,11);R(g,'#e8803a',bx,53,10,9);R(g,'#7ac46a',bx-1,48,12,5)}
    R(g,'#b8873f',1,60,46,3);R(g,'#8f6429',1,60,46,1);
    vignette(g,.2);
  },
  /* EAT: first person at a table. Spear a bite, raise the fork past your face (out the bottom), twice, then a drink. */
  'eat:plate'(g,t,p){
    woodTop(g,0,'#8a6a4a','#6a4c30');R(g,'#c24a3a',0,0,160,10);for(let x=0;x<160;x+=8)R(g,'#f4f2ea',x,0,4,10);R(g,'rgba(255,240,200,.1)',30,14,100,60);
    const bites=p<.33?0:p<.66?1:2,PX=70,PY=44;
    ell(g,OUT,PX,PY,32,18);ell(g,'#f4f2ea',PX,PY,31,17);ell(g,'#dad6c8',PX,PY+1,22,11);ell(g,'#f4f2ea',PX,PY+1,19,9);
    const food=[()=>{ell(g,OUT,PX-12,PY-3,8,5);ell(g,'#c4813a',PX-12,PY-3,7,4);ell(g,'#d8a04c',PX-13,PY-4,4,2)},()=>{for(const [dx,dy] of [[2,-6],[8,-4],[5,-1],[11,-6]]){ell(g,OUT,PX+dx,PY+dy,4,3);ell(g,'#5ab04a',PX+dx,PY+dy,3,2)}},()=>{ell(g,OUT,PX+2,PY+5,9,4);ell(g,'#8a3a2a',PX+2,PY+5,8,3);ell(g,'#b85a40',PX+1,PY+4,5,1)}];
    if(bites<1)food[0]();food[1]();if(bites<2)food[2]();    steam(g,PX,PY-8,t,4);
    /* the drink */
    const drinkU=seg(p,.66,1),dk=drinkU<.2?0:drinkU<.55?ease(seg(drinkU,.2,.55)):drinkU<.7?1:1-ease(seg(drinkU,.7,1));
    const mx=120,my=lerp(30,100,dk);
    R(g,OUT,mx-9,my-12,18,22);R(g,'#c9a46a',mx-8,my-11,16,20);R(g,'#8a5a3a',mx-8,my-6,16,3);R(g,'#e8d890',mx-8,my-11,16,5);R(g,OUT,mx+9,my-8,6,12);R(g,'#c9a46a',mx+9,my-7,4,10);
    /* the fork */
    let hx,hy,food_on=false;
    if(p<.66){const u=(p%.33)/.33,k=ease(seg(u,0,.3));if(u<.3){hx=lerp(122,PX+8,k);hy=lerp(94,PY+2,k)}else if(u<.4){hx=PX+8;hy=PY+3;food_on=true}else if(u<.85){const q=ease(seg(u,.4,.85));hx=lerp(PX+8,66,q);hy=lerp(PY+3,98,q);food_on=true}else{hx=130;hy=96}}
    else{const u=seg(p,.66,.8);hx=lerp(130,mx,ease(u));hy=lerp(96,my+2,ease(u));if(dk>0){hx=mx+2;hy=my+4}}
    if(p<.66){const fx=hx-12,fy=hy-14;ln(g,OUT,hx,hy,fx,fy,4);ln(g,'#c9ced3',hx,hy,fx,fy,2);for(let i=-1;i<=1;i++)R(g,'#c9ced3',fx+i*2-1,fy-5,1,5);R(g,OUT,fx-3,fy-6,7,2);if(food_on){R(g,OUT,fx-3,fy-9,8,6);R(g,bites===0?'#c4813a':'#8a3a2a',fx-2,fy-8,6,4)}}
    arm(g,hx,hy,hx+24,96,{fist:true});
    if(p>.5&&p<.56||p>.17&&p<.23)glint(g,66,92,.5);
    vignette(g,.3);
  },
  /* EAT: first person into a big pot. Stir, lift the spoon to look, dip it back, one huge bubble pops. */
  'eat:cook'(g,t,p){
    bgHearth(g,t);R(g,'rgba(20,10,6,.35)',0,0,160,80);R(g,'#6e5436',0,60,160,20);
    const cx=80,cy=46;ell(g,OUT,cx,cy,54,32);ell(g,'#6a727c',cx,cy,53,31);ell(g,'#8a929c',cx,cy-1,52,29);ell(g,OUT,cx,cy+1,46,25);ell(g,'#8a4a22',cx,cy+1,45,24);ell(g,'#b8642a',cx,cy,41,21);
    const sw=t/260;for(let i=0;i<3;i++){const a=sw*1.4+i*2.1;R(g,'rgba(255,200,120,.35)',cx+Math.cos(a)*(16+i*7)-4,cy+Math.sin(a)*(8+i*3),9,1)}
    for(let i=0;i<7;i++){const a=sw*.9+i*0.9,r=12+(i%3)*8,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.5;R(g,OUT,x-3,y-3,7,6);R(g,['#7ac46a','#e8803a','#c4813a'][i%3],x-2,y-2,5,4)}
    for(let i=0;i<5;i++){const q=((t/500)+i*.2)%1,x=cx-30+((i*29)%60),y=cy-8+((i*13)%16);if(q<.6){ell(g,'rgba(255,210,150,.8)',x,y,1+Math.round(q*3),1+Math.round(q*2))}}
    const stir=p<.5,lift=seg(p,.5,.72),dip=seg(p,.72,.82);
    let tx,ty;
    if(stir){const a=p*Math.PI*6;tx=cx+Math.cos(a)*14;ty=cy+4+Math.sin(a)*7}
    else if(p<.72){const k=ease(lift);tx=lerp(cx+14,cx+2,k);ty=lerp(cy+4,16,k)}
    else if(p<.82){const k=ease(dip);tx=lerp(cx+2,cx+8,k);ty=lerp(16,cy+4,k)}
    else{const a=(p-.82)*9;tx=cx+8+Math.cos(a)*5;ty=cy+4}
    const hx=lerp(tx+34,130,.4),hy=Math.max(70,ty+34);
    ln(g,OUT,tx,ty,hx,hy,6);ln(g,'#b88a54',tx,ty,hx,hy,4);ln(g,'#d6a870',tx,ty-1,lerp(tx,hx,.5),lerp(ty,hy,.5)-1,1);
    ell(g,OUT,tx,ty,6,5);ell(g,'#b88a54',tx,ty,5,4);if(p>=.5&&p<.82)ell(g,'#b8642a',tx,ty,4,3);
    if(p>=.55&&p<.75)for(let i=0;i<3;i++){const q=((t/180)+i*.33)%1;R(g,'#b8642a',tx-1,ty+4+q*16,2,3)}
    arm(g,hx,hy,hx+10,92,{fist:true});
    /* the big bubble at the end */
    const bub=seg(p,.82,.93),pop=seg(p,.93,1);
    if(bub>0&&pop<=0){const r=Math.round(2+bub*9);ell(g,OUT,cx-22,cy+8,r+1,r+1);ell(g,'#d8803a',cx-22,cy+8,r,r);ell(g,'#ffd29a',cx-24,cy+6,Math.max(1,r-5),Math.max(1,r-5))}
    if(pop>0){burst(g,cx-22,cy+8,pop*.35,9,['#d8803a','#ffd29a','#b8642a'],34);puff(g,cx-22,cy,pop,'250,236,220');puff(g,cx-6,cy-4,pop*.9,'250,236,220')}
    for(let i=0;i<4;i++){const q=((t/900)+i*.25)%1,x=cx-24+i*16+Math.sin(q*6+i)*4,y=cy-26-q*30,s=7+Math.round(q*10);R(g,'rgba(240,244,248,'+(.5*(1-q)).toFixed(2)+')',x-s/2,y,s,s)}
    vignette(g,.4);
  },
  /* NATURE: over the shoulder in a rowboat, two strokes. Hands in, blades sweep back, splash, lift, forward again. */
  'nature:boat'(g,t,p){
    const n=2,u=(p*n)%1,pull=u<.5?ease(u*2):0,rec=u>=.5?ease((u-.5)*2):0,k=u<.5?pull:1-rec;
    const bob=Math.round(Math.sin(t/300)*1.5);
    R(g,'#8cc4e4',0,0,160,24);R(g,'#b4d9ee',0,24,160,10);disc(g,'#f6e8a0',28,16,6);disc(g,'#fff4b8',28,16,4);cloud(g,(t/130)%190-30,8,'#f4f8fb');
    const ix=120-(p*14);R(g,'#5a7a6a',ix,28,26,6);R(g,'#4a6a5a',ix+6,24,12,5);
    sea(g,34,80,'#2f6a86','#5aa0bc',t);for(let y=40;y<80;y+=8)for(let x=0;x<160;x+=26){const o=(x*3+y*5+Math.floor(t/70))%26;R(g,'#7fb8d0',(x+o)%160,y+((x/26)|0)%3,6+Math.floor((y-34)/8),1)}
    /* the boat: two rails coming together ahead of you */
    ln(g,OUT,0,84+bob,56,46+bob,9);ln(g,'#8a5a30',0,84+bob,56,46+bob,6);ln(g,OUT,160,84+bob,104,46+bob,9);ln(g,'#8a5a30',160,84+bob,104,46+bob,6);
    R(g,'#6a4220',20,60+bob,120,22);R(g,'#7a4a28',56,50+bob,48,10);for(let x=26;x<140;x+=12)R(g,'#5a3818',x,60+bob,1,20);R(g,OUT,22,70+bob,116,5);R(g,'#b07a44',23,71+bob,114,3);
    const L=scLook(),B=backView(g,80,84+bob);
    const lockL=[40,60+bob],lockR=[120,60+bob];
    const hL=[lerp(66,70,k),lerp(64,52,k)+bob],hR=[lerp(94,90,k),lerp(64,52,k)+bob];
    const bl=[lockL[0]-(hL[0]-lockL[0])*.9,lockL[1]-(hL[1]-lockL[1])*.9+(1-k)*10-6],br=[lockR[0]-(hR[0]-lockR[0])*.9,lockR[1]-(hR[1]-lockR[1])*.9+(1-k)*10-6];
    const oar=(h,b,side)=>{ln(g,OUT,h[0],h[1],b[0],b[1],5);ln(g,'#c9a46a',h[0],h[1],b[0],b[1],3);R(g,OUT,b[0]-5,b[1]-3,12,8);R(g,'#b08850',b[0]-4,b[1]-2,10,6);R(g,'#d6b27a',b[0]-4,b[1]-2,10,2)};
    oar(hL,bl);oar(hR,br);
    oArm(g,B.sl,hL,L);oArm(g,B.sr,hR,L);
    for(const l of [lockL,lockR]){R(g,OUT,l[0]-3,l[1]-3,7,7);R(g,'#8a929c',l[0]-2,l[1]-2,5,5)}
    if(u>=.42&&u<.62){const dt=(u-.42)*(SCENE_MS.nature/n)/1000;burst(g,bl[0],bl[1]+4,dt,7,['#e8f6ff','#bfe2f2'],28);burst(g,br[0],br[1]+4,dt,7,['#e8f6ff','#bfe2f2'],28)}
    vignette(g,.12);
  },
  /* EAT: over the shoulder at a tavern bar. Raise, CLINK, foam, both drink, the patron wipes their lip. */
  'eat:drink'(g,t,p){
    bgBar(g,t);
    const pat=mkLook('#9a6240','#7a7f8a',6,'#8a4a3a'),clink=p>.34&&p<.5;
    const rise=ease(seg(p,.1,.34)),drinkK=ease(seg(p,.52,.7)),down=ease(seg(p,.8,.92)),wipe=p>.8?Math.sin((p-.8)*40)*2:0;
    const lift=drinkK*(1-down);
    const px=116,P=figure(g,px,64,{d:-1,look:pat,fh:[clink||p<.52?lerp(12,22,rise):lerp(22,6,lift),clink||p<.52?lerp(7,-2,rise):lerp(-2,-14,lift)+wipe],bh:[5,9]});
    R(g,'#6a4a2a',0,56,160,24);R(g,'#8a6a4a',0,56,160,5);R(g,'#4a3722',0,66,160,1);
    const mugAt=(x,y,tilt)=>{R(g,OUT,x-5,y-6,11,13);R(g,'#e8c96a',x-4,y-5,9,11);R(g,'#fff6d0',x-4,y-5-(tilt?0:3),9,tilt?3:5);R(g,'#c4a24a',x-3,y+1,7,1)};
    const L=scLook(),B=backView(g,38,84);
    const mx=lerp(46,76,rise*(p<.52?1:1)),my=lerp(54,40,rise);
    const myMug=p<.52?[mx,my]:[lerp(76,38,lift),lerp(40,34,lift)];
    const patMug=[P.F[0]-1,P.F[1]-3];
    mugAt(patMug[0],patMug[1],drinkK>.3);
    mugAt(myMug[0],myMug[1],drinkK>.3);
    oArm(g,B.sr,[myMug[0]-1,myMug[1]+4],L);
    if(clink)burst(g,(patMug[0]+myMug[0])/2,Math.min(patMug[1],myMug[1])-6,(p-.34)*(SCENE_MS.eat)/1000,10,['#fff6d0','#ffe08a','#fff'],34);
    if(clink)glint(g,(patMug[0]+myMug[0])/2,Math.min(patMug[1],myMug[1])-6,seg(p,.34,.5));
    vignette(g,.22);
  }
};
