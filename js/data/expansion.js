"use strict";
/* Business expansions (add-ons per business type) and the NPC-run shops you can buy out. */
/* Each add-on takes one slot (a building has as many slots as its level). eff keys: dem, cap, cost, yield, rent, issue (multipliers), mood (daily mood bonus). */
const BT_ADD={
  cafe:[
    {id:'patio',n:'Outdoor patio',cost:600,eff:{dem:1.2},d:'Tables on the pavement. About 20% more foot traffic.'},
    {id:'delivery',n:'Delivery bike',cost:500,eff:{cap:1.25},d:'Serve about 25% more people a day.'},
    {id:'supplier',n:'Supplier deal',cost:700,eff:{cost:.85},d:'Wholesale supplies cost 15% less.'}],
  bar:[
    {id:'music',n:'Live music night',cost:800,eff:{dem:1.25},d:'A stage and a reputation. About 25% more foot traffic.'},
    {id:'vip',n:'VIP booth',cost:900,eff:{cap:1.2},d:'Serve about 20% more people a day.'},
    {id:'cellar',n:'Cellar contract',cost:700,eff:{cost:.85},d:'Wholesale supplies cost 15% less.'}],
  workshop:[
    {id:'bench',n:'Second bench',cost:700,eff:{cap:1.3},d:'Make about 30% more a day.'},
    {id:'showroom',n:'Showroom window',cost:600,eff:{dem:1.2},d:'Passers-by see the work. About 20% more demand.'},
    {id:'crib',n:'Tool crib',cost:600,eff:{cost:.85},d:'Less waste. Supplies cost 15% less.'}],
  rental:[
    {id:'laundry',n:'Laundry room',cost:700,eff:{rent:1.08},d:'Tenants pay about 8% more rent.'},
    {id:'garden',n:'Roof garden',cost:600,eff:{mood:1},d:'Tenants are a little happier every day.'},
    {id:'door',n:'Security door',cost:800,eff:{issue:.6,mood:.3},d:'Fewer problems and a calmer building.'}],
  farm:[
    {id:'greenhouse',n:'Greenhouse bay',cost:700,eff:{yield:1.3},d:'About 30% more crops a day.'},
    {id:'coldstore',n:'Cold store',cost:500,eff:{cost:.8},d:'Running costs drop 20%.'},
    {id:'tractor',n:'Used tractor',cost:600,eff:{yield:1.15},d:'About 15% more crops a day.'}]
};
/* base = typical daily takings at level 1 with average foot traffic; perk is a plain-language effect applied where the shop sells */
const SHOP_DEFS={
  market:{price:2200,base:36,perk:'Seed packets cost 25% less.'},
  diner:{price:2000,base:42,perk:'Meals at the diner cost 30% less.'},
  gull:{price:2200,base:36,perk:'Rounds for the bar are free and Dockside likes you more.'},
  garage:{price:2800,base:46,perk:'Fuel costs 40% less.'}
};
const SHOP_LVL=[1,1.5,2.1];
