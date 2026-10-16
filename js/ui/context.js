"use strict";
/* Context action button: one big button over the bottom bar when the player stands somewhere that has a hands-on action (Fish at the pier today).
   An action is {id, when(), label(), mode()?, run(), more()?}. The first registered action whose when() is true wins; a small "More..." button
   beside it opens the old menu for anything that stays menu-based. Add Dig, Talk and so on by calling ctxRegister (load order: this file first). */
const CTX_ACTIONS=[];
function ctxRegister(a){CTX_ACTIONS.push(a)}
function ctxCurrent(){
  if(!G||modal||popOpen||G.jail||placing||(typeof BUB!=='undefined'&&BUB))return null;
  return CTX_ACTIONS.find(a=>a.when())||null;
}
let ctxKey='';
function ctxRefresh(){
  const bar=$('#ctxbar');if(!bar)return;
  const a=ctxCurrent(),key=a?a.id+'|'+a.label()+'|'+(a.mode?a.mode():'')+'|'+(a.more?1:0):'';
  if(key===ctxKey)return;
  ctxKey=key;
  if(!a){bar.hidden=true;return}
  const b=$('#ctx-main'),m=$('#ctx-more');
  b.textContent=a.label();b.dataset.mode=a.mode?a.mode():'go';m.hidden=!a.more;bar.hidden=false;
}
function ctxRun(){const a=ctxCurrent();if(a)a.run()}
function ctxMore(){const a=ctxCurrent();if(a&&a.more)a.more()}
$('#ctx-main').addEventListener('click',ctxRun);
$('#ctx-more').addEventListener('click',ctxMore);
