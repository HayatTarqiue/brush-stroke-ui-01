# Brush Stroke Artspace

Marketing site for **Brush Stroke Artspace** — a premium interior design, civil
construction and turnkey execution studio operating Pan India.

**Live:** https://brush-sigma.vercel.app
**Repo:** https://github.com/HayatTarqiue/brush-stroke-ui-01

---

## Stack

Deliberately **no framework and no build step**. Plain HTML, CSS and JavaScript,
served as static files.

| | |
|---|---|
| Dependencies | **0** (no `package.json`) |
| Build step | none — what you edit is what ships |
| Page weight | ~34 KB gzipped (HTML + CSS + JS) |
| Hosting | Vercel (static) |
| Tests | Node's built-in `node:test` runner |

For context: React + ReactDOM alone is ~45 KB gzipped — larger than this entire
site. There is no routing, no dynamic data and no auth here, so a framework would
add a build pipeline, a dependency tree and hydration complexity for no gain.

---

## Running locally

No install needed. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

> Open it over `http://`, not by double-clicking `index.html`. The `file://`
> protocol breaks relative asset paths and the Google Fonts request.

---

## Project layout

```
index.html              home page — all sections
projects/<slug>/        project story pages (generated — edit projects.js, then build)
styles.css              design system + all styling
project.css             project story page layout + motion
script.js               all interactions
pricing.js              authoritative pricing model (shared with tests)
projects.js             portfolio data + card template (shared with the build script)
scripts/build-portfolio.js  writes the portfolio cards + project pages, stamps CSS/JS versions
scripts/make-mobile-heroes.py  phone-sized hero crops for the project pages (needs Pillow)
tests/pricing.test.js   automated tests for the pricing logic
robots.txt · 404.html · site.webmanifest · vercel.json   SEO + hosting config
.gitignore              keeps internal reports (*.md except README) and client-preview/ out of git
.vercelignore           keeps docs, tests/, scripts/ and brand masters off the public site
assets/
  logo.png              brand master, dark text (for light backgrounds)
  logo-light.png        brand master, white text (for dark backgrounds)
  favicon-64.png        favicon
  portfolio/<slug>/     full-resolution project photos (1600px)
  portfolio/<slug>/thumb/  800px card derivatives (~99 KB each)
  hero/                 phone crops: home hero (*-m.jpg) and project heroes (pp-<slug>-m.jpg)
```

11 projects: `atha`, `banger`, `bella-buono`, `coffee-concept`, `hoot`, `iriss`,
`jamnaram`, `kave`, `mocha`, `raeeth`, `teresita`.

---

## Tests

```bash
node --test tests/pricing.test.js
```

16 tests, zero dependencies. They cover the pricing model and its boundary cases:

- published card ranges agree with the calculator (the headline range is the span
  across all budget tiers; the calculator shows one tier at a time)
- tier rates stay inside their published range and ascend correctly
- area clamping: min/max, zero, negatives, decimals, `Infinity`, `NaN`, empty,
  non-numeric
- estimates are always finite, ordered (`low <= high`) and non-negative across
  **every** service × tier × area combination
- Indian-format currency output

---

## How things work

### Pricing — single source of truth

All rates live in [`pricing.js`](pricing.js). The pricing cards, the cost
calculator and the tests read from that one file, so they cannot drift apart.

The business rule, documented at the top of that file: a pricing card shows the
**full span across all three budget tiers** (e.g. Interior Design 1,500–4,000),
while the calculator shows a **single tier**, which is why 1,000 sq ft on Standard
reads ₹20,00,000–₹30,00,000 rather than the headline ₹15,00,000–₹40,00,000.

### Motion

A small system rather than ad-hoc effects. Easing and timing are tokens in
`:root` (`--ease-cinematic`, `--ease-entrance`, `--dur-reveal`, `--dur-mask`).

- Scroll reveals use a single `IntersectionObserver`.
- First-screen content waits behind a **ready gate** so the hero performs its
  entrance *after* the preloader lifts, not hidden behind it.
- Portfolio photos reveal with a clip-path wipe; hovering a card cross-fades
  through that project's gallery, loading frames just-in-time.
- The gallery lightbox opens by growing the clicked card's photo into place
  (FLIP: transform + clip-path, Web Animations API), slides left/right between
  photos, and shrinks back into the card on close when that card is on screen.
  It opens on whichever frame the hover preview was showing.
- Everything is `transform` / `opacity` / `clip-path` only — no layout thrash.
- `prefers-reduced-motion` is fully respected.

**One non-obvious gotcha:** an element with a `clip-path` that hides it collapses
its IntersectionObserver rect to zero, so the observer never fires. The hero
headlines are clipped for their mask wipe, so they are revealed directly on ready
instead of through the observer. Don't "simplify" that back.

### Theming

The page is dark-first. The Pricing section flips to a warm porcelain surface by
**re-declaring the design tokens inside that one section**, so child components
inherit the light palette through the variables they already use.

Two things to know if you add another light section:

1. `color` is declared on `<body>`, so descendants inherit the *computed* value
   and never re-resolve `var(--fg)`. Restate `color: var(--fg)` on the section.
2. The sapphire gradient used for display text scores ~1.7:1 on a pale
   background. Light sections need the deeper ramp (`#1272AE → #0A3F5C`).

### Images

