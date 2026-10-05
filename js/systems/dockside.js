"use strict";
/* Dockside meter effects, fishing gear, union and freight standing. */
const rodLevel=()=>G.fx.rod||0;
const hasBoat=()=>!!G.fx.boat;
/* Pay multiplier for dock work: cargo meter (0.7 to 1.3) and faction cards. */
const dockPay=()=>{
  let m=clamp(.7+G.meters.Dockside/100*.6,.7,1.3);
  if(G.fac.shipping>=15)m*=1.15;
  if(G.fac.union>=15)m*=1.1;
  if(fact('dock_union_contract'))m*=1.1;
  if(fact('dock_automated'))m*=.8;
  if(fact('union_broken'))m*=.9;
  return m;
};
/* Empty seas and idle piers drag the Dockside meter down, a healthy catch lifts it. */
function dockDaily(){
  if(G.fishStock<30)meterAdd('Dockside',-2);
  else if(G.fishStock>70)meterAdd('Dockside',1);
}
