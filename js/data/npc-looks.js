"use strict";
/* How each named NPC looks on the map. skin indexes SKIN, hair indexes HAIR. style: 0 short, 1 long, 2 buzzed, 3 bald, 4 bun, 5 ponytail, 6 curls.
   fem: dress silhouette. beard: facial hair. hat: same ids as the player's hats. */
const NPC_LOOK={
  cordelia:{skin:3,hair:0,style:4,fem:true},
  halloran:{skin:0,hair:5,style:2,beard:false,hat:'brim'},
  mina:{skin:4,hair:0,style:6,fem:true},
  teo:{skin:2,hair:0,style:3,beard:true},
  duarte:{skin:3,hair:0,style:2,beard:true,hat:'cap'},
  pip:{skin:1,hair:2,style:0},
  wren:{skin:1,hair:5,style:4,fem:true,hat:'sun'},
  reyes:{skin:2,hair:0,style:5,fem:true,hat:'cap'},
  ashgrove:{skin:0,hair:3,style:4,fem:true},
  gus:{skin:1,hair:5,style:3,beard:true},
  bell:{skin:4,hair:0,style:1,fem:true},
  vex:{skin:3,hair:6,style:0,beard:false},
  mack:{skin:2,hair:1,style:0,beard:true},
  ines:{skin:2,hair:0,style:5,fem:true},
  lou:{skin:0,hair:1,style:0,beard:false}
};
