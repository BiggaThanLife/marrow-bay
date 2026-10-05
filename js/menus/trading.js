"use strict";
/* Marrow Bank: trading desk, investment loan, FLACK contract. */
function tradingMenu(poi,n,msg){
  const rows=SHARES.map(s=>{
    const h=G.mkt.hold[s.id]||0;
    return{label:`${s.n}: $${sharePrice(s.id).toFixed(1)}`,sub:h?`You hold ${h}, worth ${money(h*sharePrice(s.id))}${G.mkt.cost[s.id]?` (cost ${money(G.mkt.cost[s.id])})`:''}`:`${s.d}. You hold none.`,cls:'',fn:()=>shareMenu(poi,n,s.id)};
  });
  ui(`<h2>Trading desk</h2><p class="muted">Prices follow their district and the mood of Highline. Fee ${money(tradeFee())} a trade. Portfolio ${money(portfolio())}.</p>${G.arc&&G.arc.id==='bubble'?'<p class="amber">Everyone at the desk is talking at once.</p>':''}${msgP(msg)}`,[
    ...rows,{label:'Back',cls:'quiet',fn:()=>MENUS.bank(poi,n)}]);
}
function shareMenu(poi,n,id,msg){
  const s=SHARES.find(x=>x.id===id),p=sharePrice(id),h=G.mkt.hold[id]||0;
  const act=(f,q)=>()=>shareMenu(poi,n,id,f(id,q));
  ui(`<h2>${esc(s.n)}</h2><p class="muted">$${p.toFixed(1)} a share. You hold ${h}. ${s.d} district.</p>${msgP(msg)}`,[
    {label:'Buy 1',sub:money(p+tradeFee()),off:G.cash<p+tradeFee(),cls:'',fn:act(buyShare,1)},
    {label:'Buy 5',sub:money(p*5+tradeFee()),off:G.cash<p*5+tradeFee(),cls:'',fn:act(buyShare,5)},
    {label:'Buy 20',sub:money(p*20+tradeFee()),off:G.cash<p*20+tradeFee(),cls:'',fn:act(buyShare,20)},
    {label:'Sell 1',off:h<1,cls:'',fn:act(sellShare,1)},
    {label:`Sell all ${h}`,sub:h?money(h*p-tradeFee()):'',off:h<1,cls:'',fn:act(sellShare,h)},
    {label:'Back',cls:'quiet',fn:()=>tradingMenu(poi,n)}]);
}
function flackContractMenu(poi,n,msg){
  const has=fact('flack_contract_player'),ok=G.fac.trust>=5;
  ui(`<h2>FLACK installation contract</h2><p class="muted">${has?'You are a registered installer. $70 a week, and another camera each time.':'The Trust is hiring subcontractors to put up FLACK cameras. It pays well and the neighbors will not thank you.'}</p>${msgP(msg)}`,[
    ...(has?[{label:'Resign the contract',sub:'Stops the pay. Trust is disappointed.',cls:'warn',fn:()=>ask('Resign?','You lose the weekly pay and the Trust remembers it.','Resign',()=>{setFact('flack_contract_player',false);facAdd('trust',-4);flackAdd(-2);MENUS.bank(poi,n,'You hand back the lanyard.')},()=>flackContractMenu(poi,n))}]
      :[{label:'Bid for the contract',sub:ok?'$200 bid. Odds depend on your standing with the Trust and City Hall.':'Needs standing with the Trust (help them first)',off:!ok||G.cash<200,cls:'',fn:()=>{
        G.cash-=200;const c=.35+G.fac.trust/200+G.fac.hall/300;
        if(Math.random()<c){setFact('flack_contract_player');facAdd('union',-6);facAdd('crew',-6);flackAdd(2);return flackContractMenu(poi,n,'Contract won. They hand you a lanyard that says PARTNER.')}
        flackContractMenu(poi,n,'Lowest bid went to a company owned by a cousin.')}}]),
    {label:'Back',cls:'quiet',fn:()=>MENUS.bank(poi,n)}]);
}
