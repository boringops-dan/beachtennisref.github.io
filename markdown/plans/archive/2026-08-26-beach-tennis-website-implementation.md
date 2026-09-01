# BeachTennisRef.App Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the beachtennisref.github.io static site to the approved 2026 "Sunset Session" redesign (dusk gradient hero, night-plum and twilight-indigo surfaces, amber/coral accents, cream used sparingly and never as a background, Bricolage Grotesque / Instrument Sans type) and rebuild the homepage body to the approved mockup, without breaking any of the existing pages.

**Architecture:** All pages share `css/style.css`, which is token-based (`:root` custom properties, same variable names as the volleyball site's pre-redesign stylesheet). The restyle is (1) a token swap plus an appended override layer in `style.css` that re-themes every interior page at once, (2) a rebuild of `index.html`'s body sections using new `bth-` prefixed classes, including a beach tennis retelling of volleyref.app's animated live-story stage (same mechanics: `data-on` beats, SMIL pulse dots, step rail, reduced-motion fallback; new one-file driver `js/story.js`), and (3) a content-template layer: an appended `btt-` CSS block restyles the shared interior classes (`section-label`, `breadcrumb`, `feature-card`, `faq-item`, `comparison-table`, `cta-section`, `hero-pill`, page heroes) that every interior page family uses, plus small verbatim edits to the AEO generator that produces `answers/`, `glossary/`, and `rules-reference/`. No page is added, deleted, renamed, or moved. No JS behavior changes.

**Second repo (Task 7 only):** `/Users/zrobok/Code/volleyball_referee/aeo` generates `answers/`, `glossary/`, `rules-reference/`, and `llms.txt` INTO the site repo from YAML data via `scripts/generate-bt.mjs`. Those pages must never be hand-edited for layout (the next generation run would overwrite them); their layout changes go into the generator, then the generator is re-run.

**Tech Stack:** Plain static HTML + one shared CSS file, GitHub Pages. Node only for the existing validator (`npm run validate`). No build step, no new dependencies.

**Spec:** `vbr-marketing/ideas/website-redesign-brief-beach-tennis.md` (positioning + the DECIDED Sunset Session design system; its section 3 palette table is the color authority). Pixel reference: the "Beach Tennis Ref Homepage" design canvas, exported copies of which live as the source artboards in `vbr-marketing/plans/assets/bt-homepage-canvas/Main.dc.html` (homepage) and `Article.dc.html` (content-page template). Those two files are fixed 1440px desktop mockups; the real site must additionally be responsive per the CSS in this plan. When this plan's markup/CSS and the mockup disagree, this plan wins.

**Working directory for ALL tasks:** `/Users/zrobok/Code/volleyball_referee/beachtennisref.github.io`

## Global Constraints

- NEVER `git push`. Commit locally after each task; the user pushes (pushing deploys the live site).
- NEVER use an em dash or a prose `--` in any user-visible copy. Use a comma or a period. (The validator enforces the em dash rule; enforce the `--` rule yourself.)
- NEVER use emoji anywhere in page content. Icons are inline stroke SVG.
- NEVER use an ellipsis character or "..." in any user-visible copy.
- NEVER delete, rename, or move any HTML page, and never remove a footer link (the validator's reachability gate depends on footer links).
- NEVER rename, remove, or merge any existing CSS selector in `css/style.css`. Change property values inside existing rules, or append new rules. New selectors you add must start with `.bth-` (homepage sections), `.btt-` (interior template layer), or live inside the clearly-marked override block from Task 2.
- NEVER edit `scripts/validate-site.mjs`, `js/analytics.js`, `js/main.js`, `js/ab-testing.js`, or any other PRE-EXISTING file in `js/`, `robots.txt`, `llms.txt`, `CNAME`, or `manifest.json`. The single exception: Task 3B CREATES the new file `js/story.js` (and nothing else in `js/`).
- NEVER change `<head>` metadata (title, description, canonical, OG, Twitter, JSON-LD, GA4 snippet) on any page, except where a task below explicitly says to (the single FAQPage JSON-LD block in Task 3 and the single sitemap lastmod in Task 5).
- Every CTA link to the app keeps/gets a `data-cta` attribute and points at `https://app.beachtennisref.app` (login CTAs at `https://app.beachtennisref.app/login`). NEVER a volleyref.app URL and never volleyball branding anywhere (the validator enforces this one-directionally; hold the line everywhere).
- The free-trial line is exactly "Your first matches are free. No credit card required." It appears exactly ONCE on the homepage, as microcopy under the hero CTA. Never as a heading, never in the final CTA band, and NEVER with a specific number of matches anywhere on the site.
- Feature claims: never claim TV mode/casting, Apple Watch, or Mac availability for this app. The approved copy in this plan already respects this; do not add claims beyond it.
- The compound brand is "Beach Tennis Ref" / BeachTennisRef.App. Do not shorten or restyle it.
- Sample match content is APPROVED as written: teams "Ana & Marta" and "Luca & Rafa", set scores 6-4 / 4-6, tie-break 6-5. Keep exactly; do not invent different names or scores.
- Cream `#FFF7EC` is never a section background. It appears as a FILL only where this plan's markup says (nav CTA pill via the override layer, the live spectator card, the featured Yearly pricing card).
- Do not add npm packages. The only new JS file permitted is `js/story.js` (Task 3B); create no others. READING the `volleyref.github.io` sibling repo as an implementation reference is allowed; never write to it or any repo other than `beachtennisref.github.io` and (in Task 7 only) `aeo`. In `aeo`, the only editable file is `scripts/generate-bt.mjs`, and only the exact edits Task 7 specifies (never `scripts/generate.mjs`, which belongs to the volleyball site).
- Never hand-edit files under `answers/`, `glossary/`, or `rules-reference/` in the site repo, and never hand-edit `llms.txt` (all generated by `aeo`). The Task 4 inline-style sweep explicitly skips those directories.
- Stop-and-surface conditions (halt the task, report, do not improvise): the baseline validator fails before you changed anything; a validator failure you cannot map to a change you made; any instruction in this plan contradicts what you find on disk; you feel the need to edit a forbidden file.

---

### Task 1: Baseline check

**Files:** none modified.

**Interfaces:**
- Consumes: nothing.
- Produces: a known-green baseline all later tasks are diffed against.

- [x] **Step 1: Confirm clean tree and record branch**

Run: `git -C /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io status --porcelain`
Expected: empty output. If not empty, STOP and report the dirty files; do not stash, do not discard.

Run: `git -C /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io branch --show-current`
Expected: prints a branch name. Stay on this branch for the whole plan.

- [x] **Step 2: Run the validator baseline**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit code 0. If it fails, STOP and report the exact failure output. Do not fix pre-existing failures and do not start Task 2.

- [x] **Step 3: Snapshot the CSS selector inventory (used by the final gate)**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && grep -oE '^[[:space:]]*[.#][a-zA-Z][a-zA-Z0-9_-]*' css/style.css | sed 's/^[[:space:]]*//' | sort -u > /tmp/bt-selectors-before.txt && wc -l /tmp/bt-selectors-before.txt`
Expected: prints a line count (roughly 100-300). Keep `/tmp/bt-selectors-before.txt` for Task 9.

---

### Task 2: Re-theme every page via `css/style.css` tokens + override layer

**Files:**
- Modify: `css/style.css` (the `:root` block near the top, plus an appended block at the very end of the file)

**Interfaces:**
- Consumes: the existing `:root` custom properties (near the top of `css/style.css`).
- Produces: Sunset Session token values and the `--font-*` variables; Task 3's homepage CSS assumes the fonts and tokens defined here exist.

- [x] **Step 1: Add the font imports as the FIRST line of `css/style.css`**

Insert at the very top of the file, before everything else (an `@import` is only valid before other rules):

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
```

- [x] **Step 2: Replace the values inside the existing `:root` block**

Find the `:root { ... }` block near the top of the file. Replace the VALUE of each variable listed below, keeping every variable name. Do not delete any variable, even ones not listed here. Add the three `--font-*` / `--ink` variables at the end of the block. (The radius variables keep their current values; they already match the mockup's rounded language.)

```css
:root {
  --primary: #E85D50;
  --primary-dark: #D14A3E;
  --primary-light: #FF8A4B;
  --accent: #FFC070;
  --accent-light: #FFDE9E;
  --success: #22c55e;
  --warning: #FFC531;
  --rose: #A84462;

  --bg: #1E1230;
  --bg-warm: #241539;
  --bg-elevated: #2B1B4D;

  --text: #FFF7EC;
  --text-secondary: #C9B8D6;
  --text-muted: #9C8BAC;

  --glass-bg: #2B1B4D;
  --glass-bg-hover: #322050;
  --glass-border: #3C2865;
  --glass-border-hover: #FFC070;
  --glass-specular: rgba(255, 255, 255, 0);
  --glass-blur: 0px;
  --glass-saturate: 100%;

  --radius-xl: 24px;
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --radius-pill: 100px;

  --gradient-primary: linear-gradient(135deg, #E85D50, #FFA24B);
  --gradient-warm: linear-gradient(135deg, #7A2E63, #E85D50);

  --shadow-sm: 0 4px 16px rgba(20, 10, 34, 0.4);
  --shadow-md: 0 8px 32px rgba(20, 10, 34, 0.45);
  --shadow-lg: 0 20px 60px rgba(20, 10, 34, 0.55);
  --shadow-glow: 0 0 50px rgba(255, 138, 75, 0.12), 0 0 100px rgba(232, 93, 80, 0.06);
  --shadow-glow-strong: 0 0 60px rgba(255, 138, 75, 0.2), 0 0 120px rgba(232, 93, 80, 0.1);

  --font-display: 'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif;
  --font-body: 'Instrument Sans', 'Helvetica Neue', Arial, sans-serif;
  --ink: #150C22;
}
```

- [x] **Step 3: Remove the film-grain/noise overlay**

Run: `grep -n -i "grain\|noise" css/style.css`
There is a "Subtle film grain" rule near line 131 (a `body::before`/`body::after`-style rule with an SVG feTurbulence background). Delete that whole rule and any companion rule that only exists to paint the grain overlay. Re-run the grep; expected: no rule painting a grain texture remains (comment lines mentioning the old background are fine to delete too).

- [x] **Step 4: Append the override layer at the very END of `css/style.css`**

Append exactly this block (keep the banner comments; Task 9 greps for them):

```css
/* ============================================================
   BT SUNSET 2026 OVERRIDES (appended layer, do not reorder)
   Night-plum surfaces, dusk gradients, amber/coral accents,
   Bricolage Grotesque display type. Cream is never a background.
   ============================================================ */
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
}
h1, h2, h3, .logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.02em;
  text-transform: none;
}
body .navbar {
  background: var(--bg);
  color: var(--text);
  border-bottom: 1px solid #322050;
  backdrop-filter: none;
}
body .navbar a, body .navbar .logo-text { color: var(--text); }
body .nav-links a { color: var(--text-secondary); }
body .nav-links a:hover { color: var(--accent); }
body .btn-primary {
  background: #FFF7EC;
  color: #7A2E63;
  border: none;
  border-radius: var(--radius-pill);
  font-weight: 700;
  box-shadow: none;
}
body .btn-primary:hover { background: #FFEEDD; color: #5E2350; }
body .btn-outline {
  background: transparent;
  color: inherit;
  border: 2px solid var(--text-secondary);
  border-radius: var(--radius-pill);
}
body .footer {
  background: var(--ink);
  color: var(--text-secondary);
}
body .footer a { color: var(--text-secondary); }
body .footer a:hover { color: var(--accent); }
/* ==================== END BT SUNSET 2026 OVERRIDES ==================== */
```

- [x] **Step 5: Neutralize hard-coded old-theme colors outside the token block**

Run: `grep -n "#09090b\|#0d0b0a\|#fafafa\|#a1a1aa\|#52525b" css/style.css`
For every hit OUTSIDE the `:root` block, apply this table (values only; keep the selectors):

| Old literal | Replace with |
| --- | --- |
| `#09090b` | `var(--bg)` |
| `#0d0b0a` | `var(--bg-warm)` |
| `#fafafa` | `var(--text)` |
| `#a1a1aa` | `var(--text-secondary)` |
| `#52525b` | `var(--text-muted)` |

If a hit sits inside a rule whose selector contains `navbar` or `footer`, leave it alone (the override layer already restyles those). Re-run the grep; expected: no output outside `:root` and navbar/footer rules.

- [x] **Step 6: Validate and commit**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0. A failure here can only come from your CSS edit; fix your edit, never the validator.

```bash
git add css/style.css
git commit -m "Restyle site theme: Sunset Session dusk palette, Bricolage Grotesque and Instrument Sans type"
```

---

### Task 3: Rebuild the homepage body

**Files:**
- Modify: `index.html` (body content between `</nav>` and the footer only, plus the one sanctioned FAQPage JSON-LD block)
- Modify: `css/style.css` (append `.bth-` homepage classes AFTER the Task 2 override block)

**Interfaces:**
- Consumes: tokens and `--font-*` variables from Task 2.
- Produces: the shipped homepage. Later tasks only validate; nothing else consumes this markup.

Rules for this task:
- Do NOT touch anything in `<head>` except the single FAQPage JSON-LD block in Step 3. Do NOT touch the GA4 snippet, the other JSON-LD blocks, the `<nav class="navbar">...</nav>` block, the `<footer class="footer">...</footer>` block, or any `<script>` tags at the end of `<body>`. Only the content between `</nav>` and the opening of the footer is replaced. (If the current body carries `mobile-cta` elements outside the nav/footer, they are part of the replaced content and go away.)
- The visual target is `vbr-marketing/plans/assets/bt-homepage-canvas/Main.dc.html`. The markup below IS that mockup translated to classes plus responsive rules; when in doubt, the markup below wins.

- [x] **Step 1: Append the homepage CSS to `css/style.css`**

Append after the Task 2 override block:

```css
/* ==================== BTH HOMEPAGE 2026 ==================== */
.bth-section { padding: 96px 64px; }
.bth-inner { max-width: 1240px; margin: 0 auto; }
.bth-eyebrow { font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary-light); margin-bottom: 14px; }
.bth-h2 { font-family: var(--font-display); font-weight: 800; font-size: clamp(32px, 3.5vw, 46px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 0 0; }
.bth-pill-btn { display: inline-block; background: var(--bg); color: var(--text); padding: 18px 38px; border-radius: var(--radius-pill); font-weight: 700; font-size: 18px; text-decoration: none; }
.bth-microcopy { font-size: 14px; color: #FFE9D0; }

.bth-hero { position: relative; overflow: hidden; background: linear-gradient(180deg, #2B1B4D 0%, #7A2E63 38%, #E85D50 68%, #FFA24B 88%, #FFD07A 100%); }
.bth-hero-sun { position: absolute; bottom: 110px; left: 50%; margin-left: -140px; width: 280px; height: 280px; border-radius: 50%; background: #FFDE9E; opacity: 0.9; }
.bth-hero-sand { position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; background: var(--bg); }
.bth-hero-court { position: absolute; bottom: 70px; left: 8%; width: 84%; height: 140px; }
.bth-hero-inner { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 26px; padding: 96px 64px 140px 64px; }
.bth-hero-badge { display: inline-flex; align-items: center; border: 1px solid rgba(255, 247, 236, 0.4); border-radius: var(--radius-pill); padding: 8px 16px; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #FFE9D0; }
.bth-hero-h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(52px, 6.4vw, 92px); line-height: 0.98; letter-spacing: -0.03em; margin: 0; text-shadow: 0 4px 30px rgba(30, 18, 48, 0.35); }
.bth-hero-sub { font-size: 22px; line-height: 1.5; max-width: 560px; color: #FFE9D0; margin: 0; }
.bth-hero-cta-col { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.bth-trust { display: flex; align-items: center; gap: 14px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; color: #FFE9D0; flex-wrap: wrap; justify-content: center; }
.bth-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: #FFDE9E; }

.bth-card-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; margin-top: 48px; }
.bth-problem-card { display: flex; flex-direction: column; gap: 12px; background: var(--bg-elevated); border: 1px solid #3C2865; border-radius: var(--radius-lg); padding: 28px 24px; }
.bth-problem-num { font-family: var(--font-display); font-size: 30px; font-weight: 800; color: var(--accent); }
.bth-card-body { font-size: 16px; line-height: 1.5; color: #EFE4F2; font-weight: 500; }

.bth-rules { background: linear-gradient(160deg, #4A2058 0%, #7A2E63 100%); }
.bth-split { display: flex; gap: 80px; align-items: center; }
.bth-split-copy { flex: 1 1 0; display: flex; flex-direction: column; gap: 24px; }
.bth-rules .bth-eyebrow { color: var(--accent); margin-bottom: 0; }
.bth-lead { font-size: 19px; line-height: 1.6; color: #FFE9D0; max-width: 520px; margin: 0; }
.bth-chip-row { display: flex; gap: 12px; flex-wrap: wrap; }
.bth-chip { background: rgba(30, 18, 48, 0.45); border: 1px solid rgba(255, 233, 208, 0.3); border-radius: var(--radius-pill); padding: 10px 18px; font-size: 14px; font-weight: 700; color: #FFE9D0; }
.bth-scorecard { width: 430px; flex-shrink: 0; display: flex; flex-direction: column; border-radius: var(--radius-xl); overflow: hidden; box-shadow: 0 24px 60px rgba(20, 10, 34, 0.5); background: #241539; }
.bth-scorecard-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; background: #1A0F2B; }
.bth-scorecard-label { color: var(--text-secondary); font-size: 12px; font-weight: 700; letter-spacing: 0.1em; }
.bth-scorecard-set { color: var(--accent); font-size: 12px; font-weight: 700; }
.bth-scorecard-body { display: flex; flex-direction: column; gap: 14px; padding: 22px; }
.bth-team-row { display: flex; align-items: center; justify-content: space-between; background: #2F1D4A; border-radius: 14px; padding: 16px 18px; }
.bth-team-row-serving { border: 2px solid var(--accent); }
.bth-team-name { color: var(--text); font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.bth-serve-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); }
.bth-team-score { display: flex; align-items: center; gap: 10px; }
.bth-sets-note { color: var(--text-secondary); font-size: 14px; font-weight: 600; }
.bth-points { background: #1A0F2B; color: var(--text); font-family: var(--font-display); font-size: 26px; font-weight: 800; border-radius: 10px; padding: 6px 14px; }
.bth-status-row { display: flex; align-items: center; gap: 10px; background: #1A0F2B; border-radius: 12px; padding: 12px 16px; color: var(--text); font-size: 14px; font-weight: 600; }
.bth-status-row-highlight { background: var(--accent); color: var(--bg); font-weight: 700; }

.bth-calls { background: var(--bg-warm); }
.bth-calls-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
.bth-calls-sub { font-size: 17px; line-height: 1.6; color: var(--text-secondary); max-width: 380px; margin: 0; }
.bth-card-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 44px; }
.bth-call-chip { display: flex; align-items: center; gap: 14px; background: var(--bg-elevated); border-radius: 14px; padding: 20px 22px; font-size: 17px; font-weight: 700; }

.bth-devices-inner { display: flex; flex-direction: column; align-items: center; gap: 44px; text-align: center; }
.bth-devices-sub { font-size: 19px; line-height: 1.6; color: var(--text-secondary); max-width: 700px; margin: 0; }
.bth-device-row { display: flex; align-items: flex-end; gap: 32px; flex-wrap: wrap; justify-content: center; }
.bth-device { border: 3px solid var(--text-secondary); background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--text-secondary); }
.bth-device-phone { width: 150px; height: 280px; border-radius: 24px; }
.bth-device-tablet { width: 280px; height: 360px; border-radius: 20px; }
.bth-device-laptop { width: 460px; height: 300px; border-radius: 14px; }
.bth-store-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.bth-store-badge { border: 1.5px solid var(--text-secondary); border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 700; color: var(--text); text-decoration: none; }

.bth-pricing { background: var(--bg-warm); }
.bth-pricing-head { display: flex; flex-direction: column; gap: 14px; text-align: center; align-items: center; }
.bth-price-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; max-width: 1100px; margin: 44px auto 0 auto; }
.bth-price-card { display: flex; flex-direction: column; gap: 18px; background: var(--bg-elevated); border: 1px solid #3C2865; border-radius: var(--radius-xl); padding: 36px 32px; }
.bth-price-tier { font-size: 16px; font-weight: 700; color: var(--text-secondary); }
.bth-price-num { font-family: var(--font-display); font-size: 44px; font-weight: 800; }
.bth-price-note { font-size: 15px; color: var(--text-muted); }
.bth-price-btn { border: 2px solid var(--text-secondary); border-radius: var(--radius-pill); padding: 12px 0; text-align: center; font-weight: 700; font-size: 15px; color: var(--text); text-decoration: none; margin-top: auto; }
.bth-price-card-hi { background: #FFF7EC; color: #2B1B4D; border: none; box-shadow: 0 20px 50px rgba(20, 10, 34, 0.55); }
.bth-price-card-hi .bth-price-tier { color: #7A2E63; }
.bth-price-card-hi .bth-price-note { color: #8A7A96; }
.bth-price-flag { background: var(--primary); color: #FFF7EC; font-size: 12px; font-weight: 800; border-radius: var(--radius-pill); padding: 5px 12px; }
.bth-price-btn-hi { background: var(--primary); border-radius: var(--radius-pill); padding: 12px 0; text-align: center; font-weight: 700; font-size: 15px; color: #FFF7EC; text-decoration: none; margin-top: auto; }
.bth-price-head-row { display: flex; align-items: center; justify-content: space-between; }

.bth-faq-wrap { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
.bth-faq-list { display: flex; flex-direction: column; gap: 14px; }
.bth-faq-item { background: var(--bg-elevated); border: 1px solid #3C2865; border-radius: 14px; padding: 22px 26px; }
.bth-faq-q { font-size: 17px; font-weight: 700; margin: 0; }
.bth-faq-a { font-size: 15px; line-height: 1.55; color: var(--text-secondary); margin: 10px 0 0 0; }

.bth-final { position: relative; overflow: hidden; background: linear-gradient(180deg, #2B1B4D 0%, #7A2E63 45%, #E85D50 80%, #FFA24B 100%); padding: 120px 64px; }
.bth-final-sun { position: absolute; bottom: -140px; left: 50%; margin-left: -160px; width: 320px; height: 320px; border-radius: 50%; background: #FFDE9E; opacity: 0.8; }
.bth-final-inner { position: relative; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; align-items: center; text-align: center; }
.bth-final-h2 { font-family: var(--font-display); font-weight: 800; font-size: clamp(38px, 4.2vw, 56px); line-height: 1.06; letter-spacing: -0.02em; margin: 0; text-shadow: 0 4px 30px rgba(30, 18, 48, 0.35); }

/* Live-story stage (BT retelling of the volleyref live story) */
.bth-story-head { max-width: 760px; }
.bth-story-stage { position: relative; height: 520px; background: var(--bg-warm); border: 1px solid #322050; border-radius: var(--radius-xl); overflow: hidden; margin-top: 44px; }
.bth-story-links { position: absolute; inset: 0; width: 100%; height: 100%; }
.bth-link { stroke: var(--text-secondary); stroke-width: 2; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset 0.9s ease, opacity 0.4s ease; }
.bth-linkset.is-on .bth-link { stroke-dashoffset: 0; opacity: 0.55; }
.bth-port { fill: var(--text-secondary); opacity: 0; transition: opacity 0.4s ease; }
.bth-linkset.is-on .bth-port { opacity: 0.7; }
.bth-ring { stroke: var(--accent); stroke-width: 2; stroke-dasharray: 4 10; opacity: 0; transition: opacity 0.5s ease; }
.bth-pulse { fill: var(--accent); opacity: 0; }
.bth-linkset-pulses .bth-pulse.is-on, .bth-pulse.is-on { opacity: 1; }
.bth-pulse-local { opacity: 0; }
.bth-node { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease; color: var(--text-secondary); text-align: center; }
.bth-node.is-on { opacity: 1; transform: translateY(0); }
.bth-node-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; }
.bth-node-sub { font-size: 11px; font-weight: 600; color: var(--text-muted); }
.bth-node-down-tag { display: none; background: var(--primary); color: #FFF7EC; font-size: 10px; font-weight: 800; border-radius: 6px; padding: 3px 8px; }
.bth-tag-wait { background: #3C2865; color: var(--accent); }
.bth-node-scorechip { background: #1A0F2B; color: var(--text); font-size: 11px; font-weight: 700; border-radius: 6px; padding: 3px 8px; }
.bth-node-you { left: 12%; top: 36%; background: #2F1D4A; border: 2px solid var(--accent); border-radius: 16px; padding: 16px 18px; color: var(--text); width: 200px; }
.bth-node-cloud { left: 44%; top: 7%; flex-direction: row; background: #1A0F2B; border: 1px solid #3C2865; border-radius: 14px; padding: 14px 18px; gap: 10px; }
.bth-node-court { left: 78%; top: 20%; }
.bth-node-home { left: 15%; top: 6%; }
.bth-node-desk { left: 74%; top: 62%; }
.bth-story-stage.is-offline .bth-node-cloud { opacity: 0.65; border-style: dashed; animation: bth-cloud-flicker 0.6s steps(1, end) 1 both; }
.bth-story-stage.is-offline .bth-node-cloud .bth-node-down-tag { display: inline-block; }
.bth-story-stage.is-offline .bth-node-court, .bth-story-stage.is-offline .bth-node-home, .bth-story-stage.is-offline .bth-node-desk { opacity: 0.35; }
.bth-story-stage.is-offline .bth-node-home .bth-node-down-tag, .bth-story-stage.is-offline .bth-node-court .bth-node-down-tag, .bth-story-stage.is-offline .bth-node-desk .bth-node-down-tag { display: inline-block; }
.bth-story-stage.is-offline .bth-linkset .bth-link, .bth-story-stage.is-offline .bth-linkset .bth-port { opacity: 0.12; }
.bth-story-stage.is-offline .bth-pulse-cloud { opacity: 0; }
.bth-story-stage.is-offline .bth-ring { opacity: 0.7; }
.bth-story-stage.is-offline .bth-pulse-local { opacity: 1; }
@keyframes bth-cloud-flicker { 0% { opacity: 1; } 30% { opacity: 0.3; } 55% { opacity: 0.8; } 80% { opacity: 0.4; } 100% { opacity: 0.65; } }
.bth-story-stamp { display: none; position: absolute; left: 38%; top: 56%; background: var(--accent); color: var(--bg); border-radius: 14px; padding: 16px 22px; transform: rotate(-2deg); box-shadow: 0 16px 40px rgba(20, 10, 34, 0.5); }
.bth-story-stamp strong { display: block; font-family: var(--font-display); font-weight: 800; font-size: 22px; }
.bth-story-stamp-sub { font-size: 13px; font-weight: 600; }
.bth-story-stage.is-offline .bth-stamp-offline { display: block; }
.bth-story-stage.is-resync .bth-stamp-resync { display: block; }
.bth-story-caption { position: absolute; left: 24px; right: 24px; bottom: 20px; display: flex; align-items: center; gap: 14px; background: #1A0F2B; border-radius: 12px; padding: 12px 18px; }
.bth-story-caption-time { font-size: 13px; font-weight: 800; color: var(--accent); }
.bth-story-caption.is-swap [data-caption-text] { animation: bth-caption-in 0.4s ease both; }
@keyframes bth-caption-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.bth-story-caption [data-caption-text] { font-size: 14px; font-weight: 600; color: var(--text); }
.bth-story-rail { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; margin-top: 20px; }
.bth-story-step { display: flex; flex-direction: column; gap: 6px; background: var(--bg-elevated); border: 1px solid #3C2865; border-radius: 12px; padding: 14px 16px; text-align: left; cursor: pointer; font-family: var(--font-body); color: var(--text); position: relative; overflow: hidden; }
.bth-story-step.is-active { border: 2px solid var(--accent); }
.bth-story-step.is-active::after { content: ""; position: absolute; left: 0; bottom: 0; height: 3px; background: var(--accent); width: 100%; transform-origin: left; transform: scaleX(0); animation: bth-beat var(--beat, 6000ms) linear 1 both; }
@keyframes bth-beat { to { transform: scaleX(1); } }
.bth-story-step-num { font-size: 12px; font-weight: 800; color: var(--text-muted); }
.bth-story-step.is-active .bth-story-step-num { color: var(--accent); }
.bth-story-step-title { font-size: 14px; font-weight: 700; }
.bth-story-step-sub { font-size: 12px; color: var(--text-secondary); }

@media (max-width: 1100px) {
  .bth-card-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bth-card-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bth-scorecard { width: 100%; max-width: 430px; }
  .bth-story-rail { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .bth-section { padding: 64px 24px; }
  .bth-hero-inner { padding: 64px 24px 130px 24px; }
  .bth-split { flex-direction: column; gap: 48px; }
  .bth-calls-head { flex-direction: column; align-items: flex-start; }
  .bth-device-tablet { width: 240px; height: 300px; }
  .bth-device-laptop { width: 100%; max-width: 400px; height: 260px; }
  .bth-card-grid-4, .bth-card-grid-3, .bth-price-grid { grid-template-columns: minmax(0, 1fr); }
  .bth-story-stage { height: 420px; }
  .bth-story-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bth-story-stamp { left: 8%; }
  .bth-node-you { width: 160px; padding: 12px 14px; }
}
/* ==================== END BTH HOMEPAGE 2026 ==================== */
```

- [x] **Step 2: Replace the body content of `index.html`**

In `index.html`, delete everything between the closing `</nav>` tag and the opening `<footer` tag, and insert the following. Keep the nav, footer, head, and trailing scripts untouched.

```html
  <!-- HERO -->
  <header class="bth-hero">
    <div class="bth-hero-sun"></div>
    <div class="bth-hero-sand"></div>
    <svg class="bth-hero-court" viewBox="0 0 1200 140" fill="none" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="130" x2="1200" y2="130" stroke="#1E1230" stroke-width="5"></line><line x1="600" y1="130" x2="600" y2="20" stroke="#1E1230" stroke-width="5"></line><line x1="560" y1="20" x2="640" y2="20" stroke="#1E1230" stroke-width="5"></line></svg>
    <div class="bth-hero-inner">
      <div class="bth-hero-badge">The only app built for ITF beach tennis</div>
      <h1 class="bth-hero-h1">Play until<br>the light goes.</h1>
      <p class="bth-hero-sub">The score keeps itself. Serve order, sides, tie-breaks, change of ends, handled every point.</p>
      <div class="bth-hero-cta-col">
        <a href="https://app.beachtennisref.app" class="bth-pill-btn" data-cta="hero">Start Scoring Free</a>
        <div class="bth-microcopy">Your first matches are free. No credit card required.</div>
      </div>
      <div class="bth-trust">
        <div>ITF RULES</div>
        <div class="bth-trust-dot"></div>
        <div>SINGLES &amp; DOUBLES</div>
        <div class="bth-trust-dot"></div>
        <div>WORKS OFFLINE</div>
      </div>
    </div>
  </header>

  <!-- THE COUNTING PROBLEM -->
  <section class="bth-section">
    <div class="bth-inner">
      <div class="bth-eyebrow">Sound familiar?</div>
      <h2 class="bth-h2">Somebody always has to count. It ruins their game.</h2>
      <div class="bth-card-grid-4">
        <div class="bth-problem-card">
          <div class="bth-problem-num">5-4</div>
          <div class="bth-card-body">"Wait, whose serve is it?" The argument every doubles pair knows by heart.</div>
        </div>
        <div class="bth-problem-card">
          <div class="bth-problem-num">6-6</div>
          <div class="bth-card-body">The tie-break rotation everyone forgets. One serve, then two, then somebody guesses.</div>
        </div>
        <div class="bth-problem-card">
          <div class="bth-problem-num">Ends?</div>
          <div class="bth-card-body">Three games in and nobody remembers if you already changed sides. The sun does.</div>
        </div>
        <div class="bth-problem-card">
          <div class="bth-problem-num">40-40</div>
          <div class="bth-card-body">"Was that ad-in or deciding point?" Depends who you ask. It shouldn't.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- RULES HANDLED -->
  <section class="bth-section bth-rules">
    <div class="bth-inner">
      <div class="bth-split">
        <div class="bth-split-copy">
          <div class="bth-eyebrow">Rules handled, not just tracked</div>
          <h2 class="bth-h2">Scoreboard apps count taps. Beach Tennis Ref knows the rulebook.</h2>
          <p class="bth-lead">Who serves, from which side, when you switch ends, and what happens at 6-6. Advantage or deciding point, regular or match tie-break. You tap the winner of the rally; the ITF rules do the rest.</p>
          <div class="bth-chip-row">
            <div class="bth-chip">Serve order</div>
            <div class="bth-chip">Serving side</div>
            <div class="bth-chip">Tie-breaks</div>
            <div class="bth-chip">Change of ends</div>
          </div>
        </div>
        <div class="bth-scorecard">
          <div class="bth-scorecard-head">
            <div class="bth-scorecard-label">MATCH TIE-BREAK</div>
            <div class="bth-scorecard-set">SET 3</div>
          </div>
          <div class="bth-scorecard-body">
            <div class="bth-team-row">
              <div class="bth-team-name">Ana &amp; Marta</div>
              <div class="bth-team-score"><span class="bth-sets-note">6 &middot; 4</span><span class="bth-points">6</span></div>
            </div>
            <div class="bth-team-row bth-team-row-serving">
              <div class="bth-team-name"><span class="bth-serve-dot"></span>Luca &amp; Rafa</div>
              <div class="bth-team-score"><span class="bth-sets-note">4 &middot; 6</span><span class="bth-points">5</span></div>
            </div>
            <div class="bth-status-row">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="#FFC070" stroke-width="1.8"></circle><path d="M9 5 L 9 9 L 12 11" stroke="#FFC070" stroke-width="1.8" stroke-linecap="round"></path></svg>
              <span>Rafa serves next, left side</span>
            </div>
            <div class="bth-status-row bth-status-row-highlight">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 6 L 15 6 M 15 6 L 11.5 2.5 M 15 6 L 11.5 9.5" stroke="#1E1230" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12 L 3 12 M 3 12 L 6.5 8.5 M 3 12 L 6.5 15.5" stroke="#1E1230" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              <span>Change of ends after the next point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- EVERY CALL COVERED -->
  <section class="bth-section bth-calls">
    <div class="bth-inner">
      <div class="bth-calls-head">
        <div>
          <div class="bth-eyebrow">Every call covered</div>
          <h2 class="bth-h2">Good enough for a sanctioned final. Easy enough for Saturday doubles.</h2>
        </div>
        <p class="bth-calls-sub">Every call is one tap. Every tap can be undone. The full point-by-point history is always there.</p>
      </div>
      <div class="bth-card-grid-3">
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 L 12 21 M 5 8 C 8 10, 16 10, 19 8" stroke="#FFC070" stroke-width="2" stroke-linecap="round"></path></svg>Lets, replayed properly</div>
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 L 20 18 L 4 18 Z" stroke="#FFC070" stroke-width="2" stroke-linejoin="round"></path><path d="M12 10 L 12 13.5" stroke="#FFC070" stroke-width="2" stroke-linecap="round"></path><circle cx="12" cy="16" r="0.8" fill="#FFC070"></circle></svg>Hindrance calls</div>
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4 L 6 20 M 6 5 L 17 5 L 14.5 8.5 L 17 12 L 6 12" stroke="#FFC070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Forfeits and retirements</div>
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10 L 9 5 M 4 10 L 9 15 M 4 10 L 15 10 C 18 10, 20 12, 20 15 C 20 18, 18 20, 15 20 L 10 20" stroke="#FFC070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Undo anything</div>
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5 L 19 5 M 5 10 L 19 10 M 5 15 L 13 15 M 5 20 L 10 20" stroke="#FFC070" stroke-width="2" stroke-linecap="round"></path></svg>Point-by-point history</div>
        <div class="bth-call-chip"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5 L 19 10 L 9 20 L 4 20 L 4 15 Z" stroke="#FFC070" stroke-width="2" stroke-linejoin="round"></path></svg>Score corrections</div>
      </div>
    </div>
  </section>

  <!-- THE LIVE STORY -->
  <section class="bth-section" id="live-story">
    <div class="bth-inner">
      <div class="bth-story-head">
        <div class="bth-eyebrow">The live story</div>
        <h2 class="bth-h2">One match. Every phone on the beach. Even with the signal gone.</h2>
      </div>
      <div class="bth-story-stage" data-step="1" aria-label="How phones join one live match, step by step">
        <svg class="bth-story-links" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <g class="bth-linkset" data-on="2">
            <path id="bt-link-you" class="bth-link" pathLength="1" d="M300 250 L470 100"></path>
            <circle class="bth-port" cx="300" cy="250" r="4"></circle>
            <circle class="bth-port" cx="470" cy="100" r="4"></circle>
          </g>
          <g class="bth-linkset" data-on="3">
            <path id="bt-link-court" class="bth-link" pathLength="1" d="M545 95 L800 170"></path>
            <circle class="bth-port" cx="545" cy="95" r="4"></circle>
            <circle class="bth-port" cx="800" cy="170" r="4"></circle>
          </g>
          <g class="bth-linkset" data-on="4">
            <path id="bt-link-home" class="bth-link" pathLength="1" d="M465 75 L215 80"></path>
            <circle class="bth-port" cx="465" cy="75" r="4"></circle>
            <circle class="bth-port" cx="215" cy="80" r="4"></circle>
          </g>
          <g class="bth-linkset" data-on="4">
            <path id="bt-link-desk" class="bth-link" pathLength="1" d="M550 115 L780 400"></path>
            <circle class="bth-port" cx="550" cy="115" r="4"></circle>
            <circle class="bth-port" cx="780" cy="400" r="4"></circle>
          </g>
          <path id="bt-ring" class="bth-ring" d="M180 300 a110 110 0 1 0 220 0 a110 110 0 1 0 -220 0"></path>
          <circle class="bth-pulse bth-pulse-cloud is-on" r="6"><animateMotion dur="1.5s" begin="0s" repeatCount="indefinite"><mpath href="#bt-link-you"></mpath></animateMotion></circle>
          <circle class="bth-pulse bth-pulse-cloud is-on" r="6"><animateMotion dur="1.5s" begin="0.4s" repeatCount="indefinite"><mpath href="#bt-link-court"></mpath></animateMotion></circle>
          <circle class="bth-pulse bth-pulse-cloud is-on" r="6"><animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite"><mpath href="#bt-link-home"></mpath></animateMotion></circle>
          <circle class="bth-pulse bth-pulse-cloud is-on" r="6"><animateMotion dur="1.6s" begin="1.0s" repeatCount="indefinite"><mpath href="#bt-link-desk"></mpath></animateMotion></circle>
          <circle class="bth-pulse bth-pulse-local" r="6"><animateMotion dur="2.4s" begin="0s" repeatCount="indefinite"><mpath href="#bt-ring"></mpath></animateMotion></circle>
          <circle class="bth-pulse bth-pulse-local" r="6"><animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite"><mpath href="#bt-ring"></mpath></animateMotion></circle>
        </svg>
        <div class="bth-node bth-node-you" data-on="1">
          <span class="bth-node-label" style="color: var(--accent);">YOU &middot; ON COURT</span>
          <span class="bth-node-scorechip" data-youscore>0 - 0</span>
        </div>
        <div class="bth-node bth-node-cloud" data-on="2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19a4.5 4.5 0 0 0 .4-9A6 6 0 0 0 6.2 8.5 4.5 4.5 0 0 0 6.5 19z"></path></svg>
          <span class="bth-node-label">CLOUD SYNC</span>
          <span class="bth-node-down-tag">OFFLINE</span>
        </div>
        <div class="bth-node bth-node-court" data-on="3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"></rect><path d="M10.5 19h3"></path></svg>
          <span class="bth-node-label">COURTSIDE</span>
          <span class="bth-node-sub" data-watchers>+8 watching</span>
          <span class="bth-node-down-tag bth-tag-wait">WAITING</span>
        </div>
        <div class="bth-node bth-node-home" data-on="4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"></rect><path d="M10.5 19h3"></path></svg>
          <span class="bth-node-label">BACK HOME</span>
          <span class="bth-node-down-tag">NO FEED</span>
        </div>
        <div class="bth-node bth-node-desk" data-on="4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2.5"></rect><path d="M10 18.5h4"></path></svg>
          <span class="bth-node-label">TOURNAMENT DESK</span>
          <span class="bth-node-scorechip" data-deskscore>5 - 3</span>
          <span class="bth-node-down-tag bth-tag-wait">WAITING</span>
        </div>
        <div class="bth-story-stamp bth-stamp-offline"><strong>STILL WORKS.</strong><span class="bth-story-stamp-sub">Scoring doesn't need the internet. Every point saved on your phone.</span></div>
        <div class="bth-story-stamp bth-stamp-resync"><strong>ALL CAUGHT UP.</strong><span class="bth-story-stamp-sub">Everything synced the moment signal returned.</span></div>
        <div class="bth-story-caption" aria-live="polite">
          <span class="bth-story-caption-time" data-caption-time>6:48 PM</span>
          <span data-caption-text>Golden hour. You tap the first point of the club final.</span>
        </div>
      </div>
      <div class="bth-story-rail" role="list">
        <button class="bth-story-step" type="button" data-step-btn="1"><span class="bth-story-step-num">1</span><span class="bth-story-step-title">You score</span><span class="bth-story-step-sub">One phone. That's all it takes.</span></button>
        <button class="bth-story-step" type="button" data-step-btn="2"><span class="bth-story-step-num">2</span><span class="bth-story-step-title">Cloud backs you up</span><span class="bth-story-step-sub">Every point saved live.</span></button>
        <button class="bth-story-step" type="button" data-step-btn="3"><span class="bth-story-step-num">3</span><span class="bth-story-step-title">The court joins</span><span class="bth-story-step-sub">One QR scan at the net post.</span></button>
        <button class="bth-story-step" type="button" data-step-btn="4"><span class="bth-story-step-num">4</span><span class="bth-story-step-title">Everyone joins</span><span class="bth-story-step-sub">The desk, and family back home.</span></button>
        <button class="bth-story-step" type="button" data-step-btn="5"><span class="bth-story-step-num">5</span><span class="bth-story-step-title">The signal drops</span><span class="bth-story-step-sub">You keep scoring. Nothing is lost.</span></button>
        <button class="bth-story-step" type="button" data-step-btn="6"><span class="bth-story-step-num">6</span><span class="bth-story-step-title">Back online</span><span class="bth-story-step-sub">Everything resyncs at once.</span></button>
      </div>
    </div>
  </section>

  <!-- ANY DEVICE -->
  <section class="bth-section">
    <div class="bth-inner">
      <div class="bth-devices-inner">
        <div>
          <div class="bth-eyebrow" style="color: var(--accent);">Any device</div>
          <h2 class="bth-h2">Runs in the browser. No install required.</h2>
        </div>
        <p class="bth-devices-sub">Phone, tablet, laptop: open the page and score. There are App Store and Play Store versions anyway, for people who like icons.</p>
        <div class="bth-device-row">
          <div class="bth-device bth-device-phone">Phone</div>
          <div class="bth-device bth-device-tablet">Tablet</div>
          <div class="bth-device bth-device-laptop">Laptop</div>
        </div>
        <div class="bth-store-row">
          <a class="bth-store-badge" href="https://app.beachtennisref.app" data-cta="devices-appstore">App Store</a>
          <a class="bth-store-badge" href="https://app.beachtennisref.app" data-cta="devices-playstore">Google Play</a>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="bth-section bth-pricing" id="pricing">
    <div class="bth-inner">
      <div class="bth-pricing-head">
        <div class="bth-eyebrow">Pricing</div>
        <h2 class="bth-h2">Simple plans. Every plan has every feature.</h2>
      </div>
      <div class="bth-price-grid">
        <div class="bth-price-card">
          <div class="bth-price-tier">Weekly</div>
          <div class="bth-price-num">$4.99</div>
          <div class="bth-price-note">For the tournament weekend.</div>
          <a class="bth-price-btn" href="https://app.beachtennisref.app" data-cta="pricing-weekly">Choose Weekly</a>
        </div>
        <div class="bth-price-card bth-price-card-hi">
          <div class="bth-price-head-row">
            <div class="bth-price-tier">Yearly</div>
            <div class="bth-price-flag">MOST POPULAR</div>
          </div>
          <div class="bth-price-num">$49.99</div>
          <div class="bth-price-note">For the whole season on the sand.</div>
          <a class="bth-price-btn-hi" href="https://app.beachtennisref.app" data-cta="pricing-yearly">Choose Yearly</a>
        </div>
        <div class="bth-price-card">
          <div class="bth-price-tier">Monthly</div>
          <div class="bth-price-num">$14.99</div>
          <div class="bth-price-note">For the club ladder months.</div>
          <a class="bth-price-btn" href="https://app.beachtennisref.app" data-cta="pricing-monthly">Choose Monthly</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="bth-section" id="faq">
    <div class="bth-faq-wrap">
      <h2 class="bth-h2" style="text-align: center;">Questions? Answered.</h2>
      <div class="bth-faq-list">
        <div class="bth-faq-item">
          <p class="bth-faq-q">Which scoring formats does it support?</p>
          <p class="bth-faq-a">Advantage and no-ad (deciding point) scoring, regular tie-breaks, and match tie-breaks. Pick the format at match setup and the app handles it.</p>
        </div>
        <div class="bth-faq-item">
          <p class="bth-faq-q">Does it handle the tie-break serve order?</p>
          <p class="bth-faq-a">Yes. The app tracks who serves and from which side through the whole tie-break, including the change of ends inside it.</p>
        </div>
        <div class="bth-faq-item">
          <p class="bth-faq-q">Singles and doubles?</p>
          <p class="bth-faq-a">Both. Score 1v1 or 2v2; the app knows who serves next either way.</p>
        </div>
        <div class="bth-faq-item">
          <p class="bth-faq-q">What happens when I lose signal on the beach?</p>
          <p class="bth-faq-a">Nothing. Every point is stored on your device and syncs when you're back online.</p>
        </div>
        <div class="bth-faq-item">
          <p class="bth-faq-q">Can I fix a wrong score mid-match?</p>
          <p class="bth-faq-a">Yes. Undo anything and correct any score; the full point-by-point history stays intact.</p>
        </div>
        <div class="bth-faq-item">
          <p class="bth-faq-q">Can I cancel any time?</p>
          <p class="bth-faq-a">Yes. Manage or cancel the subscription any time; you keep access until the period ends.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="bth-final">
    <div class="bth-final-sun"></div>
    <div class="bth-final-inner">
      <h2 class="bth-final-h2">The sun is going down. The court is ready. The score is our job.</h2>
      <a href="https://app.beachtennisref.app" class="bth-pill-btn" data-cta="final">Start Scoring Free</a>
    </div>
  </section>
```

- [x] **Step 3: Update the FAQPage structured data to match the new FAQ copy**

This is a sanctioned exception to the "never touch `<head>`" rule, for exactly one block. In `index.html`'s head, find the `<script type="application/ld+json">` block whose JSON contains `"@type": "FAQPage"` (below the `<!-- Structured Data: FAQPage -->` comment, around line 114). Replace ONLY the JSON inside that one script tag with:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which scoring formats does it support?",
      "acceptedAnswer": { "@type": "Answer", "text": "Advantage and no-ad (deciding point) scoring, regular tie-breaks, and match tie-breaks. Pick the format at match setup and the app handles it." }
    },
    {
      "@type": "Question",
      "name": "Does it handle the tie-break serve order?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. The app tracks who serves and from which side through the whole tie-break, including the change of ends inside it." }
    },
    {
      "@type": "Question",
      "name": "Singles and doubles?",
      "acceptedAnswer": { "@type": "Answer", "text": "Both. Score 1v1 or 2v2; the app knows who serves next either way." }
    },
    {
      "@type": "Question",
      "name": "What happens when I lose signal on the beach?",
      "acceptedAnswer": { "@type": "Answer", "text": "Nothing. Every point is stored on your device and syncs when you're back online." }
    },
    {
      "@type": "Question",
      "name": "Can I fix a wrong score mid-match?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Undo anything and correct any score; the full point-by-point history stays intact." }
    },
    {
      "@type": "Question",
      "name": "Can I cancel any time?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Manage or cancel the subscription any time; you keep access until the period ends." }
    }
  ]
}
```

Touch nothing else in the head: not the other JSON-LD blocks, not titles, not meta descriptions.

- [x] **Step 4: Reconnect internal links the validator needs**

The validator requires every page to be reachable from the homepage via internal links. The old body may have carried internal links beyond what the footer holds.

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
If it reports unreachable pages, add each missing link as a plain `<a>` inside the existing footer link lists (do not restructure the footer; append items matching the footer's current item markup). Re-run until exit 0. If it reports anything OTHER than reachability or a problem in a file you edited, STOP and report.

- [x] **Step 5: Run the copy gates**

```bash
cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io
grep -c "No credit card required" index.html
grep -n "matches free" index.html
grep -n "volleyref" index.html; echo "exit=$? (expect 1, meaning no match)"
```
Expected: first prints `1` (hero microcopy only). Second: every hit is the exact phrase "Your first matches are free" with no number. Third: no match. If any differ, fix the body content.

- [x] **Step 6: Commit**

```bash
git add index.html css/style.css
git commit -m "Rebuild homepage with the Sunset Session dusk hero and night-plum sections"
```

---

### Task 3B: Live-story driver

**Files:**
- Create: `js/story.js` (the ONLY new JS file this plan permits)
- Modify: `index.html` (add exactly one `<script>` tag)

**Interfaces:**
- Consumes: the `.bth-story-*` markup and CSS from Task 3. Reference implementation: `../volleyref.github.io/js/main.js` lines ~381-511 (read-only reference; this is the adapted version, already rewritten below, so no copying is needed).
- Produces: the animated live-story behavior. Nothing downstream consumes it.

Behavior contract (matches the volleyball stage's mechanics): 6 beats advanced on a reading-paced timer while the stage is in view (IntersectionObserver, threshold 0.35); rail buttons jump to a beat and pause auto-advance ~9s; beat 5 adds `is-offline` to the stage (cloud flickers OFFLINE, cloud pulses hide, local ring pulses show); beat 6 removes `is-offline` and adds `is-resync`; SMIL clock pauses when the stage is off-screen; `prefers-reduced-motion` shows beat 6 statically and never animates.

- [x] **Step 1: Create `js/story.js` with exactly this content**

```js
// Live-story stage: phones join one live beach tennis match beat by beat.
// Beat 5 drops the signal (offline, still scoring); beat 6 resyncs.
// Auto-advances in view, rail buttons jump to a beat, reduced motion
// shows the resync finale statically.
document.addEventListener('DOMContentLoaded', function() {
  var storyStage = document.querySelector('.bth-story-stage');
  if (!storyStage) return;
  var FINAL_STEP = 6;
  var OFFLINE_STEP = 5;
  var storyItems = storyStage.querySelectorAll('[data-on]');
  var stepButtons = document.querySelectorAll('[data-step-btn]');
  var storySvg = storyStage.querySelector('.bth-story-links');
  var storyTimer = null;
  var resumeTimer = null;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var watchersEl = storyStage.querySelector('[data-watchers]');
  var WATCHERS_BY_STEP = { 3: 8, 4: 14, 5: 14, 6: 17 };
  var youScoreEl = storyStage.querySelector('[data-youscore]');
  var YOU_SCORES = { 1: '0 - 0', 2: '1 - 0', 3: '3 - 2', 4: '5 - 3', 5: '5 - 4', 6: '6 - 4 SET' };
  var deskScoreEl = storyStage.querySelector('[data-deskscore]');
  var DESK_SCORES = { 4: '5 - 3', 5: '5 - 3', 6: '6 - 4 SET' };
  var captionEl = storyStage.querySelector('.bth-story-caption');
  var captionTimeEl = storyStage.querySelector('[data-caption-time]');
  var captionTextEl = storyStage.querySelector('[data-caption-text]');
  // One golden-hour final, told beat by beat. The clock moves, the games
  // climb, and the set gets won while the signal is still gone.
  var CAPTIONS = [
    { t: '6:48 PM', x: 'Golden hour. You tap the first point of the club final.' },
    { t: '6:49 PM', x: 'Every tap is saved to the cloud before the sand settles.' },
    { t: '7:05 PM', x: 'Someone scans the QR on the net post. The whole court follows along.' },
    { t: '7:21 PM', x: 'The tournament desk and family back home see the same point land at the same second.' },
    { t: '7:44 PM', x: 'The beach loses signal mid-rally. Nobody on the court notices. The final keeps scoring itself.' },
    { t: '7:52 PM', x: 'One bar of signal returns. Every point lands everywhere at once.' }
  ];

  function setStoryStep(n, beatMs) {
    storyStage.dataset.step = String(n);
    storyStage.classList.toggle('is-offline', n === OFFLINE_STEP);
    storyStage.classList.toggle('is-resync', n === FINAL_STEP);
    storyItems.forEach(function(el) {
      el.classList.toggle('is-on', n >= parseInt(el.dataset.on, 10));
    });
    stepButtons.forEach(function(btn) {
      var active = parseInt(btn.dataset.stepBtn, 10) === n;
      btn.classList.toggle('is-active', active);
      if (active && beatMs) btn.style.setProperty('--beat', beatMs + 'ms');
    });
    if (watchersEl && WATCHERS_BY_STEP[n]) {
      watchersEl.textContent = '+' + WATCHERS_BY_STEP[n] + ' watching';
    }
    if (youScoreEl && YOU_SCORES[n]) { youScoreEl.textContent = YOU_SCORES[n]; }
    if (deskScoreEl && DESK_SCORES[n]) { deskScoreEl.textContent = DESK_SCORES[n]; }
    var cap = CAPTIONS[n - 1];
    if (captionEl && cap) {
      captionTimeEl.textContent = cap.t;
      captionTextEl.textContent = cap.x;
      captionEl.classList.remove('is-swap');
      void captionEl.offsetWidth;
      captionEl.classList.add('is-swap');
    }
  }

  // Each beat lasts long enough to read its caption (~3 words per second
  // plus settle time); the offline and resync beats hold a little longer.
  var FIRST_BEAT_MS = 2200;
  function beatDuration(step) {
    if (step === 1) return FIRST_BEAT_MS;
    var cap = CAPTIONS[step - 1];
    var words = cap ? cap.x.split(/\s+/).length : 10;
    var ms = Math.max(5000, Math.round((words / 3) * 1000) + 2500);
    if (step === OFFLINE_STEP || step === FINAL_STEP) ms += 3000;
    return ms;
  }

  function advanceStory() {
    var current = parseInt(storyStage.dataset.step, 10) || 1;
    var next = current >= FINAL_STEP ? 1 : current + 1;
    var beat = beatDuration(next);
    setStoryStep(next, beat);
    storyTimer = setTimeout(advanceStory, beat);
  }

  function pauseStory(resumeAfterMs) {
    clearTimeout(storyTimer);
    clearTimeout(resumeTimer);
    if (resumeAfterMs && !prefersReduced) {
      resumeTimer = setTimeout(function() {
        storyTimer = setTimeout(advanceStory, 800);
      }, resumeAfterMs);
    }
  }

  stepButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      setStoryStep(parseInt(btn.dataset.stepBtn, 10), 9800);
      pauseStory(9000);
    });
  });

  // The pulse dots are SMIL animations that otherwise tick for the whole
  // page lifetime; freeze the SVG clock whenever the stage can't be seen.
  function setSvgRunning(running) {
    if (!storySvg || !storySvg.pauseAnimations) return;
    try {
      if (running) { storySvg.unpauseAnimations(); } else { storySvg.pauseAnimations(); }
    } catch (e) {}
  }

  if (prefersReduced) {
    setStoryStep(FINAL_STEP);
    setSvgRunning(false);
  } else {
    setStoryStep(1);
    var storyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        setSvgRunning(entry.isIntersecting);
        if (entry.isIntersecting) {
          clearTimeout(storyTimer);
          storyTimer = setTimeout(advanceStory, beatDuration(1));
        } else {
          pauseStory();
        }
      });
    }, { threshold: 0.35 });
    storyObserver.observe(storyStage);
  }
});
```

- [x] **Step 2: Load it from `index.html`**

In `index.html`, directly BEFORE the existing `<script src="js/main.js"` tag at the end of `<body>` (or before `</body>` if the script tags are ordered differently; do not reorder existing tags), add exactly:

```html
  <script src="js/story.js" defer></script>
