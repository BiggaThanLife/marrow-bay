"use strict";
/* Small helpers used everywhere (DOM query, random, clamp, money). */
const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const money=n=>'$'+Math.round(n);
/* game minutes that pass per real second (it was 6, so a day took four minutes; at 4 a day takes six) */
const TIME_RATE=4;
const hash=(x,y)=>(((x*73856093)^(y*19349663))>>>0);
const man=(a,b,c,d)=>Math.abs(a-c)+Math.abs(b-d);
const SAVE='marrowbay_v3';

/* what people call someone in a sentence: the first name, or the next word after a title (Old Wren is Wren, Mr. Halloran is Halloran,
   Big Moe Fenwick is Moe, Dr. Imani Bell is Dr. Bell). Takes a person or a name. */
const NAME_TITLES=['Mr.','Mrs.','Ms.','Big','Old','Foreman','Constable','Lady','Sir'];
function shortName(n){const w=String(typeof n==='string'?n:n.name).split(' ');if(w[0]==='Dr.'&&w.length>1)return 'Dr. '+w[w.length-1];return NAME_TITLES.includes(w[0])&&w.length>1?w[1]:w[0]}
