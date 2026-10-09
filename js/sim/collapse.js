"use strict";
/* Collapse from hunger or exhaustion. */
/* ================= COLLAPSE ================= */
function collapse(){
  const cost=Math.min(G.cash,15);G.cash-=cost;addRumor('collapse',['teo','bell']);histAdd('collapse','Collapsed in the street and woke at Bell Clinic. HARBOR has noted the fee.',5);
  advance(360,true,true);
  G.energy=55;G.hunger=Math.max(G.hunger,35);quip('collapse');
  const c=POIS.clinic;G.p.x=c.ex;G.p.y=c.ey;G.p.path=[];G.p.onArrive=null;
  hud();
  ui(`<h2>You collapsed</h2><p>You wake at Bell Clinic. Six hours are gone${cost?` and the fee was ${money(cost)}`:''}.</p>`,[{label:'Get up',fn:closeMenu}],true,false);
}
