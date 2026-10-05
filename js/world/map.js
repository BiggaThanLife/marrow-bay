"use strict";
/* Tile map, districts, roads, buildings (POIS), tram stops. */
/* ================= WORLD ================= */
const TS=16,VW=176,W=64,H=38;
let VH=200;
const T={WATER:0,ROAD:1,BLD:2,GRASS:3,FARM:4,PLAZA:5,DOCK:6,LOT:7,PARK:8};
const PASSABLE=new Set([1,3,4,5,6,7,8]);
const XS=[10,15,20,25,30,35,40,45,50,55,60],HY=[2,7,12,17,22,27,32];
const district=(x,y)=>x<10?'Greenbelt':x>=41?(y<22?'Neon Mile':'Foundry Row'):y<12?'Highline':(y>=28||(x>=31&&y>=23))?'Dockside':'Grid';
const isWater=(x,y)=>x>=61||y>=34||(x>=41&&x<=44);
const map=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>{
  if(isWater(x,y))return T.WATER;
  if(y===33&&((x>=10&&x<=40)||(x>=45&&x<=60)))return T.DOCK;
  return T.GRASS;
}));
XS.forEach(x=>{for(let y=0;y<=32;y++)map[y][x]=T.ROAD});
HY.forEach(y=>{for(let x=10;x<=60;x++){if(x>=41&&x<=44&&y!==17&&y!==27)continue;map[y][x]=T.ROAD}});
[17,27].forEach(y=>{for(let x=0;x<10;x++)map[y][x]=T.ROAD});
const FARM_TILES=[];
[19,21].forEach(y=>{for(let x=2;x<=7;x++){map[y][x]=T.FARM;FARM_TILES.push([x,y])}});

const POIS={},blocks=[];
function fill(x,y,t){for(let j=0;j<4;j++)for(let i=0;i<4;i++)map[y+j][x+i]=t}
function addPOI(id,name,kind,bx,by){
  blocks.push({x:bx,y:by,kind,poi:id,key:bx+','+by});
  POIS[id]={id,name,kind,d:district(bx+1,by+1),ex:bx+1,ey:by+4,bx,by};
  fill(bx,by,T.BLD);
}
const SPEC={
 '1,0':['estate','Ashgrove Estate'],'2,0':['bank','Marrow Bank'],'3,1':['club','The Gilded Tide'],'0,1':['flats','Terrace Flats'],
 '0,2':['realty',"Lou's Realty"],'1,2':['market','Market Hall'],'2,2':['plaza'],'3,2':['diner',"Teo's Diner"],'4,2':['studio','Studio Row'],
 '0,3':['workshop','Tinker Works'],'1,3':['lot'],'2,3':['clinic','Bell Clinic'],'4,3':['lot'],
 '4,4':['dock','Dock Office'],'5,4':['bunk','Bunkhouse'],'3,5':['gull','The Rusty Gull'],'1,5':['lot'],'4,5':['lot'],
 '7,0':['casino','Lucky Tide Casino'],'8,1':['velvet','The Velvet Room'],'9,0':['pawn','Pawn and Loan'],'7,2':['loft','Neon Lofts'],
 '7,4':['garage',"Mack's Garage"],'8,4':['foundry','Iron Works'],
 '4,1':['barber','Clip Joint'],'5,2':['tailor','Hand-Me-Ups']
};
[0,1,2,3,4,5,7,8,9].forEach(cx=>{for(let cy=0;cy<6;cy++){
  const bx=11+5*cx,by=3+5*cy,s=SPEC[cx+','+cy],d=district(bx+1,by+1);
  if(s){
    if(s[0]==='plaza')fill(bx,by,T.PLAZA);
    else if(s[0]==='lot')fill(bx,by,T.LOT);
    else addPOI(s[0],s[1],s[0],bx,by);
  }else if(cx<=5&&cy<=1&&(cx+cy)%3===0)fill(bx,by,T.PARK);
  else{blocks.push({x:bx,y:by,kind:(d==='Dockside'||d==='Foundry Row')?'warehouse':'tower',poi:null,key:bx+','+by});fill(bx,by,T.BLD)}
}});
addPOI('barn','Briar Barn','barn',2,11);
[[4,3],[4,28]].forEach(([x,y])=>{blocks.push({x,y,kind:'farmstead',poi:null,key:x+','+y});fill(x,y,T.BLD)});
POIS.plaza={id:'plaza',name:'Central Plaza',kind:'plaza',d:'Grid',ex:22,ey:15};
const blockByKey=k=>blocks.find(b=>b.key===k);
const STOPS=[
 {id:0,name:'Greenbelt Gate',x:9,y:17},{id:1,name:'Terrace Lift',x:20,y:7},{id:2,name:'Central Station',x:20,y:17},
 {id:3,name:'Dockside Stop',x:35,y:27},{id:4,name:'Neon Mile Stop',x:50,y:17},{id:5,name:'Foundry Stop',x:50,y:27}
];
