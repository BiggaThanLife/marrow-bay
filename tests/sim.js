/* Balance simulation: a simple bot lives in several seeded worlds for a year of game time.
   It eats when hungry and does a dock haul when poor, nothing else. We look for runaway loops:
   meters pinned at 0 or 100, empty or overflowing resources, NPC money collapsing or exploding, NPCs starving.
   runSim(api, win, games, days) */
function runSim(api, win, games, days) {
  const real = win.Math.random;
  let seed = 424242;
  win.Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const G = () => api.G, out = [], bgs = Object.keys(api.BG);
  const D = Object.keys(api.METERS);
  const pct = (a, f) => Math.round(100 * a.filter(f).length / a.length);
  for (let gi = 0; gi < games; gi++) {
    api.start(bgs[gi % bgs.length]);
    G().flags.customDone = true; api.closeMenu(); api.popClear();
    const s = { meters: {}, flack: [], fish: [], flats: [], npcCash: [], npcHungry: 0, cash: [], arcs: {}, props: 0, price: {}, hunger: [] };
    D.forEach(d => s.meters[d] = []);
    for (let day = 0; day < days; day++) {
      const g = G();
      // bot: eat, rest, earn a little
      g.energy = Math.max(g.energy, 60);
      if (g.hunger < 50) { const p = api.mealPrice(); if (g.cash >= p) { g.cash -= p; g.hunger = Math.min(100, g.hunger + 45); } else g.hunger = Math.max(g.hunger, 25); }
      if (g.cash < 120) g.cash += 26;
      api.advance(1440, false, true);
      api.popClear(); api.alertQ.length = 0;
      D.forEach(d => s.meters[d].push(g.meters[d]));
      s.flack.push(g.flack); s.fish.push(g.fishStock); s.flats.push(g.flats);
      s.npcCash.push(api.NPCS.reduce((t, n) => t + api.npcS(n).cash, 0) / api.NPCS.length);
      s.npcHungry += api.NPCS.filter(n => api.npcS(n).hunger <= 5).length;
      s.cash.push(g.cash); s.hunger.push(g.hunger);
      api.SHARES.forEach(sh => { (s.price[sh.id] = s.price[sh.id] || []).push(g.mkt.p[sh.id]); });
    }
    const g = G();
    const row = {
      bg: bgs[gi % bgs.length],
      seed: g.seed,
      meters: Object.fromEntries(D.map(d => [d, { min: Math.round(Math.min(...s.meters[d])), max: Math.round(Math.max(...s.meters[d])), pinned: pct(s.meters[d], v => v <= 3 || v >= 97) }])),
      flack: { min: Math.round(Math.min(...s.flack)), max: Math.round(Math.max(...s.flack)), end: Math.round(g.flack) },
      fish: { min: Math.round(Math.min(...s.fish)), max: Math.round(Math.max(...s.fish)) },
      flats: { min: Math.round(Math.min(...s.flats)), max: Math.round(Math.max(...s.flats)) },
      npcCashAvg: Math.round(s.npcCash.reduce((a, b) => a + b, 0) / s.npcCash.length), npcCashEnd: Math.round(s.npcCash[s.npcCash.length - 1]),
      npcStarveDays: s.npcHungry, playerCashEnd: Math.round(g.cash), arcsDone: g.arcsDone.map(a => a.id + ':' + a.out),
      mayor: g.facts.mayor, laws: Object.keys(g.facts).filter(k => k.startsWith('law_')).length, news: g.news.length,
      priceRange: Object.fromEntries(Object.keys(s.price).map(k => [k, [Math.round(Math.min(...s.price[k])), Math.round(Math.max(...s.price[k]))]]))
    };
    out.push(row);
  }
  win.Math.random = real;
  // flags
  const flags = [];
  out.forEach(r => {
    Object.entries(r.meters).forEach(([d, m]) => { if (m.pinned > 50) flags.push(`game ${r.bg}: ${d} meter pinned at an edge ${m.pinned}% of the year (min ${m.min}, max ${m.max})`); });
    if (r.fish.min <= 1) flags.push(`game ${r.bg}: fish stock hit zero`);
    if (r.flats.min <= 1) flags.push(`game ${r.bg}: flats hit zero`);
    if (r.npcCashAvg > 1500 || r.npcCashEnd > 3000) flags.push(`game ${r.bg}: NPC cash ballooning (avg ${r.npcCashAvg}, end ${r.npcCashEnd})`);
    if (r.npcCashEnd < 5) flags.push(`game ${r.bg}: NPC cash collapsed (end ${r.npcCashEnd})`);
    if (r.npcStarveDays > days * 15 * .05) flags.push(`game ${r.bg}: NPCs starving too often (${r.npcStarveDays} NPC-days)`);
    if (r.flack.max >= 99) flags.push(`game ${r.bg}: FLACK reached ${r.flack.max}`);
  });
  return { flags, out };
}
