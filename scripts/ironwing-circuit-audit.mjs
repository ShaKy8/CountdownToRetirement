/* Full takeoff → circuit → arrested landing. The automated test pilot observes
   read-only telemetry and sends ordinary mouse-stick/keyboard events at real time.
   There are no state changes, physics overrides or time acceleration. */
import {browser,wait} from './lib/arcade-browser.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.argv[2]||'http://localhost:8142',out=process.argv[3]||'/tmp/ironwing-circuit';await mkdir(out,{recursive:true});
const b=await browser(),log=[];const tap=async code=>{await b.key(code);await b.key(code,false);};const sn=()=>b.E('IronwingApp.snapshot()');
try{
 await b.size(1280,900);await b.nav(origin+'/ironwing/');await b.click('[data-start=free]');await b.key('KeyW');while((await sn()).state.throttle<.95)await wait(80);await b.key('KeyW',false);await tap('Enter');while((await sn()).state.status!=='flying')await wait(80);await wait(2500);await tap('KeyG');await tap('KeyF');await b.click('#mouse');
 const p=await b.E('(()=>{const r=document.querySelector("#world").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.43}})()');await b.S('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
 const points=[{x:0,z:1800,y:300},{x:-2400,z:2000,y:350},{x:-2600,z:-5200,y:360},{x:-900,z:-6200,y:370},{x:0,z:-110,y:22}];let phase=0,lastLog=-5,power=null,configured=false;
 const started=Date.now();
 while(Date.now()-started<360000){
  const a=(await sn()).state;if(['landed','crashed'].includes(a.status))break;
  let t=points[phase],range=Math.hypot(t.x-a.x,t.z-a.z);
  if(phase<4&&range<(phase===3?850:600)){phase++;t=points[phase];range=Math.hypot(t.x-a.x,t.z-a.z);console.log('WAYPOINT',phase);}
  const final=phase===4;if(final&&!configured){await tap('KeyG');await tap('KeyF');await tap('KeyH');configured=true;}
  const desiredHeading=Math.atan2(t.x-a.x,t.z-a.z),error=Math.atan2(Math.sin(desiredHeading-a.heading),Math.cos(desiredHeading-a.heading));
  const desiredRoll=Math.max(-.95,Math.min(.95,error*1.6));
  const targetSpeed=final?79:125;const throttle=Math.max(0,Math.min(1,(.00065*targetSpeed**2+(final?10:0))/35+(targetSpeed-a.speed)*.025));
  const nextPower=a.throttle<throttle-.012?'KeyW':a.throttle>throttle+.012?'KeyS':null;if(nextPower!==power){if(power)await b.key(power,false);if(nextPower)await b.key(nextPower);power=nextPower;}
  const aoa=(a.flaps?.065:.033)*(78/Math.max(30,a.speed))**2;
  const desiredY=22+Math.max(0,-110-a.z)*Math.tan(3.5*Math.PI/180);
  const gamma=final?Math.max(-.15,Math.min(.12,-3.5*Math.PI/180+(desiredY-a.y)*.0015)):Math.max(-.12,Math.min(.18,(t.y-a.y)*.0015));
  const desiredPitch=gamma+aoa;
  const roll=Math.max(-1,Math.min(1,(desiredRoll-a.roll)*2.6-a.rollRate*.6));
  const pitch=Math.max(-.7,Math.min(.7,(desiredPitch-a.pitch)*3.4-a.pitchRate*.7));
  await b.S('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+roll*100,y:p.y+pitch*100,button:'left',buttons:1});
  if(a.time-lastLog>5){lastLog=a.time;const v={time:Math.round(a.time),phase,x:Math.round(a.x),y:Math.round(a.y),z:Math.round(a.z),heading:Math.round(a.heading*180/Math.PI),speed:Math.round(a.speed),roll:a.roll,pitch:a.pitch,throttle:a.throttle};log.push(v);console.log('FLIGHT',JSON.stringify(v));if(final)await b.screenshot(out+'/circuit-final.png');}
  await wait(120);
 }
 if(power)await b.key(power,false);await b.S('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await wait(1000);const s=await sn();await b.screenshot(out+'/circuit-result.png');await writeFile(out+'/flight.json',JSON.stringify({log,final:s},null,2));console.log('RESULT',JSON.stringify(s.state));if(s.state.status!=='landed'||s.state.launches!==1)throw Error('Full circuit did not land');console.log('PASS normal takeoff, circuit and arrested recovery in one continuous flight');
}finally{await b.close();}
