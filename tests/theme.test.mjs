// Spec tests for the shared stylesheet: the Beach Day token set, its
// override layer, the BTH homepage and BTT template layers, and the
// CSS-structure gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, rootBlock, norm, occurrences, REPO_ROOT } from './helpers.mjs';

const CSS = readText('css/style.css');
const CSS_NORM = norm(CSS);

const OLD_LITERALS = ['#09090b', '#0d0b0a', '#fafafa', '#a1a1aa', '#52525b'];

// Every Beach Day token VALUE inside the :root block (name -> exact value).
// Radius variables are asserted separately below.
const TOKENS = {
  '--primary': '#C2402F',
  '--primary-dark': '#A33424',
  '--primary-light': '#E8604C',
  '--accent': '#0B6E78',
  '--accent-light': '#FFC933',
  '--success': '#1F8A4C',
  '--warning': '#FFC933',
  '--rose': '#E8604C',
  '--bg': '#F2FBFA',
  '--bg-warm': '#F7E8C8',
  '--bg-elevated': '#FFFFFF',
  '--text': '#0C2E35',
  '--text-secondary': '#3B5A60',
  '--text-muted': '#4A646B',
  '--glass-bg': '#FFFFFF',
  '--glass-bg-hover': '#FFFDF6',
  '--glass-border': '#D5E8E6',
  '--glass-border-hover': '#0B6E78',
  '--glass-specular': 'rgba(255, 255, 255, 0)',
  '--glass-blur': '0px',
  '--glass-saturate': '100%',
  '--gradient-primary': 'linear-gradient(135deg, #0B6E78, #0E8C8F)',
  '--gradient-warm': 'linear-gradient(135deg, #FFC933, #F0584A)',
  "--font-display": "'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif",
  "--font-body": "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif",
  '--ink': '#0C2E35',
  '--sea': '#0B6E78',
  '--sky': '#8EE3E6',
  '--sand': '#F5E3BD',
  '--sun': '#FFC933',
  '--coral': '#F0584A',
  '--foam': '#FFFAF0',
};

// The purple dusk palette the Beach Day redesign replaced. None of it may
// come back as a token or a literal.
const PURPLE_LITERALS = ['#1E1230', '#241539', '#2B1B4D', '#322050', '#3C2865', '#7A2E63', '#4A2058', '#C9B8D6', '#9C8BAC', '#150C22', '#1A0F2B'];

// Selectors present in css/style.css at the base commit (Task 1 Step 3
// snapshot). Task 9 Step 2 forbids renaming or removing any of them.
const BASELINE_SELECTORS = [
  '.animate-in', '.app-figure', '.audience-benefits', '.benefit-card',
  '.breadcrumb', '.btn', '.btn-large', '.btn-outline', '.btn-primary',
  '.btn-secondary', '.btn-small', '.comparison-table', '.container',
  '.cta-buttons', '.cta-content', '.cta-section', '.cta-video',
  '.cta-video-link', '.deep-dive', '.device-frame', '.device-frame--hero',
  '.faq-answer', '.faq-item', '.faq-list', '.faq-question', '.feature-card',
  '.feature-demo', '.feature-demo-video', '.feature-icon', '.feature-link',
  '.feature-link-row', '.features-grid', '.footer', '.footer-bottom',
  '.footer-brand', '.footer-grid', '.footer-links', '.free-tier-banner',
  '.hero-buttons', '.hero-description', '.hero-home', '.hero-microcopy',
  '.hero-pill', '.hero-pills', '.hero-screenshot', '.hero-subline',
  '.hero-text', '.hero-v7', '.hero-visual', '.legal-prose', '.logo',
  '.logo-hi', '.logo-icon', '.mega-headline', '.mobile-toggle', '.nav-cta',
  '.nav-links', '.navbar', '.plan-persona', '.plan-savings',
  '.price-card-bold', '.pricing-bold', '.problem-card', '.problem-grid',
  '.problem-icon', '.section', '.section-header', '.section-label',
  '.skip-link', '.step', '.step-content', '.step-number', '.step-visual',
  '.steps', '.trust-bar', '.trust-icon', '.trust-item', '.use-case-card',
  '.use-cases-grid', '.video-lightbox', '.video-lightbox-close',
  '.video-lightbox-inner', '#features',
];

