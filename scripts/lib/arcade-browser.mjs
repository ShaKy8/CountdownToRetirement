import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { chromiumPath } from './chromium.mjs';
export const wait = ms => new Promise(r => setTimeout(r, ms));
export async function browser() {
 const dir = await mkdtemp(tmpdir()+'/starfall-qa-'), port=9400+process.pid%400;
 const chrome=spawn(chromiumPath(),['--headless=new','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${dir}`,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','about:blank'],{stdio:'ignore'});
 let data; for(let i=0;i<80;i++){try{data=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();break;}catch{await wait(100);}}
 if(!data)throw Error('Browser did not start');
 const ws=new WebSocket(data.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.no(Error(JSON.stringify(m.error)));else p.yes(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
 const send=(method,params={},sessionId)=>new Promise((yes,no)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);no(Error('Timeout '+method));},20000);pending.set(n,{yes,no,timer});ws.send(JSON.stringify({id:n,method,params,sessionId}));});
 const {targetId}=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const S=(m,p)=>send(m,p,sessionId);await S('Runtime.enable');await S('Page.enable');
 const E=async expression=>{const r=await S('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;};
 const nav=async url=>{await S('Page.navigate',{url});for(let i=0;i<120;i++){if(await E('document.readyState==="complete"'))break;await wait(50);}await wait(150);};
 const size=(width,height,mobile=false)=>S('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
 const click=async selector=>{const r=await E(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await S('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',clickCount:1});await S('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',clickCount:1});};
 const key=(code,down=true,autoRepeat=false)=>{const codes={ArrowRight:39,ArrowLeft:37,ArrowUp:38,ArrowDown:40,Space:32,KeyP:80,KeyM:77,KeyR:82,Escape:27,Enter:13};return S('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code==='Space'?' ':code.startsWith('Key')?code.slice(3).toLowerCase():code,windowsVirtualKeyCode:codes[code]||0,nativeVirtualKeyCode:codes[code]||0,autoRepeat});};
 const screenshot=async file=>{const {data}=await S('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(file,Buffer.from(data,'base64'));};
 const close=async()=>{ws.close();chrome.kill();await wait(100);await rm(dir,{recursive:true,force:true,maxRetries:3});};
 return {S,E,nav,size,click,key,screenshot,errors,close};
}
