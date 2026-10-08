"use strict";
/* Hourly world update: stock, heat, rumors, NPC wages. */
function hourly(h){
  hintsCheck();lawHourly();satHourly();clHourly();
  const hr=h%24,t=h*60,high=tideV(t)>.45,low=tideV(t)<-.45;
  G.fishStock=clamp(G.fishStock+(high?2.5:1.2),0,100);
  G.flats=clamp(G.flats+(high?2.2:.5),0,100);
  G.demand=Math.max(0,G.demand-.6);
  const R=NPC.reyes,rn=Math.hypot(R.x-G.p.x,R.y-G.p.y)<9&&!R.indoors;
  const atHome=Math.hypot(homePoi().ex-G.p.x,homePoi().ey-G.p.y)<2.5;
  G.heat=Math.max(0,G.heat-(atHome?.7:rn?0:.2)*(G.mod.cops?.4:1)*flackHeatMul());
  const out=NPCS.filter(n=>!n.indoors);
  for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
    const a=out[i],b=out[j];if(Math.hypot(a.x-b.x,a.y-b.y)>3.5)continue;
    G.rumors.forEach(r=>{const ka=r.knows.includes(a.id),kb=r.knows.includes(b.id);if(ka!==kb&&Math.random()<.45)r.knows.push(ka?b.id:a.id)});
  }
  G.rumors.forEach(rumorPost);
  const strike=G.ev&&G.ev.id==='strike';
  NPCS.forEach(n=>{
    const s=npcS(n);
    if(hr>=22||hr<7)s.hunger=Math.min(100,s.hunger+2);else s.hunger=Math.max(0,s.hunger-4.5);
    if(hr===17&&n.act!=='home'&&!(strike&&n.d==='Dockside'&&n.id!=='duarte'))s.cash+=n.wage;
    if(hr===22)s.cash=Math.max(0,s.cash-Math.round(n.wage*.7+s.cash*.02));
    if(n.indoors)return;
    if(n.d==='Dockside'&&n.act==='hang'&&high&&G.fishStock>5){G.fishStock-=4;s.cash+=4}
    if(n.id==='pip'&&low&&G.flats>8){G.flats-=4;s.cash+=5}
    if(s.hunger<45)npcEat(n,s);
    if(n.wants==='trinkets'&&s.cash>60&&Math.random()<.05)npcBuyTrinket(n,s);
  });
  if(G.fishStock<25&&!G.flags.fishNews){G.flags.fishNews=1;alertNews('News: Fish are getting scarce. Prices are climbing.')}
  if(G.fishStock>45)G.flags.fishNews=0;
  if(G.flats<20&&!G.flags.flatNews){G.flags.flatNews=1;alertNews('News: The mudflats have been picked clean. Scrap is in demand.')}
  if(G.flats>45)G.flags.flatNews=0;
  if(G.demand>=8&&!G.flags.rushNews){G.flags.rushNews=1;alertNews('News: The diner is slammed. Meals cost more.')}
  if(G.demand<3)G.flags.rushNews=0;
  threadsHourly();
}
