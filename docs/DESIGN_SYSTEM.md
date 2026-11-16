# Design system — "Two Seas, One Heart"

## Direction
An **editorial heritage magazine meets premium travel guide**. Calm, warm, confident. Big serif headlines,
generous whitespace, asymmetric compositions, photography given room to breathe, and craft motifs used
sparingly as signatures (arches, khatam star, mashrabiya lattice, Sadu band, serrated edge, skyline).
Two cultural accents meet on one shared base: **Mediterranean blue + terracotta** (Tunisia) and
**Gulf teal + pearl gold** (Bahrain), joined by the **red and white** both flags share and by IEEE blue
for brand chrome.

Avoid: generic SaaS gradients, glassmorphism everywhere, purple, emoji, stock "card grid with shadow" pages,
centred everything, tiny body text, thin grey text, carousels that auto-play, flag-coloured rainbow layouts.

## Colour tokens (Tailwind v4 `@theme` in `src/styles/index.css`)
| Token | Hex | Use | Contrast notes |
|---|---|---|---|
| `--color-pearl` | `#F8F5EF` | page background | — |
| `--color-pearl-glow` | `#FFFDF8` | cards on pearl | — |
| `--color-sand-50` | `#F3ECDF` | alternate section bg | — |
| `--color-sand-100` | `#EFE6D6` | tinted panels, tags | — |
| `--color-sand-300` | `#D7C6A5` | rules, borders strong; text on ink | 10.4:1 on ink |
| `--color-line` | `#E2D8C6` | hairlines, card borders | — |
| `--color-ink` | `#0B1B2B` | primary text, dark sections (hero, matrix, footer) | 16:1 on pearl |
| `--color-ink-soft` | `#2A3A4B` | body text secondary | 10.7:1 |
| `--color-muted` | `#5A6878` | captions, meta | 5.2:1 pearl, 4.6:1 sand |
| `--color-ieee` | `#00629B` | IEEE chrome, links, focus ring | 6.0:1 pearl |
| `--color-ieee-40` | `#95BCD6` | links/focus on ink | 8.7:1 on ink |
| `--color-crimson` | `#C8102E` | shared red: key accents, active states, map route | 5.4:1 pearl |
| `--color-tn-blue` | `#1E63B5` | Tunisia accent (Sidi Bou Said blue) | 5.5:1 pearl |
| `--color-tn-blue-deep` | `#12407A` | Tunisia dark surfaces | white 10.3:1 |
| `--color-terracotta` | `#A94E28` | Tunisia secondary (pottery, sand) | 5.1:1 pearl (avoid on sand for small text) |
| `--color-olive` | `#56622A` | olive groves, nature tags | 6.1:1 |
| `--color-bh-teal` | `#00727A` | Bahrain accent (Gulf water) | 5.2:1 pearl |
| `--color-bh-teal-deep` | `#004B50` | Bahrain dark surfaces | white 9.9:1 |
| `--color-gold` | `#C29A4A` | pearl/gold ornaments, rules, numbers **on ink only** | 6.7:1 on ink, 2.4:1 on pearl ✗ text |
| `--color-gold-deep` | `#7E5B1C` | gold text on light surfaces | 5.7:1 pearl |
| `--color-palm` | `#2F5D46` | palm/oasis accents | 6.9:1 |

**Country theming.** Each page wrapper sets CSS variables used by components:
`[data-theme="tunisia"] { --accent: var(--color-tn-blue); --accent-deep: var(--color-tn-blue-deep); --accent-2: var(--color-terracotta); }`
`[data-theme="bahrain"] { --accent: var(--color-bh-teal); --accent-deep: var(--color-bh-teal-deep); --accent-2: var(--color-gold-deep); }`
`[data-theme="united"]  { --accent: var(--color-crimson); --accent-deep: var(--color-ink); --accent-2: var(--color-ieee); }`
Components use `text-(--accent)`, `bg-(--accent-deep)` etc., never country colours directly.

## Typography
| Role | Latin (EN/FR) | Arabic | Package |
|---|---|---|---|
| Display / headings | **Fraunces** (variable; `opsz` auto, `SOFT` 30–50, weights 400–700, italic for emphasis words) | **Amiri** 400/700 | `@fontsource-variable/fraunces`, `@fontsource/amiri` |
| Body / UI | **Readex Pro** (variable 200–700; has Arabic glyphs, so one family for both scripts) | Readex Pro | `@fontsource-variable/readex-pro` |
| Arabic accents (kicker, numbers in ornaments) | — | **Reem Kufi** (Kufic, echoes Kairouan/Al-Fateh calligraphy) | `@fontsource-variable/reem-kufi` |
| IEEE chrome (meta-nav, IEEE footer block) | **Open Sans** ≥ 12px (IEEE requirement) | Open Sans (labels stay English) | `@fontsource-variable/open-sans` |

