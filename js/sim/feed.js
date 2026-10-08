"use strict";
/* The Bay-Watch feed: one place where the city talks to the player. A post is {id,day,kind,dist,t,by}. Kinds:
   'rumor' and 'event' are saved (G.feed, newest last, capped), 'suggest' posts are pinned HARBOR suggestions worked out live from the game state
   and tick themselves off, 'chatter' is the daily petty complaints made from the day number and never saved.
   feedAdd() is the only way to post. Unread = saved posts newer than G.feedSeen, plus a new suggestion nobody has looked at yet. */
const FEED_CAP=40,FEED_KINDS={suggest:'Suggested',rumor:'Rumor',event:'Event',chatter:'Chatter'};
function feedAdd(p){
  G.feed=G.feed||[];G.feedId=(G.feedId||0)+1;
  G.feed.push({id:G.feedId,day:day(),kind:p.kind||'event',dist:p.dist||'',t:p.t,by:p.by||''});
  while(G.feed.length>FEED_CAP)G.feed.shift();
}
/* HARBOR's suggestions: a short, optional list of things worth trying. Each one disappears when the game state shows it is done. */
const SUGGESTIONS=[
  {id:'meet',t:'Talk to someone',b:'Tap a person on the map and choose Chat. People remember who was kind.',done:()=>Object.keys(G.met).length>=1},
  {id:'enter',t:'Walk into a building',b:'Tap any building. You walk to its door and go in. Shops, work and news all start there.',done:()=>Object.values(G.engage||{}).some(v=>v>0)},
  {id:'money',t:'Make your first $100',b:'Work a shift, fish from the pier, farm a Greenbelt plot or busk on the Plaza. Cash shows on the top bar.',done:()=>G.cash>=100||G.biz.length>0||(G.dirty||0)>0},
  {id:'friend',t:'Win someone over',b:'Chat once a day and give a meal now and then. A friendly shop owner will sell you their shop, and a friend will come along.',done:()=>NPCS.some(n=>npcS(n).m>=12)},
  {id:'own',t:'Save up for a building',b:'Tap a building marked FOR SALE. Greenbelt lots are the cheapest. Open Biz to see what you own.',done:()=>G.biz.length>0},
  {id:'fit',t:'Set up your business',b:'Open your building from Biz, pick a business, hire staff and keep it stocked. Then collect the till.',done:()=>G.biz.some(b=>b.type&&b.type!=='home')}
];
/* the next two suggestions still to do, as posts */
const feedSuggestions=()=>G&&G.flags&&G.flags.onboarded?SUGGESTIONS.filter(s=>!s.done()).slice(0,2).map(s=>({id:'s:'+s.id,kind:'suggest',dist:'',by:'HARBOR',t:s.t+'. '+s.b})):[];
function feedUnread(){
  if(!G)return 0;
  const saved=(G.feed||[]).filter(p=>p.id>(G.feedSeen||0)).length,s=feedSuggestions()[0];
  return saved+(s&&G.sugSeen!==s.id?1:0);
}
function feedMarkRead(){G.feedSeen=G.feedId||0;const s=feedSuggestions()[0];if(s)G.sugSeen=s.id}
/* fill in the feed fields on a new game or an old save; posts that used to live in G.bwExtra move across once and count as read */
function feedInit(){
  const fresh=G.feedSeen===undefined;
  G.feed=G.feed||[];G.feedId=G.feedId||0;
  if(G.bwExtra&&G.bwExtra.length){G.bwExtra.forEach(p=>{G.feedId++;G.feed.push({id:G.feedId,day:p.day,kind:'event',dist:p.dist||'',t:p.t,by:''})});G.bwExtra=[]}
  while(G.feed.length>FEED_CAP)G.feed.shift();
  if(fresh)G.feedSeen=G.feedId;
  if(G.sugSeen===undefined)G.sugSeen='';
}
