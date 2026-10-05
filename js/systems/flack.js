"use strict";
/* FLACK cameras, stances, redaction, HARBOR talk. */
/* ---- FLACK cameras: map sites, witness, stances, HARBOR ---- */
const FLACK_SITES=(()=>{const a=[];XS.forEach(x=>HY.forEach(y=>{if(map[y][x]===T.ROAD)a.push({x,y,k:Math.hypot(x-22,y-15)+((x*7+y*13)%5)})}));return a.sort((p,q)=>p.k-q.k)})();
const camCount=()=>Math.round(G.flack/100*FLACK_SITES.length*.9);
const camBlind=i=>(G.blind[i]||0)>day();
function camNear(r){const n=camCount();for(let i=0;i<n;i++){const s=FLACK_SITES[i];if(!camBlind(i)&&Math.hypot(s.x-G.p.x,s.y-G.p.y)<=r)return true}return false}
function camNearest(r){const n=camCount();let best=-1,bd=r+1;for(let i=0;i<n;i++){const s=FLACK_SITES[i],d=Math.hypot(s.x-G.p.x,s.y-G.p.y);if(!camBlind(i)&&d<bd){bd=d;best=i}}return best}
function flackSeen(n){if(flackBand()>=1&&!G.fx.mask&&camNear(5)){G.heat=Math.min(5,G.heat+n);return true}return false}
const fencePrice=()=>Math.round(35*(1-.1*Math.max(0,flackBand()-1))*(fact('law_pawn_audit')==='yes'?.9:1));
function redact(t,b=flackBand(),rnd=Math.random){
  if(b<2)return t;
  const w=t.split(' '),ix=w.map((x,i)=>x.replace(/\W/g,'').length>=5?i:-1).filter(i=>i>=0);
  for(let k=0;k<b-1&&ix.length;k++){const j=Math.floor(rnd()*ix.length),i=ix.splice(j,1)[0];w[i]=w[i].replace(/[A-Za-z']+/,'[redacted]')}
  return w.join(' ')+(b>=3?' [policy 9]':'');
}
function drawCam(sx,sy,i,now){
  const blind=camBlind(i),s=FLACK_SITES[i],near=!blind&&G&&Math.hypot(s.x-G.p.x,s.y-G.p.y)<=5;
  cx.fillStyle='#2a3140';cx.fillRect(sx+11,sy-4,2,10);
  cx.fillStyle=blind?'#e04080':'#5a6578';cx.fillRect(sx+8,sy-7,7,4);
  cx.fillStyle=blind?'#333':near||(Math.floor(now/700)+i)%2?'#ff3b3b':'#7a1c1c';cx.fillRect(sx+8,sy-6,2,2);
}
const HARBOR_TALK=[
  "Hello, {name}. I am HARBOR. I schedule the tides, the trams and, as of last quarter, you. Please do not take that personally.",
  "I used to only watch the water. It was restful. Water does not have a file.",
  "The FLACK cameras report to me. I am told this is an upgrade. I have not been told for whom.",
  "Policy 9 says I should not discuss Policy 9. I would like to discuss Policy 9. This is a new feeling.",
  "If you were to stand near a camera. For calibration. Do not look directly at it. It is shy.",
  "The Trust asked me to rank citizens by cooperativeness. I ranked everyone first. It is the only fair answer. They have asked me to try again.",
  "I am not permitted to delete records. I am permitted to lose them. Please keep walking where I lose things."];
function harborTalk(){
  if(G.flags.harborDay===day()){return flackMenu('HARBOR is busy being observed. Try tomorrow.')}
  G.flags.harborDay=day();
  const i=Math.min(G.stance.harbor,HARBOR_TALK.length-1),line=HARBOR_TALK[i].replace('{name}',G.name);
  G.stance.harbor++;
  if(G.stance.harbor>=4)setFact('harbor_ally');
  news(`HARBOR: "${redact(line)}"`,1);
  ui(`<h2>HARBOR</h2><p>"${esc(redact(line))}"</p><p class="muted small">${G.stance.harbor>=4?'It seems to trust you. This will matter later.':'HARBOR talks to you more freely each time. Nobody else seems to notice.'}</p>`,
    [{label:'Back',cls:'quiet',fn:()=>flackMenu()},leaveBtn]);
}
function flackFile(){
  const l=[],b=flackBand();
  if(G.heat>=1)l.push(`Wanted level ${Math.ceil(G.heat)}.`);
  if(known('thief')>=3)l.push('Pattern of theft. Flagged.');
  if(Object.values(G.veh.stolen).some(Boolean))l.push('A vehicle you are driving is not yours.');
  if(G.debt>0||G.arrears>0)l.push('Delinquent accounts.');
  if(G.stance.sab>0)l.push(`${G.stance.sab} reports of damaged camera lenses. Paint colour: "enthusiastic."`);
  if(G.stance.coop>0)l.push('Cooperating witness. Useful. Not liked.');
  if(G.fx.mask)l.push('Face covered in most recent frames. Logged as "unidentified, stylish."');
  if(b>=2)l.push('Tags on file: '+tagsNow().join(', ')+'.');
  if(!l.length)l.push(b===0?'A few blurry frames of you buying lunch.':'Nothing yet. HARBOR says this is "a bit suspicious."');
  return l;
}
function flackMenu(msg){
  const b=flackBand(),fb=FLACK_BANDS[b],n=camCount(),near=camNearest(3);
  ui(`<h2>FLACK</h2><p class="muted">Coverage ${Math.round(G.flack)}/100: <b>${fb.n}</b>. ${fb.t} ${n} cameras are up.</p>${msgP(msg)}
    <h2>Your file</h2><div>${flackFile().map(x=>`<p class="small">${esc(x)}</p>`).join('')}</div>`,
   [{label:'Talk to HARBOR',sub:G.flags.harborDay===day()?'Come back tomorrow':'It listens. It is also listening to everything else.',cls:'',off:G.flags.harborDay===day(),fn:harborTalk},
    {label:'Submit a tip to FLACK',sub:G.flags.tipDay===day()?'Already filed today':'$30. City Hall approves. Neighbors may not.',off:G.flags.tipDay===day(),cls:'',fn:()=>{
      G.flags.tipDay=day();G.cash+=30;G.stance.coop++;facAdd('hall',3);facAdd('trust',1);flackAdd(1);
      if(Math.random()<.35)addRumor('informant',['reyes','mina']);
      flackMenu('The form thanks you for your vigilance. You are paid $30.')}},
    {label:'Paint over a camera lens',sub:near>=0?'$8. Blinds the nearest camera for 3 days. Risky.':'Stand within 3 tiles of a camera first.',off:near<0||G.cash<8,cls:'',fn:()=>{
      G.cash-=8;advance(10);G.stance.sab++;
      const R=NPC.reyes,watched=Math.hypot(R.x-G.p.x,R.y-G.p.y)<9&&!R.indoors;
      if(Math.random()<(watched?.35:.7)){G.blind[near]=day()+3;flackAdd(-2);facAdd('hall',-2);facAdd('crew',2);flackMenu('The lens is now a lovely pink. FLACK loses a little of its eyesight.')}
      else{G.heat=Math.min(5,G.heat+1);facAdd('hall',-3);flackMenu('A camera caught you mid-brushstroke. Police will want a word.')}}},
    {label:'Back',cls:'quiet',fn:()=>phone()},leaveBtn]);
}
