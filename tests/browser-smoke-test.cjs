// QA em navegador real: carregamento, renderização, transições e screenshots das 10 fases.
// GitHub Actions instala puppeteer-core e usa o Google Chrome do runner.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const ROOT=path.resolve(__dirname,'..');
const SHOTS=path.join(ROOT,'qa-shots');fs.mkdirSync(SHOTS,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.mp4':'video/mp4','.json':'application/json','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 try{
  const uri=decodeURIComponent((req.url||'/').split('?')[0]);
  const name=uri==='/'?'/index.html':uri;
  const file=path.resolve(ROOT,'.'+name);
  if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  const stat=fs.statSync(file);if(!stat.isFile()){res.writeHead(404);return res.end()}
  const type=MIME[path.extname(file).toLowerCase()]||'application/octet-stream';
  const headers={'Content-Type':type,'Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=req.headers.range;
  if(range){const m=/bytes=(\d+)-(\d*)/.exec(range);if(m){const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),stat.size-1):stat.size-1;if(start>=stat.size||end<start){res.writeHead(416,{'Content-Range':'bytes */'+stat.size});return res.end()}res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${stat.size}`});return fs.createReadStream(file,{start,end}).pipe(res)}}
  res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(404);res.end('Not found')}
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 const port=server.address().port,base='http://127.0.0.1:'+port;
 const binaries=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome'];
 const chrome=process.env.CHROME_PATH||binaries.find(fs.existsSync);
 assert(chrome,'Nenhum Chrome instalado no runner');
 const errors=[],missing=[];
 try{
  browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage();page.setDefaultTimeout(45000);
  page.on('pageerror',err=>errors.push(String(err)));
  page.on('response',response=>{if(response.status()>=400&&new URL(response.url()).origin===base)missing.push({url:response.url().replace(base,''),status:response.status()})});
  await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.__crashDebug,{timeout:20000});
  for(let level=1;level<=10;level++){
   await page.evaluate(async n=>{await window.__crashDebug.loadLevel(n)},level);
   await sleep(130);
   const result=await page.evaluate(()=>{
    const state=window.__crashDebug.getState(),canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,colors=new Set();
    let opaque=0;for(let y=20;y<canvas.height;y+=27)for(let x=20;x<canvas.width;x+=29){const i=(y*canvas.width+x)*4;opaque+=pixels[i+3]>0?1:0;colors.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2])}
    return {state:state.state,mode:state.levelMode,level:state.currentLevel,colors:colors.size,opaque,loadingError:state.loadingError};
   });
   assert.equal(result.level,level,'fase diferente da solicitada');
   assert.equal(result.state,'play','fase '+level+' não iniciou: '+JSON.stringify(result));
   assert(result.colors>=10&&result.opaque>=100,'canvas parece vazio na fase '+level+': '+JSON.stringify(result));
   await page.screenshot({path:path.join(SHOTS,'fase-'+String(level).padStart(2,'0')+'.png')});
   console.log('BROWSER_PHASE_PASS',JSON.stringify(result));
  }
  await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.__crashDebug,{timeout:15000});
  const mobile=await page.evaluate(()=>{const canvas=document.querySelector('canvas'),r=canvas.getBoundingClientRect(),touch=document.getElementById('touch-controls'),s=getComputedStyle(touch);return{viewport:[innerWidth,innerHeight],canvas:[Math.round(r.width),Math.round(r.height)],canvasInViewport:r.width<=innerWidth+2,touchDisplay:s.display,touchVisibility:s.visibility}});
  assert(mobile.canvasInViewport,'canvas horizontalmente cortado no celular');
  await page.screenshot({path:path.join(SHOTS,'mobile-menu.png')});
  console.log('BROWSER_MOBILE',JSON.stringify(mobile));
  await page.evaluate(async()=>window.__crashDebug.loadLevel(1));
  await sleep(160);
  const mobilePlay=await page.evaluate(()=>{const root=document.getElementById('touch-controls'),jump=root.querySelector('.jump'),spin=root.querySelector('.spin'),r=jump.getBoundingClientRect();return{state:window.__crashDebug.getState().state,controls:getComputedStyle(root).display,jumpWidth:Math.round(r.width),spinWidth:Math.round(spin.getBoundingClientRect().width),viewWidth:innerWidth}});
  assert.equal(mobilePlay.state,'play','fase 1 não abriu em modo mobile');
  assert.equal(mobilePlay.controls,'block','controles virtuais não aparecem durante gameplay mobile');
  assert(mobilePlay.jumpWidth>=60&&mobilePlay.spinWidth>=60,'botões de toque muito pequenos');
  console.log('BROWSER_MOBILE_PLAY',JSON.stringify(mobilePlay));
  await page.screenshot({path:path.join(SHOTS,'mobile-fase-01.png')});
  await page.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await sleep(160);
  const landscape=await page.evaluate(()=>{const r=document.getElementById('game').getBoundingClientRect(),touch=document.getElementById('touch-controls');return{canvas:[Math.round(r.width),Math.round(r.height)],width:innerWidth,height:innerHeight,controls:getComputedStyle(touch).display}});
  assert(landscape.canvas[0]<=landscape.width+2&&landscape.canvas[1]<=landscape.height+2,'canvas cortado em paisagem');
  assert.equal(landscape.controls,'block','controles não aparecem em paisagem');
  console.log('BROWSER_MOBILE_LANDSCAPE',JSON.stringify(landscape));
  await page.screenshot({path:path.join(SHOTS,'mobile-paisagem-fase-01.png')});
  assert.equal(errors.length,0,'erros de execução: '+JSON.stringify(errors));
  assert.equal(missing.length,0,'arquivos HTTP ausentes: '+JSON.stringify(missing));
  console.log('BROWSER_SMOKE_PASS 10 fases + mobile');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error('BROWSER_SMOKE_FAIL',e);process.exitCode=1});
