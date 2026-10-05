"use strict";
/* Title screen and new game start. */
/* ================= TITLE / START ================= */
function title(){
  G=null;hud();placing=null;dest=null;alertQ=[];popClear();gpsPath=[];applyBridge(false);
  const saved=loadSave();
  ui(`<h1>Marrow Bay</h1><p>A tidal city of six districts, from the Greenbelt farms to the Neon Mile and the Foundry. Work, build a business, buy property, get wheels, or cut corners.</p>
  <p class="muted">Nobody is scripted. People react to who you are, what you own, and what you do.</p>`,
  [...(saved?[{label:'Continue',sub:`Day ${Math.floor(saved.t/1440)+1}, ${BG[saved.bg].n}`,fn:()=>{buildWorld(saved.seed||0);G=saved;migrate();G.p.path=[];G.p.onArrive=null;initNPCs();recomputeMods();hud();worldPanel();if(G.flags.customDone===false){draft=null;G.flags.onboarded?customize(null,true):customize(G.bg)}}}]:[]),
   {label:'New game',cls:saved?'':'primary',fn:()=>saved?ask('Start a new game?','This replaces your saved game once you begin.','Start over',chooseBg,title):chooseBg()}],true,false);
}
function chooseBg(){
  ui('<h2>Who are you?</h2><p class="muted">Your background decides where you start, how people see you, and what you are good at.</p>',
    Object.entries(BG).map(([k,v],i)=>({label:v.n,sub:`${v.perk} Starts with ${money(v.cash)}.`,cls:i?'':'primary',fn:()=>start(k)})),true,false);
}
function start(k){
  const seed=1+Math.floor(Math.random()*2147483646);buildWorld(seed);
  const b=BG[k],h=POIS[b.home];
  G={seed,bg:k,cash:b.cash,hunger:80,energy:90,t:8*60,
     rep:{Greenbelt:0,Highline:0,Grid:0,Dockside:0,'Neon Mile':0,'Foundry Row':0,...b.rep},
     inv:{crops:0,meals:0,fish:0,smoked:0,scrap:0,trinkets:0,seeds:0,loot:0,...b.inv},
     home:b.home,owned:{},debt:0,arrears:0,loanDay:0,loanTerm:10,structs:[],biz:[],pool:[],plots:FARM_TILES.map(([x,y])=>({x,y,s:0,d:0})),
     gifts:0,flags:{customDone:false},ev:null,npcs:{},rumors:[],projects:PROJECTS.map(p=>({id:p.id,have:{},done:false})),fx:{},
     fishStock:70,flats:70,demand:0,heat:0,mission:null,lastBills:0,news:[],newsSeq:0,newsRead:0,met:{},evs:[],queue:[],gps:null,
     threads:{active:[],done:[],lastStart:0},name:'Stranger',look:{skin:1,hair:0,style:0,outfit:'blue',hat:'none'},wardrobe:{outfits:{blue:1},hats:{none:1}},quirk:null,
     veh:{owned:{},stolen:{},fuel:{},active:'none'},
     p:{x:h.ex,y:h.ey,path:[],onArrive:null,face:1}};
  NPCS.forEach(n=>G.npcs[n.id]={m:0,chat:-1,cash:n.wage*2+10,hunger:70});
  cityInit();
  makePool();initNPCs();recomputeMods();news('You arrive in Marrow Bay.',1);save();hud();
  customize(k);
}
