"use strict";
/* Street props and crops at half-unit detail (RS>=2): lamps, bus stops, FLACK cameras and the plants on farm plots. Each draws in the same spot
   and size as the older version, which stays as the fallback. d(x,y,w,h,col) lays blocks out in half units from an anchor in map units. */
const hd2=(ax,ay)=>(x,y,w,h,col)=>{cx.fillStyle=col;cx.fillRect(ax+x/2,ay+y/2,w/2,h/2)};
/* a street lamp: plinth, pole with a lit edge, arm and a hooded head; the glass glows when on */
function drawLampHD(lx,ly,on){
  const d=hd2(lx,ly);
  d(-3,24,8,2,'rgba(0,0,0,.28)');
  d(-2,20,6,4,'#1e2430');d(-2,20,6,1,'#4a5466');d(-2,20,1,4,'#3a4252');
  d(0,-2,2,23,'#1e2430');d(1,0,1,20,'#56617a');
  d(0,-3,9,2,'#1e2430');d(1,-3,7,1,'#3a4252');
  d(4,-2,7,3,'#1e2430');d(5,-2,5,1,'#4a5466');
  d(5,1,5,1,on?'#fff1b8':'#7a8496');
  if(on){d(4,2,7,1,'rgba(255,230,160,.55)');d(5,3,5,1,'rgba(255,230,160,.25)')}
}
/* a tram stop sign: post, framed blue sign with a little tram on it and a timetable line */
function drawStopHD(sx,sy){
  const d=hd2(sx,sy);
  d(10,24,12,2,'rgba(0,0,0,.25)');
  d(14,-4,3,28,'#2a3140');d(16,-4,1,28,'#56617a');d(12,22,7,2,'#1e2430');
  d(4,-12,24,16,'#1e2430');d(5,-11,22,14,'#3a86d6');d(5,-11,22,1,'#7ab4ec');d(5,2,22,1,'#2a66a6');
  d(8,-9,11,7,'#f4f2ea');d(9,-8,3,2,'#3a86d6');d(13,-8,3,2,'#3a86d6');d(8,-3,11,1,'#c9ced3');d(9,-2,2,1,'#1e2430');d(16,-2,2,1,'#1e2430');d(13,-10,1,1,'#f4f2ea');
  d(21,-8,4,1,'#f4f2ea');d(21,-6,3,1,'#f4f2ea');d(21,-4,4,1,'#f4f2ea');
}
/* a FLACK camera on its pole, turned to the crossing: bracket, housing with a lens, and the red light that blinks (blind cameras are painted pink) */
function drawCamHD(bx,by,hx,dx,blind,lit){
  const d=hd2(0,0);
  d(bx*2-3,by*2,7,2,'rgba(0,0,0,.25)');
  d(bx*2-2,by*2-20,4,20,'#2a3140');d(bx*2,by*2-20,1,20,'#56617a');
  d(bx*2-2,by*2-21,4,2,'#1e2430');
  const x=hx*2,y=by*2-26,body=blind?'#e04080':'#5a6578',top=blind?'#f070a8':'#8a95a8';
  d(x,y,14,8,'#1e2430');d(x+1,y+1,12,6,body);d(x+1,y+1,12,1,top);
  const lens=dx>0?x:x+10;d(lens,y+2,4,4,'#151720');d(lens+1,y+3,2,2,blind?'#333':'#3a6080');
  d(dx>0?x+11:x+1,y+2,2,2,blind?'#333':lit?'#ff3b3b':'#7a1c1c');
}
/* plants on a farm plot: s 1 is two seedlings, s 2 is two grown plants with fruit in the crop's colour */
function drawCropHD(sx,sy,s,col){
  const d=hd2(sx,sy);
  for(const x0 of [6,18]){
    if(s===1){d(x0+3,14,1,6,'#3a6a2e');d(x0+1,12,3,2,'#6fbf5a');d(x0+4,13,3,2,'#5aa64a');d(x0+3,20,2,1,'rgba(0,0,0,.25)')}
    else{
      d(x0+3,10,2,12,'#2f5a28');
      d(x0,10,8,6,'#3f7a3a');d(x0+1,8,6,3,'#4f9a48');d(x0+1,8,3,1,'#78c060');d(x0-1,14,3,4,'#356a30');d(x0+6,13,3,4,'#356a30');
      d(x0+1,12,3,3,col);d(x0+5,15,2,2,col);d(x0+1,12,1,1,'rgba(255,255,255,.45)');
      d(x0,22,8,1,'rgba(0,0,0,.25)');
    }
  }
}
