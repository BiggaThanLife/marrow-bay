"use strict";
/* Names for the businesses and stalls you own, and what their Googull pages say about them. Names are picked once per business and saved on it. */
const BIZ_NAMES={
  cafe:['Low Tide Cafe','The Soggy Biscuit','Gull and Grounds','Slack Water Coffee','FLACK Roast (We See Your Order)','Brine and Bean','The Ebb Espresso','Tidewater Table','Harbor Grind','Salt and Saucer'],
  bar:['The Drowned Rat','High Water Tavern','The Last Round','Brine and Bitter','The Wet Cellar','Undertow','The Sunken Pint',"The Gull's Regret",'Flood Mark Bar','Neon Lantern Taps'],
  workshop:['Rust and Rework','Scrap Saints','The Fix-It Tide','Backbone Metalworks','Bolt Hole','Second Wind Repairs','Ballast and Gear','Salvage Hands','The Spare Part',"Tinker's Cousin"],
  rental:['Tidemark Flats','Dry Ground Apartments','Gullwing Residences','High and Dry Lofts','The Waterline','Seawall Court','Kelp Lane Flats',"Landlubber's Rest",'Brickwork Terrace','HARBOR View Apartments'],
  farm:['Briar and Brine Farm','Muddy Boots Acres','Tide-Fed Fields','Three Crows Farm','Salt Marsh Co-op','Low Field Produce','The Patient Plot',"Wren's Cousin Farm"],
  home:['Hull Street Hideout','The Burrow','Number Nobody','Dry Quarters','Home, Mostly','The Quiet Corner'],
  pies:["Don't Ask Pies",'Locally Sourced Meats',"Mum's (Not Mine) Pies",'The Local Pie Company','Pastry and Disappearance','Pies of Unknown Origin','Gristle and Crust','Fresh Daily, Whatever Daily Means'],
  cages:['Snug and Co. Micro-Stays','Standing Room Lodgings','Four Square Feet','The Upright Hostel','Slot Inn','Coffin Comfort (Standing)','Cozy Cubic Living','Stack and Stay'],
  wellness:['Bio-Hacked Dew','The Quiet Dark','Still Water Spa','Moist Mindfulness','Calm Before the Tide','The Weeping Room','Dew Drop Retreat','Breathe Eventually'],
  empty:['Vacant Building']
};
const STALL_NAMES=['Gull-Proof Stall','Fresh-ish Produce','The Honest Table','Crates and Hope','Pier Pressure','Market of One','Low Overheads'];
/* tagline per business type, shown as the quote on its Googull page */
const BIZ_TAGS={
  cafe:['Hot drinks, hotter gossip.','Coffee strong enough to hold up the tide.','We remember your order. HARBOR remembers everything else.'],
  bar:['Where the tide goes to talk.','Last orders were a while ago.','Strong drinks, stronger opinions.'],
  workshop:['We fix what the tide breaks.','Scrap in, solutions out.','No job too small, no promise too large.'],
  rental:['A roof, a door, and a landlord.','Dry rooms in a damp city.','Your neighbours are real and so are the walls.'],
  farm:['Soil with opinions.','Tide-fed and mildly proud.','Our crops have never missed a day, unlike our staff.'],
  home:['Home is where the tide stops.','Small, yours, and mostly dry.'],
  pies:['100% organic, locally sourced. Do not ask which local.','Fresh daily. Do not ask which day.','Our meat has never been rated. Neither have we.'],
  cages:['Standing-room sleep, premium stacking.','Four square feet of your own.','A little less than a bed, a little more than the pavement.'],
  wellness:['Tap water, reimagined.','Sit in the dark. Pay for the dark.','Stress is temporary. The bill is not.']
};
/* review lines by kind of business and mood: g is good, b is bad */
const BIZ_REV={
  shop:{g:['Fast service and a smile that looked almost real.','Great value. Asked no questions, got no lies.','The only decent place on this street.','Clean, open, and nobody shouted.'],
        b:['Ran out of what I wanted, twice.','Queue went round the block. The block was the queue.','Nobody serving. I think they were all behind the counter, hiding.','Prices went up while I was reading the menu.']},
  home:{g:['Warm, dry and the landlord actually replied.','Quiet building. Suspiciously quiet.','Rent is fair, the hallway is clean.','Best roof I have had since the flood.'],
        b:['Landlord is "looking into it." Has been for weeks.','Leak under the sink. We named it.','Noisy neighbours and a quieter landlord.','I found a mouse. The mouse found my sandwich.']},
  farm:{g:['Fresh, local and still faintly damp.','The tomatoes were the only good news this week.','A proper farm in a city of gulls.'],
        b:['Crows run the place. Management is a bird.','Nothing ripe, everything late.','Mud everywhere. Mud as far as hope.']}
};
