"use strict";
/* Rumor creation, and turning a rumor into Bay-Watch posts and a line people say to your face. */
const RUMOR_NAMED_AT=4,RUMOR_POSTS_PER_DAY=3;
/* up to n people of a district, so a rumor starts with someone who was there */
const knowersNear=(dist,n=1)=>NPCS.filter(x=>x.d===dist).slice(0,n).map(x=>x.id);
/* opts: {dist,shop,owner} fill the placeholders in the posts */
function addRumor(type,ids,opts){
  let r=G.rumors.find(x=>x.type===type);
  if(r){r.str=100;ids.forEach(i=>{if(!r.knows.includes(i))r.knows.push(i)});if(day()-(r.lastPost||-99)>=3)r.posted=0}
  else{r={type,str:100,knows:[...new Set(ids)]};G.rumors.push(r);if(RUM[type])histAdd('rum:'+type,`Word got around. ${RUM[type].t} HARBOR did not start it.`,15)}
  if(opts)Object.assign(r,opts);
  rumorPost(r);
}
const rumorText=(s,r)=>s.replace(/\{you\}/g,G.name).replace(/\{dist\}/g,r.dist||'town').replace(/\{shop\}/g,r.shop||'the shop').replace(/\{owner\}/g,r.owner||'the owner');
/* post once when a second person has heard, and again with your name once it is common knowledge; at most a few rumor posts a day */
function rumorPost(r){
  const info=RUMOR_INFO[r.type];if(!info||r.knows.length<2)return;
  const named=!info.vagueOnly&&(info.good||r.knows.length>=RUMOR_NAMED_AT),stage=named?2:1;
  if((r.posted||0)>=stage)return;
  if(G.feed&&G.feed.filter(p=>p.kind==='rumor'&&p.day===day()).length>=RUMOR_POSTS_PER_DAY)return;
  const by=NPC[r.knows[r.knows.length-1]];
  r.posted=stage;r.lastPost=day();
  feedAdd({kind:'rumor',dist:r.dist||'',t:rumorText(named?info.named:info.vague,r),by:by?`${by.name}, ${by.role}`:''});
}
/* the freshest rumor this person has heard, as something they say to you */
function rumorLine(n){
  const r=G.rumors.filter(x=>x.knows.includes(n.id)&&RUMOR_INFO[x.type]&&RUMOR_INFO[x.type].line).sort((a,b)=>b.str-a.str)[0];
  return r?RUMOR_INFO[r.type].line:'';
}
/* what a shop owner who has heard about you does to their prices: bad news up to about 10%, good news down about 6%, fading as the rumor does */
function rumorPriceBias(id){
  const v=G.rumors.reduce((s,r)=>s+(r.knows.includes(id)?(RUM[r.type].d+((RUM_WHO[r.type]||{})[id]||0))*r.str/100:0),0);
  return clamp(-v/300,-.06,.1);
}
