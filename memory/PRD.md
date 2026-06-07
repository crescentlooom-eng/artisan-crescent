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
- Editorial homepage, shop with category filters (Polo/Designer/Basics), product detail with variant swatches + size guide
- Slide-in cart drawer, Razorpay/demo checkout, Google OAuth, Account, Wishlist
- Admin panel with **VariantEditor**: per-variant name/hex/image upload (drag-drop, multi-file)
- Emergent object storage integration: /api/admin/upload + /api/files/{id} proxy

## Pending / Backlog
- P0: Razorpay live keys (user to provide)
- P0: User to upload variant images via admin panel
- P1: Per-variant color hex picker (instead of hex string)
- P2: Newsletter signup, multi-currency, GST breakdown, order detail view + admin status updates
