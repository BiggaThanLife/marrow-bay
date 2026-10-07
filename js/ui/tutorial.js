"use strict";
/* Optional orientation. */
const TUT=[
 {t:'Getting around',b:'Tap the map to walk there. Tap a building and you walk to its door and go in. Tap a person to talk. Tap a plot, stall, or tram stop to use it.',q:'Walking is free. So is regret.'},
 {t:'Your toolbar',b:'Bag: items and standing. Build: place small structures. Biz: your properties. Phone: GPS, news, contacts, and this onboarding. Go: tram, taxi, and your ride. Keep an eye on the Fed and Rested bars, and earn money by working shifts, fishing, farming, or busking.',q:'All five buttons are safe. Mostly.'},
 {t:'The rest is up to you',b:'Run a farm, buy a building, open a cafe, or cut corners. There is no required path. HARBOR will pop up with a short note the first time something matters, such as bills, crime, or your first tenant. You can turn those notes off in Settings.',q:'HARBOR does not judge. HARBOR files.'}
];
function tutorial(i,fromPhone){
  const s=TUT[i],last=i===TUT.length-1;
  const done=()=>fromPhone?phone():finishIntro();
  ui(`<h2>${esc(s.t)}</h2><p class="muted small">Onboarding ${i+1} of ${TUT.length}</p><p>${esc(s.b)}</p><p class="amber">HARBOR: "${esc(s.q)}"</p>`,
    [{label:last?(fromPhone?'Done':'Step outside'):'Next',fn:last?done:()=>tutorial(i+1,fromPhone)},
     ...(i>0?[{label:'Back',cls:'quiet',fn:()=>tutorial(i-1,fromPhone)}]:[]),
     ...(last?[]:[{label:'Skip onboarding',cls:'quiet',fn:done}])],true,false);
}
