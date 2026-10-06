"use strict";
/* Community projects menu, business overview. */
function projects(){
  ui(`<h2>District projects</h2><p class="muted">The city funds these slowly on its own. Your help speeds them up.</p>`,
    [...G.projects.map(p=>{const d=PROJECTS.find(x=>x.id===p.id);return{label:d.name,sub:p.done?'Complete. '+d.desc:`${d.d}, ${projPct(p)}% funded. ${d.desc}`,cls:'',fn:()=>projectMenu(p)}}),{label:'Back',cls:'quiet',fn:town}]);
}
function projectMenu(p,msg){
  const d=PROJECTS.find(x=>x.id===p.id);
  const rows=Object.keys(d.need).map(k=>`<p>${k==='cash'?'Cash':NAMES[k]}: ${p.have[k]||0} of ${d.need[k]}</p>`).join('');
  const btns=p.done?[]:Object.keys(d.need).map(k=>{
    const def=d.need[k]-(p.have[k]||0),have=k==='cash'?G.cash:G.inv[k],give=Math.min(def,k==='cash'?Math.min(have,50):have);
    return{label:k==='cash'?`Give ${money(Math.max(0,give))}`:`Give ${Math.max(0,give)} ${NAMES[k]}`,sub:def<=0?'Fully supplied':give>0?`${def} still needed`:'You have none to give',off:give<=0||def<=0,
      fn:()=>{if(k==='cash')G.cash-=give;else G.inv[k]-=give;p.have[k]=(p.have[k]||0)+give;G.rep[d.d]=clamp(G.rep[d.d]+2,-100,100);advance(10);
        const fin=checkProject(p);projectMenu(p,fin?'The project is finished!':'Thank you. The district notices.')}};
  });
  ui(`<h2>${esc(d.name)}</h2><p class="muted">${d.d}. ${esc(d.desc)}</p>${msgP(msg)}<div class="meter"><i style="width:${projPct(p)}%"></i></div>${rows}${p.done?'<p class="good">Complete.</p>':''}`,
    [...btns,{label:'Back',cls:'quiet',fn:projects}]);
}
function bizOverview(){
  const lines=monthlyBills(),tot=lines.reduce((s,l)=>s+l[1],0);
  const nextBill=30-(day()-1)%30;
  const tills=G.biz.reduce((s,b)=>s+b.till,0)+G.structs.reduce((s,x)=>s+(x.stored||0),0)+shopTills();
  const vehs=Object.keys(G.veh.owned).filter(k=>G.veh.owned[k]).map(k=>`${VEH[k].n}${G.veh.stolen[k]?' (stolen)':''}`).join(', ')||'none';
  const btns=G.biz.map(b=>({label:`${b.type?BT[b.type].n:'Empty building'}, ${b.d}`,sub:b.type&&b.type!=='home'?`Till ${money(b.till)}, ${b.workers.length} staff${b.last?`, last day ${b.last.profit>=0?'+':''}${money(b.last.profit)}`:''}`:'Tap to manage',cls:'',fn:()=>bizMenu(b)}));
  btns.unshift({label:'Collect all tills',sub:money(tills),off:tills<=0,cls:'primary',fn:()=>{Object.values(G.shops).forEach(s=>{G.cash+=Math.max(0,s.till);s.till=Math.min(0,s.till)});G.biz.forEach(b=>{G.cash+=b.till;b.till=0});G.structs.forEach(s=>{if(s.stored){G.cash+=s.stored;s.stored=0}});advance(10);bizOverview()}});
  btns.push(...shopButtons());
  btns.push({label:'Close',cls:'quiet',fn:closeMenu});
  ui(`<h2>Properties and business</h2><div class="kv"><div><span>Buildings</span><b>${G.biz.length}</b></div><div><span>Vehicles</span><b>${esc(vehs)}</b></div>
  <div><span>Next bills</span><b>${money(tot)} in ${nextBill} d</b></div><div><span>Owed</span><b>${money(G.arrears)}</b></div></div>
  <p class="muted small">Tap a building on the map, or from here, to manage staff, supplies, and prices.</p>`,btns);
}
