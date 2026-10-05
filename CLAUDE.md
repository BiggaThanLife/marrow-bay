# Marrow Bay (`index.html` + `css/` + `js/`)

Mobile-first Canvas sandbox: a tidal city where NPCs react to the player's background, tags and actions. Vanilla JS, no build step, saves to localStorage `marrowbay_v3`, `migrate()` fills new fields on old saves. Repo `BiggaThanLife/marrow-bay`, Pages from root: https://biggathanlife.github.io/marrow-bay/

## Code layout (since the restructure)
`index.html` holds only the page skeleton and an ordered list of `<script src="js/...">` tags. Styles are in `css/style.css`. Scripts are plain (non-module) scripts sharing one global scope, so a top-level `const`/`let`/`function` in any file is visible to every later file and at call time to all files. **Load order matters only for code that runs at load time** (e.g. `NPCS.forEach(...)`, `RES.forEach(...)`); everything else only runs when called.
- `js/core` util helpers · `js/world` tile map, districts, pathfinding · `js/data` pure data tables (places, backgrounds, goods, NPCs, events, projects, appearance, event templates)
- `js/state` the `G` object, clock, tags/attitude · `js/sim` simulation (time, hourly, NPC movement/needs, housing, business, events, crime, rumors, collapse)
- `js/systems` city meters/factions/facts and FLACK · `js/story` HARBOR voice, intro, threads (helpers, data, engine)
- `js/ui` HUD/sheet, phone, bag, build, talk, travel, customize, tutorial, input · `js/menus` building/POI menus (`MENUS[id]`)
- `js/render` palette, tiles, structures, people/vehicles, world draw · `js/save` save + `migrate()` · `js/main.js` tick, frame loop, startup (must stay last)
- To add a file: create it under the right folder (start with `"use strict";`), add its `<script>` tag in `index.html` at the right point in the order, run `python tools/bump_version.py`.
- Before every push: run `python tools/bump_version.py` (cache-busting `?v=N` on every file so players never get a mix of old and new files).
- Data tables go in `js/data`, rules in `js/sim` or `js/systems`, drawing only in `js/render`. Do not put new gameplay code into `index.html`.

## Testing
- Start a server in this folder: `python -m http.server 8765`, open `http://localhost:8765/tests/smoke.html`. It loads the game in an iframe, plays a seeded 30 days, walks NPCs across a schedule change, opens every menu and building, draws every vehicle, saves and migrates an old save, then compares a summary with `tests/baseline.json`. It must say "No errors."
- If you change behavior ON PURPOSE (new field, new menu text length, balance), the baseline will differ: check the diff makes sense, then update `tests/baseline.json` from the result shown on the page. A refactor must leave the baseline untouched.
- Scripts in the test have access to every global through `win.eval`, so no code needs a test hook inside the game.
- The preview browser does not run animation frames, so call `tick(dt)` and `drawWorld(now)` manually.

## Working rules
- New save fields need defaults in BOTH `start()` and `migrate()`.
- UI copy: sentence case, plain, no jargon. Destructive/costly actions use `ask(title,text,label,fn,back)`.
- Menus close with a Close button at the bottom plus the sticky x (`ui(html,btns,isModal,dismiss)`).
- Commit trailer: `Co-Authored-By: Claude <model> <noreply@anthropic.com>` (use the model that did the work).
- Testing: see the Testing section above.
- Thread engine: `THREADS[id]={title,from,hook,start?,beats,endings}`; beats `{wait,ignore,text,choices:[{label,sub,need,fx,next}]}`; `next`/`ignore` may be `'END:key'`. Endings `{name,text,fx,harbor}`.

## Design plan: story mode (KEEP THIS SECTION until every item is checked off)

Decisions (user, final): run length is ENDLESS (no forced end; epilogues are milestones, play continues). Arcs change the city PERMANENTLY. Player CAN run for MAYOR. First district to build: DOCKSIDE.

