// Spec tests for the live-story driver (Task 3B): js/story.js is created,
// loaded from index.html exactly once, and implements the behavior contract
// (6 beats, offline beat 5, resync beat 6, reading-paced timer, rail
// buttons pausing auto-advance, IntersectionObserver threshold 0.35, SMIL
// clock paused off-screen, reduced-motion static finale).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { readText, norm, occurrences, REPO_ROOT } from './helpers.mjs';

const storyExists = (() => {
  try {
    readFileSync(new URL('../js/story.js', import.meta.url), 'utf8');
    return true;
  } catch {
    return false;
  }
})();

function storyText() {
  return readText('js/story.js');
}

const HTML = readText('index.html');

test('js/story.js exists', () => {
  assert.ok(storyExists, 'js/story.js was not created');
});

test('story.js is valid JavaScript', () => {
  if (!storyExists) return;
  assert.doesNotThrow(() => new vm.Script(storyText()));
});

test('story.js defines the six-beat offline/resync contract', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(n.includes('FINAL_STEP = 6'), 'final step must be 6');
  assert.ok(n.includes('OFFLINE_STEP = 5'), 'offline beat must be 5');
  assert.ok(
    n.includes("classList.toggle('is-offline', n === OFFLINE_STEP)"),
    'beat 5 must toggle is-offline on the stage',
  );
  assert.ok(
    n.includes("classList.toggle('is-resync', n === FINAL_STEP)"),
    'beat 6 must toggle is-resync on the stage',
  );
});

test('story.js runs on a reading-paced auto-advance timer', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(n.includes('var FIRST_BEAT_MS = 2200'), 'first beat duration is 2200ms');
  assert.ok(n.includes('function beatDuration(step)'), 'beat duration helper exists');
  assert.ok(n.includes('setTimeout(advanceStory, beat)'), 'advance schedules the next beat');
});

test('story.js advances beats only while the stage is in view', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(n.includes('new IntersectionObserver'), 'uses IntersectionObserver');
  assert.ok(n.includes('threshold: 0.35'), 'observer threshold must be 0.35');
  assert.ok(
    n.includes('setSvgRunning(entry.isIntersecting)'),
    'SMIL clock must follow visibility',
  );
  assert.ok(
    n.includes('storySvg.pauseAnimations()') && n.includes('storySvg.unpauseAnimations()'),
    'SMIL clock must pause when off-screen',
  );
  assert.ok(n.includes('pauseStory()'), 'auto-advance must pause off-screen');
});

test('story.js rail buttons jump to a beat and pause auto-advance ~9s', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(
    n.includes('setStoryStep(parseInt(btn.dataset.stepBtn, 10), 9800)'),
    'clicking a rail button jumps with a 9800ms beat',
  );
  assert.ok(n.includes('pauseStory(9000)'), 'clicking a rail button pauses for ~9s');
});

test('story.js reduced-motion mode shows beat 6 statically', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(n.includes('prefersReduced'), 'must read prefers-reduced-motion');
  assert.ok(n.includes('if (prefersReduced)'), 'must branch on reduced motion');
  assert.ok(
    n.includes('setStoryStep(FINAL_STEP)') && n.includes('setSvgRunning(false)'),
    'reduced motion must show the resync finale statically',
  );
});

test('story.js updates watchers, your score, desk score, and caption per beat', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  for (const token of [
    'WATCHERS_BY_STEP', 'YOU_SCORES', 'DESK_SCORES', 'CAPTIONS',
    "data-watchers", "data-youscore", "data-deskscore",
    "data-caption-time", "data-caption-text",
  ]) {
    assert.ok(n.includes(token), `missing ${token}`);
  }
});

test('story.js guards against a missing stage', () => {
  if (!storyExists) return;
  const n = norm(storyText());
  assert.ok(n.includes("if (!storyStage) return;"), 'must bail when the stage is absent');
});

