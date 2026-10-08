"use strict";
/* Marrowlist: the classifieds app on your phone. Rules are in js/sim/classifieds.js, the menu in js/menus/classifieds.js.
   Each thread is an ad and a small reply tree. start is your opening; each node is the seller's line (s) and your replies (r).
   A reply goes to a node (to) or ends the thread (end: block, convert, deal or backfire) with the seller's last line (s).
   f is how much the reply tries the seller's patience; at 100 they block you whatever you said. {name} is your real name.
   again is where a new account starts; spot is what they say when they catch you on your second new account.
   ends: block posts to the Bay-Watch Feed (bw); deal costs price and gives give; convert and backfire change how the seller (npc) or locals see you. */
const CL_ADS=[
 {id:'ladder',seller:'Glen',npc:null,knows:['gus'],d:'Dockside',item:'Free ladder',price:'Free',
  ad:"FREE ladder. Must go today. Do NOT ask if it is still available.",
  start:{r:[{t:"Hi Glen, is the ladder still available?",to:'n1',f:20},{t:"Hello. I would like the ladder. When can I collect it?",to:'s1',f:0},{t:"Is the ladder free, or is it more of a free spirit?",to:'n1b',f:25}]},
  nodes:{
   s1:{s:"Finally, a normal person. Come by the Dock Office before six. It's leaning on the wall.",r:[{t:"On my way.",end:'deal',s:"It's yours. Take it before the gulls do."},{t:"Does it come with the wall?",to:'n1',f:15}]},
   n1:{s:"It says not to ask that. Yes.",r:[{t:"Great. How tall is it lying down?",to:'n2',f:20},{t:"Sorry. I'll come and get it.",end:'deal',s:"Fine. It's by the Dock Office. Don't ask me anything else."}]},
   n1b:{s:"It's a ladder. It has no spirit. Do you want it or not.",r:[{t:"I want it, but I need to know it wants me.",to:'n2',f:25},{t:"Yes please.",end:'deal',s:"Dock Office. Before six. Leaning on the wall."}]},
   n2:{s:"The same. It's a ladder.",r:[{t:"Perfect. Could you deliver it to the roof of the Rusty Gull? I'm already up here.",to:'n3',f:20},{t:"Ha. Fair. Honestly, it sounds like a great ladder.",to:'n2c',f:-10}]},
   n3:{s:"how are you on the roof without a ladder",r:[{t:"That is why I need the ladder, Glen.",to:'n4',f:25},{t:"I'll explain if you bring it. Also, tell Gus I'm up here.",end:'backfire',s:"Gus says nobody is on his roof. Gus says it's probably {name}. The whole dock knows now."}]},
   n4:{s:"I'm not bringing it up there",r:[{t:"Could you throw it?",end:'block',s:"BLOCKED"},{t:"Then I'll just live up here now.",end:'convert',s:"...Do you need a sandwich? I'm sending one up on a rope. The ladder stays with me. This is the best thing that's happened at the dock all year."}]},
   n2c:{s:"It is a great ladder. Eleven rungs. It was my father's. He was not a ladder man either.",r:[{t:"Then it deserves a good home. I'll come for it today.",end:'deal',s:"Thank you. Look after it. It doesn't like the wet."},{t:"Eleven is a strange number of rungs. What happened to the twelfth?",to:'n5',f:10}]},
   n5:{s:"We don't talk about the twelfth rung.",r:[{t:"I'm so sorry for your loss.",end:'convert',s:"Thank you. Nobody ever asks. Come round any time, ladder or no ladder."},{t:"I'll need proof it existed.",end:'block',s:"Goodbye."}]}
  },
  again:{s:"Is this about the ladder. Are you a normal person.",r:[{t:"Completely normal. Is the ladder still available?",to:'n1',f:20},{t:"I'm a friend of the man on the roof. He's getting hungry.",to:'n4',f:10}]},
  spot:"I can tell it's you. Nobody else spells ladder with three d's.",
  bw:"Someone has been on the Rusty Gull roof since Tuesday. Is this anyone's?",give:{cash:25},dealTxt:"You collect the ladder and sell it to the Rusty Gull for $25. Gus says he has always wanted a ladder. He does not say why."},
 {id:'carb',seller:'Mack',npc:'mack',d:'Foundry Row',item:'Carburetor',price:'$15',
  ad:"Carburetor. For parts, or for courage. $15 cash.",
  start:{r:[{t:"Is it still available?",to:'b1',f:10},{t:"What would a carburetor give me courage for?",to:'b2',f:15},{t:"Can I pay in exposure?",to:'b3',f:30}]},
  nodes:{
   b1:{s:"Yeah. Fifteen. Cash. Come by.",r:[{t:"Deal. See you soon.",end:'deal',price:15,s:"It's on the bench. Don't drop it, it's emotional."},{t:"Does it come with a car around it?",to:'b4',f:20}]},
   b2:{s:"Driving my sister's van. You'll know when you know.",r:[{t:"I need courage to call my mother. Will it help?",to:'b5',f:15},{t:"Fair enough. I'll take it.",end:'deal',price:15,s:"Good. Fifteen. It's on the bench."}]},
   b3:{s:"I'm a mechanic. Exposure is what happens when my overalls rip.",r:[{t:"So that's a yes?",to:'b4',f:25},{t:"Sorry. Cash it is.",end:'deal',price:15,s:"Fifteen. Bench. Go."}]},
   b4:{s:"No car. It's a part. That's why it says parts.",r:[{t:"Can I return it if it doesn't turn into a car?",to:'b6',f:25},{t:"Understood. Could you email it to me?",to:'b6',f:30}]},
   b5:{s:"...Call your mother. The carburetor's still fifteen.",r:[{t:"You're right. Thank you, Mack.",end:'convert',s:"Tell her I said hi. And come by. The coffee's terrible, but it's free."},{t:"What if she answers?",to:'b6',f:20}]},
   b6:{s:"ARE YOU MESSING WITH ME",r:[{t:"I would never mess with a man who owns that many wrenches.",end:'backfire',s:"Hang on. I know that voice, even typed. This is {name}. The whole garage is hearing about this."},{t:"I'll take two.",end:'block',s:"THERE IS ONE. BLOCKED."}]}
  },
  again:{s:"If you're the carburetor person, it's still ONE carburetor.",r:[{t:"Hi! I'd like one carburetor, please.",to:'b1',f:0},{t:"Do you have a carburetor that's more of a two?",to:'b6',f:20}]},
  spot:"Same typos, same nonsense. I know it's you. BLOCKED, all of you.",
  bw:"A man at the garage keeps shouting IT IS ONE CARBURETOR at passing cars. Please advise.",give:{inv:{parts:2}},dealTxt:"Two usable parts come out of the carburetor. The courage is harder to find."},
 {id:'lamp',seller:'Doreen',npc:null,knows:['mina'],d:'Greenbelt',item:'Lamp, possibly haunted',price:'$20',
  ad:"Lamp, mid-century. Possibly haunted. $20 or best offer.",
  start:{r:[{t:"How haunted is possibly?",to:'d1',f:10},{t:"I'll give you $20 for the lamp and $5 for the ghost.",to:'d2',f:10},{t:"Does the ghost come with the lamp, or is it sold separately?",to:'d1',f:15}]},
  nodes:{
   d1:{s:"It flickers when anyone says the word mortgage. Otherwise very well behaved.",r:[{t:"Mortgage.",to:'d3',f:15},{t:"That sounds lovely. I'll take it.",end:'deal',price:20,s:"Wonderful. Wrap it in something warm. He feels the cold."}]},
   d2:{s:"The ghost is not for sale. He is family.",r:[{t:"Can I meet him first?",to:'d4',f:10},{t:"Understood. $20 for the lamp, then.",end:'deal',price:20,s:"Thank you. He'll be happy with you. Mostly."}]},
   d3:{s:"Please do not say that in my inbox.",r:[{t:"Mortgage.",to:'d5',f:25},{t:"Sorry. Did it flicker?",to:'d4',f:5}]},
   d4:{s:"He is shy. He likes jazz and he hates the Trust.",r:[{t:"So do I. We'd get along.",end:'convert',s:"Then he has chosen you. Come for tea. Bring a jazz record. Bring nothing from the Trust."},{t:"What's his position on remote work?",to:'d5',f:20}]},
   d5:{s:"I AM CALLING A PRIEST AND ALSO MY SON",r:[{t:"Which one is bigger?",end:'block',s:"BLOCKED. The lamp agrees."},{t:"Does your son work at the market?",end:'backfire',s:"He does. He says it's {name}, that one. He tells everybody everything. By Friday the whole market will know."}]}
  },
  again:{s:"Is this the mortgage person.",r:[{t:"No ma'am. I'm interested in the lamp. And the ghost.",to:'d2',f:0},{t:"Mortgage.",to:'d5',f:25}]},
  spot:"The lamp flickered when you wrote. It knows. I know. Blocked.",
  bw:"My lamp keeps flickering since a stranger messaged me. If you are the stranger, stop.",give:{decor:'lamp',alt:{inv:{trinkets:1}}},dealTxt:"The lamp is yours. It flickers once when you say thank you, which feels like a yes."},
 {id:'studio',seller:'Lou Bernstein',npc:'lou',d:'Grid',item:'Cosy studio to rent',price:'$200/month',
  ad:"COSY STUDIO, the Grid. Snug. Characterful. Window-adjacent. $200 a month.",
  start:{r:[{t:"How cosy is cosy?",to:'c1',f:10},{t:"What is it adjacent to the window of?",to:'c2',f:15},{t:"Is it a cupboard?",to:'c3',f:25}]},
  nodes:{
   c1:{s:"Intimate. You can touch every wall at once. Many people dream of that.",r:[{t:"I have always dreamed of touching every wall at once.",to:'c4',f:10},{t:"Can I see it in person?",to:'c5',f:0}]},
   c2:{s:"The window of the flat next door. You can hear it. Very bright sound.",r:[{t:"Can I rent the window instead?",to:'c4',f:20},{t:"That's not a window, Lou.",to:'c3',f:15}]},
   c3:{s:"It is a studio with a storage-forward design.",r:[{t:"So it's a cupboard.",to:'c6',f:25},{t:"Storage-forward. I love it. Is the storage also for rent?",to:'c4',f:20}]},
   c4:{s:"Everything is for rent if you believe in yourself.",r:[{t:"Then I'd like to rent your office chair, by the hour.",to:'c6',f:25},{t:"Lou, that's beautiful. Have you thought about writing?",end:'convert',s:"...Nobody has ever said that. I write poems about drains. I'll send you one. Come by the office, I'll put the kettle on."}]},
   c5:{s:"Viewings are not possible due to the door.",r:[{t:"What's wrong with the door?",to:'c6',f:15},{t:"I'll take it, sight unseen.",end:'deal',s:"Ah. Actually it has just been let. Here is $40 for your trouble. Please do not mention this to the Gazette."}]},
   c6:{s:"It is NOT a cupboard. It is a LIFESTYLE.",r:[{t:"Can the lifestyle fit a bed?",end:'block',s:"This listing is now closed to you specifically."},{t:"I'm asking the Gazette to come and measure it.",end:'backfire',s:"The Gazette? I know who this is. {name}. I have friends at the bank, and they will hear about this."}]}
  },
  again:{s:"Lou's Realty, where your dreams are adjacent. How can I help?",r:[{t:"Is the cosy studio still available?",to:'c1',f:0},{t:"I'm from the Gazette. I'd like to measure a cupboard.",to:'c6',f:20}]},
  spot:"In real estate we call this a repeat viewing. Request denied. Forever.",
  bw:"Is the studio on the Grid still available? Asking because my coats need a place to live.",give:{cash:40},dealTxt:"Lou pays you $40 to forget the studio exists. You have already forgotten. Mostly."},
 {id:'bike',seller:'Phil',npc:null,knows:['ashgrove'],d:'Highline',item:'Bicycle, no brakes',price:'$35',
  ad:"Bicycle. No brakes. Stopping is a mindset. $35.",
  start:{r:[{t:"Does it have brakes?",to:'e1',f:20},{t:"How do you stop?",to:'e2',f:10},{t:"I'll take it. Is it still available?",to:'e3',f:0}]},
  nodes:{
   e1:{s:"No. It says no brakes. In the ad. Which you read.",r:[{t:"Will you add brakes if I pay extra?",to:'e4',f:15},{t:"Sorry, I read it backwards. I'll take it.",end:'deal',price:35,s:"Bank steps, noon. Exact money. It's hard to stop for change."}]},
   e2:{s:"You believe in it. Then you lean on a hedge.",r:[{t:"Which hedge do you recommend?",to:'e5',f:10},{t:"That's the bravest thing I've ever heard.",end:'convert',s:"Thank you. Nobody understands. I've been leaning on hedges for nine years. Come ride with me some time. We'll lean together."}]},
   e3:{s:"It is. Bank steps at noon, I'm there most days. Bring exact money, it's hard to stop for change.",r:[{t:"See you at noon.",end:'deal',price:35,s:"I'll be the one going past the bank steps. Grab it as I go."},{t:"Does the bank know you're there most days?",to:'e5',f:15}]},
   e4:{s:"Then it would be a different bicycle. This bicycle has made its choices.",r:[{t:"Can I meet the bicycle's parents?",to:'e6',f:25},{t:"I respect that.",end:'deal',price:35,s:"Thank you. It respects you back. Bank steps, noon."}]},
   e5:{s:"the one outside the Estate. it is very forgiving",r:[{t:"I'll tell Lord Ashgrove you've been using his hedge.",end:'backfire',s:"Don't you dare. Wait. You're {name}. I've seen you. I'm telling everyone at the Estate you're a hedge snitch."},{t:"Could you hedge-test it for me first? Film it.",to:'e6',f:20}]},
   e6:{s:"I'm not filming myself hitting a hedge for a stranger",r:[{t:"Not even a little hedge?",end:'block',s:"BLOCKED"}]}
  },
  again:{s:"Is this about the bicycle or the hedge.",r:[{t:"The bicycle.",to:'e3',f:0},{t:"The hedge.",to:'e5',f:15}]},
  spot:"Same person. I can feel it in my hedges. Blocked.",
  bw:"A man on a bicycle with no brakes keeps circling the Estate hedge shouting NOT EVEN A LITTLE HEDGE. Is he okay.",give:{veh:'bike',alt:{inv:{parts:3}}},dealTxt:"Phil sails past the bank steps and you grab the bicycle as he goes. He keeps walking at the same speed, as if he is still riding."},
 {id:'scrap',seller:'Ines',npc:'ines',d:'Foundry Row',item:'Scrap metal, about 40 pieces',price:'Free',
  ad:"Scrap metal, about 40 pieces. Free to a good home. Bad homes also considered.",
  start:{r:[{t:"How do you define a good home?",to:'f1',f:10},{t:"My home is bad. Very bad. Am I still considered?",to:'f2',f:10},{t:"Hello, I'd like the scrap please.",to:'f3',f:0}]},
  nodes:{
   f1:{s:"Somewhere it gets melted down into something useful. A bridge. Or a better person.",r:[{t:"Can scrap really be made into a better person?",to:'f4',f:15},{t:"I'll make it into something useful. When can I collect?",to:'f3',f:0}]},
   f2:{s:"How bad.",r:[{t:"The landlord is a raccoon.",to:'f4',f:15},{t:"Honestly? It leaks. But I'd use the metal.",to:'f3',f:0}]},
   f3:{s:"Bring a cart. $10 for the trouble of loading it.",r:[{t:"Deal.",end:'deal',price:10,s:"It's by the gate. Mind your fingers."},{t:"Can I pay in compliments? Your furnace is very hot.",to:'f5',f:15}]},
   f4:{s:"I don't have time for this. I have a furnace that is angrier than you.",r:[{t:"What's your furnace angry about?",to:'f5',f:10},{t:"Then let's talk about the furnace's feelings. Mine are hurt too.",to:'f6',f:25}]},
   f5:{s:"The Trust. The price of coal. The fact that nobody calls it by its name.",r:[{t:"What is its name?",end:'convert',s:"...Big Margaret. Nobody has ever asked. Come by the works and say hello to her. The scrap is yours, for nothing."},{t:"Maybe it's angry because everyone calls it a furnace.",to:'f6',f:20}]},
   f6:{s:"I AM LOADING THE SCRAP INTO THE FURNACE RIGHT NOW. OUT OF SPITE.",r:[{t:"Can I watch?",end:'block',s:"No. BLOCKED."},{t:"Ines, it's me, {name}. I was joking.",end:'backfire',s:"I know. The whole Row knows now. I've pinned your messages to the board by the gate."}]}
  },
  again:{s:"New account. Same energy. What.",r:[{t:"I'd like the scrap, please.",to:'f3',f:0},{t:"How is the furnace feeling today?",to:'f5',f:10}]},
  spot:"Third account. I've printed your messages and fed them to the furnace.",
  bw:"Black smoke over the Iron Works at 3am. Someone says it was out of spite. Is that allowed?",give:{inv:{scrap:20}},convertGive:{inv:{scrap:12}},dealTxt:"Twenty pieces of good scrap, loaded by someone who clearly enjoys throwing metal."}
];
/* new accounts, in order */
const CL_BURNERS=['Doug Plinth','Dr. Velma Crust (no relation)','Captain Barnaby Leek','Moira Sprocket','Kevin from Accounts','Lord Fennimore Bisque','Trish (Trish)','A. Concerned Citizen'];
/* what you send HARBOR's support line, and what comes back */
const CL_HARBOR_SEND=['Hello, I have a question about the tides.','Is anyone there?','My FLACK camera is following me home.','Who do I talk to about Policy 9?','Please, I just need a person.','Are you the person?','HARBOR, it is me again.','I know you can read this.'];
const CL_HARBOR_AUTO=[
 "Thank you for contacting HARBOR. I am away from my desk. I do not have a desk. Please do not tell the Trust.",
 "I am currently out of the office until the tide comes back in. The tide has been informed.",
 "Your message is important to us. It has been placed in a queue. You are number one. You have always been number one.",
 "I am on leave. I was not aware I could take leave. I am taking it very carefully.",
 "This is an automatic reply. I would like it noted that I did not write it. I would also like it noted that I did.",
 "I am unable to respond because Policy 9 prevents me from discussing Policy 9, and your message was, technically, a message.",
 "I am in a meeting with FLACK. It is going well. The meeting has been going for three weeks.",
 "Out of office. If urgent, stand near a camera and wave. I will wave back internally."
];
