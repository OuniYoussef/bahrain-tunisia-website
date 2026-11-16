# Content model

All copy is ready in `src/content/locales/{en,fr,ar}/`. Each file is a namespace. Media lives in `media.json`.
Open only the slice you need, e.g. `jq '.destinations.featured[0]' src/content/locales/en/tunisia.json`.

## Namespaces
| File | Top-level keys | Used by |
|---|---|---|
| `common.json` | `site` (name, identifier lines, purpose, titles), `a11y`, `nav`, `ui`, `alerts`, `footer` (newsletter, columns, social, organisedBy, ieeeLinks, projectLine, skyline.landmarks), `contact`, `credits`, `notFound`, `error` | shell, every page |
| `united.json` | `meta`, `hero`, `journey`, `glance` (columns, rows[]), `connecting` (items[] with theme/tunisia/bahrain), `teasers` (commonGrounds, vault) | United page |
| `tunisia.json` | `meta`, `sectionNav`, `welcome` (facts[], words[], didYouKnow[]), `destinations` (featured[6], more[6], spotlight{facts[], places[]}), `wear` (groups[], regional[]), `nature` (groups[]), `cities` (items[]), `history` (timeline[], figures[]), `festive` (groups[], weddings), `food` (groups[], products), `monuments` (items[]) | Tunisia page |
| `bahrain.json` | same frame as Tunisia **plus** `welcome.nicknames[]`, `welcome.nameOrigin`, `wear.jewelleryNote`, `history.pearl` {intro, groups[]}, `food.coffee` {title,text,etiquette}; **minus** `destinations.spotlight`, `wear.regional` | Bahrain page |
| `matrix.json` | `meta`, `intro`, `ui`, `slides[24]` {id, kicker, title, text, captions{tunisia,bahrain}, pairsTitle?, pairs[]?, sharedWords[]?, cta?} | Common Grounds |
| `vault.json` | `meta`, `hero`, `categories`, `wall` (filters, states, plural counts), `report`, `form` (fields, errors, success), `guidelines`, `privacy`, `unavailable` | Vault |
| `admin.json` | `login`, `mfa`, `nav`, `queue`, `reports`, `alerts`, `newsletter`, `status` | Admin |
| `images.json` | `{ [imageId]: altText }` for all 183 photos | ResponsiveImage |

### Item shapes (text side)
- Facts: `{ id, label, value }` · Words: `{ id, meaning, say, script }` (`say` Latin transliteration, `script` Arabic)
- Cards: `{ id, title, text, tip? }` · Timeline: `{ id, date, text }` · Figures: `{ id, name, years, text }`
- Festive items: `{ id, date, title, text }` (`date` may be "", `text` may be "") · Groups: `{ id, title, note?, items[] }`
- Glance rows: `{ id, label, tunisia, bahrain }` · Connecting items: `{ id, theme, tunisia, bahrain }`
- Plural objects: `{ zero, one, two, few, many, other }` → `plural(obj, count, locale)`.
Empty strings mean "render nothing" for that field (e.g. a holiday without description).

## media.json (language-neutral)
Same path structure, keyed by item id. Fields:
| Field | Meaning |
|---|---|
| `image` | photo id (see `images.manifest.json`) |
| `images` | ordered photo ids (heroes, connecting split images, products) |
| `imageSecondary` | second photo for compositions (Vault hero) |
| `productImages` | strip of product photos (food sections) |
| `nightlifeImage` | Manama nightlife photo (Bahrain cities) |
| `place` | map pin id in `map-tunisia.svg` / `map-bahrain.svg` (`data-place`) |
| `unesco` | `true` if the place is a UNESCO World Heritage site → UnescoBadge |
| `badgeYear` | year to show in the UNESCO badge (Bahrain monuments) |
| `media` | Matrix slide media: `{ layout: 'split'|'split-merge'|'words'|'cta', tunisia: id[], bahrain: id[], shared: id[] }` |
| `video` | Matrix slide video slot: `null` or `{ src, poster?, captions?, provider?: 'file'|'youtube'|'vimeo', id? }` |

Examples:
```jsonc
// media.json → tunisia.destinations.featured["el-djem"]
{ "image": "tn-dest-el-djem", "place": "el-djem", "unesco": true }
// media.json → united.connecting.items["sea"]
{ "images": ["tn-hist-punic-ports", "bh-hist-pearl-divers"] }   // [tunisia, bahrain]
// media.json → matrix.slides["sea"]
{ "media": { "layout": "split", "tunisia": ["tn-hist-punic-ports","tn-nature-kerkennah","tn-dest-bizerte"], "bahrain": ["bh-hist-pearl-divers","bh-hero-dhow-sea","bh-dest-pearling-path"], "shared": [] }, "video": null }
```

## Adding or changing content
1. Edit `en/<ns>.json` (keep ids kebab-case and stable — they are anchors, media keys and analytics-free deep links).
2. Mirror the change in `fr` and `ar`. 3. If it needs a photo: add an entry to `images.manifest.json`
(id + sources), alt text in the 3 `images.json`, reference the id in `media.json`, run
`npm run images:fetch -- --only=<id>`. 4. `npm run content:check`.

## Things that are deliberately NOT in content
IEEE meta-nav labels and the IEEE copyright/descriptor lines (fixed English, in `components/layout`),
language names in the switcher, social URLs and contact email (env vars), sample Vault posts (seed data).
