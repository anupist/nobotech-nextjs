# ShopHub — Agent Guide

## Environment & Stack

- **Framework:** Next.js 16 App Router (client-side SPA — all pages `'use client'`)
- **ORM:** Prisma 6 + MySQL 8 (`DATABASE_URL=mysql://root:@127.0.0.1:3306/nobitech_nextjs`)
- **Styling:** Tailwind CSS 4 + shadcn/ui (new-york style, CSS variables in oklch)
- **State:** Zustand 5 (8 stores, 5 persisted via localStorage)
- **Server state:** TanStack React Query 5
- **Auth:** Plain-text password compare (demo mode — NOT production-safe)
- **Runtime:** Node.js, dev via npm, production start via bun

## Critical Gotchas

### Database Connection
- `DATABASE_URL` **must** use `127.0.0.1`, never `localhost`. Prisma's Rust query engine connects via TCP, but MySQL's `root@localhost` only accepts named-pipe/socket connections on Windows. Only `root@127.0.0.1` (or `root@%`) works.

### Dev Server on Windows
- `npm run dev` requires `--webpack` flag. Turbopack panics on this Windows environment when processing CSS via PostCSS/lightningcss. Already configured in `package.json`.
- Production `next build` works with Turbopack (no `--webpack` needed).

### TypeScript & Linting
- `next.config.ts` has `ignoreBuildErrors: true` — builds succeed despite TS errors.
- `tsconfig.json` has `noImplicitAny: false`.
- ESLint (eslint-config-next) has nearly all rules disabled (`no-unused-vars: off`, `no-explicit-any: off`, `react-hooks/exhaustive-deps: off`, etc.).
- **No typecheck or lint command that actually blocks.** `npm run lint` runs but rarely catches anything.

### No Tests
- Zero test infrastructure. No test runner, no test files, no test scripts. This is a demo/prototype.
- **Instead of tests, run `npm run build` to verify changes compile before pushing.**

## Workflow
- After completing a task, always: (1) run `npm run build` to verify, (2) stage all changes, (3) commit with a descriptive message, (4) push to `origin main`.

## Key Commands

```sh
npm run dev        # Start dev server on :3000 (uses --webpack)
npm run build      # Production build + copies .next/static + public to standalone/
npm start          # Not used — instead: NODE_ENV=production bun .next/standalone/server.js
npm run seed       # tsx prisma/seed.ts (configured via prisma.seed in package.json)
npm run db:push    # prisma db push
npm run db:generate # prisma generate
npm run db:migrate  # prisma migrate dev
npm run db:reset    # prisma migrate reset
```

## Architecture

### SPA Routing (No URL Changes)
- All navigation goes through `useNavStore` (Zustand) — URL never updates.
- **Store pages** (25): `home`, `products`, `product-detail`, `cart`, `checkout`, `wishlist`, `auth`, `account`, `search`, `blog`, `blog-detail`, `page`, `order-detail`, `order-tracking`, `compare`, `contact`, `faq`, `gift-cards`, `deals`, `shipping`, `about`, `return-request`
- **Admin pages** (22): `dashboard`, `analytics`, `products`, `add-product`, `edit-product`, `categories`, `brands`, `orders`, `order-detail`, `customers`, `customer-detail`, `reviews`, `coupons`, `flash-sales`, `banners`, `blog`, `pages`, `newsletter`, `settings`, `inventory`, `audit-logs`, `media`
- Switch view mode with `useNavStore.getState().setViewMode('store'|'admin')`.
- `navigateStore(page, params?)` / `navigateAdmin(page, params?)` for page transitions.
- Page params (e.g., product slug, order id) live in `pageParams` — passed via the second argument.

### Entry Point
```
src/app/layout.tsx      → RootLayout (ThemeProvider, Toaster)
src/app/page.tsx        → viewMode === 'store' ? <StoreApp /> : <AdminApp />
```

### Page Switching
- **StoreApp:** Uses a `Record<StorePage, Component>` map + `AnimatePresence` (Framer Motion).
- **AdminApp:** Uses `switch (adminPage)` — no animation.

### API Routes
- 37 route handlers under `src/app/api/`.
- **Public:** `/api/products`, `/api/categories`, `/api/brands`, `/api/banners`, `/api/auth/*`, `/api/orders`, `/api/reviews`, `/api/coupons/validate`, `/api/newsletter`, `/api/settings`, `/api/stats`, `/api/chat`, `/api/wishlist`, `/api/returns`
- **Admin:** `/api/admin/products`, `/api/admin/categories`, `/api/admin/brands`, `/api/admin/orders`, `/api/admin/customers`, `/api/admin/coupons`, `/api/admin/reviews`, `/api/admin/blog`, `/api/admin/pages`, `/api/admin/banners`, `/api/admin/flash-sales`, `/api/admin/inventory`, `/api/admin/newsletter`, `/api/admin/audit-logs`, `/api/admin/media`, `/api/admin/settings`
- All return `{ success: boolean, data: T, error?: string, meta?: { page, limit, total, totalPages } }`.
- All use `import { db } from '@/lib/db'` for Prisma access.

