// ===== Edit these for your submission =====
const PROJECT = {
  category: 'Frankenstein',
  team: [
    { name: 'Sun Jin', role: 'Developer', link: 'https://gohsunjin.vercel.app/' },
    { name: 'Ritish', role: 'Developer', link: 'https://www.linkedin.com/in/prabhakaran-ritish-45286921a/' }
  ],
  github: '',   // e.g. 'https://github.com/you/grim-reader'
  devpost: ''   // your Devpost project page
};
// ==========================================

const ic = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const paintIcons = root => root.querySelectorAll('i[data-i]').forEach(el => { el.outerHTML = ic(el.dataset.i, el.className); });
paintIcons(document);

const $ = id => document.getElementById(id);
const today = new Date(); today.setHours(0,0,0,0);
const iso = d => d.toISOString().slice(0,10);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const longDate = s => { const [y, m, d] = s.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
// whole days from today until a YYYY-MM-DD date (negative once it has passed); null when there is no date
const daysUntil = s => s ? Math.round((new Date(s + 'T00:00:00') - today) / 864e5) : null;
const plus = n => { const d = new Date(today); d.setDate(d.getDate()+n); return iso(d); };
const store = { get(k, f){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
let pages = [], chosenSample = null, current = null, currentItem = null;
const say = msg => { $('live').textContent = ''; setTimeout(() => $('live').textContent = msg, 50); };

const SAMPLES = {
  power: {
    text: `LION CITY POWER (sample company)\nFINAL REMINDER: ACCOUNT 8812-4410\n\nDear Customer,\nOur records show an outstanding balance of $184.60 for the billing periods of August and September. Please make payment by ${longDate(plus(5))}.\nIf payment is not received by this date, a late payment charge will apply and your electricity supply may be disconnected after a further 7 days' notice.\nIf you are facing difficulty, please contact us to discuss an instalment plan.\nCustomer Service: 6000 0000`,
    canned: { letter_type:"Overdue Bill: Final Reminder", sender:"Lion City Power (Electricity)", summary:"You owe $184.60 for electricity. Pay it soon or you'll be charged a late fee and later your power could be cut off.", urgency:"high", deadline:plus(5), amount:"$184.60", actions:["Check the amount matches your last two bills","Pay $184.60 online, at AXS or by bank transfer before the deadline","If you can't pay it all, call them and ask for an instalment plan","Keep the payment receipt"], documents:["Account number 8812-4410","Your last two bills"], scam_risk:"low", scam_reasons:[], needs_human:false, human_reason:"", reply:`Dear Lion City Power,\n\nRe: Account 8812-4410, Final Reminder\n\nI received your final reminder for $184.60. I would like to settle this but need to pay in instalments. Could you please set up a payment plan over 3 months and confirm that no late charge or disconnection will apply while I keep to it?\n\nThank you,\n[Your name]\n[Your phone number]`, jargon:[{term:"Outstanding balance",meaning:"Money you still owe them."},{term:"Late payment charge",meaning:"An extra fee added because you paid after the deadline."},{term:"Disconnected",meaning:"They switch off your electricity supply."},{term:"Instalment plan",meaning:"Paying the total in smaller parts over a few months."}], scam_family:null }
  },
  council: {
    text: `NORTHSHORE TOWN COUNCIL (sample)\nNOTICE OF ARREARS: S&CC\n\nBlk 123 #04-56\nYour Service & Conservancy Charges are in arrears of $96.40 (3 months).\nPlease pay the full amount by ${longDate(plus(14))} to avoid further action, which may include legal proceedings to recover the sum.\nGIRO applications can be made online.`,
    canned: { letter_type:"Notice of Unpaid Charges", sender:"Northshore Town Council", summary:"You haven't paid 3 months of the monthly charges for your HDB flat ($96.40). Pay by the deadline so it doesn't become a legal case.", urgency:"medium", deadline:plus(14), amount:"$96.40", actions:["Pay $96.40 before the deadline","Set up GIRO so it is paid automatically every month","If money is tight, call the town council to ask for more time"], documents:["Your unit address","Your bank details for GIRO"], scam_risk:"low", scam_reasons:[], needs_human:false, human_reason:"", reply:`Dear Northshore Town Council,\n\nRe: S&CC arrears for Blk 123 #04-56\n\nI received your notice about arrears of $96.40. I will pay the full amount by the stated date and would like to apply for GIRO for future charges. Please confirm once the payment is received.\n\nThank you,\n[Your name]\n[Your phone number]`, jargon:[{term:"Arrears",meaning:"Payments you missed and still owe."},{term:"S&CC",meaning:"Service and Conservancy Charges: the monthly fee for cleaning and maintaining your HDB estate."},{term:"Legal proceedings",meaning:"Taking you to court to get the money back."},{term:"GIRO",meaning:"Automatic monthly payment from your bank account."}], scam_family:null }
  },
  scam: {
    text: `SingPost-Express: Your parcel SG84721 is held at our warehouse due to unpaid customs fee ($2.99). Pay within 24 hours or it will be returned: http://sg-parcel-redelivery.top/pay`,
    canned: { letter_type:"Suspicious Message: Likely Scam", sender:"Claims to be a delivery company", summary:"This looks like a scam. Real delivery companies don't ask for small fees through odd links. Don't click or pay.", urgency:"low", deadline:null, amount:"$2.99 (don't pay)", actions:["Don't click the link or enter card details","Check any real delivery on the courier's official app or website","Report the message on ScamShield","Delete the message"], documents:[], scam_risk:"high", scam_reasons:["Strange web address that isn't the courier's real site","Pressure to pay within 24 hours","Tiny fee used to collect your card details"], needs_human:false, human_reason:"", reply:"No reply needed. Don't respond to this message. Report it on ScamShield and delete it.", jargon:[{term:"Customs fee",meaning:"A tax on goods from overseas. Real ones are never collected through random links."},{term:"Redelivery",meaning:"Sending a parcel again after a failed delivery. Scammers use this word to look official."}], scam_family:"Fake parcel customs fee" }
  }
};



// ---------- overlays (focus kept inside, Escape closes) ----------
let lastFocus = null;
function openOverlay(id){
  lastFocus = document.activeElement; const o = $(id); o.classList.add('on');
  const f = o.querySelector('button, [href], input'); if (f) f.focus();
}
function closeOverlay(o){ o.classList.remove('on'); if (lastFocus) lastFocus.focus(); }
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeOverlay(o); });
  o.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay(o);
    if (e.key === 'Tab') { const f = [...o.querySelectorAll('button, [href], input, select')].filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f.at(-1); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
});

// ---------- about + intro ----------
$('category').textContent = PROJECT.category;
const AVA = ['#ff7a1a', '#b78cff', '#8be36a', '#f5c04a'];
const initials = n => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
$('team').innerHTML = PROJECT.team.map((m, i) => `<${m.link ? `a href="${m.link}" target="_blank" rel="noopener"` : 'div'} class="member"><span class="av" style="--av:${AVA[i % AVA.length]}">${initials(m.name)}</span><span class="who"><b>${m.name}</b><small>${m.role}</small></span>${m.link ? ic('external-link') : ''}</${m.link ? 'a' : 'div'}>`).join('');
$('links').insertAdjacentHTML('afterbegin', [PROJECT.github && `<a class="sec" href="${PROJECT.github}" target="_blank" rel="noopener">${ic('github')}Source Code</a>`, PROJECT.devpost && `<a class="sec" href="${PROJECT.devpost}" target="_blank" rel="noopener">${ic('trophy')}Devpost Page</a>`].filter(Boolean).join(''));
$('infoBtn').onclick = () => openOverlay('about');
$('replayIntro').onclick = () => { closeOverlay($('about')); openOverlay('intro'); };
if (!store.get('gr-intro', false)) { store.set('gr-intro', true); setTimeout(() => openOverlay('intro'), 400); }

// ---------- sound effects (made in the browser, off by default) ----------
let sound = store.get('gr-sound', false), actx = null;
function ctx(){ if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } } if (actx.state === 'suspended') actx.resume(); return actx; }
function tone(freq, start, dur, type='sine', vol=.12, glideTo){
  const c = ctx(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t); if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
}
const SFX = {
  summon(){ tone(220, 0, 1.6, 'sine', .1, 110); tone(330, .1, 1.4, 'triangle', .05, 165); tone(466, .3, 1.2, 'sine', .04, 233); },
  reveal(){ [262, 311, 392, 466].forEach((f,i) => tone(f, i*.12, .9, 'triangle', .07)); },
  tick(){ tone(880, 0, .12, 'sine', .06); },
  banish(){ [523, 659, 784, 1047].forEach((f,i) => tone(f, i*.09, .5, 'sine', .08)); tone(200, 0, .6, 'sawtooth', .02, 600); }
};
const sfx = n => { if (sound) SFX[n](); };
function paintSound(){ $('soundBtn').innerHTML = ic(sound ? 'volume-2' : 'volume-x') + `<span class="lbl">${sound ? 'Sound On' : 'Sound Off'}</span>`; $('soundBtn').setAttribute('aria-pressed', sound); $('soundBtn').title = sound ? 'Sound On' : 'Sound Off'; }
$('soundBtn').onclick = () => { sound = !sound; store.set('gr-sound', sound); paintSound(); if (sound) SFX.tick(); };
paintSound();

// ---------- calm mode: bigger text, higher contrast, no moving effects ----------
let calm = store.get('gr-calm', false);
function paintCalm(){
  document.body.classList.toggle('calm', calm);
  $('calmBtn').setAttribute('aria-pressed', calm);
  $('calmBtn').querySelector('.lbl').textContent = calm ? 'Calm On' : 'Calm Mode';
  setTimeout(fit, 60);
}
$('calmBtn').onclick = () => { calm = !calm; store.set('gr-calm', calm); paintCalm(); };
paintCalm();

