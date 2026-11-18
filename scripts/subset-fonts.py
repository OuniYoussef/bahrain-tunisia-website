"""Optional asset regeneration: pip install fonttools brotli.

Keep the design's SOFT=40/WONK=1 and 400–700 weights; retain optical sizing.
Source: installed @fontsource-variable/fraunces, under SIL Open Font License.
Generated assets are committed; Python is not required for application builds.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent
source = root / 'node_modules/@fontsource-variable/fraunces'
output = root / 'src/assets/fonts'
output.mkdir(parents=True, exist_ok=True)
for script in ['latin', 'latin-ext']:
    for style in ['normal', 'italic']:
        name = f'fraunces-{script}-full-{style}.woff2'
        font = TTFont(source / 'files' / name)
        instantiateVariableFont(font, {'SOFT': 40, 'WONK': 1, 'wght': (400, 700)}, inplace=True)
        font.save(output / name)
        print(name, (output / name).stat().st_size)
(output / 'OFL.txt').write_bytes((source / 'LICENSE').read_bytes())
