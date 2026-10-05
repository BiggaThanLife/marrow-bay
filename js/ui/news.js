"use strict";
/* Confirm dialog, news log, time string. */
/* ================= CONFIRM / NEWS / EVENTS / PHONE ================= */
function ask(title,text,label,fn,back){
  ui(`<h2>${esc(title)}</h2><p>${esc(text)}</p>`,[{label:'Cancel',fn:back||closeMenu,keep:true},{label,cls:'warn',fn}]);
}
const SEVN=['','Minor','Local','Major','Chaos','Catastrophe'];
let alertQ=[],bridgeOn=false,gpsPath=[];
function news(t,sev=1){G.newsSeq=(G.newsSeq||0)+1;G.news.unshift({id:G.newsSeq,d:day(),t,s:sev});if(G.news.length>120)G.news.length=120}
function alertNews(m,sev=2){notify(m);news(m.replace(/^News: /,''),sev)}
const timeStr=()=>{const h=hourOf(),m=Math.floor(G.t%60);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'am':'pm'}`};
