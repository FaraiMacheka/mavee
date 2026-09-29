# Mavee Café — Fancourt ordering prototype

A static, mobile-friendly GitHub Pages prototype. It is **not yet a live ordering system**: menu items and prices are examples and the WhatsApp number is unverified. Orders are handed to WhatsApp as a prefilled message; nothing is placed until the customer presses Send and Mavee confirms by reply. The review screen states this clearly.

## Publish with GitHub Pages

1. Upload the contents of this folder to the repository root on the `main` branch. Keep `index.html`, `app.js`, `styles.css`, `cafe.png`, and `.nojekyll` at the root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, then `main` and `/(root)`. Save.
4. Wait for GitHub to show the published URL. For `FaraiMacheka/mavee`, the usual project address would be `https://faraimacheka.github.io/mavee/` once Pages is active; verify it in Settings → Pages.

The HTML uses relative asset URLs, so it works under the `/mavee/` project path. Keep this prototype link for review only.

## Before taking real orders

- Replace the sample menu and prices in `app.js` with Mavee's approved menu.
- `WHATSAPP_NUMBER` in `app.js` is Mavee's business number. Confirm a test order reaches it from a phone. The review step opens WhatsApp with the order prefilled; the customer still has to press Send.
- Add any named blocks to `NAMED_BLOCKS` in `app.js`. Block numbers are always accepted.
- Confirm operating days, pickup hours, the final order slot, preparation lead time, and accepted payment methods.
- Test R30 delivery minimum, address details, and the complete order message on a phone.
- Update the prototype notice only after an order can actually reach Mavee.

See `SPEC.md` for requirements and launch checks. GitHub Pages is public on ordinary free accounts; do not include customer contact details or secrets in this repository.
