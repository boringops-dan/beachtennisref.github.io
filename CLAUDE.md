# beachtennisref.github.io

Static marketing site for [BeachTennisRef.App](https://beachtennisref.app) -- a beach tennis scorekeeping / referee app with automatic ITF rule enforcement. Sibling of `volleyref.github.io` (the volleyball marketing site); same stack and conventions, beach-tennis brand.

## Architecture

- Standalone HTML pages (no template system, no SSG). Each page is self-contained.
- Shared CSS in `css/style.css`, shared JS in `js/` directory.
- Hosted on GitHub Pages, served at beachtennisref.app via custom domain.

## Analytics

- **Marketing site GA4:** `G-JELDXQYBLN` -- the dedicated GA4 property for beachtennisref.app (do NOT reuse the volleyref property `G-MRGTZX69JM`). Tag is in `<head>` on every page; event tracking in `js/analytics.js`.
- **Web app GA4:** tracked separately in the app repo (`web_referee`); the BT app shares the multi-sport build.

## Key References

- **App / engine:** lives in `../VolleyballReferee2/web_referee` (beach tennis is the `packages/beach-tennis` sport). This repo is marketing only -- no app code.
- **Volleyball sibling site:** `../volleyref.github.io` -- mirror its page structure, components, and SEO patterns; rebrand copy/keywords for beach tennis.
- **Competitive position:** beach tennis scoring/referee keywords are near-uncontested (see the competitive audit) -- this site's job is to own them.

## App Store Connect sync

- `terms.txt` is a plain-text mirror of `terms.html`'s legal-prose content (headers as bare lines, blank-line-separated paragraphs, no markup). It's the copy-paste source for the app's Custom License Agreement field in App Store Connect (App Information > License Agreement > Edit), which only accepts plain text.
- Whenever `terms.html` changes, update `terms.txt` to match in the same commit, then paste the new `terms.txt` into App Store Connect. See `../volleyref.github.io/CLAUDE.md` for the incident that made this necessary.

## Conventions

- Never use em dashes in copy or code.
- All pages should have: meta description, canonical URL, Open Graph tags, Twitter Card tags, structured data where appropriate.
- New content pages must be added to `sitemap.xml` and linked from the footer.
- Brand: "Beach Tennis Referee" / BeachTennisRef.App; CTAs point at `https://app.beachtennisref.app`. Never volleyball branding or volleyref.app links.
