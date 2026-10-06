# Marrow Bay (`index.html` + `css/` + `js/`)

Mobile-first Canvas sandbox: a tidal city where NPCs react to the player's background, tags and actions. Vanilla JS, no build step, saves to localStorage `marrowbay_v3`, `migrate()` fills new fields on old saves. Repo `BiggaThanLife/marrow-bay`, Pages from root: https://biggathanlife.github.io/marrow-bay/

## Code layout
`index.html` holds only the page skeleton and an ordered list of `<script src="js/...">` tags. Styles are in `css/style.css`. Scripts are plain (non-module) scripts sharing one global scope, so a top-level `const`/`let`/`function` in any file is visible to every later file and, at call time, to all files. **Load order matters only for code that runs at load time** (e.g. `NPCS.forEach(...)`, `RES.forEach(...)`, `ARCS.x.hook.voices=...`); everything else only runs when called.
- `js/core` helpers · `js/world` tile map, districts, pathfinding, `buildWorld(seed)` · `js/data` pure data tables
- `js/state` the `G` object, clock, tags and attitude · `js/sim` simulation (time, hourly, NPC movement and needs, housing, business, events, crime, rumors)
- `js/systems` city meters, factions, facts, FLACK, arcs engine, council, market, neon, foundry, dockside, seasons, career, companion
- `js/story` HARBOR voice, intro, threads (helpers, data, engine, more), arc data (one file per arc, plus `arc-voices.js`)
- `js/ui` HUD and sheet, popup, quantity picker, phone, bag, build, talk, travel, customize, tutorial, input · `js/menus` building and POI menus (`MENUS[id]`)
- `js/render` palette, tiles, structures, people and vehicles, world draw · `js/save` save and `migrate()` · `js/main.js` tick, frame loop, startup (must stay last)
- To add a file: create it under the right folder (start with `"use strict";`), add its `<script>` tag in `index.html` at the right point in the order.
- **Before every push run `python tools/bump_version.py`** (cache-busting `?v=N` on every file so players never get a mix of old and new files).
- Data tables go in `js/data`, rules in `js/sim` or `js/systems`, drawing only in `js/render`. No gameplay code in `index.html`.

## Testing
Start a server in this folder (`python -m http.server 8765`) and open:
- `/tests/smoke.html`: plays a seeded 30 days, walks NPCs across a schedule change, opens every menu and building, draws every vehicle, saves and migrates an old save, compares with `tests/baseline.json`. Must say "No errors." If behavior changes ON PURPOSE the baseline will differ: check the diff makes sense, then update `tests/baseline.json`. A refactor must leave it untouched.
- `/tests/arcs.html?runs=40`: plays every arc and thread through random and subset strategies and checks the game state after each step. Must say "No errors". The "not reached" list only names endings that need a specific setup (mayor, FLACK-7, mission chain).
- `/tests/sim.html?games=4&days=365`: a year with an idle bot. Flags runaway loops (pinned meters, empty seas, NPC cash exploding or collapsing, starving NPCs, FLACK maxed). Run it after any economy change.
- Tests reach every global through `win.eval`, so nothing needs a hook inside the game. The preview browser does not run animation frames, so call `tick(dt)` and `drawWorld(now)` by hand.

## Working rules
- New save fields need defaults in `cityInit()` (called from both `start()` and `migrate()`) or in both places.
- UI copy: sentence case, plain, no jargon. Destructive or costly actions use `ask(title,text,label,fn,back)`. Quantities use `qtyMenu` (live total).
- Menus close with a Close button at the bottom plus the sticky x (`ui(html,btns,isModal,dismiss)`). Major alerts use `popup()` (centered, pauses the game); `alertNews(m,sev)` pops up at severity 3 or more.
- Commit trailer: `Co-Authored-By: Claude <model> <noreply@anthropic.com>` (the model that did the work).
- Thread engine: `THREADS[id]={title,from,hook,start?,beats,endings}`; beats `{wait,ignore,text,choices:[{label,sub,need,fx,next}]}`; `next` and `ignore` may be `'END:key'`. Endings `{name,text,fx,harbor}`.
- Arc engine: `ARCS[id]={title,district,hook?,can,phases:[{name,days,blurb,enter,daily,actions}],resolve,outcomes,status}`. Outcomes set permanent facts (`setFact`), which other systems read with `fact(key)`.

## What exists (story mode, all built)
Endless sandbox. Arc outcomes change the city permanently and play continues after every milestone.
- **HARBOR and FLACK** (the spine). HARBOR is the deadpan city AI; FLACK cameras (a play on Flock) feed it. FLACK coverage 0-100 shows as camera poles on the map, slows heat decay, cuts fence prices, and makes HARBOR redact its own lines. Phone FLACK tab: your file, talk to HARBOR (7 lines), tip, paint a lens, jammers. HARBOR's own arc starts after day 40 once you have heard it all, with five endings (obeys, free, FLACK torn out, merged with the mayor, ghost).
- **Six districts**, each with a faction, a meter and an arc: Greenbelt (Co-op, Harvest, farm buyout), Highline (Trust, Market, share trading and the bubble), the Grid (City Hall, Order, council votes and the mayoral election, which repeats every 60 days and lets you run), Dockside (Union and Harbor Freight, Catch and cargo, fishing gear, manifests, the dock strike), Neon Mile (Vex and the Salt Kings, Underworld, casino with a real house edge, rackets, street race, turf war), Foundry Row (Guild, Output, crafting and jammers, the slag fire).
- **Systems that connect them**: district meters and faction reputation (phone City tab), the permanent fact registry `G.facts`, cross-district effects (Foundry output hurts Greenbelt, FLACK raises Order and lowers Underworld, strikes and crashes move prices), seasons (30 days each, county fair in autumn), career titles, one companion with a perk, home decor, inner voices on arc hooks.
- **Threads** (personal stories, max 2 active, 5 endings each): The Collector (real Vex missions), The Rival, four origin stories, The Picket Line, The Grudge, The Secret, Your Quirk.
- **Arc triggering**: arcs with a `hook` start from a story hook. `G.engage[district]` rises when you enter a building there (+1), work a gig (+2) or own a business (+0.5 a day). Once it reaches `hook.need`, an NPC there offers the arc (accept or "not now", asked again after 4 days). Only one arc runs at a time, with a 6-day gap; a second NPC says they will not talk about it until the first concludes. The mayoral election and HARBOR's arc start on their own. An arc you stay out of ends with a HARBOR digest of what changed.
- **Procedural city**: `buildWorld(seed)` shuffles buildings, lots and parks between the blocks of each district per new game (`G.seed`; seed 0 is the classic layout kept for old saves). Roads, borders, tram stops, the bridge, the plaza and the farm are fixed.

## Design rules to keep
- Connect the systems instead of widening them: district state, NPC goals, world effects, visible feedback.
- Every district meter should influence at least two other systems, and 0 or 100 is never simply good.
- Three kinds of state: resources (fluctuate), conditions (temporary events and `councilMod`s), facts (permanent).
- No ECS and no build step. Prefer data tables over `if(type===...)` chains.
- Do not add path caches, indexes or A* until population actually grows.

## Ideas not built yet
Tide changing walkable flats tiles (needs a world revision counter for paths), visible rumor bubbles between NPCs, a feedback bus for particles and sound, NPC utility goals and event memory, an effects pipeline with a debug log, seedable RNG for the simulation, moving district borders in the procedural map, converting scripts to ES modules one folder at a time, more arcs and arc sequels.
