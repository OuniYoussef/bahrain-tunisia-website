# Community Experience Vault (static edition)

Route: `/:lang/vault`. Interface copy uses the vault namespace; editorial records live in
`src/content/vault/stories.json`. There is no API, submission form or browser-local pending data.

- Preserve the textured hero, polaroid photos and four category cards. The hero share link and category
  cards lead to localized Contact; external share CTAs lead here. Labels remain unchanged.
- The wall keeps country/type filters in the URL, total count, CSS masonry, scoped Flip animation,
  sample badges and empty states. The typed static module returns 12 items per page; the sentinel
  and Load more button reveal subsequent pages. Filtering resets the visible page count.
- Cards show the cover, excerpt, author, flags, category and fixed date. Story text uses React text
  nodes and dir=auto. There are no reaction counts or controls.
- `?story=<id>` opens the existing dialog with title, author, country/category, place/year, date,
  full body and photo carousel. Keyboard arrows, Escape, focus restoration and URL closing remain.
  Missing ids use the existing error copy. The dialog has no report or reaction action.
- Community guidelines appear below the wall. Existing editorial-review wording applies to the team
  reviewing emailed stories before adding them to JSON.
- Photo ids resolve through ResponsiveImage and localized images.json alt text. Build preparation
  regenerates the Vault image catalog from hero media and every story's image_ids array.

To publish, review rights and consent, add a record and its images, run content:check and verify,
then commit and redeploy. Stories are public assets; do not include private contact information.
EN/FR/AR layouts, reduced motion, keyboard paths and the existing visual design remain required.
