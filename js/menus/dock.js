"use strict";
/* Dock Office: hauling, cargo manifest, tackle counter. Union table at the Rusty Gull. */
MENUS.dock=(poi,n,msg)=>{
  const strike=G.ev&&G.ev.id==='strike';
  const mult=(has('strong')?1.4:1)*(has('union')?1.2:1)*(G.fx.crane?1.25:1)*dockPay();
  const done=G.flags.manifestDay===day();
  const nr=RODS[rodLevel()+1];
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the hiring line. Cargo is ${meterWord(G.meters.Dockside)}. ${G.fac.shipping>=15?'Harbor Freight knows your face.':''}</p>${strike?'<p class="bad">The dock strike has shut the piers.</p>':''}${msgP(msg)}`,[
    {label:'Haul cargo',sub:`4 hours, about ${money(26*mult*payF(n))}`,off:strike,fn:()=>{
      const r=gig(n,{hrs:4,base:26,mult,rep:'Dockside',label:'hauling cargo'});
      if(r.startsWith('You worked')){facAdd('shipping',1);meterAdd('Dockside',1)}
      MENUS.dock(poi,n,r)}},
    {label:'Cargo manifest',sub:done?'Done for today':'3 hours. Check crates, load them, or skim.',off:strike||done||G.energy<12,cls:'',fn:()=>manifestStart(poi,n)},
    ...(nr?[{label:`Buy a ${nr.n.toLowerCase()}`,sub:`${money(nr.price)}. ${nr.bonus} more fish per catch than before.`,off:G.cash<nr.price,cls:'',fn:()=>{G.cash-=nr.price;G.fx.rod=rodLevel()+1;MENUS.dock(poi,n,`You bought a ${nr.n.toLowerCase()}.`)}}]:[]),
    ...(!hasBoat()?[{label:'Buy a rowboat',sub:`${money(BOAT_PRICE)}. Fish offshore on any tide but low.`,off:G.cash<BOAT_PRICE,cls:'',fn:()=>{G.cash-=BOAT_PRICE;G.fx.boat=true;MENUS.dock(poi,n,'You bought a rowboat. It leaks only a little.')}}]:[]),
    leaveBtn]);
};
function manifestStart(poi,n){
  if(G.energy<12)return MENUS.dock(poi,n,'You are too tired for a manifest.');
  G.energy=clamp(G.energy-12,0,100);advance(180);G.flags.manifestDay=day();
  const pool=CRATES.slice(),crates=[];
  while(crates.length<5)crates.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  G.manifest={i:0,crates:crates.map(c=>CRATES.indexOf(c)),pay:0,got:[],caught:false};
  manifestStep(poi,n);
}
function manifestStep(poi,n,msg){
  const M=G.manifest;
  if(!M)return MENUS.dock(poi,n);
  if(M.i>=M.crates.length)return manifestEnd(poi,n);
  const c=CRATES[M.crates[M.i]],pm=dockPay();
  const risk=clamp(c.risk+(flackBand()>=2&&camNear(7)?.2:0)-(G.fac.shipping>=15?.1:0)+(G.fx.mask?-.05:0),.05,.9);
  const step=fx=>{M.i++;fx&&fx();manifestStep(poi,n)};
  const load=()=>step(()=>{M.pay+=6*pm});
  const btns=[{label:'Load it as listed',sub:`About ${money(6*pm)}`,fn:load}];
  if(c.skim)btns.push({label:`Skim ${c.skim.txt}`,sub:`${Math.round(risk*100)}% chance ${esc(NPC.duarte.name)} notices`,cls:'warn',fn:()=>step(()=>{
    M.pay+=6*pm;
    if(Math.random()<risk){M.caught=true;return}
    if(c.skim.cash){G.cash+=c.skim.cash;M.got.push('$'+c.skim.cash)}
    else{G.inv[c.skim.inv]+=c.skim.n;M.got.push(c.skim.n+' '+NAMES[c.skim.inv])}})});
  if(c.kind==='flack')btns.push({label:'Pry it open and look',sub:'Union would want to know what is in it',cls:'',fn:()=>{
    G.flags.sawFlack7=1;
    ui(`<h2>Crate ${M.i+1} of ${M.crates.length}</h2><p>Foam, wiring, and forty camera units still in their sleeves. The label says FLACK. The manifest says "assorted hardware."</p><p class="muted">HARBOR, over the crane speaker: "I did not see that. I am saying so for the record."</p>`,[
      {label:'Load it and say nothing',sub:'Shipping owes you one. Quietly.',fn:()=>{facAdd('shipping',2);flackAdd(2);M.i++;M.pay+=6*pm;manifestStep(poi,n)}},
      {label:'Photograph the label for the union',sub:'Union standing up, freight standing down',cls:'',fn:()=>{facAdd('union',4);facAdd('shipping',-3);setFact('flack_shipment_seen');M.i++;M.pay+=6*pm;manifestStep(poi,n,'Photo sent to Gus. He does not look surprised.')}}]);
  }});
  ui(`<h2>Crate ${M.i+1} of ${M.crates.length}</h2><p>${esc(c.n)}. ${esc(NPC.duarte.name)} is watching the crane, not you. Mostly.</p>${msgP(msg)}`,btns);
}
function manifestEnd(poi,n){
  const M=G.manifest;G.manifest=null;
  let pay=Math.round(M.pay),m;
  if(M.caught){pay=Math.round(pay/2);facAdd('shipping',-6);facAdd('union',1);m=`Duarte saw. He halves your pay to ${money(pay)} and writes your name down.`}
  else{facAdd('shipping',2);m=`Manifest signed. You earn ${money(pay)}.`+(M.got.length?` You also walked off with ${M.got.join(', ')}.`:'')}
  G.cash+=pay;G.rep.Dockside=clamp(G.rep.Dockside+(M.caught?-2:1),-100,100);meterAdd('Dockside',M.caught?0:3);
  MENUS.dock(poi,n,m);
}
function unionTable(poi,n,msg){
  ui(`<h2>Union table</h2><p class="muted">The Dockworkers' Union meets in the corner booth. Standing: ${standing(G.fac.union)}. Freight: ${standing(G.fac.shipping)}.</p>${G.flags.sawFlack7?'<p>Gus slides a napkin across. On it: "FLACK-7. Forty units. Who is it for?"</p>':''}${msgP(msg)}`,[
    {label:'Pay union dues',sub:'$10. Union standing up.',off:G.cash<10,cls:'',fn:()=>{G.cash-=10;facAdd('union',3);unionTable(poi,n,'Gus stamps your card. It is a very official-looking napkin.')}},
    {label:'Hand out leaflets',sub:'1 hour. Union up, freight down.',cls:'',fn:()=>{advance(60);facAdd('union',3);facAdd('shipping',-2);meterAdd('Dockside',-1);unionTable(poi,n,'You hand out two hundred leaflets. Three are read.')}},
    {label:'Back',cls:'quiet',fn:()=>MENUS.gull(poi,n)}]);
}
