# Implementation Plan

- [ ] 1. Extract shared logic into `lib/checks.js`
  - Move `applyChecks`, `daysUntil`, `redact` and `parseJSON` out of `app.js`; pass `today` in as a parameter
  - Export for Node (`module.exports`) and keep browser globals; load it in `index.html` before `app.js`
  - Confirm the three samples still render exactly as before
  - _Requirements: 5.1_

- [ ] 2. Set up tests
  - Add `package.json` with `fast-check` as a dev dependency and `"test": "node --test tests/"`
  - _Requirements: 5_

- [ ] 2.1 Property-based tests for `applyChecks`
  - Generators for arbitrary verdict objects (missing keys, wrong types, real and invalid dates, all urgency and scam combinations, serious words in type/summary/sender)
  - Properties for acceptance criteria 5.2 to 5.6
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 2.2 Property-based tests for `redact`
  - Generate strings containing NRIC-style IDs, emails, card and account numbers, unit numbers and postcodes
  - Property for acceptance criterion 5.7
  - _Requirements: 5.7_

- [ ] 2.3 Unit tests for `parseJSON`
  - JSON with surrounding text, no JSON, broken JSON
  - _Requirements: 2.5_

- [ ] 3. Build `api/read.js`
  - Validate body (empty, too large) and rate limit per client
  - Call the model with `generateText` (AI SDK) using `process.env.LETTER_MODEL` through AI Gateway, sending text and image parts
  - Return the parsed verdict or `bad_reply`; never log bodies
  - Unit-test validation with the model call mocked
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 4. Connect the browser to `api/read.js`
  - In `getSample()`, fall back to an adapter that posts to `/api/read` when `window.claude` is missing
  - Convert page blobs to data URLs; keep the 2.6 s séance timing
  - Map `rate_limited`, `too_large` and other errors to the messages in the design
  - Remove the "isn't switched on in this version yet" message
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3_

- [ ] 5. Build `api/ask.js` and connect the Ask tab
  - Same validation and limits as `api/read.js`; returns `{ text }`
  - `ask()` uses it when `window.claude` is missing
  - _Requirements: 4.1, 4.2_

- [ ] 6. Configure and verify on Vercel
  - Add `LETTER_MODEL` and AI Gateway credentials as environment variables
  - Deploy; test a real photo, a PDF and pasted text, in English and one other language, at 390x844 and 1440x900
  - Update the README: move "Reading your own photos and pasted text" and "Ask the Grim Reader" to "Works now"; document the rate limit
  - _Requirements: 1, 2, 3, 4_
