const fs=require('fs');
const path=require('path');

const RATE=22050,TAU=Math.PI*2,OUT=path.join(__dirname,'..','assets','audio');
let noiseState=0x51f15e;
const clamp=v=>Math.max(-1,Math.min(1,v));
const midi=n=>440*Math.pow(2,(n-69)/12);
const noise=()=>{noiseState=(noiseState*1664525+1013904223)>>>0;return noiseState/0xffffffff*2-1};
const osc=(kind,phase)=>kind==='tri'?2/Math.PI*Math.asin(Math.sin(phase)):kind==='square'?Math.tanh(Math.sin(phase)*5):Math.sin(phase);

function save(name,samples,target=.9){
 let mean=0,peak=0;for(const v of samples)mean+=v;mean/=samples.length;
 for(let i=0;i<samples.length;i++){samples[i]-=mean;peak=Math.max(peak,Math.abs(samples[i]))}
 const gain=peak?target/peak:1,data=Buffer.alloc(samples.length*2);
 for(let i=0;i<samples.length;i++)data.writeInt16LE(Math.round(clamp(samples[i]*gain)*32767),i*2);
 const out=Buffer.alloc(44+data.length);out.write('RIFF',0);out.writeUInt32LE(36+data.length,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(RATE,24);out.writeUInt32LE(RATE*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(data.length,40);data.copy(out,44);
 fs.writeFileSync(path.join(OUT,name),out);
}
function effect(name,duration,fn,target=.9){
 const n=Math.round(duration*RATE),a=new Float64Array(n);
 for(let i=0;i<n;i++){const t=i/RATE,edge=Math.min(1,t/.006,(duration-t)/.012);a[i]=fn(t,duration)*Math.max(0,edge)}save(name,a,target);
}
const sweep=(t,f0,f1,d)=>Math.sin(TAU*(f0*t+(f1-f0)*t*t/(2*d)));

effect('jump.wav',.30,(t,d)=>Math.exp(-t*7)*(sweep(t,260,760,d)*.72+Math.sin(TAU*(520+260*t/d)*t)*.18));
effect('spin.wav',.34,(t,d)=>{const e=Math.sin(Math.PI*t/d);return noise()*e*.38+Math.sin(TAU*(155+35*Math.sin(TAU*t*12))*t)*e*.42});
effect('box.wav',.32,t=>noise()*Math.exp(-t*14)*.55+Math.sin(TAU*115*t)*Math.exp(-t*18)*.42);
effect('tnt_tick.wav',.16,t=>Math.sin(TAU*1250*t)*Math.exp(-t*32)*.72+noise()*Math.exp(-t*45)*.12);
effect('explosion.wav',.92,t=>noise()*Math.exp(-t*5.2)*.60+Math.sin(TAU*(74-38*Math.min(1,t/.7))*t)*Math.exp(-t*4)*.65,.94);
effect('fruit.wav',.25,(t,d)=>{const f=t<d*.48?880:1320;return Math.sin(TAU*f*t)*Math.exp(-t*7)*.72+Math.sin(TAU*f*2*t)*Math.exp(-t*11)*.12});
effect('aku.wav',.78,(t,d)=>{const f=330*Math.pow(2,t/d);return (Math.sin(TAU*f*t)*.48+Math.sin(TAU*f*1.5*t)*.22)*Math.sin(Math.PI*t/d)});
effect('checkpoint.wav',1.05,(t,d)=>{const notes=[60,64,67,72],q=Math.min(3,Math.floor(t/(d/4))),local=t-q*d/4;return Math.sin(TAU*midi(notes[q])*t)*Math.exp(-local*6)*.62+Math.sin(TAU*midi(notes[q]+12)*t)*Math.exp(-local*9)*.16});
effect('hurt.wav',.42,t=>noise()*Math.exp(-t*20)*.24+Math.sin(TAU*(175-95*Math.min(1,t/.35))*t)*Math.exp(-t*7)*.72);
effect('death.wav',1.15,(t,d)=>{const f=430*Math.pow(.25,t/d);return Math.sin(TAU*f*t)*Math.exp(-t*1.7)*.56+Math.sin(TAU*f*.5*t)*Math.exp(-t*2.3)*.28});
effect('enemy.wav',.30,(t,d)=>sweep(t,210,85,d)*Math.exp(-t*9)*.68+noise()*Math.exp(-t*24)*.18);
effect('portal.wav',1.65,(t,d)=>{const e=Math.sin(Math.PI*t/d),f=180+520*t/d;return e*(Math.sin(TAU*f*t)*.36+Math.sin(TAU*(f*1.51)*t)*.22+noise()*.08)});
effect('menu.wav',.13,t=>Math.sin(TAU*740*t)*Math.exp(-t*32)*.7+Math.sin(TAU*1110*t)*Math.exp(-t*45)*.18,.72);
effect('land.wav',.18,t=>Math.sin(TAU*88*t)*Math.exp(-t*25)*.66+noise()*Math.exp(-t*34)*.18,.78);

const SONGS=[
 {name:'music_phase1.wav',bpm:120,roots:[57,55,60,52],mel:[12,15,19,15,17,19,22,19],lead:'tri',mood:'jungle'},
 {name:'music_phase2.wav',bpm:105,roots:[50,48,53,45],mel:[12,13,19,17,12,10,8,7],lead:'bell',mood:'temple'},
 {name:'music_phase3.wav',bpm:90,roots:[52,50,47,45],mel:[12,15,13,10,12,8,7,3],lead:'reed',mood:'swamp'},
 {name:'music_phase4.wav',bpm:120,roots:[60,57,65,62],mel:[12,16,19,24,21,19,16,14],lead:'bell',mood:'ice'},
 {name:'music_phase5.wav',bpm:135,roots:[52,55,50,47],mel:[12,15,19,22,19,15,10,12],lead:'square',mood:'canyon'},
 {name:'music_phase6.wav',bpm:150,roots:[50,48,46,43],mel:[12,15,19,17,12,10,7,10],lead:'bell',mood:'avalanche'},
 {name:'music_phase7.wav',bpm:150,roots:[55,52,50,57],mel:[12,14,19,21,19,14,12,9],lead:'tri',mood:'polar'},
 {name:'music_phase8.wav',bpm:150,roots:[45,48,43,50],mel:[12,15,19,12,17,15,10,7],lead:'square',mood:'boulder'},
 {name:'music_phase9.wav',bpm:165,roots:[48,53,50,55],mel:[12,16,19,21,19,16,14,12],lead:'tri',mood:'boar'}
];
function makeSong(spec){
 const duration=16,n=RATE*duration,a=new Float64Array(n),beat=60/spec.bpm,eighth=beat/2;
 for(let i=0;i<n;i++){
  const t=i/RATE,bi=Math.floor(t/beat),si=Math.floor(t/eighth),bar=Math.floor(bi/4),bl=t%beat,sl=t%eighth;
  const root=spec.roots[bar%spec.roots.length],leadMidi=root+spec.mel[si%spec.mel.length],leadF=midi(leadMidi),bassF=midi(root-12);
  const leadEnv=Math.exp(-sl*(spec.lead==='bell'?7:11)),bassEnv=Math.exp(-bl*4.2);
  let lead=osc(spec.lead==='reed'?'square':spec.lead,TAU*leadF*t)*leadEnv*.14;
  if(spec.lead==='bell')lead+=(Math.sin(TAU*leadF*2.01*t)*.07+Math.sin(TAU*leadF*3.98*t)*.025)*Math.exp(-sl*9);
  if(spec.lead==='reed')lead=(Math.sin(TAU*leadF*t)*.12+osc('square',TAU*leadF*t)*.035)*leadEnv;
  const bass=(Math.sin(TAU*bassF*t)*.19+osc('tri',TAU*bassF*2*t)*.035)*bassEnv;
  const minor=spec.mood==='ice'||spec.mood==='polar'?4:3,pad=(Math.sin(TAU*midi(root)*t)+Math.sin(TAU*midi(root+minor)*t)+Math.sin(TAU*midi(root+7)*t))*.027;
  const kick=Math.sin(TAU*(76-25*Math.min(.08,bl))*bl)*Math.exp(-bl*22)*.24;
  const snare=(bi%4===1||bi%4===3)?noise()*Math.exp(-bl*18)*.095:0;
  const hat=noise()*Math.exp(-sl*55)*(si%2?.035:.055);
  let color=0;
  if(spec.mood==='jungle'||spec.mood==='boulder'||spec.mood==='boar')color=Math.sin(TAU*midi(root+24)*t)*Math.exp(-sl*18)*.045;
  else if(spec.mood==='ice'||spec.mood==='avalanche'||spec.mood==='polar')color=Math.sin(TAU*leadF*2.5*t)*Math.exp(-sl*14)*.035;
  else if(spec.mood==='swamp')color=Math.sin(TAU*(42+5*Math.sin(t*.7))*t)*.055;
  else if(spec.mood==='canyon')color=osc('square',TAU*bassF*2*t)*bassEnv*.035;
  else color=Math.sin(TAU*midi(root+19)*t)*Math.exp(-sl*5)*.04;
  const edge=Math.min(1,t/.012,(duration-t)/.012);a[i]=(lead+bass+pad+kick+snare+hat+color)*Math.max(0,edge);
 }
 save(spec.name,a,.82);
}
for(const song of SONGS)makeSong(song);

function makeInvincible(){
 const duration=8,n=RATE*duration,a=new Float64Array(n),beat=.25,notes=[72,76,79,84,79,76,86,84];
 for(let i=0;i<n;i++){const t=i/RATE,step=Math.floor(t/(beat/2)),local=t%(beat/2),f=midi(notes[step%notes.length]);const edge=Math.min(1,t/.01,(duration-t)/.01);a[i]=edge*(osc('square',TAU*f*t)*Math.exp(-local*13)*.13+Math.sin(TAU*midi(48+(Math.floor(t/2)%4)*2)*t)*.15+noise()*Math.exp(-(t%(beat/2))*48)*.035)}
 save('invincible_layer.wav',a,.78);
}
makeInvincible();
console.log('PASS: 14 efeitos, 9 músicas e 1 camada de invencibilidade gerados para V1.13.');
