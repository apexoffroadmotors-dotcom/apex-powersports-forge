# Apex Offroad Motors — Premium ATV Dealership Site

A full powersports dealership site with public storefront, cart/checkout, blog, reviews, and an admin panel backed by Lovable Cloud.

## Stack note (one deviation from the brief)

This project runs on TanStack Start (React 19 + Vite 7 + Tailwind v4), not React Router + react-helmet-async. Everything requested is buildable, with these equivalents:

- Routing: TanStack Router file routes (`/shop/$slug` instead of `/shop/:slug`)
- SEO: route `head()` for title/description/canonical/OG/Twitter + JSON-LD script tags (no react-helmet-async)
- Tokens: `src/styles.css` `@theme inline` (Tailwind v4 has no `tailwind.config.ts`)
- Server work: server functions, not edge functions
- SSR is on, which makes the SEO better than the client-only approach described

Everything else — palette, layout language, DB schema, RLS, admin panel — is built exactly as specified.

## Visual identity

- Light-first, high contrast. Forest green `#12332B` primary, sand `#F7F4EE` background, electric lime `#B4F02A` accent, slate `#1B1F1D` text — all as semantic tokens (oklch), no hardcoded colors in components.
- Archivo Black display headings + Manrope body, loaded via `<link>` in the root route.
- Editorial grid, 2px boxed borders, thick rules, uppercase micro-labels, subtle noise texture. Solid light sticky navbar at all times.
- Motion: entrance animations, card hover lift, typewriter hero headline.

## Pages

1. `/` — hero (media bg, typewriter headline, dual CTA), featured inventory, category tiles, why-us + stat counters, how-it-works, financing teaser, spec highlights, testimonials, blog teaser, brand strip, FAQ (FAQPage JSON-LD), newsletter band
2. `/shop` — price/type/brand/condition/availability filters, sort, search, responsive grid, skeletons
3. `/shop/$slug` — gallery + thumbnails, full spec table, Add to Cart, Buy Now (checkout modal), share, related units, reviews, Product + BreadcrumbList JSON-LD
4. `/about`, `/financing` (calculator + CTA), `/contact` (zod form + honeypot → formsubmit.co, WhatsApp CTA, no map)
5. `/reviews` — ~30 product-linked reviews, avatars, stars, filter by product, aggregate rating
6. `/blog` + `/blog/$slug` — 8 long-form articles (600+ words) in `src/data/blogPosts.ts`, Article JSON-LD, related posts
7. `/cart`, `/checkout`, `/checkout/success`, branded 404

Global: site layout with navbar (cart badge + Login → `/admin/auth`), footer, floating WhatsApp button, back-to-top, scroll reset on navigation. Cart in localStorage via CartContext.

## Backend (Lovable Cloud)

Enums: `app_role`, `atv_type`, `atv_condition`, `listing_status`, `order_status`.

Tables, each with explicit GRANTs + RLS:

- `products` — full listing fields, `specs` jsonb, `images` text[], featured/status flags, updated_at trigger. Public read, admin write.
- `reviews` — product FK, author, avatar, rating, body. Public read, admin manage.
- `orders` — customer details, items jsonb, total, status. Public insert, admin read/update/delete.
- `newsletter_subscribers` — public insert, admin read.
- `user_roles` — separate table, never on profiles; `has_role(uuid, app_role)` security-definer function backs every admin policy.

Storage bucket `product-images`: public read, admin write.

Auth: login-only `/admin/auth` (no signup). Trigger grants `admin` on new auth users; accounts created from the Cloud panel. Admin routes gated by an auth hook client-side and RLS server-side.

## Admin panel `/admin`

- Sidebar on desktop, hamburger drawer on mobile, sign out
- Dashboard: product count, order count, total order value, featured count
- Products: searchable table (name/brand/model), create/edit/delete, multi-image upload with preview + reorder, featured toggle, listing status, all spec fields
- Orders: customer details, line items, total, status dropdown writing to the DB

## SEO

Reusable metadata helper (title <60, description <160, canonical, OG, Twitter), JSON-LD for AutoDealer/Product/AggregateRating/Review/Article/FAQPage/BreadcrumbList, `robots.txt` and `sitemap.xml` covering static routes plus product slugs, semantic HTML, single H1, alt text, lazy images. Product fields shaped for a valid Google Merchant feed.

## Build order

Tokens + layout shell + SEO helper → Cloud schema/RLS/storage/auth → Home → Shop + PDP + cart + checkout modal → About/Reviews/Blog/Financing/Contact → Admin → SEO assets → polish.

## Open items

- Phone/WhatsApp number is a placeholder in the brief; I'll wire `+1XXXXXXXXXX` as a single constant to swap later.
- Catalog starts empty — inventory is added from `/admin` after the first account is created in the Cloud panel.
- Live chat: I'll leave a clearly marked slot for a Tawk.to script rather than embedding an unknown property ID.
