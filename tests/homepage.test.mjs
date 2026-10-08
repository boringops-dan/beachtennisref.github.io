// Spec tests for the rebuilt homepage body (Task 3) and its copy gates,
// including the sanctioned FAQPage JSON-LD update.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, mainRegion, norm, occurrences, PLAY_STORE_URL } from './helpers.mjs';

const HTML = readText('index.html');
const MAIN = mainRegion(HTML);
const MAIN_NORM = norm(MAIN);

const APP_URL = 'https://app.beachtennisref.app';

// The FAQ copy mandated by Task 3 (visible section + FAQPage JSON-LD share it).
const FAQ_QA = [
  {
    name: 'Which scoring formats does it support?',
    text: 'Advantage and no-ad (deciding point) scoring, regular tie-breaks, and match tie-breaks. Pick the format at match setup and the app handles it.',
  },
  {
    name: 'Does it handle the tie-break serve order?',
    text: 'Yes. The app tracks who serves and from which side through the whole tie-break, including the change of ends inside it.',
  },
  {
    name: 'Singles and doubles?',
    text: 'Both. Score 1v1 or 2v2; the app knows who serves next either way.',
  },
  {
    name: 'What happens when I lose signal on the beach?',
    text: "Nothing. Every point is stored on your device and syncs when you're back online.",
  },
  {
    name: 'Can I fix a wrong score mid-match?',
    text: 'Yes. Undo anything and correct any score; the full point-by-point history stays intact.',
  },
  {
    name: 'Can I cancel any time?',
    text: 'Yes. Manage or cancel the subscription any time; you keep access until the period ends.',
  },
];

function jsonLdOfType(type) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(HTML))) {
    let data;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    if (data && [].concat(data['@type']).includes(type)) return data;
  }
  return null;
}

test('the main-content wrapper is preserved', () => {
  assert.match(HTML, /<main\s+id="main-content"/);
  assert.match(HTML, /<\/main>/);
  assert.ok(MAIN.length > 0, 'main-content region must not be empty');
});

test('daylight hero: sun, sea, sand, net, rally ball, promenade, real phone', () => {
  assert.ok(MAIN_NORM.includes('<header class="bth-hero">'));
  for (const cls of ['bth-hero-sun', 'bth-hero-scene', 'bth-hero-sea', 'bth-hero-sand', 'bth-hero-court', 'bth-rally', 'bth-ball', 'bth-promenade', 'bth-hero-inner', 'bth-hero-copy', 'bth-hero-phone']) {
    assert.ok(new RegExp(`class="[^"]*\\b${cls}\\b`).test(MAIN), `missing hero element ${cls}`);
  }
  assert.ok(MAIN_NORM.includes('<h1 class="bth-hero-h1">Just play. We\'ll keep score.</h1>'));
  assert.ok(MAIN_NORM.includes('The only scoring app built for ITF beach tennis. Serve order, sides, tie-breaks and change of ends, handled every point.'));
  assert.ok(MAIN.includes('src="images/screenshots/device-phone.png"'), 'hero shows the real captured app');
});

test('decorative hero scenery is hidden from assistive tech', () => {
  for (const cls of ['bth-hero-sun', 'bth-hero-scene', 'bth-promenade']) {
    assert.ok(MAIN.includes(`<div class="${cls}" aria-hidden="true">`), `${cls} must be aria-hidden`);
  }
});

test('hero CTA and free-trial microcopy', () => {
  const cta = '<a href="https://app.beachtennisref.app" class="bth-pill-btn" data-cta="hero">Start Scoring Free</a>';
  assert.ok(MAIN_NORM.includes(cta), 'hero CTA must carry class, href, and data-cta exactly');
  assert.ok(
    MAIN_NORM.includes('<div class="bth-microcopy">Your first matches are free. No credit card required.</div>'),
    'microcopy must be the approved free-trial line',
  );
  // The free-trial line is microcopy under the hero CTA, never a heading.
  assert.ok(!/<h[1-6][^>]*>Your first matches are free/i.test(MAIN));
  // Never in the final CTA band.
  const finalBand = MAIN.slice(MAIN.indexOf('<section class="bth-final">'));
  assert.ok(!finalBand.includes('Your first matches are free'));
});

test('free-trial line appears exactly once on the page', () => {
  assert.equal(occurrences(HTML, 'No credit card required'), 1);
  assert.equal(occurrences(HTML, 'Your first matches are free'), 1);
  assert.doesNotMatch(MAIN, /\d+\s*matches\b/i, 'no specific match count may appear');
});

