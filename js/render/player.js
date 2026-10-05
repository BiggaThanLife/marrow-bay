"use strict";
/* Player sprite (shared by map and creator). */
function drawPlayer(c,px,py,l,sw,headOnly,t){
  if(!headOnly){
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(px-3,py,7,2);
    c.fillStyle='#2b2118';c.fillRect(px-3+(sw?1:0),py-3,2,3);c.fillRect(px+1-(sw?1:0),py-3,2,3);
    c.fillStyle=outfitOf(l.outfit).c;c.fillRect(px-3,py-9,6,7);
    c.fillStyle='#fff';c.fillRect(px-3,py-9,6,1);
  }
  c.fillStyle=SKIN[l.skin]||SKIN[1];c.fillRect(px-2,py-13,4,4);
  c.fillStyle=HAIR[l.hair]||HAIR[0];
  if(l.style===0)c.fillRect(px-2,py-13,4,1);
  else if(l.style===1){c.fillRect(px-2,py-13,4,1);c.fillRect(px-3,py-13,1,5);c.fillRect(px+2,py-13,1,5)}
  else if(l.style===2){c.globalAlpha=.55;c.fillRect(px-2,py-13,4,1);c.globalAlpha=1}
  if(l.hat==='cap'){c.fillStyle='#3a2a1c';c.fillRect(px-3,py-14,6,2);c.fillRect(px+2,py-12,2,1)}
  else if(l.hat==='beanie'){c.fillStyle='#b5453a';c.fillRect(px-2,py-15,4,3)}
  else if(l.hat==='brim'){c.fillStyle='#5a4326';c.fillRect(px-4,py-13,8,1);c.fillRect(px-2,py-16,4,3)}
  c.fillStyle='#4fd1b5';c.fillRect(px-1,py-18+(t||0),2,3);
}
