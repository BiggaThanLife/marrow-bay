"use strict";
/* Character creator and wardrobe menus. */
let draft=null;
function customize(k,existing){
  const starts=OUTFITS.filter(o=>o.start);
  if(!draft)draft={name:existing&&G.name!=='Stranger'?G.name:'',skin:G.look.skin,hair:G.look.hair,style:G.look.style,outfit:starts.some(o=>o.id===G.look.outfit)?G.look.outfit:'blue',quirk:G.quirk||'night-owl'};
  const d=draft,q=QUIRKS[d.quirk];
  const look={skin:d.skin,hair:d.hair,style:d.style,outfit:d.outfit,hat:G.look.hat||'none'};
  const keep=()=>{const e=$('#pname');if(e)d.name=e.value.slice(0,12)};
  const cyc=(key,len)=>()=>{keep();d[key]=(d[key]+1)%len;customize(k,existing)};
  ui(`<h2>${existing?'HARBOR has updated its records':'Who are you, exactly?'}</h2><p class="muted">${existing?'Marrow Bay now keeps a file on your name, looks and quirks, and yours is blank. This is a one-time form. HARBOR apologizes for the paperwork, but not very much.':'HARBOR requires a name for its records. It will not judge the name. It may judge the person.'}</p>
    <label class="small muted" for="pname">Name</label><input id="pname" class="txt" maxlength="12" autocomplete="off" placeholder="Stranger" value="${esc(d.name)}">
    <div class="look"><canvas id="pv" width="20" height="24"></canvas><div class="small muted">${esc(q.n)}: ${esc(q.d)}</div></div>`,
  [{label:`Skin: ${SKINN[d.skin]}`,cls:'',fn:cyc('skin',SKIN.length)},
   {label:`Hair color: ${HAIRN[d.hair]}`,cls:'',fn:cyc('hair',HAIR.length)},
   {label:`Hair style: ${STYLEN[d.style]}`,cls:'',fn:cyc('style',STYLEN.length)},
   {label:`Outfit: ${outfitOf(d.outfit).n}`,sub:'Other outfits are sold at Hand-Me-Ups.',cls:'',fn:()=>{keep();d.outfit=starts[(starts.findIndex(o=>o.id===d.outfit)+1)%starts.length].id;customize(k,existing)}},
   {label:`Quirk: ${q.n}`,sub:q.d,cls:'',fn:()=>{keep();const ids=Object.keys(QUIRKS);d.quirk=ids[(ids.indexOf(d.quirk)+1)%ids.length];customize(k,existing)}},
   {label:'This is me',cls:'primary',fn:()=>{
     keep();G.name=(d.name||'').trim()||'Stranger';G.look=look;G.quirk=d.quirk;
     if(!existing||!G.wardrobe)G.wardrobe={outfits:{},hats:{none:1}};G.wardrobe.outfits[d.outfit]=1;
     G.flags.customDone=true;draft=null;save();
     if(existing){closeMenu();notify('Your file is complete. HARBOR is almost proud.')}else intro(0,k)}},
   ...(existing?[{label:'Keep the default',sub:'Stay as Stranger, no quirk.',cls:'quiet',fn:()=>{G.flags.customDone=true;draft=null;save();closeMenu()}}]:[])],true,false);
  const c=$('#pv');if(c)drawPlayer(c.getContext('2d'),10,21,look,0,false,0);
}
function wardrobeMenu(back,msg){
  const L=G.look;
  const rows=(kind,list,key)=>list.filter(x=>G.wardrobe[kind][x.id]).map(x=>({label:`${x.n}${L[key]===x.id?' (wearing)':''}`,cls:'',off:L[key]===x.id,fn:()=>{L[key]=x.id;advance(5);wardrobeMenu(back,`You change into the ${x.n.toLowerCase()}.`)}}));
  ui(`<h2>Wardrobe</h2><p class="muted">Anything you have bought is yours to wear, free. New clothes are sold at Hand-Me-Ups.</p>${msgP(msg)}`,[...rows('outfits',OUTFITS,'outfit'),...rows('hats',HATS,'hat'),{label:'Back',cls:'quiet',fn:back}]);
}
