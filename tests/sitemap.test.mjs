// Spec tests for the sitemap lastmod bump (Task 5): only the homepage entry
// gets <lastmod>2026-08-26</lastmod>.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './helpers.mjs';

const SITEMAP = readText('sitemap.xml');

test('homepage entry is present in the sitemap', () => {
  assert.match(SITEMAP, /<loc>https:\/\/beachtennisref\.app\/<\/loc>/);
});

test('homepage lastmod is bumped to 2026-08-26', () => {
  const m = SITEMAP.match(
    /<url>\s*<loc>https:\/\/beachtennisref\.app\/<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/,
  );
  assert.ok(m, 'homepage <url> entry with a <lastmod> must exist');
  assert.equal(m[1], '2026-08-26');
});