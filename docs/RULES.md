# <div align="center">📘 Development Rules</div>

<div align="center">

## UrjaFlow – Project Guidelines for AI & Human Collaborators

</div>

This document defines the development rules, coding standards, and best practices for the UrjaFlow application. These rules ensure consistency, maintainability, security and quality across the codebase. Both AI assistants and human contributors must follow these guidelines.

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before building any feature.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style.

| Area | Rule |
|------|------|
| 🔤 **Language** | Use TypeScript. Avoid `any` unless absolutely necessary. |
| 🏗️ **Framework** | Follow Next.js best practices (App Router, Server Components first). |
| 🎨 **Styling** | Use Tailwind CSS and follow the design system in [DESIGN.md](DESIGN.md). |
| 🧹 **Linting** | Follow the ESLint config (`eslint.config.mjs`). Code must pass `npm run lint`. |
| 💅 **Formatting** | Use Prettier (`.prettierrc`). Run `npm run format` before committing. |
| 📦 **Dependencies** | Use stable, well-maintained packages. Check the bundle impact before adding any. |
| 📄 **File Naming** | Clear and consistent — `kebab-case` for utility files, `PascalCase` for components. |
| 🔐 **Secrets** | Never commit secrets. Use `.env` files (see `.env.example`). |

## 3️⃣ Project Structure

Follow the defined folder structure in [ARCHITECTURE.md](ARCHITECTURE.md).

- ✅ Place reusable UI components in `/components`.
- ✅ Pages, layouts and route handlers live under `/app`.
- ✅ Business logic and integrations belong in `/lib` (auth, stripe, prisma, rbac, logger).
- ✅ Database schema, migrations and seeds live in `/prisma`.
- ✅ Types and interfaces should be placed in `/types`.
- ✅ Custom React hooks go in `/hooks`.
- ✅ Tests belong in `/tests`, mirroring the module they cover.
- ✅ Do not create new folders without a clear, documented reason.

## 4️⃣ Git & Workflow Rules

- ✅ Branch naming: `feature/...`, `fix/...`, `chore/...`
- ✅ Small, atomic commits with clear, imperative messages.
- ✅ Never commit directly to `main` — use pull requests.
- ✅ A PR must pass lint + tests before it can be merged.

## 5️⃣ Security Rules

- ✅ Validate every API input with **Zod** before touching the database.
- ✅ Enforce role checks with `lib/rbac-middleware.ts` and the `RoleGuard` component.
- ✅ Hash passwords with bcrypt; never store or log plain-text passwords.
- ✅ Always verify Stripe webhook signatures before processing events.
- ✅ Multi-tenant data must always be scoped by `organizationId`.

## 6️⃣ Testing & Documentation Rules

- ✅ Write Jest unit tests for new business logic in `/tests/unit`.
- ✅ Test all four roles (SUPER_ADMIN, ORG_ADMIN, MANAGER, VIEWER) for permission features.
- ✅ Keep test coverage above 80%.
- ✅ After completing a task, update the status in [TASKS.md](TASKS.md) and [MEMORY.md](MEMORY.md).