// ---------- language remembered ----------
const savedLang = store.get('gr-lang', null);
if (savedLang && [...$('lang').options].some(o => o.text === savedLang)) $('lang').value = savedLang;
$('lang').onchange = () => store.set('gr-lang', $('lang').value);

// ---------- screens ----------
function stage(n){
  ['st1','st2','st3'].forEach((id,i) => { $(id).classList.toggle('on', i === n-1); $(id).classList.toggle('done', i < n-1); });
  ['input','seance','result'].forEach((id,i) => $(id).classList.toggle('on', i === n-1));
  document.body.classList.toggle('onresult', n === 3);
  if (n !== 3) stopSpeaking();
  if (n === 2) { $('seanceReaper').innerHTML = reaperSVG('#ff7a1a', 'medium'); const s = $('seance'); s.querySelectorAll('.envbody,.spirit').forEach(e => { e.style.animation = 'none'; e.offsetHeight; e.style.animation = ''; }); }
  if (n === 1) renderYard();
  refit();
}

// ---------- photos: up to 3 pages, rotate, crop, quality check ----------
const drop = $('drop'), file = $('file');
let replaceIdx = -1;
drop.onclick = e => { if (e.target.closest('#pasteToggle') || e.target.closest('.tools')) return; if (pages.length >= 3 && !e.target.closest('.addpg')) return; replaceIdx = -1; file.click(); };
drop.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === drop) { e.preventDefault(); replaceIdx = -1; file.click(); } };
['dragover','dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('over')));
drop.addEventListener('drop', e => { e.preventDefault(); addFiles([...e.dataTransfer.files]); });
file.onchange = () => { addFiles([...file.files]); file.value = ''; };
$('backToPhoto').onclick = () => { $('inputCard').classList.remove('pasting'); refit(); };
$('pasteToggle').onclick = () => { const on = !$('inputCard').classList.contains('pasting'); $('inputCard').classList.toggle('pasting', on); if (on) $('text').focus(); refit(); };
$('text').oninput = () => { chosenSample = null; refresh(); };

// ---------- other file types: PDF pages become photos, Word and text files become pasted text ----------
const loadScript = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
async function pdfToImages(f, max){
  if (!window.pdfjsLib) { await loadScript(PDFJS + 'pdf.min.js'); pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; }
  const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise, out = [];
  for (let n = 1; n <= Math.min(pdf.numPages, max); n++) {
    const page = await pdf.getPage(n), base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: Math.min(3, 1600 / Math.max(base.width, base.height)) });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp }).promise;
    out.push(await new Promise(r => c.toBlob(r, 'image/jpeg', .9)));
  }
  return out;
}
async function docxToText(f){
  if (!window.mammoth) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  return (await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value;
}
const kindOf = f => {
  const n = f.name.toLowerCase();
  if (/\.(heic|heif)$/.test(n) || /hei[cf]/.test(f.type)) return 'heic';
  if (f.type.startsWith('image/')) return 'image';
  if (f.type === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.docx')) return 'docx';
  if (f.type.startsWith('text/') || /\.(txt|text|md|eml|csv)$/.test(n)) return 'text';
  return 'other';
};

async function addFiles(files){
  if (!files.length) return;
  $('status').textContent = 'Opening your file…';
  const images = [], texts = [], problems = [];
  for (const f of files) {
    const kind = kindOf(f);
    try {
      if (kind === 'image' || kind === 'heic') images.push(f);
      else if (kind === 'pdf') images.push(...await pdfToImages(f, 3 - images.length - (replaceIdx >= 0 ? 0 : pages.length)));
      else if (kind === 'docx') texts.push(await docxToText(f));
      else if (kind === 'text') texts.push(await f.text());
      else problems.push(`${f.name} can't be read. Try a photo, PDF, Word (.docx) or text file.`);
    } catch { problems.push(`We couldn't open ${f.name}. Try a photo or screenshot of it instead.`); }
  }
  // Word and text files go straight into the paste box
  const text = texts.map(t => t.trim()).filter(Boolean).join('\n\n');
  if (text && !images.length) {
    pages.forEach(p => URL.revokeObjectURL(p.url)); pages = []; renderThumbs(); showQuality();
    chosenSample = null; $('text').value = text; $('inputCard').classList.add('pasting');
    $('status').textContent = problems.join(' '); refresh(); sfx('tick'); refit(); return;
  }
  for (const f of images) {
    let blob;
    try { blob = await toJpeg(f); }
    catch { problems.push(kindOf(f) === 'heic' ? 'This browser can’t open iPhone HEIC photos. Take a screenshot of the letter and add that instead.' : `We couldn't open ${f.name || 'that page'}.`); continue; }
    const page = { blob, url: URL.createObjectURL(blob) };
    if (replaceIdx >= 0) { URL.revokeObjectURL(pages[replaceIdx].url); pages[replaceIdx] = page; await checkQuality(replaceIdx); replaceIdx = -1; }
    else if (pages.length < 3) { pages.push(page); await checkQuality(pages.length - 1); }
    else { problems.push('Only the first 3 pages were added.'); break; }
  }
  $('status').textContent = problems.join(' ');
  if (!images.length) return;
  chosenSample = null; $('text').value = ''; $('inputCard').classList.remove('pasting');
  renderThumbs(); refresh(); sfx('tick'); refit();
}
// swap page i's image for a new blob, freeing the old preview URL
function replacePage(i, blob){ URL.revokeObjectURL(pages[i].url); pages[i] = { ...pages[i], blob, url: URL.createObjectURL(blob) }; }
function loadImg(src){ return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function toJpeg(f, rotate = 0, crop = null){
  const img = await loadImg(f instanceof Blob ? URL.createObjectURL(f) : f);
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (crop) { sx = crop.x * img.width; sy = crop.y * img.height; sw = crop.w * img.width; sh = crop.h * img.height; }
  const s = Math.min(1, 1600 / Math.max(sw, sh)), w = Math.round(sw * s), h = Math.round(sh * s);
  const c = document.createElement('canvas'); const r = rotate % 360 !== 0;
  c.width = r ? h : w; c.height = r ? w : h;
  const g = c.getContext('2d');
  if (r) { g.translate(c.width / 2, c.height / 2); g.rotate(Math.PI / 2); g.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h); }
  else g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return new Promise(res => c.toBlob(b => res(b || f), 'image/jpeg', .85));
}
async function checkQuality(i){
  const img = await loadImg(pages[i].url);
  const W = 320, H = Math.max(1, Math.round(img.height * W / img.width));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, gray = new Float32Array(W * H);
  let sum = 0; for (let p = 0; p < W * H; p++) { gray[p] = .299 * d[p*4] + .587 * d[p*4+1] + .114 * d[p*4+2]; sum += gray[p]; }
  const mean = sum / (W * H); let lsum = 0, lsq = 0, n = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const p = y * W + x; const l = 4 * gray[p] - gray[p-1] - gray[p+1] - gray[p-W] - gray[p+W]; lsum += l; lsq += l * l; n++; }
  const variance = n ? lsq / n - (lsum / n) ** 2 : 999;
  pages[i].issue = mean < 45 ? 'too dark' : variance < 40 ? 'blurry' : null;
  showQuality();
}
function showQuality(){
  refit();
  const i = pages.findIndex(p => p.issue && !p.ok);
  $('qwarn').classList.toggle('on', i >= 0);
  if (i >= 0) { $('qwarnTxt').textContent = `Page ${i + 1} looks ${pages[i].issue}. Retake it for a better reading.`; $('retake').onclick = () => { replaceIdx = i; file.click(); }; $('keep').onclick = () => { pages[i].ok = true; showQuality(); renderThumbs(); }; }
}
function renderThumbs(){
  drop.classList.toggle('has', pages.length > 0);
  $('thumbs').innerHTML = pages.map((p, i) => `<div class="thumb ${p.issue && !p.ok ? 'lowq' : ''}"><img src="${p.url}" alt="Page ${i + 1}"><span class="pg">${i + 1}</span><div class="tools"><button type="button" data-act="rot" data-i="${i}" aria-label="Rotate page ${i + 1}">${ic('rotate-cw')}</button><button type="button" data-act="crop" data-i="${i}" aria-label="Crop page ${i + 1}">${ic('crop')}</button><button type="button" data-act="del" data-i="${i}" aria-label="Remove page ${i + 1}">${ic('trash-2')}</button></div></div>`).join('')
    + (pages.length < 3 ? `<button type="button" class="addpg" aria-label="Add another page">${ic('image-plus')}Add Page</button>` : '');
  $('thumbs').querySelectorAll('[data-act]').forEach(b => b.onclick = async e => {
    e.stopPropagation(); const i = +b.dataset.i;
    if (b.dataset.act === 'del') { URL.revokeObjectURL(pages[i].url); pages.splice(i, 1); showQuality(); renderThumbs(); refresh(); }
    if (b.dataset.act === 'rot') { replacePage(i, await toJpeg(pages[i].blob, 90)); renderThumbs(); }
    if (b.dataset.act === 'crop') openCrop(i);
  });
  const add = $('thumbs').querySelector('.addpg'); if (add) add.onclick = e => { e.stopPropagation(); replaceIdx = -1; file.click(); };
}
// crop
let cropIdx = -1, box = {x:.05, y:.05, w:.9, h:.9};
function openCrop(i){ cropIdx = i; box = {x:.05, y:.05, w:.9, h:.9}; $('cropimg').src = pages[i].url; openOverlay('cropper'); $('cropimg').onload = paintBox; paintBox(); }
function paintBox(){ const b = $('cropbox'); b.style.left = box.x*100 + '%'; b.style.top = box.y*100 + '%'; b.style.width = box.w*100 + '%'; b.style.height = box.h*100 + '%'; }
(() => {
  let mode = null, sx, sy, start;
  $('cropbox').addEventListener('pointerdown', e => { e.preventDefault(); mode = e.target.classList.contains('h') ? [...e.target.classList].find(c => c.length === 2) : 'move'; sx = e.clientX; sy = e.clientY; start = {...box}; $('cropbox').setPointerCapture(e.pointerId); });
  $('cropbox').addEventListener('pointermove', e => {
    if (!mode) return; const r = $('cropimg').getBoundingClientRect(); const dx = (e.clientX - sx) / r.width, dy = (e.clientY - sy) / r.height; const m = .1;
    let {x, y, w, h} = start;
    if (mode === 'move') { x = Math.min(Math.max(0, x + dx), 1 - w); y = Math.min(Math.max(0, y + dy), 1 - h); }
    if (mode.includes('l')) { const nx = Math.min(Math.max(0, x + dx), x + w - m); w = w + (x - nx); x = nx; }
    if (mode.includes('r') && mode !== 'move') w = Math.min(Math.max(m, w + dx), 1 - x);
    if (mode.startsWith('t')) { const ny = Math.min(Math.max(0, y + dy), y + h - m); h = h + (y - ny); y = ny; }
    if (mode.startsWith('b')) h = Math.min(Math.max(m, h + dy), 1 - y);
    box = {x, y, w, h}; paintBox();
  });
  $('cropbox').addEventListener('pointerup', () => mode = null);
})();
$('cropApply').onclick = async () => { const i = cropIdx; replacePage(i, await toJpeg(pages[i].blob, 0, box)); closeOverlay($('cropper')); await checkQuality(i); renderThumbs(); };

document.querySelectorAll('[data-sample]').forEach(b => b.onclick = () => {
  chosenSample = b.dataset.sample; pages = []; renderThumbs(); showQuality();
  $('text').value = SAMPLES[chosenSample].text; refresh(); run();
});
function refresh(){ const ok = !!(pages.length || $('text').value.trim()); $('go').disabled = !ok; $('go').innerHTML = ok ? `${ic('wand-sparkles')}Summon the Grim Reader` : `${ic('arrow-right')}Add a Letter or Pick a Sample`; }
const SPELLS = ['Breaking the wax seal...','Summoning the Grim Reader...','Translating ancient bureaucratese...','Consulting the spirits of deadlines past...'];
let spellTimer = null, shownAt = 0;
function status(html){
  clearInterval(spellTimer); spellTimer = null;
  if (html.includes('spin')) { stage(2); sfx('summon'); say('Reading your letter'); shownAt = Date.now(); let i = 0; const draw = () => $('spell').textContent = SPELLS[i++ % SPELLS.length]; draw(); spellTimer = setInterval(draw, 1300); $('status').textContent = ''; }
  else { if (html) stage(1); $('status').innerHTML = html; }
}
$('go').onclick = () => { ctx(); run(); };
$('again').onclick = () => { stage(1); $('text').value = ''; $('inputCard').classList.remove('pasting'); pages = []; renderThumbs(); showQuality(); chosenSample = null; refresh(); $('status').textContent = ''; };

// tabs (arrow keys move between them)
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(name){
  if (name === 'verdict' && window.innerWidth >= 700) name = 'todo';
  tabs.forEach(x => { const on = x.dataset.pane === name; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + name));
}
tabs.forEach(t => {
  t.onclick = () => { selectTab(t.dataset.pane); sfx('tick'); fit(); };
  t.onkeydown = e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const vis = tabs.filter(x => x.offsetParent); let i = vis.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1); i = (i + vis.length) % vis.length; vis[i].focus(); vis[i].click(); };
});
window.addEventListener('resize', () => { const sel = tabs.find(t => t.getAttribute('aria-selected') === 'true'); if (sel) selectTab(sel.dataset.pane); });

