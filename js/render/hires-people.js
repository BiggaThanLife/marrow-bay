"use strict";
/* People and trees at half-unit detail (RS>=2, on the map canvas only; the character creator and scenes keep the older drawing).
   A person is laid out in half units from the anchor at their feet: 28 steps tall, 12 wide. Trees are cached as small sprites, one per size and variant. */

/* o: skin, hair (hex), style 0-6, hat, col (shirt or dress), fem, beard, collar (white shoulder line), sw (walk step), headOnly, marker (the player's bobbing tick, or null) */
function drawPersonHD(c,px,py,o){
  const d=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(px+x/2,py+y/2,w/2,h/2)};
  const skin=o.skin,skinSh=tone(skin,.82),hair=o.hair,hairHi=tone(hair,1.45),st=o.style||0,sw=o.sw?1:0;
  if(!o.headOnly){
    const col=o.col,hi=tone(col,1.22),lo=tone(col,.78),trou='#2e3340',shoe='#1b1410';
    d(-7,0,15,3,'rgba(0,0,0,.25)');d(-5,3,11,1,'rgba(0,0,0,.14)');
    /* legs and shoes (a step swaps their heights) */
    if(o.fem){
      d(-4,-6,2,5+sw,skin);d(2,-6,2,6-sw,skin);d(-5,-1+sw,4,2,shoe);d(1,-1-sw,4,2,shoe);
    }else{
      d(-5,-7,4,6+sw,trou);d(1,-7,4,7-sw,trou);d(-6,-1+sw,5,2,shoe);d(1,-1-sw,5,2,shoe);
      d(-5,-7,1,6+sw,tone(trou,1.3));
    }
    /* arms swing opposite to the legs */
    const al=sw?1:0,ar=sw?0:1;
    d(-8,-18+al,2,9,lo);d(6,-18+ar,2,9,lo);d(-8,-9+al,2,2,skin);d(6,-9+ar,2,2,skin);
    /* torso, or a dress */
    if(o.fem){
      d(-6,-19,12,9,col);d(-6,-19,2,9,hi);d(4,-19,2,9,lo);
      d(-8,-10,16,5,col);d(-8,-10,2,5,hi);d(6,-10,2,5,lo);d(-8,-6,16,1,lo);d(-3,-10,1,5,lo);d(2,-10,1,5,hi);
    }else{
      d(-6,-19,12,13,col);d(-6,-19,2,13,hi);d(4,-19,2,13,lo);d(-6,-8,12,2,lo);d(0,-17,1,9,lo);
      d(-1,-16,2,1,hi);
    }
    if(o.collar)d(-5,-19,10,1,'rgba(255,255,255,.75)');else d(-5,-19,10,1,hi);
    d(-1,-20,2,1,skinSh);
  }
  /* head */
  d(-4,-27,8,7,skin);d(3,-26,1,6,skinSh);d(-3,-21,6,1,skinSh);d(-5,-25,1,2,skin);d(4,-25,1,2,skinSh);
  d(-2,-24,1,1,'#1d1814');d(1,-24,1,1,'#1d1814');d(-1,-21,2,1,tone(skin,.7));
  /* hair */
  if(st===0){d(-5,-28,10,2,hair);d(-5,-26,1,3,hair);d(4,-26,1,2,hair);d(-3,-28,3,1,hairHi)}
  else if(st===1){d(-5,-28,10,2,hair);d(-5,-26,2,9,hair);d(3,-26,2,9,hair);d(-3,-28,3,1,hairHi);d(-5,-26,1,8,hairHi)}
  else if(st===2){c.globalAlpha=.55;d(-4,-28,8,2,hair);c.globalAlpha=1}
  else if(st===3){d(-3,-27,3,1,tone(skin,1.2))}
  else if(st===4){d(-5,-28,10,2,hair);d(-5,-26,1,2,hair);d(4,-26,1,2,hair);d(-2,-31,4,3,hair);d(-1,-31,2,1,hairHi)}
  else if(st===5){d(-5,-28,10,2,hair);d(-5,-26,1,3,hair);d(4,-26,2,9,hair);d(5,-18,1,3,tone(hair,.8));d(-3,-28,3,1,hairHi)}
  else if(st===6){d(-6,-31,12,4,hair);d(-7,-29,1,3,hair);d(6,-29,1,3,hair);d(-5,-27,1,3,hair);d(4,-27,1,3,hair);d(-3,-31,3,1,hairHi);d(1,-30,1,1,tone(hair,.7));d(-5,-30,1,1,tone(hair,.7))}
  if(o.beard){c.globalAlpha=.9;d(-4,-23,8,3,hair);c.globalAlpha=1;d(-2,-21,4,1,skin);d(-1,-21,2,1,tone(skin,.75))}
  if(o.hat)hdHat(d,o.hat);
  if(o.marker!=null){const m=-36+(o.marker?2:0);d(-2,m,4,6,'#4fd1b5');d(-2,m,4,1,'#bff5ea');d(1,m+1,1,5,'#2f9c86')}
}
function hdHat(d,hat){
  if(hat==='cap'){d(-6,-28,12,3,'#3a2a1c');d(-6,-28,12,1,'#5a4230');d(3,-25,5,1,'#241a10');d(-5,-27,2,1,'#6a5036')}
  else if(hat==='beanie'){d(-5,-31,10,5,'#b5453a');d(-5,-27,10,1,'#8a2f28');d(-4,-31,4,1,'#d5675a');d(-1,-33,2,2,'#d5675a')}
  else if(hat==='sun'){d(-10,-27,20,2,'#e0c060');d(-6,-32,12,5,'#e0c060');d(-6,-28,12,1,'#a8782a');d(-5,-32,5,1,'#f4dc90');d(-10,-26,20,1,'#b89a40')}
  else if(hat==='wool'){d(-5,-31,10,5,'#8a929c');d(-5,-27,10,1,'#6a727c');d(-4,-31,4,1,'#aab2bc');d(-2,-35,4,4,'#d8dde4');d(-1,-35,2,1,'#fff')}
  else if(hat==='brim'){d(-8,-27,16,2,'#5a4326');d(-5,-32,10,5,'#6a5030');d(-5,-28,10,1,'#2a1c10');d(-4,-32,4,1,'#8a6a40');d(-8,-26,16,1,'#3a2c18')}
}

