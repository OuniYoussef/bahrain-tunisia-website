# Assets

## Photos — pipeline
The kit ships the **curated manifest + converter**, not the photo binaries (the authoring environment could
not reach image hosts). One command produces every photo as responsive WebP with significant names:

```bash
IMAGES_CONTACT="your.email@university.edu" npm run images:fetch     # ≈ 10–15 min, polite to Wikimedia
npm run images:fetch -- --only=tn-dest-el-djem,bh-dest-qalat        # redo some
npm run images:fetch -- --group=bahrain --refresh                   # re-pick a whole group
npm run images:fetch -- --dry-run                                   # resolve + report only
node scripts/images/fetch-images.mjs --selftest                     # offline test of the pipeline
```
- Sources: Wikimedia Commons/Wikipedia (Quality/Featured/Valued images preferred, article lead images,
  category trees), Openverse as fallback. Only **CC0, Public Domain, CC BY, CC BY-SA**. Maps/logos/montages/
  posters are filtered out. EXIF/GPS stripped by re-encoding.
- Output: `public/images/photos/<group>/<id>-<width>.webp` with widths
  hero `640/1280/1920/2560`, card `480/960/1440`, thumb `320/640`.
- `src/content/generated/images.generated.json`: `{ group, src, widths[], width, height, lqip, color, focal, credit{title,author,license,licenseUrl,sourceUrl,origin} }`.
- `public/images/photos/CREDITS.md` + the `/credits` page (reads the generated JSON) satisfy licence attribution.
- `scripts/images/selection.lock.json` makes picks reproducible — **commit it** and the WebP files.
- `scripts/images/report.html` (gitignored): contact sheet of all picks with alternatives. Review it once.
  To swap a pick, add to `scripts/images/overrides.json`: `"tn-dest-el-djem": "File:Exact name.jpg"` or
  `{ "file": "File:…", "focal": "50% 35%" }`, then `--only=<id>`.
- Team photos (e.g. real exchange photos): put the JPG/PNG in `scripts/images/own/` and add
  `"<id>": { "local": "own/<id>.jpg", "author": "Name", "license": "CC BY 4.0", "focal": "50% 40%" }` to
  `overrides.json`, then `--only=<id>`. The credit page shows your author/licence.

## Naming convention
`<country>-<section>-<subject>` in kebab-case: `tn-` Tunisia, `bh-` Bahrain, `un-` United, `cg-` shared/Common Grounds.
Sections: `hero, dest, wear, craft, nature, city, hist, mon, fest, food, sweet, drink, product`.
Examples: `tn-dest-sidi-bou-said`, `bh-food-machboos`, `un-hero-razji`, `cg-blue-quran`.
All 183 ids, their usage size and sources: `src/content/images.manifest.json`. Alt text (3 languages): `locales/*/images.json`.

## `<ResponsiveImage>` contract
```tsx
<ResponsiveImage id="tn-dest-el-djem" sizes="(min-width:1024px) 33vw, 90vw" className="aspect-[4/5]" />
<ResponsiveImage id="un-hero-jasmine" sizes="50vw" priority />      // LCP: fetchpriority="high", eager, no lazy
```
- Renders `<img>` with `srcset` from the generated widths, `width`/`height`, `loading="lazy"` + `decoding="async"`
  (unless `priority`), `style={{ objectPosition: focal, backgroundColor: color, backgroundImage: url(lqip) }}`,
  fades the LQIP out on load (CSS transition).
- `alt` from `images.json` unless overridden; decorative usage passes `alt=""`.
- Placeholder when the id has no generated entry yet (dev before running the script).
- Optional `credit` prop shows a small caption with author + licence linking to `/credits#<id>`.

## SVG assets (ready, original or open-licensed)
| File | Notes |
|---|---|
| `svg/maps/map-tunisia.svg` | Natural Earth 1:10m (PD). 38 pins `g.cm-pin[data-place]` with `<title>`; no `<style>` inside (safe to inline). Pins use `currentColor`; restyle via `.cm-land`, `.cm-pin-dot`, `.cm-pin-halo`. |
| `svg/maps/map-bahrain.svg` | © OpenStreetMap contributors (ODbL) 100 m boundary incl. Muharraq, Sitra, Umm an-Nasan, Hawar. 26 pins. |
| `svg/maps/map-region-tunisia-bahrain.svg` | Med → Gulf region, `#country-tunisia`, `#country-bahrain`, `#route` arc (DrawSVG), `#city-tunis`, `#city-manama` (classes `rm-*`; remove the route dash pattern before DrawSVG). Distance 3,974 km. |
| `svg/skyline/skyline-tunisia-bahrain.svg` | 15 landmarks (`g.landmark[data-landmark]`), `g.turbine` ×3 for rotation; `fill=currentColor`; openings via mask. Inline it (import `?raw` or as React component via a tiny loader). |
| `svg/patterns/pattern-khatam-star.svg`, `pattern-mashrabiya.svg`, `divider-serrated.svg` | black shapes → use as CSS `mask-image` with `background-color` for colour. |
| `svg/patterns/band-sadu.svg` | coloured band, `background-repeat: repeat-x`. |
| `svg/ornaments/ornament-jasmine-tunisia.svg`, `ornament-razji-bahrain.svg` | line art, `stroke=currentColor`, path ids for DrawSVG. |
| `svg/ornaments/mask-arch-round.svg`, `mask-arch-horseshoe.svg` | `mask-image` for arch-shaped photos (`mask-size: 100% 100%`). |
| `svg/flags/flag-tunisia.svg`, `flag-bahrain.svg` | official reds (#E70013 / #CE1126), geometry from country-flag-icons (MIT). |

Inline SVGs that need styling/animation: import with `?raw` and render via a small `InlineSvg` component that
sets `aria-hidden` or a `<title>`; or convert to React components with `vite-plugin-svgr` (allowed dev dep).

## Video slots (Common Grounds)
Slides are cinematic image compositions now. Each slide can later take a video without code changes:
`media.json → matrix.slides.<id>.video = { "provider": "file", "src": "/media/video/cg-06-sea.mp4", "poster": "tn-hist-punic-ports", "captions": "/media/video/cg-06-sea.en.vtt" }`
or `{ "provider": "youtube", "id": "<videoId>" }` (rendered with `youtube-nocookie.com`, click-to-load facade).
File naming: `public/media/video/cg-<NN>-<slide-id>.(mp4|webm)`, ≤ 8 MB, H.264/AV1, 1080p, muted loop, no audio
required; captions `.vtt` per language if there is speech. `VideoSlot` respects reduced motion (shows poster, play button).

## Brand files (IEEE)
`public/brand/` holds placeholders; replace with official files (see `public/brand/README.md` and `IEEE_BRANDING.md`).
