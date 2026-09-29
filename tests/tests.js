// Browser-run behaviour tests for the ordering site. No dependencies.
// Each test gets a fresh copy of ../index.html in an iframe at the given width.
const PHONE = 390, DESKTOP = 1200;
const tests = [];
const test = (name, width, fn) => tests.push({ name, width, fn });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const visible = el => !!el && el.getClientRects().length > 0;

async function load(width) {
  const f = document.createElement('iframe');
  f.style.cssText = `width:${width}px;height:800px`;
  f.src = '../index.html?t=' + Math.random();
  document.getElementById('frames').appendChild(f);
  await new Promise(r => { f.onload = r; });
  await sleep(150);
  const d = f.contentDocument, w = f.contentWindow;
  const $ = s => d.querySelector(s);
  const addLatte = async () => { $('[data-add="latte"]').click(); await sleep(50); };
  const fill = (fields) => {
    const v = Object.assign({ fulfilment: 'pickup', name: 'Test', phone: '071 234 5678', block: '3', floor: 'First', company: 'Octagon' }, fields);
    d.querySelector(`[name=fulfilment][value=${v.fulfilment}]`).click();
    for (const k of ['name', 'phone', 'block', 'floor', 'company']) d.querySelector(`[name=${k}]`).value = v[k];
    const sel = d.querySelector('#timeSelect'); const opt = [...sel.options].find(o => o.value);
    assert(opt, 'no time slots left today; run before 15:30 SAST'); sel.value = opt.value;
  };
  const review = async (fields) => { fill(fields); $('#reviewButton').click(); await sleep(50); };
  // Stop wa.me links navigating the frame; record the href instead.
  const opened = [];
  d.addEventListener('click', e => { const a = e.target.closest('a[href*="wa.me"]'); if (a) { opened.push(a.href); e.preventDefault(); } }, true);
  return { f, d, w, $, addLatte, fill, review, opened, step: () => d.body.dataset.step, error: () => $('#formError').textContent };
}

test('phone starts on the menu step with the details panel hidden', PHONE, async () => {
  const { $, step } = await load(PHONE);
  assert(step() === 'menu', `expected step menu, got ${step()}`);
  assert(visible($('#menuItems')), 'menu should be visible');
  assert(!visible($('#orderForm')), 'order form should be hidden on the menu step');
  assert(visible($('#nextStep')), 'Next button should be visible');
});

test('phone Next is disabled until the basket has an item', PHONE, async () => {
  const { $, addLatte } = await load(PHONE);
  assert($('#nextStep').disabled, 'Next should start disabled');
  await addLatte();
  assert(!$('#nextStep').disabled, 'Next should enable after adding an item');
  assert($('#stepSummary').textContent.includes('1 item') && $('#stepSummary').textContent.includes('R38.00'), `summary was "${$('#stepSummary').textContent}"`);
});

test('phone Next moves to details and Back returns to the menu keeping the basket', PHONE, async () => {
  const { $, w, addLatte, step } = await load(PHONE);
  await addLatte();
  $('#nextStep').click(); await sleep(50);
  assert(step() === 'details', `expected details, got ${step()}`);
  assert(w.location.hash === '#details', `hash was ${w.location.hash}`);
  assert(visible($('#orderForm')), 'order form should be visible on details');
  assert(!visible($('#menuItems')), 'menu should be hidden on details');
  $('#backStep').click(); await sleep(50);
  assert(step() === 'menu', 'Back should return to menu');
  assert($('#basketCount').textContent === '1', 'basket should still hold the item');
});

test('phone browser back (hash change) returns from details to menu', PHONE, async () => {
  const { $, w, addLatte, step } = await load(PHONE);
  await addLatte();
  $('#nextStep').click(); await sleep(50);
  w.location.hash = ''; await sleep(100);
  assert(step() === 'menu', `expected menu after hash cleared, got ${step()}`);
});

test('phone review is a full step with Edit order returning to details', PHONE, async () => {
  const { $, d, addLatte, review, step } = await load(PHONE);
  await addLatte();
  $('#nextStep').click(); await sleep(50);
  await review({});
  assert(step() === 'review', `expected review, got ${step()}`);
  assert(visible($('#reviewContent')) && $('#reviewContent').textContent.includes('Café latte'), 'review text should list the item');
  assert(!visible($('#menuItems')) && !visible($('#orderForm')), 'menu and form hidden on review');
  const backdrop = $('#reviewModal');
  assert(d.defaultView.getComputedStyle(backdrop).position !== 'fixed', 'review should be in page flow on phone, not an overlay');
  $('#editOrder').click(); await sleep(50);
  assert(step() === 'details', 'Edit order should return to details');
});

test('phone hero image is a thin banner', PHONE, async () => {
  const { $ } = await load(PHONE);
  const h = $('.intro-image').getBoundingClientRect().height;
  assert(h > 0 && h <= 130, `hero image height ${h}px should be at most 130px`);
});

test('desktop shows menu and order panel together with no step bar', DESKTOP, async () => {
  const { $, addLatte } = await load(DESKTOP);
  await addLatte();
  assert(visible($('#menuItems')) && visible($('#orderForm')), 'both menu and form visible on desktop');
  assert(!visible($('#nextStep')), 'step bar hidden on desktop');
  assert(!visible($('#backStep')), 'Back hidden on desktop');
});

test('desktop review still opens as an overlay', DESKTOP, async () => {
  const { $, d, addLatte, review, step } = await load(DESKTOP);
  await addLatte();
  await review({});
  assert(step() === 'review', 'step should be review');
  assert(d.defaultView.getComputedStyle($('#reviewModal')).position === 'fixed', 'review should overlay on desktop');
  assert(visible($('#menuItems')), 'menu stays rendered behind the overlay');
});

