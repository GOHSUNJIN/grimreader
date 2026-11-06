---
inclusion: always
---

# Tech stack

## Frontend
- Static site, no framework, no build step: `index.html`, `style.css`, `app.js`, `icons.js`.
- Plain browser JavaScript (ES2022). No bundler, no npm packages in the browser.
- Third-party scripts load lazily from cdnjs only when needed:
  - PDF.js 3.11.174 (PDF pages to images)
  - Mammoth 1.6.0 (Word .docx to text)
- Icons: Lucide, inlined as SVG markup in `icons.js`, rendered with `ic(name)`.
- Fonts: Creepster (display), IM Fell English (parchment flavour), Inter (all reading text) from Google Fonts.
- Sound effects are generated with the Web Audio API. Read aloud uses the Web Speech API.

## Hosting
- Vercel. Framework preset "Other", no build command, output is the repo root.
- Server code goes in `api/*.js` as Vercel Functions (Node.js runtime, Fluid Compute). Keep them small and stateless.
- Secrets live in Vercel environment variables, never in the repo or the browser.

## AI
- The letter reader asks the model for ONE JSON object (see `prompt()` in `app.js` for the exact keys) and the client parses it with `parseJSON` then runs `applyChecks`.
- Prefer the Vercel AI SDK with AI Gateway model strings (`"provider/model"`), configured by environment variable, so the model can be swapped without code changes.

## Conventions
- Keep `app.js` sections in their current order; each starts with a `// ---------- name ----------` comment.
- Pure logic (checks, redaction, date maths) should be testable in Node without a browser.
- CSS: tokens on `:root`; sections in the order documented at the top of `style.css`; media blocks grouped by breakpoint; avoid `!important`.
- Every UI change must work at 360x640, 390x844, 768x1024, 1280x720 and 1440x900 without scrolling (except `fit4`, the last-resort scroll).
- Accessibility: keyboard reachable, visible focus, `aria-live` updates, 44px touch targets, `prefers-reduced-motion` respected.

## Commands
- Run locally: `npx serve .`
- Tests (once added): `npm test`
