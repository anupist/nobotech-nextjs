# ShopHub — E-Commerce Platform

A full-featured single-page application (SPA) e-commerce platform built with Next.js 16 and TypeScript. Includes both a customer-facing storefront and a complete admin dashboard in a single codebase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | MySQL 8 + Prisma 6 ORM |
| CSS | Tailwind CSS 4 + shadcn/ui (new-york) |
| State | Zustand 5 (client) + TanStack Query 5 (server) |
| Animations | Framer Motion 12 |
| Charts | Recharts 2 |
| Auth | Plain-text password (demo mode) |
| Deployment | Standalone output + Caddy reverse proxy |

## Prerequisites

- Node.js 22+
- MySQL 8+
- npm or bun

## Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Set up MySQL database
# Create a database named nobitech_nextjs
# Ensure MySQL user exists for 127.0.0.1 (not just localhost)
#   CREATE USER 'root'@'127.0.0.1' IDENTIFIED BY '';
#   GRANT ALL PRIVILEGES ON nobitech_nextjs.* TO 'root'@'127.0.0.1';
#   CREATE USER 'root'@'%' IDENTIFIED BY '';
#   GRANT ALL PRIVILEGES ON nobitech_nextjs.* TO 'root'@'%';
#   FLUSH PRIVILEGES;

# 3. Configure environment
# Edit .env with your MySQL connection string:
# DATABASE_URL=mysql://user:password@127.0.0.1:3306/nobitech_nextjs

# 4. Push schema and seed data
npm run db:push
npm run seed

# 5. Start development server
npm run dev
```

> **Windows note:** Dev server uses `--webpack` to avoid a Turbopack CSS panic. Production build uses Turbopack (works fine).

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build + copy static assets to standalone |
| `npm run seed` | Seed database with demo data |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:reset` | Reset database |
| `npm run lint` | Run ESLint (most rules disabled) |

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@shop.com | admin123 |
| Admin | admin@shop.com | admin123 |
| Manager | manager@shop.com | admin123 |
| Customer | customer1@shop.com — customer5@shop.com | customer123 |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (ThemeProvider, Toaster)
│   ├── page.tsx            # SPA entry — switches StoreApp / AdminApp
│   ├── globals.css         # Tailwind + CSS variables
│   └── api/                # 37 server-side route handlers
│       ├── products/       # Public API endpoints
│       ├── categories/
│       ├── orders/
│       ├── auth/
│       └── admin/          # Admin CRUD endpoints
├── components/
│   ├── store/              # 39 storefront components
│   ├── admin/              # 24 admin dashboard components
│   ├── shared/             # 6 shared components
│   └── ui/                 # 50+ shadcn/ui primitives
├── stores/                 # 8 Zustand stores (5 persisted)
├── lib/                    # Prisma client, API client, utilities
└── hooks/                  # Custom React hooks
```

## Architecture

- **SPA routing:** All navigation via `useNavStore` (Zustand) — URL never changes
- **View modes:** `StoreApp` (customer) and `AdminApp` (dashboard) switch via viewMode state
- **Data flow:** Components → `src/lib/api.ts` → Next.js API routes → Prisma → MySQL
- **State:** Zustand for client state, TanStack Query for server state, localStorage for persistence
- **Auth:** Plain-text password comparison (demo only — not production-safe)

## Features

### Storefront
- Product browsing with filtering, sorting, and search
- Product detail with variants, images, and reviews
- Shopping cart with coupon support
- Multi-step checkout
- Customer accounts with order history
- Wishlist, product comparison, gift cards
- Blog, FAQ, contact, shipping info pages
- AI chat assistant
- Dark mode, PWA support, keyboard shortcuts

### Admin Dashboard
- Analytics dashboard with revenue charts
- Product, category, brand management
- Order management with status timeline
- Customer management
- Coupon and flash sale management
- Blog and CMS page editor
- Media library with upload and folder organization
- Inventory management with audit logs
- Newsletter subscribers
- Settings management

## Deployment

Production uses Caddy as a reverse proxy:

```
Caddyfile (port 81) → reverse_proxy localhost:3000
Production start:      NODE_ENV=production bun .next/standalone/server.js
Build command:         next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
```

## License

Private — demo/pre-release
