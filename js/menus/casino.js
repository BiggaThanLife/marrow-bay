"use strict";
/* Lucky Tide Casino: roulette, blackjack, slots, pit fight. House keeps an edge, and security watches your streak. */
const cardVal=()=>Math.min(10,1+Math.floor(Math.random()*13));
const bjScore=cs=>{const t=cs.reduce((a,b)=>a+b,0);return cs.includes(1)&&t+10<=21?t+10:t};
const casinoStake=()=>G.flags.stake||20;
function casinoSettle(poi,n,delta,msg){
  const out=casinoRecord(delta);
  MENUS.casino(poi,n,msg+(out?' '+out:''));
}
MENUS.casino=(poi,n,msg)=>{
  if((G.flags.casinoBan||0)>day())return ui(`<h2>${esc(poi.name)}</h2><p>Security shakes their head. You are not welcome until day ${G.flags.casinoBan}.</p>${msgP(msg)}`,[leaveBtn]);
  const st=casinoStake(),skim=G.turf.casino==='player';
  const edge=.474+(G.fac.crew>=15?.01:0)-(flackBand()>=2?.01:0);
  const roul=pickc=>{
    if(G.cash<st)return MENUS.casino(poi,n,'You cannot cover that bet.');
    advance(20);
    const win=pickc==='num'?Math.random()<1/38:Math.random()<edge;
    const gain=pickc==='num'?st*35:st;
    if(win){G.cash+=gain;casinoSettle(poi,n,gain,`You win ${money(gain)}.`)}else{G.cash-=st;casinoSettle(poi,n,-st,`You lose ${money(st)}.`)}
  };
  const spin=()=>{
    if(G.cash<10)return MENUS.casino(poi,n,'You cannot cover that bet.');
    advance(10);const r=Math.random();
    const mult=r<.01?30:r<.05?6:r<.20?2:0;
    G.cash-=10;
    if(mult){G.cash+=10*mult;casinoSettle(poi,n,10*mult-10,`Three in a row. ${money(10*mult)} pays out.`)}else casinoSettle(poi,n,-10,'The reels roll and shrug.');
  };
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Lights, chips, and exits that are hard to find. Cameras watch the tables${flackBand()>=2?' very closely':''}.${skim?' Your skim man nods from the bar.':''}</p>${msgP(msg)}<p class="small muted">House edge: roulette about 5%, blackjack about 3% with sensible play, slots about 16%. Win too much and security takes notice.</p>`,[
    {label:`Stake: ${money(st)}`,sub:'Tap to change: $20, $100, $500',cls:'',fn:()=>{G.flags.stake=st===20?100:st===100?500:20;MENUS.casino(poi,n)}},
    {label:'Roulette: red',sub:'Almost even odds',off:G.cash<st,cls:'',fn:()=>roul('red')},
    {label:'Roulette: black',sub:'Almost even odds',off:G.cash<st,cls:'',fn:()=>roul('black')},
    {label:'Roulette: one number',sub:'1 in 38, pays 35 to 1',off:G.cash<st,cls:'',fn:()=>roul('num')},
    {label:'Blackjack',sub:`${money(st)} a hand. Hit or stand.`,off:G.cash<st,cls:'',fn:()=>blackjack(poi,n,st)},
    {label:'Slots, $10',sub:'Cheap, flashy, and kind to the house',off:G.cash<10,cls:'',fn:spin},
    ...((G.dirty||0)>0?[{label:'Wash dirty cash at the cage',sub:`Up to ${money(cageLeft())} today, about ${Math.round(cageFee()*100)}% to the house`,off:cageLeft()<=0,cls:'',fn:()=>cageMenu(poi,n)}]:[]),
    {label:'Pit fight',sub:isNight()?'Basement ring, nights only. $140 if you win.':'Nights only',off:!isNight()||G.energy<20,cls:'warn',fn:()=>pitFight(poi,n)},
    leaveBtn]);
};
function blackjack(poi,n,stake,st,msg){
  if(!st){
    G.cash-=stake;advance(10);
    st={p:[cardVal(),cardVal()],d:[cardVal(),cardVal()],stake};
    if(bjScore(st.p)===21){
      if(bjScore(st.d)===21){G.cash+=stake;return casinoSettle(poi,n,0,'Both of you have blackjack. Push.')}
      const g=Math.round(stake*2.5);G.cash+=g;return casinoSettle(poi,n,g-stake,`Blackjack. It pays ${money(g)}.`);
    }
  }
  const sc=bjScore(st.p);
  const finish=()=>{
    while(bjScore(st.d)<17)st.d.push(cardVal());
    const ds=bjScore(st.d);
    if(ds>21||sc>ds){G.cash+=stake*2;casinoSettle(poi,n,stake,`Dealer shows ${ds}. You win ${money(stake)}.`)}
    else if(ds===sc){G.cash+=stake;casinoSettle(poi,n,0,`Dealer shows ${ds}. Push.`)}
    else casinoSettle(poi,n,-stake,`Dealer shows ${ds}. You lose ${money(stake)}.`);
  };
  ui(`<h2>Blackjack</h2><p>Your hand: ${st.p.map(c=>c===1?'A':c).join(', ')} (${sc}). Dealer shows ${st.d[0]===1?'A':st.d[0]}.</p><p class="muted small">Stake ${money(stake)}. Walking away forfeits it.</p>${msgP(msg)}`,[
    {label:'Hit',cls:'',fn:()=>{st.p.push(cardVal());if(bjScore(st.p)>21){casinoSettle(poi,n,-stake,`You bust on ${bjScore(st.p)}. You lose ${money(stake)}.`)}else blackjack(poi,n,stake,st)}},
    {label:'Stand',cls:'',fn:finish}],true,false);
}
function pitFight(poi,n){
  if(G.energy<20)return MENUS.casino(poi,n,'You are too tired to fight.');
  G.energy=clamp(G.energy-15,0,100);advance(90);
  const c=.35+(has('strong')?.2:0)+(G.energy/400);
  if(Math.random()<c){G.cash+=140;meterAdd('Neon Mile',1);facAdd('crew',2);return casinoSettle(poi,n,140,'You win by a split decision and a split lip. $140.')}
  G.cash=Math.max(0,G.cash-20);G.energy=clamp(G.energy-10,0,100);return casinoSettle(poi,n,-20,'You lose. They charge you $20 for the towel.');
}
