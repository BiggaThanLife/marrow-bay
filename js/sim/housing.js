"use strict";
/* Homes, monthly bills, arrears. */
/* homes */
function homePoi(){
  const h=G.home;
  if(h.startsWith('S:')){const s=G.structs.find(x=>'S:'+x.id===h);if(s)return{id:h,name:'Your house',ex:s.x,ey:s.y,d:district(s.x,s.y)}}
  if(h.startsWith('B:')){const b=blockByKey(h.slice(2));if(b)return{id:h,name:'Your building',ex:b.x+1,ey:b.y+4,d:district(b.x+1,b.y+1)}}
  return POIS[POIS[h]?h:'barn'];
}
function homeBill(){
  const cut=G.companion==='halloran'?.9:G.companion==='lou'?.95:1;
  return Math.round(homeBillBase()*cut);
}
function homeBillBase(){
  const h=G.home;
  if(h.startsWith('S:'))return 35;
  if(h.startsWith('B:'))return 60;
  return G.owned[h]?Math.round(RENT[h]*.3):RENT[h];
}
function monthlyBills(){
  const lines=[];
  lines.push(['Home',homeBill()]);
  Object.keys(G.owned).forEach(id=>{if(G.home!==id)lines.push([POIS[id].name+' upkeep',Math.round(RENT[id]*.3)])});
  G.structs.forEach(s=>{if(s.type==='house'&&G.home!=='S:'+s.id)lines.push(['House upkeep',35])});
  Object.keys(G.veh.owned).forEach(k=>{if(G.veh.owned[k]&&!G.veh.stolen[k]&&VEH[k].ins)lines.push([VEH[k].n+' insurance',VEH[k].ins])});
  Object.keys(G.shops||{}).forEach(id=>lines.push([POIS[id].name+' tax',Math.round(SHOP_DEFS[id].price*.008)]));
  G.biz.forEach(b=>{if(G.home==='B:'+b.key)return;lines.push(['Property tax',Math.round(b.price*.01)]);if(b.type&&b.type!=='home')lines.push(['Business license',20])});
  return lines;
}
function chargeBills(){
  const lines=monthlyBills(),total=Math.round(lines.reduce((s,l)=>s+l[1],0)*G.mod.bills);
  const paid=Math.min(G.cash,total);G.cash-=paid;G.arrears+=total-paid;G.lastBills=total;
  notify(total-paid>0?`Monthly bills ${money(total)}. You came up ${money(total-paid)} short.`:`Monthly bills paid: ${money(total)}.`);
  quip(total-paid>0?'bill_short':'bill');
}
