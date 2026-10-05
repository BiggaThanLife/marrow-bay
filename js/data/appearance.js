"use strict";
/* Skin, hair, outfits, hats, quirks. */
/* ================= CUSTOMIZATION ================= */
const SKIN=['#f1d0b0','#e0b68a','#c58c5f','#9a6240','#6b4128'],SKINN=['Pale','Light','Tan','Brown','Deep'];
const HAIR=['#2b2118','#5a3a1c','#a8742a','#d8c27a','#b5453a','#7a7f8a','#4a2f6b'],HAIRN=['Soot black','Chestnut','Honey','Straw','Rust red','Ash grey','Plum'];
const STYLEN=['Short','Long','Buzzed','Bald'];
const OUTFITS=[
 {id:'blue',n:'Harbor blue',c:'#2f6fb3',price:0,start:true},{id:'rust',n:'Rust jacket',c:'#b5453a',price:0,start:true},{id:'moss',n:'Moss coat',c:'#4a8a4a',price:0,start:true},
 {id:'amber',n:'Amber windbreaker',c:'#d8a02a',price:45},{id:'violet',n:'Violet suit',c:'#8a5ab5',price:60},{id:'cream',n:'Linen cream',c:'#e8e0c8',price:70},{id:'night',n:'Night suit',c:'#2a2f3a',price:90}
];
const HATS=[{id:'none',n:'No hat',price:0},{id:'beanie',n:'Beanie',price:20},{id:'cap',n:'Flat cap',price:25},{id:'brim',n:'Wide-brim hat',price:45},{id:'sun',n:'Straw sun hat',price:30,season:'Summer'},{id:'wool',n:'Wool hat',price:35,season:'Winter'}];
const QUIRKS={
 'night-owl':{n:'Night owl',d:'Tires 30% slower after dark, 20% faster before 10 am.'},
 'early-bird':{n:'Early bird',d:'Tires 15% slower from 6 am to 6 pm, 30% faster otherwise.'},
 'iron-stomach':{n:'Iron stomach',d:'Hunger drains 20% slower, but shifts pay 5% less.'},
 'frugal':{n:'Penny pincher',d:'Shops charge you 5% less, but buy from you for 5% less.'},
 'light-fingered':{n:'Light fingers',d:'Pickpocketing and shoplifting work 10% better. Reyes and Mina dislike you. Vex approves.'},
 'neighborly':{n:'Neighborly',d:'Gifts earn more goodwill, but chatting takes 25 minutes instead of 10.'}
};
const outfitOf=id=>OUTFITS.find(o=>o.id===id)||OUTFITS[0];
