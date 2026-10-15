"use strict";
/* Feedback: vibration, floating cash text, the tide change alert and the end-of-day summary. Nothing here changes how the game plays. */
function vib(p){if(SET.vibe!==false&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}}
/* "+$N" or "-$N" rises from the player and fades in about a second */
function floatText(txt,good){
  try{
    if(!G||!cv)return;
    const r=cv.getBoundingClientRect();if(!r.width||!VW)return;
    const x=r.left+((G.p.x*TS+TS/2-camX)/VW)*r.width,y=r.top+((G.p.y*TS-camY)/VH)*r.height;
    const e=document.createElement('div');e.className='cashfl '+(good?'good':'bad');e.textContent=txt;
    e.style.left=Math.max(20,Math.min(innerWidth-20,x))+'px';e.style.top=Math.max(40,y)+'px';
    document.body.appendChild(e);setTimeout(()=>e.remove(),1100);
  }catch(err){}
}
/* called from the HUD refresh with the change in cash since the last one */
function cashJuice(d){
  if(Math.abs(d)>=5)floatText((d>0?'+':'-')+money(Math.abs(d)),d>0);
  if(d>=50)vib(30);
}
/* tide: arrow, a small level bar and time to the next high or low */
let tideLast={g:null,r:null},tideHtml='';
function tideInfo(t=clockNow()){
  const P=12.4*60,ph=((t%P)+P)%P,rising=ph<P/4||ph>=3*P/4;
  const to=rising?(ph<=P/4?P/4-ph:P/4+P-ph):(3*P/4-ph);
  return {rising,to,v:tideV(t)};
}
function tideHud(){
  if(G&&(!daySum||daySum.g!==G))daySum={g:G,cash:G.cash,day:day()};
  const i=tideInfo(),el=$('#h-tide');if(!el)return;
  const mins=Math.max(1,Math.round(i.to)),tm=mins>=60?Math.floor(mins/60)+'h'+(mins%60?String(mins%60).padStart(2,'0'):''):mins+'m';
  const html=`<span class="tarr ${i.rising?'up':'dn'}">${i.rising?'\u25B2':'\u25BC'}</span><span class="tbar"><i style="width:${clamp(Math.round((i.v/tideAmp()+1)*50),0,100)}%"></i></span><small>${i.rising?'high':'low'} ${tm}${tideCycle()?' Â· '+tideCycle():''}</small>`;
  if(html!==tideHtml){tideHtml=html;el.innerHTML=html}
  el.title='Tide '+tideName()+', '+(i.rising?'rising':'falling')+(tideCycle()?', '+tideCycle()+' tide':'');
  if(tideLast.g!==G){tideLast={g:G,r:i.rising};return}
  if(tideLast.r!==i.rising){tideLast.r=i.rising;notify(i.rising?'The tide has turned and is rising.':'The tide has turned and is falling.');sfx('news')}
}
/* end of day: cash change since the last summary plus a few notable things from the news and your story */
let daySum=null;
function daySummary(prevDay){
  if(!G)return;
  if(!daySum||daySum.g!==G){daySum={g:G,cash:G.cash,day:prevDay};return}
  const d=G.cash-daySum.cash,from=daySum.day;daySum={g:G,cash:G.cash,day:day()};
  const lines=[];
  const fees=(G.fees||[]).filter(f=>f.d>=from);
  if(fees.length)lines.push('• Paid out: '+fees.map(f=>f.t+' '+money(f.amt)).join(', '));
  (G.news||[]).filter(x=>x.d>=from&&x.d<day()&&x.s>=2).slice(0,3).forEach(x=>lines.push('\u2022 '+x.t));
  (G.hist||[]).filter(h=>h.day>=from&&h.day<day()).slice(-2).forEach(h=>{if(lines.length<4)lines.push('\u2022 '+h.t)});
  popup('Day '+prevDay+' in review',`Cash: ${d>=0?'+':'-'}${money(Math.abs(d))} (now ${money(G.cash)})`+(lines.length?'\n'+lines.join('\n'):'\nA quiet day.'));
}
