"use strict";
/* Side-on scenes with people drawn like the map: chatting (face to face or on the phone), building and crafting, and crime.
   They join SCENE_KITS like the camera-view scenes. SCENE_CTX (see sceneCtx in scenes.js) says who you are talking to, which business
   you are working on or where a job is, so a scene can show the right person, building or street.
   When the outcome is still unknown as the scene plays (a pickpocket, a job), it ends on a tense moment rather than a result. */

/* ----- people ----- */
const CLOTHS=['#7a6a8a','#6a8a52','#a0603a','#3a4a6a','#8a3a3a','#c8a040','#4a7a8a','#5a5f68'];
/* a scene look from a map look {skin,hair,style,fem,beard,hat} and a clothes colour */
function lookFrom(l,cloth){l=l||{};const L=mkLook(SKIN[l.skin]||SKIN[1],HAIR[l.hair]||HAIR[0],l.style||0,cloth||CLOTHS[0]);L.fem=!!l.fem;L.beard=!!l.beard;L.hat=l.hat;return L}
const npcLook=n=>n?lookFrom(NPC_LOOK[n.id]||n.look,n.col):null;
const tenantScLook=t=>lookFrom(tenantLook(t),CLOTHS[t.id%CLOTHS.length]);
/* a stable made-up person for marks, crews and guests */
const anyLook=i=>lookFrom({skin:Math.floor(rn(i)*5),hair:Math.floor(rn(i+1)*7),style:Math.floor(rn(i+2)*7),fem:rn(i+3)>.5},CLOTHS[Math.floor(rn(i+4)*CLOTHS.length)]);
const scx=()=>(typeof SCENE_CTX!=='undefined'&&SCENE_CTX)||{};
const sceneNight=()=>typeof isNight==='function'&&!!G&&G.t!=null&&isNight();
const sceneHere=()=>G&&G.p&&typeof district==='function'?district(Math.round(G.p.x),Math.round(G.p.y)):'Grid';

/* ----- places: the street you are on, in the right district ----- */
function skyBand(g,t,night,h){
  const lo=Math.round(h*.55);R(g,night?'#141c34':'#8cc4e4',0,0,160,h);R(g,night?'#1c2a48':'#b4d9ee',0,lo,160,h-lo);
  if(night){for(let i=0;i<12;i++)R(g,'#dfe6ff',(i*41+7)%160,(i*17+3)%Math.max(1,lo),1,1);disc(g,'#ece8cc',136,9,4);disc(g,'#141c34',138,8,3)}
  else{disc(g,'#f6e8a0',136,10,5);cloud(g,(t/90)%190-30,7,'#f4f8fb')}
}
/* a row of building fronts along the pavement at y0. o: walls, h (heights), awn (awning colours), neon (sign colours), tall (tall windows) */
function fronts(g,t,y0,o,night){
  let x=-8,i=0;
  while(x<160){
    const w=[36,30,42,32][i%4],h=o.h[i%o.h.length],c=night?tint(o.walls[i%o.walls.length],-.45):o.walls[i%o.walls.length],top=y0-h,dk=tint(c,-.2);
    R(g,OUT,x,top-1,w+1,h+1);R(g,c,x+1,top,w-1,h);R(g,dk,x+1,top,w-1,3);R(g,tint(c,.12),x+1,top+3,w-1,1);
    for(let wy=top+7;wy<y0-22;wy+=o.tall?15:11)for(let wx=x+5;wx<x+w-8;wx+=10){const lit=night&&rn(i*31+wx*3+wy)>.45,wh=o.tall?10:7;
      R(g,OUT,wx-1,wy-1,7,wh+2);R(g,lit?'#f2d77a':night?'#1e2a44':'#8ab8d4',wx,wy,5,wh);if(!night)R(g,'#c8e4f0',wx,wy,5,2);R(g,dk,wx-1,wy+wh+1,7,1)}
    R(g,OUT,x+4,y0-15,10,15);R(g,tint(c,-.45),x+5,y0-14,8,14);R(g,'#f2b84b',x+11,y0-8,1,2);
    const sw=w-22;if(sw>6){R(g,OUT,x+17,y0-13,sw,10);R(g,night?(rn(i+9)>.3?'#f2d77a':'#22304a'):'#9ac8e0',x+18,y0-12,sw-2,8);if(!night)R(g,'#c8e4f0',x+18,y0-12,sw-2,2)}
    if(o.awn){const ac=o.awn[i%o.awn.length];R(g,OUT,x+15,y0-19,w-17,6);for(let k=0;k<w-19;k+=4)R(g,k%8?'#f4f2ea':ac,x+16+k,y0-18,4,4);R(g,tint(ac,-.25),x+16,y0-15,w-19,1)}
    if(o.neon){const nc=o.neon[i%o.neon.length],on=Math.floor(t/400+i)%5!==0;R(g,OUT,x+6,top+5,w-12,7);R(g,'#1a1420',x+7,top+6,w-14,5);if(on){R(g,nc,x+9,top+8,w-18,1);R(g,'rgba(255,255,255,.08)',x+2,top+1,w-4,15)}}
    x+=w;i++;
  }
}
function pavement(g,y0,c){R(g,c,0,y0,160,80-y0);R(g,tint(c,.15),0,y0,160,1);for(let x=6;x<160;x+=18)R(g,tint(c,-.12),x,y0,1,74-y0);R(g,tint(c,-.25),0,74,160,1);R(g,'#3a3d44',0,75,160,5);R(g,'#4a4f58',0,75,160,1)}
const STREETS={
  Grid:{walls:['#a8553a','#c9b48a','#8a6a5a','#b86a4a'],h:[46,54,40,50],awn:['#c24a3a','#2f6ab0','#d8b04a'],pave:'#8a8f96'},
  Highline:{walls:['#d8d0bc','#c4bca8','#e4dccc'],h:[60,54,62],tall:1,pave:'#b0aca0',trees:1},
  'Neon Mile':{walls:['#2e2640','#3a2a3e','#262c40'],h:[48,56,42],neon:['#ff5aa8','#5ae0ff','#ffe05a'],pave:'#3e3e4a',dark:1},
  'Foundry Row':{walls:['#6a3a2c','#5a4a44','#7a4a34'],h:[44,52,40],pave:'#6a6660',stacks:1}
};
/* where: a district name, or 'club'. The ground is at about y 62 to 74, so people stand with their feet at y 70. */
function placeBG(g,t,where,night){
  if(where==='Dockside'||where==='Greenbelt'){(where==='Dockside'?bgHarbor:bgGarden)(g,t);if(night)R(g,'rgba(10,16,40,.55)',0,0,160,80);return}
  if(where==='club')return clubBG(g,t);
  const s=STREETS[where]||STREETS.Grid,nt=night||!!s.dark;
  skyBand(g,t,nt,40);
  if(s.stacks)for(const x of [30,118]){R(g,OUT,x-1,4,9,30);R(g,nt?'#3a2620':'#5a3a30',x,5,7,29);for(let i=0;i<3;i++){const q=((t/900)+i/3)%1;R(g,'rgba(120,110,104,'+(.6*(1-q)).toFixed(2)+')',x-2+q*8+i,2-q*10,6+q*4,5)}}
  fronts(g,t,62,s,nt);
  if(s.trees)for(const x of [24,92,148]){R(g,OUT,x-1,48,4,14);R(g,'#6a4a2a',x,48,2,14);disc(g,OUT,x+1,42,8);disc(g,nt?'#2a4a3a':'#4a8a3a',x+1,42,7);disc(g,nt?'#3a5a4a':'#6aaa5a',x-1,40,3)}
  pavement(g,62,nt?tint(s.pave,-.35):s.pave);
  if(nt){R(g,OUT,147,24,3,40);R(g,'#4a4f58',148,24,1,40);R(g,'#ffe08a',143,21,10,4);lampCone(g,148,25,6,24,49)}
}
/* the light under a lamp: a soft cone from (x,y), top half-width w, bottom half-width wb, down to y+h */
function lampCone(g,x,y,w,wb,h){g.fillStyle='rgba(255,224,140,.13)';g.beginPath();g.moveTo(x-w,y);g.lineTo(x+w,y);g.lineTo(x+wb,y+h);g.lineTo(x-wb,y+h);g.closePath();g.fill()}
function clubBG(g,t){
  R(g,'#2a1420',0,0,160,62);for(let x=0;x<160;x+=12){R(g,'#4a1a2a',x,0,8,62);R(g,'#5a2234',x+1,0,2,62)}
  R(g,'#b8903a',0,0,160,3);
  for(const x of [30,80,130]){R(g,'#e8c96a',x-1,3,3,6);disc(g,'#fff1b0',x,11,3);R(g,'rgba(255,220,140,.1)',x-18,8,36,54)}
  for(let x=0;x<160;x+=10)R(g,(x/10)%2?'#4a3428':'#2e2018',x,62,10,18);R(g,'#5a4232',0,62,160,1);
  R(g,OUT,6,50,24,3);R(g,'#e8e0c8',7,50,22,2);R(g,OUT,16,53,4,17);R(g,'#c9a46a',11,45,3,5);R(g,'#c9a46a',22,44,3,6);
}
/* someone's own room, for the other end of a phone call */
function roomBG(g,t,L,night){
  R(g,tint(L.cloth,.6),80,0,80,62);for(let x=82;x<160;x+=8)R(g,tint(L.cloth,.5),x,0,2,62);
  R(g,OUT,130,10,22,20);R(g,night?'#1c2a48':'#8cc4e4',131,11,20,18);R(g,OUT,140,11,1,18);R(g,OUT,131,19,20,1);
  R(g,OUT,90,14,12,10);R(g,'#c9a46a',91,15,10,8);R(g,'#6a8a52',93,17,6,4);
  planks(g,62,'#8a6a4a','#6a4c30',18);
  if(night)R(g,'rgba(255,220,140,.12)',80,0,80,80);
}

