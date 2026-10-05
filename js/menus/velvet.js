"use strict";
/* Velvet Room crime jobs and missions. */
/* ----- Velvet Room: crime jobs ----- */
const JOB_POIS=['market','diner','dock','gull','bank','clinic','workshop','garage','foundry','pawn','casino','estate','club','realty'];
function startMission(m){G.mission=m;notify(`Job accepted: ${m.title}.`);closeMenu()}
MENUS.velvet=(poi,n,msg)=>{
  if(G.mission)return ui(`<h2>${esc(poi.name)}</h2><p>${esc(n.name)} says: "Finish what you started."</p><p class="muted">${esc(missionText())}</p>`,[{label:'Drop the job',cls:'quiet',fn:()=>ask('Drop this job?','Vex will remember that you walked away.','Drop it',()=>{G.mission=null;npcS(NPC.vex).m-=4;closeMenu()},()=>MENUS.velvet(POIS.velvet,NPC.vex))},leaveBtn]);
  const p=G.p,mk=()=>{
    const a=pick(JOB_POIS),b=pick(JOB_POIS.filter(x=>x!==a)),d=man(Math.round(p.x),Math.round(p.y),POIS[a].ex,POIS[a].ey)+man(POIS[a].ex,POIS[a].ey,POIS[b].ex,POIS[b].ey);
    return{a,b,d};
  };
  const j=mk();
  const target=pick(['market','diner','gull','clinic','dock']);
  const heistT=pick(['bank','estate','club','casino']);
  const boostT=pick(['garage','foundry','dock']);
  const tools=G.fx.kit?.18:0;
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${fact('vex_jailed')?'Dagny Salt has taken the corner table. Vex is not here.':esc(n.name)+' slides a note across the table.'}</p>${msgP(msg)}`,[
    {label:'Courier run',sub:`${POIS[j.a].name} to ${POIS[j.b].name}. ${money(50+j.d*.8)}, ${Math.round(j.d*.9+25)} min. A bike helps.`,fn:()=>startMission({type:'courier',title:'Courier run',stops:[j.a,j.b],i:0,deadline:G.t+j.d*.9+25,reward:Math.round(50+j.d*.8)})},
    {label:'Collect a debt',sub:`Lean on ${POIS[target].name}. ${money(110)}. Raises heat.`,cls:'',fn:()=>startMission({type:'collect',title:'Debt collection',stops:[target],i:0,deadline:G.t+420,reward:110})},
    {label:'Smash and grab',sub:`${POIS[heistT].name}, after dark. Big payout, big heat.`,cls:'',fn:()=>startMission({type:'heist',title:'Smash and grab',stops:[heistT],i:0,deadline:G.t+1200,reward:260,night:true,odds:.4+tools+(has('smooth')?.05:0)+(has('creative')?.05:0)+G.mod.heist})},
    {label:'Boost a car',sub:`Take a sedan from ${POIS[boostT].name}. A free ride, but hot.`,cls:'',fn:()=>startMission({type:'boost',title:'Boost a car',stops:[boostT],i:0,deadline:G.t+480,reward:0,odds:.55+tools})},
    {label:'Territory',sub:'Who runs the Neon Mile, and how to take it',cls:'',fn:()=>territoryMenu(poi,n)},
    leaveBtn]);
};
function missionTick(){
  const m=G.mission;if(!m)return;
  if(G.t>m.deadline){G.mission=null;notify(`Job failed: ${m.title}. Out of time.`);G.rep['Neon Mile']=clamp(G.rep['Neon Mile']-3,-100,100);threadMissionEnd(m,false);return}
  const poi=POIS[m.stops[m.i]];
  if(Math.hypot(G.p.x-poi.ex,G.p.y-poi.ey)>1.3)return;
  if(m.night&&!isNight())return;
  m.i++;
  if(m.i<m.stops.length){notify(`Package picked up. Deliver it to ${POIS[m.stops[m.i]].name}.`);return}
  G.mission=null;const vex=npcS(NPC.vex);threadMissionEnd(m,true);
  if(m.type==='courier'){G.cash+=m.reward;vex.m+=5;G.rep['Neon Mile']=clamp(G.rep['Neon Mile']+3,-100,100);notify(`Delivered. You earn ${money(m.reward)}.`);quip('job')}
  else if(m.type==='collect'){
    if(Math.random()<.7){G.cash+=m.reward;G.heat=Math.min(5,G.heat+1);vex.m+=6;G.rep[poi.d]=clamp(G.rep[poi.d]-6,-100,100);const o=OWNER[poi.id]&&NPC[OWNER[poi.id]];if(o)npcS(o).m-=15;{news(`Shakedown reported at ${poi.name}.`,2);notify(`They pay up. You earn ${money(m.reward)}, and made an enemy.`)}}
    else{G.heat=Math.min(5,G.heat+2.2);notify('They call the police. Run!')}
  }else if(m.type==='heist'){
    if(Math.random()<m.odds){const c=ri(180,320);G.cash+=c;G.inv.loot+=ri(1,3);G.heat=Math.min(5,G.heat+2);vex.m+=10;{news(`Overnight break-in at ${poi.name}. Police are investigating.`,3);notify(`You are in and out. ${money(c)} and some goods. Police are alerted.`)}}
    else{G.heat=Math.min(5,G.heat+3.5);news(`Alarm at ${poi.name}: an attempted break-in.`,3);notify('Alarm! You bolt with nothing. Run!')}
  }else if(m.type==='boost'){
    if(Math.random()<m.odds){G.veh.owned.sedan=true;G.veh.stolen.sedan=true;G.veh.fuel.sedan=60;G.veh.active='sedan';G.heat=Math.min(5,G.heat+2);{news(`A sedan was stolen near ${poi.name}.`,2);notify('Hotwired. The sedan is yours, but it is hot.')}}
    else{G.heat=Math.min(5,G.heat+3);notify('The owner spots you. Run!')}
  }
  hud();
}
