"use strict";
/* One-time hints that appear the first time something matters, instead of one long tutorial up front.
   Each hint has an id (saved in G.tips so it never repeats), a test, and the text. At most one shows per hour of game time.
   Players can switch hints off in Settings (SET.hints). */
const HINTS=[
  {id:'people',when:()=>Object.keys(G.met).length>=1,t:'People remember',b:'Everyone reads your background and your actions, and they talk to each other. Open the Bag to see how people see you. Chat, give meals, and mind your reputation in each district. Some doors close for good.',q:'Everyone here is watching. HARBOR is simply the only one with a filing system.'},
  {id:'hungry',when:()=>G.hunger<=30||G.energy<=30,t:'Running low',b:'The Fed and Rested bars drain as time passes. If either hits zero you collapse and wake at Bell Clinic, six hours later and a little poorer. Eat at Teo\'s Diner or cook at home. Sleep at home.',q:'Collapsing is technically a form of rest.'},
  {id:'money',when:()=>G.cash<25,t:'Making money',b:'Earn it by working shifts (docks, diner, estate, foundry), fishing, farming the Greenbelt plots, or busking on the Plaza. Bills come every 30 days.',q:'Debt is just money that has not met you yet.'},
  {id:'bills',when:()=>day()>=24,t:'Bills are coming',b:'Rent and bills come due every 30 days. Unpaid bills become debt, and people notice. Check the Biz button for what you owe.',q:'HARBOR has already added it up.'},
  {id:'heat',when:()=>G.heat>=1,t:'Heat',b:'Crimes raise your heat, the stars at the top. Constable Reyes does not give up easily. Outrun her, then lay low or sleep at home to cool off.',q:'HARBOR does not judge. HARBOR files.'},
  {id:'biz',when:()=>G.biz.length>0,t:'Your first building',b:'Tap it on the map or open Biz. An empty building needs a fit-out before it earns. Hire staff, keep it stocked, and watch the till. Upgrading adds expansion slots.',q:'Ownership suits you. Try to keep the smile.'},
  {id:'tenants',when:()=>G.biz.some(b=>b.type==='rental'&&((b.tenants&&b.tenants.length)||(b.applicants&&b.applicants.length))),t:'Landlord life',b:'Tenants are real people with their own habits, and you only learn who they are after they move in. Fix problems before they wear down the mood. A red number means someone needs you.',q:'Four walls and a lot of opinions.'}
];
function hintsCheck(){
  if(!G||!G.flags||!G.flags.onboarded||SET.hints===false||popOpen)return;
  G.tips=G.tips||{};
  const h=HINTS.find(x=>!G.tips[x.id]&&x.when());
  if(!h)return;
  G.tips[h.id]=1;
  popup(h.t,h.b,`HARBOR: "${h.q}"`);
}