/* ----- speech: a bubble above someone's head with a little picture in it ----- */
function icon(g,k,x,y){
  x=Math.round(x);y=Math.round(y);const D='#151720';
  if(k==='dots'){for(let i=-1;i<=1;i++)R(g,D,x+i*4-1,y,2,2)}
  else if(k==='heart'){R(g,'#d33a2c',x-3,y-2,3,3);R(g,'#d33a2c',x+1,y-2,3,3);R(g,'#d33a2c',x-3,y,7,2);R(g,'#d33a2c',x-2,y+2,5,1);R(g,'#d33a2c',x-1,y+3,3,1);R(g,'#ff9a8a',x-2,y-1,1,1)}
  else if(k==='fish'){R(g,'#5a8aa8',x-4,y-1,7,3);R(g,'#5a8aa8',x-3,y-2,5,5);R(g,'#5a8aa8',x+3,y-2,2,1);R(g,'#5a8aa8',x+3,y+2,2,1);R(g,'#5a8aa8',x+4,y-1,1,3);R(g,D,x-2,y-1,1,1)}
  else if(k==='coin'){R(g,'#b8841e',x-3,y-3,7,7);R(g,'#f2b84b',x-2,y-2,5,5);R(g,'#b8841e',x,y-1,1,3)}
  else if(k==='sun'){R(g,'#f2b84b',x-2,y-2,5,5);R(g,'#f2b84b',x,y-4,1,1);R(g,'#f2b84b',x,y+4,1,1);R(g,'#f2b84b',x-4,y,1,1);R(g,'#f2b84b',x+4,y,1,1)}
  else if(k==='house'){R(g,'#c24a3a',x-3,y-1,7,1);R(g,'#c24a3a',x-2,y-2,5,1);R(g,'#c24a3a',x-1,y-3,3,1);R(g,'#8a6a4a',x-2,y,5,4);R(g,D,x,y+2,1,2)}
  else if(k==='q'){R(g,D,x-2,y-3,4,1);R(g,D,x+1,y-2,1,2);R(g,D,x,y,1,1);R(g,D,x,y+2,1,1)}
  else if(k==='ex'){R(g,'#c0302a',x,y-3,1,4);R(g,'#c0302a',x,y+2,1,1)}
  else if(k==='note'){R(g,D,x+1,y-3,1,5);R(g,D,x+1,y-3,3,1);R(g,D,x+3,y-2,1,1);R(g,D,x-1,y+1,3,2)}
  else if(k==='cup'){R(g,'#8a5a3a',x-3,y-1,5,5);R(g,'#c9a46a',x-3,y-1,5,1);R(g,'#8a5a3a',x+2,y,2,1);R(g,'#8a5a3a',x+3,y+1,1,2);R(g,'#8a5a3a',x+2,y+2,1,1);R(g,'#9aa0a6',x-2,y-3,1,1);R(g,'#9aa0a6',x-1,y-4,1,1);R(g,'#9aa0a6',x,y-3,1,1)}
  else if(k==='boat'){R(g,'#8a5a30',x-4,y+1,9,2);R(g,'#8a5a30',x-3,y+3,7,1);R(g,D,x,y-4,1,5);R(g,'#f4f2ea',x+1,y-3,3,3)}
  else if(k==='paper'){R(g,'#f4f2ea',x-3,y-3,6,7);R(g,'#8a929c',x-2,y-2,4,1);R(g,'#8a929c',x-2,y,4,1);R(g,'#8a929c',x-2,y+2,3,1);R(g,'#c0302a',x+1,y+2,2,1)}
  else if(k==='smile'){R(g,'#f2c84a',x-3,y-2,7,5);R(g,'#f2c84a',x-2,y-3,5,7);R(g,D,x-2,y-1,1,1);R(g,D,x+2,y-1,1,1);R(g,D,x-2,y+1,1,1);R(g,D,x-1,y+2,3,1);R(g,D,x+2,y+1,1,1)}
}
/* bottom of the bubble at (x,y); k grows it in */
function bubble(g,x,y,ic,k){
  if(k<=0)return;const s=Math.min(1,k*2.5),w=Math.round(17*s),h=Math.round(13*s);if(w<4)return;
  x=Math.round(x);y=Math.round(y);const l=x-Math.round(w/2);
  R(g,OUT,l-1,y-h-1,w+2,h+2);R(g,'#fff',l,y-h,w,h);R(g,'#dfe6ea',l,y-1,w,1);R(g,OUT,x-1,y+1,3,2);R(g,'#fff',x,y,1,2);
  if(s>=1)icon(g,ic,x,y-7);
}
const TOPICS=['sun','fish','coin','house','heart','note','cup','boat'],SERIOUS=['ex','coin','paper','house','dots'];

