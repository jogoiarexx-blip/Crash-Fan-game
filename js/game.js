(()=>{
const c=document.getElementById('game'),x=c.getContext('2d');x.imageSmoothingEnabled=false;const W=c.width,H=c.height;
let playerImg=null,crouchImg=null,akuImg=null,tntImg=null,jungleImg=null,bgImg=null,trapImg=null,swingImg=null,pressImg=null,portalImg=null,checkpointImg=null,deathImg=null,soulImg=null,tileImg=null,turtleImg=null,armadilloImg=null,magmaBeetleImg=null,emberBatImg=null,spikeAssetImg=null,logAssetImg=null,pressAssetImg=null,poisonAssetImg=null,iceSpikeAssetImg=null,menuLogoImg=null,biomeTileImg=null,biomeEnemyImg=null;
const ASSET_GROUPS={
 core:{menuLogo:'assets/menu_logo.webp'},
 shared:{
  player:'assets/player_clean.webp',crouch:'assets/crash_crouch_slide.webp',aku:'assets/aku_sheet_transparent.webp',tnt:'assets/tnt_sheet_transparent.webp',
  jungle:'assets/jungle_sheet.webp',trap:'assets/traps_sheet.jpg',swing:'assets/swing_log_sheet.webp',press:'assets/stone_press_sheet.jpg',spikeAsset:'assets/trap_retractable_spikes.png',logAsset:'assets/trap_swinging_log.png',pressAsset:'assets/trap_stone_press.png',poisonAsset:'assets/trap_poison_surface.png',iceSpikeAsset:'assets/trap_ice_spikes.png',
  portal:'assets/portal_sheet.webp',checkpoint:'assets/checkpoint_sheet.webp',death:'assets/death_soul_sheet.webp',soul:'assets/death_winged_soul.webp',tile:'assets/tileset_v05.webp',turtle:'assets/turtle_walk_better.png',armadillo:'assets/armadillo_enemy.webp',magmaBeetle:'assets/volcanic_magma_beetle.png',emberBat:'assets/volcanic_ember_bat.png'
 },
 phase1:{bg1:'assets/background_fase1.webp'},
 phase2:{bg2:'assets/background_fase2.webp'},
 phase3:{bg3:'assets/background_fase3.webp',biomeTile3:'assets/swamp_tiles.webp',biomeEnemy3:'assets/swamp_enemies.webp'},
 phase4:{bg4:'assets/background_fase4.webp',biomeTile4:'assets/ice_tiles.webp',biomeEnemy4:'assets/ice_enemies.webp'},
 phase5:{bg5:'assets/background_fase2.webp'}
};
class AssetManager{
 constructor(groups){this.groups=groups;this.cache=new Map();this.named=new Map();this.loaded=new Set();this.stats={started:0,completed:0,failed:0,ms:0,failures:[],pending:[],events:[],groups:[]};}
 loadImage(url){if(this.cache.has(url))return this.cache.get(url);const started=performance.now();this.stats.started++;this.stats.pending.push(url);this.stats.events.push({type:'start',url,t:started});const pr=new Promise((resolve,reject)=>{const im=new Image();let settled=false;const finish=(err)=>{if(settled)return;settled=true;clearTimeout(timer);this.stats.completed++;this.stats.pending=this.stats.pending.filter(v=>v!==url);this.stats.ms+=performance.now()-started;this.stats.events.push({type:err?'error':'loaded',url,t:performance.now()-started,error:err?.message||''});if(err){this.stats.failed++;this.stats.failures.push({url,error:err.message});reject(err)}else resolve(im)};const timer=setTimeout(()=>finish(new Error('Tempo esgotado ao carregar '+url)),12000);im.decoding='async';im.onload=()=>finish();im.onerror=()=>finish(new Error('Falha ao decodificar '+url));im.src=url});this.cache.set(url,pr);return pr}
 async loadGroup(group,onProgress){this.stats.groups.push({group,entries:Object.keys(this.groups[group]||{}).length,already:this.loaded.has(group)});if(this.loaded.has(group)){onProgress?.(1);return[]}const entries=Object.entries(this.groups[group]||{});if(!entries.length){this.loaded.add(group);onProgress?.(1);return[]}let done=0;const failures=[];await Promise.all(entries.map(async([name,url])=>{try{const im=await this.loadImage(url);this.named.set(name,im)}catch(err){failures.push({name,url,error:err.message})}finally{done++;onProgress?.(done/entries.length)}}));this.loaded.add(group);return failures}
 async preparePhase(level,onProgress){const shared=Object.entries(this.groups.shared||{}),phaseName='phase'+level,phase=Object.entries(this.groups[phaseName]||{}),total=Math.max(1,shared.length+phase.length),failures=[];for(const f of await this.loadGroup('shared',p=>onProgress?.(p*shared.length/total)))failures.push(f);for(const f of await this.loadGroup(phaseName,p=>onProgress?.((shared.length+p*phase.length)/total)))failures.push(f);if(failures.length)loadingError=failures.length+' asset(s) indisponível(is); usando fallback quando necessário.';onProgress?.(1);return failures}
 phaseReady(level){return this.loaded.has('shared')&&this.loaded.has('phase'+level)}
 async preloadPhase(level){const g='phase'+level;if(!this.groups[g]||this.loaded.has(g))return this.loadGroup(g)}
 get(name){return this.named.get(name)||null}
}
	const assetManager=new AssetManager(ASSET_GROUPS);let loadingProgress=0,loadingText='CARREGANDO...',loadingError='',loadSerial=0;
function bindCoreAssets(){menuLogoImg=assetManager.get('menuLogo')||menuLogoImg}
function bindSharedAssets(){playerImg=assetManager.get('player');crouchImg=assetManager.get('crouch');akuImg=assetManager.get('aku');tntImg=assetManager.get('tnt');jungleImg=assetManager.get('jungle');trapImg=assetManager.get('trap');swingImg=assetManager.get('swing');pressImg=assetManager.get('press');spikeAssetImg=assetManager.get('spikeAsset');logAssetImg=assetManager.get('logAsset');pressAssetImg=assetManager.get('pressAsset');poisonAssetImg=assetManager.get('poisonAsset');iceSpikeAssetImg=assetManager.get('iceSpikeAsset');portalImg=assetManager.get('portal');checkpointImg=assetManager.get('checkpoint');deathImg=assetManager.get('death');soulImg=assetManager.get('soul');tileImg=assetManager.get('tile');turtleImg=assetManager.get('turtle');armadilloImg=assetManager.get('armadillo');magmaBeetleImg=assetManager.get('magmaBeetle');emberBatImg=assetManager.get('emberBat')}
function bindPhaseAssets(level){bindSharedAssets();bgImg=assetManager.get('bg'+level)||bgImg;biomeTileImg=assetManager.get('biomeTile'+level)||null;biomeEnemyImg=assetManager.get('biomeEnemy'+level)||null}
async function ensurePhase(level,done){const serial=++loadSerial;state='loading';loadingProgress=0;loadingError='';loadingText='CARREGANDO FASE '+level+'...';try{await assetManager.preparePhase(level,p=>loadingProgress=p);if(serial!==loadSerial)return;bindPhaseAssets(level);done()}catch(err){loadingError=String(err?.message||err);state='menu';menuSub='main';toast='Erro ao carregar assets da fase';toastT=2.2}}
const keys={};
const touchState={left:false,right:false,down:false,jump:false,spin:false};
const DEFAULT_KEYS={left:'ArrowLeft',right:'ArrowRight',down:'ArrowDown',jump:'Space',spin:'KeyX',pause:'KeyP'};
const DEFAULT_PAD={jump:0,spin:2,pause:9};
let keybinds={...DEFAULT_KEYS},padbinds={...DEFAULT_PAD},captureAction=null,captureType=null,capturedKeyCode=null;
try{keybinds={...DEFAULT_KEYS,...JSON.parse(localStorage.getItem('crashV05Keybinds')||'{}')};padbinds={...DEFAULT_PAD,...JSON.parse(localStorage.getItem('crashV05Padbinds')||'{}')}}catch(_){ }
function actionDown(a){const code=keybinds[a];return !!keys[code]||!!touchState[a]}
function keyName(code){return ({ArrowLeft:'←',ArrowRight:'→',ArrowDown:'↓',ArrowUp:'↑',Space:'ESPAÇO',Escape:'ESC',Enter:'ENTER',KeyP:'P',KeyX:'X',KeyZ:'Z',KeyA:'A',KeyD:'D',KeyS:'S',KeyW:'W',KeyK:'K'}[code]||code.replace('Key','').replace('Digit',''))}
function connectedPad(){const gs=navigator.getGamepads?.()||[];for(const g of gs)if(g&&g.connected)return g;return null}
function padFamily(g=connectedPad()){const id=(g?.id||'').toLowerCase();if(/playstation|dualshock|dualsense|sony|054c/.test(id))return'playstation';if(/xbox|xinput|microsoft|045e/.test(id))return'xbox';return g?'generic':'keyboard'}
function padButtonName(i,g=connectedPad()){const f=padFamily(g);const ps={0:'×',1:'○',2:'□',3:'△',4:'L1',5:'R1',6:'L2',7:'R2',8:'CREATE',9:'OPTIONS',10:'L3',11:'R3',12:'↑',13:'↓',14:'←',15:'→'};const xb={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',8:'VIEW',9:'MENU',10:'LS',11:'RS',12:'↑',13:'↓',14:'←',15:'→'};const m=f==='playstation'?ps:f==='xbox'?xb:null;return m?.[i]||('B'+i)}
function inputBrand(){const f=padFamily();return f==='playstation'?'PLAYSTATION':f==='xbox'?'XBOX':f==='generic'?'GAMEPAD':'TECLADO'}
function confirmHint(){return connectedPad()?padButtonName(0):'ENTER'}
function backHint(){return connectedPad()?padButtonName(1):'ESC'}
function extraHint(){return connectedPad()?padButtonName(2):'X'}
function deleteHint(){return connectedPad()?padButtonName(3):'DELETE'}
function moveHint(){return connectedPad()?'D-PAD / ANALÓGICO':keyName(keybinds.left)+' / '+keyName(keybinds.right)}
function actionHint(a){if(!connectedPad())return keyName(keybinds[a]);if(a==='left'||a==='right'||a==='down')return'D-PAD / ANALÓGICO';if(a==='jump')return padButtonName(padbinds.jump);if(a==='spin')return padButtonName(padbinds.spin);if(a==='pause')return padButtonName(padbinds.pause);return'?'}
function refreshHelp(){const h=document.getElementById('help');if(!h)return;h.textContent=connectedPad()?inputBrand()+' conectado • '+padButtonName(padbinds.pause)+' pausa • controles adaptáveis':'Controles configuráveis • 3 slots de save • '+keyName(keybinds.pause)+' pausa • conecte um controle'}
addEventListener('gamepadconnected',refreshHelp);addEventListener('gamepaddisconnected',refreshHelp);setTimeout(refreshHelp,250);
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code))e.preventDefault();if(captureType==='keyboard'&&captureAction){e.preventDefault();keybinds[captureAction]=e.code;capturedKeyCode=e.code;captureAction=null;captureType=null;try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds))}catch(_){ }toast='Controle atualizado!';toastT=1;}});
addEventListener('keyup',e=>keys[e.code]=false);
let state='menu',paused=false,last=0,camX=0,score=0,fruits=0,lives=4,checkpoint=80,checkpointAnim=0,inv=0,toast='',toastT=0,shake=0,aku=0,boxesBroken=0,deaths=0,levelTime=0,deathAnim=0,deathX=0,deathY=0,portalSeq=0,resultGem=false;
let menuIndex=0,pauseIndex=0,menuSub='main',uiButtons=[],slotIndex=0,activeSlot=0,configTab=0,configIndex=0,trophyScroll=0,saveNotice='',levelSelectIndex=0;
const SAVE_VERSION='0.9.1',SAVE_PREFIX='crashV091Slot',LEGACY_SAVE_PREFIXES=['crashV06Slot','crashV05Slot'];
function blankSlot(){return{empty:true,version:SAVE_VERSION,updated:0,currentLevel:1,phaseName:'ILHA SELVAGEM',checkpoint:80,score:0,fruits:0,lives:4,deaths:0,levelTime:0,boxesBroken:0,aku:0,gem:false,completed:false,levelsUnlocked:1,normal:[],tnts:[],fruitList:[],masks:[],enemies:[],trophies:{}}}
function readSlot(i){
  try{
    const raw=localStorage.getItem(SAVE_PREFIX+i)||LEGACY_SAVE_PREFIXES.map(p=>localStorage.getItem(p+i)).find(Boolean);
    if(!raw)return blankSlot();
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||parsed.empty===true)return blankSlot();
    const base=blankSlot();
    const num=(v,f,min=0)=>Number.isFinite(Number(v))?Math.max(min,Number(v)):f;
    const arr=v=>Array.isArray(v)?v.map(Boolean):[];
    return {
      ...base,...parsed,empty:false,version:SAVE_VERSION,
      currentLevel:Math.min(5,Math.max(1,Math.round(num(parsed.currentLevel,1,1)))),
      checkpoint:num(parsed.checkpoint,base.checkpoint,0),score:num(parsed.score,0),
      fruits:num(parsed.fruits,0),lives:Math.max(1,Math.round(num(parsed.lives,4,1))),
      deaths:num(parsed.deaths,0),levelTime:num(parsed.levelTime,0),boxesBroken:num(parsed.boxesBroken,0),
      aku:Math.min(2,Math.round(num(parsed.aku,0))),
      levelsUnlocked:Math.min(5,Math.max(1,Math.round(num(parsed.levelsUnlocked,1,1)))),
      normal:arr(parsed.normal),tnts:arr(parsed.tnts),fruitList:arr(parsed.fruitList),
      masks:arr(parsed.masks),enemies:arr(parsed.enemies),
      trophies:parsed.trophies&&typeof parsed.trophies==='object'?parsed.trophies:{}
    };
  }catch(_){return blankSlot()}
}
function writeSlot(i,data){try{localStorage.setItem(SAVE_PREFIX+i,JSON.stringify(data));return true}catch(_){saveNotice='Este navegador bloqueou o save local.';return false}}
function deleteSlot(i){try{localStorage.removeItem(SAVE_PREFIX+i);for(const p of LEGACY_SAVE_PREFIXES)localStorage.removeItem(p+i)}catch(_){ } }
function trophyDefs(){return[
 ['primeiro','PRIMEIROS PASSOS','Comece uma nova aventura.'],['canyon','VENTO DO CÂNION','Conclua Cânion Rubro.'],['checkpoint','PORTO SEGURO','Ative um checkpoint.'],['frutas50','COLETOR','Colete 50 frutas em uma fase.'],['caixas','QUEBRA-CAIXAS','Quebre 100% das caixas.'],['gema','GEMA SELVAGEM','Conquiste uma gema de fase.'],['semMorrer','SEM ARRANHÕES','Conclua uma fase sem morrer.'],['veloz','PÉS LIGEIROS','Conclua uma fase em menos de 2:30.'],['pantano','PÉS NA LAMA','Conclua Pântano Sombrio.'],['gelo','SANGUE FRIO','Conclua Picos Congelados.']
]}
function unlockTrophy(id){if(!activeSlot)return;const sl=readSlot(activeSlot);if(!sl.trophies)sl.trophies={};if(!sl.trophies[id]){sl.trophies[id]=Date.now();writeSlot(activeSlot,sl);toast='🏆 TROFÉU: '+(trophyDefs().find(t=>t[0]===id)?.[1]||id);toastT=2.3}}
function buildSave(completed=false){const old=activeSlot?readSlot(activeSlot):blankSlot();const done=completed||state==='results'||state==='levelselect';const unlocked=done?Math.max(old.levelsUnlocked||1,Math.min(5,currentLevel+1)):Math.max(old.levelsUnlocked||1,Math.min(5,currentLevel));return{empty:false,version:SAVE_VERSION,updated:Date.now(),currentLevel,phaseName:currentLevelName,checkpoint,score,fruits,lives,deaths,levelTime,boxesBroken,aku,gem:resultGem,completed:done,levelsUnlocked:unlocked,normal:normal.map(b=>!!b.hit),tnts:tnts.map(t=>!!t.dead),fruitList:fruitList.map(f=>!!f.t),masks:masks.map(m=>!!m.t),enemies:enemies.map(e=>!!e.dead),trophies:(old.trophies||{})}}
function saveGame(auto=false){if(!activeSlot)return false;const ok=writeSlot(activeSlot,buildSave());if(ok&&!auto){saveNotice='Jogo salvo no Slot '+activeSlot;toast=saveNotice;toastT=1.5}return ok}
function applySaveData(i,sl){state='play';paused=false;menuSub='main';score=sl.score||0;fruits=sl.fruits||0;lives=Math.max(1,sl.lives||4);deaths=sl.deaths||0;levelTime=sl.levelTime||0;checkpoint=sl.checkpoint||currentCheckpointDefault;aku=sl.aku||0;boxesBroken=sl.boxesBroken||0;resultGem=!!sl.gem;deathAnim=0;portalSeq=0;checkpointAnim=0;normal.forEach((b,n)=>{b.hit=!!sl.normal?.[n];b.breakT=0});tnts.forEach((t,n)=>{t.dead=!!sl.tnts?.[n];t.active=false;t.t=3;t.blast=0});fruitList.forEach((f,n)=>f.t=!!sl.fruitList?.[n]);masks.forEach((m,n)=>m.t=!!sl.masks?.[n]);enemies.forEach((e,n)=>e.dead=!!sl.enemies?.[n]);boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;resetP();inv=1;toast='Slot '+i+' carregado';toastT=1.4}
function applySave(i){const sl=readSlot(i);if(sl.empty)return false;activeSlot=i;setLevel(sl.currentLevel||1);if(!assetManager.phaseReady(currentLevel)){ensurePhase(currentLevel,()=>applySaveData(i,sl));return true}bindPhaseAssets(currentLevel);applySaveData(i,sl);return true}
const worldW=5600,groundY=455;const portal={x:5360,y:245,w:180,h:210};
const sr={idle:[4,4,125,186],run1:[137,4,125,179],run2:[270,4,132,177],run3:[410,4,117,172],run4:[535,4,93,152],jump1:[636,4,151,177],jump2:[795,4,135,148],jump3:[4,198,115,176],jump4:[127,198,123,159],jump5:[258,198,115,171],fall:[381,198,110,145],spin1:[499,198,134,183],spin2:[641,198,146,173],box:[795,198,96,94],qbox:[899,198,95,104],fruit:[4,389,64,72],run5:[137,4,125,179],run6:[270,4,132,177],run7:[410,4,117,172],run8:[535,4,93,152],spin3:[499,198,134,183],hurt:[4,4,125,186],mask:[4,4,125,186]};
const akuSR={mask:[60,760,115,145],mask2:[192,760,110,145],power:[1320,760,130,145],charMask:[45,10,125,185]};
const tntSR={idle:[45,35,160,150],three:[43,390,175,165],two:[425,390,185,165],one:[785,390,180,165],blast:[205,575,225,180],smoke:[820,575,210,170]};
const p={x:80,y:groundY-78,w:46,h:78,standH:78,crouchH:48,vx:0,vy:0,on:false,facing:1,spin:0,anim:0,land:0,takeoff:0,crouch:false,slide:0,slideDir:1,stompSquash:0};
const boxFx=[]; const dustFx=[]; const enemyFx=[]; const impactFx=[]; let forcedDeathT=0,swingClock=0;
const VISUAL_OFFSETS={player:-5,box:-3,tnt:0,enemy:1};const ENEMY_GROUND_OFFSET={turtle:3,swampTurtle:2,frog:2,penguin:2,seal:2,iceShell:2,armadillo:4,magmaBeetle:3,mosquito:0,emberBat:0};
// Armadilhas/buracos da Fase 1. Os recortes vêm do sprite sheet enviado pelo usuário.
const trapSR={spikes:[12,30,490,310],bridge:[905,20,315,325],boulder:[500,385,430,205],snake:[990,375,500,190],swing:[1225,20,310,330],breakBridge:[12,585,490,180],totem:[1040,585,480,225]};

