"use strict";
/* Your crew, rival hits and the big jobs. Rules are in js/sim/crew.js, menus in js/menus/crew.js. */
const CREW_MAX=4;
const CREW_ROLES={
  driver:{n:'Driver',d:'Gets everyone out. Less heat after a job, better odds on a getaway or a boosted car.'},
  muscle:{n:'Muscle',d:'Guards your rackets from rival hits and makes leaning on people go better.'},
  lock:{n:'Lockpick',d:'Locks, safes and alarms. Better odds on any break-in.'},
  look:{n:'Lookout',d:'Watches the street. Warns you before a rival hit and keeps a big job quiet.'}
};
/* traits: steady (loyalty fades slower), loose (talks when unhappy or caught), greedy (wants a bigger cut), flashy (draws the police file) */
const CREW_TRAITS={steady:'Steady',loose:'Loose lips',greedy:'Greedy',flashy:'Flashy'};
const CREW_POOL=[
  {id:'june',n:'June Okafor',role:'driver',skill:2,trait:'steady',look:{skin:4,hair:0,style:5},bio:'Calls the getaway car "Barbara" and apologises to it after hard turns.'},
  {id:'dario',n:'Dario Vance',role:'driver',skill:3,trait:'flashy',look:{skin:1,hair:1,style:0},bio:'Has outrun the constable twice and mentions it three times a day.'},
  {id:'teo_b',n:'Teodora Brask',role:'driver',skill:1,trait:'greedy',look:{skin:0,hair:3,style:1},bio:'Learned to drive in a hearse. Still signals like there is a coffin in the back.'},
  {id:'moe',n:'Big Moe Fenwick',role:'muscle',skill:3,trait:'steady',look:{skin:2,hair:0,style:3},bio:'Has never once used a door handle. Doors simply stop being in the way.'},
  {id:'sully',n:'Sully Brandt',role:'muscle',skill:2,trait:'loose',look:{skin:1,hair:2,style:2},bio:'Owes money to people who own boats, and the boats are getting closer.'},
  {id:'ama',n:'Ama Mensah',role:'muscle',skill:1,trait:'steady',look:{skin:4,hair:0,style:4},bio:'Former pit fighter. Keeps a tiny notebook of everyone who has been rude to her.'},
  {id:'odette',n:'Odette Marsh',role:'lock',skill:3,trait:'greedy',look:{skin:0,hair:4,style:1},bio:'Hums hymns while picking locks. Says the safes like it.'},
  {id:'mei',n:'Mei Tran',role:'lock',skill:2,trait:'steady',look:{skin:1,hair:0,style:5},bio:'Opened her first padlock at six. It was on her own diary. She was disappointed.'},
  {id:'ezra',n:'Ezra Coombs',role:'lock',skill:1,trait:'loose',look:{skin:3,hair:1,style:6},bio:'Works for cheap because he once locked himself inside a bank overnight. On purpose, he says.'},
  {id:'rafi',n:'Rafi Haddad',role:'look',skill:2,trait:'steady',look:{skin:3,hair:0,style:0},bio:'Can tell a plain-clothes officer by their shoes. All of them buy the same shoes.'},
  {id:'nadia',n:'Nadia Petrov',role:'look',skill:3,trait:'flashy',look:{skin:0,hair:5,style:1},bio:'Sees everything from a rooftop and narrates it like a nature documentary.'},
  {id:'hollis',n:'Hollis Grey',role:'look',skill:1,trait:'loose',look:{skin:2,hair:2,style:2},bio:'Refuses to work Tuesdays for religious reasons. The religion is unclear.'}
];
const crewWage=c=>[0,15,25,40][c.skill]+(c.trait==='greedy'?10:0);
/* a rival crew when both Vex and the Salt Kings are gone */
OWNER_NAMES.tide='The Tidewater Boys';
/* Big jobs. Each needs casing (intel), gear and a crew with certain roles, then a night at the place.
   twists: one complication during the job; each choice changes the odds (k) or the payout (pay), or calls it off. */