/* ----- chatting ----- */
function chatScene(g,t,p,serious){
  const c=scx(),them=c.look||npcLook(c.who)||(serious?NPC_LOOKS.stern():NPC_LOOKS.friend()),night=sceneNight();
  const sd=c.who?[...String(c.who.id)].reduce((a,ch)=>(a*31+ch.charCodeAt(0))%997,7):5,list=serious?SERIOUS:TOPICS,topic=k=>list[Math.floor(rn(sd+k*3)*list.length)];
  if(c.phone)return phoneChat(g,t,p,them,serious,night,topic);
  placeBG(g,t,c.where||sceneHere(),night);
  const Y=70,talkA=p>=.06&&p<.34,talkB=p>=.36&&p<.58,talkC=serious&&p>=.6&&p<.72,laugh=!serious&&p>=.6&&p<.8,bye=!serious&&p>=.8;
  const near=serious?ease(seg(p,.72,.84)):0,shake=serious&&p>=.84?Math.round(Math.sin(t/55)*2):0,bob=laugh?-Math.abs(Math.round(Math.sin(t/70)*2)):0;
  const gest=(sp)=>[8+Math.round(Math.sin(t/sp)*2),-2+Math.round(Math.sin(t/(sp*.7))*3)];
  let fhY=talkB?gest(150):[3,10],fhT=talkA||talkC?gest(serious?230:140):[3,10];
  if(laugh){fhY=[5,4];fhT=[5,4]}
  if(bye){const w=Math.round(Math.sin(t/70)*2);fhY=[5+w,-15];fhT=[5-w,-15]}
  if(serious&&p>=.72){const h=[lerp(3,14,near),lerp(10,1,near)+shake];fhY=h;fhT=h}
  const mx=58+near*8,tx=102-near*8,nodY=talkA&&Math.floor(t/300)%2?1:0,nodT=talkB&&Math.floor(t/300)%2?1:0;
  figure(g,mx,Y+nodY+bob,{d:1,fh:fhY});
  figure(g,tx,Y+nodT+bob,{d:-1,look:them,fh:fhT});
  if(talkA)bubble(g,tx,Y-41,topic(0),seg(p,.06,.12));
  if(talkB)bubble(g,mx,Y-41,serious?'q':topic(1),seg(p,.36,.42));
  if(talkC)bubble(g,tx,Y-41,topic(2),seg(p,.6,.66));
  if(laugh){bubble(g,mx,Y-43,'smile',seg(p,.6,.66));bubble(g,tx,Y-43,'smile',seg(p,.62,.68))}
  if(bye){const k=seg(p,.82,1);icon(g,'heart',80,Y-30-k*12);if(p>.9)glint(g,80,Y-36-k*12,seg(p,.9,1))}
  if(serious&&p>=.88)glint(g,80,Y-21,seg(p,.88,1));
}
/* a phone call: a split screen, you where you are on the left and them at home on the right */
function phoneAt(g,F){R(g,OUT,F[0]-2,F[1]-5,4,9);R(g,'#4a4f58',F[0]-1,F[1]-4,2,7);R(g,'#8a929c',F[0]-1,F[1]-4,1,2)}
function phoneChat(g,t,p,them,serious,night,topic){
  const Y=70,hang=p>=.88;
  g.save();g.beginPath();g.rect(0,0,80,80);g.clip();placeBG(g,t,sceneHere(),night);g.restore();
  g.save();g.beginPath();g.rect(80,0,80,80);g.clip();roomBG(g,t,them,night);g.restore();
  const me=figure(g,40,Y,{d:1,fh:hang?[3,10]:[-3,-11]});if(!hang)phoneAt(g,me.F);
  const th=figure(g,120,Y,{d:-1,look:them,fh:hang?[3,10]:[-3,-11]});if(!hang)phoneAt(g,th.F);
  R(g,OUT,79,0,3,80);
  if(p>=.06&&p<.32)bubble(g,122,Y-41,topic(0),seg(p,.06,.12));
  if(p>=.36&&p<.58)bubble(g,40,Y-41,serious?'q':topic(1),seg(p,.36,.42));
  if(p>=.62&&p<.84)bubble(g,122,Y-41,serious?topic(2):'smile',seg(p,.62,.68));
  if(hang){glint(g,40,Y-28,seg(p,.88,1));glint(g,120,Y-28,seg(p,.9,1))}
}

/* ----- building: your business gets bigger ----- */
const WALLC={plaster:'#e8dcc0',stone:'#b8b2a4',brick:'#a8553a',wood:'#9a6a3a',metal:'#8a929c',tudor:'#efe6d0',concrete:'#a4a4a0',glass:'#7f9fb8'};
const ROOFC={flat:'#5a5f68',pitched:'#a83a2a',slate:'#4a5060',metal:'#7a828c',glass:'#8ab4c8',saw:'#6a6f78'};
/* a roof seen from the side, sitting on top of a wall at y from x to x+w */
function sideRoof(g,k,x,y,w,c){
  if(k==='pitched'||k==='slate'||k==='glass'){const hh=Math.max(4,Math.round(w/5));for(let r=0;r<hh;r++){const ww=Math.round((w+6)*(1-r/hh)),xx=x+Math.round((w-ww)/2);R(g,OUT,xx-1,y-1-r,ww+2,1);if(ww>2)R(g,r%3===1?tint(c,-.15):c,xx,y-1-r,ww,1)}R(g,OUT,x-3,y-1,w+6,1);if(k==='glass')for(let i=0;i<3;i++)R(g,'#e8f6ff',x+8+i*12,y-3-i,3,1);return}
  if(k==='saw'){for(let i=0;i<3;i++){const sx=x+Math.round(i*w/3),sw=Math.round(w/3);for(let r=0;r<6;r++){R(g,OUT,sx,y-1-r,Math.round(sw*(1-r/6))+1,1);R(g,c,sx+1,y-1-r,Math.max(0,Math.round(sw*(1-r/6))-1),1)}R(g,'#8ab4c8',sx+sw-2,y-6,1,5)}return}
  if(k==='metal'){R(g,OUT,x-3,y-5,w+6,5);R(g,c,x-2,y-4,w+4,3);for(let i=x-1;i<x+w+2;i+=3)R(g,tint(c,-.2),i,y-4,1,3);return}
  R(g,OUT,x-2,y-4,w+4,4);R(g,c,x-1,y-3,w+2,2);R(g,tint(c,.2),x-1,y-3,w+2,1);
}
function upgradeScene(g,t,p){
  const c=scx(),st=(typeof BSTYLE!=='undefined'&&BSTYLE[c.bkey])||{wall:'plaster',roof:'flat',awn:1},lv=Math.max(1,Math.min(3,c.level||1)),night=sceneNight();
  const wall=WALLC[st.wall]||WALLC.plaster,roof=ROOFC[st.roof]||ROOFC.flat,dk=tint(wall,-.2),glass=night?'#f2d77a':'#8ab8d4',awn=['#c24a3a','#2f6ab0','#d8b04a','#5a9a4a'][String(c.bkey||'').length%4];
  skyBand(g,t,night,70);skyline(g,night?'#202c44':'#a4bccb',night?'#f2d77a':'#a4bccb',70);pavement(g,70,night?'#5a5f68':'#8a8f96');
  const done=p>=.7,bx=96,bw=54,by=30;
  /* the shop: two floors, a sign with a star for each level */
  R(g,OUT,bx-1,by-1,bw+2,71-by);R(g,wall,bx,by,bw,70-by);R(g,dk,bx,by,2,70-by);
  for(let i=0;i<3;i++){const wx=bx+6+i*16;R(g,OUT,wx-1,by+4,10,10);R(g,glass,wx,by+5,8,8);if(!night)R(g,'#c8e4f0',wx,by+5,8,2)}
  sideRoof(g,st.roof,bx,by,bw,roof);
  R(g,OUT,bx+38,52,11,18);R(g,tint(wall,-.45),bx+39,53,9,17);R(g,'#f2b84b',bx+46,61,1,2);
  R(g,OUT,bx+5,56,28,11);R(g,glass,bx+6,57,26,9);
  R(g,OUT,bx+4,51,30,5);for(let k=0;k<28;k+=4)R(g,k%8?'#f4f2ea':awn,bx+5+k,52,4,3);
  const stars=lv+(done?1:0);R(g,OUT,bx+5,43,31,7);R(g,'#2a2e34',bx+6,44,29,5);for(let i=0;i<stars;i++){const sx=bx+9+i*8;R(g,'#f2b84b',sx,45,3,3);if(done&&i===stars-1&&p<.9)R(g,'#fff',sx+1,45,1,1)}
  /* the extensions you have already built, and the one going up now */
  const ext=(x,full)=>{R(g,OUT,x-1,49,21,22);if(full){R(g,wall,x,50,20,20);R(g,dk,x,50,2,20);R(g,OUT,x+5,55,10,8);R(g,glass,x+6,56,8,6);R(g,OUT,x-2,47,24,3);R(g,roof,x-1,48,22,1)}};
  for(let i=1;i<lv;i++)ext(bx-20*i,true);
  const x0=bx-20*lv,rows=Math.min(4,Math.floor(seg(p,.05,.68)*4.99));
  if(done)ext(x0,true);
  else{for(const px of [x0,x0+17]){R(g,OUT,px-1,46,5,25);R(g,'#8a6430',px,47,3,23)}R(g,OUT,x0-1,45,22,3);R(g,'#8a6430',x0,46,20,1);
    for(let i=0;i<rows;i++){const y=65-i*5;R(g,OUT,x0,y-1,20,6);R(g,'#b8873f',x0+1,y,18,4);R(g,'#8f6429',x0+1,y+2,18,1);R(g,'#d6a45a',x0+1,y,18,1)}}
  /* you, with a hammer: four blows, then step back */
  const u=(p/.17)%1,hit=p<.68&&u>.55&&u<.8,standing=p>=.7,hx=x0-12;
  const f=figure(g,hx,70,{d:1,fh:standing?[3,10]:hit?[11,-1]:[7,-13],bh:standing?[-3,10]:[5,4]});
  if(!standing){const a=hit?.5:-1.2,ex=f.F[0]+Math.cos(a)*9,ey=f.F[1]+Math.sin(a)*9;ln(g,OUT,f.F[0],f.F[1],ex,ey,4);ln(g,'#8a6430',f.F[0],f.F[1],ex,ey,2);R(g,OUT,ex-4,ey-4,9,8);R(g,'#8a929c',ex-3,ey-3,7,6);R(g,'#c9ced3',ex-3,ey-3,7,2)}
  if(hit)puff(g,x0+4,65-Math.max(0,rows-1)*5,seg(u,.55,.8),'210,190,150');
  if(p>=.68&&p<.84){puff(g,x0+2,62,seg(p,.68,.84),'210,190,150');puff(g,x0+18,62,seg(p,.68,.84)*.9,'210,190,150')}
  if(p>=.72)glint(g,bx+9+(stars-1)*8,46,seg(p,.72,.92));
}

