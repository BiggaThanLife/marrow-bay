"use strict";
/* Sound: small synthesized effects (no audio files), plus the saved sound settings. */
const SETTINGS_KEY='marrowbay_settings';
const SET={mute:false,vol:2,hints:true,scenes:!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)};
try{Object.assign(SET,JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'))}catch(e){}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(SET))}catch(e){}}
let actx=null;const sfxLast={};
/* each note: [frequency, seconds, wave, volume, delay, slideTo] */
const SFX={
  tap:[[560,.04,'square',.05]],
  open:[[330,.05,'triangle',.07],[440,.06,'triangle',.07,.05]],
  coin:[[880,.07,'square',.06],[1320,.12,'square',.06,.07]],
  spend:[[520,.07,'triangle',.07],[390,.1,'triangle',.07,.07]],
  alert:[[660,.1,'sine',.12],[880,.1,'sine',.12,.12],[660,.16,'sine',.12,.24]],
  news:[[740,.05,'sine',.07],[988,.08,'sine',.07,.06]],
  good:[[523,.08,'triangle',.09],[659,.08,'triangle',.09,.08],[784,.16,'triangle',.09,.16]],
  bad:[[220,.18,'sawtooth',.07,0,150],[160,.22,'sawtooth',.07,.16,100]],
  siren:[[700,.16,'square',.05],[520,.16,'square',.05,.16],[700,.16,'square',.05,.32]]
};
function audioUnlock(){
  try{
    if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;actx=new C()}
    if(actx.state==='suspended')actx.resume();
  }catch(e){}
}
function sfx(name){
  if(SET.mute||!actx||actx.state!=='running')return;
  const notes=SFX[name];if(!notes)return;
  const now=actx.currentTime;if(sfxLast[name]&&now-sfxLast[name]<.06)return;sfxLast[name]=now;
  const master=[0,.45,1,1.8][SET.vol]||1;
  try{notes.forEach(([f,d,w,v,delay,to])=>{
    const t=now+(delay||0),o=actx.createOscillator(),g=actx.createGain();
    o.type=w;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v*master,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+.02);
  })}catch(e){}
}
/* browsers only allow sound after a tap, so unlock on the first one; every button gets a soft click */
document.addEventListener('pointerdown',audioUnlock,{capture:true});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.btn,#bar button,#xbtn'))sfx('tap')},true);
/* cash changes are heard from the HUD refresh */
let sfxCash={g:null,c:0};
function sfxCashWatch(){
  if(!G){sfxCash.g=null;return}
  if(sfxCash.g!==G){sfxCash={g:G,c:G.cash};return}
  const d=G.cash-sfxCash.c;sfxCash.c=G.cash;
  if(d>=1)sfx('coin');else if(d<=-1)sfx('spend');
}
