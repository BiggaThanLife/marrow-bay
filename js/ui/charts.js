"use strict";
/* Small line charts drawn as inline SVG (no library). lineChart(values, {title, fmt, zero, line, h, empty}) returns HTML. */
const HIST_DAYS=30;
const pushHist=(arr,v,max=HIST_DAYS)=>{arr.push(Math.round(v*100)/100);while(arr.length>max)arr.shift();return arr};
function lineChart(vals,o={}){
  vals=(vals||[]).filter(Number.isFinite);
  const title=o.title?`<p class="small" style="margin:8px 0 2px"><b>${esc(o.title)}</b></p>`:'';
  if(vals.length<2){
    const fmt0=o.fmt||(v=>money(v)),first=vals.length?` So far: ${fmt0(vals[0])}.`:'';
    return `${title}<p class="small muted">${esc(o.empty||'Tracking has started.')}${esc(first)} The line appears after two game days, so check back tomorrow.</p>`;
  }
  const fmt=o.fmt||(v=>money(v)),w=300,h=o.h||80,pad=5,n=vals.length;
  let lo=Math.min(...vals,o.line===undefined?Infinity:o.line),hi=Math.max(...vals,o.line===undefined?-Infinity:o.line);
  if(o.zero){lo=Math.min(lo,0);hi=Math.max(hi,0)}
  if(hi-lo<1e-6)hi=lo+1;
  const X=i=>pad+i*(w-2*pad)/(n-1),Y=v=>h-pad-(v-lo)/(hi-lo)*(h-2*pad);
  const pts=vals.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area=`${X(0).toFixed(1)},${h-pad} ${pts} ${X(n-1).toFixed(1)},${h-pad}`;
  const zeroLine=o.zero&&lo<0&&hi>0?`<line x1="0" x2="${w}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="var(--line)" stroke-width="1" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`:'';
  const refLine=o.line!==undefined?`<line x1="0" x2="${w}" y1="${Y(o.line).toFixed(1)}" y2="${Y(o.line).toFixed(1)}" stroke="var(--amber)" stroke-width="1" stroke-dasharray="5 3" vector-effect="non-scaling-stroke"/>`:'';
  const last=vals[n-1],up=last>=vals[0];
  return `${title}<div class="chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(o.title||'Chart')}" style="display:block;width:100%;height:${h}px">
    <polygon points="${area}" fill="var(--accent)" opacity=".14"/>${zeroLine}${refLine}
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    <circle cx="${X(n-1).toFixed(1)}" cy="${Y(last).toFixed(1)}" r="3" fill="${up?'var(--good)':'var(--warn)'}"/></svg>
    <div class="small muted" style="display:flex;justify-content:space-between"><span>Low ${esc(fmt(Math.min(...vals)))}</span><span>Now <b>${esc(fmt(last))}</b></span><span>High ${esc(fmt(Math.max(...vals)))}</span></div>
    ${o.line!==undefined?`<div class="small amber">Dashed line: ${esc(o.lineLabel||'reference')} ${esc(fmt(o.line))}</div>`:''}</div>`;
}
/* adds up several history arrays, aligned from the most recent day backwards */
function sumHist(list){
  const len=Math.max(0,...list.map(a=>a.length)),out=[];
  for(let i=len;i>=1;i--)out.unshift(list.reduce((s,a)=>s+(a[a.length-i]||0),0));
  return out;
}
const issueTotal=()=>G.biz.reduce((s,b)=>s+(b.type==='rental'&&b.issues?b.issues.length:0),0);
