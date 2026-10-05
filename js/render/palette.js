"use strict";
/* Building and ground colors, sign text. */
/* ================= RENDER ================= */
const COL={tower:['#9aa3b5','#6e7690'],warehouse:['#8a7f6a','#5f5646'],farmstead:['#c9a46a','#8f6f3d'],bank:['#d2c9a8','#a39b7e'],estate:['#9ec29a','#6e946a'],club:['#7b4d8a','#583769'],
  flats:['#c6a998','#97796a'],market:['#e0a24a','#b37c2c'],diner:['#d26a4f','#a54a35'],studio:['#a8b8c9','#7a8ea3'],workshop:['#8c8f94','#62666b'],
  clinic:['#e8eef0','#b7c3c8'],dock:['#7b8f9a','#556873'],bunk:['#a0805a','#765a3b'],gull:['#4f8a8e','#366569'],barn:['#b5453a','#8a3128'],
  casino:['#d04a8a','#8a2a5a'],velvet:['#5a3a7a','#3a2450'],pawn:['#c0a060','#8a7040'],loft:['#9a8ac0','#6a5a90'],realty:['#6aa0c8','#3f6f94'],garage:['#8a8a90','#5a5a60'],foundry:['#a0603a','#703a1a'],barber:['#d8b8c8','#a8889a'],tailor:['#b8c8a0','#8a9a70'],cityhall:['#cfc9b8','#9a937c']};
const SIGN={bank:'BANK',estate:'ESTATE',club:'CLUB',market:'MARKET',diner:'DINER',studio:'STUDIO',workshop:'WORKS',clinic:'CLINIC',dock:'DOCKS',bunk:'BUNKS',gull:'GULL',barn:'BARN',flats:'FLATS',
  casino:'CASINO',velvet:'VELVET',pawn:'PAWN',loft:'LOFTS',realty:'REALTY',garage:'GARAGE',foundry:'IRON',barber:'BARBER',tailor:'THREADS',cityhall:'HALL'};
const GROUND={Highline:'#86b57e',Grid:'#6f9a58',Dockside:'#7c9a6a',Greenbelt:'#79a257','Neon Mile':'#5d6a78','Foundry Row':'#7a7a70'};
const ROADC={Highline:'#7a7e88',Grid:'#4b505a',Dockside:'#5b5a58',Greenbelt:'#a88a5e','Neon Mile':'#37334d','Foundry Row':'#55534f'};
