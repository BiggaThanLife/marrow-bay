"use strict";
/* Talking to NPCs and pickpocketing. */
/* ================= TALK ================= */
function worldLines(){
  const r=[];
  if(G.ev)r.push(`${G.ev.name}: ${G.ev.desc}`);
  if(G.fishStock<30)r.push('Fish are scarce. Too many lines in the water.');
  if(G.fishStock>70)r.push('The fish are running thick.');
  if(G.flats<30)r.push('The flats are picked clean. Scrap is hard to find.');
  if(G.demand>=6)r.push('The diner is slammed. Meals cost more.');
  const open=G.projects.filter(p=>!p.done);
  if(open.length){const p=pick(open),d=PROJECTS.find(x=>x.id===p.id);r.push(`${d.name} is ${projPct(p)}% funded.`)}
  if(G.arc&&ARCS[G.arc.id].phases[G.arc.i].name!=='Rumbles')r.push(`${ARCS[G.arc.id].title}: ${ARCS[G.arc.id].status(G.arc)}`);
  r.push(pick(TIPS));
  return r;
}
function pickpocket(n){
  let c=.42+(G.quirk==='light-fingered'?.1:0)+(has('creative')?.08:0)+(has('outsider')?.06:0)+(G.fx.kit?.12:0)-G.heat*.05-(n.id==='reyes'?.3:0)+G.mod.heist*.5;
  advance(5);
  if(Math.random()<c){
    quip('steal');const amt=ri(8,40);G.cash+=amt;let m=`You lift ${money(amt)} without a sound.`;
    if(Math.random()<.25){G.inv.loot++;m+=' And a watch worth fencing.'}
    if(flackSeen(.6))m+=' A FLACK camera logged it.';
    talk(n,m);
  }else{
    npcS(n).m-=25;addRumor('thief',[n.id]);G.heat=Math.min(5,G.heat+(n.id==='reyes'?3:1.5));flackSeen(1);
    notify('You were seen. Police will be looking for you.');talk(n,`${n.name} grabs your wrist. "Hey!"`);
  }
}
function talk(n,extra){
  if(!G.met[n.id])G.met[n.id]=day();
  const a=att(n),tr=tier(a),tg=tagsNow(),s=npcS(n);
  let best=null,bv=-1;
  tg.forEach(t=>{if(n.react[t]&&Math.abs(n.aff[t]||0)>=bv){bv=Math.abs(n.aff[t]||0);best=t}});
  const why=tg.filter(t=>n.aff[t]);
  const heard=G.rumors.filter(r=>r.knows.includes(n.id)).map(r=>RUM[r.type].t);
  const needsL=[];if(s.hunger<40)needsL.push('hungry');if(s.cash<15)needsL.push('short on cash');
  const cls=tr>=3?'good':tr===0?'bad':tr===1?'amber':'';
  const shop=Object.keys(OWNER).find(k=>OWNER[k]===n.id);
  const btns=[
    {label:'Chat',sub:s.chat===day()?'You already chatted today':'Small talk builds trust',off:s.chat===day()||tr===0,
     fn:()=>{s.chat=day();s.m+=3;advance(G.quirk==='neighborly'?25:10);talk(n,n.topic)}},
    {label:'Ask about town',sub:tr>=2?'Rumors and tips':'They will not talk about that yet',off:tr<2,fn:()=>{advance(5);talk(n,`"${pick(worldLines())}"`)}},
    {label:'Give a meal',sub:G.inv.meals>0?`You have ${G.inv.meals}`:'You have none',off:G.inv.meals<1,cls:'',fn:()=>{
      const nb=G.quirk==='neighborly';G.inv.meals--;s.m+=nb?15:12;s.hunger=Math.min(100,s.hunger+45);G.rep[n.d]=clamp(G.rep[n.d]+(nb?3:2),-100,100);G.gifts++;
      if(G.gifts===3||G.gifts%5===0)addRumor('generous',[n.id]);
      talk(n,`${n.name} accepts the meal, surprised.`)}}
  ];
  if(shop)btns.push({label:`Visit ${POIS[shop].name}`,cls:'',fn:()=>goPOI(POIS[shop])});
  if(tr>=3&&!G.companion)btns.push({label:`Ask ${n.name.split(' ')[0]} to come along`,sub:COMP_PERKS[n.id],cls:'',fn:()=>{recruit(n);closeMenu();notify(`${n.name} falls in beside you.`)}});
  btns.push({label:'Pickpocket',sub:'Risky. Raises your wanted level if caught.',cls:'quiet',fn:()=>pickpocket(n)});
  btns.push(leaveBtn);
  ui(`<h2>${esc(n.name)}</h2><p class="muted">${esc(n.role)}, ${n.d}. Attitude: <span class="${cls}">${LAB[tr]}</span>${needsL.length?`. Seems ${needsL.join(' and ')}.`:'.'}</p>
  <p>${esc(n.tier[tr])}</p>${best?`<p>${esc(n.react[best])}</p>`:''}${heard.length?`<p class="amber">${esc(n.name.split(' ')[0])} has heard: ${esc(heard[0])}</p>`:''}${extra?`<p class="amber">${esc(extra)}</p>`:''}
  ${why.length?`<p class="muted small">Shaped by: ${why.map(esc).join(', ')}.</p>`:''}`,btns);sceneCtx({who:n});
}