```

This is the only permitted change to the trailing scripts. Add it to `index.html` only, no other page.

- [x] **Step 3: Validate and commit**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0.

```bash
git add js/story.js index.html
git commit -m "Animate the live story: phones join the match, the signal drops, scoring survives, everything resyncs"
```

---

### Task 4: Sweep interior pages for stranded old-theme inline styles

**Files:**
- Modify: any `.html` file the greps below flag (values only, per the table)

**Interfaces:**
- Consumes: Task 2's tokens.
- Produces: interior pages fully on the new theme.

- [x] **Step 1: Find inline hard-coded old-theme colors in HTML files**

```bash
cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io
grep -rln 'style="[^"]*#09090b\|style="[^"]*#0d0b0a\|style="[^"]*#fafafa\|style="[^"]*#a1a1aa\|style="[^"]*#d4a24a' --include="*.html" . | grep -v "^./answers/\|^./glossary/\|^./rules-reference/"
```
(The excluded directories are generated by `aeo`; Task 7 handles them at the generator. At plan-writing time this grep found nothing; it stays as a safety check.)

- [x] **Step 2: Replace per table**

In each flagged file, inside `style="..."` attributes only, replace: `#09090b` with `var(--bg)`, `#0d0b0a` with `var(--bg-warm)`, `#fafafa` with `var(--text)`, `#a1a1aa` with `var(--text-secondary)`, `#d4a24a` with `var(--accent)`. Change nothing else in those files. Re-run the Step 1 grep; expected: no output.

