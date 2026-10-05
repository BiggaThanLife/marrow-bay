"use strict";
/* Listed companies. base = normal price, fair() = how healthy the company is (1 is normal), from city state. */
const SHARES=[
 {id:'tide',n:'Tidewater Freight',d:'Dockside',base:42,fair:()=>.6+G.meters.Dockside/125},
 {id:'marrow',n:'Marrow Foods',d:'Greenbelt',base:28,fair:()=>.6+G.meters.Greenbelt/125},
 {id:'flack',n:'FLACK Systems',d:'Grid',base:55,fair:()=>.5+G.flack/60},
 {id:'iron',n:'Iron Works Ltd',d:'Foundry Row',base:35,fair:()=>.6+G.meters['Foundry Row']/125},
 {id:'gilded',n:'Gilded Tide Holdings',d:'Highline',base:70,fair:()=>.6+G.meters.Highline/125},
 {id:'yours',n:'Your Holdings',d:'Grid',base:20,fair:()=>1+G.biz.filter(b=>b.type&&b.type!=='home').length*.45}];
