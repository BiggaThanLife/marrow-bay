"use strict";
/* Districts show their meters. Each district's meter drifts between 0 and 100 (Harvest, Market, Order, Catch and cargo, Underworld, Output) and, subtly, the map shows it:
   DSTATE(d) is 2 when the meter is high, 0 when low, 1 in between. High means more people on the street and more lit windows by day; low means fewer people
   and boarded-up empty buildings; and every district adds its own small ground details (crates, litter, flyers, gulls, soot, neon reflections).
   Nothing here is saved and nothing changes how the game plays. Crossing into high or low also posts to the Bay-Watch feed (G.dstate remembers which side). */
const DSTATE=d=>{const m=G&&G.meters&&G.meters[d]!=null?G.meters[d]:50;return m>=68?2:m<=32?0:1};
const DTIP={
  Greenbelt:{high:'The Greenbelt stalls are overflowing. Nobody can remember the harvest being this loud.',low:'The Greenbelt fields are thin this year. Even the hens look worried.'},
  Highline:{high:'Highline is buzzing. Three new awnings and one new rumor.',low:'Highline shutters are going up. A banker was seen carrying his own box.'},
  Grid:{high:'The Grid is calm. Someone has swept. Nobody knows who.',low:'Litter on the Grid is winning. The bins have started holding meetings.'},
  Dockside:{high:'Dockside is heaving with cargo. The cranes have not stopped.',low:'The Dockside piers are quiet. The gulls are unionising.'},
  'Neon Mile':{high:'The Neon Mile is loud tonight. The lights are brighter than the reasons.',low:'The Neon Mile has gone quiet. That is somehow worse.'},
  'Foundry Row':{high:'The Foundry Row chimneys are working overtime. Nobody can see the sky.',low:'Foundry Row is cold. The chimneys have forgotten how.'}
};
/* post once when a district tips into high or low, with some give so a meter wobbling around the line does not repeat itself */
function districtTipCheck(){
  G.dstate=G.dstate||{};
  for(const d in METERS){
    const m=G.meters[d],was=G.dstate[d]||'mid';
    let now=was;
    if(was==='high'&&m<62)now='mid';else if(was==='low'&&m>38)now='mid';
    if(now==='mid'){if(m>=70)now='high';else if(m<=30)now='low'}
    if(now!==was){
      G.dstate[d]=now;
      if(now!=='mid'&&G.flags&&G.flags.onboarded&&G.dstate['_primed'])feedAdd({kind:'event',dist:d,t:DTIP[d][now]});
    }
  }
  G.dstate['_primed']=1; /* the first check just records where everything starts, so a new or old save does not announce a whole city at once */
}
/* ----- windows: lit by day when busy, boarded up when empty and run down ----- */
const districtDayLit=(b,hs)=>!b.poi&&DSTATE(district(b.x+1,b.y+1))===2&&(hs&1)===1;
function districtBoards(b,biz,sx,sy,hs){
  if(b.poi||biz)return;
  const d=district(b.x+1,b.y+1),m=G.meters[d];
  if(!(m<=32&&(hs%3===0||m<=15)))return;
  bF('#5a4630',sx+33,sy+47,28,2);bF('#6b5439',sx+33,sy+52,28,2);bF('#4a3825',sx+36,sy+45,2,13);bF('#4a3825',sx+50,sy+45,2,13);
  bF('rgba(0,0,0,.25)',sx+33,sy+49,28,1);
}
/* ----- ground details on the streets ----- */
function districtTileFx(tx,ty,now){
  if(!G)return;
  const t=map[ty][tx];if(t!==T.ROAD&&t!==T.PLAZA&&t!==T.DOCK)return;
  const d=district(tx,ty),st=DSTATE(d);if(st===1)return;
  const h=hash(tx*7+3,ty*5+1),sx=tx*TS-camX,sy=ty*TS-camY,ox=(h>>3)%11,oy=(h>>7)%11,hi=st===2,r=(h>>12)%100;
  const px=(c,x,y,w,hh)=>{cx.fillStyle=c;cx.fillRect(sx+x,sy+y,w,hh)};
  if(d==='Grid'){if(!hi&&r<22){px('#b9b2a0',ox,oy,2,1);px('#8a8576',ox+3,oy+2,1,1);if(r<9)px('#c8553d',ox+6,oy+1,2,1)}}
  else if(d==='Greenbelt'){if(hi&&r<8){px('#8a6a3a',ox,oy,5,3);px('#a98a50',ox,oy,5,1);px('#e0b83a',ox+1,oy-1,1,1)}else if(!hi&&r<14){px('#6a7a3a',ox,oy,1,2);px('#6a7a3a',ox+2,oy+1,1,2)}}
  else if(d==='Highline'){if(!hi&&r<14){px('#e8e4d6',ox,oy,2,3);px('rgba(0,0,0,.2)',ox,oy+3,2,1)}else if(hi&&r<8){px('#6a4a30',ox,oy,3,2);px('#4f9a4a',ox,oy-1,3,1)}}
  else if(d==='Dockside'){if(hi&&r<12){px('#7a5a38',ox,oy,5,4);px('#9a7a50',ox,oy,5,1);px('#5a4028',ox+2,oy,1,4)}else if(!hi&&r<9){const f=Math.floor(now/600+h)%2;px('#eef0f0',ox,oy,3,1);px('#eef0f0',ox+(f?1:0),oy-1,1,1);px('#e0a040',ox+3,oy,1,1)}}
  else if(d==='Neon Mile'){if(hi&&r<18){px(r%2?'rgba(255,80,200,.35)':'rgba(80,220,255,.35)',ox,oy,5,2)}else if(!hi&&r<14){px('#b9b2a0',ox,oy,2,1);px('#8a8576',ox+3,oy+2,1,1)}}
  else if(d==='Foundry Row'){if(hi&&r<20){px('rgba(0,0,0,.22)',ox,oy,6,3)}else if(!hi&&r<10){px('rgba(180,200,220,.25)',ox,oy,3,1)}}
}
/* ----- people who are just out and about: not the named people, not tappable, not saved ----- */
let AMB={seed:null,slots:{}};
function ambBuild(){
  AMB={seed:G.seed,slots:{}};
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(map[y][x]!==T.ROAD)continue;
    const horiz=map[y][x-2]===T.ROAD&&map[y][x+2]===T.ROAD&&map[y][x-1]===T.ROAD&&map[y][x+1]===T.ROAD;
    const vert=map[y-2]&&map[y+2]&&map[y-2][x]===T.ROAD&&map[y+2][x]===T.ROAD&&map[y-1][x]===T.ROAD&&map[y+1][x]===T.ROAD;
    if(!horiz&&!vert)continue;
    const d=district(x,y);(AMB.slots[d]=AMB.slots[d]||[]).push({x,y,axis:horiz?0:1,h:hash(x*3+1,y*5+2)});
  }
  for(const d in AMB.slots)AMB.slots[d].sort((a,b)=>a.h-b.h).splice(6);
}
/* how many extra people a district has out: none when its meter is low or in the small hours, up to four when it is booming */
function ambientCount(d){
  const m=G.meters[d];if(m==null)return 0;
  const n=Math.max(0,Math.min(4,Math.round((m-35)/14))),late=night()>.3;
  return d==='Neon Mile'?(late?n:Math.max(0,n-1)):late?0:n;
}
const AMB_COLS=['#c46b5a','#5a8fc4','#b08ad0','#d0a84a','#4aa8a0','#8aa65a'];
function ambientEnts(now){
  if(!G)return [];
  if(AMB.seed!==G.seed)ambBuild();
  const out=[];
  for(const d in AMB.slots){
    const n=ambientCount(d);
    for(let i=0;i<n&&i<AMB.slots[d].length;i++){
      const s=AMB.slots[d][i],per=5200+(s.h%2600),t=((now/per)+(s.h%997)/997)%2,tri=t<1?t:2-t,off=(tri-.5)*4;
      const x=s.axis?s.x:s.x+off,y=s.axis?s.y+off:s.y;
      if(Math.hypot(x-G.p.x,y-G.p.y)<.9)continue;
      out.push({y,f:()=>person(x,y,AMB_COLS[s.h%AMB_COLS.length],false,true,now,false)});
    }
  }
  return out;
}
