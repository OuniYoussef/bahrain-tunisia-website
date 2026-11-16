# United page (`/:lang`) — default landing

Namespace `united` + `common`. Theme `data-theme="united"`. One `<h1>` (hero headline).

## 1. Hero — "split" (full viewport, dark)
- Two full-height halves (always geographic: **Tunisia left/west, Bahrain right/east**, also in Arabic):
  left `un-hero-jasmine`, right `un-hero-razji` (`media.united.hero.images`), both `priority`, `sizes="50vw"`
  (mobile: stacked 50svh each, or a single crossfading frame — choose stacked for clarity).
- A thin vertical **gold seam** in the centre with the two line-art flowers (`ornament-jasmine-tunisia.svg` above,
  `ornament-razji-bahrain.svg` below) drawing themselves on load.
- Overlay gradient for legibility. Content centred over the seam: eyebrow `hero.eyebrow`, h1 `hero.headline`
  (display-xl, white; the word "One"/"Une"/"واحدة" can be gold-italic emphasis in Latin), sub-headline
  `hero.subheadline` (body-lg, max 46ch), then the two centre buttons:
  `hero.exploreConnections` → `/:lang/common-grounds` (primary on dark) and `hero.shareStory` → `/:lang/vault?share=1` (ghost).
- Edge arrows (brief: left arrow "Discover Tunisia", right arrow "Discover Bahrain"): vertical labels hugging the
  outer edges with an arrow pointing outward, links to `/:lang/tunisia` and `/:lang/bahrain`. On mobile they become
  two pill buttons under the CTAs. Arrow icons point to their physical side (not mirrored).
- Desktop hover/focus on a half widens it to 58% and shows its country name in large outline type; the other half dims.
- Caption bottom-start, small: `hero.backgroundCaption`. Scroll hint bottom-centre `hero.scrollHint`.

## 2. Welcome
Pearl section, editorial two-column: big pull-quote style first sentence on the start side (display h2 size), the
full `hero.welcome` paragraph on the end side, plus two small flag+name chips ("Tunisia — land of Carthage",
"Bahrain — land of Dilmun" can be derived visually from the paragraph; do not add new copy).

## 3. Journey map (dark)
`journey.eyebrow`, `journey.title`, `journey.text`; the region map `map-region-tunisia-bahrain.svg` (inline) with
labels `journey.tunisLabel` / `journey.manamaLabel` placed at the city halos and a distance badge
`journey.distanceLabel`. Map is `role="img"` with `aria-label={journey.mapAlt}`. Route draws on scroll (MOTION).

## 4. The Two Nations at a Glance (`glance`)
SectionHeader (`eyebrow`, `title`). Real `<table>`: `<caption>` = `glance.caption` (visually hidden), header row
with flags + `columns.tunisia` / `columns.bahrain`, rows `glance.rows[]` (`label` as `<th scope="row">`).
Mobile: first column sticky, table scrolls horizontally inside a focusable region (`tabIndex=0`, `aria-label`),
or switch to stacked row cards (< 640px) — both acceptable; keep semantics. Rows reveal with stagger.

## 5. Connecting Points at a Glance (`connecting`)
SectionHeader + intro. Grid of 12 `ConnectingCard`s (4/3/2/1 columns). Each card: theme title, split image
(`media.united.connecting.items[id].images` → [tunisia, bahrain]) with a gold seam, then two lines with mini flags:
`item.tunisia`, `item.bahrain`. Hover/focus slides the seam. Cards link to the matching Matrix slide when one exists
(map: family→families, hospitality→welcome-art, sea→sea, palms→palms, faith→faith, dress→dress,
jewellery→jewellery, sweets→dates-sweets, crafts→crafts, music→ships-songs, heritage→civilizations, language→language).

## 6. Teasers (two large panels side by side, stacked on mobile)
- Common Grounds: dark panel, image `media.united.teasers.commonGrounds.image`, `teasers.commonGrounds.*`, CTA.
- Vault: sand panel with polaroid-style tilted photo `media.united.teasers.vault.image`, `teasers.vault.*`, CTA → `/:lang/vault`.

## Images used
`un-hero-jasmine, un-hero-razji, tn-food-couscous, bh-fest-majlis, tn-drink-mint-tea, bh-drink-arabic-coffee,
tn-hist-punic-ports, bh-hist-pearl-divers, tn-nature-tozeur-oasis, bh-nature-palm-groves, tn-dest-kairouan,
bh-dest-al-fateh, tn-wear-chechia, bh-wear-bisht, tn-wear-silver-jewellery, bh-wear-pearls, tn-sweet-makroudh,
bh-food-luqaimat, tn-craft-nabeul-pottery, bh-craft-aali-pottery, tn-fest-mezoued, bh-fest-fijiri, tn-dest-el-djem,
bh-dest-qalat, cg-kairouan-kufic, cg-calligraphy, tn-dest-sidi-bou-said, bh-dest-pearling-path`

## Acceptance
LCP ≤ 2.5s on 4G mobile (hero images priority, 1280w max on mobile). Hero readable in all locales (Arabic headline
in Amiri). No layout shift when fonts load. All 12 cards keyboard reachable; table accessible to screen readers.