const swingFrames=[[0,78,170,320],[170,78,170,320],[340,78,170,320],[510,78,170,320],[680,78,170,320],[850,78,170,320],[1020,78,170,320],[1190,78,170,320],[1360,78,176,320]];
const LEVEL_RULES={groundY:455,standH:78,crouchH:48,directJumpTop:365,upperRouteTop:335,crouchTunnelTop:370,pitWidth:128};
let currentLevel=1,currentLevelName='ILHA SELVAGEM',currentCheckpointDefault=80;
const swingingLogs=[];
const stonePresses=[]; const pressSR=[18,18,285,185];
const spikeTraps=[];
const hazards=[];
const foreground=[];
const phaseDeco=[];
const jungleSR={
 tree1:[0,420,205,310],tree2:[185,455,195,275],flowers:[285,430,170,240],mushroom:[775,525,165,185],
 sign:[650,690,145,150],log:[785,700,220,145],torch:[1015,695,90,165],bridge:[1120,690,416,174],waterfall:[1110,320,285,365],
 rockA:[0,700,205,164],rockB:[205,690,170,174],rockC:[360,690,175,174],totem:[515,680,125,184],vine:[940,345,95,360]
};
const biomeTileSR={
 swampGround:[12,2,554,139],swampFloat:[1069,19,156,197],swampSmall:[1268,171,132,132],swampReeds:[14,431,99,118],swampTree:[362,412,169,220],swampTotem:[538,414,195,199],swampLily:[277,646,157,93],swampLantern:[1007,802,76,107],swampBoat:[773,802,218,112],swampSkull:[1230,787,160,112],
 iceGround:[15,19,588,137],iceFloat:[941,13,284,212],iceSmall:[1263,28,187,142],iceCrystal:[434,478,146,126],iceTotem:[580,465,176,228],iceTree:[402,622,166,146],iceRock:[13,602,198,158],iceBush:[198,496,114,102],iceBridge:[961,431,680,202]
};
const scenery=[];
const rocks=[];
const platforms=[];
const normal=[];
const tnts=[];
const masks=[];
const fruitList=[];
const tileSR={ground:[0,12,905,132],ground2:[0,168,955,122],slopeL:[0,306,430,140],small:[450,306,110,140],float:[958,50,255,155],floatS:[1220,55,165,140],bridge:[1015,450,500,170],rock:[8,477,150,95],bush:[155,478,190,100],flower:[350,470,190,115],totem:[550,455,190,210],question:[615,680,140,160]};
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
 magmaBeetle:[[0,0,256,256]],emberBat:[[0,0,256,256]],
 armadillo:[[0,0,220,100]]
};
const enemies=[];
function pushBox(x,y,q=false){normal.push({x,y,w:58,h:58,hit:false,q,breakT:0})}
function pushTNT(x,y=groundY-58){tnts.push({x,y,w:58,h:58,active:false,t:3.0,dead:false,blast:0})}
function pushFruit(x,y){fruitList.push({x,y,t:false})}
function pushEnemy(x,a,b,v=65,y=groundY-56,type='turtle'){let dims={turtle:[70,56],swampTurtle:[76,58],frog:[62,52],mosquito:[58,45],penguin:[60,60],seal:[78,52],iceShell:[68,52],armadillo:[84,50],magmaBeetle:[82,62],emberBat:[64,58]}[type]||[70,56];const groundBase=groundY-dims[1];if(Math.abs(y-groundBase)<=14)y=groundBase;enemies.push({x,y,baseY:y,v,a,b,dead:false,hp:1,hitT:0,safeT:0,stompFx:0,h:dims[1],w:dims[0],type,phase:Math.random()*6.28,state:type==='turtle'?'walk':'walk',stateT:0,shellVX:0,shellDir:Math.sign(v)||1})}
function clearMutableLevel(){[swingingLogs,stonePresses,spikeTraps,hazards,foreground,phaseDeco,scenery,rocks,platforms,normal,tnts,masks,fruitList,enemies].forEach(a=>a.length=0)}
function setLevel(n=1){
 clearMutableLevel(); currentLevel=n;
 if(n===5){
   currentLevelName='CÂNION RUBRO'; currentCheckpointDefault=95; portal.x=5325; portal.y=238;
   // Fase inédita: cânion vermelho com rajadas de vento, plataformas alternadas e TNT em cadeia.
   phaseDeco.push({s:'rockA',x:220,y:330,w:125,h:105},{s:'totem',x:1120,y:285,w:120,h:165},{s:'rockB',x:1840,y:335,w:130,h:100},{s:'totem',x:2860,y:275,w:125,h:175},{s:'rockC',x:4020,y:330,w:130,h:105},{s:'totem',x:4920,y:275,w:125,h:175});
   platforms.push([0,groundY,560,100],[688,groundY,420,100],[1236,groundY,450,100],[1814,groundY,390,100],[2332,groundY,520,100],[2980,groundY,420,100],[3528,groundY,460,100],[4116,groundY,430,100],[4684,groundY,716,100],
    [300,350,160,28],[770,315,170,28],[1320,335,160,28],[1510,275,150,28],[1900,325,160,28],[2440,300,170,28],[2700,240,155,28],[3110,320,160,28],[3650,285,170,28],[4240,315,160,28],[4480,250,170,28],[4920,300,180,28]);
   hazards.push({type:'pit',x:560,y:455,w:128,h:120},{type:'gust',x:1000,y:250,w:210,h:205,dir:1,power:120},{type:'pit',x:1108,y:455,w:128,h:120},{type:'spikes',x:1680,y:400,w:134,h:55,s:'spikes'},{type:'gust',x:2030,y:245,w:210,h:210,dir:-1,power:135},{type:'pit',x:2204,y:455,w:128,h:120},{type:'pit',x:2852,y:455,w:128,h:120},{type:'spikes',x:3400,y:400,w:128,h:55,s:'spikes'},{type:'gust',x:3740,y:235,w:230,h:220,dir:1,power:145},{type:'pit',x:3988,y:455,w:128,h:120},{type:'pit',x:4546,y:455,w:138,h:120});
   swingingLogs.push({x:1740,y:105,phase:.8},{x:3270,y:95,phase:2.4},{x:4350,y:100,phase:1.5});stonePresses.push({x:2570,phase:.5},{x:3880,phase:2.2});
   [260,510,740,980,1280,1450,1880,2070,2380,2680,3030,3260,3580,3810,4160,4430,4760,5010,5280].forEach((px,i)=>pushBox(px,groundY-58,i%3===0));
   pushBox(820,257,true);pushBox(1550,217,false);pushBox(2480,242,true);pushBox(2730,182,false);pushBox(4320,257,true);pushBox(4990,242,false);
   [930,2140,3160,4470].forEach(px=>pushTNT(px));masks.push({x:1420,y:265,t:false},{x:2760,y:175,t:false},{x:4400,y:250,t:false});
   [180,360,620,800,1040,1280,1490,1730,1940,2160,2400,2630,2860,3090,3330,3560,3790,4020,4250,4480,4710,4940,5170,5380].forEach((px,i)=>pushFruit(px,groundY-112-(i%4)*18));
   pushEnemy(760,700,1050,78,groundY-56,'magmaBeetle');pushEnemy(1320,1260,1600,-72,groundY-56,'turtle');pushEnemy(1880,1840,2160,82,groundY-52,'magmaBeetle');pushEnemy(2440,2380,2730,-88,groundY-56,'turtle');pushEnemy(3040,2990,3300,92,groundY-56,'magmaBeetle');pushEnemy(3590,3550,3860,-76,315,'emberBat');pushEnemy(4180,4140,4470,86,315,'emberBat');pushEnemy(4810,4740,5200,-96,groundY-56,'magmaBeetle');
  }else if(n===4){
   currentLevelName='PICOS CONGELADOS'; currentCheckpointDefault=105; portal.x=5320; portal.y=238;
   phaseDeco.push({s:'iceCrystal',x:260,y:315,w:125,h:125},{s:'iceTree',x:900,y:320,w:135,h:118},{s:'iceTotem',x:1720,y:285,w:115,h:160},{s:'iceCrystal',x:2470,y:315,w:135,h:130},{s:'iceRock',x:3280,y:345,w:125,h:100},{s:'iceTree',x:4010,y:320,w:135,h:118},{s:'iceCrystal',x:4890,y:310,w:140,h:135});
   platforms.push([0,groundY,620,100],[760,groundY,470,100],[1380,groundY,520,100],[2060,groundY,420,100],[2640,groundY,560,100],[3380,groundY,510,100],[4050,groundY,650,100],[4870,groundY,730,100],
    [450,345,160,28],[930,315,150,28],[1530,280,170,28],[2250,330,160,28],[2770,295,170,28],[3090,245,150,28],[3550,330,160,28],[4200,285,170,28],[4560,245,150,28],[5050,315,170,28]);
   hazards.push({type:'iceSpike',x:620,y:402,w:140,h:53},{type:'pit',x:1230,y:455,w:150,h:120},{type:'iceSpike',x:1900,y:402,w:160,h:53},{type:'pit',x:2480,y:455,w:160,h:120},{type:'iceSpike',x:3200,y:402,w:180,h:53},{type:'pit',x:3890,y:455,w:160,h:120},{type:'iceSpike',x:4700,y:402,w:170,h:53});
   stonePresses.push({x:1810,phase:.3},{x:3660,phase:1.5});
   [350,520,860,1060,1460,1660,2140,2310,2720,2920,3110,3470,3650,4140,4330,4560,5000,5200].forEach((px,i)=>pushBox(px,groundY-58,i%4===0));
   pushBox(480,287,true);pushBox(1580,222,false);pushBox(3115,187,true);pushBox(5100,257,false);
   [1130,2380,3740,4620].forEach(px=>pushTNT(px));
   masks.push({x:980,y:255,t:false},{x:3130,y:175,t:false},{x:5050,y:250,t:false});
   [270,600,800,1040,1280,1520,1830,2130,2430,2690,3010,3300,3560,3920,4210,4510,4820,5150,5380].forEach((px,i)=>pushFruit(px,groundY-112-(i%4)*18));
   pushEnemy(820,780,1140,90,groundY-60,'penguin');pushEnemy(1480,1420,1840,58,groundY-52,'seal');pushEnemy(2160,2090,2410,72,groundY-52,'iceShell');pushEnemy(2860,2710,3160,-96,groundY-60,'penguin');pushEnemy(3480,3410,3840,62,groundY-52,'seal');pushEnemy(4250,4120,4650,76,groundY-52,'iceShell');pushEnemy(5100,4930,5420,-102,groundY-60,'penguin');
 } else if(n===3){
   currentLevelName='PÂNTANO SOMBRIO'; currentCheckpointDefault=100; portal.x=5310; portal.y=242;
   phaseDeco.push({s:'swampReeds',x:120,y:330,w:125,h:115},{s:'swampTree',x:620,y:250,w:155,h:195},{s:'swampTotem',x:1390,y:270,w:135,h:175},{s:'swampLily',x:2110,y:405,w:135,h:55},{s:'swampLantern',x:2730,y:345,w:65,h:80},{s:'swampBoat',x:3470,y:355,w:145,h:82},{s:'swampSkull',x:4260,y:360,w:110,h:85},{s:'swampTree',x:4920,y:255,w:150,h:190});
   platforms.push([0,groundY,650,100],[790,groundY,520,100],[1480,groundY,450,100],[2090,groundY,500,100],[2740,groundY,490,100],[3390,groundY,580,100],[4140,groundY,500,100],[4820,groundY,780,100],
    [470,350,160,28],[960,310,150,28],[1210,270,160,28],[1650,335,160,28],[2220,300,170,28],[2550,250,150,28],[3020,325,160,28],[3650,285,170,28],[4000,245,150,28],[4440,330,160,28],[5080,310,170,28]);
   hazards.push({type:'poison',x:650,y:455,w:140,h:100},{type:'pit',x:1310,y:455,w:170,h:120},{type:'poison',x:1930,y:455,w:160,h:100},{type:'pit',x:2590,y:455,w:150,h:120},{type:'poison',x:3230,y:455,w:160,h:100},{type:'pit',x:3970,y:455,w:170,h:120},{type:'poison',x:4640,y:455,w:180,h:100});
   swingingLogs.push({x:1790,y:115,w:170,h:310,phase:.2},{x:4380,y:110,w:170,h:310,phase:1.8});
   [340,510,880,1060,1510,1690,2150,2350,2790,3000,3180,3470,3660,4200,4400,4920,5140].forEach((px,i)=>pushBox(px,groundY-58,i%3===0));
   pushBox(500,292,true);pushBox(1240,212,false);pushBox(3050,267,true);pushBox(5100,252,false);
   [1170,2470,3710,4550].forEach(px=>pushTNT(px));
   masks.push({x:1000,y:250,t:false},{x:3040,y:205,t:false},{x:5120,y:245,t:false});
   [260,590,830,1030,1260,1490,1780,2050,2320,2670,2910,3270,3540,3890,4180,4480,4770,5060,5360].forEach((px,i)=>pushFruit(px,groundY-112-(i%3)*18));
   pushEnemy(850,800,1180,58,groundY-58,'swampTurtle');pushEnemy(1540,1500,1840,42,groundY-52,'frog');pushEnemy(2210,2140,2490,48,315,'mosquito');pushEnemy(2850,2790,3150,-56,groundY-52,'frog');pushEnemy(3490,3410,3900,50,300,'mosquito');pushEnemy(4240,4180,4580,60,groundY-58,'swampTurtle');pushEnemy(4620,4480,4780,70,groundY-50,'armadillo');pushEnemy(5040,4900,5400,-46,groundY-52,'frog');
 } else if(n===2){
   currentLevelName='TEMPLO PERDIDO'; currentCheckpointDefault=110; portal.x=5310; portal.y=238;
   scenery.push({x:160,y:260,k:'totem',w:105,h:155},{x:410,y:305,k:'vine',w:52,h:150},{x:750,y:300,k:'tree2',w:130,h:185},{x:1270,y:300,k:'totem',w:120,h:170},{x:1700,y:320,k:'flowers',w:120,h:135},{x:2330,y:280,k:'totem',w:120,h:170},{x:2760,y:285,k:'vine',w:56,h:170},{x:3410,y:285,k:'tree2',w:132,h:188},{x:4090,y:315,k:'totem',w:118,h:168},{x:4720,y:325,k:'torch',w:62,h:118},{x:5060,y:300,k:'mushroom',w:110,h:130});
   rocks.push({x:860,y:388,w:92,h:64,k:'rockC'},{x:2550,y:385,w:96,h:66,k:'rockB'},{x:3570,y:386,w:96,h:64,k:'rockA'},{x:4490,y:386,w:96,h:64,k:'rockC'});
   platforms.push([0,groundY,590,100],[690,groundY,640,100],[1450,groundY,400,100],[1980,groundY,430,100],[2530,groundY,390,100],[3070,groundY,700,100],[3920,groundY,530,100],[4590,groundY,1010,100],[500,355,145,28],[870,315,145,28],[1160,280,170,28],[1600,340,145,28],[2110,305,150,28],[2460,255,145,28],[2975,320,160,28],[3330,280,160,28],[3720,245,150,28],[4220,330,160,28],[4850,315,165,28]);
   hazards.push({type:'spikes',x:590,y:400,w:100,h:55,s:'spikes'},{type:'pit',x:1330,y:455,w:120,h:120},{type:'spikes',x:1860,y:400,w:100,h:55,s:'spikes'},{type:'pit',x:2410,y:455,w:120,h:120},{type:'spikes',x:2920,y:400,w:100,h:55,s:'spikes'},{type:'pit',x:3770,y:455,w:150,h:120},{type:'spikes',x:4450,y:400,w:100,h:55,s:'spikes'});
   swingingLogs.push({x:1750,y:128,w:170,h:310,phase:.45},{x:4360,y:125,w:170,h:310,phase:2.0});stonePresses.push({x:2680,phase:.1},{x:3420,phase:1.4},{x:5220,phase:2.1});
   [350,520,780,960,1100,1260,1530,1710,2050,2200,2470,2580,3120,3310,3470,4170,4340,4980,5200].forEach((px,i)=>pushBox(px,groundY-58,i%3===0));pushBox(540,297,true);pushBox(1190,222,false);pushBox(3330,222,true);pushBox(4880,257,false);[920,2280,3640,4715].forEach(px=>pushTNT(px));masks.push({x:1185,y:230,t:false},{x:3340,y:170,t:false},{x:4900,y:250,t:false});[280,470,620,890,1210,1420,1640,1820,2140,2510,2680,3010,3250,3560,3920,4070,4390,4690,5030,5340].forEach((px,i)=>pushFruit(px,groundY-112-(i%4)*18));pushEnemy(830,760,1150,62);pushEnemy(1570,1500,1820,-58);pushEnemy(2740,2590,2890,65);pushEnemy(3310,3140,3630,-65);pushEnemy(4280,4050,4440,70);pushEnemy(5180,4970,5400,-75);
 } else {
   // FASE 1 REFEITA — grade previsível: chão, rota superior e passagens por baixo.
   // Alturas: 365 = alcançável direto; 335 = rota superior; 370 = túnel para agachar/slide.
   currentLevelName='ILHA SELVAGEM'; currentCheckpointDefault=80; portal.x=5360; portal.y=245;

   // Cenário decorativo: não cria colisões invisíveis.
   scenery.push(
    {x:120,y:238,k:'tree1',w:150,h:220},{x:855,y:282,k:'tree2',w:145,h:205},{x:1260,y:318,k:'flowers',w:125,h:138},
    {x:1565,y:323,k:'sign',w:95,h:105},{x:1990,y:302,k:'mushroom',w:112,h:130},{x:2480,y:335,k:'torch',w:58,h:108},
    {x:3140,y:292,k:'vine',w:60,h:165},{x:3860,y:302,k:'tree2',w:140,h:198},{x:4320,y:320,k:'flowers',w:120,h:135},
    {x:4820,y:285,k:'mushroom',w:112,h:132},{x:5220,y:308,k:'torch',w:58,h:108}
   );

   // Pedras sólidas, sempre apoiadas no chão e usadas como pequenos degraus/obstáculos.
   rocks.push(
    {x:600,y:397,w:82,h:58,k:'rockA'},{x:1250,y:397,w:86,h:58,k:'rockB'},
    {x:3330,y:397,w:86,h:58,k:'rockA'},
    {x:4430,y:397,w:86,h:58,k:'rockB'}
   );

   // Chão principal: segmentos em medidas padronizadas, com buracos de 128 px.
   platforms.push(
    [0,groundY,704,100],[832,groundY,576,100],[1536,groundY,768,100],[2432,groundY,640,100],
    [3200,groundY,704,100],[4032,groundY,640,100],[4800,groundY,800,100],

    // Plataformas baixas: salto direto a partir do chão (90 px).
    [320,365,192,28],[896,365,192,28],[2720,365,160,28],
    [3264,365,192,28],[4096,365,192,28],[4864,365,192,28],

    // Plataformas altas: acessíveis pela plataforma baixa e com espaço para passar por baixo.
    [512,335,192,28],[1120,335,224,28],[2880,335,160,28],
    [4320,335,192,28],[5120,335,192,28],

    // Túnel: Crash em pé não passa; agachado/escorregando passa por baixo.
    [1600,370,256,28]
   );

   // Buracos correspondem exatamente aos espaços sem chão.
   hazards.push(
    {type:'pit',x:704,y:455,w:128,h:120},{type:'pit',x:1408,y:455,w:128,h:120},
    {type:'pit',x:2304,y:455,w:128,h:120},{type:'pit',x:3072,y:455,w:128,h:120},
    {type:'pit',x:3904,y:455,w:128,h:120},{type:'pit',x:4672,y:455,w:128,h:120}
   );

   // Armadilhas refeitas: possuem aviso, janela segura e hitbox sincronizada com a arte.
   spikeTraps.push({x:1860,y:groundY,w:112,phase:.15});
   swingingLogs.push({x:2015,y:105,phase:.25});
   stonePresses.push({x:3530,phase:.35});

   // Caixas no chão ficam exatamente apoiadas (397 = 455 - 58).
   [250,590,930,1040,1560,1940,2660,3000,3230,3400,3840,4070,4260,4550,4860,5280]
    .forEach((px,i)=>pushBox(px,groundY-58,i%4===0));

   // Caixas sobre plataformas seguem a mesma regra: y = topo - 58.
   pushBox(380,307,true); pushBox(555,277,false); pushBox(960,307,false); pushBox(1180,277,true);
   pushBox(1690,312,true); pushBox(2750,307,true); pushBox(2905,277,false);
   pushBox(4140,307,true); pushBox(5160,277,false);

   // TNT apoiadas no chão, longe de saltos obrigatórios.
   [1280,2240,4930].forEach(px=>pushTNT(px));

   // Aku Aku em rotas opcionais/seguras.
   masks.push({x:1160,y:268,t:false},{x:2810,y:268,t:false},{x:5180,y:268,t:false});

   // Frutas guiam o caminho principal e a rota superior.
   [170,300,450,675,860,1010,1200,1360,1570,1770,2010,2210,2470,2620,2830,3010,3240,3440,3650,3860,4070,4260,4460,4640,4860,5060,5260,5440]
    .forEach((px,i)=>pushFruit(px,groundY-104-(i%3)*18));

   // Inimigos sempre patrulham trechos inteiros de chão — nunca atravessam buracos.
   pushEnemy(500,430,545,58,groundY-56,'turtle');
   pushEnemy(980,880,930,-62,groundY-56,'turtle');
   pushEnemy(2840,2720,2990,-74,groundY-50,'armadillo');
   pushEnemy(3330,3240,3470,64,groundY-56,'turtle');
   pushEnemy(4410,4300,4610,-68,groundY-56,'turtle');
   pushEnemy(5160,5030,5290,78,groundY-50,'armadillo');
 }
}
setLevel(1);

