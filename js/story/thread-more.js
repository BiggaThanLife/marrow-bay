"use strict";
/* More personal threads: The Grudge, The Secret, Your Quirk. Each has five endings. Also the mission glue for The Collector. */
function threadMissionEnd(m,ok){
  if(!m||!m.thread)return;
  const th=G.threads.active.find(t=>t.tid===m.thread);if(!th)return;
  advanceThread(th,ok?m.next:m.fail,false);
}
function vexJob(th,kind,next,fail){
  const a=pick(JOB_POIS),b=pick(JOB_POIS.filter(x=>x!==a)),p=G.p;
  const d=man(Math.round(p.x),Math.round(p.y),POIS[a].ex,POIS[a].ey)+man(POIS[a].ex,POIS[a].ey,POIS[b].ex,POIS[b].ey);
  const base={thread:th.tid,next,fail,reward:0,i:0};
  if(kind==='courier')startMission({...base,type:'courier',title:'Vex: first job',stops:[a,b],deadline:G.t+d*.9+60});
  else startMission({...base,type:'collect',title:'Vex: second job',stops:[pick(['market','diner','gull','clinic','dock'])],deadline:G.t+480});
}
const worst=()=>NPCS.filter(n=>npcS(n).m<=-15).sort((a,b)=>npcS(a).m-npcS(b).m)[0];
THREADS.grudge={title:'The Grudge',from:'Someone who is angry',
 hook:()=>day()>=6&&!!worst(),
 start:()=>{const n=worst();return{who:n.id,person:n.name}},
 beats:{
  b1:{wait:0,ignore:'b2c',text:'{person} has been telling anyone who will listen what you did. They would like a word, or at least a witness.',choices:[
    {label:'Face them',next:'b2a'},
    {label:'Send a gift',sub:'$30',need:()=>G.cash>=30,fx:th=>{G.cash-=30;memAdd(th.roles.who,8)},next:'b2b'},
    {label:'Avoid them',next:'b2c'}]},
  b2a:{wait:1,ignore:'b3x',text:'{person} is waiting at the edge of the plaza. Voices rise. A pigeon leaves in protest.',choices:[
    {label:'Apologize',fx:th=>{memAdd(th.roles.who,10)},next:'b3'},
    {label:'Stand your ground',fx:th=>{memAdd(th.roles.who,-5);repAdd('Grid',-2)},next:'b3x'}]},
  b2b:{wait:1,ignore:'b3',text:'The gift comes back with a note: "I am not for sale. Mostly."',choices:[
    {label:'Add $60',sub:'$60',need:()=>G.cash>=60,fx:th=>{G.cash-=60;memAdd(th.roles.who,8)},next:'END:bought'},
    {label:'Leave it at that',next:'b3'}]},
  b2c:{wait:2,ignore:'END:forgotten',text:'{person} starts saying it louder. You can hear it from the other side of the street.',choices:[
    {label:'Finally talk to them',next:'b2a'},
    {label:'Wait it out',next:'END:forgotten'}]},
  b3:{wait:1,ignore:'END:forgotten',text:'{person} folds their arms. "What would it take?"',choices:[
    {label:'A favor at their work',fx:th=>{advance(120);memAdd(th.roles.who,12)},next:'END:reconciled'},
    {label:'Nothing. Just time.',next:'END:forgotten'}]},
  b3x:{wait:1,ignore:'END:rival',text:'It turns into a shouting match. People start taking sides. Several of them are wrong.',choices:[
    {label:'Walk away',next:'END:rival'},
    {label:'Make it public',fx:()=>{addRumor('defaulter',['cordelia','mina'])},next:'END:vendetta'}]}},
 endings:{
  reconciled:{name:'Reconciled',text:'You spend an afternoon helping. By the end of it you are, against all odds, on the same side of the same argument.',fx:th=>{memAdd(th.roles.who,15)},harbor:'HARBOR has marked the conflict "resolved" and the friendship "pending."'},
  bought:{name:'Bought off',text:'The extra $60 does what words could not. It is not respect, but it is quiet.',fx:th=>{memAdd(th.roles.who,5)},harbor:'HARBOR notes that quiet is often cheaper than peace.'},
  forgotten:{name:'Forgotten',text:'Another week, another scandal. Nobody remembers who {person} was angry at. Possibly not even {person}.',harbor:'HARBOR admires the half-life of outrage.'},
  rival:{name:'A rival for life',text:'{person} becomes a fixture in your life, like a puddle or a debt.',fx:th=>{memAdd(th.roles.who,-10);repAdd('Grid',-3)},harbor:'HARBOR has added "{person}" to a list titled "Persistent."'},
  vendetta:{name:'Vendetta',text:'The story gets out, and it gets bigger every time it is told. {person} swears an oath that is mostly alliteration.',fx:th=>{memAdd(th.roles.who,-30);repAdd('Grid',-5)},harbor:'HARBOR recommends not visiting {person} for a while. Also not in general.'}}};