Tokens: `--font-display`, `--font-sans`, `--font-kufi`, `--font-ieee`. `:lang(ar)` switches `--font-display`
to Amiri. Load only `latin`, `latin-ext` and `arabic` subsets; `font-display: swap`; preload the two files
used above the fold (Fraunces 600, Readex Pro 400).

Fluid scale (use `clamp`, defined as utilities `text-display-xl` … `text-eyebrow`):
| Token | Size | Line height | Notes |
|---|---|---|---|
| display-xl | `clamp(3.25rem, 1.9rem + 6vw, 7.5rem)` | 0.95 | hero headlines only; tracking -0.02em (Latin) |
| display-lg | `clamp(2.5rem, 1.6rem + 4vw, 5rem)` | 1.0 | page h1 |
| h2 | `clamp(2rem, 1.35rem + 2.6vw, 3.5rem)` | 1.05 | section titles |
| h3 | `clamp(1.375rem, 1.1rem + 1.1vw, 2rem)` | 1.15 | card titles large |
| h4 | `1.25rem` | 1.3 | card titles |
| body-lg | `1.1875rem` | 1.65 | intros (max 62ch) |
| body | `1.0625rem` | 1.7 | default (max 70ch) |
| small | `0.9375rem` | 1.55 | meta, captions |
| eyebrow | `0.8125rem`, 600, uppercase, tracking 0.18em | 1.2 | Latin only |

Arabic adjustments (`:lang(ar)`): no uppercase, no letter-spacing, body `1.125rem` with line-height 1.85,
headings Amiri 700 with line-height 1.3, eyebrow in Reem Kufi 500 `0.95rem`. French: allow `hyphens: auto` in
narrow cards; never break before `:;!?` (non-breaking spaces are already in the content).

## Layout
- Container: `max-width: 1440px`, inline padding `clamp(1.25rem, 4vw, 4rem)`. Text column max 70ch.
- 12-column grid (`grid-cols-12`, gap `clamp(1rem, 2vw, 2rem)`), editorial asymmetry (e.g. heading spans 5,
  intro spans 6 starting at col 7; images that bleed to the viewport edge on one side).
- Section rhythm: padding-block `clamp(4.5rem, 9vw, 9rem)`; alternate pearl / sand-50; dark ink sections for
  hero, journey map, matrix, footer. Max two dark sections in a row.
- Breakpoints (Tailwind defaults): sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Design at 360/768/1280/1920.
- Radii: `--radius-sm 6px`, `--radius-md 12px`, `--radius-lg 20px`, `--radius-xl 32px`,
  `--radius-arch: 999px 999px var(--radius-md) var(--radius-md)` (round arch top).
- Shadows: `--shadow-soft: 0 1px 2px rgb(11 27 43/.06), 0 8px 24px rgb(11 27 43/.08)`;
  `--shadow-lift: 0 24px 60px -18px rgb(11 27 43/.35)`. Prefer borders + tone over heavy shadows.

## Motifs and assets (all in `public/images/svg/`)
| Motif | File | How to use |
|---|---|---|
| Round arch frame | `ornaments/mask-arch-round.svg` or `--radius-arch` | portrait images (doors of Sidi Bou Said, Muharraq) |
| Horseshoe arch | `ornaments/mask-arch-horseshoe.svg` | 1–2 hero moments per page (Kairouan, Bab Bhar spirit) as `mask-image` |
| Khatam 8-point star lattice | `patterns/pattern-khatam-star.svg` | `mask-image` texture at 4–8% opacity over sand/ink; shared by both cultures |
| Mashrabiya / rawazin lattice | `patterns/pattern-mashrabiya.svg` | edges of heroes, "Windows to the Past" slide, form side panel |
| Al-Sadu band | `patterns/band-sadu.svg` | thin horizontal border (24–32px) on Bahrain section breaks only |
| Serrated edge | `patterns/divider-serrated.svg` | bottom edge of the Bahrain hero (echo of the flag) |
| Jasmine / Al Razji line art | `ornaments/ornament-jasmine-tunisia.svg`, `ornaments/ornament-razji-bahrain.svg` | United hero centre seam, section breaks, loading/empty states; DrawSVG-ready ids |
| Footer skyline | `skyline/skyline-tunisia-bahrain.svg` | inline SVG, `color: var(--color-ink)`, sits on the footer top edge |
| Maps | `maps/map-tunisia.svg`, `maps/map-bahrain.svg`, `maps/map-region-tunisia-bahrain.svg` | inline SVG; pins carry `data-place` |
| Flags | `flags/flag-tunisia.svg`, `flags/flag-bahrain.svg` | small (≤ 32px) markers in tables/cards; never as backgrounds |

