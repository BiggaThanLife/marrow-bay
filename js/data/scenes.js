"use strict";
/* Which buttons play a short pixel scene before they act. A rule is [label pattern, scene type, kit, caption].
   Scene types are drawn in js/ui/scenes.js. To give a new button a scene, add a rule here. */
const SCENE_RULES=[
  [/^Haul cargo/,'work','crate','Hauling cargo'],
  [/^Work a kitchen shift/,'work','pan','Working the grill'],
  [/^Tend the gardens/,'work','rake','Tending the gardens'],
  [/^Repair shift/,'work','spanner','Fixing things'],
  [/^Foundry shift/,'work','forge','At the furnace'],
  [/^(Collect till|Collect all tills|Collect takings|Collect earnings)/,'cash','','Counting the takings'],
  [/^(Sell trinkets|Cash exchange|Repay debt|Pay owed bills|Pay union dues|Busk for tips)/,'cash','','Money changes hands'],
  [/^(Sleep until morning|Nap for)/,'rest','bed','Sleeping'],
  [/^(Rest on a bench|Wait one hour|Sit it out)/,'rest','bed','Time passes'],
  [/^Get treated/,'rest','clinic','Resting at the clinic'],
  [/^(Fish from the pier|Fish the exposed channel)/,'nature','fish','Fishing'],
  [/^Take the boat out/,'nature','boat','Rowing out'],
  [/^Scavenge the mudflats/,'nature','mud','Scavenging the flats'],
  [/^Plant a seed/,'nature','plant','Planting'],
  [/^Harvest/,'nature','harvest','Harvesting'],
  [/^Order a meal/,'eat','plate','A hot meal'],
  [/^Eat (a meal|smoked fish|raw crops)/,'eat','plate','Eating'],
  [/^Buy a round/,'eat','drink','A round for the bar'],
  [/^(Cook a meal|Cook fish stew)/,'eat','cook','Cooking']
];
const SCENE_MS={work:2000,cash:1600,rest:2200,nature:2200,eat:2000};
const SCENE_SKIP_AFTER=400;
const sceneFor=label=>{const r=SCENE_RULES.find(x=>x[0].test(label));return r?{type:r[1],kit:r[2],cap:r[3]}:null};
