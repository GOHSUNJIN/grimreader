<p align="center"><img src="logo.svg" width="96" alt="Grim Reader wax seal logo"></p>

<h1 align="center">Grim Reader: Design Prototype</h1>
<p align="center"><b>Scary letters, explained.</b><br>Kiroween 2026 · Frankenstein category · by Sun Jin and Ritish</p>

**Live demo:** https://grimreader.vercel.app/

> This is the clickable design prototype and the visual target for the real app, which we will build with Kiro. The Kiro build is coming soon.

## The Problem
Official letters are written in formal or legal language and they are often frightening. Tax notices, unpaid bills, town council arrears, fines and debt letters pile up unopened because people don't understand them or are scared of what they say. Deadlines pass and small problems become late fees, disconnections or court cases. Scammers copy the same letters to steal money.

The people hit hardest are older people, migrant workers and expats reading letters in an unfamiliar system or language, young adults getting their first bills and caregivers handling letters for a parent.

## What Grim Reader Does
1. **Drop It.** Take a photo of the letter (up to 3 pages) or paste the text.
2. **Decode It.** The Grim Reader explains it in plain words in one of 9 languages, with a clear headline like "Act within 4 days" and the deadline, amount and scam risk.
3. **Banish It.** Follow a short checklist, send the ready-made reply, set a reminder. When every step is done the letter is banished.

## Features
| | |
| --- | --- |
| **Plain-language verdict** | A one-line headline, a short summary and a spirit that shows urgency: Friendly Ghost, Restless Spirit, Poltergeist or Imposter! |
| **Do This First** | The next step, always on top, synced with the full checklist |
| **Where It Says This** | Tap the deadline or amount to see the exact sentence in the letter, so you never have to just trust the AI |
| **Scary Words, Decoded** | Jargon like "arrears" or "S&CC" explained, with the sentence where it appears |
| **Scam detection** | Likely scams lead with "Don't pay or click anything", list why it looks fake and show Scam Radar: how often that scam was reported this week |
| **Safety checks** | Every AI answer passes rule checks before you see it: real dates, sensible urgency, legal and scam flags |
| **Reply, Ask, Get Help** | An editable reply that never admits fault, follow-up questions in your language and free help from real people for serious letters |
| **Share with family** | WhatsApp, Telegram, email, text or copy, with ID and account numbers hidden automatically |
| **Listen** | The verdict read aloud with a natural voice, highlighting each sentence |
| **Reminders** | A calendar reminder before the deadline |
| **Graveyard** | Every letter you've handled as a tombstone, most urgent first, R.I.P. once banished |
| **Built for everyone** | Fits every screen without scrolling, large tap targets, keyboard and screen reader support |


## Run It
It's a static site with no build step: `index.html` (markup), `style.css` (styles) and `app.js` (behaviour). Open `index.html` in a browser or serve the folder with `npx serve .`

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel choose Add New, then Project and import the repo.
3. Set Framework Preset to **Other** and leave Build Command and Output Directory empty.
4. Deploy.

## What Works in This Prototype
| Works here | Coming in the Kiro build |
| --- | --- |
| All 3 sample letters and every screen | Reading your own photos or pasted text |
| Tour, intro and Graveyard (saved in your browser) | Ask the Grim Reader |
| Share menu, Copy and the Google Calendar link | Scam Radar counts |
| Listen, Where It Says This and Scary Words | The reminder file download |

## Disclaimer
Grim Reader explains letters in plain language. It is not legal or financial advice. Sample letters and company names are fictional.
