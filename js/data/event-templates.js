"use strict";
/* Procedural event templates. */
/* ----- procedural events ----- */
const DISTS=['Highline','Grid','Dockside','Greenbelt','Neon Mile','Foundry Row'];
const ALL=m=>Object.fromEntries(DISTS.map(d=>[d,m]));
function quakeHit(){
  const before=G.structs.length;
  G.structs=G.structs.filter(s=>s.type==='house'||Math.random()>.35);
  const lost=before-G.structs.length;
  G.flats=clamp(G.flats+30,0,100);
  G.projects.forEach(p=>{if(!p.done)Object.keys(p.have).forEach(k=>p.have[k]=Math.floor(p.have[k]*.75))});
  return lost?`${lost} of your small structures were destroyed.`:'';
}
const EVT=[
 {id:'fair',sev:1,w:10,dur:[1,1],mk:()=>{const d=pick(['Grid','Highline','Dockside','Neon Mile']);return{name:`${d} street fair`,desc:`A street fair fills the ${d}. Shops there are packed.`,mod:{traffic:{[d]:1.35}}}}},
 {id:'derby',sev:1,w:7,dur:[1,1],mk:()=>({name:'Fishing derby',desc:'The Dockside holds a fishing derby. The piers are crowded and the fish are thinning.',mod:{traffic:{Dockside:1.2}},start:()=>{G.fishStock=clamp(G.fishStock-15,0,100)}})},
 {id:'truck',sev:1,w:8,dur:[1,2],mk:()=>({name:'Produce truck',desc:'A truck from the Greenbelt floods the market. Crops are cheaper.',mod:{crops:.8}})},
 {id:'band',sev:1,w:7,dur:[1,1],mk:()=>({name:'Buskers festival',desc:'Musicians pack the plaza. Busking pays more.',mod:{busk:1.4}})},
 {id:'tramstrike',sev:2,w:6,dur:[2,3],mk:()=>({name:'Tram strike',desc:'Tram drivers walked out. The trams are not running.',mod:{tram:true}})},
 {id:'rally',sev:2,w:6,dur:[2,3],mk:()=>({name:'Food truck rally',desc:'Food trucks undercut the diner. Meals are cheaper.',mod:{meal:.85}})},
 {id:'roads',sev:2,w:7,dur:[3,4],mk:()=>({name:'Road works',desc:'Torn-up streets slow everything down.',mod:{vspeed:.8}})},
 {id:'crack',sev:2,w:6,dur:[2,4],mk:()=>({name:'Police crackdown',desc:'Extra patrols across the city. Lay low.',mod:{cops:true}})},
 {id:'dark',sev:3,w:5,dur:[1,2],mk:()=>({name:'Citywide blackout',desc:'The grid is down. Shops are quiet and crime gets easier.',mod:{traffic:ALL(.7),heist:.15}})},
 {id:'crash',sev:3,w:4,dur:[3,5],mk:()=>({name:'Market crash',desc:'Markets tumble. The bank is shut and goods sell for less.',mod:{sell:.85,closed:['bank']},start:()=>{NPCS.forEach(n=>{G.npcs[n.id].cash=Math.round(G.npcs[n.id].cash*.7)})}})},
 {id:'flu',sev:3,w:5,dur:[4,6],mk:()=>({name:'Flu outbreak',desc:'A flu sweeps the city. Everyone tires faster and shops are quiet.',mod:{drain:1.4,traffic:ALL(.85)}})},
 {id:'surge',sev:3,w:4,dur:[2,3],mk:()=>({name:'Storm surge',desc:'The sea floods the Dockside. Movement there is slow and the docks are shut.',mod:{flood:['Dockside'],closed:['dock'],traffic:{Dockside:.5}},start:()=>{G.fishStock=clamp(G.fishStock+20,0,100)}})},
 {id:'riot',sev:4,w:3,dur:[3,5],mk:()=>({name:'Neon Mile riots',desc:'Riots tear through the Neon Mile. The casino is shuttered and police are everywhere.',mod:{traffic:{'Neon Mile':.4},closed:['casino'],cops:true,heist:.2}})},
 {id:'bridge',sev:4,w:3,dur:[4,7],mk:()=>({name:'Harbor Bridge closed',desc:'Cracks forced the Harbor Bridge shut. Take the tram or a taxi to cross.',mod:{bridge:true},follow:['roads',.6]})},
 {id:'dockfire',sev:4,w:3,dur:[4,6],mk:()=>({name:'Dock fire',desc:'A warehouse fire guts the docks. Debris washes onto the flats.',mod:{closed:['dock'],traffic:{Dockside:.5}},start:()=>{G.flats=clamp(G.flats+40,0,100)}})},
 {id:'boom',sev:4,w:3,dur:[6,9],mk:()=>({name:'Investor boom',desc:'Money floods the city. Goods sell high, but so do the bills.',mod:{sell:1.2,bills:1.2,traffic:{Highline:1.4}}})},
 {id:'drought',sev:4,w:3,dur:[6,9],mk:()=>({name:'Drought',desc:'No rain. Crops grow slower and yield less, but sell dear.',mod:{growth:1,yield:.6,crops:1.5}})},
 {id:'quake',sev:5,w:1.5,dur:[8,12],mk:()=>({name:'Major earthquake',desc:'A quake rocks Marrow Bay. The bridge is down, trams are out, and shops are barely open.',mod:{bridge:true,tram:true,traffic:ALL(.5)},start:()=>quakeHit(),follow:['dockfire',.4]})},
 {id:'flood',sev:5,w:1.5,dur:[8,10],mk:()=>({name:'Great flood',desc:'Rivers burst their banks. The Dockside and Foundry are underwater, the bridge is shut, and trade there has collapsed.',mod:{flood:['Dockside','Foundry Row'],bridge:true,closed:['dock','foundry','garage'],traffic:{Dockside:.2,'Foundry Row':.2}}})}
];
