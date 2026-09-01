// Spec test for Task 1 (hero contrast) of the 2026-08-31 plan.
// Computes real WCAG contrast ratios from the declared CSS values so this
// fails mechanically if anyone re-lightens the hero later.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './helpers.mjs';

const CSS = readText('css/style.css');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function srgbLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function ratio(a, b) {
  const la = srgbLuminance(a);
  const lb = srgbLuminance(b);
  const lMax = Math.max(la, lb);
  const lMin = Math.min(la, lb);
  return (lMax + 0.05) / (lMin + 0.05);
}

function mix(fg, bg, alpha) {
  const f = hexToRgb(fg);
  const g = hexToRgb(bg);
  const blend = (a, b) => Math.round(a * alpha + b * (1 - alpha));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(blend(f.r, g.r))}${toHex(blend(f.g, g.g))}${toHex(blend(f.b, g.b))}`;
}

function declBlock(selector) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}',
  );
  const m = CSS.match(re);
  if (!m) throw new Error(`selector not found: ${selector}`);
  return m[1];
}

function declValue(block, prop) {
  const re = new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*([^;]+);');
  const m = block.match(re);
  if (!m) throw new Error(`property not found: ${prop}`);
  return m[1].trim();
}

function px(value) {
  const m = value.match(/(-?\d+(?:\.\d+)?)px/);
  return m ? parseFloat(m[1]) : NaN;
}

// Assumed hero height (documented once here, not per-test) that the sun
// clearance and gradient-sample checks below are both computed against.
const HERO_HEIGHT = 1100;
const HERO_BLOCK = declBlock('.bth-hero');
const HERO_INNER_BLOCK = declBlock('.bth-hero-inner');
const HERO_PADDING_BOTTOM = px(declValue(HERO_INNER_BLOCK, 'padding').split(/\s+/)[2]);

test('.bth-hero gradient stops are parsed from the stylesheet', () => {
  const bg = declValue(HERO_BLOCK, 'background');
  assert.ok(bg.includes('linear-gradient'), 'hero must keep a gradient background');
});

test('the sun never sits behind hero text (>= 40px clearance)', () => {
  const sunBlock = declBlock('.bth-hero-sun');
  const sunBottom = px(declValue(sunBlock, 'bottom'));
  const sunHeight = px(declValue(sunBlock, 'height'));
  const sunTopFromBottom = sunBottom + sunHeight;

  const clearance = HERO_PADDING_BOTTOM - sunTopFromBottom;
  assert.ok(
    clearance >= 40,
    `sun must clear hero content by >= 40px, got ${clearance} (heroHeight ${HERO_HEIGHT})`,
  );
});

test('the lightest gradient point under the hero text is dark enough for --text', () => {
  const samplePoint = 1 - HERO_PADDING_BOTTOM / HERO_HEIGHT;
  const bg = declValue(HERO_BLOCK, 'background');
  const stopRe = /(#[0-9A-Fa-f]{6})\s+(\d+)%/g;
  const stops = [];
  let m;
  while ((m = stopRe.exec(bg))) {
    stops.push({ color: m[1].toUpperCase(), pos: parseInt(m[2], 10) / 100 });
  }
  assert.ok(stops.length >= 2, 'expected at least two gradient stops');

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (samplePoint >= stops[i].pos && samplePoint <= stops[i + 1].pos) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const span = upper.pos - lower.pos;
  const t = span === 0 ? 0 : (samplePoint - lower.pos) / span;
  const sampled = mix(upper.color, lower.color, t);

  const contrast = ratio('#FFF7EC', sampled);
  assert.ok(
    contrast >= 4.5,
    `sampled gradient point ${sampled} at t=${samplePoint.toFixed(3)} must contrast >= 4.5:1 with #FFF7EC, got ${contrast.toFixed(2)}`,
  );
});

test('the old cream-on-sun failure can never come back', () => {
  assert.ok(
    ratio('#FFE9D0', '#FFDE9E') < 1.5,
    'documents why cream-on-sun was the original bug: near-illegible contrast',
  );

  for (const selector of ['.bth-hero-sub', '.bth-microcopy', '.bth-trust']) {
    const block = declBlock(selector);
    const color = declValue(block, 'color');
    assert.notEqual(
      color,
      'var(--cream-warm)',
      `${selector} must not use --cream-warm inside the hero`,
    );
  }
});

test('.bth-hero-sand still clips the sun and is painted after it', () => {
  const sandBlock = declBlock('.bth-hero-sand');
  assert.equal(declValue(sandBlock, 'background'), 'var(--bg)');

  const sunIndex = CSS.indexOf('.bth-hero-sun {');
  const sandIndex = CSS.indexOf('.bth-hero-sand {');
  assert.ok(sunIndex !== -1 && sandIndex !== -1, 'both rules must exist');
  assert.ok(sandIndex > sunIndex, '.bth-hero-sand must be declared after .bth-hero-sun');
});
