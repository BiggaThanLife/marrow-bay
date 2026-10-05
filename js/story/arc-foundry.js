"use strict";
/* The Foundry accident: expose it, bury it, or profit from it. */
const FIRE_EVT={id:'slagfire_evt',sev:3,dur:[3,3],mk:()=>({name:'Slag fire',desc:'A vat has failed at Iron Works. The furnace hall is shut and the Foundry smells like a lit match in a pencil case.',mod:{closed:['foundry'],traffic:{'Foundry Row':.5},drain:1.2}})};
ARCS.foundry={
  title:'The Slag Fire',district:'Foundry Row',
  hook:{min:12,need:6,who:'ines',yes:'Hear her out',no:'Not my business',text:'Ines Park finds you at the gate, soot to the elbows. "{name}. You have been in and out of my yard enough that I know your boots. There is something about the furnace line I would rather say to someone who is not on the Guild payroll."'},
  can:()=>foundryOpen(),
  status:A=>`Exposure ${A.expose||0}, cover-up ${A.cover||0}, salvage ${A.profit||0}.`,
  phases:[
   {name:'Rumbles',days:5,blurb:'Pressure gauges are being set to "optimistic."',
    enter:A=>{news('Foundry Row is running the furnaces hot to hit a quota. Workers say the gauges are being set by hand.',2)},
    daily:A=>{meterAdd('Foundry Row',1);if(Math.random()<.6)news(pick(['A foreman paints over a crack in the vat housing.','Ash falls on the Greenbelt side of the bridge.','The Guild orders a new safety slogan. It is the same as the old safety slogan.','Mack Torres stops letting people borrow his good wrench.']),1)}},
   {name:'Pressure',days:7,blurb:'An inspector is in town. Everyone has an envelope.',
    enter:A=>{alertNews('News: A city inspector arrives at Iron Works. The Guild offers lunch and a tour of a very clean room.',3)},
    daily:A=>{meterAdd('Foundry Row',1)},
    actions:A=>[
      {label:'Collect the safety logs',sub:'1 hour. Exposure +2. The Guild will not like it.',off:!arcOnce(A,'logs'),cls:'',fn:A=>{advance(60);arcMark(A,'logs');A.expose=(A.expose||0)+2;facAdd('guild',-3);return 'The logs are very long and mostly crossed out.'}},
      {label:'Warn the night shift',sub:'Exposure +1, union standing up.',off:!arcOnce(A,'warn'),cls:'',fn:A=>{arcMark(A,'warn');A.expose=(A.expose||0)+1;facAdd('union',2);return 'Three of them thank you. One tells the foreman.'}},
      {label:"Take Ines's envelope",sub:'$150. Cover-up +2, exposure -1.',off:!arcOnce(A,'env'),cls:'warn',fn:A=>{G.cash+=150;arcMark(A,'env',true);A.cover=(A.cover||0)+2;A.expose=Math.max(0,(A.expose||0)-1);facAdd('guild',4);return 'The envelope is thick. It is also warm.'}},
      {label:'Buy salvage rights',sub:'$200. Salvage +2.',off:G.cash<200||!arcOnce(A,'rights'),cls:'',fn:A=>{G.cash-=200;arcMark(A,'rights',true);A.profit=(A.profit||0)+2;facAdd('guild',1);return 'A stamped paper says anything that falls is yours.'}}]},
   {name:'Breaking point',days:3,blurb:'A vat fails. The furnace hall goes quiet in the worst way.',
    enter:A=>{meterAdd('Foundry Row',-6);G.flats=clamp(G.flats+20,0,100);startEvent(FIRE_EVT)},
    actions:A=>[
      {label:'Pull workers from the hall',sub:'Energy. Exposure +2.',off:G.energy<12||!arcOnce(A,'pull'),cls:'',fn:A=>{G.energy=clamp(G.energy-12,0,100);advance(90);arcMark(A,'pull');A.expose=(A.expose||0)+2;facAdd('guild',-2);facAdd('union',2);return 'You carry two men out and a very heavy cat. Everyone lives.'}},
      {label:'Photograph the damage',sub:'Exposure +2.',off:!arcOnce(A,'photo'),cls:'',fn:A=>{arcMark(A,'photo');A.expose=(A.expose||0)+2;return 'The photos are time-stamped. HARBOR pretends not to notice the timestamps.'}},
      {label:'Haul out salvage',sub:'3 hours, $80. Salvage +2.',off:G.energy<14||!arcOnce(A,'haul'),cls:'warn',fn:A=>{G.energy=clamp(G.energy-14,0,100);advance(180);G.cash+=80;arcMark(A,'haul');A.profit=(A.profit||0)+2;G.inv.scrap+=8;return 'Good steel, slightly warm. $80 and eight scrap.'}},
      {label:'Help bury the report',sub:'Cover-up +2. The Guild pays you back later.',off:!arcOnce(A,'bury'),cls:'warn',fn:A=>{arcMark(A,'bury');A.cover=(A.cover||0)+2;facAdd('guild',4);return 'The report becomes a different report.'}}]}],
  resolve:A=>{
    const e=A.expose||0,c=A.cover||0,p=A.profit||0;
    if(e>=5&&(fact('law_foundry_limits')==='yes'||fact('mayor')==='mina'))return 'closure';
    if(e>=4)return 'exposed';
    if(p>=3&&p>=c)return 'profit';
    if(c>=3||c>=e)return 'coverup';
    return 'exposed';
  },
  outcomes:{
   exposed:{name:'The Guild is exposed',text:'The inspector reads the logs out loud. The Guild is fined, the foreman is reassigned, and Iron Works reopens under supervision.',harbor:'HARBOR notes a drop in smoke, a rise in paperwork, and a mild improvement in everyone\u2019s opinion of paperwork.',
     fx:A=>{setFact('foundry_exposed');meterAdd('Foundry Row',-12);meterAdd('Greenbelt',4);facAdd('guild',-8);facAdd('coop',4);return 'Crafting costs 20% more while the inspectors stay.'}},
   coverup:{name:'Buried',text:'The Guild closes ranks. The report disappears, the smoke stays, and everyone agrees nothing happened, loudly.',harbor:'HARBOR has filed this under "Resolved." It filed it twice, to be sure.',
     fx:A=>{setFact('foundry_coverup');meterAdd('Foundry Row',8);meterAdd('Greenbelt',-6);facAdd('guild',8);facAdd('trust',3);return 'The air in Foundry Row gets a little thicker.'}},
   profit:{name:'Salvage rights',text:'While everyone argues, the wreckage is sold by the pound. You are standing closest to the scale.',harbor:'HARBOR has recorded this as "entrepreneurship." It is not sure how to feel about that.',
     fx:A=>{setFact('foundry_salvage');G.cash+=300;meterAdd('Foundry Row',2);facAdd('guild',3);return 'You earn $300, and scrap sells for 15% more from now on.'}},
   closure:{name:'Iron Works closes',text:'The inquiry finds enough. The furnace is shut for good. Ines locks the gate herself and hands you the key as a joke, then does not ask for it back.',harbor:'HARBOR has updated the Foundry Row map. The building is now labeled "memory."',
     fx:A=>{setFact('foundry_closed');meterAdd('Foundry Row',-20);meterAdd('Greenbelt',8);facAdd('guild',-10);facAdd('coop',6);return 'Iron Works is permanently closed. Crafting is still possible at Tinker Works.'}}}
};
