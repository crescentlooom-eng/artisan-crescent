# Crescent Loom — PRD

## Original Problem Statement
Build a full luxury fashion e-commerce website for "Crescent Loom" — slow fashion, moonlit aesthetic, midnight navy + ivory + brushed gold palette, Cormorant Garamond + DM Sans typography. Multi-page: Home (hero "Woven in Moonlight"), Shop, Product detail, About, Cart drawer. With wishlist, Google login, Razorpay (UPI) payment, admin panel.

## User Personas
- Discerning customer browsing quietly
- Returning buyer with saved wishlist
- Admin / atelier manager (catalog + orders)

## Tech Stack
- React 19 + Tailwind + shadcn/ui + framer-motion + react-router 7
- FastAPI + Motor (Mongo) + Razorpay SDK + Emergent OAuth
- Editorial Unsplash/Pexels imagery for placeholder products

## Architecture
- Auth: Emergent Google OAuth, session_token cookie + DB-backed sessions
- Products: Mongo `products` collection seeded with 8 pieces on first startup
- Wishlist: Mongo `wishlist` collection (user_id + product_id)
- Cart: Client-side (localStorage) until checkout
- Orders: Mongo `orders` collection; integrated with Razorpay or demo-complete
- Admin: First sign-in becomes admin; ADMIN_EMAILS env supports more

## Implemented (June 2026)
- Editorial homepage with hero, marquee new-arrivals strip, asymmetric chapters grid, philosophy quote
- Shop page with category filters, search, sort, hover-zoom + halo cards
- Product detail page with gallery, size guide modal (shadcn Dialog), wishlist toggle, related carousel
- About page with brand story + craft values
- Slide-in cart drawer (sonner toasts) + Checkout page with shipping form + Razorpay/demo flow
- Google OAuth login + Account page with order history
- Wishlist page
- Admin panel: product CRUD + order list (tabs)
- Custom dark-dot cursor, gold underline nav animations, scroll-reveal, noise overlay
- Navbar: centered wordmark, scrolls into frosted glass

## Pending / Backlog
- P0: Razorpay live keys (user to provide RAZORPAY_KEY_ID + SECRET)
- P1: Real product catalog upload (user said "we'll share later")
- P1: Newsletter signup
- P2: Order detail view + admin status updates
- P2: Reviews / craft stories per product
- P2: Multi-currency / EUR display
- P2: GST-inclusive pricing breakdown on checkout
