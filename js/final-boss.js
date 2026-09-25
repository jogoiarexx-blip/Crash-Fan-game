// Guardião das Nove Gemas — lógica isolada da batalha final.
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const overlap=(a,b)=>a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 const phaseFor=hp=>hp>6?1:hp>3?2:3;
 const attacks={1:['slam','gem'],2:['fire','slam','gem'],3:['ice','fire','gem','slam']};
 function create(){return{maxHp:9,hp:9,phase:1,x:690,y:174,w:238,h:281,intro:4.2,clock:0,nextAttack:1.15,attack:null,vulnerable:0,invuln:0,flash:0,projectiles:[],hazards:[],waves:[],attackIndex:0,defeated:false,defeatT:0,winSent:false}}
 function beginAttack(s){const list=attacks[s.phase],kind=list[s.attackIndex++%list.length];s.attack={kind,t:0,duration:kind==='gem'?2.1:2.35,spawned:false};s.vulnerable=0}
 function spawnAttack(s,api){const a=s.attack,p=api.player;if(a.kind==='slam'){s.waves.push({x:s.x+30,y:api.ground-28,w:52,h:28,vx:-380,t:2.2},{x:s.x+s.w-82,y:api.ground-28,w:52,h:28,vx:-300,t:2.45});api.sound('bossSlam');api.shake(.55)}
  else if(a.kind==='gem'){for(let i=-1;i<=1;i++){const sx=s.x+s.w*.42,sy=s.y+88+i*38,dx=p.x+p.w/2-sx,dy=p.y+p.h/2-sy,len=Math.max(1,Math.hypot(dx,dy)),speed=250+s.phase*28;s.projectiles.push({x:sx,y:sy,r:13,vx:dx/len*speed,vy:dy/len*speed+i*28,t:3.4,kind:'gem'})}api.sound('bossGem')}
  else {const count=s.phase===3?4:3;for(let i=0;i<count;i++){const x=95+((i*223+s.attackIndex*97)%720);s.hazards.push({kind:a.kind,x,w:a.kind==='ice'?46:70,warning:.62,active:.82,t:1.44,hit:false})}api.sound(a.kind==='ice'?'bossIce':'bossFire')}
 }
 function update(s,dt,api){s.clock+=dt;s.phase=phaseFor(s.hp);s.flash=Math.max(0,s.flash-dt);s.invuln=Math.max(0,s.invuln-dt);s.vulnerable=Math.max(0,s.vulnerable-dt);
  if(s.intro>0){s.intro=Math.max(0,s.intro-dt);return}
  if(s.defeated){s.defeatT=Math.max(0,s.defeatT-dt);if(!s.winSent&&s.defeatT<=0){s.winSent=true;api.win()}return}
  if(s.attack){s.attack.t+=dt;if(!s.attack.spawned&&s.attack.t>=.7){s.attack.spawned=true;spawnAttack(s,api)}if(s.attack.t>=s.attack.duration){s.attack=null;s.vulnerable=1.45;s.nextAttack=.65}}
  else if(s.vulnerable<=0){s.nextAttack-=dt;if(s.nextAttack<=0)beginAttack(s)}
  for(const q of s.projectiles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;if(q.t>0&&overlap({x:q.x-q.r,y:q.y-q.r,w:q.r*2,h:q.r*2},api.player)){q.t=0;api.hit('impact')}}s.projectiles=s.projectiles.filter(q=>q.t>0&&q.x>-80&&q.x<1040&&q.y>-80&&q.y<620);
  for(const q of s.waves){q.x+=q.vx*dt;q.t-=dt;if(q.t>0&&overlap(q,api.player)){q.t=0;api.hit('crush')}}s.waves=s.waves.filter(q=>q.t>0&&q.x>-100&&q.x<1060);
  for(const q of s.hazards){q.t-=dt;if(q.t<=q.active&&q.t>0&&!q.hit&&overlap({x:q.x,y:api.ground-(q.kind==='ice'?115:70),w:q.w,h:q.kind==='ice'?115:70},api.player)){q.hit=true;api.hit(q.kind==='ice'?'freeze':'explosion')}}s.hazards=s.hazards.filter(q=>q.t>0);
  const body={x:s.x+35,y:s.y+35,w:s.w-65,h:s.h-35};if(s.invuln<=0&&s.vulnerable>0&&overlap(api.attackRect,body)){s.hp=Math.max(0,s.hp-1);s.invuln=.72;s.vulnerable=0;s.flash=.34;s.nextAttack=.62;api.hitBoss(s.hp);if(s.hp<=0){s.defeated=true;s.defeatT=3.15;s.attack=null;s.projectiles.length=s.hazards.length=s.waves.length=0;api.sound('bossDefeat');api.shake(.85)}}
  else if(s.invuln<=0&&s.vulnerable<=0&&overlap(api.player,body))api.hit('impact');
 }
 function sourceFrame(s){const cell=362;if(s.defeated){const f=10+Math.min(1,Math.floor((3.15-s.defeatT)*2.2));return[(f%4)*cell,Math.floor(f/4)*cell,cell,cell]}if(s.flash>0)return[(Math.floor(s.flash*18)%2)*cell,2*cell,cell,cell];if(s.attack){const map={slam:4,gem:5,fire:6,ice:7},f=map[s.attack.kind]||4;return[(f%4)*cell,Math.floor(f/4)*cell,cell,cell]}const f=Math.floor(s.clock*5)%4;return[f*cell,0,cell,cell]}
 window.FinalBoss={create,update,sourceFrame,overlap,clamp};
})();
