"use strict";
/* The police file, dirty money and prison. G.notor is how well the law knows you, 0 to 100. It climbs while you are wanted and fades while you lie low. */
const LAW_TIERS=[
  {min:0,n:'Unknown',t:'The police have no file worth reading.'},
  {min:25,n:'Watched',t:'FLACK has tagged you. Fences pay less and the clerks take longer to smile.'},
  {min:50,n:'Wanted list',t:'The bank will not lend or trade for you, and the police raid places that look like yours.'},
  {min:75,n:'Public enemy',t:'The bank, the Estate, the club and the estate agent will not see you. Your name needs clearing.'}
];
/* places that shut their doors to a public enemy. City Hall, the clinic, food, work and home stay open so nobody is ever stuck. */
const LAW_LOCKED=['bank','estate','club','realty'];
const FENCE_CUT=[1,.9,.8,.7];
const JAIL_LINES=[
  'The cell has a bed, a bucket and a window the size of a postcard. The postcard is of a wall.',
  'Someone has carved a tide table into the bunk. It is accurate. It is the only accurate thing in here.',
  'Lunch is a grey thing in a tray. A man beside you says it is "mostly protein." He says it carefully.',
  'The guard recognises you from the news. He is polite about it, which is worse.',
  'A voice somewhere is singing the same four bars over and over. It is getting better, slowly.'
];
const JAIL_WORK_PAY=12;
