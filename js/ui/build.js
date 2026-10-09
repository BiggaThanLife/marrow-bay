"use strict";
/* Building small structures and the market stall. */
/* ================= BUILDING (small structures) ================= */
function buildCost(type,d){return Math.round(STRUCTS[type].cost*DM[d])}
function buildMenu(){
  ui(`<h2>Build</h2><p class="muted">Pick a structure, then tap a highlighted tile. Costs scale by district. For whole buildings, visit Lou's Realty.</p>`,
    [...Object.entries(STRUCTS).map(([k,v],i)=>({label:`${v.n}, from ${money(v.cost*.8)}`,sub:v.desc,cls:i?'':'primary',fn:()=>{placing=k;worldPanel();notify(`Tap a highlighted tile to place the ${v.n}. Tap Build again to cancel.`,true)}})),
     {label:'Close',cls:'quiet',fn:closeMenu}]);
}
function canBuild(tx,ty){
  if(!G||tx<0||ty<0||tx>=W||ty>=H)return false;
  const t=map[ty][tx];
  if(t!==T.GRASS&&t!==T.LOT&&t!==T.PARK)return false;
  if(structAt(tx,ty))return false;
  if(Object.values(POIS).some(p=>p.ex===tx&&p.ey===ty))return false;
  if(blocks.some(b=>!b.poi&&b.x+1===tx&&b.y+4===ty))return false;
  return Math.hypot(tx-G.p.x,ty-G.p.y)<=9;
}
/* Move: pick a structure up and set it down on another open tile. Free, a little time and energy. Stock, crops, takings and a house's home status stay with it. */
let movingId=null;
function startMove(st){placing='move';movingId=st.id;worldPanel();notify(`Tap a highlighted tile to set the ${STRUCTS[st.type].n.toLowerCase()} down there. Tap Build again to cancel.`,true)}
function tryPlace(tx,ty){
  if(!canBuild(tx,ty))return notify('You cannot build there. Try an open highlighted tile nearby.');
  if(placing==='move'){
    const st=G.structs.find(s=>s.id===movingId);placing=null;movingId=null;
    if(!st)return notify('');
    const from=district(st.x,st.y),to=district(tx,ty);
    st.x=tx;st.y=ty;advance(30);G.energy=clamp(G.energy-3,0,100);
    notify(`${STRUCTS[st.type].n} moved${from!==to?` to ${to}`:''}.`);hud();save();return;
  }
  const d=district(tx,ty),cost=buildCost(placing,d);
  if(G.cash<cost)return notify(`You need ${money(cost)} to build that in ${d}.`);
  G.cash-=cost;
  const st={id:Date.now()+Math.random(),type:placing,x:tx,y:ty,paid:cost};
  if(placing==='stall'){st.stock={meals:0,smoked:0,fish:0,crops:0,trinkets:0};st.mk=1;st.stored=0;st.earned=0}
  if(placing==='planter'){st.s=0;st.d=0}
  G.structs.push(st);
  const nm=STRUCTS[placing].n;placing=null;advance(60);G.energy=clamp(G.energy-5,0,100);
  notify(`${nm} built in ${d} for ${money(cost)}.`);hud();save();
}
function stockMenu(st,k){
  const have=G.inv[k];
  if(have<=0)return structMenu(st);
  const put=n=>{n=Math.max(0,Math.min(have,Math.floor(n)||0));if(!n)return stockMenu(st,k);st.stock[k]+=n;G.inv[k]-=n;advance(5);structMenu(st,`Stocked ${n} ${NAMES[k].toLowerCase()}.`)};
  ui(`<h2>Stock ${esc(NAMES[k].toLowerCase())}</h2><p class="muted">You have ${have} in your bag and ${st.stock[k]} on the stall. Sells at ${money(FAIR[k]*MK[st.mk])} each. Keep the rest for yourself.</p>
    <label class="small muted" for="stk">How many to put on the stall</label><input id="stk" class="txt" type="number" inputmode="numeric" min="1" max="${have}" value="${Math.min(have,Math.max(1,Math.floor(have/2)))}">`,
  [{label:'Stock this many',cls:'primary',fn:()=>put(+$('#stk').value)},
   ...[1,5].filter(n=>n<have).map(n=>({label:`Stock ${n}`,cls:'',fn:()=>put(n)})),
   {label:`Stock all ${have}`,cls:'',fn:()=>put(have)},
   {label:'Back',cls:'quiet',fn:()=>structMenu(st)}]);
}
function structMenu(st,msg){
  const nm=STRUCTS[st.type].n,rm={label:'Dismantle',sub:`Refund ${money(st.paid*.5)}`,cls:'quiet',fn:()=>ask('Dismantle the '+nm.toLowerCase()+'?',`You will get back ${money(st.paid*.5)} and lose it for good.`+(G.home==='S:'+st.id?' This is your home. You will move to the Bunkhouse.':''),'Yes, dismantle',()=>{G.cash+=Math.round(st.paid*.5);G.structs=G.structs.filter(s=>s!==st);if(G.home==='S:'+st.id)G.home='bunk';closeMenu();notify('Dismantled.')},()=>structMenu(st))};
  const mv={label:'Move',sub:'Pick it up and set it down on another tile. Free.',cls:'quiet',fn:()=>startMove(st)};
  if(st.type==='house'){
    const me=G.home==='S:'+st.id;
    return ui(`<h2>${nm}</h2><p class="muted">${district(st.x,st.y)}. $35 a month.</p>${msgP(msg)}`,[
      me?{label:'Sleep, cook, rest',fn:()=>homeMenu(homePoi())}:{label:'Make this my home',fn:()=>{G.home='S:'+st.id;structMenu(st,'You moved in.')}},leaveBtn,mv,rm]);
  }
  if(st.type==='stall'){
    const lines=Object.keys(FAIR).map(k=>`<div><span>${NAMES[k]}</span><b>${st.stock[k]}</b></div>`).join('');
    const stk=Object.keys(FAIR).filter(k=>G.inv[k]>0).map(k=>({label:`Stock ${NAMES[k]} (${G.inv[k]} in bag)`,sub:`Sells at ${money(FAIR[k]*MK[st.mk])} each. Choose how many.`,cls:'',fn:()=>stockMenu(st,k)}));
    ui(`<h2>Your stall</h2><p class="muted">${district(st.x,st.y)}. Price: ${MKN[st.mk]}. Sold ${st.earned>0?money(st.earned):'nothing'} so far.${signNear(st)?' A sign draws extra shoppers.':''}</p>${msgP(msg)}<div class="kv">${lines}</div>
    <p class="muted small">Low prices beat the diner. High prices only sell to people who like you. Hostile locals never buy.</p>`,
      [{label:'Collect earnings',sub:money(st.stored),off:st.stored<=0,fn:()=>{G.cash+=st.stored;st.stored=0;structMenu(st,'Cash collected.')}},
       {label:`Price: ${MKN[st.mk]}`,sub:'Tap to change: Low, Fair, High',cls:'',fn:()=>{st.mk=(st.mk+1)%3;structMenu(st)}},
       ...stk,{label:'Take stock back',cls:'',off:!Object.values(st.stock).some(v=>v>0),fn:()=>{for(const k in st.stock){G.inv[k]+=st.stock[k];st.stock[k]=0}structMenu(st,'Stock returned to your bag.')}},
       leaveBtn,mv,rm]);
  }else if(st.type==='planter'){
    const grow=G.fx.irrig?1:2;
    if(st.s===0)ui(`<h2>${nm}</h2>${msgP(msg)}`,[{label:'Plant a seed',sub:`You have ${G.inv.seeds}. Grows in ${grow} day${grow>1?'s':''}.`,off:G.inv.seeds<1,fn:()=>{G.inv.seeds--;st.s=1;st.d=Math.max(1,grow+G.mod.growth);advance(20);structMenu(st,'Planted.')}},leaveBtn,mv,rm]);
    else if(st.s===1)ui(`<h2>${nm}</h2><p>${st.d} day${st.d>1?'s':''} until harvest.</p>`,[leaveBtn,mv,rm]);
    else ui(`<h2>${nm}</h2><p class="good">Ready to harvest.</p>`,[{label:'Harvest',fn:()=>{const n=Math.round(4*(has('rural')?1.5:1)*G.mod.yield);G.inv.crops+=n;st.s=0;advance(20);structMenu(st,`You harvested ${n} crops.`)}},leaveBtn,mv,rm]);
  }else if(st.type==='smoker'){
    ui(`<h2>${nm}</h2><p class="muted">Smoked fish keep and sell for more.</p>${msgP(msg)}`,[{label:'Smoke 2 fish',sub:`You have ${G.inv.fish} fish. 90 minutes.`,off:G.inv.fish<2,fn:()=>{G.inv.fish-=2;G.inv.smoked+=2;advance(90);structMenu(st,'You smoked two fish.')}},leaveBtn,mv,rm]);
  }else if(st.type==='bench'){
    ui(`<h2>${nm}</h2><p class="muted">A bench you can use anywhere in the city.</p>${msgP(msg)}`,[{label:'Craft a trinket',sub:`Uses 3 scrap, 2 hours. You have ${G.inv.scrap}.`,off:G.inv.scrap<3,fn:()=>{craftTrinket();structMenu(st,'You made a trinket.')}},leaveBtn,mv,rm]);
  }else ui(`<h2>${nm}</h2><p class="muted">Stalls within 5 tiles draw shoppers from twice as far.</p>`,[leaveBtn,mv,rm]);
}
