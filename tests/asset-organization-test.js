const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const runtimeFiles=['js/game.js','js/jungle-phase.js','js/level-loader.js','js/final-boss.js','index.html','manifest.webmanifest'];
const refs=new Set();
for(const file of runtimeFiles){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of source.matchAll(/assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpg|wav|mp4)/g))refs.add(match[0]);
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)])}
const media=walk(path.join(root,'assets')).map(file=>path.relative(root,file).replaceAll('\\','/')).filter(file=>/\.(?:webp|png|jpg|wav|mp4)$/.test(file));
const missing=[...refs].filter(file=>!fs.existsSync(path.join(root,file)));
const unused=media.filter(file=>!refs.has(file));
const hashes=new Map(),duplicates=[];
for(const file of media){const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');if(hashes.has(hash))duplicates.push([hashes.get(hash),file]);else hashes.set(hash,file)}
const pngOutsideIcons=media.filter(file=>file.endsWith('.png')&&!file.startsWith('assets/ui/icons/'));
if(missing.length||unused.length||duplicates.length||pngOutsideIcons.length){
 console.error('FAIL',{missing,unused,duplicates,pngOutsideIcons});process.exit(1);
}
console.log(`PASS: ${media.length} mídias organizadas; ${refs.size} referências válidas; zero arquivos repetidos ou sem uso; PNG somente nos ícones PWA.`);
