# <div align="center">🧠 Project Memory</div>

<div align="center">

## UrjaFlow – Context, Progress & Important Notes

</div>

This document keeps track of the current state of the project, important decisions and things to remember. It helps maintain continuity across development sessions and for new contributors.

<br />

| | | |
|:---:|:---:|:---:|
| 📅 **Last Updated** | 👤 **Current Phase** | 🏁 **Overall Progress** |
| Oct 2, 2026 | **Phase 7** | ~85% |
| | Quality & Deployment | |

---

## 🎯 Current Status

- ✅ Project setup completed (Next.js, TypeScript, Tailwind, Prisma)
- ✅ Git repository initialized and pushed to GitHub
- ✅ Database schema created (PostgreSQL + Prisma, seeded)
- ✅ Authentication (signup, login, protected routes, 4 roles) completed
- ✅ Real-time dashboard & device monitoring completed
- ✅ Analytics, ML insights and reports/export completed
- ✅ Stripe billing (checkout, webhooks, invoices) completed
- 🔄 Working on Quality & Deployment (test coverage, CI/CD in progress)

## ✅ Completed Tasks

| # | Task | Completed On |
|---|------|--------------|
| 1.1 | Initialize Next.js project | Phase 1 |
| 1.2 | Configure Tailwind CSS | Phase 1 |
| 1.3 | Set up Git repository | Phase 1 |
| 1.5 | Configure Prisma + PostgreSQL | Phase 1 |
| 2.2 | Implement signup (API + page) | Phase 2 |
| 2.3 | Implement login (NextAuth credentials) | Phase 2 |
| 2.4 | Protect dashboard routes (middleware) | Phase 2 |
| 2.5 | Role-based access control (4 roles) | Phase 2 |
| 3.x | Dashboard, devices, real-time WebSocket feed | Phase 3 |
| 4.x | Analytics, ML predictions, reports & exports | Phase 4 |
| 5.x | Stripe checkout, webhooks, invoices, plans page | Phase 5 |
| 6.x | Support, notifications, multi-org, admin panel | Phase 6 |

## 🔄 In Progress

| # | Task | Notes |
|---|------|-------|
| 7.1 | Unit tests (Jest + RTL) | Expand coverage in tests/unit |
| 7.3 | CI/CD pipeline hardening | GitHub Actions workflow |
| 7.6 | Production deployment (Vercel) | vercel.json configured |

## ⏭️ Next Up

| # | Task | Priority |
|---|------|----------|
| 7.2 | E2E tests (Playwright) | 🟡 Medium |
| 7.4 | Performance optimization pass (Lighthouse 95+) | 🟡 Medium |
| 7.5 | Security audit + dependency updates | 🔴 High |

---

## 🏗️ Important Architecture Notes

- **Stack**: Next.js 16 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · NextAuth · Stripe
- **Multi-tenancy**: every org-scoped query **must** filter by `organizationId` (see [ARCHITECTURE.md](ARCHITECTURE.md) §6)
- **Roles**: `SUPER_ADMIN`, `ORG_ADMIN`, `MANAGER`, `VIEWER` — enforced via `lib/rbac-middleware.ts` + `components/RoleGuard.tsx`
- **Billing truth**: Stripe webhooks are the source of truth for subscription state
- **Realtime**: device readings flow through `lib/websocket.ts` → `useWebSocket` hook
- **API surface**: REST routes under `app/api/*` + GraphQL at `/api/graphql`

## ⚠️ Things to Remember

- 🔑 Never commit secrets — `.env.local` / `.env.production` are gitignored; use `.env.example` as the reference.
- 🌐 Auth pages must keep a **white background** — dark-mode CSS was intentionally removed (see [docs/CHANGES.md](CHANGES.md)).
- 💳 Stripe local testing: `npm run stripe:webhook` forwards events to `/api/webhooks/stripe`.
- 🗄️ SQLite `prisma/dev.db` exists from early development, but the active datasource is **PostgreSQL** — do not switch back.
- 📝 After every completed task, update [TASKS.md](TASKS.md) and this file's counters.
