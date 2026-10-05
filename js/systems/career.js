"use strict";
/* Career titles: milestone epilogues. The game never ends. Each title is earned once, shown once, and play continues. */
function netWorth(){
  const biz=G.biz.reduce((s,b)=>s+(b.paid||b.price||0)*.7,0);
  const rides=Object.keys(G.veh.owned).filter(k=>G.veh.owned[k]&&VEH[k]).reduce((s,k)=>s+VEH[k].price*.5,0);
  return Math.round(G.cash+portfolio()+biz+rides-G.debt);
}
const CAREERS=[
 {id:'tycoon',n:'Tycoon',need:'Net worth of $15,000 (cash, shares, buildings, rides, minus debt).',test:()=>netWorth()>=15000,
  text:'The Gazette calls you a "magnate." The Gilded Tide installs a chair with your name on it. You do not sit in it, which impresses everyone.'},
 {id:'landlord',n:'Landlord of the Bay',need:'Own five buildings.',test:()=>G.biz.length>=5,
  text:'Five buildings, five sets of keys, five different ways to hear the word "repairs." You have become a part of the skyline.'},
 {id:'kingpin',n:'Kingpin',need:'Own three Neon Mile rackets at once.',test:()=>playerRackets().length>=3,
  text:'Three corners, three envelopes, three people who stop talking when you walk in. Vex sends you a fruit basket. It is not a compliment.'},
 {id:'mayor',n:'Mayor',need:'Win the mayor\u2019s office.',test:()=>!!fact('player_mayor'),
  text:'The ribbon-cutting scissors are very large. You use them anyway. A child asks if you are important. You say "somewhat."'},
 {id:'folkhero',n:'Folk Hero',need:'Be known as generous and well liked by the union or the co-op.',test:()=>has('local-hero')&&G.fac.union+G.fac.coop>=20,
  text:'They put your face on a mural by the fish stalls. The artist is not good. Everyone loves it anyway.'},
 {id:'shark',n:'Shark',need:'Hold $5,000 in shares.',test:()=>portfolio()>=5000,
  text:'The trading desk goes quiet when you arrive and loud when you leave. Cordelia sends over a coffee. You do not drink it.'},
 {id:'ghost',n:'Ghost in the Machine',need:'Settle HARBOR\u2019s fate: free it, hide it, merge with it, or tear FLACK out.',test:()=>fact('harbor_ghost')||fact('harbor_free')||fact('harbor_merged')||fact('flack_removed'),
  text:'Somewhere in the walls of Marrow Bay a very polite machine remembers your name and has agreed, mostly, to keep it to itself.'}
];
function careerDaily(){
  CAREERS.forEach(c=>{
    if(G.titles.some(t=>t.id===c.id)||!c.test())return;
    G.titles.push({id:c.id,day:day()});
    news(`Title earned: ${c.n}.`,3);
    popup(`Epilogue: ${c.n}`,c.text,'This is a milestone, not an ending. The city keeps going, and so do you.');
  });
}
function careerMenu(msg){
  const got=CAREERS.filter(c=>G.titles.some(t=>t.id===c.id));
  ui(`<h2>Career</h2><p class="muted">Net worth ${money(netWorth())}. Titles are milestones. The story never stops.</p>${msgP(msg)}
    ${got.length?'<h2>Earned</h2>'+got.map(c=>`<p class="small"><b>${esc(c.n)}</b> (day ${G.titles.find(t=>t.id===c.id).day}): ${esc(c.text)}</p>`).join(''):'<p class="muted">No titles yet.</p>'}
    <h2>Ahead</h2>${CAREERS.filter(c=>!got.includes(c)).map(c=>`<p class="small"><b>${esc(c.n)}</b>: ${esc(c.need)}</p>`).join('')||'<p class="muted small">You have earned every title.</p>'}`,
    [{label:'Back',cls:'quiet',fn:()=>phone()},leaveBtn]);
}
