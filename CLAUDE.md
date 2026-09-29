# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The site is a static prototype with no build step, package manifest, or test suite: `index.html`,
`app.js`, `styles.css`, `cafe.png`, and `.nojekyll` at the repo root. Preview it by opening
`index.html` or serving the folder, for example `python -m http.server 8000`. It is published with
GitHub Pages from the `main` branch root at https://faraimacheka.github.io/mavee/ , so every push to
`main` goes live. Asset URLs must stay relative so the `/mavee/` project path keeps working.

## Tests

Browser-run behaviour tests live in `tests/` with no dependencies. Serve the repo root and open the
test page; results appear in the page and in the tab title as `PASS n/n` or `FAIL n/n`:

```
python -m http.server 8765
# then open http://127.0.0.1:8765/tests/
```

Each test loads `index.html` in a fresh iframe at phone width (390px) or desktop width (1200px), so
responsive behaviour is covered. Tests that reach the review step need a same-day time slot, so run
them before 15:30 SAST. Add a `test(name, width, fn)` entry in `tests/tests.js` for new behaviour.

## Mobile step flow

Below 900px the page is a three-step flow driven by `document.body.dataset.step` (`menu`, `details`,
`review`, `sent`) and mirrored in the URL hash so the phone back button works. `setStep()` in `app.js` is the
only place that changes it. CSS in the 900px media query hides the sections that do not belong to
the current step. On desktop all sections stay visible and the review is an overlay.

`SPEC.md` is the MVP specification and the source of truth for scope and business rules. Read it in
full before changing behaviour. Configuration lives at the top of `app.js`: the sample menu, `WHATSAPP_NUMBER`
(digits only, international format) and `NAMED_BLOCKS`. See `README.md` for the launch checklist.

## What is being built

A mobile-first ordering site for Mavee Café in Fancourt Office Park, Northriding, South Africa.
Customers browse a menu, build an order, choose pickup or office delivery, pick a time, and review.
In the launch version the order is handed off as a prefilled WhatsApp message to Mavee's business
number. Payment happens at handover. There is no café dashboard, stock control, or online payment
in the MVP.

## Product rules that must not be violated

- **Nothing is "sent" or "confirmed" by the website.** Opening WhatsApp or copying text does not
  submit an order. The customer must press Send inside WhatsApp, and Mavee must acknowledge. Never
  render a "placed" or "confirmed" state based on the link being opened.
- **Delivery minimum is R30 on the subtotal.** It is a minimum order value, not a delivery fee.
  Keep the threshold configurable. Below R30, show how much more is needed. Pickup has no minimum.
- **Delivery window is 08:00 to before 16:00 South Africa time (SAST).** Requested times are
  requests, not guaranteed slots. Current slot design (same-day half-hour slots, 30-minute lead)
  is an unapproved assumption.
- **Delivery address fields are block, company, floor, plus an optional note.** If an occupant
  directory is added later, checkout must still allow manual company and floor entry ("other").
  Never publish private contact details from an occupant list.
- **Menu and prices in the prototype are placeholders**, not Mavee's approved offering. Do not
  present the prototype as a live ordering service. Keep the prototype notice until the launch
  checklist in SPEC.md section 8 is complete.
- **Order lifecycle.** The site never sends anything itself. "Place order on WhatsApp" opens a
  wa.me link with the message prefilled and moves to a `sent` step whose wording says the order is
  placed only once the customer presses Send in WhatsApp. Every message carries an order reference
  (`MV-XXXX`). A change after placing produces an "UPDATED ORDER REQUEST" message with the same
  reference so Mavee can tell an amendment from a new order. The site cannot lock an order once
  Mavee starts preparing; that needs a backend and is out of MVP scope.
- **Validation.** Mobile numbers must normalise to a 10-digit South African mobile (06, 07 or 08
  prefix; +27 form accepted). Delivery blocks must be a number of up to three digits or an entry in
  `NAMED_BLOCKS`.
- **Order message contents** (SPEC.md section 5): items with quantities, line and order totals,
  customer name and mobile, pickup or delivery with block/company/floor, requested time with date
  and SAST timezone, optional note, payment on handover, and wording that marks it as a request
  awaiting confirmation.

## Open inputs from the client

SPEC.md section 9 lists items still unknown (approved menu, WhatsApp number, operating days and lead
times, payment methods, occupant list, domain). Treat these as configuration to be filled in, not
values to invent. Where a placeholder is required, make it obviously a placeholder.