// ---------- AI reading ----------
let samplePromise = null;
function getSample(){ if (!samplePromise) samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(()=>null) : Promise.resolve(null); return samplePromise; }
getSample();

function prompt(lang, text){
  return `You help ordinary people in Singapore understand official letters and messages (tax, CPF, HDB, town council, utilities, banks, debt collectors, courts, fines, employers, landlords) and spot scams.
Today's date is ${iso(today)}.
Read the letter ${text ? 'below' : 'in the attached photo(s); several photos are pages of the same letter, in order'} and reply with ONLY a JSON object, no other text, with these keys:
"letter_type": short name of the kind of letter, in Title Case,
"sender": who sent it, in plain words,
"summary": ONE or TWO short plain sentences a 12-year-old would understand: what it is and what happens if ignored,
"urgency": "low" (can ignore or no action), "medium" (handle within weeks) or "high" (act within days, money/legal risk),
"deadline": the most important deadline as "YYYY-MM-DD" or null if none,
"amount": amount of money involved as written (e.g. "$184.60") or null,
"deadline_quote": the full sentence from the letter that states the deadline, copied word for word or null,
"amount_quote": the full sentence from the letter that states the amount, copied word for word or null,
"actions": 2-5 short, concrete next steps in order,
"documents": things the person should have ready (may be empty),
"scam_risk": "low", "medium" or "high",
"scam_reasons": short reasons if scam_risk is not low (may be empty),
"needs_human": true if this involves court, legal action, large debt, immigration status or anything where a professional should check,
"human_reason": one short sentence if needs_human is true, else "",
"jargon": up to 5 confusing or scary words or phrases from the letter, each as {"term": the word exactly as written in the letter, "meaning": a plain explanation in one short sentence, "quote": the full sentence from the letter that contains the term, copied word for word in the letter's original language, "page": the page number it is on (1 if there is only one page)},
"scam_family": if scam_risk is not low, a short generic English label for the type of scam (e.g. "Fake parcel customs fee", "Fake bank account suspension"), else null,
"reply": a short, polite reply letter the person could send, with placeholders like [Your name]. Never admit liability or promise payment the person hasn't agreed to. If no reply is needed or it is a scam, say so in one sentence instead.
Write every human-readable value in ${lang}. Keep the JSON keys and the urgency/scam_risk values in English.
Never use em dashes or en dashes. Never put a comma before "and" or "or". Use normal sentence capitalisation in sentences.
Never tell the person they don't need to worry about a legal or debt letter.${text ? `\n\nLETTER:\n"""\n${text}\n"""` : ''}`;
}

async function run(){
  const text = $('text').value.trim();
  const lang = $('lang').value;
  $('go').disabled = true;
  status('<span class="spin"></span>Reading your letter…');
  let data = null;
  try {
    const sample = await getSample();
    const canUseCanned = chosenSample && lang === 'English';
    const imgs = pages.map(p => p.blob);
    if (sample && !canUseCanned) {
      const opts = { modelTier:'default' };
      if (imgs.length && !text) {
        const lim = await sample.limits?.().catch(()=>null);
        if (lim && !lim.images) throw {code:'no_images'};
        opts.images = imgs;
      }
      const r = await sample(prompt(lang, text), opts);
      data = parseJSON(r.text);
    } else if (chosenSample) {
      await new Promise(r => setTimeout(r, 700));
      data = structuredClone(SAMPLES[chosenSample].canned);
    } else {
      throw {code:'unavailable'};
    }
  } catch (e) {
    if (chosenSample) data = structuredClone(SAMPLES[chosenSample].canned);
    else {
      const msg = e && e.code === 'no_images' ? "Photos can't be read here yet. Please paste the letter's text instead."
        : e && e.code === 'rate_limited' ? 'Too many letters at once. Please wait a minute and try again.'
        : e && e.code === 'unavailable' ? 'Reading your own letters isn\u2019t switched on in this version yet. Try one of the sample letters.'
        : e && e.code === 'not_granted' ? 'Reading letters needs permission to use Claude. Allow it when asked or try a sample letter.'
        : "We couldn't read that letter. Try a clearer photo, paste the text or try a sample letter.";
      status(msg); refresh(); return;
    }
  }
  if (!data) { status("We couldn't make sense of that letter. Try a clearer photo or paste the text."); refresh(); return; }
  status(''); refresh();
  current = {text, images: (!text && pages.length) ? pages.map(p => p.blob) : null, lang}; show(applyChecks(data), true);
}
function parseJSON(t){
  if (!t) return null;
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) return null;
  try { return JSON.parse(t.slice(a, b+1)); } catch { return null; }
}

// ---------- rule checks (never trust the AI blindly) ----------
function applyChecks(d){
  const checks = [];
  const levels = ['low','medium','high'];
  d.actions = Array.isArray(d.actions) ? d.actions.filter(Boolean).slice(0,6) : [];
  d.documents = Array.isArray(d.documents) ? d.documents.filter(Boolean) : [];
  d.scam_reasons = Array.isArray(d.scam_reasons) ? d.scam_reasons : [];
  d.jargon = Array.isArray(d.jargon) ? d.jargon.filter(j => j && j.term && j.meaning).slice(0,5) : [];
  if (!levels.includes(d.urgency)) { d.urgency = 'medium'; checks.push(['bad','Urgency was unclear, so we set it to medium to be safe']); }
  else checks.push(['ok','Urgency level is valid']);
  if (!levels.includes(d.scam_risk)) d.scam_risk = 'low';

  d.days = null;
  if (d.deadline) {
    const m = /^\d{4}-\d{2}-\d{2}$/.test(d.deadline) ? new Date(d.deadline + 'T00:00:00') : null;
    if (!m || isNaN(m)) { checks.push(['bad',`Deadline "${d.deadline}" isn't a real date. Please check the letter yourself`]); d.deadline = null; }
    else {
      d.days = daysUntil(d.deadline);
      checks.push(['ok','Deadline is a real date']);
      if (d.days < 0) { checks.push(['bad','The deadline seems to have passed. Act today and contact the sender']); d.urgency = 'high'; }
      else if (d.days <= 7 && d.urgency !== 'high') { d.urgency = 'high'; checks.push(['bad','Deadline is within 7 days, so urgency was raised to high']); }
      else checks.push(['ok','Urgency matches the time left']);
    }
  } else checks.push(['ok','No deadline found. Double-check the letter for a date']);

  if (d.amount && !/\d/.test(String(d.amount))) { checks.push(['bad','Amount had no number in it, so we hid it']); d.amount = null; }
  else if (d.amount) checks.push(['ok','Amount contains a real number']);

  const serious = /court|summons|writ|legal|lawyer|bankrupt|immigration|ica|police|debt collect/i.test(`${d.letter_type} ${d.summary} ${d.sender}`);
  if (serious && !d.needs_human) { d.needs_human = true; d.human_reason = d.human_reason || 'This letter mentions legal or serious matters. A professional should check it.'; checks.push(['bad','Serious wording found, so we added the "talk to a person" advice']); }
  else checks.push(['ok','Checked for legal or serious wording']);

  if (d.scam_risk === 'high' && d.urgency === 'high') { d.urgency = 'medium'; checks.push(['bad','Likely scam. The real risk is paying, not the deadline, so urgency was lowered']); }
  d.checks = checks;
  return d;
}



