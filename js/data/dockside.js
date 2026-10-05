"use strict";
/* Dockside: rods, boat, cargo crate types. */
const RODS=[{n:'Hand line',bonus:0,price:0},{n:'Sturdy rod',bonus:1,price:60},{n:'Carbon rod',bonus:2,price:180}];
const BOAT_PRICE=450;
const CRATES=[
 {n:'Crates of canned peaches',kind:'food',skim:{inv:'meals',n:1,txt:'a tin of peaches'},risk:.2},
 {n:'Bundle of steel offcuts',kind:'scrap',skim:{inv:'scrap',n:2,txt:'a few offcuts'},risk:.15},
 {n:'Case of perfume, Highline-bound',kind:'lux',skim:{inv:'trinkets',n:1,txt:'a bottle'},risk:.35},
 {n:'Sealed crate stamped FLACK-7',kind:'flack',risk:.5},
 {n:'Barrel of fish oil',kind:'oil',skim:{cash:9,txt:'a few litres on the side'},risk:.25},
 {n:'Sacks of grain, Greenbelt-bound',kind:'food',skim:{inv:'crops',n:2,txt:'a sack'},risk:.15}];
