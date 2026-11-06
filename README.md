<p align="center"><img src="logo.svg" width="96" alt="Grim Reader wax seal logo"></p>

<h1 align="center">Grim Reader</h1>
<p align="center"><b>Scary letters, explained.</b><br>Kiroween 2026 · Frankenstein category · by Sun Jin and Ritish</p>

<p align="center"><a href="https://grimreader.vercel.app/"><b>Try the live demo →</b></a></p>

> **Judges, start here:** open the demo and press **30-Second Tour**. It loads a sample letter and walks you through every feature. No sign-up, nothing to install.

## Inspiration
Official letters are written in formal or legal language and they are often frightening. Tax notices, unpaid bills, town council arrears, fines and debt letters pile up unopened because people don't understand them or are scared of what they say. Deadlines pass and small problems become late fees, disconnections or court cases. Scammers copy the same letters to steal money.

The people hit hardest are older people, migrant workers and expats reading letters in an unfamiliar system or language, young adults getting their first bills and caregivers handling letters for a parent. We wanted to turn the scariest thing in the mailbox into a short, calm to-do list.

## What It Does
1. **Drop It.** Take a photo of the letter, upload a PDF, Word or text file (up to 3 pages), or paste the text.
2. **Decode It.** The Grim Reader explains it in plain words in one of 9 languages, with a clear headline like "Act within 4 days" and the deadline, amount and scam risk.
3. **Banish It.** Follow a short checklist, send the ready-made reply, set a reminder. When every step is done the letter is banished.

| Feature | What it means for the reader |
| --- | --- |
| **Plain-language verdict** | A one-line headline, a short summary and a spirit that shows urgency: Friendly Ghost, Restless Spirit, Poltergeist or Imposter! The whole screen glows green, amber, red or purple to match |
| **Deadline first** | The days left are the biggest thing on the screen, in the urgency colour, with the date underneath |
| **Do This First** | The next step, always on top, synced with the full checklist |
| **Where It Says This** | Tap the deadline or amount to see the exact sentence in the letter, so you never have to just trust the AI |
| **Scary Words, Decoded** | Jargon like "arrears" or "S&CC" explained, with the sentence where it appears |
| **Scam detection** | Likely scams open with a banner listing why the message looks fake, and the verdict says "Don't pay or click anything" |
| **Safety checks** | Every answer passes rule checks before you see it: real dates, sensible urgency, legal and scam flags |
| **Reply, Ask, Get Help** | An editable reply that never admits fault, follow-up questions in your language and links to free help from real people for serious letters |
| **Share with family** | WhatsApp, Telegram, email, text or copy from one Share button, with ID and account numbers hidden automatically |
| **Listen** | The verdict read aloud with the best voice on your device, highlighting each sentence |
| **Reminders** | A reminder card beside the checklist adds the deadline to Google Calendar |
| **Graveyard** | Every letter you've handled as a tombstone, most urgent first, R.I.P. once banished |
| **Built for everyone** | Fits every screen without scrolling, large tap targets, keyboard and screen reader support, reduced-motion support |

## Why Frankenstein
Grim Reader stitches together parts that don't usually meet: a camera, a language model, rule-based safety checks, speech synthesis, calendar links and messaging apps, all wrapped in a haunted-house skin. The spooky theme has a job: it makes a stressful task feel lighter, and the spirit's mood tells you how urgent a letter is at a glance.

## How We Built It
- A static web app: `index.html` (markup), `style.css` (styles), `app.js` (behaviour) and `icons.js` (icon data). No framework and no build step, so it loads fast on old phones.
- The AI reading step sends the letter and a strict JSON prompt to Claude, then runs every answer through our own rule checks (`applyChecks` in `app.js`) before showing it.
- Illustrations (the reaper, envelope and wax seal) are hand-made inline SVG. Icons are from Lucide. Sound effects are generated in the browser with the Web Audio API.
- A layout routine (`fit()`) tightens spacing step by step so every screen fits on any device without scrolling.
- Hosted on Vercel.

## Challenges
- **Trust.** People shouldn't have to take an AI's word for a legal deadline. "Where It Says This" shows the original sentence, and the rule checks catch impossible dates or missing scam warnings.
- **Fitting everything on one screen.** Older readers get lost when they scroll. We designed for phones first and built `fit()` so nothing is hidden or cut off on short screens.
- **Sharing safely.** A letter shared with family can leak account numbers, so sharing hides personal details automatically.

## What We Learned
Plain language is a design problem as much as a writing one. The biggest improvements came from removing things: one headline, one next step, one tap to see the proof.

## What's Next
This repo is the clickable design prototype and the visual target for the full build, which we will make with Kiro.

| Works in this prototype | Coming in the Kiro build |
| --- | --- |
| All 3 sample letters and every screen | Reading your own photos and pasted text |
| 30-second tour, intro and Graveyard (saved in your browser) | Ask the Grim Reader follow-up questions |
| Share menu, Copy and the Google Calendar link | Scam Radar: how often a scam was reported this week |
| Listen, Where It Says This and Scary Words | Downloadable reminder file |

## Run It Locally
Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

To deploy on Vercel: import the repo, set Framework Preset to **Other**, leave Build Command and Output Directory empty, and deploy.

## Team
- **Sun Jin**, Developer · [gohsunjin.vercel.app](https://gohsunjin.vercel.app/)
- **Ritish**, Developer · [LinkedIn](https://www.linkedin.com/in/prabhakaran-ritish-45286921a/)

## Disclaimer
Grim Reader explains letters in plain language. It is not legal or financial advice. Sample letters and company names are fictional.
