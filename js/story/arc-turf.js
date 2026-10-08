"use strict";
/* The Neon Mile turf war: Vex against the Salt Kings. */
const TURF_EVT={id:'turf_evt',sev:3,dur:[3,3],mk:()=>({name:'Turf war',desc:'Shutters come down along the Neon Mile. The casino and the Velvet Room are shut and patrols are everywhere.',mod:{closed:['casino','velvet'],cops:true,traffic:{'Neon Mile':.4}}})};
ARCS.turfwar={
  title:'The Salt War',district:'Neon Mile',
  hook:{min:18,need:6,who:'vex',yes:'Listen to Vex',no:'Not tonight',text:'Vex taps the table. "You have been spending time in my part of town, {name}. People in white jackets keep asking about you. Let me tell you who they are before they tell you themselves."'},
  can:()=>true,
  status:A=>`Vex's side ${Math.round(A.power)}/100.${A.stance?` You are with ${A.stance==='vex'?'Vex':'the Salt Kings'}.`:' You are with nobody. It is lonely, and safe.'}${A.tips?` You have tipped off Reyes ${A.tips}x.`:''}`,
  phases:[
   {name:'Rumbles',days:5,blurb:'Strangers in salt-white jackets keep asking where the money goes.',
    enter:A=>{news('Newcomers in salt-white jackets are scouting the Neon Mile. Vex has been seen smiling at nothing.',2)},
    daily:A=>{meterAdd('Neon Mile',-1);if(Math.random()<.6)news(pick(['A bouncer at the Velvet Room is replaced overnight.','Somebody paints a small white crown on the pawn shop door.','Vex changes his order at the casino bar. Twice.','Dagny Salt is said to eat breakfast at midnight.']),1)}},
   {name:'Pressure',days:7,blurb:'Both crews want your name. Your choices tilt the Mile.',
    enter:A=>{
      const vex=RACKETS.filter(r=>G.turf[r.id]==='vex');
      vex.sort(()=>Math.random()-.5).slice(0,2).forEach(r=>{G.turf[r.id]='salt'});
      alertNews('News: The Salt Kings take two Neon Mile corners. Vex answers with a funeral for a very small dog.',3)},
    daily:A=>{meterAdd('Neon Mile',-1)},
    actions:A=>[
      ...(!A.stance?[
        {label:'Side with Vex',sub:'Crew up. Salt Kings furious. Strength +5.',cls:'',fn:A=>{A.stance='vex';facAdd('crew',8);facAdd('salt',-8);arcPower(5);return 'Vex pours you something expensive and offers no receipt.'}},
        {label:'Side with the Salt Kings',sub:'Salt up. Vex furious. Strength -5.',cls:'',fn:A=>{A.stance='salt';facAdd('salt',8);facAdd('crew',-8);arcPower(-5);return 'Dagny Salt shakes your hand. It is a very long handshake.'}}]:[]),
      {label:'Scout their stash house',sub:'1 hour. Strength shifts 4 toward your side.',off:!A.stance||!arcOnce(A,'scout'),cls:'',fn:A=>{advance(60);arcMark(A,'scout');arcPower(A.stance==='vex'?4:-4);return 'You count crates, guards, and one confused cat.'}},
      {label:'Sabotage a shipment',sub:'Energy, heat up. Strength shifts 5 toward your side.',off:!A.stance||G.energy<10||!arcOnce(A,'sab'),cls:'warn',fn:A=>{G.energy=clamp(G.energy-10,0,100);advance(90);arcMark(A,'sab');arcPower(A.stance==='vex'?5:-5);addRumor('saboteur',['duarte',...knowersNear('Dockside',2)],{dist:'Dockside'});G.heat=Math.min(5,G.heat+1);return 'A shipment of something becomes a puddle of something else.'}},
      {label:'Hire muscle',sub:'$100. Strength shifts 4 toward your side.',off:!A.stance||G.cash<100||!arcOnce(A,'muscle'),cls:'',fn:A=>{G.cash-=100;arcMark(A,'muscle');arcPower(A.stance==='vex'?4:-4);return 'They arrive in a van marked FLORIST.'}},
      {label:'Tip off Reyes',sub:'Up to 2 times. City Hall up, both crews down.',off:(A.tips||0)>=2||!arcOnce(A,'tip'),cls:'',fn:A=>{A.tips=(A.tips||0)+1;arcMark(A,'tip');facAdd('hall',3);facAdd('crew',-4);facAdd('salt',-4);return 'Reyes writes it down and does not say thank you.'}}]},
   {name:'Breaking point',days:3,blurb:'The shutters are down. By the end of the third night, somebody owns the Mile.',
    enter:A=>{meterAdd('Neon Mile',-6);startEvent(TURF_EVT)},
    actions:A=>[
      {label:'Fight in the alley',sub:'Strength shifts 8 toward your side. Costs energy and heat.',off:!A.stance||G.energy<14||!arcOnce(A,'fight'),cls:'warn',fn:A=>{G.energy=clamp(G.energy-14,0,100);advance(120);arcMark(A,'fight');arcPower(A.stance==='vex'?8:-8);G.heat=Math.min(5,G.heat+1);return 'You come out of the alley with fewer teeth than you went in with.'}},
      {label:'Broker a truce',sub:'Works if neither side has won.',off:A.power<35||A.power>65||!arcOnce(A,'truce'),cls:'',fn:A=>{arcMark(A,'truce',true);A.truce=true;return 'Two crews, one table, a lot of pointing.'}},
      {label:'Hand Reyes the ledgers',sub:'A raid will come for both of them.',off:(A.tips||0)>=2||!arcOnce(A,'ledger'),cls:'warn',fn:A=>{A.tips=(A.tips||0)+1;arcMark(A,'ledger',true);facAdd('hall',4);return 'The ledgers leave in a paper bag. Reyes counts the pages.'}}]}],
  resolve:A=>(A.tips||0)>=2?'raid':A.truce&&A.power>=35&&A.power<=65?'truce':A.power>=60?'vex':A.power<=40?'salt':'truce',
  outcomes:{
   vex:{name:"Vex holds the Mile",text:'The Salt Kings drift out of town in a convoy of white vans. Vex is magnanimous in a way that feels like a receipt.',harbor:'HARBOR has noted that the number of people who "saw nothing" has risen.',
     fx:A=>{setFact('vex_rules_neon');RACKETS.forEach(r=>{if(G.turf[r.id]!=='player')G.turf[r.id]='vex'});meterAdd('Neon Mile',10);if(A.stance==='vex'){facAdd('crew',6);G.cash+=120;return 'Vex hands you $120 in a cigar box.'}return ''}},
   salt:{name:'The Salt Kings win',text:'Vex vanishes in the night. Dagny Salt sits at the Velvet Room corner table like she has always been there.',harbor:'HARBOR has updated Vex Calloway to "unavailable" and is not sure why it feels bad.',
     fx:A=>{setFact('vex_jailed');setFact('salt_kings_rule');RACKETS.forEach(r=>{if(G.turf[r.id]!=='player')G.turf[r.id]='salt'});meterAdd('Neon Mile',4);facAdd('crew',-6);if(A.stance==='salt'){facAdd('salt',6);G.cash+=120;return 'Dagny Salt pays you $120 and a compliment.'}return ''}},
   truce:{name:'A truce on a napkin',text:'The Mile is split down the middle and nobody likes it. The shutters come up. Business is brisk and slightly tense.',harbor:'HARBOR has noted a rise in people looking over their shoulders.',
     fx:A=>{setFact('neon_truce');meterAdd('Neon Mile',4);const rs=RACKETS.filter(r=>G.turf[r.id]!=='player');rs.forEach((r,i)=>{G.turf[r.id]=i%2?'salt':'vex'});return 'The rackets are split between the two crews.'}},
   raid:{name:'Reyes raids the Mile',text:'Reyes does not pick a side. She raids both of them in a single dawn. By breakfast the Neon Mile has fewer lights and many more clipboards.',harbor:'HARBOR has been asked to compile a list. It has compiled a list. It would like you to know it did not enjoy it.',
     fx:A=>{setFact('neon_raid');RACKETS.forEach(r=>{if(G.turf[r.id]!=='player')G.turf[r.id]='none'});meterAdd('Neon Mile',-15);meterAdd('Grid',8);flackAdd(4);facAdd('hall',4);facAdd('crew',-4);facAdd('salt',-4);return 'Every racket that was not yours is shut.'}}}
};
