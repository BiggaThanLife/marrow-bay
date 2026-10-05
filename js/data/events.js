"use strict";
/* Daily color events and rumor types. */
const EVENTS=[
 {id:'glut',name:'Harvest glut',desc:'Crops sell cheap at the market today.'},
 {id:'strike',name:'Dock strike',desc:'The piers are shut. Dockside workers spend the day fishing and idling.'},
 {id:'gala',name:'Highline gala',desc:'Rich crowds tip well on the plaza, and the Estate pays extra.'},
 {id:'heat',name:'Heatwave',desc:'Everyone tires and hungers faster today.'}
];
const RUM={
 thief:{d:-30,t:'They say you robbed the Market Hall.'},
 defaulter:{d:-25,t:'They say you skipped out on a bank loan.'},
 generous:{d:14,t:'They say you feed strangers for free.'},
 successful:{d:10,t:'They say your business is doing well.'}
};