function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function isSemiPlatform(q){return Array.isArray(q)&&q.length>=4&&q[3]>0&&q[3]<50}
function canStandAt(px,bottom){
 const test={x:px+2,y:bottom-p.standH,w:Math.max(1,p.w-4),h:p.standH-2};
 for(const q of platforms){if(isSemiPlatform(q))continue;const r={x:q[0],y:q[1],w:q[2],h:q[3]};if(rect(test,r))return false}
 for(const r of rocks)if(rect(test,r))return false;
 for(const b of normal)if(!b.hit&&rect(test,{x:b.x,y:b.y,w:b.w,h:b.h}))return false;
 for(const t of tnts)if(!t.dead&&rect(test,{x:t.x,y:t.y,w:t.w,h:t.h}))return false;
 return true
}
function setPlayerHeight(nextH){if(nextH===p.h)return true;const bottom=p.y+p.h;if(nextH>p.h&&!canStandAt(p.x,bottom))return false;p.h=nextH;p.y=bottom-p.h;return true}
function visibleWorldX(px,pw=0,margin=180){return px+pw>=camX-margin&&px<=camX+W+margin}
function pad(){const g=connectedPad();if(!g)return{l:0,r:0,d:0,j:0,s:0,p:0};return{l:g.axes[0]<-.25||g.buttons[14]?.pressed,r:g.axes[0]>.25||g.buttons[15]?.pressed,d:g.axes[1]>.45||g.buttons[13]?.pressed,j:!!g.buttons[padbinds.jump]?.pressed,s:!!g.buttons[padbinds.spin]?.pressed,p:!!g.buttons[padbinds.pause]?.pressed}}
function puff(px,py,n=5){for(let i=0;i<n;i++)dustFx.push({x:px+(Math.random()-.5)*28,y:py+(Math.random()-.5)*10,vx:(Math.random()-.5)*90,vy:-35-Math.random()*80,t:.35+Math.random()*.25,s:4+Math.random()*8})}
function spawnEnemyFx(e,mode='stomp'){enemyFx.push({x:e.x,y:e.y,w:e.w||70,h:e.h||56,type:e.type,v:e.v,t:mode==='stomp'?.30:.20,mode})}
function spawnImpact(px,py,power=1){impactFx.push({x:px,y:py,t:.22,power});puff(px,py,Math.round(4+power*3))}
function enemyRect(e){return{x:e.x,y:e.y,w:e.w||70,h:e.h||56}}
function turtleSetShellForm(e){const bottom=e.y+(e.h||56);e.w=68;e.h=36;e.y=bottom-e.h;e.baseY=e.y}
function turtleEnterShell(e){turtleSetShellForm(e);e.state='hide';e.stateT=.24;e.shellVX=0;e.v=0;e.safeT=.12}
function turtleLaunch(e,dir=1){turtleSetShellForm(e);e.state='fly';e.stateT=0;e.shellDir=Math.sign(dir)||e.shellDir||1;e.shellVX=620*e.shellDir;e.safeT=.18;spawnImpact(e.x+e.w/2,e.y+e.h,1.1)}
function breakBox(b,mode='spin'){if(b.hit)return;b.hit=true;b.breakT=.38;boxesBroken++;score+=100;fruits+=b.q?5:1;boxFx.push({x:b.x+29,y:b.y+29,t:.42,q:b.q,mode});for(let i=0;i<9;i++)boxFx.push({piece:true,x:b.x+29,y:b.y+29,vx:(Math.random()-.5)*300,vy:-80-Math.random()*220,r:Math.random()*6.28,vr:(Math.random()-.5)*14,t:.65+Math.random()*.35,s:5+Math.random()*7});if(mode==='stomp'){shake=Math.max(shake,.16);spawnImpact(b.x+29,b.y+4,1.0)}toast=b.q?'Caixa bônus! +5 frutas':'Caixa quebrada!';toastT=1.0;puff(b.x+29,b.y+54,7)}
function beginDeath(msg='Crash caiu!'){if(deathAnim>0||state!=='play')return;deaths++;lives--;deathX=p.x;deathY=p.y;deathAnim=1.85;p.vx=p.vy=0;p.spin=0;shake=.38;toast=msg;toastT=1.0;if(lives<=0){setTimeout(()=>{if(state==='play'&&deathAnim>0){deathAnim=0;state='gameover'}},1750)}}
function forceDeath(){beginDeath('BOOM! TNT explodiu!')}
function resetP(){p.h=p.standH;p.x=checkpoint;p.y=groundY-p.h;p.vx=p.vy=0;p.spin=0;p.slide=0;p.crouch=false;p.land=0;p.takeoff=0;p.stompSquash=0;forcedDeathT=0;inv=1.5}
function lose(){if(inv>0||deathAnim>0)return;if(aku>0){aku--;inv=2;shake=.25;toast='Aku Aku protegeu você!';toastT=1.7;return}beginDeath('Crash perdeu uma vida!')}
function explode(t){if(t.dead)return;t.dead=true;t.blast=.55;shake=.55;score+=150;const cx=t.x+t.w/2,cy=t.y+t.h/2;for(const b of normal){if(!b.hit&&Math.hypot(b.x+29-cx,b.y+29-cy)<150){b.hit=true;boxesBroken++;score+=100}}for(const u of tnts){if(!u.dead&&u!==t&&Math.hypot(u.x+u.w/2-cx,u.y+u.h/2-cy)<170){u.active=true;u.t=Math.min(u.t,.35)}}for(const e of enemies){if(!e.dead&&Math.hypot(e.x+29-cx,e.y+26-cy)<150){e.dead=true;score+=250}}if(Math.hypot(p.x+p.w/2-cx,p.y+p.h/2-cy)<155)lose()}
let prevJ=false,prevS=false,prevDown=false;
function spikeTrapState(t){const c=(swingClock+t.phase)%3.25;let h=0,warning=false;if(c<1.05)h=0;else if(c<1.42){h=5;warning=true}else if(c<1.62)h=55*((c-1.42)/.20);else if(c<2.42)h=55;else if(c<2.68)h=55*(1-(c-2.42)/.26);return{h,warning,active:h>28}}
function pressTrapState(ps){const c=(swingClock+ps.phase)%3.85,top=66,bottom=337;let y=top,warning=false,slam=false;if(c<1.35)y=top;else if(c<1.78){y=top+Math.sin(c*46)*3;warning=true}else if(c<1.98){let q=(c-1.78)/.20;q=1-Math.pow(1-q,3);y=top+(bottom-top)*q;slam=true}else if(c<2.55)y=bottom;else if(c<3.35){let q=(c-2.55)/.80;y=bottom-(bottom-top)*(q*q*(3-2*q))}return{y,warning,slam,active:y>245}}
function swingTrapState(sw){const a=Math.sin(swingClock*2.15+sw.phase)*.88;const px=sw.x,py=sw.y;const len=176;const cx=px+Math.sin(a)*126,cy=py+74+Math.cos(a)*len;return{a,px,py,cx,cy}}
function update(dt){if(state!=='play'||paused)return;swingClock+=dt;levelTime+=dt;if(inv>0)inv-=dt;if(toastT>0)toastT-=dt;if(shake>0)shake-=dt;if(deathAnim>0){deathAnim-=dt;if(deathAnim<=0&&lives>0)resetP();return}if(portalSeq>0){portalSeq+=dt;p.vx=0;p.vy=0;const cx=portal.x+portal.w/2-p.w/2,cy=portal.y+portal.h/2-p.h/2;p.x+=(cx-p.x)*Math.min(1,dt*3.6);p.y+=(cy-p.y)*Math.min(1,dt*3.6);if(portalSeq>2.15){resultGem=boxesBroken>=normal.length+tnts.length;if(currentLevel<5)assetManager.preloadPhase(currentLevel+1);if(currentLevel===3)unlockTrophy('pantano');if(currentLevel===4)unlockTrophy('gelo');if(currentLevel===5)unlockTrophy('canyon');state='results';if(fruits>=50)unlockTrophy('frutas50');if(resultGem){unlockTrophy('caixas');unlockTrophy('gema')}if(deaths===0)unlockTrophy('semMorrer');if(levelTime<150)unlockTrophy('veloz');saveGame(true)}return}if(forcedDeathT>0){forcedDeathT-=dt;return}if(p.land>0)p.land-=dt;if(p.takeoff>0)p.takeoff-=dt;for(let i=dustFx.length-1;i>=0;i--){let d=dustFx[i];d.t-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=220*dt;if(d.t<=0)dustFx.splice(i,1)}for(let i=boxFx.length-1;i>=0;i--){let f=boxFx[i];f.t-=dt;if(f.piece){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=600*dt;f.r+=f.vr*dt}if(f.t<=0)boxFx.splice(i,1)}
for(let i=enemyFx.length-1;i>=0;i--){let f=enemyFx[i];f.t-=dt;if(f.t<=0)enemyFx.splice(i,1)}for(let i=impactFx.length-1;i>=0;i--){let f=impactFx[i];f.t-=dt;if(f.t<=0)impactFx.splice(i,1)}for(const e of enemies)if(!e.dead&&e.safeT>0)e.safeT=Math.max(0,e.safeT-dt);if(p.stompSquash>0)p.stompSquash=Math.max(0,p.stompSquash-dt)
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
 if(J&&!prevJ&&p.on&&!p.crouch){p.vy=-535;p.on=false;p.takeoff=.16;puff(p.x+31,p.y+p.h,4)}if(S&&!prevS&&p.slide<=0)p.spin=.58;prevJ=J;prevS=S;prevDown=D;if(p.spin>0)p.spin-=dt;p.vy=Math.min(780,p.vy+1400*dt);
 const prevY=p.y, prevBottom=p.y+p.h;
 p.x+=p.vx*dt;p.x=Math.max(0,Math.min(worldW-p.w,p.x));let pr={x:p.x,y:p.y,w:p.w,h:p.h};
 for(const q of platforms){if(isSemiPlatform(q))continue;const r={x:q[0],y:q[1],w:q[2],h:q[3]};if(rect(pr,r)){if(p.vx>0)p.x=r.x-p.w;else if(p.vx<0)p.x=r.x+r.w;p.vx=0;pr.x=p.x}}
 for(const r of rocks){if(rect(pr,r)){if(p.vx>0)p.x=r.x-p.w;else if(p.vx<0)p.x=r.x+r.w;p.vx=0;pr.x=p.x}}
 p.on=false;p.y+=p.vy*dt;pr.y=p.y;
 for(const q of platforms){const r={x:q[0],y:q[1],w:q[2],h:q[3]};if(!rect(pr,r))continue;
   if(isSemiPlatform(q)){
     const currBottom=p.y+p.h;
     if(p.vy>=0 && prevBottom<=r.y+10 && currBottom>=r.y){if(p.vy>330){p.land=.14;puff(p.x+31,r.y,5)}p.y=r.y-p.h;p.vy=0;p.on=true;pr.y=p.y}
   }else{
     if(p.vy>0 && prevBottom<=r.y+18){if(p.vy>330){p.land=.14;puff(p.x+31,r.y,5)}p.y=r.y-p.h;p.vy=0;p.on=true}
     else if(p.vy<0 && prevY>=r.y+r.h-18){p.y=r.y+r.h;p.vy=30}
     pr.y=p.y
   }
 }
 for(const r of rocks){if(rect(pr,r)){if(p.vy>0&&prevBottom<=r.y+18){if(p.vy>330){p.land=.14;puff(p.x+31,r.y,4)}p.y=r.y-p.h;p.vy=0;p.on=true}else if(p.vy<0&&prevY>=r.y+r.h-18){p.y=r.y+r.h;p.vy=30}pr.y=p.y}}
 if(p.y>H+180){lose();return}
 for(const st of spikeTraps){const z=spikeTrapState(st);if(z.active){const hit={x:st.x+8,y:st.y-z.h+9,w:st.w-16,h:z.h-8};if(rect(pr,hit)){lose();return}}}
 for(const sw of swingingLogs){const z=swingTrapState(sw);const hit={x:z.cx-36,y:z.cy-48,w:72,h:96};if(rect(pr,hit)){lose();return}}
 for(const ps of stonePresses){const z=pressTrapState(ps);if(z.active){const hit={x:ps.x+16,y:z.y+34,w:150,h:78};if(rect(pr,hit)){lose();return}}}
 for(const h of hazards){if(h.type==='pit')continue;if(h.type==='gust'&&rect(pr,{x:h.x,y:h.y,w:h.w,h:h.h})){p.x=Math.max(0,Math.min(worldW-p.w,p.x+h.dir*h.power*dt));p.vx+=h.dir*h.power*.18*dt;continue}if(rect(pr,{x:h.x+8,y:h.y+8,w:h.w-16,h:h.h-8})){lose();return}}
 for(const b of normal){if(b.hit)continue;const br={x:b.x,y:b.y,w:b.w,h:b.h};if(rect(pr,br)){const stomp=p.vy>0&&p.y+p.h-b.y<34;if(p.spin>0||p.slide>0){breakBox(b,p.slide>0?'slide':'spin')}else if(stomp){breakBox(b,'stomp');p.y=b.y-p.h;p.vy=-335;p.on=false;p.land=.16;p.stompSquash=.16}else if(p.vy<0){p.y=b.y+b.h;p.vy=70}else if(p.vx>0)p.x=b.x-p.w;else if(p.vx<0)p.x=b.x+b.w}}
 for(const t of tnts){if(t.dead){if(t.blast>0)t.blast-=dt;continue}if(t.active){t.t-=dt;if(t.t<=0)explode(t)}const tr={x:t.x,y:t.y,w:t.w,h:t.h};if(rect(pr,tr)){const stomp=p.vy>0&&p.y+p.h-t.y<38;if(p.spin>0||p.slide>0){explode(t);forceDeath();return}else if(stomp){p.y=t.y-p.h;p.vy=-365;p.on=false;if(!t.active){t.active=true;t.t=3.0;toast='TNT: 3...';toastT=.9}p.stompSquash=.13;spawnImpact(t.x+t.w/2,t.y,0.7)}else if(p.vx>0)p.x=t.x-p.w;else if(p.vx<0)p.x=t.x+t.w}}
 for(const f of fruitList){if(!f.t&&rect(pr,{x:f.x,y:f.y,w:42,h:42})){f.t=true;fruits++;score+=25;if(fruits>=100){fruits-=100;lives++;toast='100 frutas = +1 vida!';toastT=2}}}
 for(const m of masks){if(!m.t&&rect(pr,{x:m.x,y:m.y,w:54,h:65})){m.t=true;aku=Math.min(2,aku+1);score+=500;toast=aku===2?'Aku Aku reforçado!':'Aku Aku adquirido!';toastT=1.7}}
 for(const e of enemies){
   if(e.dead)continue;
   if(e.hitT>0)e.hitT-=dt;
   if(e.type==='turtle'){
     if(e.state==='hide'||e.state==='shell'){
       if(e.state==='hide'){
         e.stateT-=dt;
         if(e.stateT<=0)e.state='shell';
       }
       e.y=e.baseY;
       const er=enemyRect(e);
       if(rect(pr,er)){
         const stomp=p.vy>0&&p.y+p.h<e.y+18;
         if(p.spin>0||p.slide>0){
           turtleLaunch(e,(p.facing||Math.sign(p.vx)||1));
           score+=150;
           toast='Casco lançado!';toastT=.8;
           shake=Math.max(shake,.1);
         }else if(stomp){
           p.y=e.y-p.h;p.vy=-640;p.on=false;p.stompSquash=.15;shake=Math.max(shake,.15);spawnImpact(e.x+er.w/2,e.y+er.h,1.3);toast='Super pulo no casco!';toastT=.7;
         }else if(p.vy<0){
           p.y=e.y+e.h;p.vy=40;
         }else if(p.x+p.w/2<e.x+er.w/2)p.x=e.x-p.w; else p.x=e.x+e.w;
       }
       continue;
     }else if(e.state==='fly'){
       e.x+=e.shellVX*dt;
       e.y=e.baseY;
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
       if(e.safeT<=0&&rect(pr,er)){lose();return}
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
         const stomp=p.vy>0&&p.y+p.h<e.y+Math.min(26,(e.h||56)*.62);
         if(stomp){
           turtleEnterShell(e);
           score+=200;
           toast='Tartaruga recolhida!';toastT=.9;
           p.y=e.y-p.h;p.vy=-395;p.on=false;p.stompSquash=.16;shake=Math.max(shake,.14);spawnImpact(e.x+er.w/2,e.y+er.h,1.15);
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
   else e.y=e.baseY;
   const er=enemyRect(e);
   for(const b of normal){if(b.hit)continue;const br={x:b.x,y:b.y,w:b.w,h:b.h};if(rect(er,br)){if(e.v>0)e.x=b.x-er.w-2;else e.x=b.x+b.w+2;e.v*=-1;er.x=e.x;break}}
   for(const t of tnts){if(t.dead)continue;const tr={x:t.x,y:t.y,w:t.w,h:t.h};if(rect(er,tr)){if(e.v>0)e.x=t.x-er.w-2;else e.x=t.x+t.w+2;e.v*=-1;er.x=e.x;break}}
   if(rect(pr,er)){
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
 if(p.x>2480&&checkpoint<2600){checkpoint=2710;checkpointAnim=1.25;toast='CHECKPOINT ATIVADO!';toastT=2;score+=250;unlockTrophy('checkpoint');saveGame(true)}if(checkpointAnim>0)checkpointAnim=Math.max(0,checkpointAnim-dt);if(rect(pr,{x:portal.x+28,y:portal.y+22,w:portal.w-56,h:portal.h-28})&&portalSeq===0){portalSeq=.001;p.spin=0;toast='PORTAL ATIVADO!';toastT=.8;}p.anim+=dt*(p.slide>0?18:p.crouch?9:p.spin>0?16:Math.abs(p.vx)>30?12:3);camX+=(Math.max(0,Math.min(worldW-W,p.x-W*.35))-camX)*Math.min(1,dt*6)
}
function ds(img,s,px,py,w,h,flip=false,a=1){if(!img)return;x.save();x.globalAlpha=a;if(flip){x.translate(px+w,py);x.scale(-1,1);if(s)x.drawImage(img,...s,0,0,w,h);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,0,0,w,h)}else{if(s)x.drawImage(img,...s,px,py,w,h);else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,px,py,w,h)}x.restore()}
function bg(){
 // O menu carrega apenas o grupo CORE. Por isso o background da fase pode
 // ainda ser null aqui; nesse caso usamos um fundo leve sem acessar .complete.
 x.fillStyle='#08221d';x.fillRect(0,0,W,H);
 if(bgImg&&bgImg.complete&&bgImg.naturalWidth){const scale=H/bgImg.naturalHeight,iw=bgImg.naturalWidth*scale;let off=-(camX*.12)%(iw);for(let px=off-iw;px<W+iw;px+=iw)x.drawImage(bgImg,px,0,iw,H)}else{
   const grd=x.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#174d54');grd.addColorStop(.55,'#123b35');grd.addColorStop(1,'#071a18');x.fillStyle=grd;x.fillRect(0,0,W,H);
   x.globalAlpha=.18;x.fillStyle='#4c8f61';for(let i=0;i<10;i++){const xx=i*115-(i%2)*35;x.beginPath();x.arc(xx,390+(i%3)*15,95+(i%2)*25,Math.PI,Math.PI*2);x.fill()}x.globalAlpha=1;
 }
 if(currentLevel===2&&bgImg){x.fillStyle='rgba(62,35,18,.22)';x.fillRect(0,0,W,H);x.fillStyle='rgba(15,9,4,.18)';for(let i=0;i<8;i++)x.fillRect(i*140+((camX*.08)%55),265+(i%3)*18,110,170)}else if(currentLevel===3&&bgImg){x.fillStyle='rgba(25,44,12,.25)';x.fillRect(0,0,W,H);x.globalAlpha=.18;x.fillStyle='#d2d6ae';for(let i=0;i<5;i++)x.fillRect((i*230-(camX*.05)%120),330+i%2*35,260,28);x.globalAlpha=1}else if(currentLevel===4&&bgImg){x.fillStyle='rgba(180,225,255,.10)';x.fillRect(0,0,W,H);x.fillStyle='rgba(235,250,255,.7)';for(let i=0;i<24;i++){let xx=(i*79+(performance.now()/18))%W,yy=(i*47+Math.floor(performance.now()/35))%360;x.fillRect(xx,yy,2+(i%2),2+(i%2))}}else if(currentLevel===5){x.fillStyle='rgba(145,32,18,.38)';x.fillRect(0,0,W,H);x.fillStyle='rgba(255,173,59,.35)';for(let i=0;i<9;i++){x.fillRect((i*137-(camX*.18)%137),300+(i%3)*30,78,7)}}
}
function drawFrameRot(img,s,cx,cy,w,h,ang=0,flip=false,a=1){if(!img)return;x.save();x.globalAlpha=a;x.translate(cx,cy);if(flip)x.scale(-1,1);x.rotate(ang);if(s)x.drawImage(img,...s,-w/2,-h/2,w,h);else x.drawImage(img,-w/2,-h/2,w,h);x.restore()}
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
 if(e.type==='magmaBeetle'&&magmaBeetleImg){ds(magmaBeetleImg,null,px-30,py-72+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy),112,112,flip);return}
 else if(e.type==='emberBat'&&emberBatImg){ds(emberBatImg,null,px-30,py-75+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy),110,110,flip);return}
 else if(e.type==='armadillo'&&armadilloImg){img=armadilloImg;fr=enemySR.armadillo[0];dw=94;dh=44;drawX=px-(dw-pw)/2;drawY=py+ph-dh+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy)}
 else if(e.type!=='turtle'&&biomeEnemyImg){img=biomeEnemyImg;const frames=enemySR[e.type]||enemySR.frog;fr=frames[Math.floor(swingClock*(e.type==='mosquito'?11:7)+e.phase)%frames.length];const sz={swampTurtle:[96,70],frog:[76,62],mosquito:[78,62],penguin:[70,76],seal:[92,66],iceShell:[82,62]}[e.type]||[82,62];dw=sz[0];dh=sz[1];drawX=px-(dw-pw)/2;drawY=py+ph-dh+(ENEMY_GROUND_OFFSET[e.type]??VISUAL_OFFSETS.enemy)}
 ds(img,fr,drawX,drawY,dw,dh,flip);
}
function drawEnemy(e){drawEnemySprite(e,e.x,e.y,e.w||70,e.h||56,e.type==='turtle'?(e.state==='fly'?(e.shellDir||1)<0:e.v<0):e.v<0)}
function draw(){bg();x.save();let sx=shake>0?(Math.random()-.5)*12:0,sy=shake>0?(Math.random()-.5)*8:0;x.translate(-camX+sx,sy);
 // Buracos ficam entre o background e a camada jogável.
 for(const h of hazards)if(h.type==='pit'){x.fillStyle='#020604';x.fillRect(h.x,h.y,h.w,110);x.fillStyle='#101a13';x.fillRect(h.x,h.y,h.w,8);for(let yy=h.y+15;yy<h.y+105;yy+=18){x.globalAlpha=.35;x.fillStyle='#27422d';x.fillRect(h.x+8,yy,h.w-16,3)}x.globalAlpha=1}
 for(const o of scenery){if(!visibleWorldX(o.x,o.w))continue;const srj=jungleSR[o.k];ds(jungleImg,srj,o.x,o.y,o.w,o.h)}for(const o of phaseDeco){if(!visibleWorldX(o.x,o.w))continue;if(biomeTileImg&&biomeTileSR[o.s])ds(biomeTileImg,biomeTileSR[o.s],o.x,o.y,o.w,o.h);else if(jungleImg&&jungleSR[o.s])ds(jungleImg,jungleSR[o.s],o.x,o.y,o.w,o.h);}for(const q of platforms){if(!visibleWorldX(q[0],q[2]))continue;const elevated=q[3]<50;if(currentLevel===3&&biomeTileImg){const ts=elevated?biomeTileSR.swampSmall:biomeTileSR.swampGround,step=elevated?92:180;for(let xx=q[0];xx<q[0]+q[2]-1;xx+=step){const tw=Math.min(step+2,q[0]+q[2]-xx+1);ds(biomeTileImg,ts,xx,q[1]-(elevated?25:50),tw,elevated?q[3]+48:q[3]+30)}}else if(currentLevel===4&&biomeTileImg){const ts=elevated?biomeTileSR.iceSmall:biomeTileSR.iceGround,step=elevated?92:180;for(let xx=q[0];xx<q[0]+q[2]-1;xx+=step){const tw=Math.min(step+2,q[0]+q[2]-xx+1);ds(biomeTileImg,ts,xx,q[1]-(elevated?24:47),tw,elevated?q[3]+50:q[3]+32)}}else if(elevated){ds(tileImg,tileSR.float,q[0],q[1]-23,q[2],q[3]+50)}else{ds(tileImg,tileSR.ground,q[0],q[1]-40,q[2],q[3]+32)}}for(const r of rocks){if(!visibleWorldX(r.x,r.w))continue;ds(jungleImg,jungleSR[r.k],r.x-14,r.y-28,r.w+28,r.h+28)}for(const h of hazards){if(h.s)ds(trapImg,trapSR[h.s],h.x,h.y,h.w,h.h);else if(h.type==='gust'){x.save();x.globalAlpha=.72;x.strokeStyle='#ffd38a';x.lineWidth=4;for(let z=0;z<5;z++){const yy=h.y+28+z*31;x.beginPath();x.moveTo(h.x+18,yy);x.bezierCurveTo(h.x+h.w*.35,yy-18,h.x+h.w*.65,yy+18,h.x+h.w-18,yy-4);x.stroke();x.fillStyle='#fff0b0';x.beginPath();x.moveTo(h.x+h.w-18,yy-4);x.lineTo(h.x+h.w-34,yy-12);x.lineTo(h.x+h.w-29,yy+5);x.closePath();x.fill()}x.globalAlpha=1;x.restore()}else if(h.type==='poison'&&poisonAssetImg)ds(poisonAssetImg,null,h.x,h.y-2,h.w,72);else if(h.type==='poison'){x.fillStyle='#375c16';x.fillRect(h.x,h.y,h.w,24);x.fillStyle='#7ea61d';for(let z=0;z<h.w;z+=24){x.beginPath();x.arc(h.x+10+z,h.y+9+(z%3)*2,5,0,7);x.fill()}x.fillStyle='#18340c';x.fillRect(h.x,h.y+23,h.w,50)}else if(h.type==='iceSpike'&&iceSpikeAssetImg)ds(iceSpikeAssetImg,null,h.x,h.y-2,h.w,h.h+2);else if(h.type==='iceSpike'){x.fillStyle='#dff7ff';for(let z=0;z<h.w;z+=22){x.beginPath();x.moveTo(h.x+z,h.y+h.h);x.lineTo(h.x+z+11,h.y);x.lineTo(h.x+z+22,h.y+h.h);x.closePath();x.fill();x.strokeStyle='#6ac8f0';x.stroke()}}}
 // Espinhos retráteis: dicas visuais antes de ficarem perigosos.
 for(const st of spikeTraps){if(!visibleWorldX(st.x,st.w))continue;const z=spikeTrapState(st);x.save();if(spikeAssetImg){x.globalAlpha=z.h>0?.98:.72;ds(spikeAssetImg,null,st.x-8,groundY-108,st.w+16,108);x.globalAlpha=1}else{x.fillStyle='#314c2b';x.fillRect(st.x,groundY-8,st.w,8);const count=Math.max(3,Math.floor(st.w/22));for(let i=0;i<count;i++){const sx=st.x+i*(st.w/count),sw=st.w/count+1;x.fillStyle='#8e8c7f';x.beginPath();x.moveTo(sx,groundY);x.lineTo(sx+sw/2,groundY-z.h);x.lineTo(sx+sw,groundY);x.closePath();x.fill();}}if(z.warning){x.globalAlpha=.75;x.fillStyle='#ffd45b';for(let i=0;i<3;i++)x.fillRect(st.x+18+i*34,groundY-14,18,3);x.globalAlpha=1}x.restore()}
 // Tronco balançando: pivô, corda e corpo giram juntos, sem sprite-sheet desalinhado.
 for(const sw of swingingLogs){if(!visibleWorldX(sw.x,180,260))continue;const z=swingTrapState(sw);x.save();x.strokeStyle='#8b6230';x.lineWidth=7;x.beginPath();x.moveTo(z.px,z.py);x.lineTo(z.cx,z.cy);x.stroke();x.fillStyle='#5f7e38';x.fillRect(z.px-38,z.py-12,76,16);x.translate(z.cx,z.cy);x.rotate(-z.a*.82);if(logAssetImg)ds(logAssetImg,null,-78,-96,156,192);else{x.fillStyle='#6f3d1d';x.fillRect(-30,-48,60,96);x.fillStyle='#9c5a2b';for(let yy=-38;yy<=30;yy+=22)x.fillRect(-24,yy,48,8)}x.restore()}
 // Prensa: ciclo com aviso, queda rápida, pausa no chão e subida lenta.
 for(const ps of stonePresses){if(!visibleWorldX(ps.x,180))continue;const z=pressTrapState(ps);x.save();x.strokeStyle='#4e4b40';x.lineWidth=7;x.beginPath();x.moveTo(ps.x+36,42);x.lineTo(ps.x+36,z.y+20);x.moveTo(ps.x+144,42);x.lineTo(ps.x+144,z.y+20);x.stroke();if(z.warning){x.globalAlpha=.9;x.fillStyle='#ffcf3a';for(let i=0;i<3;i++){x.beginPath();x.moveTo(ps.x+65+i*28,395);x.lineTo(ps.x+76+i*28,410);x.lineTo(ps.x+54+i*28,410);x.closePath();x.fill()}x.globalAlpha=1}if(z.slam||z.active){x.globalAlpha=.32;x.fillStyle='#d7c3a2';for(let i=0;i<6;i++){x.beginPath();x.arc(ps.x+30+i*24,443,5+(i%2)*3,0,7);x.fill()}x.globalAlpha=1}if(pressAssetImg)ds(pressAssetImg,null,ps.x,z.y-8,180,150);else ds(pressImg,pressSR,ps.x,z.y,180,118);x.restore()}
 for(const b of normal)if(!b.hit&&visibleWorldX(b.x,b.w)){const bob=b.q?Math.sin(performance.now()/180+b.x)*2:0;ds(playerImg,sr[b.q?'qbox':'box'],b.x,b.y+bob+3,b.w,b.h)}for(const f of fruitList)if(!f.t&&visibleWorldX(f.x,44))ds(playerImg,sr.fruit,f.x,f.y,44,48);
 for(const m of masks)if(!m.t&&visibleWorldX(m.x,92))ds(akuImg,akuSR.mask,m.x-18,m.y-20,92,112);
 for(const t of tnts){if(!visibleWorldX(t.x,t.w,220))continue;if(t.dead){if(t.blast>0)ds(tntImg,tntSR.blast,t.x-75,t.y-70,215,175);continue}let s=tntSR.idle;if(t.active)s=t.t>2?tntSR.three:t.t>1?tntSR.two:tntSR.one;ds(tntImg,s,t.x,t.y,t.w,t.h)}
 for(const f of boxFx){if(f.piece){x.save();x.translate(f.x,f.y);x.rotate(f.r);x.globalAlpha=Math.max(0,Math.min(1,f.t*2));x.fillStyle='#9a5427';x.fillRect(-f.s,-3,f.s*2,6);x.fillStyle='#d4853d';x.fillRect(-f.s,-3,f.s*1.2,2);x.restore()}else{const a=Math.max(0,f.t/.42),sc=1+(1-a)*.55,sy=f.mode==='stomp'?1-(1-a)*.26:sc,sx=f.mode==='stomp'?1+(1-a)*.22:sc;x.save();x.globalAlpha=a;x.translate(f.x,f.y);x.rotate((1-a)*(f.mode==='spin'?2.3:(f.mode==='slide'?1.0:.18)));x.scale(sx,sy);ds(playerImg,sr[f.q?'qbox':'box'],-29,-29,58,58);if(f.mode==='stomp'){x.globalAlpha=a*.55;x.fillStyle='#fff4b8';x.beginPath();x.ellipse(0,22,18+(1-a)*12,4+(1-a)*2,0,0,Math.PI*2);x.fill()}x.restore()}}for(const d of dustFx){x.globalAlpha=Math.max(0,d.t*2);x.fillStyle='#e8e0cf';x.beginPath();x.arc(d.x,d.y,d.s,0,7);x.fill();x.globalAlpha=1}for(const f of impactFx){const q=Math.max(0,f.t/.22),r=(1-q)*34*f.power+8;x.save();x.globalAlpha=q*.72;x.strokeStyle='#fff0a6';x.lineWidth=Math.max(1,4*q);x.beginPath();x.ellipse(f.x,f.y,r,Math.max(3,r*.22),0,0,Math.PI*2);x.stroke();x.globalAlpha=q*.38;x.fillStyle='#ffd55d';x.beginPath();x.ellipse(f.x,f.y+2,r*.7,Math.max(2,r*.12),0,0,Math.PI*2);x.fill();x.restore()}for(const e of enemies)if(!e.dead&&visibleWorldX(e.x,e.w||90,220))drawEnemy(e);
 if(checkpoint<2600){ds(checkpointImg,[28,76,197,197],2488,314,120,120)}else{let cpGlow=.55+.35*Math.sin(swingClock*7);x.save();x.globalAlpha=cpGlow;x.fillStyle='#ffd84d';x.beginPath();x.ellipse(2548,430,58,13,0,0,Math.PI*2);x.fill();x.restore();if(checkpointAnim>.8)ds(checkpointImg,[312,32,213,241],2480,286,132,150);else if(checkpointAnim>.35)ds(checkpointImg,[312,32,213,241],2476,282,138,156);else ds(checkpointImg,[633,78,147,166],2488,304,118,124)};
 const pf=Math.floor(swingClock*9)%8;ds(portalImg,[pf*360,0,360,450],portal.x,portal.y,portal.w,portal.h);x.save();x.globalAlpha=.22+.12*Math.sin(swingClock*5);x.strokeStyle='#57d9ff';x.lineWidth=8;x.beginPath();x.ellipse(portal.x+portal.w/2,portal.y+portal.h/2,58,78,0,0,Math.PI*2);x.stroke();x.restore();
 if(portalSeq>0){x.save();const glow=Math.min(1,portalSeq/1.1);x.globalAlpha=.18+.55*glow;x.fillStyle='#8eefff';x.beginPath();x.arc(portal.x+portal.w/2,portal.y+portal.h/2,80+glow*65,0,Math.PI*2);x.fill();x.restore();}
 if(deathAnim>0){const elapsed=1.85-deathAnim;
   // Primeiro o corpo do Crash tomba; depois a alma com asas sai e sobe.
   if(elapsed<.62){const q=Math.min(1,elapsed/.62);x.save();x.globalAlpha=1-q*.35;x.translate(deathX+28,deathY+64);x.rotate(-q*1.05);ds(playerImg,sr.hurt,-38,-72,76,100,p.facing<0,1);x.restore()}
   if(elapsed>.24&&soulImg){const q=Math.min(1,(elapsed-.24)/1.42),fr=Math.min(5,Math.floor((elapsed-.24)*10)%6),rise=q*150,fade=1-Math.max(0,(q-.76)/.24);x.save();x.globalAlpha=Math.max(0,fade);x.shadowColor='#67d9ff';x.shadowBlur=18;ds(soulImg,[fr*150,0,150,145],deathX-24,deathY-32-rise,116,112,false,.95);x.restore()}
 }
 let key='idle';if(p.spin>0)key=['spin1','spin2'][Math.floor(p.anim)%2];else if(!p.on){if(p.vy<-300)key='jump1';else if(p.vy<-80)key='jump2';else if(p.vy<120)key='jump3';else if(p.vy<350)key='jump4';else key='fall'}else if(Math.abs(p.vx)>35)key=['run1','run2','run3','run4'][Math.floor(p.anim)%4];
 let pw=82,ph=112;if(p.land>0){pw=88;ph=104}else if(p.takeoff>0){pw=78;ph=118}if(p.stompSquash>0){const sq=p.stompSquash/.17;pw*=1+.10*sq;ph*=1-.12*sq}const pdx=p.x-(pw-p.w)/2,pdy=p.y+p.h-ph;if(p.spin>0){x.globalAlpha=.14;for(let i=1;i<=3;i++)ds(playerImg,sr[key],pdx-p.vx*.014*i,pdy,82,112,p.facing<0,.14)}
 if(deathAnim<=0){let pa=inv>0&&Math.floor(inv*14)%2?0.35:1,pscale=portalSeq>0?Math.max(.05,1-portalSeq/2.05):1;x.save();x.translate(p.x+p.w/2,p.y+p.h/2);x.scale(pscale,pscale);
   if(p.slide>0){const sf=Math.min(8,Math.floor((.58-p.slide)*17));ds(crouchImg,[sf*280,220,280,220],-64,p.h/2-45+VISUAL_OFFSETS.player,128,96,p.facing<0,pa)}
   else if(p.crouch){const cf=Math.floor(p.anim*1.15)%8;ds(crouchImg,[cf*280,0,280,220],-57,p.h/2-73+VISUAL_OFFSETS.player,114,88,p.facing<0,pa)}
   else ds(playerImg,sr[key],-pw/2,p.h/2-ph+7+VISUAL_OFFSETS.player,pw,ph,p.facing<0,pa*Math.min(1,pscale*1.4));x.restore()}x.globalAlpha=1;
 if(aku>0){let bob=Math.sin(performance.now()/160)*5;ds(akuImg,akuSR.mask,p.x+(p.facing>0?-75:70),p.y-35+bob,62,78,p.facing<0);if(aku===2){x.strokeStyle='#ffe45c';x.lineWidth=4;x.globalAlpha=.65;x.beginPath();x.arc(p.x+31,p.y+42,58,0,7);x.stroke();x.globalAlpha=1}}
 // Foreground: elementos passam visualmente na frente do Crash.
 for(const f of foreground)ds(trapImg,trapSR[f.s],f.x,f.y,f.w,f.h);
 x.restore();
 // HUD compacto com ícones, separado do cenário e sem cobrir tanta tela.
 const totalBoxes=normal.length+tnts.length;const tm=fmtTime(levelTime);
 x.save();x.fillStyle='#06141de8';x.strokeStyle='#70c8b955';x.lineWidth=2;x.beginPath();x.roundRect(12,12,610,62,12);x.fill();x.stroke();
 const hudItem=(hx,icon,txt,sub,kind)=>{x.fillStyle='#ffffff';x.font='bold 20px Arial';if(kind==='life')ds(playerImg,sr.idle,hx+5,20,34,42);else if(kind==='fruit')ds(playerImg,sr.fruit,hx,21,36,40);else if(kind==='box')ds(playerImg,sr.box,hx,22,38,38);else if(kind==='aku')ds(akuImg,akuSR.mask,hx,18,38,45);else if(kind==='time'){x.font='28px Arial';x.fillText('⏱',hx+1,50)}x.font='bold 19px Arial';x.fillStyle='#fff';x.fillText(txt,hx+48,39);x.font='bold 10px Arial';x.fillStyle='#9ed8c7';x.fillText(sub,hx+48,57)};
 hudItem(24,0,'× '+lives,'VIDAS','life');hudItem(132,0,String(fruits),'FRUTAS','fruit');hudItem(238,0,boxesBroken+'/'+totalBoxes,'CAIXAS','box');hudItem(376,0,tm,'TEMPO','time');hudItem(500,0,String(aku),'AKU','aku');x.fillStyle='#ffd45d';x.font='bold 14px Arial';x.fillText('FASE '+currentLevel+' • '+currentLevelName,22,86);x.restore();
 if(toastT>0){x.font='bold 20px Arial';let tw=x.measureText(toast).width+30;x.fillStyle='#00131dee';x.fillRect(W/2-tw/2,98,tw,38);x.fillStyle='#fff';x.fillText(toast,W/2-tw/2+15,124)}if(paused)drawPauseMenu();
}
function panel(px,py,pw,ph,alpha=.9){x.save();x.fillStyle=`rgba(3,18,16,${alpha})`;x.strokeStyle='#a6cf4a';x.lineWidth=2;x.beginPath();x.roundRect(px,py,pw,ph,14);x.fill();x.stroke();x.restore()}
function button(px,py,pw,ph,label,selected=false,sub=''){x.save();x.fillStyle=selected?'#d67b18':'#183927';x.strokeStyle=selected?'#ffd35a':'#527a3a';x.lineWidth=3;x.beginPath();x.roundRect(px,py,pw,ph,10);x.fill();x.stroke();x.textAlign='center';x.textBaseline='middle';x.font='bold 22px Arial';x.fillStyle=selected?'#fff7c2':'#f5f4dc';x.fillText(label,px+pw/2,py+ph/2-(sub?7:0));if(sub){x.font='12px Arial';x.fillStyle='#bdd6a3';x.fillText(sub,px+pw/2,py+ph/2+15)}x.restore();uiButtons.push({x:px,y:py,w:pw,h:ph,label})}
function slotCard(i,py,selected=false,mode='load'){const sl=readSlot(i);const px=215,pw=530,ph=92;panel(px,py,pw,ph,.94);x.textAlign='left';x.fillStyle=selected?'#ffd45d':'#e7f4e5';x.font='bold 24px Arial';x.fillText('SLOT '+i,px+20,py+31);if(sl.empty){x.font='16px Arial';x.fillStyle='#8fa99b';x.fillText('VAZIO — nenhuma aventura salva',px+20,py+62)}else{x.font='bold 15px Arial';x.fillStyle='#fff';x.fillText('Fase '+(sl.currentLevel||1)+' • '+(sl.phaseName||'ILHA SELVAGEM')+' • '+(sl.completed?'CONCLUÍDA':'EM PROGRESSO'),px+145,py+28);x.font='14px Arial';x.fillStyle='#bdd6a3';x.fillText('Caixas '+(sl.boxesBroken||0)+'/'+(normal.length+tnts.length)+'  •  Frutas '+(sl.fruits||0)+'  •  '+fmtTime(sl.levelTime||0),px+145,py+55);x.fillStyle=sl.gem?'#76e9ff':'#92a49b';x.fillText(sl.gem?'💎 Gema obtida':'◇ Gema não obtida',px+145,py+78)}if(selected){x.strokeStyle='#ffd45d';x.lineWidth=3;x.strokeRect(px-4,py-4,pw+8,ph+8)}uiButtons.push({x:px,y:py,w:pw,h:ph,label:'SLOT_'+i,slot:i,mode})}
function woodButton(px,py,pw,ph,label,selected=false,sub=''){x.save();const g=x.createLinearGradient(px,py,px,py+ph);g.addColorStop(0,selected?'#b85a18':'#6a3518');g.addColorStop(.55,selected?'#7c3510':'#4a2614');g.addColorStop(1,selected?'#4b230d':'#2e190e');x.fillStyle=g;x.strokeStyle=selected?'#ffc54a':'#9d5c29';x.lineWidth=3;x.beginPath();x.roundRect(px,py,pw,ph,8);x.fill();x.stroke();x.strokeStyle='#2a1409';x.lineWidth=1;for(let yy=py+9;yy<py+ph;yy+=12){x.beginPath();x.moveTo(px+10,yy);x.lineTo(px+pw-10,yy+Math.sin(yy)*2);x.stroke()}x.textAlign='center';x.textBaseline='middle';x.font='900 21px Arial';x.fillStyle=selected?'#fff0a8':'#f4ead4';x.shadowColor='#000';x.shadowBlur=3;x.fillText(label,px+pw/2,py+ph/2-(sub?6:0));x.shadowBlur=0;if(sub){x.font='11px Arial';x.fillStyle='#d7ba86';x.fillText(sub,px+pw/2,py+ph/2+14)}x.restore();uiButtons.push({x:px,y:py,w:pw,h:ph,label})}
function miniSaveCard(i,py){const sl=readSlot(i);x.save();x.fillStyle='rgba(9,20,15,.88)';x.strokeStyle=i===activeSlot?'#f2a733':'#6e6f48';x.lineWidth=2;x.beginPath();x.roundRect(18,py,220,82,9);x.fill();x.stroke();x.fillStyle=i===activeSlot?'#ffbd3d':'#5fa7ff';x.font='900 28px Arial';x.fillText(String(i),30,py+34);x.fillStyle='#f4d184';x.font='bold 14px Arial';x.fillText(sl.empty?'SLOT VAZIO':(sl.phaseName||'ILHA SELVAGEM'),70,py+22);x.font='12px Arial';x.fillStyle='#d6e5d6';if(sl.empty)x.fillText('Sem progresso salvo',70,py+48);else{x.fillText('🍎 '+(sl.fruits||0)+'   📦 '+(sl.boxesBroken||0)+'/'+(normal.length+tnts.length),70,py+45);x.fillText('⏱ '+fmtTime(sl.levelTime||0)+(sl.gem?'   💎':''),70,py+65)}x.restore()}
function miniTrophies(){let all={};for(let i=1;i<=3;i++)Object.assign(all,readSlot(i).trophies||{});const defs=trophyDefs();x.save();x.fillStyle='rgba(9,20,15,.88)';x.strokeStyle='#6e6f48';x.lineWidth=2;x.beginPath();x.roundRect(735,148,207,285,9);x.fill();x.stroke();x.textAlign='center';x.fillStyle='#ffb33f';x.font='900 19px Arial';x.fillText('TROFÉUS',838,176);x.textAlign='left';defs.slice(0,5).forEach((t,i)=>{const got=!!all[t[0]], yy=212+i*42;x.fillStyle=got?'#ffe176':'#7b817c';x.font='bold 13px Arial';x.fillText((got?'🏆 ':'🔒 ')+t[1],753,yy);x.font='10px Arial';x.fillStyle=got?'#c9dbc9':'#737a75';x.fillText(t[2].slice(0,27),753,yy+15)});x.textAlign='center';x.fillStyle='#9db39d';x.font='11px Arial';x.fillText(Object.keys(all).length+'/'+defs.length+' conquistados',838,418);x.restore()}
function drawMainMenu(){if(menuLogoImg&&menuLogoImg.complete&&menuLogoImg.naturalWidth){x.save();x.globalAlpha=.98;x.drawImage(menuLogoImg,325,6,310,142);x.restore()}else{x.textAlign='center';x.fillStyle='#ffd24a';x.font='900 48px Arial';x.fillText('CRASH BANDICOOT',W/2,70);x.font='900 28px Arial';x.fillStyle='#f3e7c8';x.fillText('FÃ GAME',W/2,105)}
 miniSaveCard(1,155);miniSaveCard(2,245);miniSaveCard(3,335);miniTrophies();
 const opts=[['NEW GAME','Escolher slot'],['LOAD GAME','Continuar save'],['COMO JOGAR','Movimentos'],['CONTROLES','Teclado / gamepad'],['TROFÉUS','Conquistas'],['CRÉDITOS','Projeto']];opts.forEach((o,i)=>woodButton(302,165+i*52,360,42,o[0],menuIndex===i,o[1]));
 x.textAlign='center';x.font='bold 12px Arial';x.fillStyle='#d7e5d4';x.fillText((connectedPad()?'D-PAD / ANALÓGICO':'↑ ↓')+' selecionar  •  '+confirmHint()+' confirmar  •  mouse também funciona',W/2,508);x.textAlign='left';x.fillStyle='#ff9d32';x.font='900 16px Arial';x.fillText('V0.8',18,522)}
