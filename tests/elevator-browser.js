/* Local-only browser integration harness; deliberately absent from deploy.yml. */
'use strict';
const frame = document.getElementById('frame'), results = document.getElementById('results');
const wait = ms => new Promise(r => setTimeout(r, ms));
let passed = 0, failed = 0;
const check = (ok, name) => { const li = document.createElement('li'); li.className = ok ? 'pass' : 'fail'; li.textContent = `${ok ? 'PASS' : 'FAIL'} ${name}`; results.append(li); if (ok) passed++; else failed++; };
const until = async (fn, ms = 3500) => { const end = performance.now() + ms; while (!fn() && performance.now() < end) await wait(16); return fn(); };
document.getElementById('run').onclick = async () => {
  document.getElementById('run').disabled = true; results.replaceChildren(); passed = failed = 0;
  try {
    let w = frame.contentWindow, d = frame.contentDocument, s;
    const snap = () => w.Elevator86App.snapshot(), key = (code, down = true) => d.dispatchEvent(new w.KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true, cancelable: true }));
    const hold = async (code, ms) => { key(code); await wait(ms); key(code, false); };
    const click = id => d.getElementById(id).click();
    const at = (x, floor = 0) => Object.assign(s.player, { x, floor, y: w.Elevator86.floorY(floor), grounded: true, riding: null, vy: 0, invul: 0 });
    check(snap().mode === 'ready' && !d.getElementById('overlay').hidden, 'Ready screen has mission briefing and start action');
    const original = w.Elevator86.start; w.Elevator86.start = state => { s = state; original(state); };
    click('primary'); await wait(100);
    check(snap().mode === 'playing' && d.activeElement.id === 'game', 'Begin mission focuses game and starts simulation');
    s.enemies = []; s.spawnClock = 1e6;
    const initialX = snap().player.x; await hold('ArrowRight', 160);
    check(snap().player.x > initialX + 15, 'Held keyboard movement advances player');
    key('KeyP'); const pauseTime = snap().time; await wait(220);
    check(snap().paused && snap().time === pauseTime, 'Pause freezes world, hazards and mission clock');
    click('primary'); await wait(60); check(!snap().paused, 'Resume returns to active mission');
    at(98); await hold('KeyE', 700);
    check(snap().docs[0].taken && snap().score === 500, 'Hold USE steals a file and updates score / objective');
    key('Space'); await wait(150); key('Space', false);
    check(snap().player.y < w.Elevator86.floorY(0) - 25, 'Jump moves player above bullet height'); await wait(650);
    at(246); key('ArrowDown'); await until(() => snap().player.floor === 1); key('ArrowDown', false);
    check(snap().player.floor === 1 && snap().player.riding === null, 'Real Down input rides and stops on the next floor');
    at(150, 1); s.health = 3; s.bullets = [{x:100,y:s.player.y-24,vx:210,hostile:true,life:2}]; await hold('ArrowDown', 450);
    check(snap().health === 3 && snap().player.crouch, 'Crouching under an enemy shot prevents damage');
    at(150,1); s.bullets = [{x:120,y:s.player.y-24,vx:210,hostile:true,life:2}]; await wait(250);
    check(snap().health === 2, 'Standing in the same shot takes one health');
    const scoreBefore = s.score; s.enemies = [{x:250,y:s.player.y,floor:1,dir:-1,speed:0,cool:99,aim:0,alive:true,stun:0,walk:0}]; s.player.dir = 1; await hold('KeyX', 500);
    check(snap().score > scoreBefore && s.kills === 1, 'Fire kills a guard and awards points');
    click('sound'); const muted = snap().muted; const xBefore = s.player.x; await hold('ArrowRight',150);
    check(s.player.x > xBefore && d.activeElement.id === 'game', 'Mute button returns focus so keyboard movement keeps working');
    check(d.getElementById('sound').getAttribute('aria-pressed') === String(muted), 'Mute state and accessible pressed state agree');
    // Win fixture starts beside the last legitimate objective. Collection and
    // escape still go through normal UI input and production rules.
    s.docs.forEach((file, i) => { file.taken = i < s.docs.length - 1; }); const last = s.docs.at(-1); at(last.x,last.floor); await hold('KeyE',700);
    check(s.docs.every(file=>file.taken), 'Last file unlocks getaway objective');
    at(645,s.floors-1); await hold('ArrowRight',150); await wait(80);
    check(snap().mode === 'escaped' && d.getElementById('panel-title').textContent === 'CLEAN GETAWAY.', 'Reaching car with every file opens victory screen');
    const victoryScore = s.score; click('primary'); await wait(100);
    check(snap().level === 2 && snap().floors === 9 && snap().score === victoryScore, 'Next mission escalates building and carries the run score');
    s.enemies=[]; s.spawnClock=1e6; at(150); s.health=1; s.lives=1; s.bullets=[{x:120,y:s.player.y-24,vx:210,hostile:true,life:2}]; await wait(300);
    check(snap().mode === 'gameover' && d.getElementById('panel-title').textContent === 'BUSTED.', 'Final hit opens loss screen without running behind the dialog');
    click('primary'); await wait(100);
    check(snap().level === 1 && snap().score === 0 && snap().lives === 3, 'Try again fully resets run state');
    const currentTime = s.time; click('restart'); await wait(100);
    check(snap().overlay === 'restart' && s.time < currentTime + .03, 'Restart confirmation safely freezes the current run');
    click('secondary'); check(snap().overlay === null && !snap().paused, 'Cancel restart resumes the same run');
    for(let i=0;i<3;i++){click('restart');click('primary');await wait(40);}
    check(snap().lives === 3 && snap().level === 1 && snap().time < .15, 'Three consecutive restarts do not leak game state or loops');
    // Simultaneous touch-like PointerEvents exercise per-pointer bookkeeping,
    // cancellation and hold behavior. This is emulation, not a real device.
    const right=d.querySelector('[data-action="right"]'), fire=d.querySelector('[data-action="fire"]');
    const pointer=(el,type,id)=>el.dispatchEvent(new w.PointerEvent(type,{pointerId:id,pointerType:'touch',bubbles:true,cancelable:true}));
    // Synthetic pointers cannot be captured by the browser. Stub capture only
    // in this test realm; CUA separately tests the actual touch UI visually.
    right.setPointerCapture=()=>{}; fire.setPointerCapture=()=>{}; const touchX=s.player.x;
    pointer(right,'pointerdown',11); pointer(fire,'pointerdown',12); await wait(180);
    check(s.player.x > touchX + 10 && s.bullets.length>0, 'Two touch pointers can move and fire simultaneously');
    pointer(right,'pointercancel',11);pointer(fire,'pointerup',12);const releasedX=s.player.x;await wait(130);
    check(s.player.x === releasedX && !right.classList.contains('held'), 'Touch cancel/up releases controls without stuck movement');
    w.dispatchEvent(new w.Event('blur'));const blurTime=s.time;await wait(100);
    check(snap().paused && s.time===blurTime, 'Losing window focus pauses and clears held inputs');
    click('primary');const savedBest=snap().best;
    await new Promise(resolve=>{frame.onload=resolve;frame.src='/elevator/?audit=reload';});w=frame.contentWindow;d=frame.contentDocument;
    check(snap().best===savedBest && savedBest>=victoryScore, 'Best score survives reload');
    check(snap().muted===muted, 'Sound preference survives reload');
    check(snap().mode==='ready','Reload starts cleanly at briefing');
    // Layout checks in three realistic phone widths and a small landscape.
    for(const [width,height] of [[320,700],[390,844],[768,1024],[844,390]]){
      frame.style.width=width+'px';frame.style.height=height+'px';await wait(100);
      const rect=d.getElementById('game').getBoundingClientRect(), controls=d.getElementById('touch-controls').getBoundingClientRect();
      check(d.documentElement.scrollWidth<=width+1, `${width}×${height}: no horizontal overflow`);
      check(rect.width>=Math.min(290,width-44) && rect.height>=200, `${width}×${height}: readable game viewport`);
      if(width<=700){check(controls.height>=90,`${width}×${height}: visible touch pad`);check(controls.bottom<=height+2,`${width}×${height}: thumb controls fit without scrolling`);const targets=[...d.querySelectorAll('[data-action]')].map(b=>b.getBoundingClientRect());check(targets.every(r=>r.width>=44&&r.height>=44),`${width}×${height}: all touch controls at least 44px`);}
      const panel=d.querySelector('.panel').getBoundingClientRect(),screen=d.getElementById('screen').getBoundingClientRect();check(panel.top>=screen.top-1&&panel.bottom<=screen.bottom+1,`${width}×${height}: briefing fits inside game screen`);
    }
  } catch(error) { check(false, error.stack || String(error)); }
  document.getElementById('summary').textContent=`${passed} passed, ${failed} failed. ${failed?'Fix failures before shipping.':'All browser integration checks passed.'}`;
  document.getElementById('run').disabled=false;
};
