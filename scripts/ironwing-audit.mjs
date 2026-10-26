/* Browser evidence using normal pointer/keyboard/touch events and read-only telemetry.
   No state writes, altered physics, invulnerability or accelerated simulation. */
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser,wait} from './lib/arcade-browser.mjs';
const origin=process.argv[2]||'http://localhost:8142',out=process.argv[3]||'/tmp/ironwing-qa';
await mkdir(out,{recursive:true});const b=await browser(),results=[];
const gate=(ok,name,detail)=>{results.push({ok:!!ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name} ${detail?JSON.stringify(detail):''}`);assert.ok(ok,name);};
const snap=()=>b.E('IronwingApp.snapshot()');
const tap=async(code)=>{await b.key(code);await b.key(code,false);};
const hold=async(code,ms)=>{await b.key(code);await wait(ms);await b.key(code,false);};
const until=async(fn,ms=5000)=>{const t=Date.now()+ms;while(Date.now()<t){if(await fn())return true;await wait(100);}return false;};
const menu=async()=>{await b.nav(origin+'/ironwing/');};
try{
 await b.size(1440,1000);await menu();gate((await snap()).mode==='menu','hangar loads');await b.screenshot(out+'/desktop-hangar.png');
 await b.click('[data-start=approach]');await hold('KeyQ',100);await wait(13000);
 {const a=(await snap()).state;if(a.heading<0)await hold('KeyE',Math.max(20,Math.abs(a.heading)/.06*1000));}
 gate((await snap()).state.x<17,'normal rudder input corrects initial lateral offset',(await snap()).state.x);
 await tap('KeyP');const p=await snap();await b.key('KeyP',true,true);await b.key('KeyP',false);await wait(250);gate((await snap()).mode==='paused'&&(await snap()).state.time===p.state.time,'pause freezes flight and ignores repeat');
 await b.click('#resume');await tap('KeyM');const mute=(await snap()).saved.muted;await b.key('KeyM',true,true);await b.key('KeyM',false);gate((await snap()).saved.muted===mute&&mute,'mute ignores repeated key');
 for(let n=0;n<600;n++){const a=(await snap()).state;if(['landed','crashed'].includes(a.status))break;if(a.z<-250){const desired=Math.atan2(-a.x,Math.max(250,-110-a.z)),error=desired-a.heading;if(Math.abs(error)>.0025)await hold(error>0?'KeyE':'KeyQ',Math.min(90,Math.max(25,Math.abs(error)/.06*700)));}if(a.z>-800&&a.z<-750)await b.screenshot(out+'/desktop-final-approach.png');await wait(100);}let s=await snap();gate(s.state.status==='landed'&&s.state.wire!==null,'normal unmodified browser approach catches a wire',{status:s.state.status,wire:s.state.wire,time:s.state.time,x:s.state.x,speed:s.state.touchSpeed,sink:s.state.touchVs,grade:s.state.landingGrade});await b.screenshot(out+'/desktop-recovery.png');
 await b.click('#manual');await b.click('#back');gate((await snap()).mode==='result','manual returns to debrief without resuming finished state');gate((await snap()).saved.recoveries===1,'debrief help does not double-count recovery');
 await menu();gate((await snap()).saved.recoveries===1&&(await snap()).saved.muted,'recovery and mute persist after reload');
 await b.click('[data-start=free]');await tap('Enter');gate((await snap()).state.status==='deck','launch rejects low throttle');await b.key('KeyW');await until(async()=>(await snap()).state.throttle>=.95);await b.key('KeyW',false);await tap('Enter');await wait(6000);s=await snap();gate(s.state.launches===1&&s.state.status==='flying'&&s.state.y>50,'normal catapult takeoff reaches free flight',{speed:s.state.speed,altitude:s.state.y,z:s.state.z});
 await tap('KeyG');await tap('KeyF');const h=s.state.heading;await hold('ArrowRight',1200);await wait(1000);s=await snap();gate(s.state.heading>h+.1&&s.state.roll>.2,'normal bank input turns aircraft',{heading:s.state.heading,roll:s.state.roll});await tap('KeyV');await b.screenshot(out+'/desktop-flight.png');
 await tap('KeyR');await b.key('KeyR',true,true);await b.key('KeyR',false);gate((await snap()).mode==='confirm','restart ignores repeat');await b.click('#cancel');gate((await snap()).mode==='playing','cancel restart preserves flight');await tap('KeyR');await b.click('#confirm');s=await snap();gate(s.state.status==='deck'&&s.state.launches===0,'confirmed restart restores deck');
 await menu();await b.click('[data-start=approach]');await hold('ArrowUp',6000);await until(async()=>(await snap()).mode==='result');gate((await snap()).state.status==='crashed','normal nose-down input produces crash and explanation');await b.click('#again');gate((await snap()).state.health===100&&(await snap()).state.status==='flying','crash retry restores usable flight');
 // Deliberately miss the recovery and fly a go-around with the ordinary controls.
 await wait(34000);await b.key('KeyW');await hold('ArrowDown',650);await wait(2100);await b.key('KeyW',false);await wait(20000);s=await snap();gate(s.state.status==='flying'&&s.state.y>400&&s.state.vs>10,'normal missed approach / power-on go-around',{altitude:s.state.y,verticalSpeed:s.state.vs,z:s.state.z});await b.screenshot(out+'/desktop-go-around.png');
 await b.E("window.dispatchEvent(new Event('blur'))");gate((await snap()).mode==='paused','focus loss pauses and clears controls');await b.click('#resume');
 // Combat is flown by normal keyboard events, telemetry used only as observation.
 await menu();await b.click('[data-start=combat]');await until(async()=>(await snap()).state.lock===1,6000);s=await snap();gate(s.state.lock===1,'normal combat flight acquires a target lock');await tap('KeyX');await until(async()=>(await snap()).state.kills>=1,13000);s=await snap();gate(s.state.kills===1&&s.state.missiles===5,'normal missile flight intercepts moving target',{kills:s.state.kills,score:s.state.score});
 await b.key('Space');await until(async()=>(await snap()).state.shots>=6);await b.key('Space',false);s=await snap();gate(s.state.shots>=6&&s.state.shots<=9,'held cannon repeats at bounded rate',s.state.shots);
 // Steer toward the second drone through the mouse stick (real pointer events).
 await b.click('#mouse');const originPoint=await b.E('(()=>{const r=document.querySelector("#world").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.43}})()');await b.S('Input.dispatchMouseEvent',{type:'mousePressed',...originPoint,button:'left',clickCount:1});
 for(let n=0;n<200;n++){
  s=await snap();if(!s.state.enemies.length)break;
  const a=s.state,e=a.enemies[a.target],dx=e.x-a.x,dz=e.z-a.z,err=Math.atan2(Math.sin(Math.atan2(dx,dz)-a.heading),Math.cos(Math.atan2(dx,dz)-a.heading));const wantRoll=Math.max(-.65,Math.min(.65,err*2));const wantPitch=Math.atan2(e.y-a.y,Math.hypot(dx,dz))+.012;
  const roll=Math.max(-.8,Math.min(.8,(wantRoll-a.roll)*2)),pitch=Math.max(-.5,Math.min(.5,(wantPitch-a.pitch)*2));
  await b.S('Input.dispatchMouseEvent',{type:'mouseMoved',x:originPoint.x+roll*100,y:originPoint.y+pitch*100,button:'left',buttons:1});
  if(a.lock>=1&&a.missileCooldown<=0)await tap('KeyX');
  await wait(130);
 }
 await b.S('Input.dispatchMouseEvent',{type:'mouseReleased',...originPoint,button:'left',clickCount:1});s=await snap();gate(s.state.kills===2&&s.state.returning,'normal combat controls clear mission targets and enter recovery stage',{kills:s.state.kills,health:s.state.health,score:s.state.score});await b.screenshot(out+'/desktop-combat.png');
 for(const [w,h] of [[320,700],[390,844],[768,1024],[844,390]]){
  await b.size(w,h,true);await menu();const layout=await b.E(`(()=>{const r=document.querySelector('.flight-deck').getBoundingClientRect();const buttons=[...document.querySelectorAll('.controls button')].filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]});return{w:innerWidth,scroll:document.documentElement.scrollWidth,bottom:r.bottom,buttons}})()`);gate(layout.w===w&&layout.scroll<=w&&layout.bottom<=h+1&&layout.buttons.every(([bw,bh])=>bw>=44&&bh>=44),'responsive shell fits '+w+'x'+h,layout);await b.screenshot(out+`/phone-hangar-${w}x${h}.png`);
 }
 await b.size(390,844,true);await b.S('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await menu();await b.click('[data-start=approach]');
 const points=await b.E(`['#stick','[data-hold=throttleUp]','[data-hold=fire]'].map((q,i)=>{const r=document.querySelector(q).getBoundingClientRect();return{x:r.x+r.width/2+(i===0?23:0),y:r.y+r.height/2+(i===0?18:0),id:i+1}})`);
 await b.S('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await wait(400);s=await snap();gate(s.input.roll>0&&s.input.pitch>0&&s.input.fire&&s.input.throttleUp,'simultaneous emulated touch stick, throttle and cannon',s.input);await b.S('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(100);s=await snap();gate(s.input.roll===0&&s.input.pitch===0&&!s.input.fire&&!s.input.throttleUp,'touch release clears every control');await b.screenshot(out+'/phone-flight.png');
 await b.E(`(()=>{const el=document.querySelector('[data-hold=fire]');for(const id of [41,42])el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:id,pointerType:'touch'}));el.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:41,pointerType:'touch'}));})()`);gate((await snap()).input.fire,'one cancelled touch preserves other pointer');await b.E(`document.querySelector('[data-hold=fire]').dispatchEvent(new PointerEvent('lostpointercapture',{bubbles:true,pointerId:42,pointerType:'touch'}))`);gate(!(await snap()).input.fire,'lost capture releases held input');
 await b.key('KeyW');await b.size(844,390,true);await b.key('KeyW',false);gate(!(await snap()).input.throttleUp,'resize clears held input');
 await b.S('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{get(){throw Error('storage disabled for QA')}})"});await menu();await b.click('[data-start=free]');await tap('KeyM');await tap('KeyP');gate((await snap()).mode==='paused','storage unavailable does not prevent play, mute or pause');
 for(const route of ['/','/elevator/','/asteroids/']){await b.nav(origin+route);gate(await b.E('document.readyState==="complete"&&!!document.body'),'existing page loads '+route);if(route==='/')gate(await b.E("['/ironwing/','/elevator/','/asteroids/','/game/','/slingshot/','/postcards-in-sound/','/guitar/'].every(p=>document.querySelector('a[href=\"'+p+'\"]'))"),'homepage keeps all game and music links');}
 gate(b.errors.length===0,'no browser runtime errors',b.errors);await writeFile(out+'/results.json',JSON.stringify(results,null,2));
}finally{await writeFile(out+'/results-partial.json',JSON.stringify(results,null,2));await b.close();}
