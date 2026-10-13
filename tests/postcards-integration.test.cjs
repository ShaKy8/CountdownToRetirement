'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('postcards-in-sound/index.html');
const js = read('postcards-in-sound/app.js');
const data = JSON.parse(read('postcards-in-sound/content.json'));

test('Postcards uses only a same-origin stamped script under the existing CSP', () => {
  assert.equal((html.match(/<script\b/g) || []).length, 1);
  assert.match(html, /<script id="app-script" src="app\.js\?v=[a-f0-9]{10}"><\/script>/);
  assert.doesNotMatch(html, /\son\w+=/);
  assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
  assert.match(js, /const STORE_KEY='postcards-in-sound-v1'/);
  assert.doesNotMatch(js, /localStorage\.clear\(/);
});

test('Production includes all Postcards assets and future path updates', () => {
  const deploy=read('.github/workflows/deploy.yml');
  assert.ok(deploy.includes("- 'postcards-in-sound/**'"));
  for(const file of ['index.html','app.js','content.json']) assert.ok(deploy.includes(`--include 'postcards-in-sound/${file}'`), file);
  assert.ok(read('scripts/stamp-assets.mjs').includes("'postcards-in-sound/index.html'"));
  assert.ok(read('index.html').includes('href="/postcards-in-sound/">Make Postcards in Sound</a>'));
  assert.ok(read('sitemap.xml').includes('https://branyontech.com/postcards-in-sound/'));
});

test('Published musical content matches the embedded immutable six-card seed', () => {
  const embedded = JSON.parse(js.match(/const DATA = (.*?);\n/s)[1]);
  assert.deepEqual(embedded,data);
  assert.equal(data.cards.length,6);
  for(const card of data.cards) assert.equal(card.progression.length,8);
  assert.doesNotMatch(JSON.stringify(data), /"(?:draft|sketches|savedAt|instanceId)":/);
});

test('Offline export embeds the running code and removes its network script source', () => {
  assert.match(js,/appScript\.removeAttribute\('src'\)/);
  assert.match(js,/appScript\.textContent='\('\+postcardsStudio\.toString\(\)\+'\)\(\);'/);
  const context = vm.createContext({});
  vm.runInContext(js.replace(/\npostcardsStudio\(\);\s*$/, ''), context);
  const serialized = vm.runInContext("'('+postcardsStudio.toString()+')();'", context);
  assert.match(serialized, /^\(function postcardsStudio\(\)/);
  assert.doesNotMatch(serialized, /<\/script/i);
  assert.doesNotThrow(() => new vm.Script(serialized));
  assert.ok(serialized.includes('function exportOffline()'));
  assert.ok(serialized.includes("clone.querySelectorAll('#offline-state')"));
  assert.ok(serialized.includes(".replace(/</g,'\\\\u003c')"));
});