### Prisma Client (src/lib/db.ts)
- Singleton with `globalThis` caching to prevent multiple instances during hot-reload.
- Query logging enabled in non-production (`log: ['query']`).

### API Client (src/lib/api.ts)
- Typed fetch wrapper handling the `{ success, data }` envelope.
- All entity types are defined: `Product`, `Category`, `Brand`, `Banner`, `Review`, `CouponData`, `OrderData`.
- Helper functions: `fetchProducts()`, `fetchProduct()`, `fetchCategories()`, `fetchBrands()`, `fetchBanners()`, `fetchSettings()`, `validateCoupon()`, `createOrder()`, `submitReview()`, `subscribeNewsletter()`.
- `formatPrice()` and `getDiscountPercentage()` utility functions.

## State Management

| Store | File | Persisted | Key |
|-------|------|-----------|-----|
| NavStore | `src/stores/nav-store.ts` | No | viewMode, page, params, history |
| CartStore | `src/stores/cart-store.ts` | Yes (`cart-storage`) | items, isOpen |
| AuthStore | `src/stores/auth-store.ts` | Yes | user, isAuthenticated |
| WishlistStore | `src/stores/wishlist-store.ts` | Yes | items |
| RecentlyViewedStore | `src/stores/recently-viewed-store.ts` | Yes | items (capped) |
| CompareStore | `src/stores/compare-store.ts` | Yes | items (max 4) |
| GiftCardStore | `src/stores/gift-card-store.ts` | Yes | purchase flow |
| RewardStore | `src/stores/reward-store.ts` | Yes | loyalty points |

## Database (30+ models)

Prisma schema at `prisma/schema.prisma` (531 lines). All IDs are CUIDs. JSON fields stored as `String? @db.Text` (no native JSON in MySQL 8 via Prisma). Cascade deletes on child relations.

**Key models:** Role, Permission, User, Customer, Address, Category (self-relation), Brand, Attribute, AttributeValue, Product, ProductVariant, ProductVariantValue, ProductImage, Inventory, InventoryLog, Cart, CartItem, Wishlist, Order, OrderItem, OrderTimeline, Payment, Coupon, FlashSale, FlashSaleProduct, Review, Banner, Page, Blog, Newsletter, Setting, AuditLog, Media

**Seed data** (prisma/seed.ts, 2023 lines): 30 products, 78 variants, 20 categories, 12 brands, 10 orders, 15 reviews, 27 settings.
**Test credentials:**
- `superadmin@shop.com` / `admin123`
- `admin@shop.com` / `admin123`
- `customer1@shop.com` through `customer5@shop.com` / `customer123`

## Component Structure

- **Store:** 39 components in `src/components/store/`. Entry: `store-app.tsx`. Shared widgets: ChatWidget, CookieConsent, NewsletterPopup, PromoBar, PWAInstallPrompt, OfflineIndicator, BackToTop, RecentlyViewed, QuickViewModal, SizeGuide, SocialProof, SocialShare, NotificationCenter.
- **Admin:** 24 components in `src/components/admin/`. Entry: `admin-app.tsx`. Pages use switch/case, not a registry map.
- **Shared:** 6 components in `src/components/shared/`: MediaGallery (802 lines), MediaPickerButton, ThemeToggle, BreadcrumbNav, KeyboardShortcuts, BackToTop.
- **UI:** 50+ shadcn/ui primitives in `src/components/ui/`.

## Style Conventions

- **CSS:** Tailwind 4 via `@import "tailwindcss"` + `@import "tw-animate-css"`. CSS variables in `:root` and `.dark` classes using oklch. No CSS modules.
- **cn() utility:** `clsx` + `tailwind-merge` in `src/lib/utils.ts`. twMerge v3 keeps both unprefixed and breakpoint-prefixed classes (they target different breakpoints). When overriding shadcn Dialog widths, use `max-w-[896px]` or a single breakpoint class to avoid conflict with the base `sm:max-w-lg`.
- **Dark mode:** `class`-based via `next-themes`. Toggled by ThemeToggle component.
- **Fonts:** Geist Sans + Geist Mono via `next/font`.

## Notable Installed But Unused/Wired Packages

- `next-intl` — installed, NOT configured in any component
- `next-auth` — installed, `/api/auth/*` routes exist but auth is handled by custom plain-text login
- `input-otp`, `cmdk` — installed, may or may not be in use

## Production Deployment

```
Caddyfile (port 81) → reverse_proxy localhost:3000
Production start: NODE_ENV=production bun .next/standalone/server.js
```

Build command copies static assets: `next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`.

## Media Uploads

- Files stored in `public/uploads/` directory.
- Database metadata in `Media` model (filename, originalName, mimeType, size, url, width, height, folder, uploadedBy).
- API: `GET/POST/DELETE /api/admin/media`, `GET/DELETE /api/admin/media/[id]`.
- Upload uses `multipart/form-data` via `POST /api/admin/media`.
- Folder organization: general, products, banners, categories, brands, blog.