THREADS.secret={title:'The Secret',from:'A folded note',
 hook:()=>day()>=15&&(has('disgraced')||known('thief')>=1||G.heat>=1.5||G.arrears>0),
 start:()=>{const n=NPC[pick(['pip','mina','halloran','gus'])];return{who:n.id,person:n.name}},
 beats:{
  b1:{wait:0,ignore:'b2b',text:'A folded note under your door. {person} knows something about your past. "Fifty dollars keeps it quiet," it says, in surprisingly good handwriting.',choices:[
    {label:'Pay $50',sub:'$50',need:()=>G.cash>=50,fx:()=>{G.cash-=50},next:'b2a'},
    {label:'Call the bluff',next:'b2b'},
    {label:'Confess first',next:'b2c'}]},
  b2a:{wait:2,ignore:'END:paid',text:'Two days later, a second note: "Another fifty, for the stamp." {person} is learning.',choices:[
    {label:'Pay again',sub:'$50',need:()=>G.cash>=50,fx:()=>{G.cash-=50},next:'END:paid'},
    {label:'Meet them in person',next:'b3'}]},
  b2b:{wait:2,ignore:'END:exposed',text:'Flyers appear on every lamppost between the plaza and the docks. They are not very good flyers. They are very specific.',choices:[
    {label:'Tear them down',sub:'Raises heat a little',fx:()=>{heatAdd(.5)},next:'END:silenced'},
    {label:'Threaten {person} back',next:'b3'},
    {label:'Do nothing',next:'END:exposed'}]},
  b2c:{wait:1,ignore:'END:honest',text:'You tell the right people first. They listen, a little longer than you expected.',choices:[
    {label:'Own it publicly',next:'END:honest'},
    {label:'Ask {person} to stay quiet',next:'b3'}]},
  b3:{wait:1,ignore:'END:silenced',text:'{person} looks smaller in person. They are scared too, and the money was never really the point.',choices:[
    {label:'Offer them a job',sub:'You pick up an accomplice',fx:th=>{memAdd(th.roles.who,12);G.cash-=20},need:()=>G.cash>=20,next:'END:accomplice'},
    {label:'Make them sign something',sub:'Not strictly legal',next:'END:silenced'}]}},
 endings:{
  paid:{name:'Paid',text:'You paid twice. The notes stopped. The feeling that someone has your number did not.',harbor:'HARBOR is not sure what you bought, but it is sure you bought it.'},
  exposed:{name:'Exposed',text:'The flyers did their work. For a week, you are the most interesting person in three districts.',fx:()=>{addRumor('thief',['mina','reyes','pip']);repAdd('Grid',-4)},harbor:'HARBOR has adjusted your public profile to "notable."'},
  honest:{name:'Honest',text:'You said it out loud, and the sky stayed where it was. Some people think better of you. Some think worse. All of them are listening.',fx:()=>{repAdd('Grid',3);repAdd('Highline',-2)},harbor:'HARBOR is moved. HARBOR is not allowed to be moved.'},
  accomplice:{name:'Accomplice',text:'{person} turns out to be useful, in the specific way of people who owe you. You pretend this is friendship.',fx:th=>{memAdd(th.roles.who,15)},harbor:'HARBOR has updated your list of contacts with the word "complicated."'},
  silenced:{name:'Silenced',text:'The secret stays secret. {person} has moved to another table at the Gull and will not make eye contact.',fx:th=>{memAdd(th.roles.who,-8)},harbor:'HARBOR has not heard anything. HARBOR has noted that it has not heard anything.'}}};

