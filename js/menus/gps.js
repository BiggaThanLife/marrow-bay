"use strict";
/* Phone > GPS: a full-screen sky view of the city. Drag to pan, pinch or +/- to zoom, tap a pin to pick a place.
   The card at the bottom offers a route, auto-walk, favorites and Googull, the city's search page for that place. */
let GV=null,gvTimer=0;
const GV_PX=8; /* pixels per tile in the base picture */
const GV_DIST_LABELS=[['Greenbelt',5,6],['Highline',25,.6],['Grid',25,17.6],['Dockside',24,30.4],['Neon Mile',52,9],['Foundry Row',52,29]];
function gvTileColor(x,y,t){
  const d=district(x,y);
  switch(t){
    case T.WATER:return '#2f6a86';
    case T.ROAD:return ROADC[d];
    case T.FARM:return '#8f6c3a';
    case T.PLAZA:return '#cdbd90';
    case T.DOCK:return '#85705a';
    case T.LOT:return '#6d7272';
    case T.PARK:return '#5a9a56';
    default:return GROUND[d];
  }
}
function gvBase(){
  const c=document.createElement('canvas');c.width=W*GV_PX;c.height=H*GV_PX;
  const g=c.getContext('2d');
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=map[y][x];
    if(t===T.BLD)continue;
    g.fillStyle=gvTileColor(x,y,t);g.fillRect(x*GV_PX,y*GV_PX,GV_PX,GV_PX);
  }
  /* road centre dashes */
  g.fillStyle='rgba(255,255,255,.28)';
  XS.forEach(x=>{for(let y=0;y<=32;y+=2)g.fillRect(x*GV_PX+3,y*GV_PX+2,2,4)});
  HY.forEach(y=>{for(let x=10;x<=60;x+=2){if(map[y][x]===T.ROAD)g.fillRect(x*GV_PX+2,y*GV_PX+3,4,2)}});
  /* buildings as roofs seen from above */
  blocks.forEach(b=>{
    const col=COL[b.poi?POIS[b.poi].kind:b.kind]||COL.tower;
    g.fillStyle=col[1];g.fillRect(b.x*GV_PX,b.y*GV_PX,4*GV_PX,4*GV_PX);
    g.fillStyle=col[0];g.fillRect(b.x*GV_PX+2,b.y*GV_PX+2,4*GV_PX-4,4*GV_PX-4);
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(b.x*GV_PX+4,b.y*GV_PX+4,4*GV_PX-8,2);g.fillRect(b.x*GV_PX+4,b.y*GV_PX+4*GV_PX-10,4*GV_PX-8,2);
  });
  return c;
}
function gvPins(){
  return gpsList().filter(d=>d.name!=='Home'||d.home).map(d=>({...d,fav:(G.favs||[]).includes(d.name)}));
}
function gvColor(d){
  if(d.mine)return '#4fd1b5';
  if(d.kind==='stop')return '#ffd24a';
  if(d.home)return '#7ab6ff';
  const c=COL[d.kind];return c?c[0]:'#c9c9c9';
}
function gpsMap(){
  worldPanel();
  const keep=GV&&GV.keep;
  GV=Object.assign({z:2.4,ox:0,oy:0,sel:null,base:gvBase(),pins:[],ptr:new Map(),moved:false},keep||{});
  GV.base=gvBase();GV.keep=null;
  let el=document.getElementById('gpsmap');
  if(!el){el=document.createElement('div');el.id='gpsmap';document.body.appendChild(el)}
  el.hidden=false;
  el.innerHTML=`<div class="gm-bar"><b>GPS</b><span class="gm-sp"></span><button type="button" id="gm-list">List</button><button type="button" id="gm-fit">Fit</button><button type="button" id="gm-minus" aria-label="Zoom out">&minus;</button><button type="button" id="gm-plus" aria-label="Zoom in">+</button><button type="button" id="gm-x" aria-label="Close">&times;</button></div><canvas id="gm-cv"></canvas><div id="gm-card" hidden></div>`;
  const cv2=document.getElementById('gm-cv');
  GV.cv=cv2;GV.g=cv2.getContext('2d');
  const size=()=>{const r=cv2.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv2.width=Math.max(1,Math.round(r.width*dpr));cv2.height=Math.max(1,Math.round(r.height*dpr));GV.w=r.width;GV.h=r.height;GV.dpr=dpr;gvClamp();gvDraw()};
  GV.size=size;
  window.addEventListener('resize',size);
  GV.fit=()=>Math.min(GV.w/W,GV.h/H);
  GV.s=()=>GV.fit()*GV.z; /* tile size in css pixels. Zoom 1 shows the whole city */
  size();
  /* open zoomed in enough to fill the screen from top to bottom, centred on you */
  if(!keep){GV.z=Math.max(GV.h/H,14)/GV.fit();gvCenter(G.p.x,G.p.y)}
  requestAnimationFrame(()=>{size();gvDraw()});
  gvBind();
  clearInterval(gvTimer);gvTimer=setInterval(()=>{if(GV&&GV.cv&&!document.getElementById('gpsmap').hidden)gvDraw()},400);
  if(GV.sel)gvCard();
}
function gvCenter(x,y){const s=GV.s();GV.ox=GV.w/2-(x+.5)*s;GV.oy=GV.h/2-(y+.5)*s;gvClamp()}
function gvClamp(){
  const s=GV.s(),mw=W*s,mh=H*s;
  GV.ox=mw<=GV.w?(GV.w-mw)/2:Math.min(0,Math.max(GV.w-mw,GV.ox));
  GV.oy=mh<=GV.h?(GV.h-mh)/2:Math.min(0,Math.max(GV.h-mh,GV.oy));
}
function gvZoom(f,cx,cy){
  const old=GV.s(),mx=((cx??GV.w/2)-GV.ox)/old,my=((cy??GV.h/2)-GV.oy)/old;
  GV.z=Math.min(8,Math.max(1,GV.z*f));
  const s=GV.s();GV.ox=(cx??GV.w/2)-mx*s;GV.oy=(cy??GV.h/2)-my*s;gvClamp();gvDraw();
}
function gvBind(){
  const cv2=GV.cv;
  document.getElementById('gm-x').onclick=()=>{gvClose();phone()};
  document.getElementById('gm-list').onclick=()=>{gvClose();gpsMenu()};
  document.getElementById('gm-fit').onclick=()=>{GV.z=1;gvClamp();gvDraw()};
  document.getElementById('gm-plus').onclick=()=>gvZoom(1.35);
  document.getElementById('gm-minus').onclick=()=>gvZoom(1/1.35);
  const pt=e=>{const r=cv2.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  cv2.addEventListener('pointerdown',e=>{
    e.preventDefault();try{cv2.setPointerCapture(e.pointerId)}catch(_){}
    GV.ptr.set(e.pointerId,{...pt(e),sx:pt(e).x,sy:pt(e).y});GV.moved=false;GV.pinch=0;
  });
  cv2.addEventListener('pointermove',e=>{
    const p=GV.ptr.get(e.pointerId);if(!p)return;
    const n=pt(e);
    if(GV.ptr.size===2){
      const a=[...GV.ptr.values()];
      GV.ptr.set(e.pointerId,{...p,x:n.x,y:n.y});
      const b=[...GV.ptr.values()],d1=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),d2=Math.hypot(b[0].x-b[1].x,b[0].y-b[1].y);
      if(d1>10)gvZoom(d2/d1,(b[0].x+b[1].x)/2,(b[0].y+b[1].y)/2);
      GV.moved=true;return;
    }
    if(Math.hypot(n.x-p.sx,n.y-p.sy)>6)GV.moved=true;
    if(GV.moved){GV.ox+=n.x-p.x;GV.oy+=n.y-p.y;gvClamp();gvDraw()}
    GV.ptr.set(e.pointerId,{...p,x:n.x,y:n.y});
  });
  const up=e=>{
    const p=GV.ptr.get(e.pointerId);GV.ptr.delete(e.pointerId);
    if(p&&!GV.moved&&GV.ptr.size===0)gvTap(pt(e).x,pt(e).y);
  };
  cv2.addEventListener('pointerup',up);
  cv2.addEventListener('pointercancel',e=>GV.ptr.delete(e.pointerId));
  cv2.addEventListener('wheel',e=>{e.preventDefault();const n=pt(e);gvZoom(e.deltaY<0?1.2:1/1.2,n.x,n.y)},{passive:false});
}
function gvTap(px,py){
  const s=GV.s();let best=null,bd=Math.max(16,s*.9);
  gvPins().forEach(d=>{const sx=GV.ox+(d.x+.5)*s,sy=GV.oy+(d.y+.5)*s,dd=Math.hypot(sx-px,sy-py);if(dd<bd){bd=dd;best=d}});
  GV.sel=best;gvCard();gvDraw();
}
function gvClose(){
  clearInterval(gvTimer);gvTimer=0;
  window.removeEventListener('resize',GV&&GV.size);
  const el=document.getElementById('gpsmap');if(el){el.hidden=true;el.innerHTML=''}
}
function gvDraw(){
  if(!GV||!GV.g)return;
  const g=GV.g,dpr=GV.dpr||1,s=GV.s();
  g.setTransform(dpr,0,0,dpr,0,0);
  g.fillStyle='#14262f';g.fillRect(0,0,GV.w,GV.h);
  g.imageSmoothingEnabled=false;
  g.drawImage(GV.base,GV.ox,GV.oy,W*s,H*s);
  /* district names */
  g.textAlign='center';g.textBaseline='middle';
  g.font=`700 ${Math.max(9,Math.min(16,s*1.6))}px "DM Sans",system-ui,sans-serif`;
  GV_DIST_LABELS.forEach(([n,x,y])=>{g.fillStyle='rgba(255,255,255,.55)';g.fillText(n.toUpperCase(),GV.ox+(x+.5)*s,GV.oy+(y+.5)*s)});
  /* route */
  if(typeof gpsPath!=='undefined'&&gpsPath.length&&G.gps){
    g.strokeStyle='#f2b84b';g.lineWidth=Math.max(2,s*.28);g.setLineDash([s*.5,s*.4]);g.lineJoin='round';g.beginPath();
    g.moveTo(GV.ox+(G.p.x+.5)*s,GV.oy+(G.p.y+.5)*s);
    gpsPath.forEach(q=>g.lineTo(GV.ox+(q[0]+.5)*s,GV.oy+(q[1]+.5)*s));
    g.stroke();g.setLineDash([]);
  }
  /* pins */
  const r=Math.max(5,Math.min(11,s*.9)),placed=[];
  gvPins().forEach(d=>{
    const sx=GV.ox+(d.x+.5)*s,sy=GV.oy+(d.y+.5)*s;
    if(sx<-20||sy<-20||sx>GV.w+20||sy>GV.h+20)return;
    const sel=GV.sel&&GV.sel.name===d.name&&GV.sel.x===d.x&&GV.sel.y===d.y;
    g.beginPath();
    if(d.kind==='stop'){g.rect(sx-r*.8,sy-r*.8,r*1.6,r*1.6)}else g.arc(sx,sy,sel?r*1.25:r,0,7);
    g.fillStyle=gvColor(d);g.fill();g.lineWidth=sel?3:2;g.strokeStyle=sel?'#ffffff':'#10202a';g.stroke();
    if(d.kind==='stop'){g.fillStyle='#10202a';g.font=`700 ${r*1.2}px sans-serif`;g.fillText('T',sx,sy+.5)}
    if(d.fav){g.fillStyle='#ffd24a';g.font=`700 ${r*1.4}px sans-serif`;g.fillText('★',sx+r*1.1,sy-r*1.1)}
    if(sel||s>=11){
      const label=d.name.replace(' (tram stop)','');
      g.font=`600 ${Math.max(10,Math.min(13,s*.9))}px "DM Sans",system-ui,sans-serif`;
      const tw=g.measureText(label).width,lx=sx,ly=sy+r+9;
      const box=[lx-tw/2-3,ly-7,tw+6,14];
      if(sel||!placed.some(b=>box[0]<b[0]+b[2]&&box[0]+box[2]>b[0]&&box[1]<b[1]+b[3]&&box[1]+box[3]>b[1])){
        placed.push(box);g.fillStyle='rgba(16,32,42,.82)';g.fillRect(box[0],box[1],box[2],box[3]);g.fillStyle='#e6efe9';g.fillText(label,lx,ly+.5);
      }
    }
  });
  /* destination flag and you */
  if(G.gps){const sx=GV.ox+(G.gps.x+.5)*s,sy=GV.oy+(G.gps.y+.5)*s;g.fillStyle='#e04040';g.fillRect(sx-1,sy-r*2.2,2,r*2.2);g.fillRect(sx,sy-r*2.2,r*1.4,r*.9)}
  const px=GV.ox+(G.p.x+.5)*s,py=GV.oy+(G.p.y+.5)*s,pulse=(Math.sin(Date.now()/250)+1)/2;
  g.beginPath();g.arc(px,py,r*(1.5+pulse*.8),0,7);g.fillStyle=`rgba(79,209,181,${.25-pulse*.15})`;g.fill();
  g.beginPath();g.arc(px,py,r*.8,0,7);g.fillStyle='#4fd1b5';g.fill();g.lineWidth=2;g.strokeStyle='#fff';g.stroke();
}
function gvEta(d){
  const sp=vehSpeed(G.veh.active)*G.mod.vspeed;
  return Math.max(1,Math.round(d.dist/sp*6));
}
function gvCard(){
  const c=document.getElementById('gm-card'),d=GV.sel;
  if(!d){c.hidden=true;c.innerHTML='';if(GV.size)setTimeout(GV.size,0);return}
  const isFav=(G.favs||[]).includes(d.name);
  d.dist=man(Math.round(G.p.x),Math.round(G.p.y),d.x,d.y);
  c.innerHTML=`<div class="gm-name"><b>${esc(d.name)}</b><small>${d.dist} tiles away, about ${gvEta(d)} min</small></div><div class="gm-btns">
    <button type="button" id="gm-go" class="primary">Auto-walk</button><button type="button" id="gm-guide">Show route</button><button type="button" id="gm-gg">Googull it</button>${d.home?'':`<button type="button" id="gm-fav">${isFav?'Unfavorite':'Favorite'}</button>`}</div>`;
  c.hidden=false;
  document.getElementById('gm-go').onclick=()=>{G.gps={x:d.x,y:d.y,name:d.name};gvClose();walkTo(d.x,d.y)};
  document.getElementById('gm-guide').onclick=()=>{G.gps={x:d.x,y:d.y,name:d.name};gpsTick();gvDraw();notify('GPS route set.')};
  document.getElementById('gm-gg').onclick=()=>{GV.keep={z:GV.z,ox:GV.ox,oy:GV.oy,sel:GV.sel};gvClose();googullPage(d)};
  const f=document.getElementById('gm-fav');
  if(f)f.onclick=()=>{G.favs=G.favs||[];if(isFav)G.favs=G.favs.filter(x=>x!==d.name);else G.favs.push(d.name);gvCard();gvDraw()};
  if(GV.size)setTimeout(GV.size,0);
}
/* ----- Googull: the city's search page ----- */
const GG_LOGO='<div class="gg-logo" aria-label="Googull"><b style="color:#4f8cf2">G</b><b style="color:#e65a4f">o</b><b style="color:#f2b84b">o</b><b style="color:#4f8cf2">g</b><b style="color:#5fb86a">u</b><b style="color:#e65a4f">l</b><b style="color:#f2b84b">l</b></div>';
function ggStars(v){const f=Math.round(v*2)/2,full=Math.floor(f),half=f-full>=.5;return '★'.repeat(full)+(half?'½':'')+'☆'.repeat(Math.max(0,5-full-(half?1:0)))}
function googullPage(d){
  const e=GG[d.kind]||GG_FALLBACK,h=hash(d.x*7+d.y,d.name.length*31+(d.kind?d.kind.length:0));
  const rating=Math.min(5,Math.max(1,e.base+((h%7)-3)*.08)),count=60+h%900;
  const poi=d.id&&POIS[d.id]?POIS[d.id]:null,own=OWNER[d.id]?NPC[OWNER[d.id]]:null;
  let status='';
  if(poi&&OPEN[d.id]){
    if(G.mod.closed.includes(d.id))status=`<span class="gg-closed">Temporarily closed</span> <span class="muted">${esc(G.mod.names[d.id]||'')}</span>`;
    else if(isOpen(d.id))status=`<span class="gg-open">Open now</span> <span class="muted">Closes ${fmtHr(OPEN[d.id][1])}</span>`;
    else status=`<span class="gg-closed">Closed</span> <span class="muted">Opens ${fmtHr(OPEN[d.id][0])}</span>`;
  }else if(poi||d.kind==='stop')status='<span class="gg-open">Open 24 hours</span>';
  const facts=[];
  if(poi)facts.push(['District',poi.d]);
  if(d.kind==='stop')facts.push(['Fare',G.fx&&G.fx.pass?'Free':'$2']);
  if(own&&(!d.mine))facts.push([own.role,`${own.name}. Attitude to you: ${LAB[tier(att(own))]}`]);
  if(d.id&&typeof shopOwned==='function'&&shopOwned(d.id))facts.push(['Owner','You']);
  facts.push(['Distance',`${man(Math.round(G.p.x),Math.round(G.p.y),d.x,d.y)} tiles`]);
  ui(`<div class="gg">${GG_LOGO}
    <div class="gg-search"><span>${esc(d.name.replace(' (tram stop)',''))}</span><i>Search</i></div>
    <p class="gg-meta muted small">About 1 result (0.${String(h%80+20).padStart(2,'0')} seconds)</p>
    <div class="gg-card"><h3>${esc(d.name.replace(' (tram stop)',''))}</h3><p class="gg-cat muted">${esc(e.cat)}</p>
    <p class="gg-rate"><span class="gg-stars">${ggStars(rating)}</span> <b>${rating.toFixed(1)}</b> <span class="muted">(${count} Googull reviews)</span></p>
    ${status?`<p>${status}</p>`:''}<p class="gg-tag">&ldquo;${esc(e.tag)}&rdquo;</p><p>${esc(e.about)}</p>
    <div class="kv gg-kv">${facts.map(f=>`<div><span>${esc(f[0])}</span><b>${esc(f[1])}</b></div>`).join('')}</div>
    <h4>People also ask</h4>${e.faq.map(f=>`<p class="gg-q"><b>${esc(f[0])}</b><br><span class="muted">${esc(f[1])}</span></p>`).join('')}
    <h4>Reviews</h4>${e.rev.map(r=>`<p class="gg-rev"><b>${esc(r[0])}</b> <span class="gg-stars">${'★'.repeat(r[1])}${'☆'.repeat(5-r[1])}</span><br>${esc(r[2])}</p>`).join('')}</div></div>`,[
      {label:'Take me there',sub:'Auto-walk to the door',fn:()=>{G.gps={x:d.x,y:d.y,name:d.name};closeMenu();walkTo(d.x,d.y)}},
      {label:'Back to the map',cls:'quiet',fn:()=>gpsMap()}]);
}
