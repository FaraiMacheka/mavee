# Mavee Café ordering website — MVP specification

**Status:** Draft for Mavee review  
**Date:** 29 September 2026  
**Location:** Fancourt Office Park, Northriding, South Africa

## 1. Purpose

Give people working in Fancourt a quick way to see Mavee's menu and prepare an order for café collection or delivery to their office. Mavee receives the final order through her business WhatsApp in the intended launch version. Payment takes place at collection or delivery.

The published private prototype currently lets a customer build and review an order, but **does not transmit it**. Its menu and prices are examples, not Mavee's approved offering. It must not be advertised as a live ordering service until the launch checklist is complete.

## 2. Audience and service rules

- Customers: staff and visitors in Fancourt Office Park.
- Fulfilment: pickup at Mavee, or delivery to any office within Fancourt.
- Delivery address: block, company, floor, and optional room or delivery instructions.
- Office delivery: order subtotal must be **at least R30**. This is a minimum order value, **not a delivery charge**. No delivery fee has been specified.
- Delivery period: 08:00 to before 16:00, South Africa time. Mavee must confirm operating days, preparation lead time, the final order slot, and whether pickup uses the same hours.
- Payment: at delivery or pickup. The accepted payment methods remain to be confirmed.
- Customers select an available time. The prototype offers half-hour slots for today with at least a 30-minute lead time. This slot design is a starting assumption, subject to Mavee's approval.

## 3. Customer journey

1. Open a mobile-friendly link or scan a QR code.
2. Browse menu categories, item descriptions and prices, then adjust quantities.
3. Choose delivery or pickup. For delivery below R30, see how much more must be added.
4. Enter name, mobile number, preferred time, and, for delivery, block, company and floor. An optional note can include room details or requests.
5. Review items, quantities, total, fulfilment location, time and payment arrangement.
6. **Launch version:** open a prefilled WhatsApp message addressed to Mavee. The customer must press Send in WhatsApp; only then has the order been submitted. The site must never imply that opening WhatsApp or copying text has sent the order.
7. Mavee acknowledges the order and confirms the time through WhatsApp. A request for a preferred time is not a guaranteed slot until Mavee accepts it.

## 4. Functional requirements

| ID | Requirement | Current prototype | Launch requirement |
|---|---|---|---|
| M01 | View mobile-friendly menu by category | Yes, sample items | Replace with approved menu, prices, descriptions and availability |
| M02 | Add, increase and remove items; see subtotal | Yes | Verify against approved prices |
| M03 | Choose pickup or Fancourt office delivery | Yes | Confirm pickup location and operating days |
| M04 | Enforce R30 delivery minimum | Yes | Keep configurable if Mavee changes the threshold |
| M05 | Capture block, company, floor, name and mobile | Yes, free-text | Optionally populate block/company/floor from an occupant list; retain an “other” option |
| M06 | Choose a preferred time before 16:00 | Yes, same-day half-hour slots | Confirm lead time and last acceptable slot with Mavee |
| M07 | Review a complete order | Yes | Preserve clear price and fulfilment summary |
| M08 | Send the order to Mavee's WhatsApp | **No; number pending** | Configure verified business number and test the handoff on a phone |
| M09 | Payment on handover | Stated | Confirm accepted methods and change |
| M10 | Staff acknowledge, accept or decline orders | Outside website; via WhatsApp | Agree response procedure, including sold-out items and delays |
| M11 | Send a catering enquiry (business functions, weddings, special occasions, funerals or memorials) to Mavee's WhatsApp | Yes, enquiry form with event type, date, guests, name, mobile and details | Confirm catering scope, lead time and any minimum with Mavee; no catering prices or packages are shown |

## 5. Order message

The WhatsApp message should contain: items and quantities; item totals and order total; customer name and mobile; delivery or pickup; block/company/floor for delivery; requested time with date and South Africa timezone; optional note; and payment on handover. It should identify the order as a request awaiting Mavee's confirmation.

The customer must be able to review before leaving the website. Never display a “confirmed” or “placed” state solely because the WhatsApp link was opened. WhatsApp is the order record for this MVP; there is no café dashboard, automatic stock control or online payment in scope.

### Catering enquiry message

Catering is an enquiry, not an order. The section under the menu collects event type (business function, wedding, special occasion, funeral or memorial, other), event date (today or later), approximate guest count, name, mobile and optional details. It offers no menus, packages or prices. The WhatsApp message is headed `MAVEE CAFÉ CATERING ENQUIRY MV-XXXX` and carries the event type, date with SAST, guests, name, normalised mobile and details, and states that it is an enquiry awaiting Mavee's reply and quote. A resubmitted enquiry keeps its reference and is headed `UPDATED CATERING ENQUIRY`. The same rule applies as for orders: the site never claims the enquiry was sent, and nothing is booked until Mavee confirms by reply.

## 6. Menu and office directory

Mavee should supply an approved menu in a simple table: category, item name, description, price in rand, options or extras, and availability. Photos are optional. Items that cannot currently be prepared should not be offered as orderable.

An occupant list may use: block, company, floor, and optional reception or room guidance. Because tenants move, the checkout must allow a manual company and floor entry even after the directory is added. Do not publish private contact details from an occupant list.

## 7. Business identity and sharing

The current prototype has a ChatGPT-branded hosted address and owner-only access. It is appropriate for internal review, but a client cannot open it from the bare link. There are two separate decisions:

- **Private review:** invite Mavee by email as an external viewer, if she is comfortable signing in. This retains private access; the address still shows the hosting domain.
- **Customer launch:** attach a domain or subdomain controlled by Mavee, such as an agreed `order.<her-domain>` hostname, and configure its DNS records. A domain must be owned or authorized by Mavee; the exact hostname is not yet chosen. Set the site's audience appropriately for customers only after the approved menu and working order handoff are ready. A QR code can then point to the branded URL.

A short branded redirect can make a printed QR code or message look cleaner, but the browser will still show the destination's address after redirecting. A true custom domain is the correct solution for the visible URL.

## 8. Acceptance checks before public use

- Mavee approves menu, prices, service hours, delivery minimum and payment methods.
- Her verified business WhatsApp number receives a test order with correct quantities, total, address and preferred time.
- Test pickup below R30 and delivery at R29.99 and R30.00.
- Test a customer whose company is absent from the occupant list.
- Test same-day ordering close to 16:00 and outside operating hours.
- Confirm Mavee can acknowledge, reject and communicate delays or unavailable items.
- Test the final domain and QR code on a phone outside the owner's account.
- Replace the prototype notice before public launch only after ordering truly works.

## 9. Decisions and inputs still needed

1. Approved menu with prices and any options or extras.
2. Mavee's business WhatsApp number in international format.
3. Actual business days, last order time, pickup hours and realistic preparation/delivery lead time.
4. Accepted payment methods on handover.
5. Block/company/floor occupant list, when available.
6. Mavee-owned domain or chosen subdomain and access to someone who can set DNS.
7. Mavee's preference for a private review invitation versus a later public launch.
8. Catering scope: which event types Mavee will take on, how much notice she needs, any minimum guest count, and whether catering enquiries should go to the same WhatsApp number as orders.

## 10. Later enhancements, outside this MVP

A staff order dashboard, confirmed delivery slots, scheduled future orders, repeat orders, online payments, live availability and order status notifications may follow once the WhatsApp workflow has been used with real customers and its bottlenecks are clear.
