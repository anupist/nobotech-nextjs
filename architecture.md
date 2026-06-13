# ShopHub — Architecture Document

**Project:** ShopHub  
**Repository:** `F:\laragon\www\nobitech-nextjs`  
**Version:** 0.2.0  
**Status:** Pre-release / Demo-ready  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Routing Architecture](#2-routing-architecture)
3. [Component Hierarchy](#3-component-hierarchy)
4. [Data Flow](#4-data-flow)
5. [State Management](#5-state-management)
6. [Database Schema](#6-database-schema)
7. [API Layer](#7-api-layer)
8. [Build & Deployment](#8-build--deployment)
9. [Key Architectural Decisions](#9-key-architectural-decisions)
10. [Project Directory Structure](#10-project-directory-structure)

---

## 1. System Overview

ShopHub is a **client-side SPA e-commerce platform** built with Next.js 16 (App Router) and TypeScript. It serves two modes within a single codebase:

- **Storefront** — Customer-facing shopping experience (browsing, cart, checkout, accounts)
- **Admin Dashboard** — Backend management (orders, products, customers, CMS, analytics)

```
┌──────────────────────────────────────────────────────┐
│                    Browser (SPA)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │            Root Layout (ThemeProvider)          │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │         page.tsx (viewMode switch)        │  │  │
│  │  │   ┌──────────┐       ┌──────────────┐   │  │  │
│  │  │   │ StoreApp │       │  AdminApp    │   │  │  │
│  │  │   └──────────┘       └──────────────┘   │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │          Next.js API Routes (Server-side)       │  │
│  │  /api/products/*    /api/admin/products/*      │  │
│  │  /api/categories    /api/admin/orders/*        │  │
│  │  /api/auth/*        /api/admin/media/*         │  │
│  │  ... (40+ endpoints)                           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │   Prisma ORM   │
               │  (PrismaClient)│
               └────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │    MySQL 8     │
               │  30+ models    │
               └────────────────┘
```

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (via Bun) | ^22 |
| Framework | Next.js (App Router) | ^16.1.1 |
| Language | TypeScript | ^5 |
| ORM | Prisma Client | ^6.11.1 |
| Database | MySQL 8+ | — |
| CSS | Tailwind CSS 4 + shadcn/ui | — |
| State (Client) | Zustand 5 | ^5.0.6 |
| State (Server) | TanStack React Query | ^5.82.0 |
| Animations | Framer Motion | ^12.23.2 |
| Charts | Recharts | ^2.15.4 |
| Build Output | `standalone` (self-contained) | — |

---

## 2. Routing Architecture

### 2.1 Hybrid SPA Model

The application uses a **true SPA routing model** — URL is NOT updated on navigation. All routing is managed client-side via Zustand (`useNavStore`). The root `page.tsx` switches between store and admin mode:

```
src/app/page.tsx (root — 'use client')
  └── viewMode === 'store'  →  <StoreApp />
  └── viewMode === 'admin'  →  <AdminApp />
```

### 2.2 Navigation State

**File:** `src/stores/nav-store.ts`

```typescript
interface NavState {
  viewMode: 'store' | 'admin'
  storePage: StorePage       // 25+ page identifiers
  adminPage: AdminPage       // 22+ page identifiers
  pageParams: Record<string, string>
  searchQuery: string
  history: Array<{ page, params, mode }>  // Navigation stack
}
```

- `navigateStore(page, params?)` — Switch store page, push to history
- `navigateAdmin(page, params?)` — Switch admin page, push to history
- `goBack()` — Pop from history stack
- `setViewMode(mode)` — Toggle between storefront and admin

### 2.3 Page Registry

**Store pages** (`StorePage` type): `home`, `products`, `product-detail`, `cart`, `checkout`, `wishlist`, `auth`, `account`, `search`, `blog`, `blog-detail`, `page`, `order-detail`, `order-tracking`, `compare`, `contact`, `faq`, `gift-cards`, `deals`, `shipping`, `about`, `return-request`

**Admin pages** (`AdminPage` type): `dashboard`, `analytics`, `products`, `add-product`, `edit-product`, `categories`, `brands`, `orders`, `order-detail`, `customers`, `reviews`, `coupons`, `flash-sales`, `banners`, `blog`, `pages`, `newsletter`, `settings`, `inventory`, `audit-logs`, `customer-detail`, `media`

### 2.4 API Routes (Server-side)

API routes live under `src/app/api/` and are standard Next.js Route Handlers — they run server-side and are NOT part of the SPA routing. Next.js compiles and serves them alongside the client bundle.

---

## 3. Component Hierarchy

### 3.1 Store App

```
RootLayout (ThemeProvider, Toaster)
  └── Home (page.tsx)
      └── StoreApp
          ├── PromoBar
          ├── StoreHeader
          ├── <main> (AnimatePresence + motion.div)
          │   ├── HomePage
          │   ├── ProductListPage
          │   ├── ProductDetailPage
          │   ├── CartPage
          │   ├── CheckoutPage
          │   ├── AuthPage
          │   ├── AccountPage
          │   ├── WishlistPage
          │   ├── SearchPage
          │   ├── BlogPage / BlogDetailPage
          │   ├── ContactPage / FAQPage
          │   ├── DealsPage / GiftCardPage
          │   ├── ShippingPage / AboutPage
          │   ├── ReturnRequestPage
          │   ├── CustomerOrderDetailPage
          │   ├── OrderTrackingPage
          │   └── ProductComparePage
          │   (switched via pageComponents registry map)
          ├── StoreFooter
          ├── CartSidebar (slide-out drawer)
          ├── ChatWidget (AI assistant bubble)
          ├── SocialProof
          ├── NewsletterPopup
          ├── BackToTop
          ├── KeyboardShortcuts
          ├── CookieConsent
          ├── PWAInstallPrompt
          └── OfflineIndicator
```

### 3.2 Admin App

```
AdminApp
  ├── AdminSidebar (desktop: inline, mobile: Sheet drawer)
  │   ├── Logo + collapse toggle
  │   ├── Menu groups
  │   │   ├── Dashboard, Analytics
  │   │   ├── Catalog (Products, Categories, Brands)
  │   │   ├── Orders, Customers
  │   │   ├── Marketing (Coupons, Flash Sales, Banners)
  │   │   ├── Content (Blog, Pages)
  │   │   └── Settings (Settings, Inventory, Media, Newsletter, Audit Logs)
  │   └── Active state indicators
  ├── AdminHeader
  │   ├── Hamburger toggle (mobile)
  │   ├── Search
  │   ├── Notification bell
  │   ├── Theme toggle
  │   └── User dropdown (profile, settings, logout, switch to store)
  └── <main> (switch/case on adminPage)
      ├── DashboardPage (stat cards, revenue chart, recent orders)
      ├── AnalyticsPage (advanced Recharts)
      ├── ProductsPage / ProductFormPage
      ├── CategoriesPage (dnd-kit tree)
      ├── BrandsPage
      ├── OrdersPage / OrderDetailPage
      ├── CustomersPage / CustomerDetailPage
      ├── CouponsPage / FlashSalesPage
      ├── BannersPage
      ├── BlogPage / PagesPage
      ├── SettingsPage
      ├── InventoryPage
      ├── ReviewsPage
      ├── MediaPage
      ├── NewsletterPage
      └── AuditLogsPage
```

### 3.3 Shared Components

```
src/components/shared/
  ├── MediaGallery        — Full media browser/selector dialog with upload
  ├── MediaPickerButton   — Button opening MediaGallery for URL selection
  ├── ThemeToggle         — Light/dark/system switcher
  ├── BreadcrumbNav       — Dynamic breadcrumb trail
  ├── KeyboardShortcuts   — Global keyboard shortcuts handler
  └── BackToTop           — Scroll-to-top with progress ring
```

### 3.4 UI Primitives (shadcn/ui)

50+ components in `src/components/ui/` generated via shadcn CLI (new-york style, RSC disabled): Button, Input, Dialog, Sheet, DropdownMenu, Table, Badge, Card, Tabs, Select, Popover, Command, Tooltip, Avatar, Skeleton, Carousel, Drawer, ScrollArea, Separator, Switch, Label, Textarea, Form, Checkbox, RadioGroup, Slider, Progress, Calendar, CalendarDateRangePicker, AlertDialog, ContextMenu, HoverCard, Menubar, NavigationMenu, Pagination, Resizable, ScrollArea, Select, Sheet, Skeleton, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, ToggleGroup, Tooltip

---

## 4. Data Flow

### 4.1 Request Pipeline

```
Browser Component
    │
    ▼
fetch() / useQuery() ────────────► src/lib/api.ts (typed client)
    │                                    │
    │                               GET /api/products
    ▼                                    │
src/app/api/products/route.ts            │
    │ (server-side Next.js route handler) │
    ▼                                    │
Prisma ORM (src/lib/db.ts)              │
    │ (PrismaClient singleton)           │
    ▼                                    │
MySQL 8                                   │
    │                                    │
    ◄──────── JSON response ────────────────┘
    │
    ▼
Component re-renders with data
```

### 4.2 Prisma Client Singleton

**File:** `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- Singleton pattern with `globalThis` caching prevents multiple instances during hot-reload
- Query logging enabled in non-production

### 4.3 API Client

**File:** `src/lib/api.ts`

- Typed fetch wrapper with JSON parsing + error handling
- Generic `fetchApi<T>(endpoint, options?)` function
- Typed interfaces for all entity types (Product, Category, Brand, Banner, Review, etc.)
- Helper functions: `fetchProducts()`, `fetchProduct()`, `fetchCategories()`, `fetchBrands()`, `fetchBanners()`, `fetchSettings()`, `validateCoupon()`, `createOrder()`, `submitReview()`, `subscribeNewsletter()`

### 4.4 Data Flow Patterns

| Pattern | When Used | Mechanism |
|---------|-----------|-----------|
| **Server-side fetch** | API route handlers | Direct Prisma queries in route.ts |
| **Client-side fetch** | Page components on mount | `useEffect` + `fetchApi()` or TanStack `useQuery` |
| **Form mutations** | Create/edit forms | `fetchApi()` with POST/PUT |
| **State persistence** | Cart, auth, wishlist | Zustand + localStorage persist middleware |
| **Optimistic updates** | Cart quantity, wishlist toggle | Direct store mutation before server sync |

---

## 5. State Management

### 5.1 Zustand Stores (8 stores)

| Store | File | Persisted? | Purpose |
|-------|------|-----------|---------|
| **NavStore** | `nav-store.ts` | No | View mode, current page, navigation history, search query |
| **CartStore** | `cart-store.ts` | Yes | Cart items, coupon, discount, computed totals |
| **AuthStore** | `auth-store.ts` | Yes | User session, authentication state |
| **WishlistStore** | `wishlist-store.ts` | Yes | Wishlist items, add/remove/check |
| **RecentlyViewedStore** | `recently-viewed-store.ts` | Yes | Recently viewed products (capped) |
| **CompareStore** | `compare-store.ts` | Yes | Product comparison list (max 4) |
| **GiftCardStore** | `gift-card-store.ts` | Yes | Gift card purchase flow |
| **RewardStore** | `reward-store.ts` | Yes | Loyalty points |

### 5.2 Data Relationships

```
Zustand (Client State)                  Server State
─────────────────────                   ────────────
CartStore ↔ localStorage                TanStack Query cache
AuthStore ↔ localStorage + /api/auth    (managed by useQuery/useMutation)
WishlistStore ↔ localStorage + /api/wishlist
NavStore (in-memory only)
RecentlyViewedStore ↔ localStorage
CompareStore ↔ localStorage
```

### 5.3 Key Design Decisions

- **localStorage persistence** — Cart, auth, wishlist, recently viewed, and compare data survive page refresh without server round-trips
- **In-memory navigation** — NavStore is NOT persisted; page state resets on full reload
- **Search query** — Stored in NavStore so it persists across store/admin switch but not across page refresh

---

## 6. Database Schema

### 6.1 Entity-Relationship Overview

**File:** `prisma/schema.prisma` (531 lines)  
**Provider:** MySQL 8  
**Total Models:** 30+

```
┌─────────────────────────────────────────────────────────┐
│                        RBAC                              │
│  Role ──< RolePermission >── Permission                 │
│    └──< UserRole >── User                               │
├─────────────────────────────────────────────────────────┤
│                      Users & Customers                   │
│  User ──< UserRole >── Role                             │
│  Customer ──< Address                                   │
│  User ── Customer (optional 1:1)                        │
├─────────────────────────────────────────────────────────┤
│                        Catalog                           │
│  Category (self-relation) ──< Product >── Brand         │
│  Product ──< ProductImage                                │
│  Product ──< ProductVariant ──< ProductVariantValue     │
│  Attribute ──< AttributeValue                            │
│  ProductVariantValue >── AttributeValue                  │
├─────────────────────────────────────────────────────────┤
│                      Inventory                           │
│  ProductVariant ── Inventory (1:1)                      │
│  Inventory ──< InventoryLog                             │
├─────────────────────────────────────────────────────────┤
│                   Carts & Wishlists                      │
│  Cart ──< CartItem >── ProductVariant                   │
│  Wishlist >── Product                                   │
├─────────────────────────────────────────────────────────┤
│                       Orders                             │
│  Order ──< OrderItem >── ProductVariant                 │
│  Order ──< Payment                                      │
│  Order ──< OrderTimeline                                │
├─────────────────────────────────────────────────────────┤
│                    Promotions                            │
│  Coupon                                                  │
│  FlashSale ──< FlashSaleProduct >── Product             │
├─────────────────────────────────────────────────────────┤
│                      Reviews                             │
│  Review >── Product, Review >── Customer                │
├─────────────────────────────────────────────────────────┤
│                  CMS & Media                             │
│  Banner, Page, Blog, Newsletter                         │
│  Setting (key-value store)                              │
│  AuditLog (tracks actions, IP, user agent)              │
│  Media (files, folder organization)                     │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Model Groups

| Group | Models | Key Fields |
|-------|--------|-----------|
| **RBAC** | Role, Permission, RolePermission, UserRole | slug-based, cascade delete |
| **Users** | User, Customer, Address | email unique, 1:1 User↔Customer |
| **Catalog** | Category (self-ref), Brand, Product, ProductVariant, ProductVariantValue, Attribute, AttributeValue, ProductImage | Polymorphic variant system |
| **Inventory** | Inventory, InventoryLog | 1:1 with Product or Variant |
| **Cart/Wishlist** | Cart, CartItem, Wishlist | sessionId for guests |
| **Orders** | Order, OrderItem, Payment, OrderTimeline | Status workflow, JSON addresses |
| **Promotions** | Coupon, FlashSale, FlashSaleProduct | Date-bound, usage-limited |
| **Reviews** | Review | rating 1-5, approval workflow |
| **CMS** | Banner, Page, Blog, Newsletter | Position-based banners |
| **System** | Setting, AuditLog, Media | Key-value settings, folder-based media |

### 6.3 Conventions

- **IDs:** CUID strings via `@default(cuid())`
- **Timestamps:** `createdAt` + `updatedAt` on all models
- **Soft references:** Optional foreign keys use `String?`
- **JSON fields:** Stored as `String? @db.Text` (no native JSON type in MySQL 8 via Prisma)
- **Cascading deletes:** Child records cascade from parents (`onDelete: Cascade`)

---

## 7. API Layer

### 7.1 Route Structure

```
src/app/api/
├── auth/          login, register, logout, me
├── products/      GET list (filters, sort, pagination), GET by id
├── categories/    GET all (hierarchical)
├── brands/        GET all
├── banners/       GET active (by position)
├── orders/        GET customer orders, POST create
├── reviews/       GET list, POST create
├── coupons/       POST validate
├── newsletter/    POST subscribe
├── settings/      GET public
├── stats/         GET public stats
├── chat/          POST AI chat
├── wishlist/      GET/POST/DELETE
├── returns/       POST return request
└── admin/
    ├── products/      GET/POST/PUT
    ├── categories/    GET/POST/PUT/DELETE
    ├── brands/        GET/POST/PUT/DELETE
    ├── orders/        GET/PUT
    ├── customers/     GET
    ├── coupons/       GET/POST/PUT/DELETE
    ├── reviews/       GET/PUT/DELETE
    ├── blog/          GET/POST/PUT/DELETE
    ├── pages/         GET/POST/PUT/DELETE
    ├── banners/       GET/POST/PUT/DELETE
    ├── flash-sales/   GET/POST/PUT/DELETE
    ├── inventory/     GET/PUT (+ logs sub-route)
    ├── newsletter/    GET/DELETE
    ├── audit-logs/    GET
    ├── media/         GET/POST/DELETE
    └── settings/      GET/PUT
```

### 7.2 Response Format

All endpoints return a consistent JSON envelope:

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 7.3 Route Handler Pattern

```typescript
// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // ... parse query params, build Prisma where clause
    const [products, total] = await Promise.all([
      db.product.findMany({ where, ... }),
      db.product.count({ where }),
    ])
    return NextResponse.json({ success: true, data: products, meta })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

### 7.4 Public vs Admin Separation

| Aspect | Public APIs | Admin APIs |
|--------|-----------|-----------|
| Prefix | `/api/{resource}` | `/api/admin/{resource}` |
| Auth | Optional (user context) | Required (admin role) |
| Filtering | Active/visible only | All records |
| Pagination | Yes | Yes |
| Write access | Limited (reviews, newsletter) | Full CRUD |

---

## 8. Build & Deployment

### 8.1 Build Configuration

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: "standalone",     // Self-contained deployment
  typescript: {
    ignoreBuildErrors: true, // Demo-mode pragmatism
  },
  reactStrictMode: false,    // Avoids double-render in dev
}
```

### 8.2 Development Scripts

```json
{
  "dev": "next dev -p 3000 --webpack",
  "build": "next build",
  "start": "next start -p 3000",
  "seed": "tsx prisma/seed.ts"
}
```

- `--webpack` flag required on Windows (Turbopack panics on CSS processing)
- Production build uses Turbopack (compiles successfully)

### 8.3 Production Deployment

```
Caddyfile (reverse proxy)
    │
    ▼
next start (standalone) :3000
    │
    ▼
MySQL 8 :3306
```

- Caddy handles TLS termination, static file serving, and reverse proxy to Next.js
- Standalone output includes all necessary runtime files in `.next/standalone/`
- Static assets served from `.next/static/` and `/public/`

---

## 9. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **SPA routing** | Faster page transitions, no full-page loads, simpler state management |
| **No SSR for pages** | Admin panel doesn't need SEO; store can be enhanced later with SSR |
| **Zustand over Redux** | Minimal boilerplate, built-in persist middleware, TypeScript-native |
| **TanStack Query** | Automatic caching, deduplication, background refetching for server state |
| **localStorage persist** | Cart, auth, wishlist survive page refresh without server round-trips |
| **Plain-text passwords** | Demo-mode simplicity (NOT production-safe) |
| **Prisma with MySQL** | Robust relational DB, type-safe queries, schema migrations |
| **Client components only** | Avoids hydration mismatch; simpler mental model |
| **Standalone output** | Self-contained deployment with minimal runtime dependencies |
| **tailwind-merge (cn())** | Clean class merging for shadcn/ui component composition |
| **127.0.0.1 in DATABASE_URL** | Prisma connects via TCP; MySQL `root@localhost` only accepts socket connections |
| **Webpack for dev (Windows)** | Turbopack panics on this Windows environment with PostCSS/lightningcss |

---

## 10. Project Directory Structure

```
F:\laragon\www\nobitech-nextjs\
│
├── .env                          # DATABASE_URL (MySQL)
├── .gitignore
├── Caddyfile                     # Production reverse proxy config
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs
├── next.config.ts                # standalone output, ignore TS errors
├── package.json                  # 80+ dependencies
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json                 # @/ → ./src/*
│
├── prisma/
│   ├── schema.prisma             # 30+ database models (531 lines)
│   ├── migrations/               # MySQL migration files
│   └── seed.ts                   # Comprehensive seed script (2023 lines)
│
├── public/
│   ├── uploads/                  # Media uploads directory
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── *.svg                     # Icons and logos
│
└── src/
    ├── app/
    │   ├── layout.tsx            # Root layout (ThemeProvider, Toaster)
    │   ├── page.tsx              # Root SPA entry (viewMode switch)
    │   ├── globals.css           # Tailwind CSS variables + custom styles
    │   │
    │   └── api/                  # 40+ REST endpoints
    │       ├── auth/             # login, register, logout, me
    │       ├── products/         # GET (list + detail)
    │       ├── categories/       # GET
    │       ├── brands/           # GET
    │       ├── banners/          # GET
    │       ├── orders/           # GET, POST
    │       ├── reviews/          # GET, POST
    │       ├── coupons/          # POST validate
    │       ├── newsletter/       # POST
    │       ├── settings/         # GET (public)
    │       ├── stats/            # GET (public)
    │       ├── chat/             # POST AI chat
    │       ├── wishlist/         # GET/POST/DELETE
    │       ├── returns/          # POST
    │       │
    │       └── admin/            # Admin CRUD APIs
    │           ├── products/     # GET/POST/PUT
    │           ├── categories/   # GET/POST/PUT/DELETE
    │           ├── brands/       # GET/POST/PUT/DELETE
    │           ├── orders/       # GET/PUT
    │           ├── customers/    # GET
    │           ├── coupons/      # GET/POST/PUT/DELETE
    │           ├── reviews/      # GET/PUT/DELETE
    │           ├── blog/         # GET/POST/PUT/DELETE
    │           ├── pages/        # GET/POST/PUT/DELETE
    │           ├── banners/      # GET/POST/PUT/DELETE
    │           ├── flash-sales/  # GET/POST/PUT/DELETE
    │           ├── inventory/    # GET/PUT (+ logs)
    │           ├── newsletter/   # GET/DELETE
    │           ├── audit-logs/   # GET
    │           ├── media/        # GET/POST/DELETE
    │           └── settings/     # GET/PUT
    │
    ├── components/
    │   ├── store/                # 39 storefront components
    │   │   ├── store-app.tsx
    │   │   ├── store-header.tsx
    │   │   ├── store-footer.tsx
    │   │   ├── home-page.tsx
    │   │   ├── product-list-page.tsx
    │   │   ├── product-detail-page.tsx
    │   │   ├── product-card.tsx
    │   │   ├── cart-page.tsx
    │   │   ├── cart-sidebar.tsx
    │   │   ├── cart-drawer.tsx
    │   │   ├── checkout-page.tsx
    │   │   ├── auth-page.tsx
    │   │   ├── account-page.tsx
    │   │   ├── wishlist-page.tsx
    │   │   ├── search-page.tsx
    │   │   ├── blog-page.tsx
    │   │   ├── blog-detail-page.tsx
    │   │   ├── contact-page.tsx
    │   │   ├── faq-page.tsx
    │   │   ├── about-page.tsx
    │   │   ├── shipping-page.tsx
    │   │   ├── deals-page.tsx
    │   │   ├── gift-card-page.tsx
    │   │   ├── return-request-page.tsx
    │   │   ├── order-detail-page.tsx
    │   │   ├── order-tracking-page.tsx
    │   │   ├── product-compare-page.tsx
    │   │   ├── chat-widget.tsx
    │   │   ├── cookie-consent.tsx
    │   │   ├── newsletter-popup.tsx
    │   │   ├── promo-bar.tsx
    │   │   ├── pwa-install-prompt.tsx
    │   │   ├── offline-indicator.tsx
    │   │   ├── back-to-top.tsx
    │   │   ├── recently-viewed.tsx
    │   │   ├── quick-view-modal.tsx
    │   │   ├── size-guide.tsx
    │   │   ├── social-proof.tsx
    │   │   ├── social-share.tsx
    │   │   └── notification-center.tsx
    │   │
    │   ├── admin/                # 24 admin dashboard components
    │   │   ├── admin-app.tsx
    │   │   ├── admin-sidebar.tsx
    │   │   ├── admin-header.tsx
    │   │   ├── dashboard-page.tsx
    │   │   ├── analytics-page.tsx
    │   │   ├── products-page.tsx
    │   │   ├── product-form-page.tsx
    │   │   ├── categories-page.tsx
    │   │   ├── brands-page.tsx
    │   │   ├── orders-page.tsx
    │   │   ├── order-detail-page.tsx
    │   │   ├── customers-page.tsx
    │   │   ├── customer-detail-page.tsx
    │   │   ├── coupons-page.tsx
    │   │   ├── flash-sales-page.tsx
    │   │   ├── banners-page.tsx
    │   │   ├── blog-page.tsx
    │   │   ├── pages-page.tsx
    │   │   ├── settings-page.tsx
    │   │   ├── inventory-page.tsx
    │   │   ├── reviews-page.tsx
    │   │   ├── media-page.tsx
    │   │   ├── newsletter-page.tsx
    │   │   └── audit-logs-page.tsx
    │   │
    │   ├── shared/               # 6 shared components
    │   │   ├── media-gallery.tsx
    │   │   ├── media-picker-button.tsx
    │   │   ├── theme-toggle.tsx
    │   │   ├── breadcrumb-nav.tsx
    │   │   ├── keyboard-shortcuts.tsx
    │   │   └── back-to-top.tsx
    │   │
    │   └── ui/                   # 50+ shadcn/ui primitives
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── dialog.tsx
    │       ├── sheet.tsx
    │       ├── dropdown-menu.tsx
    │       ├── table.tsx
    │       ├── badge.tsx
    │       ├── card.tsx
    │       └── ... (50+ files)
    │
    ├── hooks/
    │   ├── use-toast.ts          # Toast notification hook
    │   └── use-mobile.ts         # Responsive detection hook
    │
    ├── lib/
    │   ├── db.ts                 # PrismaClient singleton
    │   ├── api.ts                # Typed API client (240 lines)
    │   └── utils.ts              # cn() class merging utility
    │
    └── stores/                   # 8 Zustand stores
        ├── nav-store.ts          # Navigation + view mode
        ├── cart-store.ts         # Shopping cart
        ├── auth-store.ts         # Authentication
        ├── wishlist-store.ts     # Wishlist
        ├── recently-viewed-store.ts
        ├── compare-store.ts
        ├── gift-card-store.ts
        └── reward-store.ts
```
