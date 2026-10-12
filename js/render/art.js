"use strict";
/* Pilot city art: ground tiles cut from the Modern City GameKit sheets in assets/city (16px cells). Only roads, plaza paving and grass so far;
   anything not listed here, or while an image is still loading, is drawn by the classic code in tiles.js. Off by default (SET.art). */
const ART_VER=1;
const ART_SHEET={roads:'assets/city/roads.png?v='+ART_VER,walls:'assets/city/walls.png?v='+ART_VER};
/* [sheet, x, y] of 16px cells. asphalt is the inside of the plain 64x64 road block, paving the plain stone cells, grass the middle of the two lawn patches */
const ART_CELLS={
  road:[['roads',272,160],['roads',288,160],['roads',272,176],['roads',288,176]],
  plaza:[['roads',16,224],['roads',48,224],['roads',64,224],['roads',80,224]],
  grass:[['walls',16,128],['walls',96,128]]
};
/* how much of each district's own colour is laid over the art, so a district still reads as itself */
const ART_TINT={road:{Highline:.28,Grid:.2,Dockside:.3,'Neon Mile':.45,'Foundry Row':.3},grass:{Highline:.12,Grid:.1,Dockside:.18,Greenbelt:.15}};
const ARTIMG={};
function artImg(name){
  let a=ARTIMG[name];
  if(!a){a=ARTIMG[name]=new Image();a.src=ART_SHEET[name]}
  return a.complete&&a.naturalWidth?a:null;
}
const artOn=()=>typeof SET!=='undefined'&&SET.art===true;
/* draws one ground tile from the art if it can; returns false when the classic drawing should be used */
function artTile(kind,tx,ty,sx,sy,d){
  if(!artOn())return false;
  const tint=ART_TINT[kind];if(tint&&tint[d]==null)return false;
  const cells=ART_CELLS[kind];if(!cells)return false;
  const c=cells[hash(tx,ty)%cells.length],im=artImg(c[0]);if(!im)return false;
  cx.imageSmoothingEnabled=false;
  const x=Math.round(sx),y=Math.round(sy);
  cx.drawImage(im,c[1],c[2],TS,TS,x,y,TS,TS);
  if(tint){const col=kind==='road'?ROADC[d]:GROUND[d];cx.globalAlpha=tint[d];cx.fillStyle=col;cx.fillRect(x,y,TS,TS);cx.globalAlpha=1}
  return true;
}
