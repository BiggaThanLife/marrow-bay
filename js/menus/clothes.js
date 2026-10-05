"use strict";
/* Tailor and barber. */
MENUS.tailor=(poi,n,msg)=>{
  const buy=(kind,key,list)=>list.filter(x=>x.price>0&&!G.wardrobe[kind][x.id]).map(x=>({label:`${x.n}, ${money(x.price)}`,sub:'You wear it right away.',off:G.cash<x.price,cls:'',fn:()=>{G.cash-=x.price;G.wardrobe[kind][x.id]=1;G.look[key]=x.id;advance(20);MENUS.tailor(poi,n,`You buy the ${x.n.toLowerCase()}. The previous owner will not be needing it.`)}}));
  const stock=[...buy('outfits','outfit',OUTFITS),...buy('hats','hat',HATS)];
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Previously owned by people who no longer need them. Fully laundered.</p>${msgP(msg)}${stock.length?'':'<p>You own everything in the shop. HARBOR is concerned.</p>'}`,
    [...stock,{label:'Change clothes',sub:'Wear something you already own',cls:'',fn:()=>wardrobeMenu(()=>MENUS.tailor(poi,n))},leaveBtn]);
};
MENUS.barber=(poi,n,msg)=>{
  const fee=12,L=G.look,go=(key,i,txt)=>()=>{G.cash-=fee;L[key]=i;advance(30);MENUS.barber(poi,n,txt)};
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Walk-ins welcome. Walk-outs also welcome. ${money(fee)} per change.</p>${msgP(msg)}`,[
    ...HAIR.map((c,i)=>({label:`Dye: ${HAIRN[i]}`,sub:L.hair===i?'Current':money(fee),off:L.hair===i||G.cash<fee,cls:'',fn:go('hair',i,`Your hair is now ${HAIRN[i].toLowerCase()}. The mirror disagrees, then relents.`)})),
    ...STYLEN.map((s,i)=>({label:`Cut: ${s}`,sub:L.style===i?'Current':money(fee),off:L.style===i||G.cash<fee,cls:'',fn:go('style',i,`${s}. A confident choice.`)})),
    leaveBtn]);
};