test('hero trust strip lists ITF rules, singles and doubles, offline', () => {
  assert.ok(MAIN_NORM.includes('<ul class="bth-trust" role="list">'));
  for (const item of ['ITF rules built in', 'Singles and doubles', 'Works offline']) {
    assert.ok(MAIN_NORM.includes(`<li>${item}</li>`), `missing trust item ${item}`);
  }
});

test('four section anchors required by the nav all exist', () => {
  for (const id of ['features', 'how-it-works', 'pricing', 'faq']) {
    assert.equal(occurrences(HTML, `id="${id}"`), 1, `section id="${id}" must exist exactly once`);
  }
});

test('counting-problem cards', () => {
  assert.equal(occurrences(MAIN, 'class="bth-problem-card"'), 4);
  for (const num of ['5-4', '6-6', 'Ends?', '40-40']) {
    assert.ok(MAIN_NORM.includes(`<div class="bth-problem-num">${num}</div>`), `missing problem card ${num}`);
  }
});

test('rules-handled section shows a real captured tie-break screenshot', () => {
  assert.ok(MAIN_NORM.includes('<section class="bth-section bth-rules" id="features">'));
  assert.ok(MAIN_NORM.includes('Scoreboard apps count taps. Beach Tennis Ref knows the rulebook.'));
  assert.ok(MAIN_NORM.includes('class="bth-chip">Serve order</div>'));
  assert.ok(MAIN_NORM.includes('class="bth-chip">Serving side</div>'));
  assert.ok(MAIN_NORM.includes('class="bth-chip">Tie-breaks</div>'));
  assert.ok(MAIN_NORM.includes('class="bth-chip">Change of ends</div>'));
  assert.ok(MAIN_NORM.includes('class="bth-shot bth-shot-scorecard"'));
  assert.ok(MAIN_NORM.includes('src="images/screenshots/rules-tiebreak.png"'));
});

test('every-call-covered section lists the six call chips', () => {
  assert.equal(occurrences(MAIN, 'class="bth-call-chip"'), 6);
  for (const label of [
    'Lets, replayed properly',
    'Hindrance calls',
    'Forfeits and retirements',
    'Undo anything',
    'Point-by-point history',
    'Score corrections',
  ]) {
    assert.ok(MAIN_NORM.includes(`>${label}</div>`), `missing call chip "${label}"`);
  }
});

test('live-story stage markup is complete', () => {
  assert.ok(MAIN_NORM.includes('<section class="bth-section bth-story" id="how-it-works">'));
  assert.ok(MAIN_NORM.includes('class="bth-story-stage" data-step="1"'));
  assert.ok(MAIN_NORM.includes('class="bth-story-links"'));
  // The four linksets with their data-on beats (one per beat 2, 3, 4, 4).
  for (const on of ['data-on="2"', 'data-on="3"', 'data-on="4"']) {
    assert.ok(MAIN.includes(on), `missing linkset ${on}`);
  }
  assert.equal(occurrences(MAIN, 'class="bth-story-step"'), 6);
  for (let n = 1; n <= 6; n += 1) {
    assert.ok(
      MAIN_NORM.includes(`data-step-btn="${n}"`),
      `missing step button ${n}`,
    );
  }
  assert.ok(MAIN_NORM.includes('<div class="bth-story-stamp bth-stamp-offline">'));
  assert.ok(MAIN_NORM.includes('<div class="bth-story-stamp bth-stamp-resync">'));
  assert.ok(MAIN_NORM.includes('aria-live="polite"'));
  assert.ok(MAIN_NORM.includes('data-caption-text'));
  assert.ok(MAIN_NORM.includes('data-caption-time'));
  assert.ok(MAIN_NORM.includes('data-watchers'));
  assert.ok(MAIN_NORM.includes('data-youscore'));
  assert.ok(MAIN_NORM.includes('data-deskscore'));
});

test('devices section and store badges', () => {
  assert.ok(MAIN_NORM.includes('Runs in the browser. No install required.'));
  for (const cls of ['bth-device-phone', 'bth-device-tablet', 'bth-device-laptop']) {
    assert.ok(MAIN.includes(cls), `missing ${cls}`);
  }
  assert.ok(
    MAIN_NORM.includes(`<a class="bth-store-badge" href="${PLAY_STORE_URL}" data-cta="devices-playstore">Google Play</a>`),
  );
  assert.ok(
    MAIN_NORM.includes('<a class="bth-store-badge" href="https://app.beachtennisref.app" data-cta="devices-webapp">Open Web App</a>'),
  );
  // No iOS listing exists yet: an App Store badge or claim would be a dead promise.
  assert.ok(!MAIN.includes('App Store'), 'homepage must not claim an App Store version yet');
});

