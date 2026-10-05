"use strict";
/* Arc engine: one city arc at a time. Phases last N days, each can offer actions, the last decides an outcome that writes permanent facts. */
const arcPower=n=>{if(G.arc)G.arc.power=clamp(G.arc.power+n,0,100)};
const arcOnce=(A,key)=>{A.did=A.did||{};if(A.did[key]===true||A.did[key]===day())return false;return true};
const arcMark=(A,key,forever)=>{A.did=A.did||{};A.did[key]=forever?true:day()};
const engageAdd=(d,n)=>{G.engage[d]=(G.engage[d]||0)+n};
const arcDone=id=>G.arcsDone.some(a=>a.id===id&&!(ARCS[id].repeatAfter&&day()-a.day>=ARCS[id].repeatAfter));
function arcsDaily(){
  G.biz.forEach(b=>{if(b.type&&b.type!=='home')engageAdd(b.d,.5)});
  if(G.arc){
    const A=G.arc,D=ARCS[A.id],ph=D.phases[A.i];
    if(ph.daily)ph.daily(A);
    if(day()-A.start>=ph.days){
      if(A.i+1<D.phases.length){A.i++;A.start=day();const nx=D.phases[A.i];nx.enter&&nx.enter(A);popup(`${D.title}: ${nx.name}`,nx.blurb||'')}
      else resolveArc();
    }
    return;
  }
  if(day()<10||day()-(G.arcLast||0)<8)return;
  const c=Object.keys(ARCS).filter(id=>!ARCS[id].hook&&!arcDone(id)&&ARCS[id].can());
  if(c.length&&Math.random()<.3)startArc(pick(c));
}
function startArc(id){
  const D=ARCS[id];
  G.arc={id,i:0,start:day(),power:50,stance:null,did:{}};
  D.phases[0].enter&&D.phases[0].enter(G.arc);
  popup(D.title,(D.phases[0].blurb||'')+' Check your phone for what you can do.');
}
function resolveArc(){
  const A=G.arc,D=ARCS[A.id],key=D.resolve(A),out=D.outcomes[key];
  const extra=(out.fx&&out.fx(A))||'';
  setFact('arc_'+A.id,key);
  G.arcsDone.unshift({id:A.id,title:D.title,out:key,name:out.name,text:out.text,day:day()});
  G.arcLast=day();G.arc=null;
  news(`${D.title}: ${out.name}. ${out.text}`,3);
  alertQ.push({sev:3,name:`${D.title}: ${out.name}`,desc:out.text,extra:[extra,out.harbor].filter(Boolean).join(' ')});
}
function arcSummaryHtml(){
  let h='';
  if(G.arc){const D=ARCS[G.arc.id],ph=D.phases[G.arc.i];h+=`<h2>Right now</h2><p><b>${esc(D.title)}</b>: ${esc(ph.name)}. ${esc(ph.blurb||'')}</p>`}
  if(G.arcsDone.length)h+=`<h2>What changed</h2>`+G.arcsDone.map(a=>`<p class="small"><b>${esc(a.title)}</b> (day ${a.day}): ${esc(a.name)}. ${esc(a.text)}</p>`).join('');
  return h;
}
function arcMenu(msg){
  const A=G.arc;if(!A)return phone();
  const D=ARCS[A.id],ph=D.phases[A.i],left=Math.max(0,ph.days-(day()-A.start));
  ui(`<h2>${esc(D.title)}</h2><p class="muted">${esc(ph.name)}, about ${left} day${left===1?'':'s'} left in this phase. ${esc(ph.blurb||'')}</p>${msgP(msg)}<p class="small muted">${esc(D.status(A))}</p>`,[
    ...(ph.actions?ph.actions(A).map(a=>({label:a.label,sub:a.sub,off:a.off,cls:a.cls||'',fn:()=>{const r=a.fn(A);arcMenu(r)}})):[]),
    {label:'Back',cls:'quiet',fn:()=>phone()},leaveBtn]);
}

/* Story hook: once you have dealt with enough businesses in a district, someone there brings the arc to you. */
function arcHook(poi){
  if(poi.id===G.home)return false;
  for(const id of Object.keys(ARCS)){
    const D=ARCS[id],H=D.hook;
    if(!H||D.district!==poi.d||day()<H.min||(G.engage[D.district]||0)<H.need||arcDone(id)||(G.hookCool[id]||0)>day()||!D.can())continue;
    const who=NPC[H.who];
    if(G.arc){
      if(G.hookBusy[id]===day())return false;
      G.hookBusy[id]=day();
      ui(`<h2>${esc(who.name)}</h2><p>${esc(who.name)} glances at you, then away. "I will not talk about that until ${esc(ARCS[G.arc.id].title.replace(/^The /,'the '))} has concluded. Ask me after."</p>`,[{label:'Understood',fn:closeMenu}],true,false);
      return true;
    }
    ui(`<h2>${esc(who.name)}</h2><p>${esc(H.text.replace('{name}',G.name))}</p>`,[
      {label:H.yes,cls:'primary',fn:()=>{closeMenu();startArc(id)}},
      {label:H.no,cls:'quiet',fn:()=>{G.hookCool[id]=day()+4;closeMenu()}}],true,false);
    return true;
  }
  return false;
}
