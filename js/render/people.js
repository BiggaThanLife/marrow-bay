"use strict";
/* People, vehicles and bike or scooter riding. */
function person(x,y,col,isP,moving,now,headOnly,look){
  const px=Math.round(x*TS+8-camX),py=Math.round(y*TS+14-camY);
  const sw=moving&&Math.floor(now/140)%2;
  if(isP&&G&&G.look)return drawPlayer(cx,px,py,G.look,sw,headOnly,Math.floor(now/300)%2);
  if(look&&!isP)return drawNpc(cx,px,py,look,col,sw,headOnly);
  if(!headOnly){
    cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(px-3,py,7,2);
    cx.fillStyle='#2b2118';cx.fillRect(px-3+(sw?1:0),py-3,2,3);cx.fillRect(px+1-(sw?1:0),py-3,2,3);
    cx.fillStyle=col;cx.fillRect(px-3,py-9,6,7);
  }
  cx.fillStyle='#e8c39e';cx.fillRect(px-2,py-13,4,4);
  cx.fillStyle='#2b2118';cx.fillRect(px-2,py-13,4,1);
  if(isP){cx.fillStyle='#4fd1b5';cx.fillRect(px-1,py-18+(Math.floor(now/300)%2),2,3);if(!headOnly){cx.fillStyle='#fff';cx.fillRect(px-3,py-9,6,1)}}
}
/* Named NPCs and tenants: skin tone, hair, build and clothes vary so the crowd does not look like one person. */
function drawNpc(c,px,py,l,col,sw,headOnly){
  const skin=SKIN[l.skin]||SKIN[1],hair=HAIR[l.hair]||HAIR[0];
  if(!headOnly){
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(px-3,py,7,2);
    if(l.fem){
      c.fillStyle=skin;c.fillRect(px-2+(sw?1:0),py-2,1,2);c.fillRect(px+1-(sw?1:0),py-2,1,2);
      c.fillStyle=col;c.fillRect(px-3,py-9,6,5);c.fillRect(px-4,py-4,8,3);
    }else{
      c.fillStyle='#2b2118';c.fillRect(px-3+(sw?1:0),py-3,2,3);c.fillRect(px+1-(sw?1:0),py-3,2,3);
      c.fillStyle=col;c.fillRect(px-3,py-9,6,7);
    }
    c.fillStyle='rgba(255,255,255,.55)';c.fillRect(px-3,py-9,6,1);
  }
  c.fillStyle=skin;c.fillRect(px-2,py-13,4,4);
  c.fillStyle=hair;const st=l.style||0;
  if(st===0){c.fillRect(px-2,py-13,4,1);c.fillRect(px-3,py-13,1,2)}
  else if(st===1){c.fillRect(px-2,py-13,4,1);c.fillRect(px-3,py-13,1,6);c.fillRect(px+2,py-13,1,6)}
  else if(st===2){c.globalAlpha=.55;c.fillRect(px-2,py-13,4,1);c.globalAlpha=1}
  else if(st===4){c.fillRect(px-2,py-13,4,1);c.fillRect(px-1,py-15,2,2)}
  else if(st===5){c.fillRect(px-2,py-13,4,1);c.fillRect(px+2,py-12,1,4)}
  else if(st===6){c.fillRect(px-3,py-15,6,3);c.fillRect(px-3,py-12,1,2);c.fillRect(px+2,py-12,1,2)}
  if(l.beard){c.globalAlpha=.85;c.fillRect(px-2,py-11,4,2);c.globalAlpha=1;c.fillStyle=skin;c.fillRect(px-1,py-12,2,1)}
  if(l.hat)drawHat(c,px,py,l.hat);
}
const vehColor=(k,def)=>(G&&G.veh&&G.veh.paint&&G.veh.paint[k])||def;
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=Math.round((n>>16&255)*f),g=Math.round((n>>8&255)*f),b=Math.round((n&255)*f);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function drawVeh(k,x,y,now,mv){
  const px=Math.round(x*TS+8-camX),py=Math.round(y*TS+14-camY),sp=mv?Math.floor(now/90)%2:0;
  if(k==='bike'){
    cx.lineWidth=2;cx.strokeStyle='#f2f2f2';cx.beginPath();cx.arc(px-5,py-2,3,0,7);cx.stroke();cx.beginPath();cx.arc(px+5,py-2,3,0,7);cx.stroke();
    cx.lineWidth=1;cx.strokeStyle='#1c1c1c';cx.beginPath();cx.arc(px-5,py-2,3.6,0,7);cx.stroke();cx.beginPath();cx.arc(px+5,py-2,3.6,0,7);cx.stroke();
    cx.fillStyle=vehColor('bike','#e0402f');cx.fillRect(px-5,py-6,10,2);cx.fillRect(px+3,py-9,2,5);cx.fillRect(px-6,py-8,3,1);
  }else if(k==='scooter'){
    cx.fillStyle=vehColor('scooter','#e0b83a');cx.fillRect(px-6,py-5,12,3);cx.fillRect(px+4,py-9,2,5);
    cx.fillStyle='#f2f2f2';cx.fillRect(px-7,py-3,5,5);cx.fillRect(px+2,py-3,5,5);
    cx.fillStyle='#1c1c1c';cx.fillRect(px-6,py-2,3,3);cx.fillRect(px+3,py-2,3,3);
  }else{
    const c=G&&G.veh&&G.veh.paint&&G.veh.paint[k]?[G.veh.paint[k],shade(G.veh.paint[k],.75)]:k==='coupe'?['#d04030','#a02a20']:['#3a7ad0','#2a5aa0'];
    cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(px-9,py,19,2);
    cx.fillStyle=c[0];cx.fillRect(px-9,py-7,18,6);cx.fillStyle=c[1];cx.fillRect(px-5,py-11,10,5);
    cx.fillStyle='#bfe3f0';cx.fillRect(px-4,py-10,8,3);
    cx.fillStyle='#1c1c1c';cx.fillRect(px-7,py-2+sp*0,4,3);cx.fillRect(px+3,py-2,4,3);
    if(k==='coupe'){cx.fillStyle='#ffe08a';cx.fillRect(px+8,py-6,2,2)}
  }
}
let pFace=1;
function drawRide(k,x,y,now,mv){
  const px=Math.round(x*TS+8-camX),py=Math.round(y*TS+14-camY),bike=k==='bike';
  const ph=mv?now/110:0,L=G.look,oc=L?outfitOf(L.outfit).c:'#2f6fb3',sk=L?(SKIN[L.skin]||SKIN[1]):'#e8c39e';
  cx.save();cx.translate(px,py);cx.scale(pFace,1);
  cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(-8,0,17,2);
  const wheel=(wx,r)=>{
    cx.lineWidth=2;cx.strokeStyle='#f2f2f2';cx.beginPath();cx.arc(wx,-3,r,0,7);cx.stroke();
    cx.lineWidth=1;cx.strokeStyle='#1c1c1c';cx.beginPath();cx.arc(wx,-3,r+.7,0,7);cx.stroke();
    cx.beginPath();cx.moveTo(wx+Math.cos(ph)*r,-3+Math.sin(ph)*r);cx.lineTo(wx-Math.cos(ph)*r,-3-Math.sin(ph)*r);cx.stroke();
  };
  if(bike){
    wheel(-5,3);wheel(5,3);
    cx.lineWidth=1.5;cx.strokeStyle=vehColor('bike','#e0402f');cx.beginPath();cx.moveTo(-5,-3);cx.lineTo(-2,-8);cx.lineTo(4,-8);cx.lineTo(5,-3);cx.moveTo(-2,-8);cx.lineTo(0,-3);cx.lineTo(4,-8);cx.moveTo(4,-8);cx.lineTo(4,-11);cx.stroke();
    cx.fillStyle='#1c1c1c';cx.fillRect(-4,-9,4,1);cx.fillRect(3,-12,3,1);
    const fx=Math.cos(ph)*2,fy=Math.sin(ph)*2;
    cx.strokeStyle='#2b2118';cx.lineWidth=2;cx.beginPath();cx.moveTo(-2,-8);cx.lineTo(0+fx,-3+fy);cx.stroke();
    cx.fillStyle=oc;cx.fillRect(-3,-14,5,6);
    cx.fillStyle=sk;cx.fillRect(2,-12,3,2);
    if(L)drawPlayer(cx,1,-6,L,0,true,0);else{cx.fillStyle=sk;cx.fillRect(0,-19,4,4)}
  }else{
    wheel(-5,2);wheel(5,2);
    cx.fillStyle=vehColor('scooter','#e0b83a');cx.fillRect(-6,-5,12,2);cx.fillRect(4,-14,2,10);cx.fillStyle='#1c1c1c';cx.fillRect(3,-15,4,1);
    cx.fillStyle='#2b2118';cx.fillRect(-2,-6,4,2);
    cx.fillStyle=oc;cx.fillRect(-3,-10,6,5);
    cx.fillStyle=sk;cx.fillRect(3,-10,2,2);
    if(L)drawPlayer(cx,0,-1,L,0,true,0);else{cx.fillStyle=sk;cx.fillRect(-2,-19,4,4)}
  }
  cx.restore();
}
