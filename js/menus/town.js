"use strict";
/* Market, diner, dock, estate, workshop, bar, club, bank, clinic. */
MENUS.market=(poi,n,msg)=>{
  const f=buyF(n);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the counter.</p>${msgP(msg)}`,[
    {label:'Sell goods',fn:()=>sellScreen(sellF(n),poi.name,()=>MENUS.market(poi,n))},
    {label:'General goods',sub:'Drinks, snacks, everyday items, gifts and tools',cls:'',fn:()=>generalStore(poi,n,()=>MENUS.market(poi,n))},
    {label:'Seeds',sub:`Four kinds, from ${money(Math.round(CROPS.radish.seedPrice*f*shopMul('market',.75)))}. Slower crops pay more.`,cls:'',fn:()=>seedShop(poi,n,f)},
    {label:'Pocket something and run',sub:'Free, but the whole Grid may hear about it',cls:'quiet',fn:()=>{
      let c=.4;if(G.quirk==='light-fingered')c-=.1;if(has('smooth'))c-=.12;if(has('creative'))c-=.08;if(has('known-thief'))c+=.15;
      advance(10);
      if(Math.random()<c){addRumor('thief',['mina','reyes']);news('Theft reported at the Market Hall.',2);npcS(NPC.mina).m-=20;G.rep.Grid=clamp(G.rep.Grid-10,-100,100);G.heat=Math.min(5,G.heat+2);MENUS.market(poi,n,'Caught! Mina shouts for the constable. Run.')}
      else{G.inv.crops+=2;MENUS.market(poi,n,'You slip two crops into your coat and walk off.')}}},
    ...shopBtn(poi,n),leaveBtn]);
  sceneCtx({who:n});
};
MENUS.diner=(poi,n,msg)=>{
  const price=Math.round(mealPrice()*buyF(n)*shopMul('diner',.7));
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} is behind the grill.${fact('diner_trust')?' A Trust logo is stencilled on the menu, and he does not look at it.':fact('diner_saved')?' He has a plate waiting with your name on it.':''}</p>${jobLine('diner')}${msgP(msg)}`,[
    {label:'Order a meal',sub:`${money(price)}. Restores 45 fullness.`,off:G.cash<price,fn:()=>{G.cash-=price;G.hunger=clamp(G.hunger+45,0,100);G.demand+=1;advance(30);MENUS.diner(poi,n,'You eat a hot meal.')}},
    {label:'Takeaway meals',sub:`${money(price)} each. Choose how many for your bag.`,off:G.cash<price,cls:'',fn:()=>qtyMenu({title:'Takeaway meals',intro:'Packed in paper. Eat them later.',price,max:30,mode:'buy',onConfirm:q=>{G.cash-=Math.round(price*q);G.inv.meals+=q;G.demand+=q*.5;advance(10);return `You take ${q} meal${q>1?'s':''} away.`},back:m=>MENUS.diner(poi,n,m)})},
    ...(POIS.fastfood?[]:[{label:'The fast counter',sub:'Fries, burgers and a combo. Cheap and quick.',cls:'',fn:()=>fastFoodMenu(poi,n,()=>MENUS.diner(poi,n))}]),
    {label:'Work a kitchen shift',sub:`4 hours, about ${money(22*payF(n)*jobPayMul('diner'))}`,need:28,cls:'',fn:()=>gigPlay('diner',n,{hrs:4,base:22,rep:'Grid',label:'the grill',job:'diner'},m=>MENUS.diner(poi,n,m))},
    ...jobExtra('diner','Close the kitchen',`6 hours, about ${money(38*payF(n)*jobPayMul('diner'))}.`,{hrs:6,base:38,rep:'Grid',label:'the grill, closing up'},m=>MENUS.diner(poi,n,m),n),
    ...shopBtn(poi,n),leaveBtn]);
};
MENUS.estate=(poi,n,msg)=>{
  if(has('known-thief'))return ui(`<h2>${esc(poi.name)}</h2><p>The steward turns you away. Word of the theft reached the terraces.</p>`,[leaveBtn]);
  const gala=G.ev&&G.ev.id==='gala';
  const mult=(has('rural')?1.3:1)*(has('disgraced')?.7:1)*(gala?1.5:1)*(G.fx.commons?1.2:1);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Lady Ashgrove's gardens need constant tending.</p>${jobLine('estate')}${msgP(msg)}`,[
    {label:'Tend the gardens',sub:`4 hours, about ${money(34*mult*payF(n)*jobPayMul('estate'))}`,need:28,fn:()=>gigPlay('estate',n,{hrs:4,base:34,mult,rep:'Highline',label:'in the gardens',job:'estate'},m=>MENUS.estate(poi,n,m))},
    ...jobExtra('estate','Prune the hedge maze',`6 hours, about ${money(56*mult*payF(n)*jobPayMul('estate'))}.`,{hrs:6,base:56,mult,rep:'Highline',label:'in the hedge maze'},m=>MENUS.estate(poi,n,m),n),
    leaveBtn]);
};
function craftTrinket(){G.inv.scrap-=3;G.inv.trinkets++;advance(120);G.energy=clamp(G.energy-6,0,100)}
/* the same, by the batch: asks how many and takes a little less time for each one after the first */
function craftTrinkets(back){
  bulkMake({title:'Craft trinkets',intro:'3 scrap make 1 trinket.',max:Math.floor(G.inv.scrap/3),base:120,confirm:'Craft these trinkets',allLabel:'As many as I can',
    sayFn:n=>`${n} trinket${n>1?'s':''} from ${3*n} scrap, about ${minText(bulkMin(120,n))}`,
    run:n=>{G.inv.scrap-=3*n;G.inv.trinkets+=n;advance(bulkMin(120,n));G.energy=clamp(G.energy-6*n,0,100);return `You made ${n} trinket${n>1?'s':''}.`},back});
}
MENUS.workshop=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Benches, tools, and the smell of solder.</p>${jobLine('workshop')}${msgP(msg)}`,[
    {label:'Craft trinkets',sub:`3 scrap and 2 hours each. You have ${G.inv.scrap}. Choose how many.`,off:G.inv.scrap<3,fn:()=>craftTrinkets(m=>MENUS.workshop(poi,n,m))},
    {label:'Repair shift',sub:`3 hours, about ${money(18*jobPayMul('workshop'))}`,need:21,cls:'',fn:()=>gigPlay('workshop',null,{hrs:3,base:18,mult:(has('creative')?1.2:1)*(G.fx.toolkit?1.2:1),rep:'Grid',label:'repairs',job:'workshop'},m=>MENUS.workshop(poi,n,m))},
    ...jobExtra('workshop','Rush order',`5 hours, about ${money(34*jobPayMul('workshop'))}.`,{hrs:5,base:34,mult:(has('creative')?1.2:1)*(G.fx.toolkit?1.2:1),rep:'Grid',label:'a rush order'},m=>MENUS.workshop(poi,n,m)),
    {label:'Crafting bench',sub:'Parts, jammers, and vehicle upgrades',cls:'',fn:()=>craftMenu(()=>MENUS.workshop(poi,n))},
    leaveBtn]);
};
MENUS.gull=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} polishes a glass.</p>${msgP(msg)}`,[
    {label:'Listen for rumors',sub:'1 hour, free',fn:()=>{advance(60);MENUS.gull(poi,n,pick(worldLines()))}},
    {label:'Buy a round for the bar',sub:shopOwned('gull')?'Free, it is your bar. Dockside will remember.':'$15. Dockside will remember.',cls:'',off:!shopOwned('gull')&&G.cash<15,fn:()=>{if(!shopOwned('gull'))G.cash-=15;G.rep.Dockside=clamp(G.rep.Dockside+(shopOwned('gull')?6:4),-100,100);npcS(n).m+=5;advance(60);MENUS.gull(poi,n,'Glasses are raised. Dockside thinks better of you.')}},
    {label:'Union table',sub:'Dues, leaflets, and who is short-weighing whom',cls:'',fn:()=>unionTable(poi,n)},
    ...shopBtn(poi,n),leaveBtn]);
};
MENUS.club=(poi,n,msg)=>{
  const ok=(G.rep.Highline>=-10||has('educated')||has('smooth'))&&!has('known-thief');
  if(!ok)return ui(`<h2>${esc(poi.name)}</h2><p>The doorman looks you over and shakes his head. "Members and guests only."</p><p class="muted">Your standing on the Highline is too low.</p>`,[leaveBtn]);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Candlelight and low talk above the tide.</p>${msgP(msg)}`,[
    {label:'Mingle with the guests',sub:G.fx.gilded?'Free for members, 2 hours. Raises Highline standing.':'$30, 2 hours. Raises Highline standing.',off:!G.fx.gilded&&G.cash<30,fn:()=>{if(!G.fx.gilded)G.cash-=30;G.rep.Highline=clamp(G.rep.Highline+(has('smooth')?8:5)+(G.fx.gilded?2:0),-100,100);advance(120);MENUS.club(poi,n,'You work the room and a few doors open.')}},
    {label:G.fx.gilded?'Member of the Gilded Tide':'Join the Gilded Tide',sub:G.fx.gilded?'Dues $50 a month. Highline shops do 8% better, free mingling, 10% off the Harbor levy.':'$1,500 to join, $50 a month. Highline shops do 8% better, free mingling, 10% off the Harbor levy.',off:!!G.fx.gilded||G.cash<1500||G.rep.Highline<10,cls:'',fn:()=>ask('Join the Gilded Tide?','$1,500 now and $50 a month in dues. Needs Highline standing of 10. Members get better trade for Highline shops, free mingling and 10% off the Harbor levy.','Yes, join',()=>{G.cash-=1500;G.fx.gilded=true;histAdd('gilded','Joined the Gilded Tide. Candlelight, a name on a brass plate, and a standing order for dues.');MENUS.club(poi,n,'Welcome to the Gilded Tide. The doorman almost smiles.')},()=>MENUS.club(poi,n))},
    leaveBtn]);
  sceneCtx({where:'club'});
};
MENUS.bank=(poi,n,msg)=>{
  const t=tier(att(n)),barred=lawTier()>=2,can=t>=2&&G.debt===0&&!has('known-thief')&&!barred,biz=G.biz.some(b=>b.type);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} watches from behind glass.</p>${msgP(msg)}${G.debt>0?`<p class="bad">You owe ${money(G.debt)}.</p>`:''}${barred?'<p class="bad">The bank has you flagged. No loans or trading until you clear your name at City Hall.</p>':''}`,[
    {label:'Borrow $150',sub:can?'Repay $180 within 10 days or word gets out.':G.debt>0?'Repay what you owe first':'Your standing is too low for a loan',off:!can,fn:()=>ask('Take the loan?','You will owe $180 within 10 days. Missing the deadline damages your name.','Take it',()=>{G.cash+=150;G.debt=180;G.loanDay=day();G.loanTerm=10;G.flags.defRum=0;advance(20);quip('loan');MENUS.bank(poi,n,'The loan is approved. Do not forget it.')},()=>MENUS.bank(poi,n))},
    {label:'Business loan, $800',sub:can&&biz?'Repay $960 within 20 days. Needs a business.':!biz?'Open a business first':'Your standing is too low',off:!(can&&biz),cls:'',fn:()=>ask('Take the business loan?','You will owe $960 within 20 days. Missing the deadline damages your name.','Take it',()=>{G.cash+=800;G.debt=960;G.loanDay=day();G.loanTerm=20;G.flags.defRum=0;advance(30);quip('loan');MENUS.bank(poi,n,'The business loan is approved.')},()=>MENUS.bank(poi,n))},
    {label:'Repay debt',sub:G.debt>0?`Pay up to ${money(Math.min(G.cash,G.debt))}`:'You owe nothing',off:G.debt<=0||G.cash<1,cls:'',fn:()=>{const p=Math.min(G.cash,G.debt);G.cash-=p;G.debt-=p;if(G.debt<=0)G.flags.defRum=0;advance(10);MENUS.bank(poi,n,G.debt>0?`You paid ${money(p)}.`:'Debt cleared.')}},
    {label:'Investment loan, $1000',sub:G.mkt&&G.mkt.noCreditUntil>day()?'The bank is not lending this month':can?'Repay $1250 within 25 days. For the trading desk.':'Pay off debt and build standing first',off:!can||(G.mkt&&G.mkt.noCreditUntil>day()),cls:'',fn:()=>ask('Take the investment loan?','You will owe $1250 within 25 days. If the market turns, that is a lot of money to owe.','Take it',()=>{G.cash+=1000;G.debt=1250;G.loanDay=day();G.loanTerm=25;G.flags.defRum=0;advance(30);MENUS.bank(poi,n,'The loan is approved. Cordelia wishes you luck.')},()=>MENUS.bank(poi,n))},
    {label:'Trading desk',sub:barred?'Barred. Clear your name at City Hall.':`Portfolio ${money(portfolio())}`,off:barred,cls:'',fn:()=>tradingMenu(poi,n)},
    {label:'FLACK contract',sub:fact('flack_contract_player')?'You are an installer':'Subcontract work for the Trust',cls:'',fn:()=>flackContractMenu(poi,n)},
    leaveBtn]);
};
MENUS.clinic=(poi,n,msg)=>{
  const mine=shopOwned('clinic'),free=mine||(tier(att(n))>=2&&(has('broke')||G.cash<20));
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Clean sheets and a ticking clock.</p>${msgP(msg)}`,[
    {label:'Get treated',sub:mine?'Free, and you get the good bed':free?'Dr. Bell waves the fee':'$10. Restores energy.',off:!free&&G.cash<10,fn:()=>{if(!free)G.cash-=10;G.energy=clamp(G.energy+(mine?55:35),0,100);advance(60,true);MENUS.clinic(poi,n,'You feel better.')}},
    ...shopBtn(poi,n),leaveBtn]);
};
