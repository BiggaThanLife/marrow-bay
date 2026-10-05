# Marrow Bay: project overview

**[▶ Play now](https://biggathanlife.github.io/marrow-bay/)**

## What this is

A mobile-first, single-file HTML sandbox game (`marrow-bay.html`, about 1,700 lines, vanilla JS in one IIFE, Canvas 2D). It is an open-world tidal city where the world and NPCs react to the player's background and actions.

Everything runs on rules and pre-written text, so there is no per-play cost and no live LLM. It was built in chat as a Claude.ai artifact, so there is no build step and no dependencies except Google Fonts. The hosting limits from that environment (16 MB, no outside network calls) no longer apply in Claude Code.

## Design goals to preserve

- Sandbox with multiple ways to play: work, farm, fish, trade, build businesses, own property, or turn to crime.
- Player background (farmhand, dockhand, banker, artist) becomes tags that NPCs read.
- A self-simulating world: NPCs have needs, money, schedules, and memory, and rumors spread between them.
- Mobile-first. The page must never scroll or shift. Menus are an in-page bottom sheet over the map.
- Destructive or costly actions need a confirm step. Use `ask(title, text, label, fn, back)`.
- Plain UI copy: sentence case, no jargon.

## Architecture

The file has section banner comments. Search for `=====` to jump between them.

### World
- 64x38 tile map, tile size 16. The logical canvas is 176 wide, and its height is fitted to the screen (`fitCanvas`).
- Six districts from `district(x, y)`: Greenbelt, Highline, Grid, Dockside, Neon Mile, Foundry Row.
- A road lattice (`XS`, `HY`) makes 4x4 blocks. `POIS` holds named buildings. Unnamed filler blocks are buyable buildings.
- BFS pathfinding (`bfs`). Tram stops are in `STOPS`.
- A bridge at x 41-44, y 17 and 27 can be closed at runtime by events (`setBridge`).

### Data
Constants for backgrounds (`BG`), 15 NPCs (`NPCS`, each with `aff` tag weights, four attitude lines, `react` lines, and a `topic`), daily color events (`EVENTS`), procedural events (`EVT`), `PROJECTS`, `STRUCTS`, business types (`BT`), vehicles (`VEH`), `RENT`, `PRICE`, and `OPEN` hours.

### State
- One object `G`, saved to localStorage key `marrowbay_v3`. `migrate()` fills new fields on old saves.
- Derived values:
  - `tagsNow()` builds the player's current tags.
  - `att(n)` is tag affinities + district rep * 0.35 + NPC memory + rumor deltas.
  - `tier(att)` returns 0 to 3 (hostile to warm).
- `recomputeMods()` builds `G.mod` from active events. Call it after load.

### Time
- 6 game minutes per real second.
- `advance(m, sleep, quiet)` drives:
  - `newDay`: events, monthly bills every 30 days, business runs, projects, rumor decay.
  - `hourly`: NPC hunger, wages, eating, fishing, rumor spread, tide-driven resources.
- The frame loop is `tick(dt)`. Modal screens pause time.

### UI
- `ui(html, buttons, isModal, dismissable)` renders the bottom sheet.
- Tapping the map while a sheet is open closes it.
- Toolbar: Bag, Build, Biz, Phone, Go.

## Systems

- **Economy:** Market prices respond to fish stock, scrap on the flats, diner demand, and events.
- **Businesses** (cafe, bar, workshop, rental, farm, home): buy a vacant building, convert it, hire staff from a daily pool, set prices, stock supplies, and collect the till. `runBiz()` simulates each day. Staff traits include sticky fingers, guard, and quick.
- **Property:** Rent or buy apartments through Lou's Realty, or build a house. Monthly bills cover rent or upkeep, insurance, property tax, and licenses. Unpaid bills become arrears, which add the `in-debt` tag.
- **Travel:** Walking, bike, scooter, sedan, and coupe (speed and fuel), plus tram and taxi.
- **Crime:**
  - Heat (0-5 stars) triggers Constable Reyes to chase you.
  - Busts cost fines and hot goods.
  - Also: pickpocketing, Vex's missions (courier, collect, heist, boost), the pawn shop, and the casino.
- **Rumors:** Thief, defaulter, generous, and successful rumors spread when NPCs stand near each other and fade over days.
- **Events:** `EVT` templates run from severity 1 (minor) to 5 (catastrophe). Each has a duration range, a `mod` object, and optional start effects and follow-up events. The `mod` object can change traffic, prices, closures, speed, the bridge, trams, and more. News is logged to `G.news`.
- **Phone:** GPS (dotted route or auto-walk), News (by day), Contacts (people you have met, with calls), and the Town board.

## Known issues and caveats

- The game has never been run in a browser by its author. Only a Node syntax check was done, so expect bugs.
- Balance is unverified: business profits, event frequency, bill sizes, and loan terms.
- When the bridge closes, NPCs can end up stranded until the next instant sync.
- `gpsTick` runs a BFS every 0.25 s, and NPC pathing runs a BFS per assignment. This is fine at the current scale but not optimized.
- Rendering draws every visible tile each frame, with no caching.

## Suggested next steps

1. Split into modules (data, world, sim, ui, render) with a small bundler like Vite, and add save versioning.
2. Add a headless simulation test to balance economy, events, and NPC behavior.
3. Add NPC-run competing businesses and NPC agents with goals like the player's, plus an optional bring-your-own-key LLM mode.
4. Add tests for the confirm flow and for save and load.
5. Add art and sound assets, plus story-driven missions.


## Project layout

`index.html` (page skeleton and script list), `css/style.css`, `js/` (core, world, data, state, sim, systems, story, ui, menus, render, save, main.js), `tests/smoke.html` (open through a local server), `tools/bump_version.py`. See `CLAUDE.md` for the rules for adding code.
