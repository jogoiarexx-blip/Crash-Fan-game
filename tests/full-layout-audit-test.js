const fs=require('fs'),vm=require('vm'),path=require('path');
process.chdir(path.join(__dirname,'..'));
class FakeImage{constructor(){this.complete=false;this.naturalWidth=256;this.naturalHeight=256;this.width=256;this.height=256}set src(v){this._src=v;if(!v)return;this.complete=true;queueMicrotask(()=>this.onload?.())}}
class FakeAudio{constructor(){this.paused=true;this.listeners={}}addEventListener(n,fn){(this.listeners[n]??=[]).push(fn)}removeEventListener(){}removeAttribute(){}load(){queueMicrotask(()=>this.listeners.loadeddata?.forEach(fn=>fn()))}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const el=id=>({id,style:{},classList:{toggle(){},add(){},remove(){}},dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),querySelectorAll:()=>[],closest:()=>null,addEventListener(){},setPointerCapture(){}});
const elements=new Map(['game','touch-controls','touch-joystick','joystick-knob','help'].map(id=>[id,el(id)]));
Object.assign(global,{window:global,Image:FakeImage,HTMLImageElement:FakeImage,Audio:FakeAudio,HTMLAudioElement:FakeAudio,performance:{now:()=>Date.now()},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{hidden:false,getElementById:id=>elements.get(id)||el(id),addEventListener(){}},matchMedia:()=>({matches:false}),addEventListener:()=>{},requestAnimationFrame:()=>0});
Object.defineProperty(global,'navigator',{value:{getGamepads:()=>[],maxTouchPoints:0},configurable:true});
for(const file of ['js/jungle-phase.js','js/level-loader.js','js/final-boss.js','js/game.js'])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});
// Auditoria geométrica de todas as fases, com classificação de anomalias.
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const hits=(a,b,epsilon=0)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>epsilon&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>epsilon;
const toRect=p=>({x:p[0],y:p[1],w:p[2],h:p[3]});
function support(o,layout,objects){
 const foot=o.y+o.h;
 if(layout.platforms.some(p=>Math.abs(foot-p[1])<=4&&Math.min(o.x+o.w,p[0]+p[2])-Math.max(o.x,p[0])>=Math.min(24,o.w*.4)))return true;
 if(objects.some(other=>other!==o&&Math.abs(foot-other.y)<=4&&Math.min(o.x+o.w,other.x+other.w)-Math.max(o.x,other.x)>=Math.min(24,o.w*.4)))return true;
 return false;
}
(async()=>{
 await wait(30);
 const errors=[],warnings=[],report=[];
 const warn=(level,type,details)=>warnings.push({level,type,...details});
 const error=(level,type,details)=>errors.push({level,type,...details});
 for(let level=1;level<=10;level++){
  const current=await global.__crashDebug.loadLevel(level);
  const layout=global.__crashDebug.getLayout(),all=[...layout.boxes.map(o=>({...o,source:'box'})),...layout.tnts.map(o=>({...o,source:'tnt'}))];
  const mode=current.levelMode;
  const row={level,mode,platforms:layout.platforms.length,boxes:layout.boxes.length,tnts:layout.tnts.length,enemies:layout.enemies.length,fruits:layout.fruits.length};
  if(level<=5){
   for(let i=0;i<all.length;i++){
    const a=all[i];
    if(![a.x,a.y,a.w,a.h].every(Number.isFinite))error(level,'non-finite-crate',{index:i,rect:a});
    if(a.x<0||a.x+a.w>5600||a.y<-100||a.y+a.h>540)error(level,'out-of-world-crate',{index:i,rect:a});
    for(let j=i+1;j<all.length;j++)if(hits(a,all[j],1))error(level,'overlapping-crates',{indices:[i,j],first:a,second:all[j]});
    if(hits(a,layout.checkpoint,1))error(level,'checkpoint-overlap',{index:i,rect:a});
    if(!support(a,layout,all))warn(level,'unsupported-crate',{index:i,rect:a});
    for(let j=0;j<layout.platforms.length;j++)if(hits(a,toRect(layout.platforms[j]),5))warn(level,'crate-inside-platform',{index:i,platform:j});
   }
   const cp=layout.checkpoint;
   if(!support(cp,layout.platforms,[]) && !layout.platforms.some(p=>Math.abs(cp.y+cp.h-p[1])<=4&&cp.x+cp.w>p[0]&&cp.x<p[0]+p[2]))error(level,'unsupported-checkpoint',{rect:cp});
   for(const e of layout.enemies){
    if(e.a>e.b||e.x<e.a-2||e.x>e.b+2)error(level,'invalid-patrol',{enemy:e});
    if(!['mosquito','emberBat'].includes(e.type)&&!support(e,layout,all))warn(level,'enemy-off-support',{enemy:e});
   }
   const exit=layout.portal;
   if(!layout.platforms.some(p=>Math.abs(p[1]-455)<=5&&exit.x+exit.w>p[0]&&exit.x<p[0]+p[2]))warn(level,'portal-not-over-ground',{portal:exit});
  }
  report.push(row);
 }
 console.log('FULL_LAYOUT_SUMMARY',JSON.stringify(report));
 for(const w of warnings)console.log('AUDIT_WARNING',JSON.stringify(w));
 for(const e of errors)console.error('AUDIT_ERROR',JSON.stringify(e));
 console.log('FULL_LAYOUT_COUNTS',JSON.stringify({warnings:warnings.length,errors:errors.length}));
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
