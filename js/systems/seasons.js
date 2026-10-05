"use strict";
/* Seasons: 30 days each. They tilt crop yield, fish, and energy, and bring the county fair in autumn. */
const SEASONS=['Spring','Summer','Autumn','Winter'];
const SEASON_BLURB=['Rain, mud, and optimism.','Long days and sunburnt crops.','Harvest, smoke, and a fair at the Briar Barn.','Short days. The sea is rough but generous.'];
const seasonIdx=()=>Math.floor((day()-1)/30)%4;
const season=()=>SEASONS[seasonIdx()];
const seasonDay=()=>(day()-1)%30+1;
const fairOn=()=>seasonIdx()===2&&seasonDay()>=14&&seasonDay()<=15;
function seasonsDaily(){
  if(seasonDay()===1){
    recomputeMods();
    alertNews(`News: ${season()} begins. ${SEASON_BLURB[seasonIdx()]}`,2);
  }
  if(seasonIdx()===2&&seasonDay()===14){
    councilMod('County fair','Stalls, a band, and a goat in a hat.',{busk:1.3,traffic:{Greenbelt:1.3,Grid:1.1}},2);
    alertNews('News: The County Fair opens at the Briar Barn for two days. There is a produce contest.',2);
  }
  if(fact('coop_owned')&&day()%7===0){G.cash+=25;news('Your co-op share pays $25 this week.',1)}
}
