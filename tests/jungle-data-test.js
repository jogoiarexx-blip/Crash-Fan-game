const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/jungle-phase.js'),'utf8'),ctx);
const A=ctx.window.JUNGLE_ASSETS,P=ctx.window.JUNGLE_COLLISION_PROFILES,L=ctx.window.JUNGLE_LEVEL_DATA,G=ctx.window.JUNGLE_GAMEPLAY_DATA,S=ctx.window.JUNGLE_SCALE;
const fail=[]; const ok=(c,m)=>{if(!c)fail.push(m)};
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/jungle/manifest.json'),'utf8'));
ok(manifest.assets.length===36,'manifest deve conter 36 assets');
ok(S===0.72,'escala global da floresta deve ser 0.72');
for(const [k,a] of Object.entries(A)){const f=path.join(root,a.file);ok(fs.existsSync(f),`asset ausente ${k}: ${a.file}`);const mm=manifest.assets.find(v=>v.id===a.id);ok(!!mm,`asset ${a.id} não está no manifest`);ok(mm&&mm.width===a.width&&mm.height===a.height,`dimensão divergente no manifest: ${a.id}`);ok(mm&&mm.role,`função/role ausente no manifest: ${a.id}`)}
const used=new Set(); for(const layer of ['background','terrain','back','objects','front']) for(const e of L[layer]||[]) used.add(e.asset);
for(const k of Object.keys(A)) ok(used.has(k),`asset não utilizado na fase: ${k}`);
const platforms=[],slopes=[];
for(const e of L.terrain){const a=A[e.asset],p=P[e.asset];ok(!!a&&!!p,`perfil ausente ${e.asset}`);if(!a||!p)continue;
 if(e.collision==='slopeDown'){const l=e.x+p.left*S,r=e.x+(a.width-p.right)*S;slopes.push({l,r,y1:e.surfaceY,y2:e.surfaceY+(p.rightTop-p.leftTop)*S})}
 else if(e.collision==='steps'||e.collision==='stepsUp'){for(const seg of p.segments)platforms.push({x:e.x+seg[0]*S,y:e.surfaceY+seg[1]*S,w:seg[2]*S,oneWay:false,asset:e.asset})}
 else if(e.collision==='solid'||e.collision==='oneWay') platforms.push({x:e.x+p.left*S,y:e.surfaceY,w:(a.width-p.left-p.right)*S,oneWay:e.collision==='oneWay',asset:e.asset});
}
function supported(x,y,w=58){return platforms.some(p=>x>=p.x-2&&x+w<=p.x+p.w+2&&Math.abs(y-p.y)<=3)}
for(const [x,y] of G.boxes) ok(supported(x,y),`caixa sem apoio em ${x},${y}`);
for(const [x,y] of G.tnts) ok(supported(x,y),`TNT sem apoio em ${x},${y}`);
const allCrates=[...G.boxes.map(v=>({x:v[0],y:v[1]-58,w:58,h:58,t:'box'})),...G.tnts.map(v=>({x:v[0],y:v[1]-58,w:58,h:58,t:'tnt'}))];
for(let i=0;i<allCrates.length;i++)for(let j=i+1;j<allCrates.length;j++){const a=allCrates[i],b=allCrates[j];ok(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),`caixas/TNT sobrepostas em ${a.x} e ${b.x}`)}
for(const e of G.enemies){const w=e.type==='armadillo'?84:70;if(e.followSlope){const sl=slopes.find(s=>e.a>=s.l&&e.b+w<=s.r+2);ok(!!sl,`inimigo de rampa sai da rampa: ${e.x}`)}else{const p=platforms.find(p=>e.a>=p.x-2&&e.b+w<=p.x+p.w+2&&Math.abs(e.surfaceY-p.y)<=3);ok(!!p,`patrulha sem apoio: ${e.x}`)}}
const bridges=platforms.filter(p=>p.oneWay);ok(bridges.length>=3,'esperadas pontes atravessáveis por baixo');ok(slopes.length===1,'esperada exatamente uma rampa inclinada');if(slopes[0]){ok(slopes[0].y2>slopes[0].y1,'rampa deve descer suavemente da esquerda para direita');for(const t of [0,.25,.5,.75,1]){const y=slopes[0].y1+(slopes[0].y2-slopes[0].y1)*t;ok(Number.isFinite(y),'superfície da rampa inválida')}}
const categories=new Set(Object.values(A).map(a=>a.category));for(const c of ['platform','terrain','slope','bridge','climbable','decoration','environment','object'])ok(categories.has(c),`categoria ausente ${c}`);
for(const e of [...L.background,...L.back,...L.front]) ok(!e.collision||e.collision==='none',`decoração criou colisão invisível: ${e.asset}`);
ok(L.background.some(e=>e.asset==='waterfall'),'cachoeira deve estar no background');ok(!P.waterfall,'cachoeira não deve ter perfil sólido');
const sign=L.objects.find(e=>e.asset==='signRight'),torch=L.objects.find(e=>e.asset==='torch'),totem=L.objects.find(e=>e.asset==='totem');ok(sign&&sign.collision==='none','placa deve ser decorativa');ok(torch&&torch.animated==='torch','tocha deve usar animação de luz');ok(totem&&totem.collision==='obstacle','totem deve usar obstáculo opcional coerente');
const css=fs.readFileSync(path.join(root,'css/style.css'),'utf8');ok(css.includes('image-rendering:pixelated')&&css.includes('image-rendering:crisp-edges'),'CSS pixel art ausente');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');ok(game.includes('x.imageSmoothingEnabled=false'),'Canvas smoothing não desativado');ok(game.includes("drawJungleLayer('background')")&&game.includes("drawJungleLayer('front')"),'ordem central de desenho da floresta ausente');ok(game.includes('jungleSlopeUnder'),'colisão inclinada não integrada à física');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');ok(index.indexOf('js/jungle-phase.js')<index.indexOf('js/game.js'),'registro de jungle assets deve carregar antes do game.js');ok(fs.existsSync(path.join(root,'INICIAR-JOGO.bat')),'launcher de dois cliques ausente');ok(css.includes('#touch-controls'),'controles mobile removidos');
if(fail.length){console.error('FAIL');for(const f of fail)console.error('-',f);process.exit(1)}
console.log(`OK: ${Object.keys(A).length}/36 assets carregáveis e usados; ${platforms.length} superfícies; ${bridges.length} pontes one-way; ${slopes.length} rampa; caixas/TNT sem sobreposição; patrulhas apoiadas; mobile/launcher preservados.`);
