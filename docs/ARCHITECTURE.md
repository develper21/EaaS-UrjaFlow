# <div align="center">🏛️ System Architecture</div>

<div align="center">

## UrjaFlow – Energy as a Service Platform

</div>

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the **UrjaFlow** application.

---

## 1. High-Level Architecture

UrjaFlow follows a full-stack architecture using Next.js and PostgreSQL.

```
┌──────────────┐   HTTPS    ┌────────────────┐   Prisma    ┌──────────────┐
│     User     │◄──────────►│  Next.js App   │◄───────────►│  PostgreSQL  │
│  (Browser)   │            │ (UI + API)     │             │  Database    │
└──────────────┘            └───────┬────────┘             └──────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │  External Services│
                          │ Stripe · Email ·  │
                          │    IoT Feed       │
                          └───────────────────┘
```

- **User** interacts with the React frontend in the browser.
- **Next.js** serves both the UI (App Router pages) and the API layer.
- **PostgreSQL** stores all persistent data via **Prisma ORM**.
- **Stripe, Email (Nodemailer) and the IoT feed** are external services integrated on the backend.

## 2. Technology Stack

Technologies used in the project and their purpose.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 16 (App Router)** | UI framework and API layer |
| Language | **TypeScript** | Type-safe development |
| Styling | **Tailwind CSS** | Utility-first responsive styling |
| UI Charts | **Recharts** | Energy analytics visualizations |
| Icons | **Lucide React** | Consistent icon set |
| Backend | **Next.js API Routes + GraphQL** | REST endpoints + GraphQL API (`/api/graphql`) |
| ORM | **Prisma** | Database access, migrations, seeding |
| Database | **PostgreSQL** | Primary data store |
| Auth | **NextAuth.js + JWT** | Authentication & sessions |
| Payments | **Stripe** | Subscriptions, checkout, webhooks, invoices |
| Email | **Nodemailer** | Transactional email |
| Realtime | **WebSocket (ws)** | Live device readings push |
| ML | **ml-regression + simple-statistics** | Predictions & anomaly detection |
| State/Fetch | **React Query + SWR** | Client data fetching & caching |
| Validation | **Zod** | Input validation on all API routes |
| Testing | **Jest + React Testing Library** | Unit testing |
| Deployment | **Vercel** | Hosting and deployment |

## 3. Folder Structure

The project follows an App-Router–based folder structure to keep the code organized and scalable.

```
urjaflow/
├── docs/                  # Project documentation (PRD, ARCHITECTURE, TASKS...)
├── app/                   # Next.js App Router
│   ├── (auth)/            #   auth pages (login/signup) — shared layout
│   ├── admin/             #   Super admin panel
│   ├── analytics/         #   Analytics pages
│   ├── api/               #   API routes (REST + GraphQL)
│   ├── auth/              #   NextAuth sign-in pages
│   ├── billing/           #   Billing dashboard
│   ├── dashboard/         #   Main dashboard
│   ├── organizations/     #   Multi-org management
│   ├── payment/           #   Payment success/cancel pages
│   ├── plans/             #   Subscription plans
│   └── ...                #   support, settings, notifications, reports
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks (useRole, useWebSocket)
├── lib/                   # Core libraries
│   ├── auth.ts            #   NextAuth configuration
│   ├── prisma.ts          #   Prisma client singleton
│   ├── rbac-middleware.ts #   Role-based access helpers
│   ├── permissions.ts     #   Permission matrix
│   ├── stripe.ts          #   Stripe client & helpers
│   ├── logger.ts          #   Colored terminal logger
│   └── graphql/           #   GraphQL schema & resolvers
├── prisma/                # Prisma schema, migrations, seed
├── types/                 # TypeScript type definitions
├── tests/unit/            # Jest unit tests
└── public/                # Static assets
```

## 4. Database Schema Overview

Core models (see [prisma/schema.prisma](../prisma/schema.prisma) for the full schema):

| Model | Purpose |
|-------|---------|
| `Organization` | Multi-tenant org with branding, plan limits, settings |
| `User` | Users with roles (SUPER_ADMIN, ORG_ADMIN, MANAGER, VIEWER) |
| `Device` | IoT devices — solar panels, batteries, inverters, meters |
| `DeviceReading` | Time-series readings (generation, consumption, battery, voltage) |
| `Plan` / `Subscription` / `OrganizationSubscription` | Billing plans & subscriptions |
| `Invoice` | Invoices with Stripe integration |
| `PaymentMethod` | Saved cards via Stripe |
| `SupportTicket` / `FAQ` | Support system |
| `Notification` | In-app notifications |

**Key relations:**

```
Organization 1─N Users
Organization 1─N Devices
Device 1─N DeviceReadings
User 1─N Subscriptions / Invoices / Tickets
Plan 1─N Subscriptions
```

## 5. Data Flow

### Real-time energy monitoring flow

```
IoT Device Feed
     │
     ▼
WebSocket Server (lib/websocket.ts)  ──►  Live dashboard updates
     │
     ▼
API Route /api/devices
     │
     ▼
Prisma ──► DeviceReading table (time-series storage)
     │
     ▼
Analytics APIs (/api/analytics, /api/ml)  ──►  Trends, predictions, anomalies
```

### Payment flow

```
Plans Page ──► POST /api/subscribe ──► Stripe Checkout
                                            │
                              checkout.session.completed
                                            ▼
                        POST /api/webhooks/stripe ──► Subscription + Invoice
                                            ▼
                                   Billing Dashboard
```

## 6. Authentication & Authorization

- **NextAuth.js** with credentials provider; passwords hashed using bcrypt.
- JWT-based sessions; middleware protects private routes (`middleware.ts`).
- **4 roles**: `SUPER_ADMIN`, `ORG_ADMIN`, `MANAGER`, `VIEWER`.
- Permissions enforced in `lib/permissions.ts` + `lib/rbac-middleware.ts` on the API side, and `components/RoleGuard.tsx` on the UI side.
- Multi-tenancy: users belong to an organization; all data queries are scoped by `organizationId`.

## 7. Key Design Decisions

| # | Decision | Reason |
|---|----------|--------|
| 1 | Next.js full-stack (single codebase) | Simpler deployment, shared types between UI & API |
| 2 | PostgreSQL + Prisma | Reliable relational data for time-series + billing |
| 3 | Role-based access at API **and** UI layer | Defense in depth for multi-tenant security |
| 4 | Stripe webhooks as source of truth for billing | Payment state stays consistent even if user closes browser |
| 5 | WebSocket push for readings | True real-time dashboards without polling |
| 6 | Zod validation on every route | Consistent input safety across REST and GraphQL |
| 7 | White-label branding via org settings | Each org can theme the platform (`lib/branding.ts`) |
