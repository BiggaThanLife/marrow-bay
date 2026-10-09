"use strict";
/* Plots, plaza busking, waterfront fishing. */
/* ================= TILE INTERACTIONS ================= */
function plotMenu(pl,msg){
  if(!msg){engageAdd('Greenbelt',1);if(arcHook({id:'plot',d:'Greenbelt'}))return}
  if(tier(att(NPC.wren))===0)return ui(`<h2>Greenbelt plot</h2><p>Old Wren shoos you off the field. "Not you."</p><p class="muted">Build standing in the Greenbelt first.</p>`,[leaveBtn]);
  const again=m=>plotMenu(pl,m);
  if(pl.s===0)ui(`<h2>Empty plot</h2><p class="muted">${esc(seedLine())}</p>${msgP(msg)}`,[
    {label:seedsOwned().length>1?'Choose a seed':'Plant a seed',sub:seedsOwned().length>1?'Pick what to plant':seedsOwned().length?`Ready in ${cropDays(seedsOwned()[0],false)} day${cropDays(seedsOwned()[0],false)>1?'s':''}.`:'You have no seeds.',off:!seedsOwned().length,fn:()=>plantMenu(pl,false,again,()=>plotMenu(pl))},leaveBtn]);
  else if(pl.s===1)ui(`<h2>Growing ${esc(cropOf(pl).n.toLowerCase())}</h2><p>${pl.d} day${pl.d>1?'s':''} until harvest.</p>`,[leaveBtn]);
  else ui(`<h2>Ready to harvest</h2><p class="muted">${esc(cropOf(pl).n)}.</p>`,[{label:'Harvest',fn:()=>{
    const m=harvestCrop(pl,false);G.rep.Greenbelt=clamp(G.rep.Greenbelt+1,-100,100);G.energy=clamp(G.energy-4,0,100);advance(30);quip('harvest');
    plotMenu(pl,m)}},leaveBtn]);
}
function plazaMenu(msg){
  const gala=G.ev&&G.ev.id==='gala',evening=hourOf()>=17;
  const est=Math.round(15*(has('creative')?1.8:1)*(gala?1.5:1)*(evening?1.3:1)*(has('known-thief')?.6:1)*(G.fx.lamps?1.3:1)*G.mod.busk);
  ui(`<h2>Central Plaza</h2><p class="muted">The fountain is the Grid's living room.</p>${msgP(msg)}`,[
    {label:'Busk for tips',sub:`2 hours, about ${money(est)}`,need:14,fn:()=>{
      if(G.energy<14)return plazaMenu('You are too tired.');
      const pay=Math.max(2,Math.round(est*rnd(.5,1.5)+(has('smooth')?4:0)));
      G.cash+=pay;G.rep.Grid=clamp(G.rep.Grid+1,-100,100);advance(120);G.energy=clamp(G.energy-8,0,100);plazaMenu(`The crowd tips you ${money(pay)}.`)}},
    {label:'Rest on a bench',sub:'1 hour',cls:'',fn:()=>{advance(60,true);G.energy=clamp(G.energy+10,0,100);plazaMenu('You rest.')}},leaveBtn]);
}
function waterfront(msg){
  const tn=tideName(),fs=G.fishStock,fl=G.flats;
  ui(`<h2>Waterfront</h2><p class="muted">The tide is ${tn}. Fish look ${fs<30?'scarce':fs>70?'plentiful':'steady'}. The flats look ${fl<30?'picked clean':fl>70?'full of scrap':'workable'}.${tn==='low'?' The mud is exposed.':tn==='high'?' The pier is awash.':''}</p>${msgP(msg)}`,[
    ...openingWaterfrontButtons(),
    {label:'Fish from the pier',sub:'2 hours. Best at high tide.',need:14,fn:()=>{
      if(G.energy<14)return waterfront('You are too tired.');
      let n=tn==='high'?ri(2,4):tn==='low'?ri(0,1):ri(1,2);if(has('working-class'))n++;n+=rodLevel();
      n=Math.round(n*clamp(.3+G.fishStock/70,.3,1.3));
      G.inv.fish+=n;G.fishStock=clamp(G.fishStock-n*3,0,100);advance(120);G.energy=clamp(G.energy-6,0,100);if(n)quip('fish');waterfront(n?`You caught ${n} fish.`:'Nothing bites.')}},
    {label:'Take the boat out',sub:hasBoat()?(tn==='low'||G.mod.flood.includes('Dockside')?'Not at low tide or in a flood':'4 hours. Bigger catch, bigger dent in the stock.'):'You need a rowboat from the Dock Office',off:!hasBoat()||tn==='low'||G.mod.flood.includes('Dockside'),need:20,cls:'',fn:()=>{
      if(G.energy<20)return waterfront('You are too tired to row.');
      let n=ri(4,7)+rodLevel();n=Math.round(n*clamp(.3+G.fishStock/70,.3,1.3));
      G.inv.fish+=n;G.fishStock=clamp(G.fishStock-n*2,0,100);advance(240);G.energy=clamp(G.energy-12,0,100);if(n)quip('fish');waterfront(n?`You row home with ${n} fish.`:'The sea is empty out there.')}},
    {label:'Fish the exposed channel',sub:tn==='low'?'2 hours. Easy catches at low tide.':'Only at low tide',off:tn!=='low',need:10,cls:'',fn:()=>{
      if(G.energy<10)return waterfront('You are too tired.');
      let n=ri(1,2)+rodLevel();n=Math.round(n*clamp(.4+G.fishStock/80,.4,1.2));
      G.inv.fish+=n;G.fishStock=clamp(G.fishStock-n*1.5,0,100);advance(120);G.energy=clamp(G.energy-5,0,100);waterfront(n?`The channel gives up ${n} fish.`:'The channel is bare.')}},
    {label:'Scavenge the mudflats',sub:tn==='low'?'90 minutes. Scrap is exposed.':'Only at low tide',off:tn!=='low',cls:'',fn:()=>{
      let n=ri(1,3)+(has('strong')?1:0)+(G.companion==='pip'?1:0);n=Math.round(n*clamp(G.flats/60,.3,1.2));
      G.inv.scrap+=n;G.flats=clamp(G.flats-n*5,0,100);advance(90);G.energy=clamp(G.energy-6,0,100);
      const box=Math.random()<.12?ri(25,60):0;G.cash+=box;
      waterfront((n?`You pulled ${n} pieces of scrap from the mud.`:'The flats have been picked clean.')+(box?` Something glints under the silt: a strongbox with ${money(box)} in it.`:''))}},
    leaveBtn]);
}
