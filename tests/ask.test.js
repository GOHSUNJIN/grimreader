const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/ask.js');

// Validates: Requirements 4.1, 4.2
function call(handler, body, ip = '1.1.1.1') {
  return new Promise((resolve) => {
    const res = { status(s) { this.s = s; return this; }, json(b) { resolve({ status: this.s, body: b }); } };
    handler({ method: 'POST', headers: { 'x-forwarded-for': ip }, body }, res);
  });
}
const ok = async () => '  Pay by Friday.  ';

test('empty prompt gives 400 empty', async () => {
  const r = await call(createHandler({ generate: ok }), { prompt: '  ' });
  assert.equal(r.status, 400);
  assert.equal(r.body.code, 'empty');
});

test('too much text gives 413 too_large', async () => {
  const r = await call(createHandler({ generate: ok }), { prompt: 'x'.repeat(20001) });
  assert.equal(r.status, 413);
  assert.equal(r.body.code, 'too_large');
});

test('11th request in the window gives 429, other clients are fine', async () => {
  let t = 0;
  const h = createHandler({ generate: ok, now: () => t });
  for (let i = 0; i < 10; i++) assert.equal((await call(h, { prompt: 'a' })).status, 200);
  assert.equal((await call(h, { prompt: 'a' })).body.code, 'rate_limited');
  assert.equal((await call(h, { prompt: 'a' }, '2.2.2.2')).status, 200);
  t = 10 * 60 * 1000 + 1;
  assert.equal((await call(h, { prompt: 'a' })).status, 200);
});

test('returns { text } and passes model and prompt to the model', async () => {
  let seen;
  const h = createHandler({ generate: async (a) => { seen = a; return ' hi '; }, model: () => 'p/m' });
  const r = await call(h, { prompt: 'hello' });
  assert.deepEqual(r.body, { text: 'hi' });
  assert.equal(seen.model, 'p/m');
  assert.equal(seen.prompt, 'hello');
});

test('model error or empty reply gives 502 bad_reply', async () => {
  const r1 = await call(createHandler({ generate: async () => { throw new Error('boom'); } }), { prompt: 'a' });
  assert.equal(r1.status, 502);
  const r2 = await call(createHandler({ generate: async () => '   ' }), { prompt: 'a' });
  assert.equal(r2.body.code, 'bad_reply');
});
