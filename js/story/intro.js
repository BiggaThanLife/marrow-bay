"use strict";
/* HARBOR intro and onboarding. */
/* ================= INTRO + ONBOARDING (HARBOR, the city AI) ================= */
const INTRO_BG={
 farm:'HARBOR has your file. Origin: Greenbelt. Occupation: soil. HARBOR is told that the soil has been thinking of you fondly and that the city will not.',
 dock:'HARBOR has your file. Origin: Dockside, third generation. The union sends its regards, and also an invoice. HARBOR has filed both under "family".',
 banker:'HARBOR has your file. Former occupation: banker. Current occupation: cautionary tale. HARBOR admires how quickly the Highline stopped returning your calls.',
 artist:'HARBOR has your file. Occupation: street artist. Fixed address: none until today. Congratulations on becoming a statistic with a postcode.'
};
function finishIntro(){G.flags.onboarded=true;save();worldPanel();notify('Tap the map to walk. Tap buildings, plots, stops, or people.')}
function intro(i,k){
  const b=BG[G.bg],h=POIS[b.home];
  const next=n=>()=>intro(n,k);
  if(i===0)return ui(`<h2>Welcome to Marrow Bay, ${esc(G.name)}</h2><p>This is HARBOR, the Harbor Administration and Resident Benefits Office. I am delighted you chose to arrive. Statistically, most people do not.</p>
    <p class="muted">Population: fluctuating. Tide: yes.</p>`,[{label:'Continue',fn:next(1)}],true,false);
  if(i===1)return ui(`<h2>${esc(b.n)}</h2><p>${esc(INTRO_BG[k]||b.desc)}</p><p class="muted">${esc(b.desc)}</p>`,[{label:'Continue',fn:next(2)}],true,false);
  if(i===2)return ui(`<h2>What I do</h2><p>I keep the city's records and hand out its benefits. Births, bills, bridges, the tide table. Marrow Bay does not forget a thing, because I am not permitted to lose it.</p>
    <p>The grey poles on the street corners are FLACK cameras. They tell me who is where. I will say nothing about this, which is sometimes the same as doing something.</p>
    <p class="muted">HARBOR is the city's records office. It is also, you may notice, listening.</p>`,[{label:'Continue',fn:next(3)}],true,false);
  ui(`<h2>Your accommodation</h2><p>You live at <b>${esc(h.name)}</b>. Rent is ${money(RENT[b.home])} a month. HARBOR has noted this. HARBOR notes everything.</p>
    <p class="muted">Citizen onboarding takes about a minute. It is optional, like most of the things that keep you alive.</p>`,
    [{label:'Begin onboarding',sub:'Recommended. Replay it any time from the Phone.',fn:()=>tutorial(0)},{label:'Skip, I will figure it out',cls:'quiet',fn:finishIntro}],true,false);
}
