"use strict";
/* Bay-Watch Feed: petty neighbourhood complaints. {d} is a district, {s} a street, {n} a number. */
const BW_STREETS=['Kelp Lane','Ballast Street','Tidewater Row','Net Alley','Cormorant Close','Bilge Road','Lantern Walk','Old Sluice Street'];
const BW_COMPLAINTS=[
  'Neighbour\'s grass on {s} is a quarter inch too high. Requesting lethal enforcement.',
  'Someone on {s} is humming at 6am. Same song every day. It is not a good song.',
  'A gull stood on my fence for {n} minutes and nobody did anything.',
  'Flat {n}, {s}: the bins are out on a Tuesday. We all saw. We all remember.',
  'Who keeps leaving one shoe on the {s} railings? Asking for a friend. The friend is the police.',
  'New family at {n} {s} wave at everyone. Suspicious. What are they selling.',
  'My neighbour says the tide is "just weather." Please contact someone about him.',
  'Parked three inches over the line on {s}. Photos attached. I have more photos.',
  'The {d} market stall gave me a smaller bag than yesterday. I weighed it. I weigh everything.',
  'Lights on at {n} {s} past ten. Nobody is allowed to be that happy.',
  'Is it normal for a pigeon to follow you home? This is the fourth day.',
  'Heard a knock at {n} {s}. Nobody answered. Possible murder, possible dentist.'
];
const BW_QUIET=['Watchers on {d} report no patrol since breakfast.','A user on {d} says the last constable they saw was asleep on a bench.','{d} neighbours say the patrol car has not come by in days. They sound pleased.'];
const BW_BUSY=['Watchers say extra patrols have turned up around {d}. Several complaints about being watched, from people who watch.','{d} is crawling with constables today. Nine five-star reviews for staying home.'];
