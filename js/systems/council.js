"use strict";
/* Weekly council votes, lobbying, mayor powers. Five seats; majority decides. */
function councilDaily(){
  const C=G.council;
  if(C.cur&&day()>=C.cur.vote)resolveProposal();
  else if(!C.cur&&day()>=3&&day()-C.last>=1)tableProposal();
  if(fact('mayor')==='player'&&day()%7===0){G.cash+=250;news("The city pays you a mayor's salary: $250.",1)}
}
function tableProposal(){
  const C=G.council;
  const pool=PROPOSALS.filter(p=>p.can()&&!C.hist.some(h=>h.id===p.id&&day()-h.day<35));
  if(!pool.length)return;
  const p=pick(pool);
  C.cur={id:p.id,vote:day()+6,sway:{},lobbied:0,forced:null};
  news(`Council tables a motion: ${p.title}. The vote is on day ${C.cur.vote}.`,1);
}
const councilVote=(P,mid)=>{const s=G.council.cur.sway[mid];return s!==undefined?s:P.votes[mid]};
function councilYes(P){return COUNCIL.filter(m=>councilVote(P,m)>0).length}
function lobby(mid,dir){
  const C=G.council,P=PROPOSALS.find(p=>p.id===C.cur.id),n=NPC[mid];
  if(G.cash<40)return 'You cannot afford the lunch.';
  G.cash-=40;C.cur.lobbied++;advance(30);
  const chance=.4+tier(att(n))*.12+(G.companion==='ashgrove'?.1:0);
  if(Math.random()<chance){C.cur.sway[mid]=dir;memAdd(mid,2);return `${n.name} will vote ${dir>0?'yes':'no'}. The lunch was excellent, they say.`}
  memAdd(mid,-6);return `${n.name} takes the lunch and keeps the vote. Word gets around.`;
}
function resolveProposal(){
  const C=G.council,P=PROPOSALS.find(p=>p.id===C.cur.id);
  const yes=C.cur.forced!==null?C.cur.forced:councilYes(P)>=3;
  const r=(yes?P.yes():P.no())||'';
  setFact('law_'+P.id,yes?'yes':'no');
  C.hist.unshift({id:P.id,title:P.title,pass:yes,day:day(),how:C.cur.forced!==null?(yes?'decree':'veto'):'vote'});
  if(C.hist.length>30)C.hist.length=30;
  news(`${yes?'Council passes':'Council rejects'}: ${P.title}. ${r}`,2);
  notify(`${yes?'Passed':'Rejected'}: ${P.title}`);
  C.cur=null;C.last=day();
}
