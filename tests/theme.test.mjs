// Spec tests for the shared stylesheet work in the Sunset Session redesign:
// Task 2 (token swap + override layer), Task 6 (BTT template layer),
// and the Task 9 CSS-structure gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, rootBlock, norm, occurrences, REPO_ROOT } from './helpers.mjs';

const CSS = readText('css/style.css');
const CSS_NORM = norm(CSS);

const OLD_LITERALS = ['#09090b', '#0d0b0a', '#fafafa', '#a1a1aa', '#52525b'];

// Every token VALUE the plan's Task 2 Step 2 mandates inside the existing
// :root block (name -> exact value). Radius variables are intentionally kept
// as-is and are asserted separately below.
const TOKENS = {
  '--primary': '#E85D50',
  '--primary-dark': '#D14A3E',
  '--primary-light': '#FF8A4B',
  '--accent': '#FFC070',
  '--accent-light': '#FFDE9E',
  '--success': '#22c55e',
  '--warning': '#FFC531',
  '--rose': '#A84462',
  '--bg': '#1E1230',
  '--bg-warm': '#241539',
  '--bg-elevated': '#2B1B4D',
  '--text': '#FFF7EC',
  '--text-secondary': '#C9B8D6',
  '--text-muted': '#9C8BAC',
  '--glass-bg': '#2B1B4D',
  '--glass-bg-hover': '#322050',
  '--glass-border': '#3C2865',
  '--glass-border-hover': '#FFC070',
  '--glass-specular': 'rgba(255, 255, 255, 0)',
  '--glass-blur': '0px',
  '--glass-saturate': '100%',
  '--gradient-primary': 'linear-gradient(135deg, #E85D50, #FFA24B)',
  '--gradient-warm': 'linear-gradient(135deg, #7A2E63, #E85D50)',
  '--shadow-sm': '0 4px 16px rgba(20, 10, 34, 0.4)',
  '--shadow-md': '0 8px 32px rgba(20, 10, 34, 0.45)',
  '--shadow-lg': '0 20px 60px rgba(20, 10, 34, 0.55)',
  '--shadow-glow':
    '0 0 50px rgba(255, 138, 75, 0.12), 0 0 100px rgba(232, 93, 80, 0.06)',
  '--shadow-glow-strong':
    '0 0 60px rgba(255, 138, 75, 0.2), 0 0 120px rgba(232, 93, 80, 0.1)',
  "--font-display": "'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif",
  "--font-body": "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif",
  '--ink': '#150C22',
};

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

test('every Sunset token value is set in the :root block', () => {
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

test('Sunset override layer is appended with its banner markers', () => {
  assert.equal(occurrences(CSS, 'BT SUNSET 2026 OVERRIDES'), 2);
});

test('BTH homepage and BTT template banner markers each appear twice', () => {
  assert.equal(occurrences(CSS, 'BTH HOMEPAGE 2026'), 2);
  assert.equal(occurrences(CSS, 'BTT TEMPLATES 2026'), 2);
});

test('override layer restyles nav, buttons, and footer', () => {
  const block = CSS.slice(CSS.indexOf('BT SUNSET 2026 OVERRIDES'));
  const nb = norm(block);
  for (const fragment of [
    'body { font-family: var(--font-body); background: var(--bg); color: var(--text); }',
    'body .navbar { background: var(--bg); color: var(--text); border-bottom: 1px solid #322050; backdrop-filter: none; }',
    'body .nav-links a:hover { color: var(--accent); }',
    'body .btn-primary { background: #FFF7EC; color: #7A2E63; border: none; border-radius: var(--radius-pill); font-weight: 700; box-shadow: none; }',
    'body .btn-outline { background: transparent; color: inherit; border: 2px solid var(--text-secondary); border-radius: var(--radius-pill); }',
    'body .footer { background: var(--ink); color: var(--text-secondary); }',
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
  const o = CSS.indexOf('BT SUNSET 2026 OVERRIDES');
  const h = CSS.indexOf('BTH HOMEPAGE 2026');
  const t = CSS.indexOf('BTT TEMPLATES 2026');
  assert.ok(o !== -1 && h !== -1 && t !== -1, 'all three banner blocks present');
  assert.ok(o < h && h < t, 'override layer, then BTH homepage block, then BTT template block');
});

test('BTH homepage block defines the dusk hero gradient', () => {
  assert.ok(
    CSS_NORM.includes(
      'linear-gradient(180deg, #1E1230 0%, #2B1B4D 30%, #7A2E63 62%, #E85D50 86%, #FFA24B 95%, #FFD07A 100%)',
    ),
  );
});

test('BTH homepage block defines the key section classes', () => {
  for (const selector of [
    '.bth-section', '.bth-inner', '.bth-eyebrow', '.bth-h2', '.bth-pill-btn',
    '.bth-microcopy', '.bth-hero-sun', '.bth-hero-sand', '.bth-hero-inner',
    '.bth-hero-badge', '.bth-hero-h1', '.bth-scorecard', '.bth-price-card-hi',
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
    'color: var(--primary-light);',
    'body .breadcrumb { font-weight: 600; font-size: 13px; color: var(--text-secondary); }',
    'body .feature-card, body .problem-card, body .benefit-card {',
    'body .faq-item {',
    'body .comparison-table th { background: #1A0F2B;',
    'background: linear-gradient(180deg, #7A2E63 0%, #E85D50 70%, #FFA24B 100%);',
    'background: linear-gradient(160deg, #2B1B4D 0%, #7A2E63 70%, #A84462 100%);',
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