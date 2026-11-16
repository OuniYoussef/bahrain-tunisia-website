# Country pages (`/:lang/tunisia`, `/:lang/bahrain`)

One shared frame `features/country/CountryPage.tsx` with `country: 'tunisia' | 'bahrain'` and a config:
```ts
// country.config.ts
export const COUNTRY = {
  tunisia: { ns: 'tunisia', theme: 'tunisia', map: 'map-tunisia.svg', flag: 'flag-tunisia.svg', divider: 'arch', sectionOrder: [...] },
  bahrain: { ns: 'bahrain', theme: 'bahrain', map: 'map-bahrain.svg', flag: 'flag-bahrain.svg', divider: 'serrated', sectionOrder: [...] },
} as const;
```
Sections render from content; country-specific blocks render only when their content exists (type guards).
Section ids (anchors, stable): `welcome, destinations, wear, nature, cities, history, festive, food, monuments`.
`SectionNav` (sticky under the header) lists them with labels from `sectionNav.*` and highlights the current one.
Media for any item: `media('<country>.<section>.<group>', item.id)`.

## 1. Welcome (`welcome`) — hero + facts
- **Hero** (dark, min-height 92svh): background `media.<c>.welcome.images[0]` (priority), secondary image
  `images[1]` in an arch frame overlapping the bottom end corner (desktop). Eyebrow `welcome.eyebrow`,
  h1 `welcome.headline` (display-lg/xl), sub `welcome.subheadline`, a flag chip. Tunisia: bottom edge is a soft
  wave of arches; Bahrain: **serrated edge** (`divider-serrated.svg`, 5 points per 100 units) in pearl.
- **Intro**: `welcome.intro` in body-lg two columns on desktop (CSS columns) with a drop-cap in display font (Latin only).
- **Quick facts** (`factsTitle`, `facts[]`): `FactList`; Capital as the large lead fact; Flag fact shows the SVG flag;
  Currency/Independence values as written.
- **Bahrain only**: `nicknamesTitle` + `nicknames[]` as five horizontally arranged "museum labels" (title in display
  italic, text small) + `nameOrigin` as a pull-quote with a two-waters illustration (pattern) — sweet vs salt.
- **Useful words** (`wordsTitle`, `wordsIntro`, `wordsColumns`, `words[]`): `WordTable` (meaning | transliteration |
  Arabic script). Optional: speaker-less "flip card" interaction on mobile. Arabic script cells `lang="ar" dir="rtl"`.
- **Did you know?** (`didYouKnowTitle`, `didYouKnow[]`): six numbered cards in a horizontal scroll-snap row with
  large Reem Kufi/Fraunces numerals in `--accent`; on desktop a 3×2 grid.

## 2. Destinations (`destinations`) — "immersive showcase"
- SectionHeader: `eyebrow`, `title`, `intro`.
- **Featured 6** (`featured[]`): `DestinationShowcase`. Desktop ≥ 1024: pinned section; left/start column holds the
  country map (`CountryMap` with all pins dimmed), the track of six large arch-topped cards scrolls horizontally with
  scroll (scrub); the active card's `place` pin lights up in `--accent` with a pulse and its name label.
  Each card: image (4:5), title, 3-line clamp text, `UnescoBadge` if `unesco`, "Read more" opens a `Dialog` with the
  full text + `tip` (inset with gold rule) + "Show on the map" (scrolls map into view and highlights pin).
  Mobile: no pinning — map collapsed into a "Show on the map" toggle; cards in a scroll-snap carousel with peek.
  Map pins are buttons (`aria-label` = place title) that scroll/activate the matching card.
- **More places** (`moreTitle`, `more[]`): 3-column `CardGrid` (landscape 3:2 images), same dialog behaviour.
- **Tunisia only — Bizerte spotlight** (`spotlight`): dark `--accent-deep` panel. Left: `facts[]` (Where / About /
  Climate) as three stacked blocks with icons (map-pin, users, sun — lucide). Right: `placesTitle` + `places[]` as a
  bento grid of 7 tiles (first two larger), night photo `tn-bizerte-night` as the last tile with a subtle glow.

## 3. Traditional Wear (`wear`)
- SectionHeader with `intro` (Tunisia) — Bahrain has no intro.
- `groups[]` → a tab list (`Tabs`, one tab per group: Men, Women, Bridal/Jewellery/…) on desktop; accordions on
  mobile. Inside: `InfoCard` grid; items with images get portrait arch frames, items without images get the sand +
  khatam texture panel.
