/* Original low-poly software renderer: clipped perspective triangles, no external assets. */
(function(){'use strict';
const I=Ironwing, D=I.D, sea='#174c63', green='#b1ffd2', amber='#ffd183';
function renderer(canvas){
 const c=canvas.getContext('2d',{alpha:false});let w=1000,h=650,f=650,cx=500,cy=300,cam,basis,polys=[];
 const meshes=[];
 const add=(v,col)=>{const center=[0,1,2].map(i=>v.reduce((sum,p)=>sum+p[i],0)/v.length);const radius=Math.max(...v.map(p=>Math.hypot(...p.map((n,i)=>n-center[i]))));meshes.push({v,col,center,radius});};
 const box=(x,y,z,sx,sy,sz,col)=>{
  const a=[x-sx/2,y,z-sz/2],b=[x+sx/2,y,z-sz/2],d=[x-sx/2,y,z+sz/2],e=[x+sx/2,y,z+sz/2];
  const up=p=>[p[0],p[1]+sy,p[2]];add([up(a),up(b),up(e),up(d)],col[0]);add([a,b,up(b),up(a)],col[1]);add([b,e,up(e),up(b)],col[2]);add([e,d,up(d),up(e)],col[1]);add([d,a,up(a),up(d)],col[2]);
 };
 // The ship: a long flight deck, sponsons, island, radar mast, lights and four wires.
 box(0,1,0,66,15,400,['#4b6573','#263f52','#355366']);
 add([[-37,18,-200],[34,18,-200],[39,18,125],[20,18,207],[-24,18,207],[-39,18,160]],'#566475');
 add([[-20,18.1,-197],[17,18.1,-197],[17,18.1,178],[-20,18.1,178]],'#374756');
 for(const x of [-20,17])add([[x,18.2,-197],[x+.6,18.2,-197],[x+.6,18.2,178],[x,18.2,178]],'#dee0ce');
 for(let z=-180;z<170;z+=27)add([[-.5,18.3,z],[.5,18.3,z],[.5,18.3,z+12],[-.5,18.3,z+12]],'#f5e7ad');
 for(const z of I.WIRES)add([[-29,18.4,z],[25,18.4,z],[25,18.4,z+1.3],[-29,18.4,z+1.3]],'#222d32');
 add([[-24,18.4,-110],[22,18.4,-110],[22,18.4,-108],[-24,18.4,-108]],'#edc875');
 box(29,18,30,16,20,65,['#84949b','#566673','#687984']);box(28,38,25,20,8,27,['#98a4a1','#294453','#65717d']);box(31,46,30,2,19,2,['#ced4cd','#9ca8a4','#9ca8a4']);box(31,59,30,15,2,4,['#bbc4bd','#83939a','#83939a']);
 for(let z=-190;z<200;z+=22){box(-34,18.5,z,1.2,.7,2,['#ffeabe','#ffeabe','#ffeabe']);box(33,18.5,z,1.2,.7,2,['#ffeabe','#ffeabe','#ffeabe']);}
 for(let z=-230;z>-1300;z-=45)add([[-2,0,z],[2,0,z],[12,0,z-30],[-12,0,z-30]],'#4b7c85');
 // Faceted coast and mountains, entirely procedural and shared with collision height.
 for(let x=3600;x<12500;x+=450)for(let z=-10000;z<15000;z+=600){
  const a=[x,I.terrainHeight(x,z),z],b=[x+450,I.terrainHeight(x+450,z),z],d=[x,I.terrainHeight(x,z+600),z+600],e=[x+450,I.terrainHeight(x+450,z+600),z+600];
  const cols=['#7b8168','#6d7e6b','#859077','#5e7668','#a39972'];let n=Math.abs(Math.floor(Math.sin(x*5+z)*127))%cols.length;
  add([a,b,d],cols[n]);add([b,e,d],cols[(n+1)%cols.length]);
 }
 add([[3500,1,-10000],[3600,30,-10000],[3600,30,15000],[3500,1,15000]],'#b6a886');
 for(let j=0;j<24;j++){const x=3800+(j%4)*100,z=1200+Math.floor(j/4)*130;box(x,I.terrainHeight(x,z),z,45,30+(j%3)*23,60,['#c3ba9b','#8f9789','#a4a997']);}
 // Coastal runway and a distant island.
 add([[3700,70,-4000],[3800,70,-4000],[3800,70,-1900],[3700,70,-1900]],'#58646a');
 for(let j=0;j<14;j++)add([[3747,70.3,-3940+j*140],[3753,70.3,-3940+j*140],[3753,70.3,-3860+j*140],[3747,70.3,-3860+j*140]],'#d8d8bf');
 for(let j=0;j<16;j++){let a=j*PI2/16,b=(j+1)*PI2/16;add([[-4000+Math.cos(a)*900,0,6000+Math.sin(a)*1400],[-4000+Math.cos(b)*900,0,6000+Math.sin(b)*1400],[-3900,480,6000]],j%2?'#687c76':'#7e8b7a');}
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 function camera(s,chase){
  const sh=Math.sin(s.heading),ch=Math.cos(s.heading),sp=Math.sin(s.pitch),cp=Math.cos(s.pitch),sr=Math.sin(s.roll),cr=Math.cos(s.roll);
  const fw=[sh*cp,sp,ch*cp],r=[ch,0,-sh],u=[-sh*sp,cp,-ch*sp];
  basis={f:fw,r:r.map((v,i)=>v*cr-u[i]*sr),u:r.map((v,i)=>v*sr+u[i]*cr)};
  cam=[s.x,s.y+1.7,s.z];if(chase){cam[0]-=fw[0]*38;cam[1]+=12-fw[1]*38;cam[2]-=fw[2]*38;}
 }
 function local(p){const v=[p[0]-cam[0],p[1]-cam[1],p[2]-cam[2]];return [dot(v,basis.r),dot(v,basis.u),dot(v,basis.f)];}
 function visible(center,radius){const q=local(center);return q[2]+radius>1&&q[2]-radius<19000&&Math.abs(q[0])<Math.max(0,q[2])*w/(2*f)+radius*2&&Math.abs(q[1])<Math.max(0,q[2])*h/f+radius*2;}
 function project(p){const v=local(p);return v[2]>1?{x:cx+v[0]*f/v[2],y:cy-v[1]*f/v[2],z:v[2]}:null;}
 function poly(v,col){
  let pts=v.map(local),res=[];
  for(let j=0;j<pts.length;j++){let a=pts[j],b=pts[(j+1)%pts.length],av=a[2]>=1,bv=b[2]>=1;if(av)res.push(a);if(av!==bv){const t=(1-a[2])/(b[2]-a[2]);res.push(a.map((n,i)=>n+(b[i]-n)*t));}}
  if(res.length<3)return;const depth=res.reduce((sum,p)=>sum+p[2],0)/res.length;if(depth>19000)return;
  res=res.map(p=>[cx+p[0]*f/p[2],cy-p[1]*f/p[2]]);
  if(res.every(p=>p[0]<0)||res.every(p=>p[0]>w)||res.every(p=>p[1]<0)||res.every(p=>p[1]>h))return;
  polys.push({p:res,col,depth});
 }
 function plane(e,col='#d4d9cf',scale=1){
  const sh=Math.sin(e.heading),ch=Math.cos(e.heading),bank=e.bank||0,cb=Math.cos(bank),sb=Math.sin(bank);
  const p=([x,y,z])=>{x*=scale;y*=scale;z*=scale;const xx=x*cb-y*sb,yy=x*sb+y*cb,cp=Math.cos(e.pitch||0),sp=Math.sin(e.pitch||0),zz=z*cp-yy*sp;return [e.x+xx*ch+zz*sh,e.y+yy*cp+z*sp,e.z-xx*sh+zz*ch];};
  poly([[0,0,12],[-2,-1,-7],[2,-1,-7]].map(p),col);poly([[0,1,7],[-3,0,-6],[-13,-1,-7],[-4,0,1]].map(p),'#9aaeb3');poly([[0,1,7],[3,0,-6],[13,-1,-7],[4,0,1]].map(p),col);poly([[-2,0,-5],[-4,6,-10],[-4,0,-10]].map(p),'#647e8b');poly([[2,0,-5],[4,6,-10],[4,0,-10]].map(p),'#8399a1');poly([[-5,0,-6],[-7,0,-11],[7,0,-11],[5,0,-6]].map(p),'#abb9b9');poly([[0,1,5],[-1,2,1],[1,2,1]].map(p),'#4fc2bd');
 }
 function line(points,color=green,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
 function text(t,x,y,size=13,col=green,align='left'){c.fillStyle=col;c.font=`${size}px ui-monospace, SFMono-Regular, Consolas, monospace`;c.textAlign=align;c.fillText(t,x,y);}
 function circle(x,y,r,color=green){c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.arc(x,y,r,0,PI2);c.stroke();}
 function radar(s,x,y,r){
  c.fillStyle='#0a2327';c.beginPath();c.arc(x,y,r+6,0,PI2);c.fill();circle(x,y,r,'#416d69');circle(x,y,r*.5,'#244c4d');line([[x-r,y],[x+r,y]],'#244c4d');line([[x,y-r],[x,y+r]],'#244c4d');
  const plot=(px,pz,col,size=3)=>{const dx=px-s.x,dz=pz-s.z,rx=(dx*Math.cos(s.heading)-dz*Math.sin(s.heading))*r/6000,ry=-(dx*Math.sin(s.heading)+dz*Math.cos(s.heading))*r/6000;if(Math.hypot(rx,ry)<r){c.fillStyle=col;c.fillRect(x+rx-size/2,y+ry-size/2,size,size);}};
  plot(0,0,amber,6);for(const t of s.trail)plot(t.x,t.z,'#34615b',1);for(const e of s.enemies)plot(e.x,e.z,'#ffaf8c',5);for(const p of s.projectiles)plot(p.x,p.z,p.hostile?'#ff695e':'#ebedb7',2);
  line([[x-4,y+4],[x,y-4],[x+4,y+4]],green,2);text('6 KM',x,y+r+16,10,'#8cafab','center');
 }
 function hud(s,chase){
  const small=w<600,edge=small?16:w*.14,top=small?112:90,fs=small?13:16;
  c.shadowColor='#092c25';c.shadowBlur=small?0:2;c.shadowOffsetX=1;c.shadowOffsetY=1;
  text(String(Math.round(s.speed*I.KTS)).padStart(3,'0'),edge,top,fs+12);text('KNOTS',edge,top+17,10);
  text(Math.round(s.y*I.FT).toLocaleString(),w-edge,top,fs+12,green,'right');text('FT MSL',w-edge,top+17,10,green,'right');
  text(`${(s.vs*196.85>=0?'+':'')+Math.round(s.vs*196.85)} FPM`,w-edge,top+36,10,green,'right');
  const hdg=(s.heading/D+360)%360;text(`${String(Math.round(hdg)%360).padStart(3,'0')}°`,cx,top-22,fs,green,'center');
  for(let a=-30;a<=30;a+=10){const xx=cx+a*(small?3:4);line([[xx,top-13],[xx,top-8]],green);if(a)text(String((Math.round(hdg/10)*10+a+360)%360).padStart(3,'0'),xx,top-20,9,green,'center');}
  line([[cx-22,cy],[cx-7,cy],[cx-7,cy+4]],green,1.5);line([[cx+22,cy],[cx+7,cy],[cx+7,cy+4]],green,1.5);circle(cx,cy,2);
  c.save();c.beginPath();c.rect(cx-(small?62:130),top+44,small?124:260,h*.42);c.clip();c.translate(cx,cy);c.rotate(-s.roll);
  for(let p=-60;p<=70;p+=10){const yy=(s.pitch/D-p)*f*.01745;if(Math.abs(yy)>h*.5)continue;const len=p===0?110:65;c.setLineDash(p<0?[5,5]:[]);line([[-len,yy],[-25,yy]],green);line([[25,yy],[len,yy]],green);if(p)text(String(p),len+4,yy+3,10);}
  c.setLineDash([]);c.restore();
  // Flight-path marker is independent of nose attitude, teaching angle of attack.
  const vy=cy+(s.pitch-Math.asin(I.clamp(s.vs/Math.max(s.speed,1),-1,1)))*f;
  if(s.status==='flying'){circle(cx,vy,7);line([[cx-16,vy],[cx-7,vy]],green);line([[cx+7,vy],[cx+16,vy]],green);line([[cx,vy-7],[cx,vy-13]],green);}
  for(let j=0;j<s.enemies.length;j++){const e=s.enemies[j],p=project([e.x,e.y,e.z]);if(!p)continue;const selected=j===s.target,col=selected&&s.lock>=1?'#fff29e':'#ffc5a2',a=selected?13:9;line([[p.x,p.y-a],[p.x+a,p.y],[p.x,p.y+a],[p.x-a,p.y],[p.x,p.y-a]],col,selected?2:1);if(selected){text(`${s.lock>=1?'LOCK':'TRACK'} ${(I.distance(s,e)/1000).toFixed(1)} KM`,p.x,p.y-22,11,col,'center');}}
  if(s.enemies.length){circle(cx,cy,f*.18,'#8fb08b');text(`FOX ${s.missiles} • GUN ${s.ammo}`,cx,h*(small?.73:.70),11,amber,'center');}
  if(s.mode==='carrier'&&s.gate<3){const g=s.gates[s.gate],p=project([g.x,g.y,g.z]);if(p)text(`GATE ${s.gate+1} • ${(I.distance(s,g)/1000).toFixed(1)} KM`,I.clamp(p.x,80,w-80),I.clamp(p.y-38,150,h*.68),12,'#a6e6ff','center');}
  const nav=I.guidance(s);const ship=project([0,37,-110]);if(ship&&nav.range>650){text('CV-72',I.clamp(ship.x,40,w-40),I.clamp(ship.y-13,150,h*.7),10,amber,'center');}
  const by=h*(small?.85:.78);
  if(nav.lined&&nav.range<6000){
   const iy=h*(small?.58:.52),ix=w-(small?40:edge);line([[ix,iy-45],[ix,iy+45]],'#599781',2);line([[ix-9,iy],[ix+9,iy]],green,2);circle(ix,iy-I.clamp(nav.slope,-50,50)*.8,5,Math.abs(nav.slope)<15?green:amber);
   text('GLIDE',ix,iy+61,9,green,'center');text(`${Math.abs(Math.round(nav.slope))}m ${nav.slope>0?'HIGH':'LOW'}`,ix,iy+75,9,green,'center');
  }
  if(!chase&&!small){
   c.fillStyle='#17242d';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.86);c.lineTo(w*.15,h*.76);c.lineTo(w*.34,h*.78);c.lineTo(w*.39,h*.82);c.lineTo(w*.61,h*.82);c.lineTo(w*.66,h*.78);c.lineTo(w*.85,h*.76);c.lineTo(w,h*.86);c.lineTo(w,h);c.fill();
   line([[0,h*.86],[w*.15,h*.76],[w*.34,h*.78],[w*.39,h*.82],[w*.61,h*.82],[w*.66,h*.78],[w*.85,h*.76],[w,h*.86]],'#74818a',3);
   radar(s,w*.23,h*.88,Math.min(52,h*.085));
   const px=w*.39,py=h*.86;text('AIRFRAME / RAVEN-12',px,py,10,'#9bb0b3');text(`GEAR ${s.gear?'DN':'UP'}  FLAP ${s.flaps?'DN':'UP'}  HOOK ${s.hook?'DN':'UP'}`,px,py+22,12,s.gear&&s.hook?green:amber);text(`HULL ${Math.ceil(s.health)}%  FUEL ${Math.ceil(s.fuel)}%`,px,py+43,12);text(`CHAFF ${s.chaff}   ${s.g.toFixed(1)} G`,px,py+62,11);
   const gx=w*.77,gy=h*.885;circle(gx,gy,40,'#668a88');for(let a=-135;a<=135;a+=45){const q=(a-90)*D;line([[gx+Math.cos(q)*32,gy+Math.sin(q)*32],[gx+Math.cos(q)*38,gy+Math.sin(q)*38]],'#8cb6a9');}const a=(-135+s.throttle*270-90)*D;line([[gx,gy],[gx+Math.cos(a)*30,gy+Math.sin(a)*30]],amber,2);text(`${Math.round(s.throttle*100)}%`,gx,gy+18,13,amber,'center');text('THRUST',gx,gy+54,10,'#8cafab','center');
   // Canopy edges: leave the actual approach and deck unobstructed.
   line([[0,0],[w*.08,h*.21],[w*.12,h*.72]],'#253c46',9);line([[w,0],[w*.92,h*.21],[w*.88,h*.72]],'#253c46',9);
  }else{
   radar(s,small?w*.45:85,h-52,small?29:45);text(`THR ${Math.round(s.throttle*100)}%`,w-15,h-65,11,amber,'right');text(`G ${s.gear?'DN':'UP'} F ${s.flaps?'DN':'UP'} H ${s.hook?'DN':'UP'}`,w-15,h-46,10,green,'right');text(`HULL ${Math.ceil(s.health)} • FUEL ${Math.ceil(s.fuel)}`,w-15,h-27,10,green,'right');
  }
  text(`${(nav.range/1852).toFixed(1)} NM • CV ${String(Math.round(nav.bearing)).padStart(3,'0')}°`,cx,by-7,small?10:12,amber,'center');
  if(s.brake)text('AIRBRAKE',edge,top+40,11,amber);
  if(s.speed<58&&s.status==='flying')text('STALL — LOWER NOSE + POWER',cx,h*.3,small?12:18,'#ffd183','center');
  if(s.projectiles.some(p=>p.hostile))text('▲ MISSILE • C / CHAFF',cx,top+28,small?11:16,'#ffba9b','center');
  c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;
 }
 function draw(s,{chase=false,menu=false}={}){
  const rect=canvas.getBoundingClientRect();w=Math.max(1,Math.round(rect.width));h=Math.max(1,Math.round(rect.height));const dpr=Math.min(devicePixelRatio||1,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}c.setTransform(dpr,0,0,dpr,0,0);cx=w/2;cy=h*(w<600?.43:.43);f=Math.min(w*.8,h*.95);camera(s,chase);polys=[];
  c.fillStyle='#78a4ae';c.fillRect(0,0,w,h);c.save();c.translate(cx,cy+Math.tan(s.pitch)*f);c.rotate(-s.roll);const sky=c.createLinearGradient(0,-h,0,0);sky.addColorStop(0,'#173750');sky.addColorStop(.65,'#628fa5');sky.addColorStop(1,'#c1c7b6');c.fillStyle=sky;c.fillRect(-w*3,-h*4,w*6,h*4);c.fillStyle=sea;c.fillRect(-w*3,0,w*6,h*4);c.fillStyle='#436b79';c.fillRect(-w*3,0,w*6,3);c.restore();
  // Procedural sea facets track world space (not the camera), giving genuine motion cues.
  const step=220,baseX=Math.floor(s.x/step)*step,baseZ=Math.floor(s.z/step)*step;
  for(let ix=-12;ix<=12;ix++)for(let iz=-12;iz<=12;iz++){const x=baseX+ix*step,z=baseZ+iz*step;if(x>3500||(x>-250&&x<100&&z>-500&&z<250)||!visible([x+105,0,z],120))continue;const n=Math.sin(x*.13+z*.17);if(n>.1)poly([[x,0,z],[x+110,0,z+17],[x+210,0,z+5]],n>.7?'#286075':'#1b536a');}
  for(const m of meshes)if(visible(m.center,m.radius))poly(m.v,m.col);
  if(s.mode==='carrier')for(let j=s.gate;j<3;j++){const g=s.gates[j],r=170;for(let n=0;n<12;n++){const a=n*PI2/12,b=(n+1)*PI2/12;poly([[g.x+Math.cos(a)*r,g.y+Math.sin(a)*r,g.z],[g.x+Math.cos(b)*r,g.y+Math.sin(b)*r,g.z],[g.x+Math.cos(b)*(r-7),g.y+Math.sin(b)*(r-7),g.z],[g.x+Math.cos(a)*(r-7),g.y+Math.sin(a)*(r-7),g.z]],j===s.gate?'#8bdcec':'#437f92');}}
  for(const e of s.enemies)plane(e,'#dac8b4',1.5);if(chase)plane({...s,bank:-s.roll},'#e2e2cf',1);
  for(const p of s.projectiles)poly([[p.x-2,p.y,p.z],[p.x+2,p.y,p.z],[p.x,p.y+2,p.z+12]],p.hostile?'#ff9667':'#fff3c5');
  polys.sort((a,b)=>b.depth-a.depth);for(const p of polys){c.fillStyle=p.col;c.beginPath();p.p.forEach((a,i)=>i?c.lineTo(...a):c.moveTo(...a));c.closePath();c.fill();}
  for(const e of s.effects){const p=project([e.x,e.y,e.z]);if(!p)continue;if(e.type==='explosion'){const r=Math.min(100,50*f/p.z)*(2-e.life/2);c.fillStyle=e.life>.8?'#ffc27c':'#a58578';c.beginPath();for(let j=0;j<12;j++){let a=j*PI2/12,k=j%2?.7:1;c.lineTo(p.x+Math.cos(a)*r*k,p.y+Math.sin(a)*r*k);}c.closePath();c.fill();}else{line([[cx-40,h*.7],[cx-3,cy+3]],'#ffe7a1',2);line([[cx+40,h*.7],[cx+3,cy+3]],'#ffe7a1',2);}}
  if(!menu)hud(s,chase);if(s.status==='crashed'){c.fillStyle='#57232780';c.fillRect(0,0,w,h);}
 }
 return {draw,project};
}
const PI2=Math.PI*2;window.IronwingRenderer=renderer;
})();