/* ----- crafting at a workbench ----- */
function workshopBG(g,t){
  R(g,'#434a54',0,0,160,62);for(let y=4;y<60;y+=6)for(let x=3;x<160;x+=6)R(g,'#363c45',x,y,1,1);
  R(g,'#2c4a60',8,8,30,20);R(g,'#7fb4d4',10,10,26,16);R(g,'#fff',22,10,2,16);R(g,'#c8e4f0',10,10,26,3);
  R(g,'#2b2f36',110,8,1,10);R(g,'#2b2f36',112,9,10,3);R(g,'#2b2f36',128,8,3,14);R(g,'#2b2f36',126,8,7,3);R(g,'#2b2f36',140,10,12,2);for(let i=0;i<4;i++)R(g,'#2b2f36',141+i*3,12,1,2);
  R(g,'#2b2f36',100,0,1,16);R(g,OUT,93,16,15,5);R(g,'#c9a46a',94,17,13,3);lampCone(g,101,21,6,27,41);
  R(g,'#6a6058',0,62,160,18);for(let x=0;x<160;x+=20)R(g,'#5a5048',x,62,1,18);R(g,'#5a5048',0,70,160,1);
}
function craftScene(g,t,p,item){
  workshopBG(g,t);
  const work=p<.62,lift=p>=.8,u=(p/.155)%1,down=work&&u>.5&&u<.75,solder=item==='jammer';
  const fh=lift?[6,-16]:work?(down?[16,0]:solder?[13,-5]:[10,-12]):[15,1];
  const f=figure(g,60,76,{d:1,fh,bh:[9,2]});
  R(g,OUT,68,58,84,4);R(g,'#8a6a4a',69,59,82,2);R(g,'#6a4a2a',69,61,82,1);for(const x of [72,144]){R(g,OUT,x,62,5,16);R(g,'#6a4a2a',x+1,62,3,16)}
  const IX=lift?f.F[0]:86,IY=lift?f.F[1]-6:55,k=Math.min(1,seg(p,0,.62)*1.1);
  if(item==='trinket'){if(lift||!work){R(g,OUT,IX-4,IY-4,9,9);R(g,'#c9962a',IX-3,IY-3,7,7);R(g,'#f2c84a',IX-3,IY-3,7,2);R(g,'#d33a2c',IX-1,IY-1,3,3);R(g,'#ff9a8a',IX-1,IY-1,1,1)}
    else{const gap=Math.round((1-k)*8);R(g,OUT,IX-4-gap,IY-3,7,7);R(g,'#c9962a',IX-3-gap,IY-2,5,5);R(g,'#7a5a20',IX-2-gap,IY-1,3,3);R(g,OUT,IX+2+gap,IY-1,4,4);R(g,'#d33a2c',IX+3+gap,IY,2,2)}}
  else if(item==='part'){const teeth=lift||!work?8:Math.floor(k*8);disc(g,OUT,IX,IY,5);disc(g,'#8a929c',IX,IY,4);for(let i=0;i<teeth;i++){const a=i*Math.PI/4;R(g,OUT,IX+Math.cos(a)*5-1.5,IY+Math.sin(a)*5-1.5,3,3);R(g,'#aab0b8',IX+Math.cos(a)*5-1,IY+Math.sin(a)*5-1,2,2)}disc(g,'#2a2e34',IX,IY,1)}
  else{R(g,OUT,IX-5,IY-3,11,7);R(g,'#3a3d44',IX-4,IY-2,9,5);R(g,'#5a9a4a',IX-3,IY-1,Math.round(7*(lift||!work?1:k)),1);
    if(lift||!work){ln(g,OUT,IX+3,IY-3,IX+5,IY-9,2);R(g,(Math.floor(t/200)%2)?'#7ae08a':'#2a5a2a',IX-3,IY+1,2,1)}}
  if(work){const a=down?.55:-1.2;
    if(solder){const ex=f.F[0]+Math.cos(down?.4:.7)*10,ey=f.F[1]+Math.sin(down?.4:.7)*10;ln(g,OUT,f.F[0],f.F[1],ex,ey,3);ln(g,'#c9ced3',f.F[0],f.F[1],ex,ey,1);R(g,'#ff8a30',ex-1,ey-1,2,2);if(down){puff(g,86,52,seg(u,.5,.75),'220,224,228');R(g,'#ffd24a',85,54,1,1)}}
    else{const ex=f.F[0]+Math.cos(a)*8,ey=f.F[1]+Math.sin(a)*8;ln(g,OUT,f.F[0],f.F[1],ex,ey,4);ln(g,'#8a6430',f.F[0],f.F[1],ex,ey,2);R(g,OUT,ex-3,ey-3,7,6);R(g,'#8a929c',ex-2,ey-2,5,4);if(down)burst(g,86,54,(u-.5)*.155*SCENE_MS.build/1000,8,['#ffd24a','#ff8a30','#fff4b8'],34)}}
  if(p>=.62&&p<.8){const k=Math.sin(seg(p,.62,.8)*Math.PI);dsc(g,'rgba(255,240,180,'+(.25*k).toFixed(2)+')',IX,IY,9);dsc(g,'rgba(255,240,180,'+(.3*k).toFixed(2)+')',IX,IY,5)}
  if(lift){glint(g,IX+4,IY-5,seg(p,.8,.95));glint(g,IX-5,IY+1,seg(p,.86,1))}
}

