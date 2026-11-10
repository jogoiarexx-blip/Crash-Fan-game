const fs=require('fs'),vm=require('vm'),path=require('path');
process.chdir(path.join(__dirname,'..'));
class FakeImage{constructor(){this.complete=false;this.naturalWidth=256;this.naturalHeight=256;this.width=256;this.height=256}set src(v){this._src=v;if(!v)return;this.complete=true;queueMicrotask(()=>this.onload?.())}}
class FakeAudio{constructor(){this.paused=true;this.listeners={}}addEventListener(n,fn){(this.listeners[n]??=[]).push(fn)}removeEventListener(){}removeAttribute(){}load(){queueMicrotask(()=>this.listeners.loadeddata?.forEach(fn=>fn()))}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const el=id=>({id,width:960,height:540,style:{},classList:{toggle(){},add(){},remove(){}},dataset:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),querySelectorAll:()=>[],closest:()=>null,addEventListener(){},setPointerCapture(){}});
const elements=new Map(['game','touch-controls','touch-joystick','joystick-knob','help'].map(id=>[id,el(id)]));
Object.assign(global,{window:global,Image:FakeImage,HTMLImageElement:FakeImage,Audio:FakeAudio,HTMLAudioElement:FakeAudio,performance:{now:()=>Date.now()},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{hidden:false,getElementById:id=>elements.get(id)||el(id),addEventListener(){}},matchMedia:()=>({matches:false}),addEventListener:()=>{},requestAnimationFrame:()=>0});
Object.defineProperty(global,'navigator',{value:{getGamepads:()=>[],maxTouchPoints:0},configurable:true});
for(const file of ['js/jungle-phase.js','js/level-loader.js','js/final-boss.js','js/game.js'])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});


const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await wait(25);await global.__crashDebug.loadLevel(10);
 global.__crashDebug.qaSkipIntro();
 const events=[],last={hp:9,deaths:0};let s;
 for(let tick=0;tick<7500;tick++){
  s=global.__crashDebug.qaSnapshot();
  if(s.state==='win'||s.state==='gameover'||s.state==='results')break;
  if(s.boss.hp<last.hp){events.push({tick,event:'boss-hit',hp:s.boss.hp,x:Math.round(s.player.x),lives:s.progress.lives});last.hp=s.boss.hp}
  if(s.progress.deaths>last.deaths){events.push({tick,event:'player-death',hp:s.boss.hp,x:Math.round(s.player.x),lives:s.progress.lives});last.deaths=s.progress.deaths}
  const p=s.player,b=s.boss,target=b.vulnerable>.04?682:657;
  const right=p.x<target-5,left=p.x>target+5;
  const spin=b.vulnerable>.06&&p.x>658&&p.spin<.08&&tick%2===0;
  const wave=b.waves.some(q=>q.x+q.w>p.x-8&&q.x<p.x+220);
  const gem=b.projectiles.some(q=>q.x>p.x+10&&q.x<p.x+245&&q.y>p.y-160);
  const floor=b.hazards.some(q=>p.x+p.w>q.x-16&&p.x<q.x+q.w+16&&q.warning<.45&&q.t>0);
  const earlySlam=b.attack==='slam'&&b.attackTime>.61&&b.attackTime<.70;
  // Rajadas de gemas miram na posição do jogador no instante do disparo: esquiva após o lançamento.
  const earlyGem=false;
  const jump=p.on&&(earlySlam||earlyGem||wave||gem||floor)&&tick%2===0;
  global.__crashDebug.qaStep(1,{left,right,jump,spin});
 }
 s=global.__crashDebug.qaSnapshot();
 console.log('BOSS_AUTOPLAY_PROBE',JSON.stringify({state:s.state,hp:s.boss.hp,lives:s.progress.lives,deaths:s.progress.deaths,ticks:events.length,events:events.slice(0,30),player:s.player}));
})().catch(e=>{console.error('BOSS_QA_FAILURE',e);process.exitCode=1});
