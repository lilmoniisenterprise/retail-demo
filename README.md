# Orbit Lane — E-Commerce & General Retail Demo

**Project 05 of the Virellion Apex portfolio.** Orbit Lane is a **fictional** general-merchandise store that demonstrates a complete online shopping experience: search, filtering, product pages with variants, a persistent cart, promo codes and a demonstration checkout.

> This online store is a demonstration project developed by Virellion Apex. Brand identity, products, descriptions, inventory, pricing, and promotions are fictional.
>
> **No real orders are placed, no payments are collected and no form data is sent anywhere.**

Designed & developed by [Virellion Apex](https://virellionapex.com).

---

## 1. What's included

| Area | What works |
|---|---|
| Brand | Original "orbit" mark, wordmark, indigo / lime / coral palette, Bricolage Grotesque + Figtree type |
| Layout | Marketplace-app structure: promo ticker, search-first masthead, department rail + mega menu, bento hero, horizontal product rails, ranked best sellers, mobile bottom tab bar, cart drawer |
| Homepage | Hero, deal of the day (live countdown), department bubbles, featured products, copyable promo codes, new arrivals, flash deals, best sellers, seasonal "Cozy Season Edit", trust strip, newsletter demo |
| Departments | Electronics · Home & Living · Fashion & Accessories · Beauty & Personal Care · Gaming · Fitness & Lifestyle · Toys & Everyday Essentials |
| Catalog | 24 products with photos, descriptions, prices, sale prices, stock labels (in stock / low / out / pre-order), specs and variants (some change the price) |
| Search & filters | Live header search with suggestions and keyboard support, department / price range (slider + inputs) / availability / on-sale filters, active-filter chips, 8 sort orders (price, popularity, newest, category, discount…), grid/list view, shareable URLs, empty state |
| Product pages | `product.html?id=…`: 3-view gallery (thumbnails, arrows, swipe, zoom), variant selectors, quantity, add to cart, tabs (description / specs / shipping), related products, recently viewed, mobile sticky buy bar, Product JSON-LD |
| Cart | Drawer + full page, add / remove / update quantity, free-shipping meter, savings, promo codes, tax estimate, totals in integer cents, `localStorage` persistence and cross-tab sync |
| Promotions | Ticker, deal of the day, flash deals, collections, and 4 demo codes: `WELCOME10`, `ORBIT20` ($100 minimum), `GAMER15` (gaming items only), `FREESHIP` |
| Checkout | 4-step demo (contact → address → delivery → payment), inline validation, 4 delivery methods, simulated payment choices with **no card fields**, required "this is a demo" confirmation, demo order number and receipt |
| Other pages | Departments & collections, About, Contact + FAQ (validated demo form), 404 |
| Quality | Semantic HTML, skip link, labelled controls, ARIA dialog/tabs/radios, focus trapping in the cart drawer, reduced-motion support, SEO titles/descriptions, canonical URLs, Open Graph/Twitter cards, sitemap, robots, web manifest, security headers |

## 2. File structure

```
retail-demo/
├── index.html  about.html  shop.html  categories.html  product.html
├── cart.html  checkout.html  contact.html  404.html
├── css/style.css        # Design tokens at the top (:root)
├── js/script.js         # CONFIG, PROMOS, CATS, COLLECTIONS, PRODUCTS at the top
├── images/
│   ├── logo.png         # Wordmark (transparent PNG)
│   ├── hero.jpg         # Brand hero graphic (fallback / first paint)
│   ├── og-image.png     # 1200×630 social-sharing image
│   └── products/        # Put the client's own product photos here (see its README)
├── assets/              # favicon.svg, favicon-32.png, apple-touch-icon.png
├── vercel.json          # Security headers when hosted on Vercel
├── _headers             # Same headers for Cloudflare Pages
├── site.webmanifest  robots.txt  sitemap.xml  .nojekyll
└── README.md
```

All paths are relative (except `404.html`, which uses root paths because hosts serve it at any URL depth). There's no build step and no dependencies.

## 3. Run locally

```bash
cd retail-demo
python3 -m http.server 8080      # then open http://localhost:8080
```

## 4. Deployment

### Current live deployment — GitHub Pages
Live at **https://lilmoniisenterprise.github.io/retail-demo/**, deployed from the `main` branch, root folder (repo **Settings → Pages**). Every push to `main` redeploys within a minute or two.

GitHub Pages specifics handled here:
- All asset paths are relative, so the site works under the `/retail-demo/` sub-path; `404.html` uses `/retail-demo/…` paths.
- GitHub Pages can't send custom headers, so a **Content-Security-Policy `<meta>` tag** is in every page. `_headers` (Cloudflare) and `vercel.json` (Vercel) carry the full header set if the site moves.
- `.nojekyll` disables Jekyll processing.

### Optional: Cloudflare Pages + custom subdomain
1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → `retail-demo`.
   Framework preset **None**, build command **empty**, output directory **`/`** → **Save and Deploy**.
2. **Custom domains** → `retail.virellionapex.com`. Wait for SSL to show **Active** and test before announcing.

### After the final domain is chosen
Canonical, Open Graph, `robots.txt`, `sitemap.xml` and the `404.html` paths all use one base URL, currently `https://lilmoniisenterprise.github.io/retail-demo/`. Find-and-replace it with the final domain (and change `/retail-demo/` to `/` in `404.html` if the site moves to a domain root).

## 5. Replacing assets & content

| What | Where |
|---|---|
| Colours, fonts, radius | `:root` tokens at the top of `css/style.css` |
| Logo | Inline SVG mark in each page header/footer, `images/logo.png`, `assets/*` icons |
| Products | `PRODUCTS` in `js/script.js` — prices in **cents**, `sale` (or `null`), `stock` (`in`/`low`/`out`/`pre`), `options` (`d` = price difference in cents), `specs`, `features`, `tags` |
| Departments / collections | `CATS` and `COLLECTIONS` in `js/script.js` |
| Promo codes, tax, shipping prices, free-shipping threshold | `PROMOS` and `CONFIG` in `js/script.js` |
| Product photos | Demo photos are **hotlinked from Unsplash** (as Unsplash's API guidelines require) and credited in the footer and on each product page. For a client, upload their own photos to `images/products/` and change the `img()` helper to return local paths. Keep square images (1200×1200). |
| Hero & social images | `images/hero.jpg`, `images/og-image.png` (1200×630) |
| Contact details | Footer and `contact.html` use the placeholder `help@orbitlane.example` — replace with verified details only |
| Demo notices | Remove the `.demo-bar`, checkout/contact notices and the footer disclaimer **only** once real services are connected |

If you add other image or script hosts, add them to the Content-Security-Policy in `vercel.json` / `_headers`.

## 6. Going live: commerce integrations

The demo is built so its front end can be wired to real services without exposing secrets. **Never put secret keys in `js/script.js`.**

| Need | Recommended approach |
|---|---|
| **Catalog + checkout (fastest)** | **Shopify** — use the Storefront API (public token, read-only) to load products and create carts, then send the shopper to Shopify's hosted checkout (`cart.checkoutUrl`). Shopify handles payments, tax, inventory and orders. Basic plan required (paid). Alternatively, use Shopify's **Buy Button** for a no-code embed. |
| **Payments without a platform** | **Stripe Checkout** — a serverless function (Cloudflare Pages Functions or Vercel Functions) receives the cart (product IDs + quantities only), **re-prices it on the server** from your own catalog, creates a Checkout Session with the secret key stored as an encrypted environment variable, and returns the URL. Confirm paid orders through a Stripe **webhook**. Card data never touches this site. |
| **Inventory** | Shopify inventory, or a small database (Cloudflare D1 / Supabase / Vercel Postgres) with stock decremented by the payment webhook. Show stock from the API instead of the static `stock` field. |
| **Order management** | Shopify admin, or webhook → database + email notifications (Resend / Postmark) + a simple admin view. Connect fulfilment (ShipStation, Shippo) for labels and tracking. |
| **Promotions** | Create discount codes in Shopify or Stripe (Coupons / Promotion Codes). Keep `PROMOS` for display only — never trust a discount calculated in the browser. |
| **Tax** | Shopify Tax or Stripe Tax; the 8.25% here is a demo estimate. |
| **Forms (contact, newsletter)** | A serverless function + email API, or a form service (Formspree). Add Cloudflare Turnstile against spam. Newsletter → Klaviyo / Mailchimp. |

## 7. Testing performed

An automated headless-Chrome suite (87 checks) was run against this build:

- Every page at 390 px, 820 px and 1440 px: no horizontal scrolling, no JavaScript errors
- Every internal link resolves to an existing file
- Search suggestions, Enter-to-results, empty search state and "clear all"
- Department, sale, price (inputs + slider), availability and collection filters; price ascending/descending sorting; grid/list view
- Product page: variant pricing, quantity, gallery, tabs, add to cart, out-of-stock and not-found handling
- Cart maths in cents: subtotal, free-shipping threshold, express pricing, `GAMER15` (gaming-only), `ORBIT20` (minimum), `FREESHIP`, invalid codes, quantity changes, remove, persistence after reload
- Cart drawer open/close (Escape)
- Checkout validation for each step, payment required, demo confirmation, cart cleared afterwards
- Contact and newsletter validation and demo messages; exact footer disclaimer; mobile filter sheet and tab bar

Photos couldn't be loaded in the test environment (only offline placeholders showed), so check the live photos by eye after any change.

---
© 2026 Virellion Apex · https://virellionapex.com · Orbit Lane is fictional.
