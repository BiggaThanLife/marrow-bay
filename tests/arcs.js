/* Branch-walking fuzz test for arcs and threads.
   For every arc and every thread: play many random runs by clicking random enabled buttons, and check that each one finishes in a valid outcome
   with a sane game state. Reports which outcomes and endings were reached.
   runArcs(api, win, runs): api.* are game globals, win is the game window. */
function runArcs(api, win, runs) {
  const real = win.Math.random;
  let seed = 987654321;
  const rng = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  win.Math.random = rng;
  const doc = win.document, G = () => api.G;
  const errors = [], report = { arcs: {}, threads: {} };
  const bgs = Object.keys(api.BG);
  const buttons = () => [...doc.querySelectorAll('#sheet #actions button')].filter(b => !b.disabled && !/^(Back|Leave|Understood|Wait)/.test(b.innerText.trim()));
  let mode = 'random';
  let allow = null;
  const labelOf = b => b.innerText.split('\n')[0].replace(/\d+/g, '#');
  const pickBtn = () => { let b = buttons(); if (allow) b = b.filter(x => allow(labelOf(x))); if (!b.length) return null; if (mode === 'first') return b[0]; if (mode === 'last') return b[b.length - 1]; if (mode === 'second') return b[Math.min(1, b.length - 1)]; return b[Math.floor(rng() * b.length)]; };
  const MODES = ['random', 'first', 'subset', 'subset', 'subset', 'subset'];
  const setAllow = () => { if (mode !== 'subset') { allow = null; return; } const salt = Math.floor(rng() * 1e9), p = .25 + rng() * .45; allow = lab => { let h = 7; for (const c of lab + salt) h = (h * 31 + c.charCodeAt(0)) | 0; return ((h >>> 0) % 1000) / 1000 < p; }; };
  const sane = (tag) => {
    const g = G();
    const bad = [];
    if (!Object.values(g.meters).every(v => Number.isFinite(v) && v >= 0 && v <= 100)) bad.push('meters');
    if (!(Number.isFinite(g.flack) && g.flack >= 0 && g.flack <= 100)) bad.push('flack');
    if (!Number.isFinite(g.cash)) bad.push('cash');
    if (!Object.values(g.fac).every(v => Number.isFinite(v) && v >= -100 && v <= 100)) bad.push('factions');
    if (!Object.values(g.mkt.p).every(v => Number.isFinite(v) && v > 0)) bad.push('prices');
    if (Object.values(g.inv).some(v => !Number.isFinite(v) || v < 0)) bad.push('inventory');
    if (bad.length) errors.push(tag + ': bad state ' + bad.join(','));
  };
  const fresh = (extra) => {
    api.start(bgs[Math.floor(rng() * bgs.length)]);
    const g = G(); g.flags.customDone = true; api.closeMenu(); api.popClear();
    g.cash = 3000; g.energy = 100; g.hunger = 90; g.t = (25 + Math.floor(rng() * 20)) * 1440 + 11 * 60;
    g.inv.meals = 10; g.inv.seeds = 6; g.inv.jammers = 2; g.inv.crops = 10; g.inv.fish = 6; g.inv.parts = 4;
    g.stance.harbor = 7; g.stance.sab = Math.floor(rng() * 4);
    Object.keys(g.fac).forEach(k => { g.fac[k] = Math.floor(rng() * 50) - 15; });
    api.recomputeMods(); api.alertQ.length = 0;
    extra && extra(g);
  };
  const flush = () => { api.popClear(); api.alertQ.length = 0; };

  /* ---- arcs ---- */
  Object.keys(api.ARCS).forEach(id => {
    const D = api.ARCS[id], seen = {}, rec = { runs: 0, outcomes: seen, errors: 0 };
    report.arcs[id] = rec;
    for (let r = 0; r < runs; r++) {
      mode = MODES[r % MODES.length]; setAllow();
      try {
        fresh(g => { g.arcsDone = []; g.arcLast = 0; if (id === 'mayor' && rng() < .3) api.setFact('mayor', 'player'); });
        api.startArc(id);
        let guard = 0;
        while (G().arc && guard++ < 60) {
          const A = G().arc, ph = D.phases[A.i];
          const clicks = 2 + Math.floor(rng() * 8);
          for (let k = 0; k < clicks; k++) {
            if (!G().arc) break;
            api.arcMenu();
            const b = pickBtn(); if (!b) break;
            b.click(); flush();
            if (G().energy < 15) G().energy = 100;
            if (G().cash < 400) G().cash = 3000;
          }
          for (let d = 0; d < 1 && G().arc; d++) { api.advance(1440); flush(); }
          sane(id + ' run ' + r);
        }
        const key = win.eval('G.facts["arc_' + id + '"]');
        if (!G().arc && key && D.outcomes[key]) seen[key] = (seen[key] || 0) + 1;
        else { errors.push(id + ' run ' + r + ': did not finish with a valid outcome (' + key + ')'); rec.errors++; }
        rec.runs++;
        flush();
      } catch (e) { errors.push(id + ' run ' + r + ': ' + (e && e.message || e)); rec.errors++; }
    }
    rec.unreached = Object.keys(D.outcomes).filter(k => !seen[k]);
  });

  /* ---- threads ---- */
  Object.keys(api.THREADS).forEach(tid => {
    const T = api.THREADS[tid], seen = {}, rec = { runs: 0, endings: seen, errors: 0 };
    report.threads[tid] = rec;
    for (let r = 0; r < runs; r++) {
      mode = MODES[r % MODES.length]; setAllow();
      try {
        fresh(g => {
          g.biz.push({ key: '16,13', d: 'Grid', price: 1500, paid: 1500, type: 'cafe', level: 1, supplies: 0, till: 0, workers: [], mk: 1, last: null, store: 0, auto: false });
          g.threads.active = []; g.threads.done = []; g.debt = 120; g.loanDay = 1; g.quirk = 'frugal'; g.heat = 2;
          api.npcS(api.NPC.mina).m = -30;
        });
        const g = G();
        g.threads.active.push({ tid, beat: 'b1', due: 0, pending: true, since: api.day(), log: [], roles: T.start ? T.start() : {} });
        let steps = 0;
        while (G().threads.active.some(t => t.tid === tid) && steps++ < 30) {
          const th = G().threads.active.find(t => t.tid === tid);
          if (G().mission) {
            const m = G().mission;
            const poi = api.POIS[m.stops[m.i]];
            G().p.x = poi.ex; G().p.y = poi.ey; api.missionTick(); flush();
            continue;
          }
          if (th.pending) {
            api.threadBeat(th);
            const b = pickBtn();
            if (b) { b.click(); flush(); } else { th.pending = false; th.beat = th.beat; api.advanceThread(th, T.beats[th.beat].ignore, false); }
          } else {
            G().t += 3 * 1440; api.threadsHourly(); flush();
            if (!th.pending && G().t > th.due) th.pending = true;
          }
          sane(tid + ' run ' + r);
        }
        const done = G().threads.done[0];
        if (done && done.tid === tid && T.endings[Object.keys(T.endings).find(k => T.endings[k].name === done.end)]) { seen[done.end] = (seen[done.end] || 0) + 1; }
        else { errors.push(tid + ' run ' + r + ': did not end cleanly'); rec.errors++; }
        rec.runs++;
        flush();
      } catch (e) { errors.push(tid + ' run ' + r + ': ' + (e && e.message || e)); rec.errors++; }
    }
    rec.unreached = Object.keys(T.endings).map(k => T.endings[k].name).filter(n => !seen[n]);
  });

  win.Math.random = real;
  return { ok: errors.length === 0, errors: errors.slice(0, 25), errorCount: errors.length, report };
}