- [x] **Step 3: Validate and commit**

Run: `npm run validate` — expected exit 0.

```bash
git add -u
git commit -m "Retheme interior page inline styles to the new palette tokens"
```
(Skip the commit if Step 1 found no files.)

---

### Task 5: Sitemap lastmod

**Files:**
- Modify: `sitemap.xml` (one `<lastmod>` value)

- [x] **Step 1: Update the homepage entry only**

In `sitemap.xml`, find the `<url>` entry whose `<loc>` is `https://beachtennisref.app/` and set its `<lastmod>` to `2026-08-26`. Do not change any other entry (style-only changes do not get a lastmod bump).

- [x] **Step 2: Validate and commit**

Run: `npm run validate` — expected exit 0.

```bash
git add sitemap.xml
git commit -m "Bump homepage sitemap lastmod for the redesign"
```

---

### Task 6: Content-template CSS layer for interior pages

**Files:**
- Modify: `css/style.css` (append AFTER the `BTH HOMEPAGE 2026` block)

**Interfaces:**
- Consumes: tokens from Task 2; the shared interior classes already emitted by every page family (`section-label`, `breadcrumb`, `feature-card`, `problem-card`, `benefit-card`, `faq-item`, `comparison-table`, `cta-section`, `hero-pill`, page heroes, `prose`).
- Produces: the `btt-quick-answer` / `btt-quick-answer-label` classes Task 7's generator edit uses. Visual target: `vbr-marketing/plans/assets/bt-homepage-canvas/Article.dc.html`.

