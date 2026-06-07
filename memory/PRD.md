# Crescent Loom — PRD

## Original Problem Statement
Build a full luxury fashion e-commerce website for "Crescent Loom" — slow fashion, moonlit aesthetic, midnight navy + ivory + brushed gold palette, Cormorant Garamond + DM Sans typography. Multi-page: Home, Shop, Product detail, About, Cart drawer. With wishlist, Google login, Razorpay (UPI) payment, admin panel.

## User Personas
- Discerning customer browsing quietly
- Returning buyer with saved wishlist
- Admin / atelier manager (catalog + orders)

## Tech Stack
- React 19 + Tailwind + shadcn/ui + framer-motion + react-router 7
- FastAPI + Motor (Mongo) + Razorpay SDK + Emergent OAuth + Emergent Object Storage
- Editorial Unsplash/Pexels imagery for chapters / hero (placeholder until customer brand shoots)

## Architecture
- Auth: Emergent Google OAuth, session_token cookie + DB-backed sessions
- Products: variants[] structure — each variant = color/print with its own images
  - Variant: {id, name, color_hex, images[]}
  - Product card uses first variant image (or product.images fallback); shows "Awaiting Image" if empty
- Image upload: Emergent object storage backed by EMERGENT_LLM_KEY; admin uploads -> /api/admin/upload returns public /api/files/{id} url
- Wishlist: Mongo `wishlist` collection (user_id + product_id)
- Cart: Client-side (localStorage)
- Orders: Mongo `orders` collection; Razorpay or demo-complete flow
- Admin: First sign-in becomes admin; ADMIN_EMAILS env supports more

## Catalog (June 2026)
1. **Textured Polo Tee** · ₹399 · sizes M/L/XL · 6 variants (color images uploaded by admin)
2. **Prism Wear Tee** · ₹349 · sizes L/XL · 10 designer print variants
3. **Essential Tee** · ₹299 · sizes M/XL · 2 variants (Black #0B0E1A, White #F5F0E8)

## Implemented
- Editorial homepage with real product imagery in the chapters grid (Polo / Prism / Essential)
- Shop with category filters (Polo / Designer / Basics), product detail with variant swatches + size guide
- Slide-in cart drawer, Razorpay LIVE checkout, Google OAuth, Account, Wishlist
- Admin panel: Pieces + Orders + **Loom Credits** tabs (variant editor, file upload via object storage)
- **Loom Credits** loyalty system (Feb 2026 add-on):
  - 1 card per paid order, 1 card = ₹5, min 3 to redeem
  - Customer profile section (balance, value, eligibility, history)
  - Checkout redeem input with live discount preview + validation
  - Admin: summary stats (issued/redeemed/outstanding/discount given), per-customer table, manual ± adjust modal, redeemed-orders log
- **Crescent Loom Atelier — Admin Dashboard at /admin** (Feb 2026):
  - Email + password login (`/admin/login`) using JWT (separate from Google OAuth)
  - Auto-seeded admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env on startup
  - Brute-force lockout (5 attempts / 15 min per IP+email)
  - Dashboard home: today/week/month orders & revenue, pending orders, customer count, top piece, loom issued/redeemed, revenue area chart (24h / 7d / 30d toggle, Recharts)
  - Orders section: filter by Today/Week/Month/All + status dropdown + search by id/name/email, status mutation (placed → packed → shipped → out_for_delivery → delivered) with auto-Telegram + customer email notification, CSV export
  - Customers: searchable table with orders count + total spent + loom balance, click-through detail modal with order history + manual Loom Credit adjust (+/-)
  - Loom Credits tracker: summary cards (issued/redeemed/outstanding/discount given) + per-customer breakdown + redeemed-orders log
  - Telegram bot integration intact (token + chat id from env), SMTP via Gmail App Password for status emails to customers
  - AdminShell wraps `/admin/*` with sidebar nav, isolated from storefront chrome


## Pending / Backlog
- P0: User to upload 2 more poses per Prism print + Polo variants if desired
- P1: Per-variant color hex picker (instead of hex string)
- P2: Newsletter signup, multi-currency, GST breakdown
- P2: Order detail view + admin status updates
- P2: Razorpay webhook for redundant payment confirmation
- P3: Loom Credits — paginate history once balance grows large; tighten redeemed-txn transactional integrity if Razorpay throws mid-create
