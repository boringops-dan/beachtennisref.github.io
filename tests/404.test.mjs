// Spec tests for the rebuilt 404 page (Task 8): the Beach Day
// "Long. Out." screen with its inline-styled scoreboard and gradient, while
// the analytics script tag is preserved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './helpers.mjs';

const HTML = readText('404.html');

test('404 keeps the analytics script tag', () => {
  assert.ok(HTML.includes('<script src="/js/analytics.js"></script>'));
});

test('404 shows the "Long. Out." headline and copy', () => {
  assert.ok(HTML.includes('Long. Out.'), 'h1 must read "Long. Out."');
  assert.ok(
    HTML.includes('This page landed outside the lines. Try again from the baseline.'),
  );
});

test('404 renders the daylight sky-to-sand wrapper', () => {
  assert.ok(
    HTML.includes(
      'linear-gradient(180deg, #7FDCE0 0%, #B6EDEA 55%, #F6E2B8 82%, #EED19A 100%); color: #0C2E35;',
    ),
  );
  assert.ok(!/#2B1B4D|#7A2E63|#1E1230|#d4a24a/i.test(HTML), 'no purple or old gold left on the 404');
});

test('404 scoreboard shows YOU : THIS PAGE 40-4', () => {
  for (const token of ['YOU', 'THIS PAGE', '>40</div>', '>4</div>']) {
    assert.ok(HTML.includes(token), `missing scoreboard token ${token}`);
  }
});

test('404 CTAs link home and to the answers index', () => {
  assert.ok(HTML.includes('href="/"'), 'must link back home');
  assert.ok(HTML.includes('>Back to Home</a>'));
  assert.ok(HTML.includes('href="/answers/"'), 'must link to /answers/');
  assert.ok(HTML.includes('>Browse Answers</a>'));
});

test('404 uses the new display and body type inline', () => {
  assert.ok(HTML.includes("'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif"));
  assert.ok(HTML.includes("'Instrument Sans', 'Helvetica Neue', Arial, sans-serif"));
});

test('the old 404 copy is replaced', () => {
  assert.ok(!HTML.includes("Ball's out."), 'old "Ball\'s out." copy must be gone');
  assert.ok(!HTML.includes('That shot landed long.'), 'old quip must be gone');
});

test('404 copy hygiene: no em dash, no ellipsis, no prose double dash', () => {
  assert.ok(!/[—–]/.test(HTML), '404.html must not contain an em dash or en dash');
  assert.ok(!HTML.includes('...'), '404.html must not contain an ellipsis');
  assert.ok(!/ -- /.test(HTML), '404.html must not contain a prose double dash');
});