- [x] **Step 1: Append the template block to `css/style.css`**

Append exactly this block after the `END BTH HOMEPAGE 2026` marker (keep both banner comments; the final gate greps for them):

```css
/* ==================== BTT TEMPLATES 2026 ==================== */
body .section-label {
  display: inline-flex; align-items: center;
  background: none; border: none; border-radius: 0; padding: 0;
  font-weight: 700; font-size: 14px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--primary-light);
}
body .breadcrumb { font-weight: 600; font-size: 13px; color: var(--text-secondary); }
body .breadcrumb a { color: var(--text-secondary); }
body .breadcrumb a:hover { color: var(--accent); }
body .feature-card, body .problem-card, body .benefit-card {
  background: var(--bg-elevated); border: 1px solid #3C2865;
  border-radius: var(--radius-lg); box-shadow: none;
}
body .faq-item { background: var(--bg-elevated); border: 1px solid #3C2865; border-radius: 14px; }
body .comparison-table { border: 1px solid #3C2865; border-radius: var(--radius-md); background: var(--bg-elevated); }
body .comparison-table th { background: #1A0F2B; color: var(--text); font-weight: 700; letter-spacing: 0.04em; }
body .comparison-table td { border-color: #3C2865; }
body .cta-section {
  background: linear-gradient(180deg, #7A2E63 0%, #E85D50 70%, #FFA24B 100%);
}
body .cta-section h2, body .cta-section p { color: #FFF7EC; }
body .cta-section .btn-primary { background: var(--bg); color: var(--text); }
body .hero-pill { border: 1px solid rgba(255, 247, 236, 0.4); border-radius: var(--radius-pill); background: transparent; font-weight: 700; letter-spacing: 0.06em; color: #FFE9D0; }
section.hero, header.hero, div.hero {
  background: linear-gradient(160deg, #2B1B4D 0%, #7A2E63 70%, #A84462 100%);
  color: var(--text);
}
body .hero-subline, body .hero-description { color: #FFE9D0; }
body .hero-microcopy { color: #FFE9D0; }
body .prose { font-size: 17px; line-height: 1.75; color: #E4D6EA; }
body .btt-quick-answer {
  background: var(--bg-elevated); border: 2px solid var(--accent);
  border-radius: var(--radius-lg); box-shadow: none;
}
body .btt-quick-answer-label {
  font-weight: 800; font-size: 12px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 10px;
}
/* ==================== END BTT TEMPLATES 2026 ==================== */
```

