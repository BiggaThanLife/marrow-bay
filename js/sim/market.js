"use strict";
/* Market saturation. Every unit you sell at the market adds to that good's glut (G.sat), and each further unit fetches less.
   The glut drains by the hour, so a normal day's selling barely notices and dumping forty meals at once does. */
const SAT_REF={meals:14,smoked:14,fish:24,crops:30,radish:40,tomato:26,pumpkin:12,salad:14,soup:14,pie:12,trinkets:10,scrap:50};
const satOf=k=>(G.sat&&G.sat[k])||0;
/* price multiplier for the next unit, after `extra` more have been sold */
const satMul=(k,extra)=>Math.max(.35,1/(1+(satOf(k)+(extra||0))/(SAT_REF[k]||20)));
/* what n units fetch, one after another, at a base unit price */
function saleTotal(k,unit,n){let t=0;for(let i=0;i<n;i++)t+=Math.max(1,Math.round(unit*satMul(k,i)));return t}
function satSold(k,n){G.sat[k]=satOf(k)+n}
function satHourly(){for(const k in G.sat){G.sat[k]*=.9;if(G.sat[k]<.05)delete G.sat[k]}}
const satNote=k=>{const m=satMul(k);return m>.9?'':m>.7?' Buyers are filling up.':m>.5?' The market is flooded.':' Nobody wants more today.'};
