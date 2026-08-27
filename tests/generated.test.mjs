// Spec tests for the AEO generator blast radius (Task 7): after the
// generator edits + regeneration, every answer/glossary page carries the
// labeled btt-quick-answer boxes and the generated CTA sections drop their
// inline background so the BTT gradient band applies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, listHtmlFiles } from './helpers.mjs';

const GENERATED_DIRS = ['answers', 'glossary', 'rules-reference'];

function eachHtml(dir) {
  return listHtmlFiles(dir).map((name) => ({ file: `${dir}/${name}`, html: readText(`${dir}/${name}`) }));
}

const ANSWER_PAGES = eachHtml('answers');
const GLOSSARY_PAGES = eachHtml('glossary');
const RULES_PAGES = eachHtml('rules-reference');
const ALL_GENERATED = [...ANSWER_PAGES, ...GLOSSARY_PAGES, ...RULES_PAGES];

const OLD_DEFINITION_BOX = '<div class="feature-card" style="max-width:800px; margin:0 auto;" id="definition">';
const OLD_ANSWER_BOX =
  '<div class="feature-card" style="max-width:800px; margin:0 auto; border-left: 4px solid var(--primary); padding-left: 1.5rem;" id="answer">';
const OLD_CTA_SECTION = '<section class="section cta-section" style="background: var(--bg-elevated);">';
const NEW_CTA_SECTION = '<section class="section cta-section">';

test('generated answer/glossary/rules-reference pages exist', () => {
  assert.ok(ANSWER_PAGES.length > 0, 'answers/ must contain HTML pages');
  assert.ok(GLOSSARY_PAGES.length > 0, 'glossary/ must contain HTML pages');
  assert.ok(RULES_PAGES.length > 0, 'rules-reference/ must contain HTML pages');
});

test('every glossary definition box is the labeled btt-quick-answer', () => {
  for (const { file, html } of GLOSSARY_PAGES) {
    if (!html.includes('id="definition"')) continue;
    assert.ok(
      html.includes('class="feature-card btt-quick-answer"'),
      `${file}: definition box must carry btt-quick-answer`,
    );
    assert.ok(
      html.includes('btt-quick-answer-label">Definition'),
      `${file}: definition box must be labeled "Definition"`,
    );
    assert.ok(
      !html.includes(OLD_DEFINITION_BOX),
      `${file}: unlabelled definition box must be gone`,
    );
  }
});

test('every answer page box is the labeled btt-quick-answer', () => {
  for (const { file, html } of ANSWER_PAGES) {
    if (!html.includes('id="answer"')) continue;
    assert.ok(
      html.includes('class="feature-card btt-quick-answer"'),
      `${file}: answer box must carry btt-quick-answer`,
    );
    assert.ok(
      html.includes('btt-quick-answer-label">Quick Answer'),
      `${file}: answer box must be labeled "Quick Answer"`,
    );
    assert.ok(
      !html.includes(OLD_ANSWER_BOX),
      `${file}: the old inline-bordered answer box must be gone`,
    );
  }
});

test('no generated page keeps the inline CTA-section background', () => {
  for (const { file, html } of ALL_GENERATED) {
    assert.ok(
      !html.includes(OLD_CTA_SECTION),
      `${file}: cta-section must not carry the inline var(--bg-elevated) background`,
    );
  }
});

test('generated pages use the bare cta-section for the gradient band', () => {
  const matches = ALL_GENERATED.filter(({ html }) => html.includes(NEW_CTA_SECTION));
  assert.ok(matches.length > 0, 'at least one generated page must use the bare cta-section');
});