"use strict";
/* Street conversations: tapping a person shows a speech bubble over their head and a few reply chips, instead of the full-screen talk menu.
   Chips call the very same button functions talk() uses (talkBtnList in talk.js), so effects are identical. talk(n,text) called while a conversation is open
   is intercepted by bubIntercept and shown as the next bubble; talk(n,'',true) or the "More..." chip opens the old menu. Story code that calls talk() directly still gets the menu. */
let BUB=null; /* {n, full, shown, line, t0, last, mode:'main'|'give', meUntil} */
let BUB_IDLE_MS=30000;const BUB_CPS=45, BUB_REACH=2;
const bubActive=n=>!!BUB&&(!n||BUB.n===n);
function bubNpcPos(n){
  if(G&&G.companion===n.id&&typeof compTrail!=='undefined'){const c=compTrail.length>=8?compTrail[0]:[G.p.x-.9,G.p.y+.1];return [c[0],c[1]]}
  return [n.x,n.y];
}
function bubTouch(n){ /* same bookkeeping talk() does when a conversation starts */
  if(!G.met[n.id])G.met[n.id]=day();
  G.lastTalk[n.id]=day();
  histTier(n,tier(att(n)));
}
function talkStreet(n){
  if(!G||!n)return;
  /* the neighbour's opening job offer lives on the menu, so keep the menu there */
  if(openingTalkButtons(n).length||G.jail)return talk(n);
  const [nx,ny]=bubNpcPos(n),p=G.p;
  p.path=[];p.onArrive=null;
  const dx=nx-p.x,dy=ny-p.y;
  if(typeof pDir!=='undefined')pDir=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);
  if(typeof pFace!=='undefined'&&Math.abs(dx)>.05)pFace=dx>0?1:-1;
  bubTouch(n);
  const tr=tier(att(n)),busy=arcBusyText(n),rl=rumorLine(n);
  BUB={n,full:'',shown:0,mode:'main',t0:0,last:performance.now(),meUntil:0,me:'',blip:0,ready:false};
  worldPanel();
  bubSay(busy||(rl?`"${rl}"`:n.tier[tr]));
}
function bubSay(text){
  if(!BUB)return;
  BUB.full=String(text||'');BUB.shown=BUB.full.length?0:0;BUB.t0=performance.now();BUB.last=BUB.t0;BUB.ready=!BUB.full;
  if(SET&&SET.scenes===false)BUB.shown=BUB.full.length;
  bubRender();
}
function bubIntercept(n,extra){
  if(!BUB||BUB.n!==n)return false;
  if(modal)worldPanel();
  BUB.mode='main';
  if(extra)bubSay(extra);else{BUB.ready=true;BUB.shown=BUB.full.length;bubRender()}
  return true;
}
function bubClose(){
  if(!BUB)return;
  BUB=null;
  ['bubble','bubme','bubchips'].forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=true});
  if(typeof ctxRefresh==='function')ctxRefresh();
}
function bubSkip(){if(BUB&&BUB.shown<BUB.full.length){BUB.shown=BUB.full.length;bubRender()}}
function bubChips(){
  const n=BUB.n,tr=tier(att(n)),s=npcS(n),all=talkBtnList(n,tr,s),by=rx=>all.find(b=>rx.test(b.label)&&!b.off);
  const out=[];
  const chat=by(/^Chat$/),ask=by(/^Ask about town$/),mind=by(/^Something on their mind$/),meal=by(/^Give a meal$/),gift=by(/^Give a gift$/);
  if(BUB.mode==='give'){
    if(meal)out.push({label:'A meal',fn:meal.fn});
    if(gift)out.push({label:'A gift',fn:gift.fn});
    out.push({label:'Back',quiet:1,fn:()=>{BUB.mode='main';bubRender()}});
    return out;
  }
  if(chat)out.push({label:'Chat',fn:chat.fn});
  if(ask)out.push({label:'Ask about town',fn:ask.fn});
  if(mind)out.push({label:'Something on their mind',fn:mind.fn});
  if(meal||gift)out.push({label:'Give…',fn:()=>{BUB.mode='give';bubRender()},nomsg:1});
  out.push({label:'More…',fn:()=>talk(n,'',true),nomsg:1});
  out.push({label:'Bye',quiet:1,fn:bubClose,nomsg:1});
  return out;
}
function bubRender(){
  if(!BUB)return;
  const t=document.getElementById('bub-txt'),box=document.getElementById('bubble'),chips=document.getElementById('bubchips');
  t.textContent=BUB.full.slice(0,BUB.shown);
  box.hidden=false;
  const done=BUB.shown>=BUB.full.length;
  chips.replaceChildren();
  if(done){
    BUB.ready=true;
    bubChips().forEach(c=>{
      const el=document.createElement('button');el.type='button';el.className='chip'+(c.quiet?' quiet':'');el.textContent=c.label;
      el.addEventListener('click',e=>{
        e.stopPropagation();BUB.last=performance.now();
        if(!c.nomsg){BUB.me=c.label;BUB.meUntil=performance.now()+1500}
        c.fn();if(BUB&&!modal)bubRender();
      });
      chips.appendChild(el);
    });
    chips.hidden=false;
  }else chips.hidden=true;
  if(typeof ctxRefresh==='function')ctxRefresh();
  bubPlace();
}
function bubScreen(wx,wy){ /* map units to stage pixels */
  const r=cv.getBoundingClientRect(),st=stage.getBoundingClientRect();
  return [r.left-st.left+((wx*TS-camX)/VW)*r.width, r.top-st.top+((wy*TS-camY)/VH)*r.height, st.width, st.height];
}
function bubPlaceOne(el,wx,wy,maxW){
  const [sx,sy,sw,sh]=bubScreen(wx,wy);
  el.style.maxWidth=Math.min(maxW,sw-16)+'px';
  const w=el.offsetWidth,h=el.offsetHeight;
  let left=clamp(sx-w/2,8,sw-w-8),top=sy-h-10,below=false;
  if(top<4){top=sy+TS*(sh/VH)+4;below=true}
  top=clamp(top,4,sh-h-4);
  el.style.left=left+'px';el.style.top=top+'px';
  el.classList.toggle('below',below);
  el.style.setProperty('--tail',clamp(sx-left,12,w-12)+'px');
}
function bubPlace(){
  if(!BUB||!G)return;
  const [nx,ny]=bubNpcPos(BUB.n),box=document.getElementById('bubble'),me=document.getElementById('bubme');
  bubPlaceOne(box,nx+.5,ny-.15,260);
  const showMe=BUB.me&&performance.now()<BUB.meUntil;
  me.hidden=!showMe;
  if(showMe){me.textContent=BUB.me;bubPlaceOne(me,G.p.x+.5,G.p.y-.15,160)}
}
/* called every frame from the main loop */
function bubUpdate(now){
  if(!BUB)return;
  if(!G||G.jail||BUB.n.indoors&&!(G.companion===BUB.n.id)){return bubClose()}
  if(!modal){
    const [nx,ny]=bubNpcPos(BUB.n);
    if(Math.hypot(nx-G.p.x,ny-G.p.y)>BUB_REACH)return bubClose();
    if(performance.now()-BUB.last>BUB_IDLE_MS)return bubClose();
  }
  const box=document.getElementById('bubble');
  if(modal){box.hidden=true;document.getElementById('bubchips').hidden=true;document.getElementById('bubme').hidden=true;return}
  if(box.hidden)bubRender();
  if(BUB.shown<BUB.full.length){
    const want=Math.min(BUB.full.length,Math.floor((now-BUB.t0)/1000*BUB_CPS));
    if(want!==BUB.shown){
      const prev=BUB.shown;BUB.shown=want;
      if(Math.floor(want/3)!==Math.floor(prev/3)&&/\S/.test(BUB.full[want-1]||''))sfx(BUB.n.id.length%2?'blip':'blip2');
      bubRender();return;
    }
  }
  bubPlace();
}
/* a tap on the map: taps on the speaker skip the typing; any other tap ends the conversation (and then does what it normally does) */
function bubMapTap(fx,fy){
  if(!BUB)return false;
  const [nx,ny]=bubNpcPos(BUB.n);
  if(Math.hypot(nx+.5-fx,ny+.5-fy)<1.1){bubSkip();BUB.last=performance.now();return true}
  bubClose();return false;
}
document.getElementById('bubble').addEventListener('pointerdown',e=>{e.stopPropagation();bubSkip();if(BUB)BUB.last=performance.now()});
/* a Talk button when someone is right next to you */
function bubNearNpc(){
  if(!G||BUB)return null;
  let best=null,bd=1.6;
  NPCS.forEach(n=>{if(n.indoors)return;const d=Math.hypot(n.x-G.p.x,n.y-G.p.y);if(d<bd){bd=d;best=n}});
  return best;
}
ctxRegister({id:'talk',when:()=>!BUB&&!!bubNearNpc()&&!G.p.path.length,label:()=>{const n=bubNearNpc();return n?`Talk to ${shortName(n)}`:'Talk'},run:()=>{const n=bubNearNpc();if(n)talkStreet(n)},more:null});
