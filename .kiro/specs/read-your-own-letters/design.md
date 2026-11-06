# Design: Read Your Own Letters

## Overview

Add two Vercel Functions, `api/read.js` and `api/ask.js`, that call an AI model through the Vercel AI SDK and AI Gateway. The browser keeps building the prompt and keeps the rule checks, so the server stays a thin, stateless proxy. Pure logic moves into `lib/checks.js` so Node tests (including property-based tests) can run it.

```
browser (app.js)                         Vercel                       AI Gateway
run() ── POST /api/read {prompt, images} ──> api/read.js ── generateText ──> model
     <─ { verdict JSON } ──────────────────  (parse JSON, size + rate limits)
applyChecks(verdict) -> show()
```

## Components

### `lib/checks.js` (new, shared)
- Moves `applyChecks(d, today)`, `daysUntil(iso, today)`, `redact(s)` and `parseJSON(t)` out of `app.js` unchanged in behaviour.
- `today` becomes a parameter so tests can fix the date.
- Works in both places: defines globals in the browser and `module.exports` in Node.
- `index.html` loads it before `app.js`.

### `api/read.js` (new)
- `POST` JSON body: `{ prompt: string, images?: string[] }` where images are base64 JPEG data URLs (the client already converts every page to JPEG at max 1600px with `toJpeg`).
- Validates sizes (Requirement 2.2, 2.3) before calling the model.
- Calls `generateText({ model: process.env.LETTER_MODEL, messages: [{ role: 'user', content: [text part, ...image parts] }] })` from the `ai` package. `LETTER_MODEL` is an AI Gateway model string, for example a current Claude Sonnet model; check the exact ID in the AI Gateway model list.
- Parses the reply with `parseJSON` and returns it, or 502 `bad_reply`.
- Rate limit: in-memory sliding window keyed by `x-forwarded-for` (best effort; Fluid Compute reuses instances). Good enough for a hackathon demo; note it in the README.
- Never logs request bodies.

### `api/ask.js` (new)
- `POST { prompt: string }` (the client already builds the Ask prompt in `ask()`), returns `{ text }`. Same limits.

### `app.js` changes
- `getSample()` keeps preferring `window.claude.use('sample')`. When it is missing, return a small adapter with the same shape: `sample(prompt, { images })` posts to `/api/read` and resolves `{ text: JSON.stringify(verdict) }`. This keeps `run()` almost unchanged.
- Blobs become data URLs before sending (`FileReader.readAsDataURL`).
- Map server error codes to the existing messages in `run()` (`rate_limited`, `too_large`, everything else).
- `ask()` uses `/api/ask` when `window.claude` is missing.
- Remove the "isn't switched on in this version yet" path once the server exists.

### `package.json` (new)
- `dependencies`: `ai`.
- `devDependencies`: `fast-check` for property-based tests.
- `scripts.test`: `node --test tests/`.
- Vercel still serves the static files from the root; `api/` becomes functions automatically.

## Data model
The verdict JSON is unchanged (keys defined in `prompt()`): `letter_type, sender, summary, urgency, deadline, amount, deadline_quote, amount_quote, actions, documents, scam_risk, scam_reasons, needs_human, human_reason, jargon, scam_family, reply`.

## Error handling
| Case | Server | Client message |
| --- | --- | --- |
| Nothing sent | 400 `empty` | (cannot happen: the button is disabled) |
| Too big | 413 `too_large` | "That's a lot of letter. Try fewer pages or a shorter text." |
| Too many requests | 429 `rate_limited` | existing rate-limit message |
| Model reply not JSON | 502 `bad_reply` | existing "couldn't read" message |
| Network or other | any | existing "couldn't read" message |

## Testing strategy
- **Property-based tests** (`fast-check`) for Requirement 5: generate arbitrary verdict objects (missing keys, wrong types, random strings, real and fake dates, every urgency and scam combination) and assert the invariants hold. Generate random strings with embedded IDs, emails and long digit runs for `redact`.
- **Unit tests** for `parseJSON` (text before and after the JSON, no JSON, broken JSON) and for the server's validation, with the model call mocked.
- **Manual check** on the live site at 390x844 and 1440x900 with a real photo, a PDF and pasted text, in English and one other language.

## Security and privacy
- API key only in Vercel env vars (`AI_GATEWAY_API_KEY`, or OIDC on Vercel).
- No storage, no logging of letter content.
- Size and rate limits protect the budget during judging.
