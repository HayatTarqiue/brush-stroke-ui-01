/* QA-003 / QA-004 — automated tests for the pricing model.
   Run: node --test tests/
   No dependencies; uses the built-in node:test runner. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../pricing.js');

/* ---------- QA-003: published cards must agree with the calculator ---------- */

test('QA-003 published headline range = span across all budget tiers', () => {
  assert.deepEqual(P.publishedRange('interior'), [1500, 4000]);
  assert.deepEqual(P.publishedRange('turnkey'), [2500, 5000]);
  assert.deepEqual(P.publishedRange('civil'), [1800, 3600]);
});

test('QA-003 every tier rate sits inside its published headline range', () => {
  for (const service of P.SERVICES) {
    const [pubLow, pubHigh] = P.publishedRange(service);
    for (const tier of P.TIERS) {
      const [lo, hi] = P.RATES[service][tier];
      assert.ok(lo >= pubLow, `${service}.${tier} low ${lo} < published ${pubLow}`);
      assert.ok(hi <= pubHigh, `${service}.${tier} high ${hi} > published ${pubHigh}`);
    }
  }
});

test('QA-003 the 1,000 sq ft Standard interior case the QA report queried', () => {
  const e = P.estimate({ area: 1000, service: 'interior', budget: 'standard' });
  assert.equal(e.low, 2000000);   // Rs 20,00,000
  assert.equal(e.high, 3000000);  // Rs 30,00,000
  // and it must sit inside the headline 15L-40L span
  const [pLow, pHigh] = P.publishedRange('interior');
  assert.ok(e.low >= pLow * 1000 && e.high <= pHigh * 1000);
});

test('QA-003 tiers are monotonically ordered within a service', () => {
  for (const service of P.SERVICES) {
    const b = P.RATES[service].basic, s = P.RATES[service].standard, p = P.RATES[service].premium;
    assert.ok(b[0] <= s[0] && s[0] <= p[0], `${service} tier lows not ascending`);
    assert.ok(b[1] <= s[1] && s[1] <= p[1], `${service} tier highs not ascending`);
  }
});

/* ---------- QA-004: boundary and hostile input ---------- */

test('QA-004 area exactly at the minimum (200)', () => {
  assert.equal(P.clampArea(200), 200);
  assert.equal(P.estimate({ area: 200, service: 'interior', budget: 'basic' }).low, 300000);
});

test('QA-004 area exactly at the maximum (10000)', () => {
  assert.equal(P.clampArea(10000), 10000);
  assert.equal(P.estimate({ area: 10000, service: 'turnkey', budget: 'premium' }).high, 50000000);
});

test('QA-004 area below minimum / zero / negative clamps to minimum', () => {
  for (const v of [199, 1, 0, -1, -99999]) {
    assert.equal(P.clampArea(v), P.AREA_MIN, `clampArea(${v})`);
  }
});

test('QA-004 area above maximum / Infinity clamps to maximum', () => {
  for (const v of [10001, 1e9, Infinity]) {
    assert.equal(P.clampArea(v), P.AREA_MAX, `clampArea(${v})`);
  }
});

test('QA-004 empty / non-numeric / null / NaN never yield NaN', () => {
  for (const v of ['', '   ', 'abc', null, undefined, NaN, {}, []]) {
    const a = P.clampArea(v);
    assert.ok(Number.isFinite(a), `clampArea(${JSON.stringify(v)}) => ${a}`);
    assert.ok(a >= P.AREA_MIN && a <= P.AREA_MAX);
  }
});

test('QA-004 decimal areas are rounded to whole sq ft', () => {
  assert.equal(P.clampArea(1000.4), 1000);
  assert.equal(P.clampArea(1000.6), 1001);
});

