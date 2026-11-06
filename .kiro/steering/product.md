---
inclusion: always
---

# Product: Grim Reader

Grim Reader turns a frightening official letter (tax notice, unpaid bill, town council arrears, fine, debt or court letter, or a scam text) into a calm, plain-language answer: what it is, how urgent it is, the deadline, the amount, the scam risk and exactly what to do next.

Kiroween 2026 entry by Sun Jin and Ritish. Live at https://grimreader.vercel.app.

## Who it is for
- Older people, migrant workers and expats reading letters in an unfamiliar system or language.
- Young adults getting their first bills, and caregivers handling letters for a parent.
- Assume a stressed reader on a phone. Many read English as a second language.

## The flow
1. **Drop It:** a photo (up to 3 pages), PDF, Word or text file, or pasted text.
2. **Decode It:** a verdict in one of 9 languages: a one-line headline ("Act within 4 days"), a short summary, the deadline, amount and scam risk.
3. **Banish It:** a checklist, a ready-made reply and a calendar reminder. Ticking every step "banishes" the letter.

## Non-negotiables
- **Never trust the AI blindly.** Every AI answer passes the rule checks in `applyChecks` before it is shown: real dates, urgency raised when the deadline is close, legal wording forces "get a real person", likely scams never show a high deadline urgency.
- **Show the proof.** Deadline and amount must link back to the sentence in the letter ("Where It Says This").
- **Scams first.** A likely scam leads with a banner and "Don't pay or click anything".
- **Privacy.** Photos and letter text are only used to read the letter. Nothing is stored on a server. Sharing hides ID and account numbers (`redact`).
- **Not legal or financial advice.** Never tell someone they don't need to worry about a legal or debt letter. Serious letters point to free help (Legal Aid Bureau, Community Justice Centre, Credit Counselling Singapore, ScamShield).
- **Fits one screen.** No scrolling on any device; `fit()` tightens spacing step by step instead.

## Voice
- Plain words a 12-year-old would understand. Short sentences.
- No em dashes or en dashes. No comma before "and" or "or".
- Spooky theme is flavour, never at the cost of clarity: the headline and next step are always plain.

## Sample letters
Three fictional samples (overdue power bill, town council arrears, "parcel held" scam text) have pre-written answers in `SAMPLES` so the demo works without an AI call. Company names are fictional.
