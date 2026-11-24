const test = require('node:test');
const assert = require('node:assert/strict');
const { buildShare } = require('../lib/checks.js');

// Product rule: redact is only for sharing. The verdict screen shows the full text.
const d = {
  letter_type: 'Overdue bill', sender: 'Brightway', summary: 'You owe money.',
  deadline: '2025-07-01', amount: '$120', scam_risk: 'low',
  actions: ['Email disputes@brightway-example.com before Friday', 'Quote account number 1234567890123'],
  documents: ['Letter with ref 9876543210987'],
};

test('displayed actions keep emails and numbers; share text hides them', () => {
  const before = JSON.stringify(d);
  const shown = [...d.actions, ...d.documents];
  assert.ok(shown[0].includes('disputes@brightway-example.com'));
  assert.ok(shown[1].includes('1234567890123'));

  const share = buildShare(d);
  assert.doesNotMatch(share.text, /disputes@brightway-example\.com/);
  assert.match(share.text, /•••@brightway-example\.com/);
  assert.doesNotMatch(share.text, /\d{10,}/);
  assert.ok(share.n >= 3);
  assert.match(share.text, /hid \d+ personal details/);
  assert.equal(JSON.stringify(d), before, 'building the share text must not change the verdict');
});

test('share text with nothing sensitive has no hidden-details note', () => {
  const r = buildShare({ ...d, actions: ['Call the office'], documents: [] });
  assert.equal(r.n, 0);
  assert.doesNotMatch(r.text, /hid \d/);
});
