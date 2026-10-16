"use strict";
/* Tiles and buildings. */
function night(){const h=(clockNow()/60)%24;return h>=21||h<5?.5:h>=19?(h-19)/2*.5:h<7?(7-h)/2*.5:0}
function tree(sx,sy){cx.fillStyle='#5b3d24';cx.fillRect(sx+7,sy+10,2,4);cx.fillStyle='#3f6b3a';cx.fillRect(sx+4,sy+3,8,8);cx.fillStyle='#4f8548';cx.fillRect(sx+5,sy+3,4,3)}
function drawTile(tx,ty,now){
  const t=map[ty][tx],sx=tx*TS-camX,sy=ty*TS-camY,d=district(tx,ty),h=hash(tx,ty);
  if(t===T.WATER){
    if(!drawGround('water',tx,ty,sx,sy,d)){cx.fillStyle='#2c5b78';cx.fillRect(sx,sy,TS,TS);
    if(Math.sin(now*.002+tx*.9+ty*.7)>.5){cx.fillStyle='#4f86a6';cx.fillRect(sx+3,sy+6,8,1)}}
    /* mudflat strip going under or coming up: the shallows take a muddy tint as the tide nears the thresholds */
    if(ty>=34&&ty<=35&&tx>=MUD_X0&&tx<=MUD_X1){const v=tideV(),k=clamp((-.1-v)/.5,0,.55);if(k>0){cx.fillStyle='rgba(138,118,86,'+k.toFixed(2)+')';cx.fillRect(sx,sy,TS,TS)}}
  }else if(t===T.FLAT&&ty>=34){
    /* mudflat strip: wet mud variants, a glossy wet edge toward the water, a few stranded weeds and pebbles; hash-driven so it never flickers */
    if(!drawGround('flat',tx,ty,sx,sy,d)){cx.fillStyle=h%3?'#6b5638':'#5d4a30';cx.fillRect(sx,sy,TS,TS)}
    const wetS=map[ty+1]&&map[ty+1][tx]===T.WATER,wetW=map[ty][tx-1]===T.WATER,wetE=map[ty][tx+1]===T.WATER;
    cx.fillStyle='rgba(150,190,205,.28)';cx.fillRect(sx+2+(h>>2)%6,sy+3+(h>>4)%4,5,1);
    if(wetS){cx.fillStyle='rgba(44,91,120,.55)';cx.fillRect(sx,sy+12,TS,4);cx.fillStyle='rgba(200,225,235,.6)';cx.fillRect(sx,sy+12,TS,1)}
    if(wetW){cx.fillStyle='rgba(44,91,120,.5)';cx.fillRect(sx,sy,2,TS)}
    if(wetE){cx.fillStyle='rgba(44,91,120,.5)';cx.fillRect(sx+TS-2,sy,2,TS)}
    if(ty===34&&map[ty-1][tx]===T.DOCK){cx.fillStyle='rgba(30,22,14,.3)';cx.fillRect(sx,sy,TS,2)}
    if(h%7===0){cx.fillStyle='#3e5a30';cx.fillRect(sx+4+(h>>3)%6,sy+6,1,3);cx.fillRect(sx+5+(h>>3)%6,sy+7,2,1);cx.fillRect(sx+3+(h>>3)%6,sy+8,1,2)}
    else if(h%5===0){cx.fillStyle='rgba(230,222,205,.75)';cx.fillRect(sx+3+(h>>5)%9,sy+5+(h>>6)%6,2,1);cx.fillStyle='#8f877a';cx.fillRect(sx+9,sy+9,2,2)}
    if(tideV()>-.45){cx.fillStyle='rgba(44,91,120,'+clamp((tideV()+.45)*1.2,0,.5).toFixed(2)+')';cx.fillRect(sx,sy,TS,TS)}
  }else if(t===T.FLAT){
    /* the low-tide walkway: exposed sand and mud with wet shine and a few shells, drawn from the tile hash so it never flickers */
    cx.fillStyle=h%3?'#8a7656':'#7d6a4c';cx.fillRect(sx,sy,TS,TS);
    cx.fillStyle='rgba(60,45,30,.35)';cx.fillRect(sx,sy+10,TS,6);
    cx.fillStyle='rgba(150,190,205,.35)';cx.fillRect(sx+2+(h>>2)%6,sy+3+(h>>4)%4,5,2);cx.fillRect(sx+8+(h>>3)%4,sy+11,4,1);
    cx.fillStyle='rgba(235,225,200,.7)';if(h%2)cx.fillRect(sx+3+(h>>5)%9,sy+7+(h>>6)%5,2,1);
  }else if(t===T.ROAD){
    if(!drawGround('road',tx,ty,sx,sy,d)){cx.fillStyle=ROADC[d];cx.fillRect(sx,sy,TS,TS)}
    const v=XS.includes(tx),hz=HY.includes(ty)||((ty===17||ty===27)&&tx<10);
    cx.fillStyle=d==='Greenbelt'?'#8f7348':'rgba(240,230,180,.55)';
    if(v&&!hz&&ty%2===0)cx.fillRect(sx+7,sy+3,2,5);
    if(hz&&!v&&tx%2===0)cx.fillRect(sx+3,sy+7,5,2);
    if(tx>=41&&tx<=44){cx.fillStyle='#d8d0b8';cx.fillRect(sx,sy,TS,2);cx.fillRect(sx,sy+TS-2,TS,2)}
    if(d==='Neon Mile'&&h%7===0){cx.fillStyle='rgba(255,80,200,.35)';cx.fillRect(sx+2,sy+2,3,1)}
  }else if(t===T.FARM){
    if(!drawGround('farm',tx,ty,sx,sy,d)){cx.fillStyle='#6f5237';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#5c4229';
    for(let i=2;i<TS;i+=4)cx.fillRect(sx,sy+i,TS,1)}
    const pl=G&&G.plots.find(q=>q.x===tx&&q.y===ty);
    if(RS>=2&&pl&&pl.s)drawCropHD(sx,sy,pl.s,cropOf(pl).col);
    else if(pl&&pl.s===1){cx.fillStyle='#6fbf5a';cx.fillRect(sx+4,sy+6,2,4);cx.fillRect(sx+10,sy+6,2,4)}
    else if(pl&&pl.s===2){cx.fillStyle=cropOf(pl).col;cx.fillRect(sx+3,sy+4,3,7);cx.fillRect(sx+10,sy+4,3,7)}
  }else if(t===T.PLAZA){
    if(!drawGround('plaza',tx,ty,sx,sy,d)){cx.fillStyle=(tx+ty)%2?'#cfc5ae':'#c4baa2';cx.fillRect(sx,sy,TS,TS)}
  }else if(t===T.DOCK){
    if(!drawGround('dock',tx,ty,sx,sy,d)){cx.fillStyle='#8b6a47';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#6e5236';
    for(let i=0;i<TS;i+=4)cx.fillRect(sx+i,sy,1,TS)}
    if(tideV()>.45){cx.fillStyle='rgba(44,91,120,.5)';cx.fillRect(sx,sy+5,TS,11);cx.fillStyle='rgba(225,238,242,.5)';cx.fillRect(sx,sy+5,TS,1)}
    else if(tideV()<-.45){cx.fillStyle='rgba(74,56,38,.35)';cx.fillRect(sx,sy+10,TS,6);cx.fillStyle='rgba(30,22,14,.35)';cx.fillRect(sx+3,sy+12,3,1);cx.fillRect(sx+10,sy+14,4,1)}
  }else if(t===T.LOT){
    if(!drawGround('lot',tx,ty,sx,sy,d)){cx.fillStyle='#b3a587';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#9a8d70';cx.fillRect(sx+3,sy+5,2,1);cx.fillRect(sx+10,sy+11,3,1)}
  }else if(t===T.BLD){
    cx.fillStyle='#3b3f48';cx.fillRect(sx,sy,TS,TS);
  }else{
    if(!drawGround('ground',tx,ty,sx,sy,d)){cx.fillStyle=GROUND[d];cx.fillRect(sx,sy,TS,TS)}
    cx.fillStyle='rgba(0,0,0,.08)';if(h%5===0)cx.fillRect(sx+(h>>3)%12,sy+(h>>5)%12,2,1);
    if(t===T.PARK?h%3===0:(h%9===0&&(d==='Highline'||d==='Greenbelt'))){if(depthOn())depthTree(tx,ty);else tree(sx,sy)}
  }
}
function drawBlock(b,lit,now){
  const sx=b.x*TS-camX,sy=b.y*TS-camY,w=4*TS,hh=4*TS;
  const biz=G&&!b.poi?bizOf(b.key):null;
  const bt=biz&&biz.type?BT[biz.type]:null;
  const c=bt?bt.col:COL[b.kind];
  cx.fillStyle='rgba(0,0,0,.22)';cx.fillRect(sx+4,sy+hh-2,w-4,3);
  cx.fillStyle=c[1];cx.fillRect(sx+2,sy+hh-20,w-4,18);
  cx.fillStyle=c[0];cx.fillRect(sx+2,sy+2,w-4,hh-22);
  cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(sx+2,sy+2,w-4,2);
  cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(sx+2,sy+hh-22,w-4,2);
  for(let i=0;i<3;i++){cx.fillStyle=lit?'#ffd88a':'#2c3440';cx.fillRect(sx+34+i*9,sy+hh-16,7,6)}
  cx.fillStyle='#2a1c12';cx.fillRect(sx+TS+3,sy+hh-12,10,10);
  const label=b.poi?SIGN[b.kind]:bt?bt.sign:null;
  cx.font='7px Silkscreen, monospace';cx.textAlign='center';
  if(label){cx.fillStyle='rgba(0,0,0,.45)';cx.fillRect(sx+6,sy+10,w-12,12);cx.fillStyle='#fff';cx.fillText(label,sx+w/2,sy+19)}
  else if(!b.poi&&!biz){
    cx.fillStyle='#fff';cx.fillRect(sx+10,sy+8,w-20,14);cx.fillStyle='#d94a3a';cx.fillRect(sx+10,sy+8,w-20,3);
    cx.fillStyle='#8a2a1a';cx.fillText('FOR SALE',sx+w/2,sy+19);
  }else if(biz&&!bt){cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(sx+8,sy+10,w-16,12);cx.fillStyle='#ffd88a';cx.fillText('YOURS',sx+w/2,sy+19)}
  if(biz){cx.fillStyle='#4fd1b5';cx.fillRect(sx+w-10,sy-4,1,10);cx.fillRect(sx+w-9,sy-4,6,4)}
  if(b.poi&&(b.kind==='casino'||b.kind==='velvet')&&lit&&Math.floor(now/400)%2){cx.fillStyle='#ff5ad0';cx.fillRect(sx+4,sy+4,w-8,1)}
}
