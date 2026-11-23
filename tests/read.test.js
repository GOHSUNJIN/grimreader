const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/read.js');

// Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
function call(handler, body, ip = '1.1.1.1') {
  return new Promise((resolve) => {
    const res = { status(s) { this.s = s; return this; }, json(b) { resolve({ status: this.s, body: b }); } };
    handler({ method: 'POST', headers: { 'x-forwarded-for': ip }, body }, res);
  });
}
const ok = async () => 'Sure: {"urgency":"low"} done';
const img = (bytes) => 'data:image/jpeg;base64,' + 'A'.repeat(Math.ceil((bytes * 4) / 3));

test('empty body gives 400 empty', async () => {
  const r = await call(createHandler({ generate: ok }), { prompt: '  ' });
  assert.equal(r.status, 400);
  assert.equal(r.body.code, 'empty');
});

test('too much text, too many images or a big image give 413', async () => {
  const h = createHandler({ generate: ok });
  assert.equal((await call(h, { prompt: 'x'.repeat(20001) })).status, 413);
  assert.equal((await call(h, { prompt: 'a', images: [img(10), img(10), img(10), img(10)] })).status, 413);
  assert.equal((await call(h, { prompt: 'a', images: [img(4 * 1024 * 1024 + 10)] })).status, 413);
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

test('returns the parsed verdict and passes text and images to the model', async () => {
  let seen;
  const h = createHandler({ generate: async (a) => { seen = a; return 'x {"a":1} y'; }, model: () => 'p/m' });
  const r = await call(h, { prompt: 'hello', images: [img(10)] });
  assert.deepEqual(r.body, { a: 1 });
  assert.equal(seen.model, 'p/m');
  assert.equal(seen.prompt, 'hello');
  assert.equal(seen.images.length, 1);
});

test('non-JSON reply or model error gives 502 bad_reply', async () => {
  const r1 = await call(createHandler({ generate: async () => 'no json here' }), { prompt: 'a' });
  assert.equal(r1.status, 502);
  assert.equal(r1.body.code, 'bad_reply');
  const r2 = await call(createHandler({ generate: async () => { throw new Error('boom'); } }), { prompt: 'a' });
  assert.equal(r2.status, 502);
});
