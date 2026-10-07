"use strict";
/* Draws the whole world each frame. */
function drawWorld(now){
  const x0=Math.floor(camX/TS),y0=Math.floor(camY/TS);
  for(let ty=y0;ty<=y0+Math.ceil(VH/TS);ty++)for(let tx=x0;tx<=x0+Math.ceil(VW/TS);tx++){
    if(tx<0||ty<0||tx>=W||ty>=H)continue;
    drawTile(tx,ty,now);
    if(placing&&canBuild(tx,ty)){const sx=tx*TS-camX,sy=ty*TS-camY;cx.fillStyle='rgba(79,209,181,.28)';cx.fillRect(sx,sy,TS,TS);cx.fillStyle='rgba(79,209,181,.9)';cx.fillRect(sx,sy,3,1);cx.fillRect(sx,sy,1,3);cx.fillRect(sx+TS-3,sy+TS-1,3,1);cx.fillRect(sx+TS-1,sy+TS-3,1,3)}
  }
  const n=night(),lit=n>.2;
  const issByKey={};if(G)G.biz.forEach(b=>{if(b.type==='rental'&&b.issues&&b.issues.length)issByKey[b.key]=b.issues.length});
  blocks.forEach(b=>{
    const sx=b.x*TS-camX,sy=b.y*TS-camY;
    if(sx>VW||sy>VH||sx<-64||sy<-64)return;
    drawBlock(b,lit,now);
    const bz=G&&issByKey[b.key];
    if(bz){const bx=sx+TS*2,by=sy+3;cx.fillStyle='#fff';cx.beginPath();cx.arc(bx,by,7,0,7);cx.fill();cx.fillStyle='#d33a2c';cx.beginPath();cx.arc(bx,by,6,0,7);cx.fill();cx.fillStyle='#fff';cx.font='bold 9px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(String(bz),bx,by+.5);cx.textAlign='left';cx.textBaseline='alphabetic'}
  });
  STOPS.forEach(s=>{const sx=s.x*TS-camX,sy=s.y*TS-camY;if(sx>-16&&sx<VW&&sy>-16&&sy<VH)drawStop(s)});
  if(G){const nc=camCount();for(let i=0;i<nc;i++){const q=FLACK_SITES[i],sx=q.x*TS-camX,sy=q.y*TS-camY;if(sx>-16&&sx<VW&&sy>-8&&sy<VH+8)drawCam(sx,sy,i,now)}}
  const fx=23*TS-camX,fy=15*TS-camY;
  cx.fillStyle='#8aa6b5';cx.beginPath();cx.arc(fx,fy,10,0,7);cx.fill();
  cx.fillStyle='#4f86a6';cx.beginPath();cx.arc(fx,fy,7,0,7);cx.fill();
  cx.fillStyle='#cfe3ee';cx.fillRect(fx-1,fy-3+Math.sin(now*.005),2,4);
  if(G){
    const ents=[];
    G.structs.forEach(s=>ents.push({y:s.y-.5,f:()=>drawStruct(s,now)}));
    NPCS.forEach(n=>{if(!n.indoors)ents.push({y:n.y,f:()=>person(n.x,n.y,n.col,false,n.path.length>0,now,false,NPC_LOOK[n.id])})});
    WALKERS.forEach(w=>{if(!w.indoors)ents.push({y:w.y,f:()=>person(w.x,w.y,w.col,false,w.path.length>0,now,false,w.look)})});
    if(G.companion&&NPC[G.companion]){const cn=NPC[G.companion],ct=compTrail.length>=8?compTrail[0]:[G.p.x-.9,G.p.y+.1];ents.push({y:ct[1],f:()=>person(ct[0],ct[1],cn.col,false,compTrail.length>=8,now,false,NPC_LOOK[cn.id])})}
    ents.push({y:G.p.y,f:()=>{
      const a=G.veh.active,mv=G.p.path.length>0;
      if(mv){const dx=G.p.path[0][0]-G.p.x;if(Math.abs(dx)>.05)pFace=dx>0?1:-1}
      if(a==='bike'||a==='scooter')drawRide(a,G.p.x,G.p.y,now,mv);
      else if(a==='sedan'||a==='coupe'){
        const mx=Math.round(G.p.x*TS+8-camX);
        cx.save();cx.translate(mx,0);cx.scale(pFace,1);cx.translate(-mx,0);
        drawVeh(a,G.p.x,G.p.y,now,mv);person(G.p.x,G.p.y-.15,'#2f6fb3',true,mv,now,true);cx.restore();
      }else person(G.p.x,G.p.y,'#2f6fb3',true,mv,now);
    }});
    ents.sort((a,b)=>a.y-b.y).forEach(e=>e.f());
    if(dest&&G.p.path.length){
      const dx=dest[0]*TS-camX,dy=dest[1]*TS-camY;
      cx.strokeStyle='#4fd1b5';cx.lineWidth=1;cx.strokeRect(dx+1.5,dy+1.5,TS-3,TS-3);
    }
    if(G.mission){
      const poi=POIS[G.mission.stops[G.mission.i]],mx=poi.ex*TS-camX+8,my=poi.ey*TS-camY+8;
      const ax=clamp(mx,6,VW-6),ay=clamp(my,6,VH-6),pulse=2+Math.sin(now*.008)*1.5;
      cx.fillStyle='#ffd88a';cx.beginPath();cx.arc(ax,ay,3+pulse*.4,0,7);cx.fill();
      cx.strokeStyle='#ffd88a';cx.beginPath();cx.arc(ax,ay,6+pulse,0,7);cx.stroke();
    }
  }
  if(G&&G.gps){
    cx.fillStyle='#4fd1b5';
    const off=Math.floor(now/180);
    for(let i=0;i<gpsPath.length;i++){
      if((i+off)%3)continue;
      const gsx=gpsPath[i][0]*TS-camX+7,gsy=gpsPath[i][1]*TS-camY+7;
      if(gsx<-3||gsy<-3||gsx>VW||gsy>VH)continue;
      cx.fillRect(gsx,gsy,3,3);
    }
    const gx=G.gps.x*TS-camX+8,gy=G.gps.y*TS-camY+8;
    if(gx<0||gy<0||gx>VW||gy>VH){cx.beginPath();cx.arc(clamp(gx,6,VW-6),clamp(gy,6,VH-6),4,0,7);cx.fill()}
    else{cx.strokeStyle='#4fd1b5';cx.strokeRect(gx-7,gy-7,14,14)}
  }
  if(n>0){cx.fillStyle=`rgba(12,18,48,${n})`;cx.fillRect(0,0,VW,VH)}
  if(G&&G.heat>=2&&NPC.reyes.chasing){const f=Math.floor(now/180)%2;cx.fillStyle=f?'rgba(220,40,40,.35)':'rgba(50,90,230,.35)';cx.fillRect(0,0,VW,3);cx.fillRect(0,VH-3,VW,3)}
}
