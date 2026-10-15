"use strict";
/* Money sinks that grow with wealth: the weekly Harbor levy, and sea damage to waterfront buildings after a surge or flood.
   Both are capped so a careful player is never pushed into arrears: the levy takes at most half your cash, repairs at most
   the till plus half your cash, and anything beyond that is patched up on the cheap. Fees are logged in G.fees for the day summary. */
function addFee(label,amt){
  if(!G.fees)G.fees=[];
  G.fees.push({d:day(),t:label,amt});if(G.fees.length>30)G.fees.shift();
}
/* weekly levy: 2.5% of net worth between $5,000 and $15,000 plus 5% above that. Gilded Tide members get 10% off. */
function levyAmount(){
  const nw=Math.max(0,netWorth());
  const raw=Math.max(0,Math.min(nw,15000)-5000)*.025+Math.max(0,nw-15000)*.05;
  return Math.round(raw*(G.fx&&G.fx.gilded?.9:1));
}
function weeklyLevy(){
  const due=levyAmount();if(due<=0)return;
  const pay=Math.min(due,Math.floor(Math.max(0,G.cash)*.5));if(pay<=0)return;
  G.cash-=pay;addFee('Harbor levy',pay);
  if(!G.flags.levySeen){G.flags.levySeen=1;news('The city has started charging a weekly Harbor levy on large fortunes: 2.5% of net worth above $5,000, 5% above $15,000. It never takes more than half your cash.',2)}
  news(`Harbor levy: ${money(pay)} taken this week.`,1);
}
/* the sea damages buildings you own in the flooded districts; fit-out value drives the cost */
function surgeRepairs(dists,rate){
  let total=0,n=0;
  G.biz.forEach(b=>{
    if(!dists.includes(b.d)||b.type==='home')return;
    const want=Math.max(25,Math.round((b.paid||b.price)*rate));
    const room=Math.max(0,b.till)+Math.floor(Math.max(0,G.cash)*.5);
    const pay=Math.min(want,room);if(pay<=0)return;
    const fromTill=Math.min(Math.max(0,b.till),pay);b.till-=fromTill;G.cash-=pay-fromTill;
    total+=pay;n++;
  });
  if(!total)return '';
  addFee('Flood repairs',total);
  return `Sea damage to ${n} of your ${n>1?'buildings':'building'}: repairs cost ${money(total)}.`;
}
