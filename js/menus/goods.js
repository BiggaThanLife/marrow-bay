"use strict";
/* Everyday goods: the general-goods counter (Mina's market, and the corner store in new cities), using what you buy, and giving gifts. The items are GOODS in js/data/goods.js.
   Consumables live in G.items; equipment is a flag on G.fx (sneakers, umbrella, gloves, toolkit); an energy drink queues a dip in G.crash. */
const GOOD_CATS=[
  {id:'food',n:'Drinks and snacks',d:'Quick fixes. Cheap and small.',of:['water','coffee','energy','chips','candybar','sandwich']},
  {id:'everyday',n:'Everyday items',d:'Things people go to the shop for.',of:['painkillers','sneakers','umbrella']},
  {id:'gifts',n:'Gifts',d:'Give them from a person\'s talk menu. They beat a meal.',of:['card','flowers','wine']},
  {id:'tools',n:'Tools',d:'Kit that makes work pay a little better.',of:['gloves','toolkit']}
];
const goodPrice=(id,f)=>Math.max(1,Math.round(GOODS[id].price*f*shopMul('market',.75)));
const goodOwned=id=>G.fx&&GOODS[id].fx&&G.fx[GOODS[id].fx];
const itemCount=id=>(G.items&&G.items[id])||0;
function generalStore(poi,n,back){
  const f=buyF(n);
  ui(`<h2>General goods</h2><p class="muted">${esc(n.name)} keeps the everyday things on the shelves by the door.</p>`,[
    ...GOOD_CATS.map((c,i)=>({label:c.n,sub:c.d,cls:i?'':'primary',fn:()=>goodsCategory(poi,n,c,back)})),
    {label:'Back',cls:'quiet',fn:back}]);
}
function goodsCategory(poi,n,cat,back,msg){
  const f=buyF(n);
  ui(`<h2>${esc(cat.n)}</h2><p class="muted">${esc(cat.d)}</p>${msgP(msg)}`,[
    ...cat.of.map((id,i)=>{
      const g=GOODS[id],p=goodPrice(id,f),own=goodOwned(id),have=itemCount(id);
      return {label:`${g.n}, ${money(p)}`,sub:own?'You already have one.':`${g.d}${have?` You have ${have}.`:''}`,cls:i?'':'primary',off:own||G.cash<p,
        fn:()=>g.fx?buyGear(poi,n,cat,back,id,p):qtyMenu({title:g.n,intro:g.d,price:p,max:30,mode:'buy',onConfirm:q=>{G.cash-=Math.round(p*q);G.items[id]=itemCount(id)+q;advance(5);return `You bought ${q} ${g.n.toLowerCase()}${q>1?'s':''}.`},back:m=>goodsCategory(poi,n,cat,back,m)})};
    }),
    {label:'Back',cls:'quiet',fn:()=>generalStore(poi,n,back)}]);
}
function buyGear(poi,n,cat,back,id,p){
  const g=GOODS[id];G.cash-=p;G.fx[g.fx]=true;advance(5);
  goodsCategory(poi,n,cat,back,`You bought ${g.n.toLowerCase()}. ${g.d}`);
}
/* using a consumable from the Bag */
function useItem(id){
  const g=GOODS[id];if(itemCount(id)<1)return;
  G.items[id]--;
  if(g.energy)G.energy=clamp(G.energy+g.energy,0,100);
  if(g.hunger)G.hunger=clamp(G.hunger+g.hunger,0,100);
  if(g.crash)G.crash.push({at:G.t+g.crash.after,amt:g.crash.amt});
  advance(5,false,true);hud();
}
const usableItems=()=>Object.keys(GOODS).filter(id=>!GOODS[id].fx&&!GOODS[id].gift&&itemCount(id)>0);
function itemsMenu(msg){
  const own=usableItems();
  if(!own.length)return bag('You have nothing to use.');
  ui(`<h2>Use an item</h2><p class="muted">Energy ${Math.round(G.energy)}, fullness ${Math.round(G.hunger)}.</p>${msgP(msg)}`,[
    ...own.map((id,i)=>({label:`${GOODS[id].n} (${itemCount(id)})`,sub:GOODS[id].d,cls:i?'':'primary',fn:()=>{useItem(id);itemsMenu(`${GOODS[id].n}: done.`)}})),
    {label:'Back',cls:'quiet',fn:()=>bag()}]);
}
/* an energy drink's dip arrives a few hours later */
function crashTick(){
  if(!G.crash||!G.crash.length)return;
  G.crash=G.crash.filter(c=>{if(G.t<c.at)return true;G.energy=clamp(G.energy-c.amt,0,100);notify('The energy drink wears off. You feel it.');return false});
}
/* gifts, from a person's talk menu: one a day each, worth more than a meal */
const giftsOwned=()=>Object.keys(GOODS).filter(id=>GOODS[id].gift&&itemCount(id)>0);
function giftMenu(n){
  const s=npcS(n),own=giftsOwned();
  if(s.gift===day())return talk(n,`${n.name.split(' ')[0]} has already had a gift today.`);
  ui(`<h2>Give a gift</h2><p class="muted">To ${esc(n.name)}. One a day.</p>`,[
    ...own.map((id,i)=>({label:`${GOODS[id].n} (${itemCount(id)})`,sub:GOODS[id].d,cls:i?'':'primary',fn:()=>{
      G.items[id]--;s.gift=day();s.m+=GOODS[id].gift;G.rep[n.d]=clamp(G.rep[n.d]+1,-100,100);G.gifts++;
      if(G.gifts===3||G.gifts%5===0)addRumor('generous',[n.id]);
      talk(n,`${n.name.split(' ')[0]} takes the ${GOODS[id].n.toLowerCase()}, a little surprised. It lands well.`)}})),
    {label:'Back',cls:'quiet',fn:()=>talk(n)}]);
}
