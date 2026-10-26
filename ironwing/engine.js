/* IRONWING — original, deterministic flight/game rules. Metres, seconds, radians.
   A deliberately approachable energy/attitude model; this is a game, not a flight trainer. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Ironwing=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PI=Math.PI, D=PI/180, KTS=1.94384, FT=3.28084, DECK=22;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const WIRES=[-140,-112,-84,-56];
const MODES={carrier:{name:'Carrier qualification',brief:'Launch, fly through the three blue gates, then return for an arrested landing.'},approach:{name:'Landing school',brief:'You are 2.2 nautical miles astern. Align with the deck, hold 145–175 knots, and catch a wire.'},patrol:{name:'Fleet defense',brief:'Catapult into the patrol area. Intercept three hostile drones, then bring your jet home.'},combat:{name:'Combat practice',brief:'Airborne behind two target drones. Keep a diamond near the gunsight to lock. X launches a missile; Space fires cannon.'},free:{name:'Free flight',brief:'The coast is yours. Launch, explore, and return to the carrier whenever you like.'}};
function create(mode='carrier'){
 if(!MODES[mode])mode='carrier';
 const approach=mode==='approach',air=approach||mode==='combat';
 const s={mode,time:0,status:air?'flying':'deck',x:approach?18:0,y:approach?272:air?480:DECK,z:approach?-4200:air?1000:-100,heading:0,pitch:approach?0.0038:0,roll:0,pitchRate:0,rollRate:0,speed:approach?78:air?155:0,throttle:approach?.38:.7,gear:!air||approach,flaps:!air||approach,hook:approach,brake:false,health:100,fuel:100,missiles:6,chaff:6,ammo:600,kills:0,shots:0,launches:0,landings:0,bolters:0,gate:0,lock:0,target:0,gunCooldown:0,missileCooldown:0,chaffCooldown:0,catapult:0,vs:0,g:1,score:0,message:air?MODES[mode].brief:'Set throttle to 90% or more, then ENTER / LAUNCH.',messageTime:9,events:[],enemies:[],projectiles:[],effects:[],trail:[],result:null,returning:false,wire:null,grounded:false};
 if(mode==='patrol'||mode==='combat'){
  const n=mode==='patrol'?3:2;
  for(let i=0;i<n;i++)s.enemies.push({id:i,x:i===0?0:(i===1?450:-520),y:480+i*100,z:(air?3100:4400)+i*900,heading:0,speed:85+i*9,health:2,timer:12+i*9,phase:i*2,bank:0});
 }
 s.gates=[{x:0,y:120,z:1100},{x:500,y:270,z:2200},{x:1000,y:380,z:3200}];
 return s;
}
function say(s,message,seconds=5){s.message=message;s.messageTime=seconds;}
function event(s,type){s.events.push(type);}
function crash(s,reason){if(['crashed','landed'].includes(s.status))return;s.status='crashed';s.health=0;s.result={title:'Aircraft lost',detail:reason};say(s,reason,99);event(s,'crash');}
function action(s,a){
 if(a==='launch'&&s.status==='deck'){
  if(s.throttle<.9){say(s,'More power. Hold W / THR + to reach 90%, then launch.');return;}
  s.status='catapult';s.catapult=0;s.brake=false;event(s,'launch');say(s,'CATAPULT! Pull gently: ↓ / stick back. Climb, then G to raise gear.',7);return;
 }
 if(!['flying','deck','rolling'].includes(s.status))return;
 if(['gear','flaps','hook','brake'].includes(a)){s[a]=!s[a];say(s,`${a.toUpperCase()} ${s[a]?'DOWN / ON':'UP / OFF'}`,2);}
 if(a==='target'&&s.enemies.length){s.target=(s.target+1)%s.enemies.length;s.lock=0;}
 if(a==='chaff'&&s.chaff>0&&s.chaffCooldown<=0){s.chaff--;s.chaffCooldown=1.5;s.projectiles=s.projectiles.filter(p=>!p.hostile||distance(p,s)>1800);event(s,'chaff');say(s,'COUNTERMEASURES — incoming missiles within 1.8 km decoyed.',3);}
 if(a==='missile'&&s.missileCooldown<=0){
  if(!s.missiles){say(s,'Missiles empty. Cannon available inside 1.6 km.');return;}
  if(s.lock<1||!s.enemies[s.target]){say(s,'No lock. Keep the target diamond in the large circle, within 3.8 km.');return;}
  const e=s.enemies[s.target];s.projectiles.push({x:s.x,y:s.y,z:s.z,heading:s.heading,pitch:s.pitch,target:e.id,speed:360,life:16,hostile:false});s.missiles--;s.missileCooldown=.7;event(s,'missile');say(s,'FOX TWO — missile away.',2);
 }
}
function targetInfo(s,e=s.enemies[s.target]){
 if(!e)return null;const dx=e.x-s.x,dy=e.y-s.y,dz=e.z-s.z,range=Math.hypot(dx,dy,dz);
 return {range,bearing:wrap(Math.atan2(dx,dz)-s.heading),elevation:Math.atan2(dy,Math.hypot(dx,dz))-s.pitch};
}
function guidance(s){
 const range=Math.hypot(s.x,s.z+110),desired=DECK+Math.max(0,-110-s.z)*Math.tan(3.5*D),slope=s.y-desired;
 const lined=s.z<-160&&Math.abs(wrap(s.heading))<40*D&&Math.abs(s.x)<600;
 let call='CARRIER 360° • approach from the south';
 if(lined){
  if(!s.gear||!s.flaps||!s.hook)call='CONFIGURE: GEAR · FLAPS · HOOK DOWN';
  else if(s.speed*KTS>185)call='FAST — reduce power / use airbrake';
  else if(s.speed*KTS<135)call='SLOW — add power';
  else if(Math.abs(s.x)>22)call=s.x>0?'RIGHT OF LINE — ease left':'LEFT OF LINE — ease right';
  else if(slope>18)call='HIGH — lower the nose gently';
  else if(slope<-13)call='LOW — add power, raise the nose';
  else call='ON GLIDE — small corrections, fly it onto the deck';
 }
 return {range,desired,slope,lined,call,bearing:(Math.atan2(-s.x,-s.z)*180/PI+360)%360};
}
function kill(s,e){
 s.kills++;s.score+=500;s.effects.push({x:e.x,y:e.y,z:e.z,life:1.8,type:'explosion'});s.enemies=s.enemies.filter(v=>v!==e);s.target=0;s.lock=0;event(s,'hit');say(s,'SPLASH! Target destroyed.',3);
 if(!s.enemies.length){s.returning=true;s.score+=500;s.projectiles=s.projectiles.filter(p=>!p.hostile);say(s,'AIRSPACE CLEAR. Return to carrier and catch a wire to complete the sortie.',10);}
}
function complete(s){
 s.status='landed';s.landings++;s.speed=0;s.score+=1000;
 const mission=s.mode==='carrier'?s.gate===3:s.mode==='patrol'||s.mode==='combat'?s.enemies.length===0:true;
 const grade=s.landingGrade||'SAFE';s.result={title:mission?'Welcome aboard.':'Safe recovery',detail:`${grade} • Wire ${s.wire} • ${Math.round(s.touchSpeed*KTS)} kt • ${Math.abs(s.touchVs).toFixed(1)} m/s sink${mission?' • Sortie complete!':' • Objective incomplete — try the sortie again.'}`,complete:mission};event(s,'land');say(s,s.result.detail,99);
}
function step(s,input={},dt=1/60){
 if(!Number.isFinite(dt)||dt<=0)return;s.events=[];dt=Math.min(dt,.05);
 if(['crashed','landed'].includes(s.status))return;
 s.time+=dt;s.messageTime=Math.max(0,s.messageTime-dt);
 s.gunCooldown-=dt;s.missileCooldown-=dt;s.chaffCooldown-=dt;
 s.throttle=clamp(s.throttle+((input.throttleUp?1:0)-(input.throttleDown?1:0))*dt*.3,0,1);
 if(s.fuel<=0)s.throttle=0;
 s.fuel=Math.max(0,s.fuel-dt*(.011+s.throttle*.018));
 for(const e of s.effects)e.life-=dt;s.effects=s.effects.filter(e=>e.life>0);
 if(s.status==='deck')return;
 if(s.status==='catapult'){
  s.catapult+=dt;s.speed=Math.min(98,s.speed+52*dt);s.z+=s.speed*dt;
  if(s.catapult>=1.9){s.status='flying';s.pitch=8*D;s.y=DECK+.6;s.launches++;}
  return;
 }
 if(s.status==='arresting'){s.speed=Math.max(0,s.speed-40*dt);s.z+=s.speed*dt;if(s.speed===0)complete(s);return;}
 const pitchInput=clamp(input.pitch||0,-1,1),rollInput=clamp(input.roll||0,-1,1),yawInput=clamp(input.yaw||0,-1,1);
 s.pitchRate+=(pitchInput*.36-s.pitchRate)*Math.min(1,dt*5);
 s.rollRate+=(rollInput*1.1-s.rollRate)*Math.min(1,dt*6);
 s.pitch=clamp(s.pitch+s.pitchRate*dt,-65*D,70*D);
 s.roll=clamp(s.roll+s.rollRate*dt,-80*D,80*D);
 if(Math.abs(rollInput)<.05)s.roll*=Math.exp(-dt*.6); // stability augmentation, no route steering
 s.heading=wrap(s.heading+(Math.tan(s.roll)*9.81/Math.max(s.speed,65)+yawInput*.06)*dt);
 const aoa=clamp((s.flaps?.065:.033)*Math.pow(78/Math.max(s.speed,30),2),.008,.32);
 const stall=clamp((58-s.speed)/25,0,1);
 const gamma=s.pitch-aoa-stall*.25;
 const drag=.00065*s.speed*s.speed+(s.gear?4:0)+(s.flaps?6:0)+(s.brake?15:0);
 s.speed=clamp(s.speed+(s.throttle*35-drag-9.81*Math.sin(gamma))*dt,0,330);
 s.vs=s.speed*Math.sin(gamma)-(1-Math.cos(s.roll))*8;
 s.g=clamp(1/Math.max(.2,Math.cos(s.roll))+s.pitchRate*s.speed/9.81,0,9);
 const old={x:s.x,y:s.y,z:s.z};
 s.x+=Math.sin(s.heading)*s.speed*Math.cos(gamma)*dt;s.z+=Math.cos(s.heading)*s.speed*Math.cos(gamma)*dt;
 s.y+=s.vs*dt;
 const onDeck=Math.abs(s.x)<34&&s.z>=-200&&s.z<=200;
 if(s.status==='rolling'){
  s.y=DECK;
  if(s.pitch>8*D&&s.speed>60){s.status='flying';s.y=DECK+.3;s.grounded=false;}
  else if(!onDeck){s.status='flying';s.grounded=false;s.bolters++;say(s,'BOLTER! Full power, pull up gently and go around.',6);event(s,'warning');}
 }
 if(s.status==='flying'&&s.y<=DECK&&old.y>=DECK&&onDeck){
  if(!s.gear)crash(s,'Gear was up. Lower GEAR before touching the deck.');
  else if(s.vs< -7)crash(s,'Hard landing. Aim for 3–5 m/s sink; add power if you are low.');
  else if(s.speed>103||s.speed<52)crash(s,'Unsafe touchdown speed. Aim for 145–175 knots.');
  else if(Math.abs(s.roll)>12*D||Math.abs(wrap(s.heading))>12*D)crash(s,'Touch down wings level, heading 360°, aligned with the deck.');
  else{s.status='rolling';s.grounded=true;s.y=DECK;s.touchSpeed=s.speed;s.touchVs=s.vs;s.landingGrade=Math.abs(s.x)<12&&s.vs>-5.5&&s.speed<90?'EXCELLENT':'SAFE';}
 }
 if(s.status==='rolling'){
  const crossed=WIRES.findIndex(w=>old.z<w&&s.z>=w);
  if(crossed>=0&&s.hook){s.wire=crossed+1;s.status='arresting';event(s,'wire');say(s,`WIRE ${s.wire}! Hold on…`,4);}
  else if(s.z>WIRES[3]&&!s.bolterCalled){s.bolterCalled=true;s.bolters++;say(s,'NO WIRE — full power, nose up, go around!',8);}
 }
 if(s.y<4)crash(s,'Ocean impact. Keep flying speed; add power and pull up before the water.');
 if(onDeck&&s.status==='flying'&&s.y<DECK&&old.y<DECK)crash(s,'Below the flight deck. Fly the glide slope; add power before the stern.');
 if(s.y<terrainHeight(s.x,s.z)+5&&terrainHeight(s.x,s.z)>0)crash(s,'Terrain impact. Watch altitude over the coast.');
 if(s.health<=0)crash(s,'Aircraft damaged beyond recovery. Use C / CHAFF when a missile warning appears.');
 if(Math.hypot(s.x,s.z)>26000)say(s,'Leaving the exercise area. Turn toward the carrier beacon.',2);
 if(s.mode==='carrier'&&s.gate<3&&distance(s,s.gates[s.gate])<210){s.gate++;s.score+=250;event(s,'gate');say(s,s.gate===3?'GATES COMPLETE. Turn south, pass the ship, then line up heading 360° for landing.':`GATE ${s.gate}/3. Follow the next blue marker.`,7);}
 const ti=targetInfo(s);if(ti&&ti.range<3800&&Math.abs(ti.bearing)<.18&&Math.abs(ti.elevation)<.18)s.lock=clamp(s.lock+dt*.75,0,1);else s.lock=Math.max(0,s.lock-dt*1.5);
 if(input.fire&&s.gunCooldown<=0&&s.ammo>0){
  s.ammo--;s.shots++;s.gunCooldown=.09;event(s,'gun');s.effects.push({x:s.x+Math.sin(s.heading)*100,y:s.y,z:s.z+Math.cos(s.heading)*100,life:.13,type:'gun'});
  const e=s.enemies.find(e=>{const t=targetInfo(s,e);return t.range<1600&&Math.abs(t.bearing)<.065&&Math.abs(t.elevation)<.065;});
  if(e){e.health-=.22;if(e.health<=0)kill(s,e);}
 }
 for(const e of [...s.enemies]){
  // Targets follow their own patrols. Combat remains spatial: the pilot must turn, aim and manage energy.
  const turn=e.z>8200||e.z<1800? .14:Math.sin(s.time*.12+e.phase)*.025;
  e.heading=wrap(e.heading+turn*dt);e.bank=turn*3;e.x+=Math.sin(e.heading)*e.speed*dt;e.z+=Math.cos(e.heading)*e.speed*dt;e.y+=Math.sin(s.time*.4+e.phase)*2*dt;e.timer-=dt;
  if(s.mode==='patrol'&&e.timer<=0&&distance(e,s)<4000){e.timer=18;s.projectiles.push({x:e.x,y:e.y,z:e.z,heading:Math.atan2(s.x-e.x,s.z-e.z),pitch:0,hostile:true,speed:220,life:20});say(s,'MISSILE INBOUND! C / CHAFF inside 1.8 km, or turn hard.',6);event(s,'warning');}
 }
 for(const p of s.projectiles){
  p.life-=dt;const t=p.hostile?s:s.enemies.find(e=>e.id===p.target);
  if(!t){p.life=0;continue;}const dx=t.x-p.x,dy=t.y-p.y,dz=t.z-p.z;
  p.heading+=clamp(wrap(Math.atan2(dx,dz)-p.heading),-dt*1.6,dt*1.6);const want=Math.atan2(dy,Math.hypot(dx,dz));p.pitch+=clamp(want-p.pitch,-dt*1.6,dt*1.6);
  p.x+=Math.sin(p.heading)*Math.cos(p.pitch)*p.speed*dt;p.z+=Math.cos(p.heading)*Math.cos(p.pitch)*p.speed*dt;p.y+=Math.sin(p.pitch)*p.speed*dt;
  if(distance(p,t)<35){p.life=0;if(p.hostile){s.health-=36;event(s,'damage');say(s,'HIT! Break turn and release countermeasures.',3);}else kill(s,t);}
 }
 s.projectiles=s.projectiles.filter(p=>p.life>0);
 if(s.time%1<dt){s.trail.push({x:s.x,z:s.z});if(s.trail.length>100)s.trail.shift();}
}
function terrainHeight(x,z){if(x<3600){const r=Math.hypot((x+3900)/900,(z-6000)/1400);return r<1?480*(1-r):0;}return 30+Math.max(0,Math.sin((x-3600)*.0009)*Math.cos(z*.0007))*600;}
return {create,step,action,guidance,targetInfo,terrainHeight,MODES,WIRES,DECK,KTS,FT,D,clamp,wrap,distance};
});
