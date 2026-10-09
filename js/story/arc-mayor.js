"use strict";
/* The mayoral election arc. Repeats every 60 days. You can endorse a candidate, run yourself, or stay out. */
const playerBase=()=>{
  const avg=Object.values(G.rep).reduce((a,b)=>a+b,0)/6;
  return clamp(15+clamp(avg*.5,-10,15)+G.threads.done.length*2+(has('local-hero')?8:0)-(has('known-thief')?20:0)+(G.fac.hall>0?3:0),5,45);
};
const supTarget=A=>A.run?'player':A.endorse;
const supAdd=(A,id,n)=>{if(id&&A.sup[id]!==undefined)A.sup[id]=clamp(A.sup[id]+n,0,100)};
const supName=id=>id==='player'?G.name:CANDIDATES[id].name;
const supLeader=(A,except)=>Object.keys(A.sup).filter(k=>k!==except).sort((a,b)=>A.sup[b]-A.sup[a])[0];
ARCS.mayor={
  title:'The Mayoral Election',district:'Grid',repeatAfter:60,
  can:()=>day()>=25,
  board:A=>{
    const ids=Object.keys(A.sup).sort((a,b)=>A.sup[b]-A.sup[a]),me=supTarget(A),pts=k=>Math.round(A.sup[k]);
    let head='You have not backed anyone yet. Endorse a candidate or register to run.';
    if(me){
      const rank=ids.indexOf(me)+1,other=ids.find(k=>k!==me),gap=Math.abs(pts(me)-pts(other===undefined?me:(rank===1?other:ids[0])));
      head=`${A.run?'You have':supName(me)+' has'} <b>${pts(me)} points</b>, ranked #${rank} of ${ids.length}. ${rank===1?`Leading by ${gap}.`:`Trailing the leader by ${gap}.`}`;
    }
    const rows=ids.map(k=>`<div class="kv" style="margin:6px 0 0"><div style="grid-column:1/3"><span>${esc(supName(k))}${k===me?' (yours)':''}</span><b>${pts(k)}</b></div></div><div class="meter" style="margin:2px 0 4px"><i style="width:${pts(k)}%${k===me?'':';opacity:.45'}"></i></div>`).join('');
    return `<p>${head}</p>${rows}<p class="small muted">Actions you have used today are greyed out and come back tomorrow. The most points on election day usually wins, but the count has some luck in it.</p>`;
  },
  status:A=>`Polls: ${Object.keys(A.sup).sort((a,b)=>A.sup[b]-A.sup[a]).map(k=>`${supName(k)} ${Math.round(A.sup[k])}`).join(', ')}.${A.run?' You are on the ballot.':A.endorse?` You back ${supName(A.endorse)}.`:' You have not picked anyone.'}`,
  phases:[
   {name:'Announcement',days:4,blurb:'Candidates are declaring. Everyone is a little too happy about it.',
    enter:A=>{
      const inc=fact('mayor');
      A.sup={ashgrove:36,mina:30,reyes:30};
      if(CANDIDATES[inc])A.sup[inc]+=8;
      news(inc==='voss'?'Mayor Voss will not seek another term, citing "a desire to spend more time not being photographed." Three candidates step forward.':`${mayorName()} faces a challenge as the city heads to the polls.`,3);
      notify('News: An election is coming. Check the City Hall election desk.')},
    daily:A=>{if(Math.random()<.6)news(pick(['Lady Ashgrove promises "continuity with a modern face."','Mina Okafor holds a rally between the fish stalls.','Constable Reyes says the streets need "a firmer hand and a clearer picture."','Billboards appear for all three candidates. Two of them are smudged by morning.']),1)}},
   {name:'Campaign',days:10,blurb:'Every promise has a price. Every handshake is counted.',
    enter:A=>{alertNews('News: The campaign begins. Registration for new candidates is open at City Hall.',2)},
    daily:A=>{
      supAdd(A,'ashgrove',((G.meters.Highline-50)/50+(G.flack-30)/100)*1.4+(Math.random()-.5)*1.2);
      supAdd(A,'mina',((G.meters['Neon Mile']-50)/100+G.fac.union/100+(50-G.flack)/100)*1.4+(Math.random()-.5)*1.2);
      supAdd(A,'reyes',((G.meters.Grid-50)/50+(G.heat>=2?.6:0))*1.4+(Math.random()-.5)*1.2);
      if(A.run)supAdd(A,'player',(G.fac.hall/100+G.fac.union/150)*1.2);
      if(Math.random()<.5)news(`Poll update: ${supName(supLeader(A))} leads.`,1)},
    actions:A=>{
      const t=supTarget(A);
      return [
       ...(!A.run&&!A.endorse?Object.keys(CANDIDATES).map(id=>({label:`Endorse ${CANDIDATES[id].name}`,sub:`${CANDIDATES[id].tag}. Support +10.`,cls:'',fn:A=>{A.endorse=id;supAdd(A,id,10);memAdd(id,8);return `${CANDIDATES[id].name} will remember this, publicly.`}})):[]),
       ...(!A.run&&!A.endorse&&!has('known-thief')?[{label:'Register to run for mayor',sub:`$300 filing fee. Your starting support: ${Math.round(playerBase())}.`,off:G.cash<300,cls:'primary',fn:A=>{G.cash-=300;A.run=true;histAdd('mayor-run','Filed papers for mayor. HARBOR spelt the name correctly on the second try.',30);addRumor('candidate',['mina','cordelia','halloran'],{dist:'Grid'});A.sup.player=playerBase();news(`${G.name} files papers for mayor. HARBOR spells the name correctly on the second try.`,3);return 'You are on the ballot. It is a lot of ballot.'}}]:[]),
       ...(A.run&&!A.platform?[
         {label:'Promise to tear down FLACK',sub:'Union and the crews cheer. Highline will not.',cls:'',fn:A=>{A.platform='tear_down';supAdd(A,'player',6);facAdd('union',4);facAdd('crew',3);facAdd('trust',-5);return 'The crowd roars. Somewhere a camera zooms in.'}},
         {label:'Promise to expand FLACK',sub:'Highline and City Hall approve. Others do not.',cls:'',fn:A=>{A.platform='expand';supAdd(A,'player',5);facAdd('trust',5);facAdd('hall',3);facAdd('union',-4);return 'Applause, mostly polite, entirely recorded.'}},
         {label:'Promise an audit of FLACK',sub:'The cautious middle. A modest lift.',cls:'',fn:A=>{A.platform='audit';supAdd(A,'player',4);facAdd('hall',1);return 'Nobody objects. Nobody is thrilled.'}}]:[]),
       {label:'Give a speech on the plaza',sub:t?'1 hour. +3 support to your candidate.':'Back a candidate or run first',off:!t||!arcOnce(A,'speech'),cls:'',fn:A=>{advance(60);arcMark(A,'speech');supAdd(A,t,3);return 'You speak for ten minutes. Eleven people stop to listen.'}},
       {label:'Go door to door',sub:t?'2 hours. +3 support, standing in the Grid.':'Back a candidate or run first',off:!t||G.energy<10||!arcOnce(A,'door'),cls:'',fn:A=>{G.energy=clamp(G.energy-10,0,100);advance(120);arcMark(A,'door');supAdd(A,t,3);G.rep.Grid=clamp(G.rep.Grid+1,-100,100);return 'Doors open, doors close. A dog has opinions.'}},
       {label:'Buy campaign ads',sub:t?'$80. +4 support.':'Back a candidate or run first',off:!t||G.cash<80||!arcOnce(A,'ads'),cls:'',fn:A=>{G.cash-=80;arcMark(A,'ads');supAdd(A,t,4);return 'Your candidate is now on the side of a tram.'}},
       {label:'Dig up dirt on the leader',sub:t?'$50. -6 to the front runner. Risky.':'Back a candidate or run first',off:!t||G.cash<50||!arcOnce(A,'dirt')||supLeader(A,t)===undefined,cls:'warn',fn:A=>{
         G.cash-=50;arcMark(A,'dirt');const l=supLeader(A,t);
         if(Math.random()<.35){supAdd(A,t,-4);return 'The story backfires. People dislike the person who found it.'}
         supAdd(A,l,-6);return `${supName(l)} has a very bad day on the radio.`}}];
    }},
   {name:'Election day',days:2,blurb:'Last chances. The polls close at the end of the second day.',
    actions:A=>{
      const t=supTarget(A);
      return [
       {label:'Hold a final rally',sub:t?'2 hours. +5 support.':'Back a candidate or run first',off:!t||!arcOnce(A,'rally'),cls:'',fn:A=>{advance(120);arcMark(A,'rally');supAdd(A,t,5);return 'Balloons, a brass band, a speech that ends too late.'}},
       {label:'Get out the vote',sub:t?'$60. +4 support.':'Back a candidate or run first',off:!t||G.cash<60||!arcOnce(A,'gotv'),cls:'',fn:A=>{G.cash-=60;arcMark(A,'gotv');supAdd(A,t,4);return 'You hire vans. The vans are very motivated.'}}];
    }}],
  resolve:A=>{
    let best=null,bv=-1;
    Object.keys(A.sup).forEach(k=>{const v=A.sup[k]+(Math.random()-.5)*8;if(v>bv){bv=v;best=k}});
    A.winner=best;return best;
  },
  outcomes:{
   ashgrove:{name:'Mayor Ashgrove',text:'Lady Ashgrove wins. The Trust sends champagne and the new mayor declares the city "open for orderly business."',harbor:'HARBOR has updated its records to say "Ashgrove" in all the places it used to say "Voss."',
     fx:A=>{setFact('mayor','ashgrove');flackAdd(5);meterAdd('Highline',5);facAdd('trust',4);if(A.endorse==='ashgrove'){memAdd('ashgrove',12);return 'She remembers who helped.'}return ''}},
   mina:{name:'Mayor Okafor',text:'Mina Okafor takes city hall. Every market stall closes for an hour to celebrate, and the fish stalls win the party.',harbor:'HARBOR notes a drop in the quality of its camera feed and a rise in its mood.',
     fx:A=>{setFact('mayor','mina');flackAdd(-6);meterAdd('Greenbelt',3);meterAdd('Grid',-2);facAdd('union',4);facAdd('crew',2);if(A.endorse==='mina'){memAdd('mina',12);return 'She remembers who helped.'}return ''}},
   reyes:{name:'Mayor Reyes',text:'Constable Reyes is sworn in. The first order of business is a very large map with a lot of pins in it.',harbor:'HARBOR has been asked to "prioritize clarity." It has not been asked what it thinks.',
     fx:A=>{setFact('mayor','reyes');flackAdd(10);meterAdd('Grid',8);meterAdd('Neon Mile',-8);facAdd('crew',-4);facAdd('hall',4);if(A.endorse==='reyes'){memAdd('reyes',12);return 'She remembers who helped.'}return ''}},
   player:{name:'Mayor of Marrow Bay',text:'You win. The ceremony is short, the speeches are long, and a man you have never met says he always believed in you.',harbor:'HARBOR addresses you as "Mayor" for the first time. It sounds delighted and slightly afraid.',
     fx:A=>{
       setFact('mayor','player');setFact('player_mayor');
       let m='You can veto or sign by decree once every 14 days, and the city pays you $250 a week.';
       if(A.platform==='tear_down'){flackAdd(-10);facAdd('union',4);facAdd('trust',-4);m+=' FLACK cameras start coming down.'}
       else if(A.platform==='expand'){flackAdd(8);facAdd('trust',4);m+=' FLACK expansion begins at once.'}
       else if(A.platform==='audit'){flackAdd(-3);setFact('flack_audits');m+=' FLACK has to publish an audit.'}
       return m}}}
};
