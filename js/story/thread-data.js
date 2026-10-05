"use strict";
/* The story thread templates and endings. */
const THREADS={
 collector:{title:'The Collector',from:'Unknown number',
  hook:()=>G.debt>0&&day()-G.loanDay>=3,
  beats:{
   b1:{wait:0,ignore:'b2a',text:'"Your debt was sold. They would like a word."',choices:[
     {label:'Pay in full now',sub:()=>money(G.debt),need:()=>G.cash>=G.debt,fx:()=>{G.cash-=G.debt;G.debt=0;memAdd('cordelia',8)},next:'END:cleared'},
     {label:'Ignore it',next:'b2a'},{label:'Call back',next:'b2b'}]},
   b2a:{wait:2,ignore:'END:ruined',text:'Two days later a collector in a very clean coat is waiting outside your door. "{name}. We should settle this."',choices:[
     {label:'Pay with a $25 fee',sub:()=>money(G.debt+25),need:()=>G.cash>=G.debt+25,fx:()=>{G.cash-=G.debt+25;G.debt=0},next:'END:costly'},
     {label:'Run',fx:()=>{heatAdd(1.5);addRumor('defaulter',['cordelia','mina'])},next:'END:ruined'}]},
   b2b:{wait:1,ignore:'b2a',text:'Vex Calloway gets to the point in the Velvet Room. "I bought your paper. I can be reasonable. I can also be useful."',choices:[
     {label:'Pay with 20% interest',sub:()=>money(G.debt*1.2),need:()=>G.cash>=Math.round(G.debt*1.2),fx:()=>{G.cash-=Math.round(G.debt*1.2);G.debt=0},next:'END:costly'},
     {label:'Work it off',next:'b3'}]},
   b3:{wait:1,ignore:'END:ruined',text:'Vex has two jobs for you. The first is a delivery, nothing more. Do it before the deadline or this gets expensive.',choices:[
     {label:'Run the first job',sub:'A real delivery. Check your phone for the route.',fx:th=>{vexJob(th,'courier','b4','END:ruined')},next:'b3w'},
     {label:'Tip off Reyes',fx:()=>{memAdd('reyes',10);memAdd('vex',-20);addRumor('informant',['vex','pip']);G.debt=0},next:'END:informant'}]},
   b3w:{wait:9999,ignore:'END:ruined',text:'You are on the clock for Vex.',choices:[{label:'Wait',next:'b3w'}]},
   b4:{wait:0,ignore:'END:ruined',text:'The first job went fine. The second smells like a setup, and a constable is two streets away.',choices:[
     {label:'Do the second job',sub:'A shakedown. Raises heat.',fx:th=>{vexJob(th,'collect','END:ally','END:ruined')},next:'b4w'},
     {label:'Tip off Reyes',fx:()=>{memAdd('reyes',10);memAdd('vex',-20);addRumor('informant',['vex','pip']);G.debt=0},next:'END:informant'}]},
   b4w:{wait:9999,ignore:'END:ruined',text:'You are on the clock for Vex.',choices:[{label:'Wait',next:'b4w'}]}},
  endings:{
   cleared:{name:'Cleared',text:'The debt is gone and so is the stranger. Cordelia nods at you in the street. It is almost warm.',fx:()=>repAdd('Highline',3),harbor:'HARBOR commends your proactive relationship with money.'},
   costly:{name:'Costly',text:'You paid it all, plus the cost of being difficult. Your wallet files a complaint.',harbor:'HARBOR has marked the transaction "character building".'},
   ruined:{name:'Ruined',text:'Debt collection was not a request. Your name is on the wrong list now.',fx:()=>{G.debt=0;return seizeProperty()},harbor:'HARBOR regrets to inform you that regret is not refundable.'},
   ally:{name:'Vex ally',text:'The job goes sideways in just the right way. Vex tears up your paper and looks at you like an asset.',fx:()=>{G.debt=0;memAdd('vex',8);G.cash+=60;return 'Vex pays you $60.'},harbor:'HARBOR was not present. HARBOR does not have an alibi, either.'},
   informant:{name:'Informant',text:'Reyes gets her collar. Vex gets a reason to remember your face.',harbor:'HARBOR salutes your civic spirit and your new enemies.'}}},
 rival:{title:'The Rival',from:'Staff gossip',
  hook:()=>bizPlain().length>0&&day()>=8,
  start:()=>{const b=pick(bizPlain());return{rival:pick(WN)+' '+pick(LN),type:BT[b.type].n.toLowerCase(),d:b.d,key:b.key}},
  beats:{
   b1:{wait:0,ignore:'b2a',text:'{rival} just opened a {type} two blocks from yours in the {d}. Their prices are insultingly low.',choices:[
     {label:'Undercut them',next:'b2a'},{label:'Go introduce yourself',next:'b2b'}]},
   b2a:{wait:3,ignore:'END:truce',text:'The price war is on. Your till is thinner and so is theirs. {rival} sends a note: "Truce?"',choices:[
     {label:'Keep fighting',sub:()=>'$80 in promotions',need:()=>G.cash>=80,fx:()=>{G.cash-=80},next:'END:warwin'},
     {label:'Call a truce',next:'END:truce'}]},
   b2b:{wait:1,ignore:'END:mentor',text:'Over coffee, {rival} admits they are undercapitalized and a little afraid of you.',choices:[
     {label:'Offer a supply deal',next:'END:partner'},{label:'Sabotage their stock',next:'END:sabotage'},{label:'Trade advice for a favor',next:'END:mentor'}]}},
  endings:{
   warwin:{name:'Price war won',text:'You bury them, loudly. The neighborhood notices the noise more than the prices.',fx:th=>{const b=bizOf(th.roles.key);repAdd(th.roles.d,-2);if(b){b.till+=150;return 'Your till picks up $150.'}},harbor:'HARBOR notes that competition is just cooperation with worse manners.'},
   truce:{name:'Truce',text:'You split the street like adults. Both of you keep the lights on.',fx:th=>repAdd(th.roles.d,3),harbor:'HARBOR was rooting for chaos and is disappointed.'},
   partner:{name:'Partners',text:'You swap suppliers and shave costs on both sides. Neither of you says "synergy" out loud.',fx:th=>{const b=bizOf(th.roles.key);repAdd(th.roles.d,3);if(b){b.supplies+=25;return 'Your shop gets 25 supplies.'}},harbor:'HARBOR has added "synergy" to the list of banned words.'},
   sabotage:{name:'Sabotage',text:'Their stock does not survive the night. Neither does your clean reputation.',fx:()=>{heatAdd(1.5);addRumor('thief',['pip','mina']);G.cash+=40;return 'You pocket $40 in salvage.'},harbor:'HARBOR saw nothing. HARBOR is very good at that.'},
   mentor:{name:'Mentor',text:'You trade a few tricks for a favor owed. {rival} will remember it kindly, for now.',fx:th=>{repAdd(th.roles.d,2);G.cash+=60;return 'They repay you $60.'},harbor:'HARBOR classifies this as "networking".'}}},
 ghost_farm:{title:'The Salted Fields',from:'Old Wren',
  hook:()=>G.bg==='farm'&&day()>=5,
  beats:{
   b1:{wait:0,ignore:'END:abandoned',text:'"Something is eating the Greenbelt plots at night. I think a city someone is salting the soil. Can you come look? You know dirt."',choices:[
     {label:'Go and look',next:'b2a'},{label:'Send $40 for seed',need:()=>G.cash>=40,fx:()=>{G.cash-=40},next:'END:patron'},{label:'Not my problem',next:'END:abandoned'}]},
   b2a:{wait:1,ignore:'END:denial',text:'You find white salt crystals and tire tracks heading toward the Dockside. Wren watches you, waiting.',choices:[
     {label:'Follow the tracks',next:'END:culprit'},{label:'Salt their docks right back',next:'END:revenge'},{label:'Tell Wren it was just weather',next:'END:denial'}]}},
  endings:{
   patron:{name:'Patron',text:'Wren buys seed with your money and tells everyone about it, loudly, twice.',fx:()=>{repAdd('Greenbelt',6);memAdd('wren',10)},harbor:'HARBOR is not touched. HARBOR does not have a heart. Allegedly.'},
   abandoned:{name:'Abandoned',text:'The fields stay sick. Wren does not call again.',fx:()=>{repAdd('Greenbelt',-6);memAdd('wren',-10)},harbor:'HARBOR has filed this under "weather".'},
   culprit:{name:'Culprit found',text:'A Dockside crew was dumping brine. Their foreman pays for the damage and pretends he never saw you.',fx:()=>{G.cash+=60;repAdd('Dockside',-5);repAdd('Greenbelt',5);memAdd('duarte',-6);return 'You collect $60 in damages.'},harbor:'HARBOR admires the efficiency of a good grudge.'},
   revenge:{name:'Revenge',text:'Salt on the planks, salt in the soil. Nobody wins, but the story is excellent.',fx:()=>{repAdd('Dockside',-10);repAdd('Greenbelt',8);heatAdd(1)},harbor:'HARBOR has seasoned the incident report accordingly.'},
   denial:{name:'Denial',text:'Wren nods the way people nod when they have stopped believing you.',fx:()=>{repAdd('Greenbelt',-4);memAdd('wren',-5)},harbor:'HARBOR agrees. It was weather.'}}},
 ghost_dock:{title:'The Union Ledger',from:'Foreman Duarte',
  hook:()=>G.bg==='dock'&&day()>=5,
  beats:{
   b1:{wait:0,ignore:'END:walked',text:'"The union fund is short. Your family name is on the ledger from the last count. Come look at it with me."',choices:[
     {label:'Check the ledger',next:'b2a'},{label:'Pay $50 and move on',need:()=>G.cash>=50,fx:()=>{G.cash-=50},next:'END:paid'},{label:'Walk away',next:'END:walked'}]},
   b2a:{wait:1,ignore:'END:quiet',text:'The entry next to your family name is forged. The handwriting is a banker\'s.',choices:[
     {label:'Expose it publicly',next:'END:exposed'},{label:'Blackmail the forger',next:'END:blackmail'},{label:'Fix the ledger quietly',next:'END:quiet'}]}},
  endings:{
   paid:{name:'Paid up',text:'Duarte takes the cash, stamps the page, and says nothing. It is the highest praise available.',fx:()=>{repAdd('Dockside',3);memAdd('duarte',4)},harbor:'HARBOR records this as "solidarity (invoiced)".'},
   walked:{name:'Walked away',text:'Your name stays on the wrong line. The line gets longer.',fx:()=>{repAdd('Dockside',-5);memAdd('duarte',-6)},harbor:'HARBOR admires your commitment to unresolved items.'},
   exposed:{name:'Exposed',text:'You read the forgery aloud on the pier. The Dockside cheers. The Highline stops returning calls.',fx:()=>{repAdd('Dockside',10);repAdd('Highline',-8)},harbor:'HARBOR has scheduled a brief panic on the Highline.'},
   blackmail:{name:'Blackmail',text:'The forger pays in cash and in fear. Duarte does not ask where the money came from.',fx:()=>{G.cash+=120;heatAdd(1);memAdd('duarte',-4);return 'You collect $120.'},harbor:'HARBOR reminds you that all income is, in a sense, freelance.'},
   quiet:{name:'Quietly fixed',text:'The ledger balances and nobody asks why. Duarte nods slowly, like a tide going out.',fx:()=>{memAdd('duarte',8);repAdd('Dockside',4)},harbor:'HARBOR was never here, and neither was the problem.'}}},
 ghost_banker:{title:'The Collapse File',from:'Cordelia Vance',
  hook:()=>G.bg==='banker'&&day()>=5,
  beats:{
   b1:{wait:0,ignore:'END:silent',text:'"The collapse inquiry has reopened. They want a statement, and your name is the first one on the page. Do not call me. Call a lawyer."',choices:[
     {label:'Give a statement',next:'b2a'},{label:'Stay silent',next:'END:silent'},{label:'Burn your copy of the file',next:'END:burned'}]},
   b2a:{wait:1,ignore:'END:silent',text:'The investigator slides a pen across the table. "Whenever you are ready, {name}."',choices:[
     {label:'Tell the truth',next:'END:truth'},{label:'Blame a colleague',next:'END:blame'},{label:'Bribe the clerk',sub:()=>'$100',need:()=>G.cash>=100,fx:()=>{G.cash-=100},next:'END:bribe'}]}},
  endings:{
   silent:{name:'Silent',text:'Nobody asks again. The silence sits on your shoulder like a very polite crow.',fx:()=>repAdd('Highline',-4),harbor:'HARBOR is legally required to find this suspicious and has chosen to be fond of it.'},
   burned:{name:'Burned',text:'The file makes a lovely fire. Some of the people watching it do not look like friends.',fx:()=>{heatAdd(1);memAdd('vex',4)},harbor:'HARBOR has updated your threat model to "arsonist, but organized".'},
   truth:{name:'The truth',text:'You say it plainly. It costs you the last of the Highline\'s goodwill and wins you the docks\' respect.',fx:()=>{repAdd('Highline',6);repAdd('Dockside',6)},harbor:'HARBOR is surprised. HARBOR checks the logs. HARBOR is still surprised.'},
   blame:{name:'Scapegoat',text:'The colleague takes it hard. Cordelia nods like a banker who has seen it done better.',fx:()=>{repAdd('Highline',4);repAdd('Dockside',-6);memAdd('cordelia',6)},harbor:'HARBOR admires your gift for plausible deniability.'},
   bribe:{name:'Bribed',text:'The clerk loses the page and finds your name pleasant. Reyes will hear about it eventually.',fx:()=>{memAdd('reyes',-6)},harbor:'HARBOR has no comment, in the sense that it is billing you for the comment.'}}},
 ghost_artist:{title:'The Stolen Sketchbook',from:'Pip',
  hook:()=>G.bg==='artist'&&day()>=5,
  beats:{
   b1:{wait:0,ignore:'END:letgo',text:'"Somebody on the Neon Mile is selling pages from a sketchbook. It looks like yours. Want me to point?"',choices:[
     {label:'Hunt down the seller',next:'b2a'},{label:'Let it go',next:'END:letgo'},{label:'Claim it on the Plaza',next:'END:claimed'}]},
   b2a:{wait:1,ignore:'END:letgo',text:'The seller is a polite man in a very expensive jacket with three more of your pages.',choices:[
     {label:'Buy it back',sub:()=>'$60',need:()=>G.cash>=60,fx:()=>{G.cash-=60},next:'END:bought'},{label:'Steal it back',next:'END:stolen'},{label:'Make him pay full price',next:'END:collector'}]}},
  endings:{
   letgo:{name:'Let go',text:'It was only paper. Somewhere a stranger pins your best line over their couch.',harbor:'HARBOR admires non-attachment and has scheduled a reminder to invoice you for it.'},
   claimed:{name:'Claimed',text:'You tell the Plaza the whole story. Half the crowd claps. The other half asks for sketches.',fx:()=>{repAdd('Grid',4);repAdd('Neon Mile',3)},harbor:'HARBOR has registered you as "a public nuisance of exceptional quality".'},
   bought:{name:'Bought back',text:'You pay for your own work. It is the worst deal you have ever loved.',fx:()=>repAdd('Grid',2),harbor:'HARBOR calls this "the art market".'},
   stolen:{name:'Stolen back',text:'Technically it was already yours. Legally it was a lot of paperwork.',fx:()=>{heatAdd(1.5);repAdd('Neon Mile',3)},harbor:'HARBOR is in no position to comment on the legal definition of "yours".'},
   collector:{name:'Collector',text:'He hands you an astonishing sum for the rest, and a card with a very small name on it.',fx:()=>{G.cash+=80;repAdd('Highline',5);return 'He pays you $80.'},harbor:'HARBOR has added "art dealer" to your threat list, as a courtesy.'}}}
};
