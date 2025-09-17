## PayFlow — Payment Approval & Scheduling System

PayFlow is a web and mobile-ready payment approval system. It lets users raise payment requests, route them through approvals, verify in accounts, export data, and automate one-time or recurring/scheduled payments. The app is built with React + TypeScript (Vite), uses Supabase for auth and data, Tailwind for UI, Zustand for state, and Capacitor for packaging as an Android app. The web app is deployable to Vercel.

### Key features
- **Authentication and roles**: `user`, `accounts`, `admin` (Supabase Auth + RLS-backed tables)
- **Payment lifecycle**: create, view, approve/reject, query, verify (accounts), process, export
- **Scheduled and recurring payments**: schedule once or set recurring patterns; Supabase Edge Functions process due payments
- **CMS**: manage categories, subcategories, vendors, companies, branches, users
- **Dashboards**: totals, pending, approved, processed, queries, verifications
- **Excel export**: export lists for reporting
- **Mobile packaging**: Capacitor Android build

---

## Tech stack
- **Frontend**: React 18, TypeScript, Vite, React Router, Tailwind CSS, React Hot Toast
- **State**: Zustand
- **Backend**: Supabase (Auth, Postgres, RLS, Storage), Edge Functions (Deno)
- **Packaging**: Capacitor (Android)
- **Deployment**: Vercel (SPA rewrite)

---

## Getting started

### Prerequisites
- Node.js 18+ and npm
- Supabase project (URL + Anon key)
- Optional: Android Studio (for Android build)

### 1) Install
```bash
npm install
```

### 2) Environment variables
Create `.env` in repo root:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Required by `src/lib/supabase.ts`.

### 3) Database and policies
Run SQL in `supabase/migrations/` (chronological). Apply helper SQL if needed: `schema.sql`, `storage_policies.sql`, `scheduled_payments.sql`, `dbchanges.sql`.

Core tables/functions (non-exhaustive):
- `users`, `payments`, `vendors`, `categories`, `subcategories`, company/branch metadata
- `scheduled_payments` and RPCs:
  - `process_scheduled_payment_transaction`
  - `process_recurring_payment_transaction`

### 4) Dev server
```bash
npm run dev
# open http://localhost:5173
```

Seed a `users` row linked to the Supabase auth user id and set role: `user` | `accounts` | `admin`.

---

## Scripts (package.json)
- `dev` — start Vite dev server
- `build` — production build
- `preview` — preview build
- `lint` — ESLint
- `android` — build web, Capacitor sync, open Android Studio

---

## Project structure
```text
src/
  App.tsx                 # App shell + router
  main.tsx                # React entry
  routes/                 # Routes + ProtectedRoute (RBAC)
  pages/                  # Dashboard, Payments, CMS, etc.
  components/             # UI + feature components
  store/                  # Zustand stores (auth, payments, cms, scheduled)
  lib/                    # supabase client, network helpers, utils
  contexts/               # React contexts
  types/                  # Shared types
supabase/
  migrations/             # SQL migrations
  edge-functions/         # Deno functions (scheduled/recurring)
capacitor.config.ts       # Capacitor config
vercel.json               # SPA rewrites
```

Notable files:
- `src/lib/supabase.ts` — Supabase client from `VITE_SUPABASE_*`
- `src/routes/ProtectedRoute.tsx` — route guard + role checks
- `supabase/edge-functions/process-scheduled-payments.ts` — one-time schedules
- `supabase/edge-functions/process-recurring-payments.ts` — recurring schedules

---

## Auth and roles
- Supabase Auth with persisted session
- On login, corresponding `users` row loaded into Zustand (`src/store/authStore.ts`)
- `ProtectedRoute` enforces `allowedRoles`

Roles:
- `user`: raise/view requests, respond to queries
- `accounts`: verify/process/export, accounts dashboards
- `admin`: full access incl. CMS and approvals

---

## Payments, queries, verifications
- Create requests with vendors, categories, bills, and attachments
- Approve/reject, raise queries, accounts verification
- Dashboards summarize totals, pending, approved, processed, queries, verifications
- Export lists to Excel from the Export page

---

## Scheduled and recurring payments
- One-time: processed when `scheduled_for` ≤ now and `schedule_status = 'pending'`
- Recurring: processed when `next_execution` is due and within end limits

Edge Functions:
- `process-scheduled-payments` → `process_scheduled_payment_transaction`
- `process-recurring-payments` → `process_recurring_payment_transaction`

Deploy with Supabase CLI:
```bash
supabase functions deploy process-scheduled-payments
supabase functions deploy process-recurring-payments
```

Schedule invocations (Supabase Scheduled Triggers or external cron). Protect with tokens as needed (recurring function checks Bearer token against `SUPABASE_SERVICE_ROLE_KEY`).

---

## Android (Capacitor)
```bash
npm run android
# builds web → cap sync → opens Android Studio
```
Configure `capacitor.config.ts` (keystore, server.url for dev as needed). Do not commit secrets.

---

## Web deployment
Vercel supported. SPA rewrites via `vercel.json`.

Checklist:
- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in hosting environment
- Run `npm run build` during deploy

---

## Full-Stack Developer Highlights
- **End-to-end architecture**: React + TypeScript frontend, Supabase (Postgres, Auth, Storage, RLS) backend, and Deno Edge Functions for server-side workflows.
- **Robust authentication & RBAC**: Supabase Auth with persisted sessions, `users` profile linking, and route-level role enforcement via `ProtectedRoute`.
- **Transactional server logic**: Edge Functions invoke RPCs (`process_scheduled_payment_transaction`, `process_recurring_payment_transaction`) to ensure atomic multi-table updates.
- **Typed data models**: Centralized types in `src/types/` and typed Supabase client (`src/types/supabase.ts`) for safer queries and UI state.
- **State management at scale**: Zustand stores (`authStore`, `paymentStore`, `cmsStore`, `scheduledPaymentsStore`) with clear separation of concerns.
- **Operational tooling**: ESLint, TypeScript strictness, Vite fast builds, and `vercel.json` SPA rewrites for clean deployments.
- **Production-grade UX**: Tailwind-based component library (`components/ui/*`), route transitions, toast-driven feedback, and network guard helpers.
- **Data export**: Integrated `xlsx` export flows for reporting from complex filtered datasets.
- **Mobile packaging**: Capacitor Android build with configurable WebView server options and signing hooks in `capacitor.config.ts`.
- **Security-first patterns**: RLS/table policies (see SQL), protected Edge Function with Bearer token check against `SUPABASE_SERVICE_ROLE_KEY`.
- **Scheduling & automation**: Cron-friendly Edge Functions to process one-time and recurring payments on time windows.
- **Maintainable structure**: Clear separation of `pages`, `components`, `store`, `lib`, `routes`, and SQL migrations under `supabase/migrations/`.

---

## Troubleshooting
- Missing env: ensure `.env` and deploy env have both Vite vars
- Blank after login: ensure `users` table row exists and has a valid `role`
- Route redirects: check `allowedRoles` vs current user role
- Edge functions idle: verify deploy, logs, and cron triggers + headers
- Android networking: consider `server.url` and cleartext/https settings

---

## Contributing
1. Create a feature branch
2. Keep code typed and readable; match existing style
3. `npm run lint` and `npm run build` before PRs

---

## License
Proprietary — internal use only unless otherwise specified by the repository owner


