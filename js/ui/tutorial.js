"use strict";
/* Optional orientation. */
const TUT=[
 {t:'Getting around',b:'Tap the map to walk there. Tap a building and you walk to its door and go in. Tap a person to talk. Tap a plot, stall, or tram stop to use it.',q:'Walking is free. So is regret.'},
 {t:'Staying alive',b:'The Fed and Rested bars at the top drain as time passes. If either hits zero you collapse and wake at Bell Clinic, six hours later and a little poorer. Eat at Teo\'s Diner or cook at home. Sleep at home.',q:'Collapsing is technically a form of rest.'},
 {t:'Money',b:'Earn it by working shifts (docks, diner, estate, foundry), fishing, farming the Greenbelt plots, or busking on the Plaza. Bills come every 30 days. Unpaid bills become debt, and people notice.',q:'Debt is just money that has not met you yet.'},
 {t:'People',b:'Everyone reads your background and your actions, and they talk to each other. Open the Bag to see how people see you. Chat, give meals, and mind your reputation in each district. Some doors close for good.',q:'Everyone here is watching. HARBOR is simply the only one with a filing system.'},
 {t:'Your toolbar',b:'Bag: items and standing. Build: place small structures. Biz: your properties. Phone: GPS, news, contacts, and this onboarding. Go: tram, taxi, and your ride.',q:'All five buttons are safe. Mostly.'},
 {t:'The rest is up to you',b:'Run a farm, buy a building, open a cafe, or cut corners. Crimes raise your heat, and Constable Reyes does not give up easily. There is no required path.',q:'HARBOR does not judge. HARBOR files.'}
];
function tutorial(i,fromPhone){
  const s=TUT[i],last=i===TUT.length-1;
  const done=()=>fromPhone?phone():finishIntro();
  ui(`<h2>${esc(s.t)}</h2><p class="muted small">Onboarding ${i+1} of ${TUT.length}</p><p>${esc(s.b)}</p><p class="amber">HARBOR: "${esc(s.q)}"</p>`,
    [{label:last?(fromPhone?'Done':'Step outside'):'Next',fn:last?done:()=>tutorial(i+1,fromPhone)},
     ...(i>0?[{label:'Back',cls:'quiet',fn:()=>tutorial(i-1,fromPhone)}]:[]),
     ...(last?[]:[{label:'Skip onboarding',cls:'quiet',fn:done}])],true,false);
}
