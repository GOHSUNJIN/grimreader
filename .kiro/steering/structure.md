---
inclusion: always
---

# Project structure

```
index.html      markup for every screen and overlay
style.css       all styles (order documented at the top of the file)
app.js          all behaviour, in sections:
                  config (PROJECT) · helpers · samples · overlays · about/intro
                  sound · language · screens (stage) · photos and files · crop
                  AI reading (prompt, run, parseJSON) · rule checks (applyChecks)
                  graveyard · scam radar · read aloud · ask · reminders
                  show (renders a verdict) · fit · victory card · tour
icons.js        Lucide icon data
logo.svg        wax seal logo
og.png          1200x630 link preview image
api/            Vercel Functions (server code), when added
tests/          Node tests for pure logic, when added
.kiro/          steering, specs and hooks for Kiro
```

## Key functions in app.js
- `run()` reads the input, gets a verdict (AI or sample), calls `show()`.
- `prompt(lang, text)` builds the instruction for the model.
- `applyChecks(d)` normalises and safety-checks the model's JSON. Never skip it.
- `show(d, fresh, item)` renders the verdict, tiles, checklist, reply, share options.
- `fit()` / `overflowing()` pick the fit level so everything stays on one screen.
- `redact(s)` hides IDs, emails, account and card numbers before sharing.
- `whereFor()` / `whereInLetter()` find the sentence behind the deadline or amount.

## State
- `pages` (uploaded page images), `current` (the letter being read), `currentItem` (its graveyard entry).
- Graveyard, language and sound preferences are stored in `localStorage` via `store`.