test('rejects a mobile number that is not 10 digits', PHONE, async () => {
  const { addLatte, review, step, error } = await load(PHONE);
  await addLatte(); await review({ phone: '071 234 567' });
  assert(step() !== 'review', 'should stay on details');
  assert(/10-digit/.test(error()), `error was "${error()}"`);
});

test('rejects a 10-digit number that is not a South African mobile', PHONE, async () => {
  const { addLatte, review, step, error } = await load(PHONE);
  await addLatte(); await review({ phone: '011 234 5678' });
  assert(step() !== 'review', 'should stay on details');
  assert(/10-digit/.test(error()), `error was "${error()}"`);
});

test('accepts +27 mobile format and normalises it in the message', PHONE, async () => {
  const { $, addLatte, review, step } = await load(PHONE);
  await addLatte(); await review({ phone: '+27 71 234 5678' });
  assert(step() === 'review', `expected review, got ${step()}`);
  assert($('#reviewContent').textContent.includes('Mobile: 0712345678'), 'message should show normalised number');
});

test('rejects a block with letters when no named blocks are configured', PHONE, async () => {
  const { addLatte, review, step, error } = await load(PHONE);
  await addLatte(); await review({ fulfilment: 'delivery', block: 'C' });
  assert(step() !== 'review', 'should stay on details');
  assert(/block number/i.test(error()), `error was "${error()}"`);
});

test('accepts a numeric block for delivery', PHONE, async () => {
  const { $, addLatte, review, step } = await load(PHONE);
  await addLatte(); await review({ fulfilment: 'delivery', block: '12' });
  assert(step() === 'review', `expected review, got ${step()}`);
  assert($('#reviewContent').textContent.includes('Block 12'), 'message should name the block');
});

test('review offers a WhatsApp link to the café number with the order prefilled and a reference', PHONE, async () => {
  const { $, addLatte, review } = await load(PHONE);
  await addLatte(); await review({});
  const a = $('#placeOrder');
  assert(a && a.tagName === 'A', 'place order should be a link');
  assert(/^https:\/\/wa\.me\/27\d{9}\?text=/.test(a.href), `href should target a South African number in international format, was ${a.href}`);
  const text = decodeURIComponent(a.href.split('text=')[1]);
  assert(/MV-[A-Z0-9]{4}/.test(text), 'message should carry an order reference');
  assert(text.includes('Café latte') && text.includes('request'), 'message should list items and say it is a request');
  assert($('#reviewContent').textContent.includes('request'), 'on-screen text should say request');
});

test('placing the order moves to a sent step that never claims the order was sent', PHONE, async () => {
  const { $, d, addLatte, review, step, opened } = await load(PHONE);
  await addLatte(); await review({});
  $('#placeOrder').click(); await sleep(50);
  assert(opened.length === 1, 'WhatsApp link should have been opened once');
  assert(step() === 'sent', `expected sent, got ${step()}`);
  const t = d.body.innerText;
  assert(/press Send/i.test(t), 'sent step should tell the customer to press Send in WhatsApp');
  assert(!/order (sent|placed|confirmed)\b/i.test(t.replace(/only once|not/gi, '')), 'must not claim the order is sent or confirmed');
  assert(visible($('#openAgain')) && visible($('#changeOrder')) && visible($('#newOrder')), 'sent step actions visible');
});

test('changing a placed order produces an updated message with the same reference', PHONE, async () => {
  const { $, addLatte, review, step } = await load(PHONE);
  await addLatte(); await review({});
  const ref = $('#reviewContent').textContent.match(/MV-[A-Z0-9]{4}/)[0];
  $('#placeOrder').click(); await sleep(50);
  $('#changeOrder').click(); await sleep(50);
  assert(step() === 'details', 'change should return to details');
  $('#reviewButton').click(); await sleep(50);
  const text = $('#reviewContent').textContent;
  assert(text.includes('UPDATED ORDER') && text.includes(ref), `updated message should say UPDATED ORDER and keep ${ref}: ${text.slice(0, 80)}`);
});

test('starting a new order clears the basket and returns to the menu', PHONE, async () => {
  const { $, addLatte, review, step } = await load(PHONE);
  await addLatte(); await review({});
  $('#placeOrder').click(); await sleep(50);
  $('#newOrder').click(); await sleep(50);
  assert(step() === 'menu', 'should be back on menu');
  assert($('#basketCount').textContent === '0', 'basket should be empty');
  assert($('#nextStep').disabled, 'Next should be disabled again');
});

test('desktop review also has the WhatsApp place order link', DESKTOP, async () => {
  const { $, addLatte, review } = await load(DESKTOP);
  await addLatte(); await review({});
  assert(visible($('#placeOrder')), 'place order visible on desktop');
});

(async () => {
  // Refresh the browser cache so frames pick up the latest script and styles.
  await Promise.all(['../app.js', '../styles.css', '../index.html'].map(u => fetch(u, { cache: 'reload' })));
  const out = [];
  let failed = 0;
  for (const t of tests) {
    try { await t.fn(); out.push(`PASS  ${t.name}`); }
    catch (e) { failed++; out.push(`FAIL  ${t.name}\n      ${e.message}`); }
  }
  const el = document.getElementById('results');
  el.textContent = out.join('\n') + `\n\n${tests.length - failed}/${tests.length} passed`;
  el.className = failed ? 'fail' : 'pass';
  document.title = (failed ? 'FAIL ' : 'PASS ') + `${tests.length - failed}/${tests.length}`;
})();