- **Tunisia only**: `regionalTitle` + `regional[]` as three map-annotated callouts (Djerba & south, Matmata, Sahel).
- **Bahrain only**: groups `crafts-clothes` and `crafts` are rendered as a separate sub-section "Crafts" after the
  tabs (keep the content titles), with a **Sadu band** separator; `jewelleryNote` displayed as a gold-ruled note under
  the jewellery tab.

## 4. Nature (`nature`)
Tunisia: three groups (coast, parks, desert) → three horizontal rows, each with a group title and a scroll-snap
row of landscape cards; the desert row on a darker sand background. Bahrain: one group (title empty) → an
asymmetric masonry of nine cards (Tree of Life large). Cards show `UnescoBadge` when flagged and a small "on the
map" link if `place` exists.

## 5. Cities (`cities`)
List of cities as alternating editorial rows (image start / text end, then swapped), image 3:2, city name in display,
text in body; the capital (first item) gets a full-width feature with a larger image. Bahrain: after Manama add the
nightlife image `media.bahrain.cities.nightlifeImage` as an inset in the Manama feature.

## 6. History (`history`)
- Intro paragraph (`intro`) as a large pull-quote.
- **Timeline** (`timelineTitle`, `timeline[]`): vertical, alternating on desktop, single side on mobile; items with
  `image` show a 4:3 thumbnail; show the first 10, then "Show more" (`common.ui.showMore`). The line draws on scroll.
- **Bahrain only — Pearl and maritime heritage** (`pearl`): dark teal "museum wall" sub-section: `pearl.title`,
  `pearl.intro`, image `media.bahrain.history.pearl.image` (historic pearl divers), and five label cards
  (`pearl.groups[]`: seasons, roles, tools, types, sea arts) with gold numerals 01–05. Pearl types card can show a
  four-step size scale (Danah → Yakka) drawn with circles.
- **Figures** (`figuresTitle`, `figures[]`): `FigureGrid` typographic cards (no portraits): name (display), `years`
  (small, tabular), text.

## 7. Celebrations (`festive`)
- `groups[]`: national holidays → a horizontal "calendar" of date chips (`date` big numerals + month) with title and
  text; religious → cards with the `note` ("Dates follow the lunar calendar.") as a small badge; festivals (Tunisia) /
  Ramadan traditions + social traditions (Bahrain) → image cards. Empty `text` → title only.
- Bahrain `gargeean-chant` item: render as a highlighted quote card (italic display, ornament), not a regular card.
- `weddings` (`title`, `text`, image `media.<c>.festive.weddings.image`): wide feature with henna/mezoued image.

## 8. Food (`food`)
- SectionHeader with `intro`.
- `groups[]`: Tunisia dishes / sweets / drinks; Bahrain dishes only. Each group: `DishGrid` with square images,
  name, text; first dish (national dish) spans two columns with a larger image. Filter chips by group on mobile.
- **Bahrain only — Arabic coffee** (`coffee`): split feature with dallah photo, text and the etiquette line set apart
  as a "tip" with a small cup icon.
- **Famous products** (`productsTitle`, `products`): `ProductStrip` — text + three round images
  (`media.<c>.food.productImages`).

## 9. Monuments (`monuments`)
`intro` + `MonumentGrid`: 3/2/1 columns, landscape cards, UNESCO badge (Bahrain shows `badgeYear`), place link.
Optional filter "UNESCO only" toggle (pure client filter).

## End of page
"Continue the journey" band: two cards → the other country page and Common Grounds (use existing nav labels).

