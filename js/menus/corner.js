"use strict";
/* The corner store and the fast food place. In a new city they are buildings of their own (Kelp Corner Shop and Fry Hard); in an older city the same
   goods and food are on Mina's market counter and as "The fast counter" on Teo's diner menu, because an old city's blocks cannot change. */
MENUS.corner=(poi,n,msg)=>{
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the till. Open late.</p>${msgP(msg)}`,[
    {label:'Browse the shelves',sub:'Drinks, snacks, everyday items, gifts and tools',fn:()=>generalStore(poi,n,()=>MENUS.corner(poi,n))},
    {label:'Work the till',sub:`3 hours, about ${money(14*payF(n))}`,need:21,cls:'',fn:()=>MENUS.corner(poi,n,gig(n,{hrs:3,base:14,rep:poi.d,label:'behind the till'}))},
    leaveBtn]);
  sceneCtx({who:n});
};
/* back is where Back goes; in the building that is leaving, in the diner it is the diner menu */
function fastFoodMenu(poi,n,back,msg){
  const f=buyF(n),pr=b=>Math.max(1,Math.round(b*f));
  const order=(label,base,fill)=>({label:`${label}, ${money(pr(base))}`,sub:`+${fill} fullness. A quick bite, 15 minutes.`,off:G.cash<pr(base),cls:'',
    fn:()=>{G.cash-=pr(base);G.hunger=clamp(G.hunger+fill,0,100);G.demand+=.5;advance(15);fastFoodMenu(poi,n,back,`You eat the ${label.toLowerCase()} standing up. It is hot, at least.`)}});
  ui(`<h2>${esc(poi.id==='fastfood'?poi.name:'The fast counter')}</h2><p class="muted">${esc(n.name)} is on the fryer. Cheap, fast and not very good for you.</p>${msgP(msg)}`,[
    {...order('Fries',3,10),cls:'primary'},order('Burger',6,22),order('Combo',9,35),
    {label:'Work a counter shift',sub:`2 hours, about ${money(12*payF(n))}`,need:14,cls:'',fn:()=>fastFoodMenu(poi,n,back,gig(n,{hrs:2,base:12,rep:poi.d,label:'at the fryer'}))},
    typeof back==='function'?{label:'Back',cls:'quiet',fn:back}:leaveBtn]);
  sceneCtx({who:n});
}
MENUS.fastfood=(poi,n,msg)=>fastFoodMenu(poi,n,null,msg);
