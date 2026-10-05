"use strict";
/* The Briar Buyout: a Highline developer wants the farmland. */
ARCS.buyout={
  title:'The Briar Buyout',district:'Greenbelt',
  hook:{min:16,need:6,who:'wren',yes:'Hear what she has seen',no:'Not now',text:'Old Wren leans on her rake and does not smile. "{name}. You have worked this ground enough to know it. Men in clean boots have been pacing it off. A company with a Highline address wants to buy every field from the Gate to the barn. I could use someone who is not afraid of clean boots."'},
  can:()=>!fact('greenbelt_sold')&&!fact('coop_owned'),
  status:A=>`Sale ${A.sale||0}, save the farms ${A.save||0}, sabotage ${A.sab||0}.${A.stance?` You back ${A.stance==='sell'?'the sale':'the co-op'}.`:''}`,
  phases:[
   {name:'Rumbles',days:5,blurb:'Surveyors, stakes, and a lot of pointing.',
    enter:A=>{news('Surveyors in clean boots are staking the Greenbelt fields. Nobody will say who they work for.',2)},
    daily:A=>{meterAdd('Greenbelt',-1);if(Math.random()<.6)news(pick(['A stake appears in the middle of the barley.','Wren chases a surveyor with a hoe. The surveyor runs well.','A glossy brochure is pushed under every farmhouse door.','The tram to the Greenbelt Gate is suddenly full of men in vests.']),1)}},
   {name:'Pressure',days:7,blurb:'An offer is on the table and the table is very polished.',
    enter:A=>{alertNews('News: Marlowe Land offers to buy the Greenbelt farms. Wren says she would rather eat the contract.',3)},
    daily:A=>{meterAdd('Greenbelt',-1)},
    actions:A=>[
      ...(!A.stance?[
        {label:'Back the sale',sub:'Trust up, co-op down. Sale +3.',cls:'',fn:A=>{A.stance='sell';facAdd('trust',6);facAdd('coop',-8);A.sale=(A.sale||0)+3;return 'A man in a vest shakes your hand with both of his.'}},
        {label:'Organize the co-op',sub:'Co-op up, Trust down. Save +3.',cls:'',fn:A=>{A.stance='coop';facAdd('coop',8);facAdd('trust',-4);A.save=(A.save||0)+3;return 'The co-op meets in the barn. The barn creaks in agreement.'}}]:[]),
      {label:'Raise funds for the co-op',sub:'$150. Save +2. Up to twice.',off:G.cash<150||(A.funds||0)>=2||!arcOnce(A,'fund'),cls:'',fn:A=>{G.cash-=150;A.funds=(A.funds||0)+1;arcMark(A,'fund');A.save=(A.save||0)+2;facAdd('coop',3);return 'You pass a hat. It comes back heavier than expected.'}},
      {label:'Plant the contested field',sub:G.inv.seeds>=3?'3 seeds. Save +1. Hard to evict a crop.':'You need 3 seeds',off:G.inv.seeds<3||!arcOnce(A,'plant'),cls:'',fn:A=>{G.inv.seeds-=3;arcMark(A,'plant');A.save=(A.save||0)+1;facAdd('coop',2);return 'Three tidy rows of defiance.'}},
      {label:'Move the survey stakes',sub:'Sabotage +2. Might get you noticed.',off:!arcOnce(A,'stakes'),cls:'warn',fn:A=>{arcMark(A,'stakes');A.sab=(A.sab||0)+2;if(Math.random()<.3){G.heat=Math.min(5,G.heat+1);return 'A surveyor sees you. Police will have questions.'}return 'The new boundary is now a very confusing river.'}},
      {label:'Dig into the developer\u2019s books',sub:'Needs a sharp mind. Sabotage +1, save +1.',off:!(has('educated')||has('smooth'))||!arcOnce(A,'books'),cls:'',fn:A=>{arcMark(A,'books',true);A.sab=(A.sab||0)+1;A.save=(A.save||0)+1;return 'Marlowe Land is owned by a company owned by a company owned by a cousin.'}}]},
   {name:'Breaking point',days:3,blurb:'The hearing is on. Everybody brings a folder.',
    enter:A=>{meterAdd('Greenbelt',-4)},
    actions:A=>[
      {label:'Speak at the hearing',sub:'Counts for your side. Needs a stance.',off:!A.stance||!arcOnce(A,'speak'),cls:'',fn:A=>{arcMark(A,'speak');advance(120);if(A.stance==='sell')A.sale=(A.sale||0)+2;else A.save=(A.save||0)+2;return 'You speak for three minutes. A clock is audibly listening.'}},
      {label:'Broker a compromise',sub:'Needs both sides to have some weight.',off:!((A.sale||0)>0&&(A.save||0)>0)||!arcOnce(A,'broker'),cls:'',fn:A=>{arcMark(A,'broker',true);A.broker=true;return 'A map, a ruler, and four reluctant signatures.'}},
      {label:'Bring the fair ribbons',sub:'Save +1. Wren says it helps.',off:!(G.fairWins>0)||!arcOnce(A,'ribbons'),cls:'',fn:A=>{arcMark(A,'ribbons',true);A.save=(A.save||0)+1;return 'A first-place ribbon on a hearing table. It does something.'}}]}],
  resolve:A=>{
    const s=A.sale||0,v=A.save||0;
    if(A.broker&&Math.abs(s-v)<=3)return 'compromise';
    if((A.sab||0)>=3&&v>=s)return 'failed';
    return v>s?'coop':'sold';
  },
  outcomes:{
   sold:{name:'The farms are sold',text:'The fields go to Marlowe Land. Surveyors become builders. A banner says BRIAR HEIGHTS: A NEW WAY TO LIVE NEAR WHERE FOOD USED TO BE.',harbor:'HARBOR has updated the Greenbelt map with a very pleasant rendering.',
     fx:A=>{setFact('greenbelt_sold');meterAdd('Greenbelt',-15);meterAdd('Highline',5);facAdd('trust',4);facAdd('coop',-6);recomputeMods();return 'Crop yields drop 15% from now on.'}},
   coop:{name:'The co-op holds',text:'The Growers\u2019 Co-op raises enough to buy the land itself. Wren hangs the deed in the barn where the goat can see it.',harbor:'HARBOR has marked the land "protected." It does not know who by.',
     fx:A=>{setFact('coop_owned');meterAdd('Greenbelt',10);facAdd('coop',8);facAdd('trust',-3);recomputeMods();return 'Crop yields rise 10%, and your co-op share pays $25 a week.'}},
   failed:{name:'The deal collapses',text:'The developer\u2019s books turn out to be a work of fiction. Marlowe Land leaves town in a hurry and a very clean pair of boots.',harbor:'HARBOR has filed the story under "unverified." Everybody has verified it.',
     fx:A=>{setFact('buyout_failed');meterAdd('Greenbelt',3);facAdd('trust',-6);facAdd('coop',4);return 'The farms stay as they were, nervous and muddy.'}},
   compromise:{name:'Half and half',text:'The land is split. The farms keep the near fields, Marlowe keeps the far ones, and everyone agrees that this is fair, which is how you know it is not.',harbor:'HARBOR has put the boundary on the map in a dotted line.',
     fx:A=>{setFact('buyout_compromise');meterAdd('Greenbelt',-5);meterAdd('Highline',3);facAdd('trust',2);facAdd('coop',2);recomputeMods();return 'Crop yields drop 5%.'}}}
};
