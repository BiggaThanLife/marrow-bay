"use strict";
/* Hands-on pier fishing: cast, wait through the nibbles, reel in inside the bite window. State is transient (FS), nothing here is saved.
   Catches go through the same places the old menu action used: G.inv.fish, G.fishStock, the Bay Log species roll, energy and the clock.
   Drawing lives in js/render/fishing.js. The big Fish button comes from the context registry (js/ui/context.js). */
const FISH_ART={
 'Pier perch':{pk:5,s:'deep',c:['#4f6b33','#88a35a','#d6dcaa'],stripe:1,cm:[14,24],f:'Bony, plentiful, and always under the pier.'},
 'Silver sprat':{pk:1,fl:'saturate(.15) brightness(1.35)',s:'slim',c:['#4a6378','#a9bccb','#e8eef2'],cm:[8,13],f:'Comes up in a flash and goes in a pan.'},
 'Tide mullet':{pk:1,s:'slim',c:['#55606a','#8f9aa3','#d5dadd'],cm:[22,38],f:'Grazes the pilings when the water is high.'},
 'Mud eel':{s:'eel',c:['#3a3324','#5f5236','#8c7a50'],cm:[40,70],f:'Lives in the flats. Smells like it.'},
 'Reed carp':{pk:10,s:'big',c:['#6b5a2a','#a68b45','#e0cf98'],cm:[30,52],f:'Lazy, golden, and heavier than it looks.'},
 'Salt bream':{pk:5,fl:'saturate(.25) brightness(1.25)',s:'deep',c:['#5a6470','#b4bcc4','#eef0f2'],stripe:2,cm:[20,34],f:'Striped like a deckchair. Fights like one too.'},
 'Lantern herring':{pk:6,s:'slim',c:['#2f4660','#6f8fb0','#cfdbe8'],glow:1,cm:[15,24],f:'A pale spot by the gills glows faintly in the dark.'},
 'Ghost flounder':{pk:3,fl:'saturate(.1) brightness(1.7)',s:'flat',c:['#9ba6a8','#c6ced0','#eef2f2'],cm:[18,30],f:'So pale you can nearly see the pier through it.'},
 'Moon bass':{pk:1,fl:'hue-rotate(195deg) saturate(.9) brightness(.8) contrast(1.15)',s:'big',c:['#28364f','#5d7396','#c9d5e8'],spots:1,cm:[40,66],f:'Rare. Only ever caught by people who were not trying.'},
 'Hollow-eye':{pk:9,s:'deep',c:['#3e3346','#76678a','#cfc4dc'],bigeye:1,cm:[18,28],f:'Rare. It looks at you longer than a fish should.'},
 'Brine cod':{pk:1,fl:'saturate(.4) brightness(1.1)',s:'big',c:['#5a6b52','#8fa07c','#d8dcc4'],cm:[40,70],f:'Boat water only.'},
 'Grey tunny':{pk:9,fl:'saturate(.2)',s:'big',c:['#4c5560','#8b95a0','#dfe3e6'],cm:[50,90],f:'Boat water only.'}
};
/* things that are not fish: a sometimes-catch, from the same pack */
const FISH_JUNK=[
 {n:'Plastic bag',pk:12,f:'Marrow Bay sends its regards. It counts as scrap.',scrap:1},
 {n:'Moss ball',pk:11,f:'Soft, round, and smells of the harbour floor.'},
 {n:'Starfish',pk:15,f:'Clung on like it had a lease.'},
 {n:'Sand dollar',pk:14,f:'Worth exactly nothing, which is still something.'},
 {n:'Weed-line shell',pk:13,f:'Spiral, and no use for anything but holding up to your ear.'},
 {n:'Sea spider',pk:4,f:'You put it back. Quickly.'}
];
const FISH_JUNK_CHANCE=.14,FISH_BITE_WINDOW=1000,FISH_PERFECT_MS=380,FISH_CAST_MS=650,FISH_REEL_MS=720;
const FS={st:'idle',t0:0,now:0,px:0,py:0,tx:0,ty:0,biteAt:0,nibbles:[],will:true,fx:[],fish:null,perfect:false,card:null};
Object.assign(SFX,{
 cast:[[520,.12,'triangle',.04,0,220]],
 nibble:[[330,.05,'triangle',.03]],
 bite:[[880,.07,'square',.06],[1180,.08,'square',.06,.08]],
 splash:[[420,.14,'sawtooth',.025,0,110]],
 reel:[[660,.08,'square',.05],[880,.08,'square',.05,.09],[1320,.16,'square',.05,.18]],
 miss:[[300,.25,'triangle',.05,0,140]]
});
function fishAtSpot(){
  if(!G||modal||popOpen||G.jail||placing||(G.veh&&G.veh.active!=='none')||G.p.path.length)return false;
  const row=map[Math.round(G.p.y)];return !!row&&row[Math.round(G.p.x)]===T.DOCK;
}
const fishBusy=()=>FS.st!=='idle';
/* chance that a cast finds a fish at all: better at high tide and in a full bay, a little better with a rod and a working-class hand */
function fishBiteChance(){
  const tn=tideName(),base=tn==='high'?.9:tn==='low'?.5:.7;
  return clamp(base*clamp(.3+G.fishStock/70,.3,1.3)+rodLevel()*.05+(has('working-class')?.05:0),.15,.95);
}
function fishFloat(s,col){FS.fx.push({k:'text',s,col,t:FS.now,life:1300})}
function fishSplash(x,y,n,big){
  for(let i=0;i<n;i++)FS.fx.push({k:'drop',x,y,vx:rnd(-1,1)*(big?1.4:.9),vy:-rnd(.8,big?2.6:1.8),t:FS.now,life:rnd(380,650)});
  FS.fx.push({k:'ring',x,y:y+1,t:FS.now,life:big?900:650,r0:1,r1:big?11:7});
  if(big)FS.fx.push({k:'ring',x,y:y+1,t:FS.now+120,life:900,r0:1,r1:7});
}
function fishSpend(min,en){advance(min);G.energy=clamp(G.energy-en,0,100)}
function fishReset(){FS.st='idle';FS.fish=null;FS.fx.length=0;FS.nibbles=[];FS.perfect=false;fishCard(null)}
function fishCancel(){if(FS.st!=='idle')fishReset()}
function fishAct(now){
  now=now==null?performance.now():now;FS.now=now;
  if(FS.st==='idle'){
    if(!fishAtSpot())return;
    if(G.energy<3){notify('Too tired to fish. Eat or rest first.');return}
    FS.st='casting';FS.t0=now;FS.px=G.p.x*TS+8;FS.py=G.p.y*TS+14;
    FS.tx=Math.min(W*TS-8,Math.round((FS.px+rnd(5,24))*2)/2);FS.ty=Math.round((FS.py+rnd(18,34))*2)/2;
    sfx('cast');fishCard(null);
  }else if(FS.st==='waiting'){
    FS.st='missed';FS.t0=now;fishFloat('Too soon','#ffd9a0');sfx('splash');FS.fish=null;fishSpend(10,1);
  }else if(FS.st==='bite'){
    FS.perfect=now-FS.t0<FISH_PERFECT_MS;FS.st='reeling';FS.t0=now;
    fishSplash(FS.tx,FS.ty,22,true);sfx('reel');vib(30);
  }else if(FS.st==='landed'){fishReset()}
}
function fishUpdate(now){
  now=now==null?performance.now():now;FS.now=now;
  if(FS.st==='idle')return;
  if(!G||!fishAtSpot())return fishCancel();
  if(FS.st==='casting'&&now-FS.t0>=FISH_CAST_MS){
    FS.st='waiting';FS.t0=now;fishSplash(FS.tx,FS.ty,10,false);sfx('splash');
    FS.will=Math.random()<fishBiteChance();
    FS.biteAt=now+rnd(2200,5200);FS.nibbles=[];
    const n=FS.will?Math.floor(rnd(1,3.99)):1;
    for(let i=0;i<n;i++)FS.nibbles.push({at:FS.biteAt-600-i*rnd(700,1100),done:false});
  }
  if(FS.st==='waiting'){
    FS.nibbles.forEach(nb=>{if(!nb.done&&now>nb.at){nb.done=true;FS.fx.push({k:'ring',x:FS.tx,y:FS.ty+1,t:now,life:500,r0:1.5,r1:5});sfx('nibble')}});
    if(now>=FS.biteAt){
      if(FS.will){
        FS.st='bite';FS.t0=now;
        if(Math.random()<FISH_JUNK_CHANCE)FS.fish={junk:FISH_JUNK[Math.floor(Math.random()*FISH_JUNK.length)]};
        else{const pk=pickFishSpecies(false,true);FS.fish={pk,art:FISH_ART[pk.n]}}
        vib(60);sfx('bite');
      }else{FS.st='missed';FS.t0=now;fishFloat('Nothing biting','#ffd9a0');sfx('miss');fishSpend(ri(15,25),2)}
    }
  }
  if(FS.st==='bite'&&now-FS.t0>FISH_BITE_WINDOW){FS.st='missed';FS.t0=now;fishFloat('It got away','#ffb3a8');sfx('miss');FS.fish=null;fishSpend(ri(15,25),2)}
  if(FS.st==='missed'&&now-FS.t0>900)FS.st='idle';
  if(FS.st==='reeling'&&now-FS.t0>=FISH_REEL_MS){FS.st='landed';FS.t0=now;fishLand()}
}
