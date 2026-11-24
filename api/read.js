// Vercel Function: reads a letter with an AI model and returns the verdict JSON.
// Stateless apart from a best-effort in-memory rate limit. Never logs request bodies.
const { parseJSON } = require('../lib/checks.js');

const MAX_TEXT = 20000;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

// Default model call: AI SDK with the Anthropic provider. Model comes from LETTER_MODEL.
async function generate({ model, prompt, images }) {
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');
  const content = [{ type: 'text', text: prompt }, ...images.map((image) => ({ type: 'image', image }))];
  const { text } = await generateText({ model: anthropic(model || 'claude-sonnet-5-5'), messages: [{ role: 'user', content }] });
  return text;
}

// Size of a base64 data URL payload in bytes.
function imageBytes(s) {
  const b64 = s.slice(s.indexOf(',') + 1);
  return Math.floor((b64.length * 3) / 4);
}

// Best-effort in-memory limiter: LIMIT requests per WINDOW_MS per key.
function makeLimiter(now) {
  const hits = new Map();
  return function limited(key) {
    const t = now();
    const recent = (hits.get(key) || []).filter((x) => t - x < WINDOW_MS);
    if (recent.length >= LIMIT) {
      hits.set(key, recent);
      return true;
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (!v.some((x) => t - x < WINDOW_MS)) hits.delete(k);
    }
    return false;
  };
}

function createHandler({ generate: gen = generate, now = Date.now, model = () => process.env.LETTER_MODEL } = {}) {
  const limited = makeLimiter(now);

  return async function handler(req, res) {
    const send = (status, body) => res.status(status).json(body);
    if (req.method !== 'POST') return send(405, { code: 'method_not_allowed' });

    const key = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    if (limited(key)) return send(429, { code: 'rate_limited' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = null; }
    }
    const prompt = body && typeof body.prompt === 'string' ? body.prompt : '';
    const images = body && Array.isArray(body.images) ? body.images : [];
    if (!prompt.trim() && !images.length) return send(400, { code: 'empty' });
    if (images.some((i) => typeof i !== 'string' || !i.startsWith('data:image/'))) return send(400, { code: 'empty' });
    if (prompt.length > MAX_TEXT || images.length > MAX_IMAGES || images.some((i) => imageBytes(i) > MAX_IMAGE_BYTES)) {
      return send(413, { code: 'too_large' });
    }

    let reply;
    try {
      reply = await gen({ model: model(), prompt, images });
    } catch (e) {
      console.error('read: model call failed:', e && e.name); // never log bodies
      return send(502, { code: 'bad_reply' });
    }
    const verdict = parseJSON(reply);
    if (!verdict || typeof verdict !== 'object') return send(502, { code: 'bad_reply' });
    return send(200, verdict);
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
module.exports.makeLimiter = makeLimiter;
module.exports.MAX_TEXT = MAX_TEXT;