// ---------- graveyard ----------
let yard = store.get('gr-yard', []);
let dbRef = null, userId = null;
(async () => {
  try {
    if (!(window.claude && window.claude.use)) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    userId = await user.id(); if (!userId) return;
    dbRef = db;
    const snap = await db.doc(`data/users/${userId}/graveyard`).get();
    if (snap.exists && Array.isArray(snap.data().items)) {
      const remote = snap.data().items, ids = new Set(remote.map(x => x.id));
      yard = [...remote, ...yard.filter(x => !ids.has(x.id))].sort((a,b) => b.savedAt - a.savedAt).slice(0, 15);
      store.set('gr-yard', yard); renderYard(); showTally();
    }
  } catch {}
})();
let saveTimer = null, saving = Promise.resolve();
function saveYard(){
  store.set('gr-yard', yard); showTally();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { if (!dbRef || !userId) return; const items = JSON.parse(JSON.stringify(yard)); saving = saving.then(() => dbRef.doc(`data/users/${userId}/graveyard`).set({ items })).catch(() => {}); }, 800);
}
function renderYard(){
  paintYardBadge();
  document.body.classList.toggle('hasyard', yard.length > 0);
  $('yard').hidden = !yard.length;
  const sorted = [...yard].sort((a, b) => yardRank(a) - yardRank(b));
  const haunting = yard.filter(isHaunting).length;
  $('yard').querySelector('.label').innerHTML = `${ic('tomb')}Your Graveyard${haunting ? ` <span class="hauntcount">· ${haunting} haunting you</span>` : ''}`;
  $('yardrow').innerHTML = sorted.slice(0, 6).map(it => {
    const d = it.d, dead = it.banished; let dl;
    if (dead) dl = '<span class="dl" style="color:var(--slime)">Banished</span>';
    else if (d.deadline) { const days = dleftOf(it); dl = `<span class="dl" style="color:${days <= 7 ? 'var(--blood)' : 'var(--amber)'}">${days < 0 ? 'Overdue' : days === 0 ? 'Today' : days + 'd left'}</span>`; }
    else dl = `<span class="dl" style="color:var(--muted)">${d.scam_risk === 'high' ? 'Scam' : 'No date'}</span>`;
    const haunt = isHaunting(it);
    return `<button class="stone ${dead ? 'dead' : ''} ${haunt ? 'haunt' : ''}" data-id="${it.id}" title="${esc(d.letter_type || 'Letter')}" aria-label="${esc(d.letter_type)}, ${dead ? 'banished' : haunt ? 'due very soon' : 'open'}"><div class="tomb"><span class="rip">${dead ? 'R.I.P.' : haunt ? 'Haunting' : 'Boo'}</span><span class="nm">${esc(d.letter_type || 'Letter')}</span>${dl}</div></button>`;
  }).join('');
  $('yardrow').querySelectorAll('.stone').forEach(b => b.onclick = () => { const it = yard.find(x => x.id === b.dataset.id); if (it) { current = it.ctx || null; shownAt = 0; show(it.d, false, it); } });
}
function clearYard(){ yard = []; saveYard(); renderYard(); renderYardSheet(); }
$('clearYard').onclick = $('clearYard2').onclick = clearYard;
const dleftOf = it => daysUntil(it.d.deadline);
// most urgent first: by days left, then scams, then letters with no date, banished last
const yardRank = it => it.banished ? 1e6 : dleftOf(it) !== null ? dleftOf(it) : it.d.scam_risk === 'high' ? 5e5 : 4e5;
// open letters due within 3 days (or overdue) haunt you
const isHaunting = it => !it.banished && dleftOf(it) !== null && dleftOf(it) <= 3;
function yardStatus(it){
  const n = dleftOf(it);
  if (it.banished) return ['Banished', 'var(--slime)'];
  if (n !== null && n < 0) return ['Overdue', 'var(--blood)'];
  if (n !== null && n <= 3) return [n === 0 ? 'Due Today' : `Haunting · ${n}d`, 'var(--blood)'];
  if (n !== null) return [`${n} Days Left`, n <= 7 ? 'var(--blood)' : 'var(--amber)'];
  if (it.d.scam_risk === 'high') return ['Scam', 'var(--hex)'];
  return ['No Deadline', 'var(--muted)'];
}
function renderYardSheet(){
  const sorted = [...yard].sort((a, b) => yardRank(a) - yardRank(b));
  $('yardList').innerHTML = sorted.length ? sorted.map(it => {
    const [label, col] = yardStatus(it), haunt = isHaunting(it);
    return `<button class="yrow ${it.banished ? 'dead' : ''} ${haunt ? 'haunt' : ''}" data-id="${it.id}"><span class="mini"></span><span class="info"><b>${esc(it.d.letter_type || 'Letter')}</b><small>${esc(it.d.sender ? clean(it.d.sender) : '')}</small></span><span class="pill" style="color:${col}">${label}</span></button>`;
  }).join('')
  : `<div class="yempty">${ic('tomb')}<br>No letters yet. Read one and it will rest here.</div>`;
  $('clearYard2').hidden = !sorted.length;
  $('yardList').querySelectorAll('.yrow').forEach(b => b.onclick = () => { const it = yard.find(x => x.id === b.dataset.id); if (it) { closeOverlay($('yardSheet')); current = it.ctx || null; shownAt = 0; show(it.d, false, it); } });
}
function paintYardBadge(){
  const haunting = yard.filter(isHaunting).length;
  $('yardBadge').hidden = !haunting; $('yardBadge').textContent = haunting;
  $('yardBtn').setAttribute('aria-label', haunting ? `Your Graveyard, ${haunting} letter${haunting === 1 ? '' : 's'} due very soon` : 'Your Graveyard');
}
$('yardBtn').onclick = () => { renderYardSheet(); openOverlay('yardSheet'); };
const getTally = () => yard.filter(x => x.banished).length;
function showTally(){ const n = getTally(); $('tally').textContent = n ? `You've banished ${n} letter${n === 1 ? '' : 's'} so far.` : 'Not legal or financial advice.'; document.querySelector('.foot').classList.toggle('notally', !n); }

// ---------- scam radar ----------
async function scamRadar(item){
  const fam = String(item.d.scam_family || '').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim().slice(0, 80);
  const line = $('radarLine');
  if (!fam || !line || !window.claude || !window.claude.use) return;
  try {
    const db = await window.claude.use('db'); if (!db) return;
    const col = db.collection('scamReports');
    if (!item.reported) { await col.add({ family: fam, at: Date.now() }); item.reported = true; saveYard(); }
    const snap = await col.where('family', '==', fam).limit(1000).get();
    const week = snap.docs.filter(s => (s.data().at || 0) > Date.now() - 7 * 864e5).length;
    if (currentItem !== item) return;
    line.innerHTML = `${ic('radar')}<span><b>Scam Radar:</b> ${week > 1 ? `reported ${week} times this week` : 'first report this week. Thanks for warning others'}.</span>`;
    line.hidden = false; fit();
  } catch {}
}

