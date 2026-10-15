"use strict";
/* The tide mystery drip (docs/LORE.md section 3) and one-time NPC bond scenes (section 5).
   Clues: from about day 5 to day 20 one clue every day or two, five stages gated by day and by progress. Each is shown once (G.clues.seen),
   announced through the note bar and the news, and written to history so it can be reread. Seeing a stage-5 clue also opens HARBOR's arc.
   Bonds: BONDS[npcId]={title,setup,choices:[{label,text,att,vex?,hist,fx}]}. talk() offers the scene once at "close friend"; G.bonds[id] holds the choice made. */
const CLUE_STAGE_DAY=[0,5,8,12,15,19];
const TIDE_CLUES=[
 {id:'1a',s:1,who:'HARBOR',t:'High water at 6:12. HARBOR has been told it was 6:09. HARBOR has not been told by whom.'},
 {id:'1b',s:1,who:'Tide box',t:'Predicted: 2.1 m. Observed: 1.9 m. Observed is probably wrong. It usually is.'},
 {id:'1c',s:1,who:'',t:'A dockhand taps the board. "That clock\'s lying again." Nobody takes it down.'},
 {id:'2a',s:2,who:'HARBOR',t:'The tide table has been revised eleven times this year. HARBOR approves of revisions. HARBOR would like to see one that is wrong in the other direction.'},
 {id:'2b',s:2,who:'Tide box',t:'Low water late again. Cargo moved at 3:40. Coincidence logged as coincidence.'},
 {id:'2c',s:2,who:'',t:'Pip has chalked a tally on a post: every mark is a day the board ran early.'},
 {id:'2d',s:2,who:'HARBOR',t:'I publish what I am given. This is a defence. I am not sure it is a good one.'},
 {id:'3a',s:3,who:'Tide box',t:'Scratched inside the lid: "Ignore the number, watch the weed line."'},
 {id:'3b',s:3,who:'',t:'Duarte, to a rookie: "Board\'s for the ferries. The harbor tells you the real one."'},
 {id:'3c',s:3,who:'HARBOR',t:'Some citizens keep their own tide tables. HARBOR has seen them. Theirs have better attendance.'},
 {id:'4a',s:4,who:'Tide box',t:'Correction applied: +0:17. Initials: M.R. No such user is registered.'},
 {id:'4b',s:4,who:'HARBOR',t:'Someone has write access to a file I am only permitted to read. I would like to meet them. I would like to be asked first.'},
 {id:'4c',s:4,who:'',t:'A ledger margin, in pencil: "Tables adjusted per T. instruction. Do not log."'},
 {id:'5a',s:5,who:'HARBOR',t:'The Grid is two fingers lower than last spring. The tide table does not know this. HARBOR has decided to.'},
 {id:'5b',s:5,who:'Tide box',t:'Water under Plaza Street: 0.4 m. Sea: low. Both readings are correct.'},
 {id:'5c',s:5,who:'HARBOR',t:'I would like to ask about the ground. I will not remember asking. Please remember for me.'}
];
const CLUES_PER_STAGE=2;
function cluesInit(){
  G.clues=G.clues||{seen:[],last:-9};G.clues.seen=G.clues.seen||[];if(typeof G.clues.last!=='number')G.clues.last=-9;
  G.bonds=G.bonds||{};
}
/* which stage is open today: the calendar sets the pace, but stages 4 and 5 also want some progress (a finished Tide's Cargo, a few talks with HARBOR) or five extra days */
function clueStageNow(){
  const d=day(),cargo=G.threads&&G.threads.done&&G.threads.done.some(t=>t.tid==='tidecargo'),prog=cargo||(G.stance&&G.stance.harbor>=3);
  let s=0;
  for(let i=1;i<=5;i++){if(d>=CLUE_STAGE_DAY[i]&&(i<4||prog||d>=CLUE_STAGE_DAY[i]+5))s=i;else break}
  return s;
}
function clueShow(c){
  cluesInit();G.clues.seen.push(c.id);G.clues.last=day();
  const line=c.who==='HARBOR'?`HARBOR: "${redact(c.t)}"`:c.who?`${c.who}: ${c.t}`:c.t;
  notify(line);news(line,1);
  histAdd('clue_'+c.id,'The tide: '+line);
  return c;
}
/* the next clue that is open and unseen; by itself at most CLUES_PER_STAGE per stage drip out, 'force' ignores that cap */
function clueNext(force){
  cluesInit();const st=clueStageNow();
  for(let s=1;s<=st;s++){
    const here=TIDE_CLUES.filter(c=>c.s===s),seen=here.filter(c=>G.clues.seen.includes(c.id));
    if(!force&&seen.length>=CLUES_PER_STAGE)continue;
    const left=here.filter(c=>!G.clues.seen.includes(c.id));
    if(left.length)return left[0];
  }
  return null;
}
function tideClueDaily(){
  if(!G||(G.opening&&!G.opening.done))return;
  cluesInit();
  if(day()<CLUE_STAGE_DAY[1])return;
  /* a save well past the calendar catches up one clue a day instead of every other day */
  const behind=G.clues.seen.length<(clueStageNow()-1)*CLUES_PER_STAGE;
  if(day()-G.clues.last<(behind?1:2))return;
  const c=clueNext(false);if(c)clueShow(c);
}
const clueFinalSeen=()=>!!(G.clues&&G.clues.seen.some(id=>id[0]==='5'));

