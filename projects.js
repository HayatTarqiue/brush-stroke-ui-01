/* =====================================================================
   BRUSH STROKE — Portfolio data + card template (single source of truth)
   ---------------------------------------------------------------------
   Used twice:
     1. in the browser by script.js (lightbox, hover preview, filters), and
     2. by `node scripts/build-portfolio.js`, which writes the same cards as
        static HTML into index.html so search engines can read the project
        names without running JavaScript (SEO-9).
   To add a project: edit `projects` below, then run the build script.
   ===================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BSAProjects = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  const PBASE = 'assets/portfolio/';
  const projects = [
    { slug:'hoot', t:'HOOT', loc:'Bengaluru', cat:'turnkey', imgs:['hoot/01.jpg','hoot/02.jpg','hoot/03.jpg','hoot/04.jpg','hoot/05.jpg','hoot/06.jpg','hoot/07.jpg','hoot/08.jpg','hoot/09.jpg','hoot/10.jpg'] },
    { slug:'mocha', t:'Mocha', loc:'Pune', cat:'turnkey', imgs:['mocha/01.jpg','mocha/02.jpg','mocha/03.jpg','mocha/04.jpg','mocha/05.jpg','mocha/06.jpg','mocha/07.jpg','mocha/08.jpg','mocha/09.jpg','mocha/10.jpg'] },
    { slug:'banger', t:'BANGER', loc:'Indore', cat:'turnkey', imgs:['banger/01.jpg','banger/02.jpg','banger/03.jpg','banger/04.jpg','banger/05.jpg','banger/06.jpg','banger/07.jpg','banger/08.jpg'] },
    { slug:'atha', t:'ATHA', loc:'Indore', cat:'turnkey', imgs:['atha/01.jpg','atha/02.jpg','atha/03.jpg','atha/04.jpg','atha/05.jpg','atha/06.jpg','atha/07.jpg','atha/08.jpg','atha/09.jpg'] },
    { slug:'raeeth', t:'Raeeth', loc:'Goa', cat:'interior', imgs:['raeeth/01.jpg','raeeth/02.jpg','raeeth/03.jpg','raeeth/04.jpg','raeeth/05.jpg'] },
    { slug:'bella-buono', t:'Bella Buono', loc:'Indore', cat:'interior', imgs:['bella-buono/01.jpg','bella-buono/02.jpg','bella-buono/03.jpg','bella-buono/04.jpg','bella-buono/05.jpg','bella-buono/06.jpg','bella-buono/07.jpg'] },
    { slug:'iriss', t:'Iriss', loc:'Goa', cat:'interior', imgs:['iriss/01.jpg','iriss/02.jpg','iriss/03.jpg','iriss/04.jpg','iriss/05.jpg','iriss/06.jpg','iriss/07.jpg'] },
    { slug:'coffee-concept', t:'Coffee Concept', loc:'Indore', cat:'interior', imgs:['coffee-concept/01.jpg','coffee-concept/02.jpg','coffee-concept/03.jpg','coffee-concept/04.jpg','coffee-concept/05.jpg','coffee-concept/06.jpg','coffee-concept/07.jpg'] },
    { slug:'kave', t:'Kave', loc:'Indore', cat:'turnkey', imgs:['kave/01.jpg','kave/02.jpg','kave/03.jpg','kave/04.jpg','kave/05.jpg','kave/06.jpg','kave/07.jpg'] },
    { slug:'teresita', t:'Teresita', loc:'Bengaluru', cat:'interior', imgs:['teresita/01.jpg','teresita/02.jpg','teresita/03.jpg','teresita/04.jpg','teresita/05.jpg','teresita/06.jpg','teresita/07.jpg'] },
    { slug:'jamnaram', t:'Jamnaram', loc:'Vadodara', cat:'interior', imgs:['jamnaram/01.jpg','jamnaram/02.jpg','jamnaram/03.jpg','jamnaram/04.jpg','jamnaram/05.jpg'] },
  ];
  const catLabel = { interior: 'Interior', civil: 'Civil', turnkey: 'Turnkey' };
  // Card-sized derivative (800px, ~99KB) next to each original (1600px, ~400KB).
  // Cards and gallery filmstrip use these; the lightbox stage keeps the full image.
  const thumbOf = rel => rel.replace(/\/([^/]+)$/, '/thumb/$1');
  // B-1: 24px blurred previews of each project's cover photo (~600 bytes each,
  // inlined so they cost no extra request). Shown instantly while the real image
  // lazy-loads, so a card never appears as an empty dark box.
  const LQIP = {
    'hoot':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAQABgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFA//EACYQAAIBAwMBCQAAAAAAAAAAAAECAwAEERITMUEFFSEiJDJhccH/xAAVAQEBAAAAAAAAAAAAAAAAAAADAv/EABsRAAICAwEAAAAAAAAAAAAAAAECAAMEITET/9oADAMBAAIRAxEAPwBWO/uGuN9ZBHuY1poIBPBPFUIu1t2QRSR7bHwDL7TU0NbLFrAGrPnjYZGPg/hraK5s1GXAWNQSMKQ3HTpRV2PXoDUt0R+9j73HqAsjpoxktq4NFSLe9s+8WkbdEJUFVJGoH7xiimbKsB0IXkg7P//Z',
    'mocha':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAASABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAMEAgX/xAAkEAEAAgICAAUFAAAAAAAAAAABAhEAAxIhBBNBUWEjMTKR4f/EABYBAQEBAAAAAAAAAAAAAAAAAAMBAv/EABgRAQEAAwAAAAAAAAAAAAAAAAEAESFB/9oADAMBAAIRAxEAPwDwnTBVlFivV1XePI3CwJnEbvONcNkvpkJRlFVq7/WW8PyE5qe/XZXxg7JlOleEHyPzZr68gv8AmMjGGycSWmIlPQFGMuGyI2TxkkN7bZtafbLeFnJ0CyVQtv74xmiraOUo6NhFTr0fnGMY0N//2Q==',
    'banger':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAQABgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFAv/EACQQAAIBBAECBwAAAAAAAAAAAAECAwAEESETEkEUIjFRgaHh/8QAFQEBAQAAAAAAAAAAAAAAAAAABAP/xAAaEQACAwEBAAAAAAAAAAAAAAAAAQISIQMR/9oADAMBAAIRAxEAPwCbbXDTWoRUYNsMc6961bmTwuvK5Oxn0pW3sSOjmOEKk9SE6we9LvcFk41ySWICs5+AaFVN4Ns0tKxjVoQkaAHZZ89v2ipMVwImCzc0Ixton390UjnDCE5P0//Z',
    'atha':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAeABgDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABQAEA//EACgQAAIBAwMCBQUAAAAAAAAAAAECAwAEERIhMQVhBhMUQVEVIoGRof/EABYBAQEBAAAAAAAAAAAAAAAAAAMEBf/EABsRAAMBAAMBAAAAAAAAAAAAAAABAhEDEzES/9oADAMBAAIRAxEAPwAv1IB+84zXRJ1YBUyzccVm9Dc3RLQxkr85xSHTrB7W7826LGM7BVUkg57VB8rNNF2/DvH0+4kUa4iCRn8VVoXxBBF1EWzKBG7FNeokqRxntVSXxVDygY5la1BSXVzEwiiYhVGwGP3W+2kuJEKvMEBIKuRyfdcd6NuHEcgJGQdqSs4yeZHO2wPAPsaIVpMGvAkl7NMVLOznDA4/lVMfS477VNGRAAdLoq7ZHxVS9tP0LrlH/9k=',
    'raeeth':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAQABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAMBAgT/xAAjEAACAgECBgMAAAAAAAAAAAABAgMRAAQhEhMxQWHBBSLh/8QAFgEBAQEAAAAAAAAAAAAAAAAABAEC/8QAGhEAAwEAAwAAAAAAAAAAAAAAAAECETFBof/aAAwDAQACEQMRAD8AX8qBFDp4ggYype3Xt+5hPJ0msUXcTEcLud6IB95WfWTSa5TvUf1QnqBfbGvKkkp5qRSlgFB8hRVDz6weYKmtFzAlTISiFWPEt79QMMlrVAjk8wki3UA7CwO+Gbimu/SUtfB//9k=',
    'bella-buono':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAOABgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAIFAf/EACUQAAIBAwIFBQAAAAAAAAAAAAECAwARIQQxBRITMkEiUWGBkf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACEf/aAAwDAQACEQMRAD8AczcjFOnhAADzd2L+fz7rC+mOoDWbqW5u7GPHtUfR8Un1JZJljcqAQxXO/wAVRgjijcQsrSOyhzIzZtfa1qn1mcadM8csrSMjhFNwp3AJ2NFM8Ym10sakhQ9s+fTeiidmHjFxv//Z',
    'iriss':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAgABgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAYDBAUB/8QAJBAAAgICAgEDBQAAAAAAAAAAAQIDEQASBCExBUGBIjJRYXH/xAAXAQADAQAAAAAAAAAAAAAAAAAAAQID/8QAGhEBAQACAwAAAAAAAAAAAAAAAQACESExUf/aAAwDAQACEQMRAD8AV4YnikDoDQHdgY1ccyNwYNXBDRriunEmERlCsNTXg40enzhvS4C6D3G/8J6yWKHkqq7nUk3YIHQ+MMg9RnAtUAJrwcMXVQLZgM7L0QFIutq8ZYi5s0MJgAQhO7Iok/jKC85VFhrdvuvOJyHdAu6AizszA3+sXNoJaMMxAeWViigqdtd/B769/bDMk8l1ikiv6ZKv4wxg+0ZO2//Z',
    'coffee-concept':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAATABgDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAQDBf/EACQQAAICAQQBBAMAAAAAAAAAAAEDAhEABBIhMQUiUWGRBjLB/8QAFwEAAwEAAAAAAAAAAAAAAAAAAQIDAP/EABoRAAIDAQEAAAAAAAAAAAAAAAABEiFBETH/2gAMAwEAAhEDEQA/AMdZNLJrCZmG7i6sA2P5mi9LCCXySWT3SiZCyABZ69ush8jqGobKMgXr7gQOD9ZQh81fj83lUZTMtpBuwCO/g5KNUU6tKYKWlJMCBM/sK+cZzW63UKWsLgCuq9Xqlx7ihWMSDHkjp7ypSVLEYr5jt2iqvrJNUuEUsERQB4AxjHxAfrNYxE/HobIXMkgn7xjGAyP/2Q==',
    'kave':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAeABgDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFAwb/xAAmEAACAgEDAgYDAAAAAAAAAAABAgMRAAQSQSExBRMUInGBMmFy/8QAFwEAAwEAAAAAAAAAAAAAAAAAAgMEAP/EABoRAAMBAQEBAAAAAAAAAAAAAAABAhESIUH/2gAMAwEAAhEDEQA/AOchiV0u3J4CoTeaCEXQinJ/gDG/DjEkCuzEyIC+xnoOL7Y56WMIYlUMG2kTODZHQ+0cfORunpcolEOfTzRNflOBVjdXbDKvi8McYkjao3SjGVupF4Hz+8MZFavRdQvhPh1KwpGWhEhFgWSPv6xhddJAwrqeCeMmFvaozXeWVb7jNwgnem8+rJVxKnmM4oFj+HXjDFJmthhhJYB1p//Z',
    'teresita':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAYABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQFAQP/xAAhEAABBQABBAMAAAAAAAAAAAABAAIDBBESITFBcRMVI//EABgBAQADAQAAAAAAAAAAAAAAAAEAAgME/8QAGREAAwEBAQAAAAAAAAAAAAAAAAECIUFR/9oADAMBAAIRAxEAPwCWk2S0Rwki5eW8ToVIhsGR8fOMuaASOJ6BYlSS2HbVdJ8h0n8wRi79leZMXOe8SEYeTRpA8dljS3DrmqNC46am06+InTrQMxFmWLhnhc2WV5c49RgxEpT0Hdk1S7LHIDEDoGaT2C947BksF87g5wJHr0iKUEek8rW8jiIiEXaP/9k=',
    'jamnaram':'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAYABgDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAMEBQIG/8QAKBAAAgEDAwMCBwAAAAAAAAAAAQIDAAQRBRIxISJBEzIUYXGBocHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAgQBA//EABoRAAMBAQEBAAAAAAAAAAAAAAABAhExQQP/2gAMAwEAAhEDEQA/APMLEJZWLOq7SD3KSDjxWzHqku8NLbWsynOXBZCPtk1as/h0G1FkiyeoVyAaluNNtJfbM8e4Doh56+flUjy++FXHpi6hdeuqyysvlVUHAX6D+zSrr6Ikedj2+7HJk/eKU54Gm/EVjc2MnMs5ccEJjFQQIymQxmTGO08filKykp4dvnTcvTtnulGTcKylm93Q80pSkhzCa3T/2Q=='
  };

  /* Project stories (case-study pages at /projects/<slug>/, built by
     scripts/build-portfolio.js). A project gets a page only when it has an entry here.
     Copy is written from the project photographs — no invented figures (area, dates,
     budgets) or client quotes. `published: false` keeps the page out of Google
     (noindex) until the studio has reviewed the text; flip it to true once approved. */
  const STORIES = {
    hoot: {
      published: false,
      name: 'Hoot Cafe & Brewery',
      intro: 'An open-air café and brewery in Bengaluru, built around water, greenery and honest materials: a weekend escape in the middle of the city.',
      facts: [
        ['Location', 'Bengaluru'],
        ['Venue', 'Café & brewery'],
        ['Scope', 'Turnkey: design & execution'],
        ['Spaces', 'Courtyard, bars & rooftop'],
      ],
      statement: 'A place people stay in for the whole evening.',
      overview: [
        'The plan opens into a large courtyard wrapped by upper levels, with indoor bars and a rooftop terrace, so every part of the visit feels like a different room.',
        'The language is relaxed and tropical-industrial. Turquoise water channels run between the tables, palms and planters soften the hard edges, and the raw materials (timber, bamboo, grey blockwork and steel) are left honest. Playful set pieces, from a vintage wooden boat to a giant gramophone horn, give guests something new to discover on every visit.',
      ],
      spaces: [
        { img: 3, title: 'The courtyard', text: 'The heart of Hoot: decked seating islands between long turquoise water channels, shaded by palms. After dark, low warm lighting reflects off the water and the courtyard becomes the main event.' },
        { img: 1, title: 'The central bar', text: 'A long open bar anchors the courtyard: a timber-slatted counter, bold red bar stools and bamboo screens behind it, visible from almost every seat.' },
        { img: 6, title: 'Upper levels', text: 'The mezzanine looks down on the courtyard through geometric steel railings, while white line-art murals keep the large grey walls light and playful.' },
        { img: 4, title: 'The indoor lounge', text: 'Inside, the mood turns intimate: a sculptural tree strung with lights against a dark green wall, a classic red phone box and stone-textured floors.' },
        { img: 8, title: 'The speakeasy bar', text: 'A darker, moodier bar with a faceted metal feature wall, a reclaimed-timber counter and wire-frame pendant lights over industrial stools.' },
        { img: 9, title: 'The rooftop', text: 'An open terrace above the neighbourhood with patterned cement tiles, bistro seating and warm lighting for long evenings.' },
      ],
      materials: ['Reclaimed timber', 'Turquoise water channels', 'Bamboo screens', 'Tropical planting',
        'Grey blockwork', 'Geometric steel railings', 'Line-art murals', 'Patterned cement tiles', 'Warm filament lighting'],
    },
    mocha: {
      published: false,
      name: 'Mocha',
      intro: 'A café and lounge in Pune where layered stone walls, glowing copper lights and indoor gardens turn a dining room into a landscape.',
      facts: [['Location', 'Pune'], ['Venue', 'Café & lounge'], ['Scope', 'Turnkey: design & execution'], ['Spaces', 'Atrium, gardens & window lounge']],
      statement: 'A canyon of light, stone and green.',
      overview: [
        'The walls rise in sculpted, stepped layers like eroded rock, wrapping the room in warm texture and turning every corner into a nook.',
        'Clusters of copper-toned pendants hang beneath a glass skylight, while indoor gardens, boulders and oversized clay urns bring the outdoors inside. After dark the room glows like a lantern above the city.',
      ],
      spaces: [
        { img: 8, title: 'The atrium', text: 'Copper chandeliers gather beneath the skylight over a planted island, with deep booths and timber tables arranged around the greenery.' },
        { img: 1, title: 'Gardens and boulders', text: 'Lush planting, rocks and sculpted ledges blur the line between dining room and garden, softening the scale of the space.' },
        { img: 4, title: 'The urn lounge', text: 'Giant clay urns become sculpture above a relaxed lounge of round tables and low armchairs, framed by the layered walls.' },
        { img: 7, title: 'The window lounge', text: 'Along the glass, woven pendants and warm table lamps light intimate seating with a view out over the city at night.' },
      ],
      materials: ['Layered stone-effect walls', 'Copper-toned pendants', 'Glass skylight', 'Indoor planting', 'Natural boulders',
        'Clay urns', 'Timber furniture', 'Woven lighting', 'Warm table lamps'],
    },
    banger: {
      published: false,
      name: 'BANGER',
      intro: 'A bar in Indore built like a great hall: vaulted brick ceilings, gothic arches and a wall of glowing lamps, all bathed in amber light.',
      facts: [['Location', 'Indore'], ['Venue', 'Bar & lounge'], ['Scope', 'Turnkey: design & execution'], ['Spaces', 'Great hall, bar & entrance']],
      statement: 'Old-world drama, turned up loud.',
      overview: [
        'BANGER borrows the grandeur of a medieval hall: brick barrel vaults overhead, pointed arches along the walls and chandeliers hanging down the length of the room.',
        'Every surface carries detail, from carved panels and knight figures to a stained-glass bar and a wall alive with sconces, so the room feels rich and immersive from every seat.',
      ],
      spaces: [
        { img: 4, title: 'The great hall', text: 'Rows of timber tables and leather seating run beneath the brick vaults, framed by gothic arches and a glowing back wall.' },
        { img: 3, title: 'The lamp wall', text: 'A carved wall layered with sconces, ornaments and sculpted figures gives the hall its warm, theatrical glow.' },
        { img: 6, title: 'The bar', text: 'A backlit bar sits within stained-glass arches and patterned panels, with a reflective counter that doubles the light.' },
        { img: 7, title: 'The entrance', text: 'A carved timber doorway and illuminated signage set the tone before guests even step inside.' },
      ],
      materials: ['Exposed brick vaults', 'Gothic arches', 'Crystal chandeliers', 'Stained glass', 'Carved timber',
        'Leather seating', 'Brass sconces', 'Sculpted figures', 'Amber lighting'],
    },
    atha: {
      published: false,
      cover: 6,
      name: 'ATHA',
      intro: 'A restaurant in Indore with hand-sculpted cave walls, soft cream tones and an open-air garden under a thatched roof.',
      facts: [['Location', 'Indore'], ['Venue', 'Restaurant'], ['Scope', 'Turnkey: design & execution'], ['Spaces', 'Dining rooms & garden']],
      statement: 'Shaped by hand, softened by light.',
      overview: [
        'Inside, the walls are sculpted into organic, cave-like forms, with recessed niches and arches that make the dining room feel carved rather than built.',
        'Warm timber chairs, orange cushions and a striking blue sculpture punctuate the calm cream palette, while the garden outside trades plaster for thatch, sand and planting.',
      ],
      spaces: [
        { img: 4, title: 'The sculpted dining room', text: 'Long tables sit beneath flowing plaster walls with built-in niches displaying pottery and objects.' },
        { img: 3, title: 'The arch', text: 'A softly rounded opening frames a raised dining area, its curves lit from within.' },
        { img: 0, title: 'The signature wall', text: 'The ATHA name glows against sculpted relief, beside a bold blue face sculpture that has become the room\'s calling card.' },
        { img: 7, title: 'The garden', text: 'Outdoors, a thatched canopy, sand floor, rattan seating and palms create a relaxed, open-air setting.' },
      ],
      materials: ['Hand-sculpted plaster', 'Cream lime finishes', 'Solid timber chairs', 'Woven rattan', 'Thatch canopy',
        'Sand flooring', 'Bamboo', 'Ceramic accents', 'Warm cove lighting'],
    },
    raeeth: {
      published: false,
      cover: 0,
      name: 'Raeeth',
      intro: 'A Goan lounge of bamboo, whitewashed arches and spiral lamps, built for warm evenings that run late.',
      facts: [['Location', 'Goa'], ['Venue', 'Lounge & bar'], ['Scope', 'Interior design'], ['Spaces', 'Entrance, verandah & bar']],
      statement: 'Coastal craft, lit for the night.',
      overview: [
        'Raeeth draws on coastal craft: bundled bamboo columns, a slatted cane roof and whitewashed walls with arched timber doors.',
        'Spiral pendant lamps and heart-shaped sconces wash everything in a warm glow, and the energy builds towards a bar and DJ console wrapped in bold patterned panels.',
      ],
      spaces: [
        { img: 1, title: 'The entrance', text: 'A rounded, whitewashed arch with illuminated lettering opens onto a passage lined with planting.' },
        { img: 3, title: 'The verandah', text: 'Bundled bamboo columns and spiral lamps line a long verandah of low lounge seating beneath a cane ceiling.' },
        { img: 2, title: 'The courtyard wall', text: 'Arched doors, heart sconces and a woven centrepiece turn a plain wall into a warm backdrop.' },
        { img: 4, title: 'The DJ bar', text: 'A patterned, backlit bar front and red feature walls give the music its own stage.' },
      ],
      materials: ['Bundled bamboo columns', 'Cane slat ceiling', 'Whitewashed plaster', 'Arched timber doors', 'Spiral pendant lamps',
        'Heart-shaped sconces', 'Patterned screens', 'Tropical planting', 'Terracotta planters'],
    },
    'bella-buono': {
      published: false,
      cover: 1,
      name: 'Bella Buono',
      intro: 'A bright, light-filled café and restaurant in Indore, dressed in flowers, rattan and soft florals.',
      facts: [['Location', 'Indore'], ['Venue', 'Café & restaurant'], ['Scope', 'Interior design'], ['Spaces', 'Garden room & dining rooms']],
      statement: 'Sunlight, flowers and a little playfulness.',
      overview: [
        'Bella Buono is designed to feel like a garden in daylight: white walls and big windows, rattan pendants, hanging flowers and palms in every corner.',
        'Floral upholstery, macramé curtains and playful touches such as neon script and pink flamingo sculptures keep the mood light and easy to photograph.',
      ],
      spaces: [
        { img: 4, title: 'The garden room', text: 'Hanging flower installations and rattan lanterns float above patterned chairs and crazy-paved floors.' },
        { img: 2, title: 'The feature wall', text: 'Neon script, circular mirrors and window boxes overflowing with flowers frame a long velvet banquette.' },
        { img: 5, title: 'The window room', text: 'Macramé curtains filter daylight across floral chairs and a row of tables set along the glass.' },
        { img: 6, title: 'The counter', text: 'A whitewashed stone counter and soft neutral seating keep the service area light and welcoming.' },
      ],
      materials: ['Rattan pendants', 'Hanging floral installations', 'Floral upholstery', 'Macramé curtains', 'Velvet banquettes',
        'Crazy-paved stone', 'Whitewashed stone', 'Neon script', 'Palms & planters'],
    },
    iriss: {
      published: false,
      cover: 5,
      name: 'Iriss',
      intro: 'A dramatic Goan bar and lounge under a painted sky, with crystal chandeliers, crimson walls and deep leather seating.',
      facts: [['Location', 'Goa'], ['Venue', 'Bar & lounge'], ['Scope', 'Interior design'], ['Spaces', 'Hall, bar & lounges']],
      statement: 'Faded grandeur, beneath a painted sky.',
      overview: [
        'Iriss plays with the romance of an old palace: a vaulted ceiling painted like a sky in relief, crystal chandeliers and walls finished in distressed reds and gilded frames.',
        'Below, Chesterfield sofas, rugs and candlelit tables create intimate pockets, while a tall backlit bar anchors the room.',
      ],
      spaces: [
        { img: 0, title: 'The painted hall', text: 'Chandeliers hang beneath a sculpted, sky-painted vault above walls of crimson and aged plaster.' },
        { img: 2, title: 'The bar', text: 'Backlit shelving rises behind a long bar, framed by arches and portrait niches.' },
        { img: 3, title: 'The red lounge', text: 'Deep sofas and lamplit tables sit against walls hung with framed portraits in a warm red glow.' },
        { img: 4, title: 'The fireside corner', text: 'A brick hearth, candles and leather seating make the most intimate corner of the room.' },
      ],
      materials: ['Painted relief ceiling', 'Crystal chandeliers', 'Distressed plaster', 'Gilded frames', 'Chesterfield leather',
        'Brick hearth', 'Patterned rugs', 'Backlit shelving', 'Candlelight'],
    },
    'coffee-concept': {
      published: false,
      cover: 5,
      name: 'The Coffee Concept',
      intro: 'An Indore café full of character: neon quotes, portrait art, patterned tiles and a ceiling lined with marquee lights.',
      facts: [['Location', 'Indore'], ['Venue', 'Café'], ['Scope', 'Interior design'], ['Spaces', 'Café floor, counter & lounge']],
      statement: 'A café with something to say.',
      overview: [
        'The Coffee Concept is built around personality: neon slogans about coffee, large portrait artwork and a carved feature wall give the room a voice.',
        'Underneath, the palette is rich and grounded, with timber panelling, patterned tiles, burgundy velvet seating and warm niche lighting.',
      ],
      spaces: [
        { img: 0, title: 'The café floor', text: 'Timber tables and floral chairs gather around a sculpted white column, beneath neon and framed art.' },
        { img: 1, title: 'The counter', text: 'A patterned-tile counter front and backlit signage put the coffee bar centre stage.' },
        { img: 3, title: 'The marquee lounge', text: 'Burgundy velvet sofas sit beneath a ceiling lined with marquee bulbs and an arched window.' },
        { img: 4, title: 'The niche wall', text: 'A row of lit niches with decorative lamps adds warmth and rhythm above the seating.' },
      ],
      materials: ['Patterned tiles', 'Timber panelling', 'Burgundy velvet', 'Neon signage', 'Marquee bulbs',
        'Carved feature wall', 'Floral upholstery', 'Decorative lamps', 'Portrait artwork'],
    },
    kave: {
      published: false,
      cover: 3,
      name: 'Kave',
      intro: 'A bar and rooftop in Indore that moves from carved, cave-like rooms to an open terrace with views over the city.',
      facts: [['Location', 'Indore'], ['Venue', 'Bar & rooftop lounge'], ['Scope', 'Turnkey: design & execution'], ['Spaces', 'Cave rooms, bar & rooftop']],
      statement: 'From the cave to the sky.',
      overview: [
        'Kave plays two moods against each other. Inside, textured rock walls, carved relief panels and mosaic lamps create a warm, cave-like world.',
        'Up on the terrace, glass railings open the space to the skyline, with green velvet seating, sculptural flamingos and giraffes, and a sunburst feature that catches the evening light.',
      ],
      spaces: [
        { img: 0, title: 'The mosaic entrance', text: 'A cluster of mosaic glass lamps glows above the Kave name on a richly patterned wall.' },
        { img: 5, title: 'The bar', text: 'A rock-textured wall with illuminated arched shelving frames the bar and its warm-lit counter.' },
        { img: 6, title: 'The cave room', text: 'Rough rock walls, carved openings and torch-style sconces make an intimate, hidden corner.' },
        { img: 2, title: 'The rooftop', text: 'Green velvet booths, planting and flamingo sculptures sit behind glass railings overlooking the city.' },
      ],
      materials: ['Rock-textured walls', 'Mosaic glass lamps', 'Carved relief panels', 'Green velvet', 'Brass detailing',
        'Glass railings', 'Patterned flooring', 'Sculptural figures', 'Backlit shelving'],
    },
    teresita: {
      published: false,
      cover: 1,
      name: 'Teresita',
      intro: 'A Bengaluru restaurant and bar wrapped in bougainvillea, birdcage lights and painted portraits.',
      facts: [['Location', 'Bengaluru'], ['Venue', 'Restaurant & bar'], ['Scope', 'Interior design'], ['Spaces', 'Bar, verandah & dining rooms']],
      statement: 'A garden that never stops flowering.',
      overview: [
        'Teresita is soaked in colour: bougainvillea spills across the ceilings, birdcage chandeliers glow among the flowers, and painted portraits look down over the tables.',
        'Warm timber, rattan and velvet keep it inviting, from the bar room to the open verandah and the quieter dining corners.',
      ],
      spaces: [
        { img: 3, title: 'The balcony', text: 'A statement red peacock chair and potted bougainvillea look out over the street.' },
        { img: 0, title: 'The bar room', text: 'A backlit bar with murals and rattan seating anchors the main room beneath chandeliers.' },
        { img: 4, title: 'The birdcage corner', text: 'An oversized birdcage light, flowers and a painted wall make one of the most photographed spots.' },
        { img: 5, title: 'The mural booths', text: 'Green leather booths sit beneath hand-painted portraits and warm wall lights.' },
      ],
      materials: ['Bougainvillea installations', 'Birdcage chandeliers', 'Hand-painted murals', 'Rattan chairs', 'Pink velvet',
        'Green leather', 'Timber floors', 'Brass wall lights', 'Statement peacock chair'],
    },
    jamnaram: {
      published: false,
      cover: 3,
      name: 'Jamnaram',
      intro: 'A warm, contemporary restaurant in Vadodara with lattice screens, a flowering timber ceiling and bold red seating.',
      facts: [['Location', 'Vadodara'], ['Venue', 'Restaurant'], ['Scope', 'Interior design'], ['Spaces', 'Main dining & booths']],
      statement: 'Warm craft, bright accents.',
      overview: [
        'Jamnaram layers natural textures: timber lattice ceilings threaded with flowers, cane and rattan screens, and herringbone timber floors.',
        'Bold red rope chairs and leather booths add energy, while circular planters ringed with light bring greenery overhead.',
      ],
      spaces: [
        { img: 0, title: 'The main dining room', text: 'Red rope chairs and stone-topped tables sit beneath a flowering lattice ceiling and ring-lit planters.' },
        { img: 1, title: 'The panelled wall', text: 'Woven and carved timber panels, softly uplit, form a calm backdrop for the long banquette.' },
        { img: 4, title: 'The lattice booths', text: 'A sculpted cane screen runs the length of a row of leather booths, filtering light and views.' },
      ],
      materials: ['Timber lattice ceiling', 'Flowering installations', 'Cane screens', 'Red rope chairs', 'Stone-topped tables',
        'Leather booths', 'Herringbone timber floor', 'Ring-lit planters', 'Woven wall panels'],
    },
  };
  projects.forEach(p => { if (STORIES[p.slug]) p.story = STORIES[p.slug]; });
  const pageOf = p => (p.story ? `projects/${p.slug}/` : null);

  // SEO-14: descriptive alt text — what the photo is, who made it, where.
  const altOf = p => `${p.t} — interior design by Brush Stroke, ${p.loc}`;

  /** HTML for one portfolio card. Shared by the browser and the build script. */
  function cardHTML(p, i) {
    const page = pageOf(p);
    const n = p.imgs.length;
    const photosIcon = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M4 7h14v11H4zM7 4h14v11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
    // Two clearly separate actions:
    //  • projects WITH a story page: the whole card is a link to the story, and the
    //    photo-count chip is its own "View photos" button that opens the gallery;
    //  • projects WITHOUT one: the whole card opens the gallery, as before.
    const opener = page
      ? `<a class="port__open" href="${page}" aria-label="${p.t}, ${p.loc} — read the project story"></a>`
      : `<button class="port__open" type="button" aria-label="${p.t}, ${p.loc} — view ${n} photos"></button>`;
    const count = page
      ? `<button class="port__count port__count--btn" type="button" data-gallery aria-label="View ${n} photos of ${p.t}">${photosIcon}<span>${n} photos</span></button>`
      : `<span class="port__count">${photosIcon}${n}</span>`;
    return `
      <article class="port${page ? ' port--story' : ''} reveal" data-reveal="port" data-delay="${(i % 3) * 110}" data-cat="${p.cat}" data-idx="${i}">
      ${opener}
      <div class="port__art is-loading"${LQIP[p.slug] ? ` style="--lqip:url('${LQIP[p.slug]}')"` : ''}>
        <img class="port__img is-on" src="${PBASE}${thumbOf(p.imgs[0])}" alt="${altOf(p)}" loading="lazy" decoding="async" />
        <img class="port__img" alt="" aria-hidden="true" decoding="async" />
      </div>
      <div class="port__ticks" aria-hidden="true">${p.imgs.map(() => '<i></i>').join('')}</div>
      <div class="port__shade"></div>
      <span class="port__tag">${catLabel[p.cat]}</span>
      ${count}
      <div class="port__view"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="port__body">
        <span class="port__cat">${page ? 'Project Story' : 'View Gallery'}</span>
        <h3 class="port__title">${p.t}</h3>
        <p class="port__loc">
          <svg viewBox="0 0 24 24" width="14" height="14" style="flex:0 0 14px"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
          ${p.loc}
        </p>
        ${page ? `<span class="port__story" aria-hidden="true">Read the story<svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
      </div>
      </article>`;
  }


  return { PBASE, projects, catLabel, thumbOf, LQIP, altOf, cardHTML, pageOf };
});