function drawSlots(mode){x.fillStyle='#ffd45d';x.font='bold 32px Arial';x.textAlign='center';x.fillText(mode==='new'?'NEW GAME — ESCOLHA UM SLOT':'LOAD GAME — ESCOLHA UM SLOT',W/2,125);for(let i=1;i<=3;i++)slotCard(i,155+(i-1)*105,slotIndex===i-1,mode);x.font='14px Arial';x.fillStyle='#cce6d1';x.fillText((mode==='new'?confirmHint()+' cria/reinicia o slot':confirmHint()+' carrega o slot')+' • '+deleteHint()+' apaga • '+backHint()+' volta',W/2,490);button(375,505,210,38,'VOLTAR',false)}
function drawHow(){panel(110,125,740,365,.95);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 32px Arial';x.fillText('COMO JOGAR',W/2,166);x.textAlign='left';x.font='bold 18px Arial';x.fillStyle='#fff';const lines=['Objetivo: atravesse cada fase e alcance o portal.','Quebre todas as caixas (incluindo TNT) para ganhar a gema.','Pule sobre inimigos ou use o giro/escorregão para derrotá-los.','TNT: pule em cima para iniciar 3-2-1. Girar nela = explosão imediata.','Aku Aku absorve dano. A caixa C ativa o checkpoint e salva automaticamente.','100 frutas concedem +1 vida. Complete a fase sem morrer para um troféu.'];lines.forEach((t,i)=>x.fillText('• '+t,155,215+i*39));x.fillStyle='#a9cdb5';x.font='15px Arial';x.fillText('Controles ('+inputBrand()+'): '+moveHint()+' andar • '+actionHint('down')+' agachar • '+actionHint('jump')+' pular • '+actionHint('spin')+' girar',155,462);button(375,500,210,38,'VOLTAR',false);x.textAlign='left'}
function drawControls(){panel(115,118,730,385,.96);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 30px Arial';x.fillText('CONFIGURAR CONTROLES',W/2,155);button(260,172,205,38,'TECLADO',configTab===0);button(495,172,205,38,'GAMEPAD',configTab===1);const acts=[['left','ESQUERDA'],['right','DIREITA'],['down','AGACHAR/SLIDE'],['jump','PULAR'],['spin','GIRAR'],['pause','PAUSAR']];x.textAlign='left';acts.forEach((a,i)=>{let yy=232+i*39;x.fillStyle=configIndex===i?'#ffd65a':'#e7f1e8';x.font='bold 17px Arial';x.fillText(a[1],245,yy);x.textAlign='right';let val=configTab===0?keyName(keybinds[a[0]]):(a[0]==='jump'?padButtonName(padbinds.jump):a[0]==='spin'?padButtonName(padbinds.spin):a[0]==='pause'?padButtonName(padbinds.pause):'D-PAD / ANALÓGICO');x.fillStyle='#bfe6d0';x.fillText(val,700,yy);x.textAlign='left'});x.textAlign='center';x.font='14px Arial';x.fillStyle=captureAction?'#ffcf55':'#aac9b0';x.fillText(captureAction?(captureType==='keyboard'?'Pressione a nova tecla...':'Pressione um botão do '+inputBrand()+'...'):(connectedPad()?'D-PAD seleciona • '+confirmHint()+' redefine • '+backHint()+' volta • '+deleteHint()+' restaura':'↑ ↓ seleciona • ← → troca aba • ENTER redefine ação • R restaura padrão'),W/2,478);button(375,500,210,38,'VOLTAR',false)}
function drawTrophies(){panel(105,118,750,385,.96);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 31px Arial';x.fillText('TROFÉUS',W/2,155);let all={};for(let i=1;i<=3;i++){const t=readSlot(i).trophies||{};Object.assign(all,t)}const defs=trophyDefs();defs.forEach((t,i)=>{let yy=205+i*39,got=!!all[t[0]];x.textAlign='left';x.font='bold 17px Arial';x.fillStyle=got?'#ffe475':'#72807a';x.fillText(got?'🏆 '+t[1]:'🔒 '+t[1],165,yy);x.font='13px Arial';x.fillStyle=got?'#bdd8c2':'#66736d';x.fillText(t[2],475,yy)});x.textAlign='center';x.fillStyle='#9dc4a8';x.font='14px Arial';x.fillText(Object.keys(all).length+'/'+defs.length+' conquistados',W/2,482);button(375,500,210,38,'VOLTAR',false)}
function drawCredits(){panel(190,145,580,315,.95);x.textAlign='center';x.fillStyle='#ffd45d';x.font='bold 34px Arial';x.fillText('ILHA SELVAGEM',W/2,200);x.fillStyle='#fff';x.font='18px Arial';x.fillText('Fangame de plataforma • versão 0.8',W/2,238);x.fillStyle='#bcd8c3';x.font='15px Arial';x.fillText('Sistema atual: 3 saves • auto-save • controles • troféus • AssetManager',W/2,280);x.fillText('Fases 1–5: selva, templo, pântano, gelo e Cânion Rubro • inimigos e tiles próprios',W/2,312);x.fillStyle='#8fb59a';x.fillText('Projeto em desenvolvimento',W/2,350);button(375,395,210,42,'VOLTAR',false)}
function menu(){bg();uiButtons=[];x.save();x.fillStyle='rgba(0,9,6,.46)';x.fillRect(0,0,W,H);const vg=x.createLinearGradient(0,0,0,H);vg.addColorStop(0,'rgba(0,0,0,.08)');vg.addColorStop(.72,'rgba(0,0,0,.15)');vg.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=vg;x.fillRect(0,0,W,H);x.restore();if(menuSub==='main')drawMainMenu();else{ x.save();x.fillStyle='rgba(0,8,5,.68)';x.fillRect(0,0,W,H);x.restore();x.textAlign='center';x.fillStyle='#ffd24a';x.font='900 34px Arial';x.fillText('CRASH BANDICOOT — FÃ GAME',W/2,50);if(menuSub==='new'||menuSub==='load')drawSlots(menuSub);else if(menuSub==='how')drawHow();else if(menuSub==='config')drawControls();else if(menuSub==='trophies')drawTrophies();else drawCredits()}if(saveNotice){x.textAlign='center';x.font='bold 13px Arial';x.fillStyle='#ffe17a';x.fillText(saveNotice,W/2,535)}x.textAlign='left'}
function drawPauseMenu(){uiButtons=[];x.fillStyle='#00110cd8';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffd15b';x.font='bold 46px Arial';x.fillText('PAUSADO',W/2,93);x.fillStyle='#d8f1df';x.font='16px Arial';x.fillText(currentLevelName+' • SLOT '+(activeSlot||'—'),W/2,120);panel(315,140,330,350,.95);const opts=[['CONTINUAR','Voltar ao jogo'],['SALVAR JOGO','Salvar no Slot '+(activeSlot||'—')],['CONTROLES','Ver configuração atual'],['REINICIAR FASE','Recomeçar a fase'],['MENU PRINCIPAL','Salvar e sair']];opts.forEach((o,i)=>button(360,165+i*61,240,46,o[0],pauseIndex===i,o[1]));x.font='13px Arial';x.fillStyle='#b9d4c0';x.fillText((connectedPad()?'D-PAD':'↑ ↓')+' escolher • '+confirmHint()+' confirmar • '+actionHint('pause')+' continuar',W/2,516);x.textAlign='left'}
function end(title,sub){uiButtons=[];bg();x.fillStyle='#00140fd9';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle=title.includes('CONCLUÍDA')?'#ffe66d':'#ff7a68';x.font='bold 52px Arial';x.fillText(title,W/2,150);x.fillStyle='#fff';x.font='24px Arial';x.fillText(sub,W/2,200);panel(260,235,440,150,.92);x.font='20px Arial';x.fillText(`Pontos: ${score}   Frutas: ${fruits}`,W/2,285);x.fillText(`Caixas: ${boxesBroken}/${normal.length+tnts.length}`,W/2,320);button(375,405,210,52,'VOLTAR AO MENU',true);x.textAlign='left'}
function fmtTime(v){let m=Math.floor(v/60),ss=Math.floor(v%60);return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')}
function results(){uiButtons=[];bg();x.fillStyle='#00110ed9';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffc83d';x.font='bold 48px Arial';x.fillText('FASE '+currentLevel+' COMPLETA!',W/2,64);x.fillStyle=currentLevel===4?'#a9e9ff':currentLevel===3?'#b4db58':'#7ee35a';x.font='bold 24px Arial';x.fillText(currentLevelName,W/2,96);panel(175,115,610,300,.95);x.textAlign='left';x.font='bold 25px Arial';const rows=[['CAIXAS',boxesBroken+'/'+(normal.length+tnts.length)],['FRUTAS',fruits],['MORTES',deaths],['TEMPO',fmtTime(levelTime)],['GEMA',resultGem?'💎 OBTIDA':'🔒 NÃO OBTIDA']];rows.forEach((r,i)=>{let yy=164+i*46;x.fillStyle='#ffffff';x.fillText(r[0],235,yy);x.textAlign='right';x.fillStyle=i===4?(resultGem?'#7fe9ff':'#ff7b69'):'#ffe28a';x.fillText(String(r[1]),725,yy);x.textAlign='left'});x.textAlign='center';x.font='bold 18px Arial';x.fillStyle=resultGem?'#7fe9ff':'#ffcf55';x.fillText(resultGem?'💎 GEMA DE '+currentLevelName:'Quebre todas as caixas (incluindo TNT) para obter a gema.',W/2,390);button(245,445,210,54,'REJOGAR',false,connectedPad()?extraHint():'R');button(505,445,210,54,'CONTINUAR',true,confirmHint());x.textAlign='left'}
function levelSelect(){
 uiButtons=[];
 // céu 16-bit e ilha suspensa em estilo mapa clássico
 const sky=x.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#2597e7');sky.addColorStop(.68,'#8ad9f1');sky.addColorStop(1,'#e8fbff');x.fillStyle=sky;x.fillRect(0,0,W,H);
 // nuvens pixeladas
 x.save();x.globalAlpha=.78;x.fillStyle='#fff';for(let i=0;i<9;i++){const cx=(i*143+70)%W,cy=75+(i%3)*72;for(let j=0;j<5;j++)x.fillRect(cx+j*18,cy+(j%2)*7,38,18)}x.restore();
 x.textAlign='center';x.font='900 43px Arial';x.lineWidth=6;x.strokeStyle='#2a1505';x.strokeText('SELETOR DE FASES',W/2,53);x.fillStyle='#ffb52f';x.fillText('SELETOR DE FASES',W/2,53);
 // plataforma-mapa
 x.save();x.fillStyle='#d8a82e';x.strokeStyle='#4e3c12';x.lineWidth=8;x.beginPath();x.ellipse(W/2,335,405,168,0,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#6f8527';x.beginPath();x.ellipse(W/2,320,392,150,0,0,Math.PI*2);x.fill();x.fillStyle='#e4b73e';x.beginPath();x.ellipse(W/2,314,374,136,0,0,Math.PI*2);x.fill();x.restore();
 const sl=activeSlot?readSlot(activeSlot):blankSlot();const unlocked=Math.max(1,sl.levelsUnlocked||1);const levels=['ILHA SELVAGEM','TEMPLO PERDIDO','PÂNTANO SOMBRIO','PICOS CONGELADOS','CÂNION RUBRO','CAVERNA OCULTA','PONTE DO TOTEM','CACHOEIRAS','RUÍNAS ANTIGAS','CHEFE DA ILHA'];
 // preview central
 x.save();x.beginPath();x.arc(W/2,160,92,0,Math.PI*2);x.clip();if(bgImg&&bgImg.complete&&bgImg.naturalWidth)x.drawImage(bgImg,0,0,bgImg.naturalWidth,bgImg.naturalHeight,W/2-140,90,280,150);else{x.fillStyle='#245a38';x.fillRect(W/2-100,60,200,200)}x.restore();x.strokeStyle='#dff7ff';x.lineWidth=5;x.beginPath();x.arc(W/2,160,92,0,Math.PI*2);x.stroke();
 x.fillStyle='#142816dd';x.fillRect(W/2-135,244,270,35);x.strokeStyle='#88c33d';x.strokeRect(W/2-135,244,270,35);x.fillStyle='#ffe36a';x.font='900 18px Arial';x.fillText((levelSelectIndex+1)+' - '+levels[levelSelectIndex],W/2,268);
 // progresso à direita
 panel(742,77,190,160,.92);x.textAlign='left';x.fillStyle='#ffd85a';x.font='900 18px Arial';x.fillText('PROGRESSO',770,105);x.font='bold 14px Arial';x.fillStyle='#fff';x.fillText('🍎  '+(sl.fruits||0),770,137);x.fillText('📦  '+(sl.boxesBroken||0)+'/'+(normal.length+tnts.length),770,163);x.fillText('⏱  '+fmtTime(sl.levelTime||0),770,189);x.fillStyle=sl.gem?'#7feaff':'#a4adb0';x.fillText(sl.gem?'💎  GEMA OBTIDA':'◇  GEMA PENDENTE',770,215);
 // fases em duas linhas
 const pts=[];for(let i=0;i<10;i++){const row=i<5?0:1,col=i%5;const px=190+col*145,py=row?410:330;pts.push([px,py])}
 pts.forEach((pt,i)=>{const implemented=i<5,open=implemented&&i<unlocked,sel=i===levelSelectIndex; x.save();x.translate(pt[0],pt[1]);x.fillStyle=open?(sel?'#bf2d20':'#8f251f'):implemented?'#3e4345':'#30383a';x.strokeStyle=sel?'#ffe15b':open?'#e4b338':'#111';x.lineWidth=sel?5:3;x.beginPath();x.ellipse(0,0,50,23,0,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#f2cc45';x.fillRect(-46,19,92,8);x.fillStyle=open?'#fff':'#b9b9b9';x.font='900 24px Arial';x.fillText(String(i+1),0,8);if(!implemented){x.font='900 9px Arial';x.fillStyle='#ffd36a';x.fillText('EM BREVE',0,-9)}else if(!open){x.font='20px Arial';x.fillText('🔒',36,10)}if(sel&&i===0){ds(playerImg,sr.idle,-18,-74,36,54)}x.restore();uiButtons.push({x:pt[0]-55,y:pt[1]-32,w:110,h:65,label:'LEVEL_'+(i+1),level:i});});
 x.textAlign='center';x.fillStyle='#183218e8';x.fillRect(120,482,720,43);x.strokeStyle='#6f5421';x.lineWidth=3;x.strokeRect(120,482,720,43);x.fillStyle='#fff1bb';x.font='bold 14px Arial';x.fillText((connectedPad()?'D-PAD':'← →')+' SELECIONAR     '+confirmHint()+' ENTRAR     '+backHint()+' MENU     '+extraHint()+' TROFÉUS',W/2,509);x.textAlign='left';
}
function enterSelectedLevel(){const sl=activeSlot?readSlot(activeSlot):blankSlot();const unlocked=Math.max(1,sl.levelsUnlocked||1);if(levelSelectIndex>=5){toast='FASE '+(levelSelectIndex+1)+' • EM BREVE';toastT=1.8;return}if(levelSelectIndex>=unlocked){toast='FASE BLOQUEADA';toastT=1.2;return}setLevel(levelSelectIndex+1);start(false)}
function start(newGame=true){if(!assetManager.phaseReady(currentLevel)){ensurePhase(currentLevel,()=>startNow(newGame));return}bindPhaseAssets(currentLevel);startNow(newGame)}
function startNow(newGame=true){state='play';paused=false;menuSub='main';swingClock=0;score=0;fruits=0;lives=4;deaths=0;levelTime=0;deathAnim=0;portalSeq=0;resultGem=false;checkpoint=currentCheckpointDefault;checkpointAnim=0;aku=0;boxesBroken=0;normal.forEach(b=>{b.hit=false;b.breakT=0});boxFx.length=0;dustFx.length=0;enemyFx.length=0;impactFx.length=0;forcedDeathT=0;tnts.forEach(t=>{t.active=false;t.t=3;t.dead=false;t.blast=0});fruitList.forEach(f=>f.t=false);masks.forEach(m=>m.t=false);enemies.forEach(e=>e.dead=false);resetP();inv=0;if(newGame&&activeSlot){const old=readSlot(activeSlot);writeSlot(activeSlot,{...blankSlot(),empty:false,version:SAVE_VERSION,trophies:old.trophies||{},updated:Date.now(),currentLevel:1,phaseName:'ILHA SELVAGEM'});unlockTrophy('primeiro');saveGame(true)}}
function newGameAtSlot(i){activeSlot=i;setLevel(1);start(true)}
function chooseMain(){if(menuIndex===0){menuSub='new';slotIndex=0}else if(menuIndex===1){menuSub='load';slotIndex=0}else if(menuIndex===2)menuSub='how';else if(menuIndex===3){menuSub='config';configTab=0;configIndex=0}else if(menuIndex===4)menuSub='trophies';else menuSub='credits'}
function choosePause(){if(pauseIndex===0)paused=false;else if(pauseIndex===1)saveGame(false);else if(pauseIndex===2){paused=false;state='menu';menuSub='config';configTab=0;configIndex=0;saveGame(true)}else if(pauseIndex===3)start(false);else{saveGame(true);paused=false;state='menu';menuSub='main';menuIndex=0}}
function menuBack(){captureAction=null;captureType=null;if(menuSub==='main')return;menuSub='main';menuIndex=0}
function handleMenuKey(e){if(menuSub==='main'){if(e.code==='ArrowUp'||e.code==='KeyW')menuIndex=(menuIndex+5)%6;else if(e.code==='ArrowDown'||e.code==='KeyS')menuIndex=(menuIndex+1)%6;else if(e.code==='Enter'||e.code==='Space')chooseMain();return}if(menuSub==='new'||menuSub==='load'){if(e.code==='ArrowUp'||e.code==='KeyW')slotIndex=(slotIndex+2)%3;else if(e.code==='ArrowDown'||e.code==='KeyS')slotIndex=(slotIndex+1)%3;else if(e.code==='Delete'){deleteSlot(slotIndex+1);saveNotice='Slot '+(slotIndex+1)+' apagado'}else if(e.code==='Enter'||e.code==='Space'){const i=slotIndex+1;if(menuSub==='new')newGameAtSlot(i);else if(!applySave(i)){saveNotice='Slot '+i+' está vazio';toast=saveNotice;toastT=1.5}}else if(e.code==='Escape')menuBack();return}if(menuSub==='config'){if(captureAction)return;if(e.code==='ArrowLeft'||e.code==='ArrowRight'){configTab=1-configTab}else if(e.code==='ArrowUp'||e.code==='KeyW')configIndex=(configIndex+5)%6;else if(e.code==='ArrowDown'||e.code==='KeyS')configIndex=(configIndex+1)%6;else if(e.code==='KeyR'){if(configTab===0){keybinds={...DEFAULT_KEYS};try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds))}catch(_){ }}else{padbinds={...DEFAULT_PAD};try{localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){ }}}else if(e.code==='Enter'||e.code==='Space'){const a=['left','right','down','jump','spin','pause'][configIndex];if(configTab===0){captureAction=a;captureType='keyboard'}else if(['jump','spin','pause'].includes(a)){captureAction=a;captureType='gamepad'}}else if(e.code==='Escape')menuBack();return}if(e.code==='Escape'||e.code==='Enter')menuBack()}
addEventListener('keydown',e=>{if(capturedKeyCode===e.code){capturedKeyCode=null;return}if(captureType==='keyboard'&&captureAction)return;if(['ArrowUp','ArrowDown','Enter','Escape',keybinds.pause].includes(e.code))e.preventDefault();if(state==='menu'){handleMenuKey(e);return}if(state==='results'){if(e.code==='KeyR'){start(false);return}if(e.code==='Enter'){saveGame(true);levelSelectIndex=0;state='levelselect';return}if(e.code==='Escape'){saveGame(true);state='menu';menuSub='main';return}}if(state==='levelselect'){if(e.code==='ArrowLeft'||e.code==='KeyA')levelSelectIndex=(levelSelectIndex+9)%10;else if(e.code==='ArrowRight'||e.code==='KeyD')levelSelectIndex=(levelSelectIndex+1)%10;else if(e.code==='Enter'||e.code==='Space')enterSelectedLevel();else if(e.code==='KeyX') {state='menu';menuSub='trophies'} else if(e.code==='Escape'){state='menu';menuSub='main'}return}if(state==='gameover'||state==='win'){if(e.code==='Enter'||e.code==='Escape'){saveGame(true);state='menu'}return}if(state==='play'&&e.code===keybinds.pause){paused=!paused;pauseIndex=0;return}if(state==='play'&&paused){if(e.code==='ArrowUp'||e.code==='KeyW')pauseIndex=(pauseIndex+4)%5;else if(e.code==='ArrowDown'||e.code==='KeyS')pauseIndex=(pauseIndex+1)%5;else if(e.code==='Enter'||e.code==='Space')choosePause();else if(e.code==='Escape')paused=false;return}});
function canvasPos(ev){const r=c.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height}}
let syncTouchUI=()=>{};
function setupTouchControls(){
 const root=document.getElementById('touch-controls'),joy=document.getElementById('touch-joystick'),knob=document.getElementById('joystick-knob');
 if(!root||!joy||!knob)return;
 const actionPointers=new Map();let joyPointer=null,joyCenter={x:0,y:0},lastVisible=false;
 const isTouchDevice=()=>matchMedia('(pointer:coarse)').matches||matchMedia('(hover:none)').matches||navigator.maxTouchPoints>0;
 const haptic=(ms=7)=>{try{navigator.vibrate?.(ms)}catch(_){}};
 const set=(action,value)=>{if(action in touchState)touchState[action]=value};
 const resetActions=()=>{actionPointers.clear();joyPointer=null;for(const k of Object.keys(touchState))touchState[k]=false;knob.style.transform='translate3d(0,0,0)';joy.classList.remove('active');root.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed'))};
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
   const b=ev.target.closest('[data-action]');if(!b)return;ev.preventDefault();const action=b.dataset.action;actionPointers.set(ev.pointerId,{action,b});set(action,true);b.classList.add('pressed');b.setPointerCapture?.(ev.pointerId);haptic(action==='jump'?9:6)
 };
 const releaseAction=ev=>{
   const item=actionPointers.get(ev.pointerId);if(!item)return;ev.preventDefault();actionPointers.delete(ev.pointerId);if(![...actionPointers.values()].some(v=>v.action===item.action))set(item.action,false);if(![...actionPointers.values()].some(v=>v.b===item.b))item.b.classList.remove('pressed')
 };
 root.addEventListener('pointerdown',ev=>{const pause=ev.target.closest('[data-ui-action="pause"]');if(pause){ev.preventDefault();if(state==='play'&&!paused){paused=true;pauseIndex=0;pause.classList.add('pressed');haptic(10)}return}pressAction(ev)},{passive:false});
 root.addEventListener('pointerup',ev=>{const pause=ev.target.closest('[data-ui-action="pause"]');if(pause)pause.classList.remove('pressed');releaseAction(ev)},{passive:false});
 root.addEventListener('pointercancel',releaseAction,{passive:false});root.addEventListener('lostpointercapture',releaseAction,{passive:false});
 root.addEventListener('contextmenu',ev=>ev.preventDefault());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetActions()});
 addEventListener('blur',resetActions);
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
  if(!hit)return;
  if(state==='menu'){
    if(hit.label==='VOLTAR'){menuBack();return}
    if(menuSub==='main'){
      const idx=['NEW GAME','LOAD GAME','COMO JOGAR','CONTROLES','TROFÉUS','CRÉDITOS'].indexOf(hit.label);
      if(idx>=0){menuIndex=idx;chooseMain()}
    }else if(menuSub==='new'||menuSub==='load'){
      if(hit.slot){slotIndex=hit.slot-1;if(menuSub==='new')newGameAtSlot(hit.slot);else if(!applySave(hit.slot)){toast='Slot vazio';toastT=1}}
    }else if(menuSub==='config'){
      if(hit.label==='TECLADO')configTab=0;else if(hit.label==='GAMEPAD')configTab=1;
    }
  }else if(state==='play'&&paused){
    const idx=['CONTINUAR','SALVAR JOGO','CONTROLES','REINICIAR FASE','MENU PRINCIPAL'].indexOf(hit.label);
    if(idx>=0){pauseIndex=idx;choosePause()}
  }else if(state==='results'){
    if(hit.label==='REJOGAR')start(false);
    else if(hit.label==='CONTINUAR'){saveGame(true);levelSelectIndex=0;state='levelselect'}
  }else if(state==='levelselect'){if(hit.level!==undefined){levelSelectIndex=hit.level;enterSelectedLevel()}}else if(state==='gameover'||state==='win'){state='menu'}
});
let prevPadPause=false,prevPadButtons=[],prevPadAxes={u:false,d:false,l:false,r:false};
function gamepadUI(){
 const g=connectedPad();if(!g){prevPadButtons=[];prevPadAxes={u:false,d:false,l:false,r:false};return}
 const now=g.buttons.map(b=>!!b.pressed);
 const edge=i=>!!now[i]&&!prevPadButtons[i];
 const up=!!g.buttons[12]?.pressed||g.axes[1]<-.55,down=!!g.buttons[13]?.pressed||g.axes[1]>.55,left=!!g.buttons[14]?.pressed||g.axes[0]<-.55,right=!!g.buttons[15]?.pressed||g.axes[0]>.55;
 const eu=up&&!prevPadAxes.u,ed=down&&!prevPadAxes.d,el=left&&!prevPadAxes.l,er=right&&!prevPadAxes.r;
 if(captureType==='gamepad'&&captureAction){for(let i=0;i<g.buttons.length;i++){if(edge(i)){padbinds[captureAction]=i;captureAction=null;captureType=null;try{localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){ }toast=inputBrand()+' atualizado!';toastT=1;break}}}
 else if(state==='menu'){
   if(menuSub==='main'){if(eu)menuIndex=(menuIndex+5)%6;if(ed)menuIndex=(menuIndex+1)%6;if(edge(0))chooseMain()}
   else if(menuSub==='new'||menuSub==='load'){if(eu)slotIndex=(slotIndex+2)%3;if(ed)slotIndex=(slotIndex+1)%3;if(edge(3)){deleteSlot(slotIndex+1);saveNotice='Slot '+(slotIndex+1)+' apagado'}if(edge(0)){const i=slotIndex+1;if(menuSub==='new')newGameAtSlot(i);else if(!applySave(i)){toast='Slot '+i+' está vazio';toastT=1.3}}if(edge(1))menuBack()}
   else if(menuSub==='config'){if(el||er)configTab=1-configTab;if(eu)configIndex=(configIndex+5)%6;if(ed)configIndex=(configIndex+1)%6;if(edge(3)){if(configTab===0)keybinds={...DEFAULT_KEYS};else padbinds={...DEFAULT_PAD};try{localStorage.setItem('crashV05Keybinds',JSON.stringify(keybinds));localStorage.setItem('crashV05Padbinds',JSON.stringify(padbinds))}catch(_){}}if(edge(0)){const a=['left','right','down','jump','spin','pause'][configIndex];if(configTab===1&&['jump','spin','pause'].includes(a)){captureAction=a;captureType='gamepad'}}if(edge(1))menuBack()}
   else if(edge(1)||edge(0))menuBack();
 }else if(state==='results'){if(edge(2))start(false);else if(edge(0)){saveGame(true);levelSelectIndex=0;state='levelselect'}else if(edge(1)){saveGame(true);state='menu';menuSub='main'}}
 else if(state==='levelselect'){if(el)levelSelectIndex=(levelSelectIndex+9)%10;if(er)levelSelectIndex=(levelSelectIndex+1)%10;if(edge(0))enterSelectedLevel();if(edge(2)){state='menu';menuSub='trophies'}if(edge(1)){state='menu';menuSub='main'}}
 else if(state==='gameover'||state==='win'){if(edge(0)||edge(1)){saveGame(true);state='menu';menuSub='main'}}
 const pp=!!g.buttons[padbinds.pause]?.pressed;if(pp&&!prevPadPause&&state==='play'){if(!paused){paused=true;pauseIndex=0}else paused=false}
 if(state==='play'&&paused){if(eu)pauseIndex=(pauseIndex+4)%5;if(ed)pauseIndex=(pauseIndex+1)%5;if(edge(0))choosePause();if(edge(1))paused=false}
 prevPadPause=pp;prevPadButtons=now;prevPadAxes={u:up,d:down,l:left,r:right};refreshHelp();
}
function loadingScreen(){x.fillStyle='#07151d';x.fillRect(0,0,W,H);if(menuLogoImg&&menuLogoImg.complete&&menuLogoImg.naturalWidth){x.globalAlpha=.9;x.drawImage(menuLogoImg,W/2-175,42,350,158);x.globalAlpha=1}x.textAlign='center';x.fillStyle='#ffd45d';x.font='900 27px Arial';x.fillText(loadingText,W/2,260);x.fillStyle='#102a31';x.fillRect(190,300,580,28);x.strokeStyle='#73d7c2';x.lineWidth=2;x.strokeRect(190,300,580,28);x.fillStyle='#75d9c4';x.fillRect(194,304,572*Math.max(0,Math.min(1,loadingProgress)),20);x.fillStyle='#d9f5ee';x.font='bold 15px Arial';x.fillText(Math.round(loadingProgress*100)+'%',W/2,352);x.fillStyle='#8fb5ad';x.font='13px Arial';x.fillText('Carregamento sob demanda • assets compartilhados ficam em cache',W/2,386);if(loadingError){x.fillStyle='#ff8585';x.fillText(loadingError,W/2,420)}x.textAlign='left'}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;gamepadUI();update(dt);syncTouchUI();if(state==='menu')menu();else if(state==='loading')loadingScreen();else if(state==='play')draw();else if(state==='results')results();else if(state==='levelselect')levelSelect();else if(state==='win')end('FASE CONCLUÍDA!','Você atravessou '+currentLevelName+'!');else end('GAME OVER','Tente novamente e chegue ao fim da fase.');requestAnimationFrame(loop)}
async function bootstrap(){try{await assetManager.loadGroup('core',p=>loadingProgress=p);bindCoreAssets();state='menu'}catch(err){loadingError=String(err?.message||err);state='menu'}requestAnimationFrame(loop)}bootstrap();
})();
