# <div align="center">🎨 Design System</div>

<div align="center">

## UrjaFlow – Clean. Real-Time. Reliable.

</div>

This document defines the visual design system, UI components, and user experience guidelines for UrjaFlow. The goal is to create a modern, minimal and professional interface with a consistent look across the entire platform.

---

## 1. Design Principles

| | | |
|:---:|:---:|:---:|
| 👥 **User-Centered** | 🪶 **Minimal & Clean** | 🧩 **Consistent** |
| *Simple and intuitive for admins, managers and viewers.* | *Reduce clutter and focus on the data that matters.* | *Follow a unified design system across all pages.* |

| | |
|:---:|:---:|
| ⚡ **Real-Time First** | 🔒 **Trustworthy** |
| *Live data should feel live — instant updates, no refreshes.* | *Clear states, clear errors, clear permissions.* |

## 2. Color Palette

Primary colors used across the application.

| Swatch | Name | Hex | Usage |
|:---:|------|-----|-------|
| 🟦 | **Primary** | `#3B82F6` | Main brand color. Buttons, links, active states |
| ⬛ | **Secondary** | `#64748B` | Secondary actions, muted text, borders |
| 🟩 | **Success** | `#10B981` | Success messages, completed payments, live status |
| 🟧 | **Warning** | `#F59E0B` | Warnings, caution states, maintenance mode |
| 🟥 | **Error** | `#EF4444` | Error messages, validation, alerts |
| ⬜ | **Background** | `#FFFFFF` | Page background (clean white base) |
| ⬛ | **Foreground** | `#171717` | Primary text color |

> 💡 These defaults come from the platform branding (`lib/branding.ts`) — organizations can override primary/secondary colors for white-labeling.

## 3. Typography

We use a clean system font stack for fast rendering and native feel.

### **Aa** — System Stack

`Arial, Helvetica, sans-serif` — highly readable across all devices and platforms.

| Element | Size | Weight | Tailwind |
|---------|------|--------|----------|
| H1 | 30px | Bold | `text-3xl font-bold` |
| H2 | 24px | Semi-bold | `text-2xl font-semibold` |
| H3 | 20px | Semi-bold | `text-xl font-semibold` |
| Body | 16px | Regular | `text-base` |
| Caption / Meta | 14px | Regular | `text-sm` |
| Small / Badge | 12px | Medium | `text-xs font-medium` |

## 4. UI Components

Standard components to be used throughout the application (see `/components`).

### 🔘 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | `bg-blue-500 text-white` | Main actions — Subscribe, Save, Generate Report |
| **Secondary** | `bg-white border border-slate-300` | Cancel, filters, less prominent actions |
| **Destructive** | `bg-red-500 text-white` | Delete device, cancel subscription |

### 🧱 Core Components

| Component | File | Purpose |
|-----------|------|---------|
| **StatCard** | `components/StatCard.tsx` | KPI tiles on the dashboard |
| **ChartBars** | `components/ChartBars.tsx` | Recharts-powered energy charts |
| **PlanCard** | `components/PlanCard.tsx` | Pricing plan display |
| **Modal** | `components/Modal.tsx` | Dialogs and confirmations |
| **NotificationDropdown** | `components/NotificationDropdown.tsx` | In-app notification list |
| **RoleGuard** | `components/RoleGuard.tsx` | Permission-based UI gating |
| **StripeCheckout** | `components/StripeCheckout.tsx` | Payment flow trigger |

### 🏷️ Status Badges

| Badge | Color | Meaning |
|-------|-------|---------|
| 🟢 `Active` | Green `#10B981` | Device/subscription active |
| 🟡 `Maintenance` | Amber `#F59E0B` | Device under maintenance |
| 🔴 `Error / Past Due` | Red `#EF4444` | Device error or failed payment |
| ⚫ `Inactive` | Slate `#64748B` | Disabled or canceled |

## 5. Icons & Imagery

- Use **lucide-react** icons only — consistent stroke style, 20–24px.
- Charts use **Recharts** with the palette from section 2.
- No decorative stock photos; data visualization is the visual identity.

## 6. Layout & Spacing

| Rule | Value |
|------|-------|
| Base spacing unit | 4px (Tailwind default scale) |
| Corner radius | `rounded-lg` (8px) for cards, inputs, buttons |
| App shell | Responsive sidebar navigation + top bar (`components/Layout.tsx`) |
| Content width | Fluid with comfortable max-width on forms |
| Cards | White background, subtle border, soft shadow |
| Dark mode | Disabled — the product ships a clean light theme |
