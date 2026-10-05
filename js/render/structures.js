"use strict";
/* Tram stops and player structures. */
function drawStop(s){
  const sx=s.x*TS-camX,sy=s.y*TS-camY;
  cx.fillStyle='#2a3140';cx.fillRect(sx+7,sy-2,2,14);
  cx.fillStyle='#3a86d6';cx.fillRect(sx+2,sy-6,12,8);cx.fillStyle='#fff';cx.fillRect(sx+4,sy-4,8,1);cx.fillRect(sx+4,sy-2,5,1);
}
function drawStruct(st,now){
  const sx=st.x*TS-camX,sy=st.y*TS-camY;
  cx.fillStyle='rgba(0,0,0,.2)';cx.fillRect(sx+1,sy+14,14,2);
  if(st.type==='stall'){
    for(let i=0;i<4;i++){cx.fillStyle=i%2?'#e8e0c8':'#4fd1b5';cx.fillRect(sx+1+i*3.5,sy+1,4,5)}
    cx.fillStyle='#8a5a30';cx.fillRect(sx+2,sy+7,12,7);
    const any=Object.values(st.stock).some(v=>v>0);
    cx.fillStyle=any?'#e0b83a':'#5a3a1c';cx.fillRect(sx+4,sy+8,3,2);cx.fillRect(sx+9,sy+8,3,2);
  }else if(st.type==='planter'){
    cx.fillStyle='#6b4a2c';cx.fillRect(sx+2,sy+9,12,5);
    cx.fillStyle='rgba(200,235,240,.6)';cx.fillRect(sx+2,sy+3,12,6);
    if(st.s===1){cx.fillStyle='#6fbf5a';cx.fillRect(sx+5,sy+6,2,3);cx.fillRect(sx+9,sy+6,2,3)}
    if(st.s===2){cx.fillStyle='#e0b83a';cx.fillRect(sx+4,sy+4,3,5);cx.fillRect(sx+9,sy+4,3,5)}
  }else if(st.type==='smoker'){
    cx.fillStyle='#3a3a40';cx.fillRect(sx+4,sy+4,8,10);cx.fillStyle='#e07a3a';cx.fillRect(sx+6,sy+10,4,2);
    cx.fillStyle='rgba(200,200,200,.6)';cx.fillRect(sx+7,sy+1-(Math.floor(now/400)%2),2,2);
  }else if(st.type==='bench'){
    cx.fillStyle='#8a6a40';cx.fillRect(sx+2,sy+7,12,3);cx.fillRect(sx+3,sy+10,2,4);cx.fillRect(sx+11,sy+10,2,4);
    cx.fillStyle='#c0c4c8';cx.fillRect(sx+5,sy+4,5,2);
  }else if(st.type==='house'){
    cx.fillStyle='#b58a5a';cx.fillRect(sx+2,sy+6,12,8);cx.fillStyle='#8a3a2a';cx.fillRect(sx+1,sy+2,14,5);cx.fillStyle='#2a1c12';cx.fillRect(sx+7,sy+9,3,5);
  }else{
    cx.fillStyle='#5b3d24';cx.fillRect(sx+7,sy+6,2,8);cx.fillStyle='#e0c070';cx.fillRect(sx+3,sy+2,10,6);cx.fillStyle='#8a5a30';cx.fillRect(sx+5,sy+4,6,1);
  }
}
