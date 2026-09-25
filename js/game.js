(()=>{
const c=document.getElementById('game'),x=c.getContext('2d');x.imageSmoothingEnabled=false;const W=c.width,H=c.height;const GAME_VERSION='1.25';
const cinematicRoot=document.getElementById('opening-cinematic'),cinematicVideo=document.getElementById('opening-video'),cinematicSkip=document.getElementById('cinematic-skip');let cinematicActive=false,cinematicFinish=null;
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEATH_DURATION=reducedMotion?1.35:2.25;
let playerImg=null,crouchImg=null,akuImg=null,aku3PlayerImg=null,tntImg=null,bounceBoxImg=null,lifeBoxImg=null,crystalImg=null,bgImg=null,trapImg=null,portalImg=null,checkpointImg=null,soulImg=null,tileImg=null,turtleImg=null,armadilloImg=null,magmaBeetleImg=null,emberBatImg=null,snowballImg=null,bearRideImg=null,boulderImg=null,boarRideImg=null,roadObstaclesImg=null,mode7GroundImg=null,mode7PropsImg=null,bossGuardianImg=null,spikeAssetImg=null,floorSpikeAssetImg=null,logAssetImg=null,pressAssetImg=null,poisonAssetImg=null,iceSpikeAssetImg=null,ruinEndImg=null,menuLogoImg=null,levelSelectBgImg=null,biomeTileImg=null,biomeEnemyImg=null;
let resetInputActions=()=>{};
const ASSET_GROUPS={
 core:{menuLogo:'assets/ui/menu_logo.webp',levelSelectBg:'assets/ui/level_select_user.webp'},
 shared:{
  player:'assets/characters/player_clean.webp',crouch:'assets/characters/crash_crouch_slide.webp',aku:'assets/characters/aku_sheet_transparent.webp',aku3Player:'assets/characters/crash_aku3_equip_v105.webp',tnt:'assets/boxes/tnt_sheet_transparent.webp',bounceBox:'assets/boxes/bounce10_box_sheet.webp',lifeBox:'assets/boxes/life_box_sheet.webp',crystal:'assets/items/crystal_blue.webp',
  trap:'assets/traps/traps_sheet.webp',spikeAsset:'assets/traps/trap_spikes_16bit_sheet.webp',floorSpikeAsset:'assets/traps/trap_spikes_16bit_sheet.webp',logAsset:'assets/traps/trap_swinging_log.webp',pressAsset:'assets/traps/trap_stone_press.webp',
  portal:'assets/environment/portal_sheet.webp',checkpoint:'assets/boxes/checkpoint_sheet_user.webp',turtle:'assets/enemies/turtle_walk_better.webp',armadillo:'assets/enemies/armadillo_sheet_v105.webp',ruinEnd:'assets/backgrounds/end_ruin_portal.webp'
 },
 ...(window.LEVEL_ASSET_GROUPS||{})
};
class AssetManager{
 constructor(groups){this.groups=groups;this.cache=new Map();this.named=new Map();this.loaded=new Set();this.groupKeys=new Map();this.persistent=new Set(['core','shared']);this.stats={started:0,completed:0,failed:0,ms:0,failures:[],pending:[],events:[],groups:[],released:[]};}
 entryInfo(raw){return typeof raw==='string'?{type:'image',url:raw}:{type:raw?.type||'image',url:raw?.url||''}}
 async withRetry(loader,url,type,maxAttempts=2){let last;for(let attempt=1;attempt<=maxAttempts;attempt++){try{return await loader.call(this,url,attempt)}catch(err){last=err;console.warn(`[AssetManager] ${type} falhou (${attempt}/${maxAttempts}):`,url,err);if(attempt<maxAttempts)await new Promise(r=>setTimeout(r,220*attempt))}}throw last}
 loadImageOnce(url){const started=performance.now();return new Promise((resolve,reject)=>{const im=new Image();let settled=false;const finish=(err)=>{if(settled)return;settled=true;clearTimeout(timer);err?reject(err):resolve(im)};const timer=setTimeout(()=>finish(new Error('Timeout ao carregar '+url)),12000);im.decoding='async';im.onload=()=>finish();im.onerror=()=>finish(new Error('Falha ao decodificar '+url));im.src=url})}
 loadAudioOnce(url){return new Promise((resolve,reject)=>{const a=new Audio();let settled=false;const finish=(err)=>{if(settled)return;settled=true;clearTimeout(timer);a.removeEventListener('canplaythrough',ok);a.removeEventListener('loadeddata',ok);a.removeEventListener('error',bad);err?reject(err):resolve(a)};const ok=()=>finish();const bad=()=>finish(new Error('Falha ao carregar áudio '+url));const timer=setTimeout(()=>finish(new Error('Timeout ao carregar áudio '+url)),12000);a.preload='auto';a.addEventListener('canplaythrough',ok,{once:true});a.addEventListener('loadeddata',ok,{once:true});a.addEventListener('error',bad,{once:true});a.src=url;a.load()})}
 loadResource(raw){const info=this.entryInfo(raw),key=info.type+':'+info.url;if(this.cache.has(key))return this.cache.get(key);const started=performance.now();this.stats.started++;this.stats.pending.push(info.url);this.stats.events.push({type:'start',url:info.url,t:started,kind:info.type});const loader=info.type==='audio'?this.loadAudioOnce:this.loadImageOnce;const pr=this.withRetry(loader,info.url,info.type,2).then(asset=>{this.stats.completed++;this.stats.pending=this.stats.pending.filter(v=>v!==info.url);this.stats.ms+=performance.now()-started;this.stats.events.push({type:'loaded',url:info.url,t:performance.now()-started,kind:info.type});return asset}).catch(err=>{this.stats.completed++;this.stats.failed++;this.stats.pending=this.stats.pending.filter(v=>v!==info.url);this.stats.failures.push({url:info.url,error:err.message});this.stats.events.push({type:'error',url:info.url,t:performance.now()-started,error:err.message,kind:info.type});this.cache.delete(key);throw err});this.cache.set(key,pr);return pr}
 async loadGroup(group,onProgress){this.stats.groups.push({group,entries:Object.keys(this.groups[group]||{}).length,already:this.loaded.has(group)});if(this.loaded.has(group)){onProgress?.(1);return[]}const entries=Object.entries(this.groups[group]||{});if(!entries.length){this.loaded.add(group);onProgress?.(1);return[]}let done=0;const failures=[],keys=[];await Promise.all(entries.map(async([name,raw])=>{const info=this.entryInfo(raw);keys.push({name,key:info.type+':'+info.url,url:info.url,type:info.type});try{const asset=await this.loadResource(raw);this.named.set(name,asset)}catch(err){failures.push({name,url:info.url,error:err.message})}finally{done++;onProgress?.(done/entries.length)}}));this.groupKeys.set(group,keys);if(!failures.length)this.loaded.add(group);return failures}
 async preparePhase(level,onProgress){const phaseName='phase'+level;const sharedLoaded=this.loaded.has('shared'),sharedCount=sharedLoaded?0:Object.keys(this.groups.shared||{}).length,phaseCount=Object.keys(this.groups[phaseName]||{}).length,total=Math.max(1,sharedCount+phaseCount);let complete=0;const report=()=>onProgress?.(Math.max(0,Math.min(1,complete/total)));const failures=[];if(!sharedLoaded){for(const f of await this.loadGroup('shared',p=>{complete=p*sharedCount;report()}))failures.push(f);complete=sharedCount;report()}for(const f of await this.loadGroup(phaseName,p=>{complete=sharedCount+p*phaseCount;report()}))failures.push(f);if(failures.length){const err=new Error('Não foi possível carregar '+failures.length+' recurso(s) da fase.');err.failures=failures;throw err}onProgress?.(1);return[]}
 releaseGroup(group){if(this.persistent.has(group)||!this.loaded.has(group))return;const entries=this.groupKeys.get(group)||[];for(const item of entries){const asset=this.named.get(item.name);if(asset instanceof HTMLAudioElement){try{asset.pause();asset.removeAttribute('src');asset.load()}catch(_){}}else if(asset instanceof HTMLImageElement){try{asset.src=''}catch(_){}}this.named.delete(item.name);let usedElsewhere=false;for(const [g,items] of this.groupKeys){if(g===group||!this.loaded.has(g))continue;if(items.some(v=>v.key===item.key)){usedElsewhere=true;break}}if(!usedElsewhere)this.cache.delete(item.key)}this.loaded.delete(group);this.groupKeys.delete(group);this.stats.released.push({group,t:performance.now()});}
 releasePhase(level){this.releaseGroup('phase'+level)}
 phaseReady(level){return this.loaded.has('shared')&&this.loaded.has('phase'+level)}
 get(name){return this.named.get(name)||null}
 memoryInfo(){return{loadedGroups:[...this.loaded],cachedResources:this.cache.size,namedResources:this.named.size,pending:this.stats.pending.slice(),released:this.stats.released.slice(-8)}}
}

	const assetManager=new AssetManager(ASSET_GROUPS);let loadingProgress=0,loadingText='CARREGANDO...',loadingError='',loadingErrorDetails='',loadingTargetLevel=0,loadingRetry=null,loadSerial=0;
function bindCoreAssets(){menuLogoImg=assetManager.get('menuLogo')||menuLogoImg;levelSelectBgImg=assetManager.get('levelSelectBg')||levelSelectBgImg}
function bindSharedAssets(){playerImg=assetManager.get('player');crouchImg=assetManager.get('crouch');akuImg=assetManager.get('aku');aku3PlayerImg=assetManager.get('aku3Player');tntImg=assetManager.get('tnt');bounceBoxImg=assetManager.get('bounceBox');lifeBoxImg=assetManager.get('lifeBox');crystalImg=assetManager.get('crystal');trapImg=assetManager.get('trap');spikeAssetImg=assetManager.get('spikeAsset');floorSpikeAssetImg=assetManager.get('floorSpikeAsset');logAssetImg=assetManager.get('logAsset');pressAssetImg=assetManager.get('pressAsset');poisonAssetImg=assetManager.get('poisonAsset');iceSpikeAssetImg=assetManager.get('iceSpikeAsset');ruinEndImg=assetManager.get('ruinEnd');portalImg=assetManager.get('portal');checkpointImg=assetManager.get('checkpoint');soulImg=assetManager.get('soul');tileImg=assetManager.get('tile');turtleImg=assetManager.get('turtle');armadilloImg=assetManager.get('armadillo');magmaBeetleImg=assetManager.get('magmaBeetle');emberBatImg=assetManager.get('emberBat')}
function bindPhaseAssets(level){bindSharedAssets();bgImg=assetManager.get('bg'+level)||null;biomeTileImg=assetManager.get('biomeTile'+level)||null;biomeEnemyImg=assetManager.get('biomeEnemy'+level)||null;snowballImg=assetManager.get('snowball')||null;bearRideImg=assetManager.get('bearRide')||null;boulderImg=assetManager.get('boulder')||null;boarRideImg=assetManager.get('boarRide')||null;roadObstaclesImg=assetManager.get('roadObstacles')||null;mode7GroundImg=assetManager.get('mode7Ground')||null;mode7PropsImg=assetManager.get('mode7Props')||null;bossGuardianImg=assetManager.get('bossGuardian')||null}
function activeBackground(){const exact=assetManager.get('bg'+currentLevel);return exact||null}
const AUDIO_FILES={jump:'assets/audio/jump.wav',spin:'assets/audio/spin.wav',box:'assets/audio/box.wav',tick:'assets/audio/tnt_tick.wav',explosion:'assets/audio/explosion.wav',fruit:'assets/audio/fruit.wav',aku:'assets/audio/aku.wav',checkpoint:'assets/audio/checkpoint.wav',hurt:'assets/audio/hurt.wav',death:'assets/audio/death.wav',enemy:'assets/audio/enemy.wav',portal:'assets/audio/portal.wav',menu:'assets/audio/menu.wav',land:'assets/audio/land.wav',invincible:'assets/audio/invincible_layer.wav'};
const SFX_GAIN={jump:.72,spin:.62,box:.78,tick:.58,explosion:.86,fruit:.67,aku:.76,checkpoint:.78,hurt:.82,death:.84,enemy:.72,portal:.72,menu:.45,land:.52};
const sfxPools=new Map(),sfxPoolCursor=new Map();
let audioUnlocked=false,musicAudio=null,invincibleMusicAudio=null,musicLevel=0,lastSfxAt={};
let audioSettings={music:.5,sfx:.8};
try{const a=JSON.parse(localStorage.getItem('crashAudioSettings')||'null');if(a){if(Number.isFinite(Number(a.music)))audioSettings.music=Math.max(0,Math.min(1,Number(a.music)));if(Number.isFinite(Number(a.sfx)))audioSettings.sfx=Math.max(0,Math.min(1,Number(a.sfx)))}}catch(_){ }
function saveAudioSettings(){try{localStorage.setItem('crashAudioSettings',JSON.stringify(audioSettings))}catch(_){ }}
function playOpeningCinematic(done){
 if(!cinematicRoot||!cinematicVideo||reducedMotion){done();return}
 let finished=false;const finish=()=>{if(finished)return;finished=true;cinematicActive=false;cinematicFinish=null;cinematicVideo.pause();cinematicRoot.hidden=true;cinematicRoot.classList.remove('playing');cinematicVideo.removeEventListener('ended',finish);cinematicVideo.removeEventListener('error',finish);resetInputActions();done()};
 cinematicActive=true;cinematicFinish=finish;cinematicRoot.hidden=false;cinematicRoot.classList.remove('playing');cinematicVideo.currentTime=0;cinematicVideo.volume=Math.max(0,Math.min(1,audioSettings.music));cinematicVideo.addEventListener('ended',finish,{once:true});cinematicVideo.addEventListener('error',finish,{once:true});
 const started=cinematicVideo.play();if(started?.then)started.then(()=>cinematicRoot.classList.add('playing')).catch(finish);else cinematicRoot.classList.add('playing');
}
cinematicSkip?.addEventListener('click',()=>cinematicFinish?.());
function audioPct(kind){return Math.round(audioSettings[kind]*100)}
function cycleAudio(kind,dir=1){const steps=[0,.25,.5,.75,1],v=audioSettings[kind];let i=steps.reduce((best,n,j)=>Math.abs(n-v)<Math.abs(steps[best]-v)?j:best,0);i=(i+(dir>0?1:-1)+steps.length)%steps.length;audioSettings[kind]=steps[i];saveAudioSettings();if(kind==='music'){if(musicAudio)musicAudio.volume=audioSettings.music;if(invincibleMusicAudio)invincibleMusicAudio.volume=audioSettings.music*.42}playSfx('menu',.85,.7)}
const GRAPHICS_MODES=['auto','low','medium','high'];
let graphicsMode='auto';
try{const q=localStorage.getItem('crashGraphicsQuality');if(GRAPHICS_MODES.includes(q))graphicsMode=q}catch(_){ }
function detectedGraphicsTier(){const memory=Number(navigator.deviceMemory||0),cores=Number(navigator.hardwareConcurrency||0);if(reducedMotion||memory>0&&memory<=2||cores>0&&cores<=2)return 0;if(memory>0&&memory<=4||cores>0&&cores<=4)return 1;return 2}
function graphicsTier(){return graphicsMode==='low'?0:graphicsMode==='medium'?1:graphicsMode==='high'?2:detectedGraphicsTier()}
function graphicsLabel(){return graphicsMode==='auto'?'AUTO ('+['BAIXA','MÉDIA','ALTA'][graphicsTier()]+')':graphicsMode==='low'?'BAIXA':graphicsMode==='medium'?'MÉDIA':'ALTA'}
function fxCount(low,medium,high){return [low,medium,high][graphicsTier()]}
function cycleGraphics(dir=1){let i=GRAPHICS_MODES.indexOf(graphicsMode);i=(i+(dir>0?1:-1)+GRAPHICS_MODES.length)%GRAPHICS_MODES.length;graphicsMode=GRAPHICS_MODES[i];try{localStorage.setItem('crashGraphicsQuality',graphicsMode)}catch(_){ }playSfx('menu',.9,.65)}
function makeSfxVoice(name){const a=new Audio(AUDIO_FILES[name]);a.preload='auto';a.preservesPitch=false;return a}
function warmSfx(){for(const name of Object.keys(SFX_GAIN))if(!sfxPools.has(name)){const a=makeSfxVoice(name);sfxPools.set(name,[a]);try{a.load()}catch(_){}}}
function sfxVoice(name){let pool=sfxPools.get(name);if(!pool){pool=[makeSfxVoice(name)];sfxPools.set(name,pool)}let a=pool.find(v=>v.paused||v.ended);if(!a){if(pool.length<4){a=makeSfxVoice(name);pool.push(a)}else{const i=(sfxPoolCursor.get(name)||0)%pool.length;sfxPoolCursor.set(name,i+1);a=pool[i];a.pause()}}return a}
function unlockAudio(){if(!audioUnlocked){audioUnlocked=true;warmSfx()}if(state==='play'&&!paused)startMusicForLevel()}
function playSfx(name,rate=1,vol=1,minGap=.035){if(!audioUnlocked||audioSettings.sfx<=0)return;const src=AUDIO_FILES[name];if(!src)return;const now=performance.now()/1000;if(now-(lastSfxAt[name]||-99)<minGap)return;lastSfxAt[name]=now;const a=sfxVoice(name);try{a.currentTime=0}catch(_){}a.volume=Math.max(0,Math.min(1,audioSettings.sfx*vol*(SFX_GAIN[name]||1)));a.playbackRate=Math.max(.5,Math.min(2,rate));a.play().catch(()=>{});}
function startMusicForLevel(force=false){if(!audioUnlocked||state!=='play'||paused||audioSettings.music<=0)return;const lvl=Math.max(1,Math.min(10,currentLevel));if(!force&&musicAudio&&musicLevel===lvl){musicAudio.volume=audioSettings.music;if(musicAudio.paused)musicAudio.play().catch(()=>{});return}if(musicAudio){musicAudio.pause();musicAudio.currentTime=0}musicLevel=lvl;const prepared=assetManager.get('music'+lvl);musicAudio=prepared instanceof HTMLAudioElement?prepared:new Audio('assets/audio/music_phase'+Math.min(5,lvl)+'.wav');musicAudio.loop=true;musicAudio.preload='auto';musicAudio.playbackRate=1;musicAudio.volume=audioSettings.music;musicAudio.play().catch(()=>{});}
function playLoadedSfx(name,rate=1,vol=1){if(!audioUnlocked||audioSettings.sfx<=0)return;const source=assetManager.get(name);if(!(source instanceof HTMLAudioElement))return;const a=source.cloneNode?source.cloneNode():source;try{a.currentTime=0;a.volume=Math.max(0,Math.min(1,audioSettings.sfx*vol));a.playbackRate=rate;a.play().catch(()=>{})}catch(_){}}
function startInvincibleMusic(){if(!audioUnlocked||audioSettings.music<=0||state!=='play'||paused)return;if(musicAudio){musicAudio.playbackRate=1.07;musicAudio.volume=Math.min(1,audioSettings.music*1.08)}if(!invincibleMusicAudio){invincibleMusicAudio=new Audio(AUDIO_FILES.invincible);invincibleMusicAudio.loop=true;invincibleMusicAudio.preload='auto'}invincibleMusicAudio.volume=audioSettings.music*.42;if(invincibleMusicAudio.paused)invincibleMusicAudio.play().catch(()=>{})}
function stopInvincibleMusic(){if(musicAudio){musicAudio.playbackRate=1;musicAudio.volume=audioSettings.music}if(invincibleMusicAudio&&!invincibleMusicAudio.paused){invincibleMusicAudio.pause();invincibleMusicAudio.currentTime=0}}
function stopMusic(){if(musicAudio&&!musicAudio.paused)musicAudio.pause();if(invincibleMusicAudio&&!invincibleMusicAudio.paused)invincibleMusicAudio.pause()}
function syncMusic(){if(!audioUnlocked)return;if(state==='play'&&!paused&&audioSettings.music>0){startMusicForLevel();if(akuInvT>0)startInvincibleMusic();else stopInvincibleMusic()}else stopMusic()}
addEventListener('pointerdown',unlockAudio,{passive:true});addEventListener('keydown',unlockAudio,{passive:true});
function drawEndRuin(){
 if(!ruinEndImg||!visibleWorldX(portal.x-340,760,280))return;
 const rw=560,rh=336;
 const rx=Math.round(portal.x+portal.w/2-rw/2);
 const ry=Math.round(groundY-rh+18);
 const ruinLook={
   1:{tint:'rgba(62,132,88,.16)',mist:'rgba(72,160,112,.10)',glow:'#66ddff',torch:'rgba(255,180,80,.14)'},
   2:{tint:'rgba(164,112,58,.18)',mist:'rgba(205,166,92,.10)',glow:'#8de7ff',torch:'rgba(255,208,120,.14)'},
   3:{tint:'rgba(78,110,54,.22)',mist:'rgba(162,196,122,.12)',glow:'#7cead6',torch:'rgba(244,200,98,.12)'},
   4:{tint:'rgba(88,136,196,.20)',mist:'rgba(176,225,255,.12)',glow:'#a9ecff',torch:'rgba(190,225,255,.10)'},
   5:{tint:'rgba(175,78,48,.22)',mist:'rgba(255,132,70,.10)',glow:'#7be4ff',torch:'rgba(255,128,52,.16)'}
 }[currentLevel]||{tint:'rgba(62,132,88,.16)',mist:'rgba(72,160,112,.10)',glow:'#66ddff',torch:'rgba(255,180,80,.14)'};
 x.save();
 x.globalAlpha=.98;
 ds(ruinEndImg,null,rx,ry,rw,rh);
 x.save();
 x.beginPath();x.rect(rx,ry,rw,rh);x.clip();
 x.globalCompositeOperation='source-atop';
 x.globalAlpha=1;x.fillStyle=ruinLook.tint;x.fillRect(rx,ry,rw,rh);
 const grd=x.createLinearGradient(0,ry,0,ry+rh);
 grd.addColorStop(0,'rgba(255,255,255,.06)');
 grd.addColorStop(.58,'rgba(255,255,255,0)');
 grd.addColorStop(1,ruinLook.mist);
 x.fillStyle=grd;x.fillRect(rx,ry,rw,rh);
 x.restore();
 x.globalAlpha=.12;
 x.fillStyle=ruinLook.glow;
 x.beginPath();
 x.ellipse(portal.x+portal.w/2,portal.y+portal.h/2+12,110,42,0,0,Math.PI*2);
 x.fill();
 x.globalAlpha=.16;
 x.fillStyle=ruinLook.torch;
 x.beginPath();x.ellipse(rx+132,ry+205,34,18,0,0,Math.PI*2);x.fill();
 x.beginPath();x.ellipse(rx+rw-130,ry+205,34,18,0,0,Math.PI*2);x.fill();
 x.globalAlpha=.10;
 x.fillStyle=ruinLook.mist;
 x.beginPath();x.ellipse(portal.x+portal.w/2,groundY-8,210,30,0,0,Math.PI*2);x.fill();
 x.restore();
}
class LevelManager{
 constructor(assets){this.assets=assets;this.activeLevel=0;this.serial=0;this.lastCleanup=null}
 cleanupRuntime(reason='transition'){
  stopMusic();stopInvincibleMusic();musicAudio=null;musicLevel=0;
  try{resetInputActions()}catch(_){}
  try{clearMutableLevel()}catch(_){}
  for(const a of [boxFx,dustFx,enemyFx,impactFx,akuFx,lifePickupFx,akuTrail])a.length=0;
  forcedDeathT=0;portalSeq=0;introT=0;deathAnim=0;checkpointAnim=0;crystalFxT=0;hudLifePulseT=0;paused=false;
  bgImg=null;biomeTileImg=null;biomeEnemyImg=null;snowballImg=null;bearRideImg=null;boulderImg=null;boarRideImg=null;roadObstaclesImg=null;mode7GroundImg=null;mode7PropsImg=null;
  this.lastCleanup={reason,level:this.activeLevel,t:performance.now()};
 }
 releaseCurrent(reason='leave-level'){
  if(!this.activeLevel)return;
  const old=this.activeLevel;this.cleanupRuntime(reason);this.assets.releasePhase(old);this.activeLevel=0;
 }
 async load(level,done,{forceReload=false}={}){
  level=Math.max(1,Math.min(10,level));const token=++this.serial;const previous=this.activeLevel;
  requestLevelPreview(level);state='loading';loadingTargetLevel=level;loadingProgress=0;loadingError='';loadingErrorDetails='';loadingRetry=null;
  const meta=window.LEVEL_CONFIG?.[level];loadingText='FASE '+campaignNumber(level)+' • '+(meta?.name||'CARREGANDO');
  if(previous&&previous!==level){this.cleanupRuntime('level-'+previous+'-to-'+level);this.assets.releasePhase(previous);this.activeLevel=0}
  if(forceReload&&this.assets.phaseReady(level)){this.assets.releasePhase(level)}
  try{
   await this.assets.preparePhase(level,p=>loadingProgress=p);
   if(token!==this.serial)return;
   setLevel(level);bindPhaseAssets(level);this.activeLevel=level;loadingProgress=1;loadingRetry=null;done?.();
  }catch(err){
   if(token!==this.serial)return;
   loadingError=err?.message||'Não foi possível carregar a fase.';
   const f=err?.failures||[];loadingErrorDetails=f.length?f.slice(0,2).map(v=>v.url).join(' • '):'';
   console.error('[LevelManager] erro ao carregar fase',level,err,f);
   loadingRetry=()=>this.load(level,done,{forceReload:true});state='loading';
  }
 }
 info(){return{activeLevel:this.activeLevel,lastCleanup:this.lastCleanup,...this.assets.memoryInfo()}}
}
const levelManager=new LevelManager(assetManager);
async function ensurePhase(level,done,opts={}){return levelManager.load(level,done,opts)}
function leaveLevelToMenu(){if(activeSlot)saveGame(true);levelManager.releaseCurrent('menu');state='menu';menuSub='main';menuIndex=0}
function leaveLevelToSelector(){if(activeSlot)saveGame(true);levelManager.releaseCurrent('level-select');levelSelectIndex=Math.min(9,campaignIndex(currentLevel)+1);state='levelselect'}
const keys={};
const touchState={left:false,right:false,down:false,jump:false,spin:false};
const DEFAULT_KEYS={left:'ArrowLeft',right:'ArrowRight',down:'ArrowDown',jump:'Space',spin:'KeyX',pause:'KeyP'};
const DEFAULT_PAD={jump:0,spin:2,pause:9};
let keybinds={...DEFAULT_KEYS},padbinds={...DEFAULT_PAD},captureAction=null,captureType=null,capturedKeyCode=null;
function validKeyCode(v,fallback){return typeof v==='string'&&/^(Arrow(Left|Right|Up|Down)|Space|Escape|Enter|Key[A-Z]|Digit[0-9]|Numpad[0-9]|Shift(Left|Right)|Control(Left|Right))$/.test(v)?v:fallback}
function normalizeKeybinds(raw={}){const out={};for(const [action,fallback] of Object.entries(DEFAULT_KEYS))out[action]=validKeyCode(raw?.[action],fallback);return out}
function normalizePadbinds(raw={}){const out={};for(const [action,fallback] of Object.entries(DEFAULT_PAD)){const value=Number(raw?.[action]);out[action]=Number.isInteger(value)&&value>=0&&value<=31?value:fallback}return out}
try{keybinds=normalizeKeybinds(JSON.parse(localStorage.getItem('crashV05Keybinds')||'{}'));padbinds=normalizePadbinds(JSON.parse(localStorage.getItem('crashV05Padbinds')||'{}'))}catch(_){keybinds={...DEFAULT_KEYS};padbinds={...DEFAULT_PAD}}
const KEY_ALIASES={left:['KeyA'],right:['KeyD'],down:['KeyS'],jump:['KeyW']};
function actionDown(a){const code=keybinds[a];return !!keys[code]||!!touchState[a]||!!KEY_ALIASES[a]?.some(k=>keys[k])}
function keyName(code){return ({ArrowLeft:'←',ArrowRight:'→',ArrowDown:'↓',ArrowUp:'↑',Space:'ESPAÇO',Escape:'ESC',Enter:'ENTER',KeyP:'P',KeyX:'X',KeyZ:'Z',KeyA:'A',KeyD:'D',KeyS:'S',KeyW:'W',KeyK:'K'}[code]||code.replace('Key','').replace('Digit',''))}
function connectedPad(){const gs=navigator.getGamepads?.()||[];for(const g of gs)if(g&&g.connected)return g;return null}
function padFamily(g=connectedPad()){const id=(g?.id||'').toLowerCase();if(/playstation|dualshock|dualsense|sony|054c/.test(id))return'playstation';if(/xbox|xinput|microsoft|045e/.test(id))return'xbox';return g?'generic':'keyboard'}
function padButtonName(i,g=connectedPad()){const f=padFamily(g);const ps={0:'×',1:'○',2:'□',3:'△',4:'L1',5:'R1',6:'L2',7:'R2',8:'CREATE',9:'OPTIONS',10:'L3',11:'R3',12:'↑',13:'↓',14:'←',15:'→'};const xb={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',8:'VIEW',9:'MENU',10:'LS',11:'RS',12:'↑',13:'↓',14:'←',15:'→'};const m=f==='playstation'?ps:f==='xbox'?xb:null;return m?.[i]||('B'+i)}
function inputBrand(){const f=padFamily();return f==='playstation'?'PLAYSTATION':f==='xbox'?'XBOX':f==='generic'?'GAMEPAD':'TECLADO'}
function confirmHint(){return connectedPad()?padButtonName(0):'ENTER'}
function backHint(){return connectedPad()?padButtonName(1):'ESC'}
function extraHint(){return connectedPad()?padButtonName(2):'X'}
function deleteHint(){return connectedPad()?padButtonName(3):'DELETE'}
function moveHint(){return connectedPad()?'D-PAD / ANALÓGICO':keyName(keybinds.left)+' / '+keyName(keybinds.right)+' ou A / D'}
function actionHint(a){if(!connectedPad())return keyName(keybinds[a]);if(a==='left'||a==='right'||a==='down')return'D-PAD / ANALÓGICO';if(a==='jump')return padButtonName(padbinds.jump);if(a==='spin')return padButtonName(padbinds.spin);if(a==='pause')return padButtonName(padbinds.pause);return'?'}
function refreshHelp(){const h=document.getElementById('help');if(!h)return;h.textContent=connectedPad()?inputBrand()+' conectado • '+padButtonName(padbinds.pause)+' pausa • controles adaptáveis':'Controles configuráveis • 3 slots de save • ESC / '+keyName(keybinds.pause)+' pausa • conecte um controle'}
addEventListener('gamepadconnected',refreshHelp);addEventListener('gamepaddisconnected',refreshHelp);setTimeout(refreshHelp,250);
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code))e.preventDefault();if(captureType==='keyboard'&&captureAction){e.preventDefault();keybinds[captureAction]=e.code;capturedKeyCode=e.code;captureAction=null;captureType=null;try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds))}catch(_){ }toast='Controle atualizado!';toastT=1;}});
addEventListener('keyup',e=>keys[e.code]=false);
let state='menu',paused=false,last=0,camX=0,score=0,fruits=0,lives=4,checkpoint=80,checkpointAnim=0,inv=0,toast='',toastT=0,shake=0,hitFlash=0,aku=0,akuInvT=0,akuEquipT=0,boxesBroken=0,deaths=0,levelTime=0,deathAnim=0,deathX=0,deathY=0,deathFacing=1,deathKind='impact',portalSeq=0,resultGem=false,phaseStartFruits=0,introT=0,introDuration=0,bossState=null;
const CAMPAIGN_ORDER=[1,8,9,2,3,5,4,6,7];
function campaignIndex(level=currentLevel){const i=CAMPAIGN_ORDER.indexOf(level);return i<0?0:i}
function campaignNumber(level=currentLevel){return level===10?10:campaignIndex(level)+1}
const PHASE_SUBTITLES=['','A praia esconde o primeiro caminho','Ruínas, armadilhas e rotas elevadas','A lama cobra cada passo','Controle o impulso sobre o gelo','Vento, fogo e um portal ancestral','Corra antes que a montanha alcance você','Três faixas, reflexos rápidos e muita neve','O templo da selva despertou','Três faixas entre raízes e ruínas'];
const DEATH_TITLES={fall:'QUEDA LIVRE',spikes:'ESPETADO!',explosion:'KABUM!',crush:'ESMAGADO!',freeze:'CONGELADO!',poison:'ENVENENADO!',snowball:'ATROPELADO PELA AVALANCHE!',boulder:'ESMAGADO PELA PEDRA!',ride:'TOMBOU DO URSO!',boar:'TOMBOU DO JAVALI!',impact:'VIDA PERDIDA'};
const DEATH_PROFILES={
 impact:{motion:'tumble',color:'#ffd878',soul:true},
 fall:{motion:'fall',color:'#bfefff',soul:true},
 spikes:{motion:'stiff',color:'#f3fbff',soul:true},
 explosion:{motion:'blast',color:'#ff9d35',soul:true},
 crush:{motion:'flatten',color:'#fff2a1',soul:true},
 freeze:{motion:'frozen',color:'#9cecff',soul:true},
 poison:{motion:'sick',color:'#a7ed4f',soul:true},
 snowball:{motion:'snowball',color:'#dff8ff',soul:false},
 boulder:{motion:'boulder',color:'#d8bc72',soul:false},
 ride:{motion:'ride',color:'#dff8ff',soul:false},
 boar:{motion:'boar',color:'#e4a46b',soul:false}
};
function activeDeathProfile(kind=deathKind){return DEATH_PROFILES[kind]||DEATH_PROFILES.impact}
function beginPhaseIntro(short=false){introDuration=reducedMotion?.18:(short?1.65:((currentLevel===7||currentLevel===9)?4.25:(currentLevel===6||currentLevel===8)?3.15:2.6));introT=introDuration}
let crystalsCollected=Array(9).fill(false),levelCrystal={x:0,y:0,w:42,h:86,t:false},crystalFxT=0,hudLifePulseT=0;
let menuIndex=0,pauseIndex=0,menuSub='main',uiButtons=[],slotIndex=0,activeSlot=0,configTab=0,configIndex=0,configReturn='settings',settingsIndex=0,trophyScroll=0,saveNotice='',levelSelectIndex=0,levelPreview={level:0,img:null};
const SAVE_VERSION='1.2.0',SAVE_PREFIX='crashV091Slot',LEGACY_SAVE_PREFIXES=['crashV06Slot','crashV05Slot'];
const RANK_ORDER={D:0,C:1,B:2,A:3,S:4};
function rankFromScore(v){return v>=8?'S':v>=6?'A':v>=4?'B':v>=2?'C':'D'}
function performanceRank(level=currentLevel){
 const special=levelMode==='ride'||levelMode==='avalanche',st=levelMode==='ride'?rideState:avalancheState;let pts=0;
 if(special){const hits=st?.hits||0;pts+=hits===0?4:hits===1?3:hits<=3?1:0;pts+=(st?.bestCombo||0)>=6?2:(st?.bestCombo||0)>=3?1:0;pts+=(st?.nearMisses||0)>=4?1:0;pts+=deaths===0?2:deaths===1?1:0;pts+=levelTime<105?1:0}
 else{const total=Math.max(1,normal.length+tnts.length),ratio=boxesBroken/total;pts+=ratio>=1?3:ratio>=.8?2:ratio>=.55?1:0;pts+=resultGem?2:0;pts+=crystalsCollected[level-1]?1:0;pts+=deaths===0?2:deaths===1?1:0;pts+=levelTime<90?2:levelTime<150?1:0}
 return rankFromScore(pts)
}
function betterRank(a='D',b='D'){return (RANK_ORDER[a]??0)>=(RANK_ORDER[b]??0)?a:b}
function rankColor(r){return r==='S'?'#ffe769':r==='A'?'#8ff0ff':r==='B'?'#9effbd':r==='C'?'#ffcc74':'#c7c9c8'}
function blankLevelRecord(){return{completed:false,gem:false,crystal:false,bestTime:null,bestScore:0,bestBoxes:0,totalBoxes:0,bestDeaths:null,bestHits:null,bestCombo:0,nearMisses:0,bestRank:'D'}}
function normalizeLevelRecords(value,crystals=[]){return Array.from({length:9},(_,i)=>{const raw=Array.isArray(value)&&value[i]&&typeof value[i]==='object'?value[i]:{};const num=(v,f=0)=>Number.isFinite(Number(v))?Math.max(0,Number(v)):f;return{...blankLevelRecord(),...raw,completed:!!raw.completed,gem:!!raw.gem,crystal:!!(raw.crystal||crystals?.[i]),bestTime:Number.isFinite(Number(raw.bestTime))&&Number(raw.bestTime)>0?Number(raw.bestTime):null,bestScore:num(raw.bestScore),bestBoxes:num(raw.bestBoxes),totalBoxes:num(raw.totalBoxes),bestDeaths:Number.isFinite(Number(raw.bestDeaths))?num(raw.bestDeaths):null,bestHits:Number.isFinite(Number(raw.bestHits))?num(raw.bestHits):null,bestCombo:num(raw.bestCombo),nearMisses:num(raw.nearMisses),bestRank:RANK_ORDER[raw.bestRank]!=null?raw.bestRank:'D'}})}
function blankSlot(){return{empty:true,version:SAVE_VERSION,updated:0,currentLevel:1,phaseName:'ILHA SELVAGEM',checkpoint:80,score:0,fruits:0,phaseStartFruits:0,lives:4,deaths:0,levelTime:0,boxesBroken:0,aku:0,akuInvT:0,rideHits:0,avalancheHits:0,rideNearMisses:0,avalancheNearMisses:0,gem:false,gems:Array(9).fill(false),crystals:Array(9).fill(false),levelRecords:normalizeLevelRecords(),bossDefeated:false,bossHp:9,completed:false,levelsUnlocked:1,normal:[],normalBounce:[],tnts:[],fruitList:[],masks:[],enemies:[],trophies:{}}}
function readSlot(i){
  try{
    const raw=localStorage.getItem(SAVE_PREFIX+i)||LEGACY_SAVE_PREFIXES.map(p=>localStorage.getItem(p+i)).find(Boolean);
    if(!raw)return blankSlot();
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||parsed.empty===true)return blankSlot();
    const base=blankSlot();
    const num=(v,f,min=0)=>Number.isFinite(Number(v))?Math.max(min,Number(v)):f;
    const arr=v=>Array.isArray(v)?v.map(Boolean):[];
    let migratedUnlock=Math.round(num(parsed.levelsUnlocked,1,1));
    if(!['1.1.0','1.2.0'].includes(parsed.version))migratedUnlock=({1:1,2:4,3:5,4:7,5:7,6:8,7:9})[Math.min(7,migratedUnlock)]||1;
    const crystals=Array.from({length:9},(_,i)=>!!parsed.crystals?.[i]);
    const levelRecords=normalizeLevelRecords(parsed.levelRecords,crystals);
    if(!Array.isArray(parsed.levelRecords)){for(let p=0;p<Math.max(0,migratedUnlock-1);p++){const legacyPhase=CAMPAIGN_ORDER[p];if(legacyPhase)levelRecords[legacyPhase-1].completed=true}const legacyLevel=Math.min(8,Math.max(0,Math.round(num(parsed.currentLevel,1,1))-1));levelRecords[legacyLevel].gem=!!parsed.gem;levelRecords[legacyLevel].completed=levelRecords[legacyLevel].completed||!!parsed.completed;levelRecords[legacyLevel].bestTime=num(parsed.levelTime,0)||null;levelRecords[legacyLevel].bestScore=num(parsed.score,0);levelRecords[legacyLevel].bestBoxes=num(parsed.boxesBroken,0);levelRecords[legacyLevel].bestDeaths=num(parsed.deaths,0)}
    const gems=Array.from({length:9},(_,i)=>!!(parsed.gems?.[i]||levelRecords[i].gem));
    return {
      ...base,...parsed,empty:false,version:SAVE_VERSION,
      currentLevel:Math.min(10,Math.max(1,Math.round(num(parsed.currentLevel,1,1)))),
      checkpoint:num(parsed.checkpoint,base.checkpoint,0),score:num(parsed.score,0),
      fruits:num(parsed.fruits,0),phaseStartFruits:num(parsed.phaseStartFruits,num(parsed.fruits,0),0),lives:Math.max(1,Math.round(num(parsed.lives,4,1))),
      deaths:num(parsed.deaths,0),levelTime:num(parsed.levelTime,0),boxesBroken:num(parsed.boxesBroken,0),
      aku:Math.min(3,Math.max(0,Math.round(num(parsed.aku,0)))),
      akuInvT:num(parsed.akuInvT,0,0),
      levelsUnlocked:Math.min(9,Math.max(1,migratedUnlock)),
      normal:arr(parsed.normal),normalBounce:Array.isArray(parsed.normalBounce)?parsed.normalBounce.map(v=>Number.isFinite(Number(v))?Math.max(0,Math.min(10,Math.round(Number(v)))):null):[],tnts:arr(parsed.tnts),fruitList:arr(parsed.fruitList),
      masks:arr(parsed.masks),enemies:arr(parsed.enemies),
      gem:gems[Math.min(8,Math.max(0,Math.round(num(parsed.currentLevel,1,1))-1))],gems,crystals,levelRecords,completed:levelRecords.every(r=>r.completed),
      trophies:parsed.trophies&&typeof parsed.trophies==='object'?parsed.trophies:{}
    };
  }catch(_){return blankSlot()}
}
function writeSlot(i,data){try{localStorage.setItem(SAVE_PREFIX+i,JSON.stringify(data));return true}catch(_){saveNotice='Este navegador bloqueou o save local.';return false}}
function deleteSlot(i){try{localStorage.removeItem(SAVE_PREFIX+i);for(const p of LEGACY_SAVE_PREFIXES)localStorage.removeItem(p+i)}catch(_){ } }
function trophyDefs(){return[
 ['primeiro','PRIMEIROS PASSOS','Comece uma nova aventura.'],['canyon','VENTO DO CÂNION','Conclua Cânion Rubro.'],['checkpoint','PORTO SEGURO','Ative um checkpoint.'],['frutas50','COLETOR','Colete 50 frutas em uma fase.'],['caixas','QUEBRA-CAIXAS','Quebre 100% das caixas.'],['gema','GEMA SELVAGEM','Conquiste uma gema de fase.'],['semMorrer','SEM ARRANHÕES','Conclua uma fase sem morrer.'],['veloz','PÉS LIGEIROS','Conclua uma fase em menos de 2:30.'],['pantano','PÉS NA LAMA','Conclua Pântano Sombrio.'],['gelo','SANGUE FRIO','Conclua Picos Congelados.'],['pedra','PEDRA NO CAMINHO','Fuja da pedra gigante na selva.'],['javali','REI DO JAVALI','Conclua a corrida da selva.'],['avalanche','SEM OLHAR PARA TRÁS','Escape da avalanche alpina.'],['polar','PARCEIROS DO GELO','Conclua a corrida polar.'],['todosCristais','COLEÇÃO DE CRISTAIS','Obtenha os 9 cristais.'],['todasGemas','PERFEIÇÃO','Obtenha as 9 gemas.'],['campanha','AVENTURA COMPLETA','Conclua as 9 fases.'],['guardiao','GUARDIÃO VENCIDO','Derrote o Guardião das Nove Gemas.']
]}
function unlockTrophy(id){if(!activeSlot)return;const sl=readSlot(activeSlot);if(!sl.trophies)sl.trophies={};if(!sl.trophies[id]){sl.trophies[id]=Date.now();writeSlot(activeSlot,sl);toast='🏆 TROFÉU: '+(trophyDefs().find(t=>t[0]===id)?.[1]||id);toastT=2.3}}
function buildSave(completed=false){
 const old=activeSlot?readSlot(activeSlot):blankSlot(),finished=completed||state==='results',position=campaignNumber(currentLevel),idx=currentLevel-1;
 if(currentLevel===10){const trophies={...(old.trophies||{})},defeated=!!(old.bossDefeated||bossState?.defeated||state==='win');if(defeated)trophies.guardiao=trophies.guardiao||Date.now();return{...old,empty:false,version:SAVE_VERSION,updated:Date.now(),currentLevel:10,phaseName:'TEMPLO DA CONQUISTA',checkpoint:110,score,fruits,phaseStartFruits,lives,deaths,levelTime,aku,akuInvT:+Math.max(0,akuInvT).toFixed(2),bossDefeated:defeated,bossHp:defeated?0:Math.max(1,bossState?.hp||9),completed:true,levelsUnlocked:9,trophies}}
 const unlocked=finished?Math.max(old.levelsUnlocked||1,Math.min(9,position+1)):Math.max(old.levelsUnlocked||1,position);
 const records=normalizeLevelRecords(old.levelRecords,crystalsCollected),previous=records[idx]||blankLevelRecord(),special=levelMode==='ride'||levelMode==='avalanche',specialState=levelMode==='ride'?rideState:avalancheState;
 const totalBoxes=special?0:normal.length+tnts.length,hits=special?(specialState?.hits||0):null;
 records[idx]={...previous,completed:previous.completed||finished,gem:previous.gem||(finished&&resultGem),crystal:!!crystalsCollected[idx],bestTime:finished?(!previous.bestTime?levelTime:Math.min(previous.bestTime,levelTime)):previous.bestTime,bestScore:Math.max(previous.bestScore||0,score),bestBoxes:Math.max(previous.bestBoxes||0,boxesBroken),totalBoxes:Math.max(previous.totalBoxes||0,totalBoxes),bestDeaths:finished?(previous.bestDeaths==null?deaths:Math.min(previous.bestDeaths,deaths)):previous.bestDeaths,bestHits:finished&&hits!=null?(previous.bestHits==null?hits:Math.min(previous.bestHits,hits)):previous.bestHits,bestCombo:Math.max(previous.bestCombo||0,specialState?.bestCombo||0),nearMisses:Math.max(previous.nearMisses||0,specialState?.nearMisses||0),bestRank:finished?betterRank(performanceRank(currentLevel),previous.bestRank||'D'):(previous.bestRank||'D')};
 const crystals=crystalsCollected.slice(0,9),gems=records.map(r=>!!r.gem),allComplete=records.every(r=>r.completed),trophies={...(old.trophies||{})},now=Date.now();
 if(crystals.every(Boolean))trophies.todosCristais=trophies.todosCristais||now;if(gems.every(Boolean))trophies.todasGemas=trophies.todasGemas||now;if(allComplete)trophies.campanha=trophies.campanha||now;
 return{empty:false,version:SAVE_VERSION,updated:now,currentLevel,phaseName:currentLevelName,checkpoint,score,fruits,phaseStartFruits,lives,deaths,levelTime,boxesBroken,aku,akuInvT:+Math.max(0,akuInvT).toFixed(2),rideHits:rideState?.hits||0,avalancheHits:avalancheState?.hits||0,rideNearMisses:rideState?.nearMisses||0,avalancheNearMisses:avalancheState?.nearMisses||0,gem:gems[idx],gems,crystals,levelRecords:records,completed:allComplete,levelsUnlocked:unlocked,normal:normal.map(b=>!!b.hit),normalBounce:normal.map(b=>b.kind==='bounce10'?Math.max(0,b.bounceLeft??10):null),tnts:tnts.map(t=>!!t.dead),fruitList:fruitList.map(f=>!!f.t),masks:masks.map(m=>!!m.t),enemies:enemies.map(e=>!!e.dead),trophies}
}
function saveGame(auto=false){if(!activeSlot)return false;const ok=writeSlot(activeSlot,buildSave());if(ok&&!auto){saveNotice='Jogo salvo no Slot '+activeSlot;toast=saveNotice;toastT=1.5}return ok}
function applySaveData(i,sl){
 state='play';paused=false;unlockAudio();startMusicForLevel(true);menuSub='main';
 score=sl.score||0;fruits=sl.fruits||0;phaseStartFruits=Math.max(0,Number.isFinite(Number(sl.phaseStartFruits))?Number(sl.phaseStartFruits):fruits);lives=Math.max(1,sl.lives||4);deaths=sl.deaths||0;levelTime=sl.levelTime||0;
 checkpointActivated=!!sl.checkpoint&&sl.checkpoint!==currentCheckpointDefault;checkpoint=checkpointActivated?((currentLevel===6||currentLevel===8)?3250:(currentLevel===7||currentLevel===9)?3600:checkpointRespawnX):currentCheckpointDefault;aku=sl.aku||0;akuInvT=Math.max(0,sl.akuInvT||0);akuEquipT=0;boxesBroken=sl.boxesBroken||0;resultGem=!!sl.levelRecords?.[currentLevel-1]?.gem;
 crystalsCollected=Array.from({length:9},(_,n)=>!!sl.crystals?.[n]);configureLevelCrystal(currentLevel);deathAnim=0;portalSeq=0;checkpointAnim=0;
 normal.forEach((b,n)=>{b.hit=!!sl.normal?.[n];b.breakT=0;if(b.kind==='bounce10'){const saved=sl.normalBounce?.[n];b.bounceLeft=b.hit?0:(Number.isFinite(Number(saved))?Math.max(1,Math.min(10,Math.round(Number(saved)))):10)}});
 tnts.forEach((t,n)=>{t.dead=!!sl.tnts?.[n];t.active=false;t.t=3;t.blast=0;t.lastBeep=4});fruitList.forEach((f,n)=>f.t=!!sl.fruitList?.[n]);masks.forEach((m,n)=>m.t=!!sl.masks?.[n]);enemies.forEach((e,n)=>e.dead=!!sl.enemies?.[n]);
 if(currentLevel===10&&bossState){bossState.hp=Math.max(1,Math.min(9,sl.bossHp||9));bossState.phase=bossState.hp>6?1:bossState.hp>3?2:3}
 boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;akuFx.length=0;lifePickupFx.length=0;akuProtectT=0;hudLifePulseT=0;resetP();if(currentLevel===6||currentLevel===8){avalancheState=buildAvalancheState(checkpointActivated?3250:0);avalancheState.hits=Math.max(0,sl.avalancheHits||0);avalancheState.nearMisses=Math.max(0,sl.avalancheNearMisses||0)}if((currentLevel===7||currentLevel===9)&&rideState){rideState.distance=checkpointActivated?3600:0;rideState.hits=Math.max(0,sl.rideHits||0);rideState.nearMisses=Math.max(0,sl.rideNearMisses||0)}inv=1;toast='Slot '+i+' carregado';toastT=1.4;beginPhaseIntro(true);if(currentLevel===10){introT=0;if(sl.bossDefeated&&bossState){bossState.hp=0;bossState.defeated=true;state='win'}}
}
function applySave(i){const sl=readSlot(i);if(sl.empty)return false;activeSlot=i;const target=Math.max(1,Math.min(10,sl.currentLevel||1));ensurePhase(target,()=>applySaveData(i,sl));return true}
const worldW=5600,groundY=455;const portal={x:5360,y:245,w:180,h:210};
const sr={idle:[4,4,125,186],run1:[137,4,125,179],run2:[270,4,132,177],run3:[410,4,117,172],run4:[535,4,93,152],jump1:[636,4,151,177],jump2:[795,4,135,148],jump3:[4,198,115,176],jump4:[127,198,123,159],jump5:[258,198,115,171],fall:[381,198,110,145],spin1:[499,198,134,183],spin2:[641,198,146,173],box:[795,198,96,94],qbox:[899,198,95,104],fruit:[4,389,64,72],run5:[137,4,125,179],run6:[270,4,132,177],run7:[410,4,117,172],run8:[535,4,93,152],spin3:[499,198,134,183],hurt:[4,4,125,186],mask:[4,4,125,186]};
const bounceBoxSR={idle:[0,0,256,256],compress:[256,0,256,256],spring:[512,0,256,256],cracked:[768,0,256,256]};
const lifeBoxSR={idle:[0,0,256,256],compress:[256,0,256,256],spring:[512,0,256,256],cracked:[768,0,256,256]};
const akuSR={hover:[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320]],blink:[0,320,320,320],protect:[320,320,320,320],spin:[640,320,320,320],power:[960,320,320,320],hud:[0,0,320,320]};
const aku3SR={equip:[[15,220,295,370],[310,277,311,309],[621,224,310,346],[931,127,310,442],[1241,157,288,413],[1589,157,236,413],[1891,173,255,406]]};
// Recortes reais da folha: removem margens transparentes diferentes e mantêm
// os pés no mesmo ponto durante agachar/deslizar.
const crouchSR={
 crouch:[[34,29,213,187],[312,28,218,188],[581,19,234,197],[864,25,233,191],[1152,28,217,182],[1424,26,231,184],[1706,24,228,186],[1996,24,208,192]],
 slide:[[47,230,183,206],[302,295,235,141],[570,278,260,155],[850,285,260,148],[1132,303,255,131],[1404,309,272,127],[1696,298,248,138],[1973,268,251,168],[2288,238,182,198]]
};
const tntSR={idle:[45,35,160,150],three:[43,390,175,165],two:[425,390,185,165],one:[785,390,180,165],blast:[205,575,225,180],smoke:[820,575,210,170]};
const p={x:80,y:groundY-78,w:46,h:78,standH:78,crouchH:48,vx:0,vy:0,on:false,facing:1,spin:0,anim:0,land:0,takeoff:0,crouch:false,slide:0,slideDir:1,stompSquash:0,coyote:0,jumpBuffer:0};
const boxFx=[]; const dustFx=[]; const enemyFx=[]; const impactFx=[]; const akuFx=[]; const akuTrail=[]; const lifePickupFx=[]; let forcedDeathT=0,swingClock=0,akuProtectT=0,akuTrailClock=0;
const VISUAL_OFFSETS={player:-5,box:-3,tnt:0,enemy:1};const ENEMY_GROUND_OFFSET={turtle:3,swampTurtle:2,frog:2,penguin:2,seal:2,iceShell:2,armadillo:4,magmaBeetle:3,mosquito:0,emberBat:0};
// Armadilhas/buracos da Fase 1. Os recortes vêm do sprite sheet enviado pelo usuário.
const trapSR={spikes:[12,30,490,310],bridge:[905,20,315,325],boulder:[500,385,430,205],snake:[990,375,500,190],swing:[1225,20,310,330],breakBridge:[12,585,490,180],totem:[1040,585,480,225]};
const spike16SR=[[0,0,224,144],[224,0,224,144],[448,0,224,144],[672,0,224,144],[896,0,224,144]];

const swingFrames=[[0,78,170,320],[170,78,170,320],[340,78,170,320],[510,78,170,320],[680,78,170,320],[850,78,170,320],[1020,78,170,320],[1190,78,170,320],[1360,78,176,320]];
const LEVEL_RULES={groundY:455,standH:78,crouchH:48,directJumpTop:365,upperRouteTop:335,crouchTunnelTop:370,pitWidth:128};
let currentLevel=1,currentLevelName='ILHA SELVAGEM',currentCheckpointDefault=80,levelMode='platform';
let snowballX=-540,snowballSpeed=205;
let rideState=null,avalancheState=null;
const RIDE_LENGTH=7200;
const AVALANCHE_LENGTH=6500;
const RIDE_OBSTACLE_PATTERN=['crate','ice','fruit','rock','fruit','crate','ice','fruit','rock','crate','fruit','ice','rock','fruit','crate','rock','ice','fruit','crate','ice','fruit','rock','crate','fruit'];
const JUNGLE_RIDE_PATTERN=['fruit','crate','fruit','ice','rock','fruit','crate','fruit','rock','ice','fruit','crate','rock','fruit','ice','crate','fruit','rock','crate','fruit','ice','rock','fruit','crate'];
function buildRideState(start=0){const jungle=currentLevel===9,pattern=jungle?JUNGLE_RIDE_PATTERN:RIDE_OBSTACLE_PATTERN;return{distance:start,lane:0,targetLane:0,y:0,vy:0,speed:jungle?270:300,hits:0,nearMisses:0,combo:0,bestCombo:0,comboT:0,lean:0,prevL:false,prevR:false,prevJ:false,obstacles:pattern.map((type,i)=>({type,lane:((i*(jungle?4:5)+i%2)%3)-1,z:520+i*(jungle?290:275),done:false}))}}
function buildAvalancheState(start=0){const jungle=currentLevel===8,pattern=jungle?['fruit','rock','fruit','crate','ice','fruit','rock','fruit','crate','fruit','ice','rock','fruit','crate','rock','fruit','ice','fruit','crate','rock','fruit','ice']:['fruit','rock','fruit','ice','crate','fruit','rock','fruit','ice','crate','fruit','rock','ice','fruit','crate','rock','fruit','ice','crate','fruit','rock','ice'];return{distance:start,lane:0,targetLane:0,y:0,vy:0,speed:jungle?270:285,gap:start>=3250?(jungle?720:690):(jungle?790:760),hits:0,nearMisses:0,combo:0,bestCombo:0,comboT:0,lean:0,prevL:false,prevR:false,prevJ:false,obstacles:pattern.map((type,i)=>({type,lane:((i*(jungle?5:7)+(i>>1))%3)-1,z:480+i*(jungle?290:275),done:false}))}}
let checkpointBox={x:2460,y:groundY-58,w:58,h:58},checkpointRespawnX=2580,checkpointActivated=false;
function configureLevelCrystal(level=currentLevel){const pos={1:[2585,345],2:[3120,340],3:[2860,345],4:[3500,340],5:[3070,340],6:[3550,340],7:[0,0],8:[0,0],9:[0,0]}[level]||[2600,345];levelCrystal={x:pos[0],y:pos[1],w:42,h:86,t:!!crystalsCollected[level-1]}}
function collectLevelCrystal(){if(levelCrystal.t)return;levelCrystal.t=true;crystalsCollected[currentLevel-1]=true;crystalFxT=1;score+=1000;shake=Math.max(shake,.12);playSfx('checkpoint',1.35,.85,.12);toast='CRISTAL DA FASE COLETADO!';toastT=2;if(activeSlot)saveGame(true)}
const swingingLogs=[];
const stonePresses=[];
const spikeTraps=[];
const hazards=[];
const foreground=[];
const phaseDeco=[];
// Fase 1 (floresta) construída por dados do manifest em js/jungle-phase.js.
const jungleScene={background:[],terrain:[],back:[],objects:[],front:[]};
const jungleSlopes=[];
const jungleObjectColliders=[];
const biomeTileSR={
 swampGround:[12,2,554,139],swampFloat:[1069,19,156,197],swampSmall:[1268,171,132,132],swampReeds:[14,431,99,118],swampTree:[362,412,169,220],swampTotem:[538,414,195,199],swampLily:[277,646,157,93],swampLantern:[1007,802,76,107],swampBoat:[773,802,218,112],swampSkull:[1230,787,160,112],
 iceGround:[15,19,588,137],iceFloat:[941,13,284,212],iceSmall:[1263,28,187,142],iceCrystal:[434,478,146,126],iceTotem:[580,465,176,228],iceTree:[402,622,166,146],iceRock:[13,602,198,158],iceBush:[198,496,114,102],iceBridge:[961,431,680,202],
 templeGround:[0,0,620,140],templeSmall:[0,150,300,128],
 canyonGround:[0,0,620,140],canyonSmall:[0,150,300,128]
};
const scenery=[];
const rocks=[];
const platforms=[];
const normal=[];
const tnts=[];
const masks=[];
const fruitList=[];
const tileSR={groundL:[12,12,186,269],groundM:[210,12,210,269],groundR:[432,12,186,269],floatL:[12,305,142,256],floatM:[166,305,210,256],floatR:[388,305,143,256],smallL:[12,585,110,250],smallM:[134,585,120,250],smallR:[266,585,111,250]};
const turtleSR={
 walk:[[0,0,220,170],[220,0,220,170],[440,0,220,170],[660,0,220,170],[880,0,220,170]],
 hide:[[0,170,220,170],[220,170,220,170]],
 shell:[440,170,220,170],
 peek:[[660,170,220,170],[880,170,220,170]]
};
const enemySR={
 swampTurtle:[[26,77,166,129],[199,86,164,120],[369,68,197,138],[574,65,199,141]],
 frog:[[34,309,143,130],[186,311,136,128],[326,320,170,116],[496,312,164,124],[656,306,181,118]],
 mosquito:[[32,523,166,173],[209,514,152,177],[362,511,155,181],[527,526,166,168],[711,531,176,156]],
 penguin:[[48,97,125,152],[182,97,123,152],[307,99,163,149],[478,113,151,137],[642,148,189,107]],
 seal:[[18,340,146,139],[161,340,145,139],[303,341,133,136],[418,351,170,128],[584,352,152,128]],
 iceShell:[[23,569,155,148],[177,569,153,148],[338,573,162,145],[505,587,181,132],[674,592,178,126]],
 magmaBeetle:[[22,128,371,284],[446,128,378,281],[899,128,372,286],[1336,131,382,282],[19,496,385,313],[445,488,442,322],[887,489,443,325],[1330,509,422,305]],
 emberBat:[[20,83,410,305],[468,121,405,270],[894,189,436,218],[1330,90,424,296],[20,499,412,269],[506,517,381,274],[887,518,443,243],[1330,514,430,269]],
 armadillo:[[14,193,430,236],[451,187,436,246],[887,192,443,242],[1330,192,428,242],[14,589,427,215],[570,561,280,243],[996,561,258,243],[1440,561,257,243]]
};
const enemies=[];
function pushBox(x,y,q=false){normal.push({x,y,w:58,h:58,hit:false,q,breakT:0,kind:'normal'})}
function pushBounceBox(x,y,hits=10){normal.push({x,y,w:58,h:58,hit:false,q:false,breakT:0,kind:'bounce10',bounceMax:hits,bounceLeft:hits,bounceFlash:0})}
function pushLifeBox(x,y){normal.push({x,y,w:58,h:58,hit:false,q:false,breakT:0,kind:'life',bounceFlash:0})}
function isBounceBox(b){return !!b&&b.kind==='bounce10'}
function isLifeBox(b){return !!b&&b.kind==='life'}
function drawBounceBoxSprite(b,bob=0){const fr=b.bounceFlash>.09?bounceBoxSR.compress:(b.bounceFlash>0?bounceBoxSR.spring:((b.bounceLeft??10)<=3?bounceBoxSR.cracked:bounceBoxSR.idle));if(bounceBoxImg){const lift=b.bounceFlash>.09?4:(fr===bounceBoxSR.spring?-3:0);ds(bounceBoxImg,fr,b.x-3,Math.round(b.y+bob-3+lift),64,64);return true}return false}
function drawLifeBoxSprite(b,bob=0){const anim=Math.floor((performance.now()/180+b.x*.02)%3),fr=b.bounceFlash>.09?lifeBoxSR.compress:(b.bounceFlash>0?lifeBoxSR.spring:(anim===2?lifeBoxSR.spring:lifeBoxSR.idle));if(lifeBoxImg){const lift=b.bounceFlash>.09?4:(fr===lifeBoxSR.spring?-2:0);ds(lifeBoxImg,fr,b.x-3,Math.round(b.y+bob-3+lift),64,64);return true}return false}
function lifeHudTarget(){return{x:48,y:42}}
function spawnLifePickupFx(wx,wy){const sx=wx-camX,sy=wy;lifePickupFx.push({sx,sy,x:sx,y:sy,t:0,dur:.72,done:false,fade:0})}
function updateLifePickup(dt){for(let i=lifePickupFx.length-1;i>=0;i--){const f=lifePickupFx[i];f.t+=dt;const q=Math.min(1,f.t/f.dur);if(q<.34){const p=q/.34;f.x=f.sx+Math.sin(p*Math.PI)*10;f.y=f.sy-34*p}else{const p=(q-.34)/.66,d=lifeHudTarget();const ease=1-Math.pow(1-p,3);f.x=f.sx+(d.x-f.sx)*ease;f.y=(f.sy-34)+(d.y-(f.sy-34))*ease-Math.sin(p*Math.PI)*28}if(!f.done&&q>=1)f.done=true;if(f.done){f.fade+=dt;if(f.fade>.18)lifePickupFx.splice(i,1)}}}
function drawLifeIconScreen(sx,sy,size=30,alpha=1,glow=.45){if(!playerImg)return;x.save();x.globalAlpha=alpha;x.translate(sx,sy);const pulse=1+.04*Math.sin(performance.now()/90+sx*.02);x.scale(pulse,pulse);x.shadowColor='rgba(255,236,128,.8)';x.shadowBlur=8+8*glow;ds(playerImg,sr.idle,-size/2,-size/2,size,size);x.restore()}
function grantLifeBoxReward(b){lives++;hudLifePulseT=.55;playSfx('checkpoint',1.24,.85,.09);toast='+1 VIDA!';toastT=1.45;spawnLifePickupFx(b.x+b.w/2,b.y+6);score+=200;shake=Math.max(shake,.1)}
function pushTNT(x,y=groundY-58){tnts.push({x,y,w:58,h:58,active:false,t:3.0,dead:false,blast:0,lastBeep:4})}
function pushFruit(x,y){fruitList.push({x,y,t:false})}
function addWumpas(n=1){n=Math.max(0,Math.floor(n));let gained=0;for(let i=0;i<n;i++){fruits++;if(fruits>=100){fruits-=100;lives++;gained++;playSfx('checkpoint',1.22,.78,.12)}}if(gained){toast=gained>1?'+'+gained+' VIDAS!':'+1 VIDA!';toastT=1.7}return gained}
function pushEnemy(x,a,b,v=65,y=groundY-56,type='turtle'){let dims={turtle:[70,56],swampTurtle:[76,58],frog:[62,52],mosquito:[58,45],penguin:[60,60],seal:[78,52],iceShell:[68,52],armadillo:[84,50],magmaBeetle:[82,62],emberBat:[64,58]}[type]||[70,56];const groundBase=groundY-dims[1];if(Math.abs(y-groundBase)<=14)y=groundBase;enemies.push({x,y,baseY:y,v,a,b,dead:false,hp:1,hitT:0,safeT:0,stompFx:0,h:dims[1],w:dims[0],type,phase:Math.random()*6.28,state:type==='turtle'?'walk':'walk',stateT:0,shellVX:0,shellDir:Math.sign(v)||1})}
function enforceTrapClearance(){
 // A partir da V1.0.7, conflitos não removem caixas/TNT.
 // sanitizeCrateLayout reposiciona mantendo a contagem original da fase.
}

function jungleAssetDef(name){return window.JUNGLE_ASSETS?.[name]||null}
function jungleAssetImg(name){return assetManager.get('jungle_'+name)}
function jungleElementScale(el){return (window.JUNGLE_SCALE||.72)*(el.scaleMul||1)}
function jungleProfile(name){return window.JUNGLE_COLLISION_PROFILES?.[name]||null}
function jungleVisualRect(el){const a=jungleAssetDef(el.asset);if(!a)return{x:el.x,y:el.surfaceY,w:0,h:0,scale:1};const sc=jungleElementScale(el),pr=jungleProfile(el.asset),surface=el.surfaceY??groundY;let y;if(pr&&['platform','terrain','slope','bridge'].includes(a.category)){const top=el.type==='slope'?(el.flipX?(pr.rightTop||0):(pr.leftTop||0)):(pr.top||0);y=surface-top*sc}else y=surface-a.height*sc;return{x:el.x,y,w:a.width*sc,h:a.height*sc,scale:sc}}
function jungleSlopeSurfaceYAt(sl,worldX){if(!sl||worldX<sl.x||worldX>sl.x+sl.w)return null;const t=Math.max(0,Math.min(1,(worldX-sl.x)/sl.w));return sl.y1+(sl.y2-sl.y1)*t}
function jungleSlopeUnder(px,pw=1,pyHint=null,tol=140){if(currentLevel!==1)return null;const cx=px+pw/2;let best=null,bestD=Infinity;for(const sl of jungleSlopes){const y=jungleSlopeSurfaceYAt(sl,cx);if(y==null)continue;const d=pyHint==null?0:Math.abs(y-pyHint);if(d<bestD&&d<=tol){best={slope:sl,y};bestD=d}}return best}
function addJunglePlatformRect(x,y,w,h,semi=false,source=null){platforms.push([Math.round(x),Math.round(y),Math.max(1,Math.round(w)),semi?Math.min(28,Math.max(8,Math.round(h))):Math.max(50,Math.round(h)),{jungle:true,source,semi}])}
function createJungleCollision(el){const a=jungleAssetDef(el.asset),pr=jungleProfile(el.asset);if(!a||!pr||el.collision==='none')return;const sc=jungleElementScale(el),baseY=el.surfaceY??groundY;if(el.collision==='slopeDown'||el.collision==='slopeUp'){const left=el.x+(pr.left||0)*sc,right=el.x+(a.width-(pr.right||0))*sc;const delta=(pr.rightTop-pr.leftTop)*sc;const y1=baseY,y2=el.collision==='slopeUp'?baseY-delta:baseY+delta;jungleSlopes.push({x:left,w:right-left,y1,y2,depth:(pr.depth||48)*sc,asset:el.asset});return}if(el.collision==='steps'||el.collision==='stepsUp'){for(const seg of pr.segments||[]){addJunglePlatformRect(el.x+seg[0]*sc,baseY+seg[1]*sc,seg[2]*sc,(pr.depth||48)*sc,false,el.asset)}return}if(el.collision==='oneWay'){addJunglePlatformRect(el.x+(pr.left||0)*sc,baseY,(a.width-(pr.left||0)-(pr.right||0))*sc,(pr.depth||16)*sc,true,el.asset);return}if(el.collision==='obstacle'){const h=(pr.depth||125)*sc;jungleObjectColliders.push({x:el.x+(pr.left||0)*sc,y:baseY-h,w:(a.width-(pr.left||0)-(pr.right||0))*sc,h,kind:'jungleObject',source:el.asset});return}addJunglePlatformRect(el.x+(pr.left||0)*sc,baseY,(a.width-(pr.left||0)-(pr.right||0))*sc,(pr.depth||58)*sc,false,el.asset)}
function buildJunglePhase(){for(const k of Object.keys(jungleScene))jungleScene[k].length=0;jungleSlopes.length=0;jungleObjectColliders.length=0;const data=window.JUNGLE_LEVEL_DATA;if(!data)return;for(const k of ['background','terrain','back','objects','front'])for(const raw of data[k]||[]){const el={...raw};jungleScene[k].push(el);createJungleCollision(el)}const g=window.JUNGLE_GAMEPLAY_DATA||{};for(const [x,surface,q] of g.boxes||[])pushBox(x,surface-58,!!q);for(const [x,surface] of g.lifeBoxes||[])pushLifeBox(x,surface-58);for(const [x,surface,hits] of g.bounceBoxes||[])pushBounceBox(x,surface-58,hits||10);for(const [x,surface] of g.tnts||[])pushTNT(x,surface-58);for(const [x,y] of g.masks||[])masks.push({x,y,t:false});for(const [x,y] of g.fruits||[])pushFruit(x,y);for(const e of g.enemies||[]){const dims={turtle:[70,56],armadillo:[84,50]}[e.type]||[70,56];pushEnemy(e.x,e.a,e.b,e.v,e.surfaceY-dims[1],e.type);enemies[enemies.length-1].followSlope=!!e.followSlope}for(const h of g.hazards||[])hazards.push({...h});for(const [x,phase] of g.spikes||[])spikeTraps.push({x,y:groundY,w:112,phase});for(const [x,y,phase] of g.swing||[])swingingLogs.push({x,y,phase});for(const [x,phase] of g.press||[])stonePresses.push({x,phase})}
function drawJungleElement(el){const img=jungleAssetImg(el.asset),a=jungleAssetDef(el.asset);if(!img||!a)return;const vr=jungleVisualRect(el);if(!visibleWorldX(vr.x,vr.w,180))return;x.save();if(el.animated==='torch'){const pulse=.82+.18*Math.sin(performance.now()/95+el.x);x.shadowColor='#ff9c38';x.shadowBlur=12+8*pulse}ds(img,null,vr.x,vr.y,vr.w,vr.h,!!el.flipX);if(el.animated==='torch'){x.globalAlpha=.10+.07*Math.sin(performance.now()/115+el.x);x.fillStyle='#ffb24a';x.beginPath();x.arc(vr.x+vr.w*.5,vr.y+vr.h*.2,26,0,Math.PI*2);x.fill()}x.restore()}
function drawJungleLayer(layer){if(currentLevel!==1)return;for(const el of jungleScene[layer]||[])drawJungleElement(el)}
function jungleEnemySlopeY(e){if(currentLevel!==1||!e.followSlope)return null;const hit=jungleSlopeUnder(e.x,e.w,e.y+e.h,220);return hit?hit.y-e.h:null}
function objectSupported(o){
 const bottom=o.y+o.h;
 if(platforms.some(q=>o.x>=q[0]-2&&o.x+o.w<=q[0]+q[2]+2&&Math.abs(bottom-q[1])<=3))return true;
 const sl=jungleSlopeUnder(o.x,o.w,bottom,8);return !!(sl&&Math.abs(bottom-sl.y)<=4)
}
function objectSupportedByPlaced(o,list){
 const bottom=o.y+o.h;
 return list.some(v=>v!==o&&!v.hit&&!v.dead&&o.x>=v.x-2&&o.x+o.w<=v.x+v.w+2&&Math.abs(bottom-v.y)<=3)
}
function objectCutsPlatform(o){
 const r={x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-6};
 return platforms.some(q=>rect(r,{x:q[0],y:q[1],w:q[2],h:q[3]}))
}
function objectHitsLevelBlocker(o,extraPad=8){
 const r={x:o.x-extraPad,y:o.y-extraPad,w:o.w+extraPad*2,h:o.h+extraPad*2};
 for(const rock of rocks)if(rect(r,rock))return true;
 for(const solid of jungleObjectColliders)if(rect(r,solid))return true;
 for(const st of spikeTraps){if(rect(r,{x:st.x-24,y:groundY-90,w:(st.w||112)+48,h:90}))return true}
 for(const ps of stonePresses){if(rect(r,{x:ps.x-20,y:groundY-125,w:210,h:125}))return true}
 for(const sw of swingingLogs){if(Math.abs((o.x+o.w/2)-sw.x)<145&&o.y+o.h>groundY-90)return true}
 for(const h of hazards){if(['pit','spikes','iceSpike','poison'].includes(h.type)&&rect(r,{x:h.x,y:h.y,w:h.w,h:h.h}))return true}
 return false
}
function sameSupportSafeX(o,x,occupied,reserved=null){
 const test={...o,x};
 const stackedSupport=currentLevel<=3&&objectSupportedByPlaced(test,occupied);
 const supported=objectSupported(test)||stackedSupport;
 if(x<8||x+o.w>worldW-8||!supported||objectCutsPlatform(test)||objectHitsLevelBlocker(test,10))return false;
 if(reserved&&rect({x:test.x-18,y:test.y-8,w:test.w+36,h:test.h+16},reserved))return false;
 const overlapProbe=currentLevel<=3?test:{x:test.x-10,y:test.y-4,w:test.w+20,h:test.h+8};
 return !occupied.some(v=>rect(overlapProbe,{x:v.x,y:v.y,w:v.w,h:v.h}))
}
function relocateObjectOnSupport(o,occupied,reserved=null){
 if(sameSupportSafeX(o,o.x,occupied,reserved))return true;
 for(let d=16;d<=280;d+=16){
   for(const dir of [1,-1]){const nx=o.x+d*dir;if(sameSupportSafeX(o,nx,occupied,reserved)){o.x=nx;return true}}
 }
 return false
}
function checkpointCandidateValid(x){
 const cp={x,y:groundY-58,w:58,h:58};
 if(!objectSupported(cp)||objectCutsPlatform(cp)||objectHitsLevelBlocker(cp,18))return false;
 // Checkpoint fica em uma área aberta: não embaixo de plataforma suspensa.
 for(const q of platforms){if(q[1]<groundY&&x+cp.w>q[0]-14&&x<q[0]+q[2]+14)return false}
 return true
}
function configureCheckpointForLevel(){
 const preferred={1:2760,2:2850,3:2880,4:2780,5:2460}[currentLevel]||2460;
 let chosen=null;
 const candidates=[preferred];
 for(let d=24;d<=700;d+=24){candidates.push(preferred+d,preferred-d)}
 for(const cx of candidates){if(checkpointCandidateValid(cx)){chosen=cx;break}}
 if(chosen==null){
   const fallback=[];
   for(const q of platforms){
     if(q[1]!==groundY||q[2]<100)continue;
     for(let x=q[0]+20;x<=q[0]+q[2]-78;x+=24)fallback.push(x)
   }
   fallback.sort((a,b)=>Math.abs(a-preferred)-Math.abs(b-preferred));
   chosen=fallback.find(checkpointCandidateValid)??preferred;
 }
 checkpointBox={x:chosen,y:groundY-58,w:58,h:58};
 checkpointRespawnX=Math.min(worldW-120,chosen+96);
}
function sanitizeCrateLayout(){
 // Reserva primeiro a área do checkpoint e depois organiza caixas/TNT sem sobreposição.
 const occupied=[];
 const all=[...normal,...tnts];
 for(const o of all){
   if(!relocateObjectOnSupport(o,occupied,checkpointBox)){
     // Se a vizinhança imediata estiver cheia, procura o ponto válido mais próximo
     // em qualquer plataforma que tenha a mesma altura de apoio.
     const candidates=[];
     for(const q of platforms){
       if(Math.abs((o.y+o.h)-q[1])>3)continue;
       for(let x=q[0]+12;x<=q[0]+q[2]-o.w-12;x+=16)candidates.push(x)
     }
     candidates.sort((a,b)=>Math.abs(a-o.x)-Math.abs(b-o.x));
     for(const x of candidates){if(sameSupportSafeX(o,x,occupied,checkpointBox)){o.x=x;break}}
   }
   occupied.push(o)
 }
}
function groundEnemyType(type){return !['mosquito','emberBat'].includes(type)}
function enemySafeAt(e,nx,settled=[]){
 const ew=e.w||70,eh=e.h||56;
 if(nx<8||nx+ew>worldW-8)return false;
 const test={x:nx,y:e.y,w:ew,h:eh};
 if(groundEnemyType(e.type)&&!hasGroundSupport(test.x,test.y,test.w,test.h,5))return false;
 const blockers=[];
 for(const b of normal)if(!b.hit&&(Math.abs((b.y+b.h)-(e.y+eh))<=18||rect(test,{x:b.x,y:b.y,w:b.w,h:b.h})))blockers.push({x:b.x-12,y:b.y-6,w:b.w+24,h:b.h+12});
 for(const t of tnts)if(!t.dead&&(Math.abs((t.y+t.h)-(e.y+eh))<=18||rect(test,{x:t.x,y:t.y,w:t.w,h:t.h})))blockers.push({x:t.x-14,y:t.y-8,w:t.w+28,h:t.h+16});
 for(const h of hazards){if(!['pit','spikes','iceSpike','poison'].includes(h.type))continue;const nearBand=Math.abs((e.y+eh)-h.y)<=20||rect(test,{x:h.x,y:h.y,w:h.w,h:h.h});if(nearBand)blockers.push({x:h.x-18,y:h.y-4,w:h.w+36,h:h.h+12})}
 if(checkpointBox?.w)blockers.push({x:checkpointBox.x-18,y:checkpointBox.y-8,w:checkpointBox.w+36,h:checkpointBox.h+16});
 if(portal?.w)blockers.push({x:portal.x-30,y:portal.y-10,w:portal.w+60,h:portal.h+20});
 if(currentLevel===3&&e.y+eh>groundY-90){for(const sw of swingingLogs)blockers.push({x:sw.x-145,y:groundY-90,w:290,h:90})}
 for(const s of settled){if(Math.abs((s.y+s.h)-(e.y+eh))<=16)blockers.push({x:s.x-20,y:s.y-4,w:s.w+40,h:s.h+8})}
 return !blockers.some(r=>rect(test,r));
}
function bestEnemyPatrolSegment(e,settled=[]){
 const local=currentLevel===3&&Number.isFinite(e.a)&&Number.isFinite(e.b);
 const left=local?Math.max(8,Math.min(e.a,e.b)-160):8;
 const right=local?Math.min(worldW-(e.w||70)-8,Math.max(e.a,e.b)+160):Math.min(worldW-(e.w||70)-8,worldW-8);
 const samples=[];
 for(let nx=left;nx<=right;nx+=8)if(enemySafeAt(e,nx,settled))samples.push(nx);
 if(e.x>=left&&e.x<=right&&enemySafeAt(e,e.x,settled)&&!samples.includes(e.x))samples.push(e.x);
 samples.sort((a,b)=>a-b);
 if(!samples.length)return null;
 const segs=[];let start=samples[0],prev=samples[0];
 for(let i=1;i<samples.length;i++){const v=samples[i];if(v-prev>9){segs.push({start,end:prev});start=v}prev=v}
 segs.push({start,end:prev});
 segs.sort((A,B)=>{const lenA=A.end-A.start,lenB=B.end-B.start,dA=Math.abs(((A.start+A.end)/2)-e.x),dB=Math.abs(((B.start+B.end)/2)-e.x);if(currentLevel<=3){if(dA!==dB)return dA-dB;return lenB-lenA}if(lenB!==lenA)return lenB-lenA;return dA-dB});
 return segs[0];
}
function sanitizeEnemyPatrols(){
 const settled=[];
 for(const e of enemies){
   const seg=bestEnemyPatrolSegment(e,settled);if(seg){e.a=seg.start;e.b=seg.end;const clamped=Math.max(seg.start,Math.min(seg.end,e.x));if(enemySafeAt(e,clamped,settled))e.x=clamped;else e.x=Math.round((seg.start+seg.end)/2)}
   if(e.followSlope){const y=jungleEnemySlopeY(e);if(y!=null)e.y=y;e.baseY=e.y}
   settled.push({x:e.x,y:e.y,w:e.w||70,h:e.h||56})
 }
}
function sanitizeLevelLayout(){
 for(const h of hazards)if(h.type==='spikes'){h.y=groundY-55;h.h=55}
 for(const st of spikeTraps)st.y=groundY;
 enforceTrapClearance();
 configureCheckpointForLevel();
 sanitizeCrateLayout();
 sanitizeEnemyPatrols();
 // Revalida o checkpoint após possíveis ajustes das caixas.
 if(!checkpointCandidateValid(checkpointBox.x))configureCheckpointForLevel();
}

function clearMutableLevel(){[swingingLogs,stonePresses,spikeTraps,hazards,foreground,phaseDeco,scenery,rocks,platforms,normal,tnts,masks,fruitList,enemies,jungleSlopes,jungleObjectColliders].forEach(a=>a.length=0);for(const k of Object.keys(jungleScene))jungleScene[k].length=0}
function addHighRouteAssists(level){
 // Tartarugas ficam antes das rotas altas: pise nelas, espere o casco e use o super-pulo.
 const turtles={
  3:[[2300,2220,2330,50,355],[3710,3660,3740,-52,355]],
  4:[[2800,2720,2880,54,455],[4420,4320,4515,-56,455]],
  5:[[2410,2340,2500,52,455],[4200,4140,4290,-54,455]]
 }[level]||[];
 for(const [x,a,b,v,surface] of turtles){if(!enemies.some(e=>e.type==='turtle'&&Math.abs(e.x-x)<55))pushEnemy(x,a,b,v,surface-56,'turtle')}
 const bounce={3:[2590,300],4:[4600,295],5:[4525,300]}[level];
 if(bounce)pushBounceBox(bounce[0],bounce[1]-58,10);
}
function auditLevelDesign(){
 // Corrige apenas erros evidentes: objetos apoiados e inimigos presos à superfície definida.
 for(const b of normal){if(b.hit)continue;const stacked=currentLevel<=3&&objectSupportedByPlaced(b,[...normal,...tnts]);if(!objectSupported(b)&&!stacked&&currentLevel!==1){const supports=platforms.filter(q=>q[0]<=b.x+29&&q[0]+q[2]>=b.x+29).map(q=>q[1]).filter(y=>y>=b.y+b.h-8);if(supports.length)b.y=Math.min(...supports)-b.h}}
 for(const e of enemies){if(e.type==='turtle'&&e.baseY!=null)e.y=e.baseY}
}
function setLevel(n=1){
 clearMutableLevel(); currentLevel=n;levelMode='platform';snowballX=-540;snowballSpeed=205;rideState=null;avalancheState=null;bossState=null;
 if(n===10){
   levelMode='boss';currentLevelName='TEMPLO DA CONQUISTA';currentCheckpointDefault=110;portal.x=900;portal.y=238;bossState=window.FinalBoss?.create?.()||null;platforms.push([0,groundY,960,100]);
 }else if(n===9){
   levelMode='ride';currentLevelName='CORRIDA DO JAVALI';currentCheckpointDefault=0;portal.x=5360;portal.y=245;rideState=buildRideState();
   platforms.push([0,groundY,worldW,100]);
 }else if(n===8){
   levelMode='avalanche';currentLevelName='PEDRA DA SELVA';currentCheckpointDefault=0;portal.x=5360;portal.y=238;avalancheState=buildAvalancheState();
   platforms.push([0,groundY,worldW,100]);
 }else if(n===7){
   levelMode='ride';currentLevelName='CORRIDA POLAR';currentCheckpointDefault=0;portal.x=5360;portal.y=245;rideState=buildRideState();
   // Superfície técnica mantém auditorias e saves compatíveis; o desenho usa a pista pseudo-3D.
   platforms.push([0,groundY,worldW,100]);
 }else if(n===6){
   levelMode='avalanche';currentLevelName='AVALANCHE ALPINA';currentCheckpointDefault=0;portal.x=5360;portal.y=238;avalancheState=buildAvalancheState();
   platforms.push([0,groundY,worldW,100]);
   /*
   Layout lateral V1.07 preservado abaixo como referência de design, mas o modo
   avalanche frontal usa somente a superfície técnica acima.
   platforms.push([0,groundY,760,100],[870,groundY,720,100],[1700,groundY,690,100],[2500,groundY,760,100],[3370,groundY,680,100],[4160,groundY,720,100],[4990,groundY,610,100],
    [430,355,175,28],[1030,350,175,28],[1430,300,160,28],[1910,350,180,28],[2730,350,180,28],[3120,325,175,28],[3620,350,180,28],[4470,350,180,28],[4820,300,165,28]);
   hazards.push({type:'pit',x:760,y:455,w:110,h:120},{type:'iceSpike',x:1210,y:402,w:150,h:53},{type:'pit',x:1590,y:455,w:110,h:120},{type:'iceSpike',x:2140,y:402,w:150,h:53},{type:'pit',x:2390,y:455,w:110,h:120},{type:'iceSpike',x:2970,y:402,w:155,h:53},{type:'pit',x:3260,y:455,w:110,h:120},{type:'iceSpike',x:3820,y:402,w:150,h:53},{type:'pit',x:4050,y:455,w:110,h:120},{type:'iceSpike',x:4670,y:402,w:150,h:53},{type:'pit',x:4880,y:455,w:110,h:120});
   [260,520,930,1120,1760,1990,2580,2790,3420,3650,4200,4510,5060,5290].forEach((px,i)=>pushBox(px,groundY-58,i%4===0));
   pushBox(1080,350-58,true);pushBox(3180,325-58,true);pushLifeBox(4510,350-58);[1500,2320,3980,4800].forEach(px=>pushTNT(px));
   [180,360,650,910,1080,1320,1530,1780,2040,2290,2550,2830,3090,3360,3650,3920,4210,4490,4770,5070,5350].forEach((px,i)=>pushFruit(px,groundY-115-(i%3)*20));
   masks.push({x:1460,y:230,t:false},{x:3190,y:225,t:false},{x:4780,y:245,t:false});
   pushEnemy(1840,1760,2130,72,groundY-60,'penguin');pushEnemy(3500,3420,3780,-70,groundY-52,'iceShell');pushEnemy(5150,5050,5350,78,groundY-60,'penguin');
   */
 }else if(n===5){
   currentLevelName='CÂNION RUBRO'; currentCheckpointDefault=95; portal.x=5325; portal.y=238;
   // Fase inédita: cânion vermelho com rajadas de vento, plataformas alternadas e TNT em cadeia.
   phaseDeco.push({s:'rockA',x:220,y:330,w:125,h:105},{s:'totem',x:1120,y:285,w:120,h:165},{s:'rockB',x:1840,y:335,w:130,h:100},{s:'totem',x:2860,y:275,w:125,h:175},{s:'rockC',x:4020,y:330,w:130,h:105},{s:'totem',x:4920,y:275,w:125,h:175});
   platforms.push([0,groundY,560,100],[688,groundY,420,100],[1236,groundY,450,100],[1814,groundY,390,100],[2332,groundY,520,100],[2980,groundY,420,100],[3528,groundY,460,100],[4116,groundY,430,100],[4684,groundY,716,100],
    [300,355,160,28],[770,355,170,28],[1320,355,160,28],[1510,295,150,28],[1900,355,160,28],[2440,355,170,28],[2700,300,155,28],[3110,355,160,28],[3650,355,170,28],[4240,355,160,28],[4480,300,170,28],[4920,355,180,28]);
   hazards.push({type:'pit',x:560,y:455,w:128,h:120},{type:'gust',x:1000,y:250,w:210,h:205,dir:1,power:120},{type:'pit',x:1108,y:455,w:128,h:120},{type:'spikes',x:1680,y:400,w:134,h:55,s:'spikes'},{type:'gust',x:2030,y:245,w:210,h:210,dir:-1,power:135},{type:'pit',x:2204,y:455,w:128,h:120},{type:'pit',x:2852,y:455,w:128,h:120},{type:'spikes',x:3400,y:400,w:128,h:55,s:'spikes'},{type:'gust',x:3740,y:235,w:230,h:220,dir:1,power:145},{type:'pit',x:3988,y:455,w:128,h:120},{type:'pit',x:4546,y:455,w:138,h:120});
   swingingLogs.push({x:1740,y:105,phase:.8},{x:3270,y:95,phase:2.4},{x:4350,y:100,phase:1.5});stonePresses.push({x:2570,phase:.5},{x:3880,phase:2.2});
   [260,510,740,980,1280,1450,1880,2070,2380,2680,3030,3260,3580,3810,4160,4430,4760,5010,5280].forEach((px,i)=>pushBox(px,groundY-58,i%3===0));
   pushBox(820,355-58,true);pushBox(1550,295-58,false);pushBox(2480,355-58,true);pushBox(2730,300-58,false);pushBox(4320,355-58,true);pushBox(4990,355-58,false);
   [930,2140,3160,4470].forEach(px=>pushTNT(px));pushLifeBox(3700,355-58);masks.push({x:1420,y:265,t:false},{x:2760,y:175,t:false},{x:4400,y:250,t:false});
   [180,360,620,800,1040,1280,1490,1730,1940,2160,2400,2630,2860,3090,3330,3560,3790,4020,4250,4480,4710,4940,5170,5380].forEach((px,i)=>pushFruit(px,groundY-112-(i%4)*18));
   pushEnemy(760,700,1050,78,groundY-56,'magmaBeetle');pushEnemy(1320,1260,1600,-72,groundY-56,'turtle');pushEnemy(1880,1840,2160,82,groundY-52,'magmaBeetle');pushEnemy(2440,2380,2730,-88,groundY-56,'turtle');pushEnemy(3040,2990,3300,92,groundY-56,'magmaBeetle');pushEnemy(3590,3550,3860,-76,315,'emberBat');pushEnemy(4180,4140,4470,86,315,'emberBat');pushEnemy(4810,4740,5200,-96,groundY-56,'magmaBeetle');
  }else if(n===4){
   currentLevelName='PICOS CONGELADOS'; currentCheckpointDefault=105; portal.x=5320; portal.y=238;
   phaseDeco.push({s:'iceCrystal',x:260,y:315,w:125,h:125},{s:'iceTree',x:900,y:320,w:135,h:118},{s:'iceTotem',x:1720,y:285,w:115,h:160},{s:'iceCrystal',x:2470,y:315,w:135,h:130},{s:'iceRock',x:3280,y:345,w:125,h:100},{s:'iceTree',x:4010,y:320,w:135,h:118},{s:'iceCrystal',x:4890,y:310,w:140,h:135});
   platforms.push([0,groundY,620,100],[760,groundY,470,100],[1380,groundY,520,100],[2060,groundY,420,100],[2640,groundY,560,100],[3380,groundY,510,100],[4050,groundY,650,100],[4870,groundY,730,100],
    [450,355,160,28],[930,355,150,28],[1530,355,170,28],[2250,355,160,28],[2770,355,170,28],[3090,300,150,28],[3550,355,160,28],[4200,355,170,28],[4560,295,150,28],[5050,355,170,28]);
   hazards.push({type:'iceSpike',x:620,y:402,w:140,h:53},{type:'pit',x:1230,y:455,w:150,h:120},{type:'iceSpike',x:1900,y:402,w:160,h:53},{type:'pit',x:2480,y:455,w:160,h:120},{type:'iceSpike',x:3200,y:402,w:180,h:53},{type:'pit',x:3890,y:455,w:160,h:120},{type:'iceSpike',x:4700,y:402,w:170,h:53});
   stonePresses.push({x:1810,phase:.3},{x:3660,phase:1.5});
   [350,520,860,1060,1460,1660,2140,2310,2720,2920,3110,3470,3650,4140,4330,4560,5000,5200].forEach((px,i)=>pushBox(px,groundY-58,i%4===0));
   pushBox(480,355-58,true);pushBox(1580,355-58,false);pushBox(3115,300-58,true);pushBox(5100,355-58,false);
   [1130,2380,3740,4620].forEach(px=>pushTNT(px));
   pushLifeBox(4250,355-58);
   masks.push({x:980,y:255,t:false},{x:3130,y:175,t:false},{x:5050,y:250,t:false});
   [270,600,800,1040,1280,1520,1830,2130,2430,2690,3010,3300,3560,3920,4210,4510,4820,5150,5380].forEach((px,i)=>pushFruit(px,groundY-112-(i%4)*18));
   pushEnemy(820,780,1140,90,groundY-60,'penguin');pushEnemy(1480,1420,1840,58,groundY-52,'seal');pushEnemy(2160,2090,2410,72,groundY-52,'iceShell');pushEnemy(2860,2710,3160,-96,groundY-60,'penguin');pushEnemy(3480,3410,3840,62,groundY-52,'seal');pushEnemy(4250,4120,4650,76,groundY-52,'iceShell');pushEnemy(5100,4930,5420,-102,groundY-60,'penguin');
 } else if(n===3){
   currentLevelName='PÂNTANO SOMBRIO'; currentCheckpointDefault=100; portal.x=5310; portal.y=242;
   phaseDeco.push({s:'swampReeds',x:120,y:330,w:125,h:115},{s:'swampTree',x:620,y:250,w:155,h:195},{s:'swampTotem',x:1390,y:270,w:135,h:175},{s:'swampLily',x:2110,y:405,w:135,h:55},{s:'swampLantern',x:2730,y:345,w:65,h:80},{s:'swampBoat',x:3470,y:355,w:145,h:82},{s:'swampSkull',x:4260,y:360,w:110,h:85},{s:'swampTree',x:4920,y:255,w:150,h:190});
   platforms.push([0,groundY,650,100],[790,groundY,520,100],[1480,groundY,450,100],[2090,groundY,500,100],[2740,groundY,490,100],[3390,groundY,580,100],[4140,groundY,500,100],[4820,groundY,780,100],
    [470,355,160,28],[960,355,150,28],[1210,295,160,28],[1650,355,160,28],[2220,355,170,28],[2550,300,150,28],[3020,355,160,28],[3650,355,170,28],[4000,300,150,28],[4440,355,160,28],[5080,355,170,28]);
   hazards.push({type:'poison',x:650,y:455,w:140,h:100},{type:'pit',x:1310,y:455,w:170,h:120},{type:'poison',x:1930,y:455,w:160,h:100},{type:'pit',x:2590,y:455,w:150,h:120},{type:'poison',x:3230,y:455,w:160,h:100},{type:'pit',x:3970,y:455,w:170,h:120},{type:'poison',x:4640,y:455,w:180,h:100});
   swingingLogs.push({x:1790,y:115,w:170,h:310,phase:.2},{x:4380,y:110,w:170,h:310,phase:1.8});
   [340,510,880,1060,1510,1600,2150,2400,2760,3000,3160,3470,3660,4200,4496,4920,5140].forEach((px,i)=>pushBox(px,groundY-58,i%3===0));
   pushBox(500,355-58,true);pushBox(1240,295-58,false);pushBox(3050,355-58,true);pushBox(5190,355-58,false);
   [1170,2470,3730,4566].forEach(px=>pushTNT(px));
   pushLifeBox(4470,355-58);
   masks.push({x:1000,y:250,t:false},{x:3040,y:205,t:false},{x:5120,y:245,t:false});
   [260,590,830,1030,1260,1490,1780,2050,2320,2670,2910,3270,3540,3890,4180,4480,4770,5060,5360].forEach((px,i)=>pushFruit(px,groundY-112-(i%3)*18));
   pushEnemy(950,940,980,58,groundY-58,'swampTurtle');pushEnemy(2290,2280,2330,42,groundY-52,'frog');pushEnemy(2210,2140,2490,48,315,'mosquito');pushEnemy(3070,3060,3110,-56,groundY-52,'frog');pushEnemy(3490,3410,3900,50,300,'mosquito');pushEnemy(4030,4010,4070,60,300-58,'swampTurtle');pushEnemy(5093,5085,5120,70,355-50,'armadillo');pushEnemy(5040,4980,5080,-46,groundY-52,'frog');
 } else if(n===2){
   // FASE 2 v1.02 — TEMPLO PERDIDO reconstruído com rota principal contínua.
   currentLevelName='TEMPLO PERDIDO'; currentCheckpointDefault=110; portal.x=5310; portal.y=238;

   // SETORES VISUAIS: introdução -> ruínas -> subida -> pátio vertical -> descida -> portal.
   scenery.push(
    {x:140,y:285,k:'totem',w:92,h:138},{x:470,y:300,k:'vine',w:48,h:145},{x:780,y:310,k:'tree2',w:125,h:178},
    {x:1180,y:292,k:'totem',w:110,h:158},{x:1760,y:320,k:'flowers',w:110,h:125},{x:2250,y:288,k:'totem',w:110,h:160},
    {x:2830,y:292,k:'vine',w:52,h:160},{x:3500,y:300,k:'tree2',w:126,h:180},{x:4140,y:302,k:'totem',w:108,h:158},
    {x:4740,y:330,k:'torch',w:58,h:110},{x:5100,y:310,k:'mushroom',w:100,h:118}
   );
   // Pedras são composição visual: não criam hitbox invisível atravessando caixas/rotas.
   scenery.push(
    {x:900,y:390,k:'rockC',w:86,h:60},{x:2040,y:390,k:'rockB',w:90,h:62},
    {x:3260,y:390,k:'rockA',w:92,h:62},{x:4410,y:390,k:'rockC',w:90,h:62}
   );

   platforms.push(
    // SETOR 1 — INTRODUÇÃO (0–800): chão simples e leitura limpa.
    [0,groundY,620,100],[720,groundY,500,100],
    [250,365,145,28],

    // SETOR 2 — PRIMEIROS DESAFIOS (800–1700): pequenos vãos e subida leve.
    [1220,groundY,420,100],
    [860,385,150,28],[1080,355,150,28],[1480,390,155,28],

    // SETOR 3 — SUBIDA DO TEMPLO (1700–2850): mudanças graduais, nunca salto brusco.
    [1740,groundY,330,100],
    [2040,430,250,72],[2260,405,250,72],[2480,380,300,72],
    [2750,405,180,72],[2900,430,180,72],[3050,groundY,560,100],

    // ROTA ALTA OPCIONAL: recompensas e caixa especial; não substitui a rota normal.
    [2210,325,150,28],[2390,300,160,28],[2580,278,165,28],[2780,300,160,28],

    // SETOR 4 — PÁTIO VERTICAL (3200–3950): subida curta em degraus e retorno.
    [3560,430,190,72],[3720,405,190,72],[3880,430,190,72],
    [4050,groundY,390,100],
    [3400,340,150,28],[3570,310,155,28],[3750,285,155,28],

    // SETOR 5 — DESCIDA / RITMO (3950–4700): volta para corrida e um vão estruturado.
    [4440,groundY,260,100],[4830,groundY,330,100],
    [4250,365,155,28],[4540,350,160,28],

    // SETOR 6 — RETA FINAL (4700–5600): baixa complexidade e zona segura do portal.
    [5160,groundY,440,100],[4920,365,155,28]
   );

   hazards.push(
    {type:'pit',x:620,y:455,w:100,h:120},
    {type:'pit',x:1740-100,y:455,w:100,h:120},
    {type:'spikes',x:1540,y:400,w:92,h:55,s:'spikes'},
    {type:'spikes',x:3310,y:400,w:96,h:55,s:'spikes'},
    {type:'pit',x:4700,y:455,w:130,h:120},
    {type:'spikes',x:4985,y:400,w:90,h:55,s:'spikes'}
   );

   // Armadilhas ficam separadas por áreas de respiro.
   swingingLogs.push({x:1880,y:82,w:170,h:310,phase:.45},{x:4380,y:80,w:170,h:310,phase:2.0});
   stonePresses.push({x:4010,phase:1.45});

   // CAIXAS — pequenos encontros, não uma caixa a cada X pixels.
   [
    [180,455,false],[238,455,false],[430,455,true],[790,455,false],
    [730,455,false],[1280,455,false],[1340,455,true],
    [2050,430,false],[2112,430,false],[3240,455,false],[3490,455,true],
    [4550,350,false],[4612,350,false],[4620,455,false],[4920,365,true],[5220,455,false]
   ].forEach(([px,surface,q])=>pushBox(px,surface-58,q));
   pushBox(2700,380-58,false);pushBox(2860,405-58,true);
   pushBox(900,327,true);pushBox(1120,297,false);
   pushBox(2950,430-58,false);pushBox(2555,380-58,true);
   pushBox(3440,282,true);pushBox(3790,227,false);
   pushBox(5010,365-58,false);

   pushTNT(1160);
   pushTNT(2180,430-58);
   pushTNT(3420);
   pushTNT(4555);
   pushTNT(5095);

   // Caixa de 10 pulos e Aku Aku ficam em rotas opcionais alcançáveis sem serem obrigatórios.
   pushBounceBox(2605,278-58,10);
   pushLifeBox(3790,227-58);
   masks.push({x:2425,y:235,t:false},{x:3785,y:220,t:false},{x:4960,y:285,t:false});

   // Wumpas guiam a rota principal e as subidas opcionais.
   [90,180,270,430,520].forEach((px,i)=>pushFruit(px,390-(i%3)*12));
   [[610,385],[660,360],[710,385],[800,390],[900,370],[1000,350],[1120,365],[1280,390],[1430,380],[1580,370]].forEach(v=>pushFruit(v[0],v[1]));
   [[1780,390],[1900,382],[2070,350],[2180,330],[2300,310],[2420,290],[2540,270],[2660,292],[2780,320],[2920,348],[3060,375]].forEach(v=>pushFruit(v[0],v[1]));
   [[2240,265],[2350,245],[2470,225],[2590,210],[2710,230],[2820,250]].forEach(v=>pushFruit(v[0],v[1]));
   [[3250,390],[3370,372],[3490,350],[3610,325],[3730,300],[3860,330],[3990,365],[4130,390]].forEach(v=>pushFruit(v[0],v[1]));
   [[4260,390],[4400,382],[4540,370],[4670,385],[4870,390],[5000,375],[5140,390],[5280,385]].forEach(v=>pushFruit(v[0],v[1]));

   // INIMIGOS — com áreas de patrulha claras e pausas entre encontros.
   pushEnemy(1010,950,1080,56,groundY-56,'turtle');
   pushEnemy(1450,1405,1480,-54,groundY-56,'armadillo');
   pushEnemy(2430,2410,2460,50,300-50,'armadillo');
   // Tartaruga opcional realmente permanece na rota alta, longe dos espinhos do chão.
   pushEnemy(3600,3580,3640,42,310-56,'turtle');
   pushEnemy(3920,3890,3960,-58,430-50,'armadillo');
   pushEnemy(4870,4840,4920,55,groundY-56,'turtle');
   pushEnemy(3650,3625,3670,-60,430-50,'armadillo');
 } else {
   // FASE 1 v1.02 — construída por dados usando assets/jungle e manifest.json.
   currentLevelName='ILHA SELVAGEM'; currentCheckpointDefault=80; portal.x=5360; portal.y=245;
   buildJunglePhase();
 }
 configureLevelCrystal(n);
 addHighRouteAssists(n);
 sanitizeLevelLayout();
 auditLevelDesign();
}
// A fase só é construída após o carregamento real dos recursos.

function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function isSemiPlatform(q){return Array.isArray(q)&&q.length>=4&&q[3]>0&&q[3]<50}
function canStandAt(px,bottom){
 const test={x:px+2,y:bottom-p.standH,w:Math.max(1,p.w-4),h:p.standH-2};
 for(const q of platforms){if(isSemiPlatform(q))continue;const r={x:q[0],y:q[1],w:q[2],h:q[3]};if(rect(test,r))return false}
 for(const r of rocks)if(rect(test,r))return false;
 for(const r of jungleObjectColliders)if(rect(test,r))return false;
 for(const b of normal)if(!b.hit&&rect(test,{x:b.x,y:b.y,w:b.w,h:b.h}))return false;
 for(const t of tnts)if(!t.dead&&rect(test,{x:t.x,y:t.y,w:t.w,h:t.h}))return false;
 return true
}
function setPlayerHeight(nextH){if(nextH===p.h)return true;const bottom=p.y+p.h;if(nextH>p.h&&!canStandAt(p.x,bottom))return false;p.h=nextH;p.y=bottom-p.h;return true}
function hasGroundSupport(px,py,pw,ph,eps=3){const foot={x:px+3,y:py+ph-1,w:Math.max(1,pw-6),h:eps+2};for(const q of platforms){const r={x:q[0],y:q[1],w:q[2],h:q[3]};if(foot.x<r.x+r.w&&foot.x+foot.w>r.x&&py+ph<=r.y+eps&&py+ph>=r.y-eps)return true}for(const r of rocks){if(foot.x<r.x+r.w&&foot.x+foot.w>r.x&&py+ph<=r.y+eps&&py+ph>=r.y-eps)return true}for(const b of normal){if(!b.hit&&foot.x<b.x+b.w&&foot.x+foot.w>b.x&&py+ph<=b.y+eps&&py+ph>=b.y-eps)return true}for(const t of tnts){if(!t.dead&&foot.x<t.x+t.w&&foot.x+foot.w>t.x&&py+ph<=t.y+eps&&py+ph>=t.y-eps)return true}const sl=jungleSlopeUnder(px,pw,py+ph,eps+5);if(sl&&Math.abs(py+ph-sl.y)<=eps+3)return true;return false}
function playerOverlapsY(r,skin=4){return p.y+skin<r.y+r.h&&p.y+p.h-skin>r.y}
function playerOverlapsX(r,skin=3){return p.x+skin<r.x+r.w&&p.x+p.w-skin>r.x}
function solidRectsForX(){const out=[];for(const q of platforms)if(!isSemiPlatform(q))out.push({x:q[0],y:q[1],w:q[2],h:q[3],kind:'platform'});for(const r of rocks)out.push({x:r.x,y:r.y,w:r.w,h:r.h,kind:'rock'});for(const r of jungleObjectColliders)out.push({...r});return out}
function resolvePlayerHorizontal(dx){
 const oldX=p.x,targetX=Math.max(0,Math.min(worldW-p.w,oldX+dx));
 if(Math.abs(dx)<.0001){p.x=targetX;return true}
 let resolvedX=targetX;
 const oldLeft=oldX,oldRight=oldX+p.w,targetLeft=targetX,targetRight=targetX+p.w,skin=2;
 const crosses=(r)=>playerOverlapsY(r,5)&&((dx>0&&oldRight<=r.x+skin&&targetRight>r.x)||(dx<0&&oldLeft>=r.x+r.w-skin&&targetLeft<r.x+r.w));
 // Objetos quebráveis são tratados antes dos sólidos estáticos.
 for(const b of normal){if(b.hit)continue;const r={x:b.x,y:b.y,w:b.w,h:b.h};if(!crosses(r)&&!(playerOverlapsY(r,5)&&targetRight>r.x&&targetLeft<r.x+r.w))continue;if(p.spin>0||p.slide>0||akuInvT>0){breakBox(b,akuInvT>0?'power':(p.slide>0?'slide':'spin'));continue}if(dx>0)resolvedX=Math.min(resolvedX,r.x-p.w);else resolvedX=Math.max(resolvedX,r.x+r.w)}
 for(const t of tnts){if(t.dead)continue;const r={x:t.x,y:t.y,w:t.w,h:t.h};if(!crosses(r)&&!(playerOverlapsY(r,5)&&targetRight>r.x&&targetLeft<r.x+r.w))continue;if(akuInvT>0){explode(t);toast='INVENCÍVEL: TNT DESTRUÍDA!';toastT=.75;continue}if(p.spin>0||p.slide>0){explode(t);return false}if(dx>0)resolvedX=Math.min(resolvedX,r.x-p.w);else resolvedX=Math.max(resolvedX,r.x+r.w)}
 for(const r of solidRectsForX()){
   if(!crosses(r)&&!(playerOverlapsY(r,5)&&targetRight>r.x&&targetLeft<r.x+r.w))continue;
   if(dx>0)resolvedX=Math.min(resolvedX,r.x-p.w);else resolvedX=Math.max(resolvedX,r.x+r.w)
 }
 p.x=Math.max(0,Math.min(worldW-p.w,resolvedX));
 if(Math.abs(p.x-targetX)>.001)p.vx=0;
 return true
}
function resolvePlayerVertical(dy,prevY,prevBottom){
 const oldTop=prevY,oldBottom=prevBottom,targetY=p.y+dy,targetTop=targetY,targetBottom=targetY+p.h;
 const xL=p.x+3,xR=p.x+p.w-3;
 const overlapsX=r=>xL<r.x+r.w&&xR>r.x;
 p.on=false;
 if(dy>=0){
   const hits=[];
   for(const q of platforms){const r={x:q[0],y:q[1],w:q[2],h:q[3],semi:isSemiPlatform(q),kind:'platform'};if(overlapsX(r)&&oldBottom<=r.y+(r.semi?10:16)&&targetBottom>=r.y)hits.push(r)}
   for(const r0 of rocks){const r={x:r0.x,y:r0.y,w:r0.w,h:r0.h,kind:'rock'};if(overlapsX(r)&&oldBottom<=r.y+16&&targetBottom>=r.y)hits.push(r)}
   for(const r0 of jungleObjectColliders){const r={...r0};if(overlapsX(r)&&oldBottom<=r.y+16&&targetBottom>=r.y)hits.push(r)}
   if(currentLevel===1){const sl=jungleSlopeUnder(p.x,p.w,targetBottom,220);if(sl&&oldBottom<=sl.y+18&&targetBottom>=sl.y)hits.push({x:p.x,y:sl.y,w:p.w,h:1,kind:'slope'})}
   for(const b of normal){if(b.hit)continue;const r={x:b.x,y:b.y,w:b.w,h:b.h,kind:'box',ref:b};if(overlapsX(r)&&oldBottom<=r.y+14&&targetBottom>=r.y)hits.push(r)}
   for(const t of tnts){if(t.dead)continue;const r={x:t.x,y:t.y,w:t.w,h:t.h,kind:'tnt',ref:t};if(overlapsX(r)&&oldBottom<=r.y+14&&targetBottom>=r.y)hits.push(r)}
   hits.sort((a,b)=>a.y-b.y);
   if(hits.length){const r=hits[0];
     if(r.kind==='box'){p.y=r.y-p.h;if(isBounceBox(r.ref)){bounceBoxHit(r.ref);return}breakBox(r.ref,'stomp');p.vy=-335;p.land=.16;p.stompSquash=.16;return}
     if(r.kind==='tnt'){if(akuInvT>0){explode(r.ref);toast='INVENCÍVEL: TNT DESTRUÍDA!';toastT=.75;p.y=targetY;return}p.y=r.y-p.h;p.vy=-365;if(!r.ref.active){playSfx('tick',1,1,.15);r.ref.active=true;r.ref.t=3;r.ref.lastBeep=4;toast='TNT: 3...';toastT=.9}p.stompSquash=.13;spawnImpact(r.x+r.w/2,r.y,.7);return}
     if(p.vy>330){playSfx('land',Math.min(1.25,.85+p.vy/1800),.55,.08);p.land=.14;puff(p.x+p.w/2,r.y,r.kind==='rock'?4:5)}p.y=r.y-p.h;p.vy=0;p.on=true;return
   }
   p.y=targetY;
 }else{
   const hits=[];
   for(const q of platforms){if(isSemiPlatform(q))continue;const r={x:q[0],y:q[1],w:q[2],h:q[3],kind:'platform'};if(overlapsX(r)&&oldTop>=r.y+r.h-14&&targetTop<=r.y+r.h)hits.push(r)}
   for(const r0 of rocks){const r={x:r0.x,y:r0.y,w:r0.w,h:r0.h,kind:'rock'};if(overlapsX(r)&&oldTop>=r.y+r.h-14&&targetTop<=r.y+r.h)hits.push(r)}
   for(const r0 of jungleObjectColliders){const r={...r0};if(overlapsX(r)&&oldTop>=r.y+r.h-14&&targetTop<=r.y+r.h)hits.push(r)}
   for(const b of normal){if(b.hit)continue;const r={x:b.x,y:b.y,w:b.w,h:b.h,kind:'box',ref:b};if(overlapsX(r)&&oldTop>=r.y+r.h-12&&targetTop<=r.y+r.h)hits.push(r)}
   for(const t of tnts){if(t.dead)continue;const r={x:t.x,y:t.y,w:t.w,h:t.h,kind:'tnt',ref:t};if(overlapsX(r)&&oldTop>=r.y+r.h-12&&targetTop<=r.y+r.h)hits.push(r)}
   hits.sort((a,b)=>(b.y+b.h)-(a.y+a.h));
   if(hits.length){const r=hits[0];
     if(r.kind==='box'){const mode=akuInvT>0?'power':(p.slide>0?'slide':(p.spin>0?'spin':'head'));breakBox(r.ref,mode);p.y=targetY;return}
     if(r.kind==='tnt'&&akuInvT>0){explode(r.ref);toast='INVENCÍVEL: TNT DESTRUÍDA!';toastT=.75;p.y=targetY;return}
     if(r.kind==='tnt'&&(p.spin>0||p.slide>0)){explode(r.ref);return}
     p.y=r.y+r.h;p.vy=70;return
   }
   p.y=targetY
 }
}
function depenetratePlayerFromSolids(){
 // Última rede de segurança: nunca permite que um sólido estático empurre Crash para baixo.
 const body={x:p.x+2,y:p.y+2,w:p.w-4,h:p.h-4};
 const solids=solidRectsForX();
 for(const b of normal)if(!b.hit)solids.push({x:b.x,y:b.y,w:b.w,h:b.h,kind:'box'});
 for(const t of tnts)if(!t.dead)solids.push({x:t.x,y:t.y,w:t.w,h:t.h,kind:'tnt'});
 for(const r of solids){if(!rect(body,r))continue;const pushL=(body.x+body.w)-r.x,pushR=(r.x+r.w)-body.x,pushUp=(body.y+body.h)-r.y;const min=Math.min(pushL,pushR,pushUp);if(min===pushL){p.x-=pushL+2;p.vx=Math.min(0,p.vx)}else if(min===pushR){p.x+=pushR+2;p.vx=Math.max(0,p.vx)}else{p.y-=pushUp+2;p.vy=0;p.on=true}}
}
function snapPlayerToGround(eps=4){
 const bottom=p.y+p.h,xL=p.x+4,xR=p.x+p.w-4;let bestY=null,bestD=Infinity;
 const sl=jungleSlopeUnder(p.x,p.w,bottom,eps+8);if(sl){const gap=sl.y-bottom;if(gap>=-2&&gap<=eps){p.y=sl.y-p.h;p.vy=0;p.on=true;return true}}
 const test=r=>{if(xL>=r.x+r.w||xR<=r.x)return;const d=r.y-bottom;if(d>=-eps&&d<=eps&&Math.abs(d)<bestD){bestD=Math.abs(d);bestY=r.y}};
 for(const q of platforms)test({x:q[0],y:q[1],w:q[2],h:q[3]});
 for(const r of rocks)test(r);for(const r of jungleObjectColliders)test(r);
 for(const b of normal)if(!b.hit)test(b);
 for(const t of tnts)if(!t.dead)test(t);
 if(bestY!=null){p.y=bestY-p.h;p.vy=0;p.on=true;return true}return false
}

function visibleWorldX(px,pw=0,margin=180){return px+pw>=camX-margin&&px<=camX+W+margin}
function akuHoverFrame(seed=0){const t=performance.now()/170+seed;const frames=akuSR.hover;if(Math.floor((performance.now()/950+seed)%7)===6)return akuSR.blink;return frames[Math.floor(t)%frames.length]}
function drawAkuFrame(frame,x,y,w,h,flip=false,a=1){ds(akuImg,frame,x,y,w,h,flip,a)}
function drawAku3Frame(frame,cx,bottom,w,h,flip=false,a=1){if(!aku3PlayerImg||!frame)return false;drawAnchoredFrame(aku3PlayerImg,frame,cx,bottom,w,h,flip,a);return true}
function beginAkuInvincible(){aku=3;akuInvT=20;akuEquipT=1.05;akuTrail.length=0;akuTrailClock=0;akuProtectT=0;inv=Math.max(inv,.9);shake=Math.max(shake,.18);playSfx('aku',1.18,1,.2);startInvincibleMusic();toast='AKU AKU: INVENCÍVEL! 20s';toastT=2.2}
function akuInvincibleEnemyTouch(e,er,mode='spin'){if(akuInvT<=0||e.dead)return false;spawnEnemyFx(e,mode);e.dead=true;e.hitT=.25;score+=250;shake=Math.max(shake,.08);puff((er?.x??e.x)+(er?.w??e.w??70)/2,(er?.y??e.y)+(er?.h??e.h??56)/2,5);return true}
function pushAkuTrail(dt){if(akuInvT<=0){akuTrail.length=0;akuTrailClock=0;return}akuTrailClock-=dt;if(akuTrailClock>0)return;akuTrailClock=.045;let key='idle';if(p.spin>0)key=['spin1','spin2'][Math.floor(p.anim)%2];else if(!p.on)key=p.vy<0?'jump2':'fall';else if(Math.abs(p.vx)>35)key=['run1','run2','run3','run4'][Math.floor(p.anim)%4];akuTrail.push({x:p.x,y:p.y,h:p.h,facing:p.facing,key,t:.28});if(akuTrail.length>7)akuTrail.shift()}
function updateAkuTrail(dt){for(let i=akuTrail.length-1;i>=0;i--){akuTrail[i].t-=dt;if(akuTrail[i].t<=0)akuTrail.splice(i,1)}}
function pad(){const g=connectedPad();if(!g)return{l:0,r:0,d:0,j:0,s:0,p:0};return{l:g.axes[0]<-.25||g.buttons[14]?.pressed,r:g.axes[0]>.25||g.buttons[15]?.pressed,d:g.axes[1]>.45||g.buttons[13]?.pressed,j:!!g.buttons[padbinds.jump]?.pressed,s:!!g.buttons[padbinds.spin]?.pressed,p:!!g.buttons[padbinds.pause]?.pressed}}
function puff(px,py,n=5){for(let i=0;i<n;i++)dustFx.push({x:px+(Math.random()-.5)*28,y:py+(Math.random()-.5)*10,vx:(Math.random()-.5)*90,vy:-35-Math.random()*80,t:.35+Math.random()*.25,s:4+Math.random()*8})}
function spawnEnemyFx(e,mode='stomp'){playSfx('enemy',mode==='stomp'?.9:1,.8,.07);enemyFx.push({x:e.x,y:e.y,w:e.w||70,h:e.h||56,type:e.type,v:e.v,t:mode==='stomp'?.36:.28,mode})}
function spawnImpact(px,py,power=1){impactFx.push({x:px,y:py,t:.28,power,seed:Math.random()*6.28,sparks:Math.round(5+power*4)});puff(px,py,Math.round(4+power*3))}
function enemyRect(e){return{x:e.x,y:e.y,w:e.w||70,h:e.h||56}}
function spinAttackRect(){const padX=24,padY=10;return{x:p.x-padX,y:p.y-padY,w:p.w+padX*2,h:p.h+padY*2}}
function turtleSetShellForm(e){const bottom=e.y+(e.h||56);e.w=68;e.h=36;e.y=bottom-e.h;e.baseY=e.y}
function turtleEnterShell(e){turtleSetShellForm(e);e.state='hide';e.stateT=.24;e.shellVX=0;e.v=0;e.safeT=.12}
function turtleLaunch(e,dir=1){turtleSetShellForm(e);e.state='fly';e.stateT=0;e.shellDir=Math.sign(dir)||e.shellDir||1;e.shellVX=620*e.shellDir;e.safeT=.18;spawnImpact(e.x+e.w/2,e.y+e.h,1.1)}
function bounceBoxHit(b){
 if(!b||b.hit)return false;
 if(!isBounceBox(b))return false;
 b.bounceLeft=Math.max(0,(b.bounceLeft??10)-1);b.bounceFlash=.16;
 playSfx('fruit',1.08+(10-b.bounceLeft)*.018,.82,.025);const lifeGained=addWumpas(1);score+=40;
 p.vy=-500;p.on=false;p.land=.12;p.stompSquash=.13;spawnImpact(b.x+29,b.y+2,.72);puff(b.x+29,b.y+3,4);
 if(b.bounceLeft<=0){b.hit=true;b.breakT=.38;boxesBroken++;score+=150;playSfx('box',1.12,1,.055);for(let i=0;i<fxCount(4,7,10);i++)boxFx.push({piece:true,x:b.x+29,y:b.y+29,vx:(Math.random()-.5)*300,vy:-90-Math.random()*230,r:Math.random()*6.28,vr:(Math.random()-.5)*14,t:.7+Math.random()*.3,s:5+Math.random()*7});toast='Caixa de 10 pulos destruída!';toastT=1.2;shake=Math.max(shake,.14)}
 else if(!lifeGained){toast='Wumpa!';toastT=.45}
 return true
}
function breakBox(b,mode='spin'){if(b.hit)return;playSfx('box',mode==='stomp'?.92:(mode==='head'?1.06:1),1,.055);b.hit=true;b.breakT=.38;boxesBroken++;score+=100;let lifeGained=0;if(isLifeBox(b)){grantLifeBoxReward(b)}else lifeGained=addWumpas(b.q?5:1);boxFx.push({x:b.x+29,y:b.y+29,t:.42,q:b.q,kind:b.kind,mode});for(let i=0;i<fxCount(3,6,9);i++)boxFx.push({piece:true,x:b.x+29,y:b.y+29,vx:(Math.random()-.5)*300,vy:-80-Math.random()*220,r:Math.random()*6.28,vr:(Math.random()-.5)*14,t:.65+Math.random()*.35,s:5+Math.random()*7});if(mode==='stomp'){shake=Math.max(shake,.16);spawnImpact(b.x+29,b.y+4,1.0)}else if(mode==='head'){shake=Math.max(shake,.08);spawnImpact(b.x+29,b.y+b.h-2,.72)}if(isLifeBox(b)){toast='Caixa de vida!';toastT=1.0;}else if(!lifeGained){toast=b.q?'Caixa bônus! +5 frutas':(isBounceBox(b)?'Caixa de 10 pulos quebrada!':'Caixa quebrada!');toastT=1.0;}puff(b.x+29,b.y+54,fxCount(3,5,7))}
function beginDeath(msg='Crash caiu!',kind='impact'){if(deathAnim>0||state!=='play')return;hitFlash=.62;akuInvT=0;akuEquipT=0;akuTrail.length=0;if(aku===3)aku=0;stopInvincibleMusic();playSfx('death',1,kind==='freeze'?.82:1,.2);deaths++;lives--;deathX=p.x;deathY=Math.max(36,Math.min(p.y,groundY-p.h));deathFacing=p.facing||1;deathKind=kind;deathAnim=DEATH_DURATION;p.vx=p.vy=0;p.spin=0;shake=kind==='explosion'||kind==='snowball'?.62:.46;toast=msg;toastT=1.0}
function forceDeath(){beginDeath('BOOM! TNT explodiu!','explosion')}
function resetP(){p.h=p.standH;p.x=checkpoint;p.y=groundY-p.h;p.vx=p.vy=0;p.spin=0;p.slide=0;p.crouch=false;p.land=0;p.takeoff=0;p.stompSquash=0;p.coyote=.10;p.jumpBuffer=0;forcedDeathT=0;akuProtectT=0;akuEquipT=0;inv=1.5}
function restartAttemptAfterDeath(){
 const level=currentLevel;
 const hadCheckpoint=checkpointActivated;
 if(hadCheckpoint){
   // Preserva o progresso conquistado, mas reconstrói posições dos objetos ainda ativos.
   const keep={
     score,fruits,levelTime,boxesBroken,aku,akuInvT,rideHits:rideState?.hits||0,avalancheHits:avalancheState?.hits||0,rideNearMisses:rideState?.nearMisses||0,avalancheNearMisses:avalancheState?.nearMisses||0,
     normal:normal.map(b=>!!b.hit),
     normalBounce:normal.map(b=>isBounceBox(b)?Math.max(0,b.bounceLeft??10):null),
     tnts:tnts.map(t=>!!t.dead),
     fruitList:fruitList.map(f=>!!f.t),
     masks:masks.map(m=>!!m.t),
     enemies:enemies.map(e=>!!e.dead)
   };
   setLevel(level);
   score=keep.score;fruits=keep.fruits;levelTime=keep.levelTime;boxesBroken=keep.boxesBroken;
   aku=keep.aku;akuInvT=Math.max(0,keep.akuInvT);akuEquipT=0;akuProtectT=0;
   normal.forEach((b,i)=>{b.hit=!!keep.normal[i];b.breakT=0;if(isBounceBox(b)){const n=keep.normalBounce[i];b.bounceLeft=b.hit?0:(Number.isFinite(Number(n))?Math.max(1,Math.min(10,Math.round(Number(n)))):10);b.bounceFlash=0}});
   tnts.forEach((t,i)=>{t.dead=!!keep.tnts[i];t.active=false;t.t=3;t.blast=0;t.lastBeep=4});
   fruitList.forEach((f,i)=>f.t=!!keep.fruitList[i]);
   masks.forEach((m,i)=>m.t=!!keep.masks[i]);
   enemies.forEach((e,i)=>e.dead=!!keep.enemies[i]);
   checkpointActivated=true;checkpoint=checkpointRespawnX;checkpointAnim=0;
   resultGem=false;portalSeq=0;
   swingClock=0;
   boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;akuFx.length=0;lifePickupFx.length=0;akuTrail.length=0;forcedDeathT=0;hudLifePulseT=0;
   prevJ=false;prevS=false;prevDown=false;
   resetP();if(level===6||level===8){checkpoint=3250;avalancheState=buildAvalancheState(3250);avalancheState.hits=keep.avalancheHits;avalancheState.nearMisses=keep.avalancheNearMisses}if((level===7||level===9)&&rideState){checkpoint=3600;rideState.distance=3600;rideState.hits=keep.rideHits;rideState.nearMisses=keep.rideNearMisses}camX=Math.max(0,Math.min(worldW-W,p.x-W*.35));
   startMusicForLevel(true);if(akuInvT>0)startInvincibleMusic();
   if(activeSlot)saveGame(true);
   toast='Checkpoint: progresso mantido';toastT=1.25;
   return;
 }
 // Sem checkpoint: reconstrói a fase inteira e zera o progresso da tentativa.
 setLevel(level);
 swingClock=0;score=0;fruits=phaseStartFruits;levelTime=0;boxesBroken=0;resultGem=false;portalSeq=0;
 checkpoint=currentCheckpointDefault;checkpointActivated=false;checkpointAnim=0;
 aku=0;akuInvT=0;akuEquipT=0;akuProtectT=0;akuTrail.length=0;stopInvincibleMusic();
 boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;akuFx.length=0;lifePickupFx.length=0;forcedDeathT=0;hudLifePulseT=0;
 prevJ=false;prevS=false;prevDown=false;
 resetP();if(level===6||level===8)avalancheState=buildAvalancheState();if((level===7||level===9)&&rideState)rideState.distance=0;camX=Math.max(0,Math.min(worldW-W,p.x-W*.35));
 startMusicForLevel(true);
 if(activeSlot)saveGame(true);
 toast='Tentativa reiniciada do começo';toastT=1.25;
}
function lose(force=false,kind='impact'){if((inv>0&&!force)||deathAnim>0)return;if(!force&&akuInvT>0){shake=Math.max(shake,.08);return}if(aku>0&&aku<3){playSfx('hurt',1.08,.9,.15);aku--;inv=2;shake=.25;hitFlash=.34;akuProtectT=.65;toast=kind==='explosion'?'Aku Aku protegeu você da TNT!':'Aku Aku protegeu você!';toastT=1.7;return}beginDeath(DEATH_TITLES[kind]||'Crash perdeu uma vida!',kind)}
function explode(t){if(t.dead)return;playSfx('explosion',.95,1,.12);t.dead=true;t.blast=.55;boxesBroken++;shake=.55;score+=150;const cx=t.x+t.w/2,cy=t.y+t.h/2;for(const b of normal){if(!b.hit&&Math.hypot(b.x+29-cx,b.y+29-cy)<150){b.hit=true;boxesBroken++;score+=100;if(isLifeBox(b))grantLifeBoxReward(b)}}for(const u of tnts){if(!u.dead&&u!==t&&Math.hypot(u.x+u.w/2-cx,u.y+u.h/2-cy)<170){u.active=true;u.t=Math.min(u.t,.35)}}for(const e of enemies){if(!e.dead&&Math.hypot(e.x+29-cx,e.y+26-cy)<150){e.dead=true;score+=250}}if(Math.hypot(p.x+p.w/2-cx,p.y+p.h/2-cy)<155)lose(false,'explosion')}
let prevJ=false,prevS=false,prevDown=false;
function updateBossLevel(dt){
 if(!bossState||!window.FinalBoss)return;
 const wasIntro=bossState.intro,locked=bossState.intro>0||bossState.defeated;
 if(!locked){
  const g=pad(),L=actionDown('left')||g.l,R=actionDown('right')||g.r,J=actionDown('jump')||g.j,S=actionDown('spin')||g.s,dir=(R?1:0)-(L?1:0);
  if(dir){p.vx+=dir*1900*dt;p.facing=dir}else p.vx*=Math.pow(.001,dt);
  p.vx=Math.max(-300,Math.min(300,p.vx));
  if(J&&!prevJ&&p.on){p.vy=-535;p.on=false;playSfx('jump',1,1,.08)}
  if(S&&!prevS){p.spin=p.on?.58:.78;playSfx('spin',1,.85,.1)}
  prevJ=J;prevS=S;if(p.spin>0)p.spin=Math.max(0,p.spin-dt);
  p.vy=Math.min(780,p.vy+1400*dt);p.x=Math.max(22,Math.min(895-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;
  if(p.y+p.h>=groundY){p.y=groundY-p.h;p.vy=0;p.on=true}else p.on=false;
  p.anim+=dt*(Math.abs(p.vx)>25?10:4);
 }else{p.vx=p.vy=0;prevJ=prevS=false}
 window.FinalBoss.update(bossState,dt,{player:{x:p.x,y:p.y,w:p.w,h:p.h},attackRect:p.spin>0?spinAttackRect():null,ground:groundY,
  hit:kind=>lose(false,kind),
  hitBoss:hp=>{score+=1200;shake=Math.max(shake,.42);hitFlash=Math.max(hitFlash,.18);playLoadedSfx('bossHit',1,1);toast='ACERTOU!  VIDA DO GUARDIÃO: '+hp+'/9';toastT=1.05},
  sound:name=>playLoadedSfx(name,1,1),shake:v=>shake=Math.max(shake,v),
  win:()=>{unlockTrophy('guardiao');state='win';saveGame(true)}
 });
 if(wasIntro>0&&bossState.intro<=0){playLoadedSfx('bossRoar',1,1);toast='ESPERE O NÚCLEO ABRIR E ATAQUE COM O GIRO!';toastT=2.5}
}
function spikeCycle(c){let h=0,warning=false,frame=0;if(c<1.05){h=0;frame=0}else if(c<1.42){h=5;warning=true;frame=0}else if(c<1.62){const q=(c-1.42)/.20;h=55*q;frame=q<.52?1:2}else if(c<2.42){h=55;frame=2}else if(c<2.68){h=55*(1-(c-2.42)/.26);frame=3}else{h=0;frame=4}return{h,warning,active:h>28,frame}}
function spikeTrapState(t){return spikeCycle((swingClock+t.phase)%3.25)}
function floorSpikeState(h){const phase=h.phase!=null?h.phase:((h.x*.0037)%3.25);return spikeCycle((swingClock+phase)%3.25)}
function pressTrapState(ps){const c=(swingClock+ps.phase)%3.85,top=66,bottom=337;let y=top,warning=false,slam=false;if(c<1.35)y=top;else if(c<1.78){y=top+Math.sin(c*46)*3;warning=true}else if(c<1.98){let q=(c-1.78)/.20;q=1-Math.pow(1-q,3);y=top+(bottom-top)*q;slam=true}else if(c<2.55)y=bottom;else if(c<3.35){let q=(c-2.55)/.80;y=bottom-(bottom-top)*(q*q*(3-2*q))}return{y,warning,slam,active:y>245}}
function swingTrapState(sw){const a=Math.sin(swingClock*2.15+sw.phase)*.88;const px=sw.x,py=sw.y;const len=176;const cx=px+Math.sin(a)*126,cy=py+74+Math.cos(a)*len;return{a,px,py,cx,cy}}
function finishSpecialLevel(perfect=false){resultGem=perfect;if(!levelCrystal.t)collectLevelCrystal();if(fruits>=50)unlockTrophy('frutas50');if(deaths===0)unlockTrophy('semMorrer');if(levelTime<150)unlockTrophy('veloz');if(resultGem){unlockTrophy('caixas');unlockTrophy('gema')}if(currentLevel===6)unlockTrophy('avalanche');else if(currentLevel===7)unlockTrophy('polar');else if(currentLevel===8)unlockTrophy('pedra');else if(currentLevel===9)unlockTrophy('javali');state='results';saveGame(true)}
function addSpecialChain(s,kind='fruit'){
 s.combo=Math.min(99,(s.combo||0)+1);s.comboT=2.4;s.bestCombo=Math.max(s.bestCombo||0,s.combo);
 const multiplier=1+Math.min(4,Math.floor((s.combo-1)/3));
 if(kind==='dodge'){s.nearMisses=(s.nearMisses||0)+1;score+=120*multiplier;playSfx('land',1.22,.44,.08)}
 else score+=75*multiplier;
 if(s.combo>=3&&s.combo%3===0){toast='COMBO ×'+s.combo+'  BÔNUS ×'+multiplier;toastT=.85}
}
function updateSpecialChain(s,dt){
 if(s.comboT>0){s.comboT=Math.max(0,s.comboT-dt);if(s.comboT<=0)s.combo=0}
 s.lean+=(0-s.lean)*Math.min(1,dt*5.5);
}
function updateRide(dt){
 if(!rideState)rideState=buildRideState();
 const g=pad(),L=actionDown('left')||g.l,R=actionDown('right')||g.r,J=actionDown('jump')||g.j;
 if(L&&!rideState.prevL){rideState.targetLane=Math.max(-1,rideState.targetLane-1);rideState.lean=-1}
 if(R&&!rideState.prevR){rideState.targetLane=Math.min(1,rideState.targetLane+1);rideState.lean=1}
 if(J&&!rideState.prevJ&&rideState.y<=0){rideState.vy=520;playSfx('jump',1.08,.8,.08)}
 rideState.prevL=L;rideState.prevR=R;rideState.prevJ=J;
 rideState.lane+=(rideState.targetLane-rideState.lane)*Math.min(1,dt*10);updateSpecialChain(rideState,dt);
 rideState.speed=Math.min(currentLevel===9?390:430,rideState.speed+dt*(currentLevel===9?3.6:4.2));rideState.distance+=rideState.speed*dt;
 if(rideState.y>0||rideState.vy>0){rideState.y+=rideState.vy*dt;rideState.vy-=1120*dt;if(rideState.y<=0){rideState.y=0;rideState.vy=0;playSfx('land',1,.55,.1)}}
 for(const o of rideState.obstacles){if(o.done)continue;const d=o.z-rideState.distance;if(d<-65){if(o.type!=='fruit'&&Math.abs(rideState.lane-o.lane)<.5&&rideState.y>=54)addSpecialChain(rideState,'dodge');o.done=true;continue}if(Math.abs(d)<56&&Math.abs(rideState.lane-o.lane)<.44){if(o.type==='fruit'){o.done=true;addWumpas(3);addSpecialChain(rideState,'fruit');playSfx('fruit',1.12,.75,.04)}else if(rideState.y<54){o.done=true;rideState.hits++;rideState.combo=0;rideState.comboT=0;lose(false,currentLevel===9?'boar':'ride');return}}}
 if(!checkpointActivated&&rideState.distance>3600){checkpointActivated=true;checkpoint=3600;toast='CHECKPOINT DA CORRIDA!';toastT=1.6;score+=250;saveGame(true)}
 if(!levelCrystal.t&&rideState.distance>5550){collectLevelCrystal()}
 p.anim+=dt*(10+rideState.speed*.012);
 if(rideState.distance>=RIDE_LENGTH)finishSpecialLevel(rideState.hits===0);
}
function updateAvalanche(dt){
 if(!avalancheState)avalancheState=buildAvalancheState();
 const a=avalancheState,L=actionDown('left'),R=actionDown('right'),J=actionDown('jump');
 if(L&&!a.prevL){a.targetLane=Math.max(-1,a.targetLane-1);a.lean=-1}
 if(R&&!a.prevR){a.targetLane=Math.min(1,a.targetLane+1);a.lean=1}
 if(J&&!a.prevJ&&a.y<=0){a.vy=510;playSfx('jump',1.06,.78,.08)}
 a.prevL=L;a.prevR=R;a.prevJ=J;a.lane+=(a.targetLane-a.lane)*Math.min(1,dt*11);updateSpecialChain(a,dt);
 a.speed=Math.min(currentLevel===8?375:405,a.speed+dt*(currentLevel===8?4.1:4.8));a.distance+=a.speed*dt;a.gap-=dt*((currentLevel===8?6:8)+Math.max(0,a.speed-330)*.08);
 if(a.y>0||a.vy>0){a.y+=a.vy*dt;a.vy-=1120*dt;if(a.y<=0){a.y=0;a.vy=0;playSfx('land',1,.52,.1)}}
 for(const o of a.obstacles){if(o.done)continue;const d=o.z-a.distance;if(d<-70){if(o.type!=='fruit'&&Math.abs(a.lane-o.lane)<.5&&a.y>=52)addSpecialChain(a,'dodge');o.done=true;continue}if(Math.abs(d)<54&&Math.abs(a.lane-o.lane)<.44){if(o.type==='fruit'){o.done=true;addWumpas(3);addSpecialChain(a,'fruit');playSfx('fruit',1.1,.72,.04)}else if(a.y<52){o.done=true;a.hits++;a.combo=0;a.comboT=0;a.gap-=185;shake=.32;playSfx('hurt',.88,.8,.1)}}}
 if(!checkpointActivated&&a.distance>3250){checkpointActivated=true;checkpoint=3250;a.gap=Math.max(a.gap,690);toast='CHECKPOINT DA AVALANCHE!';toastT=1.7;score+=250;saveGame(true)}
 if(!levelCrystal.t&&a.distance>5050)collectLevelCrystal();
 p.anim+=dt*(11+a.speed*.016);snowballSpeed=a.speed+Math.max(0,760-a.gap)*.08;snowballX=a.distance-a.gap;
 if(a.gap<=170){lose(true,currentLevel===8?'boulder':'snowball');return}
 if(a.distance>=AVALANCHE_LENGTH)finishSpecialLevel(a.hits===0);
}
function update(dt){if(state!=='play'||paused)return;swingClock+=dt;if(introT>0){introT=Math.max(0,introT-dt);p.vx=0;p.vy=0;prevJ=false;prevS=false;prevDown=false;return}levelTime+=dt;if(inv>0)inv-=dt;if(toastT>0)toastT-=dt;if(shake>0)shake-=dt;if(hitFlash>0)hitFlash=Math.max(0,hitFlash-dt);if(crystalFxT>0)crystalFxT=Math.max(0,crystalFxT-dt);if(hudLifePulseT>0)hudLifePulseT=Math.max(0,hudLifePulseT-dt);if(akuEquipT>0)akuEquipT=Math.max(0,akuEquipT-dt);if(akuInvT>0){akuInvT=Math.max(0,akuInvT-dt);if(akuInvT<=0&&aku===3){aku=0;stopInvincibleMusic();akuTrail.length=0;toast='Invencibilidade acabou';toastT=1.4}}pushAkuTrail(dt);updateAkuTrail(dt);if(deathAnim>0){deathAnim=Math.max(0,deathAnim-dt);if(deathAnim<=0){if(lives>0)restartAttemptAfterDeath();else state='gameover'}return}if(portalSeq>0){portalSeq+=dt;p.vx=0;p.vy=0;const cx=portal.x+portal.w/2-p.w/2,cy=portal.y+portal.h/2-p.h/2;p.x+=(cx-p.x)*Math.min(1,dt*3.6);p.y+=(cy-p.y)*Math.min(1,dt*3.6);if(portalSeq>2.15){resultGem=boxesBroken>=normal.length+tnts.length;if(currentLevel===3)unlockTrophy('pantano');if(currentLevel===4)unlockTrophy('gelo');if(currentLevel===5)unlockTrophy('canyon');state='results';if(fruits>=50)unlockTrophy('frutas50');if(resultGem){unlockTrophy('caixas');unlockTrophy('gema')}if(deaths===0)unlockTrophy('semMorrer');if(levelTime<150)unlockTrophy('veloz');saveGame(true)}return}if(forcedDeathT>0){forcedDeathT-=dt;return}if(p.land>0)p.land-=dt;if(p.takeoff>0)p.takeoff-=dt;for(let i=dustFx.length-1;i>=0;i--){let d=dustFx[i];d.t-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=220*dt;if(d.t<=0)dustFx.splice(i,1)}for(let i=boxFx.length-1;i>=0;i--){let f=boxFx[i];f.t-=dt;if(f.piece){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=600*dt;f.r+=f.vr*dt}if(f.t<=0)boxFx.splice(i,1)}updateLifePickup(dt)
for(let i=enemyFx.length-1;i>=0;i--){let f=enemyFx[i];f.t-=dt;if(f.t<=0)enemyFx.splice(i,1)}for(let i=impactFx.length-1;i>=0;i--){let f=impactFx[i];f.t-=dt;if(f.t<=0)impactFx.splice(i,1)}for(let i=akuFx.length-1;i>=0;i--){let f=akuFx[i];f.t-=dt;if(f.t<=0)akuFx.splice(i,1)}if(akuProtectT>0)akuProtectT=Math.max(0,akuProtectT-dt);for(const e of enemies)if(!e.dead&&e.safeT>0)e.safeT=Math.max(0,e.safeT-dt);if(p.stompSquash>0)p.stompSquash=Math.max(0,p.stompSquash-dt);for(const b of normal)if(b.bounceFlash>0)b.bounceFlash=Math.max(0,b.bounceFlash-dt);for(const t of tnts){if(t.dead){if(t.blast>0)t.blast=Math.max(0,t.blast-dt)}else if(t.active){t.t-=dt;const beep=Math.max(1,Math.ceil(t.t));if(beep<t.lastBeep){t.lastBeep=beep;playSfx('tick',1+(3-beep)*.09,.85,.08)}if(t.t<=0)explode(t)}}if(levelMode==='boss'){updateBossLevel(dt);return}if(levelMode==='ride'){updateRide(dt);return}if(levelMode==='avalanche'){updateAvalanche(dt);return}
 const g=pad(),L=actionDown('left')||g.l,R=actionDown('right')||g.r,D=actionDown('down')||g.d,J=actionDown('jump')||g.j,S=actionDown('spin')||g.s;
 const accel=currentLevel===4?720:950,max=currentLevel===4?305:285,fric=currentLevel===4?230:1000;
 // Agachar / escorregar: ao apertar para baixo correndo, Crash inicia um slide com impulso.
 if(D&&p.on&&p.slide<=0&&!prevDown&&Math.abs(p.vx)>105){p.slide=.58;p.slideDir=Math.sign(p.vx)||p.facing;p.facing=p.slideDir;p.vx=p.slideDir*Math.max(330,Math.abs(p.vx)+70);puff(p.x+p.w/2,p.y+p.h,5)}
 p.crouch=D&&p.on&&p.slide<=0;
 const wantsLow=p.crouch||p.slide>0;
 if(wantsLow)setPlayerHeight(p.crouchH);
 else if(!setPlayerHeight(p.standH)){p.crouch=true;setPlayerHeight(p.crouchH)}
 if(p.slide>0){p.slide-=dt;p.vx-=Math.sign(p.vx)*430*dt;if(Math.abs(p.vx)<110||p.slide<=0){p.slide=0;if(!D&&!setPlayerHeight(p.standH)){p.crouch=true;setPlayerHeight(p.crouchH)}}}
 else {const moveAccel=p.crouch?520:accel,moveMax=p.crouch?125:max,moveFric=p.crouch?1250:fric;if(L){p.vx-=moveAccel*dt;p.facing=-1}if(R){p.vx+=moveAccel*dt;p.facing=1}if(!L&&!R){if(Math.abs(p.vx)<moveFric*dt)p.vx=0;else p.vx-=Math.sign(p.vx)*moveFric*dt}p.vx=Math.max(-moveMax,Math.min(moveMax,p.vx));}
 const jumpPressed=J&&!prevJ;if(jumpPressed)p.jumpBuffer=.12;else if(p.jumpBuffer>0)p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);if(p.on)p.coyote=.10;else if(p.coyote>0)p.coyote=Math.max(0,p.coyote-dt);
 if(p.jumpBuffer>0&&(p.on||p.coyote>0)&&!p.crouch){playSfx('jump',1,1,.08);p.vy=-535;p.on=false;p.coyote=0;p.jumpBuffer=0;p.takeoff=.16;puff(p.x+31,p.y+p.h,4)}if(S&&!prevS&&p.slide<=0){playSfx('spin',.98,.85,.12);p.spin=p.on?.58:.78;}prevJ=J;prevS=S;prevDown=D;if(p.spin>0)p.spin-=dt;const airSpinGlide=!p.on&&p.spin>0&&p.vy>-170;const gravity=airSpinGlide?520:1400;const maxFall=airSpinGlide?235:780;p.vy=Math.min(maxFall,p.vy+gravity*dt);
 const prevY=p.y,prevBottom=p.y+p.h;
 if(!resolvePlayerHorizontal(p.vx*dt))return;
 resolvePlayerVertical(p.vy*dt,prevY,prevBottom);
 depenetratePlayerFromSolids();
 // Mantém contato com a superfície sem inventar chão sobre buracos.
 if(!p.on&&p.vy>=0)snapPlayerToGround(4);
 let pr={x:p.x,y:p.y,w:p.w,h:p.h};
 if(p.spin>0){const ar=spinAttackRect();for(const b of normal){if(!b.hit&&rect(ar,{x:b.x,y:b.y,w:b.w,h:b.h}))breakBox(b,'spin')}}
 if(p.y>H+180){lose(true,'fall');return}
 for(const st of spikeTraps){const z=spikeTrapState(st);if(z.active){const hit={x:st.x+8,y:st.y-z.h+9,w:st.w-16,h:z.h-8};if(rect(pr,hit)){lose(false,'spikes');return}}}
 for(const sw of swingingLogs){const z=swingTrapState(sw);const hit={x:z.cx-72,y:z.cy-42,w:144,h:84};if(rect(pr,hit)){lose();return}}
 for(const ps of stonePresses){const z=pressTrapState(ps);if(z.active){const hit={x:ps.x+18,y:z.y+26,w:146,h:112};if(rect(pr,hit)){lose(false,'crush');return}}}
 for(const h of hazards){
   if(h.type==='pit')continue;
   if(h.type==='gust'&&rect(pr,{x:h.x,y:h.y,w:h.w,h:h.h})){p.x=Math.max(0,Math.min(worldW-p.w,p.x+h.dir*h.power*dt));p.vx+=h.dir*h.power*.18*dt;pr.x=p.x;continue}
   if(h.type==='spikes'){const z=floorSpikeState(h);if(z.active){const hit={x:h.x+8,y:groundY-z.h+8,w:h.w-16,h:Math.max(10,z.h-8)};if(rect(pr,hit)){lose(false,'spikes');return}}continue}
   if(rect(pr,{x:h.x+8,y:h.y+8,w:h.w-16,h:h.h-8})){lose(false,h.type==='iceSpike'?'freeze':h.type==='poison'?'poison':'impact');return}
 }
 for(const f of fruitList){if(!f.t&&rect(pr,{x:f.x,y:f.y,w:42,h:42})){playSfx('fruit',1+(fruits%4)*.035,.7,.025);f.t=true;addWumpas(1);score+=25}}
 for(const m of masks){if(!m.t&&rect(pr,{x:m.x,y:m.y,w:54,h:65})){m.t=true;akuFx.push({x:m.x+27,y:m.y+26,t:.7,kind:'pickup'});score+=500;if(aku>=2||akuInvT>0)beginAkuInvincible();else{playSfx('aku',aku?1.12:1,1,.2);aku=Math.min(2,aku+1);toast=aku===2?'Aku Aku reforçado!':'Aku Aku adquirido!';toastT=1.7}}}
 if(!levelCrystal.t&&rect(pr,{x:levelCrystal.x-5,y:levelCrystal.y,w:levelCrystal.w+10,h:levelCrystal.h})){collectLevelCrystal()}
 for(const e of enemies){
   if(e.dead)continue;
   if(e.hitT>0)e.hitT-=dt;
   if(e.type==='turtle'){
     if(e.state==='hide'||e.state==='shell'){
       if(e.state==='hide'){
         e.stateT-=dt;
         if(e.stateT<=0)e.state='shell';
       }
       e.y=jungleEnemySlopeY(e)??e.baseY;
       const er=enemyRect(e);
       if(rect(pr,er)){
         if(akuInvincibleEnemyTouch(e,er,'power'))continue;
         const currBottom=p.y+p.h;
         const stomp=p.vy>0&&prevBottom<=e.y+12&&currBottom>=e.y;
         const fromBelow=p.vy<0&&prevY>=e.y+e.h-10&&p.y<=e.y+e.h;
         if(p.spin>0||p.slide>0){
           turtleLaunch(e,(p.facing||Math.sign(p.vx)||1));
           score+=150;
           toast='Casco lançado!';toastT=.8;
           shake=Math.max(shake,.1);
         }else if(stomp){
           p.y=e.y-p.h;p.vy=-640;p.on=false;p.stompSquash=.15;shake=Math.max(shake,.15);spawnImpact(e.x+er.w/2,e.y+er.h,1.3);toast='Super pulo no casco!';toastT=.7;pr.y=p.y;
         }else if(fromBelow){
           p.y=e.y+e.h;p.vy=40;pr.y=p.y;
         }else {if(p.x+p.w/2<e.x+er.w/2)p.x=e.x-p.w;else p.x=e.x+e.w;p.vx=0;pr.x=p.x;}
       }
       continue;
     }else if(e.state==='fly'){
       e.x+=e.shellVX*dt;
       e.y=jungleEnemySlopeY(e)??e.baseY;
       const er=enemyRect(e);
       for(const b of normal){if(!b.hit&&rect(er,{x:b.x,y:b.y,w:b.w,h:b.h}))breakBox(b,'slide')}
       for(const t of tnts){if(!t.dead&&rect(er,{x:t.x,y:t.y,w:t.w,h:t.h})){explode(t)}}
       for(const o of enemies){
         if(o===e||o.dead)continue;
         const or=enemyRect(o);
         if(rect(er,or)){
           if(o.type==='turtle'&&o.state==='fly')continue;
           spawnEnemyFx(o,'slide');
           o.dead=true;
           score+=250;
           puff(o.x+or.w/2,o.y+or.h/2,5);
         }
       }
       if(e.safeT<=0&&rect(pr,er)){if(akuInvincibleEnemyTouch(e,er,'power'))continue;lose();return}
       if(e.x<-160||e.x>worldW+160){e.dead=true;continue}
       continue;
     }else{
       e.x+=e.v*dt;
       if(e.x<e.a||e.x>e.b){e.v*=-1;e.x=Math.max(e.a,Math.min(e.b,e.x))}
       e.y=e.baseY;
       const er=enemyRect(e);
       for(const b of normal){if(b.hit)continue;const br={x:b.x,y:b.y,w:b.w,h:b.h};if(rect(er,br)){if(e.v>0)e.x=b.x-er.w-2;else e.x=b.x+b.w+2;e.v*=-1;er.x=e.x;break}}
       for(const t of tnts){if(t.dead)continue;const tr={x:t.x,y:t.y,w:t.w,h:t.h};if(rect(er,tr)){if(e.v>0)e.x=t.x-er.w-2;else e.x=t.x+t.w+2;e.v*=-1;er.x=e.x;break}}
       if(rect(pr,er)){
         if(akuInvincibleEnemyTouch(e,er,'power'))continue;
         const stomp=p.vy>0&&p.y+p.h<e.y+Math.min(26,(e.h||56)*.62);
         if(stomp){
           turtleEnterShell(e);
           score+=200;
           toast='Tartaruga recolhida!';toastT=.9;
           p.y=e.y-p.h;p.vy=-395;p.on=false;p.stompSquash=.16;shake=Math.max(shake,.14);spawnImpact(e.x+er.w/2,e.y+er.h,1.15);pr.y=p.y;
         }else if(p.spin>0||p.slide>0){
           turtleLaunch(e,(p.facing||Math.sign(p.vx)||1));
           score+=250;
           toast='Casco lançado!';toastT=.9;
           shake=Math.max(shake,.12);
         }else lose();
       }
       continue;
     }
   }
   let speedMul=1;
   if(e.type==='armadillo')speedMul=(Math.sin(swingClock*4.2+e.phase)>0.45?1.65:1);
   if(e.type==='magmaBeetle')speedMul=(Math.sin(swingClock*3.5+e.phase)>0?1.35:.62);
   e.x+=e.v*dt*speedMul;
   if(e.x<e.a||e.x>e.b){e.v*=-1;e.x=Math.max(e.a,Math.min(e.b,e.x))}
   if(e.type==='mosquito'||e.type==='emberBat')e.y=e.baseY+Math.sin(swingClock*(e.type==='emberBat'?2.7:3.1)+e.phase)*(e.type==='emberBat'?38:28);
   else if(e.type==='frog')e.y=e.baseY-Math.max(0,Math.sin(swingClock*2.4+e.phase))*34;
   else e.y=jungleEnemySlopeY(e)??e.baseY;
   const er=enemyRect(e);
   for(const b of normal){if(b.hit)continue;const br={x:b.x,y:b.y,w:b.w,h:b.h};if(rect(er,br)){if(e.v>0)e.x=b.x-er.w-2;else e.x=b.x+b.w+2;e.v*=-1;er.x=e.x;break}}
   for(const t of tnts){if(t.dead)continue;const tr={x:t.x,y:t.y,w:t.w,h:t.h};if(rect(er,tr)){if(e.v>0)e.x=t.x-er.w-2;else e.x=t.x+t.w+2;e.v*=-1;er.x=e.x;break}}
   if(rect(pr,er)){
     if(akuInvincibleEnemyTouch(e,er,'power'))continue;
     const stomp=p.vy>0&&p.y+p.h<e.y+Math.min(34,(e.h||56)*.65);
     if(p.spin>0||p.slide>0||(stomp&&e.type!=='magmaBeetle')){
       const defeatMode=stomp?'stomp':(p.slide>0?'slide':'spin');
       spawnEnemyFx(e,defeatMode);e.dead=true;e.hitT=.5;score+=250;
       toast=(e.type==='mosquito'?'Mosquito':e.type==='frog'?'Sapo':e.type==='penguin'?'Pinguim':e.type==='seal'?'Foca':e.type==='iceShell'?'Casco de gelo':e.type==='emberBat'?'Morcego de brasa':e.type==='swampTurtle'?'Tartaruga do pântano':e.type==='armadillo'?'Tatu':e.type==='magmaBeetle'?'Besouro de magma':e.type==='emberBat'?'Morcego de brasa':'Tartaruga')+' derrotado!';
       toastT=1;
       if(stomp){p.vy=-410;p.on=false;p.stompSquash=.17;shake=Math.max(shake,.18);spawnImpact(e.x+er.w/2,e.y+er.h-2,1.25)}
       else{shake=Math.max(shake,.08);puff(e.x+er.w/2,e.y+er.h/2,5)}
     }else lose();
   }
 }
 if(!checkpointActivated&&p.x+p.w>checkpointBox.x+checkpointBox.w*.45){playSfx('checkpoint',1,1,.3);checkpointActivated=true;checkpoint=checkpointRespawnX;checkpointAnim=1.55;toast='CHECKPOINT ATIVADO!';toastT=2;score+=250;unlockTrophy('checkpoint');saveGame(true)}if(checkpointAnim>0)checkpointAnim=Math.max(0,checkpointAnim-dt);if(rect(pr,{x:portal.x+28,y:portal.y+22,w:portal.w-56,h:portal.h-28})&&portalSeq===0){playSfx('portal',1,1,.5);portalSeq=.001;p.spin=0;toast='PORTAL ATIVADO!';toastT=.8;}p.anim+=dt*(p.slide>0?18:p.crouch?9:p.spin>0?16:Math.abs(p.vx)>30?12:3);const cameraAnchor=p.vx>35?.30:(p.vx<-35?.70:.35);camX+=(Math.max(0,Math.min(worldW-W,p.x-W*cameraAnchor))-camX)*Math.min(1,dt*6)
}
function drawSpike16(img,z,px,bottom,w,h){if(!img)return false;const fr=spike16SR[Math.max(0,Math.min(spike16SR.length-1,z.frame||0))];x.save();x.globalAlpha=z.h>0?.98:.82;x.drawImage(img,...fr,px,bottom-h,w,h);x.restore();return true}
function drawClippedSprite(img,s,dx,dy,dw,dh,cx=dx,cy=dy,cw=dw,ch=dh,a=1){if(!img)return;dx=Math.round(dx);dy=Math.round(dy);dw=Math.max(1,Math.round(dw));dh=Math.max(1,Math.round(dh));cx=Math.round(cx);cy=Math.round(cy);cw=Math.max(1,Math.round(cw));ch=Math.max(1,Math.round(ch));x.save();x.globalAlpha=a;x.beginPath();x.rect(cx,cy,cw,ch);x.clip();if(s)x.drawImage(img,...s,dx,dy,dw,dh);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,dx,dy,dw,dh);x.restore()}
function drawRepeatedStrip(img,s,dx,dy,dw,dh,step,overlap=2){if(!img)return;dx=Math.round(dx);dy=Math.round(dy);dw=Math.max(1,Math.round(dw));dh=Math.max(1,Math.round(dh));step=Math.max(1,Math.round(step));x.save();x.beginPath();x.rect(dx,dy,dw,dh);x.clip();for(let off=0;off<dw;off+=step){const segW=Math.min(step+overlap,dw-off+overlap);if(s)x.drawImage(img,...s,dx+off,dy,segW,dh);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,dx+off,dy,segW,dh)}x.restore()}
function drawPlatformSet(img,L,M,R,dx,dy,dw,dh){if(!img)return;dx=Math.round(dx);dy=Math.round(dy);dw=Math.max(1,Math.round(dw));dh=Math.max(1,Math.round(dh));const scale=dh/L[3];let leftW=Math.round(L[2]*scale), rightW=Math.round(R[2]*scale), midStep=Math.max(18,Math.round(M[2]*scale));if(leftW+rightW>dw){const k=dw/Math.max(1,leftW+rightW);leftW=Math.max(1,Math.floor(leftW*k));rightW=Math.max(1,dw-leftW)}x.save();x.beginPath();x.rect(dx,dy,dw,dh);x.clip();x.drawImage(img,...L,dx,dy,leftW,dh);const midX=dx+leftW, midW=Math.max(1,dw-leftW-rightW);for(let off=0;off<midW;off+=midStep){const segW=Math.min(midStep,midW-off);x.drawImage(img,...M,midX+off,dy,segW,dh)}x.drawImage(img,...R,dx+dw-rightW,dy,rightW,dh);x.restore()}
function drawPlatformTile(q){
 if(q[4]?.jungle)return;
 const elevated=q[3]<50;
 if(currentLevel===2&&biomeTileImg){
   const sr=elevated?biomeTileSR.templeSmall:biomeTileSR.templeGround;
   const dy=q[1]-(elevated?22:46), dh=elevated?q[3]+48:q[3]+34, step=elevated?96:188;
   drawRepeatedStrip(biomeTileImg,sr,q[0],dy,q[2],dh,step,3);
   return;
 }
 if(currentLevel===3&&biomeTileImg){
   const sr=elevated?biomeTileSR.swampSmall:biomeTileSR.swampGround;
   const dy=q[1]-(elevated?25:50), dh=elevated?q[3]+48:q[3]+30, step=elevated?88:176;
   drawRepeatedStrip(biomeTileImg,sr,q[0],dy,q[2],dh,step,2);
   return;
 }
 if((currentLevel===4||currentLevel===6)&&biomeTileImg){
   const sr=elevated?biomeTileSR.iceSmall:biomeTileSR.iceGround;
   const dy=q[1]-(elevated?24:47), dh=elevated?q[3]+50:q[3]+32, step=elevated?88:176;
   drawRepeatedStrip(biomeTileImg,sr,q[0],dy,q[2],dh,step,2);
   return;
 }
 if(currentLevel===5&&biomeTileImg){
   const sr=elevated?biomeTileSR.canyonSmall:biomeTileSR.canyonGround;
   const dy=q[1]-(elevated?22:46), dh=elevated?q[3]+48:q[3]+34, step=elevated?96:188;
   drawRepeatedStrip(biomeTileImg,sr,q[0],dy,q[2],dh,step,3);
   return;
 }
 if(elevated){
   if(q[2]<=175) drawPlatformSet(tileImg,tileSR.smallL,tileSR.smallM,tileSR.smallR,q[0],q[1]-20,q[2],q[3]+48);
   else drawPlatformSet(tileImg,tileSR.floatL,tileSR.floatM,tileSR.floatR,q[0],q[1]-22,q[2],q[3]+50);
 }else{
   drawPlatformSet(tileImg,tileSR.groundL,tileSR.groundM,tileSR.groundR,q[0],q[1]-38,q[2],q[3]+34);
 }
}
function ds(img,s,px,py,w,h,flip=false,a=1){if(!img)return;px=Math.round(px);py=Math.round(py);w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));x.save();x.globalAlpha=a;if(flip){x.translate(px+w,py);x.scale(-1,1);if(s)x.drawImage(img,...s,0,0,w,h);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,0,0,w,h)}else{if(s)x.drawImage(img,...s,px,py,w,h);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,px,py,w,h)}x.restore()}
function bg(){
 // O menu carrega apenas o grupo CORE. Por isso o background da fase pode
 // ainda ser null aqui; nesse caso usamos um fundo leve sem acessar .complete.
 x.fillStyle='#08221d';x.fillRect(0,0,W,H);
 const phaseBg=activeBackground();if(phaseBg&&phaseBg.complete&&phaseBg.naturalWidth){const scale=H/phaseBg.naturalHeight,iw=phaseBg.naturalWidth*scale;let off=-(camX*.12)%(iw);for(let px=off-iw;px<W+iw;px+=iw)x.drawImage(phaseBg,px,0,iw,H)}else{
   const grd=x.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#174d54');grd.addColorStop(.55,'#123b35');grd.addColorStop(1,'#071a18');x.fillStyle=grd;x.fillRect(0,0,W,H);
   x.globalAlpha=.18;x.fillStyle='#4c8f61';for(let i=0;i<fxCount(5,8,10);i++){const xx=i*115-(i%2)*35;x.beginPath();x.arc(xx,390+(i%3)*15,95+(i%2)*25,Math.PI,Math.PI*2);x.fill()}x.globalAlpha=1;
 }
 if(currentLevel===2&&phaseBg){x.fillStyle='rgba(62,35,18,.22)';x.fillRect(0,0,W,H);x.fillStyle='rgba(15,9,4,.18)';for(let i=0;i<fxCount(4,6,8);i++)x.fillRect(i*140+((camX*.08)%55),265+(i%3)*18,110,170)}else if(currentLevel===3&&phaseBg){x.fillStyle='rgba(25,44,12,.25)';x.fillRect(0,0,W,H);x.globalAlpha=.18;x.fillStyle='#d2d6ae';for(let i=0;i<fxCount(2,4,5);i++)x.fillRect((i*230-(camX*.05)%120),330+i%2*35,260,28);x.globalAlpha=1}else if((currentLevel===4||currentLevel===6||currentLevel===7)&&phaseBg){x.fillStyle='rgba(180,225,255,.10)';x.fillRect(0,0,W,H);x.fillStyle='rgba(235,250,255,.7)';for(let i=0;i<fxCount(7,15,24);i++){let xx=(i*79+(performance.now()/18))%W,yy=(i*47+Math.floor(performance.now()/35))%360;x.fillRect(xx,yy,2+(i%2),2+(i%2))}}else if(currentLevel===5){x.fillStyle='rgba(145,32,18,.38)';x.fillRect(0,0,W,H);x.fillStyle='rgba(255,173,59,.35)';for(let i=0;i<fxCount(4,7,9);i++){x.fillRect((i*137-(camX*.18)%137),300+(i%3)*30,78,7)}}
}
function drawPlatformAtmosphere(){
 if(levelMode!=='platform'||currentLevel===10)return;
 const tier=graphicsTier(),count=fxCount(5,10,18),time=swingClock,baseX=camX;
 x.save();
 if(currentLevel===1){
   const haze=x.createLinearGradient(0,120,0,H);haze.addColorStop(0,'rgba(123,190,101,.05)');haze.addColorStop(1,'rgba(20,55,28,.10)');x.fillStyle=haze;x.fillRect(0,0,W,H);
   for(let i=0;i<count;i++){const px=((i*137+time*24-baseX*.06)% (W+80))-40,py=150+((i*83+time*13)%310);x.globalAlpha=.12+(i%3)*.035;x.fillStyle=i%2?'#89bd61':'#d4b65f';x.save();x.translate(px,py);x.rotate(time*.8+i);x.fillRect(-3,-1,7,3);x.restore()}
 }else if(currentLevel===2){
   const haze=x.createLinearGradient(0,0,0,H);haze.addColorStop(0,'rgba(94,55,26,.04)');haze.addColorStop(1,'rgba(35,19,8,.16)');x.fillStyle=haze;x.fillRect(0,0,W,H);
   for(let i=0;i<count;i++){const px=((i*149-time*18-baseX*.04)%(W+100))-50,py=180+((i*71+time*9)%280);x.globalAlpha=.10+(i%4)*.025;x.fillStyle='#d9b26b';x.beginPath();x.arc(px,py,1+(i%3),0,Math.PI*2);x.fill()}
 }else if(currentLevel===3){
   for(let i=0;i<Math.max(3,count-4);i++){const px=((i*191+time*8-baseX*.035)%(W+160))-80,py=260+((i*53)%180);x.globalAlpha=.055+(i%3)*.02;x.fillStyle='#d6e2c0';x.beginPath();x.ellipse(px,py,70+(i%4)*18,12+(i%3)*4,0,0,Math.PI*2);x.fill()}
   if(tier>0)for(let i=0;i<5;i++){const px=(i*179+Math.sin(time*.7+i)*40-baseX*.05)%W,py=170+i*52;x.globalAlpha=.12;x.fillStyle='#a6d961';x.fillRect(px,py,2,2)}
 }else if(currentLevel===4){
   for(let i=0;i<count+5;i++){const px=((i*97+time*52-baseX*.04)%(W+60))-30,py=90+((i*61+time*31)%360);x.globalAlpha=.28+(i%3)*.05;x.fillStyle=i%4===0?'#ffffff':'#d7f3ff';x.fillRect(px,py,2+(i%2),2+(i%2))}
 }else if(currentLevel===5){
   for(let i=0;i<count;i++){const px=((i*113-time*28-baseX*.05)%(W+80))-40,py=200+((i*67+time*11)%270);x.globalAlpha=.16+(i%3)*.04;x.fillStyle=i%3===0?'#ffbd5c':i%3===1?'#d97436':'#824224';x.fillRect(px,py,3+(i%2),2)}
 }
 x.restore();
}
function drawWorldVignette(){
 if(levelMode!=='platform'||currentLevel===10)return;x.save();const vg=x.createLinearGradient(0,0,W,0);vg.addColorStop(0,'rgba(0,0,0,.17)');vg.addColorStop(.16,'rgba(0,0,0,0)');vg.addColorStop(.84,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.17)');x.fillStyle=vg;x.fillRect(0,0,W,H);x.restore();
}
function drawEnemyShadow(e){
 if(e.type==='mosquito'||e.type==='emberBat')return;const w=e.w||70,h=e.h||56,cx=e.x+w/2,cy=e.y+h+3;drawMode7ShadowEllipse(cx,cy,Math.max(10,w*.32),Math.max(3,h*.08),.16,currentLevel===4?'#193443':'#11120c');
}
function drawEnemyDefeatFx(f){
 const total=f.mode==='stomp'?.36:.28,q=Math.max(0,Math.min(1,f.t/total)),burst=1-q,cx=f.x+(f.w||70)/2,cy=f.y+(f.h||56)/2,flip=(f.v||1)<0;
 x.save();x.globalAlpha=q;const rot=(f.mode==='stomp'?0:(flip?-1:1))*burst*1.9,sy=f.mode==='stomp'?Math.max(.18,1-burst*.78):1+burst*.08,sx=f.mode==='stomp'?1+burst*.65:1-burst*.12;x.translate(cx,cy+burst*14);x.rotate(rot);x.scale(sx,sy);drawEnemySprite({type:f.type,v:f.v||1,phase:0,state:'walk',stateT:0,x:0,y:0,w:f.w||70,h:f.h||56},-(f.w||70)/2,-(f.h||56)/2,f.w||70,f.h||56,flip);x.restore();
 x.save();for(let i=0;i<fxCount(3,5,8);i++){const a=(i/Math.max(1,fxCount(3,5,8)))*Math.PI*2+(f.x*.01),r=12+burst*(22+i*3);x.globalAlpha=q*.55;x.fillStyle=i%2?'#ffd66b':'#fff0b0';x.beginPath();x.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.45,2+(i%2),0,Math.PI*2);x.fill()}x.restore();
}
function drawFrameRot(img,s,cx,cy,w,h,ang=0,flip=false,a=1){if(!img)return;x.save();x.globalAlpha=a;x.translate(cx,cy);if(flip)x.scale(-1,1);x.rotate(ang);if(s)x.drawImage(img,...s,-w/2,-h/2,w,h);else x.drawImage(img,-w/2,-h/2,w,h);x.restore()}
function drawAnchoredFrame(img,s,cx,bottom,maxW,maxH,flip=false,a=1){if(!img||!s)return;const scale=Math.min(maxW/s[2],maxH/s[3]),dw=s[2]*scale,dh=s[3]*scale;ds(img,s,cx-dw/2,bottom-dh,dw,dh,flip,a)}
function drawEnemySprite(e,px=e.x,py=e.y,pw=e.w||70,ph=e.h||56,flip=e.v<0){
 if(e.type==='turtle'){
   const baseX=px+pw/2, baseY=py+ph;
   if(e.state==='walk'){
     const frames=turtleSR.walk; const fr=frames[Math.floor(swingClock*9)%frames.length];
     const dw=114,dh=86; drawFrameRot(turtleImg,fr,baseX,baseY-dh/2+4,dw,dh,0,flip);
   }else if(e.state==='hide'){
     const fr=e.stateT>.12?turtleSR.hide[0]:turtleSR.hide[1]; const dw=106,dh=68; drawFrameRot(turtleImg,fr,baseX,baseY-dh/2+3,dw,dh,0,flip);
   }else if(e.state==='shell'){
     const fr=(Math.sin(swingClock*2.4+e.x*.01)>0.55?turtleSR.peek[0]:turtleSR.shell); const dw=100,dh=62; drawFrameRot(turtleImg,fr,baseX,baseY-dh/2+2,dw,dh,Math.PI,flip);
   }else if(e.state==='fly'){
     const dw=102,dh=62; const ang=(e.x*.045)*(e.shellDir||1); drawFrameRot(turtleImg,turtleSR.shell,baseX,baseY-dh/2+2,dw,dh,ang,flip);
   }
   return;
 }
 let img=turtleImg,fr=turtleSR.walk[Math.floor(swingClock*8)%turtleSR.walk.length],dw=88,dh=62,drawX=px-(dw-pw)/2,drawY=py+ph-dh+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy);
 const baseX=px+pw/2,baseY=py+ph+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy);
 if(e.type==='magmaBeetle'&&magmaBeetleImg){const charging=Math.sin(swingClock*3.1+e.phase)>0.1,start=charging?4:0,count=4,frame=start+(Math.floor(swingClock*(charging?11:7)+e.phase)%count);drawAnchoredFrame(magmaBeetleImg,enemySR.magmaBeetle[frame],baseX,baseY,108,88,flip);return}
 else if(e.type==='emberBat'&&emberBatImg){const attack=Math.sin(swingClock*2.25+e.phase)>.58,start=attack?4:0,count=attack?3:4,frame=start+(Math.floor(swingClock*(attack?10:8)+e.phase)%count);drawAnchoredFrame(emberBatImg,enemySR.emberBat[frame],baseX,baseY+8,116,88,flip);return}
 else if(e.type==='armadillo'&&armadilloImg){const rolling=Math.sin(swingClock*4.2+e.phase)>.45,start=rolling?4:0,frame=start+(Math.floor(swingClock*(rolling?13:8)+e.phase)%4);drawAnchoredFrame(armadilloImg,enemySR.armadillo[frame],baseX,baseY,rolling?76:112,64,flip);return}
 else if(e.type!=='turtle'&&biomeEnemyImg){img=biomeEnemyImg;const frames=enemySR[e.type]||enemySR.frog;fr=frames[Math.floor(swingClock*(e.type==='mosquito'?11:7)+e.phase)%frames.length];const sz={swampTurtle:[96,70],frog:[76,62],mosquito:[78,62],penguin:[70,76],seal:[92,66],iceShell:[82,62]}[e.type]||[82,62];dw=sz[0];dh=sz[1];drawX=px-(dw-pw)/2;drawY=py+ph-dh+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy)}
 ds(img,fr,drawX,drawY,dw,dh,flip);
}
function drawEnemy(e){drawEnemySprite(e,e.x,e.y,e.w||70,e.h||56,e.type==='turtle'?(e.state==='fly'?(e.shellDir||1)<0:e.v<0):e.v<0)}
function drawCinematicOverlay(){
 if(introT<=0&&portalSeq<=0)return;
 x.save();
 const portalMode=portalSeq>0,progress=portalMode?Math.min(1,portalSeq/2.15):1-introT/Math.max(.01,introDuration);
 const fade=portalMode?Math.min(1,portalSeq*1.8):Math.min(1,progress*4,(1-progress)*4);
 if(!reducedMotion){const bar=34+Math.sin(Math.min(1,progress)*Math.PI)*18;x.fillStyle=`rgba(0,5,8,${.78*fade})`;x.fillRect(0,0,W,bar);x.fillRect(0,H-bar,W,bar)}
 if(portalMode){
   const flash=Math.max(0,(portalSeq-1.18)/.97);x.fillStyle=`rgba(160,238,255,${flash*.34})`;x.fillRect(0,0,W,H);
   x.textAlign='center';x.globalAlpha=Math.min(1,portalSeq*1.45);x.fillStyle='#dffcff';x.shadowColor='#51ddff';x.shadowBlur=18;x.font='900 31px Arial';x.fillText('PORTAL CONCLUÍDO',W/2,112);x.shadowBlur=0;x.font='bold 15px Arial';x.fillStyle='#fff1aa';x.fillText('Preparando o resultado da fase...',W/2,140);
 }else{
   x.textAlign='center';x.globalAlpha=fade;x.fillStyle='#ffd45d';x.shadowColor='#000';x.shadowBlur=10;x.font='900 20px Arial';x.fillText('FASE '+campaignNumber(),W/2,188);x.font='900 38px Arial';x.fillStyle='#fff7d2';x.fillText(currentLevelName,W/2,230);x.shadowBlur=0;x.font='bold 16px Arial';x.fillStyle='#bfe8da';x.fillText(PHASE_SUBTITLES[currentLevel]||'A aventura continua',W/2,260);x.font='bold 13px Arial';x.fillStyle='#ffe6a1';const objective=(currentLevel===7||currentLevel===9)?'TROQUE DE FAIXA  •  PULE  •  SOBREVIVA À DESCIDA':currentLevel===8?'NÃO PARE  •  FUJA DA PEDRA GIGANTE  •  ALCANCE O PORTAL':currentLevel===6?'NÃO PARE  •  FUJA DA BOLA DE NEVE  •  ALCANCE O PORTAL':'ALCANCE O PORTAL  •  QUEBRE AS CAIXAS  •  ENCONTRE O CRISTAL';x.fillText(objective,W/2,302);x.font='12px Arial';x.fillStyle='#b6c9c4';x.fillText('ENTER / ESPAÇO para pular',W/2,H-47);
 }
 x.restore();
}
function drawDamageFlash(){if(hitFlash<=0)return;const q=Math.min(1,hitFlash/.62);x.save();x.globalAlpha=q*.28;x.fillStyle=deathKind==='freeze'?'#a9efff':deathKind==='poison'?'#a8e85d':'#ff6d56';x.fillRect(0,0,W,H);x.globalAlpha=q*.35;x.strokeStyle='#fff2cc';x.lineWidth=8*q+1;x.strokeRect(4,4,W-8,H-8);x.restore()}
function drawDeathCinematicOverlay(){
 if(deathAnim<=0)return;
 const elapsed=DEATH_DURATION-deathAnim,progress=Math.min(1,elapsed/DEATH_DURATION),fade=Math.min(1,elapsed*5,deathAnim*3.2);
 x.save();
 x.fillStyle=`rgba(2,6,12,${(.16+.24*progress)*fade})`;x.fillRect(0,0,W,H);
 const flash=Math.max(0,1-elapsed/.16);if(flash>0){x.fillStyle=`rgba(255,244,190,${flash*.42})`;x.fillRect(0,0,W,H)}
 if(!reducedMotion){const bar=26+Math.sin(progress*Math.PI)*28;x.fillStyle=`rgba(0,4,8,${.86*fade})`;x.fillRect(0,0,W,bar);x.fillRect(0,H-bar,W,bar)}
 if(elapsed>.56){const textFade=Math.min(1,(elapsed-.56)*4,deathAnim*2.8);x.globalAlpha=Math.max(0,textFade);x.textAlign='center';x.shadowColor='#07151d';x.shadowBlur=10;x.fillStyle='#fff3c4';x.font='900 25px Arial';x.fillText(lives>0?(DEATH_TITLES[deathKind]||'VIDA PERDIDA'):'FIM DA TENTATIVA',W/2,178);x.shadowBlur=0;x.fillStyle='#9bdff2';x.font='bold 13px Arial';x.fillText(lives>0?'Voltando ao último checkpoint...':'A ilha ainda estará esperando por você.',W/2,203)}
 x.restore();
}
function mode7Curve(distance,d,strength=34){const far=Math.max(0,Math.min(1,d/980)),sway=Math.sin(distance/720)*strength*far,detail=Math.sin((distance+d)/410)*10*far,extra=Math.sin((distance+d)/205)*4*far*far;return sway+detail+extra}
function rideProjection(lane,d){const t=Math.max(0,Math.min(1,1-d/980)),curve=mode7Curve(rideState?.distance||0,d,currentLevel===9?42:30);return{x:W/2+lane*(38+188*t)+curve,y:184+t*t*338,scale:.15+t*1.01}}
function avalancheProjection(lane,d){const a=avalancheState||buildAvalancheState(),t=Math.max(0,Math.min(1,1-d/980)),curve=mode7Curve(a.distance,d,currentLevel===8?40:28);return{x:W/2+lane*(38+190*t)+curve,y:184+t*t*338,scale:.15+t*1.02}}
function mode7Random(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)}
function fillMode7Band(projection,d0,d1,leftOuter,rightOuter,leftInner,rightInner,color,alpha=1){const p0o=projection(leftOuter,d0),p0i=projection(leftInner,d0),p1i=projection(leftInner,d1),p1o=projection(leftOuter,d1),q0o=projection(rightOuter,d0),q0i=projection(rightInner,d0),q1i=projection(rightInner,d1),q1o=projection(rightOuter,d1);x.save();x.globalAlpha=alpha;x.fillStyle=color;x.beginPath();x.moveTo(p0o.x,p0o.y);x.lineTo(p0i.x,p0i.y);x.lineTo(p1i.x,p1i.y);x.lineTo(p1o.x,p1o.y);x.closePath();x.fill();x.beginPath();x.moveTo(q0i.x,q0i.y);x.lineTo(q0o.x,q0o.y);x.lineTo(q1o.x,q1o.y);x.lineTo(q1i.x,q1i.y);x.closePath();x.fill();x.restore()}
function drawMode7ShadowEllipse(cx,cy,rx,ry,alpha=.25,color='#000'){x.save();x.globalAlpha=alpha;x.fillStyle=color;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.fill();x.restore()}
function drawMode7Atmosphere(jungle=false,danger=0,ride=false){
 const top=152,bottom=H;
 x.save();
 const sky=x.createLinearGradient(0,top,0,bottom);
 if(jungle){sky.addColorStop(0,'rgba(118,168,84,.08)');sky.addColorStop(.55,'rgba(186,144,74,.05)');sky.addColorStop(1,'rgba(44,28,12,.12)')}
 else{sky.addColorStop(0,'rgba(215,244,255,.12)');sky.addColorStop(.55,'rgba(178,223,243,.06)');sky.addColorStop(1,'rgba(18,55,74,.10)')}
 x.fillStyle=sky;x.fillRect(0,top,W,bottom-top);
 const haze=x.createLinearGradient(0,158,0,274);haze.addColorStop(0,jungle?'rgba(255,240,198,.15)':'rgba(255,255,255,.30)');haze.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=haze;x.fillRect(0,156,W,130);
 const vignette=x.createLinearGradient(0,0,W,0);vignette.addColorStop(0,'rgba(0,0,0,.20)');vignette.addColorStop(.18,'rgba(0,0,0,0)');vignette.addColorStop(.82,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.20)');x.fillStyle=vignette;x.fillRect(0,top,W,bottom-top);
 if(danger>.58&&!jungle){x.fillStyle='rgba(255,255,255,'+(.04+danger*.08)+')';x.fillRect(0,top,W,bottom-top)}
 if(danger>.62&&jungle){x.fillStyle='rgba(140,103,53,'+(.04+danger*.07)+')';x.fillRect(0,top,W,bottom-top)}
 x.restore();
}
function drawMode7Climate(distance,jungle=false,cold=false,intensity=0){
 if(reducedMotion&&graphicsTier()===0)return;
 const count=jungle?fxCount(10,18,28):fxCount(18,32,48);
 x.save();
 for(let i=0;i<count;i++){
   const seed=i*17.13+(jungle?31:7),base=distance*(jungle?1.18:1.85)+swingClock*(jungle?85:120)+seed*53;
   let px=((base*1.73+i*67)% (W+140))-70, py=160+((base*0.81+i*37)%360), size=(jungle?(4+(i%4)*2):(2+(i%3))), alpha=jungle?.18+.03*(i%4):.28+.03*(i%4);
   if(jungle){
     x.globalAlpha=alpha+Math.min(.12,intensity*.08);x.strokeStyle=i%3===0?'#80b95b':i%3===1?'#d1a15d':'#8d6e3f';x.lineWidth=1+(i%2);x.beginPath();x.moveTo(px,py);x.lineTo(px-10-size*1.8,py+4+size*.4);x.stroke();
     if(graphicsTier()>0&&i%5===0){x.globalAlpha=.12; x.fillStyle='#c78e4d'; x.beginPath(); x.arc(px+6,py+10,2+(i%3),0,Math.PI*2); x.fill()}
   }else{
     x.globalAlpha=alpha+Math.min(.16,intensity*.12);x.fillStyle=i%4===0?'#ffffff':i%4===1?'#dff8ff':'#c7ebf5';x.fillRect(px,py,4+size*1.3,1+size*.55);
     if(graphicsTier()>0){x.globalAlpha*=.65;x.fillRect(px-6,py-4,2+size*.55,2+size*.55)}
   }
 }
 x.restore();
}
function drawRideSurfaceFX(rs,jungle=false){
 if(reducedMotion&&graphicsTier()===0)return;const laneX=rs.lane*125,air=rs.y*.65,trails=fxCount(5,9,14);x.save();
 for(let i=0;i<trails;i++){const q=((rs.distance*1.7+swingClock*120+i*37)%220)/220,spread=(i%2?1:-1)*(10+(i%4)*7),yy=486-q*146-air*.08,xx=W/2+laneX-spread*q*1.4-(jungle?24:28);x.globalAlpha=(1-q)*(jungle?.16:.22);x.fillStyle=jungle?(i%3===0?'#c89655':i%3===1?'#9b6c39':'#5a7740'):(i%3===0?'#ffffff':'#d9f2ff');x.fillRect(xx,yy,8+(1-q)*18,2+(i%2));}
 x.restore();
}
function drawMode7Ground(projection,distance,jungle=false){
 const img=mode7GroundImg;if(!img)return;const bands=graphicsTier()>1?36:graphicsTier()>0?28:20,far=975,near=0,roadHalf=1.92,shoulderOuter=2.42;
 for(let i=0;i<bands;i++){
   const d0=far-(far-near)*i/bands,d1=far-(far-near)*(i+1)/bands,mid=(d0+d1)/2,t=Math.max(0,Math.min(1,1-mid/far));
   fillMode7Band(projection,d0,d1,-shoulderOuter,shoulderOuter,-roadHalf,roadHalf,jungle?'#675130':'#dfeff6',.20+t*.12);
   fillMode7Band(projection,d0,d1,-roadHalf,roadHalf,-1.70,1.70,jungle?'#b97b42':'#cae6ef',.08+t*.06);
 }
 x.save();x.beginPath();const fl=projection(-roadHalf,far),fr=projection(roadHalf,far),nr=projection(roadHalf,near),nl=projection(-roadHalf,near);x.moveTo(fl.x,fl.y);x.lineTo(fr.x,fr.y);x.lineTo(nr.x,nr.y);x.lineTo(nl.x,nl.y);x.closePath();x.clip();
 for(let i=0;i<bands;i++){
   const d0=far-(far-near)*i/bands,d1=far-(far-near)*(i+1)/bands,mid=(d0+d1)/2,t=Math.max(0,Math.min(1,1-mid/far)),p0=projection(0,d0),p1=projection(0,d1),l=projection(-roadHalf,mid),r=projection(roadHalf,mid),h=Math.max(2,p1.y-p0.y+2),sy=((Math.floor((distance+d0)*.78))%512+512)%512,sh=Math.max(3,Math.min(86,Math.floor(512/bands*1.8)));
   x.globalAlpha=.94;x.drawImage(img,0,sy,512,Math.min(sh,512-sy),l.x,p0.y,r.x-l.x,h);
   x.globalAlpha=.10+t*.08;x.fillStyle=jungle?'#2b1c10':'#ffffff';x.fillRect(l.x,p0.y,r.x-l.x,Math.max(1,h*.32));
   x.globalAlpha=.05+t*.10;x.fillStyle=jungle?'#4a3119':'#7bbfd6';const rutL=projection(-.52,mid),rutR=projection(.52,mid),rutW=Math.max(2,24*t);x.fillRect(rutL.x-rutW/2,p0.y,rutW,h);x.fillRect(rutR.x-rutW/2,p0.y,rutW,h);
 }
 x.restore();
 x.save();x.globalAlpha=.65;x.strokeStyle=jungle?'#6b4d29':'#f5fdff';for(const lane of [-.66,.66]){for(let d=70;d<960;d+=118){const a=projection(lane,d),b=projection(lane,d+54);x.lineWidth=Math.max(1,a.scale*2.2);x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}x.restore();
 x.save();const g=x.createLinearGradient(0,152,0,248);g.addColorStop(0,jungle?'rgba(223,214,155,.14)':'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,150,W,110);x.restore();
}
const MODE7_PROP_SR=Array.from({length:8},(_,i)=>[(i%4)*256,Math.floor(i/4)*256,256,256]);
function drawMode7Roadside(projection,distance,jungle=false){
 if(!mode7PropsImg)return;const density=graphicsTier()>1?18:graphicsTier()>0?14:10,cell=jungle?122:128,entries=[];const start=Math.floor(distance/cell)-2,end=start+density;
 for(let id=start;id<end;id++){
   const keep=mode7Random(id*3.17+(jungle?9:0));if(keep<.18)continue;const world=id*cell+cell*.5,d=world-distance;if(d<55||d>975)continue;const side=mode7Random(id*7.91)<.5?-1:1,lateral=2.08+mode7Random(id*5.37)*.48,pr=projection(side*lateral,d),idx=(jungle?4:0)+Math.floor(mode7Random(id*11.73)*4),sizeMul=.88+mode7Random(id*13.31)*.32;entries.push({d,side,pr,idx,sizeMul,alpha:.42+pr.scale*.78})
   if(graphicsTier()>0&&mode7Random(id*17.03)>.74){const side2=-side,lateral2=2.18+mode7Random(id*9.4)*.36,pr2=projection(side2*lateral2,d+18),idx2=(jungle?4:0)+Math.floor(mode7Random(id*21.15)*4),sizeMul2=.76+mode7Random(id*23.8)*.24;entries.push({d:d+18,side:side2,pr:pr2,idx:idx2,sizeMul:sizeMul2,alpha:.28+pr2.scale*.62})}
 }
 entries.sort((a,b)=>b.d-a.d);
 for(const e of entries){const sc=e.pr.scale*(jungle?1.05:.98)*e.sizeMul,w=150*sc,h=150*sc;drawMode7ShadowEllipse(e.pr.x,e.pr.y-2*h*.02,Math.max(8,26*sc),Math.max(4,8*sc),Math.min(.26,e.alpha*.35));x.save();x.globalAlpha=Math.min(1,e.alpha);ds(mode7PropsImg,MODE7_PROP_SR[e.idx],e.pr.x-w/2,e.pr.y-h*.92,w,h,e.side<0);x.restore()}
}
function drawSpecialWarnings(s,projection){
 if(deathAnim>0||introT>0)return;
 const threats=s.obstacles.filter(o=>!o.done&&o.type!=='fruit'&&o.z-s.distance>80&&o.z-s.distance<300&&Math.abs(s.targetLane-o.lane)<.1);
 for(const o of threats){const d=o.z-s.distance,pr=projection(o.lane,d),pulse=.65+Math.sin(swingClock*12)*.25;x.save();x.globalAlpha=Math.max(.25,1-d/360);x.fillStyle='#ff654f';x.strokeStyle='#fff0b0';x.lineWidth=2;x.beginPath();x.arc(pr.x,pr.y-78*pr.scale,12+6*pulse,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#fff';x.textAlign='center';x.font='900 '+Math.max(11,17*pr.scale)+'px Arial';x.fillText('!',pr.x,pr.y-72*pr.scale);x.restore()}
}
function drawSpecialCombo(s){
 if((s.combo||0)<2)return;x.save();const pulse=1+Math.min(.12,s.comboT*.035);x.translate(840,104);x.scale(pulse,pulse);x.fillStyle='#071923e8';x.strokeStyle=s.combo>=6?'#ffd45d':'#8fe9ff';x.lineWidth=2;x.beginPath();x.roundRect(-92,-20,184,40,11);x.fill();x.stroke();x.textAlign='center';x.fillStyle=s.combo>=6?'#ffe88b':'#dffaff';x.font='900 18px Arial';x.fillText('COMBO ×'+s.combo,0,7);x.restore();x.textAlign='left'
}
function activeChaseImg(){return currentLevel===8?boulderImg:snowballImg}
function activeMountImg(){return currentLevel===9?boarRideImg:bearRideImg}
const ROAD_OBSTACLE_SR=Array.from({length:8},(_,i)=>[(i%4)*256,Math.floor(i/4)*256,256,256]);
function roadObstacleSource(o,jungle){
 const seed=Math.abs(Math.floor((o.z||0)/137));let frame=1;
 if(o.type==='crate')frame=3;
 else if(o.type==='ice')frame=jungle?[0,2,6][seed%3]:[0,2,3][seed%3];
 else frame=(jungle?[1,2,4,5,6,7]:[1,3,4,5,6,7])[seed%6];
 return ROAD_OBSTACLE_SR[frame];
}
function drawRoadObstacle(o,pr,s,jungle){
 if(!roadObstaclesImg)return false;
 const seed=Math.abs(Math.floor((o.z||0)/137)),wide=o.type==='ice'||o.type==='crate',sizeMul=.92+(seed%5)*.04,wobble=((seed%3)-1)*2.5*s,yLift=(seed%4===0?4:0)*s,w=(wide?132:116)*s*sizeMul,h=(wide?108:104)*s*sizeMul;
 drawMode7ShadowEllipse(pr.x+wobble,pr.y-4*s,Math.max(8,w*.26),Math.max(3,h*.09),.22,jungle?'#1b1209':'#18313c');
 ds(roadObstaclesImg,roadObstacleSource(o,jungle),pr.x-w/2+wobble,pr.y-h-yLift,w,h,false,1);return true;
}
function drawPolarMountIntro(){
 const progress=Math.max(0,Math.min(1,1-introT/Math.max(.01,introDuration))),q=Math.min(1,progress/.55),jump=Math.sin(q*Math.PI)*112;
 const mount=activeMountImg();x.save();x.globalAlpha=Math.max(.15,Math.min(1,(progress-.16)*4));ds(mount,[0,0,256,256],W/2-118,270,236,236,false,1);x.restore();
 if(progress<.58){const fr=[sr.run1,sr.run2,sr.jump1,sr.jump3][Math.min(3,Math.floor(q*4))];x.save();x.globalAlpha=1-Math.max(0,(progress-.43)/.15);x.translate(190+q*242,435-jump);x.rotate(q*.18);ds(playerImg,fr,-48,-116,96,116,false,1);x.restore()}
 if(progress>.5&&progress<.86){
   const f=Math.min(1,(progress-.5)/.12,((.86-progress)/.12));x.save();x.globalAlpha=Math.max(0,f);x.fillStyle='#06141de6';x.strokeStyle='#ffd45d';x.lineWidth=4;x.beginPath();x.roundRect(650,122,230,178,18);x.fill();x.stroke();x.beginPath();x.arc(765,205,72,0,Math.PI*2);x.clip();x.drawImage(playerImg,sr.idle[0],sr.idle[1],sr.idle[2],112,690,130,150,160);x.restore();
   x.save();x.globalAlpha=Math.max(0,f);x.strokeStyle='#2c160d';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(728,178);x.lineTo(758,166);x.stroke();x.fillStyle='#ffe477';x.font='900 15px Arial';x.textAlign='center';x.fillText('PRONTO!',765,286);x.restore();
 }
 if(progress>.78){const burst=(progress-.78)/.22;x.save();x.globalAlpha=Math.max(0,1-burst);x.strokeStyle='#dffcff';x.lineWidth=4;for(let i=0;i<8;i++){x.beginPath();x.moveTo(W/2+Math.cos(i*.785)*90,W/2-110+Math.sin(i*.785)*62);x.lineTo(W/2+Math.cos(i*.785)*(120+burst*80),W/2-110+Math.sin(i*.785)*(82+burst*55));x.stroke()}x.restore()}
}
function drawSpecialTopHud(title,stateObj,accent='#8fdcf0',accent2='#70ddf4',progress=0,rightTitle='DISTÂNCIA',danger=0,extraLabel='',extraValue=''){
 x.save();x.fillStyle='rgba(6,20,29,.90)';x.strokeStyle=accent;x.lineWidth=2;x.beginPath();x.roundRect(14,14,930,68,12);x.fill();x.stroke();
 x.fillStyle='#fff5d0';x.font='900 13px Arial';x.fillText(title,28,31);
 x.fillStyle='#fff';x.font='bold 18px Arial';x.fillText('VIDAS × '+lives,28,55);x.fillText('FRUTAS '+fruits,170,55);x.fillText('VELOC. '+Math.round(stateObj.speed||0),320,55);
 x.fillStyle='#b5d7df';x.font='bold 12px Arial';x.fillText('COMBO ×'+(stateObj.combo||0),472,31);x.fillText('ESQUIVAS '+(stateObj.nearMisses||0),472,53);
 x.fillStyle=accent;x.fillText(rightTitle,640,31);x.fillStyle='#173746';x.fillRect(640,42,130,12);x.fillStyle=accent2;x.fillRect(640,42,130*Math.max(0,Math.min(1,progress)),12);
 x.fillStyle=danger>.68?'#ff7b5f':accent;x.fillText(extraLabel,792,31);x.fillStyle='#173746';x.fillRect(792,42,132,12);x.fillStyle=danger>.68?'#ff5d4d':accent2;x.fillRect(792,42,132*Math.max(0,Math.min(1,extraValue)),12);
 x.restore()
}
function drawRideLevel(){
 camX=0;bg();const rs=rideState||buildRideState(),jungle=currentLevel===9,mount=activeMountImg();
 x.save();if(!reducedMotion&&graphicsTier()>0){x.translate(W/2,H/2);x.rotate(rs.lean*.010);x.translate(-W/2,-H/2)}drawMode7Atmosphere(jungle,0,true);x.fillStyle=jungle?'rgba(42,92,37,.10)':'rgba(218,244,255,.10)';x.fillRect(0,160,W,380);drawMode7Ground(rideProjection,rs.distance,jungle);drawMode7Roadside(rideProjection,rs.distance,jungle);drawRideSurfaceFX(rs,jungle);
 drawSpecialWarnings(rs,rideProjection);
 const visible=rs.obstacles.filter(o=>!o.done&&o.z-rs.distance>-75&&o.z-rs.distance<980).sort((a,b)=>(b.z-rs.distance)-(a.z-rs.distance));
 for(const o of visible){const pr=rideProjection(o.lane,o.z-rs.distance),s=pr.scale;if(o.type==='fruit')ds(playerImg,sr.fruit,pr.x-24*s,pr.y-44*s,48*s,54*s,false,1);else if(!drawRoadObstacle(o,pr,s,jungle)){x.fillStyle=jungle?'#766449':'#58788b';x.beginPath();x.arc(pr.x,pr.y-30*s,36*s,0,Math.PI*2);x.fill()}}
 const laneX=rs.lane*125,air=rs.y*.65,turn=Math.abs(rs.targetLane-rs.lane),runFr=Math.floor(p.anim)%4,frame=rs.y>22?6:turn>.08?(rs.targetLane<rs.lane?4:5):runFr,mountBob=Math.sin(p.anim*Math.PI*2)*(turn>.04?4:2.4),landingSquash=rs.y>0?1.04:.98+Math.sin(p.anim*Math.PI*2)*.02;
 if(introT>0&&!reducedMotion)drawPolarMountIntro();
 else if(deathAnim>0){const q=(DEATH_DURATION-deathAnim)/DEATH_DURATION,bounce=Math.sin(Math.min(1,q*1.45)*Math.PI)*72;x.save();x.translate(W/2+laneX+q*54,462-air-bounce+q*86);x.rotate(q*3.15);x.scale(1+q*.08,1-q*.12);ds(mount,[7*256,0,256,256],-125,-205,250,250,false,Math.max(.12,1-q*.76));x.restore();x.save();x.fillStyle=jungle?'#cfac6d':'#effcff';for(let i=0;i<fxCount(3,6,9);i++){x.globalAlpha=Math.max(0,.65-q*.55);x.beginPath();x.arc(W/2+laneX-45+i*13-q*55,464+i%2*9,4+i%3*2,0,Math.PI*2);x.fill()}x.restore()}else{drawMode7ShadowEllipse(W/2+laneX,475-air*.08,48+turn*10,11+Math.max(0,10-rs.y*.03),.22,jungle?'#191008':'#17313c');x.save();x.translate(W/2+laneX,380-air+mountBob);x.rotate((rs.targetLane-rs.lane)*-.08);x.scale(1/landingSquash,landingSquash);ds(mount,[frame*256,0,256,256],-125,-125,250,250);x.restore();}
 drawMode7Climate(rs.distance,jungle,!jungle,.2+Math.min(.35,rs.speed/700));x.restore();
 drawSpecialTopHud(jungle?'CORRIDA DO JAVALI':'CORRIDA POLAR',rs,jungle?'#b7e171':'#8fdcf0',jungle?'#8ccb50':'#70ddf4',Math.min(1,rs.distance/RIDE_LENGTH),'DISTÂNCIA',0,'IMPACTOS',Math.min(1,(rs.hits||0)/6));
 drawSpecialCombo(rs);if(toastT>0){x.textAlign='center';x.font='bold 20px Arial';x.fillStyle='#00131dee';x.fillRect(W/2-220,95,440,38);x.fillStyle='#fff';x.fillText(toast,W/2,121);x.textAlign='left'}drawCinematicOverlay();drawDamageFlash();drawDeathCinematicOverlay();if(paused)drawPauseMenu();
}
function drawAvalancheLevel(){
 camX=0;bg();const a=avalancheState||buildAvalancheState(),danger=Math.max(0,Math.min(1,1-(a.gap-170)/590)),jungle=currentLevel===8,chase=activeChaseImg();
 x.save();if(!reducedMotion&&graphicsTier()>0){x.translate(W/2,H/2);x.rotate(a.lean*.011+(danger>.72?Math.sin(swingClock*15)*.003:0));x.translate(-W/2,-H/2)}drawMode7Atmosphere(jungle,danger,false);x.fillStyle=jungle?'rgba(42,92,37,.09)':'rgba(218,244,255,.10)';x.fillRect(0,154,W,H-154);drawMode7Ground(avalancheProjection,a.distance,jungle);drawMode7Roadside(avalancheProjection,a.distance,jungle);
 if(chase){const sf=Math.floor(swingClock*10)%6,size=188+danger*205,bx=W/2-size/2+Math.sin(swingClock*4)*5,by=148-danger*35;x.save();x.shadowColor=jungle?'#8fc85c':danger>.65?'#fff':'#bdefff';x.shadowBlur=graphicsTier()>0?20+danger*25:0;ds(chase,[sf*256,0,256,256],bx,by,size,size);x.restore()}
 drawSpecialWarnings(a,avalancheProjection);
 const visible=a.obstacles.filter(o=>!o.done&&o.z-a.distance>-70&&o.z-a.distance<980).sort((u,v)=>(v.z-a.distance)-(u.z-a.distance));
 for(const o of visible){const pr=avalancheProjection(o.lane,o.z-a.distance),s=pr.scale;if(o.type==='fruit')ds(playerImg,sr.fruit,pr.x-24*s,pr.y-44*s,48*s,54*s);else if(!drawRoadObstacle(o,pr,s,jungle)){x.fillStyle=jungle?'#766449':'#58788b';x.beginPath();x.arc(pr.x,pr.y-30*s,36*s,0,Math.PI*2);x.fill()}}
 const laneX=a.lane*128,air=a.y*.64,run=[sr.run1,sr.run2,sr.run3,sr.run4][Math.floor(p.anim)%4],flip=Math.floor(p.anim)%2===0,bob=Math.sin(p.anim*Math.PI)*5;
 if(deathAnim>0){const q=(DEATH_DURATION-deathAnim)/DEATH_DURATION;x.save();x.translate(W/2+laneX+Math.sin(q*18)*18,500-air+q*42);x.rotate(q*6.2);x.scale(1+q*.34,Math.max(.3,1-q*.66));ds(playerImg,q<.3?sr.hurt:sr.spin2,-62,-158,124,158,flip,Math.max(.08,1-q*.82));x.restore()}else{drawMode7ShadowEllipse(W/2+laneX,503-air*.06,24+Math.abs(a.targetLane-a.lane)*8,8+Math.max(0,8-a.y*.02),.24,jungle?'#201409':'#153240');x.save();x.translate(W/2+laneX,500-air+bob);x.rotate((a.targetLane-a.lane)*-.16);const squash=a.y>0?1.06:.98+Math.sin(p.anim*Math.PI*2)*.025;x.scale(1/squash,squash);ds(playerImg,run,-62,-158,124,158,flip,1);x.restore()}
 for(let i=0;i<fxCount(0,6,12)&&!reducedMotion;i++){const xx=(i*83+a.distance*1.7)%W,yy=210+(i*47+a.distance*1.2)%310;x.globalAlpha=.18+danger*.28;x.strokeStyle=jungle?'#d9bd6a':'#effcff';x.lineWidth=2+i%3;x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+(xx-W/2)*.08,yy+35+danger*30);x.stroke()}drawMode7Climate(a.distance,jungle,!jungle,danger);x.globalAlpha=1;x.restore();
 drawSpecialTopHud(jungle?'PEDRA DA SELVA':'AVALANCHE ALPINA',a,danger>.68?'#ff795f':jungle?'#9fd56f':'#8fdcf0',danger>.68?'#ff5b4b':jungle?'#8ecb55':'#70ddf4',Math.min(1,a.distance/AVALANCHE_LENGTH),'DISTÂNCIA',danger,jungle?'PEDRA':'AVALANCHE',danger);
 drawSpecialCombo(a);if(toastT>0){x.textAlign='center';x.font='bold 20px Arial';x.fillStyle='#00131dee';x.fillRect(W/2-220,94,440,38);x.fillStyle='#fff';x.fillText(toast,W/2,120);x.textAlign='left'}drawCinematicOverlay();drawDamageFlash();drawDeathCinematicOverlay();if(paused)drawPauseMenu();
}
function drawPlatformDeath(elapsed,baseX,baseY,flip){
 const profile=activeDeathProfile(),q=Math.min(1,elapsed/.92),fade=Math.max(0,1-Math.max(0,elapsed-1.02)*4.5);let frame=sr.hurt,tx=baseX,ty=baseY-5,rot=0,sx=1,sy=1,alpha=fade;
 if(profile.motion==='fall'){frame=sr.fall;ty=baseY-18+q*q*142;rot=deathFacing*q*5.8;sx=.94;sy=1.08}
 else if(profile.motion==='stiff'){frame=sr.jump4;ty=baseY-12-Math.sin(Math.min(1,q*1.5)*Math.PI)*64;rot=deathFacing*.08;sx=.84;sy=1.18}
 else if(profile.motion==='blast'){frame=q<.45?sr.hurt:sr.spin2;ty=baseY-15-Math.sin(Math.min(1,q)*Math.PI)*82;rot=deathFacing*q*7.2;sx=1+q*.18;sy=1+q*.18}
 else if(profile.motion==='flatten'){frame=sr.fall;ty=baseY+34;rot=deathFacing*1.56;sx=1+q*.72;sy=Math.max(.18,1-q*.82)}
 else if(profile.motion==='frozen'){frame=sr.hurt;ty=baseY-6;rot=Math.sin(elapsed*32)*.018;sx=.96;sy=1.03;alpha=Math.max(0,1-Math.max(0,elapsed-.68)*3.2)}
 else if(profile.motion==='sick'){frame=q<.55?sr.hurt:sr.fall;ty=baseY-5+q*34;rot=Math.sin(elapsed*12)*(.08+q*.16);sx=1+Math.sin(elapsed*18)*.035;sy=1-Math.sin(elapsed*18)*.03;alpha=Math.max(.15,fade)}
 else {frame=q<.22?sr.hurt:q<.62?sr.spin1:sr.fall;ty=baseY-8+q*q*52;rot=deathFacing*(q*2.35-.16);sx=1-q*.07;sy=1+q*.05}
 x.save();x.translate(tx,ty);x.rotate(rot);x.scale(sx,sy);x.globalAlpha=alpha;ds(playerImg,frame,-44,-108,88,108,flip,1);x.restore();
 if(profile.motion==='frozen'){x.save();x.globalAlpha=Math.max(0,.74-q*.62);x.fillStyle='#9cecff';x.strokeStyle='#efffff';x.lineWidth=3;x.fillRect(baseX-45,baseY-118,90,118);x.strokeRect(baseX-45,baseY-118,90,118);for(let i=0;i<fxCount(3,5,8);i++)x.fillRect(baseX-55+i*16,baseY-123-Math.sin(i*2.1)*9*q,6,13);x.restore()}
 else if(profile.motion==='sick'){x.save();x.fillStyle=profile.color;for(let i=0;i<fxCount(4,7,10);i++){const b=Math.max(0,elapsed-.045*i);x.globalAlpha=Math.max(0,.7-b*.44);x.beginPath();x.arc(baseX-30+i*7,baseY-18-b*(44+i*3),3+i%3,0,Math.PI*2);x.fill()}x.restore()}
 else if(profile.motion==='blast'){x.save();x.globalAlpha=1-q;x.strokeStyle=profile.color;x.lineWidth=7*(1-q)+1;for(let i=0;i<fxCount(1,2,3);i++){x.beginPath();x.arc(baseX,baseY-45,24+i*22+q*64,0,Math.PI*2);x.stroke()}x.restore()}
 else if(profile.motion==='stiff'){x.save();x.globalAlpha=Math.max(0,1-elapsed*.72);x.fillStyle='#eefbff';for(let i=0;i<5;i++){x.beginPath();x.moveTo(baseX-46+i*22,baseY+25);x.lineTo(baseX-35+i*22,baseY-24-Math.sin(elapsed*9+i)*8);x.lineTo(baseX-24+i*22,baseY+25);x.closePath();x.fill()}x.restore()}
 else if(profile.motion==='flatten'){x.save();x.globalAlpha=Math.max(0,1-q)*.7;x.fillStyle=profile.color;x.fillRect(baseX-62-q*20,baseY+28,124+q*40,7);x.restore()}
 else if(profile.motion==='fall'){x.save();x.strokeStyle=profile.color;x.lineWidth=3;for(let i=0;i<fxCount(3,5,7);i++){const xx=baseX-48+i*16,off=(elapsed*240+i*23)%92;x.globalAlpha=.25+(i%3)*.14;x.beginPath();x.moveTo(xx,baseY-130+off);x.lineTo(xx-deathFacing*7,baseY-100+off);x.stroke()}x.restore()}
 if(!reducedMotion&&graphicsTier()>0&&elapsed>.5&&elapsed<1.42){const f=(elapsed-.5)/.92;x.save();for(let i=0;i<fxCount(5,8,12);i++){const a=-2.86+i*.25,spd=42+(i%4)*19,px=baseX-deathFacing*20+Math.cos(a)*spd*f,py=baseY+38+Math.sin(a)*spd*f+78*f*f;x.globalAlpha=Math.max(0,1-f)*(i%3===0?.9:.62);x.fillStyle=i%3===0?profile.color:i%3===1?'#f47a32':'#7ce6ff';const size=3+(i%3)*2;x.fillRect(Math.round(px),Math.round(py),size,size)}x.restore()}
 if(profile.soul&&elapsed>.38&&soulImg){const s=Math.min(1,(elapsed-.38)/Math.max(.01,DEATH_DURATION-.38)),fr=Math.floor((elapsed-.38)*11)%6,rise=(s*s*(3-2*s))*188,drift=Math.sin(s*Math.PI*3.2)*18*(1-s*.35),soulFade=Math.min(1,(elapsed-.38)*5)*Math.min(1,deathAnim*2.6),px=deathX-24+drift,py=deathY-24-rise;for(let i=fxCount(0,2,3);i>=1;i--){x.save();x.globalAlpha=soulFade*(.10/i);x.shadowColor='#67d9ff';x.shadowBlur=12;ds(soulImg,[fr*150,0,150,145],px-drift*.06*i,py+12*i,116,112,false,1);x.restore()}x.save();x.globalAlpha=soulFade;x.shadowColor='#67d9ff';x.shadowBlur=graphicsTier()>0?22:0;ds(soulImg,[fr*150,0,150,145],px,py,116,112,false,.98);x.restore()}
}
function drawBossLevel(){
 camX=0;bg();const s=bossState||window.FinalBoss?.create?.();if(!s)return;
 x.save();const sx=shake>0?(Math.random()-.5)*12:0,sy=shake>0?(Math.random()-.5)*8:0;x.translate(sx,sy);
 const stageColor=s.phase===1?'rgba(42,145,65,.14)':s.phase===2?'rgba(226,82,24,.16)':'rgba(75,190,255,.16)',accent=s.phase===1?'#7ee178':s.phase===2?'#ff9b45':'#8fdcff';x.fillStyle=stageColor;x.fillRect(0,0,W,H);x.fillStyle='rgba(4,8,13,.20)';x.fillRect(0,0,W,H);x.fillStyle='#382719';x.fillRect(0,groundY,960,H-groundY);x.fillStyle=accent;x.fillRect(0,groundY,960,7);
 x.save();x.globalAlpha=.28;for(let i=0;i<10;i++){const yy=groundY-120+i*16;x.fillStyle=i%2===0?'rgba(255,255,255,.03)':'rgba(0,0,0,.05)';x.fillRect(0,yy,W,7)}x.restore();
 for(const q of s.hazards){const warning=q.t>q.active,top=groundY-(q.kind==='ice'?115:70);x.save();x.globalAlpha=warning?.35:.88;x.fillStyle=warning?'#ffe36b':q.kind==='ice'?'#8eeaff':'#ff6b32';x.fillRect(q.x,warning?groundY-9:top,q.w,warning?9:groundY-top);if(warning){x.globalAlpha=.7;x.fillStyle='#fff6bc';x.fillRect(q.x,groundY-14,q.w,3)}else{x.fillStyle=q.kind==='ice'?'#efffff':'#ffd35a';for(let i=0;i<3;i++){x.beginPath();x.moveTo(q.x+i*q.w/3,groundY);x.lineTo(q.x+(i+.5)*q.w/3,top-(i%2)*13);x.lineTo(q.x+(i+1)*q.w/3,groundY);x.closePath();x.fill()}}x.restore()}
 for(const q of s.waves){x.save();x.fillStyle='#d6b36a';x.strokeStyle='#fff0a5';x.lineWidth=3;x.beginPath();x.moveTo(q.x,q.y+q.h);x.lineTo(q.x+q.w*.5,q.y);x.lineTo(q.x+q.w,q.y+q.h);x.closePath();x.fill();x.stroke();x.restore()}
 for(const q of s.projectiles){x.save();x.translate(q.x,q.y);x.rotate(s.clock*5);x.shadowColor='#c990ff';x.shadowBlur=18;x.fillStyle='#e8bdff';x.beginPath();x.arc(0,0,q.r,0,Math.PI*2);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(-q.r*.65,-q.r*.65,q.r*1.3,q.r*1.3);x.restore()}
 if(bossGuardianImg){const fr=window.FinalBoss.sourceFrame(s),coreX=s.x+s.w*.52,coreY=s.y+126,pulse=.55+Math.sin(s.clock*5)*.18;x.save();x.globalAlpha=.28+Math.max(0,s.vulnerable)*.18;x.shadowColor=accent;x.shadowBlur=20+Math.max(0,s.vulnerable)*14;x.fillStyle=accent;x.beginPath();x.arc(coreX,coreY,34+pulse*6,0,Math.PI*2);x.fill();x.restore();for(let i=0;i<3;i++){const r=52+i*13+Math.sin(s.clock*3+i)*2;x.save();x.globalAlpha=.13+(i===0&&s.vulnerable>0?.14:0);x.strokeStyle=accent;x.lineWidth=2;x.beginPath();x.arc(coreX,coreY,r,Math.PI*.15+s.clock*(.5+i*.12),Math.PI*1.12+s.clock*(.5+i*.12));x.stroke();x.restore()}x.save();if(s.flash>0)x.globalAlpha=.62;ds(bossGuardianImg,fr,s.x-20,s.y,s.w+40,s.h);x.restore()}
 const pf=p.spin>0?(Math.floor(p.anim*1.4)%2?sr.spin1:sr.spin2):!p.on?sr.jump2:Math.abs(p.vx)>25?[sr.run1,sr.run2,sr.run3,sr.run4][Math.floor(p.anim)%4]:sr.idle;
 if(deathAnim>0)drawPlatformDeath(DEATH_DURATION-deathAnim,p.x+p.w/2,p.y+p.h,p.facing<0);else{const aura=s.vulnerable>0?.18:0;x.save();if(aura>0){x.globalAlpha=aura;x.fillStyle='#fff2a6';x.beginPath();x.ellipse(p.x+23,p.y+58,38,50,0,0,Math.PI*2);x.fill()}ds(playerImg,pf,p.x-21,p.y-30,88,108,p.facing<0,inv>0&&Math.floor(inv*12)%2?.42:1);x.restore()}
 x.restore();
 const stageName=s.phase===1?'SELVA ANCESTRAL':s.phase===2?'CÂNION ARDENTE':'GELO ETERNO',names={slam:'IMPACTO NO CHÃO!',gem:'RAJADA DE GEMAS!',fire:'CHAMAS DO CÂNION!',ice:'GELO ANCESTRAL!'};
 x.save();x.fillStyle='rgba(7,21,29,.90)';x.strokeStyle='#e8c058';x.lineWidth=3;x.beginPath();x.roundRect(156,14,648,86,14);x.fill();x.stroke();x.textAlign='center';x.fillStyle='#fff3bf';x.font='900 18px Arial';x.fillText('GUARDIÃO DAS NOVE GEMAS  •  '+stageName,W/2,37);x.fillStyle='#351925';x.fillRect(244,50,470,18);x.fillStyle=accent;x.fillRect(248,54,462*(s.hp/s.maxHp),10);for(let i=0;i<s.maxHp;i++){x.strokeStyle='rgba(255,255,255,.18)';x.strokeRect(248+i*(462/s.maxHp),54,462/s.maxHp,10)}x.fillStyle='#fff';x.font='bold 12px Arial';x.fillText(s.hp+' / '+s.maxHp,W/2,64);for(let i=0;i<s.maxHp;i++){x.fillStyle=i<s.hp?accent:'rgba(255,255,255,.16)';x.fillRect(270+i*48,76,30,6)}x.fillStyle='#b7d7de';x.font='bold 12px Arial';x.fillText('FASE '+s.phase+'/3',210,86);x.fillText('ATAQUE ATUAL',730,86);x.fillStyle='#fff7cf';x.fillText(s.attack?(names[s.attack.kind]||'ATAQUE!'):(s.vulnerable>0?'VULNERÁVEL':'PREPARANDO'),730,72);x.restore();
 if(s.vulnerable>0&&!s.defeated){x.save();x.textAlign='center';x.font='900 18px Arial';x.fillStyle='#ffe269';x.fillText('NÚCLEO VULNERÁVEL — USE O GIRO!',W/2,118);x.restore()}
 if(s.attack&&!s.attack.spawned){x.save();x.textAlign='center';x.font='900 22px Arial';x.fillStyle='#ffef96';x.fillText(names[s.attack.kind]||'ATAQUE!',W/2,128);x.restore()}
 x.save();x.fillStyle='rgba(6,18,24,.88)';x.strokeStyle=accent;x.lineWidth=2;x.beginPath();x.roundRect(18,18,118,82,12);x.fill();x.stroke();x.fillStyle='#fff';x.font='bold 18px Arial';x.fillText('VIDAS × '+lives,30,45);x.fillText('FRUTAS '+fruits,30,70);x.fillStyle='#badbe1';x.font='11px Arial';x.fillText('DESVIE • ESPERE • GIRE',30,90);x.restore();
 if(s.intro>0){const q=1-s.intro/4.2;x.save();x.fillStyle='#000b';x.fillRect(0,0,W,72);x.fillRect(0,H-72,W,72);x.textAlign='center';x.fillStyle='#ffe16b';x.font='900 34px Arial';x.fillText('GUARDIÃO DAS NOVE GEMAS',W/2,170);x.fillStyle='#e7f6ff';x.font='bold 18px Arial';x.fillText(q<.45?'A selva, o cânion e o gelo protegem o templo.':'Três forças. Nove gemas. Uma batalha final.',W/2,208);x.font='13px Arial';x.fillStyle='#bcd7dd';x.fillText('ENTER / A para pular',W/2,388);x.restore()}
 if(s.defeated){x.save();x.fillStyle='rgba(255,226,99,'+Math.min(.38,(3.15-s.defeatT)*.12)+')';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#fff6b0';x.font='900 30px Arial';x.fillText('AS NOVE GEMAS ESTÃO LIVRES!',W/2,150);x.restore()}
 if(toastT>0){x.save();x.textAlign='center';x.fillStyle='#00131dee';x.fillRect(W/2-275,405,550,36);x.fillStyle='#fff';x.font='bold 17px Arial';x.fillText(toast,W/2,429);x.restore()}drawDamageFlash();drawDeathCinematicOverlay();if(paused)drawPauseMenu();
}
function draw(){if(levelMode==='boss'){drawBossLevel();return}if(levelMode==='ride'){drawRideLevel();return}if(levelMode==='avalanche'){drawAvalancheLevel();return}bg();drawPlatformAtmosphere();x.save();let sx=shake>0?(Math.random()-.5)*12:0,sy=shake>0?(Math.random()-.5)*8:0;x.translate(-Math.round(camX)+Math.round(sx),Math.round(sy));
 // Buracos reais da fase: mantêm o poço escuro original para leitura de perigo.
 for(const h of hazards)if(h.type==='pit'){
   x.fillStyle='#020604';x.fillRect(h.x,h.y,h.w,110);x.fillStyle='#101a13';x.fillRect(h.x,h.y,h.w,8);
   for(let yy=h.y+15;yy<h.y+105;yy+=18){x.globalAlpha=.35;x.fillStyle='#27422d';x.fillRect(h.x+8,yy,h.w-16,3)}x.globalAlpha=1;
 }
 drawJungleLayer('background');
 drawJungleLayer('terrain');
 drawJungleLayer('back');
 drawJungleLayer('objects');
 for(const o of scenery){if(!visibleWorldX(o.x,o.w))continue;const im=assetManager.get('p2_'+o.k);drawClippedSprite(im,null,o.x,o.y,o.w,o.h)}for(const o of phaseDeco){if(!visibleWorldX(o.x,o.w))continue;const im=currentLevel===5?assetManager.get('p5_'+o.s):null;if(im)drawClippedSprite(im,null,o.x,o.y,o.w,o.h);else if(biomeTileImg&&biomeTileSR[o.s])drawClippedSprite(biomeTileImg,biomeTileSR[o.s],o.x,o.y,o.w,o.h);}for(const q of platforms){if(!visibleWorldX(q[0],q[2]))continue;drawPlatformTile(q)}for(const q of platforms){if(q[3]>=50||!visibleWorldX(q[0],q[2]))continue;x.save();x.globalAlpha=.72;x.fillStyle=currentLevel===2?'#f1cf7a':currentLevel===4?'#d9f7ff':currentLevel===5?'#ffb14f':'#b9df70';x.fillRect(q[0]+8,q[1]-3,Math.max(8,q[2]-16),3);x.globalAlpha=.24;x.fillStyle='#000';x.fillRect(q[0]+12,q[1]+2,Math.max(8,q[2]-24),5);x.restore()}for(const r of rocks){if(!visibleWorldX(r.x,r.w))continue;const im=assetManager.get('p2_'+r.k);drawClippedSprite(im,null,r.x-14,r.y-28,r.w+28,r.h+28)}for(const h of hazards){if(h.type==='spikes'&&floorSpikeAssetImg){const z=floorSpikeState(h),bottom=groundY+2;drawSpike16(floorSpikeAssetImg,z,h.x,bottom,h.w,68);if(z.warning){x.save();x.globalAlpha=.72;x.fillStyle='#ffd45b';for(let i=0;i<3;i++)x.fillRect(h.x+12+i*Math.max(24,(h.w-24)/3),groundY-8,14,3);x.restore()}}else if(h.s)ds(trapImg,trapSR[h.s],h.x,h.y,h.w,h.h);else if(h.type==='gust'){x.save();x.globalAlpha=.72;x.strokeStyle='#ffd38a';x.lineWidth=4;for(let z=0;z<5;z++){const yy=h.y+28+z*31;x.beginPath();x.moveTo(h.x+18,yy);x.bezierCurveTo(h.x+h.w*.35,yy-18,h.x+h.w*.65,yy+18,h.x+h.w-18,yy-4);x.stroke();x.fillStyle='#fff0b0';x.beginPath();x.moveTo(h.x+h.w-18,yy-4);x.lineTo(h.x+h.w-34,yy-12);x.lineTo(h.x+h.w-29,yy+5);x.closePath();x.fill()}x.globalAlpha=1;x.restore()}else if(h.type==='poison'&&poisonAssetImg)ds(poisonAssetImg,null,h.x,h.y-2,h.w,72);else if(h.type==='poison'){x.fillStyle='#375c16';x.fillRect(h.x,h.y,h.w,24);x.fillStyle='#7ea61d';for(let z=0;z<h.w;z+=24){x.beginPath();x.arc(h.x+10+z,h.y+9+(z%3)*2,5,0,7);x.fill()}x.fillStyle='#18340c';x.fillRect(h.x,h.y+23,h.w,50)}else if(h.type==='iceSpike'&&iceSpikeAssetImg)ds(iceSpikeAssetImg,null,h.x,h.y-2,h.w,h.h+2);else if(h.type==='iceSpike'){x.fillStyle='#dff7ff';for(let z=0;z<h.w;z+=22){x.beginPath();x.moveTo(h.x+z,h.y+h.h);x.lineTo(h.x+z+11,h.y);x.lineTo(h.x+z+22,h.y+h.h);x.closePath();x.fill();x.strokeStyle='#6ac8f0';x.stroke()}}}
 // Espinhos retráteis: dicas visuais antes de ficarem perigosos.
 for(const st of spikeTraps){if(!visibleWorldX(st.x,st.w))continue;const z=spikeTrapState(st);x.save();if(spikeAssetImg){drawSpike16(spikeAssetImg,z,st.x-8,groundY+2,st.w+16,74)}else{x.fillStyle='#314c2b';x.fillRect(st.x,groundY-8,st.w,8);const count=Math.max(3,Math.floor(st.w/22));for(let i=0;i<count;i++){const sx=st.x+i*(st.w/count),sw=st.w/count+1;x.fillStyle='#8e8c7f';x.beginPath();x.moveTo(sx,groundY);x.lineTo(sx+sw/2,groundY-z.h);x.lineTo(sx+sw,groundY);x.closePath();x.fill();}}if(z.warning){x.globalAlpha=.75;x.fillStyle='#ffd45b';for(let i=0;i<3;i++)x.fillRect(st.x+18+i*34,groundY-14,18,3);x.globalAlpha=1}x.restore()}
 // Tronco balançando: pivô, corda e corpo giram juntos, sem sprite-sheet desalinhado.
 for(const sw of swingingLogs){if(!visibleWorldX(sw.x,240,280))continue;const z=swingTrapState(sw);x.save();x.strokeStyle='#7c899d';x.lineWidth=6;x.beginPath();x.moveTo(z.px,z.py);x.lineTo(z.cx,z.cy-36);x.stroke();x.fillStyle='#5f7e38';x.fillRect(z.px-38,z.py-12,76,16);x.translate(z.cx,z.cy);x.rotate(-z.a*.82);if(logAssetImg)ds(logAssetImg,null,-98,-62,196,124);else{x.fillStyle='#6f3d1d';x.fillRect(-30,-48,60,96);x.fillStyle='#9c5a2b';for(let yy=-38;yy<=30;yy+=22)x.fillRect(-24,yy,48,8)}x.restore()}
 // Prensa: ciclo com aviso, queda rápida, pausa no chão e subida lenta.
 for(const ps of stonePresses){if(!visibleWorldX(ps.x,180))continue;const z=pressTrapState(ps);x.save();x.strokeStyle='#4e4b40';x.lineWidth=7;x.beginPath();x.moveTo(ps.x+36,42);x.lineTo(ps.x+36,z.y+20);x.moveTo(ps.x+144,42);x.lineTo(ps.x+144,z.y+20);x.stroke();if(z.warning){x.globalAlpha=.9;x.fillStyle='#ffcf3a';for(let i=0;i<3;i++){x.beginPath();x.moveTo(ps.x+65+i*28,395);x.lineTo(ps.x+76+i*28,410);x.lineTo(ps.x+54+i*28,410);x.closePath();x.fill()}x.globalAlpha=1}if(z.slam||z.active){x.globalAlpha=.32;x.fillStyle='#d7c3a2';for(let i=0;i<6;i++){x.beginPath();x.arc(ps.x+30+i*24,443,5+(i%2)*3,0,7);x.fill()}x.globalAlpha=1}ds(pressAssetImg,null,ps.x-4,z.y-14,188,188);x.restore()}
 for(const b of normal)if(!b.hit&&visibleWorldX(b.x,b.w)){const special=isBounceBox(b),isLife=isLifeBox(b),bob=(b.q||special||isLife)?Math.sin(performance.now()/180+b.x)*2:0;if(special){if(!drawBounceBoxSprite(b,bob+3))ds(playerImg,sr.qbox,b.x,b.y+bob+3,b.w,b.h)}else if(isLife){if(!drawLifeBoxSprite(b,bob+3))ds(playerImg,sr.box,b.x,b.y+bob+3,b.w,b.h)}else ds(playerImg,sr[b.q?'qbox':'box'],b.x,b.y+bob+3,b.w,b.h);if((special||isLife)&&b.bounceFlash>0){x.save();const pulse=1.08+b.bounceFlash*.5;x.globalAlpha=Math.min(1,b.bounceFlash*5);x.strokeStyle=isLife?'#fff18d':'#ffd45d';x.lineWidth=2;x.beginPath();x.arc(b.x+29,b.y+31+bob,15*pulse,0,Math.PI*2);x.stroke();x.restore()}}for(const f of fruitList)if(!f.t&&visibleWorldX(f.x,44))ds(playerImg,sr.fruit,f.x,f.y,44,48);
 for(const m of masks)if(!m.t&&visibleWorldX(m.x,92)){const bob=Math.sin(performance.now()/180+m.x*.01)*4;const fr=akuHoverFrame(m.x*.013);x.save();x.globalAlpha=.35;x.fillStyle='#ffe676';x.beginPath();x.ellipse(m.x+28,m.y+88+bob,20,6,0,0,7);x.fill();x.restore();drawAkuFrame(fr,m.x-22,m.y-28+bob,100,122,false);}
 if(crystalImg&&!levelCrystal.t&&visibleWorldX(levelCrystal.x,70)){const bob=Math.sin(performance.now()/190+currentLevel)*5,turn=.72+.28*Math.abs(Math.sin(performance.now()/380));x.save();x.translate(levelCrystal.x+levelCrystal.w/2,levelCrystal.y+levelCrystal.h/2+bob);x.scale(turn,1);x.shadowColor='#45eaff';x.shadowBlur=18;x.globalAlpha=.98;ds(crystalImg,null,-levelCrystal.w/2,-levelCrystal.h/2,levelCrystal.w,levelCrystal.h);x.restore();x.save();x.globalAlpha=.24;x.fillStyle='#8ff4ff';x.beginPath();x.ellipse(levelCrystal.x+levelCrystal.w/2,levelCrystal.y+levelCrystal.h+bob+5,24,7,0,0,Math.PI*2);x.fill();x.restore()}if(crystalFxT>0){const q=crystalFxT;x.save();x.globalAlpha=q*.65;x.strokeStyle='#91f6ff';x.lineWidth=4;x.beginPath();x.arc(p.x+p.w/2,p.y+p.h/2,28+(1-q)*85,0,Math.PI*2);x.stroke();x.restore()}
 for(const t of tnts){if(!visibleWorldX(t.x,t.w,220))continue;if(t.dead){if(t.blast>0)ds(tntImg,tntSR.blast,t.x-75,t.y-70,215,175);continue}let s=tntSR.idle;if(t.active)s=t.t>2?tntSR.three:t.t>1?tntSR.two:tntSR.one;ds(tntImg,s,t.x,t.y,t.w,t.h)}
 for(const f of boxFx){if(f.piece){x.save();x.translate(f.x,f.y);x.rotate(f.r);x.globalAlpha=Math.max(0,Math.min(1,f.t*2));x.fillStyle='#9a5427';x.fillRect(-f.s,-3,f.s*2,6);x.fillStyle='#d4853d';x.fillRect(-f.s,-3,f.s*1.2,2);x.restore()}else{const a=Math.max(0,f.t/.42),sc=1+(1-a)*.55,sy=f.mode==='stomp'?1-(1-a)*.26:sc,sx=f.mode==='stomp'?1+(1-a)*.22:sc;x.save();x.globalAlpha=a;x.translate(f.x,f.y);x.rotate((1-a)*(f.mode==='spin'?2.3:(f.mode==='slide'?1.0:.18)));x.scale(sx,sy);if(f.kind==='life'&&lifeBoxImg)ds(lifeBoxImg,lifeBoxSR.cracked||lifeBoxSR.idle,-32,-32,64,64);else ds(playerImg,sr[f.q?'qbox':'box'],-29,-29,58,58);if(f.mode==='stomp'){x.globalAlpha=a*.55;x.fillStyle='#fff4b8';x.beginPath();x.ellipse(0,22,18+(1-a)*12,4+(1-a)*2,0,0,Math.PI*2);x.fill()}x.restore()}}for(const d of dustFx){x.globalAlpha=Math.max(0,d.t*2);x.fillStyle='#e8e0cf';x.beginPath();x.arc(d.x,d.y,d.s,0,7);x.fill();x.globalAlpha=1}for(const f of impactFx){const q=Math.max(0,f.t/.28),burst=1-q,r=(burst*40+7)*f.power,baseR=Math.max(3,r*.22);x.save();x.globalAlpha=q*.78;x.strokeStyle='#fff0a6';x.lineWidth=Math.max(1,4*q);x.beginPath();x.ellipse(f.x,f.y,r,baseR,0,0,Math.PI*2);x.stroke();x.globalAlpha=q*.22;x.fillStyle='#fff1be';x.beginPath();x.ellipse(f.x,f.y+1,r*.55,Math.max(2,baseR*.55),0,0,Math.PI*2);x.fill();x.globalAlpha=q*.6;for(let i=0;i<(f.sparks||6);i++){const a=f.seed+i*(Math.PI*2/Math.max(1,f.sparks||6)),len=(14+burst*30+((i%3)*7))*f.power,px=f.x+Math.cos(a)*len*.55,py=f.y+Math.sin(a)*len*.20-len*.04;x.strokeStyle=i%2===0?'#ffd85d':'#fff4c5';x.lineWidth=Math.max(1,3*q-(i%2));x.beginPath();x.moveTo(f.x+Math.cos(a)*6,f.y+Math.sin(a)*2);x.lineTo(px,py);x.stroke()}if(q>.42){x.globalAlpha=(q-.42)*.55;x.fillStyle='#ffffff';x.beginPath();x.arc(f.x,f.y-r*.02,3+burst*5,0,Math.PI*2);x.fill()}x.restore()}for(const f of akuFx){const q=Math.max(0,f.t/.7);x.save();x.globalAlpha=q;drawAkuFrame(q>.45?akuSR.spin:akuSR.power,f.x-48,f.y-58-(1-q)*24,96,118,false,q);x.restore()}for(const f of lifePickupFx){const alpha=f.done?Math.max(0,1-f.fade/.18):1;drawLifeIconScreen(f.x,f.y,30,alpha,.8);x.save();x.globalAlpha=.28*alpha;x.fillStyle='#fff2a4';x.beginPath();x.ellipse(f.x,f.y+13,12,4,0,0,Math.PI*2);x.fill();x.restore()}for(const e of enemies)if(!e.dead&&visibleWorldX(e.x,e.w||90,220))drawEnemyShadow(e);for(const f of enemyFx)if(visibleWorldX(f.x,f.w||90,240))drawEnemyDefeatFx(f);for(const e of enemies)if(!e.dead&&visibleWorldX(e.x,e.w||90,220))drawEnemy(e);
 {const cpX=checkpointBox.x,cpY=checkpointBox.y,cpSize=checkpointBox.w,cpCell=320;
   if(!checkpointActivated){
     ds(checkpointImg,[0,0,cpCell,cpCell],cpX,cpY,cpSize,cpSize);
     const pulse=.18+.12*Math.sin(swingClock*4.8);
     x.save();x.globalAlpha=pulse;x.fillStyle='#ffd84d';x.beginPath();x.ellipse(cpX+cpSize/2,cpY+cpSize*.52,18,20,0,0,Math.PI*2);x.fill();x.restore();
   }else{
     let cpGlow=.42+.28*Math.sin(swingClock*7);x.save();x.globalAlpha=cpGlow;x.fillStyle='#ffd84d';x.beginPath();x.ellipse(cpX+cpSize/2,cpY+cpSize-2,25,7,0,0,Math.PI*2);x.fill();x.restore();
     let fr=5,drawSize=cpSize,offX=0,offY=0;
     if(checkpointAnim>1.28){fr=1;drawSize=66;offX=-4;offY=-4}
     else if(checkpointAnim>1.00){fr=2;drawSize=60;offX=-1;offY=-1}
     else if(checkpointAnim>.72){fr=3;drawSize=60;offX=-1;offY=-1}
     else if(checkpointAnim>.38){fr=4;drawSize=76;offX=-9;offY=-9}
     else {fr=5;drawSize=64;offX=-3;offY=-6}
     if(checkpointAnim<=0){const bob=Math.sin(swingClock*5)*1.5;drawSize=64;offX=-3;offY=-6+bob}
     ds(checkpointImg,[fr*cpCell,0,cpCell,cpCell],cpX+offX,cpY+offY,drawSize,drawSize);
   }
 };
 drawEndRuin();
 const pf=Math.floor(swingClock*9)%8;ds(portalImg,[pf*360,0,360,450],portal.x,portal.y,portal.w,portal.h);x.save();x.globalAlpha=.22+.12*Math.sin(swingClock*5);x.strokeStyle='#57d9ff';x.lineWidth=8;x.beginPath();x.ellipse(portal.x+portal.w/2,portal.y+portal.h/2,58,78,0,0,Math.PI*2);x.stroke();x.restore();
 if(portalSeq>0){x.save();const glow=Math.min(1,portalSeq/1.1);x.globalAlpha=.18+.55*glow;x.fillStyle='#8eefff';x.beginPath();x.arc(portal.x+portal.w/2,portal.y+portal.h/2,80+glow*65,0,Math.PI*2);x.fill();x.restore();}
 if(currentLevel===6&&snowballImg&&(deathAnim<=0||deathKind!=='snowball')){const sf=Math.floor(swingClock*9)%6,size=238;x.save();x.shadowColor='#bdefff';x.shadowBlur=18;ds(snowballImg,[sf*256,0,256,256],snowballX,groundY-size+13,size,size);x.restore();x.save();x.globalAlpha=.45;x.fillStyle='#e8fbff';for(let i=0;i<10;i++){const dx=snowballX-12-(i*31+swingClock*120)%190,dy=groundY-18-(i%4)*12;x.fillRect(dx,dy,8+i%3*3,5+i%2*3)}x.restore()}
 if(deathAnim>0){const elapsed=DEATH_DURATION-deathAnim;drawPlatformDeath(elapsed,deathX+31,deathY+78,deathFacing<0)}
 for(const tr of akuTrail){const a=Math.max(0,tr.t/.28)*.30;const tw=82,th=112,tx=tr.x-(tw-p.w)/2,ty=tr.y+tr.h-th;x.save();x.globalAlpha=a;x.shadowColor='#ffe45c';x.shadowBlur=14;ds(playerImg,sr[tr.key]||sr.idle,tx,ty,tw,th,tr.facing<0,a);x.restore()}
 if(deathAnim<=0&&p.y<groundY+30){const air=Math.max(0,groundY-(p.y+p.h)),shrink=Math.max(.35,1-air/240);drawMode7ShadowEllipse(p.x+p.w/2,groundY+2,27*shrink,7*shrink,.18,currentLevel===4?'#163747':'#12120c')}
 let key='idle';if(p.spin>0)key=['spin1','spin2'][Math.floor(p.anim)%2];else if(!p.on){if(p.vy<-300)key='jump1';else if(p.vy<-80)key='jump2';else if(p.vy<120)key='jump3';else if(p.vy<350)key='jump4';else key='fall'}else if(Math.abs(p.vx)>35)key=['run1','run2','run3','run4'][Math.floor(p.anim)%4];
 let pw=82,ph=112;if(p.land>0){pw=88;ph=104}else if(p.takeoff>0){pw=78;ph=118}if(p.stompSquash>0){const sq=p.stompSquash/.17;pw*=1+.10*sq;ph*=1-.12*sq}const pdx=p.x-(pw-p.w)/2,pdy=p.y+p.h-ph;if(p.spin>0){x.globalAlpha=.14;for(let i=1;i<=3;i++)ds(playerImg,sr[key],pdx-p.vx*.014*i,pdy,82,112,p.facing<0,.14);x.save();x.globalAlpha=.22;x.strokeStyle='#ffd65a';x.lineWidth=3;x.beginPath();x.ellipse(p.x+p.w/2,p.y+p.h/2,42,28,0,0,Math.PI*2);x.stroke();x.restore()}
 if(deathAnim<=0){let pa=inv>0&&Math.floor(inv*14)%2?0.35:1,pscale=portalSeq>0?Math.max(.05,1-portalSeq/2.05):1;x.save();x.translate(p.x+p.w/2,p.y+p.h/2);x.scale(pscale,pscale);
   if(akuEquipT>0&&aku3PlayerImg){const prog=1-Math.max(0,akuEquipT)/1.05,fr=aku3SR.equip[Math.min(aku3SR.equip.length-1,Math.floor(prog*aku3SR.equip.length))];drawAku3Frame(fr,0,p.h/2+3+VISUAL_OFFSETS.player,164,154,p.facing<0,pa*Math.min(1,pscale*1.4));}
   else if(p.slide>0){const sf=Math.min(8,Math.floor((.58-p.slide)*17));drawAnchoredFrame(crouchImg,crouchSR.slide[sf],0,p.h/2+3+VISUAL_OFFSETS.player,128,96,p.facing<0,pa)}
   else if(p.crouch){const cf=Math.floor(p.anim*1.15)%8;drawAnchoredFrame(crouchImg,crouchSR.crouch[cf],0,p.h/2+3+VISUAL_OFFSETS.player,114,88,p.facing<0,pa)}
   else ds(playerImg,sr[key],-pw/2,p.h/2-ph+7+VISUAL_OFFSETS.player,pw,ph,p.facing<0,pa*Math.min(1,pscale*1.4));if(akuInvT>0){const spin=performance.now()/170;x.save();x.rotate(spin);x.globalAlpha=.42;x.strokeStyle='#ffe45c';x.lineWidth=5;for(let i=0;i<3;i++){x.beginPath();x.arc(0,-4,48+i*8,i*2.1,i*2.1+1.45);x.stroke()}x.restore();x.save();x.globalAlpha=.18+.08*Math.sin(performance.now()/80);x.fillStyle='#fff2a0';x.beginPath();x.ellipse(0,2,49,59,0,0,Math.PI*2);x.fill();x.restore()}x.restore()}x.globalAlpha=1;
 if(aku>0||akuProtectT>0||akuInvT>0){const bob=Math.sin(performance.now()/160)*5;const sideX=p.facing>0?-82:66;const followX=p.x+sideX;const followY=p.y-46+bob+Math.sin(performance.now()/320)*2;const hover=aku>=2?((Math.floor(performance.now()/220)%3===0)?akuSR.power:akuHoverFrame(.4)):akuHoverFrame(.4);if(aku>0){if(aku===2){x.strokeStyle='#ffe45c';x.lineWidth=4;x.globalAlpha=.65;x.beginPath();x.arc(p.x+31,p.y+42,58,0,7);x.stroke();x.globalAlpha=1;drawAkuFrame(akuSR.power,followX-6,followY-6,76,94,p.facing<0,.4)}drawAkuFrame(hover,followX,followY,68,84,p.facing<0,1)}if(akuProtectT>0){const q=akuProtectT/.65;drawAkuFrame(q>.33?akuSR.protect:akuSR.spin,p.x-10,p.y-56-(1-q)*8,90,112,p.facing<0,Math.min(1,q*1.3));x.save();x.globalAlpha=q*.5;x.strokeStyle='#fff3a6';x.lineWidth=5;x.beginPath();x.arc(p.x+31,p.y+42,52+(1-q)*16,0,7);x.stroke();x.restore()}}
 drawJungleLayer('front');
 // Foreground: elementos passam visualmente na frente do Crash.
 for(const f of foreground)drawClippedSprite(trapImg,trapSR[f.s],f.x,f.y,f.w,f.h);
 x.restore();drawWorldVignette();
 // HUD compacto com ícones, separado do cenário e sem cobrir tanta tela.
 const totalBoxes=normal.length+tnts.length;const tm=fmtTime(levelTime);
 x.save();x.fillStyle='#06141de8';x.strokeStyle='#70c8b955';x.lineWidth=2;x.beginPath();x.roundRect(12,12,720,62,12);x.fill();x.stroke();
 const hudItem=(hx,icon,txt,sub,kind)=>{x.fillStyle='#ffffff';x.font='bold 20px Arial';if(kind==='life'){const pulse=1+hudLifePulseT*.18;x.save();x.translate(hx+22,41);x.scale(pulse,pulse);ds(playerImg,sr.idle,-17,-21,34,42);if(hudLifePulseT>0){x.globalAlpha=Math.min(1,hudLifePulseT*2);x.strokeStyle='#fff4a8';x.lineWidth=2;x.beginPath();x.arc(0,1,20+hudLifePulseT*10,0,Math.PI*2);x.stroke()}x.restore()}else if(kind==='fruit')ds(playerImg,sr.fruit,hx,21,36,40);else if(kind==='box')ds(playerImg,sr.box,hx,22,38,38);else if(kind==='aku'){const fr=aku>=2?akuSR.power:akuHoverFrame(.25);drawAkuFrame(fr,hx-2,14,42,48,false,.98);}else if(kind==='time'){x.font='28px Arial';x.fillText('⏱',hx+1,50)}else if(kind==='crystal'&&crystalImg)ds(crystalImg,null,hx+8,17,20,40);x.font='bold 19px Arial';x.fillStyle=kind==='life'&&hudLifePulseT>0?'#fff5bf':'#fff';x.fillText(txt,hx+48,39);x.font='bold 10px Arial';x.fillStyle=kind==='life'&&hudLifePulseT>0?'#fff0a6':'#9ed8c7';x.fillText(sub,hx+48,57)};
 hudItem(24,0,'× '+lives,'VIDAS','life');hudItem(132,0,String(fruits),'FRUTAS','fruit');hudItem(238,0,boxesBroken+'/'+totalBoxes,'CAIXAS','box');hudItem(376,0,tm,'TEMPO','time');hudItem(500,0,aku>=3?Math.ceil(akuInvT)+'s':String(aku),aku>=3?'INVENC.':'AKU','aku');hudItem(610,0,crystalsCollected[currentLevel-1]?'✓':'—','CRISTAL','crystal');x.fillStyle='#ffd45d';x.font='bold 14px Arial';x.fillText('FASE '+campaignNumber()+' • '+currentLevelName,22,86);x.restore();if((currentLevel===6||currentLevel===8)&&deathAnim<=0){const gap=Math.max(0,p.x-(snowballX+185)),danger=Math.max(0,1-gap/620);x.save();x.fillStyle='#071923dc';x.fillRect(750,14,194,50);x.fillStyle=danger>.68?'#ff684f':'#85def2';x.font='900 12px Arial';x.fillText(currentLevel===8?'PEDRA':'AVALANCHE',766,34);x.fillStyle='#173746';x.fillRect(766,43,160,10);x.fillStyle=danger>.68?'#ff684f':'#8deaff';x.fillRect(766,43,160*danger,10);x.restore()}
 if(toastT>0){x.font='bold 20px Arial';let tw=x.measureText(toast).width+30;x.fillStyle='#00131dee';x.fillRect(W/2-tw/2,98,tw,38);x.fillStyle='#fff';x.fillText(toast,W/2-tw/2+15,124)}drawCinematicOverlay();drawDamageFlash();drawDeathCinematicOverlay();if(paused)drawPauseMenu();
}
function panel(px,py,pw,ph,alpha=.9){x.save();x.fillStyle=`rgba(3,18,16,${alpha})`;x.strokeStyle='#a6cf4a';x.lineWidth=2;x.beginPath();x.roundRect(px,py,pw,ph,14);x.fill();x.stroke();x.restore()}
function button(px,py,pw,ph,label,selected=false,sub=''){x.save();x.fillStyle=selected?'#d67b18':'#183927';x.strokeStyle=selected?'#ffd35a':'#527a3a';x.lineWidth=3;x.beginPath();x.roundRect(px,py,pw,ph,10);x.fill();x.stroke();x.textAlign='center';x.textBaseline='middle';x.font='bold 22px Arial';x.fillStyle=selected?'#fff7c2':'#f5f4dc';x.fillText(label,px+pw/2,py+ph/2-(sub?7:0));if(sub){x.font='12px Arial';x.fillStyle='#bdd6a3';x.fillText(sub,px+pw/2,py+ph/2+15)}x.restore();uiButtons.push({x:px,y:py,w:pw,h:ph,label})}
function slotCard(i,py,selected=false,mode='load'){const sl=readSlot(i),records=normalizeLevelRecords(sl.levelRecords,sl.crystals),gems=records.filter(r=>r.gem).length,done=records.filter(r=>r.completed).length;const px=215,pw=530,ph=92;panel(px,py,pw,ph,.94);x.textAlign='left';x.fillStyle=selected?'#ffd45d':'#e7f4e5';x.font='bold 24px Arial';x.fillText('SLOT '+i,px+20,py+31);if(sl.empty){x.font='16px Arial';x.fillStyle='#8fa99b';x.fillText('VAZIO — nenhuma aventura salva',px+20,py+62)}else{x.font='bold 15px Arial';x.fillStyle='#fff';x.fillText('Fase '+campaignNumber(sl.currentLevel||1)+' • '+(sl.phaseName||'ILHA SELVAGEM')+' • '+(sl.completed?'CAMPANHA COMPLETA':'EM PROGRESSO'),px+145,py+28);x.font='14px Arial';x.fillStyle='#bdd6a3';x.fillText('Fases '+done+'/9  •  Frutas '+(sl.fruits||0)+'  •  Cristais '+(sl.crystals||[]).filter(Boolean).length+'/9',px+145,py+55);x.fillStyle=gems?'#76e9ff':'#92a49b';x.fillText((gems?'💎 ':'◇ ')+'Gemas '+gems+'/9',px+145,py+78)}if(selected){x.strokeStyle='#ffd45d';x.lineWidth=3;x.strokeRect(px-4,py-4,pw+8,ph+8)}uiButtons.push({x:px,y:py,w:pw,h:ph,label:'SLOT_'+i,slot:i,mode})}
function woodButton(px,py,pw,ph,label,selected=false,sub=''){x.save();const g=x.createLinearGradient(px,py,px,py+ph);g.addColorStop(0,selected?'#b85a18':'#6a3518');g.addColorStop(.55,selected?'#7c3510':'#4a2614');g.addColorStop(1,selected?'#4b230d':'#2e190e');x.fillStyle=g;x.strokeStyle=selected?'#ffc54a':'#9d5c29';x.lineWidth=3;x.beginPath();x.roundRect(px,py,pw,ph,8);x.fill();x.stroke();x.strokeStyle='#2a1409';x.lineWidth=1;for(let yy=py+9;yy<py+ph;yy+=12){x.beginPath();x.moveTo(px+10,yy);x.lineTo(px+pw-10,yy+Math.sin(yy)*2);x.stroke()}x.textAlign='center';x.textBaseline='middle';x.font='900 21px Arial';x.fillStyle=selected?'#fff0a8':'#f4ead4';x.shadowColor='#000';x.shadowBlur=3;x.fillText(label,px+pw/2,py+ph/2-(sub?6:0));x.shadowBlur=0;if(sub){x.font='11px Arial';x.fillStyle='#d7ba86';x.fillText(sub,px+pw/2,py+ph/2+14)}x.restore();uiButtons.push({x:px,y:py,w:pw,h:ph,label})}
function miniSaveCard(i,py){const sl=readSlot(i),records=normalizeLevelRecords(sl.levelRecords,sl.crystals),gems=records.filter(r=>r.gem).length,done=records.filter(r=>r.completed).length;x.save();x.fillStyle='rgba(9,20,15,.88)';x.strokeStyle=i===activeSlot?'#f2a733':'#6e6f48';x.lineWidth=2;x.beginPath();x.roundRect(18,py,220,82,9);x.fill();x.stroke();x.fillStyle=i===activeSlot?'#ffbd3d':'#5fa7ff';x.font='900 28px Arial';x.fillText(String(i),30,py+34);x.fillStyle='#f4d184';x.font='bold 14px Arial';x.fillText(sl.empty?'SLOT VAZIO':(sl.phaseName||'ILHA SELVAGEM'),70,py+22);x.font='12px Arial';x.fillStyle='#d6e5d6';if(sl.empty)x.fillText('Sem progresso salvo',70,py+48);else{x.fillText('FASES '+done+'/9   🔷 '+(sl.crystals||[]).filter(Boolean).length+'/9',70,py+45);x.fillText('💎 '+gems+'/9   🍎 '+(sl.fruits||0),70,py+65)}x.restore()}
function miniTrophies(){let all={};for(let i=1;i<=3;i++)Object.assign(all,readSlot(i).trophies||{});const defs=trophyDefs();x.save();x.fillStyle='rgba(9,20,15,.88)';x.strokeStyle='#6e6f48';x.lineWidth=2;x.beginPath();x.roundRect(735,148,207,285,9);x.fill();x.stroke();x.textAlign='center';x.fillStyle='#ffb33f';x.font='900 19px Arial';x.fillText('TROFÉUS',838,176);x.textAlign='left';defs.slice(0,5).forEach((t,i)=>{const got=!!all[t[0]], yy=212+i*42;x.fillStyle=got?'#ffe176':'#7b817c';x.font='bold 13px Arial';x.fillText((got?'🏆 ':'🔒 ')+t[1],753,yy);x.font='10px Arial';x.fillStyle=got?'#c9dbc9':'#737a75';x.fillText(t[2].slice(0,27),753,yy+15)});x.textAlign='center';x.fillStyle='#9db39d';x.font='11px Arial';x.fillText(Object.keys(all).length+'/'+defs.length+' conquistados',838,418);x.restore()}
function drawMainMenu(){if(menuLogoImg&&menuLogoImg.complete&&menuLogoImg.naturalWidth){x.save();x.globalAlpha=.98;x.drawImage(menuLogoImg,325,6,310,142);x.restore()}else{x.textAlign='center';x.fillStyle='#ffd24a';x.font='900 48px Arial';x.fillText('CRASH BANDICOOT',W/2,70);x.font='900 28px Arial';x.fillStyle='#f3e7c8';x.fillText('FÃ GAME',W/2,105)}
 x.save();const hero=x.createLinearGradient(266,148,266,470);hero.addColorStop(0,'rgba(9,22,16,.78)');hero.addColorStop(1,'rgba(4,12,9,.92)');x.fillStyle=hero;x.strokeStyle='#6e6f48';x.lineWidth=2;x.beginPath();x.roundRect(252,150,460,338,14);x.fill();x.stroke();x.fillStyle='#ffcf58';x.font='900 18px Arial';x.fillText('AVENTURA COMPLETA • 10 FASES • MODE 7 • CHEFE FINAL',280,180);x.fillStyle='#d2ead7';x.font='14px Arial';x.fillText('Plataforma, perseguições, montarias, troféus, save e fases especiais.',280,204);x.fillText('Escolha uma opção ao lado para começar ou continuar sua jornada.',280,224);x.fillStyle='rgba(255,255,255,.07)';x.fillRect(274,238,416,2);x.restore();
 miniSaveCard(1,155);miniSaveCard(2,245);miniSaveCard(3,335);miniTrophies();
 const opts=[['NEW GAME','Escolher slot'],['LOAD GAME','Continuar save'],['COMO JOGAR','Movimentos'],['CONFIGURAÇÕES','Áudio / controles'],['TROFÉUS','Conquistas'],['CRÉDITOS','Projeto']];opts.forEach((o,i)=>woodButton(302,165+i*52,360,42,o[0],menuIndex===i,o[1]));
 x.textAlign='center';x.font='bold 12px Arial';x.fillStyle='#d7e5d4';x.fillText((connectedPad()?'D-PAD / ANALÓGICO':'↑ ↓')+' selecionar  •  '+confirmHint()+' confirmar  •  mouse também funciona',W/2,508);x.textAlign='left';x.fillStyle='#ff9d32';x.font='900 16px Arial';x.fillText('V'+GAME_VERSION,18,522)}
function drawSlots(mode){x.fillStyle='#ffd45d';x.font='bold 32px Arial';x.textAlign='center';x.fillText(mode==='new'?'NEW GAME — ESCOLHA UM SLOT':'LOAD GAME — ESCOLHA UM SLOT',W/2,125);for(let i=1;i<=3;i++)slotCard(i,155+(i-1)*105,slotIndex===i-1,mode);x.font='14px Arial';x.fillStyle='#cce6d1';x.fillText((mode==='new'?confirmHint()+' cria/reinicia o slot':confirmHint()+' carrega o slot')+' • '+deleteHint()+' apaga • '+backHint()+' volta',W/2,490);button(375,505,210,38,'VOLTAR',false)}
function drawHow(){panel(110,125,740,365,.95);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 32px Arial';x.fillText('COMO JOGAR',W/2,166);x.textAlign='left';x.font='bold 17px Arial';x.fillStyle='#fff';const lines=['Objetivo: atravesse cada fase e alcance o portal.','Quebre todas as caixas (incluindo TNT) para ganhar a gema.','Pule sobre inimigos ou use o giro/escorregão para derrotá-los.','TNT: pule em cima para iniciar 3-2-1. Girar nela = explosão imediata.','Perseguições: fuja da pedra ou avalanche em direção à câmera.','Montarias: javali e urso usam três faixas, desvio e salto.','Nas fases especiais, frutas e esquivas próximas criam combos.','Chefe final: desvie e gire quando o núcleo ficar vulnerável.'];lines.forEach((t,i)=>x.fillText('• '+t,155,202+i*31));x.fillStyle='#a9cdb5';x.font='15px Arial';x.fillText('Controles ('+inputBrand()+'): Setas ou WASD • W/ESPAÇO pular • S agachar • '+actionHint('spin')+' girar',155,462);button(375,500,210,38,'VOLTAR',false);x.textAlign='left'}
function drawSettings(){panel(180,118,600,382,.96);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 32px Arial';x.fillText('CONFIGURAÇÕES',W/2,157);const opts=[['MÚSICA '+audioPct('music')+'%','← → ou ENTER para alterar'],['EFEITOS '+audioPct('sfx')+'%','← → ou ENTER para alterar'],['GRÁFICOS '+graphicsLabel(),'AUTO adapta ao dispositivo'],['CONTROLES','Teclado / gamepad'],['VOLTAR','Menu principal']];opts.forEach((o,i)=>button(300,178+i*58,360,44,o[0],settingsIndex===i,o[1]));x.font='13px Arial';x.fillStyle='#b9d4c0';x.fillText('Áudio e qualidade ficam salvos • ESC volta',W/2,486);x.textAlign='left'}
function chooseSettings(dir=0){playSfx('menu',1,.65,.04);if(settingsIndex===0)cycleAudio('music',dir||1);else if(settingsIndex===1)cycleAudio('sfx',dir||1);else if(settingsIndex===2)cycleGraphics(dir||1);else if(settingsIndex===3){configReturn='settings';menuSub='config';configTab=0;configIndex=0}else menuBack()}
function drawControls(){panel(115,118,730,385,.96);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 30px Arial';x.fillText('CONFIGURAR CONTROLES',W/2,155);button(260,172,205,38,'TECLADO',configTab===0);button(495,172,205,38,'GAMEPAD',configTab===1);const acts=[['left','ESQUERDA'],['right','DIREITA'],['down','AGACHAR/SLIDE'],['jump','PULAR'],['spin','GIRAR'],['pause','PAUSAR']];x.textAlign='left';acts.forEach((a,i)=>{let yy=232+i*39;x.fillStyle=configIndex===i?'#ffd65a':'#e7f1e8';x.font='bold 17px Arial';x.fillText(a[1],245,yy);x.textAlign='right';let val=configTab===0?keyName(keybinds[a[0]]):(a[0]==='jump'?padButtonName(padbinds.jump):a[0]==='spin'?padButtonName(padbinds.spin):a[0]==='pause'?padButtonName(padbinds.pause):'D-PAD / ANALÓGICO');x.fillStyle='#bfe6d0';x.fillText(val,700,yy);x.textAlign='left'});x.textAlign='center';x.font='14px Arial';x.fillStyle=captureAction?'#ffcf55':'#aac9b0';x.fillText(captureAction?(captureType==='keyboard'?'Pressione a nova tecla...':'Pressione um botão do '+inputBrand()+'...'):(connectedPad()?'D-PAD seleciona • '+confirmHint()+' redefine • '+backHint()+' volta • '+deleteHint()+' restaura':'↑ ↓ seleciona • ← → troca aba • ENTER redefine ação • R restaura padrão'),W/2,478);button(375,500,210,38,'VOLTAR',false)}
function drawTrophies(){panel(105,105,750,398,.96);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 31px Arial';x.fillText('TROFÉUS',W/2,140);let all={};for(let i=1;i<=3;i++){const t=readSlot(i).trophies||{};Object.assign(all,t)}const defs=trophyDefs(),perPage=7,pages=Math.ceil(defs.length/perPage);trophyScroll=Math.max(0,Math.min(pages-1,trophyScroll));defs.slice(trophyScroll*perPage,trophyScroll*perPage+perPage).forEach((t,i)=>{let yy=184+i*40,got=!!all[t[0]];x.textAlign='left';x.font='bold 16px Arial';x.fillStyle=got?'#ffe475':'#72807a';x.fillText(got?'🏆 '+t[1]:'🔒 '+t[1],150,yy);x.font='13px Arial';x.fillStyle=got?'#bdd8c2':'#66736d';x.fillText(t[2],475,yy)});x.textAlign='center';x.fillStyle='#9dc4a8';x.font='14px Arial';x.fillText(Object.keys(all).length+'/'+defs.length+' conquistados  •  página '+(trophyScroll+1)+'/'+pages,W/2,475);if(trophyScroll>0)button(125,500,190,34,'ANTERIOR',false,'←');button(375,500,210,34,'VOLTAR',false);if(trophyScroll<pages-1)button(645,500,190,34,'PRÓXIMA',false,'→')}
function drawCredits(){panel(190,128,580,350,.95);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 34px Arial';x.fillText('ILHA SELVAGEM',W/2,181);x.fillStyle='#fff';x.font='18px Arial';x.fillText('Fangame de plataforma • versão '+GAME_VERSION,W/2,217);x.fillStyle='#9ee8bd';x.font='bold 16px Arial';x.fillText('CRIADO E DESENVOLVIDO POR',W/2,263);x.fillStyle='#ffe06b';x.font='900 26px Arial';x.fillText('LUIS PAULO ALVES',W/2,297);x.fillStyle='#bcd8c3';x.font='14px Arial';x.fillText('10 fases • chefe final • saves • controles • troféus',W/2,339);x.fillText('plataforma, perseguição e corrida pseudo-3D • assets sob demanda',W/2,365);button(375,412,210,42,'VOLTAR',false)}
function menu(){bg();uiButtons=[];x.save();x.fillStyle='rgba(0,9,6,.46)';x.fillRect(0,0,W,H);const vg=x.createLinearGradient(0,0,0,H);vg.addColorStop(0,'rgba(0,0,0,.08)');vg.addColorStop(.72,'rgba(0,0,0,.15)');vg.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=vg;x.fillRect(0,0,W,H);x.restore();if(menuSub==='main')drawMainMenu();else{ x.save();x.fillStyle='rgba(0,8,5,.68)';x.fillRect(0,0,W,H);x.restore();x.textAlign='center';x.fillStyle='#ffd24a';x.font='900 34px Arial';x.fillText('CRASH BANDICOOT — FÃ GAME',W/2,50);if(menuSub==='new'||menuSub==='load')drawSlots(menuSub);else if(menuSub==='how')drawHow();else if(menuSub==='settings')drawSettings();else if(menuSub==='config')drawControls();else if(menuSub==='trophies')drawTrophies();else drawCredits()}if(saveNotice){x.textAlign='center';x.font='bold 13px Arial';x.fillStyle='#ffe17a';x.fillText(saveNotice,W/2,535)}x.textAlign='left'}
function drawPauseMenu(){uiButtons=[];x.fillStyle='rgba(0,17,12,.86)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffd15b';x.font='bold 40px Arial';x.fillText('PAUSADO',W/2,56);x.fillStyle='#d8f1df';x.font='14px Arial';x.fillText(currentLevelName+' • SLOT '+(activeSlot||'—'),W/2,79);panel(258,88,444,446,.96);x.save();x.fillStyle='rgba(255,255,255,.05)';x.fillRect(278,122,404,2);x.restore();const opts=[['CONTINUAR','Voltar ao jogo'],['SALVAR JOGO','Salvar no Slot '+(activeSlot||'—')],['MÚSICA '+audioPct('music')+'%','ENTER/←→ altera'],['EFEITOS '+audioPct('sfx')+'%','ENTER/←→ altera'],['GRÁFICOS '+graphicsLabel(),'ENTER/←→ altera'],['CONTROLES','Ver configuração atual'],['REINICIAR FASE','Recomeçar a fase'],['MENU PRINCIPAL','Salvar e sair']];opts.forEach((o,i)=>button(300,135+i*44,360,36,o[0],pauseIndex===i,o[1]));x.font='12px Arial';x.fillStyle='#b9d4c0';x.fillText((connectedPad()?'D-PAD':'↑ ↓')+' escolher • ← → ajustar • '+confirmHint()+' confirmar • ESC fechar',W/2,516);x.textAlign='left'}
function end(title,sub){uiButtons=[];bg();x.fillStyle='#00140fd9';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle=title.includes('CONCLUÍDA')?'#ffe66d':'#ff7a68';x.font='bold 52px Arial';x.fillText(title,W/2,150);x.fillStyle='#fff';x.font='24px Arial';x.fillText(sub,W/2,200);panel(260,235,440,150,.92);x.font='20px Arial';x.fillText(`Pontos: ${score}   Frutas: ${fruits}`,W/2,285);x.fillText(`Caixas: ${boxesBroken}/${normal.length+tnts.length}`,W/2,320);button(375,405,210,52,'VOLTAR AO MENU',true);x.textAlign='left'}
function campaignEnd(){uiButtons=[];bg();x.fillStyle='#00140fe8';x.fillRect(0,0,W,H);const sl=activeSlot?readSlot(activeSlot):blankSlot(),records=normalizeLevelRecords(sl.levelRecords,sl.crystals),done=records.filter(r=>r.completed).length,gems=records.filter(r=>r.gem).length,crystals=records.filter(r=>r.crystal).length,percent=Math.round((done+gems+crystals)/27*100),rankAvg=records.reduce((s,r)=>s+(RANK_ORDER[r.bestRank||'D']||0),0)/Math.max(1,records.length),overall=rankAvg>=3.55?'S':rankAvg>=2.7?'A':rankAvg>=1.8?'B':rankAvg>=.9?'C':'D';x.textAlign='center';x.fillStyle='#ffe66d';x.font='900 42px Arial';x.fillText('AVENTURA COMPLETA!',W/2,60);x.fillStyle='#dfffe9';x.font='bold 18px Arial';x.fillText('O Guardião das Nove Gemas foi derrotado.',W/2,90);panel(198,110,564,310,.96);x.fillStyle='#fff3bf';x.font='900 22px Arial';x.fillText('PROGRESSO TOTAL  '+percent+'%',W/2,146);x.textAlign='left';x.font='bold 18px Arial';x.fillStyle='#baffc8';x.fillText('✓ FASES',250,190);x.fillStyle='#fff';x.fillText(done+'/9',430,190);x.fillStyle='#8ff0ff';x.fillText('💎 GEMAS',250,230);x.fillStyle='#fff';x.fillText(gems+'/9',430,230);x.fillStyle='#8ff0ff';x.fillText('◆ CRISTAIS',250,270);x.fillStyle='#fff';x.fillText(crystals+'/9',430,270);x.textAlign='center';x.fillStyle='#bad6db';x.font='bold 12px Arial';x.fillText('RANK MÉDIO DA CAMPANHA',626,185);x.fillStyle=rankColor(overall);x.font='900 82px Arial';x.fillText(overall,626,265);x.fillStyle='#ffd766';x.font='bold 14px Arial';x.fillText(percent===100?'100% CONCLUÍDO — ILHA DOMINADA!':'Ainda há gemas ou cristais para conquistar.',W/2,318);x.fillStyle='#9ee8bd';x.font='bold 12px Arial';x.fillText('CRIADO E DESENVOLVIDO POR',W/2,350);x.fillStyle='#ffe06b';x.font='900 19px Arial';x.fillText('LUIS PAULO ALVES',W/2,378);button(375,445,210,50,'VOLTAR AO MENU',true,confirmHint());x.textAlign='left'}
function fmtTime(v){let m=Math.floor(v/60),ss=Math.floor(v%60);return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')}
function results(){uiButtons=[];bg();x.fillStyle='#00110ed9';x.fillRect(0,0,W,H);const rank=performanceRank(currentLevel),special=levelMode==='ride'||levelMode==='avalanche',specialState=levelMode==='ride'?rideState:avalancheState,hits=special?(specialState?.hits||0):0,total=normal.length+tnts.length;x.textAlign='center';x.fillStyle='#ffc83d';x.font='bold 42px Arial';x.fillText('FASE '+campaignNumber()+' COMPLETA!',W/2,54);x.fillStyle=(currentLevel===4||currentLevel===6||currentLevel===7)?'#a9e9ff':currentLevel===3?'#b4db58':'#7ee35a';x.font='bold 21px Arial';x.fillText(currentLevelName,W/2,82);panel(126,98,708,342,.96);x.textAlign='left';x.fillStyle='#eaf8ef';x.font='bold 18px Arial';const rows=special?[["COLISÕES",String(hits)],["ESQUIVAS",String(specialState?.nearMisses||0)],["MELHOR COMBO",'×'+(specialState?.bestCombo||0)],["TEMPO",fmtTime(levelTime)],["GEMA",resultGem?'OBTIDA':'PENDENTE'],["CRISTAL",crystalsCollected[currentLevel-1]?'OBTIDO':'PENDENTE']]:[["CAIXAS",boxesBroken+'/'+total],["FRUTAS",String(fruits)],["MORTES",String(deaths)],["TEMPO",fmtTime(levelTime)],["GEMA",resultGem?'OBTIDA':'PENDENTE'],["CRISTAL",crystalsCollected[currentLevel-1]?'OBTIDO':'PENDENTE']];rows.forEach((r,i)=>{const yy=136+i*43;x.fillStyle='#d8eee0';x.fillText(r[0],176,yy);x.textAlign='right';x.fillStyle=i>=4?(String(r[1])==='OBTIDA'||String(r[1])==='OBTIDO'?'#7fe9ff':'#ffb36a'):'#fff3bf';x.fillText(String(r[1]),575,yy);x.textAlign='left'});x.save();x.translate(706,218);x.fillStyle='rgba(4,18,24,.78)';x.strokeStyle=rankColor(rank);x.lineWidth=4;x.beginPath();x.arc(0,0,83,0,Math.PI*2);x.fill();x.stroke();x.textAlign='center';x.fillStyle='#bad6db';x.font='bold 12px Arial';x.fillText('DESEMPENHO',0,-42);x.fillStyle=rankColor(rank);x.font='900 76px Arial';x.fillText(rank,0,28);x.fillStyle='#eefcff';x.font='bold 11px Arial';x.fillText(rank==='S'?'EXCEPCIONAL':rank==='A'?'EXCELENTE':rank==='B'?'MUITO BOM':rank==='C'?'CONCLUÍDO':'PODE MELHORAR',0,56);x.restore();x.textAlign='center';x.fillStyle=resultGem?'#7fe9ff':'#ffcf55';x.font='bold 15px Arial';const hint=special?'Gema: conclua sem colidir.':'Gema: quebre todas as caixas, incluindo TNT.';x.fillText(resultGem?'GEMA DA FASE GARANTIDA!':hint,W/2,418);button(245,458,210,50,'REJOGAR',false,connectedPad()?extraHint():'R');button(505,458,210,50,'CONTINUAR',true,confirmHint());x.textAlign='left'}
function requestLevelPreview(level){if(levelPreview.level===level)return;levelPreview={level,img:null};if(level<1||level>10)return;const raw=ASSET_GROUPS['phase'+level]?.['bg'+level],url=typeof raw==='string'?raw:raw?.url;if(!url)return;const im=new Image();im.decoding='async';im.onload=()=>{if(levelPreview.level===level)levelPreview.img=im};im.src=url}
function levelSelect(){
 uiButtons=[];
 const sl=activeSlot?readSlot(activeSlot):blankSlot(),records=normalizeLevelRecords(sl.levelRecords,sl.crystals),unlocked=Math.max(1,Math.min(9,sl.levelsUnlocked||1));
 const levels=['ILHA SELVAGEM','PEDRA DA SELVA','CORRIDA DO JAVALI','TEMPLO PERDIDO','PÂNTANO SOMBRIO','CÂNION RUBRO','PICOS CONGELADOS','AVALANCHE ALPINA','CORRIDA POLAR','TEMPLO DA CONQUISTA'];
 const allComplete=records.every(r=>r.completed),selectedLevel=levelSelectIndex<9?CAMPAIGN_ORDER[levelSelectIndex]:10,record=selectedLevel<10?records[selectedLevel-1]:null;
 if(levelSelectBgImg&&levelSelectBgImg.complete&&levelSelectBgImg.naturalWidth)x.drawImage(levelSelectBgImg,0,0,levelSelectBgImg.naturalWidth,levelSelectBgImg.naturalHeight,0,0,W,H);
 else {const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a8248');g.addColorStop(1,'#14210e');x.fillStyle=g;x.fillRect(0,0,W,H)}
 requestLevelPreview(selectedLevel);
 const preview=assetManager.get('bg'+selectedLevel)||levelPreview.img||menuLogoImg;
 if(preview&&preview.complete&&preview.naturalWidth){x.save();x.beginPath();x.arc(W/2,164,83,0,Math.PI*2);x.clip();x.drawImage(preview,0,0,preview.naturalWidth,preview.naturalHeight,W/2-116,96,232,138);x.restore();x.strokeStyle=allComplete&&levelSelectIndex===9?'#7ff7e0':'#ffb52f';x.lineWidth=5;x.beginPath();x.arc(W/2,164,85,0,Math.PI*2);x.stroke()}
 x.save();x.textAlign='center';x.fillStyle='#7b3a0b';x.strokeStyle='#3b1705';x.lineWidth=4;x.beginPath();x.roundRect(W/2-153,236,306,35,10);x.fill();x.stroke();x.fillStyle='#ffe45f';x.font='900 17px Arial';x.fillText(levelSelectIndex<9?((levelSelectIndex+1)+' - '+levels[levelSelectIndex]):levels[9],W/2,260);x.restore();
 x.save();x.textAlign='left';x.font='900 12px Arial';
 if(record){x.fillStyle=record.completed?'#9effbd':'#fff3bf';x.fillText(record.completed?'FASE CONCLUÍDA':'FASE NÃO CONCLUÍDA',757,142);x.fillStyle=record.gem?'#8ff0ff':'#c9d0ca';x.fillText(record.gem?'💎 GEMA OBTIDA':'◇ GEMA PENDENTE',757,164);x.fillStyle=record.crystal?'#8ff0ff':'#c9d0ca';x.fillText(record.crystal?'◆ CRISTAL OBTIDO':'◇ CRISTAL PENDENTE',757,186);x.fillStyle='#fff3bf';x.fillText(record.totalBoxes?'CAIXAS  '+record.bestBoxes+'/'+record.totalBoxes:'MELHOR: '+(record.bestHits==null?'—':record.bestHits+' COLISÕES'),757,208);x.fillText('TEMPO  '+(record.bestTime?fmtTime(record.bestTime):'—'),757,230);x.fillText('RECORDE  '+(record.bestScore||0),757,252);x.fillStyle=rankColor(record.bestRank||'D');x.font='900 18px Arial';x.fillText('MELHOR RANK  '+(record.bestRank||'D'),757,278);x.font='bold 13px Arial'}
 else {const gems=records.filter(r=>r.gem).length,crystals=records.filter(r=>r.crystal).length,done=records.filter(r=>r.completed).length;x.fillStyle=allComplete?'#9effbd':'#fff3bf';x.fillText(allComplete?'CAMPANHA COMPLETA!':'CONCLUA AS 9 FASES',757,150);x.fillStyle='#fff3bf';x.fillText('FASES  '+done+'/9',757,178);x.fillStyle='#8ff0ff';x.fillText('GEMAS  '+gems+'/9',757,206);x.fillText('CRISTAIS  '+crystals+'/9',757,234);x.fillStyle='#ffe57a';x.fillText('PROGRESSO  '+Math.round((done+gems+crystals)/27*100)+'%',757,260)}x.restore();
 const pts=[[193,319],[335,319],[478,319],[623,319],[765,319],[193,389],[335,389],[478,389],[623,389],[766,389]];
 pts.forEach((pt,i)=>{const final=i===9,phase=final?0:CAMPAIGN_ORDER[i],r=final?null:records[phase-1],open=final?allComplete:i<unlocked,sel=i===levelSelectIndex;x.save();x.translate(pt[0],pt[1]);x.fillStyle=open?(sel?'#c92d1f':final?'#148b68':'#126fe4'):'#343945';x.strokeStyle=sel?'#ffe45b':open?'#e1b84b':'#171a20';x.lineWidth=sel?5:3;x.beginPath();x.ellipse(0,0,54,24,0,0,Math.PI*2);x.fill();x.stroke();if(i>=7){x.fillStyle='#5b310d';x.strokeStyle='#d48a24';x.lineWidth=2;x.beginPath();x.roundRect(-49,22,98,15,4);x.fill();x.stroke()}x.fillStyle=open?'#fff7d1':'#d7d9dc';x.font=final?'900 22px Arial':'900 24px Arial';x.textAlign='center';x.fillText(final?'★':String(i+1),0,8);if(!open){x.fillStyle='#ffd348';x.font='18px Arial';x.fillText('🔒',38,10)}if(r?.gem){x.font='14px Arial';x.fillStyle='#8ff0ff';x.fillText('💎',-31,-18)}if(r?.crystal){x.font='15px Arial';x.fillStyle='#8ff0ff';x.fillText('◆',30,-17)}if(r?.completed){x.font='bold 15px Arial';x.fillStyle='#a8ffba';x.fillText('✓',0,38)}if(sel){x.globalAlpha=.34;x.strokeStyle='#fff1a0';x.lineWidth=7;x.beginPath();x.ellipse(0,0,61,30,0,0,Math.PI*2);x.stroke()}x.restore();uiButtons.push({x:pt[0]-58,y:pt[1]-32,w:116,h:74,label:'LEVEL_'+(i+1),level:i})});
 const done=records.filter(r=>r.completed).length,gems=records.filter(r=>r.gem).length,crystals=records.filter(r=>r.crystal).length,msg=levelSelectIndex<9?(levelSelectIndex<unlocked?'ENTER: JOGAR • 💎 GEMA • ◆ CRISTAL • ✓ CONCLUÍDA':'CONCLUA A FASE ANTERIOR PARA LIBERAR'):(allComplete?'ENTRAR NO TEMPLO DA CONQUISTA':'COMPLETE TODAS AS FASES PARA ABRIR O TEMPLO');x.save();x.textAlign='center';x.font='bold 12px Arial';x.fillStyle='#fff0b5';x.fillText(msg,W/2,473);x.fillStyle='#d7f4df';x.fillText('CAMPANHA '+done+'/9  •  GEMAS '+gems+'/9  •  CRISTAIS '+crystals+'/9',W/2,492);x.restore();button(18,500,132,32,'VOLTAR',false,backHint())
}
function moveLevelSelect(delta){levelSelectIndex=(levelSelectIndex+delta+10)%10;playSfx('menu',delta<0?.94:1.04,.45,.04)}
function enterSelectedLevel(){const sl=activeSlot?readSlot(activeSlot):blankSlot(),records=normalizeLevelRecords(sl.levelRecords,sl.crystals);crystalsCollected=Array.from({length:9},(_,n)=>!!sl.crystals?.[n]);if(!sl.empty){fruits=Math.max(0,sl.fruits||0);lives=Math.max(1,sl.lives||4);aku=Math.max(0,Math.min(3,sl.aku||0));akuInvT=Math.max(0,sl.akuInvT||0)}const unlocked=Math.max(1,Math.min(9,sl.levelsUnlocked||1));if(levelSelectIndex>=9){if(!records.every(r=>r.completed)){toast='COMPLETE TODAS AS FASES';toastT=1.5;return}if(sl.bossDefeated){state='win';playSfx('portal',1.12,1,.3)}else ensurePhase(10,()=>startNow(false));return}if(levelSelectIndex>=unlocked){toast='CONCLUA A FASE ANTERIOR';toastT=1.5;return}const target=CAMPAIGN_ORDER[levelSelectIndex];ensurePhase(target,()=>startNow(false))}
function start(newGame=true){const target=currentLevel;ensurePhase(target,()=>startNow(newGame))}
function startNow(newGame=true){
 const carry=newGame?null:{fruits:Math.max(0,fruits||0),lives:Math.max(1,lives||4),aku:Math.max(0,Math.min(3,aku||0)),akuInvT:Math.max(0,akuInvT||0)};
 state='play';paused=false;unlockAudio();startMusicForLevel(true);menuSub='main';
 if(newGame){crystalsCollected=Array(9).fill(false);configureLevelCrystal(currentLevel)}
 swingClock=0;score=0;fruits=carry?carry.fruits:0;phaseStartFruits=fruits;lives=carry?carry.lives:4;deaths=0;levelTime=0;deathAnim=0;portalSeq=0;resultGem=false;
 checkpoint=currentCheckpointDefault;checkpointActivated=false;checkpointAnim=0;aku=carry?carry.aku:0;akuInvT=carry?carry.akuInvT:0;akuEquipT=0;akuTrail.length=0;stopInvincibleMusic();boxesBroken=0;
 normal.forEach(b=>{b.hit=false;b.breakT=0;if(isBounceBox(b)){b.bounceLeft=b.bounceMax||10;b.bounceFlash=0}});
 boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;akuFx.length=0;lifePickupFx.length=0;akuProtectT=0;forcedDeathT=0;hudLifePulseT=0;
 tnts.forEach(t=>{t.active=false;t.t=3;t.dead=false;t.blast=0;t.lastBeep=4});fruitList.forEach(f=>f.t=false);masks.forEach(m=>m.t=false);enemies.forEach(e=>e.dead=false);resetP();if(currentLevel===6||currentLevel===8)avalancheState=buildAvalancheState();if(currentLevel===7||currentLevel===9)rideState=buildRideState();inv=0;beginPhaseIntro();if(currentLevel===10){introT=0;checkpoint=110;resetP()}
 if(newGame&&activeSlot){const old=readSlot(activeSlot);writeSlot(activeSlot,{...blankSlot(),empty:false,version:SAVE_VERSION,trophies:old.trophies||{},updated:Date.now(),currentLevel:1,phaseName:'ILHA SELVAGEM'});unlockTrophy('primeiro');saveGame(true)}
}
function newGameAtSlot(i){activeSlot=i;playOpeningCinematic(()=>ensurePhase(1,()=>startNow(true)))}
function chooseMain(){playSfx('menu',1,.65,.04);if(menuIndex===0){menuSub='new';slotIndex=0}else if(menuIndex===1){menuSub='load';slotIndex=0}else if(menuIndex===2)menuSub='how';else if(menuIndex===3){menuSub='settings';settingsIndex=0}else if(menuIndex===4)menuSub='trophies';else menuSub='credits'}
function restartCurrentPhase(){fruits=phaseStartFruits;if(currentLevel===10)bossState=window.FinalBoss?.create?.()||null;start(false)}
function choosePause(){playSfx('menu',1,.65,.05);if(pauseIndex===0)paused=false;else if(pauseIndex===1)saveGame(false);else if(pauseIndex===2)cycleAudio('music',1);else if(pauseIndex===3)cycleAudio('sfx',1);else if(pauseIndex===4)cycleGraphics(1);else if(pauseIndex===5){configReturn='pause';state='menu';menuSub='config';configTab=0;configIndex=0}else if(pauseIndex===6)restartCurrentPhase();else{leaveLevelToMenu()}}
function menuBack(){playSfx('menu',.88,.55,.04);captureAction=null;captureType=null;if(menuSub==='main')return;if(menuSub==='config'){if(configReturn==='pause'){configReturn='settings';state='play';paused=true;menuSub='main';return}menuSub='settings';settingsIndex=3;return}menuSub='main';menuIndex=0}
function handleMenuKey(e){
 if(menuSub==='main'){if(e.code==='ArrowUp'||e.code==='KeyW')menuIndex=(menuIndex+5)%6;else if(e.code==='ArrowDown'||e.code==='KeyS')menuIndex=(menuIndex+1)%6;else if(e.code==='Enter'||e.code==='Space')chooseMain();return}
 if(menuSub==='new'||menuSub==='load'){if(e.code==='ArrowUp'||e.code==='KeyW')slotIndex=(slotIndex+2)%3;else if(e.code==='ArrowDown'||e.code==='KeyS')slotIndex=(slotIndex+1)%3;else if(e.code==='Delete'){deleteSlot(slotIndex+1);saveNotice='Slot '+(slotIndex+1)+' apagado'}else if(e.code==='Enter'||e.code==='Space'){const i=slotIndex+1;if(menuSub==='new')newGameAtSlot(i);else if(!applySave(i)){saveNotice='Slot '+i+' está vazio';toast=saveNotice;toastT=1.5}}else if(e.code==='Escape')menuBack();return}
 if(menuSub==='settings'){if(e.code==='ArrowUp'||e.code==='KeyW')settingsIndex=(settingsIndex+4)%5;else if(e.code==='ArrowDown'||e.code==='KeyS')settingsIndex=(settingsIndex+1)%5;else if((e.code==='ArrowLeft'||e.code==='KeyA')&&settingsIndex<=2)chooseSettings(-1);else if((e.code==='ArrowRight'||e.code==='KeyD')&&settingsIndex<=2)chooseSettings(1);else if(e.code==='Enter'||e.code==='Space')chooseSettings(1);else if(e.code==='Escape')menuBack();return}
 if(menuSub==='config'){if(captureAction)return;if(e.code==='ArrowLeft'||e.code==='ArrowRight'){configTab=1-configTab}else if(e.code==='ArrowUp'||e.code==='KeyW')configIndex=(configIndex+5)%6;else if(e.code==='ArrowDown'||e.code==='KeyS')configIndex=(configIndex+1)%6;else if(e.code==='KeyR'){if(configTab===0){keybinds={...DEFAULT_KEYS};try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds))}catch(_){ }}else{padbinds={...DEFAULT_PAD};try{localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){ }}}else if(e.code==='Enter'||e.code==='Space'){const a=['left','right','down','jump','spin','pause'][configIndex];if(configTab===0){captureAction=a;captureType='keyboard'}else if(['jump','spin','pause'].includes(a)){captureAction=a;captureType='gamepad'}}else if(e.code==='Escape')menuBack();return}
 if(menuSub==='trophies'){const pages=Math.ceil(trophyDefs().length/7);if(e.code==='ArrowLeft'||e.code==='KeyA'||e.code==='ArrowUp'||e.code==='KeyW'){trophyScroll=(trophyScroll+pages-1)%pages;playSfx('menu',.94,.45,.04)}else if(e.code==='ArrowRight'||e.code==='KeyD'||e.code==='ArrowDown'||e.code==='KeyS'){trophyScroll=(trophyScroll+1)%pages;playSfx('menu',1.04,.45,.04)}else if(e.code==='Escape'||e.code==='Enter')menuBack();return}
 if(e.code==='Escape'||e.code==='Enter')menuBack()
}
addEventListener('keydown',e=>{if(cinematicActive){if(['Enter','Escape','Space'].includes(e.code)){e.preventDefault();cinematicFinish?.()}return}if(capturedKeyCode===e.code){capturedKeyCode=null;return}if(captureType==='keyboard'&&captureAction)return;if(['ArrowUp','ArrowDown','Enter','Escape',keybinds.pause].includes(e.code))e.preventDefault();if(state==='loading'){if(loadingError&&e.code==='Enter'&&loadingRetry)loadingRetry();return}if(state==='menu'){handleMenuKey(e);return}if(state==='results'){if(e.code==='KeyR'){start(false);return}if(e.code==='Enter'){leaveLevelToSelector();return}if(e.code==='Escape'){leaveLevelToMenu();return}}if(state==='levelselect'){if(e.code==='ArrowLeft'||e.code==='KeyA')moveLevelSelect(-1);else if(e.code==='ArrowRight'||e.code==='KeyD')moveLevelSelect(1);else if(e.code==='Enter'||e.code==='Space')enterSelectedLevel();else if(e.code==='KeyX') {state='menu';menuSub='trophies'} else if(e.code==='Escape'){state='menu';menuSub='main'}return}if(state==='gameover'||state==='win'){if(e.code==='Enter'||e.code==='Escape'){leaveLevelToMenu()}return}if(state==='play'&&!paused&&levelMode==='boss'&&bossState?.intro>0&&(e.code==='Enter'||e.code==='Space')){bossState.intro=0;keys[e.code]=false;prevJ=true;playLoadedSfx('bossRoar');return}if(state==='play'&&!paused&&introT>0&&(e.code==='Enter'||e.code==='Space')){introT=0;keys[e.code]=false;prevJ=true;return}if(state==='play'&&(e.code==='Escape'||e.code===keybinds.pause)){paused=!paused;pauseIndex=0;playSfx('menu',paused?.96:1.04,.45,.05);return}if(state==='play'&&paused){if(e.code==='ArrowUp'||e.code==='KeyW'){pauseIndex=(pauseIndex+7)%8;playSfx('menu',.92,.5,.04)}else if(e.code==='ArrowDown'||e.code==='KeyS'){pauseIndex=(pauseIndex+1)%8;playSfx('menu',1.05,.5,.04)}else if(e.code==='ArrowLeft'||e.code==='KeyA'){if(pauseIndex===2||pauseIndex===3)cycleAudio(pauseIndex===2?'music':'sfx',-1);else if(pauseIndex===4)cycleGraphics(-1)}else if(e.code==='ArrowRight'||e.code==='KeyD'){if(pauseIndex===2||pauseIndex===3)cycleAudio(pauseIndex===2?'music':'sfx',1);else if(pauseIndex===4)cycleGraphics(1)}else if(e.code==='Enter'||e.code==='Space')choosePause();else if(e.code==='Escape')paused=false;return}});
function canvasPos(ev){const r=c.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height}}
let syncTouchUI=()=>{};
function setupTouchControls(){
 const root=document.getElementById('touch-controls'),joy=document.getElementById('touch-joystick'),knob=document.getElementById('joystick-knob');
 if(!root||!joy||!knob)return;
 const actionPointers=new Map();let joyPointer=null,joyCenter={x:0,y:0},lastVisible=false;
 const isTouchDevice=()=>matchMedia('(pointer:coarse)').matches||matchMedia('(hover:none)').matches||navigator.maxTouchPoints>0;
 const haptic=(ms=7)=>{try{navigator.vibrate?.(ms)}catch(_){}};
 const set=(action,value)=>{if(action in touchState)touchState[action]=value};
 const resetActions=()=>{actionPointers.clear();joyPointer=null;for(const k of Object.keys(touchState))touchState[k]=false;for(const k of Object.keys(keys))keys[k]=false;prevJ=false;prevS=false;prevDown=false;knob.style.transform='translate3d(0,0,0)';joy.classList.remove('active');root.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed'))};
 resetInputActions=resetActions;
 const updateJoy=(clientX,clientY)=>{
   let dx=clientX-joyCenter.x,dy=clientY-joyCenter.y;const max=48,mag=Math.hypot(dx,dy);if(mag>max){dx*=max/mag;dy*=max/mag}
   knob.style.transform=`translate3d(${dx}px,${dy}px,0)`;
   const nx=dx/max,ny=dy/max,dead=.24;
   set('left',nx<-dead);set('right',nx>dead);set('down',ny>.34);
 };
 const beginJoy=ev=>{if(joyPointer!==null)return;ev.preventDefault();joyPointer=ev.pointerId;const r=joy.getBoundingClientRect();joyCenter={x:r.left+r.width/2,y:r.top+r.height/2};joy.setPointerCapture?.(ev.pointerId);joy.classList.add('active');updateJoy(ev.clientX,ev.clientY);haptic(5)};
 const moveJoy=ev=>{if(ev.pointerId!==joyPointer)return;ev.preventDefault();updateJoy(ev.clientX,ev.clientY)};
 const endJoy=ev=>{if(ev.pointerId!==joyPointer)return;ev.preventDefault();joyPointer=null;set('left',false);set('right',false);set('down',false);knob.style.transform='translate3d(0,0,0)';joy.classList.remove('active')};
 joy.addEventListener('pointerdown',beginJoy,{passive:false});joy.addEventListener('pointermove',moveJoy,{passive:false});joy.addEventListener('pointerup',endJoy,{passive:false});joy.addEventListener('pointercancel',endJoy,{passive:false});joy.addEventListener('lostpointercapture',endJoy,{passive:false});
 const pressAction=ev=>{
   const b=ev.target.closest('[data-action]');if(!b)return;ev.preventDefault();if(state==='play'&&!paused&&levelMode==='boss'&&bossState?.intro>0){bossState.intro=0;playLoadedSfx('bossRoar');haptic(6);return}if(state==='play'&&!paused&&introT>0){introT=0;haptic(6);return}const action=b.dataset.action;actionPointers.set(ev.pointerId,{action,b});set(action,true);b.classList.add('pressed');b.setPointerCapture?.(ev.pointerId);haptic(action==='jump'?9:6)
 };
 const releaseAction=ev=>{
   const item=actionPointers.get(ev.pointerId);if(!item)return;ev.preventDefault();actionPointers.delete(ev.pointerId);if(![...actionPointers.values()].some(v=>v.action===item.action))set(item.action,false);if(![...actionPointers.values()].some(v=>v.b===item.b))item.b.classList.remove('pressed')
 };
 root.addEventListener('pointerdown',ev=>{const pause=ev.target.closest('[data-ui-action="pause"]');if(pause){ev.preventDefault();if(state==='play'&&!paused){paused=true;pauseIndex=0;pause.classList.add('pressed');haptic(10)}return}pressAction(ev)},{passive:false});
 root.addEventListener('pointerup',ev=>{const pause=ev.target.closest('[data-ui-action="pause"]');if(pause)pause.classList.remove('pressed');releaseAction(ev)},{passive:false});
 root.addEventListener('pointercancel',releaseAction,{passive:false});root.addEventListener('lostpointercapture',releaseAction,{passive:false});
 root.addEventListener('contextmenu',ev=>ev.preventDefault());
 const pauseForInterruption=()=>{resetActions();if(state==='play'&&!paused){paused=true;pauseIndex=0;syncMusic()}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseForInterruption()});
 addEventListener('blur',pauseForInterruption);
 syncTouchUI=()=>{
   const visible=isTouchDevice()&&state==='play'&&!paused;
   if(visible!==lastVisible){lastVisible=visible;root.classList.toggle('mobile-visible',visible);if(!visible)resetActions()}
 };
 syncTouchUI();
}
setupTouchControls();
c.addEventListener('pointerdown',ev=>{
  const m=canvasPos(ev);
  const hit=uiButtons.find(b=>m.x>=b.x&&m.x<=b.x+b.w&&m.y>=b.y&&m.y<=b.y+b.h);
  if(state==='loading'){if(hit?.label==='TENTAR NOVAMENTE'&&loadingRetry)loadingRetry();return}
  if(!hit)return;
  if(state==='menu'){
    if(hit.label==='VOLTAR'){menuBack();return}
    if(menuSub==='trophies'&&(hit.label==='ANTERIOR'||hit.label==='PRÓXIMA')){const pages=Math.ceil(trophyDefs().length/7);trophyScroll=(trophyScroll+(hit.label==='ANTERIOR'?pages-1:1))%pages;playSfx('menu',hit.label==='ANTERIOR'?.94:1.04,.45,.04);return}
    if(menuSub==='main'){
      const idx=['NEW GAME','LOAD GAME','COMO JOGAR','CONFIGURAÇÕES','TROFÉUS','CRÉDITOS'].indexOf(hit.label);
      if(idx>=0){menuIndex=idx;chooseMain()}
    }else if(menuSub==='new'||menuSub==='load'){
      if(hit.slot){slotIndex=hit.slot-1;if(menuSub==='new')newGameAtSlot(hit.slot);else if(!applySave(hit.slot)){toast='Slot vazio';toastT=1}}
    }else if(menuSub==='settings'){
      if(hit.label.startsWith('MÚSICA')){settingsIndex=0;chooseSettings(1)}else if(hit.label.startsWith('EFEITOS')){settingsIndex=1;chooseSettings(1)}else if(hit.label.startsWith('GRÁFICOS')){settingsIndex=2;chooseSettings(1)}else if(hit.label==='CONTROLES'){settingsIndex=3;chooseSettings(1)}else if(hit.label==='VOLTAR')menuBack()
    }else if(menuSub==='config'){
      if(hit.label==='TECLADO')configTab=0;else if(hit.label==='GAMEPAD')configTab=1;
    }
  }else if(state==='play'&&paused){
    let idx=-1;if(hit.label==='CONTINUAR')idx=0;else if(hit.label==='SALVAR JOGO')idx=1;else if(hit.label.startsWith('MÚSICA'))idx=2;else if(hit.label.startsWith('EFEITOS'))idx=3;else if(hit.label.startsWith('GRÁFICOS'))idx=4;else if(hit.label==='CONTROLES')idx=5;else if(hit.label==='REINICIAR FASE')idx=6;else if(hit.label==='MENU PRINCIPAL')idx=7;
    if(idx>=0){pauseIndex=idx;choosePause()}
  }else if(state==='results'){
    if(hit.label==='REJOGAR')start(false);
    else if(hit.label==='CONTINUAR'){leaveLevelToSelector()}
  }else if(state==='levelselect'){if(hit.label==='VOLTAR'){state='menu';menuSub='main'}else if(hit.level!==undefined){levelSelectIndex=hit.level;enterSelectedLevel()}}else if(state==='gameover'||state==='win'){leaveLevelToMenu()}
});
let prevPadPause=false,prevPadButtons=[],prevPadAxes={u:false,d:false,l:false,r:false};
function gamepadUI(){
 const g=connectedPad();if(!g){prevPadButtons=[];prevPadAxes={u:false,d:false,l:false,r:false};return}
 const now=g.buttons.map(b=>!!b.pressed);
 const edge=i=>!!now[i]&&!prevPadButtons[i];
 const up=!!g.buttons[12]?.pressed||g.axes[1]<-.55,down=!!g.buttons[13]?.pressed||g.axes[1]>.55,left=!!g.buttons[14]?.pressed||g.axes[0]<-.55,right=!!g.buttons[15]?.pressed||g.axes[0]>.55;
 const eu=up&&!prevPadAxes.u,ed=down&&!prevPadAxes.d,el=left&&!prevPadAxes.l,er=right&&!prevPadAxes.r;
 if(cinematicActive){if(edge(0)||edge(1)||edge(9))cinematicFinish?.();prevPadPause=!!g.buttons[padbinds.pause]?.pressed;prevPadButtons=now;prevPadAxes={u:up,d:down,l:left,r:right};return}
 if(captureType==='gamepad'&&captureAction){for(let i=0;i<g.buttons.length;i++){if(edge(i)){padbinds[captureAction]=i;captureAction=null;captureType=null;try{localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){ }toast=inputBrand()+' atualizado!';toastT=1;break}}}
 else if(state==='menu'){
   if(menuSub==='main'){if(eu)menuIndex=(menuIndex+5)%6;if(ed)menuIndex=(menuIndex+1)%6;if(edge(0))chooseMain()}
   else if(menuSub==='new'||menuSub==='load'){if(eu)slotIndex=(slotIndex+2)%3;if(ed)slotIndex=(slotIndex+1)%3;if(edge(3)){deleteSlot(slotIndex+1);saveNotice='Slot '+(slotIndex+1)+' apagado'}if(edge(0)){const i=slotIndex+1;if(menuSub==='new')newGameAtSlot(i);else if(!applySave(i)){toast='Slot '+i+' está vazio';toastT=1.3}}if(edge(1))menuBack()}
   else if(menuSub==='settings'){if(eu)settingsIndex=(settingsIndex+4)%5;if(ed)settingsIndex=(settingsIndex+1)%5;if(el&&settingsIndex<=2)chooseSettings(-1);if(er&&settingsIndex<=2)chooseSettings(1);if(edge(0))chooseSettings(1);if(edge(1))menuBack()}
   else if(menuSub==='config'){if(el||er)configTab=1-configTab;if(eu)configIndex=(configIndex+5)%6;if(ed)configIndex=(configIndex+1)%6;if(edge(3)){if(configTab===0)keybinds={...DEFAULT_KEYS};else padbinds={...DEFAULT_PAD};try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds));localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){}}if(edge(0)){const a=['left','right','down','jump','spin','pause'][configIndex];if(configTab===1&&['jump','spin','pause'].includes(a)){captureAction=a;captureType='gamepad'}}if(edge(1))menuBack()}
   else if(menuSub==='trophies'){const pages=Math.ceil(trophyDefs().length/7);if(el||eu)trophyScroll=(trophyScroll+pages-1)%pages;if(er||ed)trophyScroll=(trophyScroll+1)%pages;if(edge(1)||edge(0))menuBack()}
   else if(edge(1)||edge(0))menuBack();
 }else if(state==='play'&&!paused&&levelMode==='boss'&&bossState?.intro>0&&edge(0)){bossState.intro=0;prevJ=true;playLoadedSfx('bossRoar')}
 else if(state==='play'&&!paused&&introT>0&&edge(0)){introT=0;prevJ=true}
 else if(state==='results'){if(edge(2))start(false);else if(edge(0)){leaveLevelToSelector()}else if(edge(1)){leaveLevelToMenu()}}
 else if(state==='levelselect'){if(el)moveLevelSelect(-1);if(er)moveLevelSelect(1);if(edge(0))enterSelectedLevel();if(edge(2)){state='menu';menuSub='trophies'}if(edge(1)){state='menu';menuSub='main'}}
 else if(state==='gameover'||state==='win'){if(edge(0)||edge(1)){saveGame(true);state='menu';menuSub='main'}}
 const pp=!!g.buttons[padbinds.pause]?.pressed;if(pp&&!prevPadPause&&state==='play'){if(!paused){paused=true;pauseIndex=0}else paused=false}
 if(state==='play'&&paused){if(eu){pauseIndex=(pauseIndex+7)%8;playSfx('menu',.92,.5,.04)}if(ed){pauseIndex=(pauseIndex+1)%8;playSfx('menu',1.05,.5,.04)}if(el){if(pauseIndex===2||pauseIndex===3)cycleAudio(pauseIndex===2?'music':'sfx',-1);else if(pauseIndex===4)cycleGraphics(-1)}if(er){if(pauseIndex===2||pauseIndex===3)cycleAudio(pauseIndex===2?'music':'sfx',1);else if(pauseIndex===4)cycleGraphics(1)}if(edge(0))choosePause();if(edge(1))paused=false}
 prevPadPause=pp;prevPadButtons=now;prevPadAxes={u:up,d:down,l:left,r:right};refreshHelp();
}
function loadingScreen(){uiButtons=[];x.fillStyle='#07151d';x.fillRect(0,0,W,H);const lvl=loadingTargetLevel||currentLevel||1,meta=window.LEVEL_CONFIG?.[lvl],tip=window.LOADING_TIPS?.[lvl]||'Explore com calma e observe o cenário.';if(levelPreview.level!==lvl)requestLevelPreview(lvl);if(levelPreview.img){x.save();x.globalAlpha=.26;x.drawImage(levelPreview.img,0,0,levelPreview.img.naturalWidth,levelPreview.img.naturalHeight,0,0,W,H);x.restore()}x.save();const shade=x.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(0,0,0,.28)');shade.addColorStop(.5,'rgba(0,0,0,.52)');shade.addColorStop(1,'rgba(0,0,0,.78)');x.fillStyle=shade;x.fillRect(0,0,W,H);x.restore();if(menuLogoImg&&menuLogoImg.complete&&menuLogoImg.naturalWidth){x.globalAlpha=.9;x.drawImage(menuLogoImg,W/2-175,24,350,158);x.globalAlpha=1}x.save();x.fillStyle='rgba(7,21,29,.88)';x.strokeStyle=loadingError?'#e66d68':'#73d7c2';x.lineWidth=2;x.beginPath();x.roundRect(166,184,628,284,18);x.fill();x.stroke();x.restore();x.textAlign='center';x.fillStyle='#ffd45d';x.font='900 30px Arial';x.fillText(loadingText,W/2,224);x.fillStyle='#d9f5ee';x.font='bold 17px Arial';x.fillText(loadingError?'Falha no carregamento':'Preparando fase...',W/2,254);x.fillStyle='#f3fbff';x.font='bold 14px Arial';x.fillText('Modo: '+(meta?.mode||'plataforma').toUpperCase()+'  •  Tema: '+(meta?.name||'FASE'),W/2,281);x.fillStyle='#102a31';x.fillRect(214,305,532,28);x.strokeStyle=loadingError?'#e66d68':'#73d7c2';x.lineWidth=2;x.strokeRect(214,305,532,28);x.fillStyle=loadingError?'#d56b66':'#75d9c4';x.fillRect(218,309,524*Math.max(0,Math.min(1,loadingProgress)),20);x.fillStyle='#f0fff9';x.font='bold 16px Arial';x.fillText(Math.round(loadingProgress*100)+'%',W/2,360);const ang=performance.now()/180;x.save();x.translate(W/2,392);x.rotate(ang);x.strokeStyle='#ffd45d';x.lineWidth=5;x.beginPath();x.arc(0,0,14,.2,4.7);x.stroke();x.restore();x.fillStyle='#a9c9be';x.font='13px Arial';x.fillText('DICA: '+tip,W/2,417);x.fillStyle='#789c92';x.font='12px Arial';x.fillText('CORE + compartilhados permanecem • somente a fase atual fica ativa',W/2,442);if(loadingError){x.fillStyle='#ff9292';x.font='bold 14px Arial';x.fillText(loadingError,W/2,470);if(loadingErrorDetails){x.fillStyle='#c98c8c';x.font='11px Arial';x.fillText(loadingErrorDetails.slice(0,105),W/2,490)}button(370,502,220,34,'TENTAR NOVAMENTE',true,'ENTER')};x.textAlign='left'}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;gamepadUI();update(dt);syncMusic();syncTouchUI();if(state==='menu')menu();else if(state==='loading')loadingScreen();else if(state==='play')draw();else if(state==='results')results();else if(state==='levelselect')levelSelect();else if(state==='win')campaignEnd();else end('GAME OVER','Tente novamente e chegue ao fim da fase.');requestAnimationFrame(loop)}
window.__crashDebug={
 getControls:()=>({keybinds:{...keybinds},padbinds:{...padbinds}}),
 getCinematic:()=>({active:cinematicActive,source:cinematicVideo?.querySelector?.('source')?.getAttribute?.('src')||'assets/cinematics/abertura_v116.mp4',duration:cinematicVideo?.duration||0}),
 getSpecialAssets:()=>({snowball:!!snowballImg,bearRide:!!bearRideImg,boulder:!!boulderImg,boarRide:!!boarRideImg,roadObstacles:!!roadObstaclesImg,mode7Ground:!!mode7GroundImg,mode7Props:!!mode7PropsImg,soul:!!soulImg}),
 getBossAssets:()=>({guardian:!!bossGuardianImg,background:!!bgImg,music:!!assetManager.get('music10'),roar:!!assetManager.get('bossRoar'),slam:!!assetManager.get('bossSlam'),gem:!!assetManager.get('bossGem'),fire:!!assetManager.get('bossFire'),ice:!!assetManager.get('bossIce'),hit:!!assetManager.get('bossHit'),defeat:!!assetManager.get('bossDefeat')}),
 getCampaign:()=>({order:CAMPAIGN_ORDER.slice(),names:CAMPAIGN_ORDER.map(id=>window.LEVEL_CONFIG?.[id]?.name||''),currentPosition:campaignNumber()}),
 getGraphics:()=>({mode:graphicsMode,tier:graphicsTier(),label:graphicsLabel()}),
 getDeathProfiles:()=>Object.fromEntries(Object.entries(DEATH_PROFILES).map(([kind,profile])=>[kind,{...profile}])),
 getLayout:()=>({level:currentLevel,spawn:{x:currentCheckpointDefault,y:groundY-p.standH},portal:{...portal},checkpoint:{...checkpointBox},platforms:platforms.map(q=>q.slice(0,4)),rocks:rocks.map(r=>({...r})),boxes:normal.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,kind:b.kind})),tnts:tnts.map(t=>({x:t.x,y:t.y,w:t.w,h:t.h})),fruits:fruitList.map(f=>({x:f.x,y:f.y,w:42,h:42})),masks:masks.map(m=>({x:m.x,y:m.y,w:54,h:65})),enemies:enemies.map(e=>({x:e.x,y:e.y,w:e.w,h:e.h,type:e.type,a:e.a,b:e.b})),hazards:hazards.map(h=>({...h}))}),
 getState:()=>({state,currentLevel,currentLevelName,levelMode,paused,loadingProgress,loadingError,levelManager:levelManager.info(),player:{x:p.x,y:p.y},special:{snowballX,snowballSpeed,rideDistance:rideState?.distance||0,rideLane:rideState?.lane||0,rideCombo:rideState?.combo||0,rideNearMisses:rideState?.nearMisses||0,avalancheDistance:avalancheState?.distance||0,avalancheLane:avalancheState?.lane||0,avalancheGap:avalancheState?.gap||0,avalancheCombo:avalancheState?.combo||0,avalancheNearMisses:avalancheState?.nearMisses||0},progress:{fruits,phaseStartFruits,lives,boxesBroken,checkpointActivated},arrays:{enemies:enemies.length,boxes:normal.length,tnts:tnts.length,fruits:fruitList.length,platforms:platforms.length}}),
 loadLevel:(level)=>new Promise(resolve=>ensurePhase(level,()=>{startNow(false);resolve(window.__crashDebug.getState())})),
 testCheckpointRespawn:()=>{if(!normal.length)return null;checkpointActivated=true;checkpoint=checkpointRespawnX;normal[0].hit=true;boxesBroken=1;fruits=17;restartAttemptAfterDeath();return{boxKept:!!normal[0]?.hit,boxesBroken,fruits,checkpointActivated,playerX:p.x,respawnX:checkpointRespawnX}},
 testFullRestart:()=>{if(!normal.length)return null;checkpointActivated=false;checkpoint=currentCheckpointDefault;normal[0].hit=true;boxesBroken=1;fruits=17;restartAttemptAfterDeath();return{boxRestored:!normal[0]?.hit,boxesBroken,fruits,checkpointActivated,playerX:p.x,startX:currentCheckpointDefault}},
 testCarryRestart:()=>{if(!normal.length)return null;checkpointActivated=false;checkpoint=currentCheckpointDefault;phaseStartFruits=37;fruits=64;normal[0].hit=true;boxesBroken=1;restartAttemptAfterDeath();return{boxRestored:!normal[0]?.hit,fruits,phaseStartFruits,checkpointActivated}},
 testLifeReward:()=>{if(!normal.length)return null;const before=lives;grantLifeBoxReward(normal[0]);const immediate=lives;updateLifePickup(2);return{before,immediate,afterAnimation:lives,fx:lifePickupFx.length}},
 testInputReset:()=>{keys.ArrowRight=true;touchState.jump=true;resetInputActions();return{key:!!keys.ArrowRight,touch:!!touchState.jump}},
 testMovement:()=>{state='play';paused=false;introT=0;checkpoint=currentCheckpointDefault;resetP();inv=999;const startX=p.x;keys.ArrowRight=true;for(let i=0;i<30;i++)update(1/60);keys.ArrowRight=false;const movedX=p.x;keys.Space=true;update(1/60);keys.Space=false;update(1/60);return{startX,movedX,jumpVy:p.vy,onGround:p.on}},
 testPauseControlsReturn:()=>{state='play';paused=true;pauseIndex=5;const activeBefore=levelManager.activeLevel;choosePause();const opened={state,menuSub,activeLevel:levelManager.activeLevel};menuBack();return{activeBefore,opened,returned:{state,paused,activeLevel:levelManager.activeLevel}}},
 testRideMode:()=>{state='play';paused=false;introT=0;deathAnim=0;lives=4;rideState=buildRideState();const before=rideState.distance;keys.ArrowRight=true;update(1/60);keys.ArrowRight=false;const movedLane=rideState.targetLane===1&&rideState.lane>0;keys.Space=true;update(1/60);keys.Space=false;for(let i=0;i<12;i++)update(1/60);draw();const jumped=rideState.y>0,advanced=rideState.distance>before;rideState.distance=3599;update(.1);const checkpointReached=checkpointActivated&&checkpoint===3600;rideState.distance=RIDE_LENGTH-1;update(.1);const completed=state==='results';return{mode:levelMode,movedLane,jumped,advanced,checkpointReached,completed}},
 testRideDeath:()=>{state='play';paused=false;introT=0;deathAnim=0;lives=4;aku=0;inv=0;const expected=currentLevel===9?'boar':'ride';lose(true,expected);const specific=deathAnim>0&&deathKind===expected&&lives===3;deathAnim=0;state='play';lives=4;return{specific,kind:deathKind}},
 testAvalanche:()=>{state='play';paused=false;introT=0;deathAnim=0;lives=4;aku=0;inv=0;checkpointActivated=false;avalancheState=buildAvalancheState();const before=avalancheState.distance;keys.ArrowRight=true;update(1/60);keys.ArrowRight=false;const movedLane=avalancheState.targetLane===1&&avalancheState.lane>0;keys.Space=true;update(1/60);keys.Space=false;for(let i=0;i<8;i++)update(1/60);draw();const jumped=avalancheState.y>0,advanced=avalancheState.distance>before;avalancheState.distance=3249;update(.1);const checkpointReached=checkpointActivated&&checkpoint===3250;deathAnim=0;state='play';lives=4;inv=0;avalancheState.gap=169;update(1/60);const expectedKind=currentLevel===8?'boulder':'snowball',specificDeath=deathAnim>0&&deathKind===expectedKind&&lives===3;deathAnim=0;state='play';lives=4;return{mode:levelMode,movedLane,jumped,advanced,checkpointReached,specificDeath,kind:deathKind}},
 testSpecialChain:()=>{const s=buildRideState();const before=score;addSpecialChain(s,'fruit');addSpecialChain(s,'dodge');addSpecialChain(s,'dodge');const active=s.combo===3&&s.bestCombo===3&&s.nearMisses===2&&score>before;updateSpecialChain(s,3);return{active,expired:s.combo===0,best:s.bestCombo,nearMisses:s.nearMisses,scoreGain:score-before}},
 testSaveMigration:()=>{const key=SAVE_PREFIX+'3',old=localStorage.getItem(key);localStorage.setItem(key,JSON.stringify({empty:false,version:'1.1.0',currentLevel:7,levelsUnlocked:9,crystals:[true,true,true,true,true,true,true],gem:true,completed:true,lives:4,levelTime:91,score:4200}));const migrated=readSlot(3);if(old==null)localStorage.removeItem(key);else localStorage.setItem(key,old);return{version:migrated.version,currentLevel:migrated.currentLevel,levelsUnlocked:migrated.levelsUnlocked,crystals:migrated.crystals.length,records:migrated.levelRecords.length,currentGem:migrated.levelRecords[6].gem,bestTime:migrated.levelRecords[6].bestTime}},
 testLevelProgress:()=>{const oldSlot=activeSlot,oldState=state,oldLevel=currentLevel,oldGem=resultGem,oldCrystals=crystalsCollected.slice(),oldTime=levelTime,oldScore=score,oldDeaths=deaths;activeSlot=0;state='results';currentLevel=1;resultGem=true;crystalsCollected=Array(9).fill(false);crystalsCollected[0]=true;levelTime=82;score=3300;deaths=1;const saved=buildSave(true),record=saved.levelRecords[0];activeSlot=oldSlot;state=oldState;currentLevel=oldLevel;resultGem=oldGem;crystalsCollected=oldCrystals;levelTime=oldTime;score=oldScore;deaths=oldDeaths;return{records:saved.levelRecords.length,gems:saved.gems.length,completed:record.completed,gem:record.gem,crystal:record.crystal,bestTime:record.bestTime,bestScore:record.bestScore}},
 testDeathSequence:()=>{state='play';paused=false;introT=0;deathAnim=0;lives=2;resetP();beginDeath('Teste de animação');const started=deathAnim===DEATH_DURATION&&lives===1&&p.vx===0&&p.vy===0;draw();update(DEATH_DURATION+.05);const respawned=deathAnim===0&&state==='play'&&lives===1,respawnX=p.x;deathAnim=0;state='play';lives=1;resetP();beginDeath('Teste de game over');update(DEATH_DURATION+.05);const gameover=deathAnim===0&&state==='gameover'&&lives===0;state='play';lives=4;return{duration:DEATH_DURATION,started,livesLost:respawned,respawned,gameover,playerX:respawnX,checkpoint}},
 testBossBattle:()=>{if(!bossState)return null;state='play';paused=false;deathAnim=0;introT=0;bossState.intro=0;bossState.vulnerable=1;bossState.invuln=0;p.x=bossState.x+18;p.y=groundY-p.h;p.spin=.5;const before=bossState.hp;updateBossLevel(1/60);const damaged=bossState.hp===before-1;bossState.hp=1;bossState.vulnerable=1;bossState.invuln=0;p.spin=.5;updateBossLevel(1/60);const defeated=bossState.defeated&&bossState.hp===0;bossState.defeatT=.001;updateBossLevel(.01);return{mode:levelMode,damaged,defeated,won:state==='win',phase:bossState.phase}},
 testRenderStates:()=>{const original={state,paused,menuSub,trophyScroll};state='play';paused=false;draw();paused=true;draw();state='results';results();state='levelselect';levelSelect();state='menu';menuSub='main';menu();menuSub='trophies';trophyScroll=0;menu();trophyScroll=2;menu();state='win';campaignEnd();state=original.state;paused=original.paused;menuSub=original.menuSub;trophyScroll=original.trophyScroll;return true},
 release:()=>{levelManager.releaseCurrent('debug-release');return levelManager.info()},
 retry:()=>loadingRetry?.()
};
async function bootstrap(){try{const failures=await assetManager.loadGroup('core',p=>loadingProgress=p);if(failures?.length)throw new Error('Falha ao carregar o CORE');bindCoreAssets();state='menu'}catch(err){loadingError=String(err?.message||err);console.error('[Bootstrap]',err);state='menu'}requestAnimationFrame(loop)}bootstrap();
})();
