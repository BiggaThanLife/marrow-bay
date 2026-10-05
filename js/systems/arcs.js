"use strict";
/* Arc engine: one city arc at a time. Phases last N days, each can offer actions, the last decides an outcome that writes permanent facts. */
const arcPower=n=>{if(G.arc)G.arc.power=clamp(G.arc.power+n,0,100)};
const arcOnce=(A,key)=>{A.did=A.did||{};if(A.did[key]===true||A.did[key]===day())return false;return true};
const arcMark=(A,key,forever)=>{A.did=A.did||{};A.did[key]=forever?true:day()};
function arcsDaily(){
  if(G.arc){
    const A=G.arc,D=ARCS[A.id],ph=D.phases[A.i];
    if(ph.daily)ph.daily(A);
    if(day()-A.start>=ph.days){
      if(A.i+1<D.phases.length){A.i++;A.start=day();const nx=D.phases[A.i];nx.enter&&nx.enter(A)}
      else resolveArc();
    }
    return;
  }
  if(day()<10||day()-(G.arcLast||0)<8)return;
  const c=Object.keys(ARCS).filter(id=>!G.arcsDone.some(a=>a.id===id)&&ARCS[id].can());
  if(c.length&&Math.random()<.3)startArc(pick(c));
}
function startArc(id){
  const D=ARCS[id];
  G.arc={id,i:0,start:day(),power:50,stance:null,did:{}};
  D.phases[0].enter&&D.phases[0].enter(G.arc);
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