Cards and the lightbox filmstrip use the 800px `thumb/` derivatives; the lightbox
stage loads the full-resolution original. This keeps the portfolio grid at ~1.1 MB
instead of ~3.8 MB. Regenerate thumbnails after adding photos:

```bash
for d in assets/portfolio/*/; do
  mkdir -p "$d/thumb"
  for f in "$d"*.jpg; do
    [ -f "$f" ] || continue
    sips -Z 800 -s format jpeg -s formatOptions 50 "$f" --out "$d/thumb/$(basename "$f")"
  done
done
```

---

## Adding a project

1. Drop photos into `assets/portfolio/<slug>/` as `01.jpg`, `02.jpg`, …
2. Generate thumbnails (command above).
3. Add an entry to the `projects` array in [`projects.js`](projects.js):

```js
{ slug:'<slug>', t:'Name', loc:'City', cat:'interior', imgs:['<slug>/01.jpg', ...] }
```

`cat` must be `interior` or `turnkey` — those are the two filter buttons.

4. Regenerate the static cards so search engines can read them:

```bash
node scripts/build-portfolio.js
```

It rewrites only the block between the `PORTFOLIO:START` / `PORTFOLIO:END` markers in
`index.html`, and running it twice gives identical output. If you forget, the site
still works (the browser renders the cards), but Google won't see the new project
in the raw HTML.

The same command also:

- writes a case-study page to `projects/<slug>/index.html` for every project that has a
  story in `STORIES` (in `projects.js`); and
- stamps a content hash on every CSS/JS link (`script.js?v=1a2b3c4d`), so browsers can
  never keep running an old copy after a change.

**Run it after any change to `styles.css`, `project.css`, `script.js`, `projects.js`,
`pricing.js` or `theme-light.css`**, not only after adding a project.

### Project story pages

Every project with an entry in `STORIES` (in `projects.js`) gets a page at
`/projects/<slug>/`: hero, key facts, a statement and overview, "space by space"
(photo + text), materials, and a closing call to action. On the home page its card
becomes a link to that page, and the "N photos" chip opens the gallery instead.

A story entry:

```js
mocha: {
  published: false,          // false = noindex (keep out of Google until the studio approves)
  cover: 0,                  // which photo is the hero (prefer a landscape frame); default 0
  name: 'Mocha',
  intro: 'One or two sentences.',
  facts: [['Location', 'Pune'], ['Venue', 'Café & lounge'], ['Scope', '…'], ['Spaces', '…']],
  statement: 'One confident line.',
  overview: ['Paragraph.', 'Paragraph.'],
  spaces: [{ img: 8, title: 'The atrium', text: '…' }],   // img = index into the project's photos
  materials: ['…'],
},
```

Moving between the home page and a project page uses a cross-document View Transition:
a calm fade-and-rise forward and a plain crossfade on Back (`PAGE TRANSITIONS` in
`styles.css`; the "back" type is set by a tiny inline script in each page's `<head>`).
There is deliberately no shared-element "morph": it depends on the next photo having
loaded, distorts between a 4:5 card and a wide hero, and flies over other cards on Back.
Hovering (desktop) or touching (phone) a project card prerenders its page via Speculation
Rules, so the fade starts at once; `script.js` holds the entrance animation until a
prerendered page is actually shown. Each project hero also has a ~1 KB blurred preview
(`scripts/hero-lqip.json`, made by `make-mobile-heroes.py`), so it is never an empty box.

Don't reuse the `cover` photo as a space photo. The current copy was written from the
photographs only (no invented areas, dates or quotes) and needs the studio's approval
before `published` is set to `true`.

After adding or changing a story's `cover`:

```bash
python3 scripts/make-mobile-heroes.py   # phone hero crop, ~110 KB budget
node scripts/build-portfolio.js         # cards + pages + asset versions
```

---

## Accessibility

Targets WCAG 2.2 AA. Implemented: semantic headings (single `h1`), visible focus
indicators, persistent form labels with per-field errors and `aria-invalid`,
`aria-pressed` on filters (state is never colour-only), live-region announcements
for calculator updates and filter results, a focus-trapped lightbox that restores
focus on close, `inert` on the closed mobile menu, and 24×24 minimum touch targets.

Body text was measured against its composited background; all sampled text clears
4.5:1.

**Not verified:** behaviour with a real screen reader (NVDA/VoiceOver). ARIA was
checked programmatically only.

---

## Known issues / before launch

Search the source for `QA-0` to find these flagged inline.

### Blocking

- **The contact form has no backend.** It validates input and hands the enquiry to
  the user's mail client via `mailto:`, but nothing is submitted to a server. Until
  a real endpoint exists (a Vercel serverless function, or a service like Formspree)
  enquiries depend on the visitor's mail app. End-to-end delivery has **not** been
  tested.

### Needs owner input

- Footer social links are `href="#"` placeholders — supply real Instagram /
  Facebook / LinkedIn URLs or remove the icons.
- These published claims are unverified and need sign-off: "500+ Projects",
  "15+ Years", "98% Satisfaction"; the three named testimonials; the
  "Timeline Guarantee" and 45–90 day / 4–8 month commitments; the
  "1–10 years" warranty wording. Nothing here was invented — it is the original
  copy, flagged rather than changed.
- The testimonial attributed to "Villa Owner, Mumbai" has no matching Mumbai
  project in the portfolio.
- The Contact column lists a service area rather than a registered office address.

---

## Credits

Designed & developed by [Tarique Hayat](https://tariqhayat.com).
