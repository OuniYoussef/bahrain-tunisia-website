# Bahrain × Tunisia

IEEE student exchange website. P0 supplies the tooling and a temporary setup screen; the design system
starts in P1. Read [the progress log](docs/PROGRESS.md) before making changes.

The project engine is Node.js >= 22.12. The latest test tools require Node 22.22.2+, 24.15.0+, or 26+;
bootstrap is verified with Node 24.21.0.

```sh
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` when configuring optional services. The bootstrap works without keys.

```sh
npm run verify
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

`verify` runs offline after dependencies are installed. The separate `npm run audit` requires network access.
Playwright serves the existing production build with `npm run preview`; rebuild after source changes.

Photo setup and credits are described in [the assets guide](docs/ASSETS.md). Export `IMAGES_CONTACT` as an
email address or public project URL before running `npm run images:fetch`. The script reads the process
environment; it does not load `.env.local`. Run its offline check with:

```sh
node scripts/images/fetch-images.mjs --selftest
```