// ---------- read aloud: best natural voice on the device, read sentence by sentence ----------
const VOICE_LANG = {'English':'en','简体中文 (Chinese)':'zh','Bahasa Melayu':'ms','தமிழ் (Tamil)':'ta','Bahasa Indonesia':'id','Tagalog':'fil','Tiếng Việt':'vi','বাংলা (Bengali)':'bn','မြန်မာ (Burmese)':'my'};
const canSpeak = 'speechSynthesis' in window;
let voices = [];
const loadVoices = () => { voices = canSpeak ? speechSynthesis.getVoices() : []; };
if (canSpeak) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function voiceScore(v, code){
  const lang = v.lang.toLowerCase().replace('_','-'), name = v.name.toLowerCase();
  if (!(lang.startsWith(code) || (code === 'fil' && lang.startsWith('tl')))) return -1;
  let s = 0;
  if (/natural|neural/.test(name)) s += 60;          // Edge and Windows AI voices
  if (/premium|enhanced|siri/.test(name)) s += 45;   // Apple's higher quality voices
  if (/google/.test(name)) s += 30;                  // Chrome's online voices
  if (/online/.test(name)) s += 15;
  if (!v.localService) s += 8;
  if (/compact|espeak|robot|novelty|whisper|zarvox|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|albert|fred|junior|ralph/.test(name)) s -= 80;
  if (code === 'en') s += lang === 'en-sg' ? 12 : lang === 'en-gb' ? 10 : lang === 'en-au' ? 8 : lang === 'en-us' ? 6 : 0;
  if (v.default) s += 2;
  return s;
}
function bestVoice(langName){
  const code = VOICE_LANG[langName] || 'en';
  return voices.map(v => [voiceScore(v, code), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1])[0] || null;
}
let speakRun = 0;
function clearReading(){ document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading')); }
function stopSpeaking(){ speakRun++; if (canSpeak) speechSynthesis.cancel(); clearReading(); setSpeakBtn(false); }
function setSpeakBtn(on){ const b = $('speak'); b.setAttribute('aria-pressed', on); b.innerHTML = ic(on ? 'square' : 'volume-2') + `<span>${on ? 'Stop' : 'Listen'}</span>`; }
const sentences = s => String(s).split(/(?<=[.!?])\s+(?=\S)|(?<=[。！？])/).map(x => x.trim()).filter(Boolean);
function speakParts(parts, langName){
  if (!canSpeak) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) { stopSpeaking(); return; }
  if (!voices.length) loadVoices();
  const run = ++speakRun, v = bestVoice(langName), code = VOICE_LANG[langName] || 'en';
  $('speak').title = v ? `Voice: ${v.name}` : 'Voice: device default';
  setSpeakBtn(true);
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p.text);
    if (v) u.voice = v; u.lang = v ? v.lang : code; u.rate = .96; u.pitch = .95;
    u.onstart = () => { if (run !== speakRun) return; clearReading(); if (p.el) p.el.classList.add('reading'); };
    u.onend = u.onerror = () => { if (run !== speakRun) return; if (i === parts.length - 1) { clearReading(); setSpeakBtn(false); } };
    speechSynthesis.speak(u);
  });
}

// ---------- ask ----------
let chat = [];
function renderChat(){
  const keep = $('suggest'); if (keep.parentElement !== $('pane-ask')) $('pane-ask').insertBefore(keep, $('askForm')); // rescue before the chat is redrawn
  const recent = chat.slice(-4);
  $('chat').innerHTML = chat.length
    ? (chat.length > 4 ? '<p class="note" style="color:var(--muted);text-align:center">Earlier messages hidden</p>' : '') + recent.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'reaper'}">${esc(m.content) || '<span class="candle" style="display:inline-block"></span>'}</div>`).join('')
    : `<div class="chatempty">${ic('message-circle-question')}<b>Ask the Grim Reader</b><span>Anything about this letter, in your language.</span></div>`;
  const sug = $('suggest'), empty = $('chat').querySelector('.chatempty');
  if (empty) { empty.appendChild(sug); sug.style.display = 'flex'; } else { sug.style.display = 'none'; $('pane-ask').insertBefore(sug, $('askForm')); }
}
async function ask(q){
  q = q.trim(); if (!q) return;
  const sample = await getSample();
  if (!sample) { $('askNote').textContent = 'Asking questions needs Claude to be available in this view.'; return; }
  const d = currentItem.d, lang = (current && current.lang) || 'English';
  chat.push({role:'user', content:q}, {role:'assistant', content:''}); renderChat();
  $('askBtn').disabled = true; $('askInput').value = ''; $('askNote').textContent = '';
  const ctxText = `You are the Grim Reader, a kind, calm helper who explains official letters to ordinary people in Singapore. Answer questions about ONE letter. Be short (under 80 words), plain and practical. Reply in ${lang}. Never use em dashes. Never put a comma before "and" or "or". If something is uncertain or legal, say so and suggest the free help (Legal Aid Bureau, Community Justice Centre, Credit Counselling Singapore, ScamShield). Never invent facts not in the letter.\n\nWHAT WE ALREADY TOLD THEM:\n${JSON.stringify({type:d.letter_type, sender:d.sender, summary:d.summary, deadline:d.deadline, amount:d.amount, actions:d.actions, scam_risk:d.scam_risk})}\n${current && current.text ? `\nTHE LETTER:\n"""\n${current.text}\n"""` : current && current.images ? '\nThe letter is in the attached photo(s).' : ''}`;
  const msgs = chat.slice(0, -1).map((m, i) => ({ role: m.role, content: i === 0 ? `${ctxText}\n\nQUESTION: ${m.content}` : m.content }));
  const opts = { modelTier:'default', cache:false, onText: ({text}) => { chat[chat.length-1].content = text; renderChat(); } };
  if (current && current.images && !current.text) opts.images = current.images;
  try { const r = await sample(msgs, opts); chat[chat.length-1].content = r.text; say('The Grim Reader answered'); }
  catch (e) { chat.pop(); chat.pop(); $('askNote').textContent = e && e.code === 'rate_limited' ? 'Too many questions at once. Please wait a moment.' : 'The Grim Reader could not answer that. Please try again.'; }
  renderChat(); $('askBtn').disabled = false;
}
$('askForm').onsubmit = e => { e.preventDefault(); ask($('askInput').value); };
document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => ask(b.dataset.q));

// ---------- reminders ----------
let dl = null;
(async () => { try { if (window.claude && window.claude.use) dl = await window.claude.use('downloads'); } catch {} })();
function icsFor(d){
  const pad = s => String(s).replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const start = d.deadline.replace(/-/g,''), e = new Date(d.deadline+'T00:00:00'); e.setDate(e.getDate()+1);
  const stamp = new Date().toISOString().replace(/[-:]/g,'').slice(0,15) + 'Z';
  const before = d.days >= 3 ? '-P3D' : d.days >= 1 ? '-P1D' : '-PT2H';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Grim Reader//EN','BEGIN:VEVENT',`UID:${Date.now()}@grimreader`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${iso(e).replace(/-/g,'')}`,`SUMMARY:${pad('Deadline: ' + clean(d.letter_type || 'letter'))}`,`DESCRIPTION:${pad(clean(d.summary) + '\n\nTo do:\n- ' + d.actions.map(clean).join('\n- '))}`,'BEGIN:VALARM',`TRIGGER:${before}`,'ACTION:DISPLAY',`DESCRIPTION:${pad('Grim Reader: ' + clean(d.letter_type || 'letter') + ' is due soon')}`,'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
}

