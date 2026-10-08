"use strict";
/* Territory: who runs the Neon Mile rackets, and your attempts to take them. Opened from the Velvet Room. */
function territoryMenu(poi,n,msg){
  const rows=RACKETS.map(r=>`<div><span>${esc(r.n)}</span><b>${esc(OWNER_NAMES[G.turf[r.id]])}${G.turf[r.id]==='player'?` (${money(racketPay(r))}/wk)`:''}</b></div>`).join('');
  ui(`<h2>Territory</h2><p class="muted">Rackets pay on the 7th day of each week. Income is hurt by FLACK and a firm mayor.${G.arc&&G.arc.id==='turfwar'?' A turf war is on.':''}</p><div class="kv">${rows}</div>${rivalBlock()}${msgP(msg)}`,[
    ...RACKETS.filter(r=>G.turf[r.id]!=='player'&&G.turf[r.id]!=='none').flatMap(r=>[
      {label:`Lean on ${r.n}`,sub:'3 hours of muscle. Raises heat if it works.',cls:'warn',off:G.energy<12,fn:()=>territoryMenu(poi,n,takeRacket(r.id,'muscle'))},
      {label:`Buy out ${r.n}`,sub:money(200+r.pay*5)+'. Quiet and expensive.',cls:'',off:G.cash<200+r.pay*5,fn:()=>territoryMenu(poi,n,takeRacket(r.id,'buy'))}]),
    ...rivalButtons(poi,n),
    {label:'Back',cls:'quiet',fn:()=>MENUS.velvet(poi,n)}]);
}
