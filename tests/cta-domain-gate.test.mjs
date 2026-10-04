// Spec tests for validate-site.mjs Gate 9 (CTA domain): a data-cta link must
// land on the app itself or on one of this app's own store listings. Each
// case builds a throwaway site root and runs the real validator against it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REPO_ROOT, PLAY_STORE_URL } from './helpers.mjs';

const VALIDATOR = join(REPO_ROOT, 'scripts', 'validate-site.mjs');

function ctaErrors(href) {
  const root = mkdtempSync(join(tmpdir(), 'bt-cta-gate-'));
  try {
    writeFileSync(join(root, 'CNAME'), 'beachtennisref.app\n');
    writeFileSync(join(root, 'index.html'), `<!DOCTYPE html><html lang="en"><head><title>x</title></head><body><a href="${href}" data-cta="hero">Go</a></body></html>`);
    let out;
    try {
      out = execFileSync(process.execPath, [VALIDATOR, root], { encoding: 'utf8' });
    } catch (e) {
      out = e.stdout;
    }
    return out.split('\n').filter((line) => line.includes('data-cta link points at'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('a CTA to the app domain passes', () => {
  assert.deepEqual(ctaErrors('https://app.beachtennisref.app'), []);
});

test('a CTA to a path on the app domain passes', () => {
  assert.deepEqual(ctaErrors('https://app.beachtennisref.app/pricing?plan=yearly'), []);
});

test("a CTA to this app's Google Play listing passes", () => {
  assert.deepEqual(ctaErrors(PLAY_STORE_URL), []);
});

test("a CTA to some other app's Play listing fails", () => {
  assert.equal(ctaErrors('https://play.google.com/store/apps/details?id=app.volleyref.app').length, 1);
});

test('a CTA that merely mentions the app domain in its query string fails', () => {
  assert.equal(ctaErrors('https://example.com/?next=app.beachtennisref.app').length, 1);
});

test('a CTA to a lookalike host that starts with the app domain fails', () => {
  assert.equal(ctaErrors('https://app.beachtennisref.app.evil.example/').length, 1);
});

test('a CTA to the volleyball app fails', () => {
  assert.equal(ctaErrors('https://app.volleyref.app').length, 1);
});
