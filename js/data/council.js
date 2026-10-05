"use strict";
/* Council seats, weekly proposals, mayor candidates. Votes: 1 = yes, -1 = no. */
const COUNCIL=['ashgrove','halloran','bell','reyes','mina'];
const CANDIDATES={ashgrove:{name:'Lady Ashgrove',tag:"the Trust's favorite"},mina:{name:'Mina Okafor',tag:"the market's champion"},reyes:{name:'Constable Reyes',tag:'the law-and-order candidate'}};
const MAYOR_NAMES={voss:'Mayor Voss',ashgrove:'Mayor Ashgrove',mina:'Mayor Okafor',reyes:'Mayor Reyes'};
const mayorName=()=>fact('mayor')==='player'?`Mayor ${G.name}`:(MAYOR_NAMES[fact('mayor')]||'Mayor Voss');
/* A council decision that lasts a while: it joins the active events so prices and traffic react. */
function councilMod(name,desc,mod,days){G.evs.push({id:'council_'+name.replace(/\W/g,''),sev:1,name,desc,mod,until:day()+days});recomputeMods()}
const PROPOSALS=[
 {id:'flack_expand',title:'Put FLACK cameras on every Highline and Grid road',votes:{ashgrove:1,halloran:1,bell:-1,reyes:1,mina:-1},can:()=>G.flack<85,
  yes:()=>{flackAdd(8);meterAdd('Grid',3);return 'Cameras go up overnight. HARBOR says it has never seen so much of the city.'},
  no:()=>{flackAdd(-2);return 'The motion fails. A few cameras quietly lose their funding.'}},
 {id:'flack_audit',title:'Require a public audit of FLACK records',votes:{ashgrove:-1,halloran:-1,bell:1,reyes:-1,mina:1},can:()=>G.flack>=30,
  yes:()=>{flackAdd(-5);return 'FLACK must publish what it holds. The first report is mostly redactions.'},
  no:()=>'The audit is voted down. The records stay private, for your protection.'},
 {id:'curfew',title:'A night curfew on the Neon Mile',votes:{ashgrove:1,halloran:1,bell:-1,reyes:1,mina:-1},can:()=>true,
  yes:()=>{meterAdd('Neon Mile',-6);meterAdd('Grid',3);councilMod('Neon Mile curfew','Patrols empty the Neon Mile streets at night.',{traffic:{'Neon Mile':.5},cops:true},10);return 'Patrols clear the Neon Mile for ten days.'},
  no:()=>{meterAdd('Neon Mile',2);return 'The Neon Mile keeps its hours, such as they are.'}},
 {id:'tram_free',title:'Free trams for a month',votes:{ashgrove:-1,halloran:-1,bell:1,reyes:-1,mina:1},can:()=>true,
  yes:()=>{G.freeTramUntil=day()+30;return 'Trams are free for 30 days.'},no:()=>'Fares stay at $2. Trams remain a bargain and a gamble.'},
 {id:'dock_tax',title:'A tax on fish landings',votes:{ashgrove:1,halloran:1,bell:-1,reyes:-1,mina:-1},can:()=>true,
  yes:()=>{meterAdd('Dockside',-2);councilMod('Fish landing tax','Fish cost a little more at the market.',{fish:1.12},14);return 'Fish get pricier for two weeks.'},
  no:()=>{meterAdd('Dockside',1);return 'No tax. The piers exhale.'}},
 {id:'farm_subsidy',title:'Subsidies for Greenbelt farms',votes:{ashgrove:-1,halloran:-1,bell:1,reyes:1,mina:1},can:()=>true,
  yes:()=>{meterAdd('Greenbelt',6);meterAdd('Highline',-2);return 'The farms get a lifeline. Highline grumbles about the bill.'},
  no:()=>{meterAdd('Greenbelt',-2);return 'No subsidy. The farms do their best.'}},
 {id:'foundry_limits',title:'Cap smoke and waste from Foundry Row',votes:{ashgrove:1,halloran:-1,bell:1,reyes:-1,mina:1},can:()=>true,
  yes:()=>{meterAdd('Foundry Row',-8);meterAdd('Greenbelt',4);facAdd('guild',-3);facAdd('coop',3);return 'The chimneys quieten. The Guild does not.'},
  no:()=>{meterAdd('Foundry Row',4);meterAdd('Greenbelt',-3);return 'The chimneys carry on. So does the cough.'}},
 {id:'rent_cap',title:'Cap rents and monthly bills',votes:{ashgrove:-1,halloran:-1,bell:1,reyes:1,mina:1},can:()=>true,
  yes:()=>{meterAdd('Highline',-3);councilMod('Rent cap','Bills are trimmed for two weeks.',{bills:.85},14);return 'Bills drop 15% for two weeks.'},
  no:()=>{councilMod('Rent hike','Landlords raise charges.',{bills:1.08},14);return 'Landlords toast the result. Bills rise 8% for two weeks.'}},
 {id:'busker_license',title:'License buskers on the plaza',votes:{ashgrove:1,halloran:1,bell:-1,reyes:1,mina:-1},can:()=>true,
  yes:()=>{meterAdd('Grid',1);councilMod('Busker licenses','Busking is regulated and pays less.',{busk:.7},14);return 'Busking pays less for two weeks.'},
  no:()=>{councilMod('Busker free-for-all','Buskers fill the plaza.',{busk:1.2},14);return 'The plaza fills with music. Busking pays more for two weeks.'}},
 {id:'pawn_audit',title:'Audit the Pawn and Loan',votes:{ashgrove:1,halloran:1,bell:1,reyes:1,mina:-1},can:()=>true,
  yes:()=>{meterAdd('Neon Mile',-5);return 'Fences pay a little less from now on. They blame the paperwork.'},
  no:()=>'The audit is dropped. The pawn shop sends a fruit basket.'}
];