Notes pinned in advance (do not deviate): the homepage no longer uses `.hero` (Task 3 replaced it with `bth-` classes), so the gradient `.hero` rule only affects interior pages, which is intended. If a listed class does not appear in `css/style.css` today that is fine; the rule still applies to the class used in page markup.

- [x] **Step 2: Validate and commit**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0.

```bash
git add css/style.css
git commit -m "Give interior pages the Sunset Session template styling: dusk page heroes, indigo cards, gradient CTA bands"
```

---

### Task 7: AEO generator layout edits + regeneration

**Files:**
- Modify: `/Users/zrobok/Code/volleyball_referee/aeo/scripts/generate-bt.mjs` (two verbatim edits + one replace-all). NEVER `scripts/generate.mjs` (that is the volleyball generator).
- Regenerates (via the script, never by hand): `answers/`, `glossary/`, `rules-reference/`, `llms.txt`, and possibly `sitemap.xml`/`robots.txt` in the site repo

**Interfaces:**
- Consumes: `btt-quick-answer` / `btt-quick-answer-label` CSS from Task 6.
- Produces: regenerated answer/glossary pages carrying the labeled quick-answer and definition boxes.

- [x] **Step 1: Label the definition box in the glossary-term builder**

In `aeo/scripts/generate-bt.mjs` (around line 142), find exactly:

