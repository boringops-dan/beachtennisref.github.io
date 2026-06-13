# beachtennisref.github.io

Static marketing site for [BeachTennisRef.App](https://beachtennisref.app) -- a beach tennis scorekeeping / referee app with automatic ITF rule enforcement. Sibling of `volleyref.github.io` (the volleyball marketing site); same stack and conventions, beach-tennis brand.

## Architecture

- Standalone HTML pages (no template system, no SSG). Each page is self-contained.
- Shared CSS in `css/style.css`, shared JS in `js/` directory.
- Hosted on GitHub Pages, served at beachtennisref.app via custom domain.

## Analytics

- **Marketing site GA4:** `TODO` -- create a dedicated GA4 property for beachtennisref.app (do NOT reuse the volleyref property `G-MRGTZX69JM`). Add the tag to `<head>` and `js/analytics.js` before `</body>` on every page once the ID exists.
- **Web app GA4:** tracked separately in the app repo (`web_referee`); the BT app shares the multi-sport build.

## Key References

- **App / engine:** lives in `../VolleyballReferee2/web_referee` (beach tennis is the `packages/beach-tennis` sport). This repo is marketing only -- no app code.
- **Volleyball sibling site:** `../volleyref.github.io` -- mirror its page structure, components, and SEO patterns; rebrand copy/keywords for beach tennis.
- **Competitive position:** beach tennis scoring/referee keywords are near-uncontested (see the competitive audit) -- this site's job is to own them.

## Conventions

- Never use em dashes in copy or code.
- All pages should have: meta description, canonical URL, Open Graph tags, Twitter Card tags, structured data where appropriate.
- New content pages must be added to `sitemap.xml` and linked from the footer.
- Brand: "Beach Tennis Referee" / BeachTennisRef.App; CTAs point at `https://app.beachtennisref.app`. Never volleyball branding or volleyref.app links.