/* ----- a camera on a pole or a wall, looking left at the street ----- */
function camera(g,x,y,o){
  const d=o.dead?1:0;R(g,OUT,x-3,y-1,5,4);R(g,'#5a5f68',x-2,y,3,2);
  R(g,OUT,x-16,y-4+d,15,8);R(g,'#c9ced3',x-15,y-3+d,13,6);R(g,'#e8ecf0',x-15,y-3+d,13,2);R(g,'#8a929c',x-15,y+1+d,13,2);
  R(g,OUT,x-19,y-3+d,4,6);R(g,o.pink?'#ff7ab8':o.dead?'#1a1c22':'#3a4a6a',x-18,y-2+d,2,4);if(!o.pink&&!o.dead)R(g,'#9ac8e0',x-18,y-2+d,1,1);
  if(o.led)R(g,'#ff3a3a',x-6,y-3+d,2,1);
}
function ladder(g,x0,y0,x1,y1){ln(g,OUT,x0,y0,x1,y1,4);ln(g,OUT,x0+7,y0,x1+7,y1,4);ln(g,'#c9a46a',x0,y0,x1,y1,2);ln(g,'#c9a46a',x0+7,y0,x1+7,y1,2);for(let k=.08;k<1;k+=.14){const a=lerp(x0,x1,k),b=lerp(y0,y1,k);R(g,OUT,a,b-1,8,3);R(g,'#c9a46a',a+1,b,6,1)}}
/* fitting a jammer under a street camera, up a ladder */
function poleScene(g,t,p){
  placeBG(g,t,sceneHere(),sceneNight());
  R(g,OUT,123,10,5,61);R(g,'#5a5f68',124,11,3,59);R(g,'#7a808a',124,11,1,59);
  const ledDie=p<.62?Math.floor(t/500)%2===0:p<.72?Math.floor(t/60)%2===0:false;
  camera(g,124,14,{led:ledDie,dead:p>=.72});
  ladder(g,100,70,116,20);
  const climb=ease(seg(p,0,.18)),fx=lerp(100,104,climb),fy=lerp(70,60,climb),fixing=p>=.2&&p<.58;
  const twist=fixing&&p>=.3?Math.round(Math.sin(t/60)*1.5):0;
  const f=figure(g,fx,fy,{d:1,ph:p<.18?(t/300)%1:null,fh:p<.18?[6,-2]:[13,-12+twist],bh:[7,-6]});
  const boxOn=p>=.3,BX=boxOn?116:f.F[0]-3,BY=boxOn?27:f.F[1]-3;
  R(g,OUT,BX-1,BY-1,9,8);R(g,'#3a3d44',BX,BY,7,6);R(g,'#5a5f68',BX,BY,7,1);ln(g,OUT,BX+5,BY,BX+7,BY-5,1);
  if(p>=.6)R(g,(Math.floor(t/250)%2)?'#7ae08a':'#2a5a2a',BX+1,BY+3,2,1);
  if(p>=.36&&p<.4||p>=.46&&p<.5)burst(g,BX+3,BY+3,(p-(p<.42?.36:.46))*SCENE_MS.build/1000,6,['#ffd24a','#fff4b8'],24);
  if(p>=.58&&p<.64)dsc(g,'rgba(200,255,210,.35)',BX+3,BY+3,8);
  if(p>=.74)glint(g,BX+3,BY-2,seg(p,.74,.94));
}