```
      <div class="feature-card" style="max-width:800px; margin:0 auto;" id="definition">
```

Replace with:

```
      <div class="feature-card btt-quick-answer" style="max-width:800px; margin:0 auto;" id="definition">
        <div class="btt-quick-answer-label">Definition</div>
```

(The original line is followed by a `<p ...>${escHtml(cleanDef)}</p>`-style line; keep that line unchanged, the label div sits before it.)

- [x] **Step 2: Label the answer box in the question-page builder**

In the same file (around line 332), find exactly:

```
      <div class="feature-card" style="max-width:800px; margin:0 auto; border-left: 4px solid var(--primary); padding-left: 1.5rem;" id="answer">
```

Replace with:

```
      <div class="feature-card btt-quick-answer" style="max-width:800px; margin:0 auto;" id="answer">
        <div class="btt-quick-answer-label">Quick Answer</div>
```

(Again the following `<p ...>` line stays unchanged.)

- [x] **Step 3: Let the CTA sections take the gradient band**

In the same file, replace EVERY occurrence (there are three, around lines 153, 347, 554) of:

```
<section class="section cta-section" style="background: var(--bg-elevated);">
```

with:

```
<section class="section cta-section">
```

Run: `grep -c 'cta-section" style="background: var(--bg-elevated)' /Users/zrobok/Code/volleyball_referee/aeo/scripts/generate-bt.mjs`
Expected: `0`.

