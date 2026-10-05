"use strict";
/* Community projects and buildable structures. */
const PROJECTS=[
 {id:'crane',name:'Repair the harbor crane',d:'Dockside',need:{scrap:40},desc:'Dock gigs pay 25% more.'},
 {id:'irrig',name:'Greenbelt irrigation channel',d:'Greenbelt',need:{crops:30},desc:'Crops grow a day faster.'},
 {id:'lamps',name:'Plaza lamps',d:'Grid',need:{trinkets:5},desc:'Busking pays 30% more.'},
 {id:'commons',name:'Highline garden commons',d:'Highline',need:{crops:20,cash:100},desc:'Estate gigs pay 20% more.'}
];
const STRUCTS={
 stall:{n:'Market stall',cost:120,desc:'Stock it and set a price. People buy from it on their own.'},
 planter:{n:'Greenhouse',cost:90,desc:'Grows crops in any district, in 2 days.'},
 smoker:{n:'Smoker',cost:70,desc:'Turns 2 fish into 2 smoked fish.'},
 bench:{n:'Workshop bench',cost:100,desc:'Craft trinkets from scrap anywhere.'},
 sign:{n:'Signboard',cost:15,desc:'Draws shoppers to stalls within 5 tiles.'},
 house:{n:'House',cost:900,desc:'A home you build yourself. $35 a month in upkeep.'}
};
