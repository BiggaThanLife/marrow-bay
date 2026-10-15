"use strict";
/* Drawn building sprites (original art for this game): one 128x144 sprite per building kind, in a day atlas and a night atlas (8 columns, 5 rows; coordinates from assets/buildings/buildings.json).
   Each covers the block's 64x64 map units at half-unit detail plus 8 map units of headroom (chimneys, stacks, flags), so it is drawn 64x72 map units with its top-left at (block x, block y - 8).
   Layout: roof to map y 42, front wall below, door at map x 19-29, windows at map x 33-59, sign band at map y 28-40 (plain, the game draws the sign on top). The sprites include each place's landmark.
   drawBlockDepth uses them when RS>=2 and the images have loaded; anything unmapped (or RS 1, or before load) keeps the procedural drawing. foundry_smoke.png is 3 frames of 40x24 px looped over the Iron Works stacks. */
const BLD_V=1,BLD_W=128,BLD_H=144;
const BLD_ATLAS={bank:[0,0],estate:[128,0],club:[256,0],flats:[384,0],rental:[512,0],realty:[640,0],corner:[768,0],fastfood:[896,0],market:[0,144],diner:[128,144],studio:[256,144],workshop:[384,144],cityhall:[512,144],clinic:[640,144],dock:[768,144],bunk:[896,144],gull:[0,288],casino:[128,288],velvet:[256,288],pawn:[384,288],loft:[512,288],garage:[640,288],foundry:[768,288],barber:[896,288],tailor:[0,432],prison:[128,432],barn:[256,432],farmstead:[384,432],farm:[512,432],home:[640,432],tower:[768,432],warehouse:[896,432],cafe:[0,576],bar:[128,576],pies:[256,576],cages:[384,576],wellness:[512,576]};
const BLD_IMG={};
[['day','buildings_day'],['night','buildings_night'],['smoke','foundry_smoke']].forEach(([k,n])=>{const i=new Image();i.src='assets/buildings/'+n+'.png?v='+BLD_V;BLD_IMG[k]=i});
const bldOk=i=>!!(i&&i.complete&&i.naturalWidth>0);
/* true when this kind can be drawn from the sprites right now */
const bldSpriteReady=key=>RS>=2&&!!BLD_ATLAS[key]&&bldOk(BLD_IMG.day)&&bldOk(BLD_IMG.night);
/* n is night() (0 to .5): day sprite, then the night one fading in over dusk (about 19:00 to 20:50) and out at dawn; full night draws just the night sprite */
function drawBldSprite(key,sx,sy,n){
  const a=BLD_ATLAS[key],x=Math.round(sx*RS)/RS,y=Math.round((sy-8)*RS)/RS,s=cx.imageSmoothingEnabled,na=n<=0?0:Math.min(1,n/.3);
  cx.imageSmoothingEnabled=false;
  if(na<1)cx.drawImage(BLD_IMG.day,a[0],a[1],BLD_W,BLD_H,x,y,64,72);
  if(na>0){if(na<1)cx.globalAlpha=na;cx.drawImage(BLD_IMG.night,a[0],a[1],BLD_W,BLD_H,x,y,64,72);cx.globalAlpha=1}
  cx.imageSmoothingEnabled=s;
}
/* smoke over the two Iron Works stacks: frames of 40x24 px, a new one every 260 ms, the two plumes offset in time */
function drawBldSmoke(sx,sy,now){
  if(!bldOk(BLD_IMG.smoke))return;
  const f=Math.floor(now/260),s=cx.imageSmoothingEnabled;cx.imageSmoothingEnabled=false;
  [[sx+41,0],[sx+51,1]].forEach(([x,o])=>cx.drawImage(BLD_IMG.smoke,((f+o)%3)*40,0,40,24,x,sy-8-11,20,12));
  cx.imageSmoothingEnabled=s;
}
