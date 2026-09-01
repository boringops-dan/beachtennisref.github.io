# BT homepage: hero contrast, live-story parity, and real app imagery

**Repo:** `beachtennisref.github.io` (plus scene files in
`../VolleyballReferee2/web_referee/frontend/marketing-capture`)
**Date:** 2026-08-31
**Executor note:** every value in this plan is decided. Do not substitute your
own colors, coordinates, or copy. Where a number is given, use that number.
Where a file path is given, that path exists and was verified on 2026-08-31.

---

## Why this plan exists

Four defects on `index.html`, all reported from screenshots of the live site:

1. **Hero text is unreadable.** `.bth-hero-sun` is a 280px cream disc painted
   directly behind the centered hero copy, and `.bth-hero-sub`,
   `.bth-microcopy` and `.bth-trust` are all `--cream-warm` (`#FFE9D0`).
   Cream-on-cream measures ~1.06:1. The lower rows also sit over the
   `#FFA24B -> #FFD07A` band, which measures ~1.7:1.
2. **The live-story pulse dots run on links that do not exist yet.** All four
   `.bth-pulse-cloud` circles in `index.html` carry a hard-coded `is-on` class
   and have **no** `data-on` attribute, so `js/story.js` (which selects
   `[data-on]`) never gates them. They animate from beat 1 along paths whose
   `.bth-linkset` is still invisible. Dots travel through empty space.
3. **The live-story diagram is thinner than the volleyball one.** The
   volleyball site's stage (`../volleyref.github.io/index.html:541-671`) has 8
   device nodes, a real app screenshot at the centre node, dashed
   device-to-device `.vh-mesh` links that appear at the offline beat, and a
   rotated "STILL WORKS." stamp over the screenshot. The BT stage has 4 nodes,
   no screenshot, and an invisible decorative ring (`#bt-ring`) instead of a
   mesh payoff, so the offline beat has nothing to show.
4. **The homepage has no real app imagery at all.** `index.html` references
   only `images/app-screenshot.png` (in OG/Twitter meta), `images/logo.png`
   and the icons. Everything the visitor sees is hand-drawn HTML: the
   `.bth-scorecard` block at `index.html:251-274` is a fake scoreboard
   ("Ana & Marta", "Luca & Rafa") written in divs, and `.bth-device-phone /
   -tablet / -laptop` at `index.html:391-393` are empty bordered rectangles
   containing only the words "Phone", "Tablet", "Laptop". The interior guide
   pages already use real `images/screenshots/*.png`; the homepage does not.
   `images/hero-demo.mp4` / `.webm` / `-poster.jpg` are referenced by nothing.

Defect 4 must be fixed **through the marketing-capture rig**, never by
hand-authoring another mock. The rig is at
`../VolleyballReferee2/web_referee/frontend/marketing-capture`; its README
states plainly that "writing a parallel one-off capture script is the failure
mode this rig exists to prevent". The BT web lane already exists
(`storyboards/beach-tennis/web/scenes/`, 6 scenes).

## Design constraints (do not violate)

- **Keep the BT visual language.** BT is the visual template for all sports.
  This plan borrows the volleyball stage's *structure* (node count, mesh
  payoff, screenshot node, stamp) and keeps BT's sunset palette, rounded
  cards, and `bth-` class prefix. Do not import volleyball colors.
- **Contrast is measured against the LIGHTEST surface the text can land on**,
  never eyeballed. Task 1 ships a computed gate for this.
- **No em dashes and no prose `--` in user-visible copy** (repo CLAUDE.md).
  Internal comments are fine.
- **No new top-level CSS selector outside the `bth-` / `btt-` prefixes**, and
  **no pre-existing selector may be renamed or removed**. Both are already
  enforced by `tests/theme.test.mjs`; they will fail the run if broken.
- Text never truncates: no `ellipsis`, `line-clamp`, or `nowrap`.

