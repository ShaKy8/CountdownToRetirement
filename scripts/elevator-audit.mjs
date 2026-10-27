/* Browser QA: ordinary-input mission, local-only boundary fixtures, and mobile. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { browser, wait } from './lib/arcade-browser.mjs';
const origin=(process.argv[2]||'http://localhost:8137').replace(/\/$/,''), out=process.argv[3]||'/tmp/elevator-progression-qa';
const live=process.argv.includes('--live');
if(!live&&!/^http:\/\/(localhost|127\.0\.0\.1):/.test(origin))throw Error('Fixture tests only run against a local preview; use --live for production smoke tests.');
await mkdir(out,{recursive:true});
const b=await browser(), results=[];
const gate=(ok,name,detail)=>{results.push({ok:!!ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' '+JSON.stringify(detail):''}`);assert.ok(ok,name);};
const snap=()=>b.E('Elevator86App.snapshot()');
const until=async(fn,ms=4000)=>{const end=Date.now()+ms;while(Date.now()<end){if(await fn())return true;await wait(35);}return false;};
const tap=async code=>{await b.key(code);await b.key(code,false);};
async function walk(x,fire=false){
 let s=await snap();const dir=s.player.x<x?'ArrowRight':'ArrowLeft';
 if(fire)await b.key('KeyX');await b.key(dir);
 const arrived=await until(async()=>{s=await snap();return s.mode!=='playing'||Math.abs(s.player.x-x)<9;},6500);
 await b.key(dir,false);if(fire)await b.key('KeyX',false);
 gate(arrived,'walk reaches target',{x,actual:s.player.x,mode:s.mode});
}
async function ride(floor){
 let s=await snap();if(s.player.floor===floor&&s.player.riding===null)return;
 const dir=s.player.floor<floor?'ArrowDown':'ArrowUp';await b.key(dir);
 const arrived=await until(async()=>{s=await snap();return s.player.floor===floor&&s.player.riding===null;},28000);
 await b.key(dir,false);gate(arrived,'lift reaches requested floor',floor);
}
async function fixture(level){
 await b.E(`(()=>{const s=window.qaState;s.level=${level-1};s.mode='escaped';Elevator86.next(s);s.enemies=[];s.spawnClock=1e6;})()`);
 await wait(150);
}
async function captureFixture(){
 await b.E(`(()=>{const start=Elevator86.start;Elevator86.start=s=>{window.qaState=s;start(s)};const draw=ElevatorRenderer.prototype.draw;ElevatorRenderer.prototype.draw=function(...args){const r=draw.apply(this,args);window.qaCamera={...this.cam,w:this.w,h:this.h};return r};})()`);
 await b.click('#primary');
}
try {
 await b.size(1280,900);
 if(!live){
  await b.nav(origin+'/tests/elevator-browser.html');await b.click('#run');
  gate(await until(async()=>{await b.S('Page.captureScreenshot',{format:'jpeg',quality:1});return b.E('/passed, \\d+ failed/.test(document.querySelector("#summary").textContent)');},90000),'existing browser harness completes');
  const summary=await b.E('document.querySelector("#summary").textContent');
  const failures=await b.E('[...document.querySelectorAll("#results .fail")].map(e=>e.textContent)');
  gate(failures.length===0,'existing restart/combat/storage/touch/layout checks', {summary,failures});
 }
 await b.nav(origin+'/elevator/');await b.screenshot(out+'/desktop-ready.png');await b.click('#primary');
 for(const file of (await snap()).docs){
  let s=await snap();if(s.player.floor!==file.floor){await walk(246,true);await ride(file.floor);}
  await walk(file.x,true);await b.key('KeyE');await wait(700);await b.key('KeyE',false);
  s=await snap();gate(s.docs.some(d=>d.floor===file.floor&&d.taken),'normal keyboard play collects file',file.floor);
 }
 await walk(246,true);await ride(7);await walk(675,true);
 let s=await snap();gate(s.mode==='escaped','ordinary-input mission one escape (no fixtures)',{score:s.score,lives:s.lives,health:s.health});
 gate((await b.E('document.querySelector("#panel-copy").textContent')).includes('Next: 9 floors, 4 files.'),'victory describes actual next quota');
 await b.screenshot(out+'/mission-one-escaped.png');await b.click('#primary');s=await snap();
 gate(s.level===2&&s.floors===9&&s.docs.length===4,'real Next action adds floor but no file on mission two');
 await tap('KeyP');const paused=(await snap()).time;await wait(150);gate((await snap()).time===paused,'pause freezes the progressed mission');
 if(!live){
  await b.nav(origin+'/elevator/');await captureFixture();await fixture(2);
  await b.E("(()=>{const s=qaState;s.docs.forEach(d=>d.taken=true);Object.assign(s.player,{x:645,floor:s.floors-1,y:Elevator86.floorY(s.floors-1)})})()");
  await walk(675);await b.click('#primary');s=await snap();gate(s.level===3&&s.floors===10&&s.docs.length===5,'mission three adds the first extra required file (boundary fixture)');
  await fixture(13);s=await snap();gate(s.floors===20&&s.docs.length===10,'cap is twenty floors and ten files');
  await walk(246);await ride(19);await wait(500);
  let cam=await b.E('qaCamera');s=await snap();
  gate(Math.abs(cam.y-(Elevator86WorldHeight(s)-cam.h))<2&&s.player.y-cam.y<cam.h-15,'twenty-floor camera reaches ground and keeps player visible',{cam,player:s.player});
  gate(await b.E('document.querySelectorAll(".map-floor").length===20&&document.querySelector("#floor").textContent==="F01"'),'HUD and minimap show all twenty floors');
  await b.screenshot(out+'/twenty-floor-ground.png');
  await ride(18);const lower=(await snap()).docs.at(-1);await walk(lower.x);await b.key('KeyE');await wait(700);await b.key('KeyE',false);
  gate((await snap()).docs.at(-1).taken,'lower-floor document is collectible after full descent');
  await b.E("(()=>{const s=qaState;s.health=1;s.player.invul=0;s.bullets=[{x:s.player.x-15,y:s.player.y-24,vx:210,hostile:true,life:2}]})()");await wait(1900);
  s=await snap();gate(s.health===3&&s.player.floor===18&&s.player.x===lower.x&&s.docs.at(-1).taken,'capped building death returns to the lower checkpoint');
  const previousRoute=s.docs.map(d=>[d.floor,d.x]);
  await b.E('qaState.docs.forEach(d=>d.taken=true)');await walk(246);await ride(19);await walk(675);
  const copy=await b.E('document.querySelector("#panel-copy").textContent');gate(copy.includes('Next: 20 floors, 10 files. New routes and guard patrols.'),'cap victory promises variety instead of extra height');
  await b.screenshot(out+'/cap-victory.png');await b.click('#primary');s=await snap();
  gate(s.level===14&&s.floors===20&&s.docs.length===10&&JSON.stringify(s.docs.map(d=>[d.floor,d.x]))!==JSON.stringify(previousRoute),'next capped mission changes route with fixed height/quota');
  await fixture(1000000);s=await snap();gate(s.floors===20&&s.docs.length===10,'very high mission remains bounded in real UI');
  await b.click('#restart');await b.click('#secondary');gate((await snap()).level===1000000,'cancel restart keeps high mission');
  await b.click('#restart');await b.click('#primary');s=await snap();gate(s.level===1&&s.floors===8&&s.docs.length===4,'confirmed restart resets progression to 8/4');
  await b.size(390,844,true);await fixture(15);
  await b.E("(()=>{const s=qaState;Object.assign(s.player,{x:246,floor:18,y:Elevator86.floorY(18),riding:null,grounded:true});Object.assign(s.lifts[0],{floor:18,target:18,y:Elevator86.floorY(18),moving:false,dwell:0})})()");
  await wait(450);await b.S('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const point=await b.E("(()=>{const r=document.querySelector('[data-action=down]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:1}})()");
  await b.S('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await wait(1150);await b.S('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(200);
  s=await snap();cam=await b.E('qaCamera');gate(s.player.floor===19&&s.player.y-cam.y<cam.h-15,'emulated phone touch rides to floor 20 with camera tracking');
  await b.screenshot(out+'/phone-twenty-floor-ground.png');
 }
 for(const [width,height] of [[320,700],[390,844],[844,390]]){
  await b.size(width,height,true);await b.nav(origin+'/elevator/');
  const layout=await b.E(`(()=>{const c=document.querySelector('.play-area').getBoundingClientRect(),screen=document.querySelector('.screen').getBoundingClientRect(),p=document.querySelector('.panel').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,bottom:c.bottom,panel:p.top>=screen.top&&p.bottom<=screen.bottom,buttons:[...document.querySelectorAll('[data-action]')].map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height}})}})()`);
  gate(layout.scroll<=width&&layout.bottom<=height+2&&layout.panel,'phone layout and briefing remain contained '+width+'x'+height,layout);
  if(width<500)gate(layout.buttons.every(r=>r.width>=44&&r.height>=44),'touch targets stay at least 44px');
  await b.screenshot(out+`/phone-${width}x${height}.png`);
 }
 gate(b.errors.length===0,'no uncaught browser exceptions',b.errors);
} finally {await writeFile(out+'/results.json',JSON.stringify(results,null,2));await b.close();}
console.log(`${results.length} browser gates passed`);
function Elevator86WorldHeight(s){return 170+(s.floors-1)*112+60;}