- [x] **Step 4: Regenerate and inspect the blast radius**

```bash
cd /Users/zrobok/Code/volleyball_referee/aeo && node scripts/generate-bt.mjs
git -C /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io status --porcelain
```
Expected: the changed files are ONLY under `answers/`, `glossary/`, `rules-reference/`, plus possibly `llms.txt`, `sitemap.xml`, `robots.txt`, and root `*.md` mirrors. If anything else changed (any root `.html`, `css/`, `js/`), STOP and report; do not commit. Also confirm the volleyball site repo is untouched: `git -C /Users/zrobok/Code/volleyball_referee/volleyref.github.io status --porcelain` must show no NEW changes caused by this run (if it was dirty before, compare against what Task 1 would have seen; when in doubt STOP and report).

- [x] **Step 5: Validate and commit both repos**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0.

```bash
cd /Users/zrobok/Code/volleyball_referee/aeo
git add scripts/generate-bt.mjs
git commit -m "Emit labeled quick-answer and definition boxes and gradient CTA bands for the BT Sunset redesign"
cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io
git add answers glossary rules-reference llms.txt sitemap.xml robots.txt *.md
git commit -m "Regenerate rules content with the redesigned answer and glossary layout"
```
(If `git add` reports a pathspec that matches nothing, drop that pathspec from the command; do not add `-A`.)

