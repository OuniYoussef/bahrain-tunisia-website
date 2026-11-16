#!/usr/bin/env node
/**
 * Content integrity check (run: `npm run content:check`, also part of `npm run verify`).
 * 1. Every locale (en, fr, ar) has the same namespaces and the exact same JSON shape as English.
 * 2. Interpolation placeholders like {count} match the English string (plural forms zero/one/two may drop them).
 * 3. Every image id used in src/content/media.json exists in src/content/images.manifest.json, and every manifest id is used.
 * 4. Every manifest id has alt text in every locale (locales/<lang>/images.json).
 * 5. Every map pin referenced as `place` exists in public/images/svg/maps/map-<country>.svg.
 * Exits with code 1 on any problem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'fr', 'ar'];
const dir = (l) => path.join(ROOT, 'src/content/locales', l);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const problems = [];
const PH = /\{[a-zA-Z]+\}/g;
const PLURAL = ['zero', 'one', 'two', 'few', 'many', 'other'];

function compare(en, other, where, lang, pluralKey = false) {
  if (typeof en !== typeof other || Array.isArray(en) !== Array.isArray(other)) {
    problems.push(`${lang}: type mismatch at ${where}`);
    return;
  }
  if (Array.isArray(en)) {
    if (en.length !== other.length) problems.push(`${lang}: array length ${other.length} != ${en.length} at ${where}`);
    en.forEach((v, i) => other[i] !== undefined && compare(v, other[i], `${where}[${i}]`, lang));
    return;
  }
  if (en && typeof en === 'object') {
    const isPlural = PLURAL.every((k) => k in en);
    for (const k of Object.keys(en)) {
      if (!(k in other)) problems.push(`${lang}: missing key ${where}.${k}`);
      else compare(en[k], other[k], `${where}.${k}`, lang, isPlural && k !== 'other');
    }
    for (const k of Object.keys(other)) if (!(k in en)) problems.push(`${lang}: extra key ${where}.${k}`);
    return;
  }
  if (typeof en === 'string') {
    if (en.trim() && !other.trim()) problems.push(`${lang}: empty string at ${where}`);
    const a = (en.match(PH) || []).sort().join();
    const b = (other.match(PH) || []).sort().join();
    if (!pluralKey && a !== b) problems.push(`${lang}: placeholders ${b || '-'} != ${a || '-'} at ${where}`);
  }
}

const namespaces = fs.readdirSync(dir('en')).filter((f) => f.endsWith('.json'));
for (const lang of LOCALES.slice(1)) {
  for (const ns of namespaces) {
    const p = path.join(dir(lang), ns);
    if (!fs.existsSync(p)) {
      problems.push(`${lang}: missing ${ns}`);
      continue;
    }
    compare(read(path.join(dir('en'), ns)), read(p), ns.replace('.json', ''), lang);
  }
}

const manifest = read(path.join(ROOT, 'src/content/images.manifest.json')).images;
const media = read(path.join(ROOT, 'src/content/media.json'));
const used = new Set();
const places = { tunisia: new Set(), bahrain: new Set() };
(function walk(node, ns) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, ns));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$comment') continue;
      if (k === 'place' && places[ns]) places[ns].add(v);
      walk(v, ns ?? k);
    }
    return;
  }
  if (typeof node === 'string' && /^(tn|bh|un|cg)-/.test(node)) used.add(node);
})(media);
for (const id of used) if (!manifest[id]) problems.push(`media.json uses unknown image id "${id}"`);
for (const id of Object.keys(manifest)) if (!used.has(id)) problems.push(`manifest id "${id}" is never used in media.json`);
for (const lang of LOCALES) {
  const alts = read(path.join(dir(lang), 'images.json'));
  for (const id of Object.keys(manifest)) if (!alts[id]?.trim()) problems.push(`${lang}: missing alt text for ${id}`);
}
for (const [country, set] of Object.entries(places)) {
  const svg = fs.readFileSync(path.join(ROOT, `public/images/svg/maps/map-${country}.svg`), 'utf8');
  const pins = new Set([...svg.matchAll(/data-place="([^"]+)"/g)].map((m) => m[1]));
  for (const p of set) if (!pins.has(p)) problems.push(`${country}: place "${p}" has no pin in map-${country}.svg`);
}

if (problems.length) {
  console.error(`✗ Content check failed (${problems.length} problems):\n  ` + problems.slice(0, 80).join('\n  '));
  process.exit(1);
}
console.log(`✓ Content OK: ${namespaces.length} namespaces × ${LOCALES.length} locales, ${used.size} images, ${places.tunisia.size + places.bahrain.size} map pins.`);
