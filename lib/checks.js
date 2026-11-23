// Shared pure logic: used by app.js in the browser (plain globals) and by Node tests (module.exports).
// Nothing here touches the DOM, localStorage or the clock. `today` is always passed in.

// whole days from today until a YYYY-MM-DD date (negative once it has passed); null when there is no date
function daysUntil(s, today){
  return s ? Math.round((new Date(s + 'T00:00:00') - today) / 864e5) : null;
}

function parseJSON(t){
  if (!t) return null;
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) return null;
  try { return JSON.parse(t.slice(a, b+1)); } catch { return null; }
}

// plain text from an untrusted value; never calls toString on objects, so it cannot throw
const plain = v => typeof v === 'string' ? v : (typeof v === 'number' || typeof v === 'boolean' ? String(v) : '');

// never trust the AI blindly: normalise and safety-check the model's JSON
function applyChecks(d, today){
  const checks = [];
  const levels = ['low','medium','high'];
  d.actions = Array.isArray(d.actions) ? d.actions.filter(a => typeof a === 'string' && a).slice(0,6) : [];
  d.documents = Array.isArray(d.documents) ? d.documents.filter(Boolean) : [];
  d.scam_reasons = Array.isArray(d.scam_reasons) ? d.scam_reasons : [];
  d.jargon = Array.isArray(d.jargon) ? d.jargon.filter(j => j && j.term && j.meaning).slice(0,5) : [];
  if (!levels.includes(d.urgency)) { d.urgency = 'medium'; checks.push(['bad','Urgency was unclear, so we set it to medium to be safe']); }
  else checks.push(['ok','Urgency level is valid']);
  if (!levels.includes(d.scam_risk)) d.scam_risk = 'low';

  d.days = null;
  if (d.deadline != null && d.deadline !== '' && typeof d.deadline !== 'string') { checks.push(['bad','Deadline was not a real date. Please check the letter yourself']); d.deadline = null; }
  else if (d.deadline) {
    const m = /^\d{4}-\d{2}-\d{2}$/.test(d.deadline) ? new Date(d.deadline + 'T00:00:00') : null;
    const [y, mo, da] = d.deadline.split('-').map(Number);
    // reject impossible dates such as 2025-02-30, which Date would roll over to March
    if (!m || isNaN(m) || m.getFullYear() !== y || m.getMonth() + 1 !== mo || m.getDate() !== da) { checks.push(['bad',`Deadline "${d.deadline}" isn't a real date. Please check the letter yourself`]); d.deadline = null; }
    else {
      d.days = daysUntil(d.deadline, today);
      checks.push(['ok','Deadline is a real date']);
      if (d.days < 0) { checks.push(['bad','The deadline seems to have passed. Act today and contact the sender']); d.urgency = 'high'; }
      else if (d.days <= 7 && d.urgency !== 'high') { d.urgency = 'high'; checks.push(['bad','Deadline is within 7 days, so urgency was raised to high']); }
      else checks.push(['ok','Urgency matches the time left']);
    }
  } else checks.push(['ok','No deadline found. Double-check the letter for a date']);

  if (d.amount && typeof d.amount !== 'string' && typeof d.amount !== 'number') { checks.push(['bad','Amount was not readable, so we hid it']); d.amount = null; }
  else if (d.amount && !/\d/.test(String(d.amount))) { checks.push(['bad','Amount had no number in it, so we hid it']); d.amount = null; }
  else if (d.amount) checks.push(['ok','Amount contains a real number']);

  const serious = /court|summons|writ|legal|lawyer|bankrupt|immigration|ica|police|debt collect/i.test(`${plain(d.letter_type)} ${plain(d.summary)} ${plain(d.sender)}`);
  if (serious && d.needs_human !== true) { d.needs_human = true; d.human_reason = d.human_reason || 'This letter mentions legal or serious matters. A professional should check it.'; checks.push(['bad','Serious wording found, so we added the "talk to a person" advice']); }
  else checks.push(['ok','Checked for legal or serious wording']);

  if (d.scam_risk === 'high' && d.urgency === 'high') { d.urgency = 'medium'; checks.push(['bad','Likely scam. The real risk is paying, not the deadline, so urgency was lowered']); }
  d.checks = checks;
  return d;
}

// hide IDs, emails, account and card numbers before sharing
function redact(s){
  let n = 0; const hit = r => { n++; return r; };
  s = s.replace(/\b[STFGM]\d{7}[A-Z]\b/gi, () => hit('[ID hidden]'));
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, m => hit('•••' + m.slice(m.indexOf('@'))));
  s = s.replace(/\b(?:\d[ -]?){10,}\b/g, m => hit('••••' + m.replace(/\D/g,'').slice(-4)));
  // any long digit run the word-boundary rules missed (for example digits glued to letters)
  s = s.replace(/\d{10,}/g, m => hit('••••' + m.slice(-4)));
  s = s.replace(/\b(account|acct|a\/c|card|policy|ref(?:erence)?|no\.?|number)(\s*(?:no\.?|number)?\s*[:#]?\s*)(\d[\d -]{6,}\d)/gi, (m, a, b, num) => hit(a + b + '••••' + num.replace(/\D/g,'').slice(-4)));
  s = s.replace(/#\d{1,3}-\d{1,5}\b/g, () => hit('#••-•••'));
  s = s.replace(/\b(Singapore\s*|S\s?\()\d{6}\)?/gi, () => hit('Singapore ••••••'));
  return { text: s, n };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { daysUntil, parseJSON, applyChecks, redact };
