"use strict";
/* Needs, time advance, new day. */
/* ================= TIME, NEEDS, ECONOMY ================= */
function needs(m,sleep){
  const h=m/60,k=((G.ev&&G.ev.id==='heat')?1.3:1)*G.mod.drain,hr=hourOf(),q=G.quirk;
  let ek=1,hk=1;
  if(q==='night-owl')ek=isNight()?.7:(hr>=5&&hr<10?1.2:1);
  else if(q==='early-bird')ek=(hr>=6&&hr<18)?.85:1.3;
  else if(q==='iron-stomach')hk=.8;
  G.hunger-=h*(sleep?1.2:2.2)*k*hk;
  if(!sleep)G.energy-=h*2.5*k*ek;
  G.hunger=clamp(G.hunger,0,100);G.energy=clamp(G.energy,0,100);
}
function advance(m,sleep,quiet){
  const b=G.t;needs(m,sleep);G.t+=m;
  const d0=Math.floor(b/1440),d1=Math.floor(G.t/1440);
  for(let d=d0+1;d<=d1;d++)newDay(d);
  const h0=Math.floor(b/60),h1=Math.floor(G.t/60);
  for(let h=h0+1;h<=h1&&h<=h0+30;h++)hourly(h);
  if(m>=60)syncNPCs();else if(h1>h0)NPCS.forEach(n=>{if(!(n.id==='reyes'&&n.chasing))assign(n,false)});
  if(m>=60||h1>h0)walkersHourly(m>=60);
  if(!quiet)hud();
}
function newDay(d){
  G.ev=Math.random()<.5?null:pick(EVENTS);
  dayNews();
  if(d%30===0)chargeBills();
  G.plots.forEach(p=>{if(p.s===1){p.d--;if(p.d<=0)p.s=2}});
  G.structs.forEach(s=>{if(s.type==='planter'&&s.s===1){s.d--;if(s.d<=0)s.s=2}});
  lawDaily();
  G.biz.forEach(runBiz);shopsDaily();
  makePool();
  if(G.debt>0&&day()-G.loanDay>(G.loanTerm||10)&&!G.flags.defRum){G.flags.defRum=1;addRumor('defaulter',['cordelia'])}
  G.rumors.forEach(r=>r.str-=4);G.rumors=G.rumors.filter(r=>r.str>=12);
  cityDaily();threadsDaily();
  G.projects.forEach(p=>{
    if(p.done)return;const d=PROJECTS.find(x=>x.id===p.id);
    NPCS.filter(n=>n.d===d.d).forEach(n=>{
      const s=npcS(n);if(s.cash<40||Math.random()>.35)return;
      const k=Object.keys(d.need).find(k=>(p.have[k]||0)<d.need[k]);if(!k)return;
      const amt=k==='cash'?8:Math.max(1,Math.round(d.need[k]*.04));
      p.have[k]=Math.min(d.need[k],(p.have[k]||0)+amt);s.cash-=k==='cash'?8:5;
    });
    checkProject(p);
  });
  if(G.ev)notify(`News: ${G.ev.name}. ${G.ev.desc}`);
  save();
}
