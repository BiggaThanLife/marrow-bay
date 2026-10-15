"use strict";
/* Hands-on fishing, drawn on the world canvas right after the player. Works in world units (translated by the camera), half-unit detail like the rest of the HD art.
   Rod, line, bobber, ripples, splash, droplets, the "!" bubble, floating text and the pack-art fish held over the head. Logic is in js/systems/fishing.js. */
const fsnap=v=>Math.round(v*2)/2;
function drawFishing(now){
  if(FS.st==='idle'&&!FS.fx.length)return;
  const c=cx,P={x:FS.px,y:FS.py},st=FS.st;
  c.save();c.translate(-camX,-camY);
  const d=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  const ring=(x,y,r,a)=>{const n=Math.max(8,Math.ceil(r*3));c.fillStyle='rgba(225,242,255,'+a+')';for(let i=0;i<n;i++){const an=i/n*Math.PI*2;c.fillRect(fsnap(x+Math.cos(an)*r),fsnap(y+Math.sin(an)*r*.42),1,.5)}};
  const line=(x0,y0,x1,y1,col,sag)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.ceil(L*2));c.fillStyle=col;for(let i=0;i<=n;i++){const k=i/n;c.fillRect(fsnap(x0+(x1-x0)*k),fsnap(y0+(y1-y0)*k+(sag||0)*Math.sin(Math.PI*k)),.5,.5)}};
  const active=st!=='idle';
  if(active){
    /* the player faces the water (down); the rod is held out to the side over it, and raised once a fish is on */
    const tip=(st==='reeling'||st==='landed')?{x:P.x+5,y:P.y-22}:{x:P.x+10,y:P.y-12},h=charPlayerSheet(G.look)?{x:P.x+3,y:P.y-6}:{x:P.x+3.5,y:P.y-4.5};
    /* bobber and line */
    if(st!=='reeling'&&st!=='landed'){
      let b;
      if(st==='casting'){const k=Math.min(1,(now-FS.t0)/FISH_CAST_MS);b={x:tip.x+(FS.tx-tip.x)*k,y:tip.y+(FS.ty-tip.y)*k-12*Math.sin(Math.PI*k),air:k<1}}
      else{let y=FS.ty+Math.sin(now/320)*.5;for(const nb of FS.nibbles)if(now>nb.at&&now<nb.at+260)y+=1.2;b={x:FS.tx,y}}
      line(tip.x,tip.y,b.x,b.y-2,'rgba(220,232,240,.75)',st==='waiting'?4:st==='bite'?1:0);
      if(st==='bite'){ring(b.x,b.y+1,2.5+Math.sin(now/60),.6);if(Math.floor(now/90)%2)d(b.x-.5,b.y-.5,1,1,'rgba(255,255,255,.8)')}
      else{
        if(!b.air)ring(b.x,b.y+1.2,2.6,.35);
        if(FISH_PACK.complete&&FISH_PACK.naturalWidth){c.drawImage(FISH_BOB||(FISH_BOB=fishPackIcon(16)),fsnap(b.x-4),fsnap(b.y-5),8,8)}
        else{d(b.x-1.5,b.y-2,3,3.5,'#151720');d(b.x-1,b.y-1.5,2,1.5,'#d8402f');d(b.x-1,b.y,2,1,'#f4f1e8')}
      }
    }
    /* rod */
    line(h.x,h.y,tip.x,tip.y,'#4a3220');line(h.x+.5,h.y,tip.x+.5,tip.y,'#8a6440');
    d(fsnap(h.x)-.5,fsnap(h.y)-.5,1.5,2,'#2a1d12');d(fsnap(h.x)-1,fsnap(h.y)+1,2,1,'#5a5f68');
    /* the fish: arcs in on the reel, then is held up */
    if(FS.fish&&(st==='reeling'||st==='landed')){
      const a=FS.fish.junk?fishArt(FS.fish.junk):fishArt(FS.fish.art),Wd=a.width/2,Ht=a.height/2;
      let x,y,flip=false;
      if(st==='reeling'){const k=Math.min(1,(now-FS.t0)/FISH_REEL_MS);x=FS.tx+(P.x-FS.tx)*k;y=FS.ty+(P.y-21-FS.ty)*k-14*Math.sin(Math.PI*k);flip=Math.floor(now/110)%2===0;
        if(Math.random()<.35)FS.fx.push({k:'drop',x,y,vx:rnd(-.4,.4),vy:rnd(-.3,.3),t:now,life:300})}
      else{x=P.x;y=P.y-21+Math.sin(now/260)*.7}
      c.save();c.translate(fsnap(x),fsnap(y));if(flip)c.scale(-1,1);c.drawImage(a,-Wd/2,-Ht/2,Wd,Ht);c.restore();
      if(st==='landed'&&Math.floor(now/180)%4===0){d(fsnap(x+Wd/2+1),fsnap(y-Ht/2-1),1,1,'#fff');d(fsnap(x-Wd/2-2),fsnap(y+1),1,1,'#fff')}
    }
    /* "!" bubble */
    if(st==='bite'){
      const k=clamp((now-FS.t0)/140,0,1),x=P.x,y=P.y-27+(1-k)*4;
      d(x-3.5,y-.5,7,10,'#151720');d(x-3,y,6,9,'#fffbe8');d(x-3,y+8,6,1,'#d8d2b8');
      d(x-.5,y+1.5,1.5,4,'#e0402f');d(x-.5,y+6.5,1.5,1.5,'#e0402f');d(x-1,y+9.5,2,1,'#151720');
    }
  }
  /* splashes, rings, droplets, floating text */
  FS.fx=FS.fx.filter(e=>now<e.t+e.life);
  for(const e of FS.fx){
    const a=(now-e.t)/e.life;if(a<0)continue;
    if(e.k==='drop'){const s=(now-e.t)/16,x=e.x+e.vx*s,y=e.y+e.vy*s+.045*s*s;if(y<e.y+2)d(fsnap(x),fsnap(y),1,1,a<.5?'#f2fbff':'#9fd0ea')}
    else if(e.k==='ring')ring(e.x,e.y,e.r0+(e.r1-e.r0)*a,(.7*(1-a)).toFixed(2));
    else if(e.k==='text'){
      c.save();c.globalAlpha=a<.75?1:1-(a-.75)/.25;c.font='6px Silkscreen, monospace';c.textAlign='center';
      const y=P.y-30-a*10;c.fillStyle='#151720';c.fillText(e.s,P.x+.5,y+.5);c.fillStyle=e.col||'#fff';c.fillText(e.s,P.x,y);c.restore();
    }
  }
  c.restore();
}