## Baseline (verified 2026-08-31, before any change)

```bash
cd beachtennisref.github.io
node --test "tests/*.test.mjs"     # 63 pass, 0 fail
node scripts/validate-site.mjs     # OK, 3 pre-existing 404.html og/twitter warnings
```

Those 3 warnings are pre-existing and out of scope. Leave them.

---

## Task 1 — Hero contrast

**Files:** `css/style.css` (lines 1795-1807), `tests/contrast.test.mjs` (new)

### The decided fix

Do **not** fix this by dropping a dark veil over the whole hero: that erases
the sunset. Fix it structurally, so no hero text ever lands on a light
surface: push the warm band and the sun into the bottom of the hero, below
where the copy ends, and set the sun on the horizon so the sand clips it.

**Step 1.1** — Replace the `.bth-hero` background (currently line 1797) with:

```css
.bth-hero { position: relative; overflow: hidden; background: linear-gradient(180deg, #1E1230 0%, #2B1B4D 30%, #7A2E63 62%, #E85D50 86%, #FFA24B 95%, #FFD07A 100%); }
```

**Step 1.2** — Replace `.bth-hero-sun` (line 1798) with:

```css
.bth-hero-sun { position: absolute; bottom: -40px; left: 50%; margin-left: -120px; width: 240px; height: 240px; border-radius: 50%; background: var(--accent-light); opacity: 0.9; }
```

`.bth-hero-sand` is 100px tall, opaque `var(--bg)`, and is painted after the
sun, so this leaves a 100px visible arc: a sun setting behind the sand line.
Do not reorder `.bth-hero-sun` and `.bth-hero-sand` in the markup.

**Step 1.3** — Replace `.bth-hero-inner` (line 1801) with:

```css
.bth-hero-inner { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 26px; padding: 96px 64px 300px 64px; }
```

and the 1100px-breakpoint override (line 1939) with:

```css
  .bth-hero-inner { padding: 64px 24px 260px 24px; }
```

**Step 1.4** — Raise the three offending text colors from `--cream-warm`
(`#FFE9D0`) to `--text` (`#FFF7EC`). Edit exactly these three declarations:

- line 1795 `.bth-microcopy` -> `color: var(--text);`
- line 1804 `.bth-hero-sub` -> `color: var(--text);`
- line 1806 `.bth-trust` -> `color: var(--text);`

Leave `.bth-lead` and `.bth-chip` (lines 1818, 1820) alone: they are not in
the hero.

**Step 1.5** — Move `.bth-hero-court` up with the new sun so the net post
still reads against the sand line. Replace line 1800 with:

```css
.bth-hero-court { position: absolute; bottom: 60px; left: 8%; width: 84%; height: 140px; }
```

### The gate: `tests/contrast.test.mjs` (new file)

This is the mechanical done criterion for Task 1. It parses the real declared
values out of `css/style.css` and computes WCAG ratios, so it fails if anyone
later re-lightens the hero. Model the file on `tests/theme.test.mjs`
(same imports from `./helpers.mjs`).

It must:

1. Implement `srgbLuminance(hex)` (WCAG 2.x: channel/255, then
   `c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055) ** 2.4`, weighted
   `0.2126 R + 0.7152 G + 0.0722 B`) and
   `ratio(a, b) = (Lmax + 0.05) / (Lmin + 0.05)`.
2. Implement `mix(fg, bg, alpha)` for straight alpha compositing.
3. Parse the `.bth-hero` gradient stops and the `.bth-hero-inner` bottom
   padding out of the stylesheet, rather than hard-coding them.
