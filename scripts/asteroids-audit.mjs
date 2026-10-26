/* Real Chromium input and layout audit. Mutation fixtures are isolated below;
   the normal wave playthrough uses only keyboard input, never engine changes.
   Usage: node scripts/asteroids-audit.mjs http://localhost:8137 /tmp/starfall-qa */
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { browser, wait } from './lib/arcade-browser.mjs';
const origin = process.argv[2] || 'http://localhost:8137', out = process.argv[3] || '/tmp/starfall-qa';
await mkdir(out, {recursive:true});
const b = await browser(), results = [];
const gate = (ok, name, detail) => { results.push({ok:!!ok,name,detail}); console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' '+JSON.stringify(detail):''}`); assert.ok(ok,name); };
const snap = () => b.E('StarfallApp.snapshot()');
const tap = async code => { await b.key(code); await b.key(code,false); };
const until = async (fn, timeout=4000) => { const end = Date.now()+timeout; while(Date.now()<end){if(await fn())return true;await wait(50);}return false; };
try {
 await b.size(1280,900); await b.nav(origin+'/asteroids/');
 gate((await snap()).mode==='ready','ready screen loads'); await b.screenshot(out+'/desktop-ready.png');
 await b.click('#primary'); await wait(300); gate((await snap()).mode==='playing','launch via real pointer');
 const initial=(await snap()).state.ship;
 await b.key('ArrowUp'); await wait(350); await b.key('ArrowUp',false);
 await b.key('ArrowRight'); await wait(250); await b.key('ArrowRight',false);
 let s=await snap();gate(s.state.ship.y<initial.y&&s.state.ship.angle>initial.angle,'keyboard thrust and rotation');
 await b.key('Space'); await wait(500); await b.key('Space',false);
 s=await snap(); gate(s.state.shots>=3&&s.state.shots<=5,'held fire repeats at controlled rate',s.state.shots);
 await tap('KeyP'); const paused=await snap(); await b.key('KeyP',true,true); await b.key('KeyP',false); await wait(300);
 gate((await snap()).mode==='paused'&&(await snap()).state.time===paused.state.time,'pause freezes simulation; key repeat cannot resume');
 await b.click('#primary'); gate((await snap()).mode==='playing','resume button returns to play');
 await tap('KeyM'); const muted=(await snap()).muted; await b.key('KeyM',true,true);await b.key('KeyM',false);
 gate((await snap()).muted===muted&&muted,'mute ignores key repeat');
 await tap('KeyR');await b.key('KeyR',true,true);await b.key('KeyR',false);gate((await snap()).mode==='confirm','restart requires confirmation even with repeated input');
 await b.click('#secondary');gate((await snap()).mode==='playing','restart cancel preserves flight');
 await tap('KeyR');await b.click('#primary');s=await snap();gate(s.state.score===0&&s.state.lives===3&&s.state.wave===1,'confirmed restart resets score, lives and wave');
 // Ordinary input only. Fixed spin-and-thrust pattern, no target tracking,
 // random-seed override, invulnerability, time acceleration or state writes.
 let progressed=false, run;
 for(let attempt=0;attempt<3&&!progressed;attempt++){
  if(attempt){await b.click('#primary');}
  await b.key('Space'); await b.key('ArrowRight');
  for(let cycle=0;cycle<35;cycle++){
   await b.key('ArrowUp');await wait(450);await b.key('ArrowUp',false);await wait(2000);
   run=await snap();
   if(cycle%5===0)console.log('PLAY',JSON.stringify({attempt,seconds:Math.round(run.state.time),wave:run.state.wave,score:run.state.score,lives:run.state.lives}));
   if(run.state.wave>=2){progressed=true;break;}
   if(run.mode==='over')break;
  }
  await b.key('Space',false);await b.key('ArrowRight',false);
  if(!progressed&&run.mode!=='over'){await tap('KeyR');await b.click('#primary');}
 }
 gate(progressed,'normal unmodified browser play clears wave one', {wave:run.state.wave,score:run.state.score,lives:run.state.lives,kills:run.state.kills,seconds:run.state.time});
 await b.screenshot(out+'/desktop-gameplay.png');
 const earned=(await snap()).best;await b.nav(origin+'/asteroids/');gate((await snap()).best>=earned&&(await snap()).muted,'high score and mute survive reload');
 // Isolated collision/splitting fixture, explicitly separate from normal play.
 await b.E(`(()=>{const create=Starfall.create;Starfall.create=(...args)=>(window.fixture=create(...args));})()`);await b.click('#primary');
 await b.E(`(()=>{const s=window.fixture;s.rocks=[{id:999,x:s.ship.x,y:s.ship.y-75,size:2,radius:44,vx:0,vy:0,angle:0,spin:0,shape:Array(11).fill(1)}];})()`);
 await b.key('Space');await wait(60);await b.key('Space',false);await wait(160);
 s=await snap();gate(s.state.score===20&&s.state.rocks.length===2&&s.state.rocks.every(r=>r.size===1),'browser shooting splits a large asteroid (isolated fixture)');
 await b.E(`(()=>{const s=window.fixture;s.lives=1;s.ship.shield=0;s.ship.vx=s.ship.vy=0;s.rocks=[{id:1000,x:s.ship.x,y:s.ship.y,size:2,radius:44,vx:0,vy:0,angle:0,spin:0,shape:Array(11).fill(1)}]})()`);
 await until(async()=> (await snap()).mode==='over');s=await snap();gate(s.mode==='over'&&s.state.lives===0,'collision produces game over in actual UI (isolated fixture)');
 await b.click('#primary');gate((await snap()).state.lives===3,'retry after death works');
 await b.E("window.dispatchEvent(new Event('blur'))");gate((await snap()).mode==='paused','focus loss auto-pauses');
 for(const [w,h] of [[320,700],[360,640],[390,844],[768,1024],[844,390]]){
  await b.size(w,h,true);await b.nav(origin+'/asteroids/');
  const layout=await b.E(`(()=>{const c=document.querySelector('.cabinet').getBoundingClientRect(),buttons=[...document.querySelectorAll('.touch-controls button')].map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height}});return {width:innerWidth,scroll:document.documentElement.scrollWidth,bottom:c.bottom,buttons}})()`);
  gate(layout.width===w&&layout.scroll<=w&&layout.buttons.every(r=>r.w>=44&&r.h>=44),'mobile layout and 44px controls '+w+'×'+h,layout);
  if(w<500||h<500)gate(layout.bottom<=h+1,'whole flight deck fits '+w+'×'+h,layout.bottom);
  const contained=await b.E(`(()=>{const p=document.querySelector('.panel').getBoundingClientRect(),a=document.querySelector('.arena').getBoundingClientRect();return p.top>=a.top&&p.bottom<=a.bottom&&p.left>=a.left&&p.right<=a.right})()`);
  gate(contained,'menu stays inside the arena '+w+'×'+h);
  await b.screenshot(out+`/phone-${w}x${h}.png`);
 }
 await b.size(390,844,true);await b.S('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.nav(origin+'/asteroids/');await b.click('#primary');
 const points=await b.E(`['left','thrust','fire'].map((name,id)=>{const r=document.querySelector('[data-control='+name+']').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:id+1}})`);
 await b.S('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await wait(500);s=await snap();
 gate(s.input.left&&s.input.thrust&&s.input.fire&&s.state.shots>=3,'three simultaneous emulated touches rotate, thrust and fire',s.input);
 await b.S('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(100);gate(Object.keys((await snap()).input).length===0,'touch release clears all controls');
 // Individual cancellation, including two pointers sharing one button.
 await b.E(`(()=>{const el=document.querySelector('[data-control=fire]');for(const id of [41,42])el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:id,pointerType:'touch'}));el.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:41,pointerType:'touch'}));})()`);
 gate((await snap()).input.fire,'one pointer cancel preserves the other held fire');
 await b.E(`document.querySelector('[data-control=fire]').dispatchEvent(new PointerEvent('lostpointercapture',{bubbles:true,pointerId:42,pointerType:'touch'}))`);
 gate(!(await snap()).input.fire,'lost pointer capture releases remaining fire');
 await b.screenshot(out+'/phone-gameplay.png');
 await b.size(844,390,true);await wait(200);gate((await snap()).mode==='paused','orientation resize pauses without losing the run');
 // Storage/audio failures are injected before app boot. Production has no hook.
 await b.S('Page.addScriptToEvaluateOnNewDocument',{source:`Storage.prototype.getItem=function(){throw new Error('storage blocked')};Storage.prototype.setItem=function(){throw new Error('storage blocked')};window.AudioContext=function(){throw new Error('audio unavailable')};`});
 await b.size(390,844,true);await b.nav(origin+'/asteroids/');await b.click('#primary');await tap('KeyM');await b.key('Space');await wait(400);await b.key('Space',false);
 s=await snap();gate(s.mode==='playing'&&!s.storageOK&&s.state.shots>=2,'storage and audio failures do not block play or mute');
 await tap('KeyR');await b.click('#primary');gate((await snap()).state.score===0,'restart still works with unavailable storage/audio');
 gate(b.errors.length===0,'no uncaught browser exceptions',b.errors);
} finally { await writeFile(out+'/results.json',JSON.stringify(results,null,2));await b.close(); }
console.log(`${results.length} browser gates passed`);
