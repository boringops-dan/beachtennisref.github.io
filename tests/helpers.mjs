// Shared helpers for the Sunset Session redesign spec tests.
// Pure Node, dependency-free, mirroring the repo's validator conventions.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readText(relPath) {
  return readFileSync(join(REPO_ROOT, relPath), 'utf8');
}

export function listHtmlFiles(dirRel) {
  return readdirSync(join(REPO_ROOT, dirRel))
    .filter((name) => name.endsWith('.html'))
    .sort();
}

// Collapse runs of whitespace so substring checks survive incidental
// formatting differences, and treat <br> as a space (hero copy uses <br>).
export function norm(text) {
  return text.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
}

// The <main id="main-content">...</main> region of index.html, the only part
// of the homepage the redesign plan rewrites.
export function mainRegion(html) {
  const m = html.match(/<main\s+id="main-content"[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : '';
}

export function occurrences(haystack, needle) {
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

// First :root { ... } block in a stylesheet.
export function rootBlock(css) {
  const m = css.match(/:\s*root\s*\{([\s\S]*?)\}/);
  return m ? m[1] : '';
}