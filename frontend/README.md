# SIH26139 Screening, frontend

Frontend for SIH26139: a hybrid quantum-ML platform for diabetic retinopathy and cataract
screening from retinal fundus photos, built for Smart India Hackathon 2026.

This repo is being built by 7 parallel agents against a shared contract. This branch,
`agent-1-foundation`, is the foundation: project scaffold, design system, routing contract,
API client, auth, and the shared layout shell that every other feature is rendered inside.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config.ts` or PostCSS config needed)
- shadcn/ui (new-york style, Radix UI primitives), lucide-react icons
- react-router-dom v6, @tanstack/react-query, @tanstack/react-table
- react-hook-form + zod for forms, axios for HTTP, recharts for charts, date-fns, sonner for toasts

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend isn't on localhost:8000
npm run dev            # serves on http://localhost:3000, matching the backend's default CORS origin
```

The backend (`SIH_backend`) needs to be running locally for login, registration, and any
data-fetching page to work. See that repo's README for setup.

`npm run build` runs a full TypeScript check before bundling; `npm run lint` runs ESLint.

## Shared contracts

Two files are identical across all 7 branches and should never be changed without updating
every branch:

- `src/types/api.ts`: every backend request/response shape.
- `src/lib/routes.ts`: the `ROUTES` path constants and the `NavItem` type.

Every feature folder under `src/pages/*` exports exactly two names from its own `routes.tsx`:
`<feature>Routes: RouteObject[]` and `<feature>NavItems: NavItem[]`. `src/App.tsx` imports all
seven pairs and renders them inside `AppShell`; that wiring does not change as real pages replace
the placeholder ones.

## What's real here vs. a placeholder

`src/pages/auth/*` (login, register) is real. `src/pages/{marketing,screening,scans,patients,
review,admin}/routes.tsx` are placeholder stubs, each clearly marked `STUB - DELETE AT STITCH
TIME`, that exist only so the app boots and routes before the other agents land their real pages.
