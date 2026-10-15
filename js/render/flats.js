"use strict";
/* Glints on the exposed flats and the dig animation (mud puff, the find rising out of the mud). Logic is in js/systems/flats.js. World units, half-unit detail. */
const FLAT_ICONS={};
function flatIcon(res){
  if(res.kind==='find'&&FISH_PACK.complete&&FISH_PACK.naturalWidth)return fishArt(res.find);
  const k=res.kind==='box'?'box':'scrap';
  if(FLAT_ICONS[k])return FLAT_ICONS[k];
  const c=document.createElement('canvas');c.width=10;c.height=8;const g=c.getContext('2d');
  const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  if(k==='box'){r(0,1,10,7,'#151720');r(1,2,8,5,'#8a6440');r(1,2,8,1,'#b98a58');r(4,3,2,2,'#ffd88a')}
  else{r(1,2,7,5,'#151720');r(2,3,5,3,'#8b949e');r(2,3,3,1,'#c5ccd3');r(6,1,2,2,'#151720');r(6,1,1,1,'#6b727a')}
  return FLAT_ICONS[k]=c;
}
function drawFlats(now){
  const spots=flatSpots();
  if(!spots.length&&DG.st==='idle'&&!DG.fx.length)return;
  const c=cx;c.save();c.translate(-camX,-camY);
  const d=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  /* subtle sparkle: one pixel that twinkles, sometimes a second, dimmer one beside it */
  spots.forEach(q=>{
    const px=q.x*TS+8,py=q.y*TS+8,t=Math.sin(now/520+q.ph);
    if(t>-.3){const a=.35+.5*Math.max(0,t);d(fsnap(px),fsnap(py),.5,.5,'rgba(255,250,215,'+a.toFixed(2)+')');d(fsnap(px)-.5,fsnap(py),1.5,.5,'rgba(255,250,215,'+(a*.35).toFixed(2)+')')}
    if(q.two&&Math.sin(now/410+q.ph*2)>.2)d(fsnap(px)+1.5,fsnap(py)-1,.5,.5,'rgba(190,235,255,.55)');
  });
  /* dig: little dark patch, a trowel bobbing, then the item rising */
  if(DG.st!=='idle'){
    const x=DG.sx,y=DG.sy;
    d(fsnap(x)-2,fsnap(y)+.5,4,1,'rgba(40,28,18,.55)');
    if(DG.st==='digging'){const k=(now-DG.t0)/FLAT_DIG_MS;d(fsnap(x)-1,fsnap(y)-fsnap(Math.abs(Math.sin(k*9))*2.5),2,1,'#8a6440')}
    else if(DG.res&&DG.res.kind!=='silt'){
      const k=Math.min(1,(now-DG.t0)/700),a=flatIcon(DG.res),Wd=a.width/2,Ht=a.height/2,iy=y-2-Ht/2-k*9+Math.sin(k*Math.PI)*2;
      c.drawImage(a,fsnap(x-Wd/2),fsnap(iy-Ht/2),Wd,Ht);if(Math.floor(now/160)%3===0)d(fsnap(x+Wd/2),fsnap(iy-Ht/2),.5,.5,'#fff');
    }
  }
  DG.fx=DG.fx.filter(e=>now<e.t+e.life);
  for(const e of DG.fx){
    const a=(now-e.t)/e.life;if(a<0)continue;
    if(e.k==='mud'){const s=(now-e.t)/16,x=e.x+e.vx*s,y=e.y+e.vy*s+.045*s*s,z=a<.4?1:.5;d(fsnap(x),fsnap(y),z,z,e.c)}
    else if(e.k==='text'){
      c.save();c.globalAlpha=a<.75?1:1-(a-.75)/.25;c.font='6px Silkscreen, monospace';c.textAlign='center';
      const y=DG.sy-16-a*9;c.fillStyle='#151720';c.fillText(e.s,DG.sx+.5,y+.5);c.fillStyle=e.col||'#fff';c.fillText(e.s,DG.sx,y);c.restore();
    }
  }
  c.restore();
}
