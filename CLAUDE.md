# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

There is no application code, package manifest, build system, or test suite yet. The only file is
`Mavee-Cafe-Ordering-MVP-Spec.md`, the MVP specification for a café ordering website. Read it in full
before proposing or writing any code; it is the source of truth for scope and business rules.

When a stack is chosen and scaffolded, add the build, dev, lint, and test commands (including how to
run a single test) to this file.

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
  checklist in spec section 8 is complete.
- **Order message contents** (spec section 5): items with quantities, line and order totals,
  customer name and mobile, pickup or delivery with block/company/floor, requested time with date
  and SAST timezone, optional note, payment on handover, and wording that marks it as a request
  awaiting confirmation.

## Open inputs from the client

Spec section 9 lists items still unknown (approved menu, WhatsApp number, operating days and lead
times, payment methods, occupant list, domain). Treat these as configuration to be filled in, not
values to invent. Where a placeholder is required, make it obviously a placeholder.
