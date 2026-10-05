"use strict";
/* Passability, breadth-first pathfinding, spots near buildings. */
const pass=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&PASSABLE.has(map[y][x]);
function bfs(sx,sy,tx,ty){
  if(!pass(tx,ty)||!pass(sx,sy))return null;
  if(sx===tx&&sy===ty)return [];
  const prev=new Int32Array(W*H).fill(-1),s=sy*W+sx,g=ty*W+tx;
  prev[s]=s;const q=[s];
  for(let i=0;i<q.length;i++){
    const c=q[i];if(c===g)break;
    const cx=c%W,cy=(c/W)|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+dx,ny=cy+dy;
      if(!pass(nx,ny))continue;
      const n=ny*W+nx;if(prev[n]!==-1)continue;
      prev[n]=c;q.push(n);
    }
  }
  if(prev[g]===-1)return null;
  const path=[];let c=g;
  while(c!==s){path.push([c%W,(c/W)|0]);c=prev[c]}
  return path.reverse();
}
function spotNear(poi,id){
  const c=[];
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    if(Math.abs(dx)+Math.abs(dy)>2)continue;
    const x=poi.ex+dx,y=poi.ey+dy;
    if(pass(x,y)&&map[y][x]!==T.FARM)c.push([x,y]);
  }
  let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))>>>0;
  return c[h%c.length];
}
