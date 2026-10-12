# Marrow Bay: project overview

**[▶ Play now](https://biggathanlife.github.io/marrow-bay/)**

## What this is

A mobile-first HTML sandbox game (`index.html` plus plain scripts under `js/`, vanilla JS sharing one global scope, Canvas 2D). It is an open-world tidal city where the world and NPCs react to the player's background and actions.

Everything runs on rules and pre-written text, so there is no per-play cost and no live LLM. There is no build step and no dependencies except Google Fonts.

## Design goals to preserve

- Sandbox with multiple ways to play: work, farm, fish, trade, build businesses, own property, or turn to crime.
- Player background (farmhand, dockhand, banker, artist) becomes tags that NPCs read.
- A self-simulating world: NPCs have needs, money, schedules, and memory, and rumors spread between them.
- Mobile-first. The page must never scroll or shift. Menus are an in-page bottom sheet over the map.
- Destructive or costly actions need a confirm step. Use `ask(title, text, label, fn, back)`.
- Plain UI copy: sentence case, no jargon.

## Architecture

Code is split by job under `js/` (see Project layout). Each file opens with a one-line comment saying what it holds, and section banners use `=====`.

### World
- 64x38 tile map, tile size 16. The logical canvas is 176 wide, and its height is fitted to the screen (`fitCanvas`).
- Six districts from `district(x, y)`: Greenbelt, Highline, Grid, Dockside, Neon Mile, Foundry Row.
- A road lattice (`XS`, `HY`) makes 4x4 blocks. `POIS` holds named buildings. Unnamed filler blocks are buyable buildings.
- BFS pathfinding (`bfs`). Tram stops are in `STOPS`.
- A bridge at x 41-44, y 17 and 27 can be closed at runtime by events (`setBridge`).

### Data
Constants for backgrounds (`BG`), 19 NPCs (`NPCS` in `js/data/npcs.js`, each with `aff` tag weights, four attitude lines, `react` lines, and a `topic`; the general `TIPS` pool sits beside them), daily color events (`EVENTS`), procedural events (`EVT`), `PROJECTS`, `STRUCTS`, business types (`BT`), vehicles (`VEH`), `RENT`, `PRICE`, and `OPEN` hours.

### State
- One object `G`, saved to localStorage key `marrowbay_v3`. `migrate()` fills new fields on old saves.
- Derived values:
  - `tagsNow()` builds the player's current tags.
  - `att(n)` is tag affinities + district rep * 0.35 + NPC memory + rumor deltas.
  - `tier(att)` returns 0 to 3 (hostile to warm).
- `recomputeMods()` builds `G.mod` from active events. Call it after load.

### Time
- 4 game minutes per real second (`TIME_RATE` in `js/core/util.js`).
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
- **Rumors:** About what you do (thief, defaulter, generous, arrested, evictor, and many more; see `RUM` in `js/data/events.js` and `js/data/rumors.js`). They spread when NPCs stand near each other, fade over days, shift attitudes and shop prices, and show up in the Bay-Watch feed, first vague and then named.
- **Bay-Watch feed:** A social-media style Phone feed of neighbour chatter, rumors, patrol sightings, daily opportunities and HARBOR suggestions.
- **Districts and tide:** Each district reacts to how it is doing, and the tide changes what is open to you (flats at low tide, wet piers at high tide).
- **Shopping:** Market, stalls, corner store and fast food counter, with crops you grow, bulk cooking, and quality dishes.
- **Your story:** A history log of what has happened to you, reached from the Phone.
- **Events:** `EVT` templates run from severity 1 (minor) to 5 (catastrophe). Each has a duration range, a `mod` object, and optional start effects and follow-up events. The `mod` object can change traffic, prices, closures, speed, the bridge, trams, and more. News is logged to `G.news`.
- **Phone:** GPS (dotted route or auto-walk), Bay-Watch Feed, Marrowlist classifieds, News, Contacts (people you have met, with calls), Threads, City, FLACK, Tenants (if you own a rental), Your story, Career, Town board, and Settings.
- **Bag:** Four tabs (Carry, Use, You, Standing) with a pixel icon grid.

## Known issues and caveats

- The automated suites (`tests/`) pass, but much of the newer content has not been seen on a real phone with a long-running save.
- Balance is only checked by the year-long idle-bot simulation: business profits, event frequency, bill sizes, and loan terms.
- When the bridge closes, NPCs can end up stranded until the next instant sync.
- `gpsTick` runs a BFS every 0.25 s, and NPC pathing runs a BFS per assignment. This is fine at the current scale but not optimized.
- Rendering draws every visible tile each frame, with no caching.

## Suggested next steps

1. Widen NPC dialogue so a relationship changes what people say over time, and cut repeated facts between tips, hints and NPC lines.
2. Add NPC-run competing businesses and NPC agents with goals like the player's, plus an optional bring-your-own-key LLM mode.
3. Add tests for the confirm flow.
4. Accessibility options, a bug-report button, and a year-end review.
5. More audio, plus further story-driven missions.


## Project layout

`index.html` (page skeleton and script list), `css/style.css`, `js/` (core, world, data, state, sim, systems, story, ui, menus, render, save, main.js), `tests/*.html` (smoke, sim, and one page per feature; open through a local server, e.g. `python -m http.server`), `tools/bump_version.py`. See `CLAUDE.md` for the rules for adding code.
