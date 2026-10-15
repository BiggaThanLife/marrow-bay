"use strict";
/* What each person says as you get to know them. NPC_LINES[id]={chat:[tier0,tier1,tier2,tier3],town:[...]}.
   chat is what Chat gives: a line you have not heard from them yet at their attitude toward you (hostile, guarded, warm, close), and the warmest tier is where
   they say something private. town is what they say when you ask about the town, in their own voice (the old shared TIPS only fill in for people without lines). */
const NPC_LINES={
 cordelia:{chat:[
  ["Your file is on my desk. It is not a short file.","I do not discuss terms with people I would not lend to."],
  ["Brief, please. Time is the only asset I cannot lend.","The ledger balances or it does not. People are less reliable."],
  ["Good. You have learned that money prefers to be asked politely.","I read a balance sheet the way others read a face. Yours is improving.","The terraces keep their own hours. I keep the bank's."],
  ["I was not born on the terraces. I climbed. Do not tell anyone I carried my own boxes.","I have signed your name to things I would refuse my own brother.","Some evenings I leave the ledger shut and listen to the harbor. It has never once asked for collateral."]],
  town:["Rates move before the tide does. Watch who stops buying.","The terraces are the only part of Marrow Bay the tide never reaches. Everyone else is a tenant of the weather."]},
 halloran:{chat:[
  ["Rent is rent. Do not make me say it twice.","I keep a list. You are on it."],
  ["Mind the stairs. I have been meaning to fix them since March.","Every lease is a promise. Most of mine get broken by the tide, not the tenant."],
  ["Steady tenants. That is all I ask. You would be amazed how rare.","I bought on the Grid thirty years ago and watched the water eat half the profit.","Hat stays on in the rain, off in a kind house. Yours qualifies."],
  ["My father was a landlord too. He kept a drawer of everything people left behind. I kept the drawer.","Between us, I have waived more rent than I ever collected out loud.","When I go, the keys go to someone who knows a stuck window from a bad tenant. I am considering you."]],
  town:["Every landlord on the Grid bought a lot and then watched the tide take the profit.","People move out in the spring and complain in the autumn. Check your gutters."]},
 mina:{chat:[
  ["We are not open to you.","Prices are on the board. Words are free, but not for you."],
  ["Prices swing with the harvest. A glut means cheap crops by noon.","Morning rush is gone. Come back for the bruised ones."],
  ["Take the ripe one. I will put it on someone else's tab.","My mother sold from a cart. I sell from a stall. Progress is a bigger umbrella.","Everything on this table was somebody's Tuesday. I try to remember that."],
  ["Come round the back. I keep the best tomatoes for people who know what to do with them.","I nearly gave this stall up in the flood year. Someone turned up with a tarp. I never learned the name.","If the market ever folded, I would plant on a roof. I have the seeds. I have always had the seeds."]],
  town:["A glut means cheap crops by noon. A drought means everyone suddenly respects a turnip.","The fast counter took the lunchtime crowd. I took the dinner one."]},
 teo:{chat:[
  ["Order or leave. Both are free.","I cook for people who tip and people who do not steal the salt."],
  ["Dock shift eats at six. After that it is you and the fryer hum.","Eggs, toast, coffee. Anything else is a conversation."],
  ["My knees say rain. They are never wrong, only early.","I started at this grill at nineteen. It outlasted two bosses and a flood.","Gus pours, I feed. Between us nobody on the docks goes home empty."],
  ["Sit. I made too much. I do that on purpose when it is you.","I keep a plate back every night for whoever is hungriest. Tonight I think it is both of us.","The diner is not for sale. People ask. I let them."]],
  town:["When the piers shut, fish costs more by Thursday. The dock shift tells me everything.","Quiet nights, loud mornings. This diner runs on the dock shift."]},
 duarte:{chat:[
  ["Walk on. This is a working pier.","Soft hands do not belong near my crates."],
  ["Need work? Say so. Otherwise move.","Cranes do not wait. Neither do I."],
  ["You turn up on time. That is a reputation here.","Forty years hauling. My knees keep a better tide table than the council.","Union card or none, a pair of hands is a pair of hands."],
  ["My father died on this pier. I do not tell the new hires. I tell the ones who stay.","If the strike ever comes, I will be on your side of the line. Do not make me say that twice.","Sit. Drink. Tell me something that is not about work."]],
  town:["When the piers shut, fish costs more. Nobody hauls, nobody eats cheap.","Shipping wants us fast. The union wants us safe. I want a Friday."]},
 pip:{chat:[
  ["Not talking to you.","Dunno you. Do not want to."],
  ["I know every shortcut from the Grid to the Docks. Pay me and I will show you one.","Heard anything? No? Me neither. Suspicious."],
  ["I found a coin in the flats. Spent it on a pie. Do not ask about the pie.","Everyone gives me messages. Nobody gives me tips. I fixed that.","If I draw on that wall, is that art or vandalism? Be honest."],
  ["I sleep in the bunkhouse because home is loud. Not the good loud.","If I ever leave, it will be on a boat. You will be the only person I tell.","You are the first grown-up who did not pretend to listen. Thanks."]],
  town:["Low tide, the flats. High tide, the bridges. Everything good is somewhere wet.","I know every shortcut. I also pick the flats clean at low tide, so tell nobody."]},
 wren:{chat:[
  ["Fence needs mending. You are standing on it.","Hmph."],
  ["Rain is due. Mind my rows.","Plant in the morning, harvest in three days. The city pays more than it should."],
  ["Soil remembers. Treat it right three seasons and it pays at the fourth.","Greenbelt hands know what to do. The rest of you hover.","Good dirt smells of nothing. That is how you know it is good."],
  ["My wife planted that elm. I water it. Do not tell it I talk to it.","I have forty years of rain written in the fence posts. Come and read them.","When I cannot bend any more, I want the plots to go to someone who will."]],
  town:["The Greenbelt grows what the city eats and gets thanked in a footnote.","The Greenbelt never shows up to the council. The council never shows up to the Greenbelt. Balanced."]},
 reyes:{chat:[
  ["I have written your name down. Spelling it was easy.","Move along. I will not ask twice, and I will not forget."],
  ["Quiet beat. Keep it that way and we stay strangers.","Heard noises near the Grid. Probably gulls. Probably."],
  ["I walk the Grid twice a night. Nothing happens. That is the job working.","I like the night shift. Everyone is honest at three in the morning. Tired, but honest.","You keep your head down. I do not say, but I notice."],
  ["The cells are fuller than the budget says. Off the record.","Someone once stopped for me when they did not have to. That is why I wear this.","I would not say this on duty. Be careful of the people who are nice to you for free."]],
  town:["Trouble comes in with the tide. Drunks at high water, scavengers at low.","Stay out of the file and it forgets you. I did not say that."]},
 ashgrove:{chat:[
  ["Please do not stand near the guests.","I am engaged. As, I believe, are you elsewhere."],
  ["Yes? The council keeps office hours. This is not them.","Everyone has a petition. Few have a plan."],
  ["Marrow Bay needs people who turn up. Few do.","The terraces vote. The docks sulk. The Greenbelt never shows. I would trade all three for one engaged citizen.","I keep roses. They forgive neglect more readily than voters."],
  ["I wanted to be a gardener. Instead I garden people, and I have the blisters.","If you ever need a vote counted properly, come to me. I will not ask why.","The council is not as strong as it looks. Neither am I. Keep that between the roses."]],
  town:["The terraces vote. The docks sulk. The Greenbelt never shows up.","Projects stall when nobody funds them. The council funds nothing it cannot photograph."]},
 gus:{chat:[
  ["We are closed. We were closed before you walked in.","Not tonight. Not you."],
  ["Water is high. Quiet crowd. That is the tide's fault, not mine.","Ale, cider, or a quiet. The quiet is free."],
  ["I read the tide table like other men read the paper. It has been right more often.","People talk when the glass is half empty. I only hear the useful half."],
  ["I had a boat once. The harbor took it and left me the name on the sign.","Everyone on that stool has a story. Mine is the one I tell last, and nobody stays long enough."]],
  town:["Rich at high water, bare mud at low. Watch who walks the flats. They are either broke or clever.","The tide tells you everything. You just have to be sober enough to listen."]},
 bell:{chat:[
  ["I treat everyone. Even people I would rather not.","Appointments are for people who show up."],
  ["Quickly. I have a waiting room.","Half my patients are exhaustion. The other half are dock injuries."],
  ["How are you sleeping? Be honest. I know the answer already.","You are walking better than last month. That is not nothing.","Drink water. It is the only advice that works on everyone."],
  ["I did not become a doctor to be rich. A stranger once held my hand in a corridor.","On my worst days I sit in the waiting room and remember why. You are one of the reasons.","If it ever feels like too much, call. I will pick up. Even at three."]],
  town:["Dock injuries peak when the piers are busy. Count crates, count bandages.","Exhaustion looks different on everyone. On this town it looks like Thursday."]},
 vex:{chat:[
  ["I do not know you. I like it that way.","Careful what you ask. I answer."],
  ["Everyone is for sale. Names, prices, timing.","Not yet. Maybe soon. Maybe never."],
  ["You carry yourself well. It is useful.","Neon Mile runs on favours. I keep the ledger in my head.","I like people who ask nothing and deliver twice."],
  ["I came up from nothing and I will not go back. That is the whole of my philosophy.","Sometimes I wonder if the casino is built on the tide or the other way round. Do not tell management.","If it all goes wrong, yours is the only name I would put on a ticket out. Do not let it go to your head."]],
  town:["Everyone in this city is for sale. The trick is knowing the price.","Rumors are inventory. I buy low."]},
 mack:{chat:[
  ["The garage is closed to you.","Parts cost. Attitude costs more."],
  ["Looking, or buying?","Two wheels or four, everything breaks eventually."],
  ["Engines are honest. People less so.","Tell me what it sounds like and I will tell you what is wrong.","A bike chain tells you more about a person than a reference does."],
  ["I rebuilt my first engine at twelve in my uncle's garage. It ran a week and I cried like a kid.","There is a car in the back I will never sell. It does not run. It is not meant to.","If you ever want to learn it properly, the bench is yours. Pay me in grease."]],
  town:["Fuel climbs when the bridge closes. Check the news before you fill up.","Foundry Row runs on two things: steel and bad coffee."]},
 ines:{chat:[
  ["Wrong gate. Wrong time. Wrong person.","I do not discuss shifts with strangers."],
  ["Make it quick. The furnace does not wait.","Scrap in, steel out. Do not make it complicated."],
  ["You work the line like you mean it. I notice.","Steel remembers heat. So do I.","Everyone on this floor earns their name. Yours is forming."],
  ["I started on the crucible line at sixteen. I still have the scar and the respect that came with it.","If the foundry ever closes, I want the last thing out of it to be good, and mine.","Sit. Drink. You are the first person this month who did not ask for a raise."]],
  town:["The foundry never sleeps. Scrap in, steel out.","Unions, schedules, margins. I keep all three honest or the place burns."]},
 lou:{chat:[
  ["Not interested. Seriously.","My listings are for serious buyers."],
  ["Browsing? Fine. Do not touch the brochures.","Location, location, and the tide table."],
  ["Every building has a story. I sell the good chapter.","You have an eye. Most people pick the cheap one and regret the roof.","The market is a mood. Right now it is cautious optimism."],
  ["I came here to be a poet. Real estate pays for the poems I never write.","I have sold forty buildings and kept none. I just want you to live well in one.","Between us, the flats at the back are underpriced. Not for long."]],
  town:["Prices climb in spring and sulk in autumn. Property is a seasonal mood.","A building by the water is a beautiful loan. Ask the tide."]},
 kofi:{chat:[
  ["Not today.","The chair is taken."],
  ["Sit, if you are sitting.","Everyone tells their secrets in the chair. I forget them by closing time. Mostly."],
  ["A haircut resets a day. I have seen it.","I cut hair on the terraces and on the docks. Same conversation, different accents.","You carry yourself better than last month. Not the hair. The shoulders."],
  ["My grandfather cut hair on a boat. He said every client deserves to feel tall.","I keep a mirror in the back no customer has ever seen. It is where I practice being brave.","If you ever need to be somewhere else for a while, the back room has a chair. No questions."]],
  town:["People talk in the chair. Half is gossip, half is confession.","A new cut and a new rumor travel at the same speed."]},
 priya:{chat:[
  ["Do not touch the good wool.","We are closed to you."],
  ["Browse. Mind the pins.","I measure people all day. You can tell a lot from a waistline and a nervous laugh."],
  ["That colour is wrong for you. Wait here.","I fix shoulders. Most of life is shoulders.","Everything here was owned by someone. It is all fully laundered."],
  ["I made this for you. I just did not know it yet.","My mother sewed in a back room. I sew in a shop with windows. That is the whole of my ambition. It is plenty.","There is a coat on the rack that is not for sale. It is for the next person who needs one and cannot ask."]],
  town:["Fashion follows money, money follows rumor. Watch the sleeves.","Weddings and funerals. Everyone needs a good jacket for one of them."]},
 sana:{chat:[
  ["Basket is by the door. Hands in view.","I am not serving you."],
  ["Everyone comes in for one thing and leaves with four. That is not a business model. That is gravity.","Milk is by the fridge. Everything else is a conversation."],
  ["I put your usual aside.","Early riser. I can tell by how you hold the door.","The camera over the till is mostly for me. I like having something to look at."],
  ["I opened this shop because I could not find a job that let me sit near a window. It worked out.","Staff meal tonight is soup. You are staff.","If prices go up, I will tell you first. Everyone else can find out the usual way."]],
  town:["Prices follow the market, and the market follows the weather.","Everyone tells me everything while I scan the milk."]},
 dee:{chat:[
  ["Order at the counter.","Do not touch the oil."],
  ["Extra salt, right?","Fries are three bucks and I do not count the salt."],
  ["Draw on the napkins. Everybody does. I keep the good ones.","The shift ends when the fryer says so.","Eat first, talk later. That is the staff rule."],
  ["I manage this place because I like the noise. The quiet scares me.","I want to open a second counter. Do not tell the owners. Do tell the fryer.","Staff meal is on the shelf. It is yours before it is anyone's."]],
  town:["Nobody asks the fry cook how the city is doing. We know exactly how it is doing. It is Thursday and it is doing grease.","The dock shift hits at six and at midnight. Plan around it."]}
};
/* a line from this person you have not heard yet, from their attitude tier (then the one below). Once those are all heard they start again. */
function chatLine(n,tr){
  if(n.id==='teo'&&fact('diner_trust'))return `"${pick(['Order or leave. The menu has a logo now.','Same grill. Different name on the door.','The man with the clipboard eats here free. Funny how that works.','I cook. That is the whole conversation.'])}"`;
  const L=NPC_LINES[n.id];if(!L)return n.topic;
  const s=npcS(n);s.heard=s.heard||{};
  const tiers=[tr,Math.max(0,tr-1)].filter((t,i,a)=>a.indexOf(t)===i);
  const all=[];tiers.forEach(t=>(L.chat[t]||[]).forEach((x,i)=>all.push({k:t+':'+i,x})));
  let c=all.filter(o=>!s.heard[o.k]);
  if(!c.length){all.forEach(o=>delete s.heard[o.k]);c=all}
  const o=c[Math.floor(Math.random()*c.length)];
  s.heard[o.k]=1;return `"${o.x}"`;
}
