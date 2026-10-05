"use strict";
/* Item names, prices, hunger values, vehicles. */
const NAMES={crops:'crops',meals:'meals',fish:'fish',smoked:'smoked fish',scrap:'scrap',trinkets:'trinkets',seeds:'seeds',loot:'hot goods',parts:'parts',jammers:'jammers'};
const FAIR={meals:12,smoked:12,fish:7,crops:5,trinkets:30};
const HUNG={meals:45,smoked:35,fish:20,crops:12};
const MK=[.7,1,1.25],MKN=['Low','Fair','High'];
const VEH={
 none:{n:'On foot',sp:4.8,price:0,ins:0,fuel:false},
 bike:{n:'Bicycle',sp:8,price:90,ins:0,fuel:false},
 scooter:{n:'Scooter',sp:11,price:420,ins:8,fuel:true},
 sedan:{n:'Sedan',sp:15,price:1900,ins:25,fuel:true},
 coupe:{n:'Sports coupe',sp:20,price:5200,ins:55,fuel:true}
};
const PAINTS=[{n:'Cherry',c:'#e0402f'},{n:'Sky',c:'#3a86d6'},{n:'Lemon',c:'#e0b83a'},{n:'Mint',c:'#4fd1b5'},{n:'Plum',c:'#8a5ab5'},{n:'Tangerine',c:'#e8872a'},{n:'Pearl',c:'#eeeeee'},{n:'Midnight',c:'#2a2f45'}];
