const test = require('node:test');
const assert = require('node:assert/strict');
const { parseJSON } = require('../lib/checks.js');

// Validates: Requirements 2.5
test('parseJSON reads a plain JSON object', () => {
  assert.deepEqual(parseJSON('{"a":1}'), { a: 1 });
});

test('parseJSON finds JSON inside surrounding text and code fences', () => {
  assert.deepEqual(parseJSON('Here you go:\n```json\n{"a":"b"}\n```'), { a: 'b' });
});

test('parseJSON ignores text after the object', () => {
  assert.deepEqual(parseJSON('{"a":1} hope that helps!'), { a: 1 });
});

test('parseJSON keeps nested braces', () => {
  assert.deepEqual(parseJSON('x {"a":{"b":{"c":2}},"d":[{"e":3}]} y'), { a: { b: { c: 2 } }, d: [{ e: 3 }] });
});

test('parseJSON returns null when there is no JSON', () => {
  assert.equal(parseJSON('no json here'), null);
  assert.equal(parseJSON('} reversed {'), null);
});

test('parseJSON returns null for broken JSON', () => {
  assert.equal(parseJSON('{"a":1,'), null);
  assert.equal(parseJSON('{"a": }'), null);
  assert.equal(parseJSON('{not json}'), null);
});

test('parseJSON returns null for empty or null input', () => {
  assert.equal(parseJSON(''), null);
  assert.equal(parseJSON(null), null);
  assert.equal(parseJSON(undefined), null);
});