test('QA-004 estimate is always finite, ordered and non-negative for ALL combinations', () => {
  const areas = ['', 'abc', null, NaN, -5, 0, 199, 200, 201, 999.7, 1000, 9999, 10000, 10001, Infinity];
  for (const service of P.SERVICES) {
    for (const budget of P.TIERS) {
      for (const area of areas) {
        const e = P.estimate({ area, service, budget });
        const label = `${service}/${budget}/${JSON.stringify(area)}`;
        assert.ok(Number.isFinite(e.low) && Number.isFinite(e.high), `${label} not finite`);
        assert.ok(e.low >= 0 && e.high >= 0, `${label} negative`);
        assert.ok(e.low <= e.high, `${label} low > high`);
        assert.ok(Number.isInteger(e.low) && Number.isInteger(e.high), `${label} not integer`);
      }
    }
  }
});

test('QA-004 unknown service or tier degrades safely instead of producing NaN', () => {
  const e = P.estimate({ area: 1000, service: 'spaceship', budget: 'platinum' });
  assert.ok(Number.isFinite(e.low) && Number.isFinite(e.high));
  assert.equal(e.service, 'interior');
  assert.equal(e.budget, 'standard');
});

test('QA-004 estimate scales linearly with area', () => {
  const a = P.estimate({ area: 1000, service: 'civil', budget: 'basic' });
  const b = P.estimate({ area: 2000, service: 'civil', budget: 'basic' });
  assert.equal(b.low, a.low * 2);
  assert.equal(b.high, a.high * 2);
});

/* ---------- currency formatting ---------- */

test('QA-004 INR formatting uses the Indian grouping system', () => {
  assert.equal(P.formatINR(2000000), '₹20,00,000');
  assert.equal(P.formatINR(300000), '₹3,00,000');
  assert.equal(P.formatINR(0), '₹0');
});

test('QA-004 INR formatting never emits NaN/negative', () => {
  assert.equal(P.formatINR(NaN), '₹0');
  assert.equal(P.formatINR(-500), '₹0');
  assert.equal(P.formatINR(Infinity), '₹0');
});

/* ---------- property presets ---------- */

test('QA-003 every property preset seeds an area inside the allowed range', () => {
  for (const [name, area] of Object.entries(P.PROPERTY_AREA)) {
    assert.equal(P.clampArea(area), area, `${name} preset ${area} was clamped`);
  }
});

/* ---------- venue types: Restaurant / Café / Club ---------- */

test('Venue rates are exactly what the owner set', () => {
  assert.deepEqual(P.VENUE_RATES['Restaurant'], [1500, 3500]);
  assert.deepEqual(P.VENUE_RATES['Café'], [1200, 3000]);
  assert.deepEqual(P.VENUE_RATES['Club'], [2500, 9000]);
});

test('Venue tiers cover the whole venue range with no gaps, in order', () => {
  for (const v of Object.keys(P.VENUE_RATES)) {
    const [lo, hi] = P.VENUE_RATES[v];
    const t = P.venueTiers(v);
    assert.equal(t.basic[0], lo, `${v} basic starts at the floor`);
    assert.equal(t.premium[1], hi, `${v} premium ends at the ceiling`);
    assert.equal(t.basic[1], t.standard[0], `${v} basic/standard contiguous`);
    assert.equal(t.standard[1], t.premium[0], `${v} standard/premium contiguous`);
    for (const k of P.TIERS) assert.ok(t[k][0] < t[k][1], `${v}.${k} ordered`);
  }
});

test('Venue estimate uses the venue rate, whatever service is selected', () => {
  for (const service of P.SERVICES) {
    const e = P.estimate({ property: 'Café', area: 1000, service, budget: 'standard' });
    assert.equal(e.venue, true);
    assert.equal(e.low, 1800000);
    assert.equal(e.high, 2400000);
  }
  const lo = P.estimate({ property: 'Restaurant', area: 1000, budget: 'basic' });
  const hi = P.estimate({ property: 'Club', area: 1000, budget: 'premium' });
  assert.equal(lo.low, 1500000);
  assert.equal(hi.high, 9000000);
});

test('Residential / office types keep the service x tier rate', () => {
  const e = P.estimate({ property: '2 BHK', area: 1000, service: 'interior', budget: 'standard' });
  assert.equal(e.venue, false);
  assert.equal(e.low, 2000000);
  assert.equal(e.high, 3000000);
});
