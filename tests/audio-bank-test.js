const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),audioDir=path.join(root,'assets','audio');
const files=fs.readdirSync(audioDir).filter(f=>f.endsWith('.wav')).sort();
if(files.length!==32)throw new Error('quantidade inesperada de WAV: '+files.length);
const hashes=new Set();
for(const file of files){
 const b=fs.readFileSync(path.join(audioDir,file));
 if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE')throw new Error(file+' não é WAV válido');
 const channels=b.readUInt16LE(22),rate=b.readUInt32LE(24),bits=b.readUInt16LE(34),bytes=b.readUInt32LE(40),duration=bytes/(rate*channels*(bits/8));
 if(channels!==1||rate!==22050||bits!==16)throw new Error(file+' fora do padrão mono 22.05 kHz/16-bit');
 if((file.startsWith('music_phase')||file==='music_boss_guardian.wav')&&Math.abs(duration-16)>.01)throw new Error(file+' não possui loop de 16 s');
 if(file==='invincible_layer.wav'&&Math.abs(duration-8)>.01)throw new Error('camada de invencibilidade não possui 8 s');
 if(!file.startsWith('music_phase')&&file!=='music_boss_guardian.wav'&&file!=='invincible_layer.wav'&&(duration<.12||duration>1.7))throw new Error(file+' com duração inadequada');
 let peak=0,sum=0;for(let i=44;i+1<b.length;i+=2){const v=b.readInt16LE(i);peak=Math.max(peak,Math.abs(v));sum+=v*v}
 const rms=Math.sqrt(sum/Math.max(1,(b.length-44)/2));if(peak<5000||peak>32766||rms<300)throw new Error(file+' silencioso ou clipado');
 if(Math.abs(b.readInt16LE(44))>700||Math.abs(b.readInt16LE(b.length-2))>700)throw new Error(file+' pode estalar no início/fim');
 const hash=crypto.createHash('sha256').update(b).digest('hex');if(hashes.has(hash))throw new Error('áudio duplicado: '+file);hashes.add(hash);
}
const game=fs.readFileSync(path.join(root,'js','game.js'),'utf8');
if(!game.includes('sfxPools=new Map()')||!game.includes('SFX_GAIN='))throw new Error('pool ou mixagem individual de SFX ausente');
console.log(`PASS: ${files.length} WAV válidos, distintos, normalizados e sem bordas propensas a estalo.`);
