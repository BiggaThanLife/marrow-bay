"use strict";
/* Top HUD, bottom sheet (ui()), toolbar buttons. */
/* ================= HUD / UI ================= */
const sheet=$('#sheet');
function missionText(){
  const m=G.mission;if(!m)return '';
  const left=Math.max(0,Math.round(m.deadline-G.t)),nxt=POIS[m.stops[m.i]];
  return `${m.title}: go to ${nxt.name}${m.night&&!isNight()?' after 9 pm':''} (${left} min left)`;
}
function hud(){
  const el=$('#hud');
  if(!G){el.hidden=true;$('#bar').hidden=true;$('#mission').hidden=true;return}
  el.hidden=false;$('#bar').hidden=false;
  const h=hourOf(),m=Math.floor(G.t%60);
  $('#h-day').textContent='Day '+day()+' · '+season().slice(0,3);
  $('#h-time').textContent=`${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'am':'pm'}`;
  const dayTime=h>=6&&h<19;
  if(el.dataset.ico!==(dayTime?'s':'m')){el.dataset.ico=dayTime?'s':'m';
    $('#h-ico').innerHTML=dayTime?'<svg width="11" height="11" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3" fill="#f2b84b"/><path d="M6 0v2M6 10v2M0 6h2M10 6h2M2 2l1.4 1.4M8.6 8.6L10 10M2 10l1.4-1.4M8.6 3.4L10 2" stroke="#f2b84b" stroke-width="1.2"/></svg>':'<svg width="11" height="11" viewBox="0 0 12 12"><path d="M9.5 8A5 5 0 1 1 4 2.5 4 4 0 0 0 9.5 8z" fill="#c9d6ff"/></svg>'}
  sfxCashWatch();
  const it=issueTotal();$('#b-biz').dataset.n=it?String(it):'';
  $('#h-cash').textContent=money(G.cash);
  $('#h-dist').textContent=district(Math.round(G.p.x),Math.round(G.p.y));
  $('#h-tide').textContent=tideName();
  $('#b-hunger').style.width=G.hunger+'%';
  $('#b-energy').style.width=G.energy+'%';
  $('#t-hunger').textContent=G.hunger<20?'Starving':G.hunger<45?'Hungry':'Fed';
  $('#t-energy').textContent=G.energy<20?'Exhausted':G.energy<45?'Tired':'Rested';
  $('#b-heat').style.width=(G.heat/5*100)+'%';
  $('#t-heat').textContent=G.heat>=.5?'\u2605'.repeat(Math.min(5,Math.ceil(G.heat))):'Clear';
  $('#b-build').classList.toggle('on',!!placing);
  $('#b-phone').textContent=(G.news.some(x=>x.id>G.newsRead)||G.threads.active.some(t=>t.pending))?'Phone \u25CF':'Phone';
  const ms=$('#mission');ms.hidden=!G.mission;if(G.mission)ms.textContent=missionText();
}
function ui(html,btns=[],isModal=true,dismiss=true){
  modal=isModal;dismissable=dismiss;
  if(!isModal){sheet.hidden=true;return}
  if(dismiss)btns=btns.filter(b=>b.fn!==closeMenu||b.keep);
  $('#xbtn').hidden=!dismiss;
  $('#text').innerHTML=html;
  const a=$('#actions');a.replaceChildren();
  btns.forEach((b,i)=>{
    const el=document.createElement('button');el.type='button';
    const cls=b.cls??(i===0?'primary':'');
    el.className='btn'+(cls?' '+cls:'');
    el.innerHTML='<span>'+esc(b.label)+'</span>'+(b.sub?'<small>'+esc(b.sub)+'</small>':'')+(b.badge?`<i class="badge" title="${b.badge} problem${b.badge>1?'s':''}">${b.badge}</i>`:'');
    el.disabled=!!b.off;el.addEventListener('click',b.fn);a.appendChild(el);
  });
  if(sheet.hidden)sfx('open');
  sheet.hidden=false;sheet.scrollTop=0;
}
function worldPanel(){ui('',[],false);if(G){hud();if(G.jail&&!popOpen)jailMenu()}}
const closeMenu=()=>{save();worldPanel()};
const leaveBtn={label:'Leave',cls:'quiet',fn:closeMenu};
$('#xbtn').addEventListener('click',()=>{if(dismissable)closeMenu()});
const msgP=m=>m?`<p class="amber">${esc(m)}</p>`:'';

$('#b-bag').addEventListener('click',()=>{if(G){placing=null;bag()}});
$('#b-phone').addEventListener('click',()=>{if(G){placing=null;phone()}});
$('#b-biz').addEventListener('click',()=>{if(G){placing=null;bizOverview()}});
$('#b-go').addEventListener('click',()=>{if(G){placing=null;if(G.jail)return notify('You are in prison.');goMenu()}});
$('#b-build').addEventListener('click',()=>{
  if(!G)return;
  if(G.jail)return notify('You are in prison.');
  if(placing){placing=null;notify('');hud();return}
  buildMenu();
});
