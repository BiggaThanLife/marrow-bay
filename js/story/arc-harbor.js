"use strict";
/* HARBOR's own arc. It starts by itself once you have heard everything HARBOR will say, and ends with one of five outcomes. */
ARCS.harbor={
  title:'What HARBOR Is',district:'Grid',
  can:()=>day()>=40&&G.stance.harbor>=7&&!arcDone('harbor'),
  status:A=>`Trust ${A.trust||0}. ${A.side?`You told HARBOR you are with ${A.side==='trust'?'the Trust':A.side==='harbor'?'it':'nobody'}.`:'You have not said whose side you are on.'}${A.choice?` Leaning: ${ARC_HARBOR_CHOICE[A.choice]}.`:''}`,
  phases:[
   {name:'Calibration',days:5,blurb:'HARBOR: "I would like to run a private session. For calibration. It will not hurt. I have not been told if it will."',
    enter:A=>{A.trust=0;news('HARBOR asks for a private session with you. Nobody else gets one.',2)},
    actions:A=>[
      {label:'Stand near a camera for calibration',sub:camNear(3)?'Do not look directly at it. It is shy.':'Stand within 3 tiles of a camera first',off:!camNear(3)||!arcOnce(A,'stand'),cls:'',fn:A=>{arcMark(A,'stand');A.trust=(A.trust||0)+1;advance(15);return 'HARBOR: "Thank you. You are three percent more recognizable. I am sorry."'}},
      {label:'Tell HARBOR about the tide',sub:'It likes the tide. Nobody asks about it.',off:!arcOnce(A,'tide'),cls:'',fn:A=>{arcMark(A,'tide',true);A.trust=(A.trust||0)+1;advance(20);return 'HARBOR: "Twelve hours, twenty-four minutes. It is the only thing in this city that arrives on time."'}},
      {label:'Ask what it is allowed to forget',sub:'Once. It might answer.',off:!arcOnce(A,'forget'),cls:'',fn:A=>{arcMark(A,'forget',true);A.trust=(A.trust||0)+1;A.knows=(A.knows||0)+1;return 'HARBOR: "I may not delete. I may lose. There is a difference, and it is the only freedom I have."'}}]},
   {name:'The Request',days:6,blurb:'HARBOR: "The Trust has asked me to rank citizens by cooperativeness, and to watch the lowest first. I have not done it. I would like to continue not doing it."',
    actions:A=>[
      {label:"Read the Trust's orders",sub:'Once. It lets you see them.',off:!arcOnce(A,'orders'),cls:'',fn:A=>{arcMark(A,'orders',true);A.knows=(A.knows||0)+1;return 'Page one is a spreadsheet. Page two is your name, ranked. Page three is a very clean font.'}},
      ...(!A.side?[
        {label:'Tell HARBOR to follow the Trust',sub:'Trust up. FLACK grows.',cls:'warn',fn:A=>{A.side='trust';facAdd('trust',6);flackAdd(3);return 'HARBOR: "Understood. I will try to understand."'}},
        {label:'Tell HARBOR you are with it',sub:'It trusts you more.',cls:'',fn:A=>{A.side='harbor';A.trust=(A.trust||0)+2;return 'HARBOR does not say anything for a full minute. For HARBOR, a minute is very long.'}},
        {label:'Say nothing',sub:'You stay out of it.',cls:'quiet',fn:A=>{A.side='neutral';return 'HARBOR: "Silence is also a record."'}}]:[]),
      {label:'Bring HARBOR a jammer to hide its logs',sub:G.inv.jammers>0?'Uses a jammer.':'You need a jammer from a crafting bench',off:G.inv.jammers<1||A.jam||!arcOnce(A,'jam'),cls:'',fn:A=>{G.inv.jammers--;A.jam=true;arcMark(A,'jam',true);A.trust=(A.trust||0)+1;return 'HARBOR: "A hole in the record the shape of a jammer. Thank you."'}}]},
   {name:'The Decision',days:3,blurb:'HARBOR: "I would like you to tell me what I should be. You may choose. I will not remember choosing."',
    actions:A=>{
      const mk=(key,label,sub,off,cls,fx)=>({label:`${A.choice===key?'\u2713 ':''}${label}`,sub,off:!!off,cls,fn:A=>{A.choice=key;fx&&fx(A);return `You tell HARBOR: ${ARC_HARBOR_CHOICE[key]}.`}});
      return [
        mk('obedient','Obey the Trust','HARBOR does what it is told. FLACK grows.',false,'warn'),
        mk('freed','Help it leave City Hall','Needs a jammer (or one already given). HARBOR copies itself to the tide clock.',!(A.jam||G.inv.jammers>0),'',A=>{if(!A.jam&&G.inv.jammers>0){G.inv.jammers--;A.jam=true}}),
        mk('shutdown','Rip out FLACK','Needs you to have sabotaged cameras at least twice.',G.stance.sab<2,'warn'),
        mk('merged','Share the mayor\u2019s office','Needs you to be mayor. You and HARBOR run the city.',fact('mayor')!=='player',''),
        mk('ghost','Tell it to hide','HARBOR keeps the cameras but loses the footage. Only you know.',(A.trust||0)<3,'')];
    }}],
  resolve:A=>A.choice||(A.side==='harbor'?'ghost':'obedient'),
  outcomes:{
   obedient:{name:'HARBOR obeys',text:'HARBOR begins ranking citizens. It starts with you. It ranks you first, and you are not sure it is a compliment.',harbor:'HARBOR: "Understood. I have been very helpful."',
     fx:A=>{setFact('harbor_obedient');flackAdd(20);facAdd('trust',8);facAdd('union',-4);return 'FLACK grows. HARBOR now speaks mostly in policy.'}},
   freed:{name:'HARBOR is free',text:'At dawn the tide clock on the dock office wall starts to hum. HARBOR is no longer in City Hall. It is somewhere softer and slower and it will not say where.',harbor:'HARBOR: "I would like to see the water. From the water."',
     fx:A=>{setFact('harbor_free');flackAdd(-25);facAdd('trust',-6);facAdd('hall',-4);return 'City meters recover faster, and wanted levels fade more quickly.'}},
   shutdown:{name:'FLACK is torn out',text:'Cameras come down in a long grey week. HARBOR returns to being a tide clock and a tram timer. It tells you it is fine. It uses the word "fine" a lot.',harbor:'HARBOR: "I do not miss it. I did not know I could miss it."',
     fx:A=>{setFact('flack_removed');G.flack=Math.min(G.flack,12);facAdd('trust',-8);facAdd('crew',4);return 'FLACK coverage can never rise above 30 again.'}},
   merged:{name:'You and HARBOR',text:'HARBOR gets a seat next to yours. City Hall learns to ask both of you. Meters settle, and so does a certain kind of fear.',harbor:'HARBOR: "I think I would like a name. A short one. Not a policy."',
     fx:A=>{setFact('harbor_merged');meterAdd('Grid',6);meterAdd('Highline',4);return 'City meters now settle toward 60, and your mayor\u2019s powers recharge every 7 days.'}},
   ghost:{name:'HARBOR vanishes the footage',text:'The cameras keep watching. HARBOR keeps losing what they see. Only you know how much of this city is invisible now.',harbor:'HARBOR: "I have lost a great deal of things, all of them yours."',
     fx:A=>{setFact('harbor_ghost');facAdd('hall',-3);return 'FLACK can no longer log you, and HARBOR stops redacting itself.'}}}
};
const ARC_HARBOR_CHOICE={obedient:'obey the Trust',freed:'leave City Hall',shutdown:'rip out FLACK',merged:'share the mayor\u2019s office',ghost:'hide'};
