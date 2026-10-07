"use strict";
/* Settings (phone and title): sound, save and load, export and import, full screen, quit to title. */
const VOLNAMES=['','Low','Medium','High'];
const fsSupported=()=>{const e=document.documentElement;return !!(e.requestFullscreen||e.webkitRequestFullscreen)};
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
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
/* Moves the player to the closest open road tile, for anyone boxed in by their own buildings or stuck after a load. */
function unstick(){
  const p=G.p;let best=null,bd=1e9;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(map[y][x]!==T.ROAD||structAt(x,y)||!pass(x,y))continue;
    const d=Math.abs(x-p.x)+Math.abs(y-p.y);if(d<bd){bd=d;best=[x,y]}
  }
  if(!best)return false;
  p.x=best[0];p.y=best[1];p.path=[];p.onArrive=null;dest=null;gpsPath=[];save();return true;
}
/* Apple browsers have no full screen API, so the way to hide the browser bars is a home screen icon. */
function installHelp(back){
  ui(`<h2>Full screen on iPhone and iPad</h2><p class="muted">Safari cannot hide its bars from inside a game. A home screen icon opens Marrow Bay with no bars at all, and it turns sideways when you turn your phone.</p>
  <ol class="small" style="margin:6px 0 8px 18px;line-height:1.5"><li>Open this page in <b>Safari</b> (not inside another app's browser).</li><li>Tap the <b>Share</b> button, the square with an arrow.</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>, then open Marrow Bay from the new icon.</li></ol>
  <p class="small muted">Your save lives in the browser, so the icon starts with an empty game. To bring your game over: Export save here first, then Import save from the icon. Android phones: the Full screen buttons work directly.</p>`,[{label:'Back',cls:'quiet',fn:()=>back()}]);
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
    {label:full?'Leave full screen':'Full screen',sub:'Hides the browser bar so you do not tap it by accident',cls:'',fn:async()=>{if(full){leaveFull();return back('Full screen is off.')}if(!fsSupported())return installHelp(back);back(await goFull(false))}},
    ...(full?[]:[{label:'Full screen, landscape',sub:'Turns the game sideways and hides the browser bar',cls:'',fn:async()=>{if(!fsSupported())return installHelp(back);back(await goFull(true))}}]),
    ...(isIOS()&&!isStandalone()?[{label:'Full screen on iPhone',sub:'How to hide the Safari bars',cls:'primary',fn:()=>installHelp(back)}]:[]),
    ...(inGame?[{label:'Stuck? Move me to the street',sub:'Puts you on the nearest open road',cls:'',fn:()=>back(unstick()?'You are back on the street.':'No open road found.')}]:[]),
    ...(inGame?[{label:'Quit to title',sub:'Saves first',cls:'warn',fn:()=>ask('Quit to title?','Your game is saved first. You can continue from the title screen.','Quit',()=>{save();title()},()=>back())}]:[]),
    {label:'Back',cls:'quiet',fn:leave}]);
}
document.addEventListener('fullscreenchange',()=>{if(typeof fitCanvas==='function')fitCanvas()});