/* ---------- bond scenes ---------- */
const BONDS={
 reyes:{title:'Off shift',setup:'Reyes is at the diner, off shift, staring at cold coffee. "Eleven years. I have written the tide into every incident report, and nobody has ever asked why."',choices:[
  {label:'Ask what she thinks it means',text:'"It\'s the one cell in this city nobody can fill."',att:8,hist:'Reyes told you what she thinks of the tide.',fx:()=>{G.heat=Math.max(0,G.heat-1);return 'She mentions a patrol route to avoid. Your heat drops a little.'}},
  {label:'Tell her about MB-0417',text:'She goes still, then writes nothing down.',att:14,vex:-6,hist:'You told Reyes about crate MB-0417. She wrote nothing down.',fx:()=>{G.heat=0;return 'She will look the other way, this once. Your wanted level is wiped.'}},
  {label:'Order her a fresh coffee',text:'"That is the nicest thing anyone has filed against me."',att:8,hist:'You bought Reyes a coffee.',fx:()=>{G.inv.meals++;return 'The cook slips you a free meal on the way out.'}}]},
 ines:{title:'The pour',setup:'After shift Ines hands you a rag. "Sit. Watch the pour. It\'s the only time this place is quiet."',choices:[
  {label:'Stay and watch',text:'The metal comes out the colour of a sunrise nobody asked for. Neither of you speaks.',att:8,hist:'You watched the pour with Ines.',fx:()=>{facAdd('guild',3);G.cash+=20;return 'She tucks $20 of "bonus" into your hand and denies it.'}},
  {label:'Ask about the Slag Fire',text:'She gives you the quota number. It is a very large number.',att:14,hist:'Ines told you the quota number from the night of the Slag Fire.',fx:()=>{facAdd('guild',4);G.flags.inesLead=1;return 'You now know who signed off the night shift. The Guild will remember you asked.'}},
  {label:'Bring her a drink',text:'"I don\'t drink on the line." She drinks it.',att:8,hist:'Ines drank the drink you brought.',fx:()=>{G.cash+=25;facAdd('guild',2);return 'A favour from the boss: $25 appears in your pocket.'}}]},
 teo:{title:'Closing time',setup:'Teo flips the sign and sets two plates. "I cook for a hundred people a day. You\'re the first customer I\'ve sat down with."',choices:[
  {label:'Eat, ask nothing',text:'The food is very good. The silence is better.',att:14,hist:'Teo fed you and did not talk.',fx:()=>{G.inv.meals+=3;return 'He packs three meals for later and says nothing about it.'}},
  {label:'Ask where he learned to cook',text:'His mother\'s cookbook, every recipe crossed out and rewritten.',att:8,hist:'Teo showed you his mother\'s cookbook.',fx:()=>{G.hunger=clamp(G.hunger+30,0,100);return 'He writes one recipe on a napkin: "Salt last. Always last." You leave full.'}},
  {label:'Offer to wash up',text:'"The last person who did that asked for a raise."',att:8,hist:'You washed up at the diner with Teo.',fx:()=>{advance(45);G.cash+=25;return 'He pays you $25 for the dishes and calls it a shift.'}}]},
 mina:{title:'Light crates',setup:'Mina tosses you an apple. "The Greenbelt crates come in light again. Somebody\'s skimming. I have a guess and I\'d rather be wrong."',choices:[
  {label:'Help count the stock',text:'You count twice. The numbers do not improve.',att:8,hist:'You counted crates with Mina.',fx:()=>{facAdd('hall',2);G.inv.meals++;return 'She gives you a bag of the produce you just counted.'}},
  {label:'Say you\'ll ask around',text:'"I knew I liked you."',att:14,hist:'You told Mina you would find out who is skimming.',fx:()=>{facAdd('coop',3);return 'She whispers that radish prices are about to climb. The Co-op will like that you asked.'}},
  {label:'Tell her to let it go',text:'"Easy for you."',att:-8,hist:'Mina remembers who told her to let it go.',fx:()=>'She turns back to her scales.'}]},
 halloran:{title:'The wall',setup:'It is rent day, and Halloran does not ask for the rent. He points at a stain on the wall. "That wasn\'t there when I bought the block. The wall\'s two inches lower, too."',choices:[
  {label:'Look at the wall with him',text:'You both look at it for a while. It does not improve.',att:8,hist:'Halloran showed you the wall.',fx:()=>{G.cash+=30;return 'He quietly waives some of what you owe him: $30.'}},
  {label:'Say it\'s the fill',text:'"Everyone says fill."',att:14,hist:'You told Halloran it was the fill. He wrote it down.',fx:()=>{const c=clueNext(true);if(c)clueShow(c);return 'He lists the Grid lots that have been "settling" faster than the rest.'}},
  {label:'Pay early',text:'"You are my favourite tenant. Do not tell the others."',att:8,hist:'You paid Halloran early.',fx:()=>{G.cash+=15;return 'He knocks $15 off, with the air of a man committing a crime.'}}]}
};
function bondAvailable(n){return !!BONDS[n.id]&&!(G.bonds&&G.bonds[n.id])}
function bondScene(n){
  const B=BONDS[n.id];if(!B)return;cluesInit();
  ui(`<h2>${esc(B.title)}</h2><p>${esc(B.setup)}</p>`,B.choices.map((c,i)=>({label:c.label,cls:'',fn:()=>{
    G.bonds[n.id]=i+1;memAdd(n.id,c.att);if(c.vex&&NPC.vex)memAdd('vex',c.vex);
    histAdd('bond_'+n.id,c.hist);
    const r=c.fx();
    talk(n,`${c.text} ${r}`);
  }})));
}
