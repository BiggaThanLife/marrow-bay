"use strict";
/* Which buttons play a short pixel scene before they act. A rule is [label pattern, scene type, kit, caption].
   Scene types are drawn in js/ui/scenes.js. To give a new button a scene, add a rule here. */
const SCENE_RULES=[
  [/^(Sit it out for six hours|Walk the yard)/,'jail','','Behind bars'],
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
  [/^(Cook a meal|Cook fish stew)/,'eat','cook','Cooking'],
  [/^(Buy a (?!round)|Buy 10 scrap|Buy seed packets|Order delivery)/,'purchase','','Buying'],
  [/^Slots/,'gamble','slots','Pulling the lever'],
  [/^Roulette/,'gamble','wheel','Placing a chip'],
  [/^Blackjack/,'gamble','cards','Dealing in'],
  [/^(Scout their stash house|Sabotage|Paint over a camera|Boost a car)/,'sneaky','peek','Keeping low'],
  [/^(Pickpocket|Pocket something|Smash and grab|Pry it open)/,'sneaky','grab','Light fingers'],
  [/^Walk to /,'travel','walk','On the road'],
  [/^Ride the tram/,'travel','tram','On the tram'],
  [/^Call a taxi/,'travel','taxi','In the taxi'],
  [/^(Records office|Read the Trust|Check the ledger|Cargo manifest|Make them sign something)/,'paper','','Reading the paperwork'],
  [/^(Expand to level|Upgrade to level|Craft a trinket|Make a part|Build a FLACK jammer|Fit a jammer to a pole)/,'build','','Building'],
  [/^(Chat|Have a chat|Talk to them|Mingle with the guests|Ask about town|Ask for news|Send a gift|Go door to door)/,'social','friendly','Having a word'],
  [/^(Ask for work|Ask about dock work|Give a statement)/,'social','serious','A serious word']
];
const SCENE_MS={work:2000,cash:1600,rest:2200,nature:2200,eat:2000,purchase:1900,gamble:2200,sneaky:2200,travel:2200,paper:2000,build:2200,social:2200,jail:2000};
const SCENE_SKIP_AFTER=400;
const sceneFor=label=>{const r=SCENE_RULES.find(x=>x[0].test(label));return r?{type:r[1],kit:r[2],cap:r[3]}:null};
