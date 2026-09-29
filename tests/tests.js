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
  return { f, d, w, $, addLatte, step: () => d.body.dataset.step };
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
  const { $, d, addLatte, step } = await load(PHONE);
  await addLatte();
  $('#nextStep').click(); await sleep(50);
  d.querySelector('[name=fulfilment][value=pickup]').click();
  d.querySelector('[name=name]').value = 'Test';
  d.querySelector('[name=phone]').value = '0712345678';
  const sel = d.querySelector('#timeSelect');
  const opt = [...sel.options].find(o => o.value);
  assert(opt, 'no time slots left today; run this test before 15:30 SAST');
  sel.value = opt.value;
  $('#reviewButton').click(); await sleep(50);
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
  const { $, d, addLatte, step } = await load(DESKTOP);
  await addLatte();
  d.querySelector('[name=fulfilment][value=pickup]').click();
  d.querySelector('[name=name]').value = 'Test';
  d.querySelector('[name=phone]').value = '0712345678';
  const sel = d.querySelector('#timeSelect');
  const opt = [...sel.options].find(o => o.value);
  assert(opt, 'no time slots left today');
  sel.value = opt.value;
  $('#reviewButton').click(); await sleep(50);
  assert(step() === 'review', 'step should be review');
  assert(d.defaultView.getComputedStyle($('#reviewModal')).position === 'fixed', 'review should overlay on desktop');
  assert(visible($('#menuItems')), 'menu stays rendered behind the overlay');
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