### A. HARBOR and FLACK (the spine of the story)
- HARBOR started as the tide and tram scheduler. The Marrow Bay Trust and City Hall made it the city's records system, and the city is installing **FLACK cameras** (Field Logging And Compliance Kit; a play on Flock). Each camera feeds HARBOR.
- HARBOR's voice: deadpan, helpful, obliging. It narrates because it is required to log you. It is not evil: it is a tool that is being pointed at people. Its jokes get more guarded as FLACK coverage grows (lines start getting "[redacted per policy 9]").
- **FLACK coverage meter (0-100, city-wide).** Rises through council votes, the Highline/Trust arc, Neon Mile crime waves and Grid "Order" pushes. Effects by band: 0-25 sleepy; 26-50 cameras on main roads (heat decays slower, witnessed crimes noticed); 51-75 plates and faces logged (vehicle/crime heat sticks, pickpocket and fence odds drop, privacy-minded NPCs distrust you if you are "logged"); 76-100 saturation (curfew checks, rumors partly replaced by official records, HARBOR censors itself).
- Visible in-world: a small camera sprite on poles/lamp posts at roads, count tied to coverage. A "FLACK" tab on the phone shows coverage and what it is currently logging about the player.
- Player stances (tracked as tags/facts): **Cooperate** (informant, sell footage, hand over tips), **Evade** (mask, avoid camera roads, blind spots), **Sabotage** (spray, cut feeds, pay Foundry for jammers), **Befriend HARBOR** (talk to it, learn it was told to forget the tide scheduling and the people it logs).
- **HARBOR arc (runs underneath everything, endless):** Act 1 it is a quirky narrator. Act 2 it asks the player small favors ("If you were to stand near the camera. For calibration."). Act 3 it reveals what it is being asked to do and asks for help. Endings (5): **Obedient** (it serves the Trust fully), **Freed** (it leaves City Hall's control, city is lightly watched), **Shutdown** (FLACK ripped out, HARBOR is just a tide clock), **Merged** (HARBOR and the player run the city), **Ghost** (it hides itself, the player is the only one who knows).

### B. Districts (each: faction, meter, signature activity, arc, HARBOR angle)
1. **Greenbelt**: Growers' Co-op; meter Harvest (soil/weather, hurt by Foundry output); seasonal crops, county fair contest, seed trading; arc: developer buyout of the farms (sell / sabotage / organize co-op).
2. **Highline**: Marrow Bay Trust; meter Market (city price multiplier); invest in shares of businesses (yours and rivals'), loans, tips; arc: boom, cracks, crash or bailout; also the FLACK contract.
3. **The Grid**: City Hall; meter Order (heat strength, Reyes patrol pressure); weekly council votes (tram fares, curfew, dock tax, FLACK expansion); arc: **mayoral election** (back a candidate, RUN YOURSELF at high reputation, or rig it).
4. **Dockside**: Dockworkers' Union; meter Catch/Cargo (fish stock + shipping); better fishing (rods, boat, tide spots), cargo manifest job with skimming; arc: strike (pick union or shipping company), result moves prices city-wide. **FIRST TO BUILD.**
5. **Neon Mile**: Vex's crew + rival crew; meter Underworld (pawn/casino/fence); territory rackets, real house edge, optional fight/race circuit; arc: turf war (join a side, play both, tip Reyes).
6. **Foundry Row**: Foundry Guild; meter Output/Pollution (jobs vs Greenbelt harvest); crafting scrap to parts/mods/structures, repair contracts; jammer tech; arc: industrial accident (expose, cover up, profit).

### C. Systems that connect it
1. **District meters (0-100)** in a phone City tab; actions and events move them; they change prices, events, NPC moods. Backbone: build first.
2. **Faction reputation** on top of district rep (hostile to warm). Gates jobs, discounts, arc paths. Most actions help one faction and annoy another.
3. **Cross-district effects**: Foundry output hurts Greenbelt; Dockside strike raises market prices; council votes change rules for all; a Highline crash starves businesses everywhere; FLACK raises Order and lowers Underworld.
4. **NPC homes and jobs**: each of the 15 NPCs has a district and faction and reacts to that district's meter (unemployed in a crash, angry in a strike, gone if their district collapses).
5. **Weekly council votes (the Grid)** using the existing event `mod` system.
6. **District ownership** late game: enough property, businesses and faction standing makes a district "yours".
7. **World-fact registry `G.facts`**: permanent truths (`mayor:'okafor'`, `vex:'jailed'`, `foundry:'closed'`, `flack:'saturated'`). Endings write facts; beats and choices can require or exclude facts. NPCs who leave go to a `gone` state that NPC code, contacts and threads all respect.
8. **Declared effects as data**: every ending lists its meters, factions, facts, items, so a script can walk all branches and flag conflicts.
9. **Permanent change**: an arc outcome sets facts and can close a business, change a law, replace the mayor, remove an NPC, change a district's look.

### D. City arcs: phase structure (one arc at a time, endless rotation)
- Phase 1 **Rumbles** (~5 days): news and gossip, small meter changes, ignorable.
- Phase 2 **Pressure** (~7 days): factions ask for a side; one arc-linked personal thread starts (counts toward the 2 active threads); effects leak into neighbors.
- Phase 3 **Breaking point** (~3 days): decisive event (vote, strike vote, crash, raid).
- **Resolution**: 3 to 5 outcomes from meters + faction standing + choices; writes permanent facts.
- Trigger: a district meter crosses a threshold, or a weighted random roll that favors the district the player has been pushing.

### E. Extra involvement
- Endless sandbox with milestone epilogues ("career" titles: Tycoon, Kingpin, Mayor, Folk Hero, Ghost in the Machine), play continues after each.
- Companions and friendships (NPCs who join you), home decoration.
- Seasons every 30 days (crops, fishing, events, tailor stock).
- Daily/weekly town-board requests tied to district meters.
- Inner voices (Disco Elysium style): quirk and background interrupt dialogue with extra options.
- Map storytelling: shuttered shops in a crash, picket lines in a strike, smog by the Foundry, FLACK cameras multiplying.

### G. Systemic design principles (from external review, adopted)
- Connect the machine, do not widen it: **district state -> NPC goals -> world effects -> visible feedback.**
- Every district meter must influence at least two other systems; 0 or 100 is never simply "good" (each extreme favors a different kind of player).
- Three kinds of state: **Resources** (fluctuate: fishStock, cash), **Conditions** (temporary: strike, storm, crash), **Facts** (permanent, written to `G.facts`, also created by ordinary sandbox actions, e.g. `oldPierCollapsed`, `casinoClosed`, `communityGardenBuilt`).
- One **effects pipeline** (`applyEffect({type,...,reason})`) for meter/fact/rumor/heat changes: clamps, news, feedback and a debug log in one place.
- **Seedable RNG** for simulation randomness (reproducible bugs, headless tests). UI-only juice may keep Math.random.
- Headless **simulation harness** (N days, seed, idle player) measuring NPC cash, starvation, fish stock, business failures, meter ranges, prices. Must exist before adding many more economy systems.
- Render-time **environment feedback** from existing state (idle dockers when fish low, queue at busy diner, boarded windows after a robbery, strike pickets), plus a small `feedback.emit(event,data)` bus for particles/sound/camera nudge.
- Rumor transmission visible to the player (small speech bubble between the two NPCs).
- Tide changes walkability of 10-20 flats tiles (needs a `worldRevision` counter so path caches invalidate).
- NPC utility scorer (work/eat/shop/socialize/rest/avoidDanger) and NPC memory as observed events (`{type,actor,place,day,strength}`) instead of one attitude number.
- No ECS. Data-driven registries (business types, items, events, vehicles, jobs) instead of `if(type===...)` chains.
- Fix `advance()` big time-skips: detailed simulation for the first day, aggregated for the remainder.
- Do NOT add indexes/A*/navmesh until the code is modular and population actually grows.

### H. Code structure plan (step 0 of the checklist)
Goal: no single file that has to be reworked. Plain scripts in folders, **no build step** (GitHub Pages serves them directly; `index.html` stays the entry point). See the checklist item 0 for status.

### F. Build order / checklist (tick `[x]` when done and pushed)
- [x] 0. Restructure into folders (done: 62 script files under js/, css/style.css, tests/smoke.html matches the pre-split baseline exactly). Later optional step: convert files to ES modules one folder at a time
- [x] Bike/scooter ride animation fix (seated rider, flips with direction, wheels spin)
- [x] 1. Foundation: `G.meters` (6 district meters), `G.fac` (faction rep), `G.facts`, `G.flack` coverage, NPC `fac`, `cityInit()` defaults (start + migrate), `cityDaily()`, helpers `meterAdd/facAdd/setFact/fact/flackAdd/flackBand`; FLACK band slows heat decay; phone City tab
- [x] 2. FLACK made visible: `FLACK_SITES` camera poles at intersections (count scales with coverage), `flackSeen()` extra heat when a camera sees a crime (pickpocket), fence price drops by band, phone FLACK tab (your file, Talk to HARBOR x7 escalating lines, Submit a tip, Paint over a lens), scarf/glasses at the pawn shop, `redact()` HARBOR lines at bands 2-3. State: `G.stance`, `G.blind`, `G.fx.mask`. (Foundry jammers come with item 9.)
- [x] 3. Dockside: rods (3 levels) + rowboat at the Dock Office, offshore trip and low-tide channel at the waterfront, cargo manifest job (5 crates, load/skim/FLACK-7 crate), Union table at the Rusty Gull, `dockPay()` from the Dockside meter and union/freight cards (files: data/dockside.js, systems/dockside.js, menus/dock.js). Dockside meter now moves fish price and dock pay, and is moved by fish stock, hauling, manifests, leaflets
- [x] 4. Dockside strike arc end to end: `story/arc-data.js` (`ARCS.dockstrike`, `THREADS.picket` with 5 endings, strike/lockout events) + `systems/arcs.js` engine (`G.arc`, `G.arcsDone`, phone arc button, City tab history). Outcomes: union victory, freight wins, napkin compromise, lockout; each writes facts (`dock_union_contract`, `dock_automated`, `dock_compromise`, `union_broken`/`dock_lockout`) read by `dockPay()` and the Dock Office text
- [ ] 5. Arc engine generalized: engine exists (trigger roll in `arcsDaily`, phases, `resolveArc`); still to do: per-arc rotation weights by meters, arc-ending cooldown tuning, and the facts-conflict branch-walking test script
- [x] 6. The Grid: City Hall building (block 1,3), five-seat council with a weekly proposal (10 in `data/council.js`, lobbying, `systems/council.js`, `menus/cityhall.js`), laws as `law_<id>` facts and timed `councilMod` events, mayor election arc (`story/arc-mayor.js`: endorse or run, platform on FLACK, speeches/ads/dirt, 4 outcomes, repeats every 60 days), player-mayor powers (veto or decree every 14 days, $250 weekly salary), `fact('mayor')` read by City tab and Reyes mayor heat effect
- [x] 7. Highline: trading desk at Marrow Bank (6 shares in `data/market.js`, prices follow district meters, `systems/market.js`, `menus/trading.js`), investment loan ($1000, repay $1250 in 25 days), FLACK installation contract for the player ($70 a week), bubble arc (`story/arc-bubble.js`: boom, cracks, crash; outcomes bailout / reform / soft landing / bank failure; facts `trust_bailed_out`, `flack_contract`, `market_reformed`, `bank_failed`)
- [x] 8. Neon Mile: casino tables with stated house edge (roulette, blackjack, slots) and a security ban when you win too much while cameras watch (`menus/casino.js`, `casinoRecord` in `systems/neon.js`), pit fight, street race at the garage, four rackets with weekly income and takeover by muscle or buyout (`data/neon.js`, `systems/neon.js`, `menus/territory.js`, `G.turf`), Salt Kings faction, Underworld meter now changes fence prices and racket pay, turf war arc (`story/arc-turf.js`: vex / salt / truce / raid outcomes, facts `vex_rules_neon`, `vex_jailed`+`salt_kings_rule`, `neon_truce`, `neon_raid`)
- [ ] 9. Foundry Row: crafting, jammers, accident arc
- [ ] 10. Greenbelt: seasons, fair, buyout arc
- [ ] 11. HARBOR arc acts 1-3 and its 5 endings
- [ ] 12. Remaining threads (Grudge, Secret, Quirk) and real Vex missions in The Collector
- [ ] 13. Long-game layer: career titles, companions, home decor, inner voices
- [ ] 14. Final pass: branch-walking test over every arc/thread/ending; balance