THREADS.quirk={title:'Your Quirk',from:'Your reflection',
 hook:()=>!!G.quirk&&day()>=12,
 start:()=>({q:QUIRKS[G.quirk].n.toLowerCase()}),
 beats:{
  b1:{wait:0,ignore:'b2a',text:'People have started noticing your {q}. Someone calls it charming. Someone else calls it a problem.',choices:[
    {label:'Lean into it',next:'b2a'},{label:'Try to hide it',next:'b2b'},{label:'Ask HARBOR what it thinks',next:'b2c'}]},
  b2a:{wait:1,ignore:'b3',text:'The Gazette wants to profile "the {q} of Marrow Bay." It will cost an afternoon and some dignity.',choices:[
    {label:'Do the interview',fx:()=>{advance(120);repAdd('Grid',2)},next:'b3'},
    {label:'Decline politely',next:'b3'}]},
  b2b:{wait:1,ignore:'b3',text:'Hiding it costs energy and a large number of small lies.',choices:[
    {label:'Keep hiding it',fx:()=>{G.energy=clamp(G.energy-10,0,100)},next:'b3'},
    {label:'Stop. Be yourself.',next:'b2a'}]},
  b2c:{wait:0,ignore:'b3',text:'HARBOR: "I have observed that your {q} is statistically common among people who are alive. I find that reassuring. I cannot tell you why."',choices:[
    {label:'Take that as advice',next:'b3'}]},
  b3:{wait:1,ignore:'END:outgrown',text:'A clinic seminar claims to cure "tendencies" for $80. A tavern owner would pay you to teach a class on yours. Your friends say it is up to you.',choices:[
    {label:'Pay to be cured',sub:'$80. Loses the perk and the cost.',need:()=>G.cash>=80,fx:()=>{G.cash-=80;G.quirk=null},next:'END:cured'},
    {label:'Teach a class on it',sub:'+$60 and a little fame',fx:()=>{G.cash+=60;advance(120)},next:'END:monetized'},
    {label:'Share it with a friend',fx:()=>{memAdd('gus',6);memAdd('mina',6)},next:'END:shared'},
    {label:'Embrace it fully',fx:()=>{G.flags.quirkEmbraced=1},next:'END:embraced'},
    {label:'Let it be',next:'END:outgrown'}]}},
 endings:{
  cured:{name:'Cured',text:'The seminar is mostly slides. When you leave you feel no different, except that you are $80 lighter and your {q} is gone.',harbor:'HARBOR marks the quirk "removed" and the person "slightly less recognizable."'},
  monetized:{name:'Monetized',text:'Twelve people attend. Eleven leave confused. One takes notes. You are, technically, a teacher now.',harbor:'HARBOR has filed your class under "adult education."'},
  shared:{name:'Shared',text:'You tell a friend about your {q} and they say, "me too." It is the best part of your week.',harbor:'HARBOR notes a measurable increase in "me too."'},
  embraced:{name:'Embraced',text:'You stop apologizing for your {q}. The odd thing is that other people stop noticing it.',fx:()=>{repAdd('Grid',2)},harbor:'HARBOR has changed your quirk status from "quirk" to "character."'},
  outgrown:{name:'Outgrown',text:'In the end it is just part of you, like a mole, or an opinion.',harbor:'HARBOR has archived this thread under "settled."'}}};