test('Google Play listing is advertised in the app structured data', () => {
  const app = jsonLdOfType('SoftwareApplication');
  assert.ok(app, 'SoftwareApplication JSON-LD missing');
  assert.deepEqual([].concat(app.installUrl), [PLAY_STORE_URL]);
  assert.match(app.operatingSystem, /Android/);
});

test('pricing section with the three tiers and highlighted Yearly card', () => {
  assert.ok(MAIN_NORM.includes('<section class="bth-section bth-pricing" id="pricing">'));
  assert.ok(MAIN_NORM.includes('Simple plans. Every plan has every feature.'));
  assert.equal(occurrences(MAIN, '<div class="bth-price-card'), 3);
  assert.ok(MAIN_NORM.includes('$4.99'));
  assert.ok(MAIN_NORM.includes('$49.99'));
  assert.ok(MAIN_NORM.includes('$14.99'));
  assert.ok(MAIN_NORM.includes('class="bth-price-card bth-price-card-hi"'));
  assert.ok(MAIN_NORM.includes('MOST POPULAR'));
  assert.ok(
    MAIN_NORM.includes('<a class="bth-price-btn" href="https://app.beachtennisref.app" data-cta="pricing-weekly">Choose Weekly</a>'),
  );
  assert.ok(
    MAIN_NORM.includes('<a class="bth-price-btn-hi" href="https://app.beachtennisref.app" data-cta="pricing-yearly">Choose Yearly</a>'),
  );
  assert.ok(
    MAIN_NORM.includes('<a class="bth-price-btn" href="https://app.beachtennisref.app" data-cta="pricing-monthly">Choose Monthly</a>'),
  );
});

test('FAQ section mirrors the FAQPage structured data', () => {
  assert.ok(MAIN_NORM.includes('<section class="bth-section" id="faq">'));
  assert.equal(occurrences(MAIN, 'class="bth-faq-item"'), 6);
  const qTags = [...MAIN.matchAll(/<p class="bth-faq-q">([^<]+)<\/p>/g)].map((m) => m[1]);
  assert.deepEqual(qTags, FAQ_QA.map((q) => q.name));
});

test('final CTA band closes the page', () => {
  assert.ok(MAIN_NORM.includes('<section class="bth-final">'));
  assert.ok(MAIN_NORM.includes('<div class="bth-final-sea" aria-hidden="true">'), 'the sun sets into the sea');
  assert.ok(MAIN_NORM.includes('<h2 class="bth-final-h2">The sun is going down. The court is ready. The score is our job.</h2>'));
  assert.ok(
    MAIN_NORM.includes('<a href="https://app.beachtennisref.app" class="bth-pill-btn" data-cta="final">Start Scoring Free</a>'),
  );
});

test('FAQPage JSON-LD matches the new FAQ copy exactly', () => {
  const data = jsonLdOfType('FAQPage');
  assert.ok(data, 'expected a FAQPage JSON-LD block in the head');
  assert.equal(data['@type'], 'FAQPage');
  assert.equal(data.mainEntity.length, 6);
  const expected = FAQ_QA.map(({ name, text }) => ({
    '@type': 'Question',
    name,
    acceptedAnswer: { '@type': 'Answer', text },
  }));
  assert.deepEqual(data.mainEntity, expected);
});

test('no volleyball branding in the rewritten homepage body', () => {
  assert.ok(!/volleyref/i.test(MAIN), 'the main-content region must not mention volleyref');
});

test('no forbidden feature claims in the homepage body', () => {
  for (const claim of ['Apple Watch', 'cast', 'TV mode', 'Mac app']) {
    assert.ok(!MAIN.includes(claim), `forbidden claim "${claim}" present`);
  }
});

test('copy hygiene in index.html: no em dash, no ellipsis, no prose double dash', () => {
  assert.ok(!/[—–]/.test(HTML), 'index.html must not contain an em dash or en dash');
  assert.ok(!HTML.includes('...'), 'index.html must not contain an ellipsis');
  assert.ok(!/ -- /.test(HTML), 'index.html must not contain a prose double dash');
});