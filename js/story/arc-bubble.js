"use strict";
/* The Highline bubble: boom, cracks, crash, then a bailout, a reform, a soft landing or a collapse. */
const BUBBLE_CRASH={id:'crash',sev:3,dur:[3,3]};
ARCS.bubble={
  title:'The Highline Bubble',district:'Highline',
  hook:{min:14,need:6,who:'cordelia',yes:'Sit down with her',no:'Maybe later',text:'Cordelia Vance closes her ledger. "{name}. You keep turning up in my bank. Between us, the market is running hotter than it should, and people who ought to know better are borrowing against it. If you would like the real picture, sit down."'},
  can:()=>true,
  status:A=>`Market ${meterWord(G.meters.Highline)}. Rescue fund ${A.fund||0}/3, warnings ${A.warn||0}/3.${A.tip?' You have a tip from Cordelia.':''}`,
  phases:[
   {name:'Boom',days:6,blurb:'Everyone is rich on paper. The paper is doing very well.',
    enter:A=>{alertNews('News: Highline is booming. Prices are climbing faster than the buildings.',2)},
    daily:A=>{meterAdd('Highline',2);if(Math.random()<.6)news(pick(['Cordelia Vance is photographed laughing, which is unusual.','Taxi drivers are giving stock tips. Taxi drivers are always right until they are not.','A sandwich shop on the Highline now lists on the exchange.','The Gilded Tide installs a champagne tap in the lift.']),1)},
    actions:A=>[{label:'Talk up the market',sub:'$50. Gilded Tide share price +6%.',off:G.cash<50||!arcOnce(A,'hype'),cls:'',fn:A=>{G.cash-=50;arcMark(A,'hype');G.mkt.p.gilded=Math.min(500,G.mkt.p.gilded*1.06);return 'Cordelia thanks you. She does not blink.'}}]},
   {name:'Cracks',days:6,blurb:'Calls go unanswered. Deals are delayed. The champagne tap runs dry.',
    enter:A=>{alertNews('News: A Highline fund cancels withdrawals "for a short review."',3)},
    daily:A=>{meterAdd('Highline',-1);if(Math.random()<.7)news(pick(['Cordelia stops returning calls.','A trader is seen carrying a box out of a tower. The box is full of plants.','Three firms deny being in trouble in the same sentence.','The Trust releases a statement. HARBOR flags it as "very calm."']),1)},
    actions:A=>[
      {label:'Call Cordelia for a tip',sub:tier(att(NPC.cordelia))>=2?'Once. She might tell you something.':'She will not take your call',off:A.tip||tier(att(NPC.cordelia))<2,cls:'',fn:A=>{A.tip=true;memAdd('cordelia',2);return 'Cordelia, tersely: "If I were you I would own less of everything."'}},
      {label:'Warn the public',sub:'Flyers by the tram. Up to 3 times.',off:(A.warn||0)>=3||!arcOnce(A,'warn'),cls:'',fn:A=>{A.warn=(A.warn||0)+1;arcMark(A,'warn');facAdd('trust',-2);facAdd('union',1);return 'You hand out flyers. A banker photographs you doing it.'}},
      {label:'Chip in to the Trust rescue fund',sub:`$300. ${A.fund||0} of 3 contributed.`,off:G.cash<300||(A.fund||0)>=3,cls:'',fn:A=>{G.cash-=300;A.fund=(A.fund||0)+1;facAdd('trust',3);return 'The fund thanks you. Its balance does not.'}}]},
   {name:'Crash',days:3,blurb:'Prices fall through the floor and keep going.',
    enter:A=>{
      SHARES.forEach(s=>{G.mkt.p[s.id]=Math.max(3,G.mkt.p[s.id]*(s.id==='gilded'?.4:.55))});
      meterAdd('Highline',-12);
      startEvent({id:'crash',sev:3,dur:[3,3],mk:()=>({name:'Market crash',desc:'Markets tumble. The bank is shut and goods sell for less.',mod:{sell:.85,closed:['bank'],traffic:{Highline:.6}}})})},
    actions:A=>[
      {label:'Chip in to the Trust rescue fund',sub:`$300. ${A.fund||0} of 3 contributed.`,off:G.cash<300||(A.fund||0)>=3,cls:'',fn:A=>{G.cash-=300;A.fund=(A.fund||0)+1;facAdd('trust',3);return 'The fund is now a slightly larger hole.'}},
      {label:'Warn the public',sub:'Flyers. Up to 3 times.',off:(A.warn||0)>=3||!arcOnce(A,'warn'),cls:'',fn:A=>{A.warn=(A.warn||0)+1;arcMark(A,'warn');facAdd('trust',-2);facAdd('union',1);return 'Fewer people laugh at the flyers now.'}}]}],
  resolve:A=>{
    const f=A.fund||0,w=A.warn||0;
    if(f>=2||(fact('mayor')==='ashgrove'&&f>=1))return 'bailout';
    if(w>=2&&(fact('mayor')==='mina'||fact('law_flack_audit')==='yes'||w>=3))return 'reform';
    if(A.tip&&w>=1)return 'soft';
    return 'collapse';
  },
  outcomes:{
   bailout:{name:'The Trust is bailed out',text:'Public money and private friends keep the Trust upright. The first thing it buys is a new FLACK contract.',harbor:'HARBOR has been informed it is "too important to fail." It did not ask to be.',
     fx:A=>{setFact('trust_bailed_out');setFact('flack_contract');flackAdd(8);facAdd('trust',6);facAdd('union',-3);meterAdd('Highline',10);SHARES.forEach(s=>{G.mkt.p[s.id]*=1.35});return 'Prices bounce back. Highline will not forget who paid for it.'}},
   reform:{name:'The market is reformed',text:'Regulators show up with clipboards. Trading fees vanish and the Trust is told to open its books, including the camera accounts.',harbor:'HARBOR was asked to store the new rules. It has done so happily and is checking them twice.',
     fx:A=>{setFact('market_reformed');flackAdd(-4);facAdd('trust',-4);meterAdd('Highline',6);SHARES.forEach(s=>{G.mkt.p[s.id]*=1.15});return 'Share trades are free from now on.'}},
   soft:{name:'A soft landing',text:'The warnings help. Fewer people are ruined, and the ones who were are mostly in the papers.',harbor:'HARBOR notes that a soft landing is still a landing.',
     fx:A=>{meterAdd('Highline',3);SHARES.forEach(s=>{G.mkt.p[s.id]*=1.25});return 'Prices recover most of the way.'}},
   collapse:{name:'The bank fails',text:'Nobody catches it. The Marrow Bank shuts its doors for a week and reopens with a different sign and a much shorter list of friends.',harbor:'HARBOR regrets the loss and has marked it "temporary," in the way it marks things.',
     fx:A=>{setFact('bank_failed');meterAdd('Highline',-15);facAdd('trust',-6);G.mkt.noCreditUntil=day()+15;startEvent({id:'bankfail',sev:3,dur:[6,6],mk:()=>({name:'Bank failure',desc:'The Marrow Bank has failed and will reopen after an audit.',mod:{closed:['bank'],traffic:{Highline:.6},sell:.95}})});return 'The bank will not lend for 15 days.'}}}
};
