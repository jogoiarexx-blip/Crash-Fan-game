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
function layoutHazards(layout){
 const dangerous=layout.hazards.filter(h=>['pit','spikes','iceSpike','poison'].includes(h.type)).map(h=>({x:h.x,w:h.w,kind:h.type}));
 const surface=layout.platforms.filter(p=>p[1]>=450&&p[1]<=458).sort((a,b)=>a[0]-b[0]);
 for(const p of surface){const end=p[0]+p[2],next=surface.find(q=>q[0]>end+5);if(next){const gap=next[0]-end;if(gap>45&&gap<280&&!dangerous.some(h=>Math.abs(h.x-end)<15))dangerous.push({x:end,w:gap,kind:'gap'})}}
 return dangerous.sort((a,b)=>a.x-b.x);
}
function controlsForPlatform(s,layout,clock,stall=0){
 const p=s.player,foot=p.y+p.h,ground=foot>435&&foot<470;
 const hazards=layoutHazards(layout);
 const next=hazards.find(h=>h.x+h.w>=p.x+8&&h.x<=p.x+260);
 const box=layout.boxes.find(b=>b.y+b.h>p.y+10&&b.y<p.y+p.h+18&&b.x>p.x&&b.x<p.x+135);
 const tnt=layout.tnts.find(b=>b.y+b.h>p.y-15&&b.y<p.y+p.h+30&&b.x>p.x&&b.x<p.x+170);
 const enemy=layout.enemies.find(e=>e.y+e.h>p.y+20&&e.y<p.y+p.h+25&&e.x>p.x&&e.x<p.x+120);
 const step=layout.platforms.filter(q=>q[1]<foot-8&&q[1]>foot-115&&q[0]-p.x>20&&q[0]-p.x<108).sort((a,b)=>a[0]-b[0])[0];
 let jump=false,spin=false;
 if(p.on&&next&&ground&&next.x-p.x<76&&next.x-p.x>-8)jump=true;
 if(p.on&&tnt&&tnt.x-p.x>15&&tnt.x-p.x<45)jump=true;
 if(p.on&&step&&step[0]-p.x<42)jump=true;
 if(p.on&&stall>13&&stall%32===16)jump=true;
 if(p.on&&box&&box.x-p.x<80&&box.x-p.x>0)spin=clock%34<23;
 if(enemy&&enemy.x-p.x<95)spin=clock%32<24;
 if(clock%64<34)spin=true;
 const portalBeyond=p.x>layout.portal.x+layout.portal.w-105;
 return {right:!portalBeyond,left:portalBeyond,jump,spin};
}
async function probePlatform(level){
 const start=await global.__crashDebug.loadLevel(level);global.__crashDebug.qaSkipIntro();
 const layout=global.__crashDebug.getLayout(),hazards=layoutHazards(layout);
 let maxX=0,lastX=start.player.x,stall=0,events=[],lastDeaths=0,state=null,fallLogged=false,dropReported=false;
 for(let tick=0;tick<4200;tick++){
  const s=global.__crashDebug.qaSnapshot();
  if(s.state==='results'||s.state==='gameover'||s.state==='win'){state=s;break}
  if(s.player.x>maxX)maxX=s.player.x;
  if(Math.abs(s.player.x-lastX)<.3)stall++;else stall=0;
  lastX=s.player.x;
  if(!dropReported&&s.player.y+s.player.h>480){dropReported=true;events.push({tick,event:'BELOW_GROUND',x:+s.player.x.toFixed(1),y:+s.player.y.toFixed(1),vy:+s.player.vy.toFixed(1)})}
  if(!fallLogged&&s.player.y>720){fallLogged=true;events.push({tick,event:'BELOW_WORLD',x:+s.player.x.toFixed(1),y:+s.player.y.toFixed(1),portalSeq:s.portalSeq,deathAnim:s.deathAnim,deaths:s.progress.deaths,mode:s.mode})}
  if(s.progress.deaths>lastDeaths){lastDeaths=s.progress.deaths;events.push({tick,event:'death',kind:s.deathKind,x:+s.player.x.toFixed(1),y:+s.player.y.toFixed(1),vy:+s.player.vy.toFixed(1),maxX:+maxX.toFixed(1)})}
  if(stall===130){events.push({tick,event:'stalled',x:+s.player.x.toFixed(1),y:+s.player.y.toFixed(1),vy:+s.player.vy.toFixed(1),on:s.player.on,near:layout.platforms.filter(q=>Math.abs(q[0]-s.player.x)<120||Math.abs(q[0]+q[2]-s.player.x)<100).slice(0,3)})}
  const input=controlsForPlatform(s,layout,tick,stall);
  global.__crashDebug.qaStep(1,input);
 }
 state=state||global.__crashDebug.qaSnapshot();
 console.log('PLATFORM_ROUTE_PROBE',JSON.stringify({level,result:state.state,maxX:Math.round(maxX),x:Math.round(state.player.x),y:Math.round(state.player.y),on:state.player.on,portalSeq:state.portalSeq,portal:layout.portal,deaths:state.progress.deaths,lives:state.progress.lives,checkpoint:state.progress.checkpointActivated,events,supports:layout.platforms.filter(q=>q[0]+q[2]>layout.portal.x-150&&q[0]<layout.portal.x+250).slice(0,10),hazards:hazards.length}));
 return state;
}
async function probeSpecial(level){
 await global.__crashDebug.loadLevel(level);global.__crashDebug.qaSkipIntro();
 const course=global.__crashDebug.getSpecialCourse();
 let currentAction='',state=null,moves=0,jumps=0,logs=[];
 for(let tick=0;tick<3000;tick++){
  const s=global.__crashDebug.qaSnapshot();
  if(s.state!=='play'){state=s;break}
  const c=s.course,distance=c.distance,target=c.targetLane,near=course.obstacles.filter(o=>o.type!=='fruit'&&o.z-distance>-50&&o.z-distance<630);
  const first=near.find(o=>o.z-distance<370);
  let desired=target;
  if(first?.lane===target){
    const ranks=[-1,0,1].map(lane=>({lane,penalty:near.reduce((sum,o)=>sum+(o.lane===lane?((o.z-distance<200)?500:(o.z-distance<370)?170:45):0),0)+Math.abs(lane-target)*24}));
    ranks.sort((a,b)=>a.penalty-b.penalty);desired=ranks[0].lane;
  }
  let action='';
  if(desired<target)action='left';
  else if(desired>target)action='right';
  const input={left:action==='left'&&currentAction!=='left',right:action==='right'&&currentAction!=='right'};
  if(input.left||input.right)moves++;
  currentAction=input.left||input.right?action:'';
  const stateAfter=global.__crashDebug.qaStep(1,input);
  if(tick%180===0)logs.push({tick,distance:Math.round(distance),lane:+c.lane.toFixed(2),hits:c.hits,gap:c.gap});
  if(stateAfter.state!=='play'){state=stateAfter;break}
 }
 state=state||global.__crashDebug.qaSnapshot();
 console.log('SPECIAL_FULL_RUN',JSON.stringify({level,result:state.state,distance:Math.round(state.course.distance),length:course.length,deaths:state.progress.deaths,lives:state.progress.lives,hits:state.course.hits,moves,logs}));
 return state;
}
(async()=>{
 await wait(30);
 const platform=[];
 for(const level of [1,2,3,4,5])platform.push(await probePlatform(level));
 const special=[];
 for(const level of [6,7,8,9])special.push(await probeSpecial(level));
 for(const completed of special){
  assert.equal(completed.state,'results','Fase especial '+completed.level+' não chegou ao resultado pelo percurso inteiro');
  assert.equal(completed.progress.deaths,0,'Fase especial '+completed.level+' teve morte durante o percurso');
  assert.equal(completed.course.hits,0,'Fase especial '+completed.level+' teve impacto durante o percurso');
  assert(completed.progress.checkpointActivated,'Checkpoint obrigatório não registrado na fase '+completed.level);
 }
 console.log('SPECIAL_FULL_RUN_CERTIFIED',special.map(s=>s.level).join(','));
 console.log('PLAYTHROUGH_PROBE_SUMMARY',JSON.stringify({platform:platform.map(x=>({level:x.level,result:x.state,deaths:x.progress.deaths,checkpoint:x.progress.checkpointActivated})),special:special.map(x=>({level:x.level,result:x.state,hits:x.course?.hits}))}));
})().catch(err=>{console.error('PLAYTHROUGH_PROBE_FAILURE',err);process.exitCode=1});