4. Assert, with a hero height of 1100px (state the assumption in a comment):
   - **The sun never sits behind text.** The sun's top edge, computed from
     `.bth-hero-sun`'s `bottom` and `height`, must be at least 40px below the
     bottom edge of `.bth-hero-inner`'s content box (i.e. below
     `heroHeight - paddingBottom`). With the values above the sun top is
     200px above the hero bottom and the content ends 300px above it: a 100px
     clearance. Assert `>= 40`.
   - **The lightest gradient point under text is dark enough.** Sample the
     gradient at the content bottom (`1 - paddingBottom/heroHeight` = 0.727)
     by linear interpolation between the bracketing stops; assert
     `ratio('#FFF7EC', sampled) >= 4.5`. With the Step 1.1 stops this sample
     is `#AC445A` and the ratio is ~5.3:1.
   - **The old failure can never come back:** assert
     `ratio('#FFE9D0', '#FFDE9E') < 1.5` (documenting why cream-on-sun was
     the bug) and that none of `.bth-hero-sub`, `.bth-microcopy`,
     `.bth-trust` declare `var(--cream-warm)`.
5. Assert `.bth-hero-sand` still uses `var(--bg)` and is declared after
   `.bth-hero-sun` in the stylesheet (the clip depends on paint order).

---

## Task 2 — Live-story pulses must be gated to their beat

**Files:** `index.html` (lines 330-336), `tests/story.test.mjs`

The four `.bth-pulse-cloud` circles hard-code `is-on` and carry no `data-on`.
Give each one the `data-on` of the `.bth-linkset` whose path it follows, and
**delete the literal `is-on` class** so `js/story.js` owns it. Mapping,
taken from the `<g data-on>` wrappers already in the file:

| pulse `mpath href` | linkset `data-on` |
|---|---|
| `#bt-link-you`   | `2` |
| `#bt-link-court` | `3` |
| `#bt-link-home`  | `4` |
| `#bt-link-desk`  | `4` |

So, for example, the first becomes:

```html
<circle class="bth-pulse bth-pulse-cloud" data-on="2" r="6"><animateMotion dur="1.5s" begin="0s" repeatCount="indefinite"><mpath href="#bt-link-you"></mpath></animateMotion></circle>
```

Leave the two `.bth-pulse-local` ring circles without `data-on`: they are
driven by `.bth-story-stage.is-offline .bth-pulse-local { opacity: 1 }`
(style.css:1909) and correctly stay dark until beat 5.

Do not change `js/story.js` for this task. Its
`storyStage.querySelectorAll('[data-on]')` already picks the circles up once
they have the attribute.

### Regression coverage for Task 2 (5 tests, mandatory)

This is a code fix for a real defect, so the repo's 5-test rule applies. Add
these to `tests/story.test.mjs`:

1. No `bth-pulse` element in `index.html` carries a literal `is-on` class
   (regex over the `<circle class="bth-pulse...` tags).
2. Every `.bth-pulse-cloud` circle declares a `data-on` attribute.
3. Each cloud pulse's `data-on` equals the `data-on` of the `<g>` that
   contains the path its `<mpath href>` points at. Parse both out of the HTML
   and compare, so a future re-numbering of the beats cannot desync them.
4. `.bth-pulse-local` circles declare **no** `data-on` (they are offline-only
   and CSS-driven).
5. Every `href` used by an `<mpath>` inside the story SVG resolves to an `id`
   that exists in that same SVG (catches a renamed path silently orphaning a
   pulse).

---

## Task 3 — Live-story parity with the volleyball stage

**Files:** `index.html` (the `#how-it-works` section, lines 300-379),
`css/style.css` (`.bth-node*`, `.bth-story-*`, ~lines 1880-1930),
`js/story.js`

The reference is `../volleyref.github.io/index.html:541-671` plus
`../volleyref.github.io/css/style.css:1841-1851`. Copy the *structure*, not
the colors.

**Step 3.1 — Add a real screenshot to the "YOU / ON COURT" node.**
`.bth-node-you` is currently a bare label plus a score chip. The volleyball
equivalent (`.vh-node-ref`) contains
`<img src="images/screenshots/live-scoring.png" ... loading="lazy">`. Put the
BT equivalent inside `.bth-node-you`, above the label:

