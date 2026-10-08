"use strict";
/* Landlord menus: tenants, applicants, problems, property manager. Shown from a rental building's menu and the phone. */
function landlordButtons(biz){
  const free=rentalUnits(biz)-biz.tenants.length;
  return[
    {label:`Tenants (${biz.tenants.length}/${rentalUnits(biz)})`,sub:free?`${free} flat${free===1?'':'s'} empty`:'Fully let',cls:'',fn:()=>tenantsMenu(biz)},
    {label:`Applicants (${biz.applicants.length})`,sub:biz.applicants.length?'People want to move in':'Nobody is asking right now',off:!biz.applicants.length,cls:biz.applicants.length?'primary':'',fn:()=>applicantsMenu(biz)},
    {label:`Problems (${biz.issues.length})`,badge:biz.issues.length,sub:biz.issues.length?'Tenants are waiting on you':'All quiet',off:!biz.issues.length,cls:biz.issues.length?'primary':'',fn:()=>issuesMenu(biz)},
    {label:`Property manager: ${biz.manager?'On':'Off'}`,sub:'Takes 10% of rent. Fills empty flats and pays routine repairs. You still handle rent trouble.',cls:'',fn:()=>{biz.manager=!biz.manager;bizMenu(biz,biz.manager?'A manager now runs the day to day.':'You run the building yourself again.')}}
  ];
}
function tenantsMenu(biz,msg){
  ensureRental(biz);
  ui(`<h2>Tenants, ${biz.d}</h2><p class="muted">Rent is paid daily into the till. Happy tenants stay and keep the neighbourhood sweet on you.</p>${msgP(msg)}${biz.tenants.length?'':'<p>No tenants yet.</p>'}`,[
    ...biz.tenants.map(t=>({label:`${t.name}, ${t.job}`,sub:`${money(tenantRent(biz,t))} a day. ${moodWord(t.mood)}${biz.issues.some(i=>i.t===t.id)?'. Has a problem':''}`,cls:'',fn:()=>tenantMenu(biz,t)})),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
function tenantMenu(biz,t,msg){
  const tr=T_TRAITS[t.trait],talked=t.chat===day();
  ui(`<h2>${esc(t.name)}</h2><p class="muted">${esc(t.job)}. Has lived here ${Math.max(0,day()-t.since)} days.</p><p>${esc(t.name.split(' ')[0])} ${esc(t.bio)}</p>${msgP(msg)}
  <div class="kv"><div><span>Rent</span><b>${money(tenantRent(biz,t))} a day</b></div><div><span>Mood</span><b>${moodWord(t.mood)}</b></div><div><span>Nature</span><b>${tr.n}</b></div><div><span>Owes</span><b>${money(t.owed)}</b></div></div>`,[
    {label:'Have a chat',sub:talked?'You already talked today':'A little goodwill goes a long way',off:talked,fn:()=>{
      t.chat=day();t.mood=Math.min(100,t.mood+3);advance(10);
      let line=pick(tr.chat);if(t.mood<30)line=pick(T_GRIPE);
      if(t.trait==='nosy'&&Math.random()<.7)line+=` "${pick(worldLines())}"`;
      tenantMenu(biz,t,line)}},
    {label:'Ask them to leave',sub:'Costs $30 and the neighbours notice',cls:'warn',off:G.cash<30,fn:()=>ask(`Evict ${t.name}?`,'It costs $30 and your standing in the district dips.','Yes, evict',()=>{G.cash-=30;evictTenant(biz,t,'evict');tenantsMenu(biz,`${t.name} is gone.`)},()=>tenantMenu(biz,t))},
    {label:'Back',cls:'quiet',fn:()=>tenantsMenu(biz)}]);sceneCtx({look:tenantScLook(t)});
}
function applicantsMenu(biz,msg){
  ui(`<h2>Applicants</h2><p class="muted">You only get what they tell you at the door. Who they really are comes out after they move in.</p>${msgP(msg)}`,[
    ...biz.applicants.map(a=>({label:`${a.name}, ${a.job}`,sub:`Could pay about ${money(tenantRent(biz,a))} a day`,cls:'',fn:()=>applicantMenu(biz,a)})),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
function applicantMenu(biz,a){
  const full=biz.tenants.length>=rentalUnits(biz);
  ui(`<h2>${esc(a.name)}</h2><p class="muted">${esc(a.job)}</p><p>${esc(a.name.split(' ')[0])} ${esc(a.bio)}</p><p class="amber">${esc(T_TRAITS[a.trait].hint)}</p>`,[
    {label:'Let them move in',sub:full?'No empty flats':`About ${money(tenantRent(biz,a))} a day`,off:full,fn:()=>{moveIn(biz,a);quip('hire');applicantsMenu(biz,`${a.name} moves in.`)}},
    {label:'Turn them down',cls:'quiet',fn:()=>{biz.applicants=biz.applicants.filter(x=>x!==a);applicantsMenu(biz,'You turn them down politely.')}},
    {label:'Back',cls:'quiet',fn:()=>applicantsMenu(biz)}]);
}
function issuesMenu(biz,msg){
  ui(`<h2>Problems</h2><p class="muted">Unfixed problems wear down a tenant's mood each day.</p>${msgP(msg)}${biz.issues.length?'':'<p>Nothing needs you.</p>'}`,[
    ...biz.issues.map(i=>{const t=tenantOf(biz,i.t);return{label:`${T_ISSUES[i.k].n}: ${t?t.name:'Unknown'}`,sub:`${Math.max(0,day()-i.d)} days open`,cls:'',fn:()=>issueMenu(biz,i)}}),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
function closeIssue(biz,i){biz.issues=biz.issues.filter(x=>x!==i)}
function issueMenu(biz,i,msg){
  const t=tenantOf(biz,i.t),def=T_ISSUES[i.k];
  if(!t){closeIssue(biz,i);return issuesMenu(biz)}
  const back=m=>issuesMenu(biz,m),btns=[];
  const head=`<h2>${def.n}</h2><p class="muted">${esc(t.name)}, ${esc(t.job)}.</p><p>${esc(def.text)}</p>${msgP(msg)}`;
  if(i.k==='leak'||i.k==='heat'||i.k==='pests'||i.k==='fire'){
    btns.push({label:'Hire a repairer',sub:`${money(def.cost)}`,off:G.cash<def.cost,fn:()=>{G.cash-=def.cost;t.mood=Math.min(100,t.mood+5);closeIssue(biz,i);advance(20);back('Fixed. They are grateful.')}});
    if(def.parts)btns.push({label:'Fix it yourself',sub:`${def.parts} part${def.parts>1?'s':''} and some energy. You have ${G.inv.parts}.`,off:G.inv.parts<def.parts||G.energy<12,cls:'',fn:()=>{G.inv.parts-=def.parts;G.energy=clamp(G.energy-8,0,100);t.mood=Math.min(100,t.mood+6);closeIssue(biz,i);advance(90);back('You fixed it yourself.')}});
  }else if(i.k==='noise'){
    btns.push({label:'Talk to them',sub:'Free. It might work.',fn:()=>{advance(10);if(Math.random()<.6){t.mood-=1;closeIssue(biz,i);back('They promise to keep it down, and mostly do.')}else issueMenu(biz,i,'They nod and carry on as before.')}});
    btns.push({label:'Formal warning',sub:'Settles it, but they will not like it',cls:'',fn:()=>{t.mood-=8;closeIssue(biz,i);advance(10);back('A written warning goes on the door. The noise stops.')}});
  }else if(i.k==='late'){
    btns.push({label:'Waive what they owe',sub:`Forgive ${money(t.owed)}. Goodwill in the district.`,fn:()=>{t.owed=0;t.mood=Math.min(100,t.mood+10);G.rep[biz.d]=clamp(G.rep[biz.d]+1,-100,100);addRumor('softLandlord',knowersNear(biz.d,2),{dist:biz.d});closeIssue(biz,i);back('You wave it off. They look relieved.')}});
    btns.push({label:'Payment plan',sub:`Take half now (${money(t.owed/2)}), forgive the rest`,cls:'',fn:()=>{biz.till+=Math.round(t.owed/2);t.owed=0;t.mood=Math.min(100,t.mood+2);closeIssue(biz,i);back('They pay what they can.')}});
    btns.push({label:'Evict',sub:'$30. The neighbours notice',cls:'warn',off:G.cash<30,fn:()=>ask(`Evict ${t.name}?`,'It costs $30 and your standing in the district dips.','Yes, evict',()=>{G.cash-=30;evictTenant(biz,t,'evict');back(`${t.name} is gone.`)},()=>issueMenu(biz,i))});
  }else if(i.k==='secret'){
    btns.push({label:'Look the other way',sub:'They will not forget it. Might draw attention.',fn:()=>{t.mood=Math.min(100,t.mood+6);if(Math.random()<.35)G.heat=Math.max(G.heat,1);closeIssue(biz,i);back('You say you saw nothing.')}});
    btns.push({label:'Help the visitors',sub:'Good with the Grid. The tenant will resent it.',cls:'',fn:()=>{t.mood-=12;G.rep.Grid=clamp(G.rep.Grid+2,-100,100);closeIssue(biz,i);back('You answer their questions. The tenant hears about it.')}});
  }
  ui(head,[...btns,{label:'Back',cls:'quiet',fn:()=>issuesMenu(biz)}]);sceneCtx({look:tenantScLook(t)});
}
function tenantsOverview(){
  const rs=G.biz.filter(b=>b.type==='rental');rs.forEach(ensureRental);
  const issues=rs.reduce((s,b)=>s+b.issues.length,0),apps=rs.reduce((s,b)=>s+b.applicants.length,0);
  ui(`<h2>Tenants</h2><p class="muted">${apps} applicant${apps===1?'':'s'}, ${issues} open problem${issues===1?'':'s'} across your buildings.</p>`,[
    ...rs.map(b=>({label:`Apartments, ${b.d}`,sub:`${b.tenants.length}/${rentalUnits(b)} let, ${b.issues.length} problem${b.issues.length===1?'':'s'}, ${b.applicants.length} applicant${b.applicants.length===1?'':'s'}`,badge:b.issues.length,cls:b.issues.length||b.applicants.length?'primary':'',fn:()=>bizMenu(b)})),
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
