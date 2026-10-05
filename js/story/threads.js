"use strict";
/* Thread engine and menus. */
function threadsHourly(){
  G.threads.active.slice().forEach(th=>{
    const T=THREADS[th.tid],B=T.beats[th.beat];
    if(!th.pending){
      if(G.t>=th.due){th.pending=true;th.since=day();notify(`New message: ${T.title}. Check Phone, then Threads.`);news(`New message in "${T.title}".`,1)}
    }else if(day()-th.since>=(B.timeout||3)){th.log.push('You did not respond.');advanceThread(th,B.ignore,false)}
  });
}
function threadsDaily(){
  const S=G.threads;
  if(S.active.length>=2||day()<4||day()-S.lastStart<5)return;
  const used=new Set([...S.active.map(t=>t.tid),...S.done.map(t=>t.tid)]);
  const c=Object.keys(THREADS).filter(id=>!used.has(id)&&THREADS[id].hook());
  if(!c.length)return;
  const id=pick(c),def=THREADS[id];
  S.active.push({tid:id,beat:'b1',due:G.t+60*ri(3,10),pending:false,since:0,log:[],roles:def.start?def.start():{}});
  S.lastStart=day();
}
function advanceThread(th,next,interactive){
  if(next.startsWith('END:'))return endThread(th,next.slice(4),interactive);
  th.beat=next;th.pending=false;th.due=G.t+(THREADS[th.tid].beats[next].wait||0)*1440;
  if(interactive)threadsMenu('Sent. The story waits for you, and the world does not.');
}
function endThread(th,key,interactive){
  const T=THREADS[th.tid],E=T.endings[key];
  const extra=(E.fx&&E.fx(th))||'';
  G.threads.active=G.threads.active.filter(x=>x!==th);
  G.threads.done.unshift({tid:th.tid,title:T.title,end:E.name,text:fmt(th,E.text),extra,harbor:E.harbor||'',day:day(),log:th.log});
  news(`Story ended: ${T.title}. ${E.name}.`,2);
  if(interactive)threadEnding(G.threads.done[0]);
  else notify(`${T.title} ended without you: ${E.name}.`);
}
function threadEnding(d){
  ui(`<h2>${esc(d.title)}</h2><p class="muted small">Ending: ${esc(d.end)} (day ${d.day})</p><p>${esc(d.text)}</p>${d.extra?`<p class="amber">${esc(d.extra)}</p>`:''}${d.harbor?`<p class="muted">${esc(d.harbor)}</p>`:''}
    ${d.log.length?`<p class="muted small">Your choices: ${d.log.map(esc).join(', then ')}.</p>`:''}`,[{label:'Back',cls:'quiet',fn:()=>threadsMenu()}]);
}
function threadBeat(th){
  const T=THREADS[th.tid],B=T.beats[th.beat];
  const btns=B.choices.map(c=>({label:c.label,sub:typeof c.sub==='function'?c.sub():c.sub,off:c.need?!c.need():false,cls:'',fn:()=>{
    if(c.fx)c.fx(th);th.log.push(c.label);advanceThread(th,c.next,true)}}));
  ui(`<h2>${esc(T.title)}</h2><p class="muted small">${esc(T.from)}</p><p>${esc(fmt(th,B.text))}</p><p class="muted small">Leave it ${B.timeout||3} days and it resolves without you.</p>`,[...btns,{label:'Back',cls:'quiet',fn:()=>threadsMenu()}]);
}
function threadsMenu(msg){
  const S=G.threads;
  ui(`<h2>Threads</h2><p class="muted">Stories that find you. Ignore them and they happen anyway.</p>${msgP(msg)}${S.active.length?'':'<p class="muted">Nothing is looking for you yet.</p>'}`,[
    ...S.active.map(th=>({label:THREADS[th.tid].title,sub:th.pending?'New message. Tap to read.':'Waiting for the next update',cls:th.pending?'primary':'',off:!th.pending,fn:()=>threadBeat(th)})),
    ...(S.done.length?[{label:'Past stories',sub:`${S.done.length} finished`,cls:'',fn:threadsPast}]:[]),
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
function threadsPast(){
  ui(`<h2>Past stories</h2>`,[...G.threads.done.map(d=>({label:d.title,sub:`${d.end}, day ${d.day}`,cls:'',fn:()=>threadEnding(d)})),{label:'Back',cls:'quiet',fn:()=>threadsMenu()}]);
}