```html
<img src="images/screenshots/scoreboard.png" alt="The referee's live beach tennis scoring screen" loading="lazy" width="2560" height="1600">
```

`images/screenshots/scoreboard.png` exists (2560x1600) and is produced by
`storyboards/beach-tennis/web/scenes/screenshots/scoreboard.js`. Give the img
`width: 100%; height: auto; border-radius: 8px; display: block;` under a new
`.bth-node-you img` rule, and widen `.bth-node-you` from `200px` to `260px`
(and the 1100px override from `160px` to `210px`).

**Step 3.2 — Add mesh links, so the offline beat has a payoff.** Right now
beat 5 dims everything and shows a decorative ring. Replace the ring with
device-to-device dashed links, exactly as `.vh-mesh` does. Delete the
`#bt-ring` path and the `.bth-ring` rule (style.css:1886) and its
`.is-offline .bth-ring` rule (style.css:1908); replace with four mesh paths
in the SVG, drawn between the four existing node positions:

```html
<path id="bt-mesh-court" class="bth-mesh" data-on="5" d="M330 300 Q 560 250 790 205"></path>
<path id="bt-mesh-desk" class="bth-mesh" data-on="5" d="M340 350 Q 560 400 775 415"></path>
<path id="bt-mesh-court-desk" class="bth-mesh" data-on="5" d="M812 215 Q 840 320 800 395"></path>
<path id="bt-mesh-you-desk" class="bth-mesh" data-on="5" d="M320 330 Q 520 470 770 430"></path>
```

and CSS:

```css
.bth-mesh { stroke: var(--accent); stroke-width: 2.5; stroke-dasharray: 7 7; fill: none; opacity: 0; transition: opacity 0.5s ease; }
.bth-mesh.is-on { opacity: 0.85; }
```

Move the two existing `.bth-pulse-local` circles onto the mesh paths (one on
`#bt-mesh-court`, one on `#bt-mesh-desk`) instead of `#bt-ring`, keeping them
without `data-on`.

**Step 3.3 — Beat 5 must stop dimming the mesh-connected nodes.**
`style.css:1904` fades `.bth-node-court`, `.bth-node-home`, `.bth-node-desk`
to `0.35` at the offline beat. That is right for `.bth-node-home` (family
back home genuinely loses the feed) and wrong for the two that stay connected
over the mesh. Narrow that rule to `.bth-node-home` only, and give
`.bth-node-court` / `.bth-node-desk` `opacity: 1` with their `WAITING` tag
replaced by a `DIRECT` tag. Add:

```css
.bth-story-stage.is-offline .bth-tag-direct { display: inline-block; background: var(--accent); color: var(--ink-deep); }
```

Change the two `bth-tag-wait` spans in the markup to `bth-tag-direct` and
their text from `WAITING` to `DIRECT`. Keep `bth-tag-wait` in the stylesheet:
the theme test forbids removing pre-existing selectors.

**Step 3.4 — Show the "STILL WORKS." stamp over the screenshot.** The stamp
markup already exists (`index.html:363`) and is correctly gated by
`.is-offline`. Reposition it so it lands over the `.bth-node-you` screenshot
like the volleyball one does, rather than in empty space: change
`.bth-story-stamp` `left: 38%; top: 56%` to `left: 20%; top: 44%` and keep
`transform: rotate(-2deg)`. `.bth-stamp-resync` keeps its own position; add
`.bth-stamp-resync { left: 38%; top: 56%; }` after the shared rule so beat 6
is unchanged from today.

**Step 3.5 — Accent the headline like the volleyball one.** Wrap the last
sentence of the `#how-it-works` `<h2>` in `<em>`:

```html
<h2 class="bth-h2">One match. Every phone on the beach. <em>Even with the signal gone.</em></h2>
```

and add `.bth-h2 em { font-style: normal; color: var(--primary-light); }`.

