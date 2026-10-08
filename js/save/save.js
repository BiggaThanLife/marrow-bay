"use strict";
/* Save and load from localStorage. */
let saveFailed=false;
/* A failed write (storage full or blocked) says so once, so nobody plays on thinking it is safe. */
function save(){
  try{if(G){G.p.path=[];localStorage.setItem(SAVE,JSON.stringify(G));saveFailed=false}return true}
  catch(e){if(!saveFailed){saveFailed=true;try{popup('Could not save','This browser would not store your game, so progress since the last good save could be lost. Open Phone, then Settings, and use Export save to keep a backup file.')}catch(x){}}return false}
}
/* Phones drop background tabs without warning, so write the game whenever the page is hidden or closed, keeping any walk in progress. */
function saveOnHide(){if(!G||!G.p)return;const path=G.p.path;save();G.p.path=path}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveOnHide()});
window.addEventListener('pagehide',saveOnHide);
function loadSave(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null}catch(e){return null}}
