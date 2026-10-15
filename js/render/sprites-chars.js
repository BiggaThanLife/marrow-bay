"use strict";
/* Drawn character sprites (original art for this game): the 19 named NPCs from one atlas, and the player composed from layer sheets.
   Frames are 16x32 px; a sheet is 3 columns (idle, step A, step B) by 4 rows (down, left, right, up). Feet sit at (8,29).
   Drawn at half scale on the RS=2 map. Anything not covered here falls back to drawPersonHD. */
const CHAR_V=1,CHAR_ATLAS={cordelia:[0,0],halloran:[48,0],mina:[96,0],teo:[144,0],duarte:[192,0],pip:[0,128],wren:[48,128],reyes:[96,128],ashgrove:[144,128],gus:[192,128],bell:[0,256],vex:[48,256],mack:[96,256],ines:[144,256],lou:[192,256],kofi:[0,384],priya:[48,384],sana:[96,384],dee:[144,384]};
const CHAR_HATS=['beanie','cap','brim','sun','wool'],CHAR_WALK=[0,1,0,2];
const CHAR_IMG={};
['npcs_atlas','body_by_skin','outfit_by_colour','hair_style_by_colour','hats'].forEach(n=>{const i=new Image();i.src='assets/chars/'+n+'.png?v='+CHAR_V;CHAR_IMG[n]=i});
const charReady=n=>{const i=CHAR_IMG[n];return !!(i&&i.complete&&i.naturalWidth>0)};
let charLookIds=null;
/* NPC_LOOK entry -> NPC id (only for the named cast that has a sheet) */
function charIdOfLook(l){
  if(!charLookIds){charLookIds=new Map();if(typeof NPC_LOOK!=='undefined')Object.keys(NPC_LOOK).forEach(k=>charLookIds.set(NPC_LOOK[k],k))}
  const id=charLookIds.get(l);return id&&CHAR_ATLAS[id]?id:null;
}
/* facing: 0 down, 1 left, 2 right, 3 up. Per-actor tracking (keyed by the look object) of last position, so a mover faces where it goes and an idle one faces down. */
const charDirMemo=new WeakMap();
function charDirFor(key,x,y,moving){
  let m=charDirMemo.get(key);
  if(!m){m={x,y,d:0};charDirMemo.set(key,m)}
  const dx=x-m.x,dy=y-m.y;m.x=x;m.y=y;
  if(!moving)m.d=0;
  else if(Math.abs(dx)>.003||Math.abs(dy)>.003)m.d=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);
  return m.d;
}
function charShadow(c,px,py){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(px-3.5,py-.5,7.5,1.5);c.fillStyle='rgba(0,0,0,.14)';c.fillRect(px-2.5,py+1,5.5,.5)}
/* draw one frame with its feet at (px,py); src is an image or canvas, ox/oy the sheet origin */
function charFrame(c,src,ox,oy,dir,step,px,py){
  const s=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;
  c.drawImage(src,ox+CHAR_WALK[step&3]*16,oy+dir*32,16,32,px-4,py-14.5,8,16);
  c.imageSmoothingEnabled=s;
}
function drawCharNpc(c,px,py,id,dir,moving,now){
  if(!charReady('npcs_atlas'))return false;
  const a=CHAR_ATLAS[id];
  charShadow(c,px,py);
  charFrame(c,CHAR_IMG.npcs_atlas,a[0],a[1],dir,moving?Math.floor(now/140):0,px,py);
  return true;
}
/* Player: layers stacked body, outfit, hair, hat into one 48x128 sheet, cached per look. */
const charLookCache={};
function charPlayerSheet(l){
  if(!['body_by_skin','outfit_by_colour','hair_style_by_colour','hats'].every(charReady))return null;
  const skin=l.skin|0,hair=l.hair|0,st=l.style==null?0:l.style|0;
  const oi=OUTFITS.findIndex(o=>o.id===l.outfit),hi=l.hat&&l.hat!=='none'?CHAR_HATS.indexOf(l.hat):-1;
  if(skin<0||skin>4||hair<0||hair>6||st<0||st>3||(l.hat&&l.hat!=='none'&&hi<0))return null;
  const o=oi<0?0:oi,key=skin+'.'+o+'.'+st+'.'+hair+'.'+hi;
  let cv=charLookCache[key];if(cv)return cv;
  cv=document.createElement('canvas');cv.width=48;cv.height=128;const g=cv.getContext('2d');
  g.drawImage(CHAR_IMG.body_by_skin,skin*48,0,48,128,0,0,48,128);
  g.drawImage(CHAR_IMG.outfit_by_colour,o*48,0,48,128,0,0,48,128);
  if(st<3)g.drawImage(CHAR_IMG.hair_style_by_colour,(st*7+hair)*48,0,48,128,0,0,48,128);
  if(hi>=0)g.drawImage(CHAR_IMG.hats,hi*48,0,48,128,0,0,48,128);
  return charLookCache[key]=cv;
}
/* Player facing, set by the world draw from the path (or by fishing); 0 down, 1 left, 2 right, 3 up */
let pDir=0;
function drawCharPlayer(c,px,py,l,dir,step,headOnly){
  const sh=charPlayerSheet(l);if(!sh)return false;
  if(headOnly){
    /* head and neck only, for riding: the top CHAR_HEAD_ROWS rows, with the neck ending 9.5 above py (where the old head met the torso) */
    const s=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;
    c.drawImage(sh,0,dir*32,16,CHAR_HEAD_ROWS,px-4,py-9.5-CHAR_HEAD_ROWS/2,8,CHAR_HEAD_ROWS/2);
    c.imageSmoothingEnabled=s;return true;
  }
  charShadow(c,px,py);charFrame(c,sh,0,0,dir,step,px,py);return true;
}
const CHAR_HEAD_ROWS=13;
/* the teal marker over the player's head (t: its bobbing tick) */
function charMarker(c,px,py,t){const m=py-18+(t?1:0);c.fillStyle='#4fd1b5';c.fillRect(px-1,m,2,3);c.fillStyle='#bff5ea';c.fillRect(px-1,m,2,.5);c.fillStyle='#2f9c86';c.fillRect(px+.5,m+.5,.5,2.5)}