**Step 3.6 — `js/story.js` needs no logic change** for any of the above; the
new `[data-on]` elements are picked up automatically. Update only the header
comment to mention the mesh beat. Do **not** change `FINAL_STEP`,
`OFFLINE_STEP`, the beat durations, the IntersectionObserver threshold, or
the reduced-motion branch: `tests/story.test.mjs` asserts all of them
verbatim and they are correct.

**Step 3.7 — reduced motion.** `css/style.css:244` already hides
`.bth-pulse`. Add `.bth-mesh { opacity: 0.85; transition: none; }` inside the
same `@media (prefers-reduced-motion: reduce)` block so the finale still
reads statically.

---

## Task 4 — Real app imagery, captured with the rig

**Files:** new scene files under
`../VolleyballReferee2/web_referee/frontend/marketing-capture/storyboards/beach-tennis/web/scenes/`,
plus `index.html` and `css/style.css`.

Nothing in this task may be hand-drawn or hand-edited in an image editor.
Read `marketing-capture/README.md` (the "Web lane" section) before starting.
The scan is driven by the site's own HTML: **add the `<img>` / `<video>`
reference to `index.html` first, then create the matching scene file, then
run the lane.** An unclassified reference is a hard scan failure by design.

**Step 4.1 — Kill the fake scorecard.** Delete the entire `.bth-scorecard`
block, `index.html:251-274`. Replace it with a rig still:

```html
<div class="bth-shot bth-shot-scorecard">
  <img src="images/screenshots/rules-tiebreak.png" alt="Beach Tennis Ref showing a match tie-break with the serving side and change of ends called automatically" loading="lazy" width="2560" height="1600">
</div>
```

Leave the `.bth-scorecard*`, `.bth-team-*`, `.bth-points`, `.bth-serve-dot`,
`.bth-status-row*`, `.bth-sets-note` CSS rules in place (the theme test
forbids removing selectors); they simply stop being used. Add:

```css
.bth-shot { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--glass-border); box-shadow: var(--shadow-sm); }
.bth-shot img { display: block; width: 100%; height: auto; }
```

**Step 4.2 — Fill the empty device frames.** Replace `index.html:391-393`:

```html
<div class="bth-device bth-device-phone"><img src="images/screenshots/device-phone.png" alt="Beach Tennis Ref scoring on a phone" loading="lazy" width="1000" height="1558"></div>
<div class="bth-device bth-device-tablet"><img src="images/screenshots/device-tablet.png" alt="Beach Tennis Ref scoring on a tablet" loading="lazy" width="1600" height="2048"></div>
<div class="bth-device bth-device-laptop"><img src="images/screenshots/device-laptop.png" alt="Beach Tennis Ref scoring on a laptop" loading="lazy" width="2560" height="1600"></div>
```

and change `.bth-device` (style.css:1845) to drop the centred label styling
and clip its child:

```css
.bth-device { border: 3px solid var(--text-secondary); background: var(--bg-elevated); overflow: hidden; display: flex; align-items: stretch; justify-content: center; font-size: 13px; font-weight: 700; color: var(--text-secondary); }
.bth-device img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
```

The three frames keep their existing sizes. Because `object-fit: cover`
crops, each scene must be captured at the frame's own aspect ratio via the
scene `viewport` override (see below), so the crop is minimal.

**Step 4.3 — Write four scene files.** Each lives at
`storyboards/beach-tennis/web/scenes/screenshots/<id>.js`, `meta.id` must
equal the filename, and `kind: 'still'` means the scene calls `still()`
exactly once. Model them on the existing
`storyboards/beach-tennis/web/scenes/screenshots/scoreboard.js` (read it
first; reuse its seeding via the beach-tennis fixture rather than inventing
demo data).

