"use strict";
/* Generic quantity picker with a live total. o: {title,intro,price,max,mode:'buy'|'sell',fee,def,totalFn(n) for prices that change with quantity,onConfirm(q)->message,back(message)} */
function qtyMenu(o,q){
  const fee=o.fee||0;
  const cap=Math.max(0,Math.min(o.max,o.mode==='sell'?o.max:Math.floor((G.cash-fee)/o.price+1e-9)));
  if(cap<1)return o.back(o.mode==='sell'?'You have none to sell.':'You cannot afford any.');
  q=clamp(Math.floor(q||Math.min(cap,o.def||1)),1,cap);
  const total=n=>(o.totalFn?o.totalFn(n):Math.round(o.price*n))+(o.mode==='sell'?-fee:fee);
  const say=n=>o.mode==='sell'?`${n} for ${money(total(n))}`:`${n} cost ${money(total(n))}`;
  ui(`<h2>${esc(o.title)}</h2><p class="muted">${esc(o.intro||'')} ${o.price>=1?money(o.price)+' each':o.price>0?Math.round(o.price*100)+' cents each':''}${fee?`, plus a ${money(fee)} fee`:''}. ${o.mode==='sell'?`You have ${o.max}.`:`You can afford up to ${cap}.`}</p>
    <label class="small muted" for="qty">How many</label><input id="qty" class="txt" type="number" inputmode="numeric" min="1" max="${cap}" value="${q}">
    <p id="qtotal" class="amber">${esc(say(q))}</p>`,[
    {label:o.mode==='sell'?'Sell this many':'Buy this many',cls:'primary',fn:()=>{const n=clamp(Math.floor(+$('#qty').value)||1,1,cap);o.back(o.onConfirm(n))}},
    {label:'Minus 1',cls:'',fn:()=>qtyMenu(o,(+$('#qty').value||1)-1)},
    {label:'Plus 1',cls:'',fn:()=>qtyMenu(o,(+$('#qty').value||1)+1)},
    {label:'Plus 5',cls:'',fn:()=>qtyMenu(o,(+$('#qty').value||1)+5)},
    {label:`${o.mode==='sell'?'All':'Most I can afford'} (${cap})`,cls:'',fn:()=>qtyMenu(o,cap)},
    {label:'Back',cls:'quiet',fn:()=>o.back()}]);
  const inp=$('#qty');
  if(inp)inp.addEventListener('input',()=>{const n=clamp(Math.floor(+inp.value)||1,1,cap);$('#qtotal').textContent=say(n)});
}