---

### Task 8: Rebuild the 404 page

**Files:**
- Modify: `404.html` (body content only)

**Interfaces:**
- Consumes: nothing from other tasks (self-contained inline styles by design, since 404 renders for broken URLs where relative CSS may not resolve; keep whatever stylesheet link the head already has).
- Produces: nothing downstream.

- [x] **Step 1: Replace the 404 body content**

In `404.html`, keep the entire `<head>` and keep every `<script>` tag inside `<body>` (GA4/analytics). Replace all OTHER content inside `<body>` with:

```html
  <div style="min-height: 100vh; background: linear-gradient(180deg, #2B1B4D 0%, #7A2E63 45%, #E85D50 80%, #FFA24B 100%); color: #FFF7EC; font-family: 'Instrument Sans', 'Helvetica Neue', Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; text-align: center; padding: 32px; position: relative; overflow: hidden;">
    <div style="position: absolute; bottom: -140px; left: 50%; margin-left: -160px; width: 320px; height: 320px; border-radius: 50%; background: #FFDE9E; opacity: 0.8;"></div>
    <div style="background: #241539; border-radius: 20px; padding: 22px 36px; box-shadow: 0 32px 64px rgba(20, 10, 34, 0.6); display: flex; align-items: center; gap: 24px; position: relative;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="color: #C9B8D6; font-weight: 700; font-size: 12px;">YOU</div>
        <div style="font-family: 'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif; font-weight: 800; font-size: 64px; line-height: 1;">40</div>
      </div>
      <div style="font-family: 'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif; color: #9C8BAC; font-size: 36px; font-weight: 800;">:</div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="color: #C9B8D6; font-weight: 700; font-size: 12px;">THIS PAGE</div>
        <div style="font-family: 'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif; font-weight: 800; font-size: 64px; line-height: 1;">4</div>
      </div>
    </div>
    <h1 style="font-family: 'Bricolage Grotesque', 'Avenir Next', 'Trebuchet MS', sans-serif; font-weight: 800; font-size: clamp(44px, 7vw, 76px); line-height: 1.02; letter-spacing: -0.02em; margin: 0; position: relative; text-shadow: 0 4px 30px rgba(30, 18, 48, 0.35);">Long. Out.</h1>
    <p style="font-weight: 600; font-size: 19px; color: #FFE9D0; max-width: 560px; line-height: 1.5; margin: 0; position: relative;">This page landed outside the lines. Try again from the baseline.</p>
    <div style="display: flex; align-items: center; gap: 20px; margin-top: 8px; flex-wrap: wrap; justify-content: center; position: relative;">
      <a href="/" style="background: #1E1230; color: #FFF7EC; padding: 16px 34px; font-weight: 700; font-size: 17px; border-radius: 999px; text-decoration: none; display: inline-block;">Back to Home</a>
      <a href="/answers/" style="border: 2px solid rgba(255, 247, 236, 0.5); color: #FFF7EC; padding: 16px 28px; font-weight: 700; font-size: 15px; border-radius: 999px; text-decoration: none; display: inline-block;">Browse Answers</a>
    </div>
  </div>
```

(If `/answers/` does not resolve to a page in this repo, point that second link at an existing hub page such as `/beach-tennis-guide.html` instead; check with `ls answers/index.html` first.)

- [x] **Step 2: Validate and commit**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0.

```bash
git add 404.html
git commit -m "Give the missing-page screen the Sunset Session look"
```

---

### Task 9: Final gates

**Files:** none modified (fix-forward only if a gate fails, then re-run all gates).

- [x] **Step 1: Validator**

Run: `cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io && npm run validate`
Expected: exit 0.

- [x] **Step 2: No CSS selector was renamed or removed**

```bash
cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io
grep -oE '^[[:space:]]*[.#][a-zA-Z][a-zA-Z0-9_-]*' css/style.css | sed 's/^[[:space:]]*//' | sort -u > /tmp/bt-selectors-after.txt
comm -23 /tmp/bt-selectors-before.txt /tmp/bt-selectors-after.txt
```
Expected: empty output (every pre-existing selector still exists). Any line printed is a selector you removed; restore it.

- [x] **Step 3: Structure markers present exactly once each**

```bash
grep -c "BT SUNSET 2026 OVERRIDES" css/style.css
grep -c "BTH HOMEPAGE 2026" css/style.css
grep -c "BTT TEMPLATES 2026" css/style.css
grep -c "fonts.googleapis.com/css2?family=Bricolage" css/style.css
grep -c "bth-story-stage" index.html
ls js/story.js
grep -c 'src="js/story.js"' index.html
```
Expected: `2`, `2`, `2`, `1` (each banner has a start and end marker; the import appears once), then `1`, the file listed, and `1` (the story stage, its driver file, and its single script tag).

Also confirm the generator repo holds only its intended change:

```bash
git -C /Users/zrobok/Code/volleyball_referee/aeo status --porcelain
git -C /Users/zrobok/Code/volleyball_referee/aeo log --oneline -1
```
Expected: clean status; the latest commit is Task 7's.

- [x] **Step 4: Copy hygiene beyond the validator**

```bash
cd /Users/zrobok/Code/volleyball_referee/beachtennisref.github.io
grep -rn " -- " index.html 404.html || echo "clean"
grep -rn "\.\.\." index.html 404.html || echo "clean"
grep -c "No credit card required" index.html
grep -rn "volleyref" index.html 404.html || echo "clean"
```
Expected: `clean`, `clean`, `1`, `clean`.

- [x] **Step 5: Report**

Report to the user: tasks completed, every gate's actual output (pass/fail), files changed (`git log --oneline` for this session's commits), and this exact verification ask: "Run `cd beachtennisref.github.io && python3 -m http.server 8080` and open http://localhost:8080/ plus two interior pages (a glossary page and beach-tennis-vs-padel.html) to visually confirm the new theme. Nothing has been pushed."

---

## Executor Guardrails (repeat of the non-negotiables)

1. Never `git push`. Never `git stash`.
2. Never edit `scripts/validate-site.mjs` or any pre-existing file in `js/` (Task 3B creates `js/story.js`, the one permitted addition). A failing gate means your change is wrong, not the gate.
3. Never rename/remove a CSS selector, an HTML page, or a footer link.
4. Never touch `<head>` content except the single FAQPage JSON-LD block in Task 3 and the single `sitemap.xml` lastmod in Task 5.
5. No em dashes, no prose `--`, no emoji, no ellipses, no new copy beyond what this plan provides.
6. Never any volleyball branding or volleyref.app URL. Never claim TV/casting, Apple Watch, or Mac. Never a specific free-match count.
7. In `aeo`, only `scripts/generate-bt.mjs`, only the three Task 7 edits. Never `scripts/generate.mjs`, `data/`, or `templates/`.
8. If anything on disk contradicts this plan, STOP and report; do not improvise a workaround.

## Explicitly Out of Scope (do not do these)

- Replacing the mocked scorecard/live-card/QR/device panels with real app screenshots (follow-up task using the capture rig in the app repo: `./marketing-capture/capture.sh beach-tennis web`).
- New content pages.
- Changing page copy, titles, or meta descriptions on interior pages.
- Restructuring hand-authored interior page markup (comparison pages, how-tos): they get the new look through the shared CSS in Tasks 2 and 6 only.
- Any change in any repo other than `beachtennisref.github.io` and the Task 7 edits in `aeo`.
- Editing `aeo/data/*.yaml`, `aeo/templates/`, or anything in `aeo` beyond the three Task 7 edits to `scripts/generate-bt.mjs`.
