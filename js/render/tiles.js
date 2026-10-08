"use strict";
/* Tiles and buildings. */
function night(){const h=(clockNow()/60)%24;return h>=21||h<5?.5:h>=19?(h-19)/2*.5:h<7?(7-h)/2*.5:0}
function tree(sx,sy){cx.fillStyle='#5b3d24';cx.fillRect(sx+7,sy+10,2,4);cx.fillStyle='#3f6b3a';cx.fillRect(sx+4,sy+3,8,8);cx.fillStyle='#4f8548';cx.fillRect(sx+5,sy+3,4,3)}
function drawTile(tx,ty,now){
  const t=map[ty][tx],sx=tx*TS-camX,sy=ty*TS-camY,d=district(tx,ty),h=hash(tx,ty);
  if(t===T.WATER){
    cx.fillStyle='#2c5b78';cx.fillRect(sx,sy,TS,TS);
    if(Math.sin(now*.002+tx*.9+ty*.7)>.5){cx.fillStyle='#4f86a6';cx.fillRect(sx+3,sy+6,8,1)}
  }else if(t===T.ROAD){
    cx.fillStyle=ROADC[d];cx.fillRect(sx,sy,TS,TS);
    const v=XS.includes(tx),hz=HY.includes(ty)||((ty===17||ty===27)&&tx<10);
    cx.fillStyle=d==='Greenbelt'?'#8f7348':'rgba(240,230,180,.55)';
    if(v&&!hz&&ty%2===0)cx.fillRect(sx+7,sy+3,2,5);
    if(hz&&!v&&tx%2===0)cx.fillRect(sx+3,sy+7,5,2);
    if(tx>=41&&tx<=44){cx.fillStyle='#d8d0b8';cx.fillRect(sx,sy,TS,2);cx.fillRect(sx,sy+TS-2,TS,2)}
    if(d==='Neon Mile'&&h%7===0){cx.fillStyle='rgba(255,80,200,.35)';cx.fillRect(sx+2,sy+2,3,1)}
  }else if(t===T.FARM){
    cx.fillStyle='#6f5237';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#5c4229';
    for(let i=2;i<TS;i+=4)cx.fillRect(sx,sy+i,TS,1);
    const pl=G&&G.plots.find(q=>q.x===tx&&q.y===ty);
    if(pl&&pl.s===1){cx.fillStyle='#6fbf5a';cx.fillRect(sx+4,sy+6,2,4);cx.fillRect(sx+10,sy+6,2,4)}
    if(pl&&pl.s===2){cx.fillStyle='#e0b83a';cx.fillRect(sx+3,sy+4,3,7);cx.fillRect(sx+10,sy+4,3,7)}
  }else if(t===T.PLAZA){
    cx.fillStyle=(tx+ty)%2?'#cfc5ae':'#c4baa2';cx.fillRect(sx,sy,TS,TS);
  }else if(t===T.DOCK){
    cx.fillStyle='#8b6a47';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#6e5236';
    for(let i=0;i<TS;i+=4)cx.fillRect(sx+i,sy,1,TS);
    if(tideV()>.45){cx.fillStyle='rgba(44,91,120,.4)';cx.fillRect(sx,sy+8,TS,8)}
  }else if(t===T.LOT){
    cx.fillStyle='#b3a587';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='#9a8d70';cx.fillRect(sx+3,sy+5,2,1);cx.fillRect(sx+10,sy+11,3,1);
  }else if(t===T.BLD){
    cx.fillStyle='#3b3f48';cx.fillRect(sx,sy,TS,TS);
  }else{
    cx.fillStyle=GROUND[d];cx.fillRect(sx,sy,TS,TS);
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
