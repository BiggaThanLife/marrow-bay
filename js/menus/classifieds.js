"use strict";
/* Phone > Marrowlist: classified ads you can answer, laid out like an email chain. Rules are in js/sim/classifieds.js, threads in js/data/classifieds.js. */
const CL_END_N={block:'Blocked',spotted:'Blocked for good',convert:'Made a friend',deal:'Deal done',backfire:'Backfired'};
const clStamp=t=>{const d=Math.floor(t/1440)+1,h=Math.floor(t/60)%24,m=Math.floor(t%60);return `Day ${d}, ${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'am':'pm'}`};
const clPatience=fr=>fr<25?'calm':fr<50?'a little tense':fr<75?'fed up':'about to snap';
const clFinishedIds=()=>clAds().filter(a=>G.cl.th[a.id]&&G.cl.th[a.id].done&&G.cl.th[a.id].done!=='block').map(a=>a.id);
function marrowlist(msg){
  clDeliver();
  const ads=clAds(),open=ads.filter(a=>{const th=clTh(a.id);return !th.done||th.done==='block'}),fin=clFinishedIds();
  const st=a=>{const th=clTh(a.id);if(!th.log.length)return 'New ad';if(th.done==='block')return th.burns>=2?'Blocked for good':'Blocked';if(th.wait)return `${a.seller} is typing...`;return th.unread?'New reply':'Your turn'};
  ui(`<h2>Marrowlist</h2><p class="muted">Buy, sell, regret. New ads go up every day.</p>${msgP(msg)}${open.length?'':'<p>Nothing new today. Check back tomorrow.</p>'}`,[
    ...open.map(a=>({label:`${a.item}, ${a.price}`,sub:`${a.seller}, ${a.d}. ${st(a)}`,cls:clTh(a.id).unread?'primary':'',fn:()=>clThreadMenu(a.id)})),
    {label:'HARBOR support',sub:'Message the city’s helpful system',cls:'',fn:()=>clHarborMenu()},
    ...(fin.length?[{label:`Finished threads (${fin.length})`,sub:'Read them again',cls:'quiet',fn:()=>clFinished()}]:[]),
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
/* the ad, then every message so far, newest last */
function clThreadHtml(ad,th){
  let who=G.name;
  const msgs=th.log.map(([w,t,tm])=>{
    if(w==='new'){who=t;return `<p class="small muted">— New account: <b>${esc(t)}</b> —</p>`}
    const from=w==='me'?who:ad.seller,to=w==='me'?ad.seller:who;
    return `<div class="cl-msg ${w}"><div class="small muted">From ${esc(from)} to ${esc(to)} · ${clStamp(tm)}</div><div>${esc(t)}</div></div>`;
  }).join('');
  return `<div class="cl-ad"><b>${esc(ad.item)}</b> · ${esc(ad.price)}<br>${esc(ad.ad)}<br><span class="small muted">${esc(ad.seller)}, ${esc(ad.d)}, ***-****</span></div>${msgs}`;
}
function clThreadMenu(id,msg){
  clDeliver();
  const ad=clAd(id),th=clTh(id);th.unread=false;
  let status='';
  if(th.wait)status=`<p class="small amber">${esc(ad.seller)} is typing...</p>`;
  else if(th.done==='block')status=`<p class="small bad">${esc(ad.seller)} blocked ${esc(th.persona||'you')}.${th.burns>=2?'':' You could always come back as somebody else.'}</p>`;
  else if(th.done==='spotted')status=`<p class="small bad">${esc(ad.seller)} has blocked every version of you.</p>`;
  else if(th.done==='deal')status=`<p class="small good">${esc(ad.dealTxt)}</p>`;
  else if(th.done==='convert')status=`<p class="small good">${esc(ad.seller)} thinks you are wonderful now. Nobody is sure why.</p>`;
  else if(th.done==='backfire')status=`<p class="small bad">Word is getting around about you.</p>`;
  else if(th.log.length)status=`<p class="small muted">${esc(ad.seller)} seems ${clPatience(th.fr)}.</p>`;
  const reps=clReplies(id);
  ui(`<h2>${esc(ad.item)}</h2>${clThreadHtml(ad,th)}${status}${msgP(msg)}`,[
    ...reps.map((r,i)=>({label:r.t,sub:r.price?`Pay ${money(r.price)}`:'',off:r.price&&G.cash<r.price,cls:'',fn:()=>clThreadMenu(id,clSend(id,i))})),
    ...(th.wait?[{label:'Wait for a reply',sub:'Let some time pass',cls:'',fn:()=>{advance(Math.max(5,th.wait.due-G.t));clThreadMenu(id)}}]:[]),
    ...(th.done==='block'&&th.burns<2?[{label:'Make a new account',sub:G.cl.burnDay===day()?'One new account a day. Try tomorrow.':'Come back as somebody else',off:G.cl.burnDay===day(),cls:'warn',fn:()=>clThreadMenu(id,clNewAccount(id))}]:[]),
    {label:'Back',cls:'quiet',fn:()=>marrowlist()}]);
  /* open at the newest message so the replies are in reach */
  const sh=document.getElementById('sheet');if(sh&&th.log.length>2)sh.scrollTop=sh.scrollHeight;
}
function clFinished(){
  ui(`<h2>Finished threads</h2><p class="muted">Every conversation you have ended, one way or another.</p>`,[
    ...clFinishedIds().map(id=>{const a=clAd(id);return{label:`${a.item}`,sub:`${a.seller}. ${CL_END_N[clTh(id).done]}`,cls:'',fn:()=>clThreadMenu(id)}}),
    {label:'Back',cls:'quiet',fn:()=>marrowlist()}]);
}
function clHarborMenu(){
  const h=G.cl.hlog||[];
  ui(`<h2>HARBOR support</h2><p class="muted">Messages are answered by HARBOR, the city's tide and traffic system. Usually instantly. Never helpfully.</p>${h.map(([s,a,t])=>`<div class="cl-msg me"><div class="small muted">From ${esc(G.name)} to HARBOR · ${clStamp(t)}</div><div>${esc(s)}</div></div><div class="cl-msg them"><div class="small muted">From HARBOR (automatic reply)</div><div>${esc(a)}</div></div>`).join('')}`,[
    {label:'Send a message',sub:'HARBOR answers right away',cls:'',fn:()=>{clHarbor();clHarborMenu()}},
    {label:'Back',cls:'quiet',fn:()=>marrowlist()}]);
}