const HEISTS=[
  {id:'van',n:'The Foundry payroll van',poi:'foundry',roles:['driver','muscle'],gear:[{id:'spikes',n:'Road spikes',p:60}],pay:[600,900],loot:0,heat:3,unlock:0,
   blurb:'Every Friday an armoured van brings wages to the Foundry. It stops for exactly one red light.',
   twists:[{t:'The van takes a different street tonight.',a:[{l:'Chase it down',role:'driver',k:.08},{l:'Cut across on foot',k:-.08,pay:1.1},{l:'Let it go',abort:true}]},
           {t:'The guard inside has a second guard inside him, emotionally. He will not open up.',a:[{l:'Lean on the door',role:'muscle',k:.08},{l:'Take the rear lockbox only',k:.12,pay:.6},{l:'Walk away',abort:true}]}]},
  {id:'yard',n:'Harbor Freight container yard',poi:'dock',roles:['look','lock'],gear:[{id:'cutters',n:'Bolt cutters',p:40}],pay:[450,700],loot:[4,7],heat:2.5,unlock:0,
   blurb:'Container 4471 is listed as "garden gnomes." Nobody guards garden gnomes this hard.',
   twists:[{t:'A night patrol walks the stacks with a torch.',a:[{l:'Wait in the shadows',role:'look',k:.1},{l:'Rush the container',k:-.06,pay:1.15},{l:'Slip out',abort:true}]},
           {t:'The padlock is new, and it is very proud of itself.',a:[{l:'Pick it slowly',role:'lock',k:.1},{l:'Cut the hinges instead',k:-.04},{l:'Leave it',abort:true}]}]},
  {id:'gala',n:'The Estate gala',poi:'estate',roles:['lock','look'],gear:[{id:'suit',n:'A borrowed evening suit',p:150}],pay:[900,1400],loot:[2,4],heat:3,unlock:1,
   blurb:'Highline throws a charity gala for a charity it also owns. The jewellery upstairs is not on the guest list.',
   twists:[{t:'A host asks which table you are at.',a:[{l:'Say the Mayor’s table',k:.04},{l:'Have the lookout cause a scene',role:'look',k:.1},{l:'Leave the party',abort:true}]},
           {t:'The safe upstairs is older than the money in it.',a:[{l:'Work the dial',role:'lock',k:.1},{l:'Take what is on the dresser',k:.14,pay:.55},{l:'Walk away',abort:true}]}]},
  {id:'count',n:'The casino count room',poi:'casino',roles:['lock','look','driver'],gear:[{id:'uniform',n:'Cleaner’s uniform',p:90},{id:'jammer',n:'A FLACK jammer (crafted)',inv:'jammers'}],pay:[1200,1800],loot:0,heat:3.5,unlock:1,
   blurb:'Every night at four the casino counts what it took from people. Somebody should count it differently.',
   twists:[{t:'The count finishes early. The cart is already rolling to the safe.',a:[{l:'Hit the cart in the corridor',k:-.04,pay:1.2},{l:'Have the lockpick beat it to the safe',role:'lock',k:.08},{l:'Abort',abort:true}]},
           {t:'A pit boss recognises your face from the slots.',a:[{l:'Lookout calls him away',role:'look',k:.1},{l:'Bluff it out',k:-.05},{l:'Abort',abort:true}]}]},
  {id:'vault',n:'The Marrow Bay bank vault',poi:'bank',roles:['driver','muscle','lock','look'],gear:[{id:'drill',n:'Thermal drill',p:220},{id:'jammer',n:'Two FLACK jammers (crafted)',inv:'jammers',q:2}],pay:[2500,4000],loot:[2,5],heat:4.5,unlock:2,
   blurb:'The vault door was installed in 1911 and has been bragging about it ever since.',
   twists:[{t:'The silent alarm is not silent. It is just quiet.',a:[{l:'Lookout cuts the line',role:'look',k:.1},{l:'Drill faster',k:-.06,pay:1.1},{l:'Get out now',abort:true}]},
           {t:'Two guards play cards in the lobby. One of them is winning, so neither will leave.',a:[{l:'Muscle keeps them busy',role:'muscle',k:.08},{l:'Go round through the vents',role:'lock',k:.06},{l:'Abort',abort:true}]}]}
];
const HEIST_GEAR_SHOP='Mack at the garage and the pawn shop source it for you, no receipts.';
