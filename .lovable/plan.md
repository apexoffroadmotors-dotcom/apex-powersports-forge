# Apex Offroad Admin Panel — Full Build Plan

The admin panel is the control room for the storefront: everything a visitor sees on `/shop`, a product page, the cart, and every order placed at checkout is created, edited, or resolved here. Today only two pieces exist: the sign-in screen (`/admin/auth`) and a read-only stats dashboard (`/admin`). Everything below is what remains.

## Current state (verified)

- Sign-in page works (email/password, plus a "Create account" tab).
- Dashboard shows counts (products, orders, reviews, subscribers) and the 10 most recent orders — read-only, with a note telling the user to go elsewhere to edit.
- Database is live with `products`, `reviews`, `orders`, `newsletter_subscribers`, `user_roles`, admin-only write rules, and a private `product-images` storage bucket (4 access rules already in place).
- The catalog is empty: 0 products, 0 reviews, 0 orders, 0 uploaded images. One admin account exists.
- No product editor, no order manager, no review manager, no image upload, no shared admin layout, no sitemap.

## What gets built

### 1. Admin shell and access control

A single admin layout wraps every `/admin/*` page except sign-in:

- Left sidebar on desktop (Dashboard, Products, Orders, Reviews, Subscribers), hamburger drawer on mobile.
- Header with the signed-in email, a "View storefront" link, and Sign out.
- Access gate: on load it confirms there is a session AND that the account holds the `admin` role; without either it redirects to `/admin/auth`. Rendering is client-side only so the login session is read correctly.
- Sign out clears cached data before ending the session and returns to `/admin/auth` without leaving the panel in browser history.
- Sign-in page loses the "Create account" tab — staff accounts are provisioned from the backend panel, not self-serve. It keeps the already-signed-in redirect.

Every write goes through the signed-in browser connection, so the database's admin-only rules are the real security boundary; the UI gate is convenience only.

### 2. Products — the source of truth for the storefront

`/admin/products` — table with search (name, brand, model), filters (type, condition, listing status, featured), and sort. Each row: thumbnail, name, brand/model/year, price, stock, status pill, featured star toggle, Edit, Duplicate, Delete (with confirm).

`/admin/products/new` and `/admin/products/$id` — one full editor form:

- Identity: name, slug (auto-generated from name, editable, uniqueness checked before save), brand, model, year.
- Classification: type (Sport / Utility / Youth / Side-by-Side), condition (New / Used / Certified Pre-Owned), listing status (Available / Reserved / Sold).
- Commerce: price, stock, "available" toggle, "featured" toggle.
- Details: mileage, engine size, transmission, color, short description (feeds cards and meta descriptions), long description (feeds the product page body).
- Specs: repeatable key/value rows saved as a flexible spec block, rendered as the spec table on the product page.
- Images: multi-file upload to the private `product-images` bucket under `products/<slug>/<timestamp>-<filename>`, drag-to-reorder (first image = card image and social share image), per-image delete that also removes the stored file, live previews. Uploads are validated for type and size before they leave the browser.
- Save with validation; success toast; returns to the list.

Connection to the storefront: these rows *are* the shop. `/shop` lists them with its filters mapping to type/condition/price/availability. `/shop/$slug` reads by slug. The homepage "featured inventory" strip reads the featured flag. Product images are served through the existing public image proxy so private-bucket files stay crawlable and cacheable. Product page SEO (title, description, structured data for Google) is generated from name, short description, price, condition, brand, and the first image. Marking a unit Sold or unchecking Available removes it from purchase paths while keeping the page live for SEO.

### 3. Orders — the other end of checkout

Checkout already writes an order: customer name, email, phone, address, notes, the cart line items, and the total, with status `pending`.

`/admin/orders` — table of every order: customer, email, total, item count, status, date. Filter by status, search by name/email, sort by date or total. Clicking a row opens a detail panel showing full contact details, the itemised build list with per-unit prices and quantities (each line links to the product page), the notes, and the order total.

Status is changed from a dropdown — Pending → Contacted → Completed → Cancelled — written straight to the database with an optimistic UI update and toast. Orders can be deleted with a confirm step. A "Reply by email" and "Message on WhatsApp" button pre-fill a message using the customer's details and order reference.

Dashboard cards ("Orders (pending)") stay in sync with this list.

### 4. Reviews

`/admin/reviews` — list of every review with author, star rating, linked product, and date. Create and edit inline: author name, avatar URL, rating 1–5, body, and the product it belongs to (or leave unlinked as a general dealership review). Delete with confirm.

Connection to the storefront: reviews render on the product page (with the aggregate rating used for search-result stars) and on `/reviews`, filterable by product.

### 5. Subscribers

`/admin/subscribers` — read-only list of newsletter emails with signup date, search, and a "Copy all" / CSV export button.

### 6. Dashboard upgrade

Keeps the four stat cards, adds total order value and units sold, makes the recent-orders table clickable through to the order detail, and replaces the "edit in the backend dashboard" note with quick-action buttons (Add product, View orders).

### 7. Seed inventory

The storefront currently renders empty states everywhere. A seed migration inserts a starter catalogue — around 8 machines across all four types with real specs, prices, descriptions, and image references, a few of them featured — plus roughly 30 reviews spread across them, so the homepage, shop, product pages, and reviews page are all populated before any admin work happens.

### 8. Remaining SEO piece

`sitemap.xml` served dynamically, listing the static pages, all blog posts, and every product slug pulled live from the database, so newly added inventory is discoverable without a redeploy. `robots.txt` gets the sitemap reference and disallows `/admin`. All admin pages stay `noindex`.

## Technical notes

- Routes: `admin.tsx` (pathless-style layout with `ssr: false`), `admin.index.tsx`, `admin.products.index.tsx`, `admin.products.new.tsx`, `admin.products.$id.tsx`, `admin.orders.tsx`, `admin.reviews.tsx`, `admin.subscribers.tsx`, plus `sitemap[.]xml.ts`.
- Data access uses the browser Supabase client inside TanStack Query (`useQuery`/`useMutation` with invalidation), so RLS enforces the `admin` role on every read and write. No service-role usage in the panel.
- Image uploads use the storage client directly against `product-images`; reads on the storefront continue through `/api/public/product-image/*`.
- Forms validated with zod; slug uniqueness checked against the database before insert/update.
- Existing design system only: `border-2 border-ink`, `micro-label`, `font-display`, semantic tokens — no new colors.
- The `handle_new_user` trigger currently grants `admin` to every new auth account; with self-serve signup removed from the UI this is acceptable, but the plan also tightens it so only accounts created from the backend panel receive the role if you prefer.

## Build order

Admin shell + gate → products list → product editor with image upload → orders manager → reviews manager → subscribers → dashboard upgrade → seed migration → sitemap/robots → full click-through pass on preview.
