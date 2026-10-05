"use strict";
/* County fair at the Briar Barn. The barn menu is wrapped so the fair shows up while it is on. */
const _barnMenu=MENUS.barn;
MENUS.barn=(poi,n,msg)=>{
  if(!fairOn()||G.flags.fairSkip===day())return _barnMenu(poi,n,msg);
  ui(`<h2>County Fair</h2><p class="muted">Bunting, a brass band, and a goat in a small hat. Day ${seasonDay()-13} of 2.</p>${msgP(msg)}`,[
    {label:'Produce contest',sub:G.flags.fairYear===Math.floor((day()-1)/120)?'You have already entered this year':'$10 entry. Bring 3 crops.',off:G.flags.fairYear===Math.floor((day()-1)/120)||G.inv.crops<3||G.cash<10,cls:'',fn:()=>fairContest(poi,n)},
    {label:'Wander the stalls',sub:'1 hour. Greenbelt standing up a little.',cls:'',fn:()=>{advance(60);G.rep.Greenbelt=clamp(G.rep.Greenbelt+1,-100,100);MENUS.barn(poi,n,pick(['A man sells fried everything. You buy nothing and leave full of smell.','The goat looks at you. You look at the goat. You both understand.','Wren sells jam at an alarming markup.']))}},
    {label:'Go to the barn',sub:'Skip the fair for now',cls:'quiet',fn:()=>{G.flags.fairSkip=day();MENUS.barn(poi,n)}},
    leaveBtn]);
};
function fairContest(poi,n){
  G.cash-=10;G.inv.crops-=3;advance(90);G.flags.fairYear=Math.floor((day()-1)/120);
  const score=40+Math.random()*40+G.rep.Greenbelt/4+Math.min(G.inv.crops,10)*2+(has('rural')?10:0)+(fact('coop_owned')?5:0)+(fact('greenbelt_sold')?-5:0);
  let m;
  if(score>=85){G.cash+=150;G.rep.Greenbelt=clamp(G.rep.Greenbelt+6,-100,100);G.fairWins=(G.fairWins||0)+1;m='First place. A ribbon, $150, and the goat gives you a long look of respect.'}
  else if(score>=65){G.cash+=40;G.rep.Greenbelt=clamp(G.rep.Greenbelt+2,-100,100);m='Second place. A smaller ribbon and $40.'}
  else m='Not placed. The judge says your crops have "character."';
  MENUS.barn(poi,n,m);
}
