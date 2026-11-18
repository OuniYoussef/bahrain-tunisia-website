"""Release route/locale/viewport audit; use an installed Playwright Chromium executable."""
import argparse
import json
import io
from PIL import Image
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', required=True)
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--width', type=int, choices=[360, 768, 1280, 1920])
parser.add_argument('--route', help='One route to recheck, using united for the landing page')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
out = root / 'test-results' / 'screens'
out.mkdir(parents=True, exist_ok=True)
slides = json.loads((root / 'src/content/locales/en/matrix.json').read_text(encoding='utf-8'))['slides']
routes = ['', 'tunisia', 'bahrain', 'common-grounds', 'vault', 'contact', 'credits',
          'missing'] + ['common-grounds/' + s['id'] for s in slides]
if args.route:
    routes = ['' if args.route == 'united' else args.route]
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=args.browser)
    for width in ([args.width] if args.width else [360, 768, 1280, 1920]):
        for locale in ['en', 'fr', 'ar']:
            context = browser.new_context(viewport={'width': width, 'height': 1080 if width >= 1280 else 900}, reduced_motion='reduce')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type in ['error', 'warning'] else None)
            for route in routes:
                errors.clear()
                name = f"{locale}-{route.replace('/', '-') or 'united'}-{width}"
                try:
                    page.goto(f'{args.base}/{locale}/{route}', wait_until='networkidle')
                    page.locator('h1').wait_for(state='visible')
                    page.evaluate('document.fonts.ready')
                    # Walk the complete document to mount deferred sections and load lazy photos.
                    page.evaluate('window.scrollTo(0,0)')
                    y = 0
                    while y < page.evaluate('document.documentElement.scrollHeight'):
                        page.evaluate('(y) => window.scrollTo(0,y)', y)
                        page.wait_for_timeout(80)
                        y += 800
                    page.wait_for_load_state('networkidle')
                    page.evaluate('''async () => {
                        const images = [...document.images];
                        images.forEach(image => image.loading = 'eager');
                        await Promise.all(images.map(image => image.decode().catch(() => {})));
                    }''')
                    page.evaluate('window.scrollTo(0,0)')
                    page.wait_for_timeout(150)
                    page.add_script_tag(path=str(root / 'node_modules/axe-core/axe.min.js'))
                    violations = page.evaluate('async () => (await axe.run()).violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n=>n.target)}))')
                    layout = page.evaluate('''() => ({overflow:document.documentElement.scrollWidth > innerWidth,
                        lang:document.documentElement.lang, dir:document.documentElement.dir,
                        h1:document.querySelectorAll('h1').length})''')
                    assert layout == {'overflow': False, 'lang': locale, 'dir': 'rtl' if locale == 'ar' else 'ltr', 'h1': 1}, layout
                    height = page.evaluate('document.documentElement.scrollHeight')
                    if height <= 8000:
                        page.screenshot(path=str(out / f'{name}.png'), full_page=True)
                    else:
                        # Avoid Chromium's repeated compositor tiles on extremely long pages.
                        stitched = Image.new('RGB', (width, height))
                        step = page.viewport_size['height']
                        for top in range(0, height, step):
                            page.evaluate('(y) => window.scrollTo(0, y)', top)
                            page.wait_for_timeout(100)
                            if top == step:
                                page.add_style_tag(content='.site-header, .country-section-nav { visibility: hidden !important; }')
                            actual = page.evaluate('window.scrollY')
                            tile = Image.open(io.BytesIO(page.screenshot()))
                            offset = int(top - actual)
                            stitched.paste(tile.crop((0, offset, width, offset + min(step, height - top))), (0, top))
                        stitched.save(out / f'{name}.png')
                    results.append({'name': name, 'axe': violations, 'console': list(errors)})
                    print(name, 'PASS' if not violations and not errors else 'FAIL', flush=True)
                except Exception as e:
                    results.append({'name': name, 'error': str(e)})
                    print(name, str(e), flush=True)
                (out / f'results-{args.width or "all"}{"-" + args.route.replace("/", "-") if args.route else ""}.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
            context.close()
    browser.close()
assert all(not r.get('error') and not r.get('axe') and not r.get('console') for r in results), 'See results JSON'
