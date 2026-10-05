"use strict";
/* Market, diner, dock, estate, workshop, bar, club, bank, clinic. */
MENUS.market=(poi,n,msg)=>{
  const f=buyF(n),seed=Math.round(4*f);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the counter.</p>${msgP(msg)}`,[
    {label:'Sell goods',fn:()=>sellScreen(sellF(n),poi.name,()=>MENUS.market(poi,n))},
    {label:'Buy a seed packet',sub:`${money(seed)} each. Plant it in a plot or Greenhouse.`,cls:'',off:G.cash<seed,fn:()=>{G.cash-=seed;G.inv.seeds++;advance(5);MENUS.market(poi,n,'You bought a seed.')}},
    {label:'Pocket something and run',sub:'Free, but the whole Grid may hear about it',cls:'quiet',fn:()=>{
      let c=.4;if(G.quirk==='light-fingered')c-=.1;if(has('smooth'))c-=.12;if(has('creative'))c-=.08;if(has('known-thief'))c+=.15;
      advance(10);
      if(Math.random()<c){addRumor('thief',['mina','reyes']);news('Theft reported at the Market Hall.',2);npcS(NPC.mina).m-=20;G.rep.Grid=clamp(G.rep.Grid-10,-100,100);G.heat=Math.min(5,G.heat+2);MENUS.market(poi,n,'Caught! Mina shouts for the constable. Run.')}
      else{G.inv.crops+=2;MENUS.market(poi,n,'You slip two crops into your coat and walk off.')}}},
    leaveBtn]);
};
MENUS.diner=(poi,n,msg)=>{
  const price=Math.round(mealPrice()*buyF(n));
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} is behind the grill.</p>${msgP(msg)}`,[
    {label:'Order a meal',sub:`${money(price)}. Restores 45 fullness.`,off:G.cash<price,fn:()=>{G.cash-=price;G.hunger=clamp(G.hunger+45,0,100);G.demand+=1;advance(30);MENUS.diner(poi,n,'You eat a hot meal.')}},
    {label:'Work a kitchen shift',sub:`4 hours, about ${money(22*payF(n))}`,cls:'',fn:()=>MENUS.diner(poi,n,gig(n,{hrs:4,base:22,rep:'Grid',label:'the grill'}))},
    leaveBtn]);
};
MENUS.dock=(poi,n,msg)=>{
  const strike=G.ev&&G.ev.id==='strike';
  const mult=(has('strong')?1.4:1)*(has('union')?1.2:1)*(G.fx.crane?1.25:1);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the hiring line.</p>${strike?'<p class="bad">The dock strike has shut the piers.</p>':''}${msgP(msg)}`,[
    {label:'Haul cargo',sub:`4 hours, about ${money(26*mult*payF(n))}`,off:strike,fn:()=>MENUS.dock(poi,n,gig(n,{hrs:4,base:26,mult,rep:'Dockside',label:'hauling cargo'}))},
    leaveBtn]);
};
MENUS.estate=(poi,n,msg)=>{
  if(has('known-thief'))return ui(`<h2>${esc(poi.name)}</h2><p>The steward turns you away. Word of the theft reached the terraces.</p>`,[leaveBtn]);
  const gala=G.ev&&G.ev.id==='gala';
  const mult=(has('rural')?1.3:1)*(has('disgraced')?.7:1)*(gala?1.5:1)*(G.fx.commons?1.2:1);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Lady Ashgrove's gardens need constant tending.</p>${msgP(msg)}`,[
    {label:'Tend the gardens',sub:`4 hours, about ${money(34*mult*payF(n))}`,fn:()=>MENUS.estate(poi,n,gig(n,{hrs:4,base:34,mult,rep:'Highline',label:'in the gardens'}))},
    leaveBtn]);
};
function craftTrinket(){G.inv.scrap-=3;G.inv.trinkets++;advance(120);G.energy=clamp(G.energy-6,0,100)}
MENUS.workshop=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Benches, tools, and the smell of solder.</p>${msgP(msg)}`,[
    {label:'Craft a trinket',sub:`Uses 3 scrap, 2 hours. You have ${G.inv.scrap}.`,off:G.inv.scrap<3,fn:()=>{craftTrinket();MENUS.workshop(poi,n,'You made a trinket.')}},
    {label:'Repair shift',sub:'3 hours, about $18',cls:'',fn:()=>MENUS.workshop(poi,n,gig(null,{hrs:3,base:18,mult:has('creative')?1.2:1,rep:'Grid',label:'repairs'}))},
    leaveBtn]);
};
MENUS.gull=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} polishes a glass.</p>${msgP(msg)}`,[
    {label:'Listen for rumors',sub:'1 hour, free',fn:()=>{advance(60);MENUS.gull(poi,n,pick(worldLines()))}},
    {label:'Buy a round for the bar',sub:'$15. Dockside will remember.',cls:'',off:G.cash<15,fn:()=>{G.cash-=15;G.rep.Dockside=clamp(G.rep.Dockside+4,-100,100);npcS(n).m+=5;advance(60);MENUS.gull(poi,n,'Glasses are raised. Dockside thinks better of you.')}},
    leaveBtn]);
};
MENUS.club=(poi,n,msg)=>{
  const ok=(G.rep.Highline>=-10||has('educated')||has('smooth'))&&!has('known-thief');
  if(!ok)return ui(`<h2>${esc(poi.name)}</h2><p>The doorman looks you over and shakes his head. "Members and guests only."</p><p class="muted">Your standing on the Highline is too low.</p>`,[leaveBtn]);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Candlelight and low talk above the tide.</p>${msgP(msg)}`,[
    {label:'Mingle with the guests',sub:'$30, 2 hours. Raises Highline standing.',off:G.cash<30,fn:()=>{G.cash-=30;G.rep.Highline=clamp(G.rep.Highline+(has('smooth')?8:5),-100,100);advance(120);MENUS.club(poi,n,'You work the room and a few doors open.')}},
    leaveBtn]);
};
MENUS.bank=(poi,n,msg)=>{
  const t=tier(att(n)),can=t>=2&&G.debt===0&&!has('known-thief'),biz=G.biz.some(b=>b.type);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} watches from behind glass.</p>${msgP(msg)}${G.debt>0?`<p class="bad">You owe ${money(G.debt)}.</p>`:''}`,[
    {label:'Borrow $150',sub:can?'Repay $180 within 10 days or word gets out.':G.debt>0?'Repay what you owe first':'Your standing is too low for a loan',off:!can,fn:()=>ask('Take the loan?','You will owe $180 within 10 days. Missing the deadline damages your name.','Take it',()=>{G.cash+=150;G.debt=180;G.loanDay=day();G.loanTerm=10;G.flags.defRum=0;advance(20);quip('loan');MENUS.bank(poi,n,'The loan is approved. Do not forget it.')},()=>MENUS.bank(poi,n))},
    {label:'Business loan, $800',sub:can&&biz?'Repay $960 within 20 days. Needs a business.':!biz?'Open a business first':'Your standing is too low',off:!(can&&biz),cls:'',fn:()=>ask('Take the business loan?','You will owe $960 within 20 days. Missing the deadline damages your name.','Take it',()=>{G.cash+=800;G.debt=960;G.loanDay=day();G.loanTerm=20;G.flags.defRum=0;advance(30);quip('loan');MENUS.bank(poi,n,'The business loan is approved.')},()=>MENUS.bank(poi,n))},
    {label:'Repay debt',sub:G.debt>0?`Pay up to ${money(Math.min(G.cash,G.debt))}`:'You owe nothing',off:G.debt<=0||G.cash<1,cls:'',fn:()=>{const p=Math.min(G.cash,G.debt);G.cash-=p;G.debt-=p;if(G.debt<=0)G.flags.defRum=0;advance(10);MENUS.bank(poi,n,G.debt>0?`You paid ${money(p)}.`:'Debt cleared.')}},
    leaveBtn]);
};
MENUS.clinic=(poi,n,msg)=>{
  const free=tier(att(n))>=2&&(has('broke')||G.cash<20);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Clean sheets and a ticking clock.</p>${msgP(msg)}`,[
    {label:'Get treated',sub:free?'Dr. Bell waves the fee':'$10. Restores energy.',off:!free&&G.cash<10,fn:()=>{if(!free)G.cash-=10;G.energy=clamp(G.energy+35,0,100);advance(60,true);MENUS.clinic(poi,n,'You feel better.')}},
    leaveBtn]);
};
