"use strict";
/* Waterfront ambience: filtered noise for the water (swells with the tide, a slow LFO makes the waves breathe), gull chirps by day and a rare far foghorn at night.
   Built on audio.js (actx, SET). Silent until the first tap has unlocked audio, on the title screen, when muted, and away from water; fades by distance.
   Cost: one looping noise buffer, three nodes and a 0.4s check; the wave rhythm runs on an oscillator, not JS. */
let ambN=null,ambNext=0,ambHornAt=0;
/* 0..1: how close the player is to water (full on the docks, nothing 10 tiles from any shore); Dockside keeps a floor */
function ambienceLevel(){
  if(!G)return 0;
  const px=Math.round(G.p.x),py=Math.round(G.p.y);let best=99;
  for(let y=py-10;y<=py+10;y++){const row=map[y];if(!row)continue;for(let x=px-10;x<=px+10;x++){const t=row[x];if(t===T.WATER||t===T.DOCK||t===T.FLAT){const d=Math.hypot(x-px,y-py);if(d<best)best=d}}}
  let l=clamp(1-best/10,0,1);l*=l;
  if(district(px,py)==='Dockside')l=Math.max(l,.55);
  return l;
}
function ambInit(){
  const len=actx.sampleRate*2,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
  let b=0;for(let i=0;i<len;i++){b=(b+.04*(Math.random()*2-1))/1.04;d[i]=b*3.2}
  const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=500;lp.Q.value=.7;
  const g=actx.createGain();g.gain.value=0;
  const wave=actx.createGain();wave.gain.value=.5;
  const lfo=actx.createOscillator();lfo.frequency.value=.11;const lg=actx.createGain();lg.gain.value=.22;lfo.connect(lg);lg.connect(wave.gain);
  src.connect(lp);lp.connect(wave);wave.connect(g);g.connect(actx.destination);src.start();lfo.start();
  ambN={g,lp};
}
function ambNote(f0,f1,d,v,delay,type){
  const t=actx.currentTime+(delay||0),o=actx.createOscillator(),g=actx.createGain(),master=[0,.45,1,1.8][SET.vol]||1;
  o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*master,t+Math.min(.04,d/3));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+.03);
}
function ambTick(){
  try{
    if(!actx||actx.state!=='running')return;
    const lvl=(!G||SET.mute||SET.ambient===false)?0:ambienceLevel();
    if(!ambN){if(lvl<=0)return;ambInit()}
    const now=actx.currentTime,master=[0,.45,1,1.8][SET.vol]||1,v=tideV(),tide=(v+1.2)/2.4;
    ambN.g.gain.setTargetAtTime(lvl*(.05+.09*tide)*master,now,.8);
    ambN.lp.frequency.setTargetAtTime(280+520*tide,now,.8);
    if(lvl<.12)return;
    if(!isNight()&&now>ambNext){
      ambNext=now+rnd(7,18);
      if(Math.random()<.8){const n=Math.random()<.5?2:3,s=lvl*.035;for(let i=0;i<n;i++)ambNote(1500+rnd(0,300),2300+rnd(0,300),.14,s,i*.17,'triangle'),ambNote(2300,1500,.1,s*.7,i*.17+.12,'triangle')}
    }else if(isNight()&&now>ambHornAt){
      ambHornAt=now+rnd(70,160);
      if(Math.random()<.5){const s=lvl*.05;ambNote(98,92,2.4,s,0,'sine');ambNote(196,184,2.2,s*.35,0,'sine')}
    }
  }catch(e){}
}
setInterval(ambTick,400);
