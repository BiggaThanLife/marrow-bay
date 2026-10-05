# Marrow Bay (single file: `index.html`)

Mobile-first Canvas sandbox: a tidal city where NPCs react to the player's background, tags and actions. Vanilla JS in one IIFE, saves to localStorage `marrowbay_v3`, `migrate()` fills new fields on old saves. Repo `BiggaThanLife/marrow-bay`, Pages from root: https://biggathanlife.github.io/marrow-bay/

## Working rules
- New save fields need defaults in BOTH `start()` and `migrate()`.
- UI copy: sentence case, plain, no jargon. Destructive/costly actions use `ask(title,text,label,fn,back)`.
- Menus close with a Close button at the bottom plus the sticky x (`ui(html,btns,isModal,dismiss)`).
- Commit trailer: `Co-Authored-By: Claude <model> <noreply@anthropic.com>` (use the model that did the work).
- Testing: `python -m http.server 8765` in this folder, copy `index.html` to `test.html` with `window.__t={...}` injected after the final `title();` line. The preview browser does not run rAF, so call `tick(dt)`/`drawWorld(now)` manually. Delete `test.html` before committing.
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

### F. Build order / checklist (tick `[x]` when done and pushed)
- [x] Bike/scooter ride animation fix (seated rider, flips with direction, wheels spin)
- [ ] 1. Foundation: `G.meters` (6 district meters), `G.fac` (faction rep), `G.facts`, `G.flack` coverage, NPC home district/faction, migrate defaults
- [ ] 2. City tab on phone + FLACK tab + visible FLACK cameras on the map; HARBOR "redacted" lines scale with coverage
- [ ] 3. Dockside: fishing upgrades, cargo manifest job, union/shipping factions
- [ ] 4. Dockside strike arc end to end (3 phases, 4 outcomes, facts, permanent changes, linked thread)
- [ ] 5. Arc engine generalized (trigger, rotation, phases, resolution) and facts-conflict test script
- [ ] 6. The Grid: weekly council votes (incl. FLACK expansion), then the mayoral election with run-for-mayor path
- [ ] 7. Highline: investing, loans, bubble arc, FLACK contract
- [ ] 8. Neon Mile: territory, casino edge, turf war arc
- [ ] 9. Foundry Row: crafting, jammers, accident arc
- [ ] 10. Greenbelt: seasons, fair, buyout arc
- [ ] 11. HARBOR arc acts 1-3 and its 5 endings
- [ ] 12. Remaining threads (Grudge, Secret, Quirk) and real Vex missions in The Collector
- [ ] 13. Long-game layer: career titles, companions, home decor, inner voices
- [ ] 14. Final pass: branch-walking test over every arc/thread/ending; balance
