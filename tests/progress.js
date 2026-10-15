/* Player-economy test: a bot that plays like a person for ~150 days (dock gigs, pier fishing, sells catch, buys a building,
   converts it, moves tenants in, collects takings, pays bills) and reports cash and net worth at milestones.
   runProgress(win, games, days) -> {flags, rows} */
const BOT_SRC = `(function(){
  const bot = {fees:0};
  bot.day = function(){
    const g = G;
    g.energy = 100;
    const t0 = g.t;
    // eat
    if (g.hunger < 60) { const p = mealPrice(); if (g.cash >= p) { g.cash -= p; g.hunger = Math.min(100, g.hunger + 45); } else g.hunger = Math.max(g.hunger, 30); }
    // two dock hauls (the main steady gig) at the player's current rank
    for (let i = 0; i < 2; i++) {
      const mult = (has('strong')?1.4:1)*(has('union')?1.2:1)*(G.fx.crane?1.25:1)*dockPay();
      const r = gig(null, {hrs:4, base:26, mult, rep:'Dockside', label:'hauling cargo', job:'dock'});
      if (r.startsWith('You worked')) { facAdd('shipping',1); meterAdd('Dockside',1); }
    }
    // pier fishing twice
    for (let i = 0; i < 2 && g.energy >= 14; i++) {
      const tn = tideName();
      let n = tn==='high'?ri(2,4):tn==='low'?ri(0,1):ri(1,2); if (has('working-class')) n++; n += rodLevel();
      n = Math.round(n*clamp(.3+g.fishStock/70,.3,1.3));
      g.inv.fish += n; logFish(n); g.fishStock = clamp(g.fishStock-n*3,0,100); advance(120); g.energy = clamp(g.energy-6,0,100);
    }
    // sell catch
    if (g.inv.fish > 0) { const q = g.inv.fish, p = Math.max(1, Math.round(9*g.mod.sell*fishMod())); g.cash += saleTotal('fish', p, q); g.inv.fish = 0; }
    // properties: collect takings, manage tenants
    g.biz.forEach(b => {
      if (b.type === 'rental') { ensureRental(b); while (b.applicants.length && b.tenants.length < rentalUnits(b)) moveIn(b, b.applicants[0]); }
      if (b.till > 0 && day() % 3 === 0) { g.cash += b.till; b.till = 0; }
    });
    // buy a building when comfortable: cafe first, then rentals, cheapest district first
    const want = g.biz.length === 0 ? 'cafe' : 'rental';
    const fit = BT[want].fit, reserve = 350;
    const v = blocks.filter(b => !b.poi && !bizOf(b.key)).map(b => ({b, d: district(b.x+1,b.y+1)})).sort((a,c) => PRICE[a.d]-PRICE[c.d]);
    if (v.length && g.biz.length < 4) {
      const x = v[0], price = Math.round(PRICE[x.d]*buyF(NPC.lou));
      if (tier(att(NPC.lou)) > 0 && g.cash >= price + fit + reserve) {
        g.cash -= price + fit;
        g.biz.push({key:x.b.key,d:x.d,type:want,price,paid:price+fit,workers:[],supplies:0,till:0,level:1,mk:1,store:0,auto:true,last:null});
      }
    }
    const used = g.t - t0;
    advance(Math.max(1, 1440 - (used % 1440)), false, true);
    popClear(); alertQ.length = 0;
  };
  return bot;
})()`;

function runProgress(win, games, days) {
  const real = win.Math.random;
  let seed = 90210;
  win.Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const MARKS = [30, 60, 100, 150];
  const bgs = win.eval('Object.keys(BG)'), rows = [], flags = [];
  for (let gi = 0; gi < games; gi++) {
    win.eval(`start('${bgs[gi % bgs.length]}'); G.flags.customDone = true; closeMenu(); popClear();`);
    const bot = win.eval(BOT_SRC), marks = {};
    let maxNW = 0;
    for (let d = 1; d <= days; d++) {
      bot.day();
      const [cash, nw, arrears, nbiz] = win.eval('[Math.round(G.cash), netWorth(), Math.round(G.arrears), G.biz.length]');
      if (d < 100) maxNW = Math.max(maxNW, nw);
      if (MARKS.includes(d)) marks[d] = {cash, nw, arrears, biz: nbiz};
    }
    rows.push({bg: bgs[gi % bgs.length], marks});
    if (maxNW > 50000) flags.push(`${bgs[gi % bgs.length]}: net worth ${maxNW} before day 100 (cap 50000)`);
    const m30 = marks[30];
    if (m30 && (m30.arrears > 0 || m30.cash < 0)) flags.push(`${bgs[gi % bgs.length]}: cannot afford bills by day 30 (cash ${m30.cash}, owed ${m30.arrears})`);
  }
  win.Math.random = real;
  return {flags, rows};
}
