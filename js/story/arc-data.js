"use strict";
/* City arcs. Each: title, can() trigger, phases (name, days, blurb, enter, daily, actions), resolve(A) -> outcome key, outcomes {name,text,fx,harbor}, status(A). */
const STRIKE_EVT={id:'dockstrike_evt',sev:3,dur:[3,3],mk:()=>({name:'Dock strike',desc:'The piers are shut. Pickets line the gate and the cranes stand still.',mod:{closed:['dock'],traffic:{Dockside:.6}}})};
const LOCKOUT_EVT={id:'docklockout_evt',sev:3,dur:[4,4],mk:()=>({name:'Dock lockout',desc:'Harbor Freight has locked the gates. Nobody works until the union gives in.',mod:{closed:['dock'],traffic:{Dockside:.5}}})};
const STRIKE_RUMBLES=[
 'Dockers are muttering about the new cameras on the cranes. Some of them have started covering the lenses with their lunch bags.',
 'Gus is running a tab for anyone with a union card. The tab is getting long.',
 'Duarte posted a notice about shorter shifts. Someone drew a very detailed picture on it.',
 'Harbor Freight is hiring "flexible logistics partners." Nobody knows what that means, which is the point.'];
const ARCS={
 dockstrike:{
  title:'The Dock Dispute',district:'Dockside',
  hook:{min:8,need:6,who:'gus',yes:'Hear what Gus knows',no:'Not my fight',text:'Gus wipes the same glass for the third time. "You have been around the piers a lot lately, {name}. Cameras on the cranes, shorter shifts, a foreman who stopped making eye contact. Something is coming to a head. I can tell you what I know, if you want in."'},
  can:()=>true,
  status:A=>`Union strength ${Math.round(A.power)}/100.${A.stance?` You stand with ${A.stance==='union'?'the union':'Harbor Freight'}.`:' You have not picked a side.'}`,
  phases:[
   {name:'Rumbles',days:5,blurb:'Nothing has happened yet. Everyone is saying so loudly.',
    enter:A=>{news('Dockside is restless. Cameras went up on the cranes and shifts got shorter.',2);notify('News: Dockside is restless.')},
    daily:A=>{meterAdd('Dockside',-1);if(Math.random()<.6)news(pick(STRIKE_RUMBLES),1)}},
   {name:'Pressure',days:7,blurb:'Both sides want you. Your choices move the picket.',
    enter:A=>{
      A.power=clamp(A.power+(fact('flack_shipment_seen')?10:0),0,100);
      alertNews('News: Union and Harbor Freight stop talking. The piers may close within the week.',3);
      arcThread('picket')},
    daily:A=>{meterAdd('Dockside',-1)},
    actions:A=>[
      ...(!A.stance?[
        {label:'Join the union',sub:'Union up, freight down. Strength +5.',cls:'',fn:A=>{A.stance='union';facAdd('union',8);facAdd('shipping',-8);arcPower(5);return 'Gus puts your name on the list. It is a long list.'}},
        {label:'Side with Harbor Freight',sub:'Freight up, union down. Strength -5.',cls:'',fn:A=>{A.stance='freight';facAdd('shipping',8);facAdd('union',-8);arcPower(-5);return 'Duarte hands you a hi-vis vest that says PARTNER.'}}]:[]),
      {label:'Bring the pickets a meal',sub:G.inv.meals>0?'Uses a meal. Strength +3.':'You need a meal',off:G.inv.meals<1||!arcOnce(A,'meal'),cls:'',fn:A=>{G.inv.meals--;arcMark(A,'meal');facAdd('union',3);arcPower(3);return 'They eat standing up and call it a feast.'}},
      {label:'Organize the dockers',sub:G.fac.union>=5?'1 hour. Strength +4.':'You need union standing 5 first',off:G.fac.union<5||!arcOnce(A,'org'),cls:'',fn:A=>{advance(60);arcMark(A,'org');facAdd('union',2);arcPower(4);return 'Two meetings, one argument, a vote.'}},
      {label:'Work a scab shift',sub:'3 hours, $50. Strength -4, union furious.',off:G.energy<12||!arcOnce(A,'scab'),cls:'warn',fn:A=>{G.energy=clamp(G.energy-12,0,100);advance(180);G.cash+=50;arcMark(A,'scab');facAdd('shipping',3);facAdd('union',-5);arcPower(-4);return 'You earn $50 and several new enemies.'}},
      ...(G.flags.sawFlack7?[{label:'Tip the press about FLACK-7',sub:'Once. Strength +8. The Trust will not like it.',off:!arcOnce(A,'press'),cls:'',fn:A=>{arcMark(A,'press',true);arcPower(8);facAdd('trust',-3);flackAdd(-2);return 'The Gazette runs it on page three, next to the weather.'}}]:[])]},
   {name:'Breaking point',days:3,blurb:'The gates are shut. This is when it is decided.',
    enter:A=>{meterAdd('Dockside',-6);startEvent(STRIKE_EVT)},
    actions:A=>[
      {label:'Stand at the gate',sub:'2 hours. Strength +8. Police will note you.',off:G.energy<10||!arcOnce(A,'gate'),cls:'',fn:A=>{G.energy=clamp(G.energy-10,0,100);advance(120);arcMark(A,'gate');arcPower(8);facAdd('union',3);G.heat=Math.min(5,G.heat+.5);return 'You hold the line. Reyes writes something down.'}},
      {label:'Run a crane for freight',sub:'3 hours, $80. Strength -10.',off:G.energy<14||!arcOnce(A,'crane'),cls:'warn',fn:A=>{G.energy=clamp(G.energy-14,0,100);advance(180);G.cash+=80;arcMark(A,'crane');arcPower(-10);facAdd('shipping',4);facAdd('union',-6);return 'The crane works. The people below do not look up.'}},
      {label:'Broker a deal',sub:'Works if neither side has won. Outcome: compromise.',off:A.power<30||A.power>70||!arcOnce(A,'broker'),cls:'',fn:A=>{arcMark(A,'broker',true);A.broker=true;return 'You carry two napkins between two tables. Both sides say they will think about it.'}}]}],
  resolve:A=>A.broker&&A.power>=30&&A.power<=70?'compromise':A.power>=65?'union':A.power<=25?'lockout':A.power<=42?'freight':'compromise',
  outcomes:{
   union:{name:'Union victory',text:'Harbor Freight signs. The cranes come back with a union card on the cab door and a contract on the wall.',harbor:'HARBOR notes that the camera units on the cranes have been "misplaced."',
     fx:A=>{setFact('dock_union_contract');meterAdd('Dockside',14);flackAdd(-6);facAdd('union',8);facAdd('shipping',-6);let m='Dock pay is permanently better.';if(A.stance==='union'){G.cash+=100;m+=' The strike fund pays you $100.'}return m}},
   freight:{name:'Freight wins',text:'The union folds. The cranes run on a schedule nobody voted for, with a camera on every hook.',harbor:'HARBOR reports record efficiency. HARBOR was asked to say "record."',
     fx:A=>{setFact('dock_automated');meterAdd('Dockside',-6);flackAdd(10);facAdd('shipping',6);facAdd('union',-8);return 'Hauling pays less now, and cameras watch every lift.'}},
   compromise:{name:'A deal on a napkin',text:'Both sides claim they won. Shifts are fair and the cameras stay, pointed slightly away from the lunch tables.',harbor:'HARBOR has filed this under "agreement." HARBOR was not consulted.',
     fx:A=>{setFact('dock_compromise');meterAdd('Dockside',5);flackAdd(3);facAdd('union',2);facAdd('shipping',2);return 'Dock life settles into an uneasy truce.'}},
   lockout:{name:'Lockout',text:'The gates stay shut. Harbor Freight breaks the union with a lawyer and a locksmith. People leave for other districts.',harbor:'HARBOR regrets that the word "fair" was not in the contract.',
     fx:A=>{setFact('union_broken');setFact('dock_lockout');meterAdd('Dockside',-10);flackAdd(6);facAdd('union',-12);facAdd('shipping',4);startEvent(LOCKOUT_EVT);return 'The docks stay shut four more days. The union is gone.'}}}}
};
/* Personal thread tied to the dock arc. Starts when the Pressure phase begins and counts toward your two active threads. */
THREADS.picket={title:'The Picket Line',from:'Gus',hook:()=>false,
 beats:{
  b1:{wait:0,ignore:'b2',text:'Gus, low: "Freight is bringing in a replacement crew by the east gate at dawn. Somebody has to be there."',choices:[
    {label:'Be at the east gate',fx:()=>{arcPower(5)},next:'b2'},
    {label:'Send Pip with a warning',fx:()=>{arcPower(2);memAdd('pip',3)},next:'b2'},
    {label:'Stay out of it',fx:()=>{arcPower(-3)},next:'b2'}]},
  b2:{wait:2,ignore:'b3',text:'A Harbor Freight supervisor finds you at the Gull and slides an envelope onto the bar. "$120 for looking the other way. This is not a bribe. It is a gratuity."',choices:[
    {label:'Take the envelope',fx:()=>{G.cash+=120;arcPower(-6);facAdd('union',-6)},next:'b3'},
    {label:'Push it back',fx:()=>{arcPower(4);facAdd('union',2)},next:'b3'}]},
  b3:{wait:2,ignore:'END:walkaway',text:'The night before the gates close. Gus asks what you are actually going to do.',choices:[
    {label:'Stand with the dockers',fx:()=>{arcPower(6);facAdd('union',4)},next:'END:solidarity'},
    {label:'Cross for freight',fx:()=>{arcPower(-8);facAdd('shipping',5);facAdd('union',-5)},next:'END:scab'},
    {label:'Chain yourself to the gate',sub:'Heat up, strength up',fx:()=>{arcPower(10);G.heat=Math.min(5,G.heat+2)},next:'END:martyr'},
    {label:'Leak the FLACK-7 photo',need:()=>!!G.flags.sawFlack7,fx:()=>{arcPower(8);flackAdd(-2);facAdd('trust',-3)},next:'END:whistle'},
    {label:'Walk away',next:'END:walkaway'}]}},
 endings:{
  solidarity:{name:'Solidarity',text:'You stand at the gate with the others until the sun comes up. Nobody says anything. It is enough.',fx:()=>{memAdd('gus',10);addRumor('picketHero',['gus','duarte'],{dist:'Dockside'})},harbor:'HARBOR has noted a rise in standing near gates.'},
  scab:{name:'Crossed the line',text:'The gate opens and you walk through it. The pickets watch you go. Duarte says "good", which is somehow worse.',fx:()=>{memAdd('gus',-15);memAdd('duarte',8);addRumor('scab',['gus','duarte'],{dist:'Dockside'})},harbor:'HARBOR has logged your shift as "voluntary."'},
  martyr:{name:'Chained to the gate',text:'The bolt cutters take twenty minutes. The Gazette takes a photo. Gus puts it on the wall of the Gull.',fx:()=>{memAdd('gus',12);memAdd('reyes',-8);addRumor('picketHero',['gus','reyes'],{dist:'Dockside'})},harbor:'HARBOR has added you to a list that is not a list.'},
  whistle:{name:'Whistleblower',text:'The photo is on three desks by noon. Nobody knows who sent it. Everybody has a theory, and one of them is correct.',fx:()=>{memAdd('gus',8);memAdd('cordelia',-6)},harbor:'HARBOR did not see the photo. HARBOR saw it twice.'},
  walkaway:{name:'Walked away',text:'You go home. The gate closes without you. History rarely asks who was absent.',harbor:'HARBOR admires your commitment to staying indoors.'}}};
/* Start a thread now if there is room, otherwise it will start as soon as one finishes. */
function arcThread(id){
  const S=G.threads;
  if(S.active.some(t=>t.tid===id)||S.done.some(t=>t.tid===id))return;
  if(S.active.length>=2){G.arc&&(G.arc.waitThread=id);return}
  S.active.push({tid:id,beat:'b1',due:G.t+60*ri(2,6),pending:false,since:0,log:[],roles:{}});
  S.lastStart=day();
}
