"use strict";
/* The on-map note line. */
let noteTimer=null;
function notify(m,sticky){const e=$('#note');e.textContent=m;clearTimeout(noteTimer);if(!sticky)noteTimer=setTimeout(()=>e.textContent='',7000)}
