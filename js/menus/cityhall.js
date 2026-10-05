"use strict";
/* City Hall: council session, lobbying, election desk, mayor's office. */
MENUS.cityhall=(poi,n,msg)=>{
  const C=G.council,cur=C.cur,P=cur&&PROPOSALS.find(p=>p.id===cur.id);
  const mayor=fact('mayor')==='player';
  const rows=P?COUNCIL.map(m=>`<div><span>${esc(NPC[m].name)}</span><b>${councilVote(P,m)>0?'Yes':'No'}</b></div>`).join(''):'';
  const hist=C.hist.slice(0,4).map(h=>`<p class="small muted">Day ${h.day}: ${h.pass?'Passed':'Rejected'}${h.how!=='vote'?` (${h.how})`:''}: ${esc(h.title)}</p>`).join('');
  const election=G.arc&&G.arc.id==='mayor';
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">The mayor is <b>${esc(mayorName())}</b>. The council has five seats and a very comfortable room.</p>${msgP(msg)}
    ${P?`<p><b>On the table:</b> ${esc(P.title)}. Vote on day ${cur.vote}. ${councilYes(P)>=3?'Right now it passes':'Right now it fails'} (${councilYes(P)} to ${5-councilYes(P)}).</p><div class="kv">${rows}</div>`:'<p class="muted">The agenda is empty. Somebody is typing a motion.</p>'}${hist}`,[
    ...(P?COUNCIL.map(m=>({label:`Lobby ${NPC[m].name}`,sub:cur.lobbied>=2?'You have used both of your lunches this week':'$40 and a lunch. Costs standing if it fails.',off:cur.lobbied>=2,cls:'',fn:()=>lobbyMenu(poi,n,m)})):[]),
    ...(election?[{label:'Election desk',sub:'Candidates, endorsements, registration',cls:'primary',fn:()=>arcMenu()}]:[]),
    ...(mayor&&P?mayorPowers(poi,n,P):[]),
    leaveBtn]);
};
function lobbyMenu(poi,n,m){
  const C=G.council,P=PROPOSALS.find(p=>p.id===C.cur.id);
  ui(`<h2>Lobby ${esc(NPC[m].name)}</h2><p class="muted">Motion: ${esc(P.title)}. They currently vote ${councilVote(P,m)>0?'yes':'no'}.</p>`,[
    {label:'Ask for a yes',sub:councilVote(P,m)>0?'They already say yes':'$40',off:councilVote(P,m)>0||G.cash<40,cls:'',fn:()=>MENUS.cityhall(poi,n,lobby(m,1))},
    {label:'Ask for a no',sub:councilVote(P,m)<0?'They already say no':'$40',off:councilVote(P,m)<0||G.cash<40,cls:'',fn:()=>MENUS.cityhall(poi,n,lobby(m,-1))},
    {label:'Back',cls:'quiet',fn:()=>MENUS.cityhall(poi,n)}]);
}
function mayorPowers(poi,n,P){
  const ready=day()-G.council.vetoDay>=14,passing=councilYes(P)>=3,C=G.council;
  return [{label:passing?'Veto this motion':'Sign it by decree',sub:ready?'Once every 14 days':`Ready in ${14-(day()-C.vetoDay)} days`,off:!ready||C.cur.forced!==null,cls:'',fn:()=>{
    C.cur.forced=!passing;C.vetoDay=day();MENUS.cityhall(poi,n,passing?'You veto it. Councillors pretend to be surprised.':'You sign it. Councillors pretend to be shocked.')}}];
}
