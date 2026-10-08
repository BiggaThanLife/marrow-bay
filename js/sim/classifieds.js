"use strict";
/* Marrowlist rules. G.cl holds: start (day the app opened), th (one state per thread), blocks (times you have been blocked),
   burnDay and burnIdx (new accounts: one a day, names in order), harbor (messages sent to HARBOR) and hlog (the last few).
   A thread state: node, fr (the seller's lost patience, 0 to 100+), log of [who, text, time], wait (a reply on its way: due, and either to or end),
   done (block, spotted, convert, deal or backfire), blocked, burns (new accounts used on it), persona (your current account name), unread. */
const clAd=id=>CL_ADS.find(a=>a.id===id);
/* two ads on the first day, one more each day after */
const clAds=()=>CL_ADS.slice(0,Math.min(CL_ADS.length,2+Math.max(0,day()-(G.cl.start||1))));
function clTh(id){if(!G.cl.th[id])G.cl.th[id]={node:'start',fr:0,log:[],wait:null,done:null,blocked:false,burns:0,persona:null,unread:false};return G.cl.th[id]}
const clSay=s=>String(s).replace(/\{name\}/g,G.name||'you');
function clNode(ad,th){return th.node==='start'?ad.start:th.node==='again'?ad.again:ad.nodes[th.node]}
/* the replies you can send right now */
function clReplies(id){const ad=clAd(id),th=clTh(id);if(th.done||th.wait||th.blocked)return[];const n=clNode(ad,th);return n?n.r:[]}
/* replies take a while: half an hour to an hour of game time */
const clDelay=th=>30+(th.log.length*23)%40;
function clSend(id,i){
  const ad=clAd(id),th=clTh(id),r=clReplies(id)[i];if(!r)return '';
  if(r.price){if(G.cash<r.price)return `You need ${money(r.price)}.`;G.cash-=r.price}
  th.log.push(['me',r.t,G.t]);th.fr=Math.max(0,th.fr+(r.f||0));
  const due=G.t+clDelay(th);
  if(r.end)th.wait={due,end:r.end,s:r.s};
  else if(th.fr>=100)th.wait={due,end:'block',s:'That is it. You are blocked.'};
  else th.wait={due,to:r.to};
  return `Sent. ${ad.seller} will reply soon.`;
}
/* deliver every reply that is due */
function clDeliver(){
  if(!G||!G.cl)return 0;let n=0;
  for(const id in G.cl.th){
    const th=G.cl.th[id],w=th.wait,ad=clAd(id);if(!w||!ad||G.t<w.due)continue;
    th.wait=null;th.unread=true;n++;
    if(w.to){th.node=w.to;th.log.push(['them',clSay(clNode(ad,th).s),w.due])}
    else{th.log.push(['them',clSay(w.s),w.due]);clEnd(ad,th,w.end)}
    notify(`Marrowlist: ${ad.seller} replied.`);
  }
  return n;
}
function clGive(g){
  if(!g)return;
  if(g.cash)G.cash+=g.cash;
  if(g.inv)for(const k in g.inv)G.inv[k]=(G.inv[k]||0)+g.inv[k];
  if(g.decor){if(G.decor[g.decor])clGive(g.alt);else G.decor[g.decor]=true}
  if(g.veh){if(G.veh.owned[g.veh])clGive(g.alt);else{G.veh.owned[g.veh]=true;G.veh.fuel[g.veh]=100}}
}
function clBw(dist,t){feedAdd({kind:'event',dist,t})}
function clEnd(ad,th,type){
  const npc=ad.npc&&NPC[ad.npc];
  if(type==='block'||type==='spot'){th.blocked=true;th.done=type==='spot'?'spotted':'block';G.cl.blocks=(G.cl.blocks||0)+1;if(type==='block')clBw(ad.d,ad.bw);return}
  th.done=type;
  if(type==='deal')clGive(ad.give);
  else if(type==='convert'){if(npc)npcS(npc).m+=10;else G.rep[ad.d]=clamp((G.rep[ad.d]||0)+3,-100,100);clGive(ad.convertGive)}
  else if(type==='backfire'){if(npc)npcS(npc).m-=12;addRumor('crank',ad.knows||(ad.npc?[ad.npc]:[]));clBw(ad.d,`Heads up: someone called ${G.name} has been sending strange messages about ads in the ${ad.d}. Do not engage.`)}
}
/* a fresh account after being blocked: one a day. On your second new account for the same thread, they catch you. */
function clNewAccount(id){
  const ad=clAd(id),th=clTh(id);
  if(th.done!=='block')return '';
  if(G.cl.burnDay===day())return 'HARBOR only allows one new account a day. It is for your own good, apparently.';
  G.cl.burnDay=day();th.burns++;
  const name=CL_BURNERS[(G.cl.burnIdx++)%CL_BURNERS.length];
  th.persona=name;th.blocked=false;th.done=null;th.fr=30;
  th.log.push(['new',name,G.t]);th.log.push(['me',`Hello! Is the ${ad.item.toLowerCase()} still available?`,G.t]);
  th.wait=th.burns>=2?{due:G.t+clDelay(th),end:'spot',s:ad.spot}:{due:G.t+clDelay(th),to:'again'};
  return `You are now ${name}.`;
}
const clUnread=()=>G.cl?Object.values(G.cl.th).filter(t=>t.unread).length:0;
/* HARBOR's support line only ever answers with an out-of-office reply, and they get stranger */
function clHarbor(){
  const i=G.cl.harbor||0,send=CL_HARBOR_SEND[i%CL_HARBOR_SEND.length],auto=CL_HARBOR_AUTO[i%CL_HARBOR_AUTO.length];
  G.cl.harbor=i+1;G.cl.hlog=(G.cl.hlog||[]).concat([[send,auto,G.t]]).slice(-4);
  return auto;
}
function clHourly(){clDeliver()}
