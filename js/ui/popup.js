"use strict";
/* Centered alert card. Pauses the game and covers the toolbar, so an alert can never be cleared by tapping something else. */
let popQ=[],popOpen=false;
function popup(title,text,extra){popQ.push({title,text,extra});if(!popOpen)popNext()}
function popNext(){
  const p=popQ.shift();
  if(!p){popOpen=false;$('#pop').hidden=true;return}
  popOpen=true;sfx('alert');
  $('#pop-t').textContent=p.title;$('#pop-x').textContent=p.text;
  $('#pop-e').textContent=p.extra||'';$('#pop-e').hidden=!p.extra;
  $('#pop').hidden=false;
}
function popClear(){popQ.length=0;popOpen=false;$('#pop').hidden=true}
$('#pop-ok').addEventListener('click',popNext);
