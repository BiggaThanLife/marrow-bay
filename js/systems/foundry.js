"use strict";
/* Foundry Row: parts, FLACK jammers, vehicle mods. Output meter changes how much scrap a part costs. */
const partScrap=()=>G.meters['Foundry Row']>=65?2:G.meters['Foundry Row']<=35?4:3;
const foundryOpen=()=>!fact('foundry_closed');
const craftSurcharge=()=>fact('foundry_exposed')?1.2:1;
const vehSpeed=k=>VEH[k].sp*(G.veh.mods&&G.veh.mods[k]&&G.veh.mods[k].turbo?1.15:1);
const vehFuelUse=k=>G.veh.mods&&G.veh.mods[k]&&G.veh.mods[k].tank?.75:1;
const jamActive=()=>(G.fx.jamUntil||0)>G.t;