// ---------- show ----------
const SPIRITS = {
  low:   {c:'#8be36a', name:'Friendly Ghost'},
  medium:{c:'#f5c04a', name:'Restless Spirit'},
  high:  {c:'#ff5a69', name:'Poltergeist'},
  scam:  {c:'#b78cff', name:'Imposter!'}
};
const DARK = {'#8be36a':'#2f7a12','#f5c04a':'#8a6400','#ff5a69':'#b3122a','#b78cff':'#5a2fb0'};
function plainLine(d, scam){
  if (scam) return 'Don’t pay or click anything';
  const n = d.days;
  if (n !== null && n < 0) return 'Deadline passed, act today';
  if (d.urgency === 'high') return n === null ? 'Act within days' : n === 0 ? 'Act today' : `Act within ${n} day${n === 1 ? '' : 's'}`;
  if (d.urgency === 'medium') return n === null ? 'Handle in the next few weeks' : `Handle within ${n} days`;
  return 'No rush, nothing scary here';
}
const reaperSVG = (eye, mood) => {
  const eyes = mood === 'low' ? `<path d="M31 42q4-5 8 0M45 42q4-5 8 0" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : mood === 'high' ? `<circle cx="35" cy="43" r="3.6" fill="${eye}"/><circle cx="49" cy="43" r="3.6" fill="${eye}"/><path d="M30 36l8 3M54 36l-8 3" stroke="${eye}" stroke-width="2.5" stroke-linecap="round"/>`
    : mood === 'scam' ? `<circle cx="35" cy="43" r="3.6" fill="${eye}"/><circle cx="49" cy="43" r="3.6" fill="${eye}"/><path d="M45 35l9-2" stroke="${eye}" stroke-width="2.5" stroke-linecap="round"/>`
    : `<circle cx="35" cy="43" r="3.6" fill="${eye}"/><circle cx="49" cy="43" r="3.6" fill="${eye}"/>`;
  return `<svg class="reaper" viewBox="0 0 84 90" aria-hidden="true"><path d="M77 10v78" stroke="#8a7fa6" stroke-width="3" stroke-linecap="round"/><path d="M77 10Q58-1 40 8q20-2 37 10z" fill="#cfc4e6"/><path d="M42 6C22 6 12 24 12 46l-4 40h68l-4-40C72 24 62 6 42 6z" fill="#2a2140" stroke="#5c5078" stroke-width="1.5"/><ellipse cx="42" cy="42" rx="15" ry="17" fill="#07050c"/>${eyes}<path d="M24 86c4-14 10-20 18-20s14 6 18 20" fill="#1f1830"/><circle cx="42" cy="74" r="7" fill="#b3202f"/><circle cx="40" cy="73" r="1.2" fill="#f3d6c8"/><circle cx="44" cy="73" r="1.2" fill="#f3d6c8"/></svg>`;
};
const miniGhost = c => `<svg viewBox="0 0 84 84" aria-hidden="true"><path d="M14 78V38a28 28 0 0 1 56 0v40l-9-7-9 7-10-7-10 7-9-7z" fill="${c}"/><ellipse cx="33" cy="40" rx="6" ry="7" fill="#2e2213"/><ellipse cx="51" cy="40" rx="6" ry="7" fill="#2e2213"/></svg>`;
const clean = s => String(s ?? '').replace(/\s*[\u2014\u2013]\s*/g, ', ').replace(/,(\s+)(and|or|y|o|dan|atau|at|o kaya)\b/gi, '$1$2');
const esc = s => clean(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtDate = s => new Date(s+'T00:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
function whereInLetter(j, text){
  let quote = '', start = -1;
  if (text) {
    const low = text.toLowerCase(); let term = j.term.toLowerCase(); let i = low.indexOf(term);
    if (i < 0) { const w = term.split(/\s+/).sort((a, b) => b.length - a.length)[0]; i = w && w.length > 3 ? low.indexOf(w) : -1; }
    if (i >= 0) {
      let a = i, b = i;
      while (a > 0 && !/[.!?\n]/.test(text[a - 1])) a--;
      while (b < text.length && !/[.!?\n]/.test(text[b])) b++;
      if (b < text.length && /[.!?]/.test(text[b])) b++;
      quote = text.slice(a, b).trim(); start = i - a - (text.slice(a, b).length - text.slice(a, b).trimStart().length);
    }
  }
  if (!quote && j.quote) quote = String(j.quote).trim();
  if (!quote) return '';
  if (quote.length > 220) { const c = Math.max(0, (start >= 0 ? start : quote.toLowerCase().indexOf(j.term.toLowerCase())) - 90); quote = (c > 0 ? '...' : '') + quote.slice(c, c + 200) + '...'; }
  const safe = esc(quote), t = esc(j.term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hit = new RegExp(t, 'i');
  return hit.test(safe) ? safe.replace(hit, m => `<mark>${m}</mark>`) : safe;
}
function dateForms(iso){
  const [y, m, dd] = iso.split('-').map(Number), M = MONTHS[m - 1], S = M.slice(0, 3);
  const p = n => String(n).padStart(2, '0');
  return [iso, `${dd} ${M} ${y}`, `${p(dd)} ${M} ${y}`, `${dd} ${S} ${y}`, `${p(dd)} ${S} ${y}`, `${M} ${dd}, ${y}`, `${S} ${dd}, ${y}`, `${p(dd)}/${p(m)}/${y}`, `${dd}/${m}/${y}`, `${p(dd)}.${p(m)}.${y}`, `${dd} ${M}`, `${dd} ${S}`];
}
function whereFor(kind, d, text){
  const quote = kind === 'deadline' ? d.deadline_quote : d.amount_quote;
  const terms = kind === 'deadline' ? dateForms(d.deadline) : [String(d.amount).replace(/\s*\(.*\)/,'').trim(), String(d.amount).replace(/[^0-9.,]/g,'')];
  const low = (text || '').toLowerCase();
  for (const term of terms) if (term && low.includes(term.toLowerCase())) return whereInLetter({ term, quote }, text);
  if (quote) { for (const term of terms) if (term && String(quote).toLowerCase().includes(term.toLowerCase())) return whereInLetter({ term, quote }, ''); return esc(quote); }
  return '';
}
function redact(s){
  let n = 0; const hit = r => { n++; return r; };
  s = s.replace(/\b[STFGM]\d{7}[A-Z]\b/gi, () => hit('[ID hidden]'));
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, m => hit('•••' + m.slice(m.indexOf('@'))));
  s = s.replace(/\b(?:\d[ -]?){10,19}\b/g, m => hit('••••' + m.replace(/\D/g,'').slice(-4)));
  s = s.replace(/\b(account|acct|a\/c|card|policy|ref(?:erence)?|no\.?|number)(\s*(?:no\.?|number)?\s*[:#]?\s*)(\d[\d -]{6,}\d)/gi, (m, a, b, num) => hit(a + b + '••••' + num.replace(/\D/g,'').slice(-4)));
  s = s.replace(/#\d{1,3}-\d{1,5}\b/g, () => hit('#••-•••'));
  s = s.replace(/\b(Singapore\s*|S\s?\()\d{6}\)?/gi, () => hit('Singapore ••••••'));
  return { text: s, n };
}

async function show(d, fresh, item){
  const wait = 2600 - (Date.now() - shownAt); if (fresh && wait > 0) await new Promise(r => setTimeout(r, wait));
  d.days = daysUntil(d.deadline);
  if (fresh) {
    item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), savedAt: Date.now(), d, done: [], banished: false, ctx: current && current.text ? { text: current.text, lang: current.lang, pages: 1 } : { lang: current && current.lang, pages: current && current.images ? current.images.length : 1 } };
    yard.unshift(item); yard = yard.slice(0, 15); saveYard();
  }
  if (item !== currentItem) chat = [];
  currentItem = item;
  const scam = d.scam_risk === 'high', s = SPIRITS[scam ? 'scam' : d.urgency];
  $('result').style.setProperty('--u', s.c);
  $('reaper').style.setProperty('--glow', s.c);
  $('reaper').innerHTML = reaperSVG(s.c, scam ? 'scam' : d.urgency);
  $('kind').innerHTML = miniGhost(s.c) + `<span>${s.name}</span>`; $('kind').style.color = DARK[s.c];
  $('plain').textContent = plainLine(d, scam);
  $('summary').innerHTML = sentences(clean(d.summary)).map(x => `<span class="sent">${esc(x)}</span>`).join(' ');
  $('ltype').textContent = clean(d.letter_type || 'Your letter');
  $('lsender').textContent = d.sender ? (/^(claims|pretends|says)/i.test(d.sender) ? clean(d.sender) : 'From ' + clean(d.sender)) : '';

  const risk = {low:['Low','Looks genuine','check','var(--slime)'], medium:['Medium','Double-check it','shield-alert','var(--amber)'], high:['High','Likely a scam','shield-alert','var(--blood)']}[d.scam_risk];
  const letterText = (item.ctx && item.ctx.text) || (current && current.text) || '';
  const dlWhere = d.deadline ? whereFor('deadline', d, letterText) : '', amWhere = d.amount ? whereFor('amount', d, letterText) : '';
  const tileTag = (w, kind) => w ? `button class="tile" type="button" data-where="${kind}" aria-label="Show where the letter says the ${kind}"` : 'div class="tile"';
  const tileEnd = w => w ? 'button' : 'div';
  $('tiles').innerHTML = [
    `<${tileTag(dlWhere,'deadline').replace('class="tile"', `class="tile${d.deadline ? ' due' : ''}"`)}><span class="t">${ic('hourglass')}Deadline</span><b>${d.deadline ? (d.days < 0 ? 'Passed' : d.days === 0 ? 'Today' : `${d.days}<span class="unit"> day${d.days === 1 ? '' : 's'}</span>`) : 'None'}</b><small>${d.deadline ? esc(fmtDate(d.deadline)) : ''}</small>${dlWhere ? `<span class="where">${ic('eye')}Where?</span>` : ''}</${tileEnd(dlWhere)}>`,
    `<${tileTag(amWhere,'amount')}><span class="t">${ic('coins')}Amount</span><b>${d.amount ? esc(String(d.amount).replace(/\s*\(.*\)/,'')) : 'None'}</b>${scam ? '<small>Do not pay</small>' : ''}${amWhere ? `<span class="where">${ic('eye')}Where?</span>` : ''}</${tileEnd(amWhere)}>`,
    `<div class="tile"><span class="t">${ic(risk[2])}Scam Risk</span><b style="color:${risk[3]}">${risk[0]}</b></div>`].join('');

  $('tiles').querySelectorAll('[data-where]').forEach(b => b.onclick = () => {
    const kind = b.dataset.where;
    $('whereIntro').textContent = kind === 'deadline' ? `The deadline: ${fmtDate(d.deadline)}` : `The amount: ${clean(d.amount)}`;
    $('whereBody').innerHTML = `<div class="wwhere"><span class="label">${ic('file-text')}In Your Letter</span><blockquote>${kind === 'deadline' ? dlWhere : amWhere}</blockquote></div>`;
    openOverlay('whereSheet');
  });
  const w = [];
  const scamBox = `<div class="warn scam${scam ? ' banner' : ''}" id="scamBox">${ic('shield-alert')}<div><b>${scam ? 'Likely scam.' : 'Why it smells like a scam:'}</b> <span class="reasons">${d.scam_reasons.slice(0,3).map(esc).join(' · ')}</span><div class="radarline" id="radarLine" hidden></div></div></div>`;
  $('banner').innerHTML = scam && d.scam_reasons.length ? scamBox : '';
  if (!scam && d.scam_risk !== 'low' && d.scam_reasons.length) w.push(scamBox);
  else if (d.scam_risk === 'medium' && !d.scam_reasons.length) w.push(`<div class="warn scam" id="scamBox">${ic('shield-alert')}<div><b>This might be a scam.</b> Check with the real organisation first.<div class="radarline" id="radarLine" hidden></div></div></div>`);
  if (d.needs_human) w.push(`<div class="warn human">${ic('scale')}<div><b>Get a real person to check this.</b> <button class="inlinebtn" type="button" data-open-help>Open Free Help${ic('arrow-right')}</button></div></div>`);
  $('warns').innerHTML = w.join('');
  $('warns').querySelectorAll('[data-open-help]').forEach(b => b.onclick = () => { selectTab('help'); fit(); const t = document.querySelector('.tab[data-pane="help"]'); if (t) t.focus(); });
  if (d.scam_risk !== 'low') scamRadar(item);

  const jargon = d.jargon || [];
  $('wordsBtn').hidden = !jargon.length;
  $('wordsBtn').setAttribute('aria-label', `Decode ${jargon.length} scary words`); $('wordsBtn').querySelector('span').textContent = 'Words';
  document.querySelector('.actions').style.gridTemplateColumns = `repeat(${[canSpeak, true, jargon.length > 0].filter(Boolean).length}, minmax(0, 1fr))`;
  const pick = i => {
    $('wordchips').querySelectorAll('.chip').forEach((c, k) => c.setAttribute('aria-selected', k === i));
    const j = jargon[i], where = whereInLetter(j, letterText), multi = item.ctx && item.ctx.pages > 1;
    $('worddetail').innerHTML = `<b class="wterm">${esc(j.term)}</b><p class="wmean">${esc(j.meaning)}</p>`
      + (where ? `<div class="wwhere"><span class="label">${ic('file-text')}Where It Is${multi && j.page ? ` · Page ${+j.page}` : ''}</span><blockquote>${where}</blockquote></div>`
               : `<div class="wwhere"><span class="label">${ic('file-text')}Where It Is</span><p class="wmiss">Look for "${esc(j.term)}"${multi && j.page ? ` on page ${+j.page}` : ''} in your letter.</p></div>`);
  };
  $('wordchips').innerHTML = jargon.map((j, i) => `<button class="chip" role="tab" aria-selected="false">${esc(j.term)}</button>`).join('');
  $('wordchips').querySelectorAll('.chip').forEach((c, i) => c.onclick = () => pick(i));
  $('wordsBtn').onclick = () => { pick(0); openOverlay('wordsSheet'); };

  const items = [...d.actions, ...d.documents.map(x => `Have ready: ${x}`)].slice(0, 7);
  $('todo').innerHTML = items.map((a,i) => `<li role="checkbox" aria-checked="${!!item.done[i]}" tabindex="0" class="${item.done[i] ? 'done' : ''}"><span class="box">${ic('check')}</span><span class="txt">${esc(redact(a).text)}</span></li>`).join('');
  $('banished').classList.remove('on');
  const update = fromClick => {
    refit();
    const all = [...$('todo').children], done = all.filter(li => li.classList.contains('done')).length;
    $('fill').style.width = (all.length ? done / all.length * 100 : 0) + '%';
    $('progTxt').textContent = `${done} of ${all.length} done`;
    const finished = all.length && done === all.length;
    $('banishedTxt').textContent = scam ? 'Imposter banished! It can’t haunt you anymore.' : 'Letter banished! It can’t haunt you anymore.';
    if (finished) { $('banished').classList.add('on'); if (fromClick && !item.banished) { batBurst(); sfx('banish'); say('Letter banished'); try { navigator.vibrate && navigator.vibrate([40, 60, 40]); } catch {} } }
    else $('banished').classList.remove('on');
    const next = all.findIndex(li => !li.classList.contains('done'));
    $('first').hidden = next < 0;
    if (next >= 0) { $('firstTxt').textContent = redact(items[next]).text; $('firstDue').innerHTML = `${ic('list-checks')}Step ${next + 1} of ${items.length}`; $('firstDone').onclick = () => all[next].click(); }
    if (item.banished !== !!finished) { item.banished = !!finished; if (fromClick) saveYard(); }
  };
  $('todo').querySelectorAll('li').forEach((li, i) => {
    const toggle = () => { li.classList.toggle('done'); li.setAttribute('aria-checked', li.classList.contains('done')); item.done[i] = li.classList.contains('done'); if (li.classList.contains('done')) sfx('tick'); update(true); saveYard(); };
    li.onclick = toggle; li.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
  });
  update(false);

  $('remind').innerHTML = '';
  if (d.deadline && d.days >= 0) {
    const e = new Date(d.deadline+'T00:00:00'); e.setDate(e.getDate()+1);
    const details = `${clean(d.summary)}\n\nTo do:\n- ${d.actions.map(clean).join('\n- ')}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Deadline: ' + clean(d.letter_type || 'letter'))}&dates=${d.deadline.replace(/-/g,'')}/${iso(e).replace(/-/g,'')}&details=${encodeURIComponent(details)}`;
    $('remind').innerHTML = `<div class="remindcard"><span class="ri">${ic('bell')}</span><div class="rt"><b>Don't miss ${esc(fmtDate(d.deadline))}</b><small>Add a reminder to your calendar</small></div><div class="rb">${dl ? `<button class="sec" id="ics">${ic('bell')}Remind Me ${d.days >= 3 ? '3 Days' : '1 Day'} Before</button>` : ''}<a class="btn sm" href="${url}" target="_blank" rel="noopener">${ic('calendar-plus')}Add to Calendar</a></div></div>`;
    if (dl) $('ics').onclick = async () => { try { await dl.save({ filename: 'grim-reader-deadline.ics', data: icsFor(d) }); $('ics').innerHTML = ic('check') + 'Reminder Saved'; } catch {} };
  }

  const shareText = `Grim Reader checked a letter for me.\n\n${clean(d.letter_type)}${d.sender ? ' from ' + clean(d.sender) : ''}\n${clean(d.summary)}${d.deadline ? `\nDeadline: ${fmtDate(d.deadline)}` : ''}${d.amount ? `\nAmount: ${clean(d.amount)}` : ''}${scam ? '\nThis looks like a scam.' : ''}\n\nTo do:\n- ${d.actions.map(clean).join('\n- ')}${d.documents.length ? `\n\nHave ready:\n- ${d.documents.map(clean).join('\n- ')}` : ''}`;
  const safe = redact(shareText), safeText = safe.text + (safe.n ? `\n\n(Grim Reader hid ${safe.n} personal detail${safe.n === 1 ? '' : 's'}.)` : '');
  const enc = encodeURIComponent(safeText), subj = encodeURIComponent('Grim Reader: ' + clean(d.letter_type || 'a letter'));
  const opts = [
    { id: 'wa', name: 'WhatsApp', icon: 'message-circle', col: '#25d366', href: 'https://wa.me/?text=' + enc },
    { id: 'tg', name: 'Telegram', icon: 'send', col: '#2aabee', href: 'https://t.me/share/url?url=' + encodeURIComponent(' ') + '&text=' + enc },
    { id: 'em', name: 'Email', icon: 'mail', col: '#f5c04a', href: 'mailto:?subject=' + subj + '&body=' + enc, fallback: true },
    { id: 'sm', name: 'Text Message', icon: 'smartphone', col: '#b78cff', href: 'sms:?&body=' + enc, fallback: true },
    { id: 'cp', name: 'Copy Text', icon: 'copy', col: '#e8e0f5' }
  ];
  $('shareOpts').innerHTML = opts.map(o => o.href
    ? `<a class="shareopt" href="${o.href}" target="_blank" rel="noopener" data-opt="${o.id}"><span class="si" style="--sc:${o.col}">${ic(o.icon)}</span>${o.name}</a>`
    : `<button class="shareopt" type="button" data-opt="${o.id}"><span class="si" style="--sc:${o.col}">${ic(o.icon)}</span><span>${o.name}</span></button>`).join('');
  $('sharePreview').textContent = safeText; $('shareNote').textContent = '';
  $('shareOpts').querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
    if (b.dataset.opt === 'cp') { copy(safeText, b.querySelector('span:last-child')); return; }
    if (opts.find(o => o.id === b.dataset.opt).fallback) $('shareNote').textContent = 'If nothing opened, use Copy Text and paste it into your email or messages.';
  });
  $('share').onclick = () => openOverlay('shareSheet');
  $('shareIntro').textContent = safe.n ? `Choose how to send it or copy it. ${safe.n} personal detail${safe.n === 1 ? ' like an account number is' : 's like account numbers are'} hidden for you.` : 'Choose how to send it or copy it. Personal details are hidden for you.';
  $('speak').hidden = !canSpeak; setSpeakBtn(false);
  $('speak').onclick = () => {
    const sents = [...$('summary').querySelectorAll('.sent')];
    const parts = [{ text: plainLine(d, scam) + '.', el: $('plain') }, ...sents.map(el => ({ text: el.textContent, el }))];
    const steps = d.actions.map(clean);
    const lang = (item.ctx && item.ctx.lang) || 'English', en = lang === 'English';
    const low = s => s.charAt(0).toLowerCase() + s.slice(1);
    if (steps.length) parts.push(...steps.map((s, k) => ({ el: $('first'), text: !en ? s : k === 0 ? (steps.length > 1 ? 'Here is what to do. First, ' : 'Here is what to do. ') + low(s) : (k === steps.length - 1 ? 'Finally, ' : 'Then, ') + low(s) })));
    speakParts(parts, lang);
  };

  $('victoryBtn').onclick = () => openVictory(d, scam ? SPIRITS.scam : SPIRITS[d.urgency]);
  $('reply').textContent = clean(d.reply);
  const hasReply = !scam && clean(d.reply).includes('\n');
  $('replyPeek').hidden = !hasReply;
  $('replyPeekTxt').textContent = hasReply ? clean(d.reply).replace(/\s+/g, ' ').slice(0, 150) + '…' : '';
  $('replyPeek').onclick = () => { selectTab('reply'); fit(); };
  $('copy').onclick = () => copy($('reply').innerText, $('copy'));
  const passed = d.checks.filter(c => c[0] === 'ok').length;
  $('checksSum').innerHTML = `${ic('sparkles')}${passed} of ${d.checks.length} safety checks passed`;
  $('checksSum').title = d.checks.map(c => (c[0] === 'ok' ? '✓ ' : '! ') + c[1]).join('\n');

  renderChat(); $('askNote').textContent = '';
  selectTab('verdict');
  stage(3); fit();
  if (fresh) sfx('reveal');
  say(`${plainLine(d, scam)}. ${clean(d.summary)}`);
}
// ---------- fit: tighten spacing until nothing is cut off ----------
function overflowing(){
  const card = document.querySelector('.screen.on .card'); if (!card) return false;
  if (card.getBoundingClientRect().bottom > window.innerHeight + 2) return true;
  const zones = [card, ...card.querySelectorAll('.pane.on, .drop, .side, .rbody')];
  // Compare real child boxes with each zone's inner bottom. scrollHeight would also count the
  // invisible touch tap areas (::after with a negative inset) and push every phone to the last level.
  const kids = el => [...el.children].flatMap(c => getComputedStyle(c).display === 'contents' ? kids(c) : [c]);
  return zones.some(z => {
    if (!z.offsetParent) return false;
    const cs = getComputedStyle(z), limit = z.getBoundingClientRect().bottom - parseFloat(cs.borderBottomWidth) - parseFloat(cs.paddingBottom) + 2;
    return kids(z).some(c => c.offsetParent && c.getBoundingClientRect().bottom > limit);
  });
}
function fit(){
  const b = document.body; b.classList.remove('fit1', 'fit2', 'fit3', 'fit4');
  for (const lvl of ['fit1', 'fit2', 'fit3', 'fit4']) { if (!overflowing()) return; b.classList.add(lvl); }
}
let fitTimer = null;
const refit = () => { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 60); };
window.addEventListener('resize', refit);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
// ---------- victory card ----------
async function openVictory(d, s){
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const g = c.getContext('2d');
  try { await document.fonts.load('80px Creepster'); await document.fonts.load('40px "IM Fell English"'); } catch {}
  const bg = g.createLinearGradient(0, 0, 0, 1080); bg.addColorStop(0, '#1d1430'); bg.addColorStop(1, '#0b0912'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = 'rgba(255,255,255,.6)'; [[120,140],[300,90],[520,180],[760,110],[930,260],[180,420],[880,470]].forEach(([x,y]) => { g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); });
  const moon = g.createRadialGradient(948, 108, 6, 960, 120, 66); moon.addColorStop(0, '#fff7dc'); moon.addColorStop(1, '#c9b06a'); g.fillStyle = moon; g.beginPath(); g.arc(960, 120, 58, 0, 7); g.fill();
  g.fillStyle = '#120d1c'; g.beginPath(); g.ellipse(540, 1080, 760, 260, 0, Math.PI, 0); g.fill();
  // tombstone
  g.fillStyle = '#3a3150'; g.strokeStyle = '#6a5c86'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(330, 900); g.lineTo(330, 520); g.arc(540, 520, 210, Math.PI, 0); g.lineTo(750, 900); g.closePath(); g.fill(); g.stroke();
  g.textAlign = 'center'; g.fillStyle = '#e4dbf5'; g.font = '84px Creepster, serif'; g.fillText('R.I.P.', 540, 520);
  g.font = '40px "IM Fell English", serif'; g.fillStyle = '#d8cdef';
  const words = clean(d.letter_type || 'A scary letter').split(' '); let line = '', y = 600; const lines = [];
  words.forEach(w => { const tryL = line ? line + ' ' + w : w; if (g.measureText(tryL).width > 360) { lines.push(line); line = w; } else line = tryL; }); lines.push(line);
  lines.slice(0, 3).forEach(l => { g.fillText(l, 540, y); y += 50; });
  g.font = '30px Inter, sans-serif'; g.fillStyle = s.c; g.fillText('Banished ' + new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), 540, 840);
  g.font = '64px Creepster, serif'; g.fillStyle = '#ff7a1a'; g.fillText(`I banished a ${s.name.replace('!', '')}!`, 540, 245);
  g.font = '34px Inter, sans-serif'; g.fillStyle = '#e8e0f5'; const foot = 'Scary letters, explained. Grim Reader'; const fw = g.measureText(foot).width; g.fillText(foot, 540 + 40, 1010);
  const logo = new Image(); logo.src = 'data:image/svg+xml,' + encodeURIComponent(document.querySelector('.logo svg').outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"'));
  await new Promise(r => { logo.onload = r; logo.onerror = r; }); try { g.drawImage(logo, 540 + 40 - fw / 2 - 80, 966, 64, 64); } catch {}
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  $('victoryImg').src = URL.createObjectURL(blob);
  const caption = `I just banished a ${s.name.replace('!', '')} with Grim Reader: ${clean(d.letter_type || 'a scary letter')}. Scary letters, explained. #Kiroween`;
  $('copyCaption').onclick = () => copy(caption, $('copyCaption'));
  $('saveCard').hidden = !dl; $('victoryNote').textContent = dl ? '' : 'Long-press or right-click the image to save it.';
  $('saveCard').onclick = async () => { try { await dl.save({ filename: 'grim-reader-banished.png', data: blob }); $('saveCard').innerHTML = ic('check') + 'Saved'; } catch {} };
  openOverlay('victory');
}

