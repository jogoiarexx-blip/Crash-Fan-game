const assert=require('assert');

global.window={};
require('../js/final-boss.js');
const B=global.window.FinalBoss;
if(!B)throw new Error('FinalBoss não foi exportado');

function makeApi(opts={}){
 const events={hits:[],sounds:[],bossHits:[],wins:0,shakes:[]};
 return{
  events,
  api:{
   player:opts.player||{x:40,y:350,w:46,h:78},
   attackRect:opts.attackRect||null,
   ground:455,
   hit:k=>events.hits.push(k),
   hitBoss:hp=>events.bossHits.push(hp),
   sound:n=>events.sounds.push(n),
   shake:v=>events.shakes.push(v),
   win:()=>events.wins++
  }
 };
}

{
 const s=B.create();
 assert.equal(s.maxHp,9);
 assert.equal(s.hp,9);
 assert.equal(s.phase,1);
 assert.equal(s.intro,4.2);
 const {api}=makeApi();
 B.update(s,4.3,api);
 assert.equal(s.intro,0);
 B.update(s,1.2,api);
 assert.equal(s.attack?.kind,'slam');
 B.update(s,.71,api);
 assert.equal(s.waves.length,2);
}

{
 const s=B.create();s.intro=0;s.nextAttack=0;s.attackIndex=1;
 const {api}=makeApi();
 B.update(s,.01,api);
 assert.equal(s.attack?.kind,'gem');
 B.update(s,.71,api);
 assert.equal(s.projectiles.length,3);
}

{
 const s=B.create();s.intro=0;s.hp=6;s.nextAttack=0;s.attackIndex=0;
 const {api}=makeApi();
 B.update(s,.01,api);
 assert.equal(s.phase,2);
 assert.equal(s.attack?.kind,'fire');
 B.update(s,.71,api);
 assert.equal(s.hazards.length,3);
 assert.ok(s.hazards.every(h=>h.kind==='fire'));
}

{
 const s=B.create();s.intro=0;s.hp=3;s.nextAttack=0;s.attackIndex=0;
 const {api}=makeApi();
 B.update(s,.01,api);
 assert.equal(s.phase,3);
 assert.equal(s.attack?.kind,'ice');
 B.update(s,.71,api);
 assert.equal(s.hazards.length,4);
 assert.ok(s.hazards.every(h=>h.kind==='ice'));
}

{
 const s=B.create();s.intro=0;s.vulnerable=1;s.nextAttack=99;
 const body={x:s.x+35,y:s.y+35,w:s.w-65,h:s.h-35};
 const {api,events}=makeApi({attackRect:body});
 B.update(s,.01,api);
 assert.equal(s.hp,8);
 assert.deepEqual(events.bossHits,[8]);
 assert.ok(s.invuln>0);
 assert.equal(s.vulnerable,0);
}

{
 const s=B.create();s.intro=0;s.nextAttack=99;s.vulnerable=0;s.invuln=0;
 const {api,events}=makeApi({player:{x:s.x+50,y:s.y+70,w:46,h:78}});
 B.update(s,.01,api);
 assert.ok(events.hits.includes('impact'));
}

{
 const s=B.create();s.intro=0;s.hp=1;s.vulnerable=1;s.nextAttack=99;
 s.projectiles.push({x:1,y:1,r:1,vx:0,vy:0,t:1,kind:'gem'});
 s.hazards.push({kind:'fire',x:1,w:20,warning:.6,active:.8,t:1,hit:false});
 s.waves.push({x:1,y:1,w:20,h:20,vx:0,t:1});
 const body={x:s.x+35,y:s.y+35,w:s.w-65,h:s.h-35};
 const {api,events}=makeApi({attackRect:body});
 B.update(s,.01,api);
 assert.equal(s.hp,0);
 assert.equal(s.phase,3);
 assert.equal(s.defeated,true);
 assert.deepEqual([s.projectiles.length,s.hazards.length,s.waves.length],[0,0,0]);
 assert.ok(events.sounds.includes('bossDefeat'));
 B.update(s,3.2,api);
 assert.equal(events.wins,1);
 B.update(s,.5,api);
 assert.equal(events.wins,1);
}

console.log('PASS: Guardião com 9 HP, 3 fases, slam/gemas/fogo/gelo, vulnerabilidade, dano corporal e vitória única.');
