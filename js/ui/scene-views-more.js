"use strict";
/* More camera-view scenes, added to SCENE_KITS: purchase, gamble, sneaky, travel, paper, build, social and jail bars.
   Same rule as scene-views.js: set up, anticipate, act, payoff frame, reset. Outcomes of a gamble are not known yet when the scene plays,
   so gambling ends on a charged still moment (lights, a settling ball, cards turning) and not on a win or a loss. */
const NPC_LOOKS={
  merchant:()=>mkLook('#b07a50','#2a2018',0,'#6a8a52'),dealer:()=>mkLook('#e0b68a','#2a2118',2,'#22222c'),
  friend:()=>mkLook('#c88a60','#3a2418',1,'#a0603a'),stern:()=>mkLook('#6a4630','#d8d8d8',2,'#4a4f58'),
  guard:()=>mkLook('#c09070','#2a2a2a',2,'#3a4a6a'),mark:()=>mkLook('#e0b68a','#6a4a2a',0,'#7a6a8a')
};
function sym(g,k,x,y){
  if(k===0){ln(g,'#3a7a2a',x-3,y+2,x,y-6,1);ln(g,'#3a7a2a',x+3,y+3,x,y-6,1);disc(g,OUT,x-3,y+3,3);disc(g,'#d33a2c',x-3,y+3,2);disc(g,OUT,x+3,y+4,3);disc(g,'#d33a2c',x+3,y+4,2);R(g,'#fff',x-4,y+2,1,1)}
  else if(k===1){R(g,OUT,x-6,y-6,13,3);R(g,'#d33a2c',x-5,y-5,11,2);ln(g,OUT,x+4,y-4,x-2,y+6,4);ln(g,'#d33a2c',x+4,y-4,x-2,y+6,2)}
  else if(k===2){R(g,OUT,x-7,y-3,15,8);R(g,'#f4f2ea',x-6,y-2,13,6);R(g,'#151720',x-4,y-1,2,4);R(g,'#151720',x,y-1,2,4);R(g,'#151720',x+4,y-1,2,4)}
  else if(k===3){disc(g,OUT,x,y,6);disc(g,'#f2b84b',x,y,5);R(g,OUT,x-6,y+4,13,3);R(g,'#f2b84b',x-5,y+5,11,1);R(g,'#8a5a10',x,y+5,2,3);R(g,'#fff1b0',x-3,y-3,2,2)}
  else{ell(g,OUT,x,y,7,5);ell(g,'#f2e04a',x,y,6,4);R(g,'#fff6a0',x-3,y-2,3,1);R(g,'#8aa83a',x+6,y-1,2,2)}
}
function card(g,x,y,face,k,flip){
  const w=flip==null?14:Math.max(1,Math.round(14*Math.abs(flip)));x+=(14-w)>>1;
  R(g,OUT,x-1,y-1,w+2,22);
  if(!face||(flip!=null&&flip<0)){R(g,'#2a4a8a',x,y,w,20);if(w>6){R(g,'#4a6ab0',x+2,y+2,w-4,16);for(let i=0;i<4;i++)R(g,'#2a4a8a',x+3,y+4+i*4,w-6,1)}return}
  R(g,'#f6f2e8',x,y,w,20);if(w<8)return;
  const red=k%2===0;R(g,red?'#c0302a':'#151720',x+2,y+2,3,1);R(g,red?'#c0302a':'#151720',x+3,y+1,1,3);
  if(red){disc(g,'#c0302a',x+w/2-2,y+10,2);disc(g,'#c0302a',x+w/2+2,y+10,2);ln(g,'#c0302a',x+w/2-4,y+11,x+w/2,y+16,2);ln(g,'#c0302a',x+w/2+4,y+11,x+w/2,y+16,2)}
  else{ln(g,'#151720',x+w/2,y+7,x+w/2,y+16,2);disc(g,'#151720',x+w/2-2,y+12,2);disc(g,'#151720',x+w/2+2,y+12,2);R(g,'#151720',x+w/2-2,y+16,5,1)}
}
function travelBG(g,t,sp,night){
  R(g,night?'#1c2a44':'#8cc4e4',0,0,160,26);R(g,night?'#2a3c5c':'#b4d9ee',0,26,160,16);disc(g,night?'#e8e4c8':'#f6e8a0',130,12,5);
  for(let i=0;i<5;i++){const x=((i*52-t*sp*.15)%260+260)%260-50;ell(g,night?'#2a4a4a':'#8cb87a',x,46,44,14)}
  for(let i=0;i<7;i++){const x=((i*41-t*sp*.45)%290+290)%290-30;R(g,OUT,x+3,30,5,18);R(g,'#6a4a2a',x+4,34,3,14);disc(g,OUT,x+5,30,9);disc(g,night?'#2a5a3a':'#4a8a3a',x+5,30,8);disc(g,night?'#3a6a4a':'#6aaa5a',x+3,27,4)}
  R(g,'#8a7a62',0,56,160,24);R(g,'#a89878',0,56,160,3);R(g,OUT,0,59,160,1);
  for(let x=-((t*sp)%40);x<160;x+=40)R(g,'#d8cfa8',x,70,18,2);
  const sx=190-t*sp;if(sx>-14&&sx<166){R(g,OUT,sx-1,34,5,26);R(g,'#8a5a30',sx,35,3,25);R(g,OUT,sx-10,36,23,9);R(g,'#c9a46a',sx-9,37,21,7);R(g,'#5a4128',sx-7,40,14,1);R(g,OUT,sx+9,38,7,5)}
}
Object.assign(SCENE_KITS,{
  /* PURCHASE: you put coins down, the shopkeeper's hand sweeps them up and sets a parcel down, you take it and it goes to your bag. */
  'purchase:'(g,t,p){
    R(g,'#3a2f3a',0,0,160,40);for(let y=6;y<38;y+=14){R(g,'#5a4128',0,y+9,160,3);for(let x=6;x<160;x+=14){const c=['#c24a3a','#d8b04a','#5a9a4a','#7a6ab0','#d8d8d8'][((x/14|0)+y)%5];R(g,OUT,x,y,10,9);R(g,c,x+1,y+1,8,7)}}
    R(g,'rgba(10,8,12,.5)',0,0,160,40);woodTop(g,38,'#8a6a4a','#6a4c30');R(g,'#a98a62',0,38,160,3);R(g,'rgba(255,230,160,.08)',30,38,100,42);
    const sm=NPC_LOOKS.merchant(),give=ease(seg(p,0,.2)),away=ease(seg(p,.24,.38)),sweep=ease(seg(p,.4,.52)),pull=ease(seg(p,.52,.62)),bring=ease(seg(p,.62,.76)),leave=ease(seg(p,.8,.9)),grab=ease(seg(p,.8,.9)),fly=ease(seg(p,.9,1));
    const coinAt=(x,y)=>{R(g,OUT,x-1,y-1,7,6);R(g,'#f2b84b',x,y,5,4);R(g,'#fff1b0',x,y,3,1)};
    /* coins on the counter */
    if(p>=.16&&p<.62){const k=p<.52?0:pull;for(let i=0;i<3;i++)coinAt(lerp(58+i*6,112,k),lerp(52-(i%2)*3,8,k))}
    if(p<.38){const hx=lerp(10,56,give)-away*50,hy=lerp(88,54,give)+away*34;arm(g,hx,hy,hx-22,96,{fist:p>.14})}
    /* the shopkeeper's hand */
    if(p>=.38&&p<.88){let hx,hy;
      if(p<.52){hx=lerp(112,64,sweep);hy=lerp(2,48,sweep)}else if(p<.62){hx=lerp(64,112,pull);hy=lerp(48,2,pull)}else if(p<.76){hx=lerp(112,94,bring);hy=lerp(2,42,bring)}else{hx=94+leave*20;hy=42-leave*44}
      arm(g,hx,hy,hx+12,-16,{look:sm,fist:p<.62||p<.76})}
    /* the parcel */
    const parcel=(x,y,s)=>{R(g,OUT,x-1,y-1,16*s+2,14*s+2);R(g,'#b8873f',x,y,16*s,14*s);R(g,'#8f6429',x,y+5*s,16*s,2*s);R(g,'#d6a45a',x,y,16*s,2*s);R(g,'#c24a3a',x+7*s,y,2*s,14*s)};
    if(p>=.66&&p<.8){const k=p<.76?bring:1;parcel(88,lerp(14,48,k)+(p>.74&&p<.78?-2:0),1)}
    else if(p>=.8&&p<.9)parcel(88,48,1);
    else if(p>=.9&&p<1){const s=1-fly*.7;parcel(lerp(88,150,fly),lerp(48,70,fly),s)}
    if(p>=.78&&p<.92){const hx=lerp(142,96,grab),hy=lerp(90,56,grab);arm(g,hx,hy,hx+22,96,{fist:grab>.8})}
    if(p>=.9&&p<1){const hx=lerp(96,150,fly),hy=lerp(56,86,fly);arm(g,hx,hy,hx+22,100,{fist:true})}
    if(p>=.62&&p<.72)glint(g,96,42,seg(p,.62,.72));if(p>=.92)glint(g,150,70,seg(p,.92,1));
    vignette(g,.3);
  },
  /* GAMBLE: slot machine. Pull the lever, the reels spin and stop one by one, the lights flicker. */
  'gamble:slots'(g,t,p){
    R(g,'#1a1220',0,0,160,80);for(let x=0;x<160;x+=12)R(g,'#221830',x,0,5,80);
    R(g,OUT,26,2,108,80);R(g,'#8a1f2a',27,3,106,79);R(g,'#b8303a',27,3,106,5);R(g,'#5a1018',27,70,106,12);
    for(let i=0;i<12;i++){const on=(Math.floor(t/110)+i)%3===0;R(g,OUT,30+i*8,10,6,6);R(g,on?'#ffe08a':'#7a5a20',31+i*8,11,4,4)}
    R(g,OUT,42,22,76,36);R(g,'#10101a',43,23,74,34);
    const final=[3,1,0],stops=[.5,.64,.78];
    for(let i=0;i<3;i++){const x=48+i*24,sp=p<stops[i];R(g,'#e8ecf0',x,25,22,30);R(g,'#c9ced3',x,25,22,3);R(g,'#c9ced3',x,52,22,3);
      if(sp){const off=(t*(.5+i*.08))%42;for(let r=-1;r<3;r++){sym(g,(Math.floor((t*.5)/42)+r+i*2+5)%5,x+11,25+r*21+off-10)}R(g,'rgba(255,255,255,.35)',x,25,22,30)}
      else{const bump=p<stops[i]+.04?Math.round(Math.sin((p-stops[i])*80)*2):0;sym(g,final[i],x+11,40+bump)}}
    R(g,'rgba(10,10,20,.5)',43,23,74,4);R(g,'rgba(10,10,20,.5)',43,53,74,4);
    R(g,OUT,60,60,40,7);R(g,'#2a2e34',61,61,38,5);
    R(g,OUT,136,36,6,32);R(g,'#8a929c',137,37,4,30);
    const pullK=ease(seg(p,.1,.28))*(1-ease(seg(p,.3,.44))),ky=22+pullK*26;
    R(g,OUT,137,ky+4,5,40-pullK*26);R(g,'#b9bfc6',138,ky+4,3,40-pullK*26);disc(g,OUT,139,ky,6);disc(g,'#d33a2c',139,ky,5);disc(g,'#ff8a80',138,ky-2,2);
    const hy=ky+4;arm(g,139,hy+4,152,96,{fist:p>.06&&p<.46});
    if(p>.84){const k=seg(p,.84,1);if(Math.floor(t/90)%2)R(g,'rgba(255,230,140,.35)',27,3,106,79);for(let i=0;i<5;i++)glint(g,46+i*18,24+(i%2)*28,(k+i*.2)%1)}
    vignette(g,.3);
  },
  /* GAMBLE: roulette. Place a chip, the wheel spins and the ball circles and drops into a pocket. */
  'gamble:wheel'(g,t,p){
    R(g,'#1f5a3a',0,0,160,80);for(let x=0;x<160;x+=20)R(g,'#2a6a46',x,0,1,80);for(let y=0;y<80;y+=20)R(g,'#2a6a46',0,y,160,1);
    for(let i=0;i<3;i++){R(g,OUT,10+i*16,10,13,13);R(g,i===1?'#d33a2c':'#151720',11+i*16,11,11,11);R(g,'#e8e0c8',14+i*16,14,5,5)}
    const cx=104,cy=40,spin=1-Math.pow(1-seg(p,.12,1),2),rot=spin*Math.PI*10;
    disc(g,OUT,cx,cy,35);disc(g,'#6a4220',cx,cy,34);disc(g,'#8a5a30',cx,cy,31);disc(g,OUT,cx,cy,28);disc(g,'#10101a',cx,cy,27);
    for(let k=0;k<24;k++){const a=rot+k*Math.PI/12,x=cx+Math.cos(a)*23,y=cy+Math.sin(a)*23;R(g,k===0?'#2f8a4a':k%2?'#d33a2c':'#2a2e34',x-2,y-2,5,5)}
    disc(g,OUT,cx,cy,16);disc(g,'#b8841e',cx,cy,15);disc(g,'#f2b84b',cx,cy,13);disc(g,'#8a5a10',cx,cy,3);ln(g,'#8a5a10',cx-12,cy,cx+12,cy,1);ln(g,'#8a5a10',cx,cy-12,cx,cy+12,1);
    const ba=-t/150*(1.4-seg(p,.3,.85)),br=lerp(30,23,ease(seg(p,.55,.85))),settle=p>.85,bx=cx+Math.cos(settle?rot:ba)*br,by=cy+Math.sin(settle?rot:ba)*br;
    R(g,OUT,bx-3,by-3,6,6);R(g,'#fff',bx-2,by-2,4,4);R(g,'#c9ced3',bx-2,by,4,2);
    if(p>=.55&&p<.7){const k=seg(p,.55,.7);for(let i=0;i<3;i++)R(g,'#fff',bx+Math.cos(i*2+4)*k*5,by+Math.sin(i*2+4)*k*5,1,1)}
    if(p>.88)glint(g,bx,by,seg(p,.88,1));
    const give=ease(seg(p,0,.14)),away=ease(seg(p,.14,.26));
    if(p<.26){const hx=lerp(10,38,give)-away*30,hy=lerp(90,50,give)+away*40;arm(g,hx,hy,hx-22,96,{fist:p>.08});if(p>.1){for(let i=0;i<3;i++){R(g,OUT,36-1,52-i*3-1,12,5);R(g,'#c0302a',36,52-i*3,10,3);R(g,'#f4f2ea',38,52-i*3,2,3)}}}
    else for(let i=0;i<3;i++){R(g,OUT,36-1,52-i*3-1,12,5);R(g,'#c0302a',36,52-i*3,10,3);R(g,'#f4f2ea',38,52-i*3,2,3)}
    vignette(g,.3);
  },
  /* GAMBLE: cards. Chip down, the dealer deals, you peek at a corner, the dealer turns a card. */
  'gamble:cards'(g,t,p){
    R(g,'#1f5a3a',0,0,160,80);R(g,'#2a6a46',0,0,160,3);ell(g,'#2a6a46',80,70,70,12);
    const dl=NPC_LOOKS.dealer(),dealt=[.2,.32,.44,.54],tp=ease(seg(p,.08,.2));
    for(let i=0;i<3;i++){R(g,OUT,128-1,58-i*3-1,12,5);R(g,'#2f6ab0',128,58-i*3,10,3);R(g,'#f4f2ea',130,58-i*3,2,3)}
    if(p>=dealt[0])card(g,56,42,true,1);if(p>=dealt[1])card(g,72,44,true,2);
    if(p>=dealt[2])card(g,68,6,true,3);if(p>=dealt[3])card(g,84,6,p>.8?true:false,4,p>.74&&p<.9?Math.cos(seg(p,.74,.9)*Math.PI):null);
    const peek=ease(seg(p,.6,.7))*(1-ease(seg(p,.72,.8)));
    if(p<.2){const hx=lerp(140,132,tp),hy=lerp(92,62,tp);arm(g,hx,hy,hx+10,100,{fist:true})}
    else if(p<.82){const hx=lerp(130,70,peek),hy=lerp(96,58,peek)+(1-peek)*40;arm(g,hx+Math.round(peek*0),hy,hx+20,100,{fist:peek>0})}
    /* the dealer's hand, from the top */
    let dx=100,dy=-10;
    if(p>=.18&&p<.58){const k=((p-.18)/.4*4)%1;dx=lerp(100,p<.36?64:76,Math.sin(k*Math.PI));dy=lerp(-8,p<.36?34:36,Math.sin(k*Math.PI))}
    else if(p>=.72&&p<.92){const k=Math.sin(seg(p,.72,.92)*Math.PI);dx=lerp(100,90,k);dy=lerp(-8,14,k)}
    if(p>=.16&&p<.94)arm(g,dx,dy,dx+14,-16,{look:dl});
    if(p>.84&&p<.98)glint(g,92,16,seg(p,.84,.98));
    vignette(g,.3);
  },
  /* SNEAKY: peeking round a corner. A passer-by crosses the street, you duck back, wait, peek again. */
  'sneaky:peek'(g,t,p){
    R(g,'#101a2c',0,0,160,36);R(g,'#1c2a44',0,36,160,22);
    for(let i=0;i<8;i++){const h=18+((i*37)%26);R(g,'#0c1220',i*22-4,56-h,18,h);for(let k=0;k<4;k++)if(rn(i*9+k)>.5)R(g,'#f2d77a',i*22+((k%2)*7),56-h+4+Math.floor(k/2)*8,3,3)}
    R(g,'#232a36',0,56,160,24);R(g,'#2e3644',0,56,160,3);R(g,OUT,120,18,3,40);R(g,'#4a4f58',121,18,1,40);R(g,'#ffe08a',116,14,12,5);R(g,'rgba(255,224,140,.14)',100,14,44,46);
    const nx=lerp(-14,176,p);figure(g,nx,64,{d:1,ph:(t/420)%1,look:NPC_LOOKS.mark()});R(g,'rgba(10,14,28,.35)',0,0,160,80);
    const peekK=p<.12?0:p<.4?ease(seg(p,.12,.4)):p<.55?1:p<.68?1-ease(seg(p,.55,.68)):p<.8?0:ease(seg(p,.8,.95));
    const ex=Math.round(lerp(118,66,peekK));
    g.save();g.beginPath();g.rect(0,0,ex,80);g.clip();bricks(g,'#5a4a44','#3a2e2a',0,80);R(g,'rgba(10,8,12,.25)',0,0,ex,80);g.restore();
    R(g,OUT,ex-1,0,2,80);R(g,'#8a766a',ex-3,0,2,80);R(g,'#2a2220',ex-8,0,5,80);
    const nerv=peekK<.1?Math.round(Math.sin(t/60)):0;
    arm(g,ex-4+nerv,56,ex-30,96,{fist:true});arm(g,ex-6,68,ex-40,100,{fist:true});
    R(g,'rgba(0,0,0,'+((1-peekK)*.3).toFixed(2)+')',0,0,160,80);vignette(g,.4);
  },
  /* SNEAKY: lifting something. The hand creeps in, freezes while the owner looks, grabs, and snatches back. */
  'sneaky:grab'(g,t,p){
    R(g,'#1c1822',0,0,160,80);for(let x=6;x<160;x+=22){R(g,'#2a2230',x,6,14,26);R(g,'#3a2f3a',x,6,14,2)}
    const watching=p>=.44&&p<.6,own=NPC_LOOKS.merchant();
    figure(g,126,60,{d:watching?-1:1,look:own});
    woodTop(g,56,'#6a4a2a','#4a3220');R(g,'#8a6a4a',0,56,160,3);R(g,'rgba(8,6,12,.45)',0,0,160,80);
    if(watching)R(g,'rgba(200,30,30,.10)',0,0,160,80);
    const wx=84,wy=58;const taken=p>=.66;
    if(!taken||p<.88){let hx,hy,fist=false;
      if(p<.44){const k=ease(seg(p,0,.44));hx=lerp(60,wx,k);hy=lerp(96,wy+8,k)}
      else if(p<.6){hx=wx+Math.round(Math.sin(t/50)*(watching?1:0));hy=wy+8}
      else if(p<.68){hx=wx;hy=wy+8;fist=true}
      else{const k=ease(seg(p,.68,.9));hx=lerp(wx,100,k);hy=lerp(wy+8,100,k);fist=true}
      if(!taken||p<.88){if(!taken)R(g,OUT,wx-9,wy-6,18,11);if(!taken){R(g,'#6a3a22',wx-8,wy-5,16,9);R(g,'#8a5a3a',wx-8,wy-5,16,2);R(g,'#f2b84b',wx-1,wy-2,3,3)}
        arm(g,hx,hy,hx-14,100,{fist});
        if(taken){R(g,OUT,hx-9,hy-7,18,11);R(g,'#6a3a22',hx-8,hy-6,16,9);R(g,'#f2b84b',hx-1,hy-3,3,3)}}}
    if(p>=.66&&p<.74)glint(g,wx,wy-2,seg(p,.66,.74));
    vignette(g,.45);
  },
  /* TRAVEL: on foot, a pack on your back, the road scrolls by, a signpost passes, then a whip to the destination. */
  'travel:walk'(g,t,p){
    travelBG(g,t,.09);
    R(g,OUT,48,42,8,15);R(g,'#8a6a3a',49,43,6,13);R(g,'#6a4a22',49,43,6,2);R(g,'#c24a3a',49,50,6,3);
    figure(g,60,68,{d:1,ph:(t/340)%1,fh:[7,6],bh:[3,10]});
    whip(g,p);
  },
  /* TRAVEL: riding the tram past the trees. */
  'travel:tram'(g,t,p){
    travelBG(g,t,.14);const sh=Math.round(Math.sin(t/55)*.8);
    R(g,OUT,0,62,160,2);R(g,'#4a4f58',0,63,160,1);R(g,'#4a4f58',0,67,160,1);
    R(g,OUT,26,32+sh,108,32);R(g,'#c24a3a',27,33+sh,106,30);R(g,'#f0e8d0',27,48+sh,106,10);R(g,'#8a2a22',27,59+sh,106,4);R(g,'#e8d0a0',27,33+sh,106,2);
    for(let i=0;i<5;i++){R(g,OUT,32+i*21,36+sh,17,15);R(g,'#9ac8e0',33+i*21,37+sh,15,13);R(g,'#c8e4f0',33+i*21,37+sh,15,3)}
    const L=scLook();const wx=33+2*21;R(g,L.skin,wx+4,42+sh,7,7);R(g,L.hair,wx+3,40+sh,9,4);R(g,L.cloth,wx+2,49+sh,11,2);R(g,OUT,wx+8,44+sh,1,2);
    R(g,'#5a5f68',68,30+sh,24,2);ln(g,OUT,80,32+sh,96,14,1);R(g,'#2a2e34',0,13,160,1);
    for(const x of [40,64,96,120]){disc(g,OUT,x,64,5);disc(g,'#3a3d44',x,64,4);R(g,'#9aa0a6',x-1+Math.round(Math.cos(t/60)*2),63,2,2)}
    whip(g,p);
  },
  /* TRAVEL: a taxi, window down, scenery rushing by. */
  'travel:taxi'(g,t,p){
    travelBG(g,t,.16);const sh=Math.round(Math.sin(t/45)*.8);
    R(g,OUT,36,44+sh,90,22);R(g,'#f2c84a',37,45+sh,88,20);R(g,'#d8a82a',37,59+sh,88,6);R(g,OUT,52,32+sh,52,14);R(g,'#f2c84a',53,33+sh,50,12);
    R(g,OUT,56,35+sh,20,10);R(g,'#9ac8e0',57,36+sh,18,8);R(g,OUT,80,35+sh,20,10);R(g,'#9ac8e0',81,36+sh,18,8);
    const L=scLook();R(g,L.skin,62,38+sh,6,6);R(g,L.hair,61,36+sh,8,3);R(g,OUT,65,40+sh,1,2);
    R(g,'#151720',108,34+sh,12,4);R(g,'#f2f2f2',72,30+sh,16,3);R(g,'#151720',74,31+sh,12,1);R(g,'#ffe08a',124,52+sh,4,4);
    for(const x of [54,106]){disc(g,OUT,x,66,7);disc(g,'#2a2e34',x,66,6);disc(g,'#9aa0a6',x,66,3);R(g,'#c9ced3',x-1+Math.round(Math.cos(t/40)*3),65+Math.round(Math.sin(t/40)*3),2,2)}
    for(let i=0;i<4;i++)R(g,'rgba(255,255,255,.25)',((t*.4+i*50)%190)*-1+170,50+i*5,18,1);
    whip(g,p);
  },
  /* PAPER: your hands unfold a sheet, a finger traces one line, and it folds away again. */
  'paper:'(g,t,p){
    woodTop(g,0,'#6a4a2a','#4a3220');R(g,'rgba(255,230,160,.08)',20,0,120,80);
    const open=ease(seg(p,.05,.3))*(1-ease(seg(p,.8,.95))),w=Math.round(lerp(26,116,open)),h=Math.round(lerp(18,68,open)),cx=80,cy=Math.round(lerp(58,40,open));
    R(g,OUT,cx-w/2-1,cy-h/2-1,w+2,h+2);R(g,'#efe6c8',cx-w/2,cy-h/2,w,h);R(g,'#d8cba4',cx-w/2,cy+h/2-3,w,3);R(g,'#fffbe8',cx-w/2,cy-h/2,w,2);
    if(open<.95)R(g,'#c9bd98',cx,cy-h/2,1,h);
    const rows=Math.floor(h/7);
    for(let r=0;r<rows;r++){const y=cy-h/2+6+r*7,ln_=Math.round((w-18)*(.55+rn(r+2)*.45)*Math.min(1,open*1.4));R(g,'#4a3a22',cx-w/2+8,y,ln_,1);if(r===3&&p>.45&&p<.8){const tr=ease(seg(p,.45,.75));R(g,'rgba(255,224,120,.7)',cx-w/2+8,y-2,Math.round((w-18)*tr),5);R(g,'#4a3a22',cx-w/2+8,y,ln_,1)}}
    if(open>.5){R(g,'#a83a2a',cx+w/2-20,cy+h/2-18,14,10);R(g,'#7a1a1a',cx+w/2-18,cy+h/2-16,10,6)}
    const hold=p<.45||p>.8;
    const lx=cx-w/2+4,ly=cy+h/2-4;arm(g,lx,ly,lx-18,96,{fist:true});
    if(hold){const rx=cx+w/2-4;arm(g,rx,ly,rx+18,96,{fist:true})}
    else{const tr=ease(seg(p,.45,.75)),rx=cx-w/2+8+(w-18)*tr,ry=cy-h/2+6+3*7+8;arm(g,rx,ry,rx+30,96,{})}
    if(p>=.74&&p<.82)glint(g,cx+10,cy-6,seg(p,.74,.82));
    vignette(g,.3);
  },
  /* BUILD: plank after plank goes up with a hammer blow each, a final big strike and a cloud of dust, then you step back and look. */
  'build:'(g,t,p){
    bgGarden(g,t);R(g,'#7a5a38',80,66,60,4);
    const n=p<.2?0:p<.4?1:p<.6?2:3,done=p>=.75;
    for(const x of [94,126]){R(g,OUT,x-1,34,6,34);R(g,'#8a6430',x,35,4,33);R(g,'#a8803f',x,35,1,33)}
    R(g,OUT,92,32,40,5);R(g,'#8a6430',93,33,38,3);
    for(let i=0;i<n;i++){const y=60-i*8,fl=(i===n-1&&((p-.2*(i+1))*5)<.12);R(g,OUT,94,y-1,34,9);R(g,fl?'#f4d8a0':'#b8873f',95,y,32,7);R(g,'#8f6429',95,y+3,32,1);R(g,'#d6a45a',95,y,32,1)}
    if(done){for(let r=0;r<8;r++){const wdt=48-r*5;R(g,OUT,112-wdt/2-1,26-r*2-1,wdt+2,4);R(g,'#a83a2a',112-wdt/2,26-r*2,wdt,3)}R(g,'#c24a3a',92,32,40,1);R(g,OUT,106,50,12,16);R(g,'#6a4220',107,51,10,15);R(g,'#f2b84b',115,58,1,2)}
    const x=done?lerp(60,34,ease(seg(p,.78,.92))):60,hit=p<.75&&((p/.0375)%2)>1.1,standing=p>=.78;
    const f=figure(g,x,68,{d:1,fh:standing?[3,8]:hit?[10,5]:[8,-13],bh:standing?[3,8]:[5,4]});
    if(!standing){const hx=f.F[0],hy=f.F[1];ln(g,OUT,hx,hy,hx+9,hy-9,4);ln(g,'#8a6430',hx,hy,hx+9,hy-9,2);R(g,OUT,hx+6,hy-15,10,8);R(g,'#8a929c',hx+7,hy-14,8,6);R(g,'#c9ced3',hx+7,hy-14,8,2)}
    for(const [a,b] of [[.2,.3],[.4,.5],[.6,.7]])if(p>=a&&p<b)puff(g,110,62,seg(p,a,b),'210,190,150');
    if(p>=.75&&p<.9){puff(g,100,62,seg(p,.75,.9),'210,190,150');puff(g,124,62,seg(p,.75,.9)*.9,'210,190,150')}
    if(p>=.84)glint(g,112,22,seg(p,.84,1));
  },
  /* SOCIAL: over your shoulder, a friendly chat: they talk with their hands, you nod, they laugh, they wave. */
  'social:friendly'(g,t,p){social(g,t,p,false)},
  /* SOCIAL: a serious talk that ends in a handshake. */
  'social:serious'(g,t,p){social(g,t,p,true)},
  /* JAIL BARS: first person inside a cell. Grip the bars, shake them, a guard walks past, let go. */
  'jail:'(g,t,p){
    bricks(g,'#3a404a','#262b33',0,56);R(g,'#2e333c',0,56,160,24);for(let x=0;x<160;x+=30)R(g,'#232830',x,56,1,24);R(g,'#232830',0,66,160,1);
    const fl=Math.floor(t/90)%3;R(g,OUT,118,22,10,3);R(g,'#4a4f58',120,24,6,12);R(g,'#ff9a30',119,12+(fl%2),8,10);R(g,'#ffd24a',121,15+(fl%2),4,6);
    R(g,'rgba(255,160,60,'+(.07+fl*.03)+')',70,0,90,60);
    const gx=lerp(-16,176,seg(p,.4,.92));figure(g,gx,64,{d:1,ph:(t/420)%1,look:NPC_LOOKS.guard()});R(g,'#c9ced3',gx-2,50,2,2);
    R(g,'rgba(8,10,18,.4)',0,0,160,80);
    const shake=p>=.2&&p<.42?Math.round(Math.sin(t/32)*2):0,back=ease(seg(p,.4,.7)),sp=lerp(15,12.5,back),bw=back>.5?4:5;
    const bx=i=>Math.round(80+(i-5.5)*sp)+shake;
    R(g,OUT,0,13+shake*0,160,5);R(g,'#4a4f58',0,14,160,3);R(g,OUT,0,60,160,5);R(g,'#4a4f58',0,61,160,3);
    for(let i=0;i<12;i++){const x=bx(i);R(g,OUT,x-1,0,bw+2,80);R(g,'#4a4f58',x,0,bw,80);R(g,'#7a808a',x,0,1,80)}
    const grip=ease(seg(p,0,.2)),rel=ease(seg(p,.82,.95)),hy=lerp(96,46,grip)+back*8+rel*40;
    arm(g,bx(4)+2,hy,bx(4)-14,100,{fist:true});arm(g,bx(7)+2,hy-2,bx(7)+18,100,{fist:true});
    R(g,'rgba(0,0,0,'+(back*.18).toFixed(2)+')',0,0,160,80);vignette(g,.45);
  }
});
/* a whip pan to the destination, in the last tenth of a travel scene */
function whip(g,p){if(p<.86)return;const k=seg(p,.86,1);for(let i=0;i<14;i++)R(g,'rgba(255,255,255,'+(.5*k).toFixed(2)+')',0,i*6+(i%3)*2,160,1);R(g,'rgba(255,255,255,'+(k*k*.8).toFixed(2)+')',0,0,160,80)}
/* over-the-shoulder talk: you are the back of a head on the left, they face you on the right */
function social(g,t,p,serious){
  const looks=serious?NPC_LOOKS.stern():NPC_LOOKS.friend();
  if(serious){R(g,'#1c2a44',0,0,160,50);skyline(g,'#101a2c','#f2d77a',50);R(g,'#4a4f58',0,50,160,30);R(g,'#5a5f68',0,50,160,3)}else bgGarden(g,t);
  const talk=p>=.08&&p<.62,shake=serious&&p>=.72,nod=(p>=.38&&p<.46)||(p>=.5&&p<.58)?2:0;
  const bounce=!serious&&p>=.68&&p<.86?Math.round(Math.sin(t/60)):0;
  const gest=talk?[8+Math.round(Math.sin(t/(serious?260:160))*2),-3+Math.round(Math.sin(t/(serious?340:110))*(serious?2:4))]:[7,6];
  let fh=gest;if(!serious&&p>=.88)fh=[9,-14+Math.round(Math.sin(t/70)*2)];if(shake)fh=[lerp(8,17,ease(seg(p,.72,.84))),0];
  const f=figure(g,116,70+bounce,{d:-1,look:looks,fh,bh:[4,9]});
  if(talk)for(let i=0;i<3;i++){const on=Math.floor(t/180)%4>i;R(g,OUT,100+i*6,22,5,5);R(g,on?'#fff':'#9aa0a6',101+i*6,23,3,3)}
  if(!serious&&p>=.68&&p<.86){for(let i=0;i<2;i++){R(g,'#151720',100-i*0,26+i*5,4,1);R(g,'#151720',130+0,26+i*5,4,1)}R(g,'#151720',99,30,1,3);R(g,'#151720',133,30,1,3)}
  const L=scLook(),B=backView(g,36,84,{nod});
  if(shake){const hand=[f.F[0]-3,f.F[1]];oArm(g,B.sr,hand,L);if(p>.86)glint(g,(hand[0]+f.F[0])/2,hand[1]-4,seg(p,.86,1))}
  vignette(g,.2);
}
