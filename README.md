# DON'T TELL ANYBODY

Mobile-first static implementation of the supplied Figma Flow 3 screens. The page canvas follows the 393 px mobile frames and centers on wider screens.

## Preview

Open `index.html` directly in a browser. There is no build step or package installation.

## Flow 3 screens and interactions

- Home, Story, sticker and mirror Shop, five product detail pages, Gallery, News, Contact, Thanks, My Box, Checkout, FAQ, privacy policy, terms, and legal notice
- Header and drawer navigation, a branded opening screen, cross-dissolve page transitions, shared product-image motion, sliding category tabs, product details, add-to-box, quantity controls, and saved cart state in local storage
- Checkout creates a Shopify cart with the configured public Storefront API token and product variant IDs, then opens Shopify's hosted checkout
- The Contact form prepares an email addressed to `donttellanybody.official@gmail.com` with `name`, `address`, and `Message` in that order. The visitor must send it from their mail app; direct server-side delivery requires a configured email endpoint.
- The local Thanks page is separate from the Contact form. Shopify completes checkout on its hosted checkout and shows its hosted Thank you page; rendering the Figma confirmation within Shopify requires a Thank you page checkout UI extension.

## Fonts

- English headings and rounded labels use the bundled DynaPuff Bold font with tight tracking.
- Japanese text uses Google Fonts Noto Sans JP Bold with 10% tracking. Prices use Google Fonts Lilita One.
- DynaPuff and Encode Sans Semi Condensed font files in `assets/` include their SIL Open Font License notices.

Shopify payment methods, shipping rates, inventory, and product availability still need to be configured in Shopify Admin. Never place a Shopify Admin API secret in `shopify-config.js`.