/* Tide's Cargo: the continuation of the opening's low-tide crate. Never picked by chance (hook is false); threadsDaily starts it by hand a few days after the opening. */
THREADS.tidecargo={title:"Tide's Cargo",from:'A number you do not recognise',
 hook:()=>false,
 start:()=>{const k=G.opening&&G.opening.kept;return {c:k?'the crate you kept':'the crate you handed in',w:k?'You spent the $40. The number did not go with it.':'You handed it in for $10. The number stayed in your head anyway.'}},
 beats:{
  b1:{wait:0,ignore:'b2',timeout:4,text:'A photo of a stencilled manifest number, MB-0417, and one line: "Is this yours?" You remember it on the side of {c}. {w}',choices:[
    {label:'Ask around the docks',sub:'An hour of questions',fx:()=>{advance(60);repAdd('Dockside',1)},next:'b2'},
    {label:'Ask HARBOR',next:'b2'},
    {label:'Leave it',next:'b2'}]},
  b2:{wait:1,ignore:'b3',timeout:4,text:'The Dockside harbor office keeps a ledger and does not like being asked about it. Somebody left it open on a counter. MB-0417 is on a page torn along the top: a Trust shipment, signed for by Vex Calloway, never marked delivered.',choices:[
    {label:'Copy the page',sub:'Quietly',next:'b3'},
    {label:'Take the page',sub:'Not strictly legal',fx:()=>{heatAdd(1)},next:'b3'},
    {label:'Put it back',next:'b3'}]},
  b3:{wait:1,ignore:'b4',timeout:4,text:'It adds up. The crate fell off a Trust and Vex shipment on a low tide, and nobody came back for it because the entry says the water was high. HARBOR, asked about it, says the harbor office tide tables put high water at 3:40 that night. The tide, as far as everyone who stood in it can tell, was already out. HARBOR then says it would like to change the subject.',choices:[
    {label:'Take it to Vex',next:'b4'},
    {label:'Take it to the harbor office',next:'b4'},
    {label:'Keep it to yourself',next:'b4'}]},
  b4:{wait:1,ignore:'END:quiet',timeout:5,text:'You know where the crate came from. The question is who should be embarrassed by that.',choices:[
    {label:'Tell Vex you know',sub:'He will want it quiet',fx:()=>{memAdd('vex',6);G.cash+=30},next:'END:vex'},
    {label:'File it with the harbor office',sub:'Dockside will approve. Vex will not.',fx:()=>{repAdd('Dockside',3);memAdd('vex',-8)},next:'END:filed'},
    {label:'Burn the page',next:'END:quiet'}]}},
 endings:{
  vex:{name:'Quiet money',text:'Vex reads the page twice and thanks you the way people thank a locksmith. An envelope arrives with $30 and no note.',fx:()=>{histAdd('tidecargo',"You told Vex where his crate had gone. It cost him nothing and paid you $30.",999)},harbor:'HARBOR notes that its tide tables and the tide disagree, and that only one of them is on the payroll.'},
  filed:{name:'On the record',text:'The harbor office stamps the page, files it and looks relieved to have a reason. The docks hear by lunch. Vex hears by the afternoon.',fx:()=>{histAdd('tidecargo',"You filed the crate's paperwork with the harbor office. Dockside noticed. So did Vex.",999)},harbor:'HARBOR would like it noted that the harbor office tide records and the tide do not match, and that HARBOR did not say so.'},
  quiet:{name:'Ash',text:'The page curls and goes. The crate was just a crate, as far as anyone will say.',fx:()=>{histAdd('tidecargo','You let the crate stay a mystery.',999)},harbor:'HARBOR still has the tide tables. They are still wrong.'}}};
