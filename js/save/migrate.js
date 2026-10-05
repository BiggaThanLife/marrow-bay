"use strict";
/* Fills in new fields on old saves. */
function migrate(){
  cityInit();
  if(!G.look){G.flags=G.flags||{};G.flags.customDone=false}
  G.name=G.name||'Stranger';G.quirk=G.quirk||null;
  G.threads=G.threads||{active:[],done:[],lastStart:0};
  G.look=G.look||{skin:1,hair:0,style:0,outfit:'blue',hat:'none'};
  G.wardrobe=G.wardrobe||{outfits:{blue:1},hats:{none:1}};
  ['31,8','36,13'].forEach(key=>{const b=bizOf(key);if(!b)return;
    G.cash+=Math.round((b.paid||b.price)+b.till);G.biz=G.biz.filter(x=>x!==b);if(G.home==='B:'+key)G.home='bunk'});
  G.news=G.news||[];G.newsSeq=G.newsSeq||0;G.newsRead=G.newsRead||0;G.met=G.met||{};G.evs=G.evs||[];G.queue=G.queue||[];G.gps=G.gps||null}
