"use strict";
/* HARBOR commentary and inner voices. */
/* ----- HARBOR commentary and inner voices (each fires once per game) ----- */
const QUIPS={
 bill:'Monthly bills collected. HARBOR thanks you for your contribution to the tide fund, which does not exist.',
 bill_short:'You came up short on the bills. HARBOR has filed the shortfall under ‘personality’.',
 bust:'Constable Reyes has detained you. HARBOR notes the cells are fully staffed, unlike everything else.',
 collapse:'You collapsed. HARBOR has logged this as ‘efficient rest’.',
 buy:'Your first property, {name}. HARBOR has already added you to six mailing lists and one tax bracket.',
 loan:'A loan! HARBOR is thrilled. Debt builds character, and the bank builds yachts.',
 steal:'HARBOR saw nothing. HARBOR was briefly offline for maintenance, as the law requires.',
 harvest:'Your first harvest. The soil has been informed and will expect credit.',
 fish:'You caught a fish. The fish was not consulted.',
 hire:'You hired an employee. Congratulations on becoming someone else\'s problem, and vice versa.',
 disaster:'A major event is underway. HARBOR assures all citizens this is a feature.',
 wanted:'{name}, you are wanted. HARBOR has chosen not to say ‘I told you so’, a personal first.',
 rich:'You hold over $1,000. HARBOR recommends spending it before someone notices.',
 broke:'Your balance is nearly zero. HARBOR suggests employment, theft, or a better attitude toward both.',
 job:'Job complete. HARBOR has no record of this transaction, and neither do you.'
};
const VOICE={
 smooth:{bill:'A good tailor can make an eviction notice look bespoke.',steal:'Technically, you charmed it out of their pocket.',buy:'Ownership suits you. Try to keep the smile.',rich:'Wealth is mostly confidence with a bank account.'},
 rural:{bill:'In the Greenbelt the bills were weather. This one has a due date.',harvest:'Seeds in, food out. The city could learn something, and never will.',buy:'You could fit nine barns in it and still feel lost.',broke:'Broke is just fallow. Keep going.'},
 disgraced:{bust:'You have been taken in before, in a way. At least this time it is only the Constable.',loan:'Ah, a loan. You know how this story goes. Perhaps it ends differently.',rich:'You were here once. Do not look down.',bill_short:'The numbers do not care about your name. They never did.'},
 'working-class':{bill:'Rent day. Dock families know this song.',hire:'You are the boss now. Remember who you used to be.',disaster:'Disasters hit the Dockside first. Always.',broke:'Pockets empty, hands full. You have been here before.'},
 creative:{collapse:'Falling over is a kind of performance. Nobody applauded.',steal:'You were practicing sleight of hand. That counts as art.',fish:'A still life, with gills.',broke:'Starving artist. The first half is a formality, the second is optional.'},
 strong:{bust:'You could have run faster. Or lifted the Constable.'},
 outsider:{wanted:'New in town and already notorious. You are fitting in.'},
 educated:{loan:'You know the interest rate. You are taking it anyway. Fascinating.',hire:'Management. Your degree finally has a use.'}
};
const TAGN={'working-class':'Working-class',rural:'Rural',smooth:'Smooth',disgraced:'Disgraced',creative:'Creative',strong:'Strong',outsider:'Outsider',educated:'Educated'};
function quip(key){
  if(!G||!QUIPS[key]||G.flags['q_'+key])return;
  G.flags['q_'+key]=1;
  const tg=tagsNow(),vs=tg.filter(t=>VOICE[t]&&VOICE[t][key]);
  let m=`HARBOR: "${redact(QUIPS[key].replace('{name}',G.name))}"`;
  if(vs.length){const t=pick(vs);m+=`\n${TAGN[t]}: "${VOICE[t][key]}"`}
  const cur=$('#note').textContent;
  notify(cur&&cur.length<140?cur+'\n'+m:m);
  news(m.replace('\n',' '),1);
}