function currentSelectors() {
  const re = /^[ \t]*([.#][a-zA-Z][a-zA-Z0-9_-]*)/gm;
  const out = new Set();
  for (const m of CSS.matchAll(re)) out.add(m[1]);
  return out;
}

test('font import is the first line of style.css', () => {
  const firstLine = CSS.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
  assert.ok(
    firstLine.startsWith("@import url('https://fonts.googleapis.com/css2?family=Bricolage"),
    `expected the Bricolage Grotesque @import as the first line, got: ${firstLine}`,
  );
  assert.match(firstLine, /Instrument\+Sans/);
});

test('Bricolage import appears exactly once', () => {
  assert.equal(occurrences(CSS, 'fonts.googleapis.com/css2?family=Bricolage'), 1);
});

test('every Beach Day token value is set in the :root block', () => {
  const block = norm(rootBlock(CSS));
  assert.ok(block, 'expected a :root { ... } block');
  for (const [name, value] of Object.entries(TOKENS)) {
    assert.match(
      block,
      new RegExp(`${name}\\s*:\\s*${norm(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`),
      `expected :root to define ${name} as "${value}"`,
    );
  }
});

test('radius tokens are kept unchanged', () => {
  const block = norm(rootBlock(CSS));
  for (const [name, value] of [
    ['--radius-xl', '24px'],
    ['--radius-lg', '18px'],
    ['--radius-md', '12px'],
    ['--radius-sm', '8px'],
    ['--radius-pill', '100px'],
  ]) {
    assert.match(block, new RegExp(`${name}\\s*:\\s*${value}\\s*;`));
  }
});

test('film-grain / noise overlay is gone', () => {
  assert.ok(!/grain/i.test(CSS), 'style.css must not mention "grain"');
  assert.ok(!/noise/i.test(CSS), 'style.css must not mention "noise"');
  assert.ok(!CSS.includes('feTurbulence'), 'the feTurbulence SVG overlay must be removed');
});

test('the ambient body::before glow is retained', () => {
  assert.match(CSS, /body::before\s*\{/);
});

test('Beach Day override layer is appended with its banner markers', () => {
  assert.equal(occurrences(CSS, 'BT BEACH DAY 2026 OVERRIDES'), 2);
  assert.equal(occurrences(CSS, 'BT SUNSET 2026'), 0);
});

test('the purple dusk palette is gone from the stylesheet', () => {
  for (const literal of PURPLE_LITERALS) {
    assert.ok(!CSS.toUpperCase().includes(literal), `style.css must not contain ${literal}`);
  }
});

test('BTH homepage and BTT template banner markers each appear twice', () => {
  assert.equal(occurrences(CSS, 'BTH HOMEPAGE 2026'), 2);
  assert.equal(occurrences(CSS, 'BTT TEMPLATES 2026'), 2);
});

test('override layer restyles nav, buttons, and footer', () => {
  const block = CSS.slice(CSS.indexOf('BT BEACH DAY 2026 OVERRIDES'));
  const nb = norm(block);
  for (const fragment of [
    'body { font-family: var(--font-body); background: var(--bg); color: var(--text); }',
    'body .nav-links a:not(.btn):hover, body .nav-links a.section-active { color: var(--accent);',
    'body .btn-primary { background: var(--sun); color: var(--ink);',
    'body .btn-outline { background: transparent; color: var(--text); border: 2px solid var(--text);',
    'body .footer { background: var(--ink);',
  ]) {
    assert.ok(nb.includes(fragment), `missing override fragment: ${fragment}`);
  }
});

test('old-theme hard-coded literals are swept from style.css', () => {
  for (const literal of OLD_LITERALS) {
    assert.ok(!CSS.includes(literal), `style.css must not contain ${literal}`);
  }
});

test('the three banner blocks are appended in order', () => {
  const o = CSS.indexOf('BT BEACH DAY 2026 OVERRIDES');
  const h = CSS.indexOf('BTH HOMEPAGE 2026');
  const t = CSS.indexOf('BTT TEMPLATES 2026');
  assert.ok(o !== -1 && h !== -1 && t !== -1, 'all three banner blocks present');
  assert.ok(o < h && h < t, 'override layer, then BTH homepage block, then BTT template block');
});

test('BTH homepage block paints a daylight sky, rolling sea, sand and promenade hero', () => {
  assert.ok(CSS_NORM.includes('.bth-hero { position: relative; overflow: hidden; background: linear-gradient(180deg, #7FDCE0 0%, #B6EDEA 46%, #E2F7F3 100%); }'));
  for (const selector of ['.bth-hero-sun', '.bth-hero-sea', '.bth-wave-back', '.bth-wave-front', '.bth-hero-sand', '.bth-hero-court', '.bth-rally', '.bth-ball', '.bth-promenade']) {
    assert.ok(CSS_NORM.includes(`${selector} {`), `missing hero rule for ${selector}`);
  }
});

test('BTH homepage block defines the key section classes', () => {
  for (const selector of [
    '.bth-section', '.bth-inner', '.bth-eyebrow', '.bth-h2', '.bth-pill-btn',
    '.bth-microcopy', '.bth-hero-sun', '.bth-hero-sand', '.bth-hero-inner',
    '.bth-hero-copy', '.bth-hero-phone', '.bth-hero-h1', '.bth-story', '.bth-scorecard', '.bth-price-card-hi',
    '.bth-price-flag', '.bth-faq-item', '.bth-story-stage', '.bth-story-rail',
    '.bth-story-step', '.bth-node-you', '.bth-linkset.is-on .bth-link',
    '.bth-pulse', '.bth-mesh', '.bth-story-stamp', '.bth-story-caption',
    '.bth-final', '.bth-final-sun',
  ]) {
    assert.ok(CSS_NORM.includes(`${selector} {`), `missing homepage rule for ${selector}`);
  }
});

test('homepage breakpoints: 1100px and 900px responsive blocks exist', () => {
  assert.ok(CSS_NORM.includes('@media (max-width: 1100px) {'));
  assert.ok(CSS_NORM.includes('@media (max-width: 900px) {'));
  assert.ok(
    CSS_NORM.includes(
      '.bth-card-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
    ),
  );
  assert.ok(CSS_NORM.includes('.bth-split { flex-direction: column; gap: 48px; }'));
});

test('BTT template layer restyles the shared interior classes', () => {
  const block = norm(CSS.slice(CSS.indexOf('BTT TEMPLATES 2026')));
  for (const fragment of [
    'body .section-label { display: inline-flex; align-items: center;',
    'text-transform: none; color: var(--accent);',
    'body .breadcrumb { font-weight: 600; font-size: 14px; color: var(--text-secondary); }',
    'body .feature-card, body .problem-card, body .benefit-card {',
    'body .faq-item {',
    'body .comparison-table th { background: var(--sea); color: var(--foam);',
    'body .cta-section { background: var(--sea); }',
    'background: linear-gradient(180deg, #8EE3E6 0%, #C4F0EC 60%, #E6F8F4 100%);',
    'body .btt-quick-answer {',
    'body .btt-quick-answer-label {',
    'text-transform: uppercase; color: var(--accent); margin-bottom: 10px;',
  ]) {
    assert.ok(block.includes(fragment), `missing BTT fragment: ${fragment}`);
  }
});

test('no pre-existing CSS selector was renamed or removed (Task 9 gate)', () => {
  const current = currentSelectors();
  for (const sel of BASELINE_SELECTORS) {
    assert.ok(current.has(sel), `pre-existing selector ${sel} was removed`);
  }
});

test('new top-level selectors are confined to the bth-/btt- prefixes', () => {
  const current = currentSelectors();
  const added = [...current].filter((sel) => !BASELINE_SELECTORS.includes(sel));
  for (const sel of added) {
    assert.ok(
      sel.startsWith('.bth-') || sel.startsWith('.btt-'),
      `new selector ${sel} must use the .bth- or .btt- prefix`,
    );
  }
});