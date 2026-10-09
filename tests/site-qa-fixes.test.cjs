const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');

test('Countdown margin figures require enough horizontal and vertical room', () => {
  const css = fs.readFileSync(path.join(root, 'countdown/styles.css'), 'utf8');
  const rule = css.match(/@media \(max-width: (\d+)px\), \(max-height: (\d+)px\)\s*\{\s*\.sky-arc-container,\s*\.trail-container\s*\{\s*display: none;/);
  assert.ok(rule, 'both decorative figures share the geometry-based visibility rule');
  const minWidth = Number(rule[1]) + 1, minHeight = Number(rule[2]) + 1;
  const value = (selector, property) => {
    const block = css.match(new RegExp('(?:^|\\n)' + selector.replaceAll('.', '\\.') + '\\s*\\{([^}]+)'))[1];
    return Number(block.match(new RegExp(property + ': ([0-9.]+)px'))[1]);
  };
  const mainWidth = value('.container', 'max-width');
  const trailWidth = value('.trail', 'width');
  const trailEdge = value('.trail-container', 'left');
  const arcWidth = value('.sky-arc', 'width');
  const arcEdge = value('.sky-arc-container', 'right');
  const margin = (minWidth - mainWidth) / 2;
  assert.ok(margin >= trailEdge + trailWidth * 1.03 + 16, 'trail plus hover scale has a clear gutter');
  assert.ok(margin >= arcEdge + arcWidth * 1.05 + 16, 'arc plus hover scale has a clear gutter');
  for (const width of [320, 500, 1024, 1180, 1280, 1439]) assert.ok(width < minWidth);
  assert.ok(minHeight >= 600, 'short landscape windows do not clip the vertical trail');
  const html = fs.readFileSync(path.join(root, 'countdown/index.html'), 'utf8');
  assert.match(html, /id="milestones" role="list"/, 'primary milestone content remains available at every width');
});

test('S3 404 plan is conditional, preserves routing, supports rollback and never broadens access', () => {
  const result = spawnSync('python3', ['-B', 'tests/site-404.test.py'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
