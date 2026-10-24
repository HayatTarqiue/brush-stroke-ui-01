#!/usr/bin/env python3
"""Phone-sized hero crops for the project pages (dev tool, not deployed).

A project page's hero fills a tall, narrow phone screen. Scaling a landscape
photo up to that height from the 800px thumbnail looks soft on 3x screens, and
the full 1600px original is a heavy download. So, like the home page hero, each
project gets a centre crop at full source resolution: same framing a phone shows,
about half the pixels of the original.

    python3 scripts/make-mobile-heroes.py        (needs Pillow: pip install pillow)

Writes assets/hero/pp-<slug>-m.jpg for every project with a story in projects.js, and
scripts/hero-lqip.json: a ~1 KB blurred preview of each hero, inlined by the build so a
project page never shows an empty hero while the photograph downloads.
Run it after adding a project or changing a project's `cover`.
"""
import json, os, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = 0.62          # widest phone aspect we design for (portrait); the crop keeps this much
BUDGET = 112 * 1024  # bytes per phone hero
MAX_H = 1100        # a phone hero is ~740 CSS px tall: 1100 px keeps it sharp without the weight

data = json.loads(subprocess.check_output(['node', '-e', '''
  const P = require(process.argv[1]);
  console.log(JSON.stringify(P.projects.filter(p => p.story).map(p => ({
    slug: p.slug, src: p.imgs[Number.isInteger(p.story.cover) && p.imgs[p.story.cover] ? p.story.cover : 0] }))));
''', os.path.join(ROOT, 'projects.js')]))

import base64, io
lqip = {}
for item in data:
    im = Image.open(os.path.join(ROOT, 'assets', 'portfolio', item['src'])).convert('RGB')
    w, h = im.size
    tiny = im.copy(); tiny.thumbnail((32, 32))
    tb = io.BytesIO(); tiny.save(tb, 'JPEG', quality=60, optimize=True)
    lqip[item['slug']] = 'data:image/jpeg;base64,' + base64.b64encode(tb.getvalue()).decode()
    cw = min(w, round(h * TARGET))
    x = (w - cw) // 2
    crop = im.crop((x, 0, x + cw, h))
    if crop.size[1] > MAX_H:
        crop = crop.resize((round(crop.size[0] * MAX_H / crop.size[1]), MAX_H), Image.LANCZOS)
    out = os.path.join(ROOT, 'assets', 'hero', f"pp-{item['slug']}-m.jpg")
    # quality is lowered only as far as needed to land near the byte budget (never below 60):
    # on a slow phone connection the hero is the LCP, and every KB of it is on the clock
    import io
    for q in range(72, 59, -2):
        buf = io.BytesIO(); crop.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        if buf.tell() <= BUDGET: break
    open(out, 'wb').write(buf.getvalue())
    print(f"{item['slug']:16} {item['src']:22} -> {crop.size[0]}x{crop.size[1]}  q{q}  {os.path.getsize(out)//1024} KB")

with open(os.path.join(ROOT, 'scripts', 'hero-lqip.json'), 'w') as f:
    json.dump(lqip, f, indent=1)
print(f"wrote scripts/hero-lqip.json ({len(lqip)} previews, ~{sum(len(v) for v in lqip.values())//len(lqip)} bytes each)")
