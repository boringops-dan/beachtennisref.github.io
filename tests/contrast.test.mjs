// Contrast contract for the Beach Day theme. Colors are resolved from the
// declared CSS (tokens, scoped token overrides, rule declarations) and the
// real WCAG ratio is computed, so a pairing that drifts below the floor
// fails here instead of on a phone in the sun.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, rootBlock } from './helpers.mjs';

const CSS = readText('css/style.css');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function tokensIn(block) {
  const out = {};
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) out[m[1]] = m[2].trim();
  return out;
}

const ROOT = tokensIn(rootBlock(CSS));

// Exact-selector rule lookup; the LAST declaration wins, as in the cascade.
function rules(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`, 'g');
  return [...CSS.matchAll(re)].map((m) => m[1]);
}

function decl(selector, prop) {
  let value = null;
  for (const block of rules(selector)) {
    for (const m of block.matchAll(/(?:^|;)\s*([a-z-]+)\s*:\s*([^;]+)/g)) {
      if (m[1] === prop) value = m[2].trim();
    }
  }
  if (value === null) throw new Error(`${prop} not declared on ${selector}`);
  return value;
}

function resolve(value, scope = {}) {
  const tokens = { ...ROOT, ...scope };
  let v = value;
  for (let i = 0; i < 6 && v.startsWith('var('); i += 1) {
    const name = v.match(/var\((--[a-z0-9-]+)/i)[1];
    v = tokens[name];
    if (!v) throw new Error(`unresolved token ${name}`);
  }
  const hex = v.match(/#[0-9a-f]{6}/i);
  if (!hex) throw new Error(`no solid color in "${value}"`);
  return hex[0].toUpperCase();
}

const STORY_SCOPE = tokensIn(rules('.bth-story')[0]);

function pair(selector, { scope, bgSelector } = {}) {
  const fg = resolve(decl(selector, 'color'), scope);
  const bg = resolve(decl(bgSelector || selector, 'background'), scope);
  return { fg, bg, r: ratio(fg, bg) };
}

function assertAA(label, fg, bg, floor = 4.5) {
  const r = ratio(fg, bg);
  assert.ok(r >= floor, `${label}: ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${floor}:1`);
}

// The reported bug: `body .navbar a { color }` out-specified the nav CTA's
// own label color, painting cream text on a cream pill. Nothing may set a
// color on every link in the navbar again; links color themselves.
// Any selector ending in a bare "a" under the nav (".navbar a",
// ".nav-links a:hover") out-specifies ".btn-*" and repaints the CTA pills.
function blanketNavLinkRules(prop) {
  const out = [];
  for (const m of CSS.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!new RegExp(`(^|;)\\s*${prop}\\s*:`).test(m[2])) continue;
    for (const sel of m[1].split(',').map((x) => x.trim())) {
      if (/\.(navbar|nav-links|nav-cta)\b[^,]*\sa(:[a-z-]+)*$/.test(sel)) out.push(sel);
    }
  }
  return out;
}

test('no rule colors every navbar link wholesale', () => {
  const offenders = blanketNavLinkRules('color');
  assert.deepEqual(offenders, [], `a blanket nav-link color overrides button labels: ${offenders.join(' | ')}`);
});

test('no rule paints a background on every navbar link', () => {
  const offenders = blanketNavLinkRules('background');
  assert.deepEqual(offenders, [], `a blanket nav-link background wipes the CTA fill: ${offenders.join(' | ')}`);
});

test('nav primary CTA label is legible on its pill', () => {
  const { fg, bg } = pair('body .btn-primary');
  assertAA('nav Start Scoring Free', fg, bg);
});

test('nav Log In label is legible on the navbar ground', () => {
  const fg = resolve(decl('body .btn-outline', 'color'));
  const navBg = decl('body .navbar', 'background');
  const m = navBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const toHex = (n) => Number(n).toString(16).padStart(2, '0');
  const bg = m ? `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`.toUpperCase() : resolve(navBg);
  assertAA('nav Log In', fg, bg);
});

test('nav primary hover keeps its label legible', () => {
  const { fg, bg } = pair('body .btn-primary:hover');
  assertAA('nav CTA hover', fg, bg);
});

test('hero and final CTA pills are legible', () => {
  const hero = pair('.bth-pill-btn');
  assertAA('hero CTA', hero.fg, hero.bg);
  const fin = pair('.bth-final .bth-pill-btn');
  assertAA('final CTA', fin.fg, fin.bg);
});

test('pricing buttons and the highlighted card are legible', () => {
  const hi = pair('.bth-price-btn-hi');
  assertAA('Choose Yearly', hi.fg, hi.bg);
  const fg = resolve(decl('.bth-price-btn', 'color'));
  const card = resolve(decl('.bth-price-card', 'background'));
  assertAA('Choose Weekly/Monthly', fg, card);
  const flag = pair('.bth-price-flag');
  assertAA('Most popular flag', flag.fg, flag.bg);
  const hiCard = resolve(decl('.bth-price-card-hi', 'background'));
  assertAA('highlighted price', resolve(decl('.bth-price-card-hi', 'color')), hiCard);
});

test('every text token holds AA on every light ground', () => {
  for (const text of ['--text', '--text-secondary', '--text-muted']) {
    for (const ground of ['--bg', '--bg-warm', '--bg-elevated']) {
      assertAA(`${text} on ${ground}`, resolve(`var(${text})`), resolve(`var(${ground})`));
    }
  }
});

test('the live-story stage keeps AA inside its night-sea token scope', () => {
  for (const text of ['--text', '--text-secondary', '--text-muted', '--accent']) {
    for (const ground of ['--bg-warm', '--bg-elevated']) {
      assertAA(`story ${text} on ${ground}`, resolve(`var(${text})`, STORY_SCOPE), resolve(`var(${ground})`, STORY_SCOPE));
    }
  }
  const tag = pair('.bth-node-down-tag', { scope: STORY_SCOPE });
  assertAA('OFFLINE tag', tag.fg, tag.bg);
  const stamp = pair('.bth-story-stamp', { scope: STORY_SCOPE });
  assertAA('STILL WORKS stamp', stamp.fg, stamp.bg);
});

test('the sea sections keep foam text legible', () => {
  assertAA('rules section', resolve(decl('.bth-rules', 'color')), resolve(decl('.bth-rules', 'background')));
  assertAA('interior CTA band', resolve('var(--foam)'), resolve(decl('body .cta-section', 'background')));
  assertAA('interior CTA button', resolve(decl('body .cta-section .btn-primary', 'color')), resolve(decl('body .cta-section .btn-primary', 'background')));
  assertAA('comparison table head', resolve(decl('body .comparison-table th', 'color')), resolve(decl('body .comparison-table th', 'background')));
});

test('the hero headline is legible on the lightest sky stop', () => {
  const h1 = resolve(decl('.bth-hero-h1', 'color'));
  const sky = decl('.bth-hero', 'background');
  const stops = [...sky.matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0]);
  assert.ok(stops.length >= 2, 'hero sky must be a gradient');
  for (const stop of stops) assertAA(`hero h1 on ${stop}`, h1, stop.toUpperCase());
});

test('the final band headline is legible on every sunset stop', () => {
  const h2 = resolve(decl('.bth-final-h2', 'color'));
  const stops = [...decl('.bth-final', 'background').matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0]);
  assert.ok(stops.length >= 2, 'final band must be a gradient');
  for (const stop of stops) assertAA(`final h2 on ${stop}`, h2, stop.toUpperCase(), 3);
});
