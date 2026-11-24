const test = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const { redact } = require('../lib/checks.js');

const digits = n => fc.stringMatching(new RegExp(`^\\d{${n}}$`));
const nric = fc.tuple(fc.constantFrom('S', 'T', 'F', 'G', 'M'), digits(7), fc.constantFrom('A', 'B', 'Z')).map(a => a.join(''));
const email = fc.tuple(fc.stringMatching(/^[a-z][a-z0-9._-]{0,10}$/), fc.stringMatching(/^[a-z]{1,8}$/), fc.constantFrom('com', 'sg', 'co.uk'))
  .map(([u, d, t]) => `${u}@${d}.${t}`);
const card = fc.array(digits(4), { minLength: 4, maxLength: 4 }).map(a => a.join(' '));
const account = fc.tuple(fc.constantFrom('Account no:', 'A/C', 'Ref:', 'Policy number'), digits(10)).map(([l, n]) => `${l} ${n}`);
const longRun = fc.integer({ min: 10, max: 30 }).chain(digits);
const unit = fc.tuple(digits(2), digits(4)).map(([a, b]) => `#${a}-${b}`);
const postcode = digits(6).map(p => `Singapore ${p}`);
const filler = fc.stringMatching(/^[a-zA-Z ,.]{0,12}$/);
const piece = fc.oneof(nric, email, card, account, longRun, unit, postcode, filler);
const input = fc.array(piece, { maxLength: 6 }).map(a => a.join(' '));

// Validates: Requirements 5.7
test('redact leaves no run of 10+ digits and no full email address', () => {
  fc.assert(fc.property(fc.oneof(input, fc.string()), s => {
    const out = redact(s).text;
    assert.doesNotMatch(out, /\d{10,}/);
    assert.doesNotMatch(out, /[\w.+-]+@[\w-]+\.[\w.]+/);
    assert.doesNotMatch(out, /(?:\d[ -]?){10,}/);
  }), { numRuns: 500 });
});

test('redact hides a 25 digit run', () => {
  assert.doesNotMatch(redact('1'.repeat(25)).text, /\d{10,}/);
});

// Validates: Requirements 5.7
test('words around a hidden number stay separated by whitespace', () => {
  const word = fc.stringMatching(/^[a-z]{3,8}$/);
  fc.assert(fc.property(word, fc.oneof(nric, email, card, account, longRun, unit, postcode), word, (a, hidden, b) => {
    const out = redact(`${a} ${hidden} ${b}`).text;
    assert.ok(out.startsWith(a + ' '), out);
    assert.ok(out.endsWith(' ' + b), out);
  }), { numRuns: 500 });
});

test('a spaced card style number keeps the space after it', () => {
  assert.equal(redact('Quote account 7720 4419 0083 5561 when you call').text, 'Quote account ••••5561 when you call');
});
