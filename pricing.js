/* =====================================================================
   BRUSH STROKE ARTSPACE — Authoritative pricing model
   ---------------------------------------------------------------------
   QA-003: single source of truth for every price shown anywhere on the
   site. The pricing cards, the cost calculator and the explanatory copy
   must all derive from this file so they cannot drift apart.

   APPROVED BUSINESS RULE (as implemented in the shipped site):
     * Rates are per square foot and vary by SERVICE x BUDGET TIER.
     * The headline range printed on a pricing card is the full span
       across all three tiers: basic.low  ->  premium.high.
       e.g. Interior Design = 1500 (basic low) .. 4000 (premium high).
     * The calculator shows one TIER at a time, so its result is a
       narrower band inside the headline range. This is why 1,000 sq ft
       on the Standard tier reads Rs 20,00,000 - Rs 30,00,000 rather
       than the headline Rs 15,00,000 - Rs 40,00,000.
     * Property type presets a typical area; it does not alter the rate.

   NOTE FOR OWNER: the rate values themselves are carried over from the
   existing site and are PENDING OWNER CONFIRMATION (see QA-003 in the
   QA report). Changing a number here updates every surface at once.
   ===================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BSAPricing = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const AREA_MIN = 200;
  const AREA_MAX = 10000;
  const AREA_DEFAULT = 1000;

  /* per-sq-ft [low, high] by service x budget tier */
  const RATES = {
    interior: { basic: [1500, 2200], standard: [2000, 3000], premium: [3000, 4000] },
    turnkey:  { basic: [2500, 3400], standard: [3200, 4200], premium: [4000, 5000] },
    civil:    { basic: [1800, 2300], standard: [2200, 2900], premium: [2800, 3600] },
  };

  const SERVICES = Object.keys(RATES);
  const TIERS = ['basic', 'standard', 'premium'];

  const SERVICE_LABEL = {
    interior: 'Interior Design',
    turnkey: 'Turnkey Project',
    civil: 'Civil Construction',
  };
  const BUDGET_LABEL = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

  /* Typical area presets by property type. These only seed the slider. */
  const PROPERTY_AREA = {
    '1 BHK': 650, '2 BHK': 1000, '3 BHK': 1500, 'Villa': 3000, 'Office': 2000,
  };

  function isService(s) { return Object.prototype.hasOwnProperty.call(RATES, s); }
  function isTier(t) { return TIERS.indexOf(t) !== -1; }

  /**
   * Coerce any input (string, null, NaN, Infinity, decimal, negative) into a
   * valid whole number of square feet inside [AREA_MIN, AREA_MAX].
   * QA-004: this is what stops the estimate ever becoming NaN/negative/Infinity.
   */
  function clampArea(value) {
    const n = typeof value === 'number' ? value : parseFloat(value);
    // NaN first: covers '', '   ', 'abc', null, undefined, {}, []
    if (typeof n !== 'number' || Number.isNaN(n)) return AREA_DEFAULT;
    if (n <= AREA_MIN) return AREA_MIN;             // 0, negatives, -Infinity, below min
    if (n >= AREA_MAX) return AREA_MAX;             // above max, +Infinity
    return Math.round(n);                           // decimals -> whole sq ft
  }

  /** The headline range a pricing card prints for a service: span across all tiers. */
  function publishedRange(service) {
    if (!isService(service)) return null;
    const tiers = RATES[service];
    return [
      Math.min.apply(null, TIERS.map(t => tiers[t][0])),
      Math.max.apply(null, TIERS.map(t => tiers[t][1])),
    ];
  }

  /**
   * Produce an estimate. Always returns finite, ordered, non-negative integers.
   * Unknown service/tier falls back to a safe default rather than producing NaN.
   */
  function estimate(input) {
    const opts = input || {};
    const service = isService(opts.service) ? opts.service : 'interior';
    const budget = isTier(opts.budget) ? opts.budget : 'standard';
    const area = clampArea(opts.area);

    let [rateLow, rateHigh] = RATES[service][budget];
    if (rateLow > rateHigh) { const t = rateLow; rateLow = rateHigh; rateHigh = t; }

    return {
      area, service, budget,
      rate: [rateLow, rateHigh],
      low: Math.round(rateLow * area),
      high: Math.round(rateHigh * area),
    };
  }

  /** Indian-format currency, e.g. 2000000 -> "Rs 20,00,000" (rendered with the symbol). */
  function formatINR(n) {
    const safe = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    return '₹' + safe.toLocaleString('en-IN');
  }

  return {
    AREA_MIN, AREA_MAX, AREA_DEFAULT,
    RATES, SERVICES, TIERS, SERVICE_LABEL, BUDGET_LABEL, PROPERTY_AREA,
    clampArea, estimate, publishedRange, formatINR,
  };
});
