// Vercel Function: answers a question about a letter and returns { text }.
// Stateless apart from a best-effort in-memory rate limit. Never logs request bodies.
const { makeLimiter, MAX_TEXT } = require('./read.js');

// Default model call: AI SDK with the Anthropic provider. Model comes from LETTER_MODEL.
async function generate({ model, prompt }) {
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');
  const { text } = await generateText({ model: anthropic(model || 'claude-sonnet-5-5'), messages: [{ role: 'user', content: prompt }] });
  return text;
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
    if (!prompt.trim()) return send(400, { code: 'empty' });
    if (prompt.length > MAX_TEXT) return send(413, { code: 'too_large' });

    let text;
    try {
      text = await gen({ model: model(), prompt });
    } catch (e) {
      console.error('ask: model call failed:', e && e.name); // never log bodies
      return send(502, { code: 'bad_reply' });
    }
    if (typeof text !== 'string' || !text.trim()) return send(502, { code: 'bad_reply' });
    return send(200, { text: text.trim() });
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
