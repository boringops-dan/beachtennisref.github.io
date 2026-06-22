# Visual assets needed for beachtennisref.github.io

The site is built and themed, but ships with **placeholder visuals** for anything
sport-specific. Drop real beach-tennis assets at these paths (same names the
HTML already references) and they appear automatically — no markup changes.

## Required (referenced by the HTML today)

| Path | What | Notes |
|------|------|-------|
| `images/favicon.png` | 32×32 favicon | BeachTennisRef mark |
| `images/apple-touch-icon.png` | 180×180 | iOS home-screen icon |
| `images/icon-192.png`, `images/icon-512.png` | PWA icons | referenced by `manifest.json` |
| `images/logo.png` | OG/share logo | used in JSON-LD `publisher.logo` + OG images |
| `images/nav-logo.png` | small nav mark | optional — the nav falls back to a text logo if absent |
| `images/app-screenshot.png` | 1200×630 | OG/Twitter card image + hero `<img>` fallback |

## Recommended (richer hero — currently a themed CSS placeholder)

| Path | What |
|------|------|
| `images/hero-demo.webm` / `.mp4` / `images/hero-demo-poster.jpg` | looping scoreboard demo (the hero shows a styled placeholder until these exist) |
| `images/step-1-setup.png`, `step-2-*.png`, `step-3-*.png` | "how it works" step screenshots |

## Brand

- Accent: sand-gold `#d4a24a` (set in `css/style.css` `:root --primary`), matching the BT app's warm palette. Volleyball orange is intentionally NOT used here.
- Domain: `beachtennisref.app`; app/CTA: `https://app.beachtennisref.app`.

## Analytics

Every page's `<head>` has a `gtag` snippet wired to the dedicated GA4 property
`G-JELDXQYBLN` (beachtennisref.app). Do NOT reuse the volleyref property
`G-MRGTZX69JM`. The id is greppable site-wide: `grep -rl G-JELDXQYBLN`.