| id | what it must show | viewport |
|---|---|---|
| `screenshots/rules-tiebreak` | a live match tie-break: both pairs, the set score, the serving indicator, and the change-of-ends banner visible in one frame | `{ width: 1280, height: 800 }` |
| `screenshots/device-phone` | the scoring surface mid-set | `{ width: 500, height: 933 }` (matches the 150x280 frame) |
| `screenshots/device-tablet` | the scoring surface mid-set | `{ width: 800, height: 1029 }` (matches the 280x360 frame) |
| `screenshots/device-laptop` | the scoring surface mid-set | `{ width: 1280, height: 835 }` (matches the 460x300 frame) |

`rules-tiebreak` is the one that replaces the fake card, so its state must
actually be a tie-break with a pending change of ends: drive the fixture to
that state rather than screenshotting a generic scoreboard. If the BT
fixture has no helper for it, add one to
`storyboards/beach-tennis/actions.js` alongside the existing helpers; do not
inline a bespoke click sequence in the scene.

**Step 4.4 — Run the lane.**

```bash
cd ../VolleyballReferee2/web_referee
./start-local.sh                       # if the localhost stack is not up
cd frontend
./marketing-capture/capture.sh beach-tennis web
```

The run renders straight into `beachtennisref.github.io/images/`, enforces
its own coverage gate (every scanned id fresh this run, or the run fails),
and regenerates the feature registry. If it reports orphans, report them;
do not delete anything.

`images/hero-demo.mp4`, `.webm` and `-poster.jpg` are referenced by no page.
Leave them on disk and mention them in your final report as orphans for the
user to decide on. Do not delete them.

**Step 4.5 — Regression coverage for Task 4 (5 tests, mandatory).** Add
`tests/homepage-imagery.test.mjs`:

1. `index.html` contains no `bth-scorecard` element (the fake card is gone).
2. Every `.bth-device` in `index.html` contains exactly one `<img>`.
3. Every `<img src="images/...">` in `index.html` points at a file that
   exists on disk.
4. Every `<img>` in `index.html` has a non-empty `alt`, an explicit `width`
   and `height`, and (except any above the fold) `loading="lazy"`.
5. No hand-authored scoreboard mock has crept back: assert `index.html`
   contains none of the literal team names used by the deleted mock
   (`Ana &amp; Marta`, `Luca &amp; Rafa`) and no `bth-team-name` element.

---

## Done criteria (all must pass, run from `beachtennisref.github.io`)

```bash
node --test "tests/*.test.mjs"      # was 63 pass / 0 fail; must still be 0 fail,
                                    # with the 15 new tests from Tasks 1, 2 and 4
node scripts/validate-site.mjs      # "OK - all gates passed", still exactly the
                                    # 3 pre-existing 404.html warnings, no new ones
cd ../VolleyballReferee2/web_referee/frontend
node --test marketing-capture/lib/*.test.mjs   # rig unit tests still green
```

Plus these, which are not scriptable and must be checked by eye against a
rendered page (open `index.html`, or serve the directory):

- Hero: the subtitle, the microcopy under the button, and the ITF RULES /
  SINGLES & DOUBLES / WORKS OFFLINE row are all clearly legible, and the sun
  reads as setting behind the sand line rather than sitting behind the text.
- Live story, beat 1: **no** dot is moving anywhere. Dots appear only as each
  beat's line draws in.
- Live story, beat 5: the cloud dims, the dashed mesh links light up between
  YOU / COURTSIDE / TOURNAMENT DESK, only BACK HOME goes dark, and the
  "STILL WORKS." stamp lands over the screenshot.
- Any device: three frames, each filled with a real captured screenshot, no
  empty rectangles and no bare "Phone" / "Tablet" / "Laptop" labels.

## Out of scope

- The 3 pre-existing `404.html` og/twitter warnings.
- Interior guide pages: they already use real screenshots.
- Deleting orphaned assets (`hero-demo.*`, unreferenced `images/screenshots/*`).
  Report them; the user decides.
- The volleyball site. Nothing in `../volleyref.github.io` changes.
