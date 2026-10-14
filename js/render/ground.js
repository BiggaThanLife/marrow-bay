"use strict";
/* Gritty ground, generated in code. Each tile is 32x32 real pixels (one map tile at RS 2), seamless, seeded and built once into a canvas:
   asphalt (clean, patched, oiled), cracked, wet with puddles, paving slabs (clean, grimy), grass, trampled mud, dock planks (clean, algae), cobbles, rusted plate and drain covers.
   groundTile(kind,variant) gives the canvas; drawGround(kind,tx,ty,sx,sy,d) draws one for a map tile and returns false when the older flat drawing should be used (RS 1). */
const hx=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
const gMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t|0,a[1]+(b[1]-a[1])*t|0,a[2]+(b[2]-a[2])*t|0];
const gRng=s=>{let a=s>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
/* tileable value noise in 0..1 with a lattice of n cells across the tile */
function gNoise(r,n){
  const L=[];for(let i=0;i<n*n;i++)L.push(r());
  const f=t=>t*t*(3-2*t);
  return(x,y)=>{const u=(x/32*n),v=(y/32*n),i=Math.floor(u),j=Math.floor(v),fu=f(u-i),fv=f(v-j),a=i%n,b=(i+1)%n,c=j%n,e=(j+1)%n;
    return L[c*n+a]*(1-fu)*(1-fv)+L[c*n+b]*fu*(1-fv)+L[e*n+a]*(1-fu)*fv+L[e*n+b]*fu*fv};
}
function gMake(seed,fn){
  const W=32,c=document.createElement('canvas');c.width=c.height=W;
  const g=c.getContext('2d'),img=g.createImageData(W,W),d=img.data,r=gRng(seed);
  const px=(x,y,col)=>{x=((x|0)%W+W)%W;y=((y|0)%W+W)%W;const i=(y*W+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255};
  const get=(x,y)=>{x=((x|0)%W+W)%W;y=((y|0)%W+W)%W;const i=(y*W+x)*4;return[d[i],d[i+1],d[i+2]]};
  const tone=(x,y,f)=>{const o=get(x,y);px(x,y,[Math.max(0,Math.min(255,o[0]*f|0)),Math.max(0,Math.min(255,o[1]*f|0)),Math.max(0,Math.min(255,o[2]*f|0))])};
  /* fill every pixel from a function of (x,y) */
  const fill=fx=>{for(let y=0;y<W;y++)for(let x=0;x<W;x++)px(x,y,fx(x,y))};
  /* a wandering line that wraps; calls dot(x,y,i) at each step */
  const walk=(x,y,len,ang,jit,dot)=>{for(let i=0;i<len;i++){dot(Math.round(x),Math.round(y),i);ang+=(r()-.5)*jit;x+=Math.cos(ang);y+=Math.sin(ang)}};
  /* an irregular blob: pixels where distance plus noise is under the radius */
  const blob=(cx,cy,rad,fnp)=>{const nz=gNoise(r,4);for(let y=-rad-2;y<=rad+2;y++)for(let x=-rad-2;x<=rad+2;x++){const dd=Math.hypot(x,y)+(nz((cx+x+32)%32,(cy+y+32)%32)-.5)*rad*.9;if(dd<rad)fnp(cx+x,cy+y,dd/rad)}};
  fn({px,get,tone,fill,walk,blob,r,W});
  g.putImageData(img,0,0);return c;
}
const GP={ink:hx('#151720'),a0:hx('#23272e'),a1:hx('#2b2f3a'),a2:hx('#343a47'),a3:hx('#3e4a5a'),a4:hx('#4a5262'),stone:hx('#5b6370'),
  s0:hx('#3c434c'),s1:hx('#4f5762'),s2:hx('#616a75'),s3:hx('#7a838e'),mortar:hx('#22252b'),
  w0:hx('#1d2f44'),w1:hx('#2e5272'),w2:hx('#5b86ad'),w3:hx('#aecbe6'),
  g0:hx('#1f3319'),g1:hx('#2a4222'),g2:hx('#36542b'),g3:hx('#4a6c38'),g4:hx('#628447'),
  m0:hx('#2d2018'),m1:hx('#44301f'),m2:hx('#5a4029'),m3:hx('#74553a'),
  p0:hx('#1b140d'),p1:hx('#4f3a24'),p2:hx('#6a4a2c'),p3:hx('#7f5d38'),p4:hx('#98744a'),
  al0:hx('#2c4524'),al1:hx('#3f6030'),al2:hx('#5d8040'),
  r0:hx('#2e2019'),r1:hx('#47301f'),r2:hx('#6a3c28'),r3:hx('#85502f'),iron:hx('#3c4048')};
const pick3=(t,a,b,c)=>t<.38?a:t<.7?b:c;
const GROUND_MAKERS={
  asphalt(v){return gMake(1000+v*7,({px,fill,r,blob,tone})=>{
    const n1=gNoise(r,4),n2=gNoise(r,8);
    fill((x,y)=>{const t=n1(x,y)*.6+n2(x,y)*.4;return pick3(t,GP.a1,GP.a2,GP.a1)});
    for(let i=0;i<150;i++){const x=r()*32,y=r()*32,q=r();px(x,y,q<.55?GP.a0:q<.9?GP.a3:GP.stone)}      /* grit */
    for(let i=0;i<7;i++){const x=r()*32,y=r()*32;px(x,y,GP.s0);if(r()<.5)px(x+1,y,GP.a4)}              /* stones */
    if(v===1){const x0=6+r()*8|0,y0=8+r()*8|0,w=14,h=11;for(let y=0;y<h;y++)for(let x=0;x<w;x++)tone(x0+x,y0+y,1.14);for(let x=0;x<w;x++){px(x0+x,y0,GP.a0);px(x0+x,y0+h,GP.a0)}for(let y=0;y<=h;y++){px(x0,y0+y,GP.a0);px(x0+w,y0+y,GP.a0)}}
    if(v===2){blob(10+r()*12|0,10+r()*12|0,6,(x,y,d)=>px(x,y,d<.55?GP.ink:GP.a0))}
  })},
  cracked(v){return gMake(2000+v*11,({px,fill,r,walk,get,tone})=>{
    const n1=gNoise(r,4);
    fill((x,y)=>{const t=n1(x,y);return t<.4?GP.a1:t<.75?GP.a2:GP.a1});
    for(let i=0;i<120;i++)px(r()*32,r()*32,r()<.6?GP.a0:GP.a3);
    const cracks=2+v;
    for(let c=0;c<cracks;c++){
      const sx=r()*32,sy=r()*32,ang=r()*6.28;
      walk(sx,sy,18+r()*20,ang,1.1,(x,y,i)=>{px(x,y,GP.ink);if(i%3===0)px(x+1,y+1,GP.a4);if(i%7===0){px(x+1,y,GP.a0);px(x,y+1,GP.a0)}
        if(i===8||i===16)walk(x,y,7+r()*9,ang+(r()<.5?1:-1)*(.7+r()*.5),1.3,(a,b)=>{px(a,b,GP.ink);if(r()<.35)px(a+1,b+1,GP.a4)})});
    }
    if(v===1)for(let i=0;i<10;i++){const x=r()*32,y=r()*32;px(x,y,GP.g1);px(x+1,y,GP.g0)}               /* weeds in the cracks */
  })},
  wet(v){return gMake(3000+v*13,({px,fill,r,blob,get})=>{
    const n1=gNoise(r,4);
    fill((x,y)=>{const t=n1(x,y);return t<.5?GP.a0:GP.a1});
    for(let i=0;i<70;i++)px(r()*32,r()*32,r()<.6?GP.ink:GP.a2);
    const n=1+(v?1:0);
    for(let k=0;k<n;k++){
      const cx=8+r()*16|0,cy=8+r()*16|0,rad=7+r()*4|0;
      blob(cx,cy,rad,(x,y,d)=>px(x,y,d<.45?GP.w1:d<.8?GP.w0:GP.a0));
      for(let i=0;i<4;i++){const y=cy-3+i*2+(r()*2|0),x=cx-4+(r()*5|0);for(let j=0;j<3+r()*5;j++)px(x+j,y,r()<.6?GP.w3:GP.w2)}   /* sky and lamp shine */
    }
    for(let i=0;i<6;i++){const x=r()*32|0,y=r()*32|0;px(x,y,GP.w2)}
  })},
  paving(v){return gMake(4000+v*17,({px,fill,r,blob,get,tone})=>{
    const n1=gNoise(r,4),n2=gNoise(r,8);
    fill((x,y)=>{const t=n1(x,y)*.5+n2(x,y)*.5;return pick3(t,GP.s0,GP.s1,GP.s2)});
    for(let i=0;i<110;i++)px(r()*32,r()*32,r()<.5?GP.s0:GP.s3);
    /* joints between four slabs, with a lit top-left edge on each slab */
    for(let i=0;i<32;i++){px(i,0,GP.mortar);px(0,i,GP.mortar);px(i,16,GP.mortar);px(16,i,GP.mortar);px(i,1,GP.s3);px(1,i,GP.s3);px(i,17,GP.s3);px(17,i,GP.s3)}
    /* chips and stains */
    for(let i=0;i<5;i++){const x=r()*32,y=r()*32;px(x,y,GP.mortar);px(x+1,y,GP.s0);px(x,y+1,GP.s0)}
    blob(r()*32|0,r()*32|0,5,(x,y,d)=>tone(x,y,.82));
    if(v>=1){for(let k=0;k<4;k++){const sx=(k%2)*16+1+r()*3,sy=(k>>1)*16+1+r()*3;for(let i=0;i<14;i++){px(sx+i*(r()<.5?1:0)+r()*2,sy+r()*2,r()<.6?GP.g1:GP.g2)}}}
    if(v===2){blob(r()*32|0,r()*32|0,4,(x,y,d)=>px(x,y,d<.6?GP.m0:GP.m1))}
  })},
  grass(v){return gMake(5000+v*19,({px,fill,r,blob})=>{
    const n1=gNoise(r,4),n2=gNoise(r,8);
    fill((x,y)=>{const t=n1(x,y)*.55+n2(x,y)*.45;return pick3(t,GP.g1,GP.g2,GP.g1)});
    for(let i=0;i<90;i++){const x=r()*32,y=r()*32,q=r();px(x,y,q<.5?GP.g0:q<.85?GP.g3:GP.g4);if(q>.55)px(x,y-1,GP.g3)}      /* blades */
    for(let i=0;i<2;i++){blob(r()*32|0,r()*32|0,2,(x,y,d)=>px(x,y,d<.6?GP.m1:GP.m0))}                                        /* worn earth */
    if(v===1)for(let i=0;i<4;i++){const x=r()*32,y=r()*32;px(x,y,hx('#d9b38c'));px(x+1,y,hx('#c9503a'))}
    for(let i=0;i<6;i++)px(r()*32,r()*32,GP.m2);
  })},
  mud(v){return gMake(6000+v*23,({px,fill,r,blob,walk})=>{
    const n1=gNoise(r,4),n2=gNoise(r,8);
    fill((x,y)=>{const t=n1(x,y)*.5+n2(x,y)*.5;return pick3(t,GP.m1,GP.m2,GP.m1)});
    for(let i=0;i<100;i++){px(r()*32,r()*32,r()<.6?GP.m0:GP.m3)}
    for(let i=0;i<2;i++){const x=6+r()*20|0,y=6+r()*20|0;blob(x,y,4,(a,b,d)=>px(a,b,d<.5?GP.m0:GP.m1));blob(x+1,y+1,4,(a,b,d)=>{if(d>.8)px(a,b,GP.m3)})}   /* prints */
    if(v===1){blob(16,16,6,(x,y,d)=>px(x,y,d<.5?GP.w1:GP.w0));for(let i=0;i<4;i++)px(13+i,14,GP.w3)}
    if(v===2){const y0=r()*28|0;for(let i=0;i<32;i++){px(i,y0,GP.m0);px(i,y0+1,GP.m3)}}                                         /* a cart rut */
  })},
  planks(v){return gMake(7000+v*29,({px,fill,r,tone,blob})=>{
    const cols=[GP.p2,GP.p3,GP.p2,GP.p1];
    const off=[r()*10|0,r()*10|0,r()*10|0,r()*10|0];
    for(let k=0;k<4;k++){const y0=k*8,base=cols[(k+v)%4];
      for(let y=0;y<8;y++)for(let x=0;x<32;x++){let c=base;if(y===0)c=GP.p0;else if(y===1)c=GP.p4;else if(y===7)c=GP.p1;px(x,y0+y,c)}
      for(let i=0;i<9;i++){const x=r()*32|0,y=y0+2+(r()*5|0);for(let j=0;j<2+r()*5;j++)px(x+j,y,r()<.6?GP.p1:GP.p3)}      /* grain */
      const jx=(off[k]+16*k)%32;for(let y=0;y<8;y++)px(jx,y0+y,GP.p0);                                                    /* plank end */
      for(const nx of [jx+2,jx-2]){px(nx,y0+3,GP.iron);px(nx,y0+2,GP.p4)}                                                  /* nails */
    }
    if(v>=1){blob(r()*32|0,r()*32|0,7,(x,y,d)=>px(x,y,d<.5?GP.al1:GP.al0));blob(r()*32|0,r()*32|0,5,(x,y,d)=>px(x,y,d<.6?GP.al2:GP.al1));
      for(let i=0;i<40;i++){const x=r()*32,y=r()*32;px(x,y,GP.al0)}}
    for(let i=0;i<3;i++)blob(r()*32|0,r()*32|0,3,(x,y,d)=>tone(x,y,.78));
  })},
  cobbles(v){return gMake(8000+v*31,({px,get,fill,r})=>{
    /* nearest of a jittered 4x4 set of seeds, with wrapping, gives stones */
    const S=[];for(let j=0;j<4;j++)for(let i=0;i<4;i++)S.push([i*8+2+r()*4,j*8+2+r()*4,r()]);
    const id=(x,y)=>{let b=0,bd=1e9;for(let k=0;k<S.length;k++){let dx=Math.abs(x-S[k][0]),dy=Math.abs(y-S[k][1]);dx=Math.min(dx,32-dx);dy=Math.min(dy,32-dy);const d=dx*dx+dy*dy;if(d<bd){bd=d;b=k}}return b};
    const grid=[];for(let y=0;y<32;y++){grid.push([]);for(let x=0;x<32;x++)grid[y].push(id(x,y))}
    const tones=[GP.s0,GP.s1,GP.s2,hx('#4a463c'),GP.s1];
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      const k=grid[y][x],e=(a,b)=>grid[(y+b+32)%32][(x+a+32)%32]!==k;
      let c=tones[(S[k][2]*5|0)%5];
      if(e(1,0)||e(0,1)||e(1,1))c=GP.mortar;else if(e(-1,0)||e(0,-1))c=GP.s2;
      px(x,y,c);
    }
    for(let i=0;i<50;i++){const x=r()*32|0,y=r()*32|0;px(x,y,r()<.5?GP.s0:GP.s2)}
    if(v>=1)for(let i=0;i<10;i++){const x=r()*32|0,y=r()*32|0;if(get(x,y)[0]<50)px(x,y,GP.g1)}   /* moss in the joints */
  })},
  rust(v){return gMake(9000+v*37,({px,fill,r,blob})=>{
    const n1=gNoise(r,4),n2=gNoise(r,8);
    fill((x,y)=>{const t=n1(x,y)*.5+n2(x,y)*.5;return t<.35?GP.iron:t<.6?GP.r1:t<.8?GP.r2:GP.r3});
    for(let y=0;y<32;y+=8)for(let x=0;x<32;x+=8){px(x+((y/8)%2)*4+2,y+3,GP.r0);px(x+((y/8)%2)*4+3,y+4,GP.r0)}   /* tread marks */
    for(let i=0;i<90;i++)px(r()*32,r()*32,r()<.5?GP.r0:GP.r3);
    for(const [x,y] of [[2,2],[29,2],[2,29],[29,29]]){px(x,y,GP.ink);px(x-1,y-1,GP.s2)}                            /* rivets */
    for(let i=0;i<4;i++){const x=r()*32|0,y=r()*20|0;for(let j=0;j<8+r()*10;j++)px(x,y+j,GP.r2)}                       /* run-off streaks */
  })},
};
/* drain: asphalt with a cast grating in the middle */
GROUND_MAKERS.drain=function(v){
  const base=GROUND_MAKERS.asphalt(0),c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.drawImage(base,0,0);
  g.fillStyle='#15171d';g.fillRect(8,9,16,14);g.fillStyle='#4a5262';g.fillRect(9,10,14,12);g.fillStyle='#15171d';
  for(let i=0;i<5;i++)g.fillRect(10+i*3,11,1,10);
  g.fillStyle='#6a7480';g.fillRect(9,10,14,1);g.fillStyle='#2a2d33';g.fillRect(9,21,14,1);
  return c;
};
/* the Neon Mile's own road: dark, glossy asphalt; variant 1 and 2 carry a pink or cyan reflection from the signs, 3 is a shallow puddle full of neon */
GROUND_MAKERS.neon=function(v){return gMake(10000+v*41,({px,fill,r,blob})=>{
  const n1=gNoise(r,4),D0=hx('#17181f'),D1=hx('#1d1e27'),D2=hx('#24252f');
  fill((x,y)=>{const t=n1(x,y);return t<.35?D0:t<.75?D1:D2});
  for(let i=0;i<60;i++)px(r()*32,r()*32,r()<.6?hx('#121318'):hx('#2c2d38'));
  const streak=(y,x,len,outer,core)=>{for(let j=0;j<len;j++){const c=j===0||j===len-1?outer:core;px(x+j,y,c);if(j>0&&j<len-1&&r()<.4)px(x+j,y+1,outer)}};
  const PINK=[hx('#3e1f3c'),hx('#a5407a')],CYAN=[hx('#1b3442'),hx('#3a95b4')];
  if(v===1||v===2){const C=v===1?PINK:CYAN,y0=6+r()*18|0,x0=r()*20|0;for(let k=0;k<3;k++)streak(y0+k*3,x0+(r()*4|0),3+(r()*6|0),C[0],C[1])}
  if(v===3){blob(16,16,9,(x,y,d)=>px(x,y,d<.8?hx('#0f1016'):D0));
    for(let k=0;k<3;k++){const C=k%2?CYAN:PINK;streak(12+k*3,10+(r()*6|0),4+(r()*5|0),C[0],C[1])}}
})};
/* tilled soil for farm plots: furrows running across, ridges catching the light, clods */
GROUND_MAKERS.tilled=function(v){return gMake(11000+v*43,({px,fill,r})=>{
  const n1=gNoise(r,8);
  fill((x,y)=>{const row=y%4;if(row===0)return GP.m0;if(row===1)return GP.m3;const t=n1(x,y);return t<.5?GP.m1:GP.m2});
  for(let i=0;i<70;i++){const x=r()*32,y=r()*32;px(x,y,r()<.5?GP.m0:GP.m3)}
  for(let i=0;i<8;i++){const x=r()*32|0,y=(r()*8|0)*4+2;px(x,y,GP.m3);px(x+1,y,GP.m2)}
})};
/* harbour water: the same deep base for every frame (so it does not flicker) and glints that move between frames */
GROUND_MAKERS.water=function(v){
  const base=gMake(12000,({fill,r,px})=>{const n1=gNoise(r,4),n2=gNoise(r,8),W0=hx('#1d4259'),W1=hx('#24506b'),W2=hx('#2b5c78');
    fill((x,y)=>{const t=n1(x,y)*.6+n2(x,y)*.4;return t<.4?W0:t<.72?W1:W2});
    for(let i=0;i<10;i++){const x=r()*32|0,y=r()*32|0;for(let j=0;j<4+r()*5;j++)px(x+j,y,hx('#1a3a50'))}});
  return gMake(12100+v*47,({px,r,get})=>{
    const g=base.getContext('2d').getImageData(0,0,32,32).data;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4;px(x,y,[g[i],g[i+1],g[i+2]])}
    for(let i=0;i<9;i++){const x=r()*32|0,y=r()*32|0,len=2+(r()*5|0);for(let j=0;j<len;j++)px(x+j,y,j===0||j===len-1?hx('#3d7090'):hx('#6fa6c4'))}
  });
};
const GROUND_CACHE={};
function groundTile(kind,v){const k=kind+':'+(v|0);return GROUND_CACHE[k]||(GROUND_CACHE[k]=GROUND_MAKERS[kind](v|0))}
/* which generated tile a map tile gets: [kind, variant], chosen from where it is so each district keeps its own character */
function groundPick(kind,tx,ty,d){
  const h=hash(tx,ty),v3=h%3;
  if(kind==='road'){
    if(d==='Greenbelt')return['mud',h%11===0?1:h%2?0:2];
    if(d==='Neon Mile'){const k=h%14;return['neon',k===0?3:k<3?1:k<5?2:0]}
    if(h%47===0)return['drain',0];
    const a=[0,0,0,1,0,2][h%6];
    if(d==='Foundry Row')return h%10<4?['cracked',v3]:['asphalt',a];
    if(d==='Dockside')return h%10<3?['cracked',v3]:h%12===5?['wet',v3]:['asphalt',a];
    if(d==='Grid')return h%9===0?['cracked',v3]:['asphalt',a];
    return['asphalt',a];
  }
  if(kind==='farm')return['tilled',h%2];
  if(kind==='water')return['water',(Math.floor(performance.now()/900)+h%3)%3];
  if(kind==='plaza')return['paving',d==='Highline'?(h%4===0?1:0):v3];
  if(kind==='dock'){const low=typeof tideV==='function'&&tideV()<-.2;return['planks',low?1+h%2:(h%5===0?1:0)]}
  if(kind==='lot')return d==='Foundry Row'&&h%3===0?['rust',h%2]:['cobbles',v3];
  if(kind==='ground'){
    if(d==='Neon Mile')return['paving',h%2];
    if(d==='Foundry Row')return h%7===0?['rust',h%2]:['paving',h%3===0?2:0];
    return['grass',v3];
  }
  return null;
}
/* a little of each district's own colour over the tile, so the districts still read differently */
const GROUND_TINT={road:{Highline:.12,Grid:.08,Dockside:.12,'Neon Mile':.06,'Foundry Row':.12},ground:{Highline:.1,Grid:.08,Dockside:.14,Greenbelt:.12}};
function drawGround(kind,tx,ty,sx,sy,d){
  if(RS<2)return false;
  const sel=groundPick(kind,tx,ty,d);if(!sel)return false;
  const x=Math.round(sx),y=Math.round(sy);
  cx.imageSmoothingEnabled=false;
  cx.drawImage(groundTile(sel[0],sel[1]),x,y,TS,TS);
  const t=GROUND_TINT[kind];
  if(t&&t[d]&&sel[0]!=='mud'){cx.globalAlpha=t[d];cx.fillStyle=kind==='road'?ROADC[d]:GROUND[d];cx.fillRect(x,y,TS,TS);cx.globalAlpha=1}
  return true;
}
