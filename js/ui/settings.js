"use strict";
/* Settings (phone and title): sound, save and load, export and import, full screen, quit to title. */
const VOLNAMES=['','Low','Medium','High'];
const fsSupported=()=>{const e=document.documentElement;return !!(e.requestFullscreen||e.webkitRequestFullscreen)};
const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
async function goFull(landscape){
  const el=document.documentElement;
  if(!fsSupported())return 'This browser cannot do full screen. On iPhone, tap Share, then Add to Home Screen, and open Marrow Bay from that icon.';
  try{if(el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});else el.webkitRequestFullscreen()}catch(e){return 'The browser blocked full screen. Try again.'}
  if(landscape){
    try{await screen.orientation.lock('landscape')}catch(e){return 'Full screen is on, but this device would not lock landscape. Turn your phone sideways.'}
  }
  return landscape?'Full screen, landscape.':'Full screen is on.';
}
function leaveFull(){
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}
  try{if(document.exitFullscreen)document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen()}catch(e){}
}
function saveStamp(s){return s?`Day ${Math.floor(s.t/1440)+1}, ${BG[s.bg]?BG[s.bg].n:'Unknown'}`:'No save yet'}
function validSave(o){return !!(o&&typeof o==='object'&&o.p&&typeof o.t==='number'&&o.bg&&BG[o.bg]&&typeof o.cash==='number'&&o.inv&&Array.isArray(o.biz))}
function exportSave(back){
  if(G)save();
  const raw=localStorage.getItem(SAVE);
  if(!raw)return back('There is nothing to export yet.');
  try{
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
    a.download=`marrow-bay-${(JSON.parse(raw).name||'save').replace(/\W+/g,'-').toLowerCase()}.json`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    back('Backup file downloaded.');
  }catch(e){
    ui(`<h2>Export save</h2><p class="muted">The download did not work. Copy this text and keep it somewhere safe.</p><textarea class="txt" readonly rows="6" style="user-select:text">${esc(raw)}</textarea>`,[{label:'Back',fn:()=>back()}]);
  }
}
function importSave(back){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
  inp.addEventListener('change',()=>{
    const f=inp.files&&inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{
      let o=null;try{o=JSON.parse(r.result)}catch(e){}
      if(!validSave(o))return back('That file is not a Marrow Bay save.');
      ask('Import this save?',`${saveStamp(o)}. This replaces ${G?'your current game':'any saved game'}.`,'Import',()=>{
        try{localStorage.setItem(SAVE,JSON.stringify(o))}catch(e){return back('The browser would not store that save.')}
        continueSave(o);sfx('good');
      },()=>back());
    };
    r.onerror=()=>back('Could not read that file.');
    r.readAsText(f);
  });
  inp.click();
}
function settingsMenu(msg){
  const inGame=!!G,full=isFull(),saved=loadSave();
  const back=m=>settingsMenu(m),leave=()=>inGame?phone():title();
  ui(`<h2>Settings</h2><p class="muted">${inGame?`Saved game: ${saveStamp(saved)}. The game also saves by itself.`:'Sound and screen options.'}</p>${msgP(msg)}`,[
    {label:`Sound: ${SET.mute?'Off':'On'}`,sub:'Tap to switch',cls:'primary',fn:()=>{SET.mute=!SET.mute;saveSettings();sfx('open');back()}},
    {label:`Volume: ${VOLNAMES[SET.vol]}`,sub:'Tap to change',off:SET.mute,cls:'',fn:()=>{SET.vol=SET.vol%3+1;saveSettings();sfx('good');back()}},
    ...(inGame?[
      {label:'Save now',sub:'Write your game to this device',cls:'',fn:()=>{save();back('Game saved.')}},
      {label:'Load last save',sub:saved?`Go back to ${saveStamp(saved)}`:'No save yet',off:!saved,cls:'',fn:()=>ask('Load your last save?','Anything since your last save is lost.','Load',()=>{continueSave(loadSave())},()=>back())}
    ]:[]),
    {label:'Export save',sub:'Download a backup file',off:!inGame&&!saved,cls:'',fn:()=>exportSave(back)},
    {label:'Import save',sub:'Load a backup file',cls:'',fn:()=>importSave(back)},
    {label:full?'Leave full screen':'Full screen',sub:'Hides the browser bar so you do not tap it by accident',cls:'',fn:async()=>{if(full){leaveFull();return back('Full screen is off.')}back(await goFull(false))}},
    ...(full?[]:[{label:'Full screen, landscape',sub:'Turns the game sideways and hides the browser bar',cls:'',fn:async()=>back(await goFull(true))}]),
    ...(inGame?[{label:'Quit to title',sub:'Saves first',cls:'warn',fn:()=>ask('Quit to title?','Your game is saved first. You can continue from the title screen.','Quit',()=>{save();title()},()=>back())}]:[]),
    {label:'Back',cls:'quiet',fn:leave}]);
}
document.addEventListener('fullscreenchange',()=>{if(typeof fitCanvas==='function')fitCanvas()});
