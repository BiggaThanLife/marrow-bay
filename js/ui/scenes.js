"use strict";
/* Pixel scenes for actions (work, cash, rest), and the short tap shield that stops accidental double taps.
   A scene is drawn on a 96x48 canvas, plays for about a second and a half, and then runs the action it was holding back.
   Tap after SCENE_SKIP_AFTER ms to skip. Settings can switch scenes off. Games embedded in a frame (the test pages) skip scenes. */
let sceneBusy=false,sceneTimer=0,shieldTimer=0,SCENE_FORCE=false;
const SC_W=96,SC_H=48;
const scenesOff=()=>SET.scenes===false||(window.top!==window&&!SCENE_FORCE);
/* ----- tap shield: a clear sheet over everything for a moment ----- */
function shield(ms){
  const s=document.getElementById('shield');if(!s)return;
  s.hidden=false;clearTimeout(shieldTimer);shieldTimer=setTimeout(()=>{s.hidden=true},ms);
}
/* ----- running a button ----- */
function runButton(b,e){
  const r=typeof sceneFor==='function'?sceneFor(b.label):null;
  if(sceneBusy)return; /* a scene is playing, so any tap on a button underneath is ignored */
  if(r&&!scenesOff())playScene(r,()=>b.fn(e));else b.fn(e);
}
function playScene(r,then){
  const box=document.getElementById('actscene'),cv2=document.getElementById('sc-cv'),cap=document.getElementById('sc-cap'),bar=document.getElementById('sc-bar'),hint=document.getElementById('sc-hint');
  sceneBusy=true;const dur=SCENE_MS[r.type]||1400,t0=Date.now(),g=cv2.getContext('2d');
  cap.textContent=r.cap+'...';hint.style.visibility='hidden';box.hidden=false;
  let done=false;
  const finish=()=>{
    if(done)return;done=true;clearInterval(sceneTimer);box.hidden=true;sceneBusy=false;
    if(r.type==='cash')sfx('coin');
    shield(450);then();
  };
  box.onpointerdown=e=>{e.preventDefault();if(Date.now()-t0>SCENE_SKIP_AFTER)finish()};
  const frame=()=>{
    const t=Date.now()-t0,p=Math.min(1,t/dur);
    g.imageSmoothingEnabled=false;g.clearRect(0,0,SC_W,SC_H);
    (SCENE_DRAW[r.type]||SCENE_DRAW.work)(g,t,p,r.kit);
    bar.style.width=Math.round(p*100)+'%';
    if(t>SCENE_SKIP_AFTER)hint.style.visibility='visible';
    if(t>=dur)finish();
  };
  clearInterval(sceneTimer);sceneTimer=setInterval(frame,50);frame();
}
/* ----- drawing helpers ----- */
const rect=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
const lerp=(a,b,t)=>a+(b-a)*t;
function scLook(){
  const L=(G&&G.look)||{skin:1,hair:0,outfit:'blue'};
  const skin=(typeof SKIN!=='undefined'&&SKIN[L.skin])||'#d9a77a',hair=(typeof HAIR!=='undefined'&&HAIR[L.hair])||'#3a2a1a';
  const o=(typeof OUTFITS!=='undefined'&&OUTFITS.find(x=>x.id===L.outfit))||{c:'#2f6fb3'};
  return{skin,hair,cloth:o.c};
}
/* a small person, 6 wide and 11 tall. arm: 0 down, 1 forward, 2 raised */
function scFig(g,x,y,arm,carry){
  const L=scLook();
  rect(g,'#1c2430',x+1,y+9,2,2);rect(g,'#1c2430',x+3,y+9,2,2);
  rect(g,L.cloth,x,y+4,6,5);
  rect(g,L.skin,x+1,y+1,4,3);rect(g,L.hair,x+1,y,4,1);rect(g,L.hair,x+1,y+1,1,1);
  if(arm===2){rect(g,L.skin,x+5,y+1,1,4);rect(g,L.skin,x-1,y+1,1,4)}
  else if(arm===1){rect(g,L.skin,x+6,y+5,2,1)}
  else rect(g,L.skin,x+6,y+5,1,3);
  if(carry)rect(g,'#b88a4a',x,y-5,6,5),rect(g,'#8a6430',x,y-5,6,1);
}
/* an 8 by 8 pixel disc */
function scDisc(g,c,x,y){[[2,4],[1,6],[0,8],[0,8],[0,8],[0,8],[1,6],[2,4]].forEach((r,i)=>rect(g,c,x+r[0],y+i,r[1],1))}
function scSky(g,top,bot,ground){
  rect(g,top,0,0,SC_W,16);rect(g,bot,0,16,SC_W,18);rect(g,ground,0,34,SC_W,14);rect(g,'#2a2e36',0,34,SC_W,1);
}
const SCENE_DRAW={
  work(g,t,p,kit){
    scSky(g,'#274a5c','#3d6a78','#4a4f58');
    const f=Math.floor(t/150),swing=f%2;
    if(kit==='crate'){
      for(let i=0;i<3;i++)rect(g,'#b88a4a',4+i*0,27-i*5,8,5),rect(g,'#8a6430',4,27-i*5,8,1);
      const n=Math.floor(p*6)+1;
      for(let i=0;i<n;i++)rect(g,i%2?'#a37a3c':'#b88a4a',72+(i%2)*2,Math.max(12,30-i*4),10,4);
      const cyc=(t%700)/700,going=Math.floor(t/700)%2===0,x=going?lerp(14,62,cyc):lerp(62,14,cyc);
      scFig(g,x,24,0,going);
    }else if(kit==='pan'){
      rect(g,'#5a5f68',46,26,24,8);rect(g,'#2a2e34',46,26,24,2);
      const bob=swing?-2:0;rect(g,'#1a1d22',50,22+bob,16,3);rect(g,'#c4813a',53,20+bob,3,2);rect(g,'#d8a04c',58,21+bob,3,2);
      for(let i=0;i<3;i++){const sy=((t/60+i*9)%22);rect(g,'rgba(240,240,240,'+(1-sy/22)*.8+')',52+i*6+(i%2),20-sy,2,2)}
      scFig(g,28,24,swing?2:1);
    }else if(kit==='rake'){
      rect(g,'#6a4a2a',0,34,SC_W,14);
      const n=Math.floor(p*8);for(let i=0;i<n;i++){rect(g,'#4f9a4a',48+i*5,30-(i%3),2,4);rect(g,'#7ac46a',47+i*5,29-(i%3),4,2)}
      scFig(g,26,24,swing?1:0);rect(g,'#8a6430',32,swing?20:26,1,10);rect(g,'#aaa',31,swing?30:35,4,1);
    }else if(kit==='spanner'){
      rect(g,'#7a8088',48,22,22,14);rect(g,'#5a6068',50,24,18,10);rect(g,'#aeb4ba',56,26,6,6);rect(g,'#2a2e34',58,28,2,2);
      scFig(g,28,24,swing?2:1);rect(g,'#c9ced3',36,swing?24:28,8,2);
      if(swing){rect(g,'#ffd24a',46,24,2,2);rect(g,'#ffb030',44,26,1,1);rect(g,'#ffd24a',72,22,2,2)}
    }else{ /* forge */
      rect(g,'#3a3d44',48,30,22,6);rect(g,'#2a2c32',54,24,10,6);rect(g,'#c24a1a',52,36,16,2);
      scFig(g,28,24,swing?2:1);rect(g,'#9aa0a6',38,swing?18:25,2,9);rect(g,'#555',36,swing?16:23,6,3);
      if(!swing)for(let i=0;i<5;i++)rect(g,i%2?'#ffd24a':'#ff8a30',52+i*3+((t/50|0)%3),22-(i%3)*2,1,1);
    }
  },
  cash(g,t,p){
    scSky(g,'#1c2a38','#26384a','#323843');
    /* the till */
    rect(g,'#7a5a3a',60,22,26,14);rect(g,'#5a4128',60,22,26,3);rect(g,'#c9ced3',64,26,18,5);rect(g,'#2a2e34',66,27,10,2);
    const open=p>.55&&p<.95;rect(g,open?'#4a3720':'#6a4c30',60,open?34:30,26,open?6:3);
    /* coins in an arc */
    for(let i=0;i<6;i++){
      const ph=((t/700)+i/6)%1,x=lerp(8,64,ph),y=lerp(30,22,ph)-Math.sin(ph*Math.PI)*16;
      rect(g,'#f2b84b',x,y,4,4);rect(g,'#fff1b0',x+1,y+1,1,1);rect(g,'#b8841e',x+3,y+3,1,1);
    }
    /* sparkle when it lands */
    if(p>.55)for(let i=0;i<3;i++)rect(g,'#fff',70+i*6,16-((t/100+i)%3)*2,1,1);
    scFig(g,8,24,1);
  },
  rest(g,t,p,kit){
    rect(g,'#10182a',0,0,SC_W,SC_H);
    for(let i=0;i<9;i++){const tw=((t/300+i)%3)<1.5;rect(g,tw?'#fff':'#7a88aa',6+i*10,4+(i*7)%16,1,1)}
    scDisc(g,'#e6e2c8',76,5);scDisc(g,'#10182a',79,4);
    const L=scLook();
    rect(g,'#2a2f45',0,36,SC_W,12);
    rect(g,'#6a4a2a',24,28,48,4);rect(g,'#6a4a2a',24,32,3,6);rect(g,'#6a4a2a',69,32,3,6);
    rect(g,'#e8e8f0',26,24,10,5);rect(g,L.cloth,36,25,34,5);rect(g,L.cloth,36,24,34,1);
    rect(g,L.skin,29,23,5,4);rect(g,L.hair,29,22,5,2);
    if(kit==='clinic'){rect(g,'#e8eef0',6,14,10,10);rect(g,'#d33a2c',10,15,2,8);rect(g,'#d33a2c',7,18,8,2)}
    for(let i=0;i<3;i++){const zy=((t/90+i*14)%42),zx=38+i*7+Math.sin((t/200)+i)*2;if(zy<30){const c='rgba(220,230,255,'+(1-zy/32)+')',s=3+i;rect(g,c,zx,22-zy*.5,s,1);rect(g,c,zx+s-1,22-zy*.5+1,1,1);rect(g,c,zx+1,22-zy*.5+2,1,1);rect(g,c,zx,22-zy*.5+3,s,1)}}
    /* the clock spins forward */
    rect(g,'#c9ced3',8,6,12,12);rect(g,'#10182a',9,7,10,10);
    const a=t/180,cxs=14,cys=12;for(let k=0;k<4;k++){rect(g,'#fff',cxs+Math.round(Math.cos(a)*k*1.4),cys+Math.round(Math.sin(a)*k*1.4),1,1)}
    for(let k=0;k<3;k++){rect(g,'#f2b84b',cxs+Math.round(Math.cos(a/12)*k),cys+Math.round(Math.sin(a/12)*k),1,1)}
    /* the screen dims then brightens */
    const d=p<.5?p*2:(1-p)*2;rect(g,'rgba(0,0,10,'+d*.35+')',0,0,SC_W,SC_H);
  }
};