/* ----- crime ----- */
/* painting over a camera lens with a long brush, standing on a crate */
function paintScene(g,t,p){
  placeBG(g,t,sceneHere(),sceneNight());
  const cov=ease(seg(p,.14,.56)),done=p>=.58;
  R(g,OUT,131,24,5,47);R(g,'#5a5f68',132,25,3,45);R(g,'#7a808a',132,25,1,45);
  camera(g,130,30,{led:!done&&Math.floor(t/500)%2===0,pink:done,dead:false});
  if(!done&&cov>0)R(g,'#ff7ab8',111,27,2,Math.max(1,Math.round(4*cov)));
  crate(g,90,60,18,10);
  const strokes=p>=.14&&p<.56?Math.round(Math.sin(t/70)*2):0,reach=ease(seg(p,0,.12))*(1-ease(seg(p,.74,.88)));
  const f=figure(g,96,60,{d:1,fh:[lerp(3,7,reach),lerp(10,-10,reach)+strokes],bh:[-3,10]});
  if(reach>.1){const ex=lerp(f.F[0],111,reach),ey=lerp(f.F[1],29+strokes,reach);ln(g,OUT,f.F[0],f.F[1],ex,ey,3);ln(g,'#8a6430',f.F[0],f.F[1],ex,ey,1);R(g,OUT,ex-2,ey-3,5,6);R(g,'#ff7ab8',ex-1,ey-2,3,4)}
  if(p>=.6&&p<.82){const k=seg(p,.6,.82);R(g,'#ff7ab8',111,30+k*38,1,2)}
  if(p>=.82&&p<.95)R(g,'#ff7ab8',108,69,5,1);
  if(p>=.58)glint(g,112,28,seg(p,.6,.8));
}
/* lifting a wallet from someone looking in a shop window, then walking off. They start to turn as you go. */
function pickpocketScene(g,t,p){
  const c=scx(),mark=c.look||npcLook(c.who)||anyLook(11),night=sceneNight(),Y=70,mx=104;
  placeBG(g,t,c.where||sceneHere(),night);
  const turn=p>=.86,lifted=p>=.52;
  figure(g,mx,Y,{d:turn?-1:1,look:mark,fh:[4,9],bh:[-2,10]});
  if(!lifted){R(g,OUT,95,57,4,5);R(g,'#6a3a22',96,58,2,3)}
  let x,d=1,ph=null,fh=[3,10];
  if(p<.34){x=lerp(52,88,ease(seg(p,.02,.34)));ph=(t/320)%1}
  else if(p<.62){x=88;const r=ease(seg(p,.36,.48))*(1-ease(seg(p,.56,.62)));fh=[lerp(3,11,r),lerp(10,5,r)]}
  else{x=lerp(88,40,ease(seg(p,.64,1)));d=-1;ph=(t/320)%1}
  const f=figure(g,x,Y,{d,ph,fh,crouch:p>=.34&&p<.62});
  if(lifted){R(g,OUT,f.F[0]-3,f.F[1]-2,6,5);R(g,'#6a3a22',f.F[0]-2,f.F[1]-1,4,3);R(g,'#f2b84b',f.F[0],f.F[1],1,1)}
  if(p>=.52&&p<.62)glint(g,f.F[0],f.F[1]-3,seg(p,.52,.62));
  if(p>=.66&&p<.86)icon(g,'note',x-4,Y-40-seg(p,.66,.86)*6);
  if(turn)bubble(g,mx,Y-41,'q',seg(p,.86,.92));
}
/* the market stall: the seller turns to the back shelf, you slip two crops into your coat and run */
function pocketScene(g,t,p){
  const c=scx(),seller=c.look||npcLook(c.who)||NPC_LOOKS.merchant(),night=sceneNight();
  skyBand(g,t,night,46);R(g,night?'#3a3436':'#9a8a78',0,40,160,26);pavement(g,66,night?'#5a5f68':'#8a8f96');
  R(g,OUT,70,15,3,51);R(g,'#8a6430',71,16,1,50);R(g,OUT,146,15,3,51);R(g,'#8a6430',147,16,1,50);
  R(g,OUT,124,25,22,3);R(g,'#8a6430',125,26,20,1);for(let i=0;i<4;i++){R(g,OUT,126+i*5,20,4,5);R(g,['#e8803a','#5ab04a','#d33a2c','#f2c84a'][i],127+i*5,21,2,3)}
  const away=p>=.12&&p<.76,back=p>=.76;
  figure(g,118,66,{d:away?1:-1,look:seller,fh:away?[6,-12]:[4,8]});
  R(g,OUT,64,8,88,9);for(let k=0;k<86;k+=6)R(g,(k/6)%2?'#f4f2ea':'#c24a3a',65+k,9,6,6);for(let k=0;k<86;k+=6)R(g,(k/6)%2?'#f4f2ea':'#c24a3a',66+k,15,4,2);
  if(back)bubble(g,118,30,'ex',seg(p,.76,.82));
  R(g,OUT,62,50,90,16);R(g,'#8a6a4a',63,51,88,14);R(g,'#a8885e',63,51,88,2);for(let x=72;x<150;x+=14)R(g,'#6a4a2a',x,53,1,12);
  const taken=(p>=.36?1:0)+(p>=.5?1:0);
  for(let i=0;i<5;i++){if(i<taken)continue;const x=68+i*6;R(g,OUT,x-1,44,5,7);R(g,'#e8803a',x,45,3,5);R(g,'#5ab04a',x,43,3,2)}
  for(let i=0;i<4;i++){disc(g,OUT,104+i*9,47,4);disc(g,i%2?'#5ab04a':'#d33a2c',104+i*9,47,3)}
  let x=50,d=1,ph=null,fh=[3,10];
  if(p>=.3&&p<.6){const u=((p-.3)/.15)%1;fh=u<.5?[lerp(4,16,ease(u*2)),lerp(8,-2,ease(u*2))]:[lerp(16,4,ease((u-.5)*2)),lerp(-2,6,ease((u-.5)*2))]}
  if(p>=.62){x=lerp(50,-12,ease(seg(p,.62,1)));d=-1;ph=(t/160)%1}
  const f=figure(g,x,66,{d,ph,fh});
  if(p>=.3&&p<.6&&((p-.3)/.15)%1>.4&&((p-.3)/.15)%1<.8){R(g,OUT,f.F[0]-2,f.F[1]-3,5,7);R(g,'#e8803a',f.F[0]-1,f.F[1]-2,3,5)}
  if(p>=.64)for(let i=0;i<3;i++)R(g,'rgba(255,255,255,.5)',x+8+i*3,48+i*6,8,1);
}
/* prying the lid off a crate on the dock with a crowbar */
function pryScene(g,t,p){
  bgHarbor(g,t);if(sceneNight())R(g,'rgba(10,16,40,.5)',0,0,160,80);
  const heave=p<.62?Math.max(0,Math.sin(seg(p,.08,.62)*Math.PI*2)):0,pop=seg(p,.62,.76),open=p>=.62;
  R(g,OUT,85,40,50,31);R(g,'#8a6a3a',86,41,48,29);for(let x=94;x<134;x+=8)R(g,'#6a4a2a',x,41,1,29);R(g,'#a8885a',86,41,48,2);
  ell(g,'#f4f2ea',110,55,6,3);disc(g,'#2a2e34',110,55,2);
  const ly=37-Math.round(heave*3);
  if(!open){R(g,OUT,84,ly-1,52,5);R(g,'#a8885a',85,ly,50,3);if(heave>.6)puff(g,88,ly,heave,'210,190,150')}
  else if(p<.76){const k=seg(p,.62,.76),y=36-Math.sin(k*Math.PI)*14,x=k*14;ln(g,OUT,86+x,y+k*6,134+x,y-k*6,5);ln(g,'#a8885a',86+x,y+k*6,134+x,y-k*6,3)}
  else{ln(g,OUT,134,38,142,70,5);ln(g,'#a8885a',134,38,142,70,3)}
  if(open){const a=.18+.08*Math.sin(t/120);R(g,'rgba(170,230,255,'+a.toFixed(2)+')',88,32,44,8);R(g,'rgba(170,230,255,'+(a*.5).toFixed(2)+')',92,24,36,8)}
  const lean=ease(seg(p,.8,.92)),fx=70+lean*6;
  const f=figure(g,fx,70,{d:1,fh:open?[lerp(8,13,lean),lerp(2,-6,lean)]:[9,lerp(-6,4,heave)],bh:open?[4,4]:[6,lerp(-8,2,heave)]});
  if(!open){ln(g,OUT,f.F[0],f.F[1],88,ly+1,4);ln(g,'#b9bfc6',f.F[0],f.F[1],88,ly+1,2);R(g,'#c0302a',f.F[0]-1,f.F[1]-1,2,2)}
  if(p>=.62&&p<.74)burst(g,100,36,(p-.62)*SCENE_MS.sneaky/1000,9,['#d6c09a','#8a929c','#fff'],38);
  if(p>=.84)glint(g,112,30,seg(p,.84,1));
}
/* the binocular view: crates, a guard and one confused cat, counted off in the corner */
function binoMask(g){for(let y=0;y<80;y++){const dy=y-40,h=33*33-dy*dy;if(h<0){R(g,'#050608',0,y,160,1);continue}const w=Math.round(Math.sqrt(h)),l=52-w,r=108+w,gl=52+w,gr=108-w;if(l>0)R(g,'#050608',0,y,l,1);if(r<160)R(g,'#050608',r,y,160-r,1);if(gl<gr)R(g,'#050608',gl,y,gr-gl,1)}}
function scoutScene(g,t,p){
  if(p<.24){
    placeBG(g,t,'Foundry Row',true);
    R(g,OUT,104,36,40,26);R(g,'#3a2e2a',105,37,38,25);R(g,'#e8c96a',116,46,14,16);
    figure(g,124,62,{d:1,ph:(t/500)%1,look:NPC_LOOKS.guard()});
    for(let i=0;i<3;i++)crate(g,4+i*12,58,11,10);crate(g,10,48,11,10);
    figure(g,42,70,{d:1,crouch:true,fh:[6,-8],bh:[6,-6]});R(g,OUT,46,43,6,5);R(g,'#2a2e34',47,44,4,3);
    if(p>=.18)R(g,'rgba(5,6,8,'+(seg(p,.18,.24)).toFixed(2)+')',0,0,160,80);
    return;
  }
  R(g,'#2a2420',0,0,160,80);R(g,'#e8c96a',30,8,100,66);R(g,'#c9a44a',30,8,100,4);R(g,'#8a7a5a',30,62,100,12);
  const cr=[[40,52],[52,52],[64,52],[46,42],[58,42],[52,32]];cr.forEach(([x,y])=>crate(g,x,y,11,10));
  const gx=lerp(84,116,(Math.sin(t/700)+1)/2);figure(g,gx,66,{d:Math.cos(t/700)>0?1:-1,look:NPC_LOOKS.guard()});
  const look=p>=.78,C='#6a6a74';R(g,OUT,52,25,10,8);R(g,C,53,26,8,6);R(g,OUT,52,23,3,3);R(g,OUT,59,23,3,3);R(g,C,53,24,1,2);R(g,C,60,24,1,2);R(g,OUT,62,28,4,2);R(g,OUT,65,25,2,4);R(g,C,62,28,3,1);if(look){R(g,'#ffe05a',54,28,2,1);R(g,'#ffe05a',58,28,2,1)}else R(g,OUT,56,28,2,1);
  if(look)bubble(g,57,24,'q',seg(p,.78,.84));
  R(g,'rgba(5,6,8,'+(1-seg(p,.24,.32)).toFixed(2)+')',0,0,160,80);
  binoMask(g);
  const tally=[.4,.48,.56,.66,.76].filter(x=>p>=x).length;for(let i=0;i<tally;i++)R(g,i===3?'#ff9a8a':i===4?'#ffe05a':'#e8ecf0',6+i*3,6,1,6);
  if(tally>=5)R(g,'#e8ecf0',5,9,13,1);
}
function barrel(g,x,y){R(g,OUT,x-1,y-1,14,18);R(g,'#8a5a30',x,y,12,16);R(g,'#a8723e',x+2,y,3,16);R(g,'#5a5f68',x,y+3,12,2);R(g,'#5a5f68',x,y+11,12,2)}
/* spoiling a shipment: knock the bung out of a barrel and back away from the spreading puddle */
function sabotageScene(g,t,p){
  bgHarbor(g,t);if(sceneNight())R(g,'rgba(10,16,40,.5)',0,0,160,80);
  barrel(g,100,54);barrel(g,114,54);barrel(g,107,37);crate(g,128,58,16,12);crate(g,132,46,12,12);
  const pop=p>=.32,pd=ease(seg(p,.34,.86));
  if(pd>0){const hue=Math.floor(t/300)%3;ell(g,OUT,86,71,Math.round(2+pd*24)+1,4);ell(g,['#5aa88a','#7a6ab0','#6ac0a0'][hue],86,71,Math.round(2+pd*24),3);R(g,'rgba(255,255,255,.4)',80,70,4,1);for(let i=0;i<3;i++){const q=((t/400)+i*.33)%1;if(q<.5)R(g,'#c8f0e0',72+i*12,70-q*2,1,1)}}
  if(pop&&p<.84){ln(g,'#5aa88a',100,62,96-seg(p,.32,.4)*4,70,2)}
  if(!pop){R(g,OUT,98,61,3,3);R(g,'#c9a46a',99,62,1,1)}
  if(p>=.32&&p<.4)burst(g,99,62,(p-.32)*SCENE_MS.sneaky/1000,6,['#c9a46a','#5aa88a'],26);
  const back=ease(seg(p,.4,.8)),wig=p>=.1&&p<.32?Math.round(Math.sin(t/45)):0;
  figure(g,lerp(86,52,back),70,{d:1,crouch:true,ph:p>=.4&&p<.8?(t/500)%1:null,fh:p<.34?[12,1+wig]:[4,6]});
  if(p>=.86)glint(g,90,69,seg(p,.86,1));
}
/* hitting a rival stash: two kicks at a back door, in, and out with a bag */
function duffel(g,x,y){R(g,OUT,x-7,y-4,14,8);R(g,'#3a5a3a',x-6,y-3,12,6);R(g,'#2a4a2a',x-6,y,12,1);R(g,'#f2b84b',x-1,y-2,2,3)}
function stashScene(g,t,p){
  bricks(g,'#4a302c','#2b1a18',0,62);R(g,'#2e2a2a',0,62,160,18);R(g,'#3a3434',0,62,160,1);R(g,'rgba(10,14,34,.35)',0,0,160,80);
  R(g,OUT,104,24,10,3);R(g,'#ffe08a',106,26,6,2);lampCone(g,109,28,4,19,34);
  ln(g,'#d33a2c',70,34,76,28,2);ln(g,'#d33a2c',76,28,80,36,2);ln(g,'#d33a2c',80,36,86,30,2);R(g,'#d33a2c',72,38,12,1);
  const open=p>=.4,rattle=(p>=.16&&p<.22)||(p>=.36&&p<.4)?Math.round(Math.sin(t/25)*1):0;
  R(g,OUT,99,37,20,26);R(g,'#120e0e',100,38,18,24);
  if(!open){R(g,'#6a4a2a',100+rattle,38,18,24);R(g,'#5a3a1e',101+rattle,40,16,1);R(g,'#5a3a1e',101+rattle,50,16,1);R(g,'#c9a46a',114+rattle,50,2,2)}
  else{R(g,OUT,117,37,5,26);R(g,'#6a4a2a',118,38,3,24)}
  if(p>=.4&&p<.52)burst(g,104,50,(p-.4)*SCENE_MS.sneaky/1000,10,['#8a6430','#c9a46a','#fff'],40);
  const k1=Math.sin(seg(p,.12,.22)*Math.PI),k2=Math.sin(seg(p,.32,.42)*Math.PI);
  if(p<.6){const x=p<.46?84+Math.round((k1+k2)*2):lerp(84,106,ease(seg(p,.46,.6)));figure(g,x,70,{d:1,ph:p>=.46?(t/300)%1:null,kick:k1>.35||k2>.35,fh:[6,4],bh:[-6,6]})}
  else if(p>=.72){const x=lerp(106,30,ease(seg(p,.72,1))),f=figure(g,x,70,{d:-1,ph:(t/180)%1,fh:[6,4]});duffel(g,f.F[0],f.F[1]+3);if(p<.88)glint(g,f.F[0],f.F[1]-3,seg(p,.74,.88))}
  else if(Math.floor(t/120)%3===0)R(g,'#e8e0a0',104+Math.round(rn(Math.floor(t/120))*8),44,3,2);
  if(p>=.16&&p<.24)puff(g,100,52,seg(p,.16,.24),'200,190,170');
}
/* a big job: the crew run out with bags, throw them in the van and it pulls away. The result comes after. */
function vanBody(g,x,y,open,sh){
  R(g,OUT,x-1,y-27+sh,58,23);R(g,'#3a3d44',x,y-26+sh,56,21);R(g,'#4a4f58',x,y-26+sh,56,2);R(g,OUT,x+40,y-24+sh,14,9);R(g,'#2a3a4a',x+41,y-23+sh,12,7);R(g,'#ffe08a',x+54,y-12+sh,2,3);R(g,'#c0302a',x,y-12+sh,2,3);
  if(open){R(g,'#0a0a0e',x,y-24+sh,10,17);R(g,OUT,x-7,y-25+sh,7,19);R(g,'#3a3d44',x-6,y-24+sh,5,17)}else R(g,OUT,x+10,y-24+sh,1,17);
  for(const wx of [x+11,x+45]){disc(g,OUT,wx,y-3,5);disc(g,'#2a2e34',wx,y-3,4);disc(g,'#8a929c',wx,y-3,1)}
}
function vanScene(g,t,p){
  const c=scx();placeBG(g,t,c.where||sceneHere(),true);
  R(g,OUT,0,22,38,49);R(g,'#4a4448',0,23,37,47);for(let y=27;y<70;y+=6)R(g,'#3a3438',0,y,37,1);R(g,'#5a5458',0,23,37,2);
  R(g,OUT,8,42,18,28);R(g,'#e8c96a',9,43,16,27);R(g,'rgba(255,220,140,.12)',26,44,14,26);
  const go=ease(seg(p,.8,1)),sh=p>=.7&&p<.82?Math.round(Math.sin(t/30)):0,vx=96+go*80;
  vanBody(g,vx,72,p<.72,sh);
  if(p>=.7)for(let i=0;i<3;i++){const q=((t/300)+i/3)%1;R(g,'rgba(200,200,210,'+(.5*(1-q)).toFixed(2)+')',vx-6-q*14,62-q*6,4+q*4,3)}
  const crew=[null,anyLook(21),anyLook(33)];
  crew.forEach((L,i)=>{const s=.06+i*.12,run=seg(p,s,s+.3),inside=p>=s+.36;if(p<s||inside)return;
    const x=lerp(16,88,ease(run)),f=figure(g,x,72,{d:1,ph:run<1?(t/170+i*.3)%1:null,look:L||undefined,fh:run<1?[6,4]:[10,-6]});
    if(run<1)duffel(g,f.F[0],f.F[1]+3);else{const k=seg(p,s+.3,s+.36);duffel(g,lerp(f.F[0],100,k),lerp(f.F[1],56,k)-Math.sin(k*Math.PI)*8)}});
  if(go>0)for(let i=0;i<4;i++)R(g,'rgba(255,255,255,.4)',vx-30-i*6,52+i*5,18,1);
}
/* smash and grab: a brick through the display window, a grab, and a run while the alarm flashes */
function smashScene(g,t,p){
  const c=scx();placeBG(g,t,c.where||sceneHere(),true);
  const broke=p>=.36,alarm=broke&&Math.floor(t/150)%2===0;
  R(g,OUT,88,30,54,34);R(g,'#4a3a44',89,31,52,32);
  if(!broke){R(g,'#f2d77a',91,33,48,28);R(g,'rgba(255,255,255,.35)',93,35,3,24);ln(g,'rgba(255,255,255,.3)',100,58,112,36,1)}
  else{R(g,'#1a1418',91,33,48,28);for(let i=0;i<8;i++){const x=91+i*6;R(g,'#bfe2f2',x,33,2,2+Math.round(rn(i)*5));R(g,'#bfe2f2',x+2,61-Math.round(rn(i+9)*5),2,Math.round(rn(i+9)*5))}}
  const gone=p>=.56;for(let i=0;i<4;i++){if(gone&&i===1)continue;const x=98+i*10;R(g,OUT,x-1,52,8,4);R(g,'#5a3a4a',x,53,6,2);R(g,'#f2c84a',x+2,50,2,2);if(!broke)R(g,'#fff',x+2,50,1,1)}
  R(g,OUT,110,22,10,6);R(g,alarm?'#ff3a3a':'#6a2a2a',111,23,8,4);
  if(alarm)R(g,'rgba(255,40,40,.12)',0,0,160,80);
  let x=64,d=1,ph=null,fh=[3,10];
  if(p<.28){const w=ease(seg(p,.06,.26));fh=[lerp(3,-3,w),lerp(10,-13,w)]}
  else if(p<.36)fh=[10,-5];
  else if(p<.6){x=lerp(64,84,ease(seg(p,.4,.5)));ph=p<.5?(t/300)%1:null;fh=p>=.5?[12,-3]:[3,10]}
  else{x=lerp(84,10,ease(seg(p,.62,1)));d=-1;ph=(t/170)%1;fh=[5,5]}
  const f=figure(g,x,70,{d,ph,fh});
  if(p<.28){R(g,OUT,f.F[0]-3,f.F[1]-3,6,5);R(g,'#a8553a',f.F[0]-2,f.F[1]-2,4,3)}
  if(p>=.28&&p<.36){const k=seg(p,.28,.36);R(g,OUT,lerp(f.F[0],112,k)-3,lerp(f.F[1],46,k)-Math.sin(k*Math.PI)*6-3,6,5);R(g,'#a8553a',lerp(f.F[0],112,k)-2,lerp(f.F[1],46,k)-Math.sin(k*Math.PI)*6-2,4,3)}
  if(p>=.36&&p<.5)burst(g,114,46,(p-.36)*SCENE_MS.sneaky/1000,14,['#bfe2f2','#e8f6ff','#fff'],46);
  if(p>=.56&&p<.68)glint(g,f.F[0],f.F[1]-3,seg(p,.56,.68));
  if(p>=.6){R(g,OUT,f.F[0]-3,f.F[1]-1,6,6);R(g,'#2a2e34',f.F[0]-2,f.F[1],4,4);R(g,'#f2c84a',f.F[0]-1,f.F[1]-2,2,2)}
}
/* boosting a car: work a thin tool down the window, the lock pops, in, lights on, gone */
function sedan(g,x,y,o){
  const sh=o.sh||0,col='#3a7ad0',dk='#2a5aa0';
  R(g,OUT,x-1,y-15+sh,58,12);R(g,col,x,y-14+sh,56,10);R(g,dk,x,y-7+sh,56,3);R(g,OUT,x+13,y-24+sh,28,10);R(g,col,x+14,y-23+sh,26,9);
  R(g,'#9ac8e0',x+16,y-22+sh,10,7);R(g,'#9ac8e0',x+28,y-22+sh,10,7);R(g,OUT,x+27,y-22+sh,1,7);
  if(o.head){R(g,o.head.skin,x+31,y-20+sh,5,5);R(g,o.head.hair,x+31,y-21+sh,5,2)}
  if(o.open)R(g,OUT,x+40,y-14+sh,1,9);
  R(g,o.lights?'#fff6b0':'#c9b46a',x+54,y-12+sh,3,3);R(g,'#c0302a',x-1,y-12+sh,2,3);
  if(o.lights){g.fillStyle='rgba(255,246,176,.22)';g.beginPath();g.moveTo(x+56,y-11+sh);g.lineTo(x+110,y-20);g.lineTo(x+110,y+4);g.closePath();g.fill()}
  for(const wx of [x+12,x+44]){disc(g,OUT,wx,y-3,5);disc(g,'#2a2e34',wx,y-3,4);disc(g,'#8a929c',wx,y-3,1)}
}
function boostScene(g,t,p){
  const c=scx();placeBG(g,t,c.where||sceneHere(),true);
  const pop=p>=.48,inCar=p>=.58,lights=p>=.66,go=ease(seg(p,.8,1)),sh=p>=.66&&p<.82?Math.round(Math.sin(t/30)):0,cx0=60+go*110;
  if(!inCar){
    const jig=p>=.06&&p<.48?Math.round(Math.sin(t/40)*1.5):0;
    sedan(g,cx0,72,{});
    const f=figure(g,lerp(98,94,ease(seg(p,.48,.58))),72,{d:-1,crouch:true,fh:[6,-9+jig],bh:[4,-4]});
    if(p<.48){ln(g,OUT,f.F[0],f.F[1],f.F[0],f.F[1]+9,2);R(g,'#c9ced3',f.F[0],f.F[1],1,9)}
    if(pop)glint(g,f.F[0],f.F[1]-2,seg(p,.48,.58));
  }else{
    sedan(g,cx0,72,{lights,sh,head:scLook()});
    if(p>=.66)for(let i=0;i<3;i++){const q=((t/260)+i/3)%1;R(g,'rgba(200,200,210,'+(.5*(1-q)).toFixed(2)+')',cx0-6-q*14,64-q*6,4+q*4,3)}
    if(go>0)for(let i=0;i<4;i++)R(g,'rgba(255,255,255,.4)',cx0-30-i*6,54+i*4,18,1);
  }
}

