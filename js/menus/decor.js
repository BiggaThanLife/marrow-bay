"use strict";
/* Home decoration. Comfort helps sleep, cooking sometimes yields an extra meal, cheer makes sleeping at home lower your wanted level more. */
const DECOR=[
 {id:'rug',n:'Soft rug',price:40,kind:'comfort'},{id:'bed',n:'Better mattress',price:120,kind:'comfort'},
 {id:'kettle',n:'Good kettle',price:25,kind:'cooking'},{id:'spice',n:'Spice rack',price:45,kind:'cooking'},
 {id:'plant',n:'Potted plant',price:25,kind:'cheer'},{id:'poster',n:'Tide poster',price:30,kind:'cheer'},{id:'lamp',n:'Warm lamp',price:50,kind:'cheer'}];
const DECOR_TXT={comfort:'Sleep restores more energy.',cooking:'Cooking sometimes makes an extra meal.',cheer:'Sleeping here lowers your wanted level more.'};
const decorPts=k=>DECOR.filter(d=>d.kind===k&&G.decor[d.id]).length;
function decorMenu(poi,msg){
  ui(`<h2>Decorate</h2><p class="muted">Things you buy stay with you when you move. Comfort ${decorPts('comfort')}, cooking ${decorPts('cooking')}, cheer ${decorPts('cheer')}.</p>${msgP(msg)}`,[
    ...DECOR.map(d=>({label:`${d.n}${G.decor[d.id]?' (owned)':''}`,sub:G.decor[d.id]?DECOR_TXT[d.kind]:`${money(d.price)}. ${DECOR_TXT[d.kind]}`,off:!!G.decor[d.id]||G.cash<d.price,cls:'',fn:()=>{G.cash-=d.price;G.decor[d.id]=1;advance(30);decorMenu(poi,`You put up the ${d.n.toLowerCase()}. The room has opinions about it.`)}})),
    {label:'Back',cls:'quiet',fn:()=>homeMenu(poi)}]);
}
