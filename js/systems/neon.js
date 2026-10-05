"use strict";
/* Neon Mile: rackets and their income, casino bookkeeping, underworld effects. */
const playerRackets=()=>RACKETS.filter(r=>G.turf[r.id]==='player');
function racketPay(r){
  let m=clamp(.7+G.meters['Neon Mile']/166,.7,1.3);
  if(flackBand()>=2)m*=.7;
  if(fact('mayor')==='reyes')m*=.8;
  if(G.companion==='vex')m*=1.1;
  return Math.round(r.pay*m);
}
function neonDaily(){
  if(day()%7!==0)return;
  const mine=playerRackets();
  if(!mine.length)return;
  const pay=mine.reduce((t,r)=>t+racketPay(r),0);
  G.cash+=pay;meterAdd('Neon Mile',mine.length);G.heat=Math.min(5,G.heat+.2*mine.length);
  news(`Your ${mine.length} racket${mine.length>1?'s':''} paid ${money(pay)} this week.`,1);
}
function takeRacket(id,how){
  const r=RACKETS.find(x=>x.id===id),was=G.turf[id];
  if(was==='player')return 'It is already yours.';
  if(how==='buy'){
    const cost=200+r.pay*5;if(G.cash<cost)return 'You cannot afford it.';
    G.cash-=cost;G.turf[id]='player';if(was==='vex')facAdd('crew',-4);if(was==='salt')facAdd('salt',-4);advance(30);
    return `You buy out ${r.n} for ${money(cost)}.`;
  }
  if(G.energy<12)return 'You are too tired to lean on anybody.';
  G.energy=clamp(G.energy-12,0,100);advance(90);
  const c=clamp(.35+(has('strong')?.2:0)+(G.fx.kit?.05:0)-r.hard*.3+G.fac.crew/300,.1,.85);
  if(Math.random()<c){G.turf[id]='player';G.heat=Math.min(5,G.heat+.5);if(was==='vex')facAdd('crew',-8);if(was==='salt')facAdd('salt',-8);meterAdd('Neon Mile',2);return `${r.n} is yours now. The previous owner takes it personally.`}
  G.heat=Math.min(5,G.heat+1);facAdd('crew',-3);return 'It goes badly. Somebody calls the constable.';
}
/* Casino daily net winnings, and the security ban when you win too much while cameras watch. */
function casinoRecord(d){
  if(G.flags.casinoDay!==day()){G.flags.casinoDay=day();G.flags.casinoNet=0}
  G.flags.casinoNet+=d;
  const lim=flackBand()>=2?400:600;
  if(G.flags.casinoNet>=lim&&flackBand()>=1){G.flags.casinoBan=day()+2;return 'Security escorts you out. The cameras flagged your streak.'}
  return '';
}
