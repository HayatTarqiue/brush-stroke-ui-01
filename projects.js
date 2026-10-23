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

  // SEO-14: descriptive alt text — what the photo is, who made it, where.
  const altOf = p => `${p.t} — interior design by Brush Stroke, ${p.loc}`;

  /** HTML for one portfolio card. Shared by the browser and the build script. */
  function cardHTML(p, i) {
    return `
      <article class="port reveal" data-reveal="port" data-delay="${(i % 3) * 110}" data-cat="${p.cat}" data-idx="${i}"
      role="button" tabindex="0" aria-label="${p.t}, ${p.loc} — view ${p.imgs.length} photos">
      <div class="port__art is-loading"${LQIP[p.slug] ? ` style="--lqip:url('${LQIP[p.slug]}')"` : ''}>
        <img class="port__img is-on" src="${PBASE}${thumbOf(p.imgs[0])}" alt="${altOf(p)}" loading="lazy" decoding="async" />
        <img class="port__img" alt="" aria-hidden="true" decoding="async" />
      </div>
      <div class="port__ticks" aria-hidden="true">${p.imgs.map(() => '<i></i>').join('')}</div>
      <div class="port__shade"></div>
      <span class="port__tag">${catLabel[p.cat]}</span>
      <span class="port__count"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 7h14v11H4zM7 4h14v11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>${p.imgs.length}</span>
      <div class="port__view"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="port__body">
        <span class="port__cat">View Gallery</span>
        <h3 class="port__title">${p.t}</h3>
        <p class="port__loc">
          <svg viewBox="0 0 24 24" width="14" height="14" style="flex:0 0 14px"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
          ${p.loc}
        </p>
      </div>
      </article>`;
  }

  return { PBASE, projects, catLabel, thumbOf, LQIP, altOf, cardHTML };
});
