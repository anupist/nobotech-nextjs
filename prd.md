# ShopHub E-Commerce Platform — Product Requirements Document (PRD)

**Project:** ShopHub
**Repository:** `F:\laragon\www\nobitech-nextjs`
**Version:** 0.2.0
**Status:** Pre-release / Demo-ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Stack](#2-technical-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Schema](#4-database-schema)
5. [API Routes](#5-api-routes)
6. [Store Frontend Components](#6-store-frontend-components)
7. [Admin Dashboard Components](#7-admin-dashboard-components)
8. [Shared Components](#8-shared-components)
9. [State Management](#9-state-management)
10. [Custom Hooks & Utilities](#10-custom-hooks--utilities)
11. [Seed Data](#11-seed-data)
12. [Development Worklog Summary](#12-development-worklog-summary)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Executive Summary

ShopHub is a full-featured single-page application (SPA) e-commerce platform built with **Next.js 16 (App Router)** and **TypeScript**. It provides both a customer-facing storefront and a complete admin dashboard within a single codebase, switching between modes via a Zustand-driven `viewMode` state. The application uses:

- **Next.js 16** with client-side SPA routing — all pages rendered via `"use client"`
- **Prisma 6** ORM connected to a **MySQL 8** database with 30+ models
- **Tailwind CSS 4** + **shadcn/ui** (new-york style) with CSS variables, dark mode via `class`
- **Zustand 5** with localStorage persistence for state management
- **Framer Motion** for animations, **Recharts** for admin analytics, **TanStack Query** for server state

The application is designed as a demo/prototype with plain-text password authentication (not production-safe) and in-memory conversation history for the integrated AI chat assistant.

---

## 2. Technical Stack

### 2.1 Core Framework

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (via Bun) | ^22 |
| Framework | Next.js (App Router) | ^16.1.1 |
| Language | TypeScript | ^5 |
| Package Manager | npm / bun | — |
| Build Output | `standalone` (self-contained) | — |

### 2.2 Database

| Component | Technology |
|-----------|-----------|
| ORM | Prisma Client | ^6.11.1 |
| Database | MySQL 8+ | — |
| Connection | `mysql://root:@127.0.0.1:3306/nobitech_nextjs` | — |
| Migration | `prisma migrate dev` | — |
| Seeding | `tsx prisma/seed.ts` | — |

### 2.3 UI & Styling

| Component | Technology |
|-----------|-----------|
| CSS Framework | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Component Library | shadcn/ui (new-york style, RSC: false) |
| CSS Variables | Yes, via `globals.css` (oklch color space) |
| Dark Mode | `class`-based via `next-themes` |
| Animations | Framer Motion | ^12.23.2 |
| Icons | Lucide React | ^0.525.0 |
| Fonts | Geist / Geist Mono (via `next/font`) |

### 2.4 State & Data Management

| Concern | Solution |
|---------|----------|
| Client State | Zustand | ^5.0.6 (8 stores, localStorage persist) |
| Server State | TanStack React Query | ^5.82.0 |
| Form Handling | React Hook Form | ^7.60.0 + Zod | ^4.0.2 |
| Tables | TanStack React Table | ^8.21.3 |
| Charts | Recharts | ^2.15.4 |
| Drag & Drop | @dnd-kit (core, sortable, utilities) |
| Rich Text | MDXEditor | ^3.39.1 |
| Carousel | Embla Carousel React | ^8.6.0 |
| Date Handling | date-fns | ^4.1.0 |
| Toast | sonner | ^2.0.6 |
| Drawer (mobile) | vaul | ^1.1.2 |

### 2.5 Auth & AI

| Feature | Implementation |
|---------|---------------|
| Authentication | Plain-text password compare (demo mode) |
| Auth Library | next-auth | ^4.24.11 (installed, route available) |
| AI Chat | z-ai-web-dev-sdk | ^0.0.18 (in-memory history) |

---

## 3. Architecture Overview

### 3.1 Routing Model

The application uses a **hybrid SPA architecture**:

```
src/app/page.tsx  (root)
  ├── viewMode === 'store'  →  <StoreApp />
  └── viewMode === 'admin'  →  <AdminApp />
```

- **No per-page SSR** — all routes are client-side rendered
- Navigation is managed entirely by `useNavStore` (Zustand)
- URL is **not** updated on navigation (true SPA)
- API routes (`src/app/api/`) are server-side Next.js route handlers

### 3.2 Project Structure

```
F:\laragon\www\nobitech-nextjs\
├── .env                          # DATABASE_URL
├── .gitignore
├── Caddyfile                     # Production reverse proxy config
├── components.json               # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts                # standalone output, ignore TS errors
├── package.json                  # 80+ dependencies
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json                 # @/ → ./src/*
├── prisma/
│   ├── schema.prisma             # 30+ database models
│   ├── migrations/               # MySQL migration files
│   └── seed.ts                   # Comprehensive seed script (2023 lines)
├── public/                       # Static assets, uploads
├── src/
│   ├── app/
│   │   ├── page.tsx              # Root SPA entry
│   │   ├── globals.css           # Tailwind + custom CSS
│   │   └── api/                  # 40+ REST endpoints
│   ├── components/
│   │   ├── store/                # 39 store components
│   │   ├── admin/                # 24 admin components
│   │   ├── shared/               # 6 shared components
│   │   └── ui/                   # 50+ shadcn/ui primitives
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Prisma client, API client, utils
│   └── stores/                   # 8 Zustand stores
└── worklog.md                    # Development log (3000+ lines)
```

### 3.3 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| SPA routing | Faster page transitions, simpler state management |
| No SSR for pages | Admin panel doesn't need SEO; store can be enhanced later |
| Standalone output | Self-contained deployment with minimal deps |
| Client components only | Avoids hydration mismatch between server/client |
| localStorage persist | Cart, auth, wishlist survive page refresh |
| Plain-text passwords | Demo-mode simplicity (NOT production-safe) |
| Prisma with MySQL | Robust relational DB with migrations |

---

## 4. Database Schema

**File:** `prisma/schema.prisma` (531 lines)
**Provider:** MySQL 8
**Total Models:** 30+

### 4.1 Entity-Relationship Summary

```
RBAC
  Role ──< RolePermission >── Permission
    └──< UserRole >── User

Users & Customers
  User ──< UserRole >── Role
  Customer ──< Address
  User ── Customer (optional 1:1)

Catalog
  Category (parent via self-relation) ──< Product
  Brand ──< Product
  Product ──< ProductImage
  Product ──< ProductVariant ──< ProductVariantValue
  Attribute ──< AttributeValue
  ProductVariantValue >── AttributeValue

Inventory
  ProductVariant ── Inventory (1:1)
  Inventory ──< InventoryLog

Carts & Wishlists
  Cart ──< CartItem >── ProductVariant
  Wishlist >── Product

Orders
  Order ──< OrderItem >── ProductVariant
  Order ──< Payment
  Order ──< OrderTimeline

Promotions
  Coupon
  FlashSale ──< FlashSaleProduct >── Product

Reviews
  Review >── Product, Review >── Customer

CMS & Media
  Banner, Page, Blog, Newsletter
  Setting (key-value store)
  AuditLog (tracks actions, IP, user agent)
  Media (files, folder organization)
```

### 4.2 Full Model Definitions

#### RBAC (4 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Role** | `id`, `name` (unique), `slug` (unique), `description` | `RolePermission[]`, `UserRole[]` |
| **Permission** | `id`, `name` (unique), `slug` (unique), `module` | `RolePermission[]` |
| **RolePermission** | `id`, `roleId`, `permissionId` | `Role`, `Permission` (cascade delete) |
| **UserRole** | `id`, `userId`, `roleId` | `User`, `Role` (cascade delete) |

#### Users (3 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | `id`, `email` (unique), `name`, `password`, `image`, `isActive`, `emailVerified` | `UserRole[]`, `Customer?`, `AuditLog[]`, `Media[]` |
| **Customer** | `id`, `userId` (unique), `phone`, `avatar` | `User`, `Address[]`, `Review[]`, `Order[]` |
| **Address** | `id`, `customerId`, `type`, `line1`, `line2`, `city`, `state`, `postalCode`, `country`, `isDefault` | `Customer` |

#### Catalog (8 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Category** | `id`, `name` (unique), `slug` (unique), `description`, `image`, `parentId`, `sortOrder`, `isActive` | `Category[]` (self), `Product[]` |
| **Brand** | `id`, `name` (unique), `slug` (unique), `logo`, `description`, `website`, `isActive` | `Product[]` |
| **Product** | `id`, `name`, `slug` (unique), `sku`, `barcode`, `description`, `specifications`, `features`, `costPrice`, `sellingPrice`, `discountPrice`, `thumbnail`, `gallery`, `videos`, `metaTitle`, `metaDescription`, `metaKeywords`, `status`, `isFeatured`, `isNewArrival`, `isBestSeller`, `totalSold`, `averageRating`, `reviewCount`, `categoryId`, `brandId` | `Category`, `Brand`, `ProductImage[]`, `ProductVariant[]`, `Review[]`, `FlashSaleProduct[]` |
| **ProductImage** | `id`, `productId`, `url`, `alt`, `sortOrder` | `Product` |
| **ProductVariant** | `id`, `productId`, `name`, `price`, `discountPrice`, `thumbnail`, `isActive` | `Product`, `ProductVariantValue[]`, `CartItem[]`, `OrderItem[]`, `Inventory` |
| **ProductVariantValue** | `id`, `variantId`, `attributeValueId` | `ProductVariant`, `AttributeValue` |
| **Attribute** | `id`, `name` (unique), `slug` (unique) | `AttributeValue[]` |
| **AttributeValue** | `id`, `attributeId`, `value`, `meta` (JSON), `sortOrder` | `Attribute`, `ProductVariantValue[]` |

#### Inventory (2 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Inventory** | `id`, `productId`?, `variantId`?, `quantity`, `lowStockAlert` | `ProductVariant`, `InventoryLog[]` |
| **InventoryLog** | `id`, `inventoryId`, `type` (IN/OUT/ADJUSTMENT), `quantity`, `note`, `userId` | `Inventory` |

#### Cart & Wishlist (3 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Cart** | `id`, `customerId`?, `sessionId`?, `expiresAt` | `CartItem[]` |
| **CartItem** | `id`, `cartId`, `productId`?, `variantId`?, `quantity` | `Cart`, `ProductVariant` |
| **Wishlist** | `id`, `customerId`, `productId`, `createdAt` | `Customer`, `Product` |

#### Orders (4 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Order** | `id`, `orderNumber` (unique), `customerId`, `status`, `subtotal`, `shippingCost`, `taxAmount`, `discountAmount`, `total`, `shippingAddressId`, `billingAddressId`, `notes`, `paidAt`, `shippedAt`, `deliveredAt`, `cancelledAt` | `Customer`, `OrderItem[]`, `Payment[]`, `OrderTimeline[]` |
| **OrderItem** | `id`, `orderId`, `productId`?, `variantId`?, `name`, `sku`, `image`, `quantity`, `unitPrice`, `totalPrice` | `Order`, `ProductVariant` |
| **OrderTimeline** | `id`, `orderId`, `status`, `note`, `createdAt` | `Order` |
| **Payment** | `id`, `orderId`, `method`, `transactionId`, `amount`, `status`, `paidAt` | `Order` |

#### Promotions (3 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Coupon** | `id`, `code` (unique), `type` (PERCENTAGE/FIXED/FREE_SHIPPING), `value`, `minOrderAmount`, `maxUses`, `usedCount`, `isActive`, `startsAt`, `expiresAt` | — |
| **FlashSale** | `id`, `name`, `slug` (unique), `discountType`, `discountValue`, `startsAt`, `endsAt`, `isActive` | `FlashSaleProduct[]` |
| **FlashSaleProduct** | `id`, `flashSaleId`, `productId` | `FlashSale`, `Product` |

#### Reviews (1 model)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Review** | `id`, `productId`, `customerId`, `rating` (1-5), `title`, `comment`, `isApproved`, `isVerifiedPurchase` | `Product`, `Customer` |

#### CMS (5 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Banner** | `id`, `title`, `image`, `mobileImage`, `link`, `linkText`, `position`, `sortOrder`, `isActive`, `startsAt`, `endsAt` | — |
| **Page** | `id`, `title`, `slug` (unique), `content`, `metaDescription`, `isPublished`, `publishedAt` | — |
| **Blog** | `id`, `title`, `slug` (unique), `excerpt`, `content`, `image`, `author`, `tags`, `isPublished`, `publishedAt` | — |
| **Newsletter** | `id`, `email` (unique), `isActive`, `subscribedAt` | — |
| **Setting** | `id`, `key` (unique), `value`, `type`, `group`, `description` | — |

#### Media & Audit (2 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **Media** | `id`, `filename`, `originalName`, `mimeType`, `size`, `url`, `alt`, `width`, `height`, `folder`, `uploadedBy`, `createdAt` | — |
| **AuditLog** | `id`, `userId`, `action`, `entity`, `entityId`, `details` (JSON), `ipAddress`, `userAgent` | `User` |

---

## 5. API Routes

**Directory:** `src/app/api/` (17 route groups, 40+ endpoints)

### 5.1 Response Format

All endpoints return JSON:
```json
{
  "success": true,
  "data": { ... },
  "error": "message if failed",
  "meta": { "page", "limit", "total", "totalPages" }
}
```

### 5.2 Public (Store-Facing) APIs

| Group | Endpoint | Methods | Purpose |
|-------|----------|---------|---------|
| Auth | `/api/auth/login` | POST | Login with email/password |
| Auth | `/api/auth/register` | POST | Register new user |
| Auth | `/api/auth/logout` | POST | Logout |
| Auth | `/api/auth/me` | GET | Get current user |
| Products | `/api/products` | GET | List/search/filter/sort/paginate products |
| Products | `/api/products/[id]` | GET | Single product with variants, images, reviews |
| Categories | `/api/categories` | GET | All categories (hierarchical with subcategories) |
| Brands | `/api/brands` | GET | All brands with product counts |
| Orders | `/api/orders` | GET | Customer orders |
| Orders | `/api/orders/[id]` | GET | Order detail with items, timeline, payment |
| Reviews | `/api/reviews` | GET/POST | List reviews / create review |
| Coupons | `/api/coupons/validate` | POST | Validate coupon code |
| Banners | `/api/banners` | GET | Active banners (filterable by position) |
| Settings | `/api/settings` | GET | Public store settings |
| Newsletter | `/api/newsletter` | POST | Subscribe email |
| Stats | `/api/stats` | GET | Public store statistics |
| Chat | `/api/chat` | POST | AI chat assistant (z-ai-web-dev-sdk) |
| Returns | `/api/returns` | POST | Submit return request |
| Wishlist | `/api/wishlist` | GET/POST/DELETE | Manage wishlist |

### 5.3 Admin CRUD APIs

| Group | Endpoint | Methods | Purpose |
|-------|----------|---------|---------|
| Products | `/api/admin/products` | GET/POST | List/create products |
| Products | `/api/admin/products/[id]` | GET/PUT/DELETE | Read/update/delete product |
| Categories | `/api/admin/categories` | GET/POST | List/create categories |
| Categories | `/api/admin/categories/[id]` | PUT/DELETE | Update/delete category |
| Brands | `/api/admin/brands` | GET/POST | List/create brands |
| Brands | `/api/admin/brands/[id]` | PUT/DELETE | Update/delete brand |
| Orders | `/api/admin/orders` | GET | List all orders |
| Orders | `/api/admin/orders/[id]` | GET/PUT | Order detail / update status |
| Customers | `/api/admin/customers` | GET | List customers with stats |
| Customers | `/api/admin/customers/[id]` | GET | Customer detail |
| Coupons | `/api/admin/coupons` | GET/POST | List/create coupons |
| Coupons | `/api/admin/coupons/[id]` | PUT/DELETE | Update/delete coupon |
| Reviews | `/api/admin/reviews` | GET | List reviews |
| Reviews | `/api/admin/reviews/[id]` | PUT/DELETE | Approve/delete review |
| Blog | `/api/admin/blog` | GET/POST | List/create posts |
| Blog | `/api/admin/blog/[id]` | GET/PUT/DELETE | Read/update/delete post |
| Pages | `/api/admin/pages` | GET/POST | List/create CMS pages |
| Pages | `/api/admin/pages/[id]` | GET/PUT/DELETE | Read/update/delete page |
| Banners | `/api/admin/banners` | GET/POST | List/create banners |
| Banners | `/api/admin/banners/[id]` | PUT/DELETE | Update/delete banner |
| Flash Sales | `/api/admin/flash-sales` | GET/POST | List/create flash sales |
| Flash Sales | `/api/admin/flash-sales/[id]` | PUT/DELETE | Update/delete flash sale |
| Inventory | `/api/admin/inventory` | GET | List inventory |
| Inventory | `/api/admin/inventory/[id]` | PUT | Update stock / adjust |
| Inventory | `/api/admin/inventory/logs` | GET | Inventory audit logs |
| Newsletter | `/api/admin/newsletter` | GET | List subscribers |
| Newsletter | `/api/admin/newsletter/[id]` | DELETE | Remove subscriber |
| Audit Logs | `/api/admin/audit-logs` | GET | List audit logs |
| Media | `/api/admin/media` | GET/POST | List/upload media files |
| Media | `/api/admin/media/[id]` | GET/DELETE | Get/delete media item |
| Stats | `/api/admin/stats` | GET | Dashboard statistics |
| Settings | `/api/admin/settings` | GET/PUT | Read/update settings |

---

## 6. Store Frontend Components

**Directory:** `src/components/store/` (39 files)

### 6.1 Application Shell

| Component | File | Purpose |
|-----------|------|---------|
| **StoreApp** | `store-app.tsx` | Root SPA router — page switching, header/footer layout, mounts global widgets (chat, cookie consent, newsletter popup, promo bar, PWA prompt, offline indicator, back-to-top, recently viewed, keyboard shortcuts) |
| **StoreHeader** | `store-header.tsx` | Top nav — logo, search, categories dropdown, cart icon with badge, wishlist icon, account menu, mobile hamburger with Framer Motion slide-in menu |
| **StoreFooter** | `store-footer.tsx` | Footer — link columns (shop, help, about, legal), newsletter signup, social icons, payment icons, copyright |

### 6.2 Page Components

| Component | File | Purpose |
|-----------|------|---------|
| **HomePage** | `home-page.tsx` | Landing — hero carousel (Embla), featured products, category showcase, flash sale countdown, trending products, newsletter CTA, Framer Motion stagger animations |
| **ProductListPage** | `product-list-page.tsx` | Listing — grid/list toggle, sort, facet sidebar (categories, brands, price range, ratings), pagination, active filter chips, mobile filter drawer |
| **ProductDetailPage** | `product-detail-page.tsx` | Detail — image gallery with zoom, variant selector (attributes), price with compare-at, stock indicator, quantity, add-to-cart/buy-now, tabbed details (description, specs, reviews), social share, recently viewed |
| **ProductCard** | `product-card.tsx` | Card — image with hover zoom, badges (sale/new), title, price with strikethrough, rating stars, quick add-to-cart, wishlist heart |
| **CartPage** | `cart-page.tsx` | Cart — line items with image/name/price/quantity/remove, subtotal, coupon input, proceed to checkout, empty state |
| **CartSidebar** | `cart-sidebar.tsx` | Slide-out cart drawer — compact version of cart page |
| **CartDrawer** | `cart-drawer.tsx` | Alternative cart drawer |
| **CheckoutPage** | `checkout-page.tsx` | Multi-step checkout — shipping address, payment method, order summary, place order, success confirmation |
| **AuthPage** | `auth-page.tsx` | Login/register tabs — email/password forms, validation, error display, redirect on success |
| **AccountPage** | `account-page.tsx` | Customer dashboard — profile, order history with status badges, address book, default address |
| **WishlistPage** | `wishlist-page.tsx` | Wishlist — product cards, move to cart, remove, empty state |
| **SearchPage** | `search-page.tsx` | Search results — query, filters, grid/list toggle, sort, pagination, no results state |
| **ReturnRequestPage** | `return-request-page.tsx` | Return form — order selection, item selection, reason, description, submit |
| **ContactPage** | `contact-page.tsx` | Contact form — name, email, subject, message, validation |
| **FAQPage** | `faq-page.tsx` | FAQ accordion — categories, search, expand/collapse all |
| **GiftCardPage** | `gift-card-page.tsx` | Gift cards — amount selection, custom amount, recipient, message, preview |
| **DealsPage** | `deals-page.tsx` | Deals — active flash sales, coupon codes with copy, countdown timers |
| **ShippingPage** | `shipping-page.tsx` | Shipping policy |
| **AboutPage** | `about-page.tsx` | About us |
| **BlogPage** | `blog-page.tsx` | Blog index — card grid, categories, search, pagination |
| **BlogDetailPage** | `blog-detail-page.tsx` | Blog post — featured image, content, author, date, tags, social share, related posts |
| **OrderTrackingPage** | `order-tracking-page.tsx` | Order tracking — status timeline, items, estimated delivery, carrier |
| **ProductComparePage** | `product-compare-page.tsx` | Comparison — dynamic add/remove products, side-by-side attribute comparison |

### 6.3 Global Widgets

| Component | File | Purpose |
|-----------|------|---------|
| **ChatWidget** | `chat-widget.tsx` | Floating AI chat bubble — expandable panel, z-ai-web-dev-sdk |
| **CookieConsent** | `cookie-consent.tsx` | GDPR cookie banner — accept/decline, localStorage persist |
| **NewsletterPopup** | `newsletter-popup.tsx` | Exit-intent newsletter modal — email input, cookie-controlled |
| **PromoBar** | `promo-bar.tsx` | Top announcement bar — scrolling text, dismissible |
| **PWAInstallPrompt** | `pwa-install-prompt.tsx` | Before-install-prompt handler — custom install button |
| **OfflineIndicator** | `offline-indicator.tsx` | Network status — shows when offline, reconnection detection |
| **BackToTop** | `back-to-top.tsx` | Floating scroll-to-top button |
| **RecentlyViewed** | `recently-viewed.tsx` | Recently viewed strip — horizontal scroll, persisted |
| **QuickViewModal** | `quick-view-modal.tsx` | Quick product preview — image, price, variant select, add-to-cart |
| **SizeGuide** | `size-guide.tsx` | Size chart modal with measurements |
| **SocialProof** | `social-proof.tsx` | Recent purchase notifications — fade in/out |
| **SocialShare** | `social-share.tsx` | Share buttons — Facebook, Twitter, WhatsApp, copy link |
| **NotificationCenter** | `notification-center.tsx` | Bell-icon dropdown — unread count, notifications, mark read |

---

## 7. Admin Dashboard Components

**Directory:** `src/components/admin/` (24 files)

### 7.1 Application Shell

| Component | File | Purpose |
|-----------|------|---------|
| **AdminApp** | `admin-app.tsx` | Root SPA router — sidebar + header layout, page switching via `useNavStore`, responsive sidebar collapse, mobile drawer (Sheet) |
| **AdminSidebar** | `admin-sidebar.tsx` | Navigation sidebar — logo, menu groups (Dashboard, Catalog, Orders, Customers, Marketing, Content, Settings), active state, collapse/expand toggle |
| **AdminHeader** | `admin-header.tsx` | Top bar — hamburger toggle, search, notification bell, theme toggle, user avatar dropdown (profile, settings, logout, switch to store) |

### 7.2 Management Pages

| Component | File | Purpose |
|-----------|------|---------|
| **DashboardPage** | `dashboard-page.tsx` | Admin home — stat cards (revenue, orders, customers, products), revenue chart (Recharts), recent orders table, top products, order status pie, period selector |
| **AnalyticsPage** | `analytics-page.tsx` | Advanced analytics — revenue area chart, sales by category pie, top products bar, customer growth, order trends |
| **ProductsPage** | `products-page.tsx` | Product list — DataTable (image, name, SKU, category, price, stock, status), search, filters, bulk actions, create button |
| **ProductFormPage** | `product-form-page.tsx` | Create/edit form — name, slug, rich text description, pricing, SKU, barcode, category/brand, tags, SEO, images gallery, variants, active/featured toggles |
| **OrdersPage** | `orders-page.tsx` | Orders list — DataTable (order#, customer, date, status, total), status filter, date range, search |
| **OrderDetailPage** | `order-detail-page.tsx` | Order detail — customer info, addresses, items, payment, status timeline, status update, notes |
| **CustomersPage** | `customers-page.tsx` | Customers list — DataTable, search, orders/spent columns, status badge |
| **CustomerDetailPage** | `customer-detail-page.tsx` | Customer profile — info card, addresses, order history, total spent |
| **CategoriesPage** | `categories-page.tsx` | Category tree — nested view, dnd-kit drag-drop reorder, expand/collapse, inline edit, add child, delete |
| **BrandsPage** | `brands-page.tsx` | Brands list — DataTable, logo, name, slug, website, active badge |
| **BannersPage** | `banners-page.tsx` | Banners list — DataTable, image preview, title, link, sort order, active toggle, date range |
| **BlogPage** | `blog-page.tsx` | Blog posts list — DataTable, image, title, author, published status, date |
| **PagesPage** | `pages-page.tsx` | CMS pages list — DataTable, title, slug, published status |
| **CouponsPage** | `coupons-page.tsx` | Coupons list — DataTable, code, type badge, value, min order, uses, active toggle |
| **FlashSalesPage** | `flash-sales-page.tsx` | Flash sales list — DataTable, name, discount, date range, active toggle |
| **ReviewsPage** | `reviews-page.tsx` | Reviews list — DataTable, product, customer, rating, comment, approve/delete |
| **SettingsPage** | `settings-page.tsx` | Settings form — General, Shipping, Payments, SEO, Social — key-value save |
| **InventoryPage** | `inventory-page.tsx` | Inventory — DataTable (SKU, product, stock, threshold, reserved, available), low stock filter, adjustment modal with reason |
| **MediaPage** | `media-page.tsx` | Media library — grid view, folders, search, upload, pagination, delete, copy URL, edit alt/folder |
| **NewsletterPage** | `newsletter-page.tsx` | Subscribers list — DataTable, email, date, active status, delete |
| **AuditLogsPage** | `audit-logs-page.tsx` | Audit logs — DataTable, timestamp, user, action, entity, IP, date range filter |

---

## 8. Shared Components

**Directory:** `src/components/shared/` (6 files)

| Component | Purpose |
|-----------|---------|
| **MediaGallery** | Full media browser/selector dialog — grid view, folder tabs, search, upload dropzone, multi-select, preview modal, delete, pagination (802 lines) |
| **MediaPickerButton** | Button that opens MediaGallery, returns selected URL — used in product, banner, blog, brand, category forms |
| **ThemeToggle** | Light/dark/system theme switcher (sun/moon icons) via `next-themes` |
| **BreadcrumbNav** | Dynamic breadcrumb trail with navigation links |
| **KeyboardShortcuts** | Global keyboard handler — `?` help, `g+s` store, `g+a` admin, `g+p` products, `g+o` orders, `/` search, Escape close |
| **BackToTop** | Scroll-to-top button with progress ring |

---

## 9. State Management

**Directory:** `src/stores/` (8 Zustand stores)

| Store | File | Persist? | Key State | Key Actions |
|-------|------|----------|-----------|-------------|
| **NavStore** | `nav-store.ts` | No | `viewMode` (store/admin), `page`, `adminPage`, `previousPage`, `sidebarOpen`, `searchQuery` | `navigate()`, `setViewMode()`, `goBack()`, `toggleAdminSidebar()`, `setSearchQuery()` |
| **CartStore** | `cart-store.ts` | Yes | `items[]`, `couponCode`, `discount`, `notes` | `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `applyCoupon()`, `removeCoupon()`, computed `itemCount`, `subtotal`, `total` |
| **AuthStore** | `auth-store.ts` | Yes | `user`, `isAuthenticated`, `isLoading` | `login()`, `register()`, `logout()`, `checkAuth()`, `updateUser()` |
| **WishlistStore** | `wishlist-store.ts` | Yes | `items[]` | `toggleItem()`, `isInWishlist()`, `clearWishlist()` |
| **RecentlyViewedStore** | `recently-viewed-store.ts` | Yes | `items[]` (max N) | `addItem()`, `clear()` |
| **CompareStore** | `compare-store.ts` | Yes | `items[]` (max 4) | `toggleItem()`, `isInCompare()`, `clearCompare()` |
| **GiftCardStore** | `gift-card-store.ts` | Yes | Purchase flow state | — |
| **RewardStore** | `reward-store.ts` | Yes | Loyalty points state | — |

---

## 10. Custom Hooks & Utilities

### 10.1 Hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| **useToast** | `use-toast.ts` | Toast notification hook wrapping Radix UI — reducer-based, returns `{ id, dismiss, update }` |
| **useMobile** | `use-mobile.ts` | Responsive detection — returns `isMobile` boolean, configurable breakpoint (default 768px) |

### 10.2 Library Utilities (`src/lib/`)

| File | Exports | Purpose |
|------|---------|---------|
| **db.ts** | `db` (PrismaClient singleton) | Global singleton with `globalThis` caching for hot-reload safety, query logging enabled |
| **api.ts** | `apiClient`, `login()`, `register()`, `logout()`, `getMe()`, `getProducts()`, `getProduct()`, `getCategories()`, `getBrands()`, `getOrders()`, `getOrder()`, `getReviews()`, `createReview()`, `validateCoupon()`, `getBanners()`, `getSettings()`, `subscribeNewsletter()`, `getStats()` | Typed API client with JSON parsing + error handling, full TypeScript interfaces |
| **utils.ts** | `cn()` (clsx + tailwind-merge) | Class name merging utility |

---

## 11. Seed Data

**File:** `prisma/seed.ts` (2023 lines)
**Execution:** `tsx prisma/seed.ts`

### Seeded Entities

| Entity | Count | Details |
|--------|-------|---------|
| Roles | 6 | superadmin, admin, manager, editor, customer, guest |
| Permissions | 34 | CRUD across all modules |
| Users | 8 | 1 superadmin, 1 admin, 1 manager, 5 customers |
| Customers | 5 | Linked to customer users |
| Categories | 20 | 5 parents + 15 subcategories (Electronics, Fashion, Home, Books, Sports) |
| Brands | 12 | TechPro, StyleCraft, HomeEssence, PageTurner, FitGear, etc. |
| Attributes | 4 | Size (S/M/L/XL), Color (Red/Blue/Green/Black/White), Storage (128GB-1TB), Material |
| Products | 30 | 10 Electronics, 6 Fashion, 6 Home, 4 Books, 4 Sports |
| Product Variants | 78 | 2-4 per product across attributes |
| Inventory Records | 108 | Quantities with low-stock thresholds |
| Banners | 5 | Hero slides with images, links, sort order |
| Coupons | 3 | WELCOME10 (10% off), SAVE20 ($20 off $100), FREESHIP (free shipping) |
| Orders | 10 | Various statuses with items, payments, timeline |
| Reviews | 15 | 1-5 star ratings |
| Blog Posts | 5 | Published articles with images and tags |
| CMS Pages | 5 | About, Shipping, Returns, FAQ, Privacy Policy |
| Settings | 27 | Store name, logo, contact, social links, shipping rates, payment methods, SEO |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `superadmin@shop.com` | `admin123` |
| Admin | `admin@shop.com` | `admin123` |
| Manager | `manager@shop.com` | `admin123` |
| Customers | `customer1@shop.com` through `customer5@shop.com` | `customer123` |

---

## 12. Development Worklog Summary

**File:** `worklog.md` (3036+ lines, 16 stages)

| Stage | Focus Area | Key Deliverables |
|-------|-----------|-----------------|
| 1 | Project initialization | Architecture planning, todo creation |
| 2 | Database schema | 30+ Prisma models with full relationships |
| 2a | Seed script | 2023-line seeder with comprehensive demo data |
| 2b | API routes | 40+ REST endpoints |
| 3 | Store frontend | 17 initial components (pages, cart, checkout, auth, wishlist) |
| 4 | Admin dashboard | Initial admin (dashboard, products, orders, customers) |
| 5 | Image optimization | Next.js Image + sharp config |
| 6 | State management | Zustand stores (auth, cart, wishlist, recently viewed, compare, nav) |
| 7 | UI polish | Framer Motion animations, transitions, responsive |
| 8 | Admin enhancements | Banner, blog, pages, coupon, flash-sale management |
| 9 | Store polish | Newsletter popup, cookie consent, PWA, offline indicator, social proof |
| 10 | Advanced admin | Inventory + audit logs, settings CRUD, media library, newsletter |
| 11 | Enhanced features | AI chat, comparison, gift cards, rewards, FAQ, contact, size guide |
| 12 | Admin analytics | Recharts dashboard (revenue, orders, categories, top products) |
| 13 | Store components | Blog, order tracking, recently viewed, quick view, back-to-top, keyboard shortcuts |
| 14 | Dark mode + QA | Theme toggle, dark mode across all pages, bug fixes |
| 15 | Final QA + Polish | Audit logs page, analytics page, responsive fixes, performance |
| 16 | Media overhaul | Full media gallery (802 lines), media picker, admin media library |

---

## 13. Non-Functional Requirements

### 13.1 Performance

| Requirement | Implementation |
|-------------|---------------|
| Page transitions | Client-side SPA routing — no full-page loads |
| API caching | TanStack Query for deduplication and caching |
| State persistence | Zustand + localStorage reduces API calls on refresh |
| Image loading | Lazy loading with `loading="lazy"` attribute |
| Build output | Next.js standalone for minimized deployment footprint |
| Bundle size | Client components only, no server bundle for pages |

### 13.2 Security

| Requirement | Status | Notes |
|-------------|--------|-------|
| Password storage | ⚠️ DEMO ONLY | Plain-text comparison, NOT production-safe |
| API authorization | ⚠️ PARTIAL | RBAC model exists, enforcement varies by route |
| Audit logging | ✅ Complete | AuditLog model tracks all admin actions |
| Input validation | ✅ Zod schemas on forms | Client-side validation |
| CORS | ✅ Same-origin by default | Next.js API routes |

### 13.3 Accessibility

| Requirement | Implementation |
|-------------|---------------|
| ARIA attributes | Radix UI primitives with built-in ARIA |
| Keyboard navigation | Global keyboard shortcut handler |
| Focus management | Radix dialog/popover focus trapping |
| Screen reader | Semantic HTML, `sr-only` utility classes |
| Color contrast | oklch color palette with WCAG-compliant ratios |

### 13.4 Browser Support

| Requirement | Status |
|-------------|--------|
| Modern browsers | ✅ Chrome, Firefox, Safari, Edge |
| PWA | ✅ Manifest + service worker + install prompt |
| Offline | ✅ Offline indicator with reconnection detection |
| Mobile responsive | ✅ All breakpoints, mobile drawer navigation |

### 13.5 Internationalization

| Requirement | Status |
|-------------|--------|
| next-intl | 📦 Dependency installed (^4.3.4), NOT yet configured in components |

---

## 14. Future Roadmap

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **P0** | Production auth (JWT/bcrypt) | Plain-text passwords are insecure |
| **P0** | API route authorization middleware | RBAC must be enforced server-side |
| **P1** | SSR for store pages | SEO for product/category pages |
| **P1** | Payment integration (Stripe/PayPal) | Real payment processing |
| **P1** | Email notifications | Order confirmations, shipping updates |
| **P2** | Internationalization (next-intl) | Multi-language support |
| **P2** | Real-time inventory (WebSocket) | Accurate stock across sessions |
| **P2** | Admin roles & permissions UI | Dynamic permission assignment |
| **P3** | Wishlist sharing | Social commerce |
| **P3** | Customer review images | Enhanced UGC |
| **P3** | Abandoned cart recovery | Revenue recovery |
| **P4** | Mobile app (React Native / PWA) | Native experience |
| **P4** | Multi-vendor marketplace | Platform expansion |