Pearl bullets: list markers are 8px circles with a radial gradient (`#fff` → `--color-gold`) on light, simple
gold dots on dark. Hairline rules: 1px `--color-line`, with an optional 6px gold diamond at the start.

## Imagery
- Photography is the hero. Use large crops, consistent warm grade: `filter: saturate(1.05) contrast(1.02)`.
  On dark sections add a bottom gradient `linear-gradient(to top, rgb(11 27 43/.85), transparent 55%)` for text.
- Aspect ratios: hero full-bleed (min-height 92svh), cards 4:5 (portrait) or 3:2 (landscape), dishes 1:1,
  timeline thumbs 4:3. Always `object-fit: cover` + `focal` from the generated manifest.
- Captions in `--color-muted` small, optional credit link to `/credits` (not on every image).
- Figures (historical people) are **typographic cards**, no portraits: name in display serif, years in Reem Kufi/
  tabular numerals, a thin accent rule, short text.

## Components (visual specs)
- **Button** (`primary` = ink bg / pearl text; on dark: pearl bg / ink text; `accent` = `--accent` bg / white;
  `ghost` = transparent + 1px current border; `link` = underline offset 4px). Height 48px (44 min on mobile),
  radius full, icon gap 0.5rem, arrow icon flips in RTL (`rtl:-scale-x-100`). Hover: background shifts 6%, icon nudges 3px in reading direction.
- **SectionHeader**: optional index number (`02`) in Reem Kufi/Fraunces tabular, eyebrow, h2, intro. Start-aligned.
- **Destination card**: arch-topped image (4:5), title h4 in display, 2-line clamp text, UNESCO badge, "Show on the map"
  link. Expanded state (dialog or accordion) shows full text + tip in an inset with a gold rule.
- **InfoCard** (wear, crafts, nature, festive items): image optional; when no image, use a sand panel with the
  khatam texture and a small line ornament. Title + text. Hover lifts 4px, image scales 1.04.
- **FactList** (quick facts): two-column definition list, labels in eyebrow style, values in body-lg; first fact
  (capital) highlighted large. Mobile: single column with hairlines.
- **WordTable** (useful words): rows with meaning (start), transliteration (display italic), Arabic script
  (`lang="ar" dir="rtl"`, Amiri 1.4rem). In Arabic UI the Arabic script column leads.
- **Timeline**: vertical line (accent) with dots; date in tabular display; alternating sides on ≥ lg, single side on
  mobile; optional thumbnail. Long timelines show 8 then "Show more".
- **FigureGrid**: 3/2/1 columns of typographic cards (see Imagery).
- **ComparisonTable** (United): real `<table>` with caption, sticky first column on mobile, flags in header,
  zebra rows in sand-50, Tunisia column tinted `tn-blue` 6%, Bahrain column `bh-teal` 6%.
- **ConnectingGrid** (United): 12 cards; each shows theme, a split image (Tunisia | Bahrain halves divided by a
  thin gold seam), and two short lines labelled by flags. Hover/focus slides the seam.
- **UnescoBadge**: small pill, 1px gold-deep border, laurel-free text "UNESCO World Heritage", year optional.
- **SectionNav** (country pages): sticky pill bar under the header, horizontally scrollable, scrollspy highlights
  current section, keyboard accessible.
- **Dialog/Sheet**: native `<dialog>` based, focus trap, `Esc` closes, scroll lock, return focus, slide-up on mobile.
- **Form fields**: label above, hint below, 48px controls, 1px line border → 2px `--color-ieee` focus, error text in crimson with icon, character counter.
- **Focus ring**: `outline: 2px solid var(--color-ieee); outline-offset: 3px` (on ink: `--color-ieee-40`).

## Page signatures (what makes each page memorable)
- **United**: split hero — two full-height photographs (jasmine | Al Razji) meeting at a thin gold seam with the
  line-art flowers drawing themselves on the seam; headline set across both halves; hovering a half widens it (desktop).
- **Tunisia**: blue-door arches and terracotta warmth; destinations as a pinned horizontal "walk" with the map pin
  lighting up; Bizerte spotlight as a dark tn-blue-deep panel with night photo.
- **Bahrain**: pearl-and-teal elegance; serrated hero edge; pearl heritage block styled like a museum label
  wall (dark teal, gold numerals); Sadu band separators; Arabic coffee moment with dallah photo.
- **Common Grounds**: cinematic dark full-screen deck, split screens that merge, big kicker numbers.
- **Vault**: warm community feel — masonry wall on sand, polaroid-like cards with a thin white frame and a tilted
  flag stamp, friendly empty state with the jasmine/razji ornament.
- **Footer**: newsletter panel, link columns, socials, IEEE block, the skyline rising from the footer edge.
