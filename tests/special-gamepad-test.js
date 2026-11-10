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
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const assert=require('node:assert/strict');
const mockPad={connected:true,id:'Xbox QA controller',axes:[0,0],buttons:Array.from({length:18},()=>({pressed:false}))};
global.navigator.getGamepads=()=>[mockPad];
(async()=>{
 await wait(30);
 for(const level of [6,7,8,9]){
   mockPad.axes[0]=0;mockPad.buttons[0].pressed=false;
   const initial=await global.__crashDebug.loadLevel(level);
   const course=global.__crashDebug.getSpecialCourse();
   const expectedMode=[6,8].includes(level)?'avalanche':'ride';
   assert.equal(course.mode,expectedMode,'modo errado na fase '+level);
   assert.equal(course.obstacles.length,expectedMode==='ride'?24:22,'quantidade de obstáculos da fase '+level);
   assert(course.length>=6000&&course.checkpoint>2500&&course.checkpoint<course.length,'distâncias inválidas '+level);
   const last=course.obstacles[course.obstacles.length-1];
   assert(last.z<course.length,'último obstáculo deve preceder a chegada '+level);
   course.obstacles.forEach((o,i)=>{
     assert(Number.isFinite(o.z)&&[-1,0,1].includes(o.lane),'posição inválida fase '+level+', obstáculo '+i);
     assert(['fruit','rock','crate','ice'].includes(o.type),'tipo desconhecido fase '+level+', obstáculo '+i);
     if(i)assert(o.z-course.obstacles[i-1].z>=250,'obstáculos juntos demais fase '+level+', obstáculo '+i);
   });
   mockPad.axes[0]=1;
   const moved=global.__crashDebug.testSpecialPadStep(1/60);
   const lane=expectedMode==='ride'?moved.special.rideLane:moved.special.avalancheLane;
   assert(lane>.05,'direcional do gamepad não move fase '+level+' (lane='+lane+')');
   mockPad.axes[0]=0;mockPad.buttons[0].pressed=true;
   const jumped=global.__crashDebug.testSpecialPadStep(1/60);
   const air=expectedMode==='ride'?jumped.special.rideAir:jumped.special.avalancheAir;
   assert(air>0,'botão de pulo do gamepad falhou fase '+level+' (air='+air+')');
   mockPad.buttons[0].pressed=false;
   console.log('SPECIAL_PAD_OK',JSON.stringify({level,mode:course.mode,obstacles:course.obstacles.length,firstZ:course.obstacles[0].z,lastZ:last.z,courseLength:course.length,lane,air}));
 }
 console.log('SPECIAL_GAMEPAD_PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
