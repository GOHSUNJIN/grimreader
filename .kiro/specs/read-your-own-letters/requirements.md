# Requirements: Read Your Own Letters

## Introduction

Today Grim Reader only reads the three built-in sample letters. On the live site, a photo, PDF, Word file or pasted text ends with "Reading your own letters isn't switched on in this version yet", because the AI step only runs inside Claude's own app runtime (`window.claude`). This feature adds a small server function on Vercel so anyone can read their own letter, keeps every existing safety check, and makes the rule checks testable.

## Requirements

### Requirement 1: Read a pasted or uploaded letter

**User Story:** As someone with a scary letter, I want to paste its text or add photos of it, so that Grim Reader explains my letter, not just a sample.

#### Acceptance Criteria

1. WHEN the user submits pasted text (or text from a Word or text file) THEN the system SHALL send the text and the chosen language to the server and show the verdict.
2. WHEN the user submits 1 to 3 page images (photos or PDF pages) and no text THEN the system SHALL send the images in page order and show the verdict.
3. WHEN the server returns a verdict THEN the system SHALL run `applyChecks` on it before calling `show()`.
4. WHILE the letter is being read THE system SHALL show the séance loading screen for at least 2.6 seconds, as it does today.
5. WHEN a sample letter is chosen in English THEN the system SHALL keep using the pre-written sample answer without a server call.
6. IF `window.claude` is available THEN the system SHALL keep using it, so the app still works inside Claude's runtime.

### Requirement 2: Safe server function

**User Story:** As the team, we want the AI call to run on the server, so that the API key is never exposed and abuse is limited.

#### Acceptance Criteria

1. THE system SHALL read the model API key and model name only from server environment variables.
2. WHEN a request has no text and no images THEN the server SHALL respond 400 with `{ "code": "empty" }`.
3. IF the text is longer than 20,000 characters, or there are more than 3 images, or any image is larger than 4 MB THEN the server SHALL respond 413 with `{ "code": "too_large" }`.
4. IF one client sends more than 10 requests in 10 minutes THEN the server SHALL respond 429 with `{ "code": "rate_limited" }`.
5. WHEN the model replies THEN the server SHALL return only the parsed JSON object, or 502 with `{ "code": "bad_reply" }` if no JSON object can be parsed.
6. THE server SHALL NOT log or store letter text or images.

### Requirement 3: Clear errors

**User Story:** As a stressed reader, I want plain messages when something goes wrong, so that I know what to try next.

#### Acceptance Criteria

1. WHEN the server responds with `rate_limited` THEN the system SHALL show "Too many letters at once. Please wait a minute and try again."
2. WHEN the server responds with `too_large` THEN the system SHALL ask for fewer pages or a shorter text.
3. WHEN the network fails or the server responds with any other error THEN the system SHALL show "We couldn't read that letter. Try a clearer photo, paste the text or try a sample letter." and return to the input screen with the letter still filled in.

### Requirement 4: Ask the Grim Reader

**User Story:** As a reader, I want to ask follow-up questions about my letter, so that I understand what happens next.

#### Acceptance Criteria

1. WHEN the user asks a question on the Ask tab THEN the system SHALL send the question, the verdict summary and the letter text to the server and show the answer in the chat.
2. THE answer SHALL be under 80 words, in the chosen language, and follow the voice rules in `product.md`.

### Requirement 5: Rule checks are tested

**User Story:** As the team, we want the safety checks proven on many inputs, so that a strange AI reply can never show unsafe advice.

#### Acceptance Criteria

1. THE system SHALL move `applyChecks`, `redact` and `daysUntil` into a module that runs in both the browser and Node.
2. FOR ANY input object THEN `applyChecks` SHALL return `urgency` and `scam_risk` in `low | medium | high`, and `actions` as an array of at most 6 strings.
3. FOR ANY deadline that is not a real `YYYY-MM-DD` date THEN `applyChecks` SHALL set `deadline` to null and add a "bad" check.
4. FOR ANY real deadline 0 to 7 days away THEN `urgency` SHALL be `high`, unless `scam_risk` is `high`.
5. FOR ANY verdict with `scam_risk` `high` THEN `urgency` SHALL NOT be `high`.
6. FOR ANY verdict whose type, summary or sender mentions court, summons, lawyer, bankruptcy, police or debt collection THEN `needs_human` SHALL be true.
7. FOR ANY string THEN `redact` SHALL leave no run of 10 or more digits and no full email address in its output.
