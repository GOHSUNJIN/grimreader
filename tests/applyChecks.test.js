// Property-based tests for applyChecks (requirements 5.2 to 5.6)
const test = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { applyChecks } = require('../lib/checks.js');

const TODAY = new Date(2025, 5, 15); // local midnight, 15 June 2025
const DAY = 864e5;
const LEVELS = ['low', 'medium', 'high'];
const SERIOUS = ['court', 'summons', 'lawyer', 'bankruptcy', 'police', 'debt collection'];

const pad = (n, w = 2) => String(n).padStart(w, '0');
const iso = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const isoFromOffset = n => iso(new Date(2025, 5, 15 + n));

// anything at all
const anything = fc.anything();
const maybe = arb => fc.option(arb, { nil: undefined });

const level = fc.oneof(
  { weight: 6, arbitrary: fc.constantFrom(...LEVELS) },
  { weight: 2, arbitrary: fc.constantFrom('HIGH', 'urgent', '', null, 3, undefined) },
  { weight: 1, arbitrary: anything }
);

const realDate = fc.integer({ min: -400, max: 400 }).map(isoFromOffset);
const invalidDate = fc.oneof(
  fc.constantFrom('2025-13-01', '2025-00-10', '2025-02-30', '2025-04-31', '2025-06-00', '2025-06-32',
    '2025-6-5', '15/06/2025', 'tomorrow', 'N/A', '2025-06-15T10:00:00', ' 2025-06-15', '20250615', 'abcd-ef-gh'),
  fc.string({ maxLength: 20 }).filter(s => s !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(s)),
  fc.tuple(fc.integer({ min: 0, max: 9999 }), fc.integer({ min: 13, max: 99 }), fc.integer({ min: 0, max: 99 }))
    .map(([y, m, d]) => `${pad(y, 4)}-${pad(m)}-${pad(d)}`)
);
const deadline = fc.oneof(
  { weight: 4, arbitrary: realDate },
  { weight: 4, arbitrary: invalidDate },
  { weight: 1, arbitrary: fc.constantFrom(null, undefined, '') },
  { weight: 1, arbitrary: fc.oneof(fc.integer(), fc.boolean(), fc.object()) }
);

const text = fc.oneof(fc.string({ maxLength: 40 }), fc.constantFrom(null, undefined, 42, {}, []));
const serious = fc.tuple(
  fc.constantFrom(...SERIOUS),
  fc.boolean(),
  fc.string({ maxLength: 10 }),
  fc.string({ maxLength: 10 })
).map(([w, upper, a, b]) => `${a} ${upper ? w.toUpperCase() : w} ${b}`);

const actions = fc.oneof(
  fc.array(fc.oneof(fc.string(), fc.constant(''), fc.constant(null)), { maxLength: 12 }),
  fc.constantFrom(undefined, null, 'do this', 5, {})
);

const verdict = fc.record({
  letter_type: maybe(text),
  summary: maybe(text),
  sender: maybe(text),
  urgency: maybe(level),
  scam_risk: maybe(level),
  deadline: maybe(deadline),
  amount: maybe(fc.oneof(fc.string({ maxLength: 12 }), fc.constantFrom(null, 0, 12.5))),
  needs_human: maybe(fc.oneof(fc.boolean(), fc.constantFrom(null, 0, 1, 'yes'))),
  actions: maybe(actions),
  documents: maybe(actions),
  scam_reasons: maybe(actions),
  jargon: maybe(fc.oneof(
    fc.array(fc.oneof(fc.record({ term: fc.string(), meaning: fc.string() }), fc.constant(null), anything), { maxLength: 8 }),
    anything))
}, { requiredKeys: [] });

const run = (d, today = TODAY) => applyChecks(d, today);
const hasBad = r => r.checks.some(c => c[0] === 'bad');

test('5.2 urgency and scam_risk are always low|medium|high, actions is an array of at most 6 strings', () => {
  fc.assert(fc.property(verdict, d => {
    const r = run(d);
    assert.ok(LEVELS.includes(r.urgency), `urgency ${r.urgency}`);
    assert.ok(LEVELS.includes(r.scam_risk), `scam_risk ${r.scam_risk}`);
    assert.ok(Array.isArray(r.actions));
    assert.ok(r.actions.length <= 6);
    assert.ok(r.actions.every(a => typeof a === 'string'), 'every action is a string');
  }), { numRuns: 500 });
});

test('5.3 a deadline that is not a real YYYY-MM-DD date becomes null with a "bad" check', () => {
  fc.assert(fc.property(verdict, invalidDate, (d, bad) => {
    const r = run({ ...d, deadline: bad });
    assert.strictEqual(r.deadline, null);
    assert.ok(hasBad(r), 'expected a bad check');
  }), { numRuns: 500 });
});

test('5.4 a real deadline 0 to 7 days away gives urgency high unless scam_risk is high', () => {
  fc.assert(fc.property(verdict, fc.integer({ min: 0, max: 7 }), (d, n) => {
    const r = run({ ...d, deadline: isoFromOffset(n) });
    assert.strictEqual(r.days, n);
    if (r.scam_risk !== 'high') assert.strictEqual(r.urgency, 'high');
  }), { numRuns: 500 });
});

test('5.5 scam_risk high means urgency is not high', () => {
  fc.assert(fc.property(verdict, d => {
    const r = run({ ...d, scam_risk: 'high' });
    assert.notStrictEqual(r.urgency, 'high');
  }), { numRuns: 500 });
});

test('5.6 serious words in type, summary or sender make needs_human true', () => {
  const field = fc.constantFrom('letter_type', 'summary', 'sender');
  fc.assert(fc.property(verdict, field, serious, (d, f, s) => {
    const r = run({ ...d, [f]: s });
    assert.strictEqual(r.needs_human, true);
  }), { numRuns: 500 });
});
