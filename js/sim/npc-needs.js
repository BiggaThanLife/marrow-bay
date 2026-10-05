"use strict";
/* NPC eating and buying. */
function npcEat(n,s){
  const pm=mealPrice(),tr=tier(att(n)),pat=n.d==='Highline'?1.15:1;
  let best=null;
  G.structs.forEach(st=>{
    if(st.type!=='stall')return;
    const rng=signNear(st)?26:13;if(Math.hypot(st.x-n.x,st.y-n.y)>rng)return;
    ['meals','smoked','fish','crops'].forEach(k=>{
      if(!(st.stock[k]>0))return;
      const pr=Math.round(FAIR[k]*MK[st.mk]),max=FAIR[k]*(.95+.12*tr)*pat;
      if(tr<1||pr>max||pr>s.cash)return;
      const eff=pr/HUNG[k];if(!best||eff<best.eff)best={st,k,pr,eff};
    });
  });
  if(best&&(best.eff<=pm/45*1.15||tr>=2)){
    best.st.stock[best.k]--;best.st.stored+=best.pr;best.st.earned+=best.pr;
    s.cash-=best.pr;s.hunger=Math.min(100,s.hunger+HUNG[best.k]);
    if(best.st.earned>=100&&!G.flags.succRum){G.flags.succRum=1;addRumor('successful',[n.id])}
  }else if(s.cash>=pm){s.cash-=pm;s.hunger=Math.min(100,s.hunger+45);G.demand+=1}
  else if(s.cash>=5){s.cash-=5;s.hunger=Math.min(100,s.hunger+15)}
}
function npcBuyTrinket(n,s){
  const tr=tier(att(n));if(tr<1)return;
  const st=G.structs.find(x=>x.type==='stall'&&x.stock.trinkets>0&&Math.hypot(x.x-n.x,x.y-n.y)<=(signNear(x)?26:13));
  if(!st)return;
  const pr=Math.round(FAIR.trinkets*MK[st.mk]);
  if(pr>FAIR.trinkets*(.95+.12*tr)*1.15||pr>s.cash)return;
  st.stock.trinkets--;st.stored+=pr;st.earned+=pr;s.cash-=pr;
}