// ---------- judge's tour ----------
const TOUR = [
  { sel: '.verdict', pane: 'verdict', text: 'The Grim Reader explains the letter in plain words. The headline says how urgent it is; the spirit tag adds the Halloween flavour.' },
  { sel: '#tiles', pane: 'verdict', text: 'Tap Deadline or Amount to see exactly where the letter says it, so you never have to just trust the AI.' },
  { sel: '#first', pane: 'verdict', text: 'Do This First shows the next step. Mark Done ticks it off in the full list.' },
  { sel: '.actions', pane: 'verdict', text: 'Listen reads it aloud. Share sends or copies it for family with personal details hidden. Words decodes scary jargon and shows where it is.' },
  { sel: '#pane-todo', pane: 'todo', text: 'Banish It: tick every step to banish the letter, then share your victory. It also sets a reminder before the deadline.' },
  { sel: '#pane-reply', pane: 'reply', text: 'A polite reply is ready to edit and copy. It never admits fault or promises money.' },
  { sel: '#pane-ask', pane: 'ask', text: 'Ask the Grim Reader follow-up questions about this letter, in your language.' },
  { sel: '#pane-help', pane: 'help', text: 'Serious letters point to free help from real people. Grim Reader explains; it never replaces a lawyer.' },
  { sel: '#checksSum', pane: 'todo', text: 'Every answer passes safety checks first: real dates, sensible urgency, scam and legal flags.' }
];
let tourAt = -1;
async function startTour(){
  document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on'));
  if (!$('result').classList.contains('on')) { chosenSample = 'power'; pages = []; renderThumbs(); $('text').value = SAMPLES.power.text; refresh(); run(); await new Promise(r => { const t0 = Date.now(); const iv = setInterval(() => { if ($('result').classList.contains('on') || Date.now() - t0 > 20000) { clearInterval(iv); setTimeout(r, 400); } }, 150); }); }
  tourAt = 0; $('tour').hidden = false; showTourStep();
}
function endTour(){ tourAt = -1; $('tour').hidden = true; selectTab('verdict'); $('again').click(); }
function showTourStep(){
  const s = TOUR[tourAt]; selectTab(s.pane); fit();
  requestAnimationFrame(() => {
    const el = document.querySelector(s.sel); if (!el || !el.offsetParent) { tourAt < TOUR.length - 1 ? (tourAt++, showTourStep()) : endTour(); return; }
    const r = el.getBoundingClientRect(), pad = 6, ring = $('tourRing'), tip = $('tourTip');
    Object.assign(ring.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
    const shown = TOUR.filter(x => !(x.sel === '#first' && innerWidth >= 900)); $('tourStep').textContent = `Tour ${shown.indexOf(s) + 1} of ${shown.length}`; $('tourText').textContent = s.text;
    $('tourBack').disabled = tourAt === 0; $('tourNext').innerHTML = tourAt === TOUR.length - 1 ? `Finish${ic('check')}` : `Next${ic('arrow-right')}`;
    const th = tip.offsetHeight || 170, tw = tip.offsetWidth, below = r.bottom + 14, above = r.top - th - 14;
    let top = below + th < innerHeight - 8 ? below : above > 8 ? above : Math.max(8, innerHeight - th - 8);
    let left = Math.min(Math.max(12, r.left + r.width / 2 - tw / 2), innerWidth - tw - 12);
    Object.assign(tip.style, { top: top + 'px', left: left + 'px' }); $('tourNext').focus();
  });
}
$('tourNext').onclick = () => { sfx('tick'); if (tourAt >= TOUR.length - 1) endTour(); else { tourAt++; showTourStep(); } };
$('tourBack').onclick = () => { if (tourAt > 0) { tourAt--; showTourStep(); } };
$('tourSkip').onclick = endTour;
document.addEventListener('keydown', e => { if (tourAt >= 0 && e.key === 'Escape') endTour(); if (tourAt >= 0 && e.key === 'ArrowRight') $('tourNext').click(); if (tourAt >= 0 && e.key === 'ArrowLeft') $('tourBack').click(); });
window.addEventListener('resize', () => { if (tourAt >= 0) showTourStep(); });
$('tourBtn').onclick = startTour; $('introTour').onclick = startTour; $('aboutTour').onclick = startTour;

function batBurst(){
  const r = $('banished').getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const b = document.createElementNS('http://www.w3.org/2000/svg','svg');
    b.setAttribute('viewBox','0 0 64 28'); b.setAttribute('class','burst');
    b.innerHTML = '<path d="M32 10c2-4 4-5 4-5s1 3 0 6c6-6 16-8 28-3-8 1-12 6-12 12-4-4-9-4-12 0-1-4-4-5-8-4-4-1-7 0-8 4-3-4-8-4-12 0 0-6-4-11-12-12 12-5 22-3 28 3-1-3 0-6 0-6s2 1 4 5z"/>';
    const a = Math.random() * Math.PI * 2, dist = 100 + Math.random() * 120;
    b.style.left = (r.left + r.width / 2) + 'px'; b.style.top = (r.top + r.height / 2) + 'px';
    b.style.setProperty('--dx', Math.cos(a) * dist + 'px'); b.style.setProperty('--dy', Math.sin(a) * dist - 60 + 'px'); b.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
    b.style.fill = ['#ff7a1a','#b78cff','#8be36a','#1a0f2a'][i % 4];
    document.body.appendChild(b); setTimeout(() => b.remove(), 1400);
  }
}
async function copy(t, btn){
  const o = btn.innerHTML;
  try { await navigator.clipboard.writeText(t); btn.innerHTML = ic('check') + 'Copied'; }
  catch { btn.textContent = 'Select the text and copy it'; }
  setTimeout(() => btn.innerHTML = o, 1600);
}
showTally(); renderYard(); refresh();
$('introReaper').innerHTML = reaperSVG('#ff7a1a', 'low');