## Image ids per section
**Tunisia** — welcome: tn-hero-sidi-bou-said-sea, tn-hero-sahara-dunes · destinations: tn-dest-sidi-bou-said,
tn-dest-el-djem, tn-dest-bizerte, tn-dest-monastir, tn-dest-medina-tunis, tn-dest-kairouan, tn-dest-carthage,
tn-dest-djerba, tn-dest-dougga, tn-dest-douz-tozeur, tn-dest-hammamet, tn-dest-matmata, tn-bizerte-medina,
tn-bizerte-coco-beach, tn-bizerte-ras-serrat, tn-bizerte-cap-zbib, tn-bizerte-rafraf, tn-bizerte-night · wear:
tn-wear-jebba, tn-wear-chechia, tn-wear-burnous, tn-wear-balgha, tn-wear-sefseri, tn-wear-fouta, tn-wear-keswa,
tn-wear-khomsa, tn-wear-silver-jewellery, tn-wear-jasmine-posy · nature: tn-nature-ras-angela, tn-nature-cap-bon,
tn-nature-tabarka, tn-nature-kerkennah, tn-nature-ichkeul, tn-nature-chambi, tn-nature-zaghouan, tn-nature-boukornine,
tn-nature-ksar-ghilane, tn-nature-chott-el-djerid, tn-nature-chebika, tn-nature-tataouine-landscape,
tn-nature-tozeur-oasis (+ reuses) · cities: tn-city-tunis, tn-city-sousse, tn-city-sfax, tn-city-monastir-mausoleum,
tn-city-houmt-souk, tn-city-tozeur (+ reuses) · history: tn-hist-punic-ports, tn-hist-roman-mosaic, tn-mon-mahdia,
tn-mon-zitouna, tn-mon-bardo, tn-fest-independence (+ reuses) · festive: cg-ramadan-lanterns, tn-sweet-assidat-zgougou,
tn-fest-carthage-theatre, tn-fest-sahara-festival, tn-fest-el-ghriba, tn-fest-mezoued · food: tn-food-* (11),
tn-sweet-* (7), tn-drink-mint-tea, tn-drink-kahwa, tn-drink-legmi, tn-product-deglet-nour, tn-product-olive-oil,
tn-food-harissa · monuments: tn-mon-kerkouane, tn-mon-bulla-regia, tn-mon-sbeitla, tn-mon-zaghouan-temple,
tn-mon-thuburbo-majus, tn-mon-ksar-ouled-soltane, tn-mon-borj-el-kebir, tn-mon-bizerte-kasbah, tn-mon-hammamet-kasbah (+ reuses).

**Bahrain** — welcome: bh-hero-manama-skyline, bh-hero-dhow-sea · destinations: bh-dest-qalat, bh-dest-tree-of-life,
bh-dest-pearling-path, bh-dest-al-fateh, bh-dest-bahrain-wtc, bh-dest-bab-al-bahrain, bh-dest-dilmun-mounds,
bh-dest-arad-fort, bh-dest-hawar, bh-dest-circuit · wear & crafts: bh-wear-thobe, bh-wear-ghutra, bh-wear-bisht,
bh-wear-thobe-nashal, bh-wear-gold-jewellery, bh-wear-pearls, cg-henna, bh-food-quzi, bh-craft-bani-jamra,
cg-gold-embroidery, bh-craft-sadu, bh-craft-aali-pottery, bh-craft-dhow-building, cg-palm-weaving, bh-craft-rawazin,
bh-craft-oud-bakhoor · nature: bh-nature-springs, bh-nature-palm-groves, bh-nature-socotra-cormorant, bh-nature-oryx,
bh-nature-jebel-dukhan, bh-nature-tubli-mangroves, bh-nature-beach, bh-nature-desert-sakhir · cities:
bh-city-financial-harbour, bh-city-muharraq, bh-city-riffa-fort, bh-city-sitra, bh-city-budaiya, bh-city-adliya ·
history: bh-hist-dilmun-seal, bh-hist-al-khamis, bh-hist-hidaya-school, bh-hist-oil-well, bh-hist-pearl-divers ·
festive: bh-fest-national-day, bh-food-khabeesa, bh-fest-gargeean, bh-food-balaleet, bh-fest-majlis,
bh-fest-camel-racing, bh-fest-fijiri · food: bh-food-* (12), bh-drink-arabic-coffee, bh-product-dates · monuments:
bh-hist-siyadi-house, bh-dest-barbar-temple, bh-mon-saar, bh-mon-ain-umm-al-sujur, bh-mon-bu-maher,
bh-city-national-museum, bh-city-beit-al-quran (+ reuses).

## Acceptance
All sections present in all locales; SectionNav works with keyboard and highlights correctly in RTL; pinned
destination scroll works on desktop and degrades to a carousel on touch/mobile and with reduced motion; dialogs are
accessible; map pins and cards are linked both ways; no CLS; Lighthouse a11y 100.
