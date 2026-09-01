// Regression coverage for Task 4 (2026-08-31 plan): the homepage's fake
// hand-drawn scorecard and empty device frames are replaced by real,
// rig-captured screenshots.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readText, mainRegion, REPO_ROOT } from './helpers.mjs';
import { join } from 'node:path';

const HTML = readText('index.html');
const MAIN = mainRegion(HTML);

test('index.html contains no bth-scorecard element (the fake card is gone)', () => {
  assert.ok(!MAIN.includes('class="bth-scorecard"'));
  assert.ok(!/<div class="bth-scorecard">/.test(MAIN));
});

test('every .bth-device in index.html contains exactly one <img>', () => {
  const deviceTags = MAIN.match(/<div class="bth-device bth-device-\w+">[\s\S]*?<\/div>/g) || [];
  assert.ok(deviceTags.length === 3, 'expected exactly three device frames');
  for (const tag of deviceTags) {
    const imgCount = (tag.match(/<img\b/g) || []).length;
    assert.equal(imgCount, 1, `device frame must contain exactly one <img>: ${tag}`);
  }
});

test('every <img src="images/...\"> in index.html points at a file that exists on disk', () => {
  const srcs = [...HTML.matchAll(/<img[^>]+src="(images\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length > 0, 'expected at least one images/ reference');
  for (const src of srcs) {
    assert.ok(existsSync(join(REPO_ROOT, src)), `${src} does not exist on disk`);
  }
});

test('every <img> in index.html has alt, width, height, and loading=lazy where required', () => {
  const imgTags = HTML.match(/<img\b[^>]*>/g) || [];
  assert.ok(imgTags.length > 0, 'expected at least one <img>');
  for (const tag of imgTags) {
    assert.match(tag, /\balt="[^"]+"/, `missing non-empty alt: ${tag}`);
    assert.match(tag, /\bwidth="\d+"/, `missing width: ${tag}`);
    assert.match(tag, /\bheight="\d+"/, `missing height: ${tag}`);
    assert.match(tag, /\bloading="lazy"/, `missing loading=lazy: ${tag}`);
  }
});

test('no hand-authored scoreboard mock has crept back', () => {
  assert.ok(!HTML.includes('Ana &amp; Marta'));
  assert.ok(!HTML.includes('Luca &amp; Rafa'));
  assert.ok(!HTML.includes('class="bth-team-name"'));
});