test('index.html loads js/story.js exactly once', () => {
  assert.equal(occurrences(HTML, 'src="js/story.js"'), 1);
  assert.ok(HTML.includes('<script src="js/story.js" defer></script>'), 'script tag must be deferred');
});

test('story stage appears on the homepage once', () => {
  assert.equal(occurrences(HTML, 'bth-story-stage'), 1);
});

test('js/ holds exactly the three pre-existing files plus story.js', () => {
  const files = readdirSync(new URL('../js/', import.meta.url)).sort();
  assert.deepEqual(files, ['ab-testing.js', 'analytics.js', 'main.js', 'story.js']);
});

// Regression coverage for Task 2 (2026-08-31 plan): pulse dots must be
// gated to the beat their link fires on, never hard-coded is-on.
function storySvg() {
  const m = HTML.match(/<svg class="bth-story-links"[\s\S]*?<\/svg>/);
  assert.ok(m, 'story SVG not found');
  return m[0];
}
const STORY_SVG = storySvg();

test('no bth-pulse element carries a literal is-on class', () => {
  const svg = STORY_SVG;
  const tags = svg.match(/<circle class="bth-pulse[^>]*>/g) || [];
  assert.ok(tags.length > 0, 'expected at least one bth-pulse circle');
  for (const tag of tags) {
    assert.ok(!/\bis-on\b/.test(tag), `pulse must not hard-code is-on: ${tag}`);
  }
});

test('every .bth-pulse-cloud circle declares a data-on attribute', () => {
  const svg = STORY_SVG;
  const tags = svg.match(/<circle class="bth-pulse bth-pulse-cloud[^>]*>/g) || [];
  assert.ok(tags.length > 0, 'expected at least one bth-pulse-cloud circle');
  for (const tag of tags) {
    assert.ok(/data-on="\d+"/.test(tag), `cloud pulse must declare data-on: ${tag}`);
  }
});

test('each cloud pulse data-on matches the linkset data-on of the path it follows', () => {
  const svg = STORY_SVG;

  const linksetByPathId = {};
  const linksetRe = /<g class="bth-linkset" data-on="(\d+)">([\s\S]*?)<\/g>/g;
  let lm;
  while ((lm = linksetRe.exec(svg))) {
    const [, dataOn, body] = lm;
    const pathMatch = body.match(/<path id="([^"]+)"/);
    if (pathMatch) linksetByPathId[pathMatch[1]] = dataOn;
  }
  assert.ok(Object.keys(linksetByPathId).length > 0, 'expected at least one linkset');

  const cloudTags = svg.match(/<circle class="bth-pulse bth-pulse-cloud[^>]*>[\s\S]*?<\/circle>/g) || [];
  assert.ok(cloudTags.length > 0, 'expected at least one cloud pulse');
  for (const tag of cloudTags) {
    const dataOn = tag.match(/data-on="(\d+)"/);
    const href = tag.match(/<mpath href="#([^"]+)">/);
    assert.ok(dataOn && href, `cloud pulse missing data-on or mpath href: ${tag}`);
    assert.equal(
      dataOn[1],
      linksetByPathId[href[1]],
      `pulse targeting #${href[1]} must match its linkset's data-on`,
    );
  }
});

test('.bth-pulse-local circles declare no data-on (offline-only, CSS-driven)', () => {
  const svg = STORY_SVG;
  const tags = svg.match(/<circle class="bth-pulse bth-pulse-local[^>]*>/g) || [];
  assert.ok(tags.length > 0, 'expected at least one bth-pulse-local circle');
  for (const tag of tags) {
    assert.ok(!/data-on=/.test(tag), `local pulse must not declare data-on: ${tag}`);
  }
});

test('every mpath href in the story SVG resolves to an existing id', () => {
  const svg = STORY_SVG;
  const hrefs = [...svg.matchAll(/<mpath href="#([^"]+)">/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0, 'expected at least one mpath');
  const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const href of hrefs) {
    assert.ok(ids.has(href), `mpath href #${href} has no matching id in the story SVG`);
  }
});