/* Marrow Bay smoke test.
   runSmoke(api, win): api exposes game internals, win is the window the game runs in.
   Math.random in that window is replaced by a seeded generator so two runs of identical code give identical results. */
function runSmoke(api, win) {
  const real = win.Math.random;
  let s = 12345;
  win.Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const errors = [], snap = {};
  const step = (name, fn) => { try { fn(); } catch (e) { errors.push(name + ': ' + (e && e.message || e)); } };
  const text = () => (win.document.querySelector('#sheet') || {}).innerText || '';
  const round = v => Math.round(v * 100) / 100;
  const ph = () => { let h = 0; api.NPCS.forEach(n => { h = (h * 31 + Math.round(n.x * 10) + Math.round(n.y * 10) * 7 + Math.round(api.G.npcs[n.id].cash)) | 0; }); return h; };
  const G = () => api.G;

  step('start', () => { api.start('farm'); api.G.flags.customDone = true; api.closeMenu(); });
  step('initial', () => { snap.start = { cash: G().cash, day: api.day(), meters: Object.values(G().meters || {}).length, flack: G().flack }; });

  step('sim 30 days', () => { for (let d = 0; d < 30; d++) api.advance(1440); });
  step('after 30 days', () => {
    snap.day30 = { day: api.day(), cash: G().cash, hunger: round(G().hunger), fish: round(G().fishStock), flats: round(G().flats),
      flack: round(G().flack), meters: Object.values(G().meters).map(round), news: G().news.length, threads: G().threads.active.length, rumors: G().rumors.length, npc: ph() };
  });

  step('walk ticks', () => { G().t = Math.floor(G().t / 1440) * 1440 + 16 * 60 + 30; for (let i = 0; i < 400; i++) api.tick(0.05); snap.ticks = { npc: ph(), t: G().t, moved: ph() !== snap.day30.npc }; });

  const menus = { phone: () => api.phone(), city: () => api.cityMenu(), flack: () => api.flackMenu(), bag: () => api.bag(), town: () => api.town(), threads: () => api.threadsMenu() };
  Object.keys(menus).forEach(k => step('menu ' + k, () => { menus[k](); if (!text()) throw new Error('empty sheet'); snap['m_' + k] = text().length; }));

  step('all POIs', () => {
    G().t = Math.floor(G().t / 1440) * 1440 + 11 * 60; let n = 0;
    Object.keys(api.POIS).forEach(id => step('poi ' + id, () => { api.openPOI(api.POIS[id]); n++; }));
    snap.pois = n;
  });
  step('close', () => api.closeMenu());

  step('draw', () => {
    ['none', 'bike', 'scooter', 'sedan', 'coupe'].forEach((v, i) => { G().veh.active = v; G().p.x = 20 + i * 3; G().p.y = 17; api.setCam(G().p.x * 16 - 88, G().p.y * 16 - 100); api.drawWorld(i * 100); });
    G().veh.active = 'none';
    api.setCam(0, 0); api.drawWorld(0);
  });

  step('save + old-save migrate', () => {
    api.save();
    const raw = JSON.parse(win.localStorage.getItem('marrowbay_v3'));
    ['meters', 'fac', 'facts', 'flack', 'stance', 'blind', 'threads', 'look', 'wardrobe', 'quirk'].forEach(k => delete raw[k]);
    api.setG(raw); api.migrate();
    snap.migrated = { meters: Object.keys(G().meters).length, fac: Object.keys(G().fac).length, flack: G().flack, threads: !!G().threads, look: !!G().look };
  });

  step('title again', () => { api.title(); });
  win.Math.random = real;
  return { ok: errors.length === 0, errors, snap };
}
if (typeof module !== 'undefined') module.exports = runSmoke;
