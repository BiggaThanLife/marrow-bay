"use strict";
/* Your story: what you have done in Marrow Bay, in HARBOR's voice. histAdd() records a moment (G.hist, newest last, capped, with a key and a gap in days
   so a repeated act is not listed twice in a row); the Phone's "Your story" page merges those with the arcs (G.arcsDone) and personal threads (G.threads.done),
   which already keep their own records. Nothing here changes how the game plays. */
const HIST_CAP=80,HIST_SHOW=40;
function histAdd(key,text,gap){
  G.hist=G.hist||[];
  if(key&&G.hist.some(h=>h.key===key&&day()-h.day<(gap||99999)))return;
  G.hist.push({day:day(),key:key||'',t:text});
  while(G.hist.length>HIST_CAP)G.hist.shift();
}
/* a person's feelings about you crossing into warm or hostile, noticed when you talk to them */
function histTier(n,tr){
  G.tierSeen=G.tierSeen||{};
  const was=G.tierSeen[n.id];G.tierSeen[n.id]=tr;
  if(was===undefined)return;
  if(tr>was&&tr>=3)histAdd('tier+'+n.id,`${n.name} thinks well of you now. HARBOR has not been told why.`,6);
  else if(tr<was&&tr===0)histAdd('tier-'+n.id,`${n.name} will no longer deal with you. HARBOR has made a note in the margin.`,6);
}
/* the whole story, newest first: {day,t} */
function storyEntries(){
  const rows=[];
  (G.hist||[]).forEach((h,i)=>rows.push({day:h.day,o:i,t:h.t}));
  (G.arcsDone||[]).forEach((a,i)=>rows.push({day:a.day,o:1000+i,t:`${a.title}: ${a.name}. ${a.text}`}));
  (G.threads&&G.threads.done||[]).forEach((x,i)=>rows.push({day:x.day,o:2000+i,t:`${x.title}: ${x.end}. HARBOR filed it under "personal".`}));
  return rows.sort((a,b)=>b.day-a.day||b.o-a.o);
}
function storyMenu(){
  const rows=storyEntries(),shown=rows.slice(0,HIST_SHOW);
  ui(`<h2>Your story</h2><p class="muted">${rows.length?`HARBOR holds ${rows.length} entr${rows.length===1?'y':'ies'} about you. The newest come first.`:'Nothing on file yet. HARBOR is patient.'}</p>
  ${shown.map(r=>`<p><span class="muted small">Day ${r.day}</span><br>${esc(r.t)}</p>`).join('')}${rows.length>shown.length?`<p class="muted small">${rows.length-shown.length} older entries are in the archive, which is a drawer.</p>`:''}`,
  [{label:'Back',fn:()=>phone()}]);
}
