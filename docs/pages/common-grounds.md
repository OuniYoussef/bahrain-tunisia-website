# Common Grounds Media Matrix (`/:lang/common-grounds/:slideId?`)

Namespace `matrix`; media `media.matrix.slides[id]`. Dark, full-screen, cinematic. 24 slides.

## Structure
1. **Intro screen** (only when no `slideId` in the URL): `intro.eyebrow`, h1 `intro.title`, `intro.text`, button
   `intro.start` → slide 1; behind it a slow crossfade mosaic of 6 slide images. If `slideId` is present, jump straight in.
2. **Deck** (`SlideDeck`): `<section aria-roledescription="carousel" aria-label={ui.regionLabel}>`; each slide is a
   `<div role="group" aria-roledescription="slide" aria-label={t(ui.slideLabel,{current,total})}>`. Only the active
   slide is in the accessibility tree (`inert` on the others). The slide title is an `<h2>`; the page keeps one `<h1>`
   (visually hidden on the deck: `intro.title`).
3. **Chrome**: top bar (close/back to United? → no; keep header visible but compact/transparent), bottom bar with
   progress (24 segments), counter `ui.slideLabel`, prev/next buttons, Play/Pause (`ui.play`/`ui.pause`), "All slides"
   button opening `SlideIndex` (grid of 24 thumbnails with kicker + title, `Dialog`), full-screen toggle
   (`ui.fullscreen`/`ui.exitFullscreen`, hidden if unsupported), and `ui.hint` shown once.

## Navigation
- Keyboard: ←/→ (mirrored in RTL), PageUp/PageDown, Home/End, Space = next (when deck focused). `Esc` closes index.
- Wheel/trackpad and touch swipe via GSAP `Observer` (`type: 'wheel,touch,pointer'`, `tolerance: 12`,
  `preventDefault: true` only while the deck is in view and not scrolling inner content); one slide per gesture
  with a cooldown during the transition.
- URL sync: `history.replaceState` to `/:lang/common-grounds/<slideId>` on change (shareable deep links).
  Browser back leaves the page (do not push 24 history entries).
- Autoplay: off by default. Play → advance every 9 s (IEEE: 8–10 s), pause on hover/focus/visibility hidden,
  stop at the last slide. Reduced motion: transitions become instant crossfades; Ken Burns disabled.

## Slide layouts (`media.layout`)
| Layout | Composition |
|---|---|
| `split` | Two halves (Tunisia start / Bahrain end in reading order; on mobile stacked top/bottom). Each half shows its first image full-bleed with Ken Burns; extra images appear as 2–3 small framed thumbnails that crossfade every 4 s. Country label chip (flag + `ui.tunisia`/`ui.bahrain`) and caption (`captions.tunisia/bahrain`) at the bottom of each half. Centre column/overlay: kicker number, title (h2, display), text (max 54ch) on a dark gradient panel. `shared` images (if any) appear as a circular inset on the seam. |
| `split-merge` | Starts as `split`, then after 1.2 s the halves slide together and blend into one combined frame (clip-path), text fades in. Used for slide 1 (welcome) and 23 (differences). |
| `words` | Slide 3: title/text plus a **word-pair board**: rows `pairs[]` → meaning (`ui.wordsMeaning`) · Tunisia word · Bahrain word (in AR show Arabic script words as provided), and a chip row `sharedWords[]` titled `ui.sharedWordsTitle`. Background halves use the Kufic images. |
| `cta` | Slide 24: big title, text, button `cta` → `/:lang/vault?share=1`, background collage of the two images with the jasmine/razji ornaments. |

**Video slot**: if `video` is not null, the half/full background becomes `VideoSlot` (muted, loop, playsInline,
poster = first image; YouTube/Vimeo as click-to-load facade with `youtube-nocookie.com`). Show a mute toggle
(`ui.mute`/`ui.unmute`) when the video has audio. Pause videos of inactive slides. Captions via `<track>` if provided.