Object.assign(SCENE_KITS,{
  /* CHAT: face to face where you are standing, with the real person, or a split screen on the phone */
  'social:friendly'(g,t,p){chatScene(g,t,p,false)},
  'social:serious'(g,t,p){chatScene(g,t,p,true)},
  /* BUILD: your own business grows an extension and its sign gains a star */
  'build:upgrade'(g,t,p){upgradeScene(g,t,p)},
  /* BUILD: at the workbench, then hold up what you made */
  'build:trinket'(g,t,p){craftScene(g,t,p,'trinket')},
  'build:part'(g,t,p){craftScene(g,t,p,'part')},
  'build:jammer'(g,t,p){craftScene(g,t,p,'jammer')},
  'build:pole'(g,t,p){poleScene(g,t,p)},
  /* CRIME: one scene for each kind of job */
  'sneaky:pickpocket'(g,t,p){pickpocketScene(g,t,p)},
  'sneaky:pocket'(g,t,p){pocketScene(g,t,p)},
  'sneaky:paint'(g,t,p){paintScene(g,t,p)},
  'sneaky:scout'(g,t,p){scoutScene(g,t,p)},
  'sneaky:sabotage'(g,t,p){sabotageScene(g,t,p)},
  'sneaky:pry'(g,t,p){pryScene(g,t,p)},
  'sneaky:stash'(g,t,p){stashScene(g,t,p)},
  'sneaky:van'(g,t,p){vanScene(g,t,p)},
  'sneaky:smash'(g,t,p){smashScene(g,t,p)},
  'sneaky:boost'(g,t,p){boostScene(g,t,p)}
});
