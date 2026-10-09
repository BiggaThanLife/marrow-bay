"use strict";
/* Item names, prices, hunger values, vehicles. */
/* Crops. `greens` is the original crop and keeps its original inventory keys (seeds, crops) so everything that already used them still works. days is the time to ripen in a plot. */
const CROPS={
  greens:{n:'Mixed greens',one:'crop',many:'crops',key:'crops',seedKey:'seeds',days:3,yield:[3,4],seedPrice:4,price:6,col:'#e0b83a',eat:12},
  radish:{n:'Radish',one:'radish',many:'radishes',key:'radish',seedKey:'seedRadish',days:1,yield:[2,3],seedPrice:2,price:3,col:'#d86a8a',eat:8},
  tomato:{n:'Tomatoes',one:'tomato',many:'tomatoes',key:'tomato',seedKey:'seedTomato',days:3,yield:[3,4],seedPrice:7,price:9,col:'#d94a3a',eat:16},
  pumpkin:{n:'Pumpkins',one:'pumpkin',many:'pumpkins',key:'pumpkin',seedKey:'seedPumpkin',days:6,yield:[2,3],seedPrice:16,price:26,col:'#e0891e',eat:36}
};
/* Everyday goods. energy/hunger are what using one gives; crash is a dip that arrives `after` minutes later; gift is the attitude it is worth; fx is the G.fx flag that equipment sets. */
const GOODS={
  water:{n:'Water',price:2,energy:4,hunger:3,d:'+4 energy, +3 fullness.'},
  coffee:{n:'Coffee',price:3,energy:12,d:'+12 energy, no fullness.'},
  energy:{n:'Energy drink',price:6,energy:35,crash:{after:180,amt:12},d:'+35 energy, no fullness. A dip of 12 arrives about three hours later.'},
  chips:{n:'Chips',price:3,hunger:10,d:'+10 fullness.'},
  candybar:{n:'Candy bar',price:2,hunger:8,energy:3,d:'+8 fullness, +3 energy.'},
  sandwich:{n:'Sandwich',price:6,hunger:25,d:'+25 fullness.'},
  painkillers:{n:'Painkillers',price:8,energy:15,d:'+15 energy.'},
  sneakers:{n:'Sneakers',price:60,fx:'sneakers',d:'You walk 10% faster, for good.'},
  umbrella:{n:'Umbrella',price:25,fx:'umbrella',d:'Floods and storm surges slow you far less.'},
  card:{n:'Greeting card',price:3,gift:4,d:'A gift: attitude +4.'},
  flowers:{n:'Flowers',price:8,gift:10,d:'A gift: attitude +10.'},
  wine:{n:'Bottle of wine',price:20,gift:16,d:'A gift: attitude +16.'},
  gloves:{n:'Work gloves',price:30,fx:'gloves',d:'Shift work pays 10% more.'},
  toolkit:{n:'Toolkit',price:45,fx:'toolkit',d:'Repair shifts pay 20% more.'}
};
const CROP_KEYS=Object.values(CROPS).map(c=>c.key),CROP_EXTRA=['radish','tomato','pumpkin','seedRadish','seedTomato','seedPumpkin'];
const NAMES={crops:'crops',radish:'radishes',tomato:'tomatoes',pumpkin:'pumpkins',seedRadish:'radish seeds',seedTomato:'tomato seeds',seedPumpkin:'pumpkin seeds',meals:'meals',fish:'fish',smoked:'smoked fish',scrap:'scrap',trinkets:'trinkets',seeds:'seeds',loot:'hot goods',parts:'parts',jammers:'jammers',candy:'prayer candy',plaque:'plaques'};
const FAIR={meals:12,smoked:12,fish:7,crops:5,radish:3,tomato:9,pumpkin:26,trinkets:30};
const HUNG={meals:45,smoked:35,fish:20,crops:12,radish:8,tomato:16,pumpkin:36};
const MK=[.7,1,1.25],MKN=['Low','Fair','High'];
const VEH={
 none:{n:'On foot',sp:4.8,price:0,ins:0,fuel:false},
 bike:{n:'Bicycle',sp:8,price:90,ins:0,fuel:false},
 scooter:{n:'Scooter',sp:11,price:420,ins:8,fuel:true},
 sedan:{n:'Sedan',sp:15,price:1900,ins:25,fuel:true},
 coupe:{n:'Sports coupe',sp:20,price:5200,ins:55,fuel:true}
};
const PAINTS=[{n:'Cherry',c:'#e0402f'},{n:'Sky',c:'#3a86d6'},{n:'Lemon',c:'#e0b83a'},{n:'Mint',c:'#4fd1b5'},{n:'Plum',c:'#8a5ab5'},{n:'Tangerine',c:'#e8872a'},{n:'Pearl',c:'#eeeeee'},{n:'Midnight',c:'#2a2f45'}];
