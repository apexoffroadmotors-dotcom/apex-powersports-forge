# Apex Powersports Forge

# Apex Offroad Motors — Fresh Build Prompt

Copy everything in the block below into a brand-new Lovable project as the first message. It reproduces this site’s full functionality for ApexOffroadMotors.com with a distinct visual identity.

---

## PROMPT

Build a premium, SEO-optimized ATV / powersports dealership website.

### Brand
- Business name: Apex Offroad Motors
- Domain: https://apexoffroadmotors.com
- Email: info@apexoffroadmotors.com
- Phone / WhatsApp: [+1XXXXXXXXXX]
- Location wording: United States (no physical street addresses, no map embeds)

### Stack
React + Vite + TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, framer-motion, react-helmet-async, zod, Lovable Cloud (database, auth, storage). No Next.js/SSR — use client SEO: per-route meta, JSON-LD, sitemap.xml, robots.txt, semantic HTML.

### Visual direction (different from the usual gold/ember look)
- Light-first, high-contrast theme. Never dark-on-dark; body text must always be clearly readable.
- Palette: deep forest green primary (#12332B), sand/bone background (#F7F4EE), electric lime accent (#B4F02A), slate text (#1B1F1D).
- Typography: "Archivo Black"-style condensed display for headings + "Manrope" for body.
- Style: editorial grid layout, thick rules and hairline borders, boxed cards with 2px borders instead of glassmorphism, chunky uppercase micro-labels, subtle noise texture.
- All colors as HSL semantic tokens in index.css + tailwind.config.ts. No hardcoded `text-white` / `bg-black` in components.
- Navbar: solid light background at all times (including on scroll), sticky, smooth scroll anchors.
- framer-motion entrance animations, hover lift on cards, typewriter animated hero headline.

### Public pages
1. `/` Home with 12+ SEO-rich sections: hero (image/video bg + typewriter headline + dual CTA), featured inventory from DB, shop-by-category tiles, why-us + stats counters, how-it-works process, financing teaser, spec highlights, testimonials (links to /reviews), blog teaser, brand strip, FAQ (with FAQPage JSON-LD), newsletter band.
2. `/shop` — filters (price range, type, brand, condition, availability), sort, search, responsive grid, skeleton loaders.
3. `/shop/:slug` — image gallery + thumbnails, full spec table (brand, model, year, condition, mileage, engine size, transmission, color, price, status), Add to Cart, Buy Now (opens checkout modal), share, related units, product reviews, Product + BreadcrumbList JSON-LD.
4. `/about` — brand story, mission, team, US-wide service copy.
5. `/reviews` — ~30 product-linked reviews with avatars, rating stars, filter by product, aggregate rating.
6. `/blog` and `/blog/:slug` — 8+ full long-form articles (600+ words each) stored in `src/data/blogPosts.ts`, hero image, related posts, Article JSON-LD.
7. `/financing` — financing explainer, payment calculator, application CTA.
8. `/contact` — zod-validated form (honeypot + spam protection) posting to formsubmit.co, contact cards, WhatsApp CTA. No map embed.
9. `/cart`, `/checkout`, `/checkout/success`.
10. Branded 404.

### Global UI
- SiteLayout: navbar (logo, links, cart badge, **Login button** → /admin/auth), footer (links, social, newsletter, US wording), floating WhatsApp button, back-to-top button, ScrollToTop-on-route-change.
- Checkout is a **modal**: product info prefilled, inputs for name, email, phone, address, notes; on submit writes an `orders` row and emails via formsubmit.co, then shows success state.
- Cart persisted in localStorage via a CartContext.

### Database (Lovable Cloud)
Enums: `app_role(admin,user)`, `atv_type(sport,utility,youth,side_by_side)`, `atv_condition(new,used,certified_pre_owned)`, `listing_status(available,reserved,sold)`, `order_status(pending,contacted,completed,cancelled)`.

Tables (each with GRANTs + RLS):
- `products`: slug, name, brand, model, year, type, condition, price, mileage, engine_size, transmission, color, short_description, description, specs jsonb, images text[], stock, is_available, is_featured, listing_status, timestamps + updated_at trigger. Public read; admin write.
- `reviews`: product_id FK, author_name, avatar_url, rating, body. Public read; admin manage.
- `orders`: customer_name, email, phone, address, notes, items jsonb, total, status. Public insert; admin read/update/delete.
- `newsletter_subscribers`: email. Public insert; admin read.
- `user_roles`: user_id, role. Users read own; `has_role(uuid, app_role)` security-definer function used by every admin policy. Roles NEVER on a profiles table.

Storage bucket `product-images` (public read, admin write).

### Auth model (important)
- **No public signup page.** `/admin/auth` is login-only (email + password).
- Accounts are created manually in the Cloud panel; a trigger on new auth users inserts an `admin` row in `user_roles`, and the client also self-activates admin on first login (policy: authenticated user may insert their own row with role `admin`).
- Admin routes guarded client-side by a `useAuth` hook (user + isAdmin + loading) and server-side by RLS.

### Admin panel (`/admin`)
- Layout: desktop sidebar; on mobile a top bar with hamburger + slide-in drawer. Sign out action.
- Dashboard: counts for products, orders, total order value, featured.
- Products: table (horizontally scrollable on mobile), **search bar filtering by name/brand/model**, create/edit/delete, multi-image upload to storage with preview and reorder, featured toggle, listing status select, all listing fields (Title, Brand, Model, Year, Price USD, Condition, Mileage, Engine size, Transmission, Color, Description, status).
- Orders: list with customer details, line items, total, and status dropdown updating the DB.

### SEO
- Reusable `Seo` component: title <60 chars, meta description <160, canonical, OG + Twitter tags.
- JSON-LD: Organization/AutoDealer, Product + AggregateRating, Review, Article, FAQPage, BreadcrumbList.
- `public/robots.txt` + `public/sitemap.xml` covering all static routes and product slugs.
- Product data shaped to be valid for a Google Merchant feed (condition, price, brand, mileage, color, image required).
- Semantic HTML, single H1 per page, alt text, lazy images, responsive viewport.

### Extras
- Tawk.to (or similar) live chat script in index.html.
- Newsletter signup writing to DB.
- Social links in footer.

Build order: design tokens + layout shell + SEO helper → Cloud schema/RLS/storage/auth → Home → Shop + PDP + cart + checkout modal → About/Reviews/Blog/Financing/Contact → Admin panel → SEO assets → polish pass.

---

## Notes
- Catalog starts empty; add inventory from `/admin` after creating the first account in the Cloud panel.
- Swap the palette/typography block for any other direction you prefer — the rest of the prompt is style-agnostic.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a881ab37-5831-48c2-a25a-32105607b693).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
