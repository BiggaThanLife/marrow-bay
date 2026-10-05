"use strict";
/* Rents, owners, opening hours, district multipliers. */
/* ================= DATA ================= */
const RENT={barn:20,bunk:45,studio:100,flats:180,loft:260};
const RES=['barn','bunk','studio','flats','loft'];
const OWNER={market:'mina',diner:'teo',dock:'duarte',gull:'gus',estate:'ashgrove',bank:'cordelia',clinic:'bell',realty:'lou',garage:'mack',foundry:'ines',velvet:'vex'};
const OPEN={market:[8,20],diner:[6,22],bank:[9,17],estate:[8,18],dock:[6,18],workshop:[8,18],club:[18,27],gull:[12,27],realty:[9,18],garage:[8,19],foundry:[6,19],barber:[9,19],tailor:[9,19],cityhall:[9,17],velvet:[18,29],casino:[12,29],pawn:[10,22]};
const DM={Highline:2,Grid:1.4,Dockside:1,Greenbelt:.8,'Neon Mile':1.6,'Foundry Row':.9};
const PRICE={Highline:4200,Grid:2800,Dockside:1500,Greenbelt:900,'Neon Mile':3600,'Foundry Row':1800};
const TR={Highline:22,Grid:28,Dockside:20,'Neon Mile':34,'Foundry Row':18,Greenbelt:8};
