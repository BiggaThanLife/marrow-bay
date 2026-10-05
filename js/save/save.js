"use strict";
/* Save and load from localStorage. */
function save(){try{if(G){G.p.path=[];localStorage.setItem(SAVE,JSON.stringify(G))}}catch(e){}}
function loadSave(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null}catch(e){return null}}
