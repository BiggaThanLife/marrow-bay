"use strict";
/* Getting busted. */
/* ================= CRIME / POLICE ================= */
function bust(){
  const R=NPC.reyes,fine=50*Math.ceil(G.heat),pay=Math.min(G.cash,fine);
  G.cash-=pay;G.arrears+=fine-pay;G.inv.loot=0;G.heat=0;G.mission=null;R.chasing=false;
  Object.keys(G.veh.stolen).forEach(k=>{if(G.veh.stolen[k]){G.veh.owned[k]=false;G.veh.stolen[k]=false;if(G.veh.active===k)G.veh.active='none'}});
  addRumor('thief',['reyes']);news('Constable Reyes made an arrest after a chase through the city.',2);
  advance(240,true,true);quip('bust');
  const pl=POIS.plaza;G.p.x=pl.ex;G.p.y=pl.ey;G.p.path=[];G.p.onArrive=null;assign(R,true);
  hud();
  ui(`<h2>Busted</h2><p>Constable Reyes catches you. Four hours in a cell, a fine of ${money(fine)}, and your hot goods and stolen cars are gone.</p>`,[{label:'Walk out',fn:closeMenu}],true,false);
}
