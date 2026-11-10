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


const assert=require('node:assert/strict');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await wait(25);await global.__crashDebug.loadLevel(10);
 global.__crashDebug.qaSkipIntro();
 const events=[],last={hp:9,deaths:0};let s;
 for(let tick=0;tick<7500;tick++){
  s=global.__crashDebug.qaSnapshot();
  if(s.state==='win'||s.state==='gameover'||s.state==='results')break;
  if(s.boss.hp<last.hp){events.push({tick,event:'boss-hit',hp:s.boss.hp,x:Math.round(s.player.x),lives:s.progress.lives});last.hp=s.boss.hp}
  if(s.progress.deaths>last.deaths){events.push({tick,event:'player-death',hp:s.boss.hp,x:Math.round(s.player.x),y:Math.round(s.player.y),kind:s.deathKind,attack:s.boss.attack,attackTime:+s.boss.attackTime.toFixed(2),hazards:s.boss.hazards.map(q=>({x:q.x,w:q.w,t:+q.t.toFixed(2)})),lives:s.progress.lives});last.deaths=s.progress.deaths}
  const p=s.player,b=s.boss;
  // Fogo e gelo são colunas altas: a única defesa confiável é sair lateralmente
  // da faixa marcada durante os 0,62 s de aviso, não saltar através dela.
  const imminent=b.hazards.filter(q=>q.t>0);
  const candidates=[220,300,380,450,505,555,610,655,676];
  const clear=c=>imminent.every(q=>c+46<q.x-18||c>q.x+q.w+18);
  const valid=candidates.filter(clear);
  const safe=valid.sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x))[0];
  const target=imminent.length&&safe!=null?safe:b.vulnerable>.04?682:657;
  const right=p.x<target-5,left=p.x>target+5;
  const incoming=b.projectiles.some(q=>q.t>0&&q.vx<0&&q.x>p.x+34&&q.x<p.x+160&&q.y>p.y-90&&q.y<p.y+p.h+50);
  const spin=(incoming||b.vulnerable>.06&&p.x>658)&&p.spin<.08&&tick%2===0;
  const wave=b.waves.some(q=>q.x+q.w>p.x-8&&q.x<p.x+220);
  const gem=b.projectiles.some(q=>q.x>p.x+10&&q.x<p.x+245&&q.y>p.y-160);
  const floor=false; // Colunas de gelo/fogo não podem ser evitadas com um salto comum.
  const earlySlam=b.attack==='slam'&&b.attackTime>.61&&b.attackTime<.70;
  // Rajadas de gemas miram na posição do jogador no instante do disparo: esquiva após o lançamento.
  const earlyGem=false;
  const jump=p.on&&(earlySlam||earlyGem||wave||gem||floor)&&tick%2===0;
  global.__crashDebug.qaStep(1,{left,right,jump,spin});
 }
 s=global.__crashDebug.qaSnapshot();
 console.log('BOSS_AUTOPLAY_PROBE',JSON.stringify({state:s.state,hp:s.boss.hp,lives:s.progress.lives,deaths:s.progress.deaths,ticks:events.length,events:events.slice(0,30),player:s.player}));
 assert.equal(s.state,'win','Guardião deve chegar à tela de vitória');
 assert.equal(s.boss.hp,0,'Guardião deve ser derrotado até o último HP');
 assert.equal(s.progress.deaths,0,'Percurso certificado não pode perder vidas');
 assert.equal(events.filter(e=>e.event==='boss-hit').length,9,'Devem ocorrer os nove acertos de verdade');
 assert.equal(events.filter(e=>e.event==='player-death').length,0,'Não pode haver morte silenciosa');
 console.log('BOSS_COMPLETE_CERTIFIED 9/9 golpes, 3 fases, 0 mortes, tela de vitória');
})().catch(e=>{console.error('BOSS_QA_FAILURE',e);process.exitCode=1});
