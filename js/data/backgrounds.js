"use strict";
/* Player backgrounds (farmhand, dockhand, banker, artist). */
const BG={
 farm:{n:'Greenbelt farmhand',desc:'You grew up on a Greenbelt farm. The city buys what you grow and looks down on how you talk.',
   tags:['rural','hardworking','broke'],cash:40,rep:{Greenbelt:25,Highline:-12},home:'barn',inv:{seeds:6},perk:'Harvests yield 50% more.'},
 dock:{n:"Dockhand's kid",desc:'Your family has hauled cargo on the Dockside for three generations. The union knows your name.',
   tags:['working-class','strong','union'],cash:60,rep:{Dockside:25,Highline:-8,Grid:2},home:'bunk',inv:{},perk:'Dock work pays more.'},
 banker:{n:'Disgraced banker',desc:'You were rising fast on the Highline until a bank collapse put your name in the papers.',
   tags:['educated','disgraced','smooth'],cash:320,rep:{Highline:8,Dockside:-14},home:'flats',inv:{},perk:'Smooth talk gets better prices.'},
 artist:{n:'Street artist',desc:'You came to Marrow Bay with a sketchbook and nowhere to stay. The Grid is your canvas.',
   tags:['creative','outsider','broke'],cash:25,rep:{Grid:6,'Neon Mile':4},home:'studio',inv:{},perk:'Busking pays much more.'}
};
