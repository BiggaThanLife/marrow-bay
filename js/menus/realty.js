"use strict";
/* Realty, residences, buildings, businesses, staff. */
/* ----- Realty ----- */
MENUS.realty=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} has listings across the city.</p>${msgP(msg)}`,[
    {label:'Apartments',sub:'Rent or buy a place to live',fn:()=>resList()},
    {label:'Buildings for sale',sub:'Buy an empty building and start a business',cls:'',fn:()=>buildingList()},
    leaveBtn]);
};
function resList(){
  ui(`<h2>Apartments</h2><p class="muted">Renting costs monthly. Owning costs about 30% of the rent as upkeep.</p>`,
    [...RES.map(id=>({label:POIS[id].name+(G.home===id?' (home)':G.owned[id]?' (owned)':''),sub:`${POIS[id].d}. Rent ${money(RENT[id])}/mo, buy ${money(RENT[id]*28)}`,cls:'',fn:()=>resMenu(id)})),{label:'Back',cls:'quiet',fn:()=>MENUS.realty(POIS.realty,NPC.lou)}]);
}
function resMenu(id,msg){
  const own=!!G.owned[id],cur=G.home===id;
  const dep=RENT[id],price=Math.round(RENT[id]*28*buyF(NPC.lou));
  ui(`<h2>${esc(POIS[id].name)}</h2><p class="muted">${POIS[id].d}</p>${msgP(msg)}`,[
    own?{label:cur?'You live here':'Move in',sub:'No rent. Upkeep only.',off:cur,fn:()=>{G.home=id;resMenu(id,'You moved in.')}}
       :{label:'Rent it',sub:`${money(dep)} now, then every month`,off:cur||G.cash<dep,fn:()=>{G.cash-=dep;G.home=id;resMenu(id,'You rented the place and moved in.')}},
    {label:own?'Sell your unit':'Buy a unit',sub:own?`Get ${money(RENT[id]*28*.7)}`:`${money(price)}`,off:!own&&G.cash<price,cls:'',fn:()=>{
      if(own)return ask('Sell your unit?',`You get ${money(RENT[id]*28*.7)}.`+(G.home===id?' You live here, so you will move to the Bunkhouse.':''),'Yes, sell',()=>{G.cash+=Math.round(RENT[id]*28*.7);delete G.owned[id];if(G.home===id)G.home='bunk';resMenu(id,'Sold.')},()=>resMenu(id));
      ask('Buy this unit?',`It costs ${money(price)} and you move in right away.`,'Yes, buy',()=>{G.cash-=price;G.owned[id]=true;G.home=id;resMenu(id,'It is yours. You moved in.')},()=>resMenu(id))}},
    {label:'Back',cls:'quiet',fn:resList}]);
}
function buildingList(){
  const seen={};
  const v=blocks.filter(b=>!b.poi&&!bizOf(b.key)).map(b=>({b,d:district(b.x+1,b.y+1),p:PRICE[district(b.x+1,b.y+1)]})).sort((a,b)=>a.p-b.p)
    .filter(x=>(seen[x.d]=(seen[x.d]||0)+1)<=2);
  ui(`<h2>Buildings for sale</h2><p class="muted">Each lists with the district and price. You can also tap a FOR SALE sign on the map.</p>`,
    [...v.slice(0,10).map(x=>({label:`${x.d}, ${money(x.p)}`,sub:`Block at ${x.b.x},${x.b.y}`,cls:'',fn:()=>vacantMenu(x.b)})),{label:'Back',cls:'quiet',fn:()=>MENUS.realty(POIS.realty,NPC.lou)}]);
}
function vacantMenu(b,msg){
  const d=district(b.x+1,b.y+1),lou=NPC.lou;
  if(tier(att(lou))===0)return refuse(POIS.realty,lou);
  const price=Math.round(PRICE[d]*buyF(lou));
  ui(`<h2>Empty building, ${d}</h2><p class="muted">Foot traffic here: ${TR[d]>=30?'heavy':TR[d]>=20?'steady':'light'}. Convert it into a café, bar, workshop, rental, farm, or home after buying.</p>${msgP(msg)}`,[
    {label:`Buy for ${money(price)}`,sub:`Property tax about ${money(price*.01)} a month`,off:G.cash<price,fn:()=>{
      ask('Buy this building?',`It costs ${money(price)}. Property tax applies every month.`,'Yes, buy',()=>{G.cash-=price;G.biz.push({key:b.key,d,type:null,price,workers:[],supplies:0,till:0,level:1,mk:1,store:0,auto:true,last:null});advance(30);quip('buy');bizMenu(bizOf(b.key),'You own it now.')},()=>vacantMenu(b))}},
    {label:'Close',cls:'quiet',fn:closeMenu}]);
}
function propertyMenu(b){const biz=bizOf(b.key);if(biz)bizMenu(biz);else vacantMenu(b)}
function bizMenu(biz,msg){
  if(!biz.type){
    return ui(`<h2>Empty building, ${biz.d}</h2><p class="muted">Choose what to turn it into.</p>${msgP(msg)}`,[
      ...Object.entries(BT).filter(([k])=>k!=='farm'||biz.d==='Greenbelt').map(([k,t],i)=>({label:`${t.n}, fit-out ${money(t.fit)}`,sub:t.d,cls:i?'':'primary',off:G.cash<t.fit,fn:()=>ask(`Convert to a ${t.n.toLowerCase()}?`,`The fit-out costs ${money(t.fit)}.`,'Yes, convert',()=>{G.cash-=t.fit;biz.paid=(biz.paid||biz.price)+t.fit;biz.type=k;news(`A new ${t.n.toLowerCase()} opens in ${biz.d}.`,2);advance(120);bizMenu(biz,`Now a ${t.n.toLowerCase()}.`)},()=>bizMenu(biz))})),
      {label:'Sell it back',sub:`Get ${money(biz.price*.7)}`,cls:'quiet',fn:()=>sellBiz(biz)},{label:'Close',cls:'quiet',fn:closeMenu}]);
  }
  if(biz.type==='rental')ensureRental(biz);
  const t=BT[biz.type],btns=[];
  const L=biz.last;
  if(biz.type==='home'){
    const hp={id:'B:'+biz.key,name:'Your building'};
    return ui(`<h2>${t.n}</h2><p class="muted">${biz.d}. ${t.d}</p>${msgP(msg)}`,[
      G.home==='B:'+biz.key?{label:'Sleep, cook, rest',fn:()=>homeMenu(homePoi())}:{label:'Make this my home',fn:()=>{G.home='B:'+biz.key;bizMenu(biz,'You moved in.')}},
      {label:'Sell the building',sub:`Get ${money((biz.paid||biz.price)*.7)}`,cls:'quiet',fn:()=>sellBiz(biz)},leaveBtn]);
  }
  btns.push({label:'Collect till',sub:money(biz.till),off:biz.till<=0,fn:()=>{G.cash+=biz.till;biz.till=0;advance(5);bizMenu(biz,'Cash collected.')}});
  if(t.dep)btns.push({label:'Add supplies',sub:`In stock: ${biz.supplies}. Use your own goods to save money.`,cls:'',fn:()=>depositMenu(biz)});
  if(biz.type==='farm'){
    btns.push({label:`Auto-sell crops: ${biz.auto?'On':'Off'}`,sub:biz.auto?'Sells wholesale at $4 each':'Crops pile up for you to collect',cls:'',fn:()=>{biz.auto=!biz.auto;bizMenu(biz)}});
    btns.push({label:'Take stored crops',sub:`${biz.store} waiting`,off:biz.store<=0,cls:'',fn:()=>{G.inv.crops+=biz.store;biz.store=0;bizMenu(biz,'Crops added to your bag.')}});
  }
  if(biz.type==='rental')btns.push(...landlordButtons(biz));else btns.push({label:`Staff (${biz.workers.length}/${1+biz.level})`,sub:'Hire and fire',cls:'',fn:()=>staffMenu(biz)});
  if(t.price||biz.type==='rental')btns.push({label:`${biz.type==='rental'?'Rent':'Price'}: ${MKN[biz.mk]}`,sub:biz.type==='rental'?'Low fills flats faster and keeps tenants happy. High pays more.':'Low sells more, High sells less',cls:'',fn:()=>{biz.mk=(biz.mk+1)%3;bizMenu(biz)}});
  btns.push(...expansionButton(biz));
  if(biz.level<3)btns.push({label:`Upgrade to level ${biz.level+1}`,sub:`${money(700*biz.level)}. More demand and room for staff.`,off:G.cash<700*biz.level,cls:'',fn:()=>ask(`Upgrade to level ${biz.level+1}?`,`It costs ${money(700*biz.level)}.`,'Yes, upgrade',()=>{G.cash-=700*biz.level;biz.paid=(biz.paid||biz.price)+700*biz.level;biz.level++;bizMenu(biz,'Upgraded.')},()=>bizMenu(biz))});
  if(biz.level>1){const back=Math.round(350*(biz.level-1)),over=biz.workers.length>biz.level;btns.push({label:`Downsize to level ${biz.level-1}`,sub:over?`Let staff go first (room for ${biz.level} at level ${biz.level-1})`:`Refund ${money(back)}. Demand and staff room shrink.`,off:over,cls:'quiet',fn:()=>ask(`Downsize to level ${biz.level-1}?`,`You get ${money(back)} back and lose some demand and staff room.`,'Yes, downsize',()=>{G.cash+=back;biz.paid=Math.max(0,(biz.paid||biz.price)-700*(biz.level-1));biz.level--;advance(60);bizMenu(biz,`Downsized. ${money(back)} refunded.`)},()=>bizMenu(biz))});}
  btns.push({label:'Change business type',sub:'Refit this building without selling it. Pay the new fit-out.',cls:'quiet',fn:()=>convertMenu(biz)});
  btns.push({label:'Sell the building',sub:`Get ${money((biz.paid||biz.price)*.7)}`,cls:'quiet',fn:()=>sellBiz(biz)},leaveBtn);
  ui(`<h2>${t.n}, level ${biz.level}</h2><p class="muted">Known as <b>${esc(bizName(biz))}</b>. ${biz.d}. ${t.d}</p>${msgP(msg)}
  <div class="kv"><div><span>Till</span><b>${money(biz.till)}</b></div>${biz.type==='rental'?`<div><span>Tenants</span><b>${biz.tenants.length}/${rentalUnits(biz)}</b></div><div><span>Open problems</span><b>${biz.issues.length}</b></div>`:`<div><span>Supplies</span><b>${biz.supplies}</b></div><div><span>Staff</span><b>${biz.workers.length}</b></div>`}
  ${bizTraffic(biz)?`<div><span>Foot traffic</span><b>${bizTraffic(biz).dem} a day</b></div><div><span>Can serve</span><b>${bizTraffic(biz).cap} a day</b></div>`:''}
  ${L?`<div><span>Last day</span><b>${L.profit>=0?'+':''}${money(L.profit)}</b></div><div><span>Sold</span><b>${L.units}</b></div><div><span>Wages</span><b>${money(L.wages)}</b></div>`:''}</div>${lineChart(biz.hist,{title:'Profit per day, last 30 days',zero:true})}${L&&L.theft?`<p class="bad small">Staff skimmed ${money(L.theft)}.</p>`:''}${L&&L.note?`<p class="bad small">${esc(L.note)}</p>`:''}`,btns);
}
function sellBiz(biz){ask('Sell this building?',`You get about ${money((biz.paid||biz.price)*.7+biz.till)}. Staff and stock go with it.`,'Yes, sell',()=>doSellBiz(biz),()=>bizMenu(biz))}
function doSellBiz(biz){
  const get=Math.round((biz.paid||biz.price)*.7+biz.till);
  G.cash+=get;G.biz=G.biz.filter(b=>b!==biz);if(G.home==='B:'+biz.key)G.home='bunk';closeMenu();notify(`Sold for ${money(get)}.`);
}
function depositMenu(biz,msg){
  const t=BT[biz.type];
  const btns=Object.keys(t.dep).filter(k=>G.inv[k]>0).flatMap(k=>[{label:`Add some ${NAMES[k]}`,sub:`+${t.dep[k]} supply each. Choose how many.`,cls:'',fn:()=>qtyMenu({title:`Add ${NAMES[k]}`,intro:`Each gives ${t.dep[k]} supply.`,price:0,max:G.inv[k],mode:'sell',onConfirm:q=>{biz.supplies+=q*t.dep[k];G.inv[k]-=q;return `Added ${q} ${NAMES[k]}.`},back:m=>depositMenu(biz,m)})},{label:`Add all ${NAMES[k]} (${G.inv[k]})`,sub:`+${t.dep[k]} supply each`,fn:()=>{biz.supplies+=G.inv[k]*t.dep[k];G.inv[k]=0;depositMenu(biz,'Stocked.')}}]);
  ui(`<h2>Supplies</h2><p class="muted">In stock: ${biz.supplies}. Missing supplies are bought wholesale at ${money(t.cost)} each.</p>${msgP(msg)}${btns.length?'':'<p>You have nothing this business can use.</p>'}`,[...btns,{label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
function staffMenu(biz,msg){
  const full=biz.workers.length>=1+biz.level;
  ui(`<h2>Staff</h2><p class="muted">Each worker adds capacity. Wages are paid daily from the till, then from your cash.</p>${msgP(msg)}`,[
    ...biz.workers.map(w=>({label:`Fire ${w.name}`,sub:`Skill ${w.skill}, ${money(w.wage)}/day, ${TRAITN[w.trait]}`,cls:'quiet',fn:()=>ask(`Fire ${w.name}?`,'They will leave right away.','Yes, fire',()=>{biz.workers=biz.workers.filter(x=>x!==w);staffMenu(biz,`${w.name} is gone.`)},()=>staffMenu(biz))})),
    ...G.pool.map((w,i)=>({label:`Hire ${w.name}`,sub:`Skill ${w.skill}, ${money(w.wage)}/day, ${TRAITN[w.trait]}`,off:full,cls:i?'':'primary',fn:()=>{biz.workers.push(w);G.pool=G.pool.filter(x=>x!==w);quip('hire');staffMenu(biz,`${w.name} joins the team.`)}})),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}

function convertMenu(biz,msg){
  const cur=BT[biz.type];
  ui(`<h2>Change business type</h2><p class="muted">The ${cur.n.toLowerCase()} closes for a day. Staff and level stay. Supplies are lost. You pay the new fit-out.</p>${msgP(msg)}`,[
    ...Object.entries(BT).filter(([k])=>k!==biz.type&&k!=='home'&&(k!=='farm'||biz.d==='Greenbelt')).map(([k,t])=>({label:`${t.n}, fit-out ${money(t.fit)}`,sub:t.d,cls:'',off:G.cash<t.fit,fn:()=>ask(`Turn this into a ${t.n.toLowerCase()}?`,`The fit-out costs ${money(t.fit)}. Supplies are lost.`,'Yes, refit',()=>{G.cash-=t.fit;biz.paid=(biz.paid||biz.price)+t.fit;biz.type=k;biz.supplies=0;if(k==='farm'){biz.store=biz.store||0;biz.auto=!!biz.auto}advance(120);news(`A ${cur.n.toLowerCase()} in ${biz.d} becomes a ${t.n.toLowerCase()}.`,1);bizMenu(biz,`Now a ${t.n.toLowerCase()}.`)},()=>convertMenu(biz))})),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
