"use strict";
/* Pixel scenes for actions (work, cash, rest), and the short tap shield that stops accidental double taps.
   A scene is drawn on a 160x80 canvas, plays for about two seconds, and then runs the action it was holding back.
   Tap after SCENE_SKIP_AFTER ms to skip. Settings can switch scenes off. Games embedded in a frame (the test pages) skip scenes. */
let sceneBusy=false,sceneTimer=0,shieldTimer=0,SCENE_FORCE=false;
/* what the open menu is about (who you are talking to, which business, where a job is), so a scene can draw the right person or building.
   ui() clears it, the menu that knows sets it again just after drawing itself, and ask() keeps it for its confirm button. */
let SCENE_CTX={};
const sceneCtx=o=>{SCENE_CTX=o||{}};
const SC_W=160,SC_H=80;
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
