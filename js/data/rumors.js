"use strict";
/* Rumor kinds beyond the first few in events.js. RUM[type]={d,t}: d is how much a knower's attitude shifts (scaled by how fresh it is), t is the line in the Bag and on the Town board.
   RUM_WHO[type][npc] adds to d for one person. RUMOR_INFO[type] says how it reads in the Bay-Watch feed and what people say when you talk to them:
   vague = the post while few people know, named = once about four know (good news and acts with a name on them skip straight to named),
   vagueOnly = never gets your name, line = what a knower says to you.  {you} {dist} {shop} {owner} are filled in by rumorText(). */
Object.assign(RUM,{
 arrested:{d:-12,t:'They say Constable Reyes arrested you.'},
 evictor:{d:-10,t:'They say you put a family out of their flat.'},
 softLandlord:{d:8,t:'They say you wrote off a tenant\'s rent.'},
 shady:{d:-10,t:'They say an inspector fined your shop.'},
 excon:{d:-14,t:'They say you have done time.'},
 vandal:{d:-4,t:'They say you painted over a FLACK camera.'},
 saboteur:{d:-10,t:'They say you sank a shipment.'},
 heister:{d:-8,t:'They say you broke into a building at night.'},
 lobbyist:{d:2,t:'They say you take council members to lunch.'},
 owner:{d:4,t:'They say you bought out a local shop.'},
 picketHero:{d:8,t:'They say you stood with the pickets.'},
 scab:{d:-8,t:'They say you crossed the picket line.'},
 collapse:{d:3,t:'They say you fainted in the street.'},
 candidate:{d:2,t:'They say you are running for mayor.'},
 crateKept:{d:-4,t:'They say you kept a crate from the flats.'},
 crateReturned:{d:8,t:'They say you handed in a crate from the flats.'}
});
const RUM_WHO={
 excon:{vex:14,cordelia:-8},vandal:{reyes:-15,gus:6,vex:6},saboteur:{duarte:-14,vex:4},heister:{reyes:-12,vex:10},
 evictor:{halloran:10},softLandlord:{halloran:-8},lobbyist:{ashgrove:8},picketHero:{gus:10,duarte:2},scab:{gus:-14,duarte:10},
 collapse:{teo:6,bell:6},informant:{vex:-10}
};
const RUMOR_INFO={
 thief:{vague:'Apples vanished from the Market Hall. A stranger was in the area.',named:'{you} cleaned out the Market Hall. Count your pockets.',line:'Missing apples, the day you showed up. Funny.'},
 arrested:{vague:'Constable Reyes chased someone through three districts and called it cardio.',named:'{you} got arrested. Reyes is very pleased.',line:'I heard Reyes had you. I am not going to ask.'},
 defaulter:{vague:'Someone skipped out on a bank loan and Cordelia noticed.',named:'{you} owes the bank. Cordelia has a spreadsheet for it.',line:'People who skip loans make me count my change.'},
 generous:{good:1,named:'{you} fed half of Kelp Lane for free.',line:'Word is you feed strangers. Sit down.'},
 successful:{good:1,named:'{you}\'s place is busy every night. Someone is doing something right.',line:'Your place is the talk of the street. Well done.'},
 crank:{vague:'Someone is sending strange messages to people selling things.',named:'{you} is the one sending the strange messages.',line:'Was it you sending those messages? Please stop.'},
 informant:{vague:'Somebody talks to the Constable. Nobody will say who.',named:'{you} talks to Reyes. Mind what you say.',line:'Keep your voice down. They say you talk to the Constable.'},
 evictor:{vague:'A landlord in {dist} put a family on the street. They kept the sofa.',named:'{you} evicted a family in {dist}. The sofa was not the point.',line:'I heard what you did to that family. Landlords.'},
 softLandlord:{good:1,named:'{you} wrote off a tenant\'s rent in {dist}. Nobody knows what to make of it.',line:'Wiping a tenant\'s debt? Either you are kind or you are up to something.'},
 shady:{vague:'Another inspector left a {dist} shop very quickly.',named:'{you}\'s shop was fined. Again.',line:'Heard about the inspector. I will not eat there.'},
 excon:{vague:'Someone came out of the Penitentiary this morning and nobody will say who.',named:'{you} did time. We all know where.',line:'I heard where you have been. It is none of my business, so I will keep it that way.'},
 vandal:{vague:'A FLACK camera in {dist} has been painted pink. HARBOR is composing a statement.',named:'{you} blinded the camera in {dist}. HARBOR noticed.',line:'Somebody painted a camera pink. Not saying it was you. Not saying it was not.'},
 saboteur:{vague:'A crate went in the harbor overnight. Foreman Duarte is not saying a word.',named:'{you} sank the shipment.',line:'Crates do not fall in the harbor by themselves.'},
 heister:{vague:'Somebody broke into {shop} at dawn. They say the vault was "extremely open."',named:'{you} did the {shop} job.',line:'Break-ins and strangers. I am locking up early.'},
 lobbyist:{good:1,named:'{you} was seen in Ashgrove\'s office before the vote. Again.',line:'Lunches with the council. You do get around.'},
 owner:{good:1,named:'{you} owns {shop} now. {owner} stayed on as manager. They say they like the hours.',line:'You bought the shop. Running it well? People are watching.'},
 picketHero:{good:1,named:'{you} stood at the picket gate until sunrise.',line:'I heard you stood at the gate. That means something here.'},
 scab:{vague:'Somebody walked through the picket line at the {dist} gate.',named:'{you} crossed the picket line.',line:'I saw who walked through the line.'},
 collapse:{vagueOnly:1,vague:'Someone fainted outside Teo\'s and was carried in like a sack of flour.',line:'Passed out outside the diner? Eat something, will you.'},
 candidate:{good:1,named:'{you} is running for mayor. The posters are already crooked.',line:'Mayor, is it? Bold. Mind the posters.'},
 crateKept:{vague:'A crate went missing from the flats. A stranger was in the area.',named:'{you} kept the crate from the flats.',line:'Keep your hands where I can see them.'},
 crateReturned:{good:1,named:'{you} handed in a crate on the flats. {owner} says that is a first.',line:'I heard about the crate. That means something.'}
};
