"use strict";
/* Drawn vehicle sprites (original art for this game). Side views only, half map units per pixel, so a 48x32 car frame is drawn 24x16 map units.
   Sheet columns: right f0, right f1, left f0, left f1 (wheels turn). Sedan sheet has one row per PAINTS entry. Anchor for cars is (24,29), under the middle of the wheels.
   Only the player's sedan, coupe, bike and scooter (32x24 frames, anchor 16,21) are drawn on the map today; taxi, police, van and tram sheets are loaded and can be drawn with drawVehSprite when those vehicles exist.
   There is no top or front view in the game (travel up or down the screen faces left or right as before), so the side sprite is always correct.
   drawVeh uses the sprite when RS>=2 and the sheet has loaded; otherwise the procedural drawCarHD stays. */
const VEH_V=1,VEH_IMG={};
['sedan_by_paint','coupe_by_paint','bike_by_paint','scooter_by_paint','taxi','police','van','tram'].forEach(n=>{const i=new Image();i.src='assets/vehicles/'+n+'.png?v='+VEH_V;VEH_IMG[n]=i});
const vehImgOk=n=>{const i=VEH_IMG[n];return !!(i&&i.complete&&i.naturalWidth>0)};
const VEH_SHEET={sedan:'sedan_by_paint',coupe:'coupe_by_paint',bike:'bike_by_paint',scooter:'scooter_by_paint'};
const vehSpriteReady=k=>RS>=2&&!!VEH_SHEET[k]&&vehImgOk(VEH_SHEET[k]);
/* row for a paint colour: exact PAINTS match, else the nearest by RGB; the stock sedan blue lands on Sky */
function vehPaintRow(hex){
  const rgb=h=>{const n=parseInt((h||'#3a7ad0').slice(1),16);return [n>>16&255,n>>8&255,n&255]},a=rgb(hex);let best=1,bd=1e9;
  PAINTS.forEach((p,i)=>{const b=rgb(p.c),d=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(d<bd){bd=d;best=i}});
  return best;
}
/* sheet: image name, (px,py): ground point under the wheels, face 1 right / -1 left, sp: wheel frame 0/1, row: sedan paint row, size [w,h], anchor [ax,ay] */
function drawVehSprite(sheet,px,py,face,sp,row,w,h,ax,ay){
  const im=VEH_IMG[sheet],s=cx.imageSmoothingEnabled;cx.imageSmoothingEnabled=false;
  cx.drawImage(im,((face<0?2:0)+sp)*w,(row||0)*h,w,h,px-ax/2,py-ay/2,w/2,h/2);
  cx.imageSmoothingEnabled=s;
}
