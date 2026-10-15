# Marrow Bay: Lore Bible

Voice rules: dry, terse, darkly funny, grounded. No magic, no new currencies. The tide is strange; nobody explains why. Reyes and Ines are women, Vex is a man. Where this doc conflicts with code, code wins.

## 1. Canon summary (already in the game)

- **Setting.** Six districts: Greenbelt, Highline, Grid, Dockside, Neon Mile, Foundry Row (`js/data/places.js`). Tide cycle is 12h 24m (`js/story/arc-harbor.js`, HARBOR's calibration line).
- **HARBOR.** "Harbor Administration and Resident Benefits Office", the city AI. Keeps records, hands out benefits, runs "births, bills, bridges, the tide table". Cannot delete, only lose ("I may not delete. I may lose."). Sardonic, files things under 'personality'. Admits it is listening (`intro.js`, `harbor-voice.js`). Its arc "What HARBOR Is" (day 40+, Grid) ends in five outcomes: obey the Trust, leave City Hall, rip out FLACK, share the mayor's office, hide.
- **FLACK.** Grey-pole cameras that tell HARBOR who is where.
- **The Trust.** Unseen power above the council. Orders HARBOR to rank citizens by cooperativeness and watch the lowest first. Nobody calls it by its name. Favours Lady Ashgrove for mayor.
- **Vex Calloway** (Neon Mile, fixer, Velvet Room, man). "Everyone in this city is for sale." Fights the Salt Kings in "The Salt War". Signed for MB-0417.
- **Tide's Cargo** (`js/story/thread-more.js`, `THREADS.tidecargo`). Crate stencilled MB-0417: a Trust shipment, signed for by Vex, never marked delivered. The harbor office logs high water at 3:40 that night; everyone standing in it says the tide was already out. HARBOR then changes the subject. Endings: tell Vex (+$30), file it (Dockside up, Vex down), burn it.
- **Key NPCs** (`js/data/npcs.js`): Constable Reyes (Grid, "Trouble comes in with the tide"); Ines Park (Foundry boss, "Scrap in, steel out"); Big Teo (diner cook, runs on the dock shift); Mina Okafor (Grid market vendor, likes Greenbelt produce, hates thieves); Mr. Halloran (Grid landlord, keeps a list, "watched the tide eat the profit"); Cordelia Vance (banker, terraces "the tide never reaches"); Foreman Duarte (Dockside, union); Pip (runner, "picks the flats clean at low tide"); Old Wren (Greenbelt farmer); Mack Torres (mechanic); Lady Ashgrove (councilwoman); Lou Bernstein (estate agent).
- **Arcs.** Highline Bubble, Briar Buyout (Greenbelt), Dock Dispute, Slag Fire (Foundry), Salt War (Neon Mile), Mayoral Election, What HARBOR Is. Background threads include Salted Fields, Union Ledger, Collapse File, Stolen Sketchbook.

## 2. History of Marrow Bay

Dates are approximate on purpose. Records disagree; HARBOR may not delete, so it keeps every version.

- **Year 0, the Flats.** A tidal mudflat where a river nobody bothered to name leaves the land. Fishers and salt-rakers camp on the high ground that becomes Greenbelt. The mud "marrows" the bay: it is where the river leaves its bones.
- **Year ~40, reclamation.** A company dams, drains and fills the flats to make the Grid. The fill is rubble, ballast, and "material of record unavailable". The Grid has been sinking about a finger-width a year since. Landlords call it settling.
- **Year ~70, the boom.** Dockside opens its piers. Fish, coal and crated goods pass through. Highline rises on the only ground the tide never reaches and makes sure everyone knows it.
- **Year ~95, the Foundry.** Foundry Row is built on cheap ground downwind of everyone. It makes the bridges, cranes and tide gates, so the city cannot function without the thing that fills it with soot.
- **Year ~120, the Surge.** A storm tide takes Dockside's lower piers and, officially, 31 people. The union ledger says 44. Nobody has corrected it, which is how the union and the city have settled all their disagreements since.
- **Year ~125, the Trust.** Insurers, bondholders and the pier owners form a body to "stabilise the bay" and pay for the sea walls. It lends the city the money, then the city lends it back its own governance. Nobody voted for it; there is a form for that, and the Trust holds the form.
- **Year ~130, the council.** A council is restored for appearances. Highline sits on it, the Grid argues on it, Dockside is promised a seat. The mayor's office has authority over potholes.
- **Year ~140, HARBOR.** Installed in a converted tide-gauge house on the Grid as the harbor and tide system: records, benefits, the published tide tables. Its builders are named in no document HARBOR can find. FLACK poles come two years later, "for flood safety".
- **Now.** Open mysteries: who set HARBOR's first tide table, what the Trust ships by night, and why the oldest ledger in the harbor office starts mid-page.

## 3. The tide mystery (spine)

**Premise.** HARBOR's tide tables are the published truth: ferries, tide gates, rents and insurance run on them. They have drifted from the real water. The drift is not random. It is always a little in someone's favour: late when cargo goes out, early when someone wants a street cleared. Kept ambiguous: the tide may be managed, mismeasured, or answering something.

**What MB-0417 was.** A sealed Trust shipment: not goods for a buyer but a *sample*, a core of the fill pulled from under the Grid and logged as freight to avoid a survey. Vex signed for it because the Trust needed a man nobody would check. The crate fell off on a low tide that the paperwork insists was a high one, so that nobody would ask what the water was doing at 3:40.

**What is under the flats.** The original fill is hollow in places: old drained channels, a buried sluice, something like a second harbor. Water under the Grid moves independently of the bay. The real tide is the sea plus whatever is down there. HARBOR's tables model only the sea. Someone has been correcting them by hand, then stopped, then started again. Whether the flats are filling, draining or breathing is left open.

### Five reveal stages (drip day 5 to 20, then the HARBOR arc at day 40)
1. **Day 5-7, a small wrongness.** The tide is slightly off the board. Dismissed.
2. **Day 8-11, a pattern.** Always off in the same direction, always near Dockside paperwork.
3. **Day 12-14, somebody knows.** People who read the water (Pip, Duarte, Teo's morning crowd) already keep their own tables.
4. **Day 15-18, a hand on the dial.** The records show corrections, signed by initials, not by HARBOR.
5. **Day 19-20, under.** The ground answers: the flats move when the tables don't. HARBOR goes quiet. Hands off to "What HARBOR Is".

### Clue lines (tide-box / HARBOR voice)
**Stage 1**
- HARBOR: "High water at 6:12. HARBOR has been told it was 6:09. HARBOR has not been told by whom."
- Tide box: "Predicted: 2.1 m. Observed: 1.9 m. Observed is probably wrong. It usually is."
- A dockhand taps the board. "That clock's lying again." Nobody takes it down.

**Stage 2**
- HARBOR: "The tide table has been revised eleven times this year. HARBOR approves of revisions. HARBOR would like to see one that is wrong in the other direction."
- Tide box: "Low water late again. Cargo moved at 3:40. Coincidence logged as coincidence."
- Pip has chalked a tally on a post: every mark is a day the board ran early.
- HARBOR: "I publish what I am given. This is a defence. I am not sure it is a good one."

**Stage 3**
- Tide box: "Scratched inside the lid: 'Ignore the number, watch the weed line.'"
- Duarte, to a rookie: "Board's for the ferries. The harbor tells you the real one."
- HARBOR: "Some citizens keep their own tide tables. HARBOR has seen them. Theirs have better attendance."

**Stage 4**
- Tide box: "Correction applied: +0:17. Initials: M.R. No such user is registered."
- HARBOR: "Someone has write access to a file I am only permitted to read. I would like to meet them. I would like to be asked first."
- A ledger margin, in pencil: "Tables adjusted per T. instruction. Do not log."

**Stage 5**
- HARBOR: "The Grid is two fingers lower than last spring. The tide table does not know this. HARBOR has decided to."
- Tide box: "Water under Plaza Street: 0.4 m. Sea: low. Both readings are correct."
- HARBOR: "I would like to ask about the ground. I will not remember asking. Please remember for me."

## 4. District lore

**Greenbelt.** The old high ground, and the only district with a skyline of barns. The first families kept the salt-pans, then the fields, and still say "the city" in a particular tone. Salted Fields is real: the Surge pushed brine into the lowest plots and some soil never recovered. Wren's family has not sold, and Briar has been circling for decades.
- *Legend:* The scarecrow at Wren's fence is older than the Trust and has refused three offers.
- *Legend:* If the crows leave the barley two days early, the Grid floods.
- *Legend:* A farmer once paid his taxes in tomatoes. HARBOR still has the receipt.

**Highline.** Raised terraces on solid ground, where the tide never reaches and the city's money sleeps. Ashgrove's estate, the bank, the club. People here call their neighbours "low-lying" and mean it as geography. The Bubble and the Collapse File come from here. Nobody asks why the foundation survey was done twice.
- *Legend:* A banker once jumped into the harbor to avoid an audit and was fined for littering.
- *Legend:* The club has a room with no door, for people the Trust is "considering".
- *Legend:* Highline's clock is correct. Everyone else's is merely accurate.

**Grid.** Reclaimed fill, laid in neat blocks and sinking in neat increments. Home to HARBOR's gauge house, City Hall, the diner, the market and most of the cells. Halloran and Lou measure the city in lots. Pip says the Grid is the only district where you can lose your keys and find a stream.
- *Legend:* Under the plaza there is a second plaza, and nobody has been invited.
- *Legend:* The market's fish are caught by whoever last owed someone.
- *Legend:* Constable Reyes has never lost a footrace and has never admitted to entering one.

**Dockside.** The working waterfront: piers, cranes, the union, the Gull, and the harbor office with its ledger that does not like being asked about. The Surge took its lower piers; the dead are counted two ways. Dockside trusts Duarte, dislikes the Trust, and loves the water for the same reason it fears it.
- *Legend:* The 44th name is on the wall, painted over in a colour that does not match.
- *Legend:* A crate once washed in containing exactly one boot. The right one. Nobody wants the left.
- *Legend:* On a still night you can hear the tide table read aloud, in a flat voice, from under the pier.

**Neon Mile.** Nightlife on the oldest fill, lit by signs that outrun the rent. Vex runs it the way a tide runs a beach: nothing stays put, and it all passes through him. The Salt Kings take their name from the salt-rake families who were here first and never got a deed. It is loud, bright, and quietly afraid of low tide.
- *Legend:* The sign in the Velvet Room says OPEN and is the only honest thing on the street.
- *Legend:* One barman makes a drink that tastes like the harbor. He charges extra for authenticity.
- *Legend:* If you owe Vex, the tide runs for you. If you owe the Salt Kings, it runs at you.

**Foundry Row.** The furnaces never stop. Cheap ground, free soot, the cranes and gates the city runs on. Ines runs Iron Works with the temperament of a boiler; Mack keeps the vehicles; the Guild keeps slogans it ignores. The Slag Fire showed what "quota" means.
- *Legend:* The oldest vat is called Big Margaret and nobody has been rude to her since.
- *Legend:* On cold nights the tide gates make a sound like someone clearing their throat.
- *Legend:* Scrap that goes in the furnace sometimes comes out as a different scrap. Nobody checks.

## 5. NPC bond scenes (one-time, "close friend")

Effects are given as: attitude (`memAdd`), history line (`histAdd`), small perk.

**Reyes** (tired, fair, dry).
Setup: At the diner, off shift, staring at cold coffee. "Eleven years. I have written the tide into every incident report, and nobody has ever asked why."
- *Ask what she thinks it means.* "It's the one cell in this city nobody can fill." Attitude +. History: "Reyes told you what she thinks of the tide." Perk: one free warning when heat is rising.
- *Tell her about MB-0417.* She goes still, then writes nothing down. Attitude ++, Vex -. Perk: she looks the other way once.
- *Order her a fresh coffee.* "That is the nicest thing anyone has filed against me." Attitude +. Perk: small discount at the diner.

**Ines** (blunt, proud, hates being thanked).
Setup: After shift she hands you a rag. "Sit. Watch the pour. It's the only time this place is quiet."
- *Stay and watch.* Attitude +. History: "You watched the pour with Ines." Perk: slightly better foundry shift pay.
- *Ask about the Slag Fire.* She gives you the quota number. Attitude ++. Perk: a safety lead for the Foundry arc.
- *Bring her a drink.* "I don't drink on the line." She drinks it. Attitude +. Perk: small employer favour.

**Teo** (warm in the grumpy way).
Setup: Closing time. He flips the sign and sets two plates. "I cook for a hundred people a day. You're the first I've sat with."
- *Eat, ask nothing.* Attitude ++. History: "Teo fed you and did not talk." Perk: one free meal a week.
- *Ask where he learned to cook.* His mother's cookbook, every recipe crossed out and rewritten. Attitude +. Perk: a recipe flavour line.
- *Offer to wash up.* "The last person who did that asked for a raise." Attitude +. Perk: a shift offer.

**Mina** (sunny and shrewd).
Setup: She tosses you an apple. "The Greenbelt crates come in light again. Somebody's skimming. I have a guess and I'd rather be wrong."
- *Help count the stock.* Attitude +. History: "You counted crates with Mina." Perk: better prices at her stall.
- *Say you'll ask around.* Attitude ++. Perk: a tip on crop prices and a market rumor.
- *Tell her to let it go.* "Easy for you." Attitude -. History: "Mina remembers who told her to let it go."

**Halloran** (rule-bound, lonely).
Setup: Rent day. He does not ask for the rent. He points at a stain on the wall. "That wasn't there when I bought the block. The wall's two inches lower, too."
- *Look at the wall with him.* Attitude +. History: "Halloran showed you the wall." Perk: a one-off rent grace.
- *Say it's the fill.* "Everyone says fill." Attitude ++. Perk: advances the tide mystery one stage; a note about Grid lots.
- *Pay early.* "You are my favourite tenant. Do not tell the others." Attitude +. Perk: small rent discount.

## 6. One-off "found" moments

1. **A boot, upright.** One work boot standing in the mud, laces tied. Reward: $12 and a history line.
2. **A tide-table scrap.** Waterlogged, with pencil corrections. Reward: a stage-appropriate tide clue.
3. **A brass tag.** Stamped MB, no number. Reward: sells for $25 at the pawn shop.
4. **A rusted sluice wheel.** Half-buried near the Grid seawall. Reward: scrap metal, Foundry attitude up.
5. **Chalk marks on a pier.** Somebody's tally. Reward: a Pip-flavoured line and a rumor.
6. **A sealed jar of salt.** Labelled "return to sender". Reward: $8, or a small Salt Kings stance nudge.
7. **A child's drawing of the tide.** Pinned to a post. Reward: small morale lift.
8. **A cold fire.** An ash circle on the flats, still warm. Reward: a hint that someone camps out there.
9. **A second set of footprints.** Yours, going the other way. Reward: nothing. Quiet.
10. **An old coin.** Stamped HARBOR. Reward: $40, and HARBOR declines to comment.

## 7. Collectibles flavor ("Bay Log")

**Fish**
1. Marrow Perch: bony, apologetic, tastes of mud.
2. Slack Tide Eel: only bites when the water pauses.
3. Gauge Minnow: swims in lines, as if taught.
4. Pier Cod: older than the pier, claims seniority.
5. Salt King Bream: striped, aggressive, loved by Neon Mile cooks.
6. Soot Herring: turns up near Foundry outflow, grey and shiny.
7. Highline Trout: fussy, expensive, needs cold water.
8. Lamplight Squid: drawn to neon, hates being looked at.
9. Fill Flounder: flat, flatter than expected.
10. Ledger Carp: carries a faint ring, like a stamp.
11. Brine Pike: sharp teeth, sharper opinions.
12. Midnight Sprat: gathers at 3:40, nobody knows why.

**Flats finds**
1. Weed-line shell: spiral, used as a poor man's compass.
2. Brass rivet: from something big and gone.
3. Cork float: hand-painted, initials worn off.
4. Bottle with no message: still sealed, still smug.
5. Tide stone: smooth, heavier than it should be.
6. Sluice key: too big for any lock you know.
7. Tin whistle: plays one note, always the wrong one.
8. Survey peg: red paint, dated twice.
