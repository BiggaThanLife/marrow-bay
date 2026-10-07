"use strict";
/* Business types, staff traits, wages. */
const BT={
 cafe:{n:'Café',fit:400,price:12,cost:5,per:.5,cap:7,sign:'CAFE',col:['#f0c05a','#c48a2a'],dep:{crops:1,fish:2,smoked:2},d:'Sells meals. Runs on supplies, or your own crops and fish.'},
 bar:{n:'Bar',fit:700,price:9,cost:2.5,per:.55,cap:9,sign:'BAR',col:['#8a4fb0','#5e3380'],d:'Sells drinks. Wholesale supplies are automatic.'},
 workshop:{n:'Workshop',fit:600,price:22,cost:9,per:.35,cap:4,sign:'MAKER',col:['#8f98a2','#5f6770'],dep:{scrap:1},d:'Makes goods. Feed it scrap to cut costs.'},
 rental:{n:'Apartments',fit:900,sign:'FLATS',col:['#c9a58c','#97765f'],d:'Tenants pay rent daily. Choose who moves in and keep them happy.'},
 farm:{n:'Farm',fit:350,sign:'FARM',col:['#9bbf6a','#6c8f45'],d:'Grows crops each day. Sell wholesale or keep them. Greenbelt only.'},
 pies:{n:'Meat pie shop',fit:500,price:15,cost:1.2,per:.55,cap:8,sign:'PIES',col:['#c07a50','#8a4a2a'],d:'"100% organic, locally sourced meat. Do not ask which local." Cheap to run and it sells, but the district grows suspicious.',shady:{rep:.2,inspect:.04,fine:90,news:'The health inspector has been seen leaving a pie shop in the {d} very quickly.'}},
 cages:{n:'Micro-cage hostel',fit:650,price:7,cost:.4,per:1.1,cap:14,sign:'CAGES',col:['#8a8f96','#555a61'],d:'Standing-only sleeping stalls, four square feet each. They fill every night and nobody complains, out loud. The neighbours notice.',shady:{rep:.35,inspect:.03,fine:120,news:'A hostel in the {d} has been cited for stalls "below the legal minimum for a coat."'}},
 wellness:{n:'Wellness centre',fit:500,price:28,cost:.6,per:.3,cap:3,sign:'CALM',col:['#9ec5c0','#5f8f8a'],d:'Tap water sold as "Bio-Hacked Dew," and a dark room to sit in. People pay a lot to cry quietly. Keeps tempers down, and the heat off you.',calm:{heat:.15}},
 home:{n:'Home',fit:300,sign:'HOME',col:['#7aa7d6','#4f78a6'],d:'Live here. $60 a month in upkeep.'}
};
const TRAITS=['reliable','sticky','charming','guard','quick'];
const TRAITN={reliable:'Reliable',sticky:'Sticky fingers',charming:'Charming',guard:'Guard',quick:'Quick'};
const WN=['Ana','Ben','Cleo','Dev','Eli','Fay','Gil','Hana','Ivo','Jo','Kai','Lena','Milo','Nia','Omar','Pia'];
const LN=['Reed','Park','Cruz','Hale','Ito','Voss','Bryce','Lund','Moss','Shah'];
const WAGE={cordelia:60,halloran:40,mina:30,teo:28,duarte:38,pip:6,wren:20,reyes:36,ashgrove:70,gus:26,bell:45,vex:80,mack:50,ines:60,lou:55,kofi:34,priya:36};