/* ----- trees: a lumpy canopy cached as a sprite, lit from the upper left, with leaf specks and a dark rim ----- */
const TREECACHE={};
function treeSprite(s,variant,pal){
  const key=s+':'+variant+':'+pal;let sp=TREECACHE[key];if(sp)return sp;
  const r=Math.round(s*.5),R=(r+1)*2,W=R*2+6,Hh=R*2+6,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;
  const g=cv.getContext('2d'),mx=W/2,my=Hh/2,ph1=variant*1.7,ph2=variant*2.9+1,ph3=variant*.8;
  const P=[['#243f24','#2f5a2e','#3f7a3a','#5d9a4e'],['#27441f','#355f2c','#4a8442','#6aa85a'],['#1f3d2a','#2c5236','#3c7046','#58905e']][pal%3];
  const rad=a=>R*(.88+.07*Math.sin(3*a+ph1)+.05*Math.sin(5*a+ph2)+.04*Math.sin(8*a+ph3));
  const inside=(x,y)=>{const dx=x+.5-mx,dy=y+.5-my;return Math.hypot(dx,dy)<=rad(Math.atan2(dy,dx))};
  const nz=(x,y)=>{let h=(x*374761393+y*668265263+variant*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return (h^(h>>>16))>>>0};
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){
    if(!inside(x,y))continue;
    const dx=x+.5-mx,dy=y+.5-my,t=(dx*-.62+dy*-.78)/R;
    let tone_=t>.42?3:t>-.05?2:t>-.5?1:0;
    const n=nz(x,y)%9;
    if(n===0)tone_=Math.min(3,tone_+1);else if(n===1)tone_=Math.max(0,tone_-1);
    /* leaf clumps: small darker gaps in rows */
    if((x+y*2+variant)%7===0&&nz(x,y+3)%3===0)tone_=Math.max(0,tone_-1);
    const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
    g.fillStyle=edge?'#151720':P[tone_];g.fillRect(x,y,1,1);
  }
  /* underside shadow band */
  g.fillStyle='rgba(0,0,0,.2)';
  for(let x=0;x<W;x++)for(let y=Hh-1;y>=0;y--){if(inside(x,y)){const yy=y-1;if(inside(x,yy)&&!(!inside(x-1,yy)||!inside(x+1,yy)))g.fillRect(x,yy,1,1);break}}
  sp={cv,W,H:Hh};TREECACHE[key]=sp;return sp;
}
function drawTreeHD(tx,ty,bx,by,s,h,r,fade){
  const sp=treeSprite(s,hash(tx,ty)%5,h%3);
  const d=(x,y,w,hh,col)=>{cx.fillStyle=col;cx.fillRect(bx+x/2,by+y/2,w/2,hh/2)};
  /* trunk with bark, a flared foot and a little shadow */
  d(-5,1,10,2,'rgba(0,0,0,.22)');
  d(-2,-12,4,13,'#3e2a18');d(-2,-12,1,13,'#6a4a2c');d(1,-12,1,13,'#2a1a0c');
  d(0,-9,1,2,'#2a1a0c');d(-1,-5,1,2,'#55391f');d(-3,-1,1,2,'#3e2a18');d(2,-1,1,2,'#2a1a0c');
  const cyy=by-6-r;
  if(fade)cx.globalAlpha=.55;
  cx.drawImage(sp.cv,bx-sp.W/2/RS,cyy-sp.H/2/RS,sp.W/RS,sp.H/RS);
  cx.globalAlpha=1;
}
