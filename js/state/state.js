"use strict";
/* The game state object G, clock, tide, lookups. */
/* ================= STATE ================= */
let G=null,modal=false,dismissable=true,placing=null;
const day=()=>Math.floor(G.t/1440)+1;
const hourOf=()=>Math.floor(G.t/60)%24;
const isNight=()=>{const h=hourOf();return h>=21||h<5};
const clockNow=()=>G?G.t:600+performance.now()/40;
/* spring and neap: a 7 day swell on the tide's height (0.8 to 1.2). Spring tides run higher and lower, neap tides stay shallow. */
const tideAmp=(t=clockNow())=>1+.2*Math.cos(2*Math.PI*t/(7*1440));
const tideCycle=(t=clockNow())=>{const a=tideAmp(t);return a>=1.1?'spring':a<=.9?'neap':''};
const tideV=(t=clockNow())=>tideAmp(t)*Math.sin(2*Math.PI*t/(12.4*60));
const tideName=(t=clockNow())=>{const v=tideV(t);return v>.45?'high':v<-.45?'low':(Math.cos(2*Math.PI*t/(12.4*60))>0?'rising':'falling')};
const npcS=n=>G.npcs[n.id];
const known=type=>{const r=G.rumors.find(r=>r.type===type);return r?r.knows.length:0};
const bizOf=k=>G.biz.find(b=>b.key===k);