## Slides (id → kicker → layout → images)
| # | id | layout | tunisia | bahrain | shared |
|---|---|---|---|---|---|
| 01 | welcome | split-merge | tn-dest-sidi-bou-said, un-hero-jasmine | bh-souq-manama, un-hero-razji | — |
| 02 | families | split | tn-food-couscous | bh-fest-majlis | — |
| 03 | language | words | cg-kairouan-kufic | cg-calligraphy | — |
| 04 | written-word | split | cg-blue-quran | bh-city-beit-al-quran | cg-calligraphy |
| 05 | poets | split | tn-city-tozeur | bh-city-muharraq | cg-manuscript |
| 06 | sea | split | tn-hist-punic-ports, tn-nature-kerkennah, tn-dest-bizerte | bh-hist-pearl-divers, bh-hero-dhow-sea, bh-dest-pearling-path | — |
| 07 | ships-songs | split | tn-fest-mezoued | bh-fest-fijiri | cg-oud |
| 08 | dates-sweets | split | tn-product-deglet-nour, tn-sweet-makroudh | bh-product-dates, bh-food-luqaimat | cg-spices |
| 09 | culinary | split | tn-food-couscous, tn-food-harissa, tn-food-ojja | bh-food-machboos, bh-food-mahyawa, bh-food-balaleet | — |
| 10 | welcome-art | split | tn-drink-mint-tea, tn-wear-jasmine-posy | bh-drink-arabic-coffee, bh-product-dates | — |
| 11 | palms | split | tn-nature-chebika, tn-nature-tozeur-oasis | bh-nature-palm-groves, bh-nature-springs | cg-palm-weaving |
| 12 | dress | split | tn-wear-chechia, tn-wear-jebba, tn-wear-keswa | bh-wear-bisht, bh-wear-thobe, bh-wear-thobe-nashal | cg-gold-embroidery |
| 13 | jewellery | split | tn-wear-silver-jewellery, tn-wear-khomsa | bh-wear-gold-jewellery, bh-wear-pearls | cg-henna |
| 14 | weddings | split | tn-wear-keswa, tn-fest-mezoued | bh-wear-thobe-nashal, bh-food-quzi | cg-henna |
| 15 | crafts | split | tn-craft-guellala-pottery, tn-craft-sejnane-pottery, tn-craft-kairouan-carpet | bh-craft-aali-pottery, bh-craft-bani-jamra | cg-palm-weaving |
| 16 | windows | split | tn-sbs-blue-door, tn-mashrabiya, tn-dest-medina-tunis | bh-craft-rawazin, bh-hist-shaikh-isa-house | — |
| 17 | forts-waters | split | tn-dest-monastir, tn-mon-zaghouan-temple, tn-mon-hammamet-kasbah | bh-dest-qalat, bh-dest-barbar-temple, bh-dest-arad-fort | — |
| 18 | civilizations | split | tn-dest-carthage | bh-dest-dilmun-mounds | — |
| 19 | faith | split | tn-sweet-zlebia, tn-food-brik | bh-fest-gargeean | cg-ramadan-lanterns, cg-iftar-table |
| 20 | learning | split | tn-mon-zitouna | bh-hist-hidaya-school | — |
| 21 | sport-talent | split | tn-fest-carthage-theatre | bh-dest-circuit | cg-stadium-crowd |
| 22 | independence | split | tn-fest-independence | bh-fest-national-day | — |
| 23 | differences | split-merge | tn-hero-sahara-dunes, tn-hero-sidi-bou-said-sea | bh-hero-manama-skyline, bh-dest-bahrain-wtc | — |
| 24 | cta | cta | tn-dest-sidi-bou-said | bh-dest-pearling-path | — |

## Production notes for future videos (from the brief; not rendered)
01 split screen Sidi Bou Said lanes ↔ old Manama souq merging · 02 family meal in each country, side by side ·
03 calligraphy being written; Kufic of Kairouan beside Kufic of Al-Fateh · 04 calligrapher at work · 05 poetry
reading in each country · 06 Punic ports of Carthage, old port of Bizerte, pearl divers and dhows at Muharraq ·
07 Fijiri performance beside a Tunisian malouf ensemble · 08 date harvest in Tozeur and a Bahraini grove; kitchens
making makroudh and luqaimat · 09 couscous and machboos prepared side by side · 10 pouring Tunisian tea from height;
pouring Bahraini coffee into a finjan · 11 weaving palm fronds in Karbabad and Tunisian oases · 12 dressing in jebba +
chechia, thobe + ghutra + bisht; brides in keswa and thobe al-nashal · 13 silversmith in the Tunis souk, goldsmith in
the Manama gold souk; henna night · 14 Tunisian wedding procession with mezoued beside a Bahraini zaffa · 15 potters at
the wheel in Guellala and A'ali; weavers in Tunisia and Bani Jamra · 16 slow walk through the Medina of Tunis and the
Pearling Path · 17 aerials of the Ribat of Monastir and Bahrain Fort at sunset · 18 ruins of Carthage and the Bahrain
Fort tell · 19 iftar in a Tunisian and a Bahraini home; Gargee'an night · 20 classrooms in each country · 21 athletes
and festival nights · 22 flags and fireworks · 23 split-screen finale moving between the two landscapes.
(Do not use portraits of real people without rights; for slides 5 and 21 the current design uses places, not portraits.)

## Acceptance
Deck usable with keyboard only, screen reader announces "slide X of 24" and the title; swipe works on phones;
deep links load the right slide in all locales; RTL navigation mirrored; no memory leaks when leaving the page
(Observer killed); images of slides ±1 preloaded (`<link rel="preload">` or `new Image()`), others lazy.